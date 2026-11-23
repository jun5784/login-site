// 공통 인증 클라이언트
(function () {
  const cfg = window.APP_CONFIG || {};
  const notConfigured = !cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes("YOUR-PROJECT-REF") ||
                        !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes("YOUR-");
  window.AUTH_NOT_CONFIGURED = notConfigured;
  if (!notConfigured) {
    window.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  // 현재 페이지와 같은 폴더의 파일 주소를 만듭니다 (GitHub Pages 하위 경로 대응)
  window.pageUrl = function (file) { return new URL(file, window.location.href).href; };
  window.showMsg = function (el, text, type) {
    el.textContent = text; el.className = "msg " + (type || "error"); el.hidden = !text;
  };
  window.translateError = function (err) {
    const m = (err && err.message) || String(err);
    if (/Invalid login credentials/i.test(m)) return "이메일 또는 비밀번호가 올바르지 않습니다.";
    if (/Email not confirmed/i.test(m)) return "이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요.";
    if (/User already registered/i.test(m)) return "이미 가입된 이메일입니다.";
    if (/Password should be at least/i.test(m)) return "비밀번호는 6자 이상이어야 합니다.";
    if (/rate limit/i.test(m)) return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    return m;
  };
})();
