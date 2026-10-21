"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, type NoteDoc } from "@/lib/api";

const refresh = () => revalidatePath("/", "layout");

export async function openNote(title: string) {
  const topic = (await api.findTopicByTitle(title)) ?? (await api.createTopic(title));
  refresh();
  redirect(`/notes/${topic.id}`);
}

export async function saveNote(topicId: string, doc: NoteDoc) {
  await api.saveNote(topicId, doc);
  refresh();
}

export async function suggestCues(topicId: string) {
  return api.suggestCues(topicId);
}

export async function submitAttempt(topicId: string, answers: { cueId: string; text: string }[]) {
  const feedback = await api.submitAttempt(topicId, answers);
  refresh();
  return feedback;
}

export async function scheduleReview(topicId: string, intervalDays: number) {
  await api.scheduleReview(topicId, intervalDays);
  refresh();
}

export async function findMaterials(topicId: string) {
  await api.findMaterials(topicId);
  refresh();
}

export async function saveMaterial(id: string) {
  await api.saveMaterial(id);
  refresh();
}

export async function askQuestion(topicId: string, quote: string | null, question: string) {
  await api.askQuestion(topicId, quote, question);
  refresh();
}

export async function renameNote(topicId: string, title: string): Promise<string | null> {
  try {
    await api.renameTopic(topicId, title);
  } catch (error) {
    return error instanceof Error ? error.message : "Couldn't rename the note.";
  }
  refresh();
  return null;
}
