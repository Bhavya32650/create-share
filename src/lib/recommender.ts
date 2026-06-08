// Content-based recommender: TF-IDF + Cosine Similarity
export type Role = {
  title: string;
  description: string;
  skills: string[];
};

export const ROLES: Role[] = [
  {
    title: "Data Scientist",
    description: "Build models to extract insights from data.",
    skills: ["python", "machine learning", "statistics", "pandas", "sql", "data visualization", "deep learning"],
  },
  {
    title: "Machine Learning Engineer",
    description: "Ship production ML systems at scale.",
    skills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "mlops", "docker"],
  },
  {
    title: "DevOps Engineer",
    description: "Automate infrastructure and delivery pipelines.",
    skills: ["linux", "docker", "kubernetes", "ci/cd", "cloud computing", "automation", "bash"],
  },
  {
    title: "Cloud Engineer",
    description: "Design and operate cloud-native architectures.",
    skills: ["aws", "azure", "cloud computing", "terraform", "kubernetes", "networking", "automation"],
  },
  {
    title: "Backend Developer",
    description: "Build APIs, services, and data layers.",
    skills: ["java", "python", "sql", "rest api", "microservices", "data structures", "algorithms"],
  },
  {
    title: "Frontend Developer",
    description: "Craft accessible, performant user interfaces.",
    skills: ["javascript", "typescript", "react", "css", "html", "web design", "ui/ux"],
  },
  {
    title: "Full Stack Developer",
    description: "Own features end-to-end across the stack.",
    skills: ["javascript", "typescript", "react", "node.js", "sql", "rest api", "html", "css"],
  },
  {
    title: "Mobile Developer",
    description: "Build native and cross-platform mobile apps.",
    skills: ["swift", "kotlin", "react native", "flutter", "javascript", "ui/ux", "rest api"],
  },
  {
    title: "Data Engineer",
    description: "Build pipelines that move and shape data.",
    skills: ["python", "sql", "spark", "airflow", "etl", "cloud computing", "data warehousing"],
  },
  {
    title: "Cybersecurity Analyst",
    description: "Defend systems against modern threats.",
    skills: ["linux", "networking", "security", "python", "cryptography", "penetration testing", "bash"],
  },
  {
    title: "AI Research Engineer",
    description: "Prototype novel AI architectures.",
    skills: ["python", "deep learning", "pytorch", "mathematics", "research", "nlp", "computer vision"],
  },
  {
    title: "Systems Administrator",
    description: "Keep servers and services running smoothly.",
    skills: ["linux", "bash", "networking", "automation", "cloud computing", "monitoring", "security"],
  },
  {
    title: "Game Developer",
    description: "Design interactive worlds and engines.",
    skills: ["c++", "c#", "unity", "unreal engine", "game design", "mathematics", "graphics"],
  },
  {
    title: "Blockchain Developer",
    description: "Build decentralized applications.",
    skills: ["solidity", "javascript", "ethereum", "smart contracts", "cryptography", "web3", "rust"],
  },
];

export const ALL_SKILLS: string[] = Array.from(
  new Set(ROLES.flatMap((r) => r.skills))
).sort();

// Build vocabulary
const vocab = ALL_SKILLS;
const vocabIndex = new Map(vocab.map((s, i) => [s, i]));

// IDF over role "documents"
const N = ROLES.length;
const df = new Array(vocab.length).fill(0);
for (const role of ROLES) {
  const seen = new Set(role.skills);
  seen.forEach((s) => {
    const i = vocabIndex.get(s);
    if (i !== undefined) df[i]++;
  });
}
const idf = df.map((d) => Math.log((1 + N) / (1 + d)) + 1);

function tfidfVector(skills: string[]): number[] {
  const v = new Array(vocab.length).fill(0);
  if (skills.length === 0) return v;
  const counts = new Map<string, number>();
  skills.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
  const total = skills.length;
  counts.forEach((c, s) => {
    const i = vocabIndex.get(s);
    if (i !== undefined) v[i] = (c / total) * idf[i];
  });
  return v;
}

const ROLE_VECTORS = ROLES.map((r) => tfidfVector(r.skills));

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export type Recommendation = {
  role: Role;
  score: number;
  matched: string[];
};

export function recommend(userSkills: string[], topN = 3): Recommendation[] {
  const cleaned = userSkills.map((s) => s.toLowerCase().trim()).filter(Boolean);
  const userVec = tfidfVector(cleaned);
  const userSet = new Set(cleaned);
  const scored = ROLES.map((role, i) => ({
    role,
    score: cosine(userVec, ROLE_VECTORS[i]),
    matched: role.skills.filter((s) => userSet.has(s)),
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
