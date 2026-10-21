// Mirrors docs/domain.md.

export type Stage = "chat" | "materials" | "quiz" | "feedback" | "notes" | "review" | "next_topic";

export type MethodName = "standard" | "pretest" | "review";

export const METHODS: Record<MethodName, Stage[]> = {
  standard: ["chat", "materials", "quiz", "feedback", "notes", "review", "next_topic"],
  pretest: [
    "chat",
    "quiz",
    "feedback",
    "materials",
    "quiz",
    "feedback",
    "notes",
    "review",
    "next_topic",
  ],
  review: ["quiz", "feedback", "notes", "review"],
};

export type Settings = {
  defaultMethod: MethodName;
  strictOrder: boolean;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

export type TopicLink = {
  fromTopicId: string;
  toTopicId: string;
  kind: "prerequisite" | "related";
};

export type Cluster = {
  id: string;
  name: string;
  topicIds: string[];
};

export type LearningCycle = {
  id: string;
  topicId: string;
  method: MethodName;
  stages: Stage[];
  currentIndex: number;
  skipped: number[];
  startedAt: string;
  completedAt: string | null;
};

export type ChatMessage = {
  id: string;
  cycleId: string;
  role: "learner" | "tutor";
  content: string;
  createdAt: string;
};

export type Material = {
  id: string;
  cycleId: string;
  kind: "video" | "article" | "other";
  title: string;
  url: string;
  source: string;
  picked: boolean;
  createdAt: string;
};

export type Attempt = {
  id: string;
  cycleId: string;
  prompt: string;
  answerText: string | null;
  photoKeys: string[];
  createdAt: string;
};

export type Feedback = {
  id: string;
  attemptId: string;
  known: string[];
  missing: string[];
  nextQuestions: string[];
  createdAt: string;
};

export type Note = {
  id: string;
  topicId: string;
  cycleId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewSchedule = {
  topicId: string;
  dueAt: string;
  intervalDays: number;
  lastReviewedAt: string | null;
};

export type TopicSuggestion = {
  topic: Topic | null;
  title: string;
  reason: string;
};
