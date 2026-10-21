import type {
  Attempt,
  ChatMessage,
  Cluster,
  Feedback,
  LearningCycle,
  Material,
  MethodName,
  Note,
  ReviewSchedule,
  Settings,
  Topic,
  TopicLink,
  TopicSuggestion,
} from "./types";

export interface ApiClient {
  getSettings(): Promise<Settings>;

  listTopics(): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | null>;
  createTopic(title: string): Promise<Topic>;
  listLinks(topicId: string): Promise<TopicLink[]>;
  addLink(link: TopicLink): Promise<TopicLink>;
  listClusters(): Promise<Cluster[]>;
  getCluster(id: string): Promise<Cluster | null>;
  tagTopic(topicId: string, clusterName: string): Promise<Cluster>;
  untagTopic(topicId: string, clusterId: string): Promise<Cluster>;

  listCycles(topicId: string): Promise<LearningCycle[]>;
  listActiveCycles(): Promise<LearningCycle[]>;
  getCycle(id: string): Promise<LearningCycle | null>;
  startCycle(topicId: string, method: MethodName): Promise<LearningCycle>;
  goToStage(cycleId: string, index: number): Promise<LearningCycle>;
  skipStage(cycleId: string): Promise<LearningCycle>;

  listMessages(cycleId: string): Promise<ChatMessage[]>;
  sendMessage(cycleId: string, content: string): Promise<ChatMessage[]>;

  listMaterials(cycleId: string): Promise<Material[]>;
  setMaterialPicked(id: string, picked: boolean): Promise<Material>;

  listAttempts(cycleId: string): Promise<Attempt[]>;
  submitAttempt(
    cycleId: string,
    answer: { prompt: string; answerText: string | null; photoKeys: string[] },
  ): Promise<Attempt>;
  getFeedback(attemptId: string): Promise<Feedback | null>;

  listNotes(topicId: string): Promise<Note[]>;
  saveNote(topicId: string, cycleId: string | null, body: string): Promise<Note>;

  getReviewSchedule(topicId: string): Promise<ReviewSchedule | null>;
  listDueReviews(): Promise<ReviewSchedule[]>;
  scheduleReview(topicId: string, intervalDays: number): Promise<ReviewSchedule>;

  suggestNextTopics(topicId: string): Promise<TopicSuggestion[]>;
}
