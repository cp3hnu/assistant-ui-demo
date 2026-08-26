import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/ai-sdk";
import { getWeather } from "@/lib/weather";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  type UIMessage,
  jsonSchema,
  stepCountIs,
  tool,
} from "ai";

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
      get_weather: tool({
        description:
          "获取指定城市或地区的实时天气。用户询问当前、今天或此刻的天气、温度、降雨或风力时调用。location 必须是明确的城市或地区名称；不要臆测天气。",
        inputSchema: jsonSchema<{ location: string }>({
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "要查询天气的城市或地区名称，例如：北京、上海浦东、Tokyo。",
            },
          },
          required: ["location"],
          additionalProperties: false,
        }),
        execute: getWeather,
      }),
    },
    // Continue after the server-side weather tool returns so the model can answer the user.
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: (error) => (error instanceof Error ? error.message : String(error)),
  });
}
