import type { Signal } from './index'
export interface PersistOptions<T> {
  key?: string
  storage?: 'local' | 'session' | 'memory'
  serializer?: (v: any) => string
  deserializer?: (s: string) => any
  ttl?: number
  prefix?: string
  migrate?: (v: any) => T
}
export declare function persist<T>(init: T, opts?: PersistOptions<T> | string): Signal<T>
export declare function persistWithMigration<T>(init: T, opts?: PersistOptions<T> & { version?: number, migrations?: Record<string, (v: any) => any> }): Signal<T>
