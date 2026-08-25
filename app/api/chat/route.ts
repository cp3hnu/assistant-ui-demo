import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/ai-sdk";
import { type JSONSchema7, streamText, convertToModelMessages, type UIMessage } from "ai";

export async function POST(req: Request) {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Missing DASHSCOPE_API_KEY. Add it to .env.local and restart the development server.",
      },
      { status: 500 },
    );
  }

  const {
    messages,
    system,
    tools,
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
  } = await req.json();

  const qwen = createOpenAI({
    name: "qwen",
    apiKey,
    // Configure a workspace-specific endpoint with DASHSCOPE_BASE_URL when available.
    baseURL: process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });

  const result = streamText({
    // DashScope provides an OpenAI-compatible Chat Completions endpoint.
    model: qwen.chat(process.env.QWEN_MODEL ?? "qwen-plus"),
    messages: await convertToModelMessages(messages),
    system,
    tools: {
      ...frontendTools(tools ?? {}),
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: (error) => (error instanceof Error ? error.message : String(error)),
  });
}
