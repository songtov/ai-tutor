import type {
  Attempt,
  CueSuggestion,
  Feedback,
  Hashtag,
  Material,
  NoteDoc,
  Question,
  ReviewSchedule,
  Topic,
} from "./types";

export interface ApiClient {
  listTopics(): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | null>;
  findTopicByTitle(title: string): Promise<Topic | null>;
  createTopic(title: string): Promise<Topic>;
  // Also rewrites [[Old title]] links in other notes.
  renameTopic(topicId: string, title: string): Promise<Topic>;
  // Keeps the previous blocks, cues, and summary as a NoteRevision.
  saveNote(topicId: string, doc: NoteDoc): Promise<Topic>;
  // Questions the AI proposes for blocks that have no cue. Not saved until the learner accepts one.
  suggestCues(topicId: string): Promise<CueSuggestion[]>;
  listBacklinks(topicId: string): Promise<Topic[]>;
  listHashtags(): Promise<Hashtag[]>;

  listAttempts(topicId: string): Promise<{ attempt: Attempt; feedback: Feedback | null }[]>;
  submitAttempt(topicId: string, answers: { cueId: string; text: string }[]): Promise<Feedback>;

  listMaterials(topicId: string): Promise<Material[]>;
  findMaterials(topicId: string): Promise<Material[]>;
  saveMaterial(id: string): Promise<Material>;

  listQuestions(topicId: string): Promise<Question[]>;
  askQuestion(topicId: string, quote: string | null, question: string): Promise<Question>;

  getReviewSchedule(topicId: string): Promise<ReviewSchedule | null>;
  listDueReviews(): Promise<ReviewSchedule[]>;
  scheduleReview(topicId: string, intervalDays: number): Promise<ReviewSchedule>;
}
