/* 토론회 입장 시간 제한 (gate.js)
 * 기본 오픈 시각: 2026년 12월 1일(화) 오후 2시 (한국 시간)
 * - 실제 기준은 Supabase의 forum_settings 표(open_at)입니다. gate-1201.sql을 실행하면 서버에서도 막습니다.
 * - SQL을 아직 실행하지 않았을 때는 아래 DEFAULT_OPEN_AT 값으로 화면에서만 막습니다.
 * - 관리자 계정은 미리 들어가서 토론을 준비할 수 있습니다.
 */
(function () {
  const DEFAULT_OPEN_AT = "2026-12-01T14:00:00+09:00";
  const WD = "일월화수목금토";

  function kstLabel(d) {
    const k = new Date(d.getTime() + 9 * 3600 * 1000);
    const M = k.getUTCMonth() + 1, D = k.getUTCDate(), w = WD[k.getUTCDay()];
    const h = k.getUTCHours(), m = k.getUTCMinutes();
    const ampm = h < 12 ? "오전" : "오후";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return M + "월 " + D + "일(" + w + ") " + ampm + " " + hh + "시" + (m ? " " + m + "분" : "");
  }

  function parts(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  }
  const pad = (n) => String(n).padStart(2, "0");

  function shortRemain(ms) {
    const p = parts(ms);
    if (p.d > 0) return p.d + "일 " + p.h + "시간 남음";
    if (p.h > 0) return p.h + "시간 " + p.m + "분 남음";
    return pad(p.m) + ":" + pad(p.s) + " 남음";
  }

  async function status() {
    let openAt = new Date(window.FORUM_OPEN_AT || DEFAULT_OPEN_AT);
    let offset = 0, isAdmin = false, server = false;
    try {
      const r = await sb.rpc("forum_gate");
      if (!r.error && r.data) {
        const g = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
        if (g.open_at) openAt = new Date(g.open_at);
        if (g.now) offset = new Date(g.now).getTime() - Date.now();
        isAdmin = g.is_admin === true;
        server = true;
      }
    } catch (e) { /* SQL 미적용: 화면 기준으로만 제한 */ }
    if (!server) {
      try { const a = await sb.rpc("is_admin"); isAdmin = a.data === true; } catch (e) {}
    }
    const now = () => Date.now() + offset;
    return {
      openAt: openAt, isAdmin: isAdmin, server: server, now: now,
      label: kstLabel(openAt),
      left: () => openAt.getTime() - now(),
      isOpen: () => now() >= openAt.getTime()
    };
  }

  function block(st) {
    document.documentElement.classList.add("gate-locked");
    const el = document.createElement("div");
    el.className = "gate";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "gateTitle");
    el.innerHTML =
      '<div class="gate-card">' +
        '<div class="brand-host" data-brand="dashboard.html"></div>' +
        '<span class="gate-eyebrow">🔒 입장 준비 중</span>' +
        '<h1 id="gateTitle">토론회는 <b>' + st.label + '</b>에 열려요</h1>' +
        '<p class="gate-lead">조금만 기다려 주세요. 시간이 되면 이 화면이 자동으로 토론방으로 바뀝니다.</p>' +
        '<div class="gate-clock" aria-live="off">' +
          '<div><b data-k="d">0</b><span>일</span></div>' +
          '<div><b data-k="h">00</b><span>시간</span></div>' +
          '<div><b data-k="m">00</b><span>분</span></div>' +
          '<div><b data-k="s">00</b><span>초</span></div>' +
        '</div>' +
        '<ul class="gate-notes">' +
          '<li>🎲 입장하면 <b>무작위 동물 닉네임</b>이 정해져요. 이름·이메일·부서는 다른 참여자에게 보이지 않습니다.</li>' +
          '<li>🚫 욕설·비속어가 들어간 의견은 자동으로 등록되지 않아요.</li>' +
        '</ul>' +
        '<a class="btn btn-ghost" href="dashboard.html">← 홈으로 돌아가기</a>' +
      '</div>';
    document.body.appendChild(el);
    if (window.renderBrand) window.renderBrand();
    const tick = () => {
      const left = st.left();
      if (left <= 0) { location.reload(); return; }
      const p = parts(left);
      el.querySelector('[data-k="d"]').textContent = p.d;
      el.querySelector('[data-k="h"]').textContent = pad(p.h);
      el.querySelector('[data-k="m"]').textContent = pad(p.m);
      el.querySelector('[data-k="s"]').textContent = pad(p.s);
    };
    tick();
    setInterval(tick, 1000);
  }

  function adminNotice(st) {
    const el = document.createElement("div");
    el.className = "gate-admin";
    el.innerHTML = "<b>관리자 미리보기</b><span>일반 직원은 " + st.label + "부터 입장할 수 있어요 · <em></em></span>";
    document.body.appendChild(el);
    const em = el.querySelector("em");
    const tick = () => {
      if (st.isOpen()) { el.remove(); return; }
      em.textContent = shortRemain(st.left());
    };
    tick();
    setInterval(tick, 1000);
  }

  // 로비·토론방에서 호출: 열렸으면 통과, 관리자면 안내 띠만, 그 외에는 대기 화면
  async function guard() {
    const st = await status();
    if (st.isOpen()) return st;
    if (st.isAdmin) { adminNotice(st); return st; }
    block(st);
    return null;
  }

  // 홈 화면의 [혁신 토론방 입장] 버튼을 오픈 전에는 잠금 상태로 바꿉니다
  async function lockButton(btn, note) {
    if (!btn) return;
    const st = await status();
    if (st.isOpen()) return;
    const original = btn.innerHTML;
    if (note) { note.hidden = false; }
    const tick = () => {
      if (st.isOpen()) {
        btn.classList.remove("is-locked");
        btn.innerHTML = original;
        btn.removeAttribute("aria-disabled");
        if (note) note.hidden = true;
        clearInterval(timer);
        return;
      }
      const tag = st.isAdmin ? "관리자 미리 입장" : "🔒 " + st.label + " 오픈";
      btn.innerHTML = tag + ' <small class="gate-left">' + shortRemain(st.left()) + "</small>";
    };
    if (!st.isAdmin) {
      btn.classList.add("is-locked");
      btn.setAttribute("aria-disabled", "true");
      btn.addEventListener("click", (e) => {
        if (st.isOpen()) return;
        e.preventDefault();
        if (window.Forum && Forum.toast) Forum.toast("토론회는 " + st.label + "부터 입장할 수 있어요.");
      });
    }
    if (note) note.querySelector("[data-open-label]") && (note.querySelector("[data-open-label]").textContent = st.label);
    const timer = setInterval(tick, 1000);
    tick();
  }

  window.Gate = { status: status, guard: guard, lockButton: lockButton, label: kstLabel };
})();
