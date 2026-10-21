import type { ApiClient } from "./client";
import {
  METHODS,
  type Attempt,
  type ChatMessage,
  type Cluster,
  type Feedback,
  type LearningCycle,
  type Material,
  type Note,
  type ReviewSchedule,
  type Settings,
  type Topic,
  type TopicLink,
} from "./types";

const DAY = 24 * 60 * 60 * 1000;
const at = (days: number) => new Date(Date.now() + days * DAY).toISOString();

const topic = (id: string, title: string, description = ""): Topic => ({
  id,
  title,
  description,
  createdAt: at(-30),
});

// Kept on globalThis so the data survives module reloads in `next dev`.
function seed() {
  const settings: Settings = { defaultMethod: "standard", strictOrder: false };

  const topics: Topic[] = [
    topic("multiplication", "Multiplication", "Repeated addition and the times tables."),
    topic("division", "Division", "Splitting into equal groups, remainders, long division."),
    topic("algebra", "Algebra", "Variables, expressions, and solving equations."),
    topic("limits", "Limits", "What a function approaches as its input approaches a value."),
    topic("derivatives", "Derivatives", "The instantaneous rate of change of a function, and the rules for finding it."),
    topic("integrals", "Integrals", "Accumulation and area under a curve."),
    topic("mechanics", "Mechanics", "Motion, forces, and energy."),
  ];

  const links: TopicLink[] = [
    { fromTopicId: "multiplication", toTopicId: "division", kind: "prerequisite" },
    { fromTopicId: "algebra", toTopicId: "limits", kind: "prerequisite" },
    { fromTopicId: "limits", toTopicId: "derivatives", kind: "prerequisite" },
    { fromTopicId: "derivatives", toTopicId: "integrals", kind: "prerequisite" },
    { fromTopicId: "derivatives", toTopicId: "mechanics", kind: "related" },
  ];

  const clusters: Cluster[] = [
    { id: "exam", name: "calculus-exam", topicIds: ["limits", "derivatives", "integrals"] },
    { id: "basics", name: "foundations", topicIds: ["multiplication", "division", "algebra"] },
    { id: "physics", name: "physics", topicIds: ["mechanics"] },
  ];

  const cycles: LearningCycle[] = [
    {
      id: "c-limits-1",
      topicId: "limits",
      method: "standard",
      stages: METHODS.standard,
      currentIndex: 6,
      skipped: [],
      startedAt: at(-9),
      completedAt: at(-8),
    },
    {
      id: "c-derivatives-1",
      topicId: "derivatives",
      method: "standard",
      stages: METHODS.standard,
      currentIndex: 2,
      skipped: [],
      startedAt: at(-1),
      completedAt: null,
    },
    {
      id: "c-division-1",
      topicId: "division",
      method: "pretest",
      stages: METHODS.pretest,
      currentIndex: 8,
      skipped: [3],
      startedAt: at(-20),
      completedAt: at(-19),
    },
  ];

  const messages: ChatMessage[] = [
    {
      id: "m1",
      cycleId: "c-derivatives-1",
      role: "learner",
      content: "I want to understand derivatives before my exam next week.",
      createdAt: at(-1),
    },
    {
      id: "m2",
      cycleId: "c-derivatives-1",
      role: "tutor",
      content:
        "Good goal. Before I explain anything: in your own words, what do you think the slope of a curve at a single point means?",
      createdAt: at(-1),
    },
    {
      id: "m3",
      cycleId: "c-derivatives-1",
      role: "learner",
      content: "Maybe how steep it is right there? But a point has no width, so I'm not sure.",
      createdAt: at(-1),
    },
    {
      id: "m4",
      cycleId: "c-derivatives-1",
      role: "tutor",
      content:
        "That doubt is exactly the right one. You already studied limits. How could a limit help you measure steepness at a point with no width?",
      createdAt: at(-1),
    },
  ];

  const materials: Material[] = [
    {
      id: "mat1",
      cycleId: "c-derivatives-1",
      kind: "video",
      title: "The paradox of the derivative",
      url: "https://www.youtube.com/watch?v=9vKqVkMQHKk",
      source: "3Blue1Brown",
      picked: true,
      createdAt: at(-1),
    },
    {
      id: "mat2",
      cycleId: "c-derivatives-1",
      kind: "article",
      title: "Derivative as a limit of difference quotients",
      url: "https://en.wikipedia.org/wiki/Derivative",
      source: "Wikipedia",
      picked: false,
      createdAt: at(-1),
    },
    {
      id: "mat3",
      cycleId: "c-derivatives-1",
      kind: "article",
      title: "Power rule, product rule, chain rule: worked examples",
      url: "https://tutorial.math.lamar.edu/Classes/CalcI/DerivativeIntro.aspx",
      source: "Paul's Online Math Notes",
      picked: true,
      createdAt: at(-1),
    },
    {
      id: "mat4",
      cycleId: "c-derivatives-1",
      kind: "video",
      title: "Derivatives in 10 minutes",
      url: "https://www.youtube.com/results?search_query=derivatives",
      source: "YouTube",
      picked: false,
      createdAt: at(-1),
    },
  ];

  const attempts: Attempt[] = [
    {
      id: "a-limits-1",
      cycleId: "c-limits-1",
      prompt: "Write down everything you remember about limits.",
      answerText:
        "A limit is the value f(x) gets close to as x gets close to a. It can exist even if f(a) is undefined. Left and right limits have to match.",
      photoKeys: [],
      createdAt: at(-8),
    },
  ];

  const feedback: Feedback[] = [
    {
      id: "f-limits-1",
      attemptId: "a-limits-1",
      known: [
        "A limit describes what f(x) approaches, not the value at the point.",
        "Both one-sided limits must agree for the limit to exist.",
      ],
      missing: [
        "You didn't mention limits at infinity or horizontal asymptotes.",
        "No method for evaluating limits, such as factoring or the squeeze theorem.",
      ],
      nextQuestions: [
        "Why does the limit of sin(x)/x as x → 0 equal 1?",
        "Evaluate the limit of (x² − 1)/(x − 1) as x → 1.",
      ],
      createdAt: at(-8),
    },
  ];

  const notes: Note[] = [
    {
      id: "n-limits-1",
      topicId: "limits",
      cycleId: "c-limits-1",
      body: "A limit is what f(x) approaches near a, not f(a) itself. Both sides must agree.\n\nStill shaky: limits at infinity, evaluating with factoring and the squeeze theorem.",
      createdAt: at(-8),
      updatedAt: at(-8),
    },
    {
      id: "n-division-1",
      topicId: "division",
      cycleId: "c-division-1",
      body: "Long division: divide, multiply, subtract, bring down. The remainder is always smaller than the divisor.",
      createdAt: at(-19),
      updatedAt: at(-19),
    },
  ];

  const reviews: ReviewSchedule[] = [
    { topicId: "limits", dueAt: at(0), intervalDays: 7, lastReviewedAt: at(-7) },
    { topicId: "division", dueAt: at(-2), intervalDays: 14, lastReviewedAt: at(-16) },
    { topicId: "multiplication", dueAt: at(12), intervalDays: 30, lastReviewedAt: at(-18) },
  ];

  return { settings, topics, links, clusters, cycles, messages, materials, attempts, feedback, notes, reviews };
}

const store = globalThis as typeof globalThis & { aiTutorMock?: ReturnType<typeof seed> };
const { settings, topics, links, clusters, cycles, messages, materials, attempts, feedback, notes, reviews } =
  (store.aiTutorMock ??= seed());

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

function find<T>(items: T[], predicate: (item: T) => boolean): T {
  const item = items.find(predicate);
  if (!item) throw new Error("Not found");
  return item;
}

export const mockApi: ApiClient = {
  async getSettings() {
    return settings;
  },

  async listTopics() {
    return topics;
  },
  async getTopic(id) {
    return topics.find((t) => t.id === id) ?? null;
  },
  async createTopic(title) {
    if (topics.some((t) => t.title.toLowerCase() === title.toLowerCase())) {
      throw new Error(`A topic named "${title}" already exists.`);
    }
    const created = topic(newId("t"), title);
    topics.push(created);
    return created;
  },
  async listLinks(topicId) {
    return links.filter((l) => l.fromTopicId === topicId || l.toTopicId === topicId);
  },
  async addLink(link) {
    const exists = links.some(
      (l) => l.fromTopicId === link.fromTopicId && l.toTopicId === link.toTopicId && l.kind === link.kind,
    );
    if (!exists) links.push(link);
    return link;
  },
  async listClusters() {
    return clusters;
  },
  async getCluster(id) {
    return clusters.find((c) => c.id === id) ?? null;
  },
  async tagTopic(topicId, clusterName) {
    let cluster = clusters.find((c) => c.name === clusterName);
    if (!cluster) {
      cluster = { id: newId("cl"), name: clusterName, topicIds: [] };
      clusters.push(cluster);
    }
    if (!cluster.topicIds.includes(topicId)) cluster.topicIds.push(topicId);
    return { ...cluster };
  },
  async untagTopic(topicId, clusterId) {
    const cluster = find(clusters, (c) => c.id === clusterId);
    cluster.topicIds = cluster.topicIds.filter((id) => id !== topicId);
    return { ...cluster };
  },

  async listCycles(topicId) {
    return cycles.filter((c) => c.topicId === topicId);
  },
  async listActiveCycles() {
    return cycles.filter((c) => c.completedAt === null);
  },
  async getCycle(id) {
    return cycles.find((c) => c.id === id) ?? null;
  },
  async startCycle(topicId, method) {
    const cycle: LearningCycle = {
      id: newId("c"),
      topicId,
      method,
      stages: METHODS[method],
      currentIndex: 0,
      skipped: [],
      startedAt: at(0),
      completedAt: null,
    };
    cycles.push(cycle);
    return cycle;
  },
  async goToStage(cycleId, index) {
    const cycle = find(cycles, (c) => c.id === cycleId);
    if (index >= cycle.stages.length) cycle.completedAt ??= at(0);
    else cycle.currentIndex = index;
    return { ...cycle };
  },
  async skipStage(cycleId) {
    const cycle = find(cycles, (c) => c.id === cycleId);
    cycle.skipped = [...new Set([...cycle.skipped, cycle.currentIndex])];
    cycle.currentIndex = Math.min(cycle.currentIndex + 1, cycle.stages.length - 1);
    return { ...cycle };
  },

  async listMessages(cycleId) {
    return messages.filter((m) => m.cycleId === cycleId);
  },
  async sendMessage(cycleId, content) {
    const sent: ChatMessage[] = [
      { id: newId("m"), cycleId, role: "learner", content, createdAt: at(0) },
      {
        id: newId("m"),
        cycleId,
        role: "tutor",
        content:
          "Before I answer, try it yourself first: explain it in one or two sentences, and I'll tell you what to sharpen.",
        createdAt: at(0),
      },
    ];
    messages.push(...sent);
    return sent;
  },

  async listMaterials(cycleId) {
    return materials.filter((m) => m.cycleId === cycleId);
  },
  async setMaterialPicked(id, picked) {
    const material = find(materials, (m) => m.id === id);
    material.picked = picked;
    return { ...material };
  },

  async listAttempts(cycleId) {
    return attempts.filter((a) => a.cycleId === cycleId);
  },
  async submitAttempt(cycleId, answer) {
    const attempt: Attempt = { id: newId("a"), cycleId, createdAt: at(0), ...answer };
    attempts.push(attempt);
    feedback.push({
      id: newId("f"),
      attemptId: attempt.id,
      known: [
        "You described the derivative as the slope of the tangent line.",
        "You connected it to a limit of average rates of change.",
      ],
      missing: [
        "You didn't write the difference quotient: (f(x + h) − f(x)) / h.",
        "The chain rule was missing from the rules you listed.",
      ],
      nextQuestions: [
        "Find the derivative of x³ from the definition, not the power rule.",
        "Why is the derivative of sin(2x) equal to 2cos(2x)?",
      ],
      createdAt: at(0),
    });
    return attempt;
  },
  async getFeedback(attemptId) {
    return feedback.find((f) => f.attemptId === attemptId) ?? null;
  },

  async listNotes(topicId) {
    return notes.filter((n) => n.topicId === topicId);
  },
  async saveNote(topicId, cycleId, body) {
    const existing = notes.find((n) => n.topicId === topicId && n.cycleId === cycleId);
    if (existing) {
      existing.body = body;
      existing.updatedAt = at(0);
      return { ...existing };
    }
    const note: Note = { id: newId("n"), topicId, cycleId, body, createdAt: at(0), updatedAt: at(0) };
    notes.push(note);
    return note;
  },

  async getReviewSchedule(topicId) {
    return reviews.find((r) => r.topicId === topicId) ?? null;
  },
  async listDueReviews() {
    const now = Date.now();
    return reviews
      .filter((r) => new Date(r.dueAt).getTime() <= now + DAY)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  },
  async scheduleReview(topicId, intervalDays) {
    const schedule: ReviewSchedule = {
      topicId,
      dueAt: at(intervalDays),
      intervalDays,
      lastReviewedAt: at(0),
    };
    const index = reviews.findIndex((r) => r.topicId === topicId);
    if (index === -1) reviews.push(schedule);
    else reviews[index] = schedule;
    return schedule;
  },

  async suggestNextTopics(topicId) {
    const finished = new Set(cycles.filter((c) => c.completedAt).map((c) => c.topicId));
    const linked = links
      .filter((l) => l.fromTopicId === topicId || (l.kind === "related" && l.toTopicId === topicId))
      .map((l) => {
        const otherId = l.fromTopicId === topicId ? l.toTopicId : l.fromTopicId;
        const other = find(topics, (t) => t.id === otherId);
        const current = find(topics, (t) => t.id === topicId);
        return {
          topic: other,
          title: other.title,
          reason:
            l.kind === "prerequisite"
              ? `${current.title} is a prerequisite for ${other.title}.`
              : `${other.title} is related to ${current.title}.`,
        };
      })
      .filter((s) => !finished.has(s.topic.id));
    return linked;
  },
};
