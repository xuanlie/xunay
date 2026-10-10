// XuNay × Tonal 乐理集成
// Tonal 用命名空间风格: Chord.get('Cmaj7'), Scale.get('C major')
// 我们用 @tonaljs/* 子模块精确 import (tree-shaking 更好)
import * as Note from '@tonaljs/note'
import * as Chord from '@tonaljs/chord'
import * as Scale from '@tonaljs/scale'
import * as Interval from '@tonaljs/interval'
import * as Key from '@tonaljs/key'
import * as Progression from '@tonaljs/progression'
import * as RomanNumeral from '@tonaljs/roman-numeral'
import * as Midi from '@tonaljs/midi'
import * as Range from '@tonaljs/range'
import * as ChordType from '@tonaljs/chord-type'
import * as ScaleType from '@tonaljs/scale-type'
import { signal } from './core.js'

// ============================================================
// 1. re-export Tonal 命名空间
// ============================================================
export { Note, Chord, Scale, Interval, Key, Progression, RomanNumeral, Midi, Range, ChordType, ScaleType }

// ============================================================
// 2. 顶层便捷函数
// ============================================================
export const transpose = (note, interval) => Note.transpose(note, interval)
export const noteName = (note) => Note.get(note).name
export const noteFreq = (note) => Note.freq(note)
export const noteMidi = (note) => Note.midi(note)
export const freqToMidi = (freq) => Midi.freqToMidi(freq)
export const midiToFreq = (midi) => Midi.midiToFreq(midi)
export const midiToNote = (midi) => Midi.midiToNoteName(midi)

// ============================================================
// 3. 音阶 / 和弦
// ============================================================
export const CHORD_TYPES = [
  'maj', 'min', 'dim', 'aug', 'sus2', 'sus4',
  'maj7', 'min7', '7', 'dim7', 'm7b5',
  'maj9', 'min9', '9', '11', '13',
  'add9', '6', 'm6',
]

export const SCALE_MODES = [
  'major', 'minor', 'harmonic minor', 'melodic minor',
  'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian',
  'major pentatonic', 'minor pentatonic', 'blues',
  'whole tone', 'chromatic',
]

// 音阶音符
export function getScale(root, mode = 'major', octave = 4) {
  const s = Scale.get(root + octave + ' ' + mode)
  return s.notes || []
}

// 和弦音符
export function getChord(root, type = 'maj', octave = 4) {
  const c = Chord.get(root + type)
  if (!c || !c.notes) return []
  return c.notes.map(n => n.replace(/\d+$/, '') + octave)
}

// 和弦名 (展示用)
export function chordName(root, type = 'maj') {
  return root + (type === 'maj' ? '' : type)
}

// 和弦全名
export function chordFullName(root, type = 'maj') {
  const c = Chord.getChord(type, root)
  return c.name || chordName(root, type)
}

// 音符名 (统一格式: C4, D#4, Eb4)
export function normalizeNote(n) {
  const info = Note.get(n)
  return info.name || n
}

// 音高类 (C, D#, Eb)
export function pitchClass(n) {
  return Note.pitchClass(n)
}

// ============================================================
// 4. 和弦进行
// ============================================================

// 罗马数字 → 和弦数组
// 'I-V-vi-IV' in C major → [{symbol:'C', notes:['C4','E4','G4']}, {symbol:'G', ...}, ...]
// 罗马数字 → 音阶度数 (0-based), 不依赖 Tonal 的 RomanNumeral API
const ROMAN_MAP = {
  'I':0, 'i':0,
  'II':1, 'ii':1,
  'III':2, 'iii':2,
  'IV':3, 'iv':3,
  'V':4, 'v':4,
  'VI':5, 'vi':5,
  'VII':6, 'vii':6, 'vii°':6, 'viio':6,
}

export function progressionToChords(progression, keyRoot = 'C', mode = 'major') {
  // DEBUG
  try {
    const mk = Key.majorKey(keyRoot)
    const mk2 = Key.minorKey(keyRoot)
    if (typeof window !== 'undefined') {
      window.__musicDebug = { majorKey: mk, minorKey: mk2 }
    }
  } catch(e) {}
  const numerals = typeof progression === 'string'
    ? progression.split('-').map(s => s.trim())
    : progression

  let chordsInKey
  try {
    if (mode.startsWith('min')) {
      chordsInKey = Key.minorKey(keyRoot).natural.chords
    } else {
      chordsInKey = Key.majorKey(keyRoot).chords
    }
  } catch (e) {
    return []
  }

  if (!Array.isArray(chordsInKey) || chordsInKey.length === 0) return []

  return numerals.map(num => {
    const idx = ROMAN_MAP[num]
    if (idx === undefined || idx >= chordsInKey.length) {
      return { numeral: num, symbol: '', notes: [], type: '' }
    }
    const chordSymbol = chordsInKey[idx]
    const info = Chord.get(chordSymbol)
    return {
      numeral: num,
      symbol: chordSymbol,
      notes: info.notes || [],
      type: info.type || '',
    }
  })
}

// 和弦符号数组 → 音符数组
export function chordsToNotes(chordNames, octave = 4) {
  return chordNames.map(name => {
    const c = Chord.get(name)
    return (c.notes || []).map(n => n.replace(/\d+$/, '') + octave)
  })
}

// 随机和弦进行
export function randomProgression(opts = {}) {
  const length = opts.length ?? 4
  const pool = opts.pool ?? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
  const result = []
  for (let i = 0; i < length; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return result
}

// ============================================================
// 5. 转调 / 移调
// ============================================================
export function transposeNotes(notes, interval) {
  return notes.map(n => Note.transpose(n, interval)).filter(Boolean)
}

// 音符数组 → 频率数组 (Hz)
export function notesToFreqs(notes) {
  return notes.map(n => {
    const f = Note.freq(n)
    return f || null
  }).filter(Boolean)
}

// 和弦 → 频率
export function chordToFreqs(chordName, octave = 4) {
  const c = Chord.get(chordName)
  return notesToFreqs((c.notes || []).map(n => n.replace(/\d+$/, '') + octave))
}

// ============================================================
// 6. 响应式: 音乐状态
// ============================================================
export function createMusicState(opts = {}) {
  const key = signal(opts.key || 'C')
  const mode = signal(opts.mode || 'major')
  const octave = signal(opts.octave ?? 4)
  const chordType = signal(opts.chordType || 'maj')

  return {
    key, mode, octave, chordType,
    get scale() { return getScale(key(), mode(), octave()) },
    chordAt(root) { return getChord(root || key(), chordType(), octave()) },
    progression(prog) { return progressionToChords(prog, key(), mode()) },
  }
}

// ============================================================
// 7. 与 Web Audio 集成 — 播放音符/和弦
// ============================================================
export function createSynth(opts = {}) {
  let ctx = null
  let master = null
  const volume = signal(opts.volume ?? 0.7)

  function ensure() {
    if (ctx) return ctx
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = volume()
    master.connect(ctx.destination)
    // 立刻尝试 resume
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    // 监听 volume
    setInterval(() => { if (master) master.gain.value = volume() }, 50)
    return ctx
  }

  // 播放一个频率 (秒)
  function tone(freq, duration = 0.5, opts = {}) {
    ensure()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = opts.type || 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(opts.gain ?? 0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(master)
    osc.start()
    osc.stop(ctx.currentTime + duration + 0.05)
    return { osc, gain }
  }

  // 播放和弦 (多音符同时)
  function chordPlay(notes, duration = 1.0, opts = {}) {
    const freqs = notesToFreqs(notes)
    return freqs.map(f => tone(f, duration, opts))
  }

  // 播放进行 (顺序)
  async function playProgression(prog, keyRoot, mode, chordDur = 0.8) {
    const chords = progressionToChords(prog, keyRoot, mode)
    for (const c of chords) {
      const notes = (c.notes || []).map(n => n.replace(/\d+$/, '') + '4')
      chordPlay(notes, chordDur * 0.9)
      await new Promise(r => setTimeout(r, chordDur * 1000))
    }
    return chords
  }

  return {
    volume,
    tone, chord: chordPlay, playProgression,
    get ctx() { return ensure() },
    resume() {
      ensure()
      if (ctx.state === 'suspended') return ctx.resume()
      return Promise.resolve()
    },
  }
}

export default {
  // Tonal 命名空间
  Note, Chord, Scale, Interval, Key, Progression, RomanNumeral, Midi, Range,
  // 便捷
  transpose, noteName, noteFreq, noteMidi, freqToMidi, midiToFreq, midiToNote,
  CHORD_TYPES, SCALE_MODES,
  getScale, getChord, chordName, chordFullName, normalizeNote, pitchClass,
  progressionToChords, chordsToNotes, randomProgression,
  transposeNotes, notesToFreqs, chordToFreqs,
  createMusicState, createSynth,
}
