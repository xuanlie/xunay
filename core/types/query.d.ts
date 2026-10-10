export interface QueryOptions<T> {
  key: string | any
  fetcher: (ctx: { signal?: AbortSignal }) => Promise<T>
  staleTime?: number
  cacheTime?: number
  retry?: number
  retryDelay?: number
  enabled?: boolean
  initial?: T
  onSuccess?: (data: T) => void
  onError?: (err: any) => void
}
export interface QueryResult<T> {
  data: () => T
  error: () => any
  loading: () => boolean
  fetchedAt: () => number
  isStale: () => boolean
  refetch: () => Promise<T>
  invalidate: () => void
  setData: (v: T) => void
  key: string
}
export declare function query<T>(opts: QueryOptions<T>): QueryResult<T>
export declare function invalidateQueries(prefix?: string): void
export declare function clearQueryCache(): void
