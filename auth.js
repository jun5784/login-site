// 공통 인증 클라이언트 + 의왕도시공사 로고 표시
(function () {
  const cfg = window.APP_CONFIG || {};
  const notConfigured = !cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes("YOUR-PROJECT-REF") ||
                        !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes("YOUR-");
  window.AUTH_NOT_CONFIGURED = notConfigured;
  if (!notConfigured && window.supabase) {
    window.sb = window.supabase.createClient(cfg.SUPABASE_URL.replace(/\/+$/, ""), cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  window.ORG_NAME = "의왕도시공사";
  window.SERVICE_NAME = "혁신과 소통을 위한 익명 토론회";

  // 현재 페이지와 같은 폴더의 파일 주소 (GitHub Pages 하위 경로 대응)
  window.pageUrl = function (file) { return new URL(file, window.location.href).href; };
  window.showMsg = function (el, text, type) {
    if (!el) return;
    el.textContent = text || "";
    el.className = "msg " + (type || "error");
    el.hidden = !text;
  };
  window.translateError = function (err) {
    const m = (err && err.message) || String(err);
    if (/Invalid login credentials/i.test(m)) return "이메일 또는 비밀번호가 올바르지 않습니다.";
    if (/Email not confirmed/i.test(m)) return "이메일 인증이 아직 완료되지 않았습니다. 메일함(스팸함 포함)을 확인해 주세요.";
    if (/User already registered|already been registered/i.test(m)) return "이미 가입된 이메일입니다. 로그인해 주세요.";
    if (/Password should be at least/i.test(m)) return "비밀번호가 너무 짧습니다. 8자 이상으로 입력해 주세요.";
    if (/New password should be different/i.test(m)) return "이전과 다른 비밀번호를 입력해 주세요.";
    if (/rate limit|too many requests|over_email_send_rate_limit/i.test(m)) {
      return "짧은 시간에 요청이 많아 잠시 제한되었습니다. 인증 메일 발송 한도에 걸렸을 수 있으니 잠시 후 다시 시도하거나 운영 담당자에게 알려 주세요.";
    }
    if (/Unable to validate email|invalid format|is invalid/i.test(m)) return "이메일 주소 형식을 확인해 주세요.";
    if (/Invalid path specified/i.test(m)) return "config.js의 SUPABASE_URL 끝에 경로가 붙어 있습니다. https://○○○.supabase.co 까지만 입력해 주세요.";
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "네트워크 연결을 확인해 주세요.";
    return m;
  };

  // 로고: img/logo.png 파일이 있으면 그 파일을, 없으면 글자 로고를 보여 줍니다.
  function renderBrand() {
    document.querySelectorAll("[data-brand]").forEach((host) => {
      if (host.dataset.done) return;
      host.dataset.done = "1";
      const a = document.createElement("a");
      a.className = "brand";
      a.href = host.getAttribute("data-brand") || "dashboard.html";
      a.setAttribute("aria-label", window.ORG_NAME + " " + window.SERVICE_NAME);
      const img = new Image();
      img.className = "brand-logo";
      img.alt = window.ORG_NAME;
      const fb = document.createElement("span");
      fb.className = "brand-fallback";
      fb.hidden = true;
      fb.innerHTML = '<span class="brand-mark" aria-hidden="true"></span><span class="brand-org">' + window.ORG_NAME + "</span>";
      img.onerror = function () { img.remove(); fb.hidden = false; };
      img.src = "img/logo.png";
      const svc = document.createElement("span");
      svc.className = "brand-svc";
      svc.textContent = window.SERVICE_NAME;
      a.appendChild(img);
      a.appendChild(fb);
      a.appendChild(svc);
      host.appendChild(a);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderBrand);
  else renderBrand();
  window.renderBrand = renderBrand;
})();
