# viyv-llm-gateway

<p align="center">
  <img src="https://raw.githubusercontent.com/BrainFiber/.assets/main/viyv.svg" width="120" alt="viyv logo"/>
</p>

Edge‑friendly reverse proxy that hides your LLM API keys and lets you route requests to **OpenAI / Google Gemini / Anthropic** (or any other provider) with a single, stable URL.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) 
[![Bun](https://img.shields.io/badge/Bun-v1.1+-black?logo=bun)](https://bun.sh) 
[![CI](https://github.com/BrainFiber/viyv-llm-gateway/actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

---

## ✨ Features

| Capability | Details |
|-------------|---------|
| **🔑 Key injection** | Your client never sees the real provider key – the gateway adds it at runtime. |
| **📡 Multi‑provider** | Built‑in adapters for `openai`, `gemini`, `anthropic`. Add more in **1 block of YAML/TypeScript**. |
| **⚡ Edge‑ready** | Runs on Bun, Node 18+, Cloudflare Workers, Deno, Vercel Edge – same code, no tweak. |
| **🌀 Streaming pass‑through** | Server‑Sent Events & chunked encoding are forwarded as‑is. |
| **🗜 Transparent gzip/deflate** | Automatically strips `Content‑Encoding` so Python HTTPX & cURL both work. |
| **🔒 Minimal attack surface** | No business logic, no DB, only HTTP → HTTP(s) with optional token gate. |

---

## 📂 Directory structure

```
viyv-llm-gateway/
├─ src/
│  ├─ server.ts          # Hono entry – routing + proxy logic
│  ├─ providers.ts       # Provider definitions (base URL & key injection)
│  └─ utils/
│     └─ setHeader.ts    # Safe header‑setter helper
├─ .env.example          # Environment variable template
├─ bunfig.toml           # Bun hot‑reload settings (optional)
├─ tsconfig.json         # TypeScript options
├─ package.json          # name = viyv-llm-gateway
├─ Dockerfile            # Lightweight deployment image
└─ LICENSE               # MIT
```

---

## 🚀 Quick Start (local)

```bash
# 1. Clone
$ git clone https://github.com/BrainFiber/viyv-llm-gateway.git
$ cd viyv-llm-gateway

# 2. Install deps (Bun 1.1+)
$ bun install

# 3. Configure env
$ cp .env.example .env
$ $EDITOR .env   # paste your provider keys

# 4. Run with hot‑reload
$ bun run dev        # default: http://localhost:3000
```

<details>
<summary>🏗 Bun installation</summary>

```bash
# Homebrew (Apple Silicon / Intel)
brew tap oven-sh/bun
brew install bun

# or official script
curl -fsSL https://bun.sh/install | bash
```
</details>

---

## 🐳 Docker

```bash
$ docker build -t viyv-llm-gateway .
$ docker run -d --name gateway -p 3000:3000 --env-file .env viyv-llm-gateway
```

---

## 🌐 Cloudflare Workers (optional)

> Workers use the same `src/server.ts`. Install `wrangler`, add `wrangler.toml`, then:
>
> ```bash
> wrangler deploy
> ```

---

## 🔧 Environment variables

| Name | Required | Example | Purpose |
|------|----------|---------|---------|
| `INTERNAL_TOKEN` | ✅ | `changeme` | Requests **must** include `x‑internal-token` header with this value (set header gate `// app.use` block to enable). |
| `OPENAI_API_KEY` | ⚠️ when using `openai` | `sk‑…` | Auth header for OpenAI. |
| `GOOGLE_API_KEY` | ⚠️ when using `gemini` | `AIza…` | URL query param key for Gemini. |
| `ANTHROPIC_API_KEY` | ⚠️ when using `anthropic` | `sk‑…` | Header `x-api-key` for Anthropic. |

> *Tip*: export them in `.env` and **never** commit that file.

---

## 🏁 Usage examples

### curl via gateway

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-internal-token: changeme" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'
```

### OpenAI Python SDK

```python
import openai

openai.base_url = "http://localhost:3000/openai"
openai.api_key = "changeme"  # internal token or any dummy string

print(openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "こんにちは"}]
).choices[0].message.content)
```

---

## ➕ Adding a new provider

1. Edit `src/providers.ts` and add:
   ```ts
   myllm: {
     base: 'https://api.my‑llm.com',
     inject: (init) => {
       setHeader(init, 'Authorization', `Bearer ${process.env.MYLLM_KEY!}`)
     }
   }
   ```
2. Add `MYLLM_KEY=…` to `.env`.
3. Restart: `/myllm/...` now proxies to your custom endpoint.

---

## 🛠 Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Connection refused → api.openai.com` | Host header forwarded as `localhost` | use the latest **server.ts** (strips host). |
| `DecodingError: incorrect header check` (Python HTTPX) | `Content‑Encoding: gzip` kept after Bun auto‑decompress | gateway now deletes `content-encoding`. |
| Gateway returns `Unknown provider` | Path prefix not in `PROVIDERS` | Add provider block or use correct prefix. |

---

## 🔮 Roadmap

- [ ] Rate‑limit & quota middleware (Redis / KV)
- [ ] Prometheus metrics endpoint `/metrics`
- [ ] JWT‑based multi‑tenant auth
- [ ] GitHub Action for automatic Bun → Docker multi‑arch build

---

## 🤝 Contributing

1. Fork & clone
2. `bun install`
3. Create a feature branch (`git checkout -b feat/awesome-feature`)
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/) style
5. Open a Pull Request – ensure `bun test` & ESLint pass

All constructive PRs and issues are welcome ♥

---

## 📝 License

MIT © 2025 BrainFiber Inc. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

Built with ❤️ using:

- [Bun](https://bun.sh)
- [Hono](https://hono.dev)
- Provider SDKs & public APIs of OpenAI, Google, Anthropic.

> This project is **not** affiliated with or endorsed by the providers above.

