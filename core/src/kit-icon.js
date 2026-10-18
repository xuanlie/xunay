// XuNay Icon Kit —— 64 个 SVG 图标
import { createElement } from './element.js'
import { px } from './kit-util.js'

const S = (tag, props, ...children) => createElement(tag, props, ...children)

const ICO = {
  fill: 'none', stroke: 'currentColor',
  'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
}

function makeIcon(paths, opts = {}) {
  return function Icon(props) {
    const { size = 20, color, stroke = 1.8, style, class: cls, ...rest } = px(props)
    return S('svg', {
      viewBox: '0 0 24 24',
      width: size, height: size,
      style: 'display:inline-block;vertical-align:middle;flex-shrink:0;' +
        (color ? 'color:' + color + ';' : '') + (style || ''),
      class: cls,
      ...rest,
    }, ...paths.map((d, i) =>
      S('path', { key: i, d, ...ICO, 'stroke-width': stroke, ...(opts.attrs || {}) })
    ))
  }
}

// ============ 导航 / 方向 ============
export const IconArrowRight = makeIcon(['M5 12h14', 'M13 6l6 6-6 6'])
export const IconArrowLeft = makeIcon(['M19 12H5', 'M11 6l-6 6 6 6'])
export const IconArrowUp = makeIcon(['M12 19V5', 'M6 11l6-6 6 6'])
export const IconArrowDown = makeIcon(['M12 5v14', 'M6 13l6 6 6-6'])
export const IconChevronRight = makeIcon(['M9 18l6-6-6-6'])
export const IconChevronLeft = makeIcon(['M15 18l-6-6 6-6'])
export const IconChevronDown = makeIcon(['M6 9l6 6 6-6'])
export const IconChevronUp = makeIcon(['M18 15l-6-6-6 6'])
export const IconExternalLink = makeIcon(['M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6', 'M15 3h6v6', 'M10 14L21 3'])

// ============ 操作 ============
export const IconCheck = makeIcon(['M5 12l4 4 10-10'])
export const IconClose = makeIcon(['M6 6l12 12', 'M18 6L6 18'])
export const IconPlus = makeIcon(['M12 5v14', 'M5 12h14'])
export const IconMinus = makeIcon(['M5 12h14'])
export const IconSearch = makeIcon(['M11 19a8 8 0 110-16 8 8 0 010 16z', 'M21 21l-4.35-4.35'])
export const IconMenu = makeIcon(['M4 6h16', 'M4 12h16', 'M4 18h16'])
export const IconMoreH = makeIcon(['M5 12h.01', 'M12 12h.01', 'M19 12h.01'])
export const IconMoreV = makeIcon(['M12 5h.01', 'M12 12h.01', 'M12 19h.01'])
export const IconRefresh = makeIcon(['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0114.85-3.36L23 10', 'M1 14l4.64 4.36A9 9 0 0020.49 15'])
export const IconEdit = makeIcon(['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z'])
export const IconCopy = makeIcon(['M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2z', 'M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1'])
export const IconTrash = makeIcon(['M3 6h18', 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6', 'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2'])
export const IconSave = makeIcon(['M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z', 'M17 21v-8H7v8', 'M7 3v5h8'])
export const IconDownload = makeIcon(['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'])
export const IconUpload = makeIcon(['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'])
export const IconShare = makeIcon(['M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13'])
export const IconBookmark = makeIcon(['M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z'])

// ============ 视图 ============
export const IconZoomIn = makeIcon(['M11 19a8 8 0 110-16 8 8 0 010 16z', 'M21 21l-4.35-4.35', 'M11 8v6', 'M8 11h6'])
export const IconZoomOut = makeIcon(['M11 19a8 8 0 110-16 8 8 0 010 16z', 'M21 21l-4.35-4.35', 'M8 11h6'])
export const IconMaximize = makeIcon(['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'])
export const IconMinimize = makeIcon(['M4 14h6v6', 'M20 10h-6V4', 'M14 10l7-7', 'M3 21l7-7'])
export const IconGrid = makeIcon(['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'])
export const IconList = makeIcon(['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'])
export const IconFilter = makeIcon(['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'])
export const IconSort = makeIcon(['M3 6h18', 'M7 12h10', 'M11 18h2'])
export const IconEye = makeIcon(['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 15a3 3 0 100-6 3 3 0 000 6z'])
export const IconEyeOff = makeIcon(['M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94', 'M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19', 'M1 1l22 22'])

// ============ 用户 / 社交 ============
export const IconUser = makeIcon(['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 11a4 4 0 100-8 4 4 0 000 8z'])
export const IconUsers = makeIcon(['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'])
export const IconHeart = makeIcon(['M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z'])
export const IconStar = makeIcon(['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z'])
export const IconMessage = makeIcon(['M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z'])
export const IconBell = makeIcon(['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'])
export const IconMail = makeIcon(['M4 4h16v16H4z', 'M22 6l-10 7L2 6'])
export const IconPhone = makeIcon(['M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z'])

// ============ 文件 / 数据 ============
export const IconFile = makeIcon(['M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z', 'M13 2v7h7'])
export const IconFolder = makeIcon(['M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z'])
export const IconImage = makeIcon(['M3 3h18v18H3z', 'M8.5 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', 'M21 15l-5-5L5 21'])
export const IconCalendar = makeIcon(['M5 4h14v18H5z', 'M16 2v4', 'M8 2v4', 'M3 10h18'])
export const IconClock = makeIcon(['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 6v6l4 2'])
export const IconTag = makeIcon(['M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z', 'M7 7h.01'])
export const IconFlag = makeIcon(['M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', 'M4 22v-7'])
export const IconCloud = makeIcon(['M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z'])
export const IconDatabase = makeIcon(['M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3z', 'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5', 'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3'])

// ============ 地图 / 位置 ============
export const IconMap = makeIcon(['M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z', 'M8 2v16', 'M16 6v16'])
export const IconNavigation = makeIcon(['M3 11l19-9-9 19-2-8-8-2z'])
export const IconCompass = makeIcon(['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z'])
export const IconPin = makeIcon(['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', 'M12 13a3 3 0 100-6 3 3 0 000 6z'])

// ============ 媒体 ============
export const IconPlay = makeIcon(['M5 3l14 9-14 9V3z'])
export const IconPause = makeIcon(['M6 4h4v16H6z', 'M14 4h4v16h-4z'])
export const IconCamera = makeIcon(['M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z', 'M12 17a4 4 0 100-8 4 4 0 000 8z'])
export const IconMic = makeIcon(['M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z', 'M19 10v2a7 7 0 01-14 0v-2', 'M12 19v4', 'M8 23h8'])
export const IconVolume = makeIcon(['M11 5L6 9H2v6h4l5 4V5z', 'M19.07 4.93a10 10 0 010 14.14', 'M15.54 8.46a5 5 0 010 7.07'])
export const IconVolumeOff = makeIcon(['M11 5L6 9H2v6h4l5 4V5z', 'M23 9l-6 6', 'M17 9l6 6'])

// ============ 状态 / 提示 ============
export const IconInfo = makeIcon(['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 16v-4', 'M12 8h.01'])
export const IconWarn = makeIcon(['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', 'M12 9v4', 'M12 17h.01'])
export const IconCheckCircle = makeIcon(['M22 11.08V12a10 10 0 11-5.93-9.14', 'M22 4L12 14.01l-3-3'])
export const IconXCircle = makeIcon(['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M15 9l-6 6', 'M9 9l6 6'])
export const IconLock = makeIcon(['M5 11h14v10H5z', 'M8 11V7a4 4 0 018 0v4'])
export const IconUnlock = makeIcon(['M5 11h14v10H5z', 'M8 11V7a4 4 0 015.6-3.6'])
export const IconShield = makeIcon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'])

// ============ 主题 ============
export const IconSun = makeIcon(['M12 17a5 5 0 100-10 5 5 0 000 10z', 'M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42', 'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42'])
export const IconMoon = makeIcon(['M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'])
export const IconLink = makeIcon(['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'])
export const IconHome = makeIcon(['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', 'M9 22V12h6v10'])
export const IconSettings = makeIcon(['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z'])

// ============ 布局 ============
export const IconLayout = makeIcon(['M3 3h18v18H3z', 'M3 9h18', 'M9 21V9'])
export const IconSidebar = makeIcon(['M3 3h18v18H3z', 'M9 3v18'])
export const IconColumns = makeIcon(['M3 3h7v18H3z', 'M14 3h7v18h-7z'])
export const IconRows = makeIcon(['M3 3h18v7H3z', 'M3 14h18v7H3z'])

