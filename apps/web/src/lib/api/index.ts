import type { ApiClient } from "./client";
import { mockApi } from "./mock";

export const api: ApiClient = mockApi;

export type { ApiClient } from "./client";
export * from "./types";
