import { bodyOf, noteStatements, parseLinks, parseTags } from "@/lib/notes";

import type { ApiClient } from "./client";
import type {
  Attempt,
  CueResult,
  CueSuggestion,
  Feedback,
  Material,
  NoteBlock,
  NoteRevision,
  Question,
  ReviewSchedule,
  SummaryPoint,
  Topic,
} from "./types";

const DAY = 24 * 60 * 60 * 1000;
const at = (days: number) => new Date(Date.now() + days * DAY).toISOString();
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

// Each row is a block, optionally with the learner's cue beside it.
function note(id: string, title: string, rows: [string, string?][], summary = ""): Topic {
  const blocks: NoteBlock[] = rows.map(([text], i) => ({ id: `${id}-b${i}`, text }));
  const cues = rows.flatMap(([, question], i) =>
    question ? [{ id: `${id}-c${i}`, blockId: `${id}-b${i}`, question, origin: "learner" as const }] : [],
  );
  return { id, title, blocks, cues, summary, createdAt: at(-30), updatedAt: at(-2) };
}

// Kept on globalThis so the data survives module reloads in `next dev`.
function seed() {
  const topics: Topic[] = [
    note(
      "limits",
      "Limits",
      [
        ["#calculus-exam"],
        [
          "A limit is the value f(x) approaches as x approaches a. It can exist even when f(a) is undefined.",
          "What is a limit, and does f(a) need to exist?",
        ],
        ["Both one-sided limits must agree for the limit to exist.", "When does a limit exist?"],
        ["Limits at infinity describe horizontal asymptotes.", "What do limits at infinity tell you?"],
        ["Needed for [[Derivatives]]."],
      ],
      "A limit is where f(x) is heading near a point, not its value there. It exists only if both sides agree.",
    ),
    note("derivatives", "Derivatives", [
      ["#calculus-exam"],
      [
        "The derivative is the slope of the tangent line at a point: the instantaneous rate of change.",
        "What does a derivative measure?",
      ],
      [
        "It is defined as a limit of difference quotients, f'(x) = lim (f(x+h) - f(x)) / h as h goes to 0. Builds on [[Limits]].",
      ],
      ["## Rules"],
      [
        "- Power rule: the derivative of x^n is n times x^(n-1)\n- Product rule: (fg)' = f'g + fg'\n- Chain rule: the derivative of f(g(x)) is f'(g(x)) times g'(x)",
        "State the power, product, and chain rules.",
      ],
      ["Used in [[Mechanics]] for velocity and acceleration. Next up: [[Integrals]]."],
    ]),
    note("mechanics", "Mechanics", [
      ["#physics"],
      [
        "Velocity is the derivative of position, and acceleration is the derivative of velocity. See [[Derivatives]].",
        "How are position, velocity, and acceleration related?",
      ],
      ["Newton's second law: force equals mass times acceleration."],
    ]),
    note("multiplication", "Multiplication", [
      ["#foundations"],
      ["Multiplication is repeated addition: 3 × 4 means adding 4 three times.", "What is multiplication?"],
      ["Order does not matter: a × b equals b × a."],
    ]),
    note("division", "Division", [
      ["#foundations"],
      ["Division splits a number into equal groups. Builds on [[Multiplication]].", "What does division do?"],
      ["Long division repeats four steps: divide, multiply, subtract, bring down.", "What are the steps of long division?"],
      ["The remainder is always smaller than the divisor.", "What is true about the remainder?"],
    ]),
  ];

  const revisions: NoteRevision[] = topics.map((t) => ({
    id: `r-${t.id}`,
    topicId: t.id,
    blocks: t.blocks,
    cues: t.cues,
    summary: t.summary,
    createdAt: t.updatedAt,
  }));

  const attempts: Attempt[] = [
    {
      id: "a-limits-1",
      topicId: "limits",
      noteRevisionId: "r-limits",
      answers: [
        { cueId: "limits-c1", text: "Where f(x) is heading as x gets close to a. f(a) doesn't have to exist." },
        { cueId: "limits-c2", text: "When the left and right limits agree." },
        { cueId: "limits-c3", text: "" },
      ],
      createdAt: at(-7),
    },
  ];

  const feedback: Feedback[] = [
    {
      id: "f-limits-1",
      attemptId: "a-limits-1",
      results: [
        {
          cueId: "limits-c1",
          known: ["A limit is the value f(x) approaches as x approaches a.", "It can exist even when f(a) is undefined."],
          missing: [],
        },
        { cueId: "limits-c2", known: ["Both one-sided limits must agree for the limit to exist."], missing: [] },
        { cueId: "limits-c3", known: [], missing: ["Limits at infinity describe horizontal asymptotes."] },
      ],
      createdAt: at(-7),
    },
  ];

  const materials: Material[] = [
    {
      id: "mat-3b1b",
      topicId: "derivatives",
      kind: "video",
      title: "The paradox of the derivative",
      url: "https://www.youtube.com/watch?v=9vKqVkMQHKk",
      source: "3Blue1Brown",
      foundFor: null,
      saved: true,
      summary: [
        { text: "A derivative at a single point is a paradox: change needs two points", timestamp: "1:05" },
        { text: "The derivative is the limit of slopes between two nearby points", timestamp: "6:40" },
        { text: "dx is not zero; it is a nudge that approaches zero", timestamp: "11:20" },
      ],
      createdAt: at(-3),
    },
    {
      id: "mat-wiki",
      topicId: "derivatives",
      kind: "article",
      title: "Derivative",
      url: "https://en.wikipedia.org/wiki/Derivative",
      source: "Wikipedia",
      foundFor: null,
      saved: false,
      summary: [],
      createdAt: at(-3),
    },
  ];

  const questions: Question[] = [
    {
      id: "q-1",
      topicId: "derivatives",
      quote: "as h goes to 0",
      question: "If h isn't zero, why can we ignore it at the end?",
      answer:
        "Try this first: compute the slope between x and x + h for x², then look at which term still has an h in it. What happens to that term as h shrinks?",
      createdAt: at(-2),
    },
  ];

  const reviews: ReviewSchedule[] = [
    { topicId: "limits", dueAt: at(0), intervalDays: 7, lastReviewedAt: at(-7) },
    { topicId: "division", dueAt: at(-2), intervalDays: 14, lastReviewedAt: at(-16) },
    { topicId: "multiplication", dueAt: at(12), intervalDays: 30, lastReviewedAt: at(-18) },
  ];

  return { topics, revisions, attempts, feedback, materials, questions, reviews };
}

const store = globalThis as typeof globalThis & { aiTutorCornell?: ReturnType<typeof seed> };
const { topics, revisions, attempts, feedback, materials, questions, reviews } = (store.aiTutorCornell ??= seed());

function find<T>(items: T[], predicate: (item: T) => boolean): T {
  const item = items.find(predicate);
  if (!item) throw new Error("Not found");
  return item;
}

const STOPWORDS = new Set(["that", "this", "with", "from", "when", "even", "have", "must", "always", "means", "times"]);
const words = (text: string) =>
  new Set(
    (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
      .map((w) => w.slice(0, 5)),
  );

// Stands in for the LLM: a statement counts as recalled when most of its words appear in the answer.
function assess(blockText: string, answer: string): Pick<CueResult, "known" | "missing"> {
  const answered = words(answer);
  const known: string[] = [];
  const missing: string[] = [];
  for (const statement of noteStatements(blockText)) {
    const needed = [...words(statement)];
    const hit = needed.filter((w) => answered.has(w)).length;
    // A labeled statement ("Chain rule: ...") only counts if the label is recalled too.
    const label = statement.match(/^([^:]{1,30}):/)?.[1] ?? "";
    const labelRecalled = [...words(label)].every((w) => answered.has(w));
    (needed.length > 0 && hit / needed.length >= 0.6 && labelRecalled ? known : missing).push(statement);
  }
  return { known, missing };
}

// Stands in for the LLM: turns a block into a question without giving the answer away.
function cueFor(title: string, text: string): string | null {
  const plain = noteStatements(text);
  if (plain.length === 0) return null;
  const subject = title.toLowerCase();
  const labels = plain.map((s) => s.match(/^([^:]{1,30}):/)?.[1]).filter(Boolean);
  if (labels.length > 1) return `State the ${labels.join(", ").toLowerCase()}.`;
  if (/^(it|this) is defined/i.test(plain[0])) return `How are ${subject} defined?`;
  if (/^used (in|for)/i.test(plain[0])) return `Where are ${subject} used, and for what?`;
  const term = plain[0].match(/^(?:The |A |An )?([\p{L} ]{3,40}?) (?:is|are|means) /u)?.[1];
  if (term && !/^(it|this|that|they)$/i.test(term)) return `What is ${term.toLowerCase()}?`;
  return `What does this part say about ${subject}?`;
}

export const mockApi: ApiClient = {
  async listTopics() {
    return topics;
  },
  async getTopic(id) {
    return topics.find((t) => t.id === id) ?? null;
  },
  async findTopicByTitle(title) {
    return topics.find((t) => t.title.toLowerCase() === title.trim().toLowerCase()) ?? null;
  },
  async createTopic(title) {
    if (await this.findTopicByTitle(title)) throw new Error(`A note named "${title}" already exists.`);
    const created: Topic = {
      id: newId("t"),
      title: title.trim(),
      blocks: [{ id: newId("b"), text: "" }],
      cues: [],
      summary: "",
      createdAt: at(0),
      updatedAt: at(0),
    };
    topics.push(created);
    const { blocks, cues, summary } = created;
    revisions.push({ id: newId("r"), topicId: created.id, blocks, cues, summary, createdAt: at(0) });
    return created;
  },
  async saveNote(topicId, doc) {
    const topic = find(topics, (t) => t.id === topicId);
    const before = JSON.stringify([topic.blocks, topic.cues, topic.summary]);
    if (before !== JSON.stringify([doc.blocks, doc.cues, doc.summary])) {
      Object.assign(topic, doc, { updatedAt: at(0) });
      revisions.push({ id: newId("r"), topicId, ...doc, createdAt: at(0) });
    }
    return { ...topic };
  },
  async suggestCues(topicId) {
    const topic = find(topics, (t) => t.id === topicId);
    const cued = new Set(topic.cues.map((c) => c.blockId));
    return topic.blocks
      .filter((b) => !cued.has(b.id))
      .flatMap((b): CueSuggestion[] => {
        const question = cueFor(topic.title, b.text);
        return question ? [{ blockId: b.id, question }] : [];
      });
  },
  async listBacklinks(topicId) {
    const target = find(topics, (t) => t.id === topicId).title.toLowerCase();
    return topics.filter((t) => parseLinks(bodyOf(t.blocks)).some((l) => l.toLowerCase() === target));
  },
  async listHashtags() {
    const byName = new Map<string, string[]>();
    for (const t of topics) {
      for (const tag of parseTags(bodyOf(t.blocks))) byName.set(tag, [...(byName.get(tag) ?? []), t.id]);
    }
    return [...byName].map(([name, topicIds]) => ({ name, topicIds })).sort((a, b) => a.name.localeCompare(b.name));
  },

  async listAttempts(topicId) {
    return attempts
      .filter((a) => a.topicId === topicId)
      .map((attempt) => ({ attempt, feedback: feedback.find((f) => f.attemptId === attempt.id) ?? null }));
  },
  async submitAttempt(topicId, answers) {
    const revision = revisions.filter((r) => r.topicId === topicId).at(-1)!;
    const attempt: Attempt = { id: newId("a"), topicId, noteRevisionId: revision.id, answers, createdAt: at(0) };
    attempts.push(attempt);
    const results = answers.map(({ cueId, text }) => {
      const cue = find(revision.cues, (c) => c.id === cueId);
      const block = find(revision.blocks, (b) => b.id === cue.blockId);
      return { cueId, ...assess(block.text, text) };
    });
    const assessed: Feedback = { id: newId("f"), attemptId: attempt.id, results, createdAt: at(0) };
    feedback.push(assessed);
    return assessed;
  },

  async listMaterials(topicId) {
    return materials.filter((m) => m.topicId === topicId);
  },
  async findMaterials(topicId) {
    const topic = find(topics, (t) => t.id === topicId);
    const last = attempts.filter((a) => a.topicId === topicId).at(-1);
    const gap = feedback.find((f) => f.attemptId === last?.id)?.results.flatMap((r) => r.missing)[0] ?? null;
    const query = encodeURIComponent(gap ?? `${topic.title} explained`);
    const found: Material[] = [
      {
        id: newId("mat"),
        topicId,
        kind: "video",
        title: gap ? `${gap.split(/[:,.]/)[0]}, explained` : `${topic.title} in 10 minutes`,
        url: `https://www.youtube.com/results?search_query=${query}`,
        source: "YouTube",
        foundFor: gap,
        saved: false,
        summary: [],
        createdAt: at(0),
      },
      {
        id: newId("mat"),
        topicId,
        kind: "article",
        title: topic.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.title)}`,
        source: "Wikipedia",
        foundFor: null,
        saved: false,
        summary: [],
        createdAt: at(0),
      },
    ];
    materials.push(...found);
    return found;
  },
  async saveMaterial(id) {
    const material = find(materials, (m) => m.id === id);
    const subject = find(topics, (t) => t.id === material.topicId).title.toLowerCase();
    const video = material.kind === "video";
    material.saved = true;
    if (material.summary.length === 0) {
      const points: SummaryPoint[] = [
        { text: `What ${subject} is, from a concrete example`, timestamp: video ? "0:45" : null },
        { text: `The formal definition of ${subject}`, timestamp: video ? "4:10" : null },
        { text: `A common mistake when working with ${subject}`, timestamp: video ? "8:30" : null },
      ];
      material.summary = points;
    }
    return { ...material };
  },

  async listQuestions(topicId) {
    return questions.filter((q) => q.topicId === topicId);
  },
  async askQuestion(topicId, quote, question) {
    const asked: Question = {
      id: newId("q"),
      topicId,
      quote,
      question,
      answer: quote
        ? `Before I explain: put "${quote}" in your own words in one sentence. Which part of it are you unsure about?`
        : "Before I explain: what do you already think the answer is? Write one sentence, even if it's a guess.",
      createdAt: at(0),
    };
    questions.push(asked);
    return asked;
  },

  async getReviewSchedule(topicId) {
    return reviews.find((r) => r.topicId === topicId) ?? null;
  },
  async listDueReviews() {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return reviews
      .filter((r) => new Date(r.dueAt) <= endOfToday)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  },
  async scheduleReview(topicId, intervalDays) {
    const schedule: ReviewSchedule = { topicId, dueAt: at(intervalDays), intervalDays, lastReviewedAt: at(0) };
    const index = reviews.findIndex((r) => r.topicId === topicId);
    if (index === -1) reviews.push(schedule);
    else reviews[index] = schedule;
    return schedule;
  },
};
