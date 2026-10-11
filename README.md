# My Assistant

Personal assistant app built with [assistant-ui](https://www.assistant-ui.com) and Next.js.

## Getting Started

Add your Alibaba Cloud Model Studio (DashScope) API key to `.env.local`:

```
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The app uses Qwen's OpenAI-compatible Chat Completions endpoint and defaults to
`qwen-plus`. To use a different Qwen model or the recommended workspace-specific
endpoint, add these optional settings:

```
QWEN_MODEL=qwen-plus
DASHSCOPE_BASE_URL=https://YOUR_WORKSPACE_ID.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.
