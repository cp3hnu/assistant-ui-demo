import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { AISDKToolkit, type FrontendTools } from "@assistant-ui/ai-sdk";
import toolkit from "@/tools";
import { streamText, convertToModelMessages, type UIMessage, stepCountIs } from "ai";

const aiToolkit = new AISDKToolkit({
  toolkit: toolkit
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

  const qwen = createOpenAICompatible({
    name: "qwen",
    apiKey,
    baseURL: process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1"
  });

  const result = streamText({
    model: qwen(process.env.QWEN_MODEL ?? "qwen-plus"),
    messages: await convertToModelMessages(messages),
    system,
    tools: await aiToolkit.tools({ frontend: tools }),
    // DashScope non-standard field; keyed by createOpenAICompatible `name`.
    providerOptions: {
      qwen: {
        enable_thinking: true
      }
    },
    // Continue after the server-side weather tool returns so the model can answer the user.
    stopWhen: stepCountIs(10)
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: error => (error instanceof Error ? error.message : String(error))
  });
}
