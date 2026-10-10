import { Signal } from './index'

export interface JoystickOpts {
  size?: number
  knobSize?: number
  color?: string
  container?: HTMLElement
  zIndex?: number
}
export interface VirtualJoystick {
  vector: Signal<[number, number]>
  active: Signal<boolean>
  show(): void
  hide(): void
  dispose(): void
}
export function createVirtualJoystick(opts?: JoystickOpts): VirtualJoystick

export interface Haptics {
  light(): void
  medium(): void
  heavy(): void
  custom(pattern: number | number[]): void
  readonly supported: boolean
}
export function createHaptics(): Haptics

export function lockOrientation(mode?: 'landscape' | 'portrait' | 'any'): Promise<boolean>
export function unlockOrientation(): void
export function preventGestures(target?: HTMLElement): () => void
export function safeArea(): { top: number, bottom: number, left: number, right: number }
export function applyMobileDefaults(opts?: { iosFullscreen?: boolean }): void
export function deviceInfo(): {
  mobile: boolean
  ios: boolean
  android: boolean
  touch: boolean
  dpr: number
  width: number
  height: number
  orientation: 'landscape' | 'portrait'
}
