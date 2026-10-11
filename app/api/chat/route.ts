import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { AISDKToolkit, type FrontendTools } from "@assistant-ui/ai-sdk";
import toolkit from "@/tools";
import { PRESENT_SYSTEM_INSTRUCTIONS } from "@/lib/present-instructions";
import { streamText, convertToModelMessages, type UIMessage, stepCountIs } from "ai";

const aiToolkit = new AISDKToolkit({
  toolkit: toolkit
});

const mergeSystem = (system?: string) =>
  [PRESENT_SYSTEM_INSTRUCTIONS, system?.trim()].filter(Boolean).join("\n\n");

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

  const aiSDKTools = await aiToolkit.tools({ frontend: tools });

  const result = streamText({
    model: qwen(process.env.QWEN_MODEL ?? "qwen-plus"),
    messages: await convertToModelMessages(messages, { tools: aiSDKTools }),
    system: mergeSystem(system),
    tools: aiSDKTools,
    // DashScope non-standard field; keyed by createOpenAICompatible `name`.
    providerOptions: {
      qwen: {
        enable_thinking: true
      }
    },
    // Continue after tool results so the model can answer / call present.
    stopWhen: stepCountIs(10)
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: error => (error instanceof Error ? error.message : String(error))
  });
}
