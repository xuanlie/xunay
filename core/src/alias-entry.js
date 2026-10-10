import { signal, computed, effect, batch } from './core.js'
import { mount, list } from './render.js'
export const s = signal, c = computed, f = effect, bat = batch, m = mount, app = mount, l = list, each = list
export function alias(n, fn) { if (typeof globalThis !== 'undefined') globalThis[n] = fn }
