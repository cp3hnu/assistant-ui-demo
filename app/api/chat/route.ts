import { createOpenAI } from "@ai-sdk/openai";
import { AISDKToolkit, type FrontendTools } from "@assistant-ui/ai-sdk";
import weatherToolkit from "@/lib/weather-toolkit";
import { streamText, convertToModelMessages, type UIMessage, stepCountIs } from "ai";
import toolkit from "@/lib/toolkit";

const aiToolkit = new AISDKToolkit({
  toolkit: {
    ...toolkit,
    ...weatherToolkit
  }
});

export async function POST(req: Request) {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error: "Missing DASHSCOPE_API_KEY. Add it to .env.local and restart the development server."
      },
      { status: 500 }
    );
  }

  const {
    messages,
    system,
    tools
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: FrontendTools;
  } = await req.json();

  const qwen = createOpenAI({
    name: "qwen",
    apiKey,
    // Configure a workspace-specific endpoint with DASHSCOPE_BASE_URL when available.
    baseURL: process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1"
  });

  const result = streamText({
    // DashScope provides an OpenAI-compatible Chat Completions endpoint.
    model: qwen.chat(process.env.QWEN_MODEL ?? "qwen-plus"),
    messages: await convertToModelMessages(messages),
    system,
    tools: await aiToolkit.tools({ frontend: tools }),
    // Continue after the server-side weather tool returns so the model can answer the user.
    stopWhen: stepCountIs(10)
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: error => (error instanceof Error ? error.message : String(error))
  });
}
