/**
 * Clarify when to use `present` vs plain text — especially for models that
 * invent XML UI DSLs instead of calling the tool (or instead of answering in text).
 */
export const PRESENT_SYSTEM_INSTRUCTIONS = `
UI rendering rules:
- Most answers should be ordinary plain text (or markdown). Do not call \`present\` for simple explanations, chat, or short replies.
- Only call \`present\` when a structured visual layout clearly helps (cards, fact lists, tables, charts, dashboards, comparison boards).
- When you do use UI: call the \`present\` tool with a JSON tree. Each node has "$type" plus props; nest with "children".
- Never invent XML/HTML UI markup in your text reply (e.g. <response>, <view>, <col>, <header>, <fact>, <divider>). That is not rendered. Either use \`present\` with JSON, or just write normal text.
`.trim();
