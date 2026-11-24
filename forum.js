// 토론방 공통 기능
(function () {
  // 익명 이름과 프로필 사진 (img/animals/ 폴더의 사진과 순서가 같아야 합니다)
  const ANIMALS = [
    ["펭귄", "penguin"], ["수달", "otter"], ["여우", "fox"], ["판다", "panda"], ["부엉이", "owl"], ["다람쥐", "squirrel"],
    ["코알라", "koala"], ["고양이", "cat"], ["강아지", "puppy"], ["토끼", "rabbit"], ["아기사슴", "deer"], ["햄스터", "hamster"],
    ["미어캣", "meerkat"], ["너구리", "raccoon"], ["알파카", "alpaca"], ["북극곰", "polarbear"], ["아기오리", "duck"], ["고슴도치", "hedgehog"],
    ["기린", "giraffe"], ["거북이", "turtle"], ["돌고래", "dolphin"], ["레서판다", "redpanda"], ["물범", "seal"], ["친칠라", "chinchilla"]
  ];
  const COLORS = ["#4f7fd9", "#2f9a8a", "#8a6bd1", "#d0607e", "#d9803f", "#4a9e5c", "#b38a1f", "#5b6fd6", "#2b8fa3", "#9b5fc0"];
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
    "😅", "😂", "🤔", "😮", "😢", "🌱", "🌈", "☕", "🍀", "🎉"];

  // 「혁신과 소통을 위한 익명 토론회」 계획서의 주요 토론 테마
  const CATEGORIES = [
    { name: "조직문화", icon: "🤝", color: "#5a8dee",
      examples: ["불필요한 회의 줄이기", "유연근무 확대", "세대 간 이해 증진"],
      words: ["회의", "소통", "문화", "세대", "수평", "유연근무", "유연", "재택", "분위기", "상사", "관리자", "mz", "존중", "칭찬", "갈등", "회식", "위계", "꼰대", "팀워크", "협업", "칼퇴", "눈치"] },
    { name: "성과주의", icon: "🏅", color: "#4fae8f",
      examples: ["공정한 평가기준", "성과급 배분 방식", "KPI 개선"],
      words: ["평가", "성과", "보상", "kpi", "공정", "승진", "인센티브", "지표", "목표", "연봉", "포상", "고과", "역량"] },
    { name: "업무방식", icon: "⚙️", color: "#f2914f",
      examples: ["업무 프로세스 간소화", "결재 단계 축소", "일하는 방식 혁신"],
      words: ["업무", "프로세스", "결재", "보고", "절차", "간소화", "서류", "문서", "자동화", "전산", "효율", "중복", "야근", "매뉴얼", "인수인계", "그룹웨어", "협조"] },
    { name: "복지·근무환경", icon: "🌿", color: "#b58ce0",
      examples: ["복지제도 개선", "사무공간 재설계", "건강관리"],
      words: ["복지", "휴가", "연차", "사무실", "사무공간", "공간", "건강", "휴게", "식당", "주차", "출퇴근", "근무환경", "장비", "의자", "자녀", "육아", "동호회", "교육"] },
    { name: "혁신·미래", icon: "🚀", color: "#e0607a",
      examples: ["신사업 아이디어", "AI 활용", "고객서비스 개선"],
      words: ["신사업", "아이디어", "ai", "인공지능", "디지털", "혁신", "고객", "서비스", "시민", "민원", "미래", "데이터", "플랫폼", "스마트", "탄소", "친환경", "챗gpt", "gpt"] },
    { name: "주요 이슈", icon: "📢", color: "#3fa5bf",
      examples: ["조직 주요 현안 발생 시 긴급 토론"],
      words: ["현안", "이슈", "긴급", "안전", "사고", "예산", "정책", "규정", "감사", "법령", "대응"] }
  ];
  const ETC = { name: "기타", icon: "🗂️", color: "#b5ada2", examples: [], words: [] };
  const STAGES = [
    { k: "상정", cls: "s1", desc: "혁신과제로 상정" },
    { k: "검토", cls: "s2", desc: "관련 부서 실행가능성 검토" },
    { k: "채택", cls: "s3", desc: "실행 과제로 채택" },
    { k: "실행", cls: "s4", desc: "실행 중" },
    { k: "완료", cls: "s5", desc: "실행 완료·공유" },
    { k: "보류", cls: "s0", desc: "보류" }
  ];

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
  function aliasColor(n) { return COLORS[((n || 1) - 1) % COLORS.length]; }
  function avatarHtml(n, cls) {
    const name = aliasName(n);
    if (!n) return `<span class="${cls || "ava"} ava-empty" aria-hidden="true">🔒</span>`;
    return `<img class="${cls || "ava"}" src="${aliasImg(n)}" alt="${esc(name)}" title="${esc(name)}" loading="lazy">`;
  }
  function category(name) {
    return CATEGORIES.find((c) => c.name === name) || ETC;
  }
  // 1단계 자동 분류: 테마별 대표 단어가 가장 많이 들어 있는 분류로 태깅합니다. (키워드 규칙 기반)
  function tagCategory(text) {
    const s = String(text || "").toLowerCase();
    let best = ETC.name;
    let bestN = 0;
    CATEGORIES.forEach((c) => {
      let n = 0;
      c.words.forEach((w) => { if (s.includes(w)) n++; });
      if (n > bestN) { best = c.name; bestN = n; }
    });
    return best;
  }
  function stage(k) { return STAGES.find((s) => s.k === k) || STAGES[0]; }
  function stageBadge(k) { const s = stage(k); return `<span class="stage ${s.cls}">${esc(s.k)}</span>`; }
  function isLive(t) {
    return !!t && t.status === "open" && (!t.ends_at || new Date(t.ends_at) > new Date());
  }
  function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  function fmtDateTime(ts) {
    return ts ? new Date(ts).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
  }
  function remain(ts) {
    let s = Math.max(0, Math.floor((new Date(ts).getTime() - Date.now()) / 1000));
    const d = Math.floor(s / 86400);
    s %= 86400;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const p = (n) => String(n).padStart(2, "0");
    if (d > 0) return d + "일 " + h + "시간";
    return (h > 0 ? h + ":" + p(m) : p(m)) + ":" + p(sec);
  }
  function fmtDuration(ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    if (m < 60) return m + "분";
    const h = Math.floor(m / 60);
    if (h < 48) return h + "시간" + (m % 60 ? " " + (m % 60) + "분" : "");
    return Math.floor(h / 24) + "일" + (h % 24 ? " " + (h % 24) + "시간" : "");
  }
  function maskEmail(email) {
    const parts = String(email || "").split("@");
    if (parts.length < 2) return "***";
    const id = parts[0];
    return id.slice(0, 2) + "*".repeat(Math.max(3, id.length - 2)) + "@" + parts[1];
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
    if (/join_topic|action_items|category|profanity/i.test(m) && /does not exist|Could not find|schema cache/i.test(m)) {
      return "새 기능용 데이터베이스 설정이 아직 적용되지 않았습니다. upgrade-v2.sql을 Supabase SQL Editor에서 실행해 주세요.";
    }
    if (/does not exist|Could not find the (table|function)|schema cache|PGRST20[25]/i.test(m)) {
      return "토론방 데이터베이스가 아직 설정되지 않았습니다. discussion.sql과 upgrade-v2.sql을 차례로 실행해 주세요.";
    }
    if (/permission denied|row-level security/i.test(m)) return "권한이 없습니다. 관리자 계정인지 확인하거나, 로그아웃한 뒤 다시 로그인해 주세요.";
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
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
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
  function loadKwSettings() {
    try { return JSON.parse(localStorage.getItem("kwSettings") || "{}"); } catch (e) { return {}; }
  }

  window.Forum = {
    REACTIONS, INSERT_EMOJIS, CATEGORIES, ETC, STAGES,
    esc, aliasName, aliasImg, avatarHtml, aliasColor, category, tagCategory, stage, stageBadge,
    isLive, fmtTime, fmtDateTime, remain, fmtDuration, maskEmail,
    requireSession, bindLogout, dbError, toast, fetchAll, loadKwSettings
  };
})();
