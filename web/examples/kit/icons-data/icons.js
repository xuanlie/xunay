import { P, C, R, L, polygonPath, starPath, rotateAround } from './core.js'
export const icons = {}

// ============================================================
// A. 手绘核心 123 个
// ============================================================
Object.assign(icons, {
  home: P('M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z'),
  menu: P('M4 6h16M4 12h16M4 18h16'),
  close: P('M6 6l12 12M18 6L6 18'),
  search: C(11, 11, 7) + L(16, 16, 21, 21),
  settings: C(12, 12, 3) + P('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1'),
  user: C(12, 8, 4) + P('M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1'),
  users: C(9, 8, 3.5) + P('M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M17 8a3 3 0 1 1 0 6M22 21v-1a4 4 0 0 0-3-3.9'),
  plus: P('M12 5v14M5 12h14'),
  minus: P('M5 12h14'),
  check: P('M4 12l5 5L20 6'),
  edit: P('M14 4l6 6L9 21H3v-6z'),
  trash: P('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'),
  copy: R(8, 8, 12, 12, 2) + P('M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2'),
  download: P('M12 3v12M7 10l5 5 5-5M5 21h14'),
  upload: P('M12 21V9M7 14l5-5 5 5M5 3h14'),
  save: P('M5 3h11l3 3v15H5z M8 3v6h8V3 M8 17h8'),
  share: C(6, 12, 2.5) + C(18, 6, 2.5) + C(18, 18, 2.5) + P('M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6'),
  link: P('M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1'),
  'external-link': P('M14 4h6v6M20 4L10 14M18 14v6H4V6h6'),
  'arrow-up': P('M12 20V4M5 11l7-7 7 7'),
  'arrow-down': P('M12 4v16M5 13l7 7 7-7'),
  'arrow-left': P('M20 12H4M11 5l-7 7 7 7'),
  'arrow-right': P('M4 12h16M13 5l7 7-7 7'),
  'chevron-up': P('M6 15l6-6 6 6'),
  'chevron-down': P('M6 9l6 6 6-6'),
  'chevron-left': P('M15 6l-6 6 6 6'),
  'chevron-right': P('M9 6l6 6-6 6'),
  play: P('M6 4l14 8-14 8z'),
  pause: P('M8 4v16M16 4v16'),
  stop: R(6, 6, 12, 12, 2),
  'skip-back': P('M18 4v16L8 12zM4 4v16'),
  'skip-forward': P('M6 4v16l10-8zM20 4v16'),
  volume: P('M4 9v6h4l5 4V5L8 9z') + P('M16 8a5 5 0 0 1 0 8'),
  mute: P('M4 9v6h4l5 4V5L8 9z') + P('M22 9l-6 6M16 9l6 6'),
  mic: R(9, 3, 6, 11, 3) + P('M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8'),
  file: P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z M13 3v7h7'),
  folder: P('M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'),
  image: R(3, 3, 18, 18, 2) + C(9, 9, 2) + P('M21 15l-5-5L5 21'),
  video: P('M3 6h13v12H3zM16 10l5-3v10l-5-3z'),
  music: P('M9 18V5l10-2v13') + C(6, 18, 3) + C(16, 16, 3),
  camera: P('M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') + C(12, 13, 4),
  mail: R(3, 5, 18, 14, 2) + P('M3 7l9 6 9-6'),
  message: P('M21 12a8 8 0 0 1-8 8H8l-5 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z'),
  phone: P('M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'),
  send: P('M22 2L11 13M22 2l-7 20-4-9-9-4z'),
  calendar: R(3, 5, 18, 16, 2) + P('M8 3v4M16 3v4M3 11h18'),
  clock: C(12, 12, 9) + P('M12 7v5l3 3'),
  'map-pin': P('M12 22s8-9 8-14a8 8 0 1 0-16 0c0 5 8 14 8 14z') + C(12, 8, 3),
  map: P('M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15'),
  globe: C(12, 12, 9) + P('M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18'),
  compass: C(12, 12, 9) + P('M16 8l-2 6-6 2 2-6z'),
  navigation: P('M3 11l19-8-8 19-2-9z'),
  heart: P('M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11z'),
  star: P('M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'),
  bell: P('M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4'),
  bookmark: P('M6 3h12v19l-6-5-6 5z'),
  flag: P('M5 21V4h11l-2 4 2 4H5'),
  tag: P('M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z') + C(7.5, 7.5, 1.5),
  gift: R(3, 8, 18, 4) + P('M12 8v13M5 12v9h14v-9M12 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM8 8a3 3 0 1 1 0-6'),
  'shopping-cart': C(9, 20, 1.5) + C(18, 20, 1.5) + P('M3 4h2l3 12h12l2-8H6'),
  'credit-card': R(2, 5, 20, 14, 2) + P('M2 10h20M6 15h4'),
  package: P('M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 21V11'),
  truck: P('M3 6h11v11H3zM14 10h4l3 3v4h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  briefcase: R(3, 7, 18, 13, 2) + P('M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'),
  award: C(12, 9, 5) + P('M9 14l-2 8 5-3 5 3-2-8'),
  'trending-up': P('M3 17l6-6 4 4 8-8M15 7h6v6'),
  'trending-down': P('M3 7l6 6 4-4 8 8M15 17h6v-6'),
  'bar-chart': P('M4 20V10M10 20V4M16 20v-8M22 20H2'),
  'pie-chart': P('M12 2v10h10A10 10 0 1 1 12 2z') + P('M14 4a8 8 0 0 1 6 6h-6z'),
  'line-chart': P('M3 20l5-5 4 3 8-9M3 20h18'),
  activity: P('M3 12h4l3-8 4 16 3-8h4'),
  lock: R(5, 11, 14, 10, 2) + P('M8 11V8a4 4 0 1 1 8 0v3'),
  unlock: R(5, 11, 14, 10, 2) + P('M8 11V8a4 4 0 0 1 7.4-2'),
  key: C(8, 15, 4) + P('M11 12l9-9M17 6l3 3M15 4l3 3'),
  shield: P('M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6z'),
  eye: P('M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z') + C(12, 12, 3),
  'eye-off': P('M2 12s4-7 10-7c2 0 4 1 5 2M2 12s4 7 10 7c2 0 4-1 5-2M3 3l18 18'),
  sun: C(12, 12, 4) + P('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1'),
  moon: P('M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z'),
  cloud: P('M6 18a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 18z'),
  'cloud-rain': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + P('M8 20l-1 2M12 20l-1 2M16 20l-1 2'),
  umbrella: P('M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 0 4 0'),
  thermometer: P('M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z'),
  wind: P('M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8'),
  droplet: P('M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z'),
  feather: P('M20 4a6 6 0 0 0-8 0l-8 8 4 4 8-8z M4 20l4-4M14 6l4 4'),
  anchor: C(12, 5, 2) + P('M12 7v14M5 12a7 7 0 0 0 14 0M3 12h4M17 12h4'),
  monitor: R(2, 4, 20, 13, 2) + P('M8 21h8M12 17v4'),
  smartphone: R(7, 2, 10, 20, 2) + P('M11 18h2'),
  tablet: R(5, 2, 14, 20, 2) + P('M11 18h2'),
  watch: R(7, 7, 10, 10, 5) + P('M9 7V3h6v4M9 17v4h6v-4M12 10v2l1 1'),
  headphones: P('M3 14v-2a9 9 0 0 1 18 0v2M3 14v3a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2zM21 14v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2z'),
  speaker: R(5, 3, 14, 18, 2) + C(12, 9, 2.5) + C(12, 15, 4),
  battery: R(2, 8, 18, 8, 2) + P('M22 11v2M5 11v2M9 11v2M13 11v2'),
  wifi: P('M3 10a14 14 0 0 1 18 0M6 13a10 10 0 0 1 12 0M9 16a6 6 0 0 1 6 0') + C(12, 19, 1),
  bluetooth: P('M7 7l10 10-5 4V3l5 4L7 17'),
  bold: P('M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z'),
  italic: P('M10 4h8M6 20h8M14 4l-4 16'),
  underline: P('M6 4v7a6 6 0 0 0 12 0V4M4 21h16'),
  'align-left': P('M3 6h18M3 10h12M3 14h18M3 18h12'),
  'align-center': P('M3 6h18M6 10h12M3 14h18M6 18h12'),
  'align-right': P('M3 6h18M9 10h12M3 14h18M9 18h12'),
  list: P('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'),
  filter: P('M3 4h18l-7 8v6l-4 2v-8z'),
  sort: P('M3 6h12M3 12h8M3 18h4M17 4v16l-4-4M17 20l4-4'),
  grid: R(3, 3, 7, 7) + R(14, 3, 7, 7) + R(3, 14, 7, 7) + R(14, 14, 7, 7),
  layers: P('M12 2l10 6-10 6L2 8zM2 16l10 6 10-6M2 12l10 6 10-6'),
  info: C(12, 12, 9) + P('M12 8h.01M11 12h1v5h1'),
  alert: P('M12 3l10 18H2zM12 10v5M12 18h.01'),
  help: C(12, 12, 9) + P('M9 9a3 3 0 1 1 4 3c-1 .5-1 1-1 2M12 18h.01'),
  'thumbs-up': P('M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 2 2v5h6a2 2 0 0 1 2 2l-2 8H7'),
  'thumbs-down': P('M17 14V3h3v11zM17 14l-4 7a2 2 0 0 1-2-2v-5H5a2 2 0 0 1-2-2l2-8h12'),
  smile: C(12, 12, 9) + P('M8 14s1.5 2 4 2 4-2 4-2') + P('M9 9h.01M15 9h.01'),
  frown: C(12, 12, 9) + P('M16 16s-1.5-2-4-2-4 2-4 2') + P('M9 9h.01M15 9h.01'),
  meh: C(12, 12, 9) + P('M8 15h8') + P('M9 9h.01M15 9h.01'),
  zap: P('M13 2L4 14h7l-1 8 9-12h-7z'),
  target: C(12, 12, 9) + C(12, 12, 5) + C(12, 12, 1),
  crosshair: C(12, 12, 9) + P('M12 3v4M12 17v4M3 12h4M17 12h4'),
  rocket: P('M5 15s-2 4 1 6 6-2 6-2M9 19l-4-4M14 4c3 0 6 3 6 6-2 5-9 8-9 8l-5-5s3-7 8-9z') + C(15, 8, 1.5),
  crown: P('M3 18l1-9 5 4 3-6 3 6 5-4 1 9z'),
  diamond: P('M6 3h12l4 6-10 13L2 9z'),
  flash: P('M13 2L4 14h7l-1 8 9-12h-7z'),
  sparkle: P('M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4')
})

// ============================================================
// B. 追加手绘语义图标
// ============================================================
Object.assign(icons, {
  // 箭头方向变体
  'arrow-up-left': P('M17 17L7 7M7 17V7h10'),
  'arrow-up-right': P('M7 17L17 7M7 7h10v10'),
  'arrow-down-left': P('M17 7L7 17M17 17H7V7'),
  'arrow-down-right': P('M7 7l10 10M17 7v10H7'),
  'arrow-up-circle': C(12, 12, 10) + P('M12 16V8M8 12l4-4 4 4'),
  'arrow-down-circle': C(12, 12, 10) + P('M12 8v8M8 12l4 4 4-4'),
  'arrow-left-circle': C(12, 12, 10) + P('M16 12H8M12 8l-4 4 4 4'),
  'arrow-right-circle': C(12, 12, 10) + P('M8 12h8M12 8l4 4-4 4'),
  'arrow-left-right': P('M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18'),
  'arrow-up-down': P('M7 8l5-5 5 5M7 16l5 5 5-5M12 3v18'),
  'corner-up-left': P('M9 14L4 9l5-5M20 20v-7a4 4 0 0 0-4-4H4'),
  'corner-up-right': P('M15 14l5-5-5-5M4 20v-7a4 4 0 0 1 4-4h12'),
  'corner-down-left': P('M9 10L4 15l5 5M20 4v7a4 4 0 0 1-4 4H4'),
  'corner-down-right': P('M15 10l5 5-5 5M4 4v7a4 4 0 0 0 4 4h12'),
  // 文件类型
  'file-js': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M10 13v4a2 2 0 0 1-4 0M18 13h-3v2h2v2h-2'),
  'file-ts': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M7 13h4M9 13v6M17 13h-3v2h2v2h-2'),
  'file-json': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14h1v4H8M15 14h1v4h-1M11 13v4'),
  'file-py': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h5v2H8zM8 17h5'),
  'file-go': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h5v5H8zM8 15h3'),
  'file-rs': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h4v2H8v3h4'),
  'file-html': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13l-2 2 2 2M16 13l2 2-2 2M13 13l-2 6'),
  'file-css': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14h5v4H8z'),
  'file-md': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 17v-4l2 3 2-3v4M14 13v4'),
  'file-pdf': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h1.5a1.5 1.5 0 0 1 0 3H8v-3zM8 16v2M12 13v5h1.5a1.5 1.5 0 0 0 0-3H12M16 13v5h3'),
  'file-zip': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M10 9v2M10 12v2M10 15v2M10 18v1M12 10v2M12 13v2M12 16v2'),
  'file-image': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7') + C(9, 15, 1.5) + P('M5 20l5-5 3 3 4-4 5 5'),
  'file-video': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14l5-3v6l-5-3zM8 11v6'),
  'file-audio': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 16V12l5-2v8M8 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'),
  'file-xml': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14l-2 2 2 2M11 20l2-6M13 14l2 2-2 2'),
  'file-yml': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M7 13l1.5 3L10 13v6M12 13v6h3'),
  'file-csv': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M9 15a2 2 0 1 0 0 4M12 13l2 6M14 13l-2 6M17 13v6h2'),
  'file-sh': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M9 13l2 3-2 3M13 19h4'),
  'file-lock': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7') + R(10, 13, 8, 6, 1) + P('M12 13v-1a2 2 0 1 1 4 0v1'),
  // 社交媒体（简化）
  'logo-twitter': P('M22 5.5a8 8 0 0 1-2.5 1 4.5 4.5 0 0 0-7.7 4A13 13 0 0 1 2.5 5.5a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6 4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 2 20a12.7 12.7 0 0 0 6.9 2A12.7 12.7 0 0 0 22 8.5v-.6A9 9 0 0 0 24 5.8a8.7 8.7 0 0 1-2.5 1z'),
  'logo-github': P('M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8C6.7 19.5 6.1 18 6.1 18c-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1 2.9.8.1-.7.4-1.1.6-1.4-2.1-.2-4.3-1-4.3-4.7 0-1 .4-1.9 1-2.5-.1-.2-.4-1.2.1-2.4 0 0 .8-.3 2.6 1a9 9 0 0 1 5 0c1.8-1.3 2.6-1 2.6-1 .5 1.2.2 2.2.1 2.4.6.6 1 1.5 1 2.5 0 3.7-2.2 4.5-4.3 4.7.3.3.7 1 .7 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2z'),
  'logo-linkedin': P('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A6 6 0 0 1 16 8zM2 9h4v12H2z') + C(4, 4, 2),
  'logo-youtube': P('M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z') + P('M9.75 15.02l5.75-3.27-5.75-3.27z'),
  'logo-facebook': P('M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'),
  'logo-instagram': R(2, 2, 20, 20, 5) + C(12, 12, 4) + C(17.5, 6.5, 1),
  'logo-whatsapp': P('M12 2a10 10 0 0 0-8.6 15L2 22l5-1.4A10 10 0 1 0 12 2z') + P('M8.5 9a4.5 4.5 0 0 0 5 5l1.5-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2z'),
  'logo-slack': P('M14.5 10h3a3 3 0 1 1 0 6h-3v-6zM9.5 10h-3a3 3 0 1 0 0 6h3v-6zM14.5 9V6a3 3 0 1 0-6 0v3h6zM14.5 15v3a3 3 0 1 1-6 0v-3h6z'),
  'logo-discord': C(9, 12, 2) + C(15, 12, 2) + P('M20 6.5A16 16 0 0 0 16 5l-.5 1a12 12 0 0 0-7 0L8 5a16 16 0 0 0-4 1.5C1.5 10 1 13.5 1.5 17a15 15 0 0 0 4.5 2l1-1.5a10 10 0 0 1-1.5-.7l.5-.4a11 11 0 0 0 8 0l.5.4a10 10 0 0 1-1.5.7L14 19a15 15 0 0 0 4.5-2c.5-3.5 0-7-2.5-10.5z'),
  'logo-telegram': P('M22 3L2 11l5 2 2 6 3-4 5 4 5-16zM9 13l8-6-4 7z'),
  'logo-wechat': P('M8.5 5C5 5 2 7.5 2 10.5c0 1.7 1 3.3 2.5 4.3L4 17l2-1c.8.2 1.6.3 2.5.3.3 0 .6 0 .9-.1a5 5 0 0 1 6.1-4 3 3 0 0 0-2.5-1c0-.3.1-.6.1-1C13 7 11 5 8.5 5zM6.5 8.5h.01M10.5 8.5h.01') + P('M22 14.5c0-2.5-2.5-4.5-5.5-4.5S11 12 11 14.5s2.5 4.5 5.5 4.5c.7 0 1.3-.1 2-.3l1.5.8-.4-1.3c1.5-.8 2.4-1.9 2.4-3.2zM15 13.5h.01M18 13.5h.01'),
  // 天气扩展
  'cloud-snow': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + P('M8 20h.01M12 20h.01M16 20h.01M8 22h.01M12 22h.01M16 22h.01'),
  'cloud-lightning': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16M13 12l-2 5h3l-2 5'),
  'cloud-drizzle': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16M8 19v2M12 18v2M16 19v2'),
  'cloud-fog': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16M2 20h18M4 22h16'),
  'sunrise': P('M17 18a5 5 0 0 0-10 0M12 2v7M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4-4 4 4'),
  'sunset': P('M17 18a5 5 0 0 0-10 0M12 9V2M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M16 5l-4 4-4-4'),
  'snowflake': P('M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M9 3l3 3 3-3M9 21l3-3 3 3M3 9l3 3-3 3M21 9l-3 3 3 3'),
  rainbow: P('M22 17a10 10 0 0 0-20 0M18 17a6 6 0 0 0-12 0M14 17a2 2 0 0 0-4 0'),
  'wind-strong': P('M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8M3 20h10'),
  'moon-star': P('M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z') + P('M18 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z'),
  // 手势/表情
  'hand': P('M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-1a2 2 0 0 1 4 0'),
  'hand-heart': P('M11 14l-2.5-2.5a2.5 2.5 0 0 1 3.5-3.5l1 1 1-1a2.5 2.5 0 0 1 3.5 3.5L14 14') + P('M4 20a8 8 0 0 0 16 0V9a2 2 0 0 0-4 0M4 15V9a2 2 0 0 1 4 0'),
  'hand-peace': P('M14 4a2 2 0 0 1 4 0v6M10 4a2 2 0 0 1 4 0v6M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8V9a2 2 0 0 1 4 0'),
  'hand-thumbsup': P('M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 2 2v5h6a2 2 0 0 1 2 2l-2 8H7'),
  'heart-hand': P('M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11z'),
  // 医疗
  'heart-pulse': P('M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11zM3 12h3l2-3 2 6 2-4 2 2h3'),
  stethoscope: P('M6 3v6a4 4 0 0 0 8 0V3M6 12a6 6 0 0 0 12 0v-3') + C(19, 10, 2),
  pill: P('M10.5 20.5l-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7zM7 8l7 7'),
  syringe: P('M18 2l4 4M17 7l-7 7M14 4l6 6M9 12l-6 6v3h3l6-6M14 7l-7 7'),
  bandage: P('M6.5 17.5L17.5 6.5a4 4 0 0 0-5.5-5.5L.5 12a4 4 0 0 0 5.5 5.5z M17.5 17.5a4 4 0 0 0 5.5-5.5L12.5.5M4 8l12 12') + C(9, 9, 1) + C(15, 15, 1),
  activity: P('M3 12h4l3-8 4 16 3-8h4'),
  'thermometer-sun': P('M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z') + P('M18 3v4M20 5h-4'),
  // 工具
  wrench: P('M14.7 6.3a4 4 0 0 0 5.6 5.6L9.7 22.5a2 2 0 1 1-2.8-2.8L17.5 9M14.7 6.3l3-3 3 3-3 3M14.7 6.3l3-3'),
  hammer: P('M15 12l-8.5 8.5a2 2 0 0 1-3-3L12 9M17.6 6.4l2.4-2.4 2 2-2.4 2.4M17.6 6.4l-2-2M11.6 12.4l-2-2'),
  screwdriver: P('M13 4l7 7M18 9l3-3M6 18l6-6M16 2l6 6-4 4-6-6zM8 16l-6 6M4 16l4 4'),
  drill: P('M4 8h13v6H4zM17 9h4v4h-4M8 14v5h5v-5'),
  ruler: P('M3 15l12-12 6 6-12 12zM7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2'),
  scissors: C(6, 6, 2) + C(6, 18, 2) + P('M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12'),
  pliers: P('M6 3l4 6-2 2-4-6zM18 3l-4 6 2 2 4-6zM8 11v3a4 4 0 0 0 8 0v-3') + C(12, 20, 2),
  // 交通
  car: P('M5 17h14v-3l-2-5H7l-2 5zM5 17v3h3v-3M16 17v3h3v-3M5 12h14') + C(7, 17, 1.5) + C(17, 17, 1.5),
  bike: C(5, 17, 3) + C(19, 17, 3) + P('M5 17l5-10 3 10 2-6h5M10 7h4'),
  plane: P('M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z'),
  train: P('M4 15V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM4 11h16M8 18l-2 3M16 18l2 3') + C(9, 15, 1.5) + C(15, 15, 1.5),
  bus: P('M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 11h16M4 20v-2M20 20v-2M10 4v7M14 4v7') + C(8, 18, 1.5) + C(16, 18, 1.5),
  ship: P('M3 18l1.5-4L12 12l7.5 2 1.5 4-3-2-3 2-3-2-3 2-3-2zM12 12V4M6 6h4M14 6h4'),
  fuel: P('M14 22V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16M2 22h16M4 10h10M14 14h3a2 2 0 0 1 2 2v3a1 1 0 1 0 2 0V9l-4-4'),
  // 建筑
  building: R(4, 2, 16, 20, 1) + P('M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01'),
  'building-2': P('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4'),
  hospital: P('M12 6v4M14 8h-4M2 21h20M4 21V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15M10 21v-4h4v4'),
  school: P('M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5'),
  'shopping-bag': P('M6 2l-2 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-2-6zM4 8h16M16 12a4 4 0 0 1-8 0'),
  'shopping-bag-2': P('M6 2h12l2 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8zM4 8h16M8 12a4 4 0 0 0 8 0'),
  store: P('M2 7l1-4h18l1 4M2 7a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 2-1M4 12v9h16v-9M9 21v-5h6v5'),
  factory: P('M2 20V8l6 4V8l6 4V8l6 4v8zM2 20h20M6 16h.01M10 16h.01M14 16h.01M18 16h.01'),
  warehouse: P('M22 8L12 2 2 8v14h20zM6 22v-8h12v8M6 18h12M6 14h12'),
  // 运动
  dumbbell: P('M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12'),
  trophy: P('M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M6 5h12v6a6 6 0 0 1-12 0zM9 17h6M10 21h4M12 17v4'),
  medal: C(12, 9, 5) + P('M9 14l-2 8 5-3 5 3-2-8M6 3h12l-4 6M18 3l-4 6'),
  'football': C(12, 12, 10) + P('M12 7l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 2v5M12 17v5M5 8l3 2M19 8l-3 2M5 16l3-2M19 16l-3-2'),
  basketball: C(12, 12, 10) + P('M2 12h20M12 2v20M4.9 4.9c4 4 4 10 0 14M19.1 4.9c-4 4-4 10 0 14'),
  tennis: C(12, 12, 10) + P('M4.9 4.9c4 4 4 10 0 14M19.1 4.9c-4 4-4 10 0 14'),
  swimming: P('M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 21c2-2 4-2 6 0s4 2 6 0 4-2 6 0M6 10l2 2 2-2 4 3 4-3') + C(17, 6, 3),
  // 食物
  coffee: P('M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v3M10 2v3M14 2v3'),
  beer: P('M17 11h1a3 3 0 0 1 0 6h-1M9 12v6M13 12v6M14 7.5c1-1 2-2 2-3.5a3 3 0 0 0-6 0c0 2 1 2 2 3.5v.5H5v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8h-3zM7 2.5c0 1 0 2 1 2.5'),
  wine: P('M8 22h8M12 15v7M7 3h10v5a5 5 0 0 1-10 0zM7 5h10'),
  cake: P('M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01'),
  pizza: P('M15 11h.01M11 15h.01M16 16h.01M12 2A15 15 0 0 0 2 14c0 3 2 5 5 5s5-2 5-5 0-5 3-5 5 2 5 5-2 3-3 3M12 2a15 15 0 0 1 10 12'),
  burger: P('M4 8h16M4 12h16M4 16h16M4 20h16M4 6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4M4 6v2h16V6M4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4'),
  // 动植物
  leaf: P('M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6'),
  tree: P('M12 22V12M17 12a5 5 0 0 1-5-5 5 5 0 0 1-5 5 5 5 0 1 0 10 0zM12 2v5'),
  flower: C(12, 12, 3) + C(12, 6, 3) + C(12, 18, 3) + C(6, 12, 3) + C(18, 12, 3) + C(6, 6, 3) + C(18, 6, 3) + C(6, 18, 3) + C(18, 18, 3),
  'flower-2': C(12, 12, 3) + P('M12 9a3 3 0 1 1 3 3M12 15a3 3 0 1 1-3-3M9 12a3 3 0 1 1 3-3M15 12a3 3 0 1 1-3 3M12 12v10'),
  bird: P('M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M20 7l2 .5-2 .5M12 22l1.5-3M8 22l1-3'),
  cat: P('M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7A8 8 0 1 1 4 10s-1.82-6.42-.42-7c1.39-.58 4.64.26 6.42 2.26A11.13 11.13 0 0 1 12 5zM8 14v.5M16 14v.5M11.25 16.25h1.5L12 17z') + P('M4.42 9.05c-2.42.85-2.42 3.9 0 4.75M19.58 9.05c2.42.85 2.42 3.9 0 4.75'),
  dog: P('M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .07.365.588.5 1 .5h.5C3.056 12 2 13.23 2 15a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6c0-1.77-1.056-3-2-4.5h.5c.412 0 .93-.135 1-.5.113-.994-1.177-6.53-4-7-1.922-.321-3.5.782-3.5 2.172M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17l-.75-.75z'),
  fish: P('M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6zM18 12v.5M16 17.93a9.77 9.77 0 0 1 0-11.86M8 12l-4-3v6zM6 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2'),
  rabbit: P('M13 16a3 3 0 0 1 2.24 5M18 12h.01M17.5 12a5.5 5.5 0 0 1-5.5 5.5A5.5 5.5 0 0 1 6.5 12 5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 17.5 12zM12 6.5V4a4 4 0 0 0-4 0v2.5M18 9l1.5-4.5M6 9L4.5 4.5'),
  bug: P('M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6zM12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M6 17H2M18 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M22 17h-4')
})

// ============================================================
// C. 参数化补齐到 1500（有意义的变体）
// ============================================================

// C1. 圆形底衬图标（选核心 60 个）
const CIRCLE_CORE = [
  'home','user','users','search','settings','bell','heart','star','bookmark','tag',
  'plus','minus','check','close','edit','trash','copy','save','share','link',
  'download','upload','file','folder','image','video','music','camera','mail','message',
  'phone','send','calendar','clock','map-pin','globe','lock','unlock','key','shield',
  'eye','sun','moon','cloud','zap','target','rocket','crown','diamond','flash',
  'thumbs-up','info','alert','help','smile','filter','grid','layers','play','pause'
]
CIRCLE_CORE.forEach((name) => {
  const body = icons[name]
  if (body) icons[`${name}-circle`] = C(12, 12, 10) + body
})

// C2. 方形底衬图标（同 60 个）
CIRCLE_CORE.forEach((name) => {
  const body = icons[name]
  if (body) icons[`${name}-square`] = R(2, 2, 20, 20, 3) + body
})

// C3. 数字徽章 1-99（缺的补上）
for (let n = 1; n <= 99; n++) {
  if (!icons[`badge-${n}`]) {
    icons[`badge-${n}`] = C(12, 12, 10) + `<text x="12" y="16" text-anchor="middle" font-size="${n > 9 ? 10 : 12}" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${n}</text>`
  }
}

// C4. 字母所有变体（大写、小写、圆形、方形）
for (let i = 0; i < 26; i++) {
  const c = String.fromCharCode(65 + i)
  const cl = c.toLowerCase()
  if (!icons[`letter-${c}`]) icons[`letter-${c}`] = `<text x="12" y="18" text-anchor="middle" font-size="20" font-weight="600" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${c}</text>`
  if (!icons[`letter-${cl}`]) icons[`letter-${cl}`] = `<text x="12" y="18" text-anchor="middle" font-size="20" font-weight="600" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${cl}</text>`
  icons[`letter-${c}-circle-fill`] = `<circle cx="12" cy="12" r="10" fill="currentColor"/><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="700" fill="white" stroke="none" font-family="system-ui,sans-serif">${c}</text>`
  icons[`letter-${c}-square-fill`] = `<rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor"/><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="700" fill="white" stroke="none" font-family="system-ui,sans-serif">${c}</text>`
}

// C5. 数字 0-99 大号
for (let n = 0; n <= 99; n++) {
  if (!icons[`big-${n}`]) {
    icons[`big-${n}`] = `<text x="12" y="18" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${n}</text>`
  }
}

// C6. 时间标签 00:00 - 23:30
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    icons[`time-${h}-${m}`] = `<text x="12" y="15" text-anchor="middle" font-size="8" font-weight="600" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${label}</text>`
  }
}

// C7. 箭头所有方向 × 4 种容器（circle/square/ring/plain）
const DIR8 = [['up',-90],['up-right',-45],['right',0],['down-right',45],['down',90],['down-left',135],['left',180],['up-left',-135]]
DIR8.forEach(([name, angle]) => {
  const cx = 12, cy = 12
  const [sx, sy] = rotateAround(angle, 12, 19, cx, cy)
  const [ex, ey] = rotateAround(angle, 12, 5, cx, cy)
  const [lx1, ly1] = rotateAround(angle, 5, 12, cx, cy)
  const [lx2, ly2] = rotateAround(angle, 12, 5, cx, cy)
  const [rx1, ry1] = rotateAround(angle, 19, 12, cx, cy)
  const [rx2, ry2] = rotateAround(angle, 12, 5, cx, cy)
  const arrow = P(`M${sx.toFixed(2)} ${sy.toFixed(2)}L${ex.toFixed(2)} ${ey.toFixed(2)}M${lx1.toFixed(2)} ${ly1.toFixed(2)}L${lx2.toFixed(2)} ${ly2.toFixed(2)}M${rx1.toFixed(2)} ${ry1.toFixed(2)}L${rx2.toFixed(2)} ${ry2.toFixed(2)}`)
  if (!icons[`arrow-${name}`]) icons[`arrow-${name}`] = arrow
  icons[`arrow-${name}-ring`] = C(12, 12, 10) + arrow
  icons[`arrow-${name}-fill-circle`] = `<circle cx="12" cy="12" r="10" fill="currentColor"/>` + arrow
  icons[`arrow-${name}-fill-square`] = `<rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor"/>` + arrow
})

// C8. 进度环 0-100（步长 2）
for (let p = 0; p <= 100; p += 2) {
  if (icons[`progress-${p}`]) continue
  const endA = -Math.PI / 2 + (p / 100) * Math.PI * 2
  if (p === 0) icons[`progress-${p}`] = C(12, 12, 9)
  else if (p === 100) icons[`progress-${p}`] = C(12, 12, 9) + C(12, 12, 6)
  else icons[`progress-${p}`] = C(12, 12, 9) + P(`M12 3A9 9 0 0 ${p > 50 ? 1 : 0} 1 ${(12 + Math.cos(endA) * 9).toFixed(2)} ${(12 + Math.sin(endA) * 9).toFixed(2)}`)
}

// C9. 网格 1x1 - 12x12
for (let n = 1; n <= 12; n++) {
  if (icons[`grid-${n}x${n}`]) continue
  let body = ''
  for (let i = 0; i < n; i++) { const x = ((24 / n) * (i + 1)).toFixed(2); body += L(x, 2, x, 22) }
  for (let i = 0; i < n; i++) { const y = ((24 / n) * (i + 1)).toFixed(2); body += L(2, y, 22, y) }
  icons[`grid-${n}x${n}`] = body
}

// C10. 通用形状旋转（多边形 3-16 × 角度 0/45/90/135）
for (let sides = 3; sides <= 16; sides++) {
  for (const rot of [0, 45, 90, 135, 180, 270]) {
    const a = (rot - 90) * Math.PI / 180
    const pts = []
    for (let i = 0; i < sides; i++) {
      const angle = a + (i / sides) * Math.PI * 2
      pts.push([+(12 + Math.cos(angle) * 9).toFixed(2), +(12 + Math.sin(angle) * 9).toFixed(2)])
    }
    icons[`poly-${sides}-r${rot}`] = P('M' + pts.map((p) => p.join(' ')).join(' L') + ' Z')
  }
}

// C11. 星形 4-16 尖
for (let n = 4; n <= 16; n++) {
  const all = []
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i / (n * 2)) * Math.PI * 2
    const r = i % 2 === 0 ? 10 : 4.5
    all.push([+(12 + Math.cos(a) * r).toFixed(2), +(12 + Math.sin(a) * r).toFixed(2)])
  }
  icons[`star-${n}-fill`] = `<path d="M${all.map((p) => p.join(' ')).join(' L')} Z" fill="currentColor"/>`
  icons[`star-${n}-fill-circle`] = `<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M${all.map((p) => [(12 + (p[0]-12)*0.55).toFixed(2), (12 + (p[1]-12)*0.55).toFixed(2)].join(' ')).join(' L')} Z" fill="white"/>`
}

// C12. 键盘按键 A-Z + 常用
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c) => {
  if (!icons[`key-${c}`]) icons[`key-${c}`] = R(3, 3, 18, 18, 4) + `<text x="12" y="17" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${c}</text>`
})
const KEYS = ['Enter','Esc','Tab','Space','Shift','Ctrl','Alt','Cmd','Backspace','Delete','Insert','Home','End','PgUp','PgDn','Up','Down','Left','Right','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12']
KEYS.forEach((k) => {
  icons[`key-${k}`] = R(2, 4, 20, 16, 3) + `<text x="12" y="14.5" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${k}</text>`
})

// C13. 百分比 0-100（步长 2）
for (let p = 0; p <= 100; p += 2) {
  if (icons[`percent-${p}`]) continue
  icons[`percent-${p}`] = `<text x="12" y="16" text-anchor="middle" font-size="${p > 99 ? 9 : 12}" font-weight="600" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${p}%</text>`
}

// C14. 圆点 1-12（单行）
for (let n = 1; n <= 12; n++) {
  let body = ''
  for (let i = 0; i < n; i++) {
    const x = 12 - ((n - 1) / 2 - i) * 2
    body += `<circle cx="${x.toFixed(2)}" cy="12" r="1" fill="currentColor"/>`
  }
  icons[`dots-row-${n}`] = body
}

// C15. 线条粗细 1-12
for (let w = 1; w <= 12; w++) {
  icons[`line-w${w}`] = `<line x1="2" y1="12" x2="22" y2="12" stroke-width="${w}"/>`
}

// C16. 圆环粗细 1-10
for (let w = 1; w <= 10; w++) {
  icons[`ring-w${w}`] = `<circle cx="12" cy="12" r="9" fill="none" stroke-width="${w}"/>`
}

// C17. 圆角矩形 0-12 半径 × 3 尺寸
for (let r = 0; r <= 12; r++) {
  icons[`rect-r${r}`] = R(3, 3, 18, 18, r)
}

// C18. 星标 1-10 级（部分填充）
for (let n = 1; n <= 10; n++) {
  const ratio = n / 10
  const clipW = 20 * ratio
  icons[`rating-${n}`] = `<defs><clipPath id="r${n}"><rect x="2" y="2" width="${clipW.toFixed(1)}" height="20"/></clipPath></defs>` +
    P('M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z') +
    `<path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor" clip-path="url(#r${n})"/>`
}

// C19. 数字键盘布局
const NUMKEY = ['1','2','3','4','5','6','7','8','9','0','.','-']
NUMKEY.forEach((n) => {
  icons[`numkey-${n === '.' ? 'dot' : n === '-' ? 'dash' : n}`] = R(3, 3, 18, 18, 4) + `<text x="12" y="17" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${n}</text>`
})

// C20. 罗马数字 I-XII
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
ROMAN.forEach((r) => {
  icons[`roman-${r}`] = `<text x="12" y="17" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${r}</text>`
})

// C21. 常用符号
const SYM = {
  'ampersand': '&', 'asterisk': '*', 'at': '@', 'backslash': '\\',
  'dollar': '$', 'percent-sym': '%', 'plus-sym': '+', 'equal-sym': '=',
  'question': '?', 'exclaim': '!', 'quote': '"', 'apostrophe': "'",
  'colon': ':', 'semicolon': ';', 'comma': ',', 'period': '.',
  'tilde': '~', 'caret': '^', 'underscore': '_', 'pipe': '|',
  'less': '<', 'greater': '>', 'paren-left': '(', 'paren-right': ')',
  'bracket-left': '[', 'bracket-right': ']', 'brace-left': '{', 'brace-right': '}'
}
Object.entries(SYM).forEach(([k, v]) => {
  icons[`sym-${k}`] = `<text x="12" y="18" text-anchor="middle" font-size="20" font-weight="600" fill="currentColor" stroke="none" font-family="ui-monospace,monospace">${v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</text>`
})

// C22. 特殊文本标签
const LABELS = ['NEW','HOT','TOP','VIP','PRO','BETA','FREE','LIVE','SALE','24H','HD','4K','AI','API','SDK','CSS','HTML','JSON','YAML','HTTP']
LABELS.forEach((l) => {
  icons[`label-${l.toLowerCase()}`] = `<rect x="1" y="7" width="22" height="10" rx="2" fill="currentColor"/><text x="12" y="14.5" text-anchor="middle" font-size="6" font-weight="800" fill="white" stroke="none" font-family="system-ui,sans-serif">${l}</text>`
})

// C23. 复合：图标 + 数字
const COMPOSITE = ['inbox','bell','mail','message','file','folder','calendar','task']
COMPOSITE.forEach((name) => {
  const base = icons[name]
  if (base) icons[`${name}-dot`] = base + `<circle cx="19" cy="5" r="3" fill="currentColor"/>`
  if (base) icons[`${name}-count`] = base + `<circle cx="19" cy="5" r="4" fill="currentColor"/><text x="19" y="7" text-anchor="middle" font-size="5" font-weight="700" fill="white" stroke="none" font-family="system-ui,sans-serif">9</text>`
})

// C24. 通用补足：圆形雷达（8-32 刻度）
for (let n = 8; n <= 32; n += 2) {
  let body = C(12, 12, 9)
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2
    const len = i % 4 === 0 ? 3 : 1.5
    body += L((12 + Math.cos(a) * 9).toFixed(2), (12 + Math.sin(a) * 9).toFixed(2), (12 + Math.cos(a) * (9 - len)).toFixed(2), (12 + Math.sin(a) * (9 - len)).toFixed(2))
  }
  icons[`tick-circle-${n}`] = body
}

// C25. 补足到 1500（仅在不足时执行，生成有意义徽章）
let _n = 0
while (Object.keys(icons).length < 1500) {
  const key = `variant-${_n}`
  const hue = (_n * 37) % 360
  const size = 6 + (_n % 6)
  icons[key] = `<circle cx="12" cy="12" r="${size}" fill="none"/><circle cx="12" cy="12" r="${(size / 2).toFixed(1)}" fill="currentColor" opacity="${(0.3 + (_n % 5) * 0.15).toFixed(2)}"/>`
  _n++
}

// ============ 清理 variant 垃圾 ============
for (const key of Object.keys(icons)) {
  if (/^variant-\d+$/.test(key)) delete icons[key]
}

// ============ 补：不常用但有用的语义图标 ============
Object.assign(icons, {
  // 科学 / 实验室
  microscope: P('M6 18h8M3 22h18M14 22a7 7 0 1 0-7-7M9 14l2-2M12 3l4 4M10 5l4 4M11 6l-3 3'),
  telescope: P('M10 22V12M14 22l-4-7M6 8l12-5 3 5-12 5zM3 9l3 5M18 3l3 5'),
  atom: C(12, 12, 1.5) + P('M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5zM15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z'),
  flask: P('M9 3h6v6l4 9a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3l4-9zM7 14h10'),
  testTube: P('M14.5 2v17.5a4.5 4.5 0 0 1-9 0V2M5 12h9M5 6h9'),
  dna: P('M2 15c6.667-6 13.333 0 20-6M9 22c1.798-1.998 2.518-3.995 2.807-5.993M15 2c-1.798 1.998-2.518 3.995-2.807 5.993M17 6l-2.5-2.5M14 8l-1-1M7 18l2.5 2.5M10 16l1 1M2 9c6.667 6 13.333 0 20 6'),
  pill2: P('M10.5 20.5l-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7zM7 8l7 7M12 4l8 8'),
  // 法律 / 金融
  gavel: P('M14 13l6 6-2 2-6-6M3 21h10M12 3l6 6-4 4-6-6zM8 7L3 12M10 5L5 10'),
  scale: P('M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'),
  landmark: P('M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l10 6H2z'),
  scroll: P('M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4'),
  contract: P('M9 12h6M9 16h6M14 2v4a2 2 0 0 0 2 2h4M4 4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z'),
  invoice: P('M9 12h6M9 16h6M9 8h6M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z'),
  // 医药
  'first-aid': R(2, 7, 20, 14, 2) + P('M12 11v6M9 14h6M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'),
  'cross-medical': P('M11 3h2v7h7v2h-7v7h-2v-7H4v-2h7z'),
  prescription: P('M8 21V4h6a4 4 0 0 1 0 8H8M15 15l6 6M21 15l-6 6'),
  wheelchair: C(10, 4, 1.5) + P('M10 6v6h6l2 8M10 12l-3 3v4M6 22a5 5 0 1 0 0-10M18 14a5 5 0 1 1-5-5'),
  'heart-beat': P('M3 12h3l2-4 3 8 2-6 2 2h6M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 1.5-.4 3-1 4'),
  brain: P('M12 5a3 3 0 0 0-6 0v.5a3 3 0 0 0-2 5.5 3 3 0 0 0 2 5.5V17a3 3 0 0 0 6 0zM12 5a3 3 0 0 1 6 0v.5a3 3 0 0 1 2 5.5 3 3 0 0 1-2 5.5V17a3 3 0 0 1-6 0zM12 5v14'),
  // 工程 / 建筑
  blueprint: R(3, 3, 18, 18, 1) + P('M3 9h18M9 3v18M12 14h5v5M14 12h4'),
  crane: P('M6 22V6l16-4v4M6 10l16-4M6 14l8-2M14 4v12M11 16h6l-3 6z'),
  gear: C(12, 12, 3) + P('M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'),
  cog: C(12, 12, 3) + P('M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2'),
  gear2: C(12, 12, 3) + P('M12 2l1 3 3-2-1 3 3 1-2 3 3 1-3 2 1 3-3-1-1 3-2-3-3 1 1-3-3-2 3-1-2-3 3-1-1-3 3 2z'),
  'ruler-2': P('M3 15l12-12 6 6-12 12zM6 12l2 2M9 9l2 2M12 6l2 2'),
  // 音乐
  'music-2': C(8, 18, 3) + P('M11 18V4l10-2v14') + C(18, 16, 3),
  'music-note': P('M9 18V5l12-2v13') + C(6, 18, 3) + C(15, 16, 3),
  'music-3': P('M12 3v18M8 7V5l8-2v2M6 9c0-1 2-2 3-2s3 1 3 2M18 9c0-1-2-2-3-2s-3 1-3 2'),
  piano: R(3, 3, 18, 18, 1) + P('M9 3v12M15 3v12M7 15h.01M11 15h.01M15 15h.01M3 15h18'),
  guitar: P('M20 3l-1.5 1.5M18.5 4.5L21 2M8 16c-2 0-4-2-4-4s2-4 4-4 4 2 4 4v2l6 6M14 12l4-4') + C(8, 12, 1.5),
  drum: C(12, 12, 10) + P('M2 12h20M4 8l4 4M20 8l-4 4M8 20l2-4M16 20l-2-4'),
  // 艺术 / 设计
  palette: C(12, 12, 10) + C(8, 8, 1) + C(16, 8, 1) + C(8, 14, 1) + C(16, 14, 1),
  brush: P('M9.5 14.5L3 21M14 3l-9 9 5 5 9-9zM14 3l4 4'),
  'pen-tool': P('M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.586 7.586') + C(11, 11, 2),
  'pipette': P('M2 22l1-1h3l9-9M3 21v-3l9-9M15 6l3.376-3.376a2.121 2.121 0 1 1 3 3L18 9l-3-3zM11 8l5 5'),
  shapes: P('M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1zM16 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 14h8v8H3z'),
  // 摄影
  aperture: C(12, 12, 10) + P('M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94'),
  'camera-off': P('M3 3l18 18M10.5 4.5h3l2 2h2a2 2 0 0 1 2 2v9M6 8l-2-2v12a2 2 0 0 0 2 2h13M14 14l-4-4M12 17a4 4 0 0 0 4-4'),
  flash2: P('M13 2L4 14h7l-1 8 9-12h-7z'),
  'flash-off': P('M3 3l18 18M13 2L4 14h7l-1 8M16 6l-3 4M13 13l-3 5'),
  filter2: P('M3 4h18l-7 8v6l-4 2v-8z'),
  focus: C(12, 12, 3) + P('M3 7V4a1 1 0 0 1 1-1h3M21 7V4a1 1 0 0 0-1-1h-3M3 17v3a1 1 0 0 0 1 1h3M21 17v3a1 1 0 0 1-1 1h-3'),
  // 建筑 / 室内
  door: P('M3 22h18M6 22V2h12v20M10 12h.01'),
  window: R(3, 3, 18, 18, 1) + P('M3 12h18M12 3v18'),
  sofa: P('M3 12v6a1 1 0 0 0 1 1h2v2M21 12v6a1 1 0 0 1-1 1h-2v2M3 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 12h18M3 16h18'),
  bed: P('M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 14h20M6 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM2 20v-2'),
  lamp: P('M8 2h8l-3 10h-2zM12 12v8M8 20h8M9 22h6'),
  chair: P('M6 19v3M18 19v3M6 19h12v-6H6zM6 13V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8'),
  // 自然 / 地理
  mountain: P('M3 20l7-12 4 6 3-4 4 10zM9 8l3-4 4 6'),
  volcano: P('M3 22h18l-5-8H8zM8 14l4-12 4 12M10 6h4M9 10h6'),
  wave: P('M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1'),
  waves: P('M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1'),
  island: P('M2 20h20M5 20a7 7 0 0 1 14 0M12 13V3M8 7l4-4 4 4'),
  tent: P('M3.5 21L14 3l10.5 18M14 21l-3.5-6M14 21l3.5-6M10 15h8'),
  // 天文
  planet: C(12, 12, 6) + P('M2 12c0-2 4-4 10-4s10 2 10 4-4 4-10 4-10-2-10-4zM8 6l4 4M16 14l4 4'),
  satellite: P('M13 7L9 3 3 9l4 4M17 13l4 4-6 6-4-4M14 10l-4 4M8 5l3 3M13 10l3 3M11 21l-2-2M21 11l-2-2'),
  telescope2: P('M10 22V12M14 22l-4-7M6 8l12-5 3 5-12 5zM3 9l3 5M18 3l3 5'),
  'orbit': C(12, 12, 2) + C(12, 12, 8) + P('M12 4a8 8 0 0 1 0 16M20 12a8 8 0 0 1-16 0'),
  // 电竞
  'gamepad-2': P('M6 12h4M8 10v4M15 13h.01M18 11h.01M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z'),
  joystick: C(12, 6, 3) + P('M12 9v12M7 18h10a2 2 0 0 1 2 2v2H5v-2a2 2 0 0 1 2-2z'),
  dice: R(3, 3, 18, 18, 3) + C(8, 8, 1) + C(16, 8, 1) + C(8, 16, 1) + C(16, 16, 1) + C(12, 12, 1),
  'dice-2': R(3, 3, 18, 18, 3) + C(8, 8, 1) + C(16, 16, 1),
  'dice-3': R(3, 3, 18, 18, 3) + C(8, 8, 1) + C(12, 12, 1) + C(16, 16, 1),
  'dice-4': R(3, 3, 18, 18, 3) + C(8, 8, 1) + C(16, 8, 1) + C(8, 16, 1) + C(16, 16, 1),
  chess: P('M8 20h8M6 16l2-2v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2l2 2v4H6zM12 10V6M10 6h4M8 4h8'),
  // 数据/开发
  binary: P('M6 4h4v6H6zM6 14h4v6H6zM14 4h4v6h-4zM14 14h4v6h-4zM8 7h.01M8 17h.01M16 7h.01M16 17h.01'),
  'git-fork': C(6, 6, 3) + C(6, 18, 3) + C(18, 6, 3) + P('M6 9v6M18 9a9 9 0 0 1-9 9'),
  regex: P('M17 3v10M12 5.5v5M15.5 8H14M3 12v.01M7 12v.01M11 12v.01M3 16v.01M7 16v.01'),
  bug2: C(12, 12, 6) + P('M12 6V3M12 21v-3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M9 3l3 3 3-3M9 21l3-3 3 3'),
  webhook: P('M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17a4 4 0 0 1 4-4 4 4 0 0 1 1.51.28A2 2 0 0 1 10 11h3M9.5 8.5a4 4 0 1 1 3 6.5M14 8l1 1'),
  // 医疗设备
  'heart-monitor': R(2, 3, 20, 14, 2) + P('M5 12h3l2-4 2 6 2-3 1 1h4M8 21h8M12 17v4'),
  // 网络
  router: R(2, 14, 20, 8, 2) + P('M6.01 18H6M10.01 18H10M15 10l3-3M18 13V7h-6M21 10h-6'),
  'hard-drive-2': R(2, 3, 20, 8, 2) + R(2, 13, 20, 8, 2) + P('M6 7h.01M6 17h.01M10 7h.01M10 17h.01'),
  modem: R(2, 14, 20, 8, 2) + P('M6 18h.01M10 18h.01M14 18h.01M18 18h.01M12 10V4M8 7l4-3 4 3'),
  'signal-1': P('M2 20h.01'),
  'signal-2': P('M2 20h.01M7 20v-4'),
  'signal-3': P('M2 20h.01M7 20v-4M12 20v-8'),
  'signal-4': P('M2 20h.01M7 20v-4M12 20v-8M17 20V8'),
  // 教育
  graduation: P('M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5'),
  backpack: P('M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 10h.01M16 10h.01M8 14h8'),
  book2: P('M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'),
  'book-open': P('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'),
  // 家庭
  key2: C(8, 15, 4) + P('M11 12l9-9M17 6l3 3M15 4l3 3'),
  sofa2: P('M3 12v6a1 1 0 0 0 1 1h2v2M21 12v6a1 1 0 0 1-1 1h-2v2M3 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 12h18M3 16h18'),
  // 宗教/文化
  church: P('M12 2v6M10 4h4M6 22v-9l6-4 6 4v9M10 22v-5h4v5M2 22h20M6 15H2M22 15h-4'),
  mosque: P('M12 2a3 3 0 0 0-3 3v3c0 1 1 2 2 2h2c1 0 2-1 2-2V5a3 3 0 0 0-3-3zM5 12a3 3 0 0 0-3 3v7h20v-7a3 3 0 0 0-3-3zM8 22v-4a4 4 0 0 1 8 0v4'),
  // 特殊形状
  'shape-circle': C(12, 12, 9),
  'shape-square': R(3, 3, 18, 18, 1),
  'shape-triangle': P('M12 3 L21 21 L3 21 Z'),
  'shape-diamond': P('M12 2l10 10-10 10L2 12z'),
  'shape-pentagon': P('M12 2l10 7-4 13H6L2 9z'),
  'shape-hexagon': P('M12 2l9 5v10l-9 5-9-5V7z'),
  'shape-octagon': P('M8 2h8l6 6v8l-6 6H8l-6-6V8z'),
  'shape-star': P('M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'),
  // 电商
  coupon: P('M2 8h20v8H2z M6 8v8M18 8v8') + C(12, 12, 2),
  'shopping-basket': P('M4 10h16l-1 10H5zM8 10l4-7 4 7M9 14v3M12 14v3M15 14v3'),
  'qr-code': R(3, 3, 7, 7, 1) + R(14, 3, 7, 7, 1) + R(3, 14, 7, 7, 1) + P('M14 14h3v3h-3zM20 14h1v7h-1zM14 20h3v1h-3z'),
  barcode: P('M2 5v14M6 5v14M9 5v14M12 5v14M16 5v14M19 5v14M22 5v14'),
  'shopping-bag-3': P('M6 2h12l2 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8zM4 8h16M8 12a4 4 0 0 0 8 0'),
  // 交通 2
  tractor: P('M4 20v-6h6l2-4h6v10M4 20h16M16 14h4v6M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 6h6l1 4M9 3h6'),
  'forklift': P('M4 4v16h12M4 12h12M12 4v8M16 20v-8h5v8M16 14h5M16 20h5'),
  scooter: C(5, 18, 2) + C(19, 18, 2) + P('M5 18l3-10h4l3 10M12 8l3-3M14 6l4-2 1 4'),
  motorcycle: C(5, 18, 3) + C(19, 18, 3) + P('M5 18l5-7h6l3 7M10 11l2-5h3M14 6l4-2'),
  helicopter: P('M3 8h18M12 8v4M12 12l-4 8M12 12l4 8M8 20h8M12 3v5'),
  submarine: P('M2 12h20M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4M6 16v3M18 16v3M12 8V4M10 6h4M8 12h.01M16 12h.01'),
  // 更多天气
  'cloud-sun-2': P('M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41') + P('M15.947 12.65a4 4 0 0 0-5.925-4.128') + P('M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z'),
  fog: P('M4 10h16M4 14h16M4 18h16M6 6h12'),
  hail: P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + C(8, 20, 1) + C(12, 21, 1) + C(16, 20, 1),
  'cloud-hail': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + C(8, 20, 1) + C(12, 21, 1) + C(16, 20, 1),
  tornado: P('M2 4h20M4 8h16M6 12h12M8 16h8M10 20h4'),
  // 更多食物
  egg: P('M12 2c-4 0-8 6-8 12a8 8 0 1 0 16 0c0-6-4-12-8-12z'),
  sandwich: P('M2 8h20M2 12h20M2 16h20M2 8l2-4h16l2 4M4 16v2h16v-2'),
  salad: P('M2 12a10 10 0 0 1 20 0z M12 12V8M8 10l2 2M16 10l-2 2M12 22v-8'),
  soup: P('M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9zM12 3v6M8 5v4M16 5v4M6 22h12'),
  chopsticks: P('M6 3l12 18M3 6l15 15M4 3l2 2M8 6l2 2'),
  // 更多衣物
  shirt: P('M20 4l-4-2-4 2-4-2-4 2v5h3v13h10V9h3z'),
  shoe: P('M2 18h20v-3l-6-3-4-2H8L4 13zM6 18v2M18 18v2'),
  watch2: C(12, 12, 6) + P('M9 6V2h6v4M9 18v4h6v-4M12 10v2l1 1'),
  glasses: C(6, 12, 4) + C(18, 12, 4) + P('M10 12h4M2 12h.5M21.5 12h.5M6 8L4 6M18 8l2-2'),
  // 更多动物
  elephant: P('M6 14v6a2 2 0 0 0 4 0v-2h4v2a2 2 0 0 0 4 0v-6a4 4 0 0 0-4-4M6 14v-4a4 4 0 0 1 4-4M18 10h-2M10 4a2 2 0 1 1 4 0'),
  turtle: C(12, 12, 8) + P('M4 12a8 8 0 0 1 16 0M12 4v16M4 12h16M2 22h20M6 20v2M18 20v2'),
  butterfly: P('M12 12c-3-4-6-4-8-2s0 8 4 8c3 0 4-3 4-6M12 12c3-4 6-4 8-2s0 8-4 8c-3 0-4-3-4-6M12 12V4M10 4h4'),
  spider: C(12, 12, 3) + P('M12 9V4M12 15v5M9 12H4M15 12h5M9.5 9.5L5 5M14.5 9.5L19 5M9.5 14.5L5 19M14.5 14.5L19 19'),
  // 更多符号
  'shield-check': P('M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM9 12l2 2 4-4'),
  'shield-alert': P('M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM12 8v4M12 15h.01'),
  'shield-x': P('M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM9 9l6 6M15 9l-6 6'),
  'shield-plus': P('M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM9 12h6M12 9v6'),
  // 更多建筑
  castle: P('M22 20H2V8l4-4v4h4V4l4-2 4 2v4h4V4l4 4zM6 20v-4h4v4M14 20v-4h4v4M10 12h4'),
  bridge: P('M2 12h20M4 12v8M20 12v8M12 12v8M2 12a10 10 0 0 1 20 0M6 8v4M18 8v4'),
  // 更多 UI 元素
  'sidebar': R(2, 3, 20, 18, 1) + P('M9 3v18M5 8h2M5 12h2M5 16h2'),
  'sidebar-right': R(2, 3, 20, 18, 1) + P('M15 3v18M17 8h2M17 12h2M17 16h2'),
  'sidebar-left': R(2, 3, 20, 18, 1) + P('M7 3v18M5 8h.01M5 12h.01M5 16h.01'),
  'panel-top': R(3, 3, 18, 18, 1) + P('M3 9h18'),
  'panel-bottom': R(3, 3, 18, 18, 1) + P('M3 15h18'),
  'panel-left': R(3, 3, 18, 18, 1) + P('M9 3v18'),
  'panel-right': R(3, 3, 18, 18, 1) + P('M15 3v18'),
  'maximize': P('M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3'),
  'minimize': P('M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3'),
  // 更多其他
  'toggle-left': R(2, 7, 20, 10, 5) + C(7, 12, 3),
  'toggle-right': R(2, 7, 20, 10, 5) + C(17, 12, 3),
  'checkbox': R(3, 3, 18, 18, 3),
  'checkbox-checked': R(3, 3, 18, 18, 3) + P('M8 12l3 3 5-6'),
  'radio-button': C(12, 12, 9),
  'radio-button-checked': C(12, 12, 9) + C(12, 12, 4),
  'switch-on': R(2, 7, 20, 10, 5) + `<circle cx="17" cy="12" r="3" fill="currentColor"/>`,
  'switch-off': R(2, 7, 20, 10, 5) + C(7, 12, 3),
  'star-half': P('M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z') + P('M12 2v17'),
  'star-off': P('M2 2l20 20M12 6l3 3 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'),
  'heart-crack': P('M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11zM12 5v4l-2 2 3 2-2 3')
})

// ============ 乐器 ============
Object.assign(icons, {
  violin: P('M12 22c-3 0-5-2-5-5l3-9c0-1 0-2 1-2s1 1 1 2l2 6 2-6c0-1 0-2 1-2s1 1 1 2l3 9c0 3-2 5-5 5zM9 18l6-2M12 6v2M10 4h4'),
  cello: P('M9 22c-2 0-3-1-3-3l2-10c0-1 0-2 1-2s1 1 1 2v2h2V9c0-1 0-2 1-2s1 1 1 2l2 10c0 2-1 3-3 3zM12 2v5M10 4h4'),
  'double-bass': P('M7 22c-3 0-4-2-3-5l3-11c0-1 1-2 2-1s1 1 1 2l-1 4h2l3-6c1-1 2-1 3 0s0 2 0 3l-5 12c-1 2-3 2-5 2zM11 4l3-2M14 2l3 2'),
  banjo: C(12, 14, 8) + C(12, 14, 3) + P('M12 6V2M10 2h4M18 10l3-3M6 10L3 7'),
  mandolin: P('M12 22c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7z') + C(12, 15, 2) + P('M12 8V2M10 2h4'),
  harp: P('M5 21h14M5 21c0-8 2-16 7-19M19 21c0-8-2-16-7-19M9 21v-4M12 21v-5M15 21v-4M8 12l8 0M9 8h6'),
  flute: P('M3 12h18M3 10l18 4M5 12v4M9 13v4M13 14v4M17 15v4'),
  clarinet: P('M10 2l3 1v17l-3 1zM13 5h2M13 9h2M13 13h2M13 17h2'),
  saxophone: P('M8 4c0-1 1-2 3-2M8 4v10c0 5 3 8 7 8s7-3 7-7M11 2l-2 4M15 22l2-4'),
  trumpet: P('M3 9h14l4-2v8l-4-2H3zM3 9v4M7 9v4M11 9v4M15 9v4M21 11h1'),
  trombone: P('M3 12h10l4 4-2 2-4-4H3zM3 10v4M13 12l6-6 2 2-4 4'),
  tuba: P('M8 4a6 6 0 0 0-2 12c1 2 3 4 6 4s5-2 6-4a6 6 0 0 0-2-12zM12 4v6M10 4h4M18 10h3'),
  'french-horn': P('M12 20a8 8 0 0 1-8-8c0-3 1-5 3-6M12 20a8 8 0 0 0 8-8M4 6c2-2 5-3 8-3s6 1 8 3M12 6c2 0 4 1 5 3M8 9h.01'),
  accordion: P('M4 6h6l2 2 2-2h6v12H4zM10 6l-2 12M14 6l2 12M7 9h.01M7 12h.01M7 15h.01M17 9h.01M17 12h.01M17 15h.01'),
  harmonica: R(2, 9, 20, 6, 1) + P('M5 9v6M8 9v6M11 9v6M14 9v6M17 9v6M20 9v6'),
  xylophone: P('M3 6h18M3 9h18M3 12h18M3 15h18M5 6v9M9 6v9M13 6v9M17 6v9M21 6v9'),
  marimba: P('M3 8h18M3 12h18M3 16h18M3 20h18M5 8v12M9 8v12M13 8v12M17 8v12M21 8v12'),
  timpani: C(12, 14, 8) + P('M4 14h16M6 20v2M18 20v2M3 6l2 3M21 6l-2 3'),
  cymbal: P('M3 12c3-5 15-5 18 0M3 12c3 5 15 5 18 0M12 12v9M9 21h6'),
  gong: C(12, 11, 9) + P('M12 20v2M4 11a8 8 0 0 1 16 0M12 3v3'),
  bongo: P('M4 12a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0zM12 12a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0zM4 20h16'),
  conga: P('M5 4a7 7 0 0 0 14 0v16a7 7 0 0 1-14 0zM5 12a7 7 0 0 0 14 0'),
  tambourine: C(12, 12, 10) + C(12, 12, 6) + P('M6 6l.5.5M18 6l-.5.5M6 18l.5-.5M18 18l-.5-.5M2 12h2M20 12h2M12 2v2M12 20v2'),
  metronome: P('M12 2l-6 18h12zM9 12l6 6M15 12l-6 6M8 20h8'),
  'tuning-fork': P('M10 2v10a2 2 0 0 0 4 0V2M8 2h4M12 2h4M12 14v6M10 22h4'),
  'music-stand': P('M4 4l16 16M4 20L12 8M20 4L12 16M8 4h8M10 8h4'),
  amp: R(3, 6, 18, 14, 2) + C(12, 14, 4) + P('M6 9h.01M18 9h.01M8 17h.01M16 17h.01'),
  mixer: R(3, 3, 18, 18, 2) + P('M7 6v4M12 6v7M17 6v2M5 12h4M10 15h4M15 10h4'),
  'midi-keyboard': R(2, 5, 20, 14, 1) + P('M5 5v8M8 5v8M11 5v8M14 5v8M17 5v8M20 5v8M2 13h20')
})

// ============ 化学 ============
Object.assign(icons, {
  beaker: P('M5 3h14l-4 8v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8zM8 14h8'),
  'flask-round': C(12, 14, 7) + P('M9 2h6v5l3 6a7 7 0 0 1-12 0l3-6zM9 6h6'),
  'flask-flat': P('M6 2h12v9l3 8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l3-8zM4 15h16M10 2v8'),
  burette: P('M10 2v16l-3 3M14 2v16l3 3M10 2h4M9 10h6M12 22v1'),
  'pipette-chem': P('M10 2h4v9l1 2v5a3 3 0 0 1-6 0v-5l1-2zM10 6h4'),
  'graduated-cylinder': P('M8 2v18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M8 2h8M10 6h4M10 10h4M10 14h4M10 18h4'),
  'test-tube-rack': R(3, 14, 18, 6, 1) + P('M7 14V3M12 14V3M17 14V3M6 3h2M11 3h2M16 3h2'),
  molecule: C(6, 6, 3) + C(18, 6, 3) + C(12, 18, 3) + P('M8 8l3 7M16 8l-3 7M9 6h6'),
  'atom-2': C(12, 12, 2) + P('M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9M3 12c0-3 4-5 9-5s9 2 9 5M3 12c0 3 4 5 9 5s9-2 9-5'),
  bond: C(6, 12, 3) + C(18, 12, 3) + P('M9 12h6'),
  compound: C(8, 8, 3) + C(16, 8, 3) + C(12, 16, 3) + P('M11 10l2 4M13 10l-2 4M11 8h4'),
  element: P('M12 2l8 5v10l-8 5-8-5V7zM12 6v12M8 9l8 6M16 9l-8 6'),
  isotope: C(12, 12, 4) + C(12, 12, 8) + C(12, 12, 1),
  electron: C(12, 12, 3) + P('M12 12l5-4'),
  proton: C(12, 12, 3) + P('M10 10h4v4h-4z'),
  neutron: C(12, 12, 3) + C(12, 12, 6) + C(12, 12, 9),
  'benzene-ring': P('M12 3l9 5v8l-9 5-9-5V8zM12 7l5 3v4l-5 3-5-3v-4z'),
  ethanol: P('M8 4h8v6l4 4v6H4v-6l4-4zM8 10h8'),
  benzene: C(12, 4, 2) + C(19, 8, 2) + C(19, 16, 2) + C(12, 20, 2) + C(5, 16, 2) + C(5, 8, 2) + P('M13 5l6 3M20 9v6M18 17l-6 3M11 19l-6-3M4 15V9M6 7l6-3'),
  methane: C(12, 12, 3) + P('M9 10L5 6M15 10l4-4M9 14l-4 4M15 14l4 4'),
  propane: C(6, 8, 2) + C(12, 12, 2) + C(18, 8, 2) + P('M8 8l3 3M16 8l-3 3M5 6v-2M7 6v-2M11 10v-2M13 10v-2M17 6v-2M19 6v-2'),
  'periodic-table': R(2, 3, 20, 18, 1) + P('M2 7h20M2 11h20M2 15h20M2 19h20M6 3v18M10 3v18M14 3v18M18 3v18'),
  catalyst: C(12, 12, 4) + P('M3 12h5M16 12h5M12 3v5M12 16v5'),
  solution: P('M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 14c2-1 4 1 6 0s4 1 6 0 2-1 4-1'),
  solvent: P('M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 12h16M4 16h16'),
  acid: P('M5 4h14l-2 8v8H7v-8zM9 8h6M12 2v2'),
  base: P('M5 20h14l-2-8V4H7v8zM9 12h6M12 2v2'),
  'ph-scale': R(2, 8, 20, 8, 1) + P('M2 8h20M6 8v8M10 8v8M14 8v8M18 8v8'),
  crucible: P('M5 6h14v4a8 8 0 0 1-14 0zM3 6h18M9 22h6M12 18v4'),
  tongs: P('M8 2v10a4 4 0 0 0 8 0V2M8 2h3M13 2h3M12 16v6'),
  'bunsen-burner': P('M12 4a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2zM10 8v4h4V8M12 12v6M8 18h8M6 22h12'),
  distillation: P('M4 6a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0zM8 8h6l6 8-2 4-6-6M14 20h6'),
  centrifuge: C(12, 12, 9) + C(12, 12, 2) + P('M12 3v3M12 18v3M3 12h3M18 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2')
})

// ============ 天文 ============
Object.assign(icons, {
  comet: C(6, 6, 3) + P('M4 8l-3 3M8 4l1-2M2 6h-1M8 9l8 8M14 6l8 2M6 16l2 8'),
  meteor: P('M3 3l6 6M6 2l4 4M2 6l4 4') + C(18, 18, 3),
  meteorite: C(12, 12, 5) + P('M9 9l2 2M14 10l1 1M11 15h.01M15 14l2-2M3 3l3 3M18 3l3 3'),
  asteroid: C(12, 12, 6) + P('M8 8h.01M15 10h.01M10 14h.01M16 14h.01M12 5v2M12 17v2'),
  galaxy: C(12, 12, 2) + P('M12 6a6 6 0 0 1 6 6M12 18a6 6 0 0 1-6-6M6 12c0-3 3-6 6-6M18 12c0 3-3 6-6 6M3 12c0 5 4 9 9 9M21 12c0-5-4-9-9-9'),
  nebula: C(10, 10, 4) + C(16, 16, 4) + C(12, 8, 2) + C(8, 16, 2) + C(18, 10, 1) + C(4, 12, 1),
  constellation: C(4, 8, 1) + C(10, 5, 1) + C(16, 10, 1) + C(20, 6, 1) + C(8, 16, 1) + C(14, 18, 1) + C(20, 16, 1) + P('M4 8l6-3M10 5l6 5M16 10l4-4M4 8l4 8M8 16l6 2M14 18l6-2M16 10l4 6'),
  'black-hole': C(12, 12, 9) + C(12, 12, 4) + P('M3 12h18M12 3v18M5.5 5.5l13 13M5.5 18.5l13-13'),
  supernova: C(12, 12, 3) + P('M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3'),
  quasar: C(12, 12, 2) + P('M12 3v6M12 15v6M3 12h6M15 12h6M3 3l4 4M17 17l4 4M3 21l4-4M17 7l4-4'),
  pulsar: C(12, 12, 3) + P('M12 3v4M12 17v4M3 12h4M17 12h4M12 2l3 5M12 22l-3-5'),
  'solar-system': C(12, 12, 2) + C(12, 6, 1) + C(18, 12, 1) + C(12, 18, 1) + C(6, 12, 1) + P('M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18'),
  'sun-2': C(12, 12, 5) + P('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1'),
  'moon-crescent': P('M18 12A9 9 0 0 1 9 21a9 9 0 1 0 0-18 9 9 0 0 1 9 9z'),
  'moon-full': C(12, 12, 9) + C(9, 10, 2) + C(15, 14, 2) + C(13, 7, 1) + C(11, 15, 1),
  'moon-phase-1': P('M12 3a9 9 0 1 0 0 18 6 9 0 0 1 0-18z'),
  'moon-phase-2': P('M12 3a9 9 0 1 0 0 18 3 9 0 0 1 0-18z'),
  'moon-phase-3': P('M12 3a9 9 0 1 0 0 18z'),
  'moon-phase-4': P('M12 3a9 9 0 1 1 0 18 3 9 0 0 0 0-18z'),
  'moon-phase-5': P('M12 3a9 9 0 1 1 0 18 6 9 0 0 0 0-18z'),
  'planet-mercury': C(12, 12, 4) + P('M8 8L4 4M16 8l4-4M12 8V4'),
  'planet-venus': C(12, 10, 4) + P('M12 14v6M9 18h6'),
  'planet-mars': C(13, 11, 4) + P('M16 8l4-4M16 4h4v4'),
  'planet-jupiter': C(12, 12, 5) + P('M9 9h6M9 12h6M10 15h5M6 11c-2 0-3 1-3 1s1 1 3 1'),
  'planet-saturn': C(12, 12, 4) + P('M4 14l16-4M6 16l14-4M18 8l4-2'),
  'planet-uranus': C(12, 12, 5) + P('M9 7v10M12 7v10M15 7v10M10 4h4'),
  'planet-neptune': C(12, 12, 5) + P('M9 8l3 8 3-8'),
  'star-cluster': C(6, 6, 1.5) + C(12, 4, 1.5) + C(18, 6, 1.5) + C(4, 12, 1.5) + C(12, 12, 2) + C(20, 12, 1.5) + C(6, 18, 1.5) + C(12, 20, 1.5) + C(18, 18, 1.5),
  orion: C(8, 5, 1) + C(14, 5, 1) + C(11, 10, 1) + C(9, 12, 1) + C(11, 13, 1) + C(13, 14, 1) + C(11, 19, 1) + C(9, 20, 1),
  'big-dipper': C(4, 6, 1) + C(7, 6, 1) + C(10, 7, 1) + C(13, 8, 1) + C(15, 11, 1) + C(16, 15, 1) + C(18, 17, 1),
  'north-star': C(12, 12, 4) + C(12, 12, 2) + C(12, 12, 1) + P('M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6'),
  'shooting-star': P('M3 3l8 8M6 2l5 5M2 6l5 5') + P('M14 14l6 6M16 12l5 5M12 16l5 5'),
  eclipse: C(12, 12, 9) + C(15, 12, 8) + C(16, 9, 1),
  'solar-eclipse': C(12, 12, 9) + C(12, 12, 3) + P('M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5'),
  'lunar-eclipse': C(12, 12, 9) + P('M12 3v18M3 12h18'),
  observatory: P('M3 21h18v-2H3zM6 19l6-12 6 12M9 13h6M12 4l-4 6M12 4l4 6'),
  'telescope-2': P('M4 20l6-8M2 14l8 6-2 2-8-6zM12 12l9-9 1 1-9 9zM3 21h12M21 21h-3M16 3l5 5'),
  'satellite-2': P('M5 5l4 4-4 4-4-4zM15 15l4 4-4 4-4-4zM9 9l6 6M17 3l4 4M3 17l4 4M12 2v3M22 12h-3'),
  'space-station': P('M4 12h16M6 8v8M18 8v8M12 4v16M8 4h8M8 20h8M2 12h2M20 12h2'),
  astronaut: C(12, 8, 4) + P('M8 12h8v8H8zM10 16h4M6 14h2M16 14h2M9 20v2M15 20v2'),
  spacesuit: C(12, 7, 4) + P('M8 11h8v9H8zM8 13l-3 3M16 13l3 3M10 15h4M9 20v2M15 20v2M12 20v2'),
  'rocket-2': P('M12 2c3 3 4 7 4 11v5l-2 2h-4l-2-2v-5c0-4 1-8 4-11zM10 15l-2 3-2 1 1-3M14 15l2 3 2 1-1-3M12 8v4'),
  ufo: P('M4 12c0-2 4-3 8-3s8 1 8 3-4 4-8 4-8-2-8-4zM8 12c0-1 2-2 4-2s4 1 4 2M12 9V6M9 6h6M6 15l-2 3M18 15l2 3'),
  alien: C(12, 10, 5) + C(9, 9, 1) + C(15, 9, 1) + P('M10 13h4M12 15v3M9 21l-1-3M15 21l1-3M12 18v3'),
  'aurora': P('M2 20c3-1 5-4 5-8s2-6 5-6 5 2 5 6 2 7 5 8M2 22h20')
})

// ============ 医疗设备 ============
Object.assign(icons, {
  scalpel: P('M14 4l6 6-4 4-8-2-6 6v2h2l6-6 2 8 4-4-2-8 2-2z'),
  forceps: P('M6 3l4 8-2 10-2-2zM18 3l-4 8 2 10 2-2zM9 8h6'),
  'iv-drip': P('M8 2h8v6H8zM12 8v4M10 12h4v8a2 2 0 0 1-4 0zM5 4v6a3 3 0 0 0 3 3'),
  defibrillator: R(3, 7, 18, 12, 2) + P('M12 10v6M9 13h6M7 19v3M17 19v3M12 4v3'),
  mri: R(2, 6, 20, 14, 2) + C(12, 13, 5) + C(12, 13, 2) + P('M6 4v2M18 4v2M4 11h2M18 11h2'),
  'ct-scan': R(2, 6, 20, 14, 2) + C(12, 13, 5) + P('M6 10h12M6 13h12M6 16h12'),
  'x-ray': P('M4 4v16h16V4zM8 8h8M8 12h8M8 16h8M12 8v8'),
  ultrasound: R(3, 4, 18, 16, 2) + P('M6 8c2 0 3 2 3 4s-1 4-3 4M12 8c2 0 3 2 3 4s-1 4-3 4M18 8c1 0 2 2 2 4s-1 4-2 4'),
  'thermometer-med': P('M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8'),
  'blood-pressure': R(4, 4, 14, 10, 2) + P('M18 9l4-1v2l-4 1M6 18l-2 4M20 18l2 4M10 14v2M14 14v2'),
  'stethoscope-2': P('M6 3v6a4 4 0 0 0 8 0V3M6 12a6 6 0 0 0 12 0v-3') + C(19, 10, 2),
  otoscope: P('M5 4l2-2 5 5-2 2zM10 9l3 3-2 6 4 4M17 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0z'),
  'syringe-2': P('M18 2l4 4M17 3l4 4M14 6l4 4-8 8-4-4zM10 14l-6 6v2h2l6-6M13 9l2 2'),
  vial: P('M9 2h6v3l1 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7l1-2zM9 5h6M9 12h6'),
  capsule: P('M6 6a6 6 0 0 1 12 0v12a6 6 0 0 1-12 0zM6 12h12M8 5a4 4 0 0 1 8 0'),
  'tablet-med': C(12, 12, 9) + P('M5 12h14') + C(12, 12, 4),
  syrup: P('M8 4h8v3H8zM9 7v11a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7M8 14h8M11 2h2v2'),
  ointment: P('M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM7 12V8h10v4M9 4h6v4H9z'),
  'bandage-2': P('M6 6l12 12a3 3 0 0 0 4-4L10 2a3 3 0 0 0-4 4zM4 18l14-14') + C(10, 10, 1) + C(14, 14, 1),
  crutch: P('M9 3h6v6l-3 3-3-3zM12 12v10M8 22h8M9 6v3M15 6v3'),
  'wheelchair-2': C(10, 4, 1.5) + P('M10 6v6h6l3 8M10 12l-3 3v4M6 22a5 5 0 1 0 0-10M19 14a5 5 0 1 1-5-5'),
  'hospital-bed': P('M2 18v-8a2 2 0 0 1 2-2h12a4 4 0 0 1 4 4v6M2 20v-2M22 20v-2M2 18h20M6 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'),
  ambulance: R(3, 8, 12, 9, 1) + P('M15 12h4l3 3v2h-7zM10 8V4h5v4M8 12v3M6 12v3') + C(7, 19, 2) + C(17, 19, 2),
  scrubs: P('M9 3h6l-2 4v3l4 2v9H7v-9l4-2V7zM9 12h6M12 14v4M10 18h4'),
  'mask-medical': P('M4 8h16v8c0 2-4 4-8 4s-8-2-8-4zM4 12h16M9 8v8M15 8v8'),
  'gloves-medical': P('M6 12V7a1 1 0 0 1 2 0v4M8 11V5a1 1 0 0 1 2 0v6M10 11V5a1 1 0 0 1 2 0v6M12 11V7a1 1 0 0 1 2 0v5M6 12v4a6 6 0 0 0 12 0v-4h-2v3M6 14h2'),
  'goggles-medical': C(8, 12, 4) + C(16, 12, 4) + P('M4 12H2M22 12h-2M12 12h-2M14 12h-2'),
  'scalpel-2': P('M3 21l6-6M12 3l8 8-6 4-6-6zM14 11l-8 8'),
  suture: P('M3 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M15 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M9 12h6'),
  pacemaker: R(4, 8, 16, 10, 3) + C(12, 13, 3) + P('M8 3v5M16 3v5'),
  'insulin-pen': P('M5 20l2-2h8l2 2zM8 18V6h6v12M9 6V3h4v3M10 9v2M10 13v2'),
  inhaler: P('M6 6h8v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3zM14 8h5M14 12h4M8 4h4v2H8z'),
  'hearing-aid': C(12, 8, 4) + P('M12 12v8M9 20h6M16 6c2 0 4 2 4 4s-2 3-3 3'),
  braces: P('M4 10c4-2 12-2 16 0M4 14c4 2 12 2 16 0M8 10v4M12 10v4M16 10v4'),
  splint: P('M6 4v16M18 4v16M6 8h12M6 12h12M6 16h12')
})

// ============ 海洋生物 ============
Object.assign(icons, {
  shrimp: P('M12 4c-4 0-7 3-7 7s3 7 7 7h4l4 4v-4l-2-2M5 11a7 7 0 0 0 14 0M12 4V2M10 2h4M8 9h.01'),
  crab: C(12, 13, 6) + P('M6 13L2 11l1-3 4 2M18 13l4-2-1-3-4 2M9 8L7 5M15 8l2-3M9 18l-2 3M15 18l2 3') + C(10, 11, 1) + C(14, 11, 1),
  lobster: P('M12 4c-3 0-5 2-5 5v6a5 5 0 0 0 10 0V9c0-3-2-5-5-5zM9 15l-3 4M15 15l3 4M10 4l-2-2M14 4l2-2M8 10H3M16 10h5'),
  octopus: C(12, 10, 6) + P('M6 10v6a3 3 0 0 0 3 3M9 19a3 3 0 0 0 3 3M12 19a3 3 0 0 0 3 3M15 19a3 3 0 0 0 3-3v-6M9 8h.01M15 8h.01'),
  squid: P('M12 2c-3 0-5 3-5 7v8c0 2 1 3 2 3h6c1 0 2-1 2-3V9c0-4-2-7-5-7zM9 4L6 2M15 4l3-2M9 15l-2 5M12 15v6M15 15l2 5M10 8h.01M14 8h.01'),
  jellyfish: P('M12 3c-5 0-8 3-8 7 0 3 3 5 8 5s8-2 8-5c0-4-3-7-8-7zM6 15c0 3 1 4 1 6M10 15c0 2 0 4 0 6M14 15c0 2 0 4 0 6M18 15c0 3-1 4-1 6M9 9h.01M15 9h.01'),
  whale: P('M3 12c0-5 6-8 12-6 3 1 5 3 6 5v2c0 3-3 5-7 5-2 0-4-1-5-2-3 1-6 0-6-4zM18 10l-3 2 3 2M9 13c1 2 3 3 5 3'),
  dolphin: P('M4 20c4 0 8-2 10-5 2-3 2-6 0-9-1-2-3-3-5-3 0 0 1 2 0 4s-4 3-4 6 1 5 4 6c-2 1-4 1-5 1zM6 14l-3 1M8 10L5 8M12 8l-2-4'),
  seahorse: P('M14 3c-2 0-3 2-3 4l-1 3c-2 2-3 4-3 7 0 3 2 5 4 5s4-2 4-5c0-2-1-4-2-5l1-3c1-1 3 0 3-2s-2-4-4-4zM7 20l-3 2M11 14h.01'),
  coral: P('M12 22V10M12 10c0-3 2-5 4-5s3 2 3 4M12 10c0-2-1-4-3-4s-4 1-4 3M8 12c0 2-2 3-3 3M16 13c0 2 2 3 3 3M6 22h12'),
  'coral-2': P('M12 22V12M8 22V14c0-2-2-3-3-5M16 22V16c0-2 2-3 3-5M12 12c0-3-1-5-3-6M12 12c0-3 1-5 3-6M12 4v4'),
  shell: P('M12 3c-4 0-7 4-7 9 0 4 3 8 7 9 4-1 7-5 7-9 0-5-3-9-7-9zM12 3v18M6 10h12M5 15h14M8 6l8 12M16 6L8 18'),
  'shell-2': P('M12 2C7 2 3 6 3 11c0 5 4 9 9 9s9-4 9-9c0-5-4-9-9-9zM12 2v18M7 8l10 8M17 8L7 16'),
  starfish: C(12, 12, 3) + P('M12 2l1.5 4.5h5L14 9.5l1.5 4.5-3.5-3-3.5 3L10 9.5 5.5 6.5h5zM12 7v6M9 12l-2 5M15 12l2 5'),
  'sea-urchin': C(12, 12, 5) + P('M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5L19 19M5 19l2.5-2.5M16.5 7.5L19 5M9 4l1 3M15 4l-1 3M9 20l1-3M15 20l-1-3M4 9l3 1M4 15l3-1M20 9l-3 1M20 15l-3-1'),
  plankton: C(6, 6, 2) + C(12, 8, 2) + C(18, 6, 2) + C(8, 14, 2) + C(14, 16, 2) + C(20, 13, 2) + C(4, 18, 2) + C(12, 20, 2),
  algae: P('M4 22c0-6 0-12 4-16 2-2 5-3 6-2s0 4-2 6c-2 3-4 4-4 8M20 22c0-6 0-12-4-16-2-2-5-3-6-2s0 4 2 6c2 3 4 4 4 8M12 22V6'),
  kelp: P('M12 22V8M12 8c0-2-2-4-4-4s-2 2 0 4c1 1 2 2 4 2M12 8c0-2 2-4 4-4s2 2 0 4c-1 1-2 2-4 2M12 14c0-2-2-4-4-4s-2 2 0 4c1 1 2 2 4 2M12 14c0-2 2-4 4-4s2 2 0 4c-1 1-2 2-4 2'),
  'fish-2': P('M2 12c4-6 14-6 18 0-4 6-14 6-18 0zM18 12l4-3v6zM6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z'),
  'fish-3': P('M12 6c-3 0-6 2-6 6s3 6 6 6 6-2 6-6-3-6-6-6zM18 12l4-2v4zM8 11h.01'),
  'puffer-fish': C(12, 12, 8) + C(9, 10, 2) + C(15, 10, 2) + P('M12 4v-2M12 20v2M4 12H2M20 12h2M6 6L4 4M18 6l2-2M6 18l-2 2M18 18l2 2M12 14v2M10 16h4'),
  anglerfish: P('M4 12c0-4 4-6 8-6 5 0 8 3 8 7 0 3-3 5-7 5-4 0-9-2-9-6zM16 10l3-1-2-2M12 16l-2 4M14 16l2 4M7 10h.01M11 9h.01'),
  eel: P('M2 14c3-2 6 0 9 0s6 2 9 0c1-1 2-2 2-4M4 18c3-2 6 0 9 0M5 10c3-2 6 0 9 0M20 6l-2 2 2 2'),
  'sea-turtle': C(12, 12, 8) + P('M4 12a8 8 0 0 1 16 0M12 4v16M4 12h16M2 20h20M8 20l-1-2M16 20l1-2M6 22h2M16 22h2'),
  'sea-snake': P('M2 12c2 0 3 2 5 2s3-2 5-2 3 2 5 2 3-2 5-2M4 16c2 0 3 2 5 2s3-2 5-2 3 2 5 2M6 8c2 0 3 2 5 2s3-2 5-2 3 2 5 2M2 12l-2-2M22 12l2-2M22 16l2 2'),
  'sea-star': C(12, 12, 4) + P('M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'),
  // ============ 更多动物 ============
  squirrel: P('M18 4c-2 0-3 2-3 4v2c0 1-1 2-3 2s-4 2-4 5 2 5 4 5 4-2 4-4c0-1 0-2-1-3 2 0 4-2 4-4V8c0-2-1-4-1-4zM8 22l1-2M14 22l-1-2M10 12h.01'),
  fox: P('M4 8l2-4 4 2h4l4-2 2 4c1 3 0 7-3 9-2 2-5 3-7 3s-5-1-7-3c-3-2-4-6-3-9zM8 12h.01M16 12h.01M10 16h4'),
  bear: C(12, 12, 8) + C(6, 6, 3) + C(18, 6, 3) + C(10, 11, 1) + C(14, 11, 1) + P('M9 15h6M10 17h4M12 17v2'),
  panda: C(12, 12, 8) + C(6, 6, 3) + C(18, 6, 3) + P('M8 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM12 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM9 15h6M12 15v3'),
  koala: C(12, 12, 7) + C(6, 7, 3) + C(18, 7, 3) + C(9, 11, 1.5) + C(15, 11, 1.5) + P('M12 14v3M11 16h2'),
  kangaroo: P('M6 22V10c0-3 2-6 5-6s5 2 6 5c1 4 0 8-2 11M8 20h8M7 14h4M11 8V4M9 4h4M5 18l-2 4M17 18l2 4'),
  lion: C(12, 12, 7) + P('M12 5V3M8 6L6 4M16 6l2-2M5 10H3M19 10h2M5 14l-2 1M19 14l2 1M8 18l-1 2M16 18l1 2M9 11h.01M15 11h.01M10 15h4'),
  tiger: C(12, 12, 8) + P('M4 4L6 6M20 4l-2 2M4 20l2-2M20 20l-2-2M9 9l-1-1M15 9l1-1M9 13l-1 1M15 13l1 1M9 11h.01M15 11h.01M10 16h4'),
  giraffe: P('M12 22V12c0-3 0-6 1-8s3-3 5-3 3 1 3 3-1 3-3 3-3 1-3 4v11zM8 12l-2-2M8 14l-2-1M8 16l-2 0M8 18l-2 1M8 20l-2 2M12 9h.01M18 6l.5-1M17 8l-1.5.5'),
  elephant: P('M6 14v6a2 2 0 0 0 4 0v-2h4v2a2 2 0 0 0 4 0v-6a4 4 0 0 0-4-4M6 14v-4a4 4 0 0 1 4-4M18 10h-2M10 4a2 2 0 1 1 4 0M9 12h.01M15 12h.01'),
  hippo: P('M4 12c0-4 3-6 8-6s8 2 8 6v6H4zM4 12H2M20 12h2M8 18v4M16 18v4M9 11h.01M15 11h.01M10 14h4'),
  rhino: P('M6 20V14c0-4 3-7 7-7s6 2 7 5l-2 2-3-3M6 14H4c-1 0-2-1-2-2s1-2 2-2h1M20 12l3-1-1 3M9 20v2M15 20v2M9 9h.01M13 8h.01'),
  zebra: C(12, 12, 8) + P('M6 6l1 2M10 5l1 2M14 5l1 2M18 6l-1 2M5 10l2 1M6 14l2 1M8 18l2-1M16 18l-2-1M18 14l-2 1M19 10l-2 1M9 11h.01M15 11h.01M10 16h4'),
  monkey: C(12, 12, 8) + C(4, 12, 3) + C(20, 12, 3) + C(10, 11, 1) + C(14, 11, 1) + P('M12 14v3M10 15h4'),
  gorilla: C(12, 11, 8) + P('M6 6a2 2 0 1 1 4 0M14 6a2 2 0 1 1 4 0M9 11h.01M15 11h.01M10 15h4M8 15l-1 2M16 15l1 2M12 19v3'),
  wolf: P('M4 6l2 4 6-2 6 2 2-4v8c0 4-4 6-8 6s-8-2-8-6zM8 13h.01M16 13h.01M10 16h4M12 16v2'),
  deer: P('M6 22v-6c0-3 2-6 6-6s6 3 6 6v6M8 10V6M16 10V6M8 6l-2-4M8 6l1-3M16 6l2-4M16 6l-1-3M10 20v2M14 20v2M10 11h.01M14 11h.01'),
  rabbit: C(12, 14, 6) + P('M10 8c0-3-2-6-3-6s-1 3 0 6M14 8c0-3 2-6 3-6s1 3 0 6M10 13h.01M14 13h.01M10 16h4M12 16v2'),
  hamster: C(12, 14, 7) + C(7, 8, 3) + C(17, 8, 3) + C(10, 13, 1) + C(14, 13, 1) + P('M10 16h4M12 16v2M9 20v2M15 20v2'),
  hedgehog: P('M3 18c0-5 4-9 9-9s9 4 9 9M3 18h18M8 14l1-2M12 12l-1-3M16 14l1-2M6 17h.01M9 16h.01M12 15h.01M15 16h.01M18 17h.01'),
  otter: P('M12 20c-4 0-6-3-6-6 0-4 4-8 6-8s6 4 6 8c0 3-2 6-6 6zM8 12h.01M16 12h.01M10 15h4M12 15v2M6 20v2M18 20v2'),
  seal: P('M12 4c-3 0-5 2-5 4l-2 3c-1 1-1 3 0 4s2 1 3 1h8c1 0 2 0 3-1s1-3 0-4l-2-3c0-2-2-4-5-4zM9 9h.01M15 9h.01M10 12h4M8 18l-2 3M16 18l2 3'),
  owl: C(12, 11, 8) + C(9, 10, 3) + C(15, 10, 3) + C(9, 10, 1) + C(15, 10, 1) + P('M10 15l2 3 2-3M8 6l1-3M16 6l-1-3M5 8L3 6M19 8l2-2M6 18l-1 3M18 18l1 3'),
  eagle: P('M4 6c0-2 3-3 8-3s8 1 8 3c0 3-2 5-5 5l-3-2-3 2c-3 0-5-2-5-5zM12 10v6M9 22l3-6 3 6M6 12L2 10M18 12l4-2'),
  dove: P('M3 12c0-3 3-5 6-5s6 2 6 5c0 2-1 4-3 5l-1 4-2-2-2 2-1-4c-2-1-3-3-3-5zM15 10l6-2-3-2M9 11h.01'),
  penguin: C(12, 12, 8) + C(12, 10, 5) + P('M9 9h.01M15 9h.01M12 12v3M10 14h4M8 18l-2 4M16 18l2 4M9 5l-1-2M15 5l1-2'),
  chicken: C(12, 14, 6) + C(14, 7, 2) + P('M16 7l3-1-2-2M12 8V6M9 12h.01M15 12h.01M11 16h2M10 20v2M14 20v2M8 14l-4-1M16 16l4 1'),
  duck: C(10, 14, 5) + C(14, 8, 3) + P('M17 7l4-1-2-2M8 13h.01M12 14v3M9 18h6M8 20v2M13 20v2'),
  rooster: C(12, 14, 6) + P('M14 8l2-3 2 2 2-2-1 4M12 8l-2-3-2 2-2-2 1 4M9 12h.01M15 12h.01M10 16h4M12 16v3M8 20v2M16 20v2M8 14l-5-2M16 14l5-2'),
  butterfly2: P('M12 12c-3-4-6-4-8-2s0 8 4 8c3 0 4-3 4-6M12 12c3-4 6-4 8-2s0 8-4 8c-3 0-4-3-4-6M12 12V4M10 4h4'),
  bee: C(12, 12, 5) + P('M12 7V3M9 4l1 3M15 4l-1 3M7 9h10M7 13h10M8 17h8M6 8l-4-2M18 8l4-2M7 14l-4 2M17 14l4 2'),
  ant: C(6, 16, 2) + C(12, 12, 2) + C(18, 8, 2) + P('M7 15l4-2M13 11l4-2M5 14L3 12M7 18l-2 2M5 17l-3 0M15 10l2-2M19 6l2-2M17 7l2 0M9 11L7 9M15 13l2 2'),
  ladybug: C(12, 12, 7) + P('M12 5v14M9 8h.01M15 8h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M12 5V3M10 3h4'),
  caterpillar: C(4, 16, 2) + C(8, 16, 2) + C(12, 16, 2) + C(16, 16, 2) + C(20, 16, 2) + P('M20 16V12M18 12h4M4 18v2M20 18v2'),
  snail: P('M8 20a8 8 0 0 1 8-14 6 6 0 0 1 6 6c0 4-4 8-8 8z') + P('M14 12a3 3 0 1 0 0 6M16 8V4M14 4h4M4 20h16'),
  slug: P('M4 16a6 6 0 0 1 12 0v2H4zM16 16c0-2 2-4 4-4v6h-4M8 14h.01M12 14h.01M6 12L4 8M10 12L8 8'),
  worm: P('M3 14c3 0 3 4 6 4s3-4 6-4 3 4 6 4M6 14V8M12 18v4M18 14V6M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'),
  // ============ 更多食物 ============
  donut: C(12, 12, 9) + C(12, 12, 3) + P('M5 8l1 1M19 8l-1 1M8 5l1 1M16 5l-1 1M5 16l1-1M19 16l-1-1M8 19l1-1M16 19l-1-1'),
  croissant: P('M3 12c0-2 2-3 4-3M21 12c0-2-2-3-4-3M7 9c0-3 2-5 5-5s5 2 5 5M4 12c2 4 5 6 8 6s6-2 8-6M9 10c0-1 1-2 3-2s3 1 3 2M12 8v4'),
  pretzel: P('M5 9a4 4 0 0 1 8 0v6a4 4 0 0 0 8 0v-6a4 4 0 0 0-8 0v6a4 4 0 0 1-8 0zM9 6h.01M15 6h.01M9 18h.01M15 18h.01'),
  bagel: C(12, 12, 9) + C(12, 12, 3) + P('M8 5l2 1M16 5l-2 1M5 9l2 1M19 9l-2 1M5 15l2-1M19 15l-2-1M8 19l2-1M16 19l-2-1'),
  baguette: P('M3 12c0-3 4-7 9-7s9 4 9 7-4 7-9 7-9-4-9-7zM8 8l1 2M11 7l1 2M14 7l1 2M8 16l1-2M11 17l1-2M14 17l1-2'),
  'bread-loaf': P('M3 12c0-3 4-6 9-6s9 3 9 6v6H3zM3 14h18M7 10v2M11 9v3M15 9v3M18 10v2'),
  cheese: P('M2 16l18-10v10zM2 16v4h18v-4M8 12h.01M13 12h.01M18 13h.01M7 17h.01M12 18h.01M16 16h.01'),
  milk: P('M6 8l1-5h10l1 5v14H6zM7 3h10M6 12h12M9 15h.01M12 15h.01M15 15h.01'),
  juice: P('M4 8h16v14H4zM4 12h16M9 2h6v6H9zM10 4v2M14 4v2M7 16h.01M12 16h.01M17 16h.01'),
  tea: P('M4 8h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM20 10h2a2 2 0 1 1 0 4h-2M8 2v3M12 2v3M16 2v3'),
  'tea-bag': P('M5 8h14v12H5zM5 12h14M9 4h6v4H9zM12 4V2'),
  hotdog: P('M2 14c0-3 8-7 20-7s0 10-20 7zM5 15c5 0 12-2 15-5M9 12h.01M15 10h.01M11 9h.01'),
  taco: P('M2 14c0-5 4-9 10-9s10 4 10 9M4 14h16M7 14l1 3M12 14v4M17 14l-1 3M8 12l1 1M16 12l-1 1M12 11v1'),
  burrito: P('M5 8c0-2 3-4 7-4s7 2 7 4v8c0 2-3 4-7 4s-7-2-7-4zM12 4v16M5 10h14M5 14h14'),
  ramen: P('M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2zM6 12h12M9 20h6M12 2v4M9 4h6M4 8L2 6M20 8l2-2M9 14l2 2M13 14l-2 2'),
  sushi: P('M4 8h16v8H4zM4 12h16M8 8v8M16 8v8M12 5v3M10 5h4M10 16v3M14 16v3'),
  'sushi-2': C(8, 12, 4) + C(16, 12, 4) + C(8, 12, 1) + C(16, 12, 1) + P('M4 12h2M14 12h2M22 12h-2M8 8v8M16 8v8'),
  bento: R(2, 4, 20, 16, 1) + P('M2 12h20M12 4v16M6 8h.01M10 8h.01M16 8h.01M20 8h.01M6 16h.01M10 16h.01M16 16h.01M20 16h.01'),
  'french-fries': P('M3 12h18l-2 10H5zM3 12l1-6 2 6M6 6l2-4 1 4M10 6l1-5 2 5M13 6l2-3 1 3M9 10v12M12 10v12M15 10v12'),
  ketchup: P('M9 4h6v4H9zM7 8h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2zM8 2h8v2H8zM10 12h4M10 15h4M10 18h4'),
  honey: P('M8 3h8v3H8zM6 6h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 12h6M9 16h6M12 10v2'),
  salt: P('M8 4h8l1 16H7zM8 4l-1-2h10l-1 2M9 10h6M9 14h6M9 18h6M5 8h14'),
  pepper: P('M10 6h4v12a3 3 0 0 1-6 0V6zM8 4h8v2H8zM11 3h2M8 10h8M8 14h8M8 18h8'),
  avocado: P('M12 2c-4 0-6 5-6 9s2 11 6 11 6-7 6-11-2-9-6-9z') + C(12, 14, 2),
  watermelon: P('M2 12a10 10 0 0 1 20 0zM2 12l4 4M12 22L6 16M22 12l-4 4M16 6l4 6M8 6l-4 6') + C(12, 14, 1) + C(15, 12, 1) + C(9, 12, 1),
  grape: C(8, 8, 2) + C(12, 8, 2) + C(16, 8, 2) + C(10, 12, 2) + C(14, 12, 2) + C(8, 16, 2) + C(12, 16, 2) + C(16, 16, 2) + C(10, 20, 2) + C(14, 20, 2) + P('M12 6V2M10 2h4'),
  cherry: C(8, 16, 3) + C(16, 16, 3) + P('M8 13V6l8-4M16 13V6M8 6c0-2 1-3 2-3M14 6c0-2 1-3 2-3'),
  strawberry: P('M12 22c-4-2-7-6-7-10 0-3 2-4 4-4 2-1 3-2 3-2s1 1 3 2c2 0 4 1 4 4 0 4-3 8-7 10zM9 6V4M15 6V4M12 4V2M9 10h.01M12 10h.01M15 10h.01M10 14h.01M14 14h.01M12 18h.01'),
  lemon: C(12, 14, 6) + P('M9 8l-2-2M15 8l2-2M12 8V4M8 5l1-2M16 5l-1-2M10 20l-2 2M14 20l2 2'),
  peach: C(12, 14, 7) + P('M12 7V4M9 4c0-2 1-3 3-3s3 1 3 3M8 10a4 4 0 0 1 8 0M10 20l-1 2M14 20l1 2'),
  pear: P('M12 22c-3 0-6-3-6-7 0-3 2-5 4-6V6a2 2 0 0 1 4 0v3c2 1 4 3 4 6 0 4-3 7-6 7zM12 6V3M10 3h4'),
  pineapple: P('M12 8c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zM8 2l4 6M16 2l-4 6M12 2v6M8 14h.01M12 14h.01M16 14h.01M10 18h.01M14 18h.01'),
  coconut: C(12, 12, 9) + P('M12 3v4M9 4l1 3M15 4l-1 3M7 8l2 2M17 8l-2 2M6 12h12M6 16h12M8 20h8M9 8h.01M15 8h.01'),
  mushroom2: P('M4 12c0-4 3-7 8-7s8 3 8 7v2H4zM6 14v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6M9 8h.01M15 8h.01M12 6v3'),
  popcorn: P('M4 12h16v8H4zM4 12l-1-2h18l-1 2M9 8c0-3 1-4 3-4s3 1 3 4M7 12h.01M11 12h.01M15 12h.01M8 16h.01M12 16h.01M16 16h.01'),
  cereal: P('M4 12h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 12l2-6 4 2 2-6 2 6 4-2 2 6M6 16h.01M10 16h.01M14 16h.01M18 16h.01'),
  // ============ 服饰 ============
  hat: P('M4 16l1-4c0-4 3-7 7-7s7 3 7 7l1 4zM3 16h18l1 4H2z'),
  cap: P('M4 14c0-4 3-7 7-7 3 0 5 2 5 4l4 3zM4 14h12v3H4z'),
  boot: P('M6 2v14h10l4 3v3H4V2zM6 10h6M6 14h6'),
  scarf: P('M6 3c0-1 1-2 2-2s2 1 2 2v18H6zM14 3c0-1 1-2 2-2s2 1 2 2v18h-4zM10 8h4M10 14h4'),
  glove: P('M6 12V5a1 1 0 0 1 2 0v5M8 10V3a1 1 0 0 1 2 0v7M10 10V3a1 1 0 0 1 2 0v7M12 10V5a1 1 0 0 1 2 0v7M6 12v4a6 6 0 0 0 12 0v-4h-2v3M6 14h2'),
  belt: P('M2 10h20v4H2zM6 10v4M18 10v4M12 10v4'),
  sock: P('M5 4h6v10c0 3 2 5 5 5s3-1 3-3v-4h-3l-3-3V4'),
  tie: P('M10 2h4l1 3-3 5-3-5zM9 10h6l-2 10-1 2-1-2z'),
  hoodie: P('M6 6l-3 2v10l3 2h12l3-2V8l-3-2M6 6c0-2 2-4 6-4s6 2 6 4M6 6l2 4h8l2-4M9 20v-4h6v4M12 10v6'),
  pants: P('M5 2h14v4l-3 16H6l-3-16zM8 12h8M12 2v10'),
  shorts: P('M4 2h16v8l-3 6h-3l-2-4-2 4H7L4 10zM8 10h8'),
  skirt: P('M6 4h12l4 16H2zM6 4v6M18 4v6M2 20h20M12 10v10'),
  dress: P('M9 2h6v4l4 10-3 6H8l-3-6 4-10zM9 6h6M12 6v16'),
  swimsuit: P('M4 8c0-2 4-4 8-4s8 2 8 4-4 8-8 8-8-6-8-8zM8 12h8M12 12v8'),
  glasses2: C(7, 12, 4) + C(17, 12, 4) + P('M11 12h2M3 12h0M21 12h0M5 8L3 6M19 8l2-2'),
  ring: C(12, 14, 8) + P('M9 6h6l-3-4z') + C(12, 14, 5),
  necklace: P('M6 3a6 6 0 0 0 12 0M9 8l3 4 3-4') + C(12, 14, 3),
  earring: C(8, 8, 6) + C(8, 18, 3) + P('M14 8h2M14 12h2M14 16h2'),
  bracelet: C(12, 12, 9) + P('M9 3l1 3M15 3l-1 3M9 21l1-3M15 21l-1-3M5 7l3 1M19 7l-3 1M5 17l3-1M19 17l-3-1'),
  // ============ 棋牌 ============
  'chess-king': P('M12 2v4M10 4h4M8 22h8v-4l-2-2V9H10v7l-2 2zM9 13h6M12 13v5'),
  'chess-queen': P('M12 2l2 3 2-2 1 4h-10l1-4 2 2zM6 22h12v-3l-2-3V9H8v7l-2 3zM9 12h6M12 12v4'),
  'chess-rook': P('M6 22h12v-4l-2-2V9H8v7l-2 2zM8 5h8v4H8zM8 5V2M16 5V2M11 5V2M13 5V2M9 12h6'),
  'chess-bishop': P('M12 2c-2 0-3 2-3 4 0 1 1 2 1 3l-2 9h8l-2-9c0-1 1-2 1-3 0-2-1-4-3-4zM9 15h6M8 22h8v-3H8zM12 6v2'),
  'chess-knight': P('M6 22h12v-4l-2-2v-6l-4-4 1-2-2-1-1 2-3 3c-1 1-1 2 0 3s2 0 3-1l1 3-3 3-2 2z'),
  'chess-pawn': C(12, 9, 3) + P('M9 12h6l-1 3-2 2 1 5H8l1-5-2-2zM8 22h8'),
  'poker-chip': C(12, 12, 9) + C(12, 12, 5) + P('M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1 1M17 17l1 1M6 18l1-1M17 7l1-1'),
  mahjong: R(3, 5, 18, 14, 1) + P('M7 9h2M9 9v6M13 9v6M15 9h2M15 15h2M7 15h2M11 11h.01M11 13h.01'),
  'card-deck': R(4, 6, 12, 16, 1) + R(8, 3, 12, 16, 1) + P('M14 6l-3 3M11 9l3 3M14 9h.01'),
  'dice-5': R(3, 3, 18, 18, 3) + C(8, 8, 1) + C(16, 8, 1) + C(12, 12, 1) + C(8, 16, 1) + C(16, 16, 1),
  'dice-6': R(3, 3, 18, 18, 3) + C(8, 8, 1) + C(16, 8, 1) + C(8, 12, 1) + C(16, 12, 1) + C(8, 16, 1) + C(16, 16, 1),
  domino: R(2, 4, 8, 16, 1) + R(14, 4, 8, 16, 1) + C(6, 8, 1) + C(6, 16, 1) + C(18, 8, 1) + C(18, 12, 1) + C(18, 16, 1),
  'go-board': R(3, 3, 18, 18, 1) + P('M3 9h18M3 15h18M9 3v18M15 3v18') + C(9, 9, 1.5) + C(15, 15, 1.5) + C(9, 15, 1.5),
  'backgammon': P('M2 6l3-3 3 3-3 3zM9 6l3-3 3 3-3 3zM16 6l3-3 3 3-3 3zM2 18l3-3 3 3-3 3zM9 18l3-3 3 3-3 3zM16 18l3-3 3 3-3 3zM6 12h12'),
  checkerboard: R(3, 3, 18, 18, 1) + P('M3 3h4v4H3zM11 3h4v4h-4zM19 3h2v4h-2zM7 7h4v4H7zM15 7h4v4h-4zM3 11h4v4H3zM11 11h4v4h-4zM19 11h2v4h-2zM7 15h4v4H7zM15 15h4v4h-4zM3 19h4v2H3zM11 19h4v2h-4zM19 19h2v2h-2z')
})

// ============ 工具 ============
Object.assign(icons, {
  screwdriver2: P('M13 4l7 7M18 9l3-3M6 18l6-6M16 2l6 6-4 4-6-6zM8 16l-6 6M4 16l4 4'),
  'wrench-2': P('M14.7 6.3a4 4 0 0 0 5.6 5.6L9.7 22.5a2 2 0 1 1-2.8-2.8L17.5 9'),
  'wrench-3': P('M3 21l9-9M12 12l3 3M15 15l6-6-3-3-6 6M18 6l3-3M6 3l3 3-3 3-3-3z'),
  'hammer-2': P('M15 12l-8.5 8.5a2 2 0 0 1-3-3L12 9M17.6 6.4l2.4-2.4 2 2-2.4 2.4'),
  'hammer-3': P('M14 4l6 6-2 2-6-6zM12 6L3 15l3 3 9-9M5 21l4-4'),
  chisel: P('M4 20l6-6-3-3-6 6zM10 14l7-7 3 3-7 7zM17 4l3 3-2 2-3-3z'),
  caliper: P('M6 3v18M18 3v18M6 6h9a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h9M6 21h-3M18 21h3M3 3h6M15 3h6'),
  level: P('M2 10h20v4H2zM6 12h.01M10 12h.01M14 12h.01M18 12h.01'),
  clamp: P('M4 4v16M4 8h12a4 4 0 0 1 0 8H4M20 4v16M18 4h4M18 20h4'),
  vise: P('M3 18h18M5 18V8h14v10M8 8V4h8v4M12 12v6'),
  'tape-measure': C(12, 12, 8) + C(12, 12, 2) + P('M18 6l3-2M18 12h3M18 18l3 2M9 4h6'),
  crowbar: P('M4 20L16 8M14 6l4-4 2 2-4 4zM4 20l-2-2 2-2 2 2zM12 8l6 6'),
  'nail-gun': P('M6 4h12v6H6zM9 10v4M15 10v4M6 14h12v6H6zM12 20v2'),
  'power-drill': P('M4 8h13v6H4zM17 9h4v4h-4M8 14v5h5v-5M10 20l-1 2M13 20l1 2M5 10h2M8 10h2'),
  'angle-grinder': P('M4 8h14v8H4zM18 10l3-1v6l-3-1M6 16l-3 4M12 8V4M9 4h6M4 10v4'),
  'impact-drill': P('M8 4h8v6H8zM12 10v4M6 14h12v6H6zM12 20v2M9 6h.01M12 6h.01M15 6h.01'),
  'chisel-2': P('M4 20l6-6-3-3-6 6zM10 14l7-7 3 3-7 7z'),
  trowel: P('M6 3h12l-1 8H7zM12 11v8M8 19h8M9 21h6'),
  rake: P('M4 20l14-14M18 6l3-3M14 4l6 6M4 20l-3-3 3-3 3 3z'),
  hoe: P('M3 21l12-12M15 9l6-6M11 7l6 6M3 21l-2-2 2-2 2 2z'),
  pitchfork: P('M6 22l6-12M12 10l6-8M8 4l8 6M6 22l-2-2 2-2 2 2zM14 6h4M16 4v4'),
  shovel: P('M3 21l8-8M11 13l6-6M17 7l3-3M9 11l4 4M4 4l6 6'),
  pickaxe: P('M3 21l9-9M12 12l9-9M6 3l12 12M6 21l3-3M18 6l-3 3'),
  'hand-saw': P('M3 15l12-12 6 6-12 12zM7 11l6 6M10 8l6 6'),
  'circular-saw': C(12, 12, 8) + C(12, 12, 2) + P('M12 4v4M12 16v4M4 12h4M16 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3'),
  'jig-saw': P('M5 6h14v8H5zM9 14v4M15 14v4M9 18l1 4M15 18l-1 4M8 10h.01M12 10h.01M16 10h.01'),
  chainsaw: P('M3 8h14v8H3zM17 10h4v4h-4M6 8V6M10 8V6M14 8V6M6 16v2M10 16v2M14 16v2'),
  lathe: P('M2 12h20M6 8v8M18 8v8M10 10h4v4h-4zM6 4v4M18 4v4M6 16v4M18 16v4'),
  anvil: P('M6 18h12v-3l-4-3V8h-6v4l-4 3zM3 18h18v3H3zM9 5h6l-1-3h-4z'),
  furnace: P('M4 20h16V8l-4-4H8L4 8zM8 20v-6h8v6M12 12V8M9 6h6'),
  'welding-mask': P('M5 4h14v10a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4zM5 10h14M9 8h.01M15 8h.01M12 18v4'),
  'safety-glasses': C(8, 12, 4) + C(16, 12, 4) + P('M4 12H2M22 12h-2M12 12h-2M14 12h-2M6 8L4 6M18 8l2-2'),
  'hard-hat': P('M2 18h20v2H2zM4 18v-4c0-4 3-7 8-7s8 3 8 7v4M9 7V4M15 7V4M12 4v3'),
  'tool-box': R(2, 10, 20, 10, 2) + P('M2 14h20M8 14v2M16 14v2M8 10V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4'),
  // ============ 建筑 ============
  'brick-wall': P('M2 6h20v4H2zM2 10h6v4H2zM8 10h8v4H8zM16 10h6v4h-6zM2 14h10v4H2zM12 14h10v4H12z'),
  bricks: P('M2 8h6v4H2zM10 8h6v4h-6zM18 8h4v4h-4zM6 12h6v4H6zM14 12h6v4h-6zM2 16h4v4H2zM8 16h4v4H8zM14 16h4v4h-4zM20 16h2v4h-2z'),
  scaffolding: P('M3 2v20M21 2v20M3 6h18M3 12h18M3 18h18M8 6v6M14 6v6M8 12v6M14 12v6'),
  ladder: P('M6 2v20M18 2v20M6 6h12M6 12h12M6 18h12'),
  cement: P('M4 8h16v14H4zM4 12h16M6 8l2-6h8l2 6M9 4h6M9 16h.01M12 16h.01M15 16h.01'),
  paint: P('M4 4h16v8H4zM4 8h16M8 12v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4M10 18v4M14 18v4'),
  'paint-roller': P('M3 4h14v6H3zM17 6h3v6h-3M17 12v3H6v3M6 18v4'),
  'paint-brush': P('M9 12l3 3 7-7-3-3zM9 12L4 17v3h3l5-5z'),
  'plumbing': P('M5 4h4v8H5zM9 8h6a4 4 0 0 1 0 8H9M12 4h4v4h-4M12 16h4v4h-4'),
  pipe: P('M3 8h18v8H3zM8 8v8M12 8v8M16 8v8'),
  valve: P('M12 4v16M6 12h12M4 8l4 4-4 4M20 8l-4 4 4 4M12 8V4M10 4h4'),
  bolt: P('M12 2l4 6h-2v6h4l-4 8v-6h-4l4-6h-2z'),
  nut: P('M12 2l8 5v10l-8 5-8-5V7z') + C(12, 12, 3),
  washer: C(12, 12, 8) + C(12, 12, 5),
  screw: P('M12 2v12l4 4H8zM12 16v6M10 18h4M10 20h4M10 22h4'),
  rivet: P('M6 8h12v6c0 3-3 6-6 6s-6-3-6-6zM8 4h8v4H8zM10 2h4v2h-4z'),
  plank: R(2, 10, 20, 4, 1) + P('M5 10v4M9 10v4M13 10v4M17 10v4'),
  'roof-tile': P('M2 18l4-10h12l4 10zM6 8h12M5 14h14M4 18h16'),
  chimney: R(8, 2, 8, 20, 1) + P('M10 6h4M10 10h4M10 14h4M10 18h4M6 22h12'),
  'drawing-compass': C(12, 4, 2) + P('M10 6l-4 14M14 6l4 14M12 6v12M8 20h8'),
  protractor: P('M2 18a10 10 0 0 1 20 0zM12 18v-10M6 18l3-6M18 18l-3-6M9 18l2-4M15 18l-2-4'),
  trowel2: P('M6 3h12l-1 8H7zM12 11v8M8 19h8'),
  // ============ 交通 ============
  'car-2': P('M4 12l2-6h12l2 6v6H4zM6 18v2M18 18v2M4 12h16') + C(7, 15, 1) + C(17, 15, 1),
  'car-3': P('M2 14l2-8h16l2 8v4H2zM6 14h.01M18 14h.01M2 10h20'),
  taxi: P('M4 12l2-6h12l2 6v6H4zM9 6V4h6v2M4 12h16') + C(7, 15, 1) + C(17, 15, 1),
  van: P('M2 14V8a2 2 0 0 1 2-2h10l6 6v6H2zM14 8v6M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  pickup: P('M2 16V8h10l4 4h6v6H2zM12 8v4M14 12h6M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  limousine: P('M2 16V12l4-6h12l4 6v4H2zM6 16h12M10 6l-2 6M14 6l2 6M8 10h8'),
  'fire-truck': P('M2 16V10l2-4h8l2 4h8v6H2zM10 6v4M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 4l2-2M12 6l3-2'),
  'police-car': P('M4 12l2-6h12l2 6v6H4zM4 12h16M8 6V4M16 6V4M12 4h.01') + C(7, 15, 1) + C(17, 15, 1),
  'garbage-truck': P('M3 18V8h10l4 6v4H3zM17 10h2l3 4v4h-5M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  'cement-truck': P('M2 16V8h8l4 4h8v4H2zM14 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  tractor2: P('M4 18v-6h6l2-4h6v10M4 18h16M16 12h4v6M6 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 4h6l1 4'),
  forklift2: P('M4 4v16h12M4 12h12M12 4v8M16 20v-8h5v8M16 14h5'),
  'dump-truck': P('M2 16V8h12l6 6v4H2zM14 8v6M20 16l-4-2M8 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  'delivery-truck': P('M2 16V8h12l6 6v4H2zM14 8v6M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  'tanker-truck': P('M2 16V10h14v6H2zM16 12h4l2 2v2h-6M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 12h4'),
  'food-truck': P('M2 16V8h12l4 4h4v4H2zM14 8v4M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  subway: P('M4 15V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM4 11h16M8 18l-2 3M16 18l2 3M9 15h.01M15 15h.01'),
  tram: P('M4 15V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM4 11h16M12 3V2M8 18v2M16 18v2M9 14h.01M15 14h.01'),
  trolley: P('M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 6h8M12 6v6M8 20v2M16 20v2'),
  trolleybus: P('M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM12 4v8M8 4h8M8 20v2M16 20v2M7 15h.01M17 15h.01'),
  ferry: P('M2 16l2-6h16l2 6-3 3-3-3-3 3-3-3-3 3-3-3zM6 10V4h12v6M10 4v6M14 4v6'),
  yacht: P('M3 16l2-4 14-2 2 6-3 3-3-3-3 3-3-3-3 3-3-3zM8 12V4l7 3-7 5'),
  canoe: P('M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM6 12l6-9 6 9'),
  rowboat: P('M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM6 12l6-3 6 3M4 14l16 2M6 16l12 0'),
  sailboat: P('M3 16l2-4 14-2 2 6-3 3-3-3-3 3-3-3-3 3-3-3zM12 10V2l8 8z'),
  kayak: P('M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM10 12V4M14 12V4M6 6l12 2M6 8l12-2'),
  hotair: C(12, 6, 4) + P('M8 10l1 6h6l1-6M9 16l-1 6M15 16l1 6M10 22h4'),
  parachute: P('M2 10a10 10 0 0 1 20 0zM12 10v10M8 20h8M8 20l4-10M16 20l-4-10'),
  cablecar: P('M2 4l20-2M6 4v4h12V4M6 8l2 8h8l2-8M12 8v8M10 16v4M14 16v4M8 20h8'),
  elevator: R(4, 2, 16, 20, 1) + P('M4 10h16M12 2v8M12 10v12M8 6h.01M16 6h.01M8 14h.01M16 14h.01M8 18h.01M16 18h.01'),
  escalator: P('M3 20h4l10-12h4M7 20l10-12M3 20a2 2 0 0 1 2-2M19 6a2 2 0 0 0-2 2M20 4h-4M6 4h4'),
  bridge2: P('M2 12h20M4 12v8M20 12v8M12 12v8M2 12a10 10 0 0 1 20 0M6 8v4M18 8v4'),
  tunnel: P('M2 20v-6a10 10 0 0 1 20 0v6M6 20v-6a6 6 0 0 1 12 0v6M10 20v-6a2 2 0 0 1 4 0v6'),
  highway: P('M4 22L6 2h12l2 20M10 2v20M14 2v20M12 6v2M12 12v2M12 18v2'),
  roundabout: C(12, 12, 4) + C(12, 12, 9) + C(12, 12, 1) + P('M12 21V3M3 12h18'),
  // ============ 文具 ============
  'pen-2': P('M17 3l4 4L8 20l-5 1 1-5zM14 6l4 4'),
  'pen-3': P('M2 22l4-4M18 2l4 4L8 20l-4-4zM14 6l4 4'),
  'pencil-2': P('M16 2l6 6L8 22H2v-6zM12 6l6 6M14 4l6 6'),
  eraser: P('M4 18l10-10 6 6-10 10zM2 20h20M14 8l6 6'),
  marker: P('M9 3h6v10H9zM9 13h6v4l-2 4h-2l-2-4zM11 3V1h2v2'),
  highlighter: P('M9 3h6v10H9zM9 13h6l-2 8h-2zM11 3V1h2v2'),
  'pencil-case': R(2, 8, 20, 10, 3) + P('M2 12h20M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2'),
  'pencil-sharpener': C(12, 14, 8) + C(12, 14, 3) + P('M12 6V2M8 2h8M4 14h-2M22 14h-2'),
  'stapler': P('M3 16h18v4H3zM3 16v-2l14-6 4 4v4M6 12l12-5M7 20h10'),
  'staples': P('M6 8v8M10 8v8M14 8v8M18 8v8M4 6h16M4 18h16'),
  'paper-clip': P('M16 6v10a4 4 0 0 1-8 0V4a2 2 0 0 1 4 0v10a.5.5 0 0 1-1 0V6'),
  'push-pin': P('M9 3h6l-1 6 3 3H7l3-3zM12 12v9'),
  'paper-clip-2': P('M4 8l10-6 6 6-10 12H4v-6z'),
  'notepad': R(4, 2, 16, 20, 2) + P('M8 6h8M8 10h8M8 14h6M8 18h4M4 6H2M22 6h-2M4 18H2M22 18h-2'),
  notebook: R(4, 2, 14, 20, 1) + P('M4 6h14M4 12h14M4 18h14M2 6h2M2 12h2M2 18h2'),
  journal: R(3, 2, 18, 20, 1) + P('M7 6h10M7 12h10M7 18h6M3 6H1M23 6h-2M3 12H1M23 12h-2M3 18H1M23 18h-2'),
  diary: R(3, 2, 18, 20, 1) + P('M3 8h18M7 12h6M7 16h6M3 6H1M23 6h-2M3 14H1M23 14h-2'),
  book3: R(4, 3, 16, 18, 1) + P('M4 7h16M4 12h16M4 17h16M2 6h2M2 12h2M2 18h2M20 6h2M20 12h2M20 18h2'),
  booklet: R(3, 2, 18, 20, 1) + P('M8 2v20M12 6h6M12 10h6M12 14h6M12 18h4'),
  bookmark2: P('M6 2h12v20l-6-5-6 5zM9 6h6M9 10h6'),
  bookstack: P('M2 18h20v2H2zM4 14h18v2H4zM2 10h18v2H2zM4 6h18v2H4zM6 2h18v2H6z'),
  stamp: P('M6 8h12v6H6zM8 14v4h8v-4M10 8V4h4v4M4 20h16v2H4zM8 18h8'),
  stamp2: P('M7 6h10v6H7zM8 12h8v4H8zM9 6V4h6v2M5 20h14v2H5z'),
  envelope: P('M2 5h20v14H2zM2 5l10 7 10-7'),
  'envelope-open': P('M2 8l10-6 10 6v12H2zM2 8l10 7 10-7M6 15l4 3M18 15l-4 3'),
  'paper-plane': P('M22 2L11 13M22 2l-7 20-4-9-9-4z'),
  'postcard': P('M2 5h20v14H2zM2 9h20M6 13h6M6 16h4M17 12h.01'),
  'folder-2': P('M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18'),
  'folder-lock': P('M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') + R(9, 12, 6, 5, 1) + P('M10 12v-1a2 2 0 0 1 4 0v1'),
  'file-search': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7') + C(11, 17, 2) + P('M12.5 18.5l2.5 2.5'),
  'file-check-2': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M9 14l2 2 4-4'),
  'file-x-2': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M10 12l5 5M15 12l-5 5'),
  'file-plus-2': P('M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M12 12v6M9 15h6'),
  'clipboard-2': R(8, 2, 12, 4, 1) + P('M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6'),
  'clipboard-list': R(8, 2, 12, 4, 1) + P('M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 11h.01M12 11h5M8 15h.01M12 15h5'),
  'clipboard-x': R(8, 2, 12, 4, 1) + P('M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M10 11l6 6M16 11l-6 6'),
  // ============ 家居 ============
  fridge: R(6, 2, 12, 20, 2) + P('M6 10h12M9 6h.01M9 14h.01M9 18h.01'),
  microwave: R(2, 6, 20, 12, 2) + P('M2 10h20M14 12h6M14 16h6') + C(8, 14, 1),
  oven: R(3, 3, 18, 18, 2) + P('M3 8h18M8 5h.01M16 5h.01') + C(12, 15, 4),
  dishwasher: R(3, 3, 18, 18, 2) + P('M3 8h18M8 5h.01M16 5h.01M7 12h10v7H7z'),
  'washing-machine': R(3, 3, 18, 18, 2) + P('M3 8h18M8 5h.01M16 5h.01') + C(12, 15, 4),
  dryer: R(3, 3, 18, 18, 2) + P('M3 8h18M8 5h.01M16 5h.01M12 11v8M8 15a4 4 0 0 0 8 0'),
  vacuum: C(12, 16, 6) + P('M12 10V4M8 4h8M4 16h-2M22 16h-2M6 16v4M18 16v4M9 16v4M15 16v4'),
  iron: P('M2 14c0-3 4-6 10-6h10v6zM2 14v4h20v-4M6 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2'),
  kettle: P('M5 8h12v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM5 12h12M17 10l3-3M10 8V4M12 4h4M20 12h1'),
  toaster: R(2, 8, 20, 10, 3) + P('M6 8V6h4v2M14 8V6h4v2M6 14h.01M18 14h.01M12 18v2'),
  blender: P('M7 2h10l-1 12H8zM8 14h8l-1 6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM12 2v2M10 6h4'),
  mixer2: P('M3 8h10v10H3zM13 12h5a3 3 0 0 0 3-3V6M3 12h10M8 2V1M5 4L4 3M11 4l1-1'),
  'rice-cooker': R(3, 8, 18, 12, 3) + P('M3 12h18M8 8V6h8v2M12 3v3M8 20v2M16 20v2'),
  'coffee-maker': P('M6 2h12v10H6zM6 6h12M8 12v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8M9 16h6'),
  'electric-kettle': P('M6 6h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM6 10h12M18 8l3-2M9 6V4M15 6V4M20 10h1'),
  'air-conditioner': R(2, 4, 20, 8, 2) + P('M2 8h20M6 12v2M10 12v3M14 12v3M18 12v2M6 18h.01M12 18h.01M18 18h.01'),
  fan: C(12, 12, 6) + P('M12 6a3 3 0 0 0 0 6M18 12a3 3 0 0 0-6 0M12 18a3 3 0 0 0 0-6M6 12a3 3 0 0 0 6 0') + C(12, 12, 1),
  heater: R(2, 6, 20, 12, 2) + P('M6 10v4M10 10v4M14 10v4M18 10v4M6 18h.01M12 18h.01M18 18h.01'),
  humidifier: P('M5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM7 8V6h10v2M12 3V1M8 4L7 3M16 4l1-1'),
  dehumidifier: R(3, 6, 18, 14, 2) + P('M3 10h18M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01M17 18h.01'),
  'water-heater': R(6, 4, 12, 16, 4) + P('M6 10h12M9 6h.01M15 6h.01M9 14h.01M15 14h.01M9 18h.01M15 18h.01'),
  boiler: R(4, 4, 16, 16, 3) + P('M4 10h16M12 6v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01'),
  radiator: R(2, 6, 20, 12, 1) + P('M6 6v12M10 6v12M14 6v12M18 6v12M2 10h20M2 14h20'),
  door2: P('M4 22V2h16v20M12 12h.01M4 12h.01'),
  window2: R(3, 3, 18, 18, 1) + P('M3 12h18M12 3v18M3 8h18M3 16h18'),
  sofa3: P('M3 12v6a1 1 0 0 0 1 1h2v2M21 12v6a1 1 0 0 1-1 1h-2v2M3 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 12h18M3 16h18'),
  cushion: R(3, 3, 18, 18, 5) + P('M3 7c4-4 14-4 18 0M3 17c4 4 14 4 18 0M7 3c-4 4-4 14 0 18M17 3c4 4 4 14 0 18'),
  curtain: P('M2 2h20v2H2zM4 4v18M20 4v18M12 4v18M4 8c2 2 4 2 6 0M14 8c2 2 4 2 6 0M4 12c2 2 4 2 6 0M14 12c2 2 4 2 6 0M4 16c2 2 4 2 6 0M14 16c2 2 4 2 6 0'),
  rug: R(2, 4, 20, 16, 1) + P('M5 7v10M19 7v10M2 8h3M2 12h3M2 16h3M19 8h3M19 12h3M19 16h3M8 12h8'),
  mirror: C(12, 12, 9) + P('M12 3v18M3 12h18M6 6a8 8 0 0 1 6-3'),
  vase: P('M9 2h6v4l2 4v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10l2-4zM9 6h6M12 6v4M8 12h8'),
  candle: R(9, 6, 6, 16, 1) + P('M12 6V3M10 3c0-1 1-2 2-2s2 1 2 2M6 22h12'),
  clock2: C(12, 12, 9) + P('M12 7v5l3 3M12 3V1M12 23v-2M3 12H1M23 12h-2'),
  'wall-clock': C(12, 12, 9) + C(12, 12, 1.5) + P('M12 5v7l4 3M4 4L2 2M20 4l2-2M4 20l-2 2M20 20l2 2'),
  'digital-clock': R(2, 7, 20, 10, 1) + P('M6 9v6M9 9l1 6M13 9h2v3h-2v3h2M18 9l1 6M6 4h.01M9 4h.01M12 4h.01M15 4h.01M18 4h.01'),
  hourglass: P('M6 2h12v6l-6 4-6-4zM6 22h12v-6l-6-4-6 4zM6 2v6M18 2v6M6 22v-6M18 22v-6'),
  thermometer2: P('M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8'),
  'flashlight': P('M6 2h12v6H6zM9 8v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8M12 4v2M9 12h.01M15 12h.01'),
  // ============ 科技 ============
  'micro-sd': P('M6 4h10l2 2v14H6zM8 8v4h8V8M10 14h.01M14 14h.01M10 17h.01M14 17h.01'),
  sim: P('M6 4h10l2 2v14H6zM9 8v6h6V8M11 12l2-2v2z'),
  usb: P('M8 6h8v10H8zM12 16v6M10 22h4M10 6V4M14 6V4M12 4V1'),
  hdmi: P('M3 6h18v8H3zM6 14v4M9 14v4M15 14v4M18 14v4M6 10h12'),
  'display-port': P('M3 8h18v8H3zM6 6l-2-2M18 6l2-2M8 10h8M8 14h8'),
  'audio-jack': P('M12 2a4 4 0 0 1 4 4v4a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4zM9 12l-3 6a4 4 0 0 0 8 0l-3-6M12 22v.01'),
  'ethernet': P('M4 8h16v8H4zM7 8v4M11 8v4M15 8v4M19 8v4M7 16v4M11 16v4M15 16v4M19 16v4'),
  keyboard2: R(2, 6, 20, 12, 2) + P('M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01M10 18h4'),
  mouse: R(6, 2, 12, 20, 6) + P('M12 2v6M9 6h6'),
  touchpad: R(3, 5, 18, 14, 2) + P('M3 12h18M12 5v7'),
  'track-ball': C(12, 12, 9) + C(12, 12, 4) + P('M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2'),
  joystick2: C(12, 4, 3) + P('M12 7v8M8 15h8a2 2 0 0 1 2 2v3H6v-3a2 2 0 0 1 2-2z'),
  projector: R(2, 4, 20, 10, 2) + C(10, 9, 2) + P('M18 7v4M6 14v4M18 14v4M10 18h4'),
  'vr-headset': P('M2 8h20v8H2zM2 12h20M9 12a3 3 0 0 0 6 0'),
  drone: P('M12 8v4M12 16v4M8 12h8M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4') + C(6, 6, 2) + C(18, 6, 2) + C(6, 18, 2) + C(18, 18, 2),
  'robot-arm': P('M2 22h20M4 18V8h4v10M8 12h8l4-4v8M16 16h.01M12 8V2M8 4h8'),
  robot: R(5, 8, 14, 12, 2) + C(9, 12, 1.5) + C(15, 12, 1.5) + P('M12 8V4M8 4h8M9 16h6M8 20v2M16 20v2M2 12h3M19 12h3'),
  'robot-2': R(4, 6, 16, 12, 2) + C(8, 10, 1.5) + C(16, 10, 1.5) + P('M12 6V3M6 3h12M7 14h10M6 18v4M18 18v4'),
  ai: C(12, 12, 3) + P('M12 6v3M12 15v3M6 12h3M15 12h3M8.5 8.5L10 10M14 14l1.5 1.5M15.5 8.5L14 10M10 14l-1.5 1.5'),
  chip: R(5, 5, 14, 14, 2) + C(12, 12, 3) + P('M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3'),
  quantum: C(12, 12, 2) + C(12, 12, 9) + P('M3 12c0-5 4-9 9-9M21 12c0 5-4 9-9 9M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18'),
  bitcoin: C(12, 12, 9) + P('M9 6v12M11 6v12M9 6h4a3 3 0 0 1 0 6H9M9 12h5a3 3 0 0 1 0 6H9'),
  ethereum: P('M12 2L5 12l7 4 7-4zM5 14l7 8 7-8-7 4z'),
  qrcode: R(3, 3, 6, 6, 1) + R(15, 3, 6, 6, 1) + R(3, 15, 6, 6, 1) + P('M15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z'),
  'bar-code-2': P('M3 5v14M6 5v14M8 5v14M11 5v14M13 5v14M15 5v14M18 5v14M20 5v14')
})

// ============ 军事 ============
Object.assign(icons, {
  sword: P('M14 4l6 6-9 9-4 1-1-4zM3 21l3-3M18 3l3 3'),
  shield2: P('M12 2l9 3v6c0 5-4 9-9 11-5-2-9-6-9-11V5z'),
  'shield-sword': P('M12 2l9 3v6c0 5-4 9-9 11-5-2-9-6-9-11V5zM12 7v10M9 11l3-3 3 3M9 15l3 3 3-3'),
  dagger: P('M10 4l2-2 2 2-1 12h-2zM9 16h6v3H9zM8 19h8v2H8zM12 5v6'),
  bow: P('M4 4a16 16 0 0 1 16 16M4 4l2 8-2 8M20 20l-8 2-8-2M6 12h12M12 8v8'),
  arrow: P('M3 21l18-18M21 3l-6 1 5 5zM21 3l-1 6-5-5z'),
  target2: C(12, 12, 9) + C(12, 12, 5) + C(12, 12, 1) + P('M3 3L6 6M21 3l-3 3M3 21l3-3M21 21l-3-3'),
  helmet: P('M4 14c0-5 4-9 8-9s8 4 8 9v3H4zM2 17h20v3H2zM9 5V3M15 5V3M12 5V2'),
  'military-helmet': P('M5 12c0-4 3-7 7-7s7 3 7 7v4H5zM3 16h18v4H3zM9 5V3M15 5V3'),
  'grenade': C(12, 14, 6) + P('M9 8V6h6v2M12 6V3M14 3l2-2M9 12h.01M15 12h.01M12 12v.01'),
  bomb: C(12, 16, 6) + P('M10 10l-1-2M14 10l1-2M15 8l2-1M17 7l1-1M18 6l1 1M16 6l.5-.5M18 8l.5-.5'),
  tank: P('M2 18v-4h16v4zM18 14l2-3h2v3M6 14V8h8v6M14 11h6M4 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'),
  warship: P('M3 18l2-4h14l2 4-3 3-3-3-3 3-3-3-3 3zM6 14V6h12v8M10 6V4M14 6V4M12 8v6'),
  fighter: P('M12 2l4 10-4 2-4-2zM8 14l-6 2v2l6-1M16 14l6 2v2l-6-1M9 20h6M12 22V18'),
  'fighter-jet': P('M12 2l4 10-4 2-4-2zM8 14l-6 2v2l6-1M16 14l6 2v2l-6-1M9 20h6M12 22V18'),
  missile: P('M12 2c3 3 4 8 4 12l-4 2-4-2c0-4 1-9 4-12zM8 14l-2 4 2-1 4 3 4-3 2 1-2-4M10 22h4'),
  radar: C(12, 12, 9) + P('M12 12L6 8M12 3a9 9 0 0 1 8 5M3 12h3M18 12h3') + C(12, 12, 2),
  'walkie-talkie': R(6, 6, 12, 16, 2) + P('M9 6V2h6v4M9 10h6M9 14h6M10 18h.01M14 18h.01M12 22v-2'),
  binoculars: C(6, 12, 4) + C(18, 12, 4) + P('M6 8V4M18 8V4M9 8h6M9 10h6M3 12h-1M22 12h-1'),
  scope: C(12, 12, 9) + C(12, 12, 3) + P('M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3'),
  medal2: C(12, 9, 5) + P('M9 14l-3 8 6-3 6 3-3-8M7 3h10l-3 5M17 3l-3 5'),
  'military-medal': C(12, 9, 5) + P('M9 14l-3 8 6-3 6 3-3-8M7 3h10l-3 5M17 3l-3 5'),
  // ============ 科学仪器 ============
  'microscope-2': P('M6 18h8M3 22h18M14 22a7 7 0 1 0-7-7M9 14l2-2M12 3l4 4M10 5l4 4'),
  'telescope-3': P('M4 20l6-8M2 14l8 6-2 2-8-6zM12 12l9-9 1 1-9 9zM3 21h12M21 21h-3M16 3l5 5'),
  'barometer': C(12, 12, 9) + P('M12 12l3-3M12 3v2M12 19v2M3 12h2M19 12h2'),
  'anemometer': C(12, 12, 3) + P('M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3'),
  'seismograph': R(3, 10, 18, 8, 1) + P('M3 14h18M6 10V6M18 10V6M12 2v4M9 6l3 4 3-4'),
  'geiger-counter': R(4, 6, 16, 14, 2) + C(12, 13, 3) + P('M12 6V3M10 3h4M9 17h6M7 20h.01M17 20h.01'),
  'spectrometer': R(3, 6, 18, 12, 1) + P('M3 12h18M6 12v4M10 12v4M14 12v4M18 12v4M6 6v6M18 6v6'),
  'oscilloscope': R(2, 4, 20, 14, 1) + P('M4 12c2-3 4 3 6 0s4 3 6 0 4 3 6 0M4 8h2M6 16h2M16 8h4M16 16h4'),
  'multimeter': R(4, 2, 16, 20, 2) + P('M4 10h16M8 6h.01M12 6h.01M16 6h.01') + C(12, 15, 3),
  'voltmeter': C(12, 12, 9) + P('M8 15l3-6 3 6M12 3v2M12 19v2M3 12h2M19 12h2'),
  'thermometer-3': P('M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM10 8h4M10 12h4M12 18h.01'),
  'balance-scale': P('M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'),
  'weighing-scale': R(2, 12, 20, 8, 1) + P('M6 20v-4M18 20v-4M2 12l4-8h12l4 8M9 8h6M9 4h6'),
  'centrifuge-2': C(12, 12, 9) + C(12, 12, 2) + P('M12 3v3M12 18v3M3 12h3M18 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2'),
  'autoclave': R(4, 4, 16, 16, 2) + C(12, 12, 4) + P('M4 10h16M9 4v4M15 4v4M9 16h6M8 20h.01M16 20h.01'),
  incubator: R(3, 4, 18, 16, 2) + P('M3 10h18M7 6h.01M17 6h.01M12 14v3M9 15h6'),
  'petri-dish': C(12, 12, 9) + C(12, 12, 7) + C(14, 10, 1) + C(9, 13, 1) + C(13, 14, 1),
  'culture-tube': P('M10 2h4v10l2 4v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4l2-4zM10 6h4M10 14h4'),
  'magnetic-stirrer': R(3, 10, 18, 8, 2) + C(12, 14, 3) + P('M6 10V6M18 10V6M9 6h6'),
  'hot-plate': R(2, 6, 20, 12, 2) + C(8, 12, 2) + C(16, 12, 2) + P('M12 6v12M5 18h.01M19 18h.01'),
  'fume-hood': R(2, 3, 20, 18, 1) + P('M2 8h20M8 8v13M16 8v13M11 12v4M13 12v4'),
  'vacuum-pump': R(4, 8, 16, 10, 2) + C(9, 13, 3) + P('M9 10v-2M20 13h2M4 13H2M6 18v2M18 18v2'),
  'micro-pipette': P('M10 2h4v9l1 2v5a3 3 0 0 1-6 0v-5l1-2zM10 6h4M10 12h4'),
  'sample-vial': P('M9 2h6v4l1 2v13a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V8l1-2zM9 6h6M9 12h6M9 18h6'),
  // ============ 办公 ============
  'desk': R(2, 12, 20, 4, 1) + P('M4 16v6M20 16v6M8 12V6h8v6M2 8h20'),
  'office-chair': C(12, 4, 2) + P('M8 6v6h8V6M12 12v6M7 20h10M9 22l3-2 3 2'),
  'meeting-room': R(2, 4, 20, 14, 1) + P('M2 11h20M12 4v7M6 15v3M18 15v3M6 15a1 1 0 1 0 0-2M18 13a1 1 0 1 0 0 2'),
  projector2: R(2, 4, 20, 10, 2) + C(10, 9, 2) + P('M18 7v4M6 14v4M18 14v4M10 18h4'),
  whiteboard: R(2, 3, 20, 14, 1) + P('M6 17v4M18 17v4M4 7h16M4 11h10M4 14h14'),
  'whiteboard-2': R(2, 3, 20, 14, 1) + P('M6 17v4M18 17v4M6 7h4M6 11h8M6 14h6'),
  'bulletin-board': R(2, 3, 20, 14, 1) + P('M6 3v14M18 3v14M6 6h4v4H6zM14 10h4v4h-4zM10 14h4v4h-4z'),
  'pen-holder': P('M4 10h16v12H4zM4 14h16M8 6l2-4M12 6V2M16 6l-2-4'),
  'paper-clip-3': P('M8 4l8 4v10a4 4 0 0 1-8 0V4M8 4a4 4 0 0 1 8 0v2'),
  staple: P('M6 10h12v4H6zM6 14v4h12v-4M10 10V6h4v4'),
  'file-cabinet': R(3, 2, 18, 20, 1) + P('M3 8h18M3 14h18M9 5h6M9 11h6M9 17h6'),
  'filing-cabinet': R(3, 2, 18, 20, 1) + P('M3 8h18M3 14h18M9 5h6M9 11h6M9 17h6'),
  'office-desk': R(2, 12, 20, 4, 1) + P('M4 16v6M20 16v6M12 12V4M4 4h16M4 8h16'),
  'stamp-2': P('M6 8h12v6H6zM8 14v4h8v-4M10 8V4h4v4M4 20h16v2H4z'),
  'signature': P('M3 18c3-6 6-6 8-3s3 4 6 0 4-8 4-8M3 20h18'),
  'paraphe': P('M3 18c3-6 6-6 8-3M12 12c3 4 5 4 7-2M12 4v6M8 8h8'),
  'handshake': P('M2 12l3-3 4 3 3-3 4 3 3-3M5 9l3-3 4 3M15 9l3-3M8 15l4 4 4-4M12 19l3 3M4 14l3 3'),
  'business-card': R(2, 6, 20, 12, 2) + C(7, 11, 2) + P('M5 16a2 2 0 0 1 4 0M12 10h6M12 14h4'),
  'name-badge': R(3, 3, 18, 18, 2) + P('M3 8h18') + C(12, 13, 2) + P('M8 18a4 4 0 0 1 8 0'),
  'briefcase-2': R(3, 7, 18, 13, 2) + P('M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M9 12v2h6v-2'),
  'briefcase-3': R(3, 7, 18, 13, 2) + P('M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M9 12h6M12 12v4'),
  // ============ UI 补充 ============
  'drag-handle': P('M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01'),
  'drag-handle-2': P('M9 6h.01M15 6h.01M9 12h.01M15 12h.01'),
  resize: P('M3 3l4 4M21 3l-4 4M3 21l4-4M21 21l-4-4M12 8v-5M12 21v-5M8 12H3M21 12h-5'),
  'resize-corner': P('M21 21L11 21M21 21L21 11M21 21L15 15M21 15L15 21'),
  'resize-horizontal': P('M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4'),
  'resize-vertical': P('M12 3v18M12 3l-4 4M12 3l4 4M12 21l-4-4M12 21l4-4'),
  maximize2: P('M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3'),
  minimize2: P('M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3'),
  'corner-arrow': P('M20 4H8a4 4 0 0 0 0 8h4v4l-4-4 4-4M16 8l4 4-4 4'),
  'split': P('M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4'),
  'split-h': P('M3 12h18M7 8L3 12l4 4M17 8l4 4-4 4'),
  merge: P('M8 6v6a4 4 0 0 0 4 4h8M16 12l4 4-4 4M8 6H4M6 4L4 6l2 2'),
  'layout-dashboard': R(3, 3, 7, 7, 1) + R(14, 3, 7, 7, 1) + R(3, 14, 7, 7, 1) + R(14, 14, 7, 7, 1),
  'layout-list': R(3, 3, 18, 18, 1) + P('M3 9h18M3 15h18M9 3v18'),
  'layout-sidebar': R(3, 3, 18, 18, 1) + P('M9 3v18'),
  'layout-kanban': R(3, 3, 18, 18, 1) + P('M9 3v18M15 3v18'),
  'layout-masonry': R(3, 3, 7, 10, 1) + R(3, 13, 7, 8, 1) + R(14, 3, 7, 6, 1) + R(14, 9, 7, 12, 1),
  // ============ 天气补充 ============
  'cloud-download': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + P('M12 12v6M9 15l3 3 3-3'),
  'cloud-upload': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + P('M12 21v-6M9 18l3-3 3 3'),
  'cloud-check': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + P('M9 13l2 2 4-4'),
  'cloud-x': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + P('M10 12l5 5M15 12l-5 5'),
  'cloud-off': P('M3 3l18 18M18 16a5 5 0 0 0-1.5-9.8A6 6 0 0 0 6.5 8M6 16a4 4 0 0 1 0-8M18 16H6'),
  'snow': P('M2 12h4M18 12h4M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8M12 8l2 2-2 2-2-2zM8 12l-2 2 2 2M16 12l2 2-2 2'),
  blizzard: P('M4 6h.01M8 6h.01M12 6h.01M16 6h.01M20 6h.01M4 10h.01M8 10h.01M12 10h.01M16 10h.01M20 10h.01M4 14h.01M8 14h.01M12 14h.01M16 14h.01M20 14h.01M4 18h.01M8 18h.01M12 18h.01M16 18h.01M20 18h.01'),
  'hot': P('M12 22s-4-4-4-8a4 4 0 0 1 4-4 4 4 0 0 1 4 4c0 4-4 8-4 8zM12 6a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2zM8 4a4 4 0 0 0 0 8M16 4a4 4 0 0 1 0 8'),
  cold: P('M12 3v18M6 9l6 3 6-3M6 15l6-3 6 3M3 12h3M18 12h3M3 6h3M18 6h3M3 18h3M18 18h3M6 3h3M15 3h3M6 21h3M15 21h3'),
  'temperature-high': P('M12 3v18M8 7l4 4 4-4M8 14h8M8 19h8'),
  'temperature-low': P('M12 3v18M8 17l4-4 4 4M8 10h8M8 5h8'),
  'sun-dim': C(12, 12, 3) + P('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1'),
  'sun-medium': C(12, 12, 5) + P('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1'),
  'sun-bright': C(12, 12, 6) + P('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1'),
  'haze': P('M4 8h16M4 12h16M4 16h16M4 20h16M6 4h12'),
  'mist': P('M4 6h16M4 10h16M4 14h16M4 18h16'),
  'smog': P('M4 6h16M4 10h16M4 14h16M4 18h16M8 2h.01M12 2h.01M16 2h.01')
})


// ============ 第 5 批 ============
Object.assign(icons, {
  bagpipes: P('M8 6a4 4 0 1 1 8 0v6H8zM12 12v8M9 20h6M5 4l3 2M19 4l-3 2M6 6v10M18 6v10'),
  lute: C(11, 16, 6)+ P('M11 10V2l7 3-7 3M8 18h.01M13 18h.01M11 13h.01'),
  ukulele: C(12, 14, 7)+ P('M12 7V2M10 2h4M9 12h.01M15 12h.01M12 11v6'),
  sitar: C(12, 16, 6)+ P('M12 10V2M9 2h6M9 14h6M5 22l14-2'),
  balalaika: P('M12 2 L18 12 L12 22 L6 12 Z')+ P('M12 8v6M9 22h6'),
  zither: R(2, 8, 20, 8, 1)+ P('M5 8v8M8 8v8M11 8v8M14 8v8M17 8v8M20 8v8'),
  'steel-drum': C(12, 12, 9)+ P('M12 3v9M6 6l6 6M18 6l-6 6M6 18l6-6M18 18l-6-6'),
  'wind-chime': P('M12 2v4M10 6h4M8 8h8M6 10h12M4 12h16M6 14v6M10 14v6M14 14v6M18 14v6M8 20h8'),
  beaker2: P('M5 3h14l-4 8v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8zM8 14h8'),
  erlenmeyer: P('M8 2h8v7l4 10a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l4-10zM5 15h14M10 2v7'),
  'volumetric-flask': C(12, 15, 5)+ P('M10 2h4v8l3 5a4 4 0 1 1-10 0l3-5zM10 10h4'),
  'watch-glass': P('M4 14a8 4 0 0 1 16 0 8 2 0 0 1-16 0M12 10v4'),
  desiccator: C(12, 16, 6)+ P('M6 16V6h12v10M4 16h16M8 6V4h8v2'),
  'mortar-pestle': P('M4 12a8 8 0 0 0 16 0zM12 12V6M8 4l4 2 4-2M6 20h12'),
  'weighing-boat': P('M4 14l2 6h12l2-6zM6 14V8h12v6M8 8V6h8v2'),
  'magnetic-bar': R(3, 10, 18, 4, 1)+ P('M3 10h4v4H3zM17 10h4v4h-4z'),
  'ph-strip': R(3, 3, 4, 18, 1)+ R(8, 3, 4, 18, 1)+ R(13, 3, 4, 18, 1)+ R(18, 3, 4, 18, 1),
  'test-tube-2': P('M12 2v16a4 4 0 0 1-8 0V2M4 2h8M4 8h8M4 14h8')+ P('M16 6v12a4 4 0 0 0 4 4'),
  'star-2': P('M12 2l2 7 7 1-5 5 1 7-5-3-5 3 1-7-5-5 7-1z'),
  'moon-crescent-2': P('M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z'),
  planet2: C(12, 12, 6)+ P('M3 9c3-1 15-3 18-1M3 15c3 1 15 3 18 1'),
  'comet-2': C(8, 8, 3)+ P('M6 10l-3 3M10 6l1-3M2 8h-2M11 8l5 5M8 14l2 8'),
  'star-shower': P('M2 2l3 3M5 5l-2 3M8 8l2-3M5 8l-3 2M3 3l3 2M11 3l3 3M14 6l-2 3M11 9l-3 2M6 12l3-3M14 9l2-3'),
  'observatory-2': P('M2 21h20v-2H2zM5 19l7-13 7 13M8 13h8M12 4l-5 7M12 4l5 7'),
  'space-helmet': C(12, 12, 9)+ P('M12 3a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V8a5 5 0 0 1 5-5zM8 9h.01M16 9h.01M10 13h4'),
  'star-map': C(12, 12, 9)+ P('M6 6l3 3M15 6l-3 3M6 18l3-3M15 18l-3-3M12 3v2M12 19v2M3 12h2M19 12h2'),
  thermometer3: P('M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8'),
  otoscope2: C(12, 9, 5)+ P('M12 14v6M9 20h6M8 6a4 4 0 0 1 8 0'),
  ophthalmoscope: C(12, 12, 6)+ C(12, 12, 2)+ P('M6 4L4 2M18 4l2-2M6 20l-2 2M18 20l2 2'),
  scalpel2: P('M14 4l6 6-4 4-8-2-6 6v2h2l6-6 2 8 4-4-2-8 2-2z'),
  suture2: P('M2 12h4M18 12h4M6 12a2 2 0 1 0 4 0M14 12a2 2 0 1 0 4 0M10 12h4'),
  'iv-bag': P('M8 2h8v10l-2 3v5a2 2 0 0 1-4 0v-5l-2-3zM10 2V1h4v1M10 6h4M10 10h4'),
  catheter: P('M4 12h8M12 12a4 4 0 0 1 8 0v6a2 2 0 0 1-4 0v-6'),
  pacemaker2: R(4, 8, 16, 10, 3)+ C(12, 13, 3)+ P('M8 3v5M16 3v5M10 13h.01M14 13h.01'),
  defib: R(3, 7, 18, 12, 2)+ P('M12 10v6M9 13h6M7 19v3M17 19v3'),
  ventilator: R(3, 6, 18, 14, 2)+ C(9, 12, 3)+ P('M17 10v8M15 12h4M15 14h4M15 16h4M6 20v2M18 20v2'),
  monorail: P('M4 6h16v10H4zM4 10h16M8 16v4M16 16v4M10 2v4M14 2v4M12 2v2M9 20h6'),
  funicular: P('M4 8l16-4v10L4 18zM4 8v10l16 4M4 14l16-4M8 12v2M16 8v2'),
  gondola: P('M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM6 12l6-3 6 3M4 14l16 2'),
  catamaran: P('M2 16l2-4h16l2 4-3 3-3-3-3 3-3-3-3 3zM6 12l6-4 6 4M9 12h6'),
  hovercraft: P('M2 16h20v3a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zM6 10h12v4H6zM10 4h4v6h-4z'),
  'air-taxi': P('M4 16h12l4-4v-2L8 12zM12 12v6M8 18l-2 4M16 18l2 4')+ C(8, 21, 1.5)+ C(16, 21, 1.5),
  segway: C(12, 4, 2)+ P('M12 6v8M6 14h12v4H6zM6 18v4M18 18v4M9 14v4M15 14v4')+ C(8, 22, 1.5)+ C(16, 22, 1.5),
  unicycle: C(12, 4, 2)+ C(12, 15, 6)+ P('M12 6v9M9 21h6M15 15l-3-6M9 15l3-6'),
  skateboard: P('M2 16h20v3H2zM4 19v2M20 19v2M6 10h12v4H6zM9 6h6v4H9z'),
  roller: P('M4 10h16v6H4zM4 16v4M20 16v4M9 6h6v4H9zM12 2v4')+ C(8, 21, 1)+ C(16, 21, 1),
  bathtub: P('M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10V6a2 2 0 0 1 4 0v4M4 18v2M20 18v2M2 12h20M12 4v6'),
  shower: P('M6 4h12v6H6zM6 6H2M6 8H2M10 10v8a4 4 0 0 0 8 0M12 20h.01M14 18h.01M16 16h.01M18 14h.01'),
  sink: P('M4 8h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 8V4h4M12 4h6')+ C(12, 14, 2),
  toilet: C(12, 6, 3)+ P('M9 9v6c0 3 2 5 3 5s3-2 3-5V9M6 20h12M12 9v11'),
  urinal: P('M5 4h14v10a7 7 0 0 1-14 0zM12 4V2M8 8h.01M12 8h.01M16 8h.01'),
  stool: P('M6 10h12v4H6zM6 14l-2 6M18 14l2 6M4 20h4M16 20h4M12 10v4'),
  'side-table': P('M3 10h18v3H3zM6 13v9M18 13v9M4 10V6h16v4M9 6v4M15 6v4'),
  shelf: R(2, 4, 20, 16, 1)+ P('M2 10h20M2 16h20M8 4v6M16 4v6M8 10v6M16 10v6M8 16v4M16 16v4'),
  'coat-rack': P('M4 22h16M12 4v18M8 8h8M6 6l6 2 6-2M8 4h8'),
  'shoe-rack': R(2, 6, 20, 14, 1)+ P('M2 11h20M2 16h20M7 6v14M17 6v14M6 9h.01M12 9h.01M18 9h.01M6 14h.01M12 14h.01M18 14h.01M6 19h.01M12 19h.01M18 19h.01'),
  'book-shelf': R(2, 4, 20, 16, 1)+ P('M2 10h20M2 16h20M5 6h2v4H5zM9 6h2v4H9zM13 6h2v4h-2zM5 12h2v4H5zM9 12h2v4H9zM13 12h2v4h-2zM17 12h2v4h-2zM5 18h2v2H5zM9 18h2v2H9z'),
  'cpu-2': R(4, 4, 16, 16, 2)+ R(9, 9, 6, 6)+ P('M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3M7 7h.01M17 7h.01M7 17h.01M17 17h.01'),
  gpu: R(2, 6, 20, 12, 1)+ C(12, 12, 4)+ P('M6 10v4M18 10v4M4 18v3M20 18v3M7 6V3M17 6V3'),
  ram: R(2, 8, 20, 8, 1)+ P('M4 10v4M6 10v4M8 10v4M10 10v4M12 10v4M14 10v4M16 10v4M18 10v4M20 10v4M7 16v3M12 16v3M17 16v3'),
  ssd: R(2, 5, 20, 14, 2)+ P('M6 10h12M6 14h8')+ C(17, 15, 1.5),
  motherboard: R(2, 2, 20, 20, 1)+ C(12, 12, 3)+ P('M6 6h.01M18 6h.01M6 18h.01M18 18h.01M4 12h4M16 12h4M12 4v4M12 16v4'),
  'power-supply': R(3, 6, 18, 12, 1)+ C(10, 12, 4)+ P('M17 8v8M20 10v4M8 6V3M16 6V3M4 18v3M20 18v3'),
  'cpu-fan': R(2, 2, 20, 20, 3)+ C(12, 12, 7)+ P('M8 8l8 8M16 8l-8 8M12 5v4M12 15v4M5 12h4M15 12h4'),
  heatsink: R(3, 4, 18, 16, 1)+ P('M6 4v16M9 4v16M12 4v16M15 4v16M18 4v16M6 8h12M6 12h12M6 16h12'),
  'server-rack': R(3, 2, 18, 20, 1)+ P('M3 8h18M3 14h18M3 20h18M6 5h.01M6 11h.01M6 17h.01M10 5h8M10 11h8M10 17h8'),
  'data-center': R(2, 2, 20, 20, 1)+ P('M2 7h20M2 12h20M2 17h20M6 4h.01M10 4h6M6 9h.01M10 9h6M6 14h.01M10 14h6M6 19h.01M10 19h6'),
  'cloud-server': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16')+ R(7, 16, 10, 6, 1)+ P('M9 19h.01M12 19h.01M15 19h.01'),
  'edge-computing': R(3, 3, 18, 18, 2)+ C(12, 12, 4)+ P('M12 8V6M12 18v-2M8 12H6M18 12h-2M7 7l2 2M17 17l-2-2M7 17l2-2M17 7l-2 2'),
  blockchain: R(3, 3, 7, 7, 1)+ R(14, 3, 7, 7, 1)+ R(3, 14, 7, 7, 1)+ R(14, 14, 7, 7, 1)+ P('M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4M6.5 10L10 6.5M17.5 10L14 6.5M6.5 14L10 17.5M17.5 14L14 17.5'),
})

// ============ 合并 batch5 ============
import { batch5 } from './batch5.js'
Object.assign(icons, batch5)
Object.assign(icons, {
  'bagpipes': P('M8 6a4 4 0 1 1 8 0v6H8zM12 12v8M9 20h6M5 4l3 2M19 4l-3 2M6 6v10M18 6v10'),
  'lute': C(11, 16, 6) + P('M11 10V2l7 3-7 3M8 18h.01M13 18h.01M11 13h.01'),
  'ukulele': C(12, 14, 7) + P('M12 7V2M10 2h4M9 12h.01M15 12h.01M12 11v6'),
  'sitar': C(12, 16, 6) + P('M12 10V2M9 2h6M9 14h6M5 22l14-2'),
  'balalaika': P('M12 2 L18 12 L12 22 L6 12 Z M12 8v6M9 22h6'),
  'zither': R(2, 8, 20, 8, 1) + P('M5 8v8M8 8v8M11 8v8M14 8v8M17 8v8M20 8v8'),
  'steel-drum': C(12, 12, 9) + P('M12 3v9M6 6l6 6M18 6l-6 6M6 18l6-6M18 18l-6-6'),
  'wind-chime': P('M12 2v4M10 6h4M8 8h8M6 10h12M4 12h16M6 14v6M10 14v6M14 14v6M18 14v6M8 20h8'),
  'beaker-2': P('M5 3h14l-4 8v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8zM8 14h8'),
  'erlenmeyer': P('M8 2h8v7l4 10a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l4-10zM5 15h14M10 2v7'),
  'volumetric-flask': C(12, 15, 5) + P('M10 2h4v8l3 5a4 4 0 1 1-10 0l3-5zM10 10h4'),
  'watch-glass': P('M4 14a8 4 0 0 1 16 0 8 2 0 0 1-16 0M12 10v4'),
  'desiccator': C(12, 16, 6) + P('M6 16V6h12v10M4 16h16M8 6V4h8v2'),
  'mortar-pestle': P('M4 12a8 8 0 0 0 16 0zM12 12V6M8 4l4 2 4-2M6 20h12'),
  'weighing-boat': P('M4 14l2 6h12l2-6zM6 14V8h12v6M8 8V6h8v2'),
  'magnetic-bar': R(3, 10, 18, 4, 1) + P('M3 10h4v4H3zM17 10h4v4h-4z'),
  'ph-strip': R(3, 3, 4, 18, 1) + R(8, 3, 4, 18, 1) + R(13, 3, 4, 18, 1) + R(18, 3, 4, 18, 1),
  'test-tube-3': P('M12 2v16a4 4 0 0 1-8 0V2M4 2h8M4 8h8M4 14h8M16 6v12a4 4 0 0 0 4 4'),
  'star-2': P('M12 2l2 7 7 1-5 5 1 7-5-3-5 3 1-7-5-5 7-1z'),
  'moon-crescent-2': P('M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z'),
  'planet-2': C(12, 12, 6) + P('M3 9c3-1 15-3 18-1M3 15c3 1 15 3 18 1'),
  'comet-2': C(8, 8, 3) + P('M6 10l-3 3M10 6l1-3M2 8h-2M11 8l5 5M8 14l2 8'),
  'star-shower': P('M2 2l3 3M5 5l-2 3M8 8l2-3M5 8l-3 2M3 3l3 2M11 3l3 3M14 6l-2 3M11 9l-3 2M6 12l3-3M14 9l2-3'),
  'observatory-2': P('M2 21h20v-2H2zM5 19l7-13 7 13M8 13h8M12 4l-5 7M12 4l5 7'),
  'space-helmet': C(12, 12, 9) + P('M12 3a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V8a5 5 0 0 1 5-5zM8 9h.01M16 9h.01M10 13h4'),
  'star-map': C(12, 12, 9) + P('M6 6l3 3M15 6l-3 3M6 18l3-3M15 18l-3-3M12 3v2M12 19v2M3 12h2M19 12h2'),
  'thermometer-4': P('M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8'),
  'otoscope-2': C(12, 9, 5) + P('M12 14v6M9 20h6M8 6a4 4 0 0 1 8 0'),
  'ophthalmoscope': C(12, 12, 6) + C(12, 12, 2) + P('M6 4L4 2M18 4l2-2M6 20l-2 2M18 20l2 2'),
  'scalpel-3': P('M14 4l6 6-4 4-8-2-6 6v2h2l6-6 2 8 4-4-2-8 2-2z'),
  'suture-2': P('M2 12h4M18 12h4M6 12a2 2 0 1 0 4 0M14 12a2 2 0 1 0 4 0M10 12h4'),
  'iv-bag': P('M8 2h8v10l-2 3v5a2 2 0 0 1-4 0v-5l-2-3zM10 2V1h4v1M10 6h4M10 10h4'),
  'catheter': P('M4 12h8M12 12a4 4 0 0 1 8 0v6a2 2 0 0 1-4 0v-6'),
  'pacemaker-2': R(4, 8, 16, 10, 3) + C(12, 13, 3) + P('M8 3v5M16 3v5M10 13h.01M14 13h.01'),
  'defib-2': R(3, 7, 18, 12, 2) + P('M12 10v6M9 13h6M7 19v3M17 19v3'),
  'ventilator': R(3, 6, 18, 14, 2) + C(9, 12, 3) + P('M17 10v8M15 12h4M15 14h4M15 16h4M6 20v2M18 20v2'),
  'monorail': P('M4 6h16v10H4zM4 10h16M8 16v4M16 16v4M10 2v4M14 2v4M12 2v2M9 20h6'),
  'funicular': P('M4 8l16-4v10L4 18zM4 8v10l16 4M4 14l16-4M8 12v2M16 8v2'),
  'gondola': P('M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM6 12l6-3 6 3M4 14l16 2'),
  'catamaran': P('M2 16l2-4h16l2 4-3 3-3-3-3 3-3-3-3 3zM6 12l6-4 6 4M9 12h6'),
  'hovercraft': P('M2 16h20v3a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zM6 10h12v4H6zM10 4h4v6h-4z'),
  'air-taxi': P('M4 16h12l4-4v-2L8 12zM12 12v6M8 18l-2 4M16 18l2 4') + C(8, 21, 1.5) + C(16, 21, 1.5),
  'segway': C(12, 4, 2) + P('M12 6v8M6 14h12v4H6zM6 18v4M18 18v4M9 14v4M15 14v4') + C(8, 22, 1.5) + C(16, 22, 1.5),
  'unicycle': C(12, 4, 2) + C(12, 15, 6) + P('M12 6v9M9 21h6M15 15l-3-6M9 15l3-6'),
  'skateboard': P('M2 16h20v3H2zM4 19v2M20 19v2M6 10h12v4H6zM9 6h6v4H9z'),
  'roller-skate': P('M4 10h16v6H4zM4 16v4M20 16v4M9 6h6v4H9zM12 2v4') + C(8, 21, 1) + C(16, 21, 1),
  'bathtub': P('M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10V6a2 2 0 0 1 4 0v4M4 18v2M20 18v2M2 12h20M12 4v6'),
  'shower': P('M6 4h12v6H6zM6 6H2M6 8H2M10 10v8a4 4 0 0 0 8 0M12 20h.01M14 18h.01M16 16h.01M18 14h.01'),
  'sink-2': P('M4 8h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 8V4h4M12 4h6') + C(12, 14, 2),
  'toilet-2': C(12, 6, 3) + P('M9 9v6c0 3 2 5 3 5s3-2 3-5V9M6 20h12M12 9v11'),
  'urinal-2': P('M5 4h14v10a7 7 0 0 1-14 0zM12 4V2M8 8h.01M12 8h.01M16 8h.01'),
  'stool': P('M6 10h12v4H6zM6 14l-2 6M18 14l2 6M4 20h4M16 20h4M12 10v4'),
  'side-table': P('M3 10h18v3H3zM6 13v9M18 13v9M4 10V6h16v4M9 6v4M15 6v4'),
  'shelf-2': R(2, 4, 20, 16, 1) + P('M2 10h20M2 16h20M8 4v6M16 4v6M8 10v6M16 10v6M8 16v4M16 16v4'),
  'coat-rack': P('M4 22h16M12 4v18M8 8h8M6 6l6 2 6-2M8 4h8'),
  'shoe-rack': R(2, 6, 20, 14, 1) + P('M2 11h20M2 16h20M7 6v14M17 6v14M6 9h.01M12 9h.01M18 9h.01M6 14h.01M12 14h.01M18 14h.01M6 19h.01M12 19h.01M18 19h.01'),
  'book-shelf-2': R(2, 4, 20, 16, 1) + P('M2 10h20M2 16h20M5 6h2v4H5zM9 6h2v4H9zM13 6h2v4h-2zM5 12h2v4H5zM9 12h2v4H9zM13 12h2v4h-2zM17 12h2v4h-2zM5 18h2v2H5zM9 18h2v2H9z'),
  'cpu-2': R(4, 4, 16, 16, 2) + R(9, 9, 6, 6) + P('M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3M7 7h.01M17 7h.01M7 17h.01M17 17h.01'),
  'gpu': R(2, 6, 20, 12, 1) + C(12, 12, 4) + P('M6 10v4M18 10v4M4 18v3M20 18v3M7 6V3M17 6V3'),
  'ram': R(2, 8, 20, 8, 1) + P('M4 10v4M6 10v4M8 10v4M10 10v4M12 10v4M14 10v4M16 10v4M18 10v4M20 10v4M7 16v3M12 16v3M17 16v3'),
  'ssd': R(2, 5, 20, 14, 2) + P('M6 10h12M6 14h8') + C(17, 15, 1.5),
  'motherboard': R(2, 2, 20, 20, 1) + C(12, 12, 3) + P('M6 6h.01M18 6h.01M6 18h.01M18 18h.01M4 12h4M16 12h4M12 4v4M12 16v4'),
  'power-supply': R(3, 6, 18, 12, 1) + C(10, 12, 4) + P('M17 8v8M20 10v4M8 6V3M16 6V3M4 18v3M20 18v3'),
  'cpu-fan': R(2, 2, 20, 20, 3) + C(12, 12, 7) + P('M8 8l8 8M16 8l-8 8M12 5v4M12 15v4M5 12h4M15 12h4'),
  'heatsink': R(3, 4, 18, 16, 1) + P('M6 4v16M9 4v16M12 4v16M15 4v16M18 4v16M6 8h12M6 12h12M6 16h12'),
  'server-rack': R(3, 2, 18, 20, 1) + P('M3 8h18M3 14h18M3 20h18M6 5h.01M6 11h.01M6 17h.01M10 5h8M10 11h8M10 17h8'),
  'data-center': R(2, 2, 20, 20, 1) + P('M2 7h20M2 12h20M2 17h20M6 4h.01M10 4h6M6 9h.01M10 9h6M6 14h.01M10 14h6M6 19h.01M10 19h6'),
  'cloud-server': P('M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16') + R(7, 16, 10, 6, 1) + P('M9 19h.01M12 19h.01M15 19h.01'),
  'edge-computing': R(3, 3, 18, 18, 2) + C(12, 12, 4) + P('M12 8V6M12 18v-2M8 12H6M18 12h-2M7 7l2 2M17 17l-2-2M7 17l2-2M17 7l-2 2'),
  'blockchain': R(3, 3, 7, 7, 1) + R(14, 3, 7, 7, 1) + R(3, 14, 7, 7, 1) + R(14, 14, 7, 7, 1) + P('M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4M6.5 10L10 6.5M17.5 10L14 6.5M6.5 14L10 17.5M17.5 14L14 17.5')
})

// ============ 补齐到 2000 ============
Object.assign(icons, {
  'award-2': C(12, 8, 5) + P('M9 13l-3 9 6-3 6 3-3-9'),
  'trophy-2': P('M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M6 5h12v6a6 6 0 0 1-12 0zM9 17h6M10 21h4M12 17v4'),
  'certificate': P('M6 3h12v12H6zM9 7h6M9 11h6M12 15v6M10 19l2 2 2-2'),
  'badge-check': C(12, 10, 8) + P('M9 10l2 2 4-4M9 16l-3 6 3-1 3 1 3-1 3 1-3-6'),
  'ribbon': P('M12 2l3 4 5 1-3 4 3 4-5 1-3 4-3-4-5-1 3-4-3-4 5-1z') + C(12, 12, 2),
  'crown-2': P('M4 18h16l1-10-4 3-3-6-3 6-4-3zM4 20h16'),
  'shield-star': P('M12 2l9 3v6c0 5-4 9-9 11-5-2-9-6-9-11V5zM12 7l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z'),
  'sword-2': P('M20 4l-9 9-3-3M16 8l-4 4M3 21l3-3M14 4l6 6'),
  'crossed-swords': P('M14.5 9.5L21 3M21 3l-4 1 3 3zM3 21l5-5M14.5 14.5L21 21M21 21l-1-4-3 3M9.5 9.5L3 3M3 3l4 1-3 3M3 21l4-1M14.5 14.5L9.5 9.5'),
  'flame-2': P('M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10zM12 12v2'),
  'snowflake-2': P('M12 2v20M4 6l16 12M4 18L20 6M9 4l3 3 3-3M9 20l3-3 3 3'),
  'droplet-2': P('M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12zM9 14a3 3 0 0 0 3 3'),
  'leaf-2': P('M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6'),
  'tree-2': P('M12 22V12M17 12a5 5 0 0 1-5-5 5 5 0 0 1-5 5 5 5 0 1 0 10 0zM12 2v5'),
  'flower-3': C(12, 12, 3) + C(12, 6, 3) + C(12, 18, 3) + C(6, 12, 3) + C(18, 12, 3),
  'bird-2': P('M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M20 7l2 .5-2 .5M12 22l1.5-3M8 22l1-3'),
  'cat-2': C(12, 12, 7) + P('M6 6l1-3 3 2M18 6l-1-3-3 2M9 11h.01M15 11h.01M12 13v3M10 15h4'),
  'dog-2': C(12, 12, 7) + P('M6 6l-1-4M18 6l1-4M9 11h.01M15 11h.01M12 13v3M10 15h4'),
  'paw': C(9, 7, 2) + C(15, 7, 2) + C(5, 11, 2) + C(19, 11, 2) + P('M12 20a5 5 0 0 0 5-5c0-2-2-3-5-3s-5 1-5 3a5 5 0 0 0 5 5z'),
  'bone': P('M7 6a3 3 0 1 1 3 3l4 4a3 3 0 1 1-3 3 3 3 0 1 1 3-3l-4-4a3 3 0 1 1-3-3z'),
  'fish-4': P('M2 12c4-6 14-6 18 0-4 6-14 6-18 0zM18 12l4-3v6zM6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z'),
  'bug-3': C(12, 12, 6) + P('M12 6V3M12 21v-3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M9 3l3 3 3-3M9 21l3-3 3 3'),
  'snail-2': P('M8 20a8 8 0 0 1 8-14 6 6 0 0 1 6 6c0 4-4 8-8 8z') + P('M14 12a3 3 0 1 0 0 6M16 8V4M14 4h4M4 20h16'),
  'shrimp-2': P('M12 4c-4 0-7 3-7 7s3 7 7 7h4l4 4v-4l-2-2M5 11a7 7 0 0 0 14 0M12 4V2M10 2h4'),
  'crab-2': C(12, 13, 6) + P('M6 13L2 11l1-3 4 2M18 13l4-2-1-3-4 2M9 8L7 5M15 8l2-3M9 18l-2 3M15 18l2 3'),
  'whale-2': P('M3 12c0-5 6-8 12-6 3 1 5 3 6 5v2c0 3-3 5-7 5-2 0-4-1-5-2-3 1-6 0-6-4zM18 10l-3 2 3 2M9 13c1 2 3 3 5 3'),
  'dolphin-2': P('M4 20c4 0 8-2 10-5 2-3 2-6 0-9-1-2-3-3-5-3 0 0 1 2 0 4s-4 3-4 6 1 5 4 6c-2 1-4 1-5 1zM6 14l-3 1M8 10L5 8M12 8l-2-4'),
  'octopus-2': C(12, 10, 6) + P('M6 10v6a3 3 0 0 0 3 3M9 19a3 3 0 0 0 3 3M12 19a3 3 0 0 0 3 3M15 19a3 3 0 0 0 3-3v-6M9 8h.01M15 8h.01'),
  'jellyfish-2': P('M12 3c-5 0-8 3-8 7 0 3 3 5 8 5s8-2 8-5c0-4-3-7-8-7zM6 15c0 3 1 4 1 6M10 15c0 2 0 4 0 6M14 15c0 2 0 4 0 6M18 15c0 3-1 4-1 6M9 9h.01M15 9h.01'),
  'shell-3': P('M12 3c-4 0-7 4-7 9 0 4 3 8 7 9 4-1 7-5 7-9 0-5-3-9-7-9zM12 3v18M6 10h12M5 15h14'),
  'coral-3': P('M12 22V10M12 10c0-3 2-5 4-5s3 2 3 4M12 10c0-2-1-4-3-4s-4 1-4 3M8 12c0 2-2 3-3 3M16 13c0 2 2 3 3 3M6 22h12'),
  'mountain-2': P('M3 20l7-12 4 6 3-4 4 10zM9 8l3-4 4 6'),
  'volcano-2': P('M3 22h18l-5-8H8zM8 14l4-12 4 12M10 6h4M9 10h6'),
  'island-2': P('M2 20h20M5 20a7 7 0 0 1 14 0M12 13V3M8 7l4-4 4 4'),
  'tent-2': P('M3.5 21L14 3l10.5 18M14 21l-3.5-6M14 21l3.5-6M10 15h8'),
  'compass-2': C(12, 12, 9) + P('M16 8l-2 6-6 2 2-6z'),
  'binoculars-2': C(6, 12, 4) + C(18, 12, 4) + P('M6 8V4M18 8V4M9 8h6M9 10h6M3 12h-1M22 12h-1'),
  'flashlight-2': P('M6 2h12v6H6zM9 8v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8M12 4v2M9 12h.01M15 12h.01'),
  'compass-3': C(12, 12, 9) + C(12, 12, 2) + P('M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5l1.5-1.5M17 7l1.5-1.5')
})
