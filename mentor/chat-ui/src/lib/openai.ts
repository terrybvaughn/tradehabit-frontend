import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ASSISTANT_ID = process.env.ASSISTANT_ID as string;
export const TOOL_RUNNER_BASE_URL = process.env.TOOL_RUNNER_BASE_URL as string;
// Optional path prefix to target different backends (e.g., "/api/mentor" vs "")
const rawPrefix = (process.env.TOOL_RUNNER_PATH_PREFIX ?? "/api/mentor") as string;
// Normalize: strip trailing slashes; keep empty string if provided
export const TOOL_RUNNER_PATH_PREFIX = rawPrefix.replace(/\/+$/, "");

export function buildToolRunnerUrl(functionName: string): string {
  const prefix = TOOL_RUNNER_PATH_PREFIX ? `${TOOL_RUNNER_PATH_PREFIX}` : "";
  return `${TOOL_RUNNER_BASE_URL}${prefix}/${functionName}`;
}

if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
if (!ASSISTANT_ID) throw new Error("Missing ASSISTANT_ID env var");
if (!TOOL_RUNNER_BASE_URL) throw new Error("Missing TOOL_RUNNER_BASE_URL env var");