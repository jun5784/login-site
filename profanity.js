// 욕설·비속어 1차 확인 (화면용). 최종 차단은 데이터베이스(upgrade-v2.sql)가 한 번 더 확인합니다.
// 단어를 추가하려면 Supabase > Table Editor > profanity_words 에 추가하세요. (이 파일은 즉시 안내용입니다)
(function (root) {
  const WORDS = ["씨발", "씨바", "씨빨", "씨팔", "씨벌", "씨8", "시발", "시팔", "시8", "ㅆㅂ", "ㅅㅂ", "ㅆ발", "ㅅ발", "썅", "병신", "븅신", "빙신", "ㅂㅅ", "ㅄ", "좆", "존나", "존니", "ㅈㄴ", "개새끼", "개세끼", "개색기", "개색히", "개쌔끼", "새끼", "쌔끼", "색히", "개같", "개소리", "개지랄", "지랄", "ㅈㄹ", "닥쳐", "닥처", "미친놈", "미친년", "미친새", "미친개", "미친것", "또라이", "등신", "염병", "엠창", "느금", "니애미", "니어미", "엿먹", "꺼지라", "죽여버", "한남충", "김치녀", "틀딱", "fuck", "shit", "bitch", "asshole"];
  const ALLOW = ["시발점", "시발역", "시발전", "시발표", "시발생", "시발굴", "시발령", "시발주", "시발견", "시발언", "시발휘", "시발송", "시발행", "시발급", "시발효", "시발족", "시발달", "씨발휘", "씨발전", "씨발표", "등신대", "새끼손", "새끼발", "새끼줄"];
  // 띄어쓰기·기호로 쪼갠 욕설("씨 발", "시.발")도 잡기 위해 한 글자 토막은 이어 붙입니다.
  function parts(text) {
    const out = [];
    let buf = "";
    String(text || "").toLowerCase().split(/\s+/).forEach((tok) => {
      const t = tok.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-z0-9]/g, "");
      if (!t) return;
      if (Array.from(t).length === 1) {
        buf += t;
      } else {
        if (buf) { out.push(buf); buf = ""; }
        out.push(t);
      }
    });
    if (buf) out.push(buf);
    return out;
  }
  function check(text) {
    const found = new Set();
    parts(text).forEach((p) => {
      let t = p;
      ALLOW.forEach((a) => { t = t.split(a).join(""); });
      WORDS.forEach((w) => { if (t.includes(w)) found.add(w); });
    });
    return { bad: found.size > 0, words: Array.from(found) };
  }
  root.Profanity = { check: check, WORDS: WORDS, ALLOW: ALLOW };
})(typeof window !== "undefined" ? window : globalThis);
