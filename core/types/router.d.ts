export interface Route {
  path: string
  component: (params?: Record<string, string>) => any
}
export interface RouterOptions {
  routes: Route[]
  mode?: 'hash' | 'history'
  fallback?: string
  notFound?: () => any
  base?: string
  scrollBehavior?: 'top' | 'restore' | 'none'
}
export declare function createRouter(opts: RouterOptions): {
  path: () => string
  query: () => Record<string, string>
  matched: () => any
  params: () => Record<string, string>
  route: () => Route | null
  push: (to: string) => void
  replace: (to: string) => void
  back: () => void
  forward: () => void
  go: (n: number) => void
  view: () => any
  beforeEach: (fn: (to: string) => boolean | string | void) => void
}
