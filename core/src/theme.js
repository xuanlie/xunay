// XuNay Theme · 主题切换
import { signal, effect } from './core.js'

export function createTheme(opts = {}) {
  const {
    themes = ['light', 'dark'],
    default: def = 'light',
    storageKey = 'xunay:theme',
    attribute = 'data-theme',
    persist = true,
  } = opts

  let saved = def
  if (typeof localStorage !== 'undefined') {
    saved = localStorage.getItem(storageKey) || def
    // 跟随系统
    if (!localStorage.getItem(storageKey) && typeof matchMedia !== 'undefined') {
      saved = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  }

  const themeSig = signal(saved)

  function apply(t) {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute(attribute, t)
    if (t === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  function set(t) {
    themeSig(t)
    apply(t)
    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, t)
    }
  }

  // 初始应用
  apply(saved)

  // 系统主题变化
  if (typeof matchMedia !== 'undefined') {
    try {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (persist && localStorage.getItem(storageKey)) return
        set(e.matches ? 'dark' : 'light')
      })
    } catch {}
  }

  return {
    theme: () => themeSig(),
    set,
    toggle() { set(themeSig() === 'dark' ? 'light' : 'dark') },
    isDark: () => themeSig() === 'dark',
    isLight: () => themeSig() === 'light',
    available: themes,
  }
}

export const theme = createTheme()
export default theme
