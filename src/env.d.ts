import 'vite/client'
import 'vitest'

export interface SeaDefines {
  VERSION: string
}

declare global {
  const VERSION: string
}
