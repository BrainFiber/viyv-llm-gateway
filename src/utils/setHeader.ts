// src/utils/setHeader.ts
export function setHeader(
    init: RequestInit,
    key: string,
    value: string
  ): void {
    if (!init.headers) {
      init.headers = { [key]: value }
      return
    }
    if (init.headers instanceof Headers) {
      init.headers.set(key, value)
    } else if (Array.isArray(init.headers)) {
      init.headers.push([key, value])
    } else {
      ;(init.headers as Record<string, string>)[key] = value
    }
  }