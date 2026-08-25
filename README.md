This is the [assistant-ui](https://github.com/assistant-ui/assistant-ui) starter project.

## Getting Started

First, add your Alibaba Cloud Model Studio (DashScope) API key to `.env.local`:

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

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
