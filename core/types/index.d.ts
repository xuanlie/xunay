export type Signal<T> = { (): T; (v: T | ((prev: T) => T)): T }
export interface SignalOptions<T> { equals?: (a: T, b: T) => boolean }

export function signal<T>(init: T, opts?: SignalOptions<T>): Signal<T>
export function computed<T>(fn: () => T): (() => T) & { dispose(): void }
export function effect(fn: () => void): () => void
export function batch(fn: () => void): void
export function untrack<T>(fn: () => T): T
export function onCleanup(fn: () => void): void

export function createElement(type: string, props?: any, ...children: any[]): any
export function createFragment(children: any[]): any
export function tag(name: string): (props?: any, ...children: any[]) => any
export const tags: Record<string, (props?: any, ...children: any[]) => any>
export function registerTags(names: string | string[]): string[]

export function render(vnode: any): Node
export function mount(comp: () => any, target: string | Element): () => void
export function list<T>(arr: T[] | (() => T[]), keyFn: (t: T) => any, renderFn: (t: T) => any): any
export function show(cond: (() => boolean) | boolean, renderFn: () => any): any
export function frag(...children: any[]): any
export function txt(strings: TemplateStringsArray, ...values: any[]): () => string

export function onMount(fn: () => void): void
export function onUnmount(fn: () => void): void
export function ref<T>(init?: T): (v?: T) => T

export function createRuntime(): any
export function setRuntime(rt: any): void
export function withRuntime<T>(rt: any, fn: () => T): T
export function resetRuntime(): void
