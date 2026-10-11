# My Assistant

Personal assistant app built with [assistant-ui](https://www.assistant-ui.com) and Next.js.

## Getting Started

### 1. Environment

Copy `.env.example` to `.env.local` and set your DashScope key plus database URL:

```
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://postgres:postgres@localhost:5437/assistant_ui
```

The app uses Qwen's OpenAI-compatible Chat Completions endpoint and defaults to
`qwen-plus`. Optional:

```
QWEN_MODEL=qwen-plus
DASHSCOPE_BASE_URL=https://YOUR_WORKSPACE_ID.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
```

### 2. Local Postgres (Docker)

Postgres listens on host port **5437** (mapped to container `5432`) so it does not
collide with other local Postgres instances.

```bash
docker compose up -d
npm run db:migrate
```

### 3. Dev server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Chat history persistence

Threads and messages are stored in Postgres via assistant-ui's
`RemoteThreadListAdapter` + `ThreadHistoryAdapter` (AI SDK `ai-sdk/v6` format).

Verify:

1. Start a chat, send a message, wait for a reply (title may auto-generate).
2. Refresh the page — the thread stays in the sidebar and messages reload.
3. Delete a thread from the sidebar — it disappears and does not return after refresh.

Useful commands:

```bash
npm run db:generate   # after schema changes
npm run db:migrate
npm run db:studio     # optional Drizzle Studio
```
