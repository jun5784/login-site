// 한국어 키워드 추출 (조사·어미 제거 + 불용어 제외)
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Keywords = api;
})(typeof self !== "undefined" ? self : this, function () {
  const PARTICLES = [
    "들에게서", "에서부터", "으로부터", "들에게", "에게서", "에서는", "에서도", "에게는", "에게도",
    "으로는", "으로도", "이라고", "이라는", "이라면", "이라도", "이지만", "들이", "들은", "들의",
    "들을", "들과", "들도", "들로", "라고", "라는", "라면", "처럼", "까지", "부터", "에서", "에게",
    "한테", "으로", "로서", "로써", "보다", "이나", "이랑", "과는", "와는", "과의", "와의", "이고",
    "이며", "이다", "이죠", "에는", "에도", "은", "는", "이", "가", "을", "를", "에", "의", "도",
    "만", "로", "과", "와", "나", "랑", "요", "죠", "들"
  ].sort((a, b) => b.length - a.length);

  const ENDINGS = [
    "해야겠습니다", "해야합니다", "해야한다고", "하겠습니다", "되었습니다", "해줬으면", "하였으면",
    "되었으면", "해야한다", "해야해요", "해야겠다", "했습니다", "해주세요", "시켜야", "했으면",
    "합니다", "됩니다", "해주면", "스럽게", "스러운", "시키는", "시키고", "적으로", "같아요",
    "같습니다", "입니다", "이에요", "습니다", "해야", "하면", "하는", "하고", "해서", "한다",
    "했다", "해요", "하게", "하기", "하여", "하며", "되면", "되는", "된다", "되어", "돼야", "되고",
    "되기", "되게", "적인", "적이", "롭게", "로운", "시켜", "예요", "에요", "네요", "니다", "인데",
    "할", "한", "함", "될", "된", "적", "하"
  ].sort((a, b) => b.length - a.length);

  const PROTECT = new Set([
    "민주주의", "관료주의", "성과주의", "권위주의", "완벽주의", "개인주의", "집단주의", "자본주의",
    "만족도", "몰입도", "인지도", "신뢰도", "참여도", "완성도", "이해도", "중요도", "기여도",
    "투명도", "자유도", "충성도", "난이도", "숙련도", "피로도", "전문가", "기업가", "창업가",
    "혁신가", "전략가", "무제한", "아이디어", "데이터", "하드웨어", "소프트웨어", "미들웨어"
  ]);

  const STOPWORDS = new Set((
    "그리고 그러나 그런데 하지만 그래서 그러면 또한 또는 혹은 및 등 것 거 수 때 중 더 덜 잘 못 안 좀 " +
    "그냥 정말 너무 아주 매우 진짜 조금 많이 많은 계속 항상 다시 이제 지금 현재 앞으로 오늘 내일 " +
    "우리 저희 제가 저는 나는 내가 너무 이런 그런 저런 이렇게 그렇게 저렇게 어떤 모든 모두 각자 " +
    "같은 같다 같아 같아요 있는 없는 있다 없다 있으면 없으면 있고 없고 있어 없어 있어요 없어요 " +
    "있습니다 없습니다 좋은 좋다 좋을 좋아 좋아요 좋겠 좋겠다 좋겠어요 좋겠습니다 바랍 바랍니다 " +
    "싫어요 다른 생각 생각해 생각합니다 의견 제안 부분 경우 정도 위해 위한 통해 대한 대해 관련 " +
    "하는 하고 해서 했으면 합니다 됩니다 입니다 그것 이것 저것 여기 거기 누구 무엇 어떻게 언제 " +
    "어디 왜 네 예 아니 응 음 아 오 필요 중요 가능 가장 특히 먼저 바로 함께 같이 이상 이하 자체 " +
    "하나 회사 우리회사 스스로 새로 서로 혹시 약간 다들 모두가 정말로 그게 이게 저게 뭔가 " +
    "해요 한다고 한다는 봅니다 보고 보면 봐요 봐야 만들어야 만들어 만들고 만들면 많아 많다 많고 많습니다 적어 적다 " +
    "하자 합시다 됐으면 되요 돼요 늘리고 늘려야 줄이고 줄여야 싶어요 싶습니다 싶다 원해요 원합니다 어떨까요 어때요 " +
    "the a an to of and in is for on it be we"
  ).split(/\s+/).filter(Boolean));

  function normalize(word) {
    let w = word;
    if (PROTECT.has(w)) return w;
    for (let pass = 0; pass < 2; pass++) {
      let changed = false;
      for (const e of ENDINGS) {
        if (w.length - e.length >= 2 && w.endsWith(e)) { w = w.slice(0, -e.length); changed = true; break; }
      }
      if (PROTECT.has(w)) return w;
      for (const p of PARTICLES) {
        if (w.length - p.length >= 2 && w.endsWith(p) && !(p === "의" && w.endsWith("주의"))) {
          w = w.slice(0, -p.length); changed = true; break;
        }
      }
      if (PROTECT.has(w)) return w;
      if (!changed) break;
    }
    return w;
  }

  function parseList(text) {
    return String(text || "").split(/[\n,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  }

  // "대표어: 동의어1, 동의어2" 형식 (한 줄에 하나)
  function parseSynonyms(text) {
    const map = new Map();
    String(text || "").split(/\n+/).forEach((line) => {
      const i = line.indexOf(":");
      if (i < 1) return;
      const head = line.slice(0, i).trim();
      if (!head) return;
      const all = [head].concat(line.slice(i + 1).split(","));
      all.forEach((s) => {
        const k = s.trim().toLowerCase();
        if (!k) return;
        map.set(k, head);
        map.set(normalize(k), head);
      });
    });
    return map;
  }

  function buildOptions(o) {
    o = o || {};
    const stop = new Set(STOPWORDS);
    parseList(o.stopText).forEach((s) => { stop.add(s); stop.add(normalize(s)); });
    (o.extraStop || []).forEach((s) => stop.add(s));
    return { stop: stop, synonyms: parseSynonyms(o.synonymText), minLen: o.minLen || 2 };
  }

  function extract(text, opts) {
    opts = opts || {};
    const stop = opts.stop || STOPWORDS;
    const syn = opts.synonyms || new Map();
    const minLen = opts.minLen || 2;
    const out = [];
    const cleaned = String(text || "").toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, " ");
    cleaned.split(/\s+/).forEach((tok) => {
      let raw = tok.replace(/[ㄱ-ㅎㅏ-ㅣ]+/g, "");
      if (!raw || /^\d+$/.test(raw)) return;
      if (syn.has(raw)) { out.push(syn.get(raw)); return; }
      if (stop.has(raw)) return;
      const w = normalize(raw);
      if (syn.has(w)) { out.push(syn.get(w)); return; }
      if (w.length < minLen || stop.has(w) || /^\d+$/.test(w)) return;
      out.push(w);
    });
    return out;
  }

  return { extract: extract, normalize: normalize, buildOptions: buildOptions, STOPWORDS: STOPWORDS };
});
