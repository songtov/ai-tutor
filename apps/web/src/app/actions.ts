"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, type MethodName } from "@/lib/api";

const cyclePath = (topicId: string, cycleId: string) => `/topics/${topicId}/cycles/${cycleId}`;

export async function startCycle(topicId: string, method: MethodName) {
  const cycle = await api.startCycle(topicId, method);
  revalidatePath("/", "layout");
  redirect(cyclePath(topicId, cycle.id));
}

export async function startNewTopic(title: string, parentId: string | null) {
  const topic = await api.createTopic(title, parentId);
  const settings = await api.getSettings();
  await startCycle(topic.id, settings.defaultMethod);
}

export async function goToStage(cycleId: string, index: number) {
  await api.goToStage(cycleId, index);
  revalidatePath("/", "layout");
}

export async function skipStage(cycleId: string) {
  await api.skipStage(cycleId);
  revalidatePath("/", "layout");
}

export async function sendMessage(cycleId: string, content: string) {
  await api.sendMessage(cycleId, content);
  revalidatePath("/", "layout");
}

export async function setMaterialPicked(id: string, picked: boolean) {
  await api.setMaterialPicked(id, picked);
  revalidatePath("/", "layout");
}

export async function submitAttempt(
  cycleId: string,
  answer: { prompt: string; answerText: string | null; photoKeys: string[] },
) {
  await api.submitAttempt(cycleId, answer);
  const cycle = await api.getCycle(cycleId);
  if (cycle && cycle.stages[cycle.currentIndex + 1] === "feedback") {
    await api.goToStage(cycleId, cycle.currentIndex + 1);
  }
  revalidatePath("/", "layout");
}

export async function saveNote(topicId: string, cycleId: string, body: string) {
  await api.saveNote(topicId, cycleId, body);
  revalidatePath("/", "layout");
}

export async function scheduleReview(topicId: string, intervalDays: number) {
  await api.scheduleReview(topicId, intervalDays);
  revalidatePath("/", "layout");
}

export async function startCycleFromForm(topicId: string, formData: FormData) {
  await startCycle(topicId, formData.get("method") as MethodName);
}
