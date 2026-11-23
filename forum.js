// 토론방 공통 기능
(function () {
  // 익명 이름과 프로필 사진 (img/animals/ 폴더의 사진과 순서가 같아야 합니다)
  const ANIMALS = [
    ["펭귄", "penguin"], ["수달", "otter"], ["여우", "fox"], ["판다", "panda"], ["부엉이", "owl"], ["다람쥐", "squirrel"],
    ["코알라", "koala"], ["고양이", "cat"], ["강아지", "puppy"], ["토끼", "rabbit"], ["아기사슴", "deer"], ["햄스터", "hamster"],
    ["미어캣", "meerkat"], ["너구리", "raccoon"], ["알파카", "alpaca"], ["북극곰", "polarbear"], ["아기오리", "duck"], ["고슴도치", "hedgehog"],
    ["기린", "giraffe"], ["거북이", "turtle"], ["돌고래", "dolphin"], ["레서판다", "redpanda"], ["물범", "seal"], ["친칠라", "chinchilla"]
  ];
  const COLORS = ["#2563eb", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#ca8a04", "#4f46e5", "#0d9488", "#9333ea"];
  const REACTIONS = [
    { e: "👍", label: "공감", tone: "pos" },
    { e: "💡", label: "좋은 아이디어", tone: "pos" },
    { e: "❤️", label: "응원", tone: "pos" },
    { e: "👏", label: "박수", tone: "pos" },
    { e: "😮", label: "놀라움", tone: "neu" },
    { e: "😂", label: "재미있음", tone: "neu" },
    { e: "🤔", label: "생각해 볼 문제", tone: "neg" },
    { e: "😢", label: "아쉬움", tone: "neg" }
  ];
  const INSERT_EMOJIS = ["😀", "😄", "😊", "🙂", "😉", "😍", "🤩", "😎", "🤗", "🙏", "👍", "👎", "👏", "🙌",
    "💪", "✌️", "🔥", "✨", "💡", "🚀", "🎯", "📈", "📉", "✅", "❌", "❓", "❗", "💬", "🤝", "❤️",
    "😅", "😂", "🤔", "😮", "😢", "😡"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }
  function aliasName(n) {
    if (!n) return "익명";
    const i = (n - 1) % ANIMALS.length;
    const round = Math.floor((n - 1) / ANIMALS.length);
    return "익명 " + ANIMALS[i][0] + (round > 0 ? String(round + 1) : "");
  }
  function aliasImg(n) {
    if (!n) return "";
    return "img/animals/" + ANIMALS[(n - 1) % ANIMALS.length][1] + ".jpg";
  }
  function avatarHtml(n, cls) {
    const name = aliasName(n);
    const color = aliasColor(n);
    if (!n) return `<span class="${cls || "ava"}" style="background:#9ca3af"></span>`;
    return `<img class="${cls || "ava"}" src="${aliasImg(n)}" alt="${esc(name)}" title="${esc(name)}" loading="lazy" style="border-color:${color}">`;
  }
  function aliasColor(n) { return COLORS[((n || 1) - 1) % COLORS.length]; }
  function isLive(t) {
    return !!t && t.status === "open" && (!t.ends_at || new Date(t.ends_at) > new Date());
  }
  function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  function fmtDateTime(ts) {
    return ts ? new Date(ts).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
  }
  function setRealtimeToken(token) {
    try {
      Promise.resolve(sb.realtime.setAuth(token)).catch(() => {});
    } catch (e) { /* 이전 버전 호환 */ }
  }
  async function requireSession() {
    if (window.AUTH_NOT_CONFIGURED) { location.replace(pageUrl("index.html")); return null; }
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { location.replace(pageUrl("index.html")); return null; }
    setRealtimeToken(session.access_token);
    sb.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_OUT") location.replace(pageUrl("index.html"));
      else if (s && s.access_token) setRealtimeToken(s.access_token);
    });
    return session;
  }
  function bindLogout(id) {
    const el = document.getElementById(id);
    if (el) {
      el.onclick = async (e) => {
        e.preventDefault();
        await sb.auth.signOut();
        location.replace(pageUrl("index.html"));
      };
    }
  }
  function dbError(err) {
    const m = (err && err.message) || String(err);
    if (/does not exist|Could not find the (table|function)|schema cache|PGRST20[25]/i.test(m)) {
      return "토론방 데이터베이스가 아직 설정되지 않았습니다. discussion.sql을 Supabase SQL Editor에서 실행해 주세요.";
    }
    if (/permission denied/i.test(m)) return "권한이 없습니다. 로그아웃한 뒤 다시 로그인해 주세요.";
    if (/JWT|token/i.test(m)) return "로그인이 만료되었습니다. 새로고침해 주세요.";
    return m;
  }
  let toastTimer = null;
  function toast(text) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
  }
  // Supabase는 한 번에 최대 1000행을 돌려주므로 나눠서 모두 가져옵니다.
  async function fetchAll(build) {
    const size = 1000;
    let from = 0;
    const all = [];
    for (;;) {
      const { data, error } = await build().range(from, from + size - 1);
      if (error) throw error;
      all.push(...data);
      if (data.length < size) break;
      from += size;
    }
    return all;
  }

  window.Forum = {
    REACTIONS, INSERT_EMOJIS, esc, aliasName, aliasImg, avatarHtml, aliasColor, isLive, fmtTime, fmtDateTime,
    requireSession, bindLogout, dbError, toast, fetchAll
  };
})();
