// Lightweight semantic search: TF-IDF + concept expansion + cosine similarity.
// Swap with real embeddings (e.g. a vector DB) in production if desired.

const STOP = new Set(
  'a an the of to in on for and or is are was were be been by with from at as this that these those it its please kindly provide copy copies details detail information regarding related about under act rti sir madam all any my our your me i we you will shall may can also furnish given year years last'.split(' ')
);

const GROUPS = {
  health: ['hospital', 'clinic', 'doctor', 'medicine', 'medical', 'vaccine', 'vaccination', 'ambulance', 'nurse', 'patient', 'dispensary', 'health'],
  education: ['school', 'teacher', 'college', 'student', 'scholarship', 'exam', 'university', 'education', 'admission', 'mid-day'],
  road: ['road', 'highway', 'pothole', 'bridge', 'flyover', 'pwd', 'construction', 'tender', 'contractor', 'repair', 'bypass'],
  water: ['water', 'pipeline', 'drinking', 'sewage', 'sewerage', 'tap', 'borewell', 'tanker'],
  power: ['electricity', 'power', 'electric', 'transformer', 'meter', 'outage', 'voltage'],
  police: ['police', 'fir', 'crime', 'station', 'constable', 'traffic', 'challan', 'theft', 'arrest'],
  land: ['land', 'property', 'mutation', 'revenue', 'patwari', 'tehsil', 'registry', 'khasra', 'plot', 'encroachment'],
  transport: ['bus', 'transport', 'licence', 'license', 'driving', 'vehicle', 'permit', 'rto'],
  ration: ['ration', 'pds', 'food', 'grain', 'wheat', 'rice', 'fair-price'],
  pension: ['pension', 'widow', 'old-age', 'welfare', 'disability', 'scheme', 'subsidy', 'beneficiary'],
  farm: ['farmer', 'crop', 'agriculture', 'fertilizer', 'seed', 'msp', 'irrigation', 'kisan', 'mandi'],
  finance: ['budget', 'fund', 'expenditure', 'salary', 'grant', 'audit', 'treasury', 'allocation', 'tax'],
  civic: ['garbage', 'waste', 'sanitation', 'streetlight', 'drain', 'sewer', 'municipal', 'corporation', 'ward'],
};

const CONCEPT = {};
Object.entries(GROUPS).forEach(([c, words]) => words.forEach((w) => (CONCEPT[w] = c)));

const stem = (w) => w.replace(/(ing|ed|es|s)$/, '');

export function tokenize(text = '') {
  const raw = text.toLowerCase().replace(/[^a-z0-9\- ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  const out = [];
  raw.forEach((w) => {
    const s = stem(w);
    out.push(s);
    const c = CONCEPT[w] || CONCEPT[s];
    if (c) out.push('c_' + c, 'c_' + c); // concept tokens weighted double
  });
  return out;
}

export function semanticSearch(query, docs, k = 5) {
  if (!docs.length) return [];
  const qt = tokenize(query);
  const dt = docs.map((d) => tokenize(d.text));
  const N = docs.length + 1;
  const df = new Map();
  [...dt, qt].forEach((t) => new Set(t).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const idf = (w) => Math.log(1 + N / (df.get(w) || 1));

  const vec = (tokens) => {
    const m = new Map();
    tokens.forEach((w) => m.set(w, (m.get(w) || 0) + 1));
    m.forEach((v, w) => m.set(w, (1 + Math.log(v)) * idf(w)));
    return m;
  };
  const cos = (a, b) => {
    let dot = 0, na = 0, nb = 0;
    a.forEach((v, w) => { na += v * v; if (b.has(w)) dot += v * b.get(w); });
    b.forEach((v) => (nb += v * v));
    return na && nb ? dot / Math.sqrt(na * nb) : 0;
  };

  const qv = vec(qt);
  return docs
    .map((d, i) => ({ ...d, score: cos(qv, vec(dt[i])) }))
    .filter((r) => r.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
