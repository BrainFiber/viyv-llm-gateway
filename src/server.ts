import { Hono } from 'hono'
import { PROVIDERS } from './providers'
import { setHeader } from './utils/setHeader'   // ＊ヘルパがある前提

const app = new Hono()

// ───────────────────────────────────────────
// /{provider}/* を外部へパススルー
app.all('/:provider/*', async (c) => {
  const { provider } = c.req.param()
  const cfg = PROVIDERS[provider]
  if (!cfg) return c.text('Unknown provider', 404)

  // ① 転送先 URL
  const incoming = new URL(c.req.url)
  const pathAfterProvider = incoming.pathname.replace(`/${provider}`, '')
  const dst = new URL(pathAfterProvider, cfg.base)
  dst.search = incoming.search

  // ② アウトバウンドヘッダーを再構築
  const outboundHeaders = new Headers()
  for (const [k, v] of c.req.raw.headers) {
    if (
      k === 'host' ||
      k === 'content-length' ||
      k === 'x-internal-token'
    )
      continue
    outboundHeaders.set(k, v)
  }

  const init: RequestInit & { duplex?: 'half' } = {
    method: c.req.method,
    headers: outboundHeaders,
    body: c.req.raw.body,
    duplex: 'half',
  }

  // ③ API キーを注入
  cfg.inject(init, dst)

  const resp = await fetch(dst, init)

  // ④ Bun/Node が自動展開した場合 `Content-Encoding` を落とす
  const stripped = new Headers(resp.headers)
  stripped.delete('content-encoding')
  stripped.delete('content-length')

  // ⑤ クライアントへそのままストリーム返却
  return new Response(resp.body, {
    status: resp.status,
    headers: stripped,
  })
})

export default app