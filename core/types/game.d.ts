import { Signal } from './index'

export interface GameLoopOpts {
  fixedStep?: number
  maxDelta?: number
  onFixed?: (step: number, elapsed: number) => void
  onRender?: (dt: number, elapsed: number) => void
}
export interface GameLoop {
  start(): void
  stop(): void
  readonly running: boolean
  readonly elapsed: number
}
export function createGameLoop(opts?: GameLoopOpts): GameLoop

export interface FollowCameraOpts {
  stiffness?: number
  offset?: [number, number, number]
  lerpTarget?: boolean
  node?: { position: { x: number, y: number, z: number } }
}
export function createFollowCamera(camera: any, opts?: FollowCameraOpts): {
  snap(): void
  update(dt: number): void
}

export interface InputOpts {
  keyMap?: Record<string, [number, number]>
  joystick?: Signal<[number, number]>
  deadzone?: number
  listenKeyboard?: boolean
  preventDefault?: boolean
}
export function createInput(opts?: InputOpts): {
  keys: Record<string, boolean>
  readonly vector: [number, number]
  isDown(key: string): boolean
}

export function createStateMachine<T extends string>(
  initial: T,
  transitions?: Partial<Record<T, { enter?: (prev: T, next: T) => void, exit?: (next: T, prev: T) => void }>>
): {
  state: Signal<T>
  get(): T
  is(s: T): boolean
  goto(s: T): void
  on(evt: string, fn: Function): () => void
  history(): T[]
}

export interface TimerOpts {
  duration?: number
  countdown?: boolean
  onEnd?: () => void
}
export function createTimer(opts?: TimerOpts): {
  time: Signal<number>
  running: Signal<boolean>
  start(): void
  stop(): void
  reset(): void
  update(dt: number): void
}

export interface ScoreOpts {
  key?: string
  initial?: number
}
export function createScore(opts?: ScoreOpts): {
  score: Signal<number>
  best: Signal<number>
  add(n: number): void
  set(n: number): void
  reset(): void
  commit(): boolean
}

export function createPool<T>(opts: {
  factory: () => T
  reset?: (o: T) => void
  size?: number
}): {
  acquire(): T
  release(obj: T): void
  readonly activeCount: number
  readonly freeCount: number
  forEach(fn: (o: T) => void): void
  clear(): void
}

export function createSpawner<T>(opts: {
  interval?: number
  max?: number
  spawn: () => T
  despawn?: (o: T) => void
}): {
  update(dt: number): void
  remove(item: T): void
  readonly list: T[]
  reset(): void
}

export function collide2D(a: { x: number, z: number }, b: { x: number, z: number }, radius?: number): boolean

export interface LoadingOpts {
  steps?: Array<string | { label: string, run: () => Promise<void> } | (() => Promise<void>)>
}
export function createLoading(opts?: LoadingOpts): {
  progress: Signal<number>
  current: Signal<string>
  done: Signal<boolean>
  run(): Promise<void>
  bindDOM(barId: string, textId: string): void
}
