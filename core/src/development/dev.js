const events = []
const MAX = 200
let on = false
export function enableDevtool() { on = true }
export function disableDevtool() { on = false }
export function recordEvent(t, d) { if (!on) return; events.push({ type: t, data: d, time: performance.now() }); if (events.length > MAX) events.shift() }
export function getEvents() { return events.slice() }
export function clearEvents() { events.length = 0 }
if (typeof window !== 'undefined') window.__XUNAY_DEVTOOL__ = { enableDevtool, disableDevtool, getEvents, clearEvents }
