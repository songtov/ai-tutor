// Mirrors docs/domain.md.

// A paragraph, heading, or list in a note. Cues attach to blocks.
export type NoteBlock = {
  id: string;
  text: string;
};

// A Cornell cue: the question beside a block that the learner answers from memory.
export type Cue = {
  id: string;
  blockId: string;
  question: string;
  origin: "learner" | "ai";
};

export type NoteDoc = {
  blocks: NoteBlock[];
  cues: Cue[];
  summary: string;
};

export type Topic = NoteDoc & {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteRevision = NoteDoc & {
  id: string;
  topicId: string;
  createdAt: string;
};

export type CueSuggestion = {
  blockId: string;
  question: string;
};

export type Hashtag = {
  name: string;
  topicIds: string[];
};

export type Attempt = {
  id: string;
  topicId: string;
  noteRevisionId: string;
  answers: { cueId: string; text: string }[];
  createdAt: string;
};

export type CueResult = {
  cueId: string;
  known: string[];
  missing: string[];
};

export type Feedback = {
  id: string;
  attemptId: string;
  results: CueResult[];
  createdAt: string;
};

export type SummaryPoint = {
  text: string;
  timestamp: string | null;
};

export type Material = {
  id: string;
  topicId: string;
  kind: "video" | "article" | "other";
  title: string;
  url: string;
  source: string;
  foundFor: string | null;
  saved: boolean;
  summary: SummaryPoint[];
  createdAt: string;
};

export type Question = {
  id: string;
  topicId: string;
  quote: string | null;
  question: string;
  answer: string;
  createdAt: string;
};

export type ReviewSchedule = {
  topicId: string;
  dueAt: string;
  intervalDays: number;
  lastReviewedAt: string | null;
};
