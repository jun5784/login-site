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

  // 로고 찾기: 아래 이름 가운데 저장소에 있는 파일을 자동으로 찾아 씁니다.
  // config.js에 window.LOGO_FILE = "img/내로고.png"; 처럼 적으면 그 파일을 가장 먼저 씁니다.
  const LOGO_CANDIDATES = [
    "img/logo.png", "img/logo.PNG", "img/logo.jpg", "img/logo.jpeg", "img/logo.JPG",
    "img/logo.svg", "img/logo.webp",
    "logo.png", "logo.PNG", "logo.jpg", "logo.jpeg", "logo.JPG", "logo.svg", "logo.webp"
  ];
  let logoPromise = null;
  function findLogo() {
    if (logoPromise) return logoPromise;
    const list = (window.LOGO_FILE ? [window.LOGO_FILE] : []).concat(LOGO_CANDIDATES);
    logoPromise = new Promise((resolve) => {
      let i = 0;
      const next = () => {
        if (i >= list.length) { resolve(null); return; }
        const src = list[i++];
        const t = new Image();
        t.onload = () => resolve(src);
        t.onerror = next;
        t.src = src;
      };
      next();
    });
    return logoPromise;
  }
  window.findLogo = findLogo;

  // 배경 워터마크: 로고를 찾으면 페이지에 has-logo 표시를 붙이고 --logo-url 값을 넣습니다.
  function applyLogoWatermark(src) {
    if (!src) return;
    const root = document.documentElement;
    root.style.setProperty("--logo-url", 'url("' + encodeURI(src) + '")');
    root.classList.add("has-logo");
  }

  // 상단 로고: 로고 파일이 있으면 그 파일을, 없으면 글자 로고를 보여 줍니다.
  function renderBrand() {
    findLogo().then(applyLogoWatermark);
    document.querySelectorAll("[data-brand]").forEach((host) => {
      if (host.dataset.done) return;
      host.dataset.done = "1";
      const a = document.createElement("a");
      a.className = "brand";
      a.href = host.getAttribute("data-brand") || "dashboard.html";
      a.setAttribute("aria-label", window.ORG_NAME + " " + window.SERVICE_NAME);
      const fb = document.createElement("span");
      fb.className = "brand-fallback";
      fb.innerHTML = '<span class="brand-mark" aria-hidden="true"></span><span class="brand-org">' + window.ORG_NAME + "</span>";
      const svc = document.createElement("span");
      svc.className = "brand-svc";
      svc.textContent = window.SERVICE_NAME;
      a.appendChild(fb);
      a.appendChild(svc);
      host.appendChild(a);
      findLogo().then((src) => {
        if (!src) return;
        const img = new Image();
        img.className = "brand-logo";
        img.alt = window.ORG_NAME;
        img.src = src;
        a.replaceChild(img, fb);
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderBrand);
  else renderBrand();
  window.renderBrand = renderBrand;
})();
