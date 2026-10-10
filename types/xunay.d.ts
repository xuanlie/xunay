// xunay 类型声明
export type Signal<T> = {
  (): T
  (v: T | ((prev: T) => T)): T
}
export type Accessor<T> = () => T

export function signal<T>(init: T): Signal<T>
export function computed<T>(fn: () => T): Accessor<T>
export function effect(fn: () => void): () => void
export function batch(fn: () => void): void

export const ELEMENT: unique symbol
export const FRAGMENT: unique symbol

export interface VNode {
  [ELEMENT]: true
  type: string
  props: Record<string, unknown>
  children: unknown[]
}

export type Props = Record<string, unknown>
export type Child = VNode | string | number | boolean | null | (() => unknown)

export function createElement(type: string, props: Props, ...children: Child[]): VNode
export function render(v: unknown): Node
export function mount(comp: () => VNode, target: string | Element): () => void

export function list<T>(
  arr: T[] | Accessor<T[]>,
  keyFn: (item: T) => string | number,
  renderFn: (item: T) => VNode
): () => { __xunay_list: true }

export function show(cond: Accessor<boolean>, renderFn: () => VNode): unknown

export const tags: Record<string, (p: Props | null, ...c: Child[]) => VNode>
export const div: typeof tags.div
export const span: typeof tags.span
export const button: typeof tags.button
export const input: typeof tags.input
export const ul: typeof tags.ul
export const li: typeof tags.li
export const h1: typeof tags.h1

