import './devtools.js'

export function openDevtools() {
  if (typeof window !== 'undefined' && window.openDevtools) return window.openDevtools()
}
export function closeDevtools() {
  if (typeof window !== 'undefined' && window.closeDevtools) return window.closeDevtools()
}
