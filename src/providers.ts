import { setHeader } from './utils/setHeader'

export type Provider = {
  base: string
  inject: (init: RequestInit, url: URL) => void
}

export const PROVIDERS: Record<string, Provider> = {
  openai: {
    base: 'https://api.openai.com',
    inject: (init) => {
      setHeader(
        init,
        'Authorization',
        `Bearer ${process.env.OPENAI_API_KEY!}`
      )
    }
  },
  gemini: {
    base: 'https://generativelanguage.googleapis.com',
    inject: (_init, url) => {
      url.searchParams.set('key', process.env.GOOGLE_API_KEY!)
    }
  },
  anthropic: {
    base: 'https://api.anthropic.com',
    inject: (init) => {
      setHeader(
        init,
        'x-api-key',
        process.env.ANTHROPIC_API_KEY!
      )
    }
  }
}