# LLM-powered interpretations

Backend now tries to generate spread interpretations through an OpenAI-compatible API.
If no API key is configured, or if the request fails, the app automatically falls back to the local rule-based interpretation.

## Quick setup with OpenRouter

Create `apps/api/.env` from `apps/api/.env.example` and add:

```env
OPENROUTER_API_KEY=your_key_here
LLM_MODEL=openai/gpt-4o-mini
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_SITE_URL=http://localhost:5173
LLM_APP_NAME=Tarot App
```

Then restart the API:

```bash
npm --workspace apps/api run start:dev
```

## Test

```bash
curl -X POST http://localhost:3000/api/tarot/interpretation \
  -H "Content-Type: application/json" \
  -d '{"spread":[],"type":"classic3","tone":"psychological"}'
```

A generated LLM response includes:

```json
"provider": "llm"
```

Fallback responses include:

```json
"provider": "rule-based"
```
