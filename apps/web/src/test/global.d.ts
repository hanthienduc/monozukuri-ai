/// <reference types="vitest/globals" />

import { vi } from 'vitest'

declare global {
  const beforeAll: typeof vi.beforeAll
  const afterAll: typeof vi.afterAll
  const beforeEach: typeof vi.beforeEach
  const afterEach: typeof vi.afterEach
  const describe: typeof vi.describe
  const it: typeof vi.it
  const test: typeof vi.test
  const expect: typeof vi.expect
  const vi: typeof import('vitest').vi
  
  namespace NodeJS {
    interface Global {
      fetch: typeof fetch
      URL: typeof URL
      structuredClone: typeof structuredClone
    }
  }
}