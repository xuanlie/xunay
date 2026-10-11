import { signal, effect, div, span, mount } from '../../core/src/index.js'
import {
  getChord, progressionToChords, randomProgression,
  notesToFreqs, createSynth,
} from '../../core/src/music.js'

// ============ 状态 ============
const KEY = signal('C')
const MODE = signal('major')
const PROG = signal('I-V-vi-IV')
const activeChord = signal(-1)
const notes = signal([])
const playing = signal(false)

const synth = createSynth({ volume: 0.7 })

// ============ 选项 ============
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const MODES = [
  { id: 'major', label: '大调' },
  { id: 'minor', label: '小调' },
  { id: 'dorian', label: 'Dorian' },
  { id: 'lydian', label: 'Lydian' },
  { id: 'mixolydian', label: 'Mixolydian' },
]
const PROGRESSIONS = [
  { id: 'I-V-vi-IV', label: '流行 1' },
  { id: 'vi-IV-I-V', label: '流行 2' },
  { id: 'ii-V-I', label: '爵士' },
  { id: 'I-vi-ii-V', label: '50 年代' },
  { id: 'I-IV-V', label: '经典' },
  { id: 'i-VI-III-VII', label: '小调' },
]

// ============ 渲染: Chip ============
function renderChips(containerId, items, currentSig, onPick) {
  const el = document.getElementById(containerId)
  el.innerHTML = ''
  items.forEach(item => {
    const id = typeof item === 'string' ? item : item.id
    const label = typeof item === 'string' ? item : item.label
    const chip = document.createElement('div')
    chip.className = 'chip' + (currentSig() === id ? ' on' : '')
    chip.textContent = label
    chip.addEventListener('click', () => {
      currentSig(id)
      onPick?.(id)
      renderChips(containerId, items, currentSig, onPick)
      renderAll()
    })
    el.appendChild(chip)
  })
}

// ============ 渲染: 和弦卡 ============
function getProgressionChords() {
  try {
    return progressionToChords(PROG(), KEY(), MODE())
  } catch (e) {
    console.error('[music] progressionToChords 失败', e)
    return []
  }
}

function renderProgression() {
  const container = document.getElementById('progression')
  container.innerHTML = ''
  const chords = getProgressionChords()
  chords.forEach((c, i) => {
    const card = document.createElement('div')
    card.className = 'chord' + (activeChord() === i ? ' active' : '')
    card.innerHTML = `
      <div class="numeral">${c.numeral}</div>
      <div class="symbol">${c.symbol || '?'}</div>
      <div class="notes">${(c.notes || []).join(' ')}</div>
    `
    card.addEventListener('click', () => {
      synth.resume()
      playChord(c.notes, i)
    })
    container.appendChild(card)
  })
}

// ============ 渲染: 钢琴 ============
function renderPiano() {
  const piano = document.getElementById('piano')
  piano.innerHTML = ''
  const active = notes()
  for (let oct = 4; oct <= 5; oct++) {
    for (const n of ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']) {
      const name = n + oct
      const key = document.createElement('div')
      key.className = 'key' + (active.includes(name) ? ' on' : '')
      key.textContent = n
      piano.appendChild(key)
    }
  }
}

function renderAll() {
  renderProgression()
  renderPiano()
}

// ============ 播放 ============
function playChord(chordNotes, index) {
  activeChord(index)
  const ns = (chordNotes || []).map(n => n.replace(/\d+$/, '') + '4')
  notes(ns)
  renderAll()
  synth.resume()
  const freqs = notesToFreqs(ns)
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i]
    setTimeout(() => synth.tone(f, 1.2, { gain: 0.5 }), i * 30)
  }
}

function playProgression() {
  playing(false)
  synth.resume()
  const chords = getProgressionChords()
  if (chords.length === 0) return

  playing(true)
  const DUR = 900

  chords.forEach((c, i) => {
    setTimeout(() => {
      const ns = (c.notes || []).map(n => n.replace(/\d+$/, '') + '4')
      activeChord(i)
      notes(ns)
      renderAll()
      const freqs = notesToFreqs(ns)
      for (let j = 0; j < freqs.length; j++) {
        const f = freqs[j]
        setTimeout(() => synth.tone(f, DUR / 1000 * 0.85, { gain: 0.5 }), j * 20)
      }
    }, i * DUR)
  })

  setTimeout(() => {
    activeChord(-1)
    notes([])
    playing(false)
    renderAll()
  }, chords.length * DUR + 200)
}

// ============ 初始化 ============
renderChips('keys', KEYS, KEY)
renderChips('modes', MODES, MODE)
renderChips('progressions', PROGRESSIONS, PROG)
renderAll()

document.getElementById('play-btn').addEventListener('click', playProgression)
// 调试: 立即播当前 key 的和弦
document.addEventListener('keydown', (e) => {
  if (e.key === 'p') {
    console.log('当前 key=' + KEY() + ' mode=' + MODE() + ' prog=' + PROG())
    console.log('和弦:', getProgressionChords().map(c => c.symbol).join(' '))
    playProgression()
  }
})

document.getElementById('rand-btn').addEventListener('click', () => {
  KEY(KEYS[Math.floor(Math.random() * KEYS.length)])
  MODE(MODES[Math.floor(Math.random() * MODES.length)].id)
  PROG(PROGRESSIONS[Math.floor(Math.random() * PROGRESSIONS.length)].id)
  renderChips('keys', KEYS, KEY)
  renderChips('modes', MODES, MODE)
  renderChips('progressions', PROGRESSIONS, PROG)
  renderAll()
  playProgression()
})

// 首次用户交互解锁音频
const unlock = () => {
  synth.resume()
  document.removeEventListener('touchstart', unlock)
  document.removeEventListener('click', unlock)
}
document.addEventListener('touchstart', unlock)
document.addEventListener('click', unlock)

window.__demo = { KEY, MODE, PROG, synth, playProgression }
console.log('[music-demo] 挂载 · Tonal + WebAudio')
