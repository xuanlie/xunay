// @xunay/kit/icons —— 逐图标导出，tree-shake 友好
// 自动生成，勿手改。源: icons-data/icons.js
import { createElement } from '../element.js'
import { px } from '../kit-util.js'

const S = (t, p, ...c) => createElement(t, p, ...c)
const ICO = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.8,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
}

const _shapeCache = new Map()
function parseShapes(svg) {
  let cached = _shapeCache.get(svg)
  if (cached) return cached
  const shapes = []
  const re = /<(\w+)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g
  let m
  while ((m = re.exec(svg))) {
    const attrs = {}
    const are = /([\w:-]+)\s*=\s*"([^"]*)"/g
    let am
    while ((am = are.exec(m[2]))) attrs[am[1]] = am[2]
    shapes.push([m[1], attrs, m[3] || null])
  }
  _shapeCache.set(svg, shapes)
  return shapes
}

function makeIcon(raw, name) {
  return function Icon(props) {
    const { size = 20, color, stroke = 1.8, style, class: cls, ...rest } = px(props)
    const shapes = parseShapes(raw)
    return S('svg', {
      viewBox: '0 0 24 24',
      width: size,
      height: size,
      'aria-label': name,
      style: 'display:inline-block;vertical-align:middle;flex-shrink:0;' +
        (color ? 'color:' + color + ';' : '') + (style || ''),
      class: cls,
      ...rest,
    }, ...shapes.map(([tag, attrs, text], i) => {
      const merged = { key: i, ...ICO, ...attrs }
      if (stroke != null) merged['stroke-width'] = stroke
      return text ? S(tag, merged, text) : S(tag, merged)
    }))
  }
}

// ============ 2001 个图标 ============
export const IconHome = makeIcon("<path d=\"M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z\"/>", "home")
export const IconMenu = makeIcon("<path d=\"M4 6h16M4 12h16M4 18h16\"/>", "menu")
export const IconClose = makeIcon("<path d=\"M6 6l12 12M18 6L6 18\"/>", "close")
export const IconSearch = makeIcon("<circle cx=\"11\" cy=\"11\" r=\"7\"/><line x1=\"16\" y1=\"16\" x2=\"21\" y2=\"21\"/>", "search")
export const IconSettings = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1\"/>", "settings")
export const IconUser = makeIcon("<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1\"/>", "user")
export const IconUsers = makeIcon("<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M17 8a3 3 0 1 1 0 6M22 21v-1a4 4 0 0 0-3-3.9\"/>", "users")
export const IconPlus = makeIcon("<path d=\"M12 5v14M5 12h14\"/>", "plus")
export const IconMinus = makeIcon("<path d=\"M5 12h14\"/>", "minus")
export const IconCheck = makeIcon("<path d=\"M4 12l5 5L20 6\"/>", "check")
export const IconEdit = makeIcon("<path d=\"M14 4l6 6L9 21H3v-6z\"/>", "edit")
export const IconTrash = makeIcon("<path d=\"M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14\"/>", "trash")
export const IconCopy = makeIcon("<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "copy")
export const IconDownload = makeIcon("<path d=\"M12 3v12M7 10l5 5 5-5M5 21h14\"/>", "download")
export const IconUpload = makeIcon("<path d=\"M12 21V9M7 14l5-5 5 5M5 3h14\"/>", "upload")
export const IconSave = makeIcon("<path d=\"M5 3h11l3 3v15H5z M8 3v6h8V3 M8 17h8\"/>", "save")
export const IconShare = makeIcon("<circle cx=\"6\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"6\" r=\"2.5\"/><circle cx=\"18\" cy=\"18\" r=\"2.5\"/><path d=\"M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6\"/>", "share")
export const IconLink = makeIcon("<path d=\"M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1\"/>", "link")
export const IconExternalLink = makeIcon("<path d=\"M14 4h6v6M20 4L10 14M18 14v6H4V6h6\"/>", "external-link")
export const IconArrowUp = makeIcon("<path d=\"M12 20V4M5 11l7-7 7 7\"/>", "arrow-up")
export const IconArrowDown = makeIcon("<path d=\"M12 4v16M5 13l7 7 7-7\"/>", "arrow-down")
export const IconArrowLeft = makeIcon("<path d=\"M20 12H4M11 5l-7 7 7 7\"/>", "arrow-left")
export const IconArrowRight = makeIcon("<path d=\"M4 12h16M13 5l7 7-7 7\"/>", "arrow-right")
export const IconChevronUp = makeIcon("<path d=\"M6 15l6-6 6 6\"/>", "chevron-up")
export const IconChevronDown = makeIcon("<path d=\"M6 9l6 6 6-6\"/>", "chevron-down")
export const IconChevronLeft = makeIcon("<path d=\"M15 6l-6 6 6 6\"/>", "chevron-left")
export const IconChevronRight = makeIcon("<path d=\"M9 6l6 6-6 6\"/>", "chevron-right")
export const IconPlay = makeIcon("<path d=\"M6 4l14 8-14 8z\"/>", "play")
export const IconPause = makeIcon("<path d=\"M8 4v16M16 4v16\"/>", "pause")
export const IconStop = makeIcon("<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/>", "stop")
export const IconSkipBack = makeIcon("<path d=\"M18 4v16L8 12zM4 4v16\"/>", "skip-back")
export const IconSkipForward = makeIcon("<path d=\"M6 4v16l10-8zM20 4v16\"/>", "skip-forward")
export const IconVolume = makeIcon("<path d=\"M4 9v6h4l5 4V5L8 9z\"/><path d=\"M16 8a5 5 0 0 1 0 8\"/>", "volume")
export const IconMute = makeIcon("<path d=\"M4 9v6h4l5 4V5L8 9z\"/><path d=\"M22 9l-6 6M16 9l6 6\"/>", "mute")
export const IconMic = makeIcon("<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"/><path d=\"M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8\"/>", "mic")
export const IconFile = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z M13 3v7h7\"/>", "file")
export const IconFolder = makeIcon("<path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "folder")
export const IconImage = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"M21 15l-5-5L5 21\"/>", "image")
export const IconVideo = makeIcon("<path d=\"M3 6h13v12H3zM16 10l5-3v10l-5-3z\"/>", "video")
export const IconMusic = makeIcon("<path d=\"M9 18V5l10-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"16\" cy=\"16\" r=\"3\"/>", "music")
export const IconCamera = makeIcon("<path d=\"M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>", "camera")
export const IconMail = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/>", "mail")
export const IconMessage = makeIcon("<path d=\"M21 12a8 8 0 0 1-8 8H8l-5 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z\"/>", "message")
export const IconPhone = makeIcon("<path d=\"M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z\"/>", "phone")
export const IconSend = makeIcon("<path d=\"M22 2L11 13M22 2l-7 20-4-9-9-4z\"/>", "send")
export const IconCalendar = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M3 11h18\"/>", "calendar")
export const IconClock = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 3\"/>", "clock")
export const IconMapPin = makeIcon("<path d=\"M12 22s8-9 8-14a8 8 0 1 0-16 0c0 5 8 14 8 14z\"/><circle cx=\"12\" cy=\"8\" r=\"3\"/>", "map-pin")
export const IconMap = makeIcon("<path d=\"M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15\"/>", "map")
export const IconGlobe = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"/>", "globe")
export const IconCompass = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M16 8l-2 6-6 2 2-6z\"/>", "compass")
export const IconNavigation = makeIcon("<path d=\"M3 11l19-8-8 19-2-9z\"/>", "navigation")
export const IconHeart = makeIcon("<path d=\"M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11z\"/>", "heart")
export const IconStar = makeIcon("<path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/>", "star")
export const IconBell = makeIcon("<path d=\"M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4\"/>", "bell")
export const IconBookmark = makeIcon("<path d=\"M6 3h12v19l-6-5-6 5z\"/>", "bookmark")
export const IconFlag = makeIcon("<path d=\"M5 21V4h11l-2 4 2 4H5\"/>", "flag")
export const IconTag = makeIcon("<path d=\"M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\"/>", "tag")
export const IconGift = makeIcon("<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\"/><path d=\"M12 8v13M5 12v9h14v-9M12 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM8 8a3 3 0 1 1 0-6\"/>", "gift")
export const IconShoppingCart = makeIcon("<circle cx=\"9\" cy=\"20\" r=\"1.5\"/><circle cx=\"18\" cy=\"20\" r=\"1.5\"/><path d=\"M3 4h2l3 12h12l2-8H6\"/>", "shopping-cart")
export const IconCreditCard = makeIcon("<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M2 10h20M6 15h4\"/>", "credit-card")
export const IconPackage = makeIcon("<path d=\"M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 21V11\"/>", "package")
export const IconTruck = makeIcon("<path d=\"M3 6h11v11H3zM14 10h4l3 3v4h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "truck")
export const IconBriefcase = makeIcon("<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", "briefcase")
export const IconAward = makeIcon("<circle cx=\"12\" cy=\"9\" r=\"5\"/><path d=\"M9 14l-2 8 5-3 5 3-2-8\"/>", "award")
export const IconTrendingUp = makeIcon("<path d=\"M3 17l6-6 4 4 8-8M15 7h6v6\"/>", "trending-up")
export const IconTrendingDown = makeIcon("<path d=\"M3 7l6 6 4-4 8 8M15 17h6v-6\"/>", "trending-down")
export const IconBarChart = makeIcon("<path d=\"M4 20V10M10 20V4M16 20v-8M22 20H2\"/>", "bar-chart")
export const IconPieChart = makeIcon("<path d=\"M12 2v10h10A10 10 0 1 1 12 2z\"/><path d=\"M14 4a8 8 0 0 1 6 6h-6z\"/>", "pie-chart")
export const IconLineChart = makeIcon("<path d=\"M3 20l5-5 4 3 8-9M3 20h18\"/>", "line-chart")
export const IconActivity = makeIcon("<path d=\"M3 12h4l3-8 4 16 3-8h4\"/>", "activity")
export const IconLock = makeIcon("<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 1 1 8 0v3\"/>", "lock")
export const IconUnlock = makeIcon("<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 7.4-2\"/>", "unlock")
export const IconKey = makeIcon("<circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"M11 12l9-9M17 6l3 3M15 4l3 3\"/>", "key")
export const IconShield = makeIcon("<path d=\"M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6z\"/>", "shield")
export const IconEye = makeIcon("<path d=\"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "eye")
export const IconEyeOff = makeIcon("<path d=\"M2 12s4-7 10-7c2 0 4 1 5 2M2 12s4 7 10 7c2 0 4-1 5-2M3 3l18 18\"/>", "eye-off")
export const IconSun = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1\"/>", "sun")
export const IconMoon = makeIcon("<path d=\"M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z\"/>", "moon")
export const IconCloud = makeIcon("<path d=\"M6 18a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 18z\"/>", "cloud")
export const IconCloudRain = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><path d=\"M8 20l-1 2M12 20l-1 2M16 20l-1 2\"/>", "cloud-rain")
export const IconUmbrella = makeIcon("<path d=\"M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 0 4 0\"/>", "umbrella")
export const IconThermometer = makeIcon("<path d=\"M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z\"/>", "thermometer")
export const IconWind = makeIcon("<path d=\"M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8\"/>", "wind")
export const IconDroplet = makeIcon("<path d=\"M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z\"/>", "droplet")
export const IconFeather = makeIcon("<path d=\"M20 4a6 6 0 0 0-8 0l-8 8 4 4 8-8z M4 20l4-4M14 6l4 4\"/>", "feather")
export const IconAnchor = makeIcon("<circle cx=\"12\" cy=\"5\" r=\"2\"/><path d=\"M12 7v14M5 12a7 7 0 0 0 14 0M3 12h4M17 12h4\"/>", "anchor")
export const IconMonitor = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"13\" rx=\"2\"/><path d=\"M8 21h8M12 17v4\"/>", "monitor")
export const IconSmartphone = makeIcon("<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"/><path d=\"M11 18h2\"/>", "smartphone")
export const IconTablet = makeIcon("<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><path d=\"M11 18h2\"/>", "tablet")
export const IconWatch = makeIcon("<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"5\"/><path d=\"M9 7V3h6v4M9 17v4h6v-4M12 10v2l1 1\"/>", "watch")
export const IconHeadphones = makeIcon("<path d=\"M3 14v-2a9 9 0 0 1 18 0v2M3 14v3a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2zM21 14v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2z\"/>", "headphones")
export const IconSpeaker = makeIcon("<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"/><circle cx=\"12\" cy=\"9\" r=\"2.5\"/><circle cx=\"12\" cy=\"15\" r=\"4\"/>", "speaker")
export const IconBattery = makeIcon("<rect x=\"2\" y=\"8\" width=\"18\" height=\"8\" rx=\"2\"/><path d=\"M22 11v2M5 11v2M9 11v2M13 11v2\"/>", "battery")
export const IconWifi = makeIcon("<path d=\"M3 10a14 14 0 0 1 18 0M6 13a10 10 0 0 1 12 0M9 16a6 6 0 0 1 6 0\"/><circle cx=\"12\" cy=\"19\" r=\"1\"/>", "wifi")
export const IconBluetooth = makeIcon("<path d=\"M7 7l10 10-5 4V3l5 4L7 17\"/>", "bluetooth")
export const IconBold = makeIcon("<path d=\"M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z\"/>", "bold")
export const IconItalic = makeIcon("<path d=\"M10 4h8M6 20h8M14 4l-4 16\"/>", "italic")
export const IconUnderline = makeIcon("<path d=\"M6 4v7a6 6 0 0 0 12 0V4M4 21h16\"/>", "underline")
export const IconAlignLeft = makeIcon("<path d=\"M3 6h18M3 10h12M3 14h18M3 18h12\"/>", "align-left")
export const IconAlignCenter = makeIcon("<path d=\"M3 6h18M6 10h12M3 14h18M6 18h12\"/>", "align-center")
export const IconAlignRight = makeIcon("<path d=\"M3 6h18M9 10h12M3 14h18M9 18h12\"/>", "align-right")
export const IconList = makeIcon("<path d=\"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01\"/>", "list")
export const IconFilter = makeIcon("<path d=\"M3 4h18l-7 8v6l-4 2v-8z\"/>", "filter")
export const IconSort = makeIcon("<path d=\"M3 6h12M3 12h8M3 18h4M17 4v16l-4-4M17 20l4-4\"/>", "sort")
export const IconGrid = makeIcon("<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/>", "grid")
export const IconLayers = makeIcon("<path d=\"M12 2l10 6-10 6L2 8zM2 16l10 6 10-6M2 12l10 6 10-6\"/>", "layers")
export const IconInfo = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 8h.01M11 12h1v5h1\"/>", "info")
export const IconAlert = makeIcon("<path d=\"M12 3l10 18H2zM12 10v5M12 18h.01\"/>", "alert")
export const IconHelp = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9 9a3 3 0 1 1 4 3c-1 .5-1 1-1 2M12 18h.01\"/>", "help")
export const IconThumbsUp = makeIcon("<path d=\"M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 2 2v5h6a2 2 0 0 1 2 2l-2 8H7\"/>", "thumbs-up")
export const IconThumbsDown = makeIcon("<path d=\"M17 14V3h3v11zM17 14l-4 7a2 2 0 0 1-2-2v-5H5a2 2 0 0 1-2-2l2-8h12\"/>", "thumbs-down")
export const IconSmile = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2\"/><path d=\"M9 9h.01M15 9h.01\"/>", "smile")
export const IconFrown = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M16 16s-1.5-2-4-2-4 2-4 2\"/><path d=\"M9 9h.01M15 9h.01\"/>", "frown")
export const IconMeh = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 15h8\"/><path d=\"M9 9h.01M15 9h.01\"/>", "meh")
export const IconZap = makeIcon("<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "zap")
export const IconTarget = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>", "target")
export const IconCrosshair = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3v4M12 17v4M3 12h4M17 12h4\"/>", "crosshair")
export const IconRocket = makeIcon("<path d=\"M5 15s-2 4 1 6 6-2 6-2M9 19l-4-4M14 4c3 0 6 3 6 6-2 5-9 8-9 8l-5-5s3-7 8-9z\"/><circle cx=\"15\" cy=\"8\" r=\"1.5\"/>", "rocket")
export const IconCrown = makeIcon("<path d=\"M3 18l1-9 5 4 3-6 3 6 5-4 1 9z\"/>", "crown")
export const IconDiamond = makeIcon("<path d=\"M6 3h12l4 6-10 13L2 9z\"/>", "diamond")
export const IconFlash = makeIcon("<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "flash")
export const IconSparkle = makeIcon("<path d=\"M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4\"/>", "sparkle")
export const IconArrowUpLeft = makeIcon("<path d=\"M17 17L7 7M7 17V7h10\"/>", "arrow-up-left")
export const IconArrowUpRight = makeIcon("<path d=\"M7 17L17 7M7 7h10v10\"/>", "arrow-up-right")
export const IconArrowDownLeft = makeIcon("<path d=\"M17 7L7 17M17 17H7V7\"/>", "arrow-down-left")
export const IconArrowDownRight = makeIcon("<path d=\"M7 7l10 10M17 7v10H7\"/>", "arrow-down-right")
export const IconArrowUpCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16V8M8 12l4-4 4 4\"/>", "arrow-up-circle")
export const IconArrowDownCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 8v8M8 12l4 4 4-4\"/>", "arrow-down-circle")
export const IconArrowLeftCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M16 12H8M12 8l-4 4 4 4\"/>", "arrow-left-circle")
export const IconArrowRightCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 12h8M12 8l4 4-4 4\"/>", "arrow-right-circle")
export const IconArrowLeftRight = makeIcon("<path d=\"M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18\"/>", "arrow-left-right")
export const IconArrowUpDown = makeIcon("<path d=\"M7 8l5-5 5 5M7 16l5 5 5-5M12 3v18\"/>", "arrow-up-down")
export const IconCornerUpLeft = makeIcon("<path d=\"M9 14L4 9l5-5M20 20v-7a4 4 0 0 0-4-4H4\"/>", "corner-up-left")
export const IconCornerUpRight = makeIcon("<path d=\"M15 14l5-5-5-5M4 20v-7a4 4 0 0 1 4-4h12\"/>", "corner-up-right")
export const IconCornerDownLeft = makeIcon("<path d=\"M9 10L4 15l5 5M20 4v7a4 4 0 0 1-4 4H4\"/>", "corner-down-left")
export const IconCornerDownRight = makeIcon("<path d=\"M15 10l5 5-5 5M4 4v7a4 4 0 0 0 4 4h12\"/>", "corner-down-right")
export const IconFileJs = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M10 13v4a2 2 0 0 1-4 0M18 13h-3v2h2v2h-2\"/>", "file-js")
export const IconFileTs = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M7 13h4M9 13v6M17 13h-3v2h2v2h-2\"/>", "file-ts")
export const IconFileJson = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14h1v4H8M15 14h1v4h-1M11 13v4\"/>", "file-json")
export const IconFilePy = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h5v2H8zM8 17h5\"/>", "file-py")
export const IconFileGo = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h5v5H8zM8 15h3\"/>", "file-go")
export const IconFileRs = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h4v2H8v3h4\"/>", "file-rs")
export const IconFileHtml = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13l-2 2 2 2M16 13l2 2-2 2M13 13l-2 6\"/>", "file-html")
export const IconFileCss = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14h5v4H8z\"/>", "file-css")
export const IconFileMd = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 17v-4l2 3 2-3v4M14 13v4\"/>", "file-md")
export const IconFilePdf = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 13h1.5a1.5 1.5 0 0 1 0 3H8v-3zM8 16v2M12 13v5h1.5a1.5 1.5 0 0 0 0-3H12M16 13v5h3\"/>", "file-pdf")
export const IconFileZip = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M10 9v2M10 12v2M10 15v2M10 18v1M12 10v2M12 13v2M12 16v2\"/>", "file-zip")
export const IconFileImage = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7\"/><circle cx=\"9\" cy=\"15\" r=\"1.5\"/><path d=\"M5 20l5-5 3 3 4-4 5 5\"/>", "file-image")
export const IconFileVideo = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14l5-3v6l-5-3zM8 11v6\"/>", "file-video")
export const IconFileAudio = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 16V12l5-2v8M8 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z\"/>", "file-audio")
export const IconFileXml = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14l-2 2 2 2M11 20l2-6M13 14l2 2-2 2\"/>", "file-xml")
export const IconFileYml = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M7 13l1.5 3L10 13v6M12 13v6h3\"/>", "file-yml")
export const IconFileCsv = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M9 15a2 2 0 1 0 0 4M12 13l2 6M14 13l-2 6M17 13v6h2\"/>", "file-csv")
export const IconFileSh = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M9 13l2 3-2 3M13 19h4\"/>", "file-sh")
export const IconFileLock = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7\"/><rect x=\"10\" y=\"13\" width=\"8\" height=\"6\" rx=\"1\"/><path d=\"M12 13v-1a2 2 0 1 1 4 0v1\"/>", "file-lock")
export const IconLogoTwitter = makeIcon("<path d=\"M22 5.5a8 8 0 0 1-2.5 1 4.5 4.5 0 0 0-7.7 4A13 13 0 0 1 2.5 5.5a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6 4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 2 20a12.7 12.7 0 0 0 6.9 2A12.7 12.7 0 0 0 22 8.5v-.6A9 9 0 0 0 24 5.8a8.7 8.7 0 0 1-2.5 1z\"/>", "logo-twitter")
export const IconLogoGithub = makeIcon("<path d=\"M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8C6.7 19.5 6.1 18 6.1 18c-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1 2.9.8.1-.7.4-1.1.6-1.4-2.1-.2-4.3-1-4.3-4.7 0-1 .4-1.9 1-2.5-.1-.2-.4-1.2.1-2.4 0 0 .8-.3 2.6 1a9 9 0 0 1 5 0c1.8-1.3 2.6-1 2.6-1 .5 1.2.2 2.2.1 2.4.6.6 1 1.5 1 2.5 0 3.7-2.2 4.5-4.3 4.7.3.3.7 1 .7 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2z\"/>", "logo-github")
export const IconLogoLinkedin = makeIcon("<path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A6 6 0 0 1 16 8zM2 9h4v12H2z\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/>", "logo-linkedin")
export const IconLogoYoutube = makeIcon("<path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"/><path d=\"M9.75 15.02l5.75-3.27-5.75-3.27z\"/>", "logo-youtube")
export const IconLogoFacebook = makeIcon("<path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/>", "logo-facebook")
export const IconLogoInstagram = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"17.5\" cy=\"6.5\" r=\"1\"/>", "logo-instagram")
export const IconLogoWhatsapp = makeIcon("<path d=\"M12 2a10 10 0 0 0-8.6 15L2 22l5-1.4A10 10 0 1 0 12 2z\"/><path d=\"M8.5 9a4.5 4.5 0 0 0 5 5l1.5-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2z\"/>", "logo-whatsapp")
export const IconLogoSlack = makeIcon("<path d=\"M14.5 10h3a3 3 0 1 1 0 6h-3v-6zM9.5 10h-3a3 3 0 1 0 0 6h3v-6zM14.5 9V6a3 3 0 1 0-6 0v3h6zM14.5 15v3a3 3 0 1 1-6 0v-3h6z\"/>", "logo-slack")
export const IconLogoDiscord = makeIcon("<circle cx=\"9\" cy=\"12\" r=\"2\"/><circle cx=\"15\" cy=\"12\" r=\"2\"/><path d=\"M20 6.5A16 16 0 0 0 16 5l-.5 1a12 12 0 0 0-7 0L8 5a16 16 0 0 0-4 1.5C1.5 10 1 13.5 1.5 17a15 15 0 0 0 4.5 2l1-1.5a10 10 0 0 1-1.5-.7l.5-.4a11 11 0 0 0 8 0l.5.4a10 10 0 0 1-1.5.7L14 19a15 15 0 0 0 4.5-2c.5-3.5 0-7-2.5-10.5z\"/>", "logo-discord")
export const IconLogoTelegram = makeIcon("<path d=\"M22 3L2 11l5 2 2 6 3-4 5 4 5-16zM9 13l8-6-4 7z\"/>", "logo-telegram")
export const IconLogoWechat = makeIcon("<path d=\"M8.5 5C5 5 2 7.5 2 10.5c0 1.7 1 3.3 2.5 4.3L4 17l2-1c.8.2 1.6.3 2.5.3.3 0 .6 0 .9-.1a5 5 0 0 1 6.1-4 3 3 0 0 0-2.5-1c0-.3.1-.6.1-1C13 7 11 5 8.5 5zM6.5 8.5h.01M10.5 8.5h.01\"/><path d=\"M22 14.5c0-2.5-2.5-4.5-5.5-4.5S11 12 11 14.5s2.5 4.5 5.5 4.5c.7 0 1.3-.1 2-.3l1.5.8-.4-1.3c1.5-.8 2.4-1.9 2.4-3.2zM15 13.5h.01M18 13.5h.01\"/>", "logo-wechat")
export const IconCloudSnow = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><path d=\"M8 20h.01M12 20h.01M16 20h.01M8 22h.01M12 22h.01M16 22h.01\"/>", "cloud-snow")
export const IconCloudLightning = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16M13 12l-2 5h3l-2 5\"/>", "cloud-lightning")
export const IconCloudDrizzle = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16M8 19v2M12 18v2M16 19v2\"/>", "cloud-drizzle")
export const IconCloudFog = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16M2 20h18M4 22h16\"/>", "cloud-fog")
export const IconSunrise = makeIcon("<path d=\"M17 18a5 5 0 0 0-10 0M12 2v7M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4-4 4 4\"/>", "sunrise")
export const IconSunset = makeIcon("<path d=\"M17 18a5 5 0 0 0-10 0M12 9V2M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M16 5l-4 4-4-4\"/>", "sunset")
export const IconSnowflake = makeIcon("<path d=\"M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M9 3l3 3 3-3M9 21l3-3 3 3M3 9l3 3-3 3M21 9l-3 3 3 3\"/>", "snowflake")
export const IconRainbow = makeIcon("<path d=\"M22 17a10 10 0 0 0-20 0M18 17a6 6 0 0 0-12 0M14 17a2 2 0 0 0-4 0\"/>", "rainbow")
export const IconWindStrong = makeIcon("<path d=\"M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8M3 20h10\"/>", "wind-strong")
export const IconMoonStar = makeIcon("<path d=\"M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z\"/><path d=\"M18 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z\"/>", "moon-star")
export const IconHand = makeIcon("<path d=\"M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-1a2 2 0 0 1 4 0\"/>", "hand")
export const IconHandHeart = makeIcon("<path d=\"M11 14l-2.5-2.5a2.5 2.5 0 0 1 3.5-3.5l1 1 1-1a2.5 2.5 0 0 1 3.5 3.5L14 14\"/><path d=\"M4 20a8 8 0 0 0 16 0V9a2 2 0 0 0-4 0M4 15V9a2 2 0 0 1 4 0\"/>", "hand-heart")
export const IconHandPeace = makeIcon("<path d=\"M14 4a2 2 0 0 1 4 0v6M10 4a2 2 0 0 1 4 0v6M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8V9a2 2 0 0 1 4 0\"/>", "hand-peace")
export const IconHandThumbsup = makeIcon("<path d=\"M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 2 2v5h6a2 2 0 0 1 2 2l-2 8H7\"/>", "hand-thumbsup")
export const IconHeartHand = makeIcon("<path d=\"M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11z\"/>", "heart-hand")
export const IconHeartPulse = makeIcon("<path d=\"M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11zM3 12h3l2-3 2 6 2-4 2 2h3\"/>", "heart-pulse")
export const IconStethoscope = makeIcon("<path d=\"M6 3v6a4 4 0 0 0 8 0V3M6 12a6 6 0 0 0 12 0v-3\"/><circle cx=\"19\" cy=\"10\" r=\"2\"/>", "stethoscope")
export const IconPill = makeIcon("<path d=\"M10.5 20.5l-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7zM7 8l7 7\"/>", "pill")
export const IconSyringe = makeIcon("<path d=\"M18 2l4 4M17 7l-7 7M14 4l6 6M9 12l-6 6v3h3l6-6M14 7l-7 7\"/>", "syringe")
export const IconBandage = makeIcon("<path d=\"M6.5 17.5L17.5 6.5a4 4 0 0 0-5.5-5.5L.5 12a4 4 0 0 0 5.5 5.5z M17.5 17.5a4 4 0 0 0 5.5-5.5L12.5.5M4 8l12 12\"/><circle cx=\"9\" cy=\"9\" r=\"1\"/><circle cx=\"15\" cy=\"15\" r=\"1\"/>", "bandage")
export const IconThermometerSun = makeIcon("<path d=\"M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z\"/><path d=\"M18 3v4M20 5h-4\"/>", "thermometer-sun")
export const IconWrench = makeIcon("<path d=\"M14.7 6.3a4 4 0 0 0 5.6 5.6L9.7 22.5a2 2 0 1 1-2.8-2.8L17.5 9M14.7 6.3l3-3 3 3-3 3M14.7 6.3l3-3\"/>", "wrench")
export const IconHammer = makeIcon("<path d=\"M15 12l-8.5 8.5a2 2 0 0 1-3-3L12 9M17.6 6.4l2.4-2.4 2 2-2.4 2.4M17.6 6.4l-2-2M11.6 12.4l-2-2\"/>", "hammer")
export const IconScrewdriver = makeIcon("<path d=\"M13 4l7 7M18 9l3-3M6 18l6-6M16 2l6 6-4 4-6-6zM8 16l-6 6M4 16l4 4\"/>", "screwdriver")
export const IconDrill = makeIcon("<path d=\"M4 8h13v6H4zM17 9h4v4h-4M8 14v5h5v-5\"/>", "drill")
export const IconRuler = makeIcon("<path d=\"M3 15l12-12 6 6-12 12zM7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2\"/>", "ruler")
export const IconScissors = makeIcon("<circle cx=\"6\" cy=\"6\" r=\"2\"/><circle cx=\"6\" cy=\"18\" r=\"2\"/><path d=\"M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12\"/>", "scissors")
export const IconPliers = makeIcon("<path d=\"M6 3l4 6-2 2-4-6zM18 3l-4 6 2 2 4-6zM8 11v3a4 4 0 0 0 8 0v-3\"/><circle cx=\"12\" cy=\"20\" r=\"2\"/>", "pliers")
export const IconCar = makeIcon("<path d=\"M5 17h14v-3l-2-5H7l-2 5zM5 17v3h3v-3M16 17v3h3v-3M5 12h14\"/><circle cx=\"7\" cy=\"17\" r=\"1.5\"/><circle cx=\"17\" cy=\"17\" r=\"1.5\"/>", "car")
export const IconBike = makeIcon("<circle cx=\"5\" cy=\"17\" r=\"3\"/><circle cx=\"19\" cy=\"17\" r=\"3\"/><path d=\"M5 17l5-10 3 10 2-6h5M10 7h4\"/>", "bike")
export const IconPlane = makeIcon("<path d=\"M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z\"/>", "plane")
export const IconTrain = makeIcon("<path d=\"M4 15V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM4 11h16M8 18l-2 3M16 18l2 3\"/><circle cx=\"9\" cy=\"15\" r=\"1.5\"/><circle cx=\"15\" cy=\"15\" r=\"1.5\"/>", "train")
export const IconBus = makeIcon("<path d=\"M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 11h16M4 20v-2M20 20v-2M10 4v7M14 4v7\"/><circle cx=\"8\" cy=\"18\" r=\"1.5\"/><circle cx=\"16\" cy=\"18\" r=\"1.5\"/>", "bus")
export const IconShip = makeIcon("<path d=\"M3 18l1.5-4L12 12l7.5 2 1.5 4-3-2-3 2-3-2-3 2-3-2zM12 12V4M6 6h4M14 6h4\"/>", "ship")
export const IconFuel = makeIcon("<path d=\"M14 22V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16M2 22h16M4 10h10M14 14h3a2 2 0 0 1 2 2v3a1 1 0 1 0 2 0V9l-4-4\"/>", "fuel")
export const IconBuilding = makeIcon("<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"1\"/><path d=\"M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01\"/>", "building")
export const IconBuilding2 = makeIcon("<path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4\"/>", "building-2")
export const IconHospital = makeIcon("<path d=\"M12 6v4M14 8h-4M2 21h20M4 21V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15M10 21v-4h4v4\"/>", "hospital")
export const IconSchool = makeIcon("<path d=\"M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5\"/>", "school")
export const IconShoppingBag = makeIcon("<path d=\"M6 2l-2 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-2-6zM4 8h16M16 12a4 4 0 0 1-8 0\"/>", "shopping-bag")
export const IconShoppingBag2 = makeIcon("<path d=\"M6 2h12l2 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8zM4 8h16M8 12a4 4 0 0 0 8 0\"/>", "shopping-bag-2")
export const IconStore = makeIcon("<path d=\"M2 7l1-4h18l1 4M2 7a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 2-1M4 12v9h16v-9M9 21v-5h6v5\"/>", "store")
export const IconFactory = makeIcon("<path d=\"M2 20V8l6 4V8l6 4V8l6 4v8zM2 20h20M6 16h.01M10 16h.01M14 16h.01M18 16h.01\"/>", "factory")
export const IconWarehouse = makeIcon("<path d=\"M22 8L12 2 2 8v14h20zM6 22v-8h12v8M6 18h12M6 14h12\"/>", "warehouse")
export const IconDumbbell = makeIcon("<path d=\"M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12\"/>", "dumbbell")
export const IconTrophy = makeIcon("<path d=\"M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M6 5h12v6a6 6 0 0 1-12 0zM9 17h6M10 21h4M12 17v4\"/>", "trophy")
export const IconMedal = makeIcon("<circle cx=\"12\" cy=\"9\" r=\"5\"/><path d=\"M9 14l-2 8 5-3 5 3-2-8M6 3h12l-4 6M18 3l-4 6\"/>", "medal")
export const IconFootball = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 7l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 2v5M12 17v5M5 8l3 2M19 8l-3 2M5 16l3-2M19 16l-3-2\"/>", "football")
export const IconBasketball = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20M12 2v20M4.9 4.9c4 4 4 10 0 14M19.1 4.9c-4 4-4 10 0 14\"/>", "basketball")
export const IconTennis = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M4.9 4.9c4 4 4 10 0 14M19.1 4.9c-4 4-4 10 0 14\"/>", "tennis")
export const IconSwimming = makeIcon("<path d=\"M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 21c2-2 4-2 6 0s4 2 6 0 4-2 6 0M6 10l2 2 2-2 4 3 4-3\"/><circle cx=\"17\" cy=\"6\" r=\"3\"/>", "swimming")
export const IconCoffee = makeIcon("<path d=\"M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v3M10 2v3M14 2v3\"/>", "coffee")
export const IconBeer = makeIcon("<path d=\"M17 11h1a3 3 0 0 1 0 6h-1M9 12v6M13 12v6M14 7.5c1-1 2-2 2-3.5a3 3 0 0 0-6 0c0 2 1 2 2 3.5v.5H5v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8h-3zM7 2.5c0 1 0 2 1 2.5\"/>", "beer")
export const IconWine = makeIcon("<path d=\"M8 22h8M12 15v7M7 3h10v5a5 5 0 0 1-10 0zM7 5h10\"/>", "wine")
export const IconCake = makeIcon("<path d=\"M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01\"/>", "cake")
export const IconPizza = makeIcon("<path d=\"M15 11h.01M11 15h.01M16 16h.01M12 2A15 15 0 0 0 2 14c0 3 2 5 5 5s5-2 5-5 0-5 3-5 5 2 5 5-2 3-3 3M12 2a15 15 0 0 1 10 12\"/>", "pizza")
export const IconBurger = makeIcon("<path d=\"M4 8h16M4 12h16M4 16h16M4 20h16M4 6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4M4 6v2h16V6M4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4\"/>", "burger")
export const IconLeaf = makeIcon("<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6\"/>", "leaf")
export const IconTree = makeIcon("<path d=\"M12 22V12M17 12a5 5 0 0 1-5-5 5 5 0 0 1-5 5 5 5 0 1 0 10 0zM12 2v5\"/>", "tree")
export const IconFlower = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><circle cx=\"12\" cy=\"6\" r=\"3\"/><circle cx=\"12\" cy=\"18\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"12\" r=\"3\"/><circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"18\" r=\"3\"/>", "flower")
export const IconFlower2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 9a3 3 0 1 1 3 3M12 15a3 3 0 1 1-3-3M9 12a3 3 0 1 1 3-3M15 12a3 3 0 1 1-3 3M12 12v10\"/>", "flower-2")
export const IconBird = makeIcon("<path d=\"M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M20 7l2 .5-2 .5M12 22l1.5-3M8 22l1-3\"/>", "bird")
export const IconCat = makeIcon("<path d=\"M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7A8 8 0 1 1 4 10s-1.82-6.42-.42-7c1.39-.58 4.64.26 6.42 2.26A11.13 11.13 0 0 1 12 5zM8 14v.5M16 14v.5M11.25 16.25h1.5L12 17z\"/><path d=\"M4.42 9.05c-2.42.85-2.42 3.9 0 4.75M19.58 9.05c2.42.85 2.42 3.9 0 4.75\"/>", "cat")
export const IconDog = makeIcon("<path d=\"M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .07.365.588.5 1 .5h.5C3.056 12 2 13.23 2 15a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6c0-1.77-1.056-3-2-4.5h.5c.412 0 .93-.135 1-.5.113-.994-1.177-6.53-4-7-1.922-.321-3.5.782-3.5 2.172M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17l-.75-.75z\"/>", "dog")
export const IconFish = makeIcon("<path d=\"M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6zM18 12v.5M16 17.93a9.77 9.77 0 0 1 0-11.86M8 12l-4-3v6zM6 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2\"/>", "fish")
export const IconRabbit = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"6\"/><path d=\"M10 8c0-3-2-6-3-6s-1 3 0 6M14 8c0-3 2-6 3-6s1 3 0 6M10 13h.01M14 13h.01M10 16h4M12 16v2\"/>", "rabbit")
export const IconBug = makeIcon("<path d=\"M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6zM12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M6 17H2M18 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M22 17h-4\"/>", "bug")
export const IconHomeCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z\"/>", "home-circle")
export const IconUserCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1\"/>", "user-circle")
export const IconUsersCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M17 8a3 3 0 1 1 0 6M22 21v-1a4 4 0 0 0-3-3.9\"/>", "users-circle")
export const IconSearchCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"11\" cy=\"11\" r=\"7\"/><line x1=\"16\" y1=\"16\" x2=\"21\" y2=\"21\"/>", "search-circle")
export const IconSettingsCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1\"/>", "settings-circle")
export const IconBellCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4\"/>", "bell-circle")
export const IconHeartCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11z\"/>", "heart-circle")
export const IconStarCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/>", "star-circle")
export const IconBookmarkCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M6 3h12v19l-6-5-6 5z\"/>", "bookmark-circle")
export const IconTagCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\"/>", "tag-circle")
export const IconPlusCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 5v14M5 12h14\"/>", "plus-circle")
export const IconMinusCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M5 12h14\"/>", "minus-circle")
export const IconCheckCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M4 12l5 5L20 6\"/>", "check-circle")
export const IconCloseCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M6 6l12 12M18 6L6 18\"/>", "close-circle")
export const IconEditCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M14 4l6 6L9 21H3v-6z\"/>", "edit-circle")
export const IconTrashCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14\"/>", "trash-circle")
export const IconCopyCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "copy-circle")
export const IconSaveCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M5 3h11l3 3v15H5z M8 3v6h8V3 M8 17h8\"/>", "save-circle")
export const IconShareCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"6\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"6\" r=\"2.5\"/><circle cx=\"18\" cy=\"18\" r=\"2.5\"/><path d=\"M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6\"/>", "share-circle")
export const IconLinkCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1\"/>", "link-circle")
export const IconDownloadCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 3v12M7 10l5 5 5-5M5 21h14\"/>", "download-circle")
export const IconUploadCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 21V9M7 14l5-5 5 5M5 3h14\"/>", "upload-circle")
export const IconFileCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z M13 3v7h7\"/>", "file-circle")
export const IconFolderCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "folder-circle")
export const IconImageCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"M21 15l-5-5L5 21\"/>", "image-circle")
export const IconVideoCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 6h13v12H3zM16 10l5-3v10l-5-3z\"/>", "video-circle")
export const IconMusicCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9 18V5l10-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"16\" cy=\"16\" r=\"3\"/>", "music-circle")
export const IconCameraCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>", "camera-circle")
export const IconMailCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/>", "mail-circle")
export const IconMessageCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M21 12a8 8 0 0 1-8 8H8l-5 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z\"/>", "message-circle")
export const IconPhoneCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z\"/>", "phone-circle")
export const IconSendCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M22 2L11 13M22 2l-7 20-4-9-9-4z\"/>", "send-circle")
export const IconCalendarCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M3 11h18\"/>", "calendar-circle")
export const IconClockCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 3\"/>", "clock-circle")
export const IconMapPinCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 22s8-9 8-14a8 8 0 1 0-16 0c0 5 8 14 8 14z\"/><circle cx=\"12\" cy=\"8\" r=\"3\"/>", "map-pin-circle")
export const IconGlobeCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"/>", "globe-circle")
export const IconLockCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 1 1 8 0v3\"/>", "lock-circle")
export const IconUnlockCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 7.4-2\"/>", "unlock-circle")
export const IconKeyCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"M11 12l9-9M17 6l3 3M15 4l3 3\"/>", "key-circle")
export const IconShieldCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6z\"/>", "shield-circle")
export const IconEyeCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "eye-circle")
export const IconSunCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1\"/>", "sun-circle")
export const IconMoonCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z\"/>", "moon-circle")
export const IconCloudCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M6 18a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 18z\"/>", "cloud-circle")
export const IconZapCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "zap-circle")
export const IconTargetCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>", "target-circle")
export const IconRocketCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M5 15s-2 4 1 6 6-2 6-2M9 19l-4-4M14 4c3 0 6 3 6 6-2 5-9 8-9 8l-5-5s3-7 8-9z\"/><circle cx=\"15\" cy=\"8\" r=\"1.5\"/>", "rocket-circle")
export const IconCrownCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 18l1-9 5 4 3-6 3 6 5-4 1 9z\"/>", "crown-circle")
export const IconDiamondCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M6 3h12l4 6-10 13L2 9z\"/>", "diamond-circle")
export const IconFlashCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "flash-circle")
export const IconThumbsUpCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 2 2v5h6a2 2 0 0 1 2 2l-2 8H7\"/>", "thumbs-up-circle")
export const IconInfoCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 8h.01M11 12h1v5h1\"/>", "info-circle")
export const IconAlertCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 3l10 18H2zM12 10v5M12 18h.01\"/>", "alert-circle")
export const IconHelpCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9 9a3 3 0 1 1 4 3c-1 .5-1 1-1 2M12 18h.01\"/>", "help-circle")
export const IconSmileCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2\"/><path d=\"M9 9h.01M15 9h.01\"/>", "smile-circle")
export const IconFilterCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M3 4h18l-7 8v6l-4 2v-8z\"/>", "filter-circle")
export const IconGridCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/>", "grid-circle")
export const IconLayersCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2l10 6-10 6L2 8zM2 16l10 6 10-6M2 12l10 6 10-6\"/>", "layers-circle")
export const IconPlayCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M6 4l14 8-14 8z\"/>", "play-circle")
export const IconPauseCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 4v16M16 4v16\"/>", "pause-circle")
export const IconHomeSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z\"/>", "home-square")
export const IconUserSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1\"/>", "user-square")
export const IconUsersSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M17 8a3 3 0 1 1 0 6M22 21v-1a4 4 0 0 0-3-3.9\"/>", "users-square")
export const IconSearchSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"11\" cy=\"11\" r=\"7\"/><line x1=\"16\" y1=\"16\" x2=\"21\" y2=\"21\"/>", "search-square")
export const IconSettingsSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1\"/>", "settings-square")
export const IconBellSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4\"/>", "bell-square")
export const IconHeartSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11z\"/>", "heart-square")
export const IconStarSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/>", "star-square")
export const IconBookmarkSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M6 3h12v19l-6-5-6 5z\"/>", "bookmark-square")
export const IconTagSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\"/>", "tag-square")
export const IconPlusSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 5v14M5 12h14\"/>", "plus-square")
export const IconMinusSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M5 12h14\"/>", "minus-square")
export const IconCheckSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M4 12l5 5L20 6\"/>", "check-square")
export const IconCloseSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M6 6l12 12M18 6L6 18\"/>", "close-square")
export const IconEditSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M14 4l6 6L9 21H3v-6z\"/>", "edit-square")
export const IconTrashSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14\"/>", "trash-square")
export const IconCopySquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "copy-square")
export const IconSaveSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M5 3h11l3 3v15H5z M8 3v6h8V3 M8 17h8\"/>", "save-square")
export const IconShareSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"6\" r=\"2.5\"/><circle cx=\"18\" cy=\"18\" r=\"2.5\"/><path d=\"M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6\"/>", "share-square")
export const IconLinkSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1\"/>", "link-square")
export const IconDownloadSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 3v12M7 10l5 5 5-5M5 21h14\"/>", "download-square")
export const IconUploadSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 21V9M7 14l5-5 5 5M5 3h14\"/>", "upload-square")
export const IconFileSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z M13 3v7h7\"/>", "file-square")
export const IconFolderSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "folder-square")
export const IconImageSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"M21 15l-5-5L5 21\"/>", "image-square")
export const IconVideoSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 6h13v12H3zM16 10l5-3v10l-5-3z\"/>", "video-square")
export const IconMusicSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M9 18V5l10-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"16\" cy=\"16\" r=\"3\"/>", "music-square")
export const IconCameraSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>", "camera-square")
export const IconMailSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/>", "mail-square")
export const IconMessageSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M21 12a8 8 0 0 1-8 8H8l-5 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z\"/>", "message-square")
export const IconPhoneSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z\"/>", "phone-square")
export const IconSendSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M22 2L11 13M22 2l-7 20-4-9-9-4z\"/>", "send-square")
export const IconCalendarSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M3 11h18\"/>", "calendar-square")
export const IconClockSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 3\"/>", "clock-square")
export const IconMapPinSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 22s8-9 8-14a8 8 0 1 0-16 0c0 5 8 14 8 14z\"/><circle cx=\"12\" cy=\"8\" r=\"3\"/>", "map-pin-square")
export const IconGlobeSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"/>", "globe-square")
export const IconLockSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 1 1 8 0v3\"/>", "lock-square")
export const IconUnlockSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 7.4-2\"/>", "unlock-square")
export const IconKeySquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"M11 12l9-9M17 6l3 3M15 4l3 3\"/>", "key-square")
export const IconShieldSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6z\"/>", "shield-square")
export const IconEyeSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "eye-square")
export const IconSunSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1\"/>", "sun-square")
export const IconMoonSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z\"/>", "moon-square")
export const IconCloudSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M6 18a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 18z\"/>", "cloud-square")
export const IconZapSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "zap-square")
export const IconTargetSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>", "target-square")
export const IconRocketSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M5 15s-2 4 1 6 6-2 6-2M9 19l-4-4M14 4c3 0 6 3 6 6-2 5-9 8-9 8l-5-5s3-7 8-9z\"/><circle cx=\"15\" cy=\"8\" r=\"1.5\"/>", "rocket-square")
export const IconCrownSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 18l1-9 5 4 3-6 3 6 5-4 1 9z\"/>", "crown-square")
export const IconDiamondSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M6 3h12l4 6-10 13L2 9z\"/>", "diamond-square")
export const IconFlashSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "flash-square")
export const IconThumbsUpSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 2 2v5h6a2 2 0 0 1 2 2l-2 8H7\"/>", "thumbs-up-square")
export const IconInfoSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 8h.01M11 12h1v5h1\"/>", "info-square")
export const IconAlertSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 3l10 18H2zM12 10v5M12 18h.01\"/>", "alert-square")
export const IconHelpSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9 9a3 3 0 1 1 4 3c-1 .5-1 1-1 2M12 18h.01\"/>", "help-square")
export const IconSmileSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2\"/><path d=\"M9 9h.01M15 9h.01\"/>", "smile-square")
export const IconFilterSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M3 4h18l-7 8v6l-4 2v-8z\"/>", "filter-square")
export const IconGridSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/>", "grid-square")
export const IconLayersSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M12 2l10 6-10 6L2 8zM2 16l10 6 10-6M2 12l10 6 10-6\"/>", "layers-square")
export const IconPlaySquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M6 4l14 8-14 8z\"/>", "play-square")
export const IconPauseSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><path d=\"M8 4v16M16 4v16\"/>", "pause-square")
export const IconBadge1 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">1</text>", "badge-1")
export const IconBadge2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">2</text>", "badge-2")
export const IconBadge3 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">3</text>", "badge-3")
export const IconBadge4 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">4</text>", "badge-4")
export const IconBadge5 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">5</text>", "badge-5")
export const IconBadge6 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">6</text>", "badge-6")
export const IconBadge7 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">7</text>", "badge-7")
export const IconBadge8 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">8</text>", "badge-8")
export const IconBadge9 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "badge-9")
export const IconBadge10 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">10</text>", "badge-10")
export const IconBadge11 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">11</text>", "badge-11")
export const IconBadge12 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">12</text>", "badge-12")
export const IconBadge13 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">13</text>", "badge-13")
export const IconBadge14 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">14</text>", "badge-14")
export const IconBadge15 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">15</text>", "badge-15")
export const IconBadge16 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">16</text>", "badge-16")
export const IconBadge17 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">17</text>", "badge-17")
export const IconBadge18 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">18</text>", "badge-18")
export const IconBadge19 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">19</text>", "badge-19")
export const IconBadge20 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">20</text>", "badge-20")
export const IconBadge21 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">21</text>", "badge-21")
export const IconBadge22 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">22</text>", "badge-22")
export const IconBadge23 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">23</text>", "badge-23")
export const IconBadge24 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">24</text>", "badge-24")
export const IconBadge25 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">25</text>", "badge-25")
export const IconBadge26 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">26</text>", "badge-26")
export const IconBadge27 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">27</text>", "badge-27")
export const IconBadge28 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">28</text>", "badge-28")
export const IconBadge29 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">29</text>", "badge-29")
export const IconBadge30 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">30</text>", "badge-30")
export const IconBadge31 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">31</text>", "badge-31")
export const IconBadge32 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">32</text>", "badge-32")
export const IconBadge33 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">33</text>", "badge-33")
export const IconBadge34 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">34</text>", "badge-34")
export const IconBadge35 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">35</text>", "badge-35")
export const IconBadge36 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">36</text>", "badge-36")
export const IconBadge37 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">37</text>", "badge-37")
export const IconBadge38 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">38</text>", "badge-38")
export const IconBadge39 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">39</text>", "badge-39")
export const IconBadge40 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">40</text>", "badge-40")
export const IconBadge41 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">41</text>", "badge-41")
export const IconBadge42 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">42</text>", "badge-42")
export const IconBadge43 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">43</text>", "badge-43")
export const IconBadge44 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">44</text>", "badge-44")
export const IconBadge45 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">45</text>", "badge-45")
export const IconBadge46 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">46</text>", "badge-46")
export const IconBadge47 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">47</text>", "badge-47")
export const IconBadge48 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">48</text>", "badge-48")
export const IconBadge49 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">49</text>", "badge-49")
export const IconBadge50 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">50</text>", "badge-50")
export const IconBadge51 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">51</text>", "badge-51")
export const IconBadge52 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">52</text>", "badge-52")
export const IconBadge53 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">53</text>", "badge-53")
export const IconBadge54 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">54</text>", "badge-54")
export const IconBadge55 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">55</text>", "badge-55")
export const IconBadge56 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">56</text>", "badge-56")
export const IconBadge57 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">57</text>", "badge-57")
export const IconBadge58 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">58</text>", "badge-58")
export const IconBadge59 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">59</text>", "badge-59")
export const IconBadge60 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">60</text>", "badge-60")
export const IconBadge61 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">61</text>", "badge-61")
export const IconBadge62 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">62</text>", "badge-62")
export const IconBadge63 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">63</text>", "badge-63")
export const IconBadge64 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">64</text>", "badge-64")
export const IconBadge65 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">65</text>", "badge-65")
export const IconBadge66 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">66</text>", "badge-66")
export const IconBadge67 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">67</text>", "badge-67")
export const IconBadge68 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">68</text>", "badge-68")
export const IconBadge69 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">69</text>", "badge-69")
export const IconBadge70 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">70</text>", "badge-70")
export const IconBadge71 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">71</text>", "badge-71")
export const IconBadge72 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">72</text>", "badge-72")
export const IconBadge73 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">73</text>", "badge-73")
export const IconBadge74 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">74</text>", "badge-74")
export const IconBadge75 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">75</text>", "badge-75")
export const IconBadge76 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">76</text>", "badge-76")
export const IconBadge77 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">77</text>", "badge-77")
export const IconBadge78 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">78</text>", "badge-78")
export const IconBadge79 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">79</text>", "badge-79")
export const IconBadge80 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">80</text>", "badge-80")
export const IconBadge81 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">81</text>", "badge-81")
export const IconBadge82 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">82</text>", "badge-82")
export const IconBadge83 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">83</text>", "badge-83")
export const IconBadge84 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">84</text>", "badge-84")
export const IconBadge85 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">85</text>", "badge-85")
export const IconBadge86 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">86</text>", "badge-86")
export const IconBadge87 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">87</text>", "badge-87")
export const IconBadge88 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">88</text>", "badge-88")
export const IconBadge89 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">89</text>", "badge-89")
export const IconBadge90 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">90</text>", "badge-90")
export const IconBadge91 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">91</text>", "badge-91")
export const IconBadge92 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">92</text>", "badge-92")
export const IconBadge93 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">93</text>", "badge-93")
export const IconBadge94 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">94</text>", "badge-94")
export const IconBadge95 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">95</text>", "badge-95")
export const IconBadge96 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">96</text>", "badge-96")
export const IconBadge97 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">97</text>", "badge-97")
export const IconBadge98 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">98</text>", "badge-98")
export const IconBadge99 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">99</text>", "badge-99")
export const IconLetterA = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">A</text>", "letter-A")
export const IconLetterA = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">a</text>", "letter-a")
export const IconLetterACircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">A</text>", "letter-A-circle-fill")
export const IconLetterASquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">A</text>", "letter-A-square-fill")
export const IconLetterB = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">B</text>", "letter-B")
export const IconLetterB = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">b</text>", "letter-b")
export const IconLetterBCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">B</text>", "letter-B-circle-fill")
export const IconLetterBSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">B</text>", "letter-B-square-fill")
export const IconLetterC = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">C</text>", "letter-C")
export const IconLetterC = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">c</text>", "letter-c")
export const IconLetterCCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">C</text>", "letter-C-circle-fill")
export const IconLetterCSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">C</text>", "letter-C-square-fill")
export const IconLetterD = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">D</text>", "letter-D")
export const IconLetterD = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">d</text>", "letter-d")
export const IconLetterDCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">D</text>", "letter-D-circle-fill")
export const IconLetterDSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">D</text>", "letter-D-square-fill")
export const IconLetterE = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">E</text>", "letter-E")
export const IconLetterE = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">e</text>", "letter-e")
export const IconLetterECircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">E</text>", "letter-E-circle-fill")
export const IconLetterESquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">E</text>", "letter-E-square-fill")
export const IconLetterF = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F</text>", "letter-F")
export const IconLetterF = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">f</text>", "letter-f")
export const IconLetterFCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F</text>", "letter-F-circle-fill")
export const IconLetterFSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F</text>", "letter-F-square-fill")
export const IconLetterG = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">G</text>", "letter-G")
export const IconLetterG = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">g</text>", "letter-g")
export const IconLetterGCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">G</text>", "letter-G-circle-fill")
export const IconLetterGSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">G</text>", "letter-G-square-fill")
export const IconLetterH = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">H</text>", "letter-H")
export const IconLetterH = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">h</text>", "letter-h")
export const IconLetterHCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">H</text>", "letter-H-circle-fill")
export const IconLetterHSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">H</text>", "letter-H-square-fill")
export const IconLetterI = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">I</text>", "letter-I")
export const IconLetterI = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">i</text>", "letter-i")
export const IconLetterICircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">I</text>", "letter-I-circle-fill")
export const IconLetterISquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">I</text>", "letter-I-square-fill")
export const IconLetterJ = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">J</text>", "letter-J")
export const IconLetterJ = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">j</text>", "letter-j")
export const IconLetterJCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">J</text>", "letter-J-circle-fill")
export const IconLetterJSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">J</text>", "letter-J-square-fill")
export const IconLetterK = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">K</text>", "letter-K")
export const IconLetterK = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">k</text>", "letter-k")
export const IconLetterKCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">K</text>", "letter-K-circle-fill")
export const IconLetterKSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">K</text>", "letter-K-square-fill")
export const IconLetterL = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">L</text>", "letter-L")
export const IconLetterL = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">l</text>", "letter-l")
export const IconLetterLCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">L</text>", "letter-L-circle-fill")
export const IconLetterLSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">L</text>", "letter-L-square-fill")
export const IconLetterM = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">M</text>", "letter-M")
export const IconLetterM = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">m</text>", "letter-m")
export const IconLetterMCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">M</text>", "letter-M-circle-fill")
export const IconLetterMSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">M</text>", "letter-M-square-fill")
export const IconLetterN = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">N</text>", "letter-N")
export const IconLetterN = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">n</text>", "letter-n")
export const IconLetterNCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">N</text>", "letter-N-circle-fill")
export const IconLetterNSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">N</text>", "letter-N-square-fill")
export const IconLetterO = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">O</text>", "letter-O")
export const IconLetterO = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">o</text>", "letter-o")
export const IconLetterOCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">O</text>", "letter-O-circle-fill")
export const IconLetterOSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">O</text>", "letter-O-square-fill")
export const IconLetterP = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">P</text>", "letter-P")
export const IconLetterP = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">p</text>", "letter-p")
export const IconLetterPCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">P</text>", "letter-P-circle-fill")
export const IconLetterPSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">P</text>", "letter-P-square-fill")
export const IconLetterQ = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Q</text>", "letter-Q")
export const IconLetterQ = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">q</text>", "letter-q")
export const IconLetterQCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Q</text>", "letter-Q-circle-fill")
export const IconLetterQSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Q</text>", "letter-Q-square-fill")
export const IconLetterR = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">R</text>", "letter-R")
export const IconLetterR = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">r</text>", "letter-r")
export const IconLetterRCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">R</text>", "letter-R-circle-fill")
export const IconLetterRSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">R</text>", "letter-R-square-fill")
export const IconLetterS = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">S</text>", "letter-S")
export const IconLetterS = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">s</text>", "letter-s")
export const IconLetterSCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">S</text>", "letter-S-circle-fill")
export const IconLetterSSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">S</text>", "letter-S-square-fill")
export const IconLetterT = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">T</text>", "letter-T")
export const IconLetterT = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">t</text>", "letter-t")
export const IconLetterTCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">T</text>", "letter-T-circle-fill")
export const IconLetterTSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">T</text>", "letter-T-square-fill")
export const IconLetterU = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">U</text>", "letter-U")
export const IconLetterU = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">u</text>", "letter-u")
export const IconLetterUCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">U</text>", "letter-U-circle-fill")
export const IconLetterUSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">U</text>", "letter-U-square-fill")
export const IconLetterV = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">V</text>", "letter-V")
export const IconLetterV = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">v</text>", "letter-v")
export const IconLetterVCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">V</text>", "letter-V-circle-fill")
export const IconLetterVSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">V</text>", "letter-V-square-fill")
export const IconLetterW = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">W</text>", "letter-W")
export const IconLetterW = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">w</text>", "letter-w")
export const IconLetterWCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">W</text>", "letter-W-circle-fill")
export const IconLetterWSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">W</text>", "letter-W-square-fill")
export const IconLetterX = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">X</text>", "letter-X")
export const IconLetterX = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">x</text>", "letter-x")
export const IconLetterXCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">X</text>", "letter-X-circle-fill")
export const IconLetterXSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">X</text>", "letter-X-square-fill")
export const IconLetterY = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Y</text>", "letter-Y")
export const IconLetterY = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">y</text>", "letter-y")
export const IconLetterYCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Y</text>", "letter-Y-circle-fill")
export const IconLetterYSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Y</text>", "letter-Y-square-fill")
export const IconLetterZ = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Z</text>", "letter-Z")
export const IconLetterZ = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">z</text>", "letter-z")
export const IconLetterZCircleFill = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Z</text>", "letter-Z-circle-fill")
export const IconLetterZSquareFill = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"currentColor\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Z</text>", "letter-Z-square-fill")
export const IconBig0 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">0</text>", "big-0")
export const IconBig1 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">1</text>", "big-1")
export const IconBig2 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">2</text>", "big-2")
export const IconBig3 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">3</text>", "big-3")
export const IconBig4 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">4</text>", "big-4")
export const IconBig5 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">5</text>", "big-5")
export const IconBig6 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">6</text>", "big-6")
export const IconBig7 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">7</text>", "big-7")
export const IconBig8 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">8</text>", "big-8")
export const IconBig9 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "big-9")
export const IconBig10 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">10</text>", "big-10")
export const IconBig11 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">11</text>", "big-11")
export const IconBig12 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">12</text>", "big-12")
export const IconBig13 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">13</text>", "big-13")
export const IconBig14 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">14</text>", "big-14")
export const IconBig15 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">15</text>", "big-15")
export const IconBig16 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">16</text>", "big-16")
export const IconBig17 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">17</text>", "big-17")
export const IconBig18 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">18</text>", "big-18")
export const IconBig19 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">19</text>", "big-19")
export const IconBig20 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">20</text>", "big-20")
export const IconBig21 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">21</text>", "big-21")
export const IconBig22 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">22</text>", "big-22")
export const IconBig23 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">23</text>", "big-23")
export const IconBig24 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">24</text>", "big-24")
export const IconBig25 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">25</text>", "big-25")
export const IconBig26 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">26</text>", "big-26")
export const IconBig27 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">27</text>", "big-27")
export const IconBig28 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">28</text>", "big-28")
export const IconBig29 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">29</text>", "big-29")
export const IconBig30 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">30</text>", "big-30")
export const IconBig31 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">31</text>", "big-31")
export const IconBig32 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">32</text>", "big-32")
export const IconBig33 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">33</text>", "big-33")
export const IconBig34 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">34</text>", "big-34")
export const IconBig35 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">35</text>", "big-35")
export const IconBig36 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">36</text>", "big-36")
export const IconBig37 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">37</text>", "big-37")
export const IconBig38 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">38</text>", "big-38")
export const IconBig39 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">39</text>", "big-39")
export const IconBig40 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">40</text>", "big-40")
export const IconBig41 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">41</text>", "big-41")
export const IconBig42 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">42</text>", "big-42")
export const IconBig43 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">43</text>", "big-43")
export const IconBig44 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">44</text>", "big-44")
export const IconBig45 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">45</text>", "big-45")
export const IconBig46 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">46</text>", "big-46")
export const IconBig47 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">47</text>", "big-47")
export const IconBig48 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">48</text>", "big-48")
export const IconBig49 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">49</text>", "big-49")
export const IconBig50 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">50</text>", "big-50")
export const IconBig51 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">51</text>", "big-51")
export const IconBig52 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">52</text>", "big-52")
export const IconBig53 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">53</text>", "big-53")
export const IconBig54 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">54</text>", "big-54")
export const IconBig55 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">55</text>", "big-55")
export const IconBig56 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">56</text>", "big-56")
export const IconBig57 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">57</text>", "big-57")
export const IconBig58 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">58</text>", "big-58")
export const IconBig59 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">59</text>", "big-59")
export const IconBig60 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">60</text>", "big-60")
export const IconBig61 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">61</text>", "big-61")
export const IconBig62 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">62</text>", "big-62")
export const IconBig63 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">63</text>", "big-63")
export const IconBig64 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">64</text>", "big-64")
export const IconBig65 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">65</text>", "big-65")
export const IconBig66 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">66</text>", "big-66")
export const IconBig67 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">67</text>", "big-67")
export const IconBig68 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">68</text>", "big-68")
export const IconBig69 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">69</text>", "big-69")
export const IconBig70 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">70</text>", "big-70")
export const IconBig71 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">71</text>", "big-71")
export const IconBig72 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">72</text>", "big-72")
export const IconBig73 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">73</text>", "big-73")
export const IconBig74 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">74</text>", "big-74")
export const IconBig75 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">75</text>", "big-75")
export const IconBig76 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">76</text>", "big-76")
export const IconBig77 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">77</text>", "big-77")
export const IconBig78 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">78</text>", "big-78")
export const IconBig79 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">79</text>", "big-79")
export const IconBig80 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">80</text>", "big-80")
export const IconBig81 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">81</text>", "big-81")
export const IconBig82 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">82</text>", "big-82")
export const IconBig83 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">83</text>", "big-83")
export const IconBig84 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">84</text>", "big-84")
export const IconBig85 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">85</text>", "big-85")
export const IconBig86 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">86</text>", "big-86")
export const IconBig87 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">87</text>", "big-87")
export const IconBig88 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">88</text>", "big-88")
export const IconBig89 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">89</text>", "big-89")
export const IconBig90 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">90</text>", "big-90")
export const IconBig91 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">91</text>", "big-91")
export const IconBig92 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">92</text>", "big-92")
export const IconBig93 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">93</text>", "big-93")
export const IconBig94 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">94</text>", "big-94")
export const IconBig95 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">95</text>", "big-95")
export const IconBig96 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">96</text>", "big-96")
export const IconBig97 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">97</text>", "big-97")
export const IconBig98 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">98</text>", "big-98")
export const IconBig99 = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">99</text>", "big-99")
export const IconTime00 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">00:00</text>", "time-0-0")
export const IconTime030 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">00:30</text>", "time-0-30")
export const IconTime10 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">01:00</text>", "time-1-0")
export const IconTime130 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">01:30</text>", "time-1-30")
export const IconTime20 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">02:00</text>", "time-2-0")
export const IconTime230 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">02:30</text>", "time-2-30")
export const IconTime30 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">03:00</text>", "time-3-0")
export const IconTime330 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">03:30</text>", "time-3-30")
export const IconTime40 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">04:00</text>", "time-4-0")
export const IconTime430 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">04:30</text>", "time-4-30")
export const IconTime50 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">05:00</text>", "time-5-0")
export const IconTime530 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">05:30</text>", "time-5-30")
export const IconTime60 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">06:00</text>", "time-6-0")
export const IconTime630 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">06:30</text>", "time-6-30")
export const IconTime70 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">07:00</text>", "time-7-0")
export const IconTime730 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">07:30</text>", "time-7-30")
export const IconTime80 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">08:00</text>", "time-8-0")
export const IconTime830 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">08:30</text>", "time-8-30")
export const IconTime90 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">09:00</text>", "time-9-0")
export const IconTime930 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">09:30</text>", "time-9-30")
export const IconTime100 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">10:00</text>", "time-10-0")
export const IconTime1030 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">10:30</text>", "time-10-30")
export const IconTime110 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">11:00</text>", "time-11-0")
export const IconTime1130 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">11:30</text>", "time-11-30")
export const IconTime120 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">12:00</text>", "time-12-0")
export const IconTime1230 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">12:30</text>", "time-12-30")
export const IconTime130 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">13:00</text>", "time-13-0")
export const IconTime1330 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">13:30</text>", "time-13-30")
export const IconTime140 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">14:00</text>", "time-14-0")
export const IconTime1430 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">14:30</text>", "time-14-30")
export const IconTime150 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">15:00</text>", "time-15-0")
export const IconTime1530 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">15:30</text>", "time-15-30")
export const IconTime160 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">16:00</text>", "time-16-0")
export const IconTime1630 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">16:30</text>", "time-16-30")
export const IconTime170 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">17:00</text>", "time-17-0")
export const IconTime1730 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">17:30</text>", "time-17-30")
export const IconTime180 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">18:00</text>", "time-18-0")
export const IconTime1830 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">18:30</text>", "time-18-30")
export const IconTime190 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">19:00</text>", "time-19-0")
export const IconTime1930 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">19:30</text>", "time-19-30")
export const IconTime200 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">20:00</text>", "time-20-0")
export const IconTime2030 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">20:30</text>", "time-20-30")
export const IconTime210 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">21:00</text>", "time-21-0")
export const IconTime2130 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">21:30</text>", "time-21-30")
export const IconTime220 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">22:00</text>", "time-22-0")
export const IconTime2230 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">22:30</text>", "time-22-30")
export const IconTime230 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">23:00</text>", "time-23-0")
export const IconTime2330 = makeIcon("<text x=\"12\" y=\"15\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">23:30</text>", "time-23-30")
export const IconArrowUpRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M19.00 12.00L5.00 12.00M12.00 19.00L5.00 12.00M12.00 5.00L5.00 12.00\"/>", "arrow-up-ring")
export const IconArrowUpFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M19.00 12.00L5.00 12.00M12.00 19.00L5.00 12.00M12.00 5.00L5.00 12.00\"/>", "arrow-up-fill-circle")
export const IconArrowUpFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M19.00 12.00L5.00 12.00M12.00 19.00L5.00 12.00M12.00 5.00L5.00 12.00\"/>", "arrow-up-fill-square")
export const IconArrowUpRightRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M16.95 16.95L7.05 7.05M7.05 16.95L7.05 7.05M16.95 7.05L7.05 7.05\"/>", "arrow-up-right-ring")
export const IconArrowUpRightFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M16.95 16.95L7.05 7.05M7.05 16.95L7.05 7.05M16.95 7.05L7.05 7.05\"/>", "arrow-up-right-fill-circle")
export const IconArrowUpRightFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M16.95 16.95L7.05 7.05M7.05 16.95L7.05 7.05M16.95 7.05L7.05 7.05\"/>", "arrow-up-right-fill-square")
export const IconArrowRightRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12.00 19.00L12.00 5.00M5.00 12.00L12.00 5.00M19.00 12.00L12.00 5.00\"/>", "arrow-right-ring")
export const IconArrowRightFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 19.00L12.00 5.00M5.00 12.00L12.00 5.00M19.00 12.00L12.00 5.00\"/>", "arrow-right-fill-circle")
export const IconArrowRightFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M12.00 19.00L12.00 5.00M5.00 12.00L12.00 5.00M19.00 12.00L12.00 5.00\"/>", "arrow-right-fill-square")
export const IconArrowDownRightRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M7.05 16.95L16.95 7.05M7.05 7.05L16.95 7.05M16.95 16.95L16.95 7.05\"/>", "arrow-down-right-ring")
export const IconArrowDownRightFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M7.05 16.95L16.95 7.05M7.05 7.05L16.95 7.05M16.95 16.95L16.95 7.05\"/>", "arrow-down-right-fill-circle")
export const IconArrowDownRightFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M7.05 16.95L16.95 7.05M7.05 7.05L16.95 7.05M16.95 16.95L16.95 7.05\"/>", "arrow-down-right-fill-square")
export const IconArrowDownRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M5.00 12.00L19.00 12.00M12.00 5.00L19.00 12.00M12.00 19.00L19.00 12.00\"/>", "arrow-down-ring")
export const IconArrowDownFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M5.00 12.00L19.00 12.00M12.00 5.00L19.00 12.00M12.00 19.00L19.00 12.00\"/>", "arrow-down-fill-circle")
export const IconArrowDownFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M5.00 12.00L19.00 12.00M12.00 5.00L19.00 12.00M12.00 19.00L19.00 12.00\"/>", "arrow-down-fill-square")
export const IconArrowDownLeftRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M7.05 7.05L16.95 16.95M16.95 7.05L16.95 16.95M7.05 16.95L16.95 16.95\"/>", "arrow-down-left-ring")
export const IconArrowDownLeftFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M7.05 7.05L16.95 16.95M16.95 7.05L16.95 16.95M7.05 16.95L16.95 16.95\"/>", "arrow-down-left-fill-circle")
export const IconArrowDownLeftFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M7.05 7.05L16.95 16.95M16.95 7.05L16.95 16.95M7.05 16.95L16.95 16.95\"/>", "arrow-down-left-fill-square")
export const IconArrowLeftRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12.00 5.00L12.00 19.00M19.00 12.00L12.00 19.00M5.00 12.00L12.00 19.00\"/>", "arrow-left-ring")
export const IconArrowLeftFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 5.00L12.00 19.00M19.00 12.00L12.00 19.00M5.00 12.00L12.00 19.00\"/>", "arrow-left-fill-circle")
export const IconArrowLeftFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M12.00 5.00L12.00 19.00M19.00 12.00L12.00 19.00M5.00 12.00L12.00 19.00\"/>", "arrow-left-fill-square")
export const IconArrowUpLeftRing = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M16.95 7.05L7.05 16.95M16.95 16.95L7.05 16.95M7.05 7.05L7.05 16.95\"/>", "arrow-up-left-ring")
export const IconArrowUpLeftFillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M16.95 7.05L7.05 16.95M16.95 16.95L7.05 16.95M7.05 7.05L7.05 16.95\"/>", "arrow-up-left-fill-circle")
export const IconArrowUpLeftFillSquare = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"currentColor\"/><path d=\"M16.95 7.05L7.05 16.95M16.95 16.95L7.05 16.95M7.05 7.05L7.05 16.95\"/>", "arrow-up-left-fill-square")
export const IconProgress0 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/>", "progress-0")
export const IconProgress2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 13.13 3.07\"/>", "progress-2")
export const IconProgress4 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 14.24 3.28\"/>", "progress-4")
export const IconProgress6 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 15.31 3.63\"/>", "progress-6")
export const IconProgress8 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 16.34 4.11\"/>", "progress-8")
export const IconProgress10 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 17.29 4.72\"/>", "progress-10")
export const IconProgress12 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 18.16 5.44\"/>", "progress-12")
export const IconProgress14 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 18.93 6.26\"/>", "progress-14")
export const IconProgress16 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 19.60 7.18\"/>", "progress-16")
export const IconProgress18 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.14 8.17\"/>", "progress-18")
export const IconProgress20 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.56 9.22\"/>", "progress-20")
export const IconProgress22 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.84 10.31\"/>", "progress-22")
export const IconProgress24 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.98 11.43\"/>", "progress-24")
export const IconProgress26 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.98 12.57\"/>", "progress-26")
export const IconProgress28 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.84 13.69\"/>", "progress-28")
export const IconProgress30 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.56 14.78\"/>", "progress-30")
export const IconProgress32 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 20.14 15.83\"/>", "progress-32")
export const IconProgress34 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 19.60 16.82\"/>", "progress-34")
export const IconProgress36 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 18.93 17.74\"/>", "progress-36")
export const IconProgress38 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 18.16 18.56\"/>", "progress-38")
export const IconProgress40 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 17.29 19.28\"/>", "progress-40")
export const IconProgress42 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 16.34 19.89\"/>", "progress-42")
export const IconProgress44 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 15.31 20.37\"/>", "progress-44")
export const IconProgress46 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 14.24 20.72\"/>", "progress-46")
export const IconProgress48 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 13.13 20.93\"/>", "progress-48")
export const IconProgress50 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 0 1 12.00 21.00\"/>", "progress-50")
export const IconProgress52 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 10.87 20.93\"/>", "progress-52")
export const IconProgress54 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 9.76 20.72\"/>", "progress-54")
export const IconProgress56 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 8.69 20.37\"/>", "progress-56")
export const IconProgress58 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 7.66 19.89\"/>", "progress-58")
export const IconProgress60 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 6.71 19.28\"/>", "progress-60")
export const IconProgress62 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 5.84 18.56\"/>", "progress-62")
export const IconProgress64 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 5.07 17.74\"/>", "progress-64")
export const IconProgress66 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 4.40 16.82\"/>", "progress-66")
export const IconProgress68 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.86 15.83\"/>", "progress-68")
export const IconProgress70 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.44 14.78\"/>", "progress-70")
export const IconProgress72 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.16 13.69\"/>", "progress-72")
export const IconProgress74 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.02 12.57\"/>", "progress-74")
export const IconProgress76 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.02 11.43\"/>", "progress-76")
export const IconProgress78 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.16 10.31\"/>", "progress-78")
export const IconProgress80 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.44 9.22\"/>", "progress-80")
export const IconProgress82 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 3.86 8.17\"/>", "progress-82")
export const IconProgress84 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 4.40 7.18\"/>", "progress-84")
export const IconProgress86 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 5.07 6.26\"/>", "progress-86")
export const IconProgress88 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 5.84 5.44\"/>", "progress-88")
export const IconProgress90 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 6.71 4.72\"/>", "progress-90")
export const IconProgress92 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 7.66 4.11\"/>", "progress-92")
export const IconProgress94 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 8.69 3.63\"/>", "progress-94")
export const IconProgress96 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 9.76 3.28\"/>", "progress-96")
export const IconProgress98 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3A9 9 0 0 1 1 10.87 3.07\"/>", "progress-98")
export const IconProgress100 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/>", "progress-100")
export const IconGrid1x1 = makeIcon("<line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-1x1")
export const IconGrid2x2 = makeIcon("<line x1=\"12.00\" y1=\"2\" x2=\"12.00\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"12.00\" x2=\"22\" y2=\"12.00\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-2x2")
export const IconGrid3x3 = makeIcon("<line x1=\"8.00\" y1=\"2\" x2=\"8.00\" y2=\"22\"/><line x1=\"16.00\" y1=\"2\" x2=\"16.00\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"8.00\" x2=\"22\" y2=\"8.00\"/><line x1=\"2\" y1=\"16.00\" x2=\"22\" y2=\"16.00\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-3x3")
export const IconGrid4x4 = makeIcon("<line x1=\"6.00\" y1=\"2\" x2=\"6.00\" y2=\"22\"/><line x1=\"12.00\" y1=\"2\" x2=\"12.00\" y2=\"22\"/><line x1=\"18.00\" y1=\"2\" x2=\"18.00\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"6.00\" x2=\"22\" y2=\"6.00\"/><line x1=\"2\" y1=\"12.00\" x2=\"22\" y2=\"12.00\"/><line x1=\"2\" y1=\"18.00\" x2=\"22\" y2=\"18.00\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-4x4")
export const IconGrid5x5 = makeIcon("<line x1=\"4.80\" y1=\"2\" x2=\"4.80\" y2=\"22\"/><line x1=\"9.60\" y1=\"2\" x2=\"9.60\" y2=\"22\"/><line x1=\"14.40\" y1=\"2\" x2=\"14.40\" y2=\"22\"/><line x1=\"19.20\" y1=\"2\" x2=\"19.20\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"4.80\" x2=\"22\" y2=\"4.80\"/><line x1=\"2\" y1=\"9.60\" x2=\"22\" y2=\"9.60\"/><line x1=\"2\" y1=\"14.40\" x2=\"22\" y2=\"14.40\"/><line x1=\"2\" y1=\"19.20\" x2=\"22\" y2=\"19.20\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-5x5")
export const IconGrid6x6 = makeIcon("<line x1=\"4.00\" y1=\"2\" x2=\"4.00\" y2=\"22\"/><line x1=\"8.00\" y1=\"2\" x2=\"8.00\" y2=\"22\"/><line x1=\"12.00\" y1=\"2\" x2=\"12.00\" y2=\"22\"/><line x1=\"16.00\" y1=\"2\" x2=\"16.00\" y2=\"22\"/><line x1=\"20.00\" y1=\"2\" x2=\"20.00\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"4.00\" x2=\"22\" y2=\"4.00\"/><line x1=\"2\" y1=\"8.00\" x2=\"22\" y2=\"8.00\"/><line x1=\"2\" y1=\"12.00\" x2=\"22\" y2=\"12.00\"/><line x1=\"2\" y1=\"16.00\" x2=\"22\" y2=\"16.00\"/><line x1=\"2\" y1=\"20.00\" x2=\"22\" y2=\"20.00\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-6x6")
export const IconGrid7x7 = makeIcon("<line x1=\"3.43\" y1=\"2\" x2=\"3.43\" y2=\"22\"/><line x1=\"6.86\" y1=\"2\" x2=\"6.86\" y2=\"22\"/><line x1=\"10.29\" y1=\"2\" x2=\"10.29\" y2=\"22\"/><line x1=\"13.71\" y1=\"2\" x2=\"13.71\" y2=\"22\"/><line x1=\"17.14\" y1=\"2\" x2=\"17.14\" y2=\"22\"/><line x1=\"20.57\" y1=\"2\" x2=\"20.57\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"3.43\" x2=\"22\" y2=\"3.43\"/><line x1=\"2\" y1=\"6.86\" x2=\"22\" y2=\"6.86\"/><line x1=\"2\" y1=\"10.29\" x2=\"22\" y2=\"10.29\"/><line x1=\"2\" y1=\"13.71\" x2=\"22\" y2=\"13.71\"/><line x1=\"2\" y1=\"17.14\" x2=\"22\" y2=\"17.14\"/><line x1=\"2\" y1=\"20.57\" x2=\"22\" y2=\"20.57\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-7x7")
export const IconGrid8x8 = makeIcon("<line x1=\"3.00\" y1=\"2\" x2=\"3.00\" y2=\"22\"/><line x1=\"6.00\" y1=\"2\" x2=\"6.00\" y2=\"22\"/><line x1=\"9.00\" y1=\"2\" x2=\"9.00\" y2=\"22\"/><line x1=\"12.00\" y1=\"2\" x2=\"12.00\" y2=\"22\"/><line x1=\"15.00\" y1=\"2\" x2=\"15.00\" y2=\"22\"/><line x1=\"18.00\" y1=\"2\" x2=\"18.00\" y2=\"22\"/><line x1=\"21.00\" y1=\"2\" x2=\"21.00\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"3.00\" x2=\"22\" y2=\"3.00\"/><line x1=\"2\" y1=\"6.00\" x2=\"22\" y2=\"6.00\"/><line x1=\"2\" y1=\"9.00\" x2=\"22\" y2=\"9.00\"/><line x1=\"2\" y1=\"12.00\" x2=\"22\" y2=\"12.00\"/><line x1=\"2\" y1=\"15.00\" x2=\"22\" y2=\"15.00\"/><line x1=\"2\" y1=\"18.00\" x2=\"22\" y2=\"18.00\"/><line x1=\"2\" y1=\"21.00\" x2=\"22\" y2=\"21.00\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-8x8")
export const IconGrid9x9 = makeIcon("<line x1=\"2.67\" y1=\"2\" x2=\"2.67\" y2=\"22\"/><line x1=\"5.33\" y1=\"2\" x2=\"5.33\" y2=\"22\"/><line x1=\"8.00\" y1=\"2\" x2=\"8.00\" y2=\"22\"/><line x1=\"10.67\" y1=\"2\" x2=\"10.67\" y2=\"22\"/><line x1=\"13.33\" y1=\"2\" x2=\"13.33\" y2=\"22\"/><line x1=\"16.00\" y1=\"2\" x2=\"16.00\" y2=\"22\"/><line x1=\"18.67\" y1=\"2\" x2=\"18.67\" y2=\"22\"/><line x1=\"21.33\" y1=\"2\" x2=\"21.33\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"2.67\" x2=\"22\" y2=\"2.67\"/><line x1=\"2\" y1=\"5.33\" x2=\"22\" y2=\"5.33\"/><line x1=\"2\" y1=\"8.00\" x2=\"22\" y2=\"8.00\"/><line x1=\"2\" y1=\"10.67\" x2=\"22\" y2=\"10.67\"/><line x1=\"2\" y1=\"13.33\" x2=\"22\" y2=\"13.33\"/><line x1=\"2\" y1=\"16.00\" x2=\"22\" y2=\"16.00\"/><line x1=\"2\" y1=\"18.67\" x2=\"22\" y2=\"18.67\"/><line x1=\"2\" y1=\"21.33\" x2=\"22\" y2=\"21.33\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-9x9")
export const IconGrid10x10 = makeIcon("<line x1=\"2.40\" y1=\"2\" x2=\"2.40\" y2=\"22\"/><line x1=\"4.80\" y1=\"2\" x2=\"4.80\" y2=\"22\"/><line x1=\"7.20\" y1=\"2\" x2=\"7.20\" y2=\"22\"/><line x1=\"9.60\" y1=\"2\" x2=\"9.60\" y2=\"22\"/><line x1=\"12.00\" y1=\"2\" x2=\"12.00\" y2=\"22\"/><line x1=\"14.40\" y1=\"2\" x2=\"14.40\" y2=\"22\"/><line x1=\"16.80\" y1=\"2\" x2=\"16.80\" y2=\"22\"/><line x1=\"19.20\" y1=\"2\" x2=\"19.20\" y2=\"22\"/><line x1=\"21.60\" y1=\"2\" x2=\"21.60\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"2.40\" x2=\"22\" y2=\"2.40\"/><line x1=\"2\" y1=\"4.80\" x2=\"22\" y2=\"4.80\"/><line x1=\"2\" y1=\"7.20\" x2=\"22\" y2=\"7.20\"/><line x1=\"2\" y1=\"9.60\" x2=\"22\" y2=\"9.60\"/><line x1=\"2\" y1=\"12.00\" x2=\"22\" y2=\"12.00\"/><line x1=\"2\" y1=\"14.40\" x2=\"22\" y2=\"14.40\"/><line x1=\"2\" y1=\"16.80\" x2=\"22\" y2=\"16.80\"/><line x1=\"2\" y1=\"19.20\" x2=\"22\" y2=\"19.20\"/><line x1=\"2\" y1=\"21.60\" x2=\"22\" y2=\"21.60\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-10x10")
export const IconGrid11x11 = makeIcon("<line x1=\"2.18\" y1=\"2\" x2=\"2.18\" y2=\"22\"/><line x1=\"4.36\" y1=\"2\" x2=\"4.36\" y2=\"22\"/><line x1=\"6.55\" y1=\"2\" x2=\"6.55\" y2=\"22\"/><line x1=\"8.73\" y1=\"2\" x2=\"8.73\" y2=\"22\"/><line x1=\"10.91\" y1=\"2\" x2=\"10.91\" y2=\"22\"/><line x1=\"13.09\" y1=\"2\" x2=\"13.09\" y2=\"22\"/><line x1=\"15.27\" y1=\"2\" x2=\"15.27\" y2=\"22\"/><line x1=\"17.45\" y1=\"2\" x2=\"17.45\" y2=\"22\"/><line x1=\"19.64\" y1=\"2\" x2=\"19.64\" y2=\"22\"/><line x1=\"21.82\" y1=\"2\" x2=\"21.82\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"2.18\" x2=\"22\" y2=\"2.18\"/><line x1=\"2\" y1=\"4.36\" x2=\"22\" y2=\"4.36\"/><line x1=\"2\" y1=\"6.55\" x2=\"22\" y2=\"6.55\"/><line x1=\"2\" y1=\"8.73\" x2=\"22\" y2=\"8.73\"/><line x1=\"2\" y1=\"10.91\" x2=\"22\" y2=\"10.91\"/><line x1=\"2\" y1=\"13.09\" x2=\"22\" y2=\"13.09\"/><line x1=\"2\" y1=\"15.27\" x2=\"22\" y2=\"15.27\"/><line x1=\"2\" y1=\"17.45\" x2=\"22\" y2=\"17.45\"/><line x1=\"2\" y1=\"19.64\" x2=\"22\" y2=\"19.64\"/><line x1=\"2\" y1=\"21.82\" x2=\"22\" y2=\"21.82\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-11x11")
export const IconGrid12x12 = makeIcon("<line x1=\"2.00\" y1=\"2\" x2=\"2.00\" y2=\"22\"/><line x1=\"4.00\" y1=\"2\" x2=\"4.00\" y2=\"22\"/><line x1=\"6.00\" y1=\"2\" x2=\"6.00\" y2=\"22\"/><line x1=\"8.00\" y1=\"2\" x2=\"8.00\" y2=\"22\"/><line x1=\"10.00\" y1=\"2\" x2=\"10.00\" y2=\"22\"/><line x1=\"12.00\" y1=\"2\" x2=\"12.00\" y2=\"22\"/><line x1=\"14.00\" y1=\"2\" x2=\"14.00\" y2=\"22\"/><line x1=\"16.00\" y1=\"2\" x2=\"16.00\" y2=\"22\"/><line x1=\"18.00\" y1=\"2\" x2=\"18.00\" y2=\"22\"/><line x1=\"20.00\" y1=\"2\" x2=\"20.00\" y2=\"22\"/><line x1=\"22.00\" y1=\"2\" x2=\"22.00\" y2=\"22\"/><line x1=\"24.00\" y1=\"2\" x2=\"24.00\" y2=\"22\"/><line x1=\"2\" y1=\"2.00\" x2=\"22\" y2=\"2.00\"/><line x1=\"2\" y1=\"4.00\" x2=\"22\" y2=\"4.00\"/><line x1=\"2\" y1=\"6.00\" x2=\"22\" y2=\"6.00\"/><line x1=\"2\" y1=\"8.00\" x2=\"22\" y2=\"8.00\"/><line x1=\"2\" y1=\"10.00\" x2=\"22\" y2=\"10.00\"/><line x1=\"2\" y1=\"12.00\" x2=\"22\" y2=\"12.00\"/><line x1=\"2\" y1=\"14.00\" x2=\"22\" y2=\"14.00\"/><line x1=\"2\" y1=\"16.00\" x2=\"22\" y2=\"16.00\"/><line x1=\"2\" y1=\"18.00\" x2=\"22\" y2=\"18.00\"/><line x1=\"2\" y1=\"20.00\" x2=\"22\" y2=\"20.00\"/><line x1=\"2\" y1=\"22.00\" x2=\"22\" y2=\"22.00\"/><line x1=\"2\" y1=\"24.00\" x2=\"22\" y2=\"24.00\"/>", "grid-12x12")
export const IconPoly3R0 = makeIcon("<path d=\"M12 3 L19.79 16.5 L4.21 16.5 Z\"/>", "poly-3-r0")
export const IconPoly3R45 = makeIcon("<path d=\"M18.36 5.64 L14.33 20.69 L3.31 9.67 Z\"/>", "poly-3-r45")
export const IconPoly3R90 = makeIcon("<path d=\"M21 12 L7.5 19.79 L7.5 4.21 Z\"/>", "poly-3-r90")
export const IconPoly3R135 = makeIcon("<path d=\"M18.36 18.36 L3.31 14.33 L14.33 3.31 Z\"/>", "poly-3-r135")
export const IconPoly3R180 = makeIcon("<path d=\"M12 21 L4.21 7.5 L19.79 7.5 Z\"/>", "poly-3-r180")
export const IconPoly3R270 = makeIcon("<path d=\"M3 12 L16.5 4.21 L16.5 19.79 Z\"/>", "poly-3-r270")
export const IconPoly4R0 = makeIcon("<path d=\"M12 3 L21 12 L12 21 L3 12 Z\"/>", "poly-4-r0")
export const IconPoly4R45 = makeIcon("<path d=\"M18.36 5.64 L18.36 18.36 L5.64 18.36 L5.64 5.64 Z\"/>", "poly-4-r45")
export const IconPoly4R90 = makeIcon("<path d=\"M21 12 L12 21 L3 12 L12 3 Z\"/>", "poly-4-r90")
export const IconPoly4R135 = makeIcon("<path d=\"M18.36 18.36 L5.64 18.36 L5.64 5.64 L18.36 5.64 Z\"/>", "poly-4-r135")
export const IconPoly4R180 = makeIcon("<path d=\"M12 21 L3 12 L12 3 L21 12 Z\"/>", "poly-4-r180")
export const IconPoly4R270 = makeIcon("<path d=\"M3 12 L12 3 L21 12 L12 21 Z\"/>", "poly-4-r270")
export const IconPoly5R0 = makeIcon("<path d=\"M12 3 L20.56 9.22 L17.29 19.28 L6.71 19.28 L3.44 9.22 Z\"/>", "poly-5-r0")
export const IconPoly5R45 = makeIcon("<path d=\"M18.36 5.64 L20.02 16.09 L10.59 20.89 L3.11 13.41 L7.91 3.98 Z\"/>", "poly-5-r45")
export const IconPoly5R90 = makeIcon("<path d=\"M21 12 L14.78 20.56 L4.72 17.29 L4.72 6.71 L14.78 3.44 Z\"/>", "poly-5-r90")
export const IconPoly5R135 = makeIcon("<path d=\"M18.36 18.36 L7.91 20.02 L3.11 10.59 L10.59 3.11 L20.02 7.91 Z\"/>", "poly-5-r135")
export const IconPoly5R180 = makeIcon("<path d=\"M12 21 L3.44 14.78 L6.71 4.72 L17.29 4.72 L20.56 14.78 Z\"/>", "poly-5-r180")
export const IconPoly5R270 = makeIcon("<path d=\"M3 12 L9.22 3.44 L19.28 6.71 L19.28 17.29 L9.22 20.56 Z\"/>", "poly-5-r270")
export const IconPoly6R0 = makeIcon("<path d=\"M12 3 L19.79 7.5 L19.79 16.5 L12 21 L4.21 16.5 L4.21 7.5 Z\"/>", "poly-6-r0")
export const IconPoly6R45 = makeIcon("<path d=\"M18.36 5.64 L20.69 14.33 L14.33 20.69 L5.64 18.36 L3.31 9.67 L9.67 3.31 Z\"/>", "poly-6-r45")
export const IconPoly6R90 = makeIcon("<path d=\"M21 12 L16.5 19.79 L7.5 19.79 L3 12 L7.5 4.21 L16.5 4.21 Z\"/>", "poly-6-r90")
export const IconPoly6R135 = makeIcon("<path d=\"M18.36 18.36 L9.67 20.69 L3.31 14.33 L5.64 5.64 L14.33 3.31 L20.69 9.67 Z\"/>", "poly-6-r135")
export const IconPoly6R180 = makeIcon("<path d=\"M12 21 L4.21 16.5 L4.21 7.5 L12 3 L19.79 7.5 L19.79 16.5 Z\"/>", "poly-6-r180")
export const IconPoly6R270 = makeIcon("<path d=\"M3 12 L7.5 4.21 L16.5 4.21 L21 12 L16.5 19.79 L7.5 19.79 Z\"/>", "poly-6-r270")
export const IconPoly7R0 = makeIcon("<path d=\"M12 3 L19.04 6.39 L20.77 14 L15.9 20.11 L8.1 20.11 L3.23 14 L4.96 6.39 Z\"/>", "poly-7-r0")
export const IconPoly7R45 = makeIcon("<path d=\"M18.36 5.64 L20.94 13.01 L16.79 19.62 L9.03 20.49 L3.51 14.97 L4.38 7.21 L10.99 3.06 Z\"/>", "poly-7-r45")
export const IconPoly7R90 = makeIcon("<path d=\"M21 12 L17.61 19.04 L10 20.77 L3.89 15.9 L3.89 8.1 L10 3.23 L17.61 4.96 Z\"/>", "poly-7-r90")
export const IconPoly7R135 = makeIcon("<path d=\"M18.36 18.36 L10.99 20.94 L4.38 16.79 L3.51 9.03 L9.03 3.51 L16.79 4.38 L20.94 10.99 Z\"/>", "poly-7-r135")
export const IconPoly7R180 = makeIcon("<path d=\"M12 21 L4.96 17.61 L3.23 10 L8.1 3.89 L15.9 3.89 L20.77 10 L19.04 17.61 Z\"/>", "poly-7-r180")
export const IconPoly7R270 = makeIcon("<path d=\"M3 12 L6.39 4.96 L14 3.23 L20.11 8.1 L20.11 15.9 L14 20.77 L6.39 19.04 Z\"/>", "poly-7-r270")
export const IconPoly8R0 = makeIcon("<path d=\"M12 3 L18.36 5.64 L21 12 L18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 Z\"/>", "poly-8-r0")
export const IconPoly8R45 = makeIcon("<path d=\"M18.36 5.64 L21 12 L18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 L12 3 Z\"/>", "poly-8-r45")
export const IconPoly8R90 = makeIcon("<path d=\"M21 12 L18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 L12 3 L18.36 5.64 Z\"/>", "poly-8-r90")
export const IconPoly8R135 = makeIcon("<path d=\"M18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 L12 3 L18.36 5.64 L21 12 Z\"/>", "poly-8-r135")
export const IconPoly8R180 = makeIcon("<path d=\"M12 21 L5.64 18.36 L3 12 L5.64 5.64 L12 3 L18.36 5.64 L21 12 L18.36 18.36 Z\"/>", "poly-8-r180")
export const IconPoly8R270 = makeIcon("<path d=\"M3 12 L5.64 5.64 L12 3 L18.36 5.64 L21 12 L18.36 18.36 L12 21 L5.64 18.36 Z\"/>", "poly-8-r270")
export const IconPoly9R0 = makeIcon("<path d=\"M12 3 L17.79 5.11 L20.86 10.44 L19.79 16.5 L15.08 20.46 L8.92 20.46 L4.21 16.5 L3.14 10.44 L6.21 5.11 Z\"/>", "poly-9-r0")
export const IconPoly9R45 = makeIcon("<path d=\"M18.36 5.64 L20.97 11.22 L19.37 17.16 L14.33 20.69 L8.2 20.16 L3.84 15.8 L3.31 9.67 L6.84 4.63 L12.78 3.03 Z\"/>", "poly-9-r45")
export const IconPoly9R90 = makeIcon("<path d=\"M21 12 L18.89 17.79 L13.56 20.86 L7.5 19.79 L3.54 15.08 L3.54 8.92 L7.5 4.21 L13.56 3.14 L18.89 6.21 Z\"/>", "poly-9-r90")
export const IconPoly9R135 = makeIcon("<path d=\"M18.36 18.36 L12.78 20.97 L6.84 19.37 L3.31 14.33 L3.84 8.2 L8.2 3.84 L14.33 3.31 L19.37 6.84 L20.97 12.78 Z\"/>", "poly-9-r135")
export const IconPoly9R180 = makeIcon("<path d=\"M12 21 L6.21 18.89 L3.14 13.56 L4.21 7.5 L8.92 3.54 L15.08 3.54 L19.79 7.5 L20.86 13.56 L17.79 18.89 Z\"/>", "poly-9-r180")
export const IconPoly9R270 = makeIcon("<path d=\"M3 12 L5.11 6.21 L10.44 3.14 L16.5 4.21 L20.46 8.92 L20.46 15.08 L16.5 19.79 L10.44 20.86 L5.11 17.79 Z\"/>", "poly-9-r270")
export const IconPoly10R0 = makeIcon("<path d=\"M12 3 L17.29 4.72 L20.56 9.22 L20.56 14.78 L17.29 19.28 L12 21 L6.71 19.28 L3.44 14.78 L3.44 9.22 L6.71 4.72 Z\"/>", "poly-10-r0")
export const IconPoly10R45 = makeIcon("<path d=\"M18.36 5.64 L20.89 10.59 L20.02 16.09 L16.09 20.02 L10.59 20.89 L5.64 18.36 L3.11 13.41 L3.98 7.91 L7.91 3.98 L13.41 3.11 Z\"/>", "poly-10-r45")
export const IconPoly10R90 = makeIcon("<path d=\"M21 12 L19.28 17.29 L14.78 20.56 L9.22 20.56 L4.72 17.29 L3 12 L4.72 6.71 L9.22 3.44 L14.78 3.44 L19.28 6.71 Z\"/>", "poly-10-r90")
export const IconPoly10R135 = makeIcon("<path d=\"M18.36 18.36 L13.41 20.89 L7.91 20.02 L3.98 16.09 L3.11 10.59 L5.64 5.64 L10.59 3.11 L16.09 3.98 L20.02 7.91 L20.89 13.41 Z\"/>", "poly-10-r135")
export const IconPoly10R180 = makeIcon("<path d=\"M12 21 L6.71 19.28 L3.44 14.78 L3.44 9.22 L6.71 4.72 L12 3 L17.29 4.72 L20.56 9.22 L20.56 14.78 L17.29 19.28 Z\"/>", "poly-10-r180")
export const IconPoly10R270 = makeIcon("<path d=\"M3 12 L4.72 6.71 L9.22 3.44 L14.78 3.44 L19.28 6.71 L21 12 L19.28 17.29 L14.78 20.56 L9.22 20.56 L4.72 17.29 Z\"/>", "poly-10-r270")
export const IconPoly11R0 = makeIcon("<path d=\"M12 3 L16.87 4.43 L20.19 8.26 L20.91 13.28 L18.8 17.89 L14.54 20.64 L9.46 20.64 L5.2 17.89 L3.09 13.28 L3.81 8.26 L7.13 4.43 Z\"/>", "poly-11-r0")
export const IconPoly11R45 = makeIcon("<path d=\"M18.36 5.64 L20.79 10.09 L20.43 15.15 L17.39 19.2 L12.64 20.98 L7.69 19.9 L4.1 16.31 L3.02 11.36 L4.8 6.61 L8.85 3.57 L13.91 3.21 Z\"/>", "poly-11-r45")
export const IconPoly11R90 = makeIcon("<path d=\"M21 12 L19.57 16.87 L15.74 20.19 L10.72 20.91 L6.11 18.8 L3.36 14.54 L3.36 9.46 L6.11 5.2 L10.72 3.09 L15.74 3.81 L19.57 7.13 Z\"/>", "poly-11-r90")
export const IconPoly11R135 = makeIcon("<path d=\"M18.36 18.36 L13.91 20.79 L8.85 20.43 L4.8 17.39 L3.02 12.64 L4.1 7.69 L7.69 4.1 L12.64 3.02 L17.39 4.8 L20.43 8.85 L20.79 13.91 Z\"/>", "poly-11-r135")
export const IconPoly11R180 = makeIcon("<path d=\"M12 21 L7.13 19.57 L3.81 15.74 L3.09 10.72 L5.2 6.11 L9.46 3.36 L14.54 3.36 L18.8 6.11 L20.91 10.72 L20.19 15.74 L16.87 19.57 Z\"/>", "poly-11-r180")
export const IconPoly11R270 = makeIcon("<path d=\"M3 12 L4.43 7.13 L8.26 3.81 L13.28 3.09 L17.89 5.2 L20.64 9.46 L20.64 14.54 L17.89 18.8 L13.28 20.91 L8.26 20.19 L4.43 16.87 Z\"/>", "poly-11-r270")
export const IconPoly12R0 = makeIcon("<path d=\"M12 3 L16.5 4.21 L19.79 7.5 L21 12 L19.79 16.5 L16.5 19.79 L12 21 L7.5 19.79 L4.21 16.5 L3 12 L4.21 7.5 L7.5 4.21 Z\"/>", "poly-12-r0")
export const IconPoly12R45 = makeIcon("<path d=\"M18.36 5.64 L20.69 9.67 L20.69 14.33 L18.36 18.36 L14.33 20.69 L9.67 20.69 L5.64 18.36 L3.31 14.33 L3.31 9.67 L5.64 5.64 L9.67 3.31 L14.33 3.31 Z\"/>", "poly-12-r45")
export const IconPoly12R90 = makeIcon("<path d=\"M21 12 L19.79 16.5 L16.5 19.79 L12 21 L7.5 19.79 L4.21 16.5 L3 12 L4.21 7.5 L7.5 4.21 L12 3 L16.5 4.21 L19.79 7.5 Z\"/>", "poly-12-r90")
export const IconPoly12R135 = makeIcon("<path d=\"M18.36 18.36 L14.33 20.69 L9.67 20.69 L5.64 18.36 L3.31 14.33 L3.31 9.67 L5.64 5.64 L9.67 3.31 L14.33 3.31 L18.36 5.64 L20.69 9.67 L20.69 14.33 Z\"/>", "poly-12-r135")
export const IconPoly12R180 = makeIcon("<path d=\"M12 21 L7.5 19.79 L4.21 16.5 L3 12 L4.21 7.5 L7.5 4.21 L12 3 L16.5 4.21 L19.79 7.5 L21 12 L19.79 16.5 L16.5 19.79 Z\"/>", "poly-12-r180")
export const IconPoly12R270 = makeIcon("<path d=\"M3 12 L4.21 7.5 L7.5 4.21 L12 3 L16.5 4.21 L19.79 7.5 L21 12 L19.79 16.5 L16.5 19.79 L12 21 L7.5 19.79 L4.21 16.5 Z\"/>", "poly-12-r270")
export const IconPoly13R0 = makeIcon("<path d=\"M12 3 L16.18 4.03 L19.41 6.89 L20.93 10.92 L20.42 15.19 L17.97 18.74 L14.15 20.74 L9.85 20.74 L6.03 18.74 L3.58 15.19 L3.07 10.92 L4.59 6.89 L7.82 4.03 Z\"/>", "poly-13-r0")
export const IconPoly13R45 = makeIcon("<path d=\"M18.36 5.64 L20.59 9.32 L20.85 13.62 L19.08 17.55 L15.69 20.21 L11.46 20.98 L7.34 19.7 L4.3 16.66 L3.02 12.54 L3.79 8.31 L6.45 4.92 L10.38 3.15 L14.68 3.41 Z\"/>", "poly-13-r45")
export const IconPoly13R90 = makeIcon("<path d=\"M21 12 L19.97 16.18 L17.11 19.41 L13.08 20.93 L8.81 20.42 L5.26 17.97 L3.26 14.15 L3.26 9.85 L5.26 6.03 L8.81 3.58 L13.08 3.07 L17.11 4.59 L19.97 7.82 Z\"/>", "poly-13-r90")
export const IconPoly13R135 = makeIcon("<path d=\"M18.36 18.36 L14.68 20.59 L10.38 20.85 L6.45 19.08 L3.79 15.69 L3.02 11.46 L4.3 7.34 L7.34 4.3 L11.46 3.02 L15.69 3.79 L19.08 6.45 L20.85 10.38 L20.59 14.68 Z\"/>", "poly-13-r135")
export const IconPoly13R180 = makeIcon("<path d=\"M12 21 L7.82 19.97 L4.59 17.11 L3.07 13.08 L3.58 8.81 L6.03 5.26 L9.85 3.26 L14.15 3.26 L17.97 5.26 L20.42 8.81 L20.93 13.08 L19.41 17.11 L16.18 19.97 Z\"/>", "poly-13-r180")
export const IconPoly13R270 = makeIcon("<path d=\"M3 12 L4.03 7.82 L6.89 4.59 L10.92 3.07 L15.19 3.58 L18.74 6.03 L20.74 9.85 L20.74 14.15 L18.74 17.97 L15.19 20.42 L10.92 20.93 L6.89 19.41 L4.03 16.18 Z\"/>", "poly-13-r270")
export const IconPoly14R0 = makeIcon("<path d=\"M12 3 L15.9 3.89 L19.04 6.39 L20.77 10 L20.77 14 L19.04 17.61 L15.9 20.11 L12 21 L8.1 20.11 L4.96 17.61 L3.23 14 L3.23 10 L4.96 6.39 L8.1 3.89 Z\"/>", "poly-14-r0")
export const IconPoly14R45 = makeIcon("<path d=\"M18.36 5.64 L20.49 9.03 L20.94 13.01 L19.62 16.79 L16.79 19.62 L13.01 20.94 L9.03 20.49 L5.64 18.36 L3.51 14.97 L3.06 10.99 L4.38 7.21 L7.21 4.38 L10.99 3.06 L14.97 3.51 Z\"/>", "poly-14-r45")
export const IconPoly14R90 = makeIcon("<path d=\"M21 12 L20.11 15.9 L17.61 19.04 L14 20.77 L10 20.77 L6.39 19.04 L3.89 15.9 L3 12 L3.89 8.1 L6.39 4.96 L10 3.23 L14 3.23 L17.61 4.96 L20.11 8.1 Z\"/>", "poly-14-r90")
export const IconPoly14R135 = makeIcon("<path d=\"M18.36 18.36 L14.97 20.49 L10.99 20.94 L7.21 19.62 L4.38 16.79 L3.06 13.01 L3.51 9.03 L5.64 5.64 L9.03 3.51 L13.01 3.06 L16.79 4.38 L19.62 7.21 L20.94 10.99 L20.49 14.97 Z\"/>", "poly-14-r135")
export const IconPoly14R180 = makeIcon("<path d=\"M12 21 L8.1 20.11 L4.96 17.61 L3.23 14 L3.23 10 L4.96 6.39 L8.1 3.89 L12 3 L15.9 3.89 L19.04 6.39 L20.77 10 L20.77 14 L19.04 17.61 L15.9 20.11 Z\"/>", "poly-14-r180")
export const IconPoly14R270 = makeIcon("<path d=\"M3 12 L3.89 8.1 L6.39 4.96 L10 3.23 L14 3.23 L17.61 4.96 L20.11 8.1 L21 12 L20.11 15.9 L17.61 19.04 L14 20.77 L10 20.77 L6.39 19.04 L3.89 15.9 Z\"/>", "poly-14-r270")
export const IconPoly15R0 = makeIcon("<path d=\"M12 3 L15.66 3.78 L18.69 5.98 L20.56 9.22 L20.95 12.94 L19.79 16.5 L17.29 19.28 L13.87 20.8 L10.13 20.8 L6.71 19.28 L4.21 16.5 L3.05 12.94 L3.44 9.22 L5.31 5.98 L8.34 3.78 Z\"/>", "poly-15-r0")
export const IconPoly15R45 = makeIcon("<path d=\"M18.36 5.64 L20.4 8.77 L20.99 12.47 L20.02 16.09 L17.66 18.99 L14.33 20.69 L10.59 20.89 L7.1 19.55 L4.45 16.9 L3.11 13.41 L3.31 9.67 L5.01 6.34 L7.91 3.98 L11.53 3.01 L15.23 3.6 Z\"/>", "poly-15-r45")
export const IconPoly15R90 = makeIcon("<path d=\"M21 12 L20.22 15.66 L18.02 18.69 L14.78 20.56 L11.06 20.95 L7.5 19.79 L4.72 17.29 L3.2 13.87 L3.2 10.13 L4.72 6.71 L7.5 4.21 L11.06 3.05 L14.78 3.44 L18.02 5.31 L20.22 8.34 Z\"/>", "poly-15-r90")
export const IconPoly15R135 = makeIcon("<path d=\"M18.36 18.36 L15.23 20.4 L11.53 20.99 L7.91 20.02 L5.01 17.66 L3.31 14.33 L3.11 10.59 L4.45 7.1 L7.1 4.45 L10.59 3.11 L14.33 3.31 L17.66 5.01 L20.02 7.91 L20.99 11.53 L20.4 15.23 Z\"/>", "poly-15-r135")
export const IconPoly15R180 = makeIcon("<path d=\"M12 21 L8.34 20.22 L5.31 18.02 L3.44 14.78 L3.05 11.06 L4.21 7.5 L6.71 4.72 L10.13 3.2 L13.87 3.2 L17.29 4.72 L19.79 7.5 L20.95 11.06 L20.56 14.78 L18.69 18.02 L15.66 20.22 Z\"/>", "poly-15-r180")
export const IconPoly15R270 = makeIcon("<path d=\"M3 12 L3.78 8.34 L5.98 5.31 L9.22 3.44 L12.94 3.05 L16.5 4.21 L19.28 6.71 L20.8 10.13 L20.8 13.87 L19.28 17.29 L16.5 19.79 L12.94 20.95 L9.22 20.56 L5.98 18.69 L3.78 15.66 Z\"/>", "poly-15-r270")
export const IconPoly16R0 = makeIcon("<path d=\"M12 3 L15.44 3.69 L18.36 5.64 L20.31 8.56 L21 12 L20.31 15.44 L18.36 18.36 L15.44 20.31 L12 21 L8.56 20.31 L5.64 18.36 L3.69 15.44 L3 12 L3.69 8.56 L5.64 5.64 L8.56 3.69 Z\"/>", "poly-16-r0")
export const IconPoly16R45 = makeIcon("<path d=\"M18.36 5.64 L20.31 8.56 L21 12 L20.31 15.44 L18.36 18.36 L15.44 20.31 L12 21 L8.56 20.31 L5.64 18.36 L3.69 15.44 L3 12 L3.69 8.56 L5.64 5.64 L8.56 3.69 L12 3 L15.44 3.69 Z\"/>", "poly-16-r45")
export const IconPoly16R90 = makeIcon("<path d=\"M21 12 L20.31 15.44 L18.36 18.36 L15.44 20.31 L12 21 L8.56 20.31 L5.64 18.36 L3.69 15.44 L3 12 L3.69 8.56 L5.64 5.64 L8.56 3.69 L12 3 L15.44 3.69 L18.36 5.64 L20.31 8.56 Z\"/>", "poly-16-r90")
export const IconPoly16R135 = makeIcon("<path d=\"M18.36 18.36 L15.44 20.31 L12 21 L8.56 20.31 L5.64 18.36 L3.69 15.44 L3 12 L3.69 8.56 L5.64 5.64 L8.56 3.69 L12 3 L15.44 3.69 L18.36 5.64 L20.31 8.56 L21 12 L20.31 15.44 Z\"/>", "poly-16-r135")
export const IconPoly16R180 = makeIcon("<path d=\"M12 21 L8.56 20.31 L5.64 18.36 L3.69 15.44 L3 12 L3.69 8.56 L5.64 5.64 L8.56 3.69 L12 3 L15.44 3.69 L18.36 5.64 L20.31 8.56 L21 12 L20.31 15.44 L18.36 18.36 L15.44 20.31 Z\"/>", "poly-16-r180")
export const IconPoly16R270 = makeIcon("<path d=\"M3 12 L3.69 8.56 L5.64 5.64 L8.56 3.69 L12 3 L15.44 3.69 L18.36 5.64 L20.31 8.56 L21 12 L20.31 15.44 L18.36 18.36 L15.44 20.31 L12 21 L8.56 20.31 L5.64 18.36 L3.69 15.44 Z\"/>", "poly-16-r270")
export const IconStar4Fill = makeIcon("<path d=\"M12 2 L15.18 8.82 L22 12 L15.18 15.18 L12 22 L8.82 15.18 L2 12 L8.82 8.82 Z\" fill=\"currentColor\"/>", "star-4-fill")
export const IconStar4FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L13.75 10.25 L17.50 12.00 L13.75 13.75 L12.00 17.50 L10.25 13.75 L6.50 12.00 L10.25 10.25 Z\" fill=\"white\"/>", "star-4-fill-circle")
export const IconStar5Fill = makeIcon("<path d=\"M12 2 L14.65 8.36 L21.51 8.91 L16.28 13.39 L17.88 20.09 L12 16.5 L6.12 20.09 L7.72 13.39 L2.49 8.91 L9.35 8.36 Z\" fill=\"currentColor\"/>", "star-5-fill")
export const IconStar5FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L13.46 10.00 L17.23 10.30 L14.35 12.76 L15.23 16.45 L12.00 14.47 L8.77 16.45 L9.65 12.76 L6.77 10.30 L10.54 10.00 Z\" fill=\"white\"/>", "star-5-fill-circle")
export const IconStar6Fill = makeIcon("<path d=\"M12 2 L14.25 8.1 L20.66 7 L16.5 12 L20.66 17 L14.25 15.9 L12 22 L9.75 15.9 L3.34 17 L7.5 12 L3.34 7 L9.75 8.1 Z\" fill=\"currentColor\"/>", "star-6-fill")
export const IconStar6FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L13.24 9.86 L16.76 9.25 L14.47 12.00 L16.76 14.75 L13.24 14.14 L12.00 17.50 L10.76 14.14 L7.24 14.75 L9.53 12.00 L7.24 9.25 L10.76 9.86 Z\" fill=\"white\"/>", "star-6-fill-circle")
export const IconStar7Fill = makeIcon("<path d=\"M12 2 L13.95 7.95 L19.82 5.77 L16.39 11 L21.75 14.23 L15.52 14.81 L16.34 21.01 L12 16.5 L7.66 21.01 L8.48 14.81 L2.25 14.23 L7.61 11 L4.18 5.77 L10.05 7.95 Z\" fill=\"currentColor\"/>", "star-7-fill")
export const IconStar7FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L13.07 9.77 L16.30 8.57 L14.41 11.45 L17.36 13.23 L13.94 13.55 L14.39 16.96 L12.00 14.47 L9.61 16.96 L10.06 13.55 L6.64 13.23 L9.59 11.45 L7.70 8.57 L10.93 9.77 Z\" fill=\"white\"/>", "star-7-fill-circle")
export const IconStar8Fill = makeIcon("<path d=\"M12 2 L13.72 7.84 L19.07 4.93 L16.16 10.28 L22 12 L16.16 13.72 L19.07 19.07 L13.72 16.16 L12 22 L10.28 16.16 L4.93 19.07 L7.84 13.72 L2 12 L7.84 10.28 L4.93 4.93 L10.28 7.84 Z\" fill=\"currentColor\"/>", "star-8-fill")
export const IconStar8FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.95 9.71 L15.89 8.11 L14.29 11.05 L17.50 12.00 L14.29 12.95 L15.89 15.89 L12.95 14.29 L12.00 17.50 L11.05 14.29 L8.11 15.89 L9.71 12.95 L6.50 12.00 L9.71 11.05 L8.11 8.11 L11.05 9.71 Z\" fill=\"white\"/>", "star-8-fill-circle")
export const IconStar9Fill = makeIcon("<path d=\"M12 2 L13.54 7.77 L18.43 4.34 L15.9 9.75 L21.85 10.26 L16.43 12.78 L20.66 17 L14.89 15.45 L15.42 21.4 L12 16.5 L8.58 21.4 L9.11 15.45 L3.34 17 L7.57 12.78 L2.15 10.26 L8.1 9.75 L5.57 4.34 L10.46 7.77 Z\" fill=\"currentColor\"/>", "star-9-fill")
export const IconStar9FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.85 9.67 L15.54 7.79 L14.14 10.76 L17.42 11.04 L14.44 12.43 L16.76 14.75 L13.59 13.90 L13.88 17.17 L12.00 14.47 L10.12 17.17 L10.41 13.90 L7.24 14.75 L9.56 12.43 L6.58 11.04 L9.86 10.76 L8.46 7.79 L11.15 9.67 Z\" fill=\"white\"/>", "star-9-fill-circle")
export const IconStar10Fill = makeIcon("<path d=\"M12 2 L13.39 7.72 L17.88 3.91 L15.64 9.35 L21.51 8.91 L16.5 12 L21.51 15.09 L15.64 14.65 L17.88 20.09 L13.39 16.28 L12 22 L10.61 16.28 L6.12 20.09 L8.36 14.65 L2.49 15.09 L7.5 12 L2.49 8.91 L8.36 9.35 L6.12 3.91 L10.61 7.72 Z\" fill=\"currentColor\"/>", "star-10-fill")
export const IconStar10FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.76 9.65 L15.23 7.55 L14.00 10.54 L17.23 10.30 L14.47 12.00 L17.23 13.70 L14.00 13.46 L15.23 16.45 L12.76 14.35 L12.00 17.50 L11.24 14.35 L8.77 16.45 L10.00 13.46 L6.77 13.70 L9.53 12.00 L6.77 10.30 L10.00 10.54 L8.77 7.55 L11.24 9.65 Z\" fill=\"white\"/>", "star-10-fill-circle")
export const IconStar11Fill = makeIcon("<path d=\"M12 2 L13.27 7.68 L17.41 3.59 L15.4 9.05 L21.1 7.85 L16.45 11.36 L21.9 13.42 L16.09 13.87 L19.56 18.55 L14.43 15.79 L14.82 21.59 L12 16.5 L9.18 21.59 L9.57 15.79 L4.44 18.55 L7.91 13.87 L2.1 13.42 L7.55 11.36 L2.9 7.85 L8.6 9.05 L6.59 3.59 L10.73 7.68 Z\" fill=\"currentColor\"/>", "star-11-fill")
export const IconStar11FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.70 9.62 L14.98 7.37 L13.87 10.38 L17.01 9.72 L14.45 11.65 L17.45 12.78 L14.25 13.03 L16.16 15.60 L13.34 14.08 L13.55 17.27 L12.00 14.47 L10.45 17.27 L10.66 14.08 L7.84 15.60 L9.75 13.03 L6.55 12.78 L9.55 11.65 L7.00 9.72 L10.13 10.38 L9.02 7.37 L11.30 9.62 Z\" fill=\"white\"/>", "star-11-fill-circle")
export const IconStar12Fill = makeIcon("<path d=\"M12 2 L13.16 7.65 L17 3.34 L15.18 8.82 L20.66 7 L16.35 10.84 L22 12 L16.35 13.16 L20.66 17 L15.18 15.18 L17 20.66 L13.16 16.35 L12 22 L10.84 16.35 L7 20.66 L8.82 15.18 L3.34 17 L7.65 13.16 L2 12 L7.65 10.84 L3.34 7 L8.82 8.82 L7 3.34 L10.84 7.65 Z\" fill=\"currentColor\"/>", "star-12-fill")
export const IconStar12FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.64 9.61 L14.75 7.24 L13.75 10.25 L16.76 9.25 L14.39 11.36 L17.50 12.00 L14.39 12.64 L16.76 14.75 L13.75 13.75 L14.75 16.76 L12.64 14.39 L12.00 17.50 L11.36 14.39 L9.25 16.76 L10.25 13.75 L7.24 14.75 L9.61 12.64 L6.50 12.00 L9.61 11.36 L7.24 9.25 L10.25 10.25 L9.25 7.24 L11.36 9.61 Z\" fill=\"white\"/>", "star-12-fill-circle")
export const IconStar13Fill = makeIcon("<path d=\"M12 2 L13.08 7.63 L16.65 3.15 L14.98 8.63 L20.23 6.32 L16.21 10.4 L21.93 10.79 L16.47 12.54 L21.35 15.55 L15.7 14.56 L18.63 19.49 L14.09 15.98 L14.39 21.71 L12 16.5 L9.61 21.71 L9.91 15.98 L5.37 19.49 L8.3 14.56 L2.65 15.55 L7.53 12.54 L2.07 10.79 L7.79 10.4 L3.77 6.32 L9.02 8.63 L7.35 3.15 L10.92 7.63 Z\" fill=\"currentColor\"/>", "star-13-fill")
export const IconStar13FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.59 9.60 L14.56 7.13 L13.64 10.15 L16.53 8.88 L14.32 11.12 L17.46 11.33 L14.46 12.30 L17.14 13.95 L14.04 13.41 L15.65 16.12 L13.15 14.19 L13.31 17.34 L12.00 14.47 L10.69 17.34 L10.85 14.19 L8.35 16.12 L9.96 13.41 L6.86 13.95 L9.54 12.30 L6.54 11.33 L9.68 11.12 L7.47 8.88 L10.36 10.15 L9.44 7.13 L11.41 9.60 Z\" fill=\"white\"/>", "star-13-fill-circle")
export const IconStar14Fill = makeIcon("<path d=\"M12 2 L13 7.61 L16.34 2.99 L14.81 8.48 L19.82 5.77 L16.05 10.05 L21.75 9.77 L16.5 12 L21.75 14.23 L16.05 13.95 L19.82 18.23 L14.81 15.52 L16.34 21.01 L13 16.39 L12 22 L11 16.39 L7.66 21.01 L9.19 15.52 L4.18 18.23 L7.95 13.95 L2.25 14.23 L7.5 12 L2.25 9.77 L7.95 10.05 L4.18 5.77 L9.19 8.48 L7.66 2.99 L11 7.61 Z\" fill=\"currentColor\"/>", "star-14-fill")
export const IconStar14FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.55 9.59 L14.39 7.04 L13.55 10.06 L16.30 8.57 L14.23 10.93 L17.36 10.77 L14.47 12.00 L17.36 13.23 L14.23 13.07 L16.30 15.43 L13.55 13.94 L14.39 16.96 L12.55 14.41 L12.00 17.50 L11.45 14.41 L9.61 16.96 L10.45 13.94 L7.70 15.43 L9.77 13.07 L6.64 13.23 L9.53 12.00 L6.64 10.77 L9.77 10.93 L7.70 8.57 L10.45 10.06 L9.61 7.04 L11.45 9.59 Z\" fill=\"white\"/>", "star-14-fill-circle")
export const IconStar15Fill = makeIcon("<path d=\"M12 2 L12.94 7.6 L16.07 2.86 L14.65 8.36 L19.43 5.31 L15.9 9.75 L21.51 8.91 L16.48 11.53 L21.95 13.05 L16.28 13.39 L20.66 17 L15.34 15.01 L17.88 20.09 L13.83 16.11 L14.08 21.78 L12 16.5 L9.92 21.78 L10.17 16.11 L6.12 20.09 L8.66 15.01 L3.34 17 L7.72 13.39 L2.05 13.05 L7.52 11.53 L2.49 8.91 L8.1 9.75 L4.57 5.31 L9.35 8.36 L7.93 2.86 L11.06 7.6 Z\" fill=\"currentColor\"/>", "star-15-fill")
export const IconStar15FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.52 9.58 L14.24 6.97 L13.46 10.00 L16.09 8.32 L14.14 10.76 L17.23 10.30 L14.46 11.74 L17.47 12.58 L14.35 12.76 L16.76 14.75 L13.84 13.66 L15.23 16.45 L13.01 14.26 L13.14 17.38 L12.00 14.47 L10.86 17.38 L10.99 14.26 L8.77 16.45 L10.16 13.66 L7.24 14.75 L9.65 12.76 L6.53 12.58 L9.54 11.74 L6.77 10.30 L9.86 10.76 L7.91 8.32 L10.54 10.00 L9.76 6.97 L11.48 9.58 Z\" fill=\"white\"/>", "star-15-fill-circle")
export const IconStar16Fill = makeIcon("<path d=\"M12 2 L12.88 7.59 L15.83 2.76 L14.5 8.26 L19.07 4.93 L15.74 9.5 L21.24 8.17 L16.41 11.12 L22 12 L16.41 12.88 L21.24 15.83 L15.74 14.5 L19.07 19.07 L14.5 15.74 L15.83 21.24 L12.88 16.41 L12 22 L11.12 16.41 L8.17 21.24 L9.5 15.74 L4.93 19.07 L8.26 14.5 L2.76 15.83 L7.59 12.88 L2 12 L7.59 11.12 L2.76 8.17 L8.26 9.5 L4.93 4.93 L9.5 8.26 L8.17 2.76 L11.12 7.59 Z\" fill=\"currentColor\"/>", "star-16-fill")
export const IconStar16FillCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/><path d=\"M12.00 6.50 L12.48 9.57 L14.11 6.92 L13.38 9.94 L15.89 8.11 L14.06 10.63 L17.08 9.89 L14.43 11.52 L17.50 12.00 L14.43 12.48 L17.08 14.11 L14.06 13.38 L15.89 15.89 L13.38 14.06 L14.11 17.08 L12.48 14.43 L12.00 17.50 L11.52 14.43 L9.89 17.08 L10.63 14.06 L8.11 15.89 L9.94 13.38 L6.92 14.11 L9.57 12.48 L6.50 12.00 L9.57 11.52 L6.92 9.89 L9.94 10.63 L8.11 8.11 L10.63 9.94 L9.89 6.92 L11.52 9.57 Z\" fill=\"white\"/>", "star-16-fill-circle")
export const IconKeyA = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">A</text>", "key-A")
export const IconKeyB = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">B</text>", "key-B")
export const IconKeyC = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">C</text>", "key-C")
export const IconKeyD = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">D</text>", "key-D")
export const IconKeyE = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">E</text>", "key-E")
export const IconKeyF = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F</text>", "key-F")
export const IconKeyG = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">G</text>", "key-G")
export const IconKeyH = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">H</text>", "key-H")
export const IconKeyI = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">I</text>", "key-I")
export const IconKeyJ = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">J</text>", "key-J")
export const IconKeyK = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">K</text>", "key-K")
export const IconKeyL = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">L</text>", "key-L")
export const IconKeyM = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">M</text>", "key-M")
export const IconKeyN = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">N</text>", "key-N")
export const IconKeyO = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">O</text>", "key-O")
export const IconKeyP = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">P</text>", "key-P")
export const IconKeyQ = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Q</text>", "key-Q")
export const IconKeyR = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">R</text>", "key-R")
export const IconKeyS = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">S</text>", "key-S")
export const IconKeyT = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">T</text>", "key-T")
export const IconKeyU = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">U</text>", "key-U")
export const IconKeyV = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">V</text>", "key-V")
export const IconKeyW = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">W</text>", "key-W")
export const IconKeyX = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">X</text>", "key-X")
export const IconKeyY = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Y</text>", "key-Y")
export const IconKeyZ = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Z</text>", "key-Z")
export const IconKeyEnter = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Enter</text>", "key-Enter")
export const IconKeyEsc = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Esc</text>", "key-Esc")
export const IconKeyTab = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Tab</text>", "key-Tab")
export const IconKeySpace = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Space</text>", "key-Space")
export const IconKeyShift = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Shift</text>", "key-Shift")
export const IconKeyCtrl = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Ctrl</text>", "key-Ctrl")
export const IconKeyAlt = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Alt</text>", "key-Alt")
export const IconKeyCmd = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Cmd</text>", "key-Cmd")
export const IconKeyBackspace = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Backspace</text>", "key-Backspace")
export const IconKeyDelete = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Delete</text>", "key-Delete")
export const IconKeyInsert = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Insert</text>", "key-Insert")
export const IconKeyHome = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Home</text>", "key-Home")
export const IconKeyEnd = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">End</text>", "key-End")
export const IconKeyPgUp = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">PgUp</text>", "key-PgUp")
export const IconKeyPgDn = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">PgDn</text>", "key-PgDn")
export const IconKeyUp = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Up</text>", "key-Up")
export const IconKeyDown = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Down</text>", "key-Down")
export const IconKeyLeft = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Left</text>", "key-Left")
export const IconKeyRight = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">Right</text>", "key-Right")
export const IconKeyF1 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F1</text>", "key-F1")
export const IconKeyF2 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F2</text>", "key-F2")
export const IconKeyF3 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F3</text>", "key-F3")
export const IconKeyF4 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F4</text>", "key-F4")
export const IconKeyF5 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F5</text>", "key-F5")
export const IconKeyF6 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F6</text>", "key-F6")
export const IconKeyF7 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F7</text>", "key-F7")
export const IconKeyF8 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F8</text>", "key-F8")
export const IconKeyF9 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F9</text>", "key-F9")
export const IconKeyF10 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F10</text>", "key-F10")
export const IconKeyF11 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F11</text>", "key-F11")
export const IconKeyF12 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">F12</text>", "key-F12")
export const IconPercent0 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">0%</text>", "percent-0")
export const IconPercent2 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">2%</text>", "percent-2")
export const IconPercent4 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">4%</text>", "percent-4")
export const IconPercent6 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">6%</text>", "percent-6")
export const IconPercent8 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">8%</text>", "percent-8")
export const IconPercent10 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">10%</text>", "percent-10")
export const IconPercent12 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">12%</text>", "percent-12")
export const IconPercent14 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">14%</text>", "percent-14")
export const IconPercent16 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">16%</text>", "percent-16")
export const IconPercent18 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">18%</text>", "percent-18")
export const IconPercent20 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">20%</text>", "percent-20")
export const IconPercent22 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">22%</text>", "percent-22")
export const IconPercent24 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">24%</text>", "percent-24")
export const IconPercent26 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">26%</text>", "percent-26")
export const IconPercent28 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">28%</text>", "percent-28")
export const IconPercent30 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">30%</text>", "percent-30")
export const IconPercent32 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">32%</text>", "percent-32")
export const IconPercent34 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">34%</text>", "percent-34")
export const IconPercent36 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">36%</text>", "percent-36")
export const IconPercent38 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">38%</text>", "percent-38")
export const IconPercent40 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">40%</text>", "percent-40")
export const IconPercent42 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">42%</text>", "percent-42")
export const IconPercent44 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">44%</text>", "percent-44")
export const IconPercent46 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">46%</text>", "percent-46")
export const IconPercent48 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">48%</text>", "percent-48")
export const IconPercent50 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">50%</text>", "percent-50")
export const IconPercent52 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">52%</text>", "percent-52")
export const IconPercent54 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">54%</text>", "percent-54")
export const IconPercent56 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">56%</text>", "percent-56")
export const IconPercent58 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">58%</text>", "percent-58")
export const IconPercent60 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">60%</text>", "percent-60")
export const IconPercent62 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">62%</text>", "percent-62")
export const IconPercent64 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">64%</text>", "percent-64")
export const IconPercent66 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">66%</text>", "percent-66")
export const IconPercent68 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">68%</text>", "percent-68")
export const IconPercent70 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">70%</text>", "percent-70")
export const IconPercent72 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">72%</text>", "percent-72")
export const IconPercent74 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">74%</text>", "percent-74")
export const IconPercent76 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">76%</text>", "percent-76")
export const IconPercent78 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">78%</text>", "percent-78")
export const IconPercent80 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">80%</text>", "percent-80")
export const IconPercent82 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">82%</text>", "percent-82")
export const IconPercent84 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">84%</text>", "percent-84")
export const IconPercent86 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">86%</text>", "percent-86")
export const IconPercent88 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">88%</text>", "percent-88")
export const IconPercent90 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">90%</text>", "percent-90")
export const IconPercent92 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">92%</text>", "percent-92")
export const IconPercent94 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">94%</text>", "percent-94")
export const IconPercent96 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">96%</text>", "percent-96")
export const IconPercent98 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">98%</text>", "percent-98")
export const IconPercent100 = makeIcon("<text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"9\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">100%</text>", "percent-100")
export const IconDotsRow1 = makeIcon("<circle cx=\"12.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-1")
export const IconDotsRow2 = makeIcon("<circle cx=\"11.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"13.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-2")
export const IconDotsRow3 = makeIcon("<circle cx=\"10.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"12.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"14.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-3")
export const IconDotsRow4 = makeIcon("<circle cx=\"9.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"11.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"13.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"15.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-4")
export const IconDotsRow5 = makeIcon("<circle cx=\"8.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"10.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"12.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"14.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"16.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-5")
export const IconDotsRow6 = makeIcon("<circle cx=\"7.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"9.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"11.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"13.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"15.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"17.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-6")
export const IconDotsRow7 = makeIcon("<circle cx=\"6.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"8.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"10.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"12.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"14.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"16.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"18.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-7")
export const IconDotsRow8 = makeIcon("<circle cx=\"5.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"7.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"9.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"11.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"13.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"15.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"17.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"19.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-8")
export const IconDotsRow9 = makeIcon("<circle cx=\"4.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"6.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"8.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"10.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"12.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"14.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"16.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"18.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"20.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-9")
export const IconDotsRow10 = makeIcon("<circle cx=\"3.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"5.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"7.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"9.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"11.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"13.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"15.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"17.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"19.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"21.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-10")
export const IconDotsRow11 = makeIcon("<circle cx=\"2.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"4.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"6.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"8.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"10.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"12.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"14.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"16.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"18.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"20.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"22.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-11")
export const IconDotsRow12 = makeIcon("<circle cx=\"1.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"3.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"5.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"7.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"9.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"11.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"13.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"15.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"17.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"19.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"21.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/><circle cx=\"23.00\" cy=\"12\" r=\"1\" fill=\"currentColor\"/>", "dots-row-12")
export const IconLineW1 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"1\"/>", "line-w1")
export const IconLineW2 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"2\"/>", "line-w2")
export const IconLineW3 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"3\"/>", "line-w3")
export const IconLineW4 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"4\"/>", "line-w4")
export const IconLineW5 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"5\"/>", "line-w5")
export const IconLineW6 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"6\"/>", "line-w6")
export const IconLineW7 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"7\"/>", "line-w7")
export const IconLineW8 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"8\"/>", "line-w8")
export const IconLineW9 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"9\"/>", "line-w9")
export const IconLineW10 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"10\"/>", "line-w10")
export const IconLineW11 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"11\"/>", "line-w11")
export const IconLineW12 = makeIcon("<line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\" stroke-width=\"12\"/>", "line-w12")
export const IconRingW1 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"1\"/>", "ring-w1")
export const IconRingW2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"2\"/>", "ring-w2")
export const IconRingW3 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"3\"/>", "ring-w3")
export const IconRingW4 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"4\"/>", "ring-w4")
export const IconRingW5 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"5\"/>", "ring-w5")
export const IconRingW6 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"6\"/>", "ring-w6")
export const IconRingW7 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"7\"/>", "ring-w7")
export const IconRingW8 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"8\"/>", "ring-w8")
export const IconRingW9 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"9\"/>", "ring-w9")
export const IconRingW10 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke-width=\"10\"/>", "ring-w10")
export const IconRectR0 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\"/>", "rect-r0")
export const IconRectR1 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/>", "rect-r1")
export const IconRectR2 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/>", "rect-r2")
export const IconRectR3 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/>", "rect-r3")
export const IconRectR4 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/>", "rect-r4")
export const IconRectR5 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/>", "rect-r5")
export const IconRectR6 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"6\"/>", "rect-r6")
export const IconRectR7 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"7\"/>", "rect-r7")
export const IconRectR8 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"8\"/>", "rect-r8")
export const IconRectR9 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"9\"/>", "rect-r9")
export const IconRectR10 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"10\"/>", "rect-r10")
export const IconRectR11 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"11\"/>", "rect-r11")
export const IconRectR12 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"12\"/>", "rect-r12")
export const IconRating1 = makeIcon("<defs><clipPath id=\"r1\"><rect x=\"2\" y=\"2\" width=\"2.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r1)\"/>", "rating-1")
export const IconRating2 = makeIcon("<defs><clipPath id=\"r2\"><rect x=\"2\" y=\"2\" width=\"4.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r2)\"/>", "rating-2")
export const IconRating3 = makeIcon("<defs><clipPath id=\"r3\"><rect x=\"2\" y=\"2\" width=\"6.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r3)\"/>", "rating-3")
export const IconRating4 = makeIcon("<defs><clipPath id=\"r4\"><rect x=\"2\" y=\"2\" width=\"8.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r4)\"/>", "rating-4")
export const IconRating5 = makeIcon("<defs><clipPath id=\"r5\"><rect x=\"2\" y=\"2\" width=\"10.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r5)\"/>", "rating-5")
export const IconRating6 = makeIcon("<defs><clipPath id=\"r6\"><rect x=\"2\" y=\"2\" width=\"12.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r6)\"/>", "rating-6")
export const IconRating7 = makeIcon("<defs><clipPath id=\"r7\"><rect x=\"2\" y=\"2\" width=\"14.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r7)\"/>", "rating-7")
export const IconRating8 = makeIcon("<defs><clipPath id=\"r8\"><rect x=\"2\" y=\"2\" width=\"16.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r8)\"/>", "rating-8")
export const IconRating9 = makeIcon("<defs><clipPath id=\"r9\"><rect x=\"2\" y=\"2\" width=\"18.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r9)\"/>", "rating-9")
export const IconRating10 = makeIcon("<defs><clipPath id=\"r10\"><rect x=\"2\" y=\"2\" width=\"20.0\" height=\"20\"/></clipPath></defs><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"currentColor\" clip-path=\"url(#r10)\"/>", "rating-10")
export const IconNumkey1 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">1</text>", "numkey-1")
export const IconNumkey2 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">2</text>", "numkey-2")
export const IconNumkey3 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">3</text>", "numkey-3")
export const IconNumkey4 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">4</text>", "numkey-4")
export const IconNumkey5 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">5</text>", "numkey-5")
export const IconNumkey6 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">6</text>", "numkey-6")
export const IconNumkey7 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">7</text>", "numkey-7")
export const IconNumkey8 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">8</text>", "numkey-8")
export const IconNumkey9 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "numkey-9")
export const IconNumkey0 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">0</text>", "numkey-0")
export const IconNumkeyDot = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">.</text>", "numkey-dot")
export const IconNumkeyDash = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">-</text>", "numkey-dash")
export const IconRomanI = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">I</text>", "roman-I")
export const IconRomanII = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">II</text>", "roman-II")
export const IconRomanIII = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">III</text>", "roman-III")
export const IconRomanIV = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">IV</text>", "roman-IV")
export const IconRomanV = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">V</text>", "roman-V")
export const IconRomanVI = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">VI</text>", "roman-VI")
export const IconRomanVII = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">VII</text>", "roman-VII")
export const IconRomanVIII = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">VIII</text>", "roman-VIII")
export const IconRomanIX = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">IX</text>", "roman-IX")
export const IconRomanX = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">X</text>", "roman-X")
export const IconRomanXI = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">XI</text>", "roman-XI")
export const IconRomanXII = makeIcon("<text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" stroke=\"none\" font-family=\"system-ui,sans-serif\">XII</text>", "roman-XII")
export const IconSymAmpersand = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">&amp;</text>", "sym-ampersand")
export const IconSymAsterisk = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">*</text>", "sym-asterisk")
export const IconSymAt = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">@</text>", "sym-at")
export const IconSymBackslash = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">\\</text>", "sym-backslash")
export const IconSymDollar = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">$</text>", "sym-dollar")
export const IconSymPercentSym = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">%</text>", "sym-percent-sym")
export const IconSymPlusSym = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">+</text>", "sym-plus-sym")
export const IconSymEqualSym = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">=</text>", "sym-equal-sym")
export const IconSymQuestion = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">?</text>", "sym-question")
export const IconSymExclaim = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">!</text>", "sym-exclaim")
export const IconSymQuote = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">&quot;</text>", "sym-quote")
export const IconSymApostrophe = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">'</text>", "sym-apostrophe")
export const IconSymColon = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">:</text>", "sym-colon")
export const IconSymSemicolon = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">;</text>", "sym-semicolon")
export const IconSymComma = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">,</text>", "sym-comma")
export const IconSymPeriod = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">.</text>", "sym-period")
export const IconSymTilde = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">~</text>", "sym-tilde")
export const IconSymCaret = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">^</text>", "sym-caret")
export const IconSymUnderscore = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">_</text>", "sym-underscore")
export const IconSymPipe = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">|</text>", "sym-pipe")
export const IconSymLess = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">&lt;</text>", "sym-less")
export const IconSymGreater = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">&gt;</text>", "sym-greater")
export const IconSymParenLeft = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">(</text>", "sym-paren-left")
export const IconSymParenRight = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">)</text>", "sym-paren-right")
export const IconSymBracketLeft = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">[</text>", "sym-bracket-left")
export const IconSymBracketRight = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">]</text>", "sym-bracket-right")
export const IconSymBraceLeft = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">{</text>", "sym-brace-left")
export const IconSymBraceRight = makeIcon("<text x=\"12\" y=\"18\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"600\" fill=\"currentColor\" stroke=\"none\" font-family=\"ui-monospace,monospace\">}</text>", "sym-brace-right")
export const IconLabelNew = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">NEW</text>", "label-new")
export const IconLabelHot = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">HOT</text>", "label-hot")
export const IconLabelTop = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">TOP</text>", "label-top")
export const IconLabelVip = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">VIP</text>", "label-vip")
export const IconLabelPro = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">PRO</text>", "label-pro")
export const IconLabelBeta = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">BETA</text>", "label-beta")
export const IconLabelFree = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">FREE</text>", "label-free")
export const IconLabelLive = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">LIVE</text>", "label-live")
export const IconLabelSale = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">SALE</text>", "label-sale")
export const IconLabel24h = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">24H</text>", "label-24h")
export const IconLabelHd = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">HD</text>", "label-hd")
export const IconLabel4k = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">4K</text>", "label-4k")
export const IconLabelAi = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">AI</text>", "label-ai")
export const IconLabelApi = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">API</text>", "label-api")
export const IconLabelSdk = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">SDK</text>", "label-sdk")
export const IconLabelCss = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">CSS</text>", "label-css")
export const IconLabelHtml = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">HTML</text>", "label-html")
export const IconLabelJson = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">JSON</text>", "label-json")
export const IconLabelYaml = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">YAML</text>", "label-yaml")
export const IconLabelHttp = makeIcon("<rect x=\"1\" y=\"7\" width=\"22\" height=\"10\" rx=\"2\" fill=\"currentColor\"/><text x=\"12\" y=\"14.5\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"800\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">HTTP</text>", "label-http")
export const IconBellDot = makeIcon("<path d=\"M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4\"/><circle cx=\"19\" cy=\"5\" r=\"3\" fill=\"currentColor\"/>", "bell-dot")
export const IconBellCount = makeIcon("<path d=\"M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4\"/><circle cx=\"19\" cy=\"5\" r=\"4\" fill=\"currentColor\"/><text x=\"19\" y=\"7\" text-anchor=\"middle\" font-size=\"5\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "bell-count")
export const IconMailDot = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/><circle cx=\"19\" cy=\"5\" r=\"3\" fill=\"currentColor\"/>", "mail-dot")
export const IconMailCount = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/><circle cx=\"19\" cy=\"5\" r=\"4\" fill=\"currentColor\"/><text x=\"19\" y=\"7\" text-anchor=\"middle\" font-size=\"5\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "mail-count")
export const IconMessageDot = makeIcon("<path d=\"M21 12a8 8 0 0 1-8 8H8l-5 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z\"/><circle cx=\"19\" cy=\"5\" r=\"3\" fill=\"currentColor\"/>", "message-dot")
export const IconMessageCount = makeIcon("<path d=\"M21 12a8 8 0 0 1-8 8H8l-5 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z\"/><circle cx=\"19\" cy=\"5\" r=\"4\" fill=\"currentColor\"/><text x=\"19\" y=\"7\" text-anchor=\"middle\" font-size=\"5\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "message-count")
export const IconFileDot = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z M13 3v7h7\"/><circle cx=\"19\" cy=\"5\" r=\"3\" fill=\"currentColor\"/>", "file-dot")
export const IconFileCount = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z M13 3v7h7\"/><circle cx=\"19\" cy=\"5\" r=\"4\" fill=\"currentColor\"/><text x=\"19\" y=\"7\" text-anchor=\"middle\" font-size=\"5\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "file-count")
export const IconFolderDot = makeIcon("<path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><circle cx=\"19\" cy=\"5\" r=\"3\" fill=\"currentColor\"/>", "folder-dot")
export const IconFolderCount = makeIcon("<path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><circle cx=\"19\" cy=\"5\" r=\"4\" fill=\"currentColor\"/><text x=\"19\" y=\"7\" text-anchor=\"middle\" font-size=\"5\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "folder-count")
export const IconCalendarDot = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M3 11h18\"/><circle cx=\"19\" cy=\"5\" r=\"3\" fill=\"currentColor\"/>", "calendar-dot")
export const IconCalendarCount = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M3 11h18\"/><circle cx=\"19\" cy=\"5\" r=\"4\" fill=\"currentColor\"/><text x=\"19\" y=\"7\" text-anchor=\"middle\" font-size=\"5\" font-weight=\"700\" fill=\"white\" stroke=\"none\" font-family=\"system-ui,sans-serif\">9</text>", "calendar-count")
export const IconTickCircle8 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"17.30\" y2=\"6.70\"/><line x1=\"21.00\" y1=\"12.00\" x2=\"19.50\" y2=\"12.00\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"17.30\" y2=\"17.30\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"18.00\"/><line x1=\"5.64\" y1=\"18.36\" x2=\"6.70\" y2=\"17.30\"/><line x1=\"3.00\" y1=\"12.00\" x2=\"4.50\" y2=\"12.00\"/><line x1=\"5.64\" y1=\"5.64\" x2=\"6.70\" y2=\"6.70\"/>", "tick-circle-8")
export const IconTickCircle10 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"17.29\" y1=\"4.72\" x2=\"16.41\" y2=\"5.93\"/><line x1=\"20.56\" y1=\"9.22\" x2=\"19.13\" y2=\"9.68\"/><line x1=\"20.56\" y1=\"14.78\" x2=\"19.13\" y2=\"14.32\"/><line x1=\"17.29\" y1=\"19.28\" x2=\"15.53\" y2=\"16.85\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"6.71\" y1=\"19.28\" x2=\"7.59\" y2=\"18.07\"/><line x1=\"3.44\" y1=\"14.78\" x2=\"4.87\" y2=\"14.32\"/><line x1=\"3.44\" y1=\"9.22\" x2=\"6.29\" y2=\"10.15\"/><line x1=\"6.71\" y1=\"4.72\" x2=\"7.59\" y2=\"5.93\"/>", "tick-circle-10")
export const IconTickCircle12 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"16.50\" y1=\"4.21\" x2=\"15.75\" y2=\"5.50\"/><line x1=\"19.79\" y1=\"7.50\" x2=\"18.50\" y2=\"8.25\"/><line x1=\"21.00\" y1=\"12.00\" x2=\"19.50\" y2=\"12.00\"/><line x1=\"19.79\" y1=\"16.50\" x2=\"17.20\" y2=\"15.00\"/><line x1=\"16.50\" y1=\"19.79\" x2=\"15.75\" y2=\"18.50\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"7.50\" y1=\"19.79\" x2=\"8.25\" y2=\"18.50\"/><line x1=\"4.21\" y1=\"16.50\" x2=\"6.80\" y2=\"15.00\"/><line x1=\"3.00\" y1=\"12.00\" x2=\"4.50\" y2=\"12.00\"/><line x1=\"4.21\" y1=\"7.50\" x2=\"5.50\" y2=\"8.25\"/><line x1=\"7.50\" y1=\"4.21\" x2=\"8.25\" y2=\"5.50\"/>", "tick-circle-12")
export const IconTickCircle14 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"15.90\" y1=\"3.89\" x2=\"15.25\" y2=\"5.24\"/><line x1=\"19.04\" y1=\"6.39\" x2=\"17.86\" y2=\"7.32\"/><line x1=\"20.77\" y1=\"10.00\" x2=\"19.31\" y2=\"10.33\"/><line x1=\"20.77\" y1=\"14.00\" x2=\"17.85\" y2=\"13.34\"/><line x1=\"19.04\" y1=\"17.61\" x2=\"17.86\" y2=\"16.68\"/><line x1=\"15.90\" y1=\"20.11\" x2=\"15.25\" y2=\"18.76\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"8.10\" y1=\"20.11\" x2=\"9.40\" y2=\"17.41\"/><line x1=\"4.96\" y1=\"17.61\" x2=\"6.14\" y2=\"16.68\"/><line x1=\"3.23\" y1=\"14.00\" x2=\"4.69\" y2=\"13.67\"/><line x1=\"3.23\" y1=\"10.00\" x2=\"4.69\" y2=\"10.33\"/><line x1=\"4.96\" y1=\"6.39\" x2=\"7.31\" y2=\"8.26\"/><line x1=\"8.10\" y1=\"3.89\" x2=\"8.75\" y2=\"5.24\"/>", "tick-circle-14")
export const IconTickCircle16 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"15.44\" y1=\"3.69\" x2=\"14.87\" y2=\"5.07\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"17.30\" y2=\"6.70\"/><line x1=\"20.31\" y1=\"8.56\" x2=\"18.93\" y2=\"9.13\"/><line x1=\"21.00\" y1=\"12.00\" x2=\"18.00\" y2=\"12.00\"/><line x1=\"20.31\" y1=\"15.44\" x2=\"18.93\" y2=\"14.87\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"17.30\" y2=\"17.30\"/><line x1=\"15.44\" y1=\"20.31\" x2=\"14.87\" y2=\"18.93\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"18.00\"/><line x1=\"8.56\" y1=\"20.31\" x2=\"9.13\" y2=\"18.93\"/><line x1=\"5.64\" y1=\"18.36\" x2=\"6.70\" y2=\"17.30\"/><line x1=\"3.69\" y1=\"15.44\" x2=\"5.07\" y2=\"14.87\"/><line x1=\"3.00\" y1=\"12.00\" x2=\"6.00\" y2=\"12.00\"/><line x1=\"3.69\" y1=\"8.56\" x2=\"5.07\" y2=\"9.13\"/><line x1=\"5.64\" y1=\"5.64\" x2=\"6.70\" y2=\"6.70\"/><line x1=\"8.56\" y1=\"3.69\" x2=\"9.13\" y2=\"5.07\"/>", "tick-circle-16")
export const IconTickCircle18 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"15.08\" y1=\"3.54\" x2=\"14.57\" y2=\"4.95\"/><line x1=\"17.79\" y1=\"5.11\" x2=\"16.82\" y2=\"6.25\"/><line x1=\"19.79\" y1=\"7.50\" x2=\"18.50\" y2=\"8.25\"/><line x1=\"20.86\" y1=\"10.44\" x2=\"17.91\" y2=\"10.96\"/><line x1=\"20.86\" y1=\"13.56\" x2=\"19.39\" y2=\"13.30\"/><line x1=\"19.79\" y1=\"16.50\" x2=\"18.50\" y2=\"15.75\"/><line x1=\"17.79\" y1=\"18.89\" x2=\"16.82\" y2=\"17.75\"/><line x1=\"15.08\" y1=\"20.46\" x2=\"14.05\" y2=\"17.64\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"8.92\" y1=\"20.46\" x2=\"9.43\" y2=\"19.05\"/><line x1=\"6.21\" y1=\"18.89\" x2=\"7.18\" y2=\"17.75\"/><line x1=\"4.21\" y1=\"16.50\" x2=\"6.80\" y2=\"15.00\"/><line x1=\"3.14\" y1=\"13.56\" x2=\"4.61\" y2=\"13.30\"/><line x1=\"3.14\" y1=\"10.44\" x2=\"4.61\" y2=\"10.70\"/><line x1=\"4.21\" y1=\"7.50\" x2=\"5.50\" y2=\"8.25\"/><line x1=\"6.21\" y1=\"5.11\" x2=\"8.14\" y2=\"7.40\"/><line x1=\"8.92\" y1=\"3.54\" x2=\"9.43\" y2=\"4.95\"/>", "tick-circle-18")
export const IconTickCircle20 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"14.78\" y1=\"3.44\" x2=\"14.32\" y2=\"4.87\"/><line x1=\"17.29\" y1=\"4.72\" x2=\"16.41\" y2=\"5.93\"/><line x1=\"19.28\" y1=\"6.71\" x2=\"18.07\" y2=\"7.59\"/><line x1=\"20.56\" y1=\"9.22\" x2=\"17.71\" y2=\"10.15\"/><line x1=\"21.00\" y1=\"12.00\" x2=\"19.50\" y2=\"12.00\"/><line x1=\"20.56\" y1=\"14.78\" x2=\"19.13\" y2=\"14.32\"/><line x1=\"19.28\" y1=\"17.29\" x2=\"18.07\" y2=\"16.41\"/><line x1=\"17.29\" y1=\"19.28\" x2=\"15.53\" y2=\"16.85\"/><line x1=\"14.78\" y1=\"20.56\" x2=\"14.32\" y2=\"19.13\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"9.22\" y1=\"20.56\" x2=\"9.68\" y2=\"19.13\"/><line x1=\"6.71\" y1=\"19.28\" x2=\"8.47\" y2=\"16.85\"/><line x1=\"4.72\" y1=\"17.29\" x2=\"5.93\" y2=\"16.41\"/><line x1=\"3.44\" y1=\"14.78\" x2=\"4.87\" y2=\"14.32\"/><line x1=\"3.00\" y1=\"12.00\" x2=\"4.50\" y2=\"12.00\"/><line x1=\"3.44\" y1=\"9.22\" x2=\"6.29\" y2=\"10.15\"/><line x1=\"4.72\" y1=\"6.71\" x2=\"5.93\" y2=\"7.59\"/><line x1=\"6.71\" y1=\"4.72\" x2=\"7.59\" y2=\"5.93\"/><line x1=\"9.22\" y1=\"3.44\" x2=\"9.68\" y2=\"4.87\"/>", "tick-circle-20")
export const IconTickCircle22 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"14.54\" y1=\"3.36\" x2=\"14.11\" y2=\"4.80\"/><line x1=\"16.87\" y1=\"4.43\" x2=\"16.05\" y2=\"5.69\"/><line x1=\"18.80\" y1=\"6.11\" x2=\"17.67\" y2=\"7.09\"/><line x1=\"20.19\" y1=\"8.26\" x2=\"17.46\" y2=\"9.51\"/><line x1=\"20.91\" y1=\"10.72\" x2=\"19.42\" y2=\"10.93\"/><line x1=\"20.91\" y1=\"13.28\" x2=\"19.42\" y2=\"13.07\"/><line x1=\"20.19\" y1=\"15.74\" x2=\"18.82\" y2=\"15.12\"/><line x1=\"18.80\" y1=\"17.89\" x2=\"16.53\" y2=\"15.93\"/><line x1=\"16.87\" y1=\"19.57\" x2=\"16.05\" y2=\"18.31\"/><line x1=\"14.54\" y1=\"20.64\" x2=\"14.11\" y2=\"19.20\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"9.46\" y1=\"20.64\" x2=\"10.31\" y2=\"17.76\"/><line x1=\"7.13\" y1=\"19.57\" x2=\"7.95\" y2=\"18.31\"/><line x1=\"5.20\" y1=\"17.89\" x2=\"6.33\" y2=\"16.91\"/><line x1=\"3.81\" y1=\"15.74\" x2=\"5.18\" y2=\"15.12\"/><line x1=\"3.09\" y1=\"13.28\" x2=\"6.06\" y2=\"12.85\"/><line x1=\"3.09\" y1=\"10.72\" x2=\"4.58\" y2=\"10.93\"/><line x1=\"3.81\" y1=\"8.26\" x2=\"5.18\" y2=\"8.88\"/><line x1=\"5.20\" y1=\"6.11\" x2=\"6.33\" y2=\"7.09\"/><line x1=\"7.13\" y1=\"4.43\" x2=\"8.76\" y2=\"6.95\"/><line x1=\"9.46\" y1=\"3.36\" x2=\"9.89\" y2=\"4.80\"/>", "tick-circle-22")
export const IconTickCircle24 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"14.33\" y1=\"3.31\" x2=\"13.94\" y2=\"4.76\"/><line x1=\"16.50\" y1=\"4.21\" x2=\"15.75\" y2=\"5.50\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"17.30\" y2=\"6.70\"/><line x1=\"19.79\" y1=\"7.50\" x2=\"17.20\" y2=\"9.00\"/><line x1=\"20.69\" y1=\"9.67\" x2=\"19.24\" y2=\"10.06\"/><line x1=\"21.00\" y1=\"12.00\" x2=\"19.50\" y2=\"12.00\"/><line x1=\"20.69\" y1=\"14.33\" x2=\"19.24\" y2=\"13.94\"/><line x1=\"19.79\" y1=\"16.50\" x2=\"17.20\" y2=\"15.00\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"17.30\" y2=\"17.30\"/><line x1=\"16.50\" y1=\"19.79\" x2=\"15.75\" y2=\"18.50\"/><line x1=\"14.33\" y1=\"20.69\" x2=\"13.94\" y2=\"19.24\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"18.00\"/><line x1=\"9.67\" y1=\"20.69\" x2=\"10.06\" y2=\"19.24\"/><line x1=\"7.50\" y1=\"19.79\" x2=\"8.25\" y2=\"18.50\"/><line x1=\"5.64\" y1=\"18.36\" x2=\"6.70\" y2=\"17.30\"/><line x1=\"4.21\" y1=\"16.50\" x2=\"6.80\" y2=\"15.00\"/><line x1=\"3.31\" y1=\"14.33\" x2=\"4.76\" y2=\"13.94\"/><line x1=\"3.00\" y1=\"12.00\" x2=\"4.50\" y2=\"12.00\"/><line x1=\"3.31\" y1=\"9.67\" x2=\"4.76\" y2=\"10.06\"/><line x1=\"4.21\" y1=\"7.50\" x2=\"6.80\" y2=\"9.00\"/><line x1=\"5.64\" y1=\"5.64\" x2=\"6.70\" y2=\"6.70\"/><line x1=\"7.50\" y1=\"4.21\" x2=\"8.25\" y2=\"5.50\"/><line x1=\"9.67\" y1=\"3.31\" x2=\"10.06\" y2=\"4.76\"/>", "tick-circle-24")
export const IconTickCircle26 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"14.15\" y1=\"3.26\" x2=\"13.79\" y2=\"4.72\"/><line x1=\"16.18\" y1=\"4.03\" x2=\"15.49\" y2=\"5.36\"/><line x1=\"17.97\" y1=\"5.26\" x2=\"16.97\" y2=\"6.39\"/><line x1=\"19.41\" y1=\"6.89\" x2=\"16.94\" y2=\"8.59\"/><line x1=\"20.42\" y1=\"8.81\" x2=\"19.01\" y2=\"9.34\"/><line x1=\"20.93\" y1=\"10.92\" x2=\"19.45\" y2=\"11.10\"/><line x1=\"20.93\" y1=\"13.08\" x2=\"19.45\" y2=\"12.90\"/><line x1=\"20.42\" y1=\"15.19\" x2=\"17.61\" y2=\"14.13\"/><line x1=\"19.41\" y1=\"17.11\" x2=\"18.17\" y2=\"16.26\"/><line x1=\"17.97\" y1=\"18.74\" x2=\"16.97\" y2=\"17.61\"/><line x1=\"16.18\" y1=\"19.97\" x2=\"15.49\" y2=\"18.64\"/><line x1=\"14.15\" y1=\"20.74\" x2=\"13.44\" y2=\"17.83\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"9.85\" y1=\"20.74\" x2=\"10.21\" y2=\"19.28\"/><line x1=\"7.82\" y1=\"19.97\" x2=\"8.51\" y2=\"18.64\"/><line x1=\"6.03\" y1=\"18.74\" x2=\"8.02\" y2=\"16.49\"/><line x1=\"4.59\" y1=\"17.11\" x2=\"5.83\" y2=\"16.26\"/><line x1=\"3.58\" y1=\"15.19\" x2=\"4.99\" y2=\"14.66\"/><line x1=\"3.07\" y1=\"13.08\" x2=\"4.55\" y2=\"12.90\"/><line x1=\"3.07\" y1=\"10.92\" x2=\"6.04\" y2=\"11.28\"/><line x1=\"3.58\" y1=\"8.81\" x2=\"4.99\" y2=\"9.34\"/><line x1=\"4.59\" y1=\"6.89\" x2=\"5.83\" y2=\"7.74\"/><line x1=\"6.03\" y1=\"5.26\" x2=\"7.03\" y2=\"6.39\"/><line x1=\"7.82\" y1=\"4.03\" x2=\"9.21\" y2=\"6.69\"/><line x1=\"9.85\" y1=\"3.26\" x2=\"10.21\" y2=\"4.72\"/>", "tick-circle-26")
export const IconTickCircle28 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"14.00\" y1=\"3.23\" x2=\"13.67\" y2=\"4.69\"/><line x1=\"15.90\" y1=\"3.89\" x2=\"15.25\" y2=\"5.24\"/><line x1=\"17.61\" y1=\"4.96\" x2=\"16.68\" y2=\"6.14\"/><line x1=\"19.04\" y1=\"6.39\" x2=\"16.69\" y2=\"8.26\"/><line x1=\"20.11\" y1=\"8.10\" x2=\"18.76\" y2=\"8.75\"/><line x1=\"20.77\" y1=\"10.00\" x2=\"19.31\" y2=\"10.33\"/><line x1=\"21.00\" y1=\"12.00\" x2=\"19.50\" y2=\"12.00\"/><line x1=\"20.77\" y1=\"14.00\" x2=\"17.85\" y2=\"13.34\"/><line x1=\"20.11\" y1=\"15.90\" x2=\"18.76\" y2=\"15.25\"/><line x1=\"19.04\" y1=\"17.61\" x2=\"17.86\" y2=\"16.68\"/><line x1=\"17.61\" y1=\"19.04\" x2=\"16.68\" y2=\"17.86\"/><line x1=\"15.90\" y1=\"20.11\" x2=\"14.60\" y2=\"17.41\"/><line x1=\"14.00\" y1=\"20.77\" x2=\"13.67\" y2=\"19.31\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"10.00\" y1=\"20.77\" x2=\"10.33\" y2=\"19.31\"/><line x1=\"8.10\" y1=\"20.11\" x2=\"9.40\" y2=\"17.41\"/><line x1=\"6.39\" y1=\"19.04\" x2=\"7.32\" y2=\"17.86\"/><line x1=\"4.96\" y1=\"17.61\" x2=\"6.14\" y2=\"16.68\"/><line x1=\"3.89\" y1=\"15.90\" x2=\"5.24\" y2=\"15.25\"/><line x1=\"3.23\" y1=\"14.00\" x2=\"6.15\" y2=\"13.34\"/><line x1=\"3.00\" y1=\"12.00\" x2=\"4.50\" y2=\"12.00\"/><line x1=\"3.23\" y1=\"10.00\" x2=\"4.69\" y2=\"10.33\"/><line x1=\"3.89\" y1=\"8.10\" x2=\"5.24\" y2=\"8.75\"/><line x1=\"4.96\" y1=\"6.39\" x2=\"7.31\" y2=\"8.26\"/><line x1=\"6.39\" y1=\"4.96\" x2=\"7.32\" y2=\"6.14\"/><line x1=\"8.10\" y1=\"3.89\" x2=\"8.75\" y2=\"5.24\"/><line x1=\"10.00\" y1=\"3.23\" x2=\"10.33\" y2=\"4.69\"/>", "tick-circle-28")
export const IconTickCircle30 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"13.87\" y1=\"3.20\" x2=\"13.56\" y2=\"4.66\"/><line x1=\"15.66\" y1=\"3.78\" x2=\"15.05\" y2=\"5.15\"/><line x1=\"17.29\" y1=\"4.72\" x2=\"16.41\" y2=\"5.93\"/><line x1=\"18.69\" y1=\"5.98\" x2=\"16.46\" y2=\"7.99\"/><line x1=\"19.79\" y1=\"7.50\" x2=\"18.50\" y2=\"8.25\"/><line x1=\"20.56\" y1=\"9.22\" x2=\"19.13\" y2=\"9.68\"/><line x1=\"20.95\" y1=\"11.06\" x2=\"19.46\" y2=\"11.22\"/><line x1=\"20.95\" y1=\"12.94\" x2=\"17.97\" y2=\"12.63\"/><line x1=\"20.56\" y1=\"14.78\" x2=\"19.13\" y2=\"14.32\"/><line x1=\"19.79\" y1=\"16.50\" x2=\"18.50\" y2=\"15.75\"/><line x1=\"18.69\" y1=\"18.02\" x2=\"17.57\" y2=\"17.02\"/><line x1=\"17.29\" y1=\"19.28\" x2=\"15.53\" y2=\"16.85\"/><line x1=\"15.66\" y1=\"20.22\" x2=\"15.05\" y2=\"18.85\"/><line x1=\"13.87\" y1=\"20.80\" x2=\"13.56\" y2=\"19.34\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"19.50\"/><line x1=\"10.13\" y1=\"20.80\" x2=\"10.75\" y2=\"17.87\"/><line x1=\"8.34\" y1=\"20.22\" x2=\"8.95\" y2=\"18.85\"/><line x1=\"6.71\" y1=\"19.28\" x2=\"7.59\" y2=\"18.07\"/><line x1=\"5.31\" y1=\"18.02\" x2=\"6.43\" y2=\"17.02\"/><line x1=\"4.21\" y1=\"16.50\" x2=\"6.80\" y2=\"15.00\"/><line x1=\"3.44\" y1=\"14.78\" x2=\"4.87\" y2=\"14.32\"/><line x1=\"3.05\" y1=\"12.94\" x2=\"4.54\" y2=\"12.78\"/><line x1=\"3.05\" y1=\"11.06\" x2=\"4.54\" y2=\"11.22\"/><line x1=\"3.44\" y1=\"9.22\" x2=\"6.29\" y2=\"10.15\"/><line x1=\"4.21\" y1=\"7.50\" x2=\"5.50\" y2=\"8.25\"/><line x1=\"5.31\" y1=\"5.98\" x2=\"6.43\" y2=\"6.98\"/><line x1=\"6.71\" y1=\"4.72\" x2=\"7.59\" y2=\"5.93\"/><line x1=\"8.34\" y1=\"3.78\" x2=\"9.56\" y2=\"6.52\"/><line x1=\"10.13\" y1=\"3.20\" x2=\"10.44\" y2=\"4.66\"/>", "tick-circle-30")
export const IconTickCircle32 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"12.00\" y1=\"3.00\" x2=\"12.00\" y2=\"6.00\"/><line x1=\"13.76\" y1=\"3.17\" x2=\"13.46\" y2=\"4.64\"/><line x1=\"15.44\" y1=\"3.69\" x2=\"14.87\" y2=\"5.07\"/><line x1=\"17.00\" y1=\"4.52\" x2=\"16.17\" y2=\"5.76\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"16.24\" y2=\"7.76\"/><line x1=\"19.48\" y1=\"7.00\" x2=\"18.24\" y2=\"7.83\"/><line x1=\"20.31\" y1=\"8.56\" x2=\"18.93\" y2=\"9.13\"/><line x1=\"20.83\" y1=\"10.24\" x2=\"19.36\" y2=\"10.54\"/><line x1=\"21.00\" y1=\"12.00\" x2=\"18.00\" y2=\"12.00\"/><line x1=\"20.83\" y1=\"13.76\" x2=\"19.36\" y2=\"13.46\"/><line x1=\"20.31\" y1=\"15.44\" x2=\"18.93\" y2=\"14.87\"/><line x1=\"19.48\" y1=\"17.00\" x2=\"18.24\" y2=\"16.17\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"16.24\" y2=\"16.24\"/><line x1=\"17.00\" y1=\"19.48\" x2=\"16.17\" y2=\"18.24\"/><line x1=\"15.44\" y1=\"20.31\" x2=\"14.87\" y2=\"18.93\"/><line x1=\"13.76\" y1=\"20.83\" x2=\"13.46\" y2=\"19.36\"/><line x1=\"12.00\" y1=\"21.00\" x2=\"12.00\" y2=\"18.00\"/><line x1=\"10.24\" y1=\"20.83\" x2=\"10.54\" y2=\"19.36\"/><line x1=\"8.56\" y1=\"20.31\" x2=\"9.13\" y2=\"18.93\"/><line x1=\"7.00\" y1=\"19.48\" x2=\"7.83\" y2=\"18.24\"/><line x1=\"5.64\" y1=\"18.36\" x2=\"7.76\" y2=\"16.24\"/><line x1=\"4.52\" y1=\"17.00\" x2=\"5.76\" y2=\"16.17\"/><line x1=\"3.69\" y1=\"15.44\" x2=\"5.07\" y2=\"14.87\"/><line x1=\"3.17\" y1=\"13.76\" x2=\"4.64\" y2=\"13.46\"/><line x1=\"3.00\" y1=\"12.00\" x2=\"6.00\" y2=\"12.00\"/><line x1=\"3.17\" y1=\"10.24\" x2=\"4.64\" y2=\"10.54\"/><line x1=\"3.69\" y1=\"8.56\" x2=\"5.07\" y2=\"9.13\"/><line x1=\"4.52\" y1=\"7.00\" x2=\"5.76\" y2=\"7.83\"/><line x1=\"5.64\" y1=\"5.64\" x2=\"7.76\" y2=\"7.76\"/><line x1=\"7.00\" y1=\"4.52\" x2=\"7.83\" y2=\"5.76\"/><line x1=\"8.56\" y1=\"3.69\" x2=\"9.13\" y2=\"5.07\"/><line x1=\"10.24\" y1=\"3.17\" x2=\"10.54\" y2=\"4.64\"/>", "tick-circle-32")
export const IconMicroscope = makeIcon("<path d=\"M6 18h8M3 22h18M14 22a7 7 0 1 0-7-7M9 14l2-2M12 3l4 4M10 5l4 4M11 6l-3 3\"/>", "microscope")
export const IconTelescope = makeIcon("<path d=\"M10 22V12M14 22l-4-7M6 8l12-5 3 5-12 5zM3 9l3 5M18 3l3 5\"/>", "telescope")
export const IconAtom = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"1.5\"/><path d=\"M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5zM15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z\"/>", "atom")
export const IconFlask = makeIcon("<path d=\"M9 3h6v6l4 9a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3l4-9zM7 14h10\"/>", "flask")
export const IconTestTube = makeIcon("<path d=\"M14.5 2v17.5a4.5 4.5 0 0 1-9 0V2M5 12h9M5 6h9\"/>", "testTube")
export const IconDna = makeIcon("<path d=\"M2 15c6.667-6 13.333 0 20-6M9 22c1.798-1.998 2.518-3.995 2.807-5.993M15 2c-1.798 1.998-2.518 3.995-2.807 5.993M17 6l-2.5-2.5M14 8l-1-1M7 18l2.5 2.5M10 16l1 1M2 9c6.667 6 13.333 0 20 6\"/>", "dna")
export const IconPill2 = makeIcon("<path d=\"M10.5 20.5l-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7zM7 8l7 7M12 4l8 8\"/>", "pill2")
export const IconGavel = makeIcon("<path d=\"M14 13l6 6-2 2-6-6M3 21h10M12 3l6 6-4 4-6-6zM8 7L3 12M10 5L5 10\"/>", "gavel")
export const IconScale = makeIcon("<path d=\"M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2\"/>", "scale")
export const IconLandmark = makeIcon("<path d=\"M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l10 6H2z\"/>", "landmark")
export const IconScroll = makeIcon("<path d=\"M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4\"/>", "scroll")
export const IconContract = makeIcon("<path d=\"M9 12h6M9 16h6M14 2v4a2 2 0 0 0 2 2h4M4 4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\"/>", "contract")
export const IconInvoice = makeIcon("<path d=\"M9 12h6M9 16h6M9 8h6M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z\"/>", "invoice")
export const IconFirstAid = makeIcon("<rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M12 11v6M9 14h6M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", "first-aid")
export const IconCrossMedical = makeIcon("<path d=\"M11 3h2v7h7v2h-7v7h-2v-7H4v-2h7z\"/>", "cross-medical")
export const IconPrescription = makeIcon("<path d=\"M8 21V4h6a4 4 0 0 1 0 8H8M15 15l6 6M21 15l-6 6\"/>", "prescription")
export const IconWheelchair = makeIcon("<circle cx=\"10\" cy=\"4\" r=\"1.5\"/><path d=\"M10 6v6h6l2 8M10 12l-3 3v4M6 22a5 5 0 1 0 0-10M18 14a5 5 0 1 1-5-5\"/>", "wheelchair")
export const IconHeartBeat = makeIcon("<path d=\"M3 12h3l2-4 3 8 2-6 2 2h6M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 1.5-.4 3-1 4\"/>", "heart-beat")
export const IconBrain = makeIcon("<path d=\"M12 5a3 3 0 0 0-6 0v.5a3 3 0 0 0-2 5.5 3 3 0 0 0 2 5.5V17a3 3 0 0 0 6 0zM12 5a3 3 0 0 1 6 0v.5a3 3 0 0 1 2 5.5 3 3 0 0 1-2 5.5V17a3 3 0 0 1-6 0zM12 5v14\"/>", "brain")
export const IconBlueprint = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 9h18M9 3v18M12 14h5v5M14 12h4\"/>", "blueprint")
export const IconCrane = makeIcon("<path d=\"M6 22V6l16-4v4M6 10l16-4M6 14l8-2M14 4v12M11 16h6l-3 6z\"/>", "crane")
export const IconGear = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/>", "gear")
export const IconCog = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2\"/>", "cog")
export const IconGear2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2l1 3 3-2-1 3 3 1-2 3 3 1-3 2 1 3-3-1-1 3-2-3-3 1 1-3-3-2 3-1-2-3 3-1-1-3 3 2z\"/>", "gear2")
export const IconRuler2 = makeIcon("<path d=\"M3 15l12-12 6 6-12 12zM6 12l2 2M9 9l2 2M12 6l2 2\"/>", "ruler-2")
export const IconMusic2 = makeIcon("<circle cx=\"8\" cy=\"18\" r=\"3\"/><path d=\"M11 18V4l10-2v14\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/>", "music-2")
export const IconMusicNote = makeIcon("<path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"15\" cy=\"16\" r=\"3\"/>", "music-note")
export const IconMusic3 = makeIcon("<path d=\"M12 3v18M8 7V5l8-2v2M6 9c0-1 2-2 3-2s3 1 3 2M18 9c0-1-2-2-3-2s-3 1-3 2\"/>", "music-3")
export const IconPiano = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M9 3v12M15 3v12M7 15h.01M11 15h.01M15 15h.01M3 15h18\"/>", "piano")
export const IconGuitar = makeIcon("<path d=\"M20 3l-1.5 1.5M18.5 4.5L21 2M8 16c-2 0-4-2-4-4s2-4 4-4 4 2 4 4v2l6 6M14 12l4-4\"/><circle cx=\"8\" cy=\"12\" r=\"1.5\"/>", "guitar")
export const IconDrum = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20M4 8l4 4M20 8l-4 4M8 20l2-4M16 20l-2-4\"/>", "drum")
export const IconPalette = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"16\" cy=\"8\" r=\"1\"/><circle cx=\"8\" cy=\"14\" r=\"1\"/><circle cx=\"16\" cy=\"14\" r=\"1\"/>", "palette")
export const IconBrush = makeIcon("<path d=\"M9.5 14.5L3 21M14 3l-9 9 5 5 9-9zM14 3l4 4\"/>", "brush")
export const IconPenTool = makeIcon("<path d=\"M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.586 7.586\"/><circle cx=\"11\" cy=\"11\" r=\"2\"/>", "pen-tool")
export const IconPipette = makeIcon("<path d=\"M2 22l1-1h3l9-9M3 21v-3l9-9M15 6l3.376-3.376a2.121 2.121 0 1 1 3 3L18 9l-3-3zM11 8l5 5\"/>", "pipette")
export const IconShapes = makeIcon("<path d=\"M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1zM16 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 14h8v8H3z\"/>", "shapes")
export const IconAperture = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94\"/>", "aperture")
export const IconCameraOff = makeIcon("<path d=\"M3 3l18 18M10.5 4.5h3l2 2h2a2 2 0 0 1 2 2v9M6 8l-2-2v12a2 2 0 0 0 2 2h13M14 14l-4-4M12 17a4 4 0 0 0 4-4\"/>", "camera-off")
export const IconFlash2 = makeIcon("<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "flash2")
export const IconFlashOff = makeIcon("<path d=\"M3 3l18 18M13 2L4 14h7l-1 8M16 6l-3 4M13 13l-3 5\"/>", "flash-off")
export const IconFilter2 = makeIcon("<path d=\"M3 4h18l-7 8v6l-4 2v-8z\"/>", "filter2")
export const IconFocus = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M3 7V4a1 1 0 0 1 1-1h3M21 7V4a1 1 0 0 0-1-1h-3M3 17v3a1 1 0 0 0 1 1h3M21 17v3a1 1 0 0 1-1 1h-3\"/>", "focus")
export const IconDoor = makeIcon("<path d=\"M3 22h18M6 22V2h12v20M10 12h.01\"/>", "door")
export const IconWindow = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 12h18M12 3v18\"/>", "window")
export const IconSofa = makeIcon("<path d=\"M3 12v6a1 1 0 0 0 1 1h2v2M21 12v6a1 1 0 0 1-1 1h-2v2M3 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 12h18M3 16h18\"/>", "sofa")
export const IconBed = makeIcon("<path d=\"M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 14h20M6 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM2 20v-2\"/>", "bed")
export const IconLamp = makeIcon("<path d=\"M8 2h8l-3 10h-2zM12 12v8M8 20h8M9 22h6\"/>", "lamp")
export const IconChair = makeIcon("<path d=\"M6 19v3M18 19v3M6 19h12v-6H6zM6 13V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8\"/>", "chair")
export const IconMountain = makeIcon("<path d=\"M3 20l7-12 4 6 3-4 4 10zM9 8l3-4 4 6\"/>", "mountain")
export const IconVolcano = makeIcon("<path d=\"M3 22h18l-5-8H8zM8 14l4-12 4 12M10 6h4M9 10h6\"/>", "volcano")
export const IconWave = makeIcon("<path d=\"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1\"/>", "wave")
export const IconWaves = makeIcon("<path d=\"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1\"/>", "waves")
export const IconIsland = makeIcon("<path d=\"M2 20h20M5 20a7 7 0 0 1 14 0M12 13V3M8 7l4-4 4 4\"/>", "island")
export const IconTent = makeIcon("<path d=\"M3.5 21L14 3l10.5 18M14 21l-3.5-6M14 21l3.5-6M10 15h8\"/>", "tent")
export const IconPlanet = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M2 12c0-2 4-4 10-4s10 2 10 4-4 4-10 4-10-2-10-4zM8 6l4 4M16 14l4 4\"/>", "planet")
export const IconSatellite = makeIcon("<path d=\"M13 7L9 3 3 9l4 4M17 13l4 4-6 6-4-4M14 10l-4 4M8 5l3 3M13 10l3 3M11 21l-2-2M21 11l-2-2\"/>", "satellite")
export const IconTelescope2 = makeIcon("<path d=\"M10 22V12M14 22l-4-7M6 8l12-5 3 5-12 5zM3 9l3 5M18 3l3 5\"/>", "telescope2")
export const IconOrbit = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M12 4a8 8 0 0 1 0 16M20 12a8 8 0 0 1-16 0\"/>", "orbit")
export const IconGamepad2 = makeIcon("<path d=\"M6 12h4M8 10v4M15 13h.01M18 11h.01M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z\"/>", "gamepad-2")
export const IconJoystick = makeIcon("<circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M12 9v12M7 18h10a2 2 0 0 1 2 2v2H5v-2a2 2 0 0 1 2-2z\"/>", "joystick")
export const IconDice = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"16\" cy=\"8\" r=\"1\"/><circle cx=\"8\" cy=\"16\" r=\"1\"/><circle cx=\"16\" cy=\"16\" r=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>", "dice")
export const IconDice2 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"16\" cy=\"16\" r=\"1\"/>", "dice-2")
export const IconDice3 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"16\" cy=\"16\" r=\"1\"/>", "dice-3")
export const IconDice4 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"16\" cy=\"8\" r=\"1\"/><circle cx=\"8\" cy=\"16\" r=\"1\"/><circle cx=\"16\" cy=\"16\" r=\"1\"/>", "dice-4")
export const IconChess = makeIcon("<path d=\"M8 20h8M6 16l2-2v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2l2 2v4H6zM12 10V6M10 6h4M8 4h8\"/>", "chess")
export const IconBinary = makeIcon("<path d=\"M6 4h4v6H6zM6 14h4v6H6zM14 4h4v6h-4zM14 14h4v6h-4zM8 7h.01M8 17h.01M16 7h.01M16 17h.01\"/>", "binary")
export const IconGitFork = makeIcon("<circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><path d=\"M6 9v6M18 9a9 9 0 0 1-9 9\"/>", "git-fork")
export const IconRegex = makeIcon("<path d=\"M17 3v10M12 5.5v5M15.5 8H14M3 12v.01M7 12v.01M11 12v.01M3 16v.01M7 16v.01\"/>", "regex")
export const IconBug2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M12 6V3M12 21v-3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M9 3l3 3 3-3M9 21l3-3 3 3\"/>", "bug2")
export const IconWebhook = makeIcon("<path d=\"M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17a4 4 0 0 1 4-4 4 4 0 0 1 1.51.28A2 2 0 0 1 10 11h3M9.5 8.5a4 4 0 1 1 3 6.5M14 8l1 1\"/>", "webhook")
export const IconHeartMonitor = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M5 12h3l2-4 2 6 2-3 1 1h4M8 21h8M12 17v4\"/>", "heart-monitor")
export const IconRouter = makeIcon("<rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\"/><path d=\"M6.01 18H6M10.01 18H10M15 10l3-3M18 13V7h-6M21 10h-6\"/>", "router")
export const IconHardDrive2 = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"8\" rx=\"2\"/><rect x=\"2\" y=\"13\" width=\"20\" height=\"8\" rx=\"2\"/><path d=\"M6 7h.01M6 17h.01M10 7h.01M10 17h.01\"/>", "hard-drive-2")
export const IconModem = makeIcon("<rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\"/><path d=\"M6 18h.01M10 18h.01M14 18h.01M18 18h.01M12 10V4M8 7l4-3 4 3\"/>", "modem")
export const IconSignal1 = makeIcon("<path d=\"M2 20h.01\"/>", "signal-1")
export const IconSignal2 = makeIcon("<path d=\"M2 20h.01M7 20v-4\"/>", "signal-2")
export const IconSignal3 = makeIcon("<path d=\"M2 20h.01M7 20v-4M12 20v-8\"/>", "signal-3")
export const IconSignal4 = makeIcon("<path d=\"M2 20h.01M7 20v-4M12 20v-8M17 20V8\"/>", "signal-4")
export const IconGraduation = makeIcon("<path d=\"M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5\"/>", "graduation")
export const IconBackpack = makeIcon("<path d=\"M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 10h.01M16 10h.01M8 14h8\"/>", "backpack")
export const IconBook2 = makeIcon("<path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/>", "book2")
export const IconBookOpen = makeIcon("<path d=\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z\"/>", "book-open")
export const IconKey2 = makeIcon("<circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"M11 12l9-9M17 6l3 3M15 4l3 3\"/>", "key2")
export const IconSofa2 = makeIcon("<path d=\"M3 12v6a1 1 0 0 0 1 1h2v2M21 12v6a1 1 0 0 1-1 1h-2v2M3 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 12h18M3 16h18\"/>", "sofa2")
export const IconChurch = makeIcon("<path d=\"M12 2v6M10 4h4M6 22v-9l6-4 6 4v9M10 22v-5h4v5M2 22h20M6 15H2M22 15h-4\"/>", "church")
export const IconMosque = makeIcon("<path d=\"M12 2a3 3 0 0 0-3 3v3c0 1 1 2 2 2h2c1 0 2-1 2-2V5a3 3 0 0 0-3-3zM5 12a3 3 0 0 0-3 3v7h20v-7a3 3 0 0 0-3-3zM8 22v-4a4 4 0 0 1 8 0v4\"/>", "mosque")
export const IconShapeCircle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/>", "shape-circle")
export const IconShapeSquare = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/>", "shape-square")
export const IconShapeTriangle = makeIcon("<path d=\"M12 3 L21 21 L3 21 Z\"/>", "shape-triangle")
export const IconShapeDiamond = makeIcon("<path d=\"M12 2l10 10-10 10L2 12z\"/>", "shape-diamond")
export const IconShapePentagon = makeIcon("<path d=\"M12 2l10 7-4 13H6L2 9z\"/>", "shape-pentagon")
export const IconShapeHexagon = makeIcon("<path d=\"M12 2l9 5v10l-9 5-9-5V7z\"/>", "shape-hexagon")
export const IconShapeOctagon = makeIcon("<path d=\"M8 2h8l6 6v8l-6 6H8l-6-6V8z\"/>", "shape-octagon")
export const IconShapeStar = makeIcon("<path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/>", "shape-star")
export const IconCoupon = makeIcon("<path d=\"M2 8h20v8H2z M6 8v8M18 8v8\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>", "coupon")
export const IconShoppingBasket = makeIcon("<path d=\"M4 10h16l-1 10H5zM8 10l4-7 4 7M9 14v3M12 14v3M15 14v3\"/>", "shopping-basket")
export const IconQrCode = makeIcon("<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><path d=\"M14 14h3v3h-3zM20 14h1v7h-1zM14 20h3v1h-3z\"/>", "qr-code")
export const IconBarcode = makeIcon("<path d=\"M2 5v14M6 5v14M9 5v14M12 5v14M16 5v14M19 5v14M22 5v14\"/>", "barcode")
export const IconShoppingBag3 = makeIcon("<path d=\"M6 2h12l2 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8zM4 8h16M8 12a4 4 0 0 0 8 0\"/>", "shopping-bag-3")
export const IconTractor = makeIcon("<path d=\"M4 20v-6h6l2-4h6v10M4 20h16M16 14h4v6M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 6h6l1 4M9 3h6\"/>", "tractor")
export const IconForklift = makeIcon("<path d=\"M4 4v16h12M4 12h12M12 4v8M16 20v-8h5v8M16 14h5M16 20h5\"/>", "forklift")
export const IconScooter = makeIcon("<circle cx=\"5\" cy=\"18\" r=\"2\"/><circle cx=\"19\" cy=\"18\" r=\"2\"/><path d=\"M5 18l3-10h4l3 10M12 8l3-3M14 6l4-2 1 4\"/>", "scooter")
export const IconMotorcycle = makeIcon("<circle cx=\"5\" cy=\"18\" r=\"3\"/><circle cx=\"19\" cy=\"18\" r=\"3\"/><path d=\"M5 18l5-7h6l3 7M10 11l2-5h3M14 6l4-2\"/>", "motorcycle")
export const IconHelicopter = makeIcon("<path d=\"M3 8h18M12 8v4M12 12l-4 8M12 12l4 8M8 20h8M12 3v5\"/>", "helicopter")
export const IconSubmarine = makeIcon("<path d=\"M2 12h20M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4M6 16v3M18 16v3M12 8V4M10 6h4M8 12h.01M16 12h.01\"/>", "submarine")
export const IconCloudSun2 = makeIcon("<path d=\"M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41\"/><path d=\"M15.947 12.65a4 4 0 0 0-5.925-4.128\"/><path d=\"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z\"/>", "cloud-sun-2")
export const IconFog = makeIcon("<path d=\"M4 10h16M4 14h16M4 18h16M6 6h12\"/>", "fog")
export const IconHail = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><circle cx=\"8\" cy=\"20\" r=\"1\"/><circle cx=\"12\" cy=\"21\" r=\"1\"/><circle cx=\"16\" cy=\"20\" r=\"1\"/>", "hail")
export const IconCloudHail = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><circle cx=\"8\" cy=\"20\" r=\"1\"/><circle cx=\"12\" cy=\"21\" r=\"1\"/><circle cx=\"16\" cy=\"20\" r=\"1\"/>", "cloud-hail")
export const IconTornado = makeIcon("<path d=\"M2 4h20M4 8h16M6 12h12M8 16h8M10 20h4\"/>", "tornado")
export const IconEgg = makeIcon("<path d=\"M12 2c-4 0-8 6-8 12a8 8 0 1 0 16 0c0-6-4-12-8-12z\"/>", "egg")
export const IconSandwich = makeIcon("<path d=\"M2 8h20M2 12h20M2 16h20M2 8l2-4h16l2 4M4 16v2h16v-2\"/>", "sandwich")
export const IconSalad = makeIcon("<path d=\"M2 12a10 10 0 0 1 20 0z M12 12V8M8 10l2 2M16 10l-2 2M12 22v-8\"/>", "salad")
export const IconSoup = makeIcon("<path d=\"M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9zM12 3v6M8 5v4M16 5v4M6 22h12\"/>", "soup")
export const IconChopsticks = makeIcon("<path d=\"M6 3l12 18M3 6l15 15M4 3l2 2M8 6l2 2\"/>", "chopsticks")
export const IconShirt = makeIcon("<path d=\"M20 4l-4-2-4 2-4-2-4 2v5h3v13h10V9h3z\"/>", "shirt")
export const IconShoe = makeIcon("<path d=\"M2 18h20v-3l-6-3-4-2H8L4 13zM6 18v2M18 18v2\"/>", "shoe")
export const IconWatch2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M9 6V2h6v4M9 18v4h6v-4M12 10v2l1 1\"/>", "watch2")
export const IconGlasses = makeIcon("<circle cx=\"6\" cy=\"12\" r=\"4\"/><circle cx=\"18\" cy=\"12\" r=\"4\"/><path d=\"M10 12h4M2 12h.5M21.5 12h.5M6 8L4 6M18 8l2-2\"/>", "glasses")
export const IconElephant = makeIcon("<path d=\"M6 14v6a2 2 0 0 0 4 0v-2h4v2a2 2 0 0 0 4 0v-6a4 4 0 0 0-4-4M6 14v-4a4 4 0 0 1 4-4M18 10h-2M10 4a2 2 0 1 1 4 0M9 12h.01M15 12h.01\"/>", "elephant")
export const IconTurtle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M4 12a8 8 0 0 1 16 0M12 4v16M4 12h16M2 22h20M6 20v2M18 20v2\"/>", "turtle")
export const IconButterfly = makeIcon("<path d=\"M12 12c-3-4-6-4-8-2s0 8 4 8c3 0 4-3 4-6M12 12c3-4 6-4 8-2s0 8-4 8c-3 0-4-3-4-6M12 12V4M10 4h4\"/>", "butterfly")
export const IconSpider = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 9V4M12 15v5M9 12H4M15 12h5M9.5 9.5L5 5M14.5 9.5L19 5M9.5 14.5L5 19M14.5 14.5L19 19\"/>", "spider")
export const IconShieldCheck = makeIcon("<path d=\"M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM9 12l2 2 4-4\"/>", "shield-check")
export const IconShieldAlert = makeIcon("<path d=\"M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM12 8v4M12 15h.01\"/>", "shield-alert")
export const IconShieldX = makeIcon("<path d=\"M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM9 9l6 6M15 9l-6 6\"/>", "shield-x")
export const IconShieldPlus = makeIcon("<path d=\"M12 3l8 3v6a10 10 0 0 1-8 9 10 10 0 0 1-8-9V6zM9 12h6M12 9v6\"/>", "shield-plus")
export const IconCastle = makeIcon("<path d=\"M22 20H2V8l4-4v4h4V4l4-2 4 2v4h4V4l4 4zM6 20v-4h4v4M14 20v-4h4v4M10 12h4\"/>", "castle")
export const IconBridge = makeIcon("<path d=\"M2 12h20M4 12v8M20 12v8M12 12v8M2 12a10 10 0 0 1 20 0M6 8v4M18 8v4\"/>", "bridge")
export const IconSidebar = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"18\" rx=\"1\"/><path d=\"M9 3v18M5 8h2M5 12h2M5 16h2\"/>", "sidebar")
export const IconSidebarRight = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"18\" rx=\"1\"/><path d=\"M15 3v18M17 8h2M17 12h2M17 16h2\"/>", "sidebar-right")
export const IconSidebarLeft = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"18\" rx=\"1\"/><path d=\"M7 3v18M5 8h.01M5 12h.01M5 16h.01\"/>", "sidebar-left")
export const IconPanelTop = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 9h18\"/>", "panel-top")
export const IconPanelBottom = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 15h18\"/>", "panel-bottom")
export const IconPanelLeft = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M9 3v18\"/>", "panel-left")
export const IconPanelRight = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M15 3v18\"/>", "panel-right")
export const IconMaximize = makeIcon("<path d=\"M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3\"/>", "maximize")
export const IconMinimize = makeIcon("<path d=\"M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3\"/>", "minimize")
export const IconToggleLeft = makeIcon("<rect x=\"2\" y=\"7\" width=\"20\" height=\"10\" rx=\"5\"/><circle cx=\"7\" cy=\"12\" r=\"3\"/>", "toggle-left")
export const IconToggleRight = makeIcon("<rect x=\"2\" y=\"7\" width=\"20\" height=\"10\" rx=\"5\"/><circle cx=\"17\" cy=\"12\" r=\"3\"/>", "toggle-right")
export const IconCheckbox = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/>", "checkbox")
export const IconCheckboxChecked = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><path d=\"M8 12l3 3 5-6\"/>", "checkbox-checked")
export const IconRadioButton = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/>", "radio-button")
export const IconRadioButtonChecked = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/>", "radio-button-checked")
export const IconSwitchOn = makeIcon("<rect x=\"2\" y=\"7\" width=\"20\" height=\"10\" rx=\"5\"/><circle cx=\"17\" cy=\"12\" r=\"3\" fill=\"currentColor\"/>", "switch-on")
export const IconSwitchOff = makeIcon("<rect x=\"2\" y=\"7\" width=\"20\" height=\"10\" rx=\"5\"/><circle cx=\"7\" cy=\"12\" r=\"3\"/>", "switch-off")
export const IconStarHalf = makeIcon("<path d=\"M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/><path d=\"M12 2v17\"/>", "star-half")
export const IconStarOff = makeIcon("<path d=\"M2 2l20 20M12 6l3 3 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\"/>", "star-off")
export const IconHeartCrack = makeIcon("<path d=\"M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11zM12 5v4l-2 2 3 2-2 3\"/>", "heart-crack")
export const IconViolin = makeIcon("<path d=\"M12 22c-3 0-5-2-5-5l3-9c0-1 0-2 1-2s1 1 1 2l2 6 2-6c0-1 0-2 1-2s1 1 1 2l3 9c0 3-2 5-5 5zM9 18l6-2M12 6v2M10 4h4\"/>", "violin")
export const IconCello = makeIcon("<path d=\"M9 22c-2 0-3-1-3-3l2-10c0-1 0-2 1-2s1 1 1 2v2h2V9c0-1 0-2 1-2s1 1 1 2l2 10c0 2-1 3-3 3zM12 2v5M10 4h4\"/>", "cello")
export const IconDoubleBass = makeIcon("<path d=\"M7 22c-3 0-4-2-3-5l3-11c0-1 1-2 2-1s1 1 1 2l-1 4h2l3-6c1-1 2-1 3 0s0 2 0 3l-5 12c-1 2-3 2-5 2zM11 4l3-2M14 2l3 2\"/>", "double-bass")
export const IconBanjo = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"8\"/><circle cx=\"12\" cy=\"14\" r=\"3\"/><path d=\"M12 6V2M10 2h4M18 10l3-3M6 10L3 7\"/>", "banjo")
export const IconMandolin = makeIcon("<path d=\"M12 22c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7z\"/><circle cx=\"12\" cy=\"15\" r=\"2\"/><path d=\"M12 8V2M10 2h4\"/>", "mandolin")
export const IconHarp = makeIcon("<path d=\"M5 21h14M5 21c0-8 2-16 7-19M19 21c0-8-2-16-7-19M9 21v-4M12 21v-5M15 21v-4M8 12l8 0M9 8h6\"/>", "harp")
export const IconFlute = makeIcon("<path d=\"M3 12h18M3 10l18 4M5 12v4M9 13v4M13 14v4M17 15v4\"/>", "flute")
export const IconClarinet = makeIcon("<path d=\"M10 2l3 1v17l-3 1zM13 5h2M13 9h2M13 13h2M13 17h2\"/>", "clarinet")
export const IconSaxophone = makeIcon("<path d=\"M8 4c0-1 1-2 3-2M8 4v10c0 5 3 8 7 8s7-3 7-7M11 2l-2 4M15 22l2-4\"/>", "saxophone")
export const IconTrumpet = makeIcon("<path d=\"M3 9h14l4-2v8l-4-2H3zM3 9v4M7 9v4M11 9v4M15 9v4M21 11h1\"/>", "trumpet")
export const IconTrombone = makeIcon("<path d=\"M3 12h10l4 4-2 2-4-4H3zM3 10v4M13 12l6-6 2 2-4 4\"/>", "trombone")
export const IconTuba = makeIcon("<path d=\"M8 4a6 6 0 0 0-2 12c1 2 3 4 6 4s5-2 6-4a6 6 0 0 0-2-12zM12 4v6M10 4h4M18 10h3\"/>", "tuba")
export const IconFrenchHorn = makeIcon("<path d=\"M12 20a8 8 0 0 1-8-8c0-3 1-5 3-6M12 20a8 8 0 0 0 8-8M4 6c2-2 5-3 8-3s6 1 8 3M12 6c2 0 4 1 5 3M8 9h.01\"/>", "french-horn")
export const IconAccordion = makeIcon("<path d=\"M4 6h6l2 2 2-2h6v12H4zM10 6l-2 12M14 6l2 12M7 9h.01M7 12h.01M7 15h.01M17 9h.01M17 12h.01M17 15h.01\"/>", "accordion")
export const IconHarmonica = makeIcon("<rect x=\"2\" y=\"9\" width=\"20\" height=\"6\" rx=\"1\"/><path d=\"M5 9v6M8 9v6M11 9v6M14 9v6M17 9v6M20 9v6\"/>", "harmonica")
export const IconXylophone = makeIcon("<path d=\"M3 6h18M3 9h18M3 12h18M3 15h18M5 6v9M9 6v9M13 6v9M17 6v9M21 6v9\"/>", "xylophone")
export const IconMarimba = makeIcon("<path d=\"M3 8h18M3 12h18M3 16h18M3 20h18M5 8v12M9 8v12M13 8v12M17 8v12M21 8v12\"/>", "marimba")
export const IconTimpani = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"8\"/><path d=\"M4 14h16M6 20v2M18 20v2M3 6l2 3M21 6l-2 3\"/>", "timpani")
export const IconCymbal = makeIcon("<path d=\"M3 12c3-5 15-5 18 0M3 12c3 5 15 5 18 0M12 12v9M9 21h6\"/>", "cymbal")
export const IconGong = makeIcon("<circle cx=\"12\" cy=\"11\" r=\"9\"/><path d=\"M12 20v2M4 11a8 8 0 0 1 16 0M12 3v3\"/>", "gong")
export const IconBongo = makeIcon("<path d=\"M4 12a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0zM12 12a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0zM4 20h16\"/>", "bongo")
export const IconConga = makeIcon("<path d=\"M5 4a7 7 0 0 0 14 0v16a7 7 0 0 1-14 0zM5 12a7 7 0 0 0 14 0\"/>", "conga")
export const IconTambourine = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M6 6l.5.5M18 6l-.5.5M6 18l.5-.5M18 18l-.5-.5M2 12h2M20 12h2M12 2v2M12 20v2\"/>", "tambourine")
export const IconMetronome = makeIcon("<path d=\"M12 2l-6 18h12zM9 12l6 6M15 12l-6 6M8 20h8\"/>", "metronome")
export const IconTuningFork = makeIcon("<path d=\"M10 2v10a2 2 0 0 0 4 0V2M8 2h4M12 2h4M12 14v6M10 22h4\"/>", "tuning-fork")
export const IconMusicStand = makeIcon("<path d=\"M4 4l16 16M4 20L12 8M20 4L12 16M8 4h8M10 8h4\"/>", "music-stand")
export const IconAmp = makeIcon("<rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2\"/><circle cx=\"12\" cy=\"14\" r=\"4\"/><path d=\"M6 9h.01M18 9h.01M8 17h.01M16 17h.01\"/>", "amp")
export const IconMixer = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M7 6v4M12 6v7M17 6v2M5 12h4M10 15h4M15 10h4\"/>", "mixer")
export const IconMidiKeyboard = makeIcon("<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"1\"/><path d=\"M5 5v8M8 5v8M11 5v8M14 5v8M17 5v8M20 5v8M2 13h20\"/>", "midi-keyboard")
export const IconBeaker = makeIcon("<path d=\"M5 3h14l-4 8v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8zM8 14h8\"/>", "beaker")
export const IconFlaskRound = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"7\"/><path d=\"M9 2h6v5l3 6a7 7 0 0 1-12 0l3-6zM9 6h6\"/>", "flask-round")
export const IconFlaskFlat = makeIcon("<path d=\"M6 2h12v9l3 8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l3-8zM4 15h16M10 2v8\"/>", "flask-flat")
export const IconBurette = makeIcon("<path d=\"M10 2v16l-3 3M14 2v16l3 3M10 2h4M9 10h6M12 22v1\"/>", "burette")
export const IconPipetteChem = makeIcon("<path d=\"M10 2h4v9l1 2v5a3 3 0 0 1-6 0v-5l1-2zM10 6h4\"/>", "pipette-chem")
export const IconGraduatedCylinder = makeIcon("<path d=\"M8 2v18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M8 2h8M10 6h4M10 10h4M10 14h4M10 18h4\"/>", "graduated-cylinder")
export const IconTestTubeRack = makeIcon("<rect x=\"3\" y=\"14\" width=\"18\" height=\"6\" rx=\"1\"/><path d=\"M7 14V3M12 14V3M17 14V3M6 3h2M11 3h2M16 3h2\"/>", "test-tube-rack")
export const IconMolecule = makeIcon("<circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"12\" cy=\"18\" r=\"3\"/><path d=\"M8 8l3 7M16 8l-3 7M9 6h6\"/>", "molecule")
export const IconAtom2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9M3 12c0-3 4-5 9-5s9 2 9 5M3 12c0 3 4 5 9 5s9-2 9-5\"/>", "atom-2")
export const IconBond = makeIcon("<circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"12\" r=\"3\"/><path d=\"M9 12h6\"/>", "bond")
export const IconCompound = makeIcon("<circle cx=\"8\" cy=\"8\" r=\"3\"/><circle cx=\"16\" cy=\"8\" r=\"3\"/><circle cx=\"12\" cy=\"16\" r=\"3\"/><path d=\"M11 10l2 4M13 10l-2 4M11 8h4\"/>", "compound")
export const IconElement = makeIcon("<path d=\"M12 2l8 5v10l-8 5-8-5V7zM12 6v12M8 9l8 6M16 9l-8 6\"/>", "element")
export const IconIsotope = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>", "isotope")
export const IconElectron = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 12l5-4\"/>", "electron")
export const IconProton = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M10 10h4v4h-4z\"/>", "proton")
export const IconNeutron = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/>", "neutron")
export const IconBenzeneRing = makeIcon("<path d=\"M12 3l9 5v8l-9 5-9-5V8zM12 7l5 3v4l-5 3-5-3v-4z\"/>", "benzene-ring")
export const IconEthanol = makeIcon("<path d=\"M8 4h8v6l4 4v6H4v-6l4-4zM8 10h8\"/>", "ethanol")
export const IconBenzene = makeIcon("<circle cx=\"12\" cy=\"4\" r=\"2\"/><circle cx=\"19\" cy=\"8\" r=\"2\"/><circle cx=\"19\" cy=\"16\" r=\"2\"/><circle cx=\"12\" cy=\"20\" r=\"2\"/><circle cx=\"5\" cy=\"16\" r=\"2\"/><circle cx=\"5\" cy=\"8\" r=\"2\"/><path d=\"M13 5l6 3M20 9v6M18 17l-6 3M11 19l-6-3M4 15V9M6 7l6-3\"/>", "benzene")
export const IconMethane = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M9 10L5 6M15 10l4-4M9 14l-4 4M15 14l4 4\"/>", "methane")
export const IconPropane = makeIcon("<circle cx=\"6\" cy=\"8\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"18\" cy=\"8\" r=\"2\"/><path d=\"M8 8l3 3M16 8l-3 3M5 6v-2M7 6v-2M11 10v-2M13 10v-2M17 6v-2M19 6v-2\"/>", "propane")
export const IconPeriodicTable = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"18\" rx=\"1\"/><path d=\"M2 7h20M2 11h20M2 15h20M2 19h20M6 3v18M10 3v18M14 3v18M18 3v18\"/>", "periodic-table")
export const IconCatalyst = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M3 12h5M16 12h5M12 3v5M12 16v5\"/>", "catalyst")
export const IconSolution = makeIcon("<path d=\"M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 14c2-1 4 1 6 0s4 1 6 0 2-1 4-1\"/>", "solution")
export const IconSolvent = makeIcon("<path d=\"M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 12h16M4 16h16\"/>", "solvent")
export const IconAcid = makeIcon("<path d=\"M5 4h14l-2 8v8H7v-8zM9 8h6M12 2v2\"/>", "acid")
export const IconBase = makeIcon("<path d=\"M5 20h14l-2-8V4H7v8zM9 12h6M12 2v2\"/>", "base")
export const IconPhScale = makeIcon("<rect x=\"2\" y=\"8\" width=\"20\" height=\"8\" rx=\"1\"/><path d=\"M2 8h20M6 8v8M10 8v8M14 8v8M18 8v8\"/>", "ph-scale")
export const IconCrucible = makeIcon("<path d=\"M5 6h14v4a8 8 0 0 1-14 0zM3 6h18M9 22h6M12 18v4\"/>", "crucible")
export const IconTongs = makeIcon("<path d=\"M8 2v10a4 4 0 0 0 8 0V2M8 2h3M13 2h3M12 16v6\"/>", "tongs")
export const IconBunsenBurner = makeIcon("<path d=\"M12 4a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2zM10 8v4h4V8M12 12v6M8 18h8M6 22h12\"/>", "bunsen-burner")
export const IconDistillation = makeIcon("<path d=\"M4 6a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0zM8 8h6l6 8-2 4-6-6M14 20h6\"/>", "distillation")
export const IconCentrifuge = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 3v3M12 18v3M3 12h3M18 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2\"/>", "centrifuge")
export const IconComet = makeIcon("<circle cx=\"6\" cy=\"6\" r=\"3\"/><path d=\"M4 8l-3 3M8 4l1-2M2 6h-1M8 9l8 8M14 6l8 2M6 16l2 8\"/>", "comet")
export const IconMeteor = makeIcon("<path d=\"M3 3l6 6M6 2l4 4M2 6l4 4\"/><circle cx=\"18\" cy=\"18\" r=\"3\"/>", "meteor")
export const IconMeteorite = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M9 9l2 2M14 10l1 1M11 15h.01M15 14l2-2M3 3l3 3M18 3l3 3\"/>", "meteorite")
export const IconAsteroid = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M8 8h.01M15 10h.01M10 14h.01M16 14h.01M12 5v2M12 17v2\"/>", "asteroid")
export const IconGalaxy = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 6a6 6 0 0 1 6 6M12 18a6 6 0 0 1-6-6M6 12c0-3 3-6 6-6M18 12c0 3-3 6-6 6M3 12c0 5 4 9 9 9M21 12c0-5-4-9-9-9\"/>", "galaxy")
export const IconNebula = makeIcon("<circle cx=\"10\" cy=\"10\" r=\"4\"/><circle cx=\"16\" cy=\"16\" r=\"4\"/><circle cx=\"12\" cy=\"8\" r=\"2\"/><circle cx=\"8\" cy=\"16\" r=\"2\"/><circle cx=\"18\" cy=\"10\" r=\"1\"/><circle cx=\"4\" cy=\"12\" r=\"1\"/>", "nebula")
export const IconConstellation = makeIcon("<circle cx=\"4\" cy=\"8\" r=\"1\"/><circle cx=\"10\" cy=\"5\" r=\"1\"/><circle cx=\"16\" cy=\"10\" r=\"1\"/><circle cx=\"20\" cy=\"6\" r=\"1\"/><circle cx=\"8\" cy=\"16\" r=\"1\"/><circle cx=\"14\" cy=\"18\" r=\"1\"/><circle cx=\"20\" cy=\"16\" r=\"1\"/><path d=\"M4 8l6-3M10 5l6 5M16 10l4-4M4 8l4 8M8 16l6 2M14 18l6-2M16 10l4 6\"/>", "constellation")
export const IconBlackHole = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M3 12h18M12 3v18M5.5 5.5l13 13M5.5 18.5l13-13\"/>", "black-hole")
export const IconSupernova = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3\"/>", "supernova")
export const IconQuasar = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 3v6M12 15v6M3 12h6M15 12h6M3 3l4 4M17 17l4 4M3 21l4-4M17 7l4-4\"/>", "quasar")
export const IconPulsar = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 3v4M12 17v4M3 12h4M17 12h4M12 2l3 5M12 22l-3-5\"/>", "pulsar")
export const IconSolarSystem = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"6\" r=\"1\"/><circle cx=\"18\" cy=\"12\" r=\"1\"/><circle cx=\"12\" cy=\"18\" r=\"1\"/><circle cx=\"6\" cy=\"12\" r=\"1\"/><path d=\"M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18\"/>", "solar-system")
export const IconSun2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1\"/>", "sun-2")
export const IconMoonCrescent = makeIcon("<path d=\"M18 12A9 9 0 0 1 9 21a9 9 0 1 0 0-18 9 9 0 0 1 9 9z\"/>", "moon-crescent")
export const IconMoonFull = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"9\" cy=\"10\" r=\"2\"/><circle cx=\"15\" cy=\"14\" r=\"2\"/><circle cx=\"13\" cy=\"7\" r=\"1\"/><circle cx=\"11\" cy=\"15\" r=\"1\"/>", "moon-full")
export const IconMoonPhase1 = makeIcon("<path d=\"M12 3a9 9 0 1 0 0 18 6 9 0 0 1 0-18z\"/>", "moon-phase-1")
export const IconMoonPhase2 = makeIcon("<path d=\"M12 3a9 9 0 1 0 0 18 3 9 0 0 1 0-18z\"/>", "moon-phase-2")
export const IconMoonPhase3 = makeIcon("<path d=\"M12 3a9 9 0 1 0 0 18z\"/>", "moon-phase-3")
export const IconMoonPhase4 = makeIcon("<path d=\"M12 3a9 9 0 1 1 0 18 3 9 0 0 0 0-18z\"/>", "moon-phase-4")
export const IconMoonPhase5 = makeIcon("<path d=\"M12 3a9 9 0 1 1 0 18 6 9 0 0 0 0-18z\"/>", "moon-phase-5")
export const IconPlanetMercury = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M8 8L4 4M16 8l4-4M12 8V4\"/>", "planet-mercury")
export const IconPlanetVenus = makeIcon("<circle cx=\"12\" cy=\"10\" r=\"4\"/><path d=\"M12 14v6M9 18h6\"/>", "planet-venus")
export const IconPlanetMars = makeIcon("<circle cx=\"13\" cy=\"11\" r=\"4\"/><path d=\"M16 8l4-4M16 4h4v4\"/>", "planet-mars")
export const IconPlanetJupiter = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M9 9h6M9 12h6M10 15h5M6 11c-2 0-3 1-3 1s1 1 3 1\"/>", "planet-jupiter")
export const IconPlanetSaturn = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M4 14l16-4M6 16l14-4M18 8l4-2\"/>", "planet-saturn")
export const IconPlanetUranus = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M9 7v10M12 7v10M15 7v10M10 4h4\"/>", "planet-uranus")
export const IconPlanetNeptune = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M9 8l3 8 3-8\"/>", "planet-neptune")
export const IconStarCluster = makeIcon("<circle cx=\"6\" cy=\"6\" r=\"1.5\"/><circle cx=\"12\" cy=\"4\" r=\"1.5\"/><circle cx=\"18\" cy=\"6\" r=\"1.5\"/><circle cx=\"4\" cy=\"12\" r=\"1.5\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"20\" cy=\"12\" r=\"1.5\"/><circle cx=\"6\" cy=\"18\" r=\"1.5\"/><circle cx=\"12\" cy=\"20\" r=\"1.5\"/><circle cx=\"18\" cy=\"18\" r=\"1.5\"/>", "star-cluster")
export const IconOrion = makeIcon("<circle cx=\"8\" cy=\"5\" r=\"1\"/><circle cx=\"14\" cy=\"5\" r=\"1\"/><circle cx=\"11\" cy=\"10\" r=\"1\"/><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"11\" cy=\"13\" r=\"1\"/><circle cx=\"13\" cy=\"14\" r=\"1\"/><circle cx=\"11\" cy=\"19\" r=\"1\"/><circle cx=\"9\" cy=\"20\" r=\"1\"/>", "orion")
export const IconBigDipper = makeIcon("<circle cx=\"4\" cy=\"6\" r=\"1\"/><circle cx=\"7\" cy=\"6\" r=\"1\"/><circle cx=\"10\" cy=\"7\" r=\"1\"/><circle cx=\"13\" cy=\"8\" r=\"1\"/><circle cx=\"15\" cy=\"11\" r=\"1\"/><circle cx=\"16\" cy=\"15\" r=\"1\"/><circle cx=\"18\" cy=\"17\" r=\"1\"/>", "big-dipper")
export const IconNorthStar = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/><path d=\"M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6\"/>", "north-star")
export const IconShootingStar = makeIcon("<path d=\"M3 3l8 8M6 2l5 5M2 6l5 5\"/><path d=\"M14 14l6 6M16 12l5 5M12 16l5 5\"/>", "shooting-star")
export const IconEclipse = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"15\" cy=\"12\" r=\"8\"/><circle cx=\"16\" cy=\"9\" r=\"1\"/>", "eclipse")
export const IconSolarEclipse = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5\"/>", "solar-eclipse")
export const IconLunarEclipse = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3v18M3 12h18\"/>", "lunar-eclipse")
export const IconObservatory = makeIcon("<path d=\"M3 21h18v-2H3zM6 19l6-12 6 12M9 13h6M12 4l-4 6M12 4l4 6\"/>", "observatory")
export const IconTelescope2 = makeIcon("<path d=\"M4 20l6-8M2 14l8 6-2 2-8-6zM12 12l9-9 1 1-9 9zM3 21h12M21 21h-3M16 3l5 5\"/>", "telescope-2")
export const IconSatellite2 = makeIcon("<path d=\"M5 5l4 4-4 4-4-4zM15 15l4 4-4 4-4-4zM9 9l6 6M17 3l4 4M3 17l4 4M12 2v3M22 12h-3\"/>", "satellite-2")
export const IconSpaceStation = makeIcon("<path d=\"M4 12h16M6 8v8M18 8v8M12 4v16M8 4h8M8 20h8M2 12h2M20 12h2\"/>", "space-station")
export const IconAstronaut = makeIcon("<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M8 12h8v8H8zM10 16h4M6 14h2M16 14h2M9 20v2M15 20v2\"/>", "astronaut")
export const IconSpacesuit = makeIcon("<circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M8 11h8v9H8zM8 13l-3 3M16 13l3 3M10 15h4M9 20v2M15 20v2M12 20v2\"/>", "spacesuit")
export const IconRocket2 = makeIcon("<path d=\"M12 2c3 3 4 7 4 11v5l-2 2h-4l-2-2v-5c0-4 1-8 4-11zM10 15l-2 3-2 1 1-3M14 15l2 3 2 1-1-3M12 8v4\"/>", "rocket-2")
export const IconUfo = makeIcon("<path d=\"M4 12c0-2 4-3 8-3s8 1 8 3-4 4-8 4-8-2-8-4zM8 12c0-1 2-2 4-2s4 1 4 2M12 9V6M9 6h6M6 15l-2 3M18 15l2 3\"/>", "ufo")
export const IconAlien = makeIcon("<circle cx=\"12\" cy=\"10\" r=\"5\"/><circle cx=\"9\" cy=\"9\" r=\"1\"/><circle cx=\"15\" cy=\"9\" r=\"1\"/><path d=\"M10 13h4M12 15v3M9 21l-1-3M15 21l1-3M12 18v3\"/>", "alien")
export const IconAurora = makeIcon("<path d=\"M2 20c3-1 5-4 5-8s2-6 5-6 5 2 5 6 2 7 5 8M2 22h20\"/>", "aurora")
export const IconScalpel = makeIcon("<path d=\"M14 4l6 6-4 4-8-2-6 6v2h2l6-6 2 8 4-4-2-8 2-2z\"/>", "scalpel")
export const IconForceps = makeIcon("<path d=\"M6 3l4 8-2 10-2-2zM18 3l-4 8 2 10 2-2zM9 8h6\"/>", "forceps")
export const IconIvDrip = makeIcon("<path d=\"M8 2h8v6H8zM12 8v4M10 12h4v8a2 2 0 0 1-4 0zM5 4v6a3 3 0 0 0 3 3\"/>", "iv-drip")
export const IconDefibrillator = makeIcon("<rect x=\"3\" y=\"7\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M12 10v6M9 13h6M7 19v3M17 19v3M12 4v3\"/>", "defibrillator")
export const IconMri = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"14\" rx=\"2\"/><circle cx=\"12\" cy=\"13\" r=\"5\"/><circle cx=\"12\" cy=\"13\" r=\"2\"/><path d=\"M6 4v2M18 4v2M4 11h2M18 11h2\"/>", "mri")
export const IconCtScan = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"14\" rx=\"2\"/><circle cx=\"12\" cy=\"13\" r=\"5\"/><path d=\"M6 10h12M6 13h12M6 16h12\"/>", "ct-scan")
export const IconXRay = makeIcon("<path d=\"M4 4v16h16V4zM8 8h8M8 12h8M8 16h8M12 8v8\"/>", "x-ray")
export const IconUltrasound = makeIcon("<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M6 8c2 0 3 2 3 4s-1 4-3 4M12 8c2 0 3 2 3 4s-1 4-3 4M18 8c1 0 2 2 2 4s-1 4-2 4\"/>", "ultrasound")
export const IconThermometerMed = makeIcon("<path d=\"M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8\"/>", "thermometer-med")
export const IconBloodPressure = makeIcon("<rect x=\"4\" y=\"4\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M18 9l4-1v2l-4 1M6 18l-2 4M20 18l2 4M10 14v2M14 14v2\"/>", "blood-pressure")
export const IconStethoscope2 = makeIcon("<path d=\"M6 3v6a4 4 0 0 0 8 0V3M6 12a6 6 0 0 0 12 0v-3\"/><circle cx=\"19\" cy=\"10\" r=\"2\"/>", "stethoscope-2")
export const IconOtoscope = makeIcon("<path d=\"M5 4l2-2 5 5-2 2zM10 9l3 3-2 6 4 4M17 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0z\"/>", "otoscope")
export const IconSyringe2 = makeIcon("<path d=\"M18 2l4 4M17 3l4 4M14 6l4 4-8 8-4-4zM10 14l-6 6v2h2l6-6M13 9l2 2\"/>", "syringe-2")
export const IconVial = makeIcon("<path d=\"M9 2h6v3l1 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7l1-2zM9 5h6M9 12h6\"/>", "vial")
export const IconCapsule = makeIcon("<path d=\"M6 6a6 6 0 0 1 12 0v12a6 6 0 0 1-12 0zM6 12h12M8 5a4 4 0 0 1 8 0\"/>", "capsule")
export const IconTabletMed = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M5 12h14\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/>", "tablet-med")
export const IconSyrup = makeIcon("<path d=\"M8 4h8v3H8zM9 7v11a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7M8 14h8M11 2h2v2\"/>", "syrup")
export const IconOintment = makeIcon("<path d=\"M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM7 12V8h10v4M9 4h6v4H9z\"/>", "ointment")
export const IconBandage2 = makeIcon("<path d=\"M6 6l12 12a3 3 0 0 0 4-4L10 2a3 3 0 0 0-4 4zM4 18l14-14\"/><circle cx=\"10\" cy=\"10\" r=\"1\"/><circle cx=\"14\" cy=\"14\" r=\"1\"/>", "bandage-2")
export const IconCrutch = makeIcon("<path d=\"M9 3h6v6l-3 3-3-3zM12 12v10M8 22h8M9 6v3M15 6v3\"/>", "crutch")
export const IconWheelchair2 = makeIcon("<circle cx=\"10\" cy=\"4\" r=\"1.5\"/><path d=\"M10 6v6h6l3 8M10 12l-3 3v4M6 22a5 5 0 1 0 0-10M19 14a5 5 0 1 1-5-5\"/>", "wheelchair-2")
export const IconHospitalBed = makeIcon("<path d=\"M2 18v-8a2 2 0 0 1 2-2h12a4 4 0 0 1 4 4v6M2 20v-2M22 20v-2M2 18h20M6 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z\"/>", "hospital-bed")
export const IconAmbulance = makeIcon("<rect x=\"3\" y=\"8\" width=\"12\" height=\"9\" rx=\"1\"/><path d=\"M15 12h4l3 3v2h-7zM10 8V4h5v4M8 12v3M6 12v3\"/><circle cx=\"7\" cy=\"19\" r=\"2\"/><circle cx=\"17\" cy=\"19\" r=\"2\"/>", "ambulance")
export const IconScrubs = makeIcon("<path d=\"M9 3h6l-2 4v3l4 2v9H7v-9l4-2V7zM9 12h6M12 14v4M10 18h4\"/>", "scrubs")
export const IconMaskMedical = makeIcon("<path d=\"M4 8h16v8c0 2-4 4-8 4s-8-2-8-4zM4 12h16M9 8v8M15 8v8\"/>", "mask-medical")
export const IconGlovesMedical = makeIcon("<path d=\"M6 12V7a1 1 0 0 1 2 0v4M8 11V5a1 1 0 0 1 2 0v6M10 11V5a1 1 0 0 1 2 0v6M12 11V7a1 1 0 0 1 2 0v5M6 12v4a6 6 0 0 0 12 0v-4h-2v3M6 14h2\"/>", "gloves-medical")
export const IconGogglesMedical = makeIcon("<circle cx=\"8\" cy=\"12\" r=\"4\"/><circle cx=\"16\" cy=\"12\" r=\"4\"/><path d=\"M4 12H2M22 12h-2M12 12h-2M14 12h-2\"/>", "goggles-medical")
export const IconScalpel2 = makeIcon("<path d=\"M3 21l6-6M12 3l8 8-6 4-6-6zM14 11l-8 8\"/>", "scalpel-2")
export const IconSuture = makeIcon("<path d=\"M3 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M15 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M9 12h6\"/>", "suture")
export const IconPacemaker = makeIcon("<rect x=\"4\" y=\"8\" width=\"16\" height=\"10\" rx=\"3\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/><path d=\"M8 3v5M16 3v5\"/>", "pacemaker")
export const IconInsulinPen = makeIcon("<path d=\"M5 20l2-2h8l2 2zM8 18V6h6v12M9 6V3h4v3M10 9v2M10 13v2\"/>", "insulin-pen")
export const IconInhaler = makeIcon("<path d=\"M6 6h8v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3zM14 8h5M14 12h4M8 4h4v2H8z\"/>", "inhaler")
export const IconHearingAid = makeIcon("<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M12 12v8M9 20h6M16 6c2 0 4 2 4 4s-2 3-3 3\"/>", "hearing-aid")
export const IconBraces = makeIcon("<path d=\"M4 10c4-2 12-2 16 0M4 14c4 2 12 2 16 0M8 10v4M12 10v4M16 10v4\"/>", "braces")
export const IconSplint = makeIcon("<path d=\"M6 4v16M18 4v16M6 8h12M6 12h12M6 16h12\"/>", "splint")
export const IconShrimp = makeIcon("<path d=\"M12 4c-4 0-7 3-7 7s3 7 7 7h4l4 4v-4l-2-2M5 11a7 7 0 0 0 14 0M12 4V2M10 2h4M8 9h.01\"/>", "shrimp")
export const IconCrab = makeIcon("<circle cx=\"12\" cy=\"13\" r=\"6\"/><path d=\"M6 13L2 11l1-3 4 2M18 13l4-2-1-3-4 2M9 8L7 5M15 8l2-3M9 18l-2 3M15 18l2 3\"/><circle cx=\"10\" cy=\"11\" r=\"1\"/><circle cx=\"14\" cy=\"11\" r=\"1\"/>", "crab")
export const IconLobster = makeIcon("<path d=\"M12 4c-3 0-5 2-5 5v6a5 5 0 0 0 10 0V9c0-3-2-5-5-5zM9 15l-3 4M15 15l3 4M10 4l-2-2M14 4l2-2M8 10H3M16 10h5\"/>", "lobster")
export const IconOctopus = makeIcon("<circle cx=\"12\" cy=\"10\" r=\"6\"/><path d=\"M6 10v6a3 3 0 0 0 3 3M9 19a3 3 0 0 0 3 3M12 19a3 3 0 0 0 3 3M15 19a3 3 0 0 0 3-3v-6M9 8h.01M15 8h.01\"/>", "octopus")
export const IconSquid = makeIcon("<path d=\"M12 2c-3 0-5 3-5 7v8c0 2 1 3 2 3h6c1 0 2-1 2-3V9c0-4-2-7-5-7zM9 4L6 2M15 4l3-2M9 15l-2 5M12 15v6M15 15l2 5M10 8h.01M14 8h.01\"/>", "squid")
export const IconJellyfish = makeIcon("<path d=\"M12 3c-5 0-8 3-8 7 0 3 3 5 8 5s8-2 8-5c0-4-3-7-8-7zM6 15c0 3 1 4 1 6M10 15c0 2 0 4 0 6M14 15c0 2 0 4 0 6M18 15c0 3-1 4-1 6M9 9h.01M15 9h.01\"/>", "jellyfish")
export const IconWhale = makeIcon("<path d=\"M3 12c0-5 6-8 12-6 3 1 5 3 6 5v2c0 3-3 5-7 5-2 0-4-1-5-2-3 1-6 0-6-4zM18 10l-3 2 3 2M9 13c1 2 3 3 5 3\"/>", "whale")
export const IconDolphin = makeIcon("<path d=\"M4 20c4 0 8-2 10-5 2-3 2-6 0-9-1-2-3-3-5-3 0 0 1 2 0 4s-4 3-4 6 1 5 4 6c-2 1-4 1-5 1zM6 14l-3 1M8 10L5 8M12 8l-2-4\"/>", "dolphin")
export const IconSeahorse = makeIcon("<path d=\"M14 3c-2 0-3 2-3 4l-1 3c-2 2-3 4-3 7 0 3 2 5 4 5s4-2 4-5c0-2-1-4-2-5l1-3c1-1 3 0 3-2s-2-4-4-4zM7 20l-3 2M11 14h.01\"/>", "seahorse")
export const IconCoral = makeIcon("<path d=\"M12 22V10M12 10c0-3 2-5 4-5s3 2 3 4M12 10c0-2-1-4-3-4s-4 1-4 3M8 12c0 2-2 3-3 3M16 13c0 2 2 3 3 3M6 22h12\"/>", "coral")
export const IconCoral2 = makeIcon("<path d=\"M12 22V12M8 22V14c0-2-2-3-3-5M16 22V16c0-2 2-3 3-5M12 12c0-3-1-5-3-6M12 12c0-3 1-5 3-6M12 4v4\"/>", "coral-2")
export const IconShell = makeIcon("<path d=\"M12 3c-4 0-7 4-7 9 0 4 3 8 7 9 4-1 7-5 7-9 0-5-3-9-7-9zM12 3v18M6 10h12M5 15h14M8 6l8 12M16 6L8 18\"/>", "shell")
export const IconShell2 = makeIcon("<path d=\"M12 2C7 2 3 6 3 11c0 5 4 9 9 9s9-4 9-9c0-5-4-9-9-9zM12 2v18M7 8l10 8M17 8L7 16\"/>", "shell-2")
export const IconStarfish = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2l1.5 4.5h5L14 9.5l1.5 4.5-3.5-3-3.5 3L10 9.5 5.5 6.5h5zM12 7v6M9 12l-2 5M15 12l2 5\"/>", "starfish")
export const IconSeaUrchin = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5L19 19M5 19l2.5-2.5M16.5 7.5L19 5M9 4l1 3M15 4l-1 3M9 20l1-3M15 20l-1-3M4 9l3 1M4 15l3-1M20 9l-3 1M20 15l-3-1\"/>", "sea-urchin")
export const IconPlankton = makeIcon("<circle cx=\"6\" cy=\"6\" r=\"2\"/><circle cx=\"12\" cy=\"8\" r=\"2\"/><circle cx=\"18\" cy=\"6\" r=\"2\"/><circle cx=\"8\" cy=\"14\" r=\"2\"/><circle cx=\"14\" cy=\"16\" r=\"2\"/><circle cx=\"20\" cy=\"13\" r=\"2\"/><circle cx=\"4\" cy=\"18\" r=\"2\"/><circle cx=\"12\" cy=\"20\" r=\"2\"/>", "plankton")
export const IconAlgae = makeIcon("<path d=\"M4 22c0-6 0-12 4-16 2-2 5-3 6-2s0 4-2 6c-2 3-4 4-4 8M20 22c0-6 0-12-4-16-2-2-5-3-6-2s0 4 2 6c2 3 4 4 4 8M12 22V6\"/>", "algae")
export const IconKelp = makeIcon("<path d=\"M12 22V8M12 8c0-2-2-4-4-4s-2 2 0 4c1 1 2 2 4 2M12 8c0-2 2-4 4-4s2 2 0 4c-1 1-2 2-4 2M12 14c0-2-2-4-4-4s-2 2 0 4c1 1 2 2 4 2M12 14c0-2 2-4 4-4s2 2 0 4c-1 1-2 2-4 2\"/>", "kelp")
export const IconFish2 = makeIcon("<path d=\"M2 12c4-6 14-6 18 0-4 6-14 6-18 0zM18 12l4-3v6zM6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z\"/>", "fish-2")
export const IconFish3 = makeIcon("<path d=\"M12 6c-3 0-6 2-6 6s3 6 6 6 6-2 6-6-3-6-6-6zM18 12l4-2v4zM8 11h.01\"/>", "fish-3")
export const IconPufferFish = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"9\" cy=\"10\" r=\"2\"/><circle cx=\"15\" cy=\"10\" r=\"2\"/><path d=\"M12 4v-2M12 20v2M4 12H2M20 12h2M6 6L4 4M18 6l2-2M6 18l-2 2M18 18l2 2M12 14v2M10 16h4\"/>", "puffer-fish")
export const IconAnglerfish = makeIcon("<path d=\"M4 12c0-4 4-6 8-6 5 0 8 3 8 7 0 3-3 5-7 5-4 0-9-2-9-6zM16 10l3-1-2-2M12 16l-2 4M14 16l2 4M7 10h.01M11 9h.01\"/>", "anglerfish")
export const IconEel = makeIcon("<path d=\"M2 14c3-2 6 0 9 0s6 2 9 0c1-1 2-2 2-4M4 18c3-2 6 0 9 0M5 10c3-2 6 0 9 0M20 6l-2 2 2 2\"/>", "eel")
export const IconSeaTurtle = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M4 12a8 8 0 0 1 16 0M12 4v16M4 12h16M2 20h20M8 20l-1-2M16 20l1-2M6 22h2M16 22h2\"/>", "sea-turtle")
export const IconSeaSnake = makeIcon("<path d=\"M2 12c2 0 3 2 5 2s3-2 5-2 3 2 5 2 3-2 5-2M4 16c2 0 3 2 5 2s3-2 5-2 3 2 5 2M6 8c2 0 3 2 5 2s3-2 5-2 3 2 5 2M2 12l-2-2M22 12l2-2M22 16l2 2\"/>", "sea-snake")
export const IconSeaStar = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z\"/>", "sea-star")
export const IconSquirrel = makeIcon("<path d=\"M18 4c-2 0-3 2-3 4v2c0 1-1 2-3 2s-4 2-4 5 2 5 4 5 4-2 4-4c0-1 0-2-1-3 2 0 4-2 4-4V8c0-2-1-4-1-4zM8 22l1-2M14 22l-1-2M10 12h.01\"/>", "squirrel")
export const IconFox = makeIcon("<path d=\"M4 8l2-4 4 2h4l4-2 2 4c1 3 0 7-3 9-2 2-5 3-7 3s-5-1-7-3c-3-2-4-6-3-9zM8 12h.01M16 12h.01M10 16h4\"/>", "fox")
export const IconBear = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"10\" cy=\"11\" r=\"1\"/><circle cx=\"14\" cy=\"11\" r=\"1\"/><path d=\"M9 15h6M10 17h4M12 17v2\"/>", "bear")
export const IconPanda = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><path d=\"M8 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM12 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM9 15h6M12 15v3\"/>", "panda")
export const IconKoala = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"7\"/><circle cx=\"6\" cy=\"7\" r=\"3\"/><circle cx=\"18\" cy=\"7\" r=\"3\"/><circle cx=\"9\" cy=\"11\" r=\"1.5\"/><circle cx=\"15\" cy=\"11\" r=\"1.5\"/><path d=\"M12 14v3M11 16h2\"/>", "koala")
export const IconKangaroo = makeIcon("<path d=\"M6 22V10c0-3 2-6 5-6s5 2 6 5c1 4 0 8-2 11M8 20h8M7 14h4M11 8V4M9 4h4M5 18l-2 4M17 18l2 4\"/>", "kangaroo")
export const IconLion = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"7\"/><path d=\"M12 5V3M8 6L6 4M16 6l2-2M5 10H3M19 10h2M5 14l-2 1M19 14l2 1M8 18l-1 2M16 18l1 2M9 11h.01M15 11h.01M10 15h4\"/>", "lion")
export const IconTiger = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M4 4L6 6M20 4l-2 2M4 20l2-2M20 20l-2-2M9 9l-1-1M15 9l1-1M9 13l-1 1M15 13l1 1M9 11h.01M15 11h.01M10 16h4\"/>", "tiger")
export const IconGiraffe = makeIcon("<path d=\"M12 22V12c0-3 0-6 1-8s3-3 5-3 3 1 3 3-1 3-3 3-3 1-3 4v11zM8 12l-2-2M8 14l-2-1M8 16l-2 0M8 18l-2 1M8 20l-2 2M12 9h.01M18 6l.5-1M17 8l-1.5.5\"/>", "giraffe")
export const IconHippo = makeIcon("<path d=\"M4 12c0-4 3-6 8-6s8 2 8 6v6H4zM4 12H2M20 12h2M8 18v4M16 18v4M9 11h.01M15 11h.01M10 14h4\"/>", "hippo")
export const IconRhino = makeIcon("<path d=\"M6 20V14c0-4 3-7 7-7s6 2 7 5l-2 2-3-3M6 14H4c-1 0-2-1-2-2s1-2 2-2h1M20 12l3-1-1 3M9 20v2M15 20v2M9 9h.01M13 8h.01\"/>", "rhino")
export const IconZebra = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M6 6l1 2M10 5l1 2M14 5l1 2M18 6l-1 2M5 10l2 1M6 14l2 1M8 18l2-1M16 18l-2-1M18 14l-2 1M19 10l-2 1M9 11h.01M15 11h.01M10 16h4\"/>", "zebra")
export const IconMonkey = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"4\" cy=\"12\" r=\"3\"/><circle cx=\"20\" cy=\"12\" r=\"3\"/><circle cx=\"10\" cy=\"11\" r=\"1\"/><circle cx=\"14\" cy=\"11\" r=\"1\"/><path d=\"M12 14v3M10 15h4\"/>", "monkey")
export const IconGorilla = makeIcon("<circle cx=\"12\" cy=\"11\" r=\"8\"/><path d=\"M6 6a2 2 0 1 1 4 0M14 6a2 2 0 1 1 4 0M9 11h.01M15 11h.01M10 15h4M8 15l-1 2M16 15l1 2M12 19v3\"/>", "gorilla")
export const IconWolf = makeIcon("<path d=\"M4 6l2 4 6-2 6 2 2-4v8c0 4-4 6-8 6s-8-2-8-6zM8 13h.01M16 13h.01M10 16h4M12 16v2\"/>", "wolf")
export const IconDeer = makeIcon("<path d=\"M6 22v-6c0-3 2-6 6-6s6 3 6 6v6M8 10V6M16 10V6M8 6l-2-4M8 6l1-3M16 6l2-4M16 6l-1-3M10 20v2M14 20v2M10 11h.01M14 11h.01\"/>", "deer")
export const IconHamster = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"7\"/><circle cx=\"7\" cy=\"8\" r=\"3\"/><circle cx=\"17\" cy=\"8\" r=\"3\"/><circle cx=\"10\" cy=\"13\" r=\"1\"/><circle cx=\"14\" cy=\"13\" r=\"1\"/><path d=\"M10 16h4M12 16v2M9 20v2M15 20v2\"/>", "hamster")
export const IconHedgehog = makeIcon("<path d=\"M3 18c0-5 4-9 9-9s9 4 9 9M3 18h18M8 14l1-2M12 12l-1-3M16 14l1-2M6 17h.01M9 16h.01M12 15h.01M15 16h.01M18 17h.01\"/>", "hedgehog")
export const IconOtter = makeIcon("<path d=\"M12 20c-4 0-6-3-6-6 0-4 4-8 6-8s6 4 6 8c0 3-2 6-6 6zM8 12h.01M16 12h.01M10 15h4M12 15v2M6 20v2M18 20v2\"/>", "otter")
export const IconSeal = makeIcon("<path d=\"M12 4c-3 0-5 2-5 4l-2 3c-1 1-1 3 0 4s2 1 3 1h8c1 0 2 0 3-1s1-3 0-4l-2-3c0-2-2-4-5-4zM9 9h.01M15 9h.01M10 12h4M8 18l-2 3M16 18l2 3\"/>", "seal")
export const IconOwl = makeIcon("<circle cx=\"12\" cy=\"11\" r=\"8\"/><circle cx=\"9\" cy=\"10\" r=\"3\"/><circle cx=\"15\" cy=\"10\" r=\"3\"/><circle cx=\"9\" cy=\"10\" r=\"1\"/><circle cx=\"15\" cy=\"10\" r=\"1\"/><path d=\"M10 15l2 3 2-3M8 6l1-3M16 6l-1-3M5 8L3 6M19 8l2-2M6 18l-1 3M18 18l1 3\"/>", "owl")
export const IconEagle = makeIcon("<path d=\"M4 6c0-2 3-3 8-3s8 1 8 3c0 3-2 5-5 5l-3-2-3 2c-3 0-5-2-5-5zM12 10v6M9 22l3-6 3 6M6 12L2 10M18 12l4-2\"/>", "eagle")
export const IconDove = makeIcon("<path d=\"M3 12c0-3 3-5 6-5s6 2 6 5c0 2-1 4-3 5l-1 4-2-2-2 2-1-4c-2-1-3-3-3-5zM15 10l6-2-3-2M9 11h.01\"/>", "dove")
export const IconPenguin = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"10\" r=\"5\"/><path d=\"M9 9h.01M15 9h.01M12 12v3M10 14h4M8 18l-2 4M16 18l2 4M9 5l-1-2M15 5l1-2\"/>", "penguin")
export const IconChicken = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"6\"/><circle cx=\"14\" cy=\"7\" r=\"2\"/><path d=\"M16 7l3-1-2-2M12 8V6M9 12h.01M15 12h.01M11 16h2M10 20v2M14 20v2M8 14l-4-1M16 16l4 1\"/>", "chicken")
export const IconDuck = makeIcon("<circle cx=\"10\" cy=\"14\" r=\"5\"/><circle cx=\"14\" cy=\"8\" r=\"3\"/><path d=\"M17 7l4-1-2-2M8 13h.01M12 14v3M9 18h6M8 20v2M13 20v2\"/>", "duck")
export const IconRooster = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"6\"/><path d=\"M14 8l2-3 2 2 2-2-1 4M12 8l-2-3-2 2-2-2 1 4M9 12h.01M15 12h.01M10 16h4M12 16v3M8 20v2M16 20v2M8 14l-5-2M16 14l5-2\"/>", "rooster")
export const IconButterfly2 = makeIcon("<path d=\"M12 12c-3-4-6-4-8-2s0 8 4 8c3 0 4-3 4-6M12 12c3-4 6-4 8-2s0 8-4 8c-3 0-4-3-4-6M12 12V4M10 4h4\"/>", "butterfly2")
export const IconBee = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 7V3M9 4l1 3M15 4l-1 3M7 9h10M7 13h10M8 17h8M6 8l-4-2M18 8l4-2M7 14l-4 2M17 14l4 2\"/>", "bee")
export const IconAnt = makeIcon("<circle cx=\"6\" cy=\"16\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"18\" cy=\"8\" r=\"2\"/><path d=\"M7 15l4-2M13 11l4-2M5 14L3 12M7 18l-2 2M5 17l-3 0M15 10l2-2M19 6l2-2M17 7l2 0M9 11L7 9M15 13l2 2\"/>", "ant")
export const IconLadybug = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"7\"/><path d=\"M12 5v14M9 8h.01M15 8h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M12 5V3M10 3h4\"/>", "ladybug")
export const IconCaterpillar = makeIcon("<circle cx=\"4\" cy=\"16\" r=\"2\"/><circle cx=\"8\" cy=\"16\" r=\"2\"/><circle cx=\"12\" cy=\"16\" r=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"2\"/><circle cx=\"20\" cy=\"16\" r=\"2\"/><path d=\"M20 16V12M18 12h4M4 18v2M20 18v2\"/>", "caterpillar")
export const IconSnail = makeIcon("<path d=\"M8 20a8 8 0 0 1 8-14 6 6 0 0 1 6 6c0 4-4 8-8 8z\"/><path d=\"M14 12a3 3 0 1 0 0 6M16 8V4M14 4h4M4 20h16\"/>", "snail")
export const IconSlug = makeIcon("<path d=\"M4 16a6 6 0 0 1 12 0v2H4zM16 16c0-2 2-4 4-4v6h-4M8 14h.01M12 14h.01M6 12L4 8M10 12L8 8\"/>", "slug")
export const IconWorm = makeIcon("<path d=\"M3 14c3 0 3 4 6 4s3-4 6-4 3 4 6 4M6 14V8M12 18v4M18 14V6M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z\"/>", "worm")
export const IconDonut = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M5 8l1 1M19 8l-1 1M8 5l1 1M16 5l-1 1M5 16l1-1M19 16l-1-1M8 19l1-1M16 19l-1-1\"/>", "donut")
export const IconCroissant = makeIcon("<path d=\"M3 12c0-2 2-3 4-3M21 12c0-2-2-3-4-3M7 9c0-3 2-5 5-5s5 2 5 5M4 12c2 4 5 6 8 6s6-2 8-6M9 10c0-1 1-2 3-2s3 1 3 2M12 8v4\"/>", "croissant")
export const IconPretzel = makeIcon("<path d=\"M5 9a4 4 0 0 1 8 0v6a4 4 0 0 0 8 0v-6a4 4 0 0 0-8 0v6a4 4 0 0 1-8 0zM9 6h.01M15 6h.01M9 18h.01M15 18h.01\"/>", "pretzel")
export const IconBagel = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M8 5l2 1M16 5l-2 1M5 9l2 1M19 9l-2 1M5 15l2-1M19 15l-2-1M8 19l2-1M16 19l-2-1\"/>", "bagel")
export const IconBaguette = makeIcon("<path d=\"M3 12c0-3 4-7 9-7s9 4 9 7-4 7-9 7-9-4-9-7zM8 8l1 2M11 7l1 2M14 7l1 2M8 16l1-2M11 17l1-2M14 17l1-2\"/>", "baguette")
export const IconBreadLoaf = makeIcon("<path d=\"M3 12c0-3 4-6 9-6s9 3 9 6v6H3zM3 14h18M7 10v2M11 9v3M15 9v3M18 10v2\"/>", "bread-loaf")
export const IconCheese = makeIcon("<path d=\"M2 16l18-10v10zM2 16v4h18v-4M8 12h.01M13 12h.01M18 13h.01M7 17h.01M12 18h.01M16 16h.01\"/>", "cheese")
export const IconMilk = makeIcon("<path d=\"M6 8l1-5h10l1 5v14H6zM7 3h10M6 12h12M9 15h.01M12 15h.01M15 15h.01\"/>", "milk")
export const IconJuice = makeIcon("<path d=\"M4 8h16v14H4zM4 12h16M9 2h6v6H9zM10 4v2M14 4v2M7 16h.01M12 16h.01M17 16h.01\"/>", "juice")
export const IconTea = makeIcon("<path d=\"M4 8h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM20 10h2a2 2 0 1 1 0 4h-2M8 2v3M12 2v3M16 2v3\"/>", "tea")
export const IconTeaBag = makeIcon("<path d=\"M5 8h14v12H5zM5 12h14M9 4h6v4H9zM12 4V2\"/>", "tea-bag")
export const IconHotdog = makeIcon("<path d=\"M2 14c0-3 8-7 20-7s0 10-20 7zM5 15c5 0 12-2 15-5M9 12h.01M15 10h.01M11 9h.01\"/>", "hotdog")
export const IconTaco = makeIcon("<path d=\"M2 14c0-5 4-9 10-9s10 4 10 9M4 14h16M7 14l1 3M12 14v4M17 14l-1 3M8 12l1 1M16 12l-1 1M12 11v1\"/>", "taco")
export const IconBurrito = makeIcon("<path d=\"M5 8c0-2 3-4 7-4s7 2 7 4v8c0 2-3 4-7 4s-7-2-7-4zM12 4v16M5 10h14M5 14h14\"/>", "burrito")
export const IconRamen = makeIcon("<path d=\"M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2zM6 12h12M9 20h6M12 2v4M9 4h6M4 8L2 6M20 8l2-2M9 14l2 2M13 14l-2 2\"/>", "ramen")
export const IconSushi = makeIcon("<path d=\"M4 8h16v8H4zM4 12h16M8 8v8M16 8v8M12 5v3M10 5h4M10 16v3M14 16v3\"/>", "sushi")
export const IconSushi2 = makeIcon("<circle cx=\"8\" cy=\"12\" r=\"4\"/><circle cx=\"16\" cy=\"12\" r=\"4\"/><circle cx=\"8\" cy=\"12\" r=\"1\"/><circle cx=\"16\" cy=\"12\" r=\"1\"/><path d=\"M4 12h2M14 12h2M22 12h-2M8 8v8M16 8v8\"/>", "sushi-2")
export const IconBento = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"1\"/><path d=\"M2 12h20M12 4v16M6 8h.01M10 8h.01M16 8h.01M20 8h.01M6 16h.01M10 16h.01M16 16h.01M20 16h.01\"/>", "bento")
export const IconFrenchFries = makeIcon("<path d=\"M3 12h18l-2 10H5zM3 12l1-6 2 6M6 6l2-4 1 4M10 6l1-5 2 5M13 6l2-3 1 3M9 10v12M12 10v12M15 10v12\"/>", "french-fries")
export const IconKetchup = makeIcon("<path d=\"M9 4h6v4H9zM7 8h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2zM8 2h8v2H8zM10 12h4M10 15h4M10 18h4\"/>", "ketchup")
export const IconHoney = makeIcon("<path d=\"M8 3h8v3H8zM6 6h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 12h6M9 16h6M12 10v2\"/>", "honey")
export const IconSalt = makeIcon("<path d=\"M8 4h8l1 16H7zM8 4l-1-2h10l-1 2M9 10h6M9 14h6M9 18h6M5 8h14\"/>", "salt")
export const IconPepper = makeIcon("<path d=\"M10 6h4v12a3 3 0 0 1-6 0V6zM8 4h8v2H8zM11 3h2M8 10h8M8 14h8M8 18h8\"/>", "pepper")
export const IconAvocado = makeIcon("<path d=\"M12 2c-4 0-6 5-6 9s2 11 6 11 6-7 6-11-2-9-6-9z\"/><circle cx=\"12\" cy=\"14\" r=\"2\"/>", "avocado")
export const IconWatermelon = makeIcon("<path d=\"M2 12a10 10 0 0 1 20 0zM2 12l4 4M12 22L6 16M22 12l-4 4M16 6l4 6M8 6l-4 6\"/><circle cx=\"12\" cy=\"14\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"12\" r=\"1\"/>", "watermelon")
export const IconGrape = makeIcon("<circle cx=\"8\" cy=\"8\" r=\"2\"/><circle cx=\"12\" cy=\"8\" r=\"2\"/><circle cx=\"16\" cy=\"8\" r=\"2\"/><circle cx=\"10\" cy=\"12\" r=\"2\"/><circle cx=\"14\" cy=\"12\" r=\"2\"/><circle cx=\"8\" cy=\"16\" r=\"2\"/><circle cx=\"12\" cy=\"16\" r=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"2\"/><circle cx=\"10\" cy=\"20\" r=\"2\"/><circle cx=\"14\" cy=\"20\" r=\"2\"/><path d=\"M12 6V2M10 2h4\"/>", "grape")
export const IconCherry = makeIcon("<circle cx=\"8\" cy=\"16\" r=\"3\"/><circle cx=\"16\" cy=\"16\" r=\"3\"/><path d=\"M8 13V6l8-4M16 13V6M8 6c0-2 1-3 2-3M14 6c0-2 1-3 2-3\"/>", "cherry")
export const IconStrawberry = makeIcon("<path d=\"M12 22c-4-2-7-6-7-10 0-3 2-4 4-4 2-1 3-2 3-2s1 1 3 2c2 0 4 1 4 4 0 4-3 8-7 10zM9 6V4M15 6V4M12 4V2M9 10h.01M12 10h.01M15 10h.01M10 14h.01M14 14h.01M12 18h.01\"/>", "strawberry")
export const IconLemon = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"6\"/><path d=\"M9 8l-2-2M15 8l2-2M12 8V4M8 5l1-2M16 5l-1-2M10 20l-2 2M14 20l2 2\"/>", "lemon")
export const IconPeach = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"7\"/><path d=\"M12 7V4M9 4c0-2 1-3 3-3s3 1 3 3M8 10a4 4 0 0 1 8 0M10 20l-1 2M14 20l1 2\"/>", "peach")
export const IconPear = makeIcon("<path d=\"M12 22c-3 0-6-3-6-7 0-3 2-5 4-6V6a2 2 0 0 1 4 0v3c2 1 4 3 4 6 0 4-3 7-6 7zM12 6V3M10 3h4\"/>", "pear")
export const IconPineapple = makeIcon("<path d=\"M12 8c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zM8 2l4 6M16 2l-4 6M12 2v6M8 14h.01M12 14h.01M16 14h.01M10 18h.01M14 18h.01\"/>", "pineapple")
export const IconCoconut = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3v4M9 4l1 3M15 4l-1 3M7 8l2 2M17 8l-2 2M6 12h12M6 16h12M8 20h8M9 8h.01M15 8h.01\"/>", "coconut")
export const IconMushroom2 = makeIcon("<path d=\"M4 12c0-4 3-7 8-7s8 3 8 7v2H4zM6 14v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6M9 8h.01M15 8h.01M12 6v3\"/>", "mushroom2")
export const IconPopcorn = makeIcon("<path d=\"M4 12h16v8H4zM4 12l-1-2h18l-1 2M9 8c0-3 1-4 3-4s3 1 3 4M7 12h.01M11 12h.01M15 12h.01M8 16h.01M12 16h.01M16 16h.01\"/>", "popcorn")
export const IconCereal = makeIcon("<path d=\"M4 12h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 12l2-6 4 2 2-6 2 6 4-2 2 6M6 16h.01M10 16h.01M14 16h.01M18 16h.01\"/>", "cereal")
export const IconHat = makeIcon("<path d=\"M4 16l1-4c0-4 3-7 7-7s7 3 7 7l1 4zM3 16h18l1 4H2z\"/>", "hat")
export const IconCap = makeIcon("<path d=\"M4 14c0-4 3-7 7-7 3 0 5 2 5 4l4 3zM4 14h12v3H4z\"/>", "cap")
export const IconBoot = makeIcon("<path d=\"M6 2v14h10l4 3v3H4V2zM6 10h6M6 14h6\"/>", "boot")
export const IconScarf = makeIcon("<path d=\"M6 3c0-1 1-2 2-2s2 1 2 2v18H6zM14 3c0-1 1-2 2-2s2 1 2 2v18h-4zM10 8h4M10 14h4\"/>", "scarf")
export const IconGlove = makeIcon("<path d=\"M6 12V5a1 1 0 0 1 2 0v5M8 10V3a1 1 0 0 1 2 0v7M10 10V3a1 1 0 0 1 2 0v7M12 10V5a1 1 0 0 1 2 0v7M6 12v4a6 6 0 0 0 12 0v-4h-2v3M6 14h2\"/>", "glove")
export const IconBelt = makeIcon("<path d=\"M2 10h20v4H2zM6 10v4M18 10v4M12 10v4\"/>", "belt")
export const IconSock = makeIcon("<path d=\"M5 4h6v10c0 3 2 5 5 5s3-1 3-3v-4h-3l-3-3V4\"/>", "sock")
export const IconTie = makeIcon("<path d=\"M10 2h4l1 3-3 5-3-5zM9 10h6l-2 10-1 2-1-2z\"/>", "tie")
export const IconHoodie = makeIcon("<path d=\"M6 6l-3 2v10l3 2h12l3-2V8l-3-2M6 6c0-2 2-4 6-4s6 2 6 4M6 6l2 4h8l2-4M9 20v-4h6v4M12 10v6\"/>", "hoodie")
export const IconPants = makeIcon("<path d=\"M5 2h14v4l-3 16H6l-3-16zM8 12h8M12 2v10\"/>", "pants")
export const IconShorts = makeIcon("<path d=\"M4 2h16v8l-3 6h-3l-2-4-2 4H7L4 10zM8 10h8\"/>", "shorts")
export const IconSkirt = makeIcon("<path d=\"M6 4h12l4 16H2zM6 4v6M18 4v6M2 20h20M12 10v10\"/>", "skirt")
export const IconDress = makeIcon("<path d=\"M9 2h6v4l4 10-3 6H8l-3-6 4-10zM9 6h6M12 6v16\"/>", "dress")
export const IconSwimsuit = makeIcon("<path d=\"M4 8c0-2 4-4 8-4s8 2 8 4-4 8-8 8-8-6-8-8zM8 12h8M12 12v8\"/>", "swimsuit")
export const IconGlasses2 = makeIcon("<circle cx=\"7\" cy=\"12\" r=\"4\"/><circle cx=\"17\" cy=\"12\" r=\"4\"/><path d=\"M11 12h2M3 12h0M21 12h0M5 8L3 6M19 8l2-2\"/>", "glasses2")
export const IconRing = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"8\"/><path d=\"M9 6h6l-3-4z\"/><circle cx=\"12\" cy=\"14\" r=\"5\"/>", "ring")
export const IconNecklace = makeIcon("<path d=\"M6 3a6 6 0 0 0 12 0M9 8l3 4 3-4\"/><circle cx=\"12\" cy=\"14\" r=\"3\"/>", "necklace")
export const IconEarring = makeIcon("<circle cx=\"8\" cy=\"8\" r=\"6\"/><circle cx=\"8\" cy=\"18\" r=\"3\"/><path d=\"M14 8h2M14 12h2M14 16h2\"/>", "earring")
export const IconBracelet = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9 3l1 3M15 3l-1 3M9 21l1-3M15 21l-1-3M5 7l3 1M19 7l-3 1M5 17l3-1M19 17l-3-1\"/>", "bracelet")
export const IconChessKing = makeIcon("<path d=\"M12 2v4M10 4h4M8 22h8v-4l-2-2V9H10v7l-2 2zM9 13h6M12 13v5\"/>", "chess-king")
export const IconChessQueen = makeIcon("<path d=\"M12 2l2 3 2-2 1 4h-10l1-4 2 2zM6 22h12v-3l-2-3V9H8v7l-2 3zM9 12h6M12 12v4\"/>", "chess-queen")
export const IconChessRook = makeIcon("<path d=\"M6 22h12v-4l-2-2V9H8v7l-2 2zM8 5h8v4H8zM8 5V2M16 5V2M11 5V2M13 5V2M9 12h6\"/>", "chess-rook")
export const IconChessBishop = makeIcon("<path d=\"M12 2c-2 0-3 2-3 4 0 1 1 2 1 3l-2 9h8l-2-9c0-1 1-2 1-3 0-2-1-4-3-4zM9 15h6M8 22h8v-3H8zM12 6v2\"/>", "chess-bishop")
export const IconChessKnight = makeIcon("<path d=\"M6 22h12v-4l-2-2v-6l-4-4 1-2-2-1-1 2-3 3c-1 1-1 2 0 3s2 0 3-1l1 3-3 3-2 2z\"/>", "chess-knight")
export const IconChessPawn = makeIcon("<circle cx=\"12\" cy=\"9\" r=\"3\"/><path d=\"M9 12h6l-1 3-2 2 1 5H8l1-5-2-2zM8 22h8\"/>", "chess-pawn")
export const IconPokerChip = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1 1M17 17l1 1M6 18l1-1M17 7l1-1\"/>", "poker-chip")
export const IconMahjong = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"1\"/><path d=\"M7 9h2M9 9v6M13 9v6M15 9h2M15 15h2M7 15h2M11 11h.01M11 13h.01\"/>", "mahjong")
export const IconCardDeck = makeIcon("<rect x=\"4\" y=\"6\" width=\"12\" height=\"16\" rx=\"1\"/><rect x=\"8\" y=\"3\" width=\"12\" height=\"16\" rx=\"1\"/><path d=\"M14 6l-3 3M11 9l3 3M14 9h.01\"/>", "card-deck")
export const IconDice5 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"16\" cy=\"8\" r=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"8\" cy=\"16\" r=\"1\"/><circle cx=\"16\" cy=\"16\" r=\"1\"/>", "dice-5")
export const IconDice6 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"16\" cy=\"8\" r=\"1\"/><circle cx=\"8\" cy=\"12\" r=\"1\"/><circle cx=\"16\" cy=\"12\" r=\"1\"/><circle cx=\"8\" cy=\"16\" r=\"1\"/><circle cx=\"16\" cy=\"16\" r=\"1\"/>", "dice-6")
export const IconDomino = makeIcon("<rect x=\"2\" y=\"4\" width=\"8\" height=\"16\" rx=\"1\"/><rect x=\"14\" y=\"4\" width=\"8\" height=\"16\" rx=\"1\"/><circle cx=\"6\" cy=\"8\" r=\"1\"/><circle cx=\"6\" cy=\"16\" r=\"1\"/><circle cx=\"18\" cy=\"8\" r=\"1\"/><circle cx=\"18\" cy=\"12\" r=\"1\"/><circle cx=\"18\" cy=\"16\" r=\"1\"/>", "domino")
export const IconGoBoard = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 9h18M3 15h18M9 3v18M15 3v18\"/><circle cx=\"9\" cy=\"9\" r=\"1.5\"/><circle cx=\"15\" cy=\"15\" r=\"1.5\"/><circle cx=\"9\" cy=\"15\" r=\"1.5\"/>", "go-board")
export const IconBackgammon = makeIcon("<path d=\"M2 6l3-3 3 3-3 3zM9 6l3-3 3 3-3 3zM16 6l3-3 3 3-3 3zM2 18l3-3 3 3-3 3zM9 18l3-3 3 3-3 3zM16 18l3-3 3 3-3 3zM6 12h12\"/>", "backgammon")
export const IconCheckerboard = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 3h4v4H3zM11 3h4v4h-4zM19 3h2v4h-2zM7 7h4v4H7zM15 7h4v4h-4zM3 11h4v4H3zM11 11h4v4h-4zM19 11h2v4h-2zM7 15h4v4H7zM15 15h4v4h-4zM3 19h4v2H3zM11 19h4v2h-4zM19 19h2v2h-2z\"/>", "checkerboard")
export const IconScrewdriver2 = makeIcon("<path d=\"M13 4l7 7M18 9l3-3M6 18l6-6M16 2l6 6-4 4-6-6zM8 16l-6 6M4 16l4 4\"/>", "screwdriver2")
export const IconWrench2 = makeIcon("<path d=\"M14.7 6.3a4 4 0 0 0 5.6 5.6L9.7 22.5a2 2 0 1 1-2.8-2.8L17.5 9\"/>", "wrench-2")
export const IconWrench3 = makeIcon("<path d=\"M3 21l9-9M12 12l3 3M15 15l6-6-3-3-6 6M18 6l3-3M6 3l3 3-3 3-3-3z\"/>", "wrench-3")
export const IconHammer2 = makeIcon("<path d=\"M15 12l-8.5 8.5a2 2 0 0 1-3-3L12 9M17.6 6.4l2.4-2.4 2 2-2.4 2.4\"/>", "hammer-2")
export const IconHammer3 = makeIcon("<path d=\"M14 4l6 6-2 2-6-6zM12 6L3 15l3 3 9-9M5 21l4-4\"/>", "hammer-3")
export const IconChisel = makeIcon("<path d=\"M4 20l6-6-3-3-6 6zM10 14l7-7 3 3-7 7zM17 4l3 3-2 2-3-3z\"/>", "chisel")
export const IconCaliper = makeIcon("<path d=\"M6 3v18M18 3v18M6 6h9a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h9M6 21h-3M18 21h3M3 3h6M15 3h6\"/>", "caliper")
export const IconLevel = makeIcon("<path d=\"M2 10h20v4H2zM6 12h.01M10 12h.01M14 12h.01M18 12h.01\"/>", "level")
export const IconClamp = makeIcon("<path d=\"M4 4v16M4 8h12a4 4 0 0 1 0 8H4M20 4v16M18 4h4M18 20h4\"/>", "clamp")
export const IconVise = makeIcon("<path d=\"M3 18h18M5 18V8h14v10M8 8V4h8v4M12 12v6\"/>", "vise")
export const IconTapeMeasure = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M18 6l3-2M18 12h3M18 18l3 2M9 4h6\"/>", "tape-measure")
export const IconCrowbar = makeIcon("<path d=\"M4 20L16 8M14 6l4-4 2 2-4 4zM4 20l-2-2 2-2 2 2zM12 8l6 6\"/>", "crowbar")
export const IconNailGun = makeIcon("<path d=\"M6 4h12v6H6zM9 10v4M15 10v4M6 14h12v6H6zM12 20v2\"/>", "nail-gun")
export const IconPowerDrill = makeIcon("<path d=\"M4 8h13v6H4zM17 9h4v4h-4M8 14v5h5v-5M10 20l-1 2M13 20l1 2M5 10h2M8 10h2\"/>", "power-drill")
export const IconAngleGrinder = makeIcon("<path d=\"M4 8h14v8H4zM18 10l3-1v6l-3-1M6 16l-3 4M12 8V4M9 4h6M4 10v4\"/>", "angle-grinder")
export const IconImpactDrill = makeIcon("<path d=\"M8 4h8v6H8zM12 10v4M6 14h12v6H6zM12 20v2M9 6h.01M12 6h.01M15 6h.01\"/>", "impact-drill")
export const IconChisel2 = makeIcon("<path d=\"M4 20l6-6-3-3-6 6zM10 14l7-7 3 3-7 7z\"/>", "chisel-2")
export const IconTrowel = makeIcon("<path d=\"M6 3h12l-1 8H7zM12 11v8M8 19h8M9 21h6\"/>", "trowel")
export const IconRake = makeIcon("<path d=\"M4 20l14-14M18 6l3-3M14 4l6 6M4 20l-3-3 3-3 3 3z\"/>", "rake")
export const IconHoe = makeIcon("<path d=\"M3 21l12-12M15 9l6-6M11 7l6 6M3 21l-2-2 2-2 2 2z\"/>", "hoe")
export const IconPitchfork = makeIcon("<path d=\"M6 22l6-12M12 10l6-8M8 4l8 6M6 22l-2-2 2-2 2 2zM14 6h4M16 4v4\"/>", "pitchfork")
export const IconShovel = makeIcon("<path d=\"M3 21l8-8M11 13l6-6M17 7l3-3M9 11l4 4M4 4l6 6\"/>", "shovel")
export const IconPickaxe = makeIcon("<path d=\"M3 21l9-9M12 12l9-9M6 3l12 12M6 21l3-3M18 6l-3 3\"/>", "pickaxe")
export const IconHandSaw = makeIcon("<path d=\"M3 15l12-12 6 6-12 12zM7 11l6 6M10 8l6 6\"/>", "hand-saw")
export const IconCircularSaw = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 4v4M12 16v4M4 12h4M16 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3\"/>", "circular-saw")
export const IconJigSaw = makeIcon("<path d=\"M5 6h14v8H5zM9 14v4M15 14v4M9 18l1 4M15 18l-1 4M8 10h.01M12 10h.01M16 10h.01\"/>", "jig-saw")
export const IconChainsaw = makeIcon("<path d=\"M3 8h14v8H3zM17 10h4v4h-4M6 8V6M10 8V6M14 8V6M6 16v2M10 16v2M14 16v2\"/>", "chainsaw")
export const IconLathe = makeIcon("<path d=\"M2 12h20M6 8v8M18 8v8M10 10h4v4h-4zM6 4v4M18 4v4M6 16v4M18 16v4\"/>", "lathe")
export const IconAnvil = makeIcon("<path d=\"M6 18h12v-3l-4-3V8h-6v4l-4 3zM3 18h18v3H3zM9 5h6l-1-3h-4z\"/>", "anvil")
export const IconFurnace = makeIcon("<path d=\"M4 20h16V8l-4-4H8L4 8zM8 20v-6h8v6M12 12V8M9 6h6\"/>", "furnace")
export const IconWeldingMask = makeIcon("<path d=\"M5 4h14v10a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4zM5 10h14M9 8h.01M15 8h.01M12 18v4\"/>", "welding-mask")
export const IconSafetyGlasses = makeIcon("<circle cx=\"8\" cy=\"12\" r=\"4\"/><circle cx=\"16\" cy=\"12\" r=\"4\"/><path d=\"M4 12H2M22 12h-2M12 12h-2M14 12h-2M6 8L4 6M18 8l2-2\"/>", "safety-glasses")
export const IconHardHat = makeIcon("<path d=\"M2 18h20v2H2zM4 18v-4c0-4 3-7 8-7s8 3 8 7v4M9 7V4M15 7V4M12 4v3\"/>", "hard-hat")
export const IconToolBox = makeIcon("<rect x=\"2\" y=\"10\" width=\"20\" height=\"10\" rx=\"2\"/><path d=\"M2 14h20M8 14v2M16 14v2M8 10V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4\"/>", "tool-box")
export const IconBrickWall = makeIcon("<path d=\"M2 6h20v4H2zM2 10h6v4H2zM8 10h8v4H8zM16 10h6v4h-6zM2 14h10v4H2zM12 14h10v4H12z\"/>", "brick-wall")
export const IconBricks = makeIcon("<path d=\"M2 8h6v4H2zM10 8h6v4h-6zM18 8h4v4h-4zM6 12h6v4H6zM14 12h6v4h-6zM2 16h4v4H2zM8 16h4v4H8zM14 16h4v4h-4zM20 16h2v4h-2z\"/>", "bricks")
export const IconScaffolding = makeIcon("<path d=\"M3 2v20M21 2v20M3 6h18M3 12h18M3 18h18M8 6v6M14 6v6M8 12v6M14 12v6\"/>", "scaffolding")
export const IconLadder = makeIcon("<path d=\"M6 2v20M18 2v20M6 6h12M6 12h12M6 18h12\"/>", "ladder")
export const IconCement = makeIcon("<path d=\"M4 8h16v14H4zM4 12h16M6 8l2-6h8l2 6M9 4h6M9 16h.01M12 16h.01M15 16h.01\"/>", "cement")
export const IconPaint = makeIcon("<path d=\"M4 4h16v8H4zM4 8h16M8 12v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4M10 18v4M14 18v4\"/>", "paint")
export const IconPaintRoller = makeIcon("<path d=\"M3 4h14v6H3zM17 6h3v6h-3M17 12v3H6v3M6 18v4\"/>", "paint-roller")
export const IconPaintBrush = makeIcon("<path d=\"M9 12l3 3 7-7-3-3zM9 12L4 17v3h3l5-5z\"/>", "paint-brush")
export const IconPlumbing = makeIcon("<path d=\"M5 4h4v8H5zM9 8h6a4 4 0 0 1 0 8H9M12 4h4v4h-4M12 16h4v4h-4\"/>", "plumbing")
export const IconPipe = makeIcon("<path d=\"M3 8h18v8H3zM8 8v8M12 8v8M16 8v8\"/>", "pipe")
export const IconValve = makeIcon("<path d=\"M12 4v16M6 12h12M4 8l4 4-4 4M20 8l-4 4 4 4M12 8V4M10 4h4\"/>", "valve")
export const IconBolt = makeIcon("<path d=\"M12 2l4 6h-2v6h4l-4 8v-6h-4l4-6h-2z\"/>", "bolt")
export const IconNut = makeIcon("<path d=\"M12 2l8 5v10l-8 5-8-5V7z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "nut")
export const IconWasher = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/>", "washer")
export const IconScrew = makeIcon("<path d=\"M12 2v12l4 4H8zM12 16v6M10 18h4M10 20h4M10 22h4\"/>", "screw")
export const IconRivet = makeIcon("<path d=\"M6 8h12v6c0 3-3 6-6 6s-6-3-6-6zM8 4h8v4H8zM10 2h4v2h-4z\"/>", "rivet")
export const IconPlank = makeIcon("<rect x=\"2\" y=\"10\" width=\"20\" height=\"4\" rx=\"1\"/><path d=\"M5 10v4M9 10v4M13 10v4M17 10v4\"/>", "plank")
export const IconRoofTile = makeIcon("<path d=\"M2 18l4-10h12l4 10zM6 8h12M5 14h14M4 18h16\"/>", "roof-tile")
export const IconChimney = makeIcon("<rect x=\"8\" y=\"2\" width=\"8\" height=\"20\" rx=\"1\"/><path d=\"M10 6h4M10 10h4M10 14h4M10 18h4M6 22h12\"/>", "chimney")
export const IconDrawingCompass = makeIcon("<circle cx=\"12\" cy=\"4\" r=\"2\"/><path d=\"M10 6l-4 14M14 6l4 14M12 6v12M8 20h8\"/>", "drawing-compass")
export const IconProtractor = makeIcon("<path d=\"M2 18a10 10 0 0 1 20 0zM12 18v-10M6 18l3-6M18 18l-3-6M9 18l2-4M15 18l-2-4\"/>", "protractor")
export const IconTrowel2 = makeIcon("<path d=\"M6 3h12l-1 8H7zM12 11v8M8 19h8\"/>", "trowel2")
export const IconCar2 = makeIcon("<path d=\"M4 12l2-6h12l2 6v6H4zM6 18v2M18 18v2M4 12h16\"/><circle cx=\"7\" cy=\"15\" r=\"1\"/><circle cx=\"17\" cy=\"15\" r=\"1\"/>", "car-2")
export const IconCar3 = makeIcon("<path d=\"M2 14l2-8h16l2 8v4H2zM6 14h.01M18 14h.01M2 10h20\"/>", "car-3")
export const IconTaxi = makeIcon("<path d=\"M4 12l2-6h12l2 6v6H4zM9 6V4h6v2M4 12h16\"/><circle cx=\"7\" cy=\"15\" r=\"1\"/><circle cx=\"17\" cy=\"15\" r=\"1\"/>", "taxi")
export const IconVan = makeIcon("<path d=\"M2 14V8a2 2 0 0 1 2-2h10l6 6v6H2zM14 8v6M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "van")
export const IconPickup = makeIcon("<path d=\"M2 16V8h10l4 4h6v6H2zM12 8v4M14 12h6M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "pickup")
export const IconLimousine = makeIcon("<path d=\"M2 16V12l4-6h12l4 6v4H2zM6 16h12M10 6l-2 6M14 6l2 6M8 10h8\"/>", "limousine")
export const IconFireTruck = makeIcon("<path d=\"M2 16V10l2-4h8l2 4h8v6H2zM10 6v4M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 4l2-2M12 6l3-2\"/>", "fire-truck")
export const IconPoliceCar = makeIcon("<path d=\"M4 12l2-6h12l2 6v6H4zM4 12h16M8 6V4M16 6V4M12 4h.01\"/><circle cx=\"7\" cy=\"15\" r=\"1\"/><circle cx=\"17\" cy=\"15\" r=\"1\"/>", "police-car")
export const IconGarbageTruck = makeIcon("<path d=\"M3 18V8h10l4 6v4H3zM17 10h2l3 4v4h-5M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "garbage-truck")
export const IconCementTruck = makeIcon("<path d=\"M2 16V8h8l4 4h8v4H2zM14 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "cement-truck")
export const IconTractor2 = makeIcon("<path d=\"M4 18v-6h6l2-4h6v10M4 18h16M16 12h4v6M6 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 4h6l1 4\"/>", "tractor2")
export const IconForklift2 = makeIcon("<path d=\"M4 4v16h12M4 12h12M12 4v8M16 20v-8h5v8M16 14h5\"/>", "forklift2")
export const IconDumpTruck = makeIcon("<path d=\"M2 16V8h12l6 6v4H2zM14 8v6M20 16l-4-2M8 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "dump-truck")
export const IconDeliveryTruck = makeIcon("<path d=\"M2 16V8h12l6 6v4H2zM14 8v6M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "delivery-truck")
export const IconTankerTruck = makeIcon("<path d=\"M2 16V10h14v6H2zM16 12h4l2 2v2h-6M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 12h4\"/>", "tanker-truck")
export const IconFoodTruck = makeIcon("<path d=\"M2 16V8h12l4 4h4v4H2zM14 8v4M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "food-truck")
export const IconSubway = makeIcon("<path d=\"M4 15V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM4 11h16M8 18l-2 3M16 18l2 3M9 15h.01M15 15h.01\"/>", "subway")
export const IconTram = makeIcon("<path d=\"M4 15V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM4 11h16M12 3V2M8 18v2M16 18v2M9 14h.01M15 14h.01\"/>", "tram")
export const IconTrolley = makeIcon("<path d=\"M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 6h8M12 6v6M8 20v2M16 20v2\"/>", "trolley")
export const IconTrolleybus = makeIcon("<path d=\"M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM12 4v8M8 4h8M8 20v2M16 20v2M7 15h.01M17 15h.01\"/>", "trolleybus")
export const IconFerry = makeIcon("<path d=\"M2 16l2-6h16l2 6-3 3-3-3-3 3-3-3-3 3-3-3zM6 10V4h12v6M10 4v6M14 4v6\"/>", "ferry")
export const IconYacht = makeIcon("<path d=\"M3 16l2-4 14-2 2 6-3 3-3-3-3 3-3-3-3 3-3-3zM8 12V4l7 3-7 5\"/>", "yacht")
export const IconCanoe = makeIcon("<path d=\"M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM6 12l6-9 6 9\"/>", "canoe")
export const IconRowboat = makeIcon("<path d=\"M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM6 12l6-3 6 3M4 14l16 2M6 16l12 0\"/>", "rowboat")
export const IconSailboat = makeIcon("<path d=\"M3 16l2-4 14-2 2 6-3 3-3-3-3 3-3-3-3 3-3-3zM12 10V2l8 8z\"/>", "sailboat")
export const IconKayak = makeIcon("<path d=\"M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM10 12V4M14 12V4M6 6l12 2M6 8l12-2\"/>", "kayak")
export const IconHotair = makeIcon("<circle cx=\"12\" cy=\"6\" r=\"4\"/><path d=\"M8 10l1 6h6l1-6M9 16l-1 6M15 16l1 6M10 22h4\"/>", "hotair")
export const IconParachute = makeIcon("<path d=\"M2 10a10 10 0 0 1 20 0zM12 10v10M8 20h8M8 20l4-10M16 20l-4-10\"/>", "parachute")
export const IconCablecar = makeIcon("<path d=\"M2 4l20-2M6 4v4h12V4M6 8l2 8h8l2-8M12 8v8M10 16v4M14 16v4M8 20h8\"/>", "cablecar")
export const IconElevator = makeIcon("<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"1\"/><path d=\"M4 10h16M12 2v8M12 10v12M8 6h.01M16 6h.01M8 14h.01M16 14h.01M8 18h.01M16 18h.01\"/>", "elevator")
export const IconEscalator = makeIcon("<path d=\"M3 20h4l10-12h4M7 20l10-12M3 20a2 2 0 0 1 2-2M19 6a2 2 0 0 0-2 2M20 4h-4M6 4h4\"/>", "escalator")
export const IconBridge2 = makeIcon("<path d=\"M2 12h20M4 12v8M20 12v8M12 12v8M2 12a10 10 0 0 1 20 0M6 8v4M18 8v4\"/>", "bridge2")
export const IconTunnel = makeIcon("<path d=\"M2 20v-6a10 10 0 0 1 20 0v6M6 20v-6a6 6 0 0 1 12 0v6M10 20v-6a2 2 0 0 1 4 0v6\"/>", "tunnel")
export const IconHighway = makeIcon("<path d=\"M4 22L6 2h12l2 20M10 2v20M14 2v20M12 6v2M12 12v2M12 18v2\"/>", "highway")
export const IconRoundabout = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/><path d=\"M12 21V3M3 12h18\"/>", "roundabout")
export const IconPen2 = makeIcon("<path d=\"M17 3l4 4L8 20l-5 1 1-5zM14 6l4 4\"/>", "pen-2")
export const IconPen3 = makeIcon("<path d=\"M2 22l4-4M18 2l4 4L8 20l-4-4zM14 6l4 4\"/>", "pen-3")
export const IconPencil2 = makeIcon("<path d=\"M16 2l6 6L8 22H2v-6zM12 6l6 6M14 4l6 6\"/>", "pencil-2")
export const IconEraser = makeIcon("<path d=\"M4 18l10-10 6 6-10 10zM2 20h20M14 8l6 6\"/>", "eraser")
export const IconMarker = makeIcon("<path d=\"M9 3h6v10H9zM9 13h6v4l-2 4h-2l-2-4zM11 3V1h2v2\"/>", "marker")
export const IconHighlighter = makeIcon("<path d=\"M9 3h6v10H9zM9 13h6l-2 8h-2zM11 3V1h2v2\"/>", "highlighter")
export const IconPencilCase = makeIcon("<rect x=\"2\" y=\"8\" width=\"20\" height=\"10\" rx=\"3\"/><path d=\"M2 12h20M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2\"/>", "pencil-case")
export const IconPencilSharpener = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"8\"/><circle cx=\"12\" cy=\"14\" r=\"3\"/><path d=\"M12 6V2M8 2h8M4 14h-2M22 14h-2\"/>", "pencil-sharpener")
export const IconStapler = makeIcon("<path d=\"M3 16h18v4H3zM3 16v-2l14-6 4 4v4M6 12l12-5M7 20h10\"/>", "stapler")
export const IconStaples = makeIcon("<path d=\"M6 8v8M10 8v8M14 8v8M18 8v8M4 6h16M4 18h16\"/>", "staples")
export const IconPaperClip = makeIcon("<path d=\"M16 6v10a4 4 0 0 1-8 0V4a2 2 0 0 1 4 0v10a.5.5 0 0 1-1 0V6\"/>", "paper-clip")
export const IconPushPin = makeIcon("<path d=\"M9 3h6l-1 6 3 3H7l3-3zM12 12v9\"/>", "push-pin")
export const IconPaperClip2 = makeIcon("<path d=\"M4 8l10-6 6 6-10 12H4v-6z\"/>", "paper-clip-2")
export const IconNotepad = makeIcon("<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><path d=\"M8 6h8M8 10h8M8 14h6M8 18h4M4 6H2M22 6h-2M4 18H2M22 18h-2\"/>", "notepad")
export const IconNotebook = makeIcon("<rect x=\"4\" y=\"2\" width=\"14\" height=\"20\" rx=\"1\"/><path d=\"M4 6h14M4 12h14M4 18h14M2 6h2M2 12h2M2 18h2\"/>", "notebook")
export const IconJournal = makeIcon("<rect x=\"3\" y=\"2\" width=\"18\" height=\"20\" rx=\"1\"/><path d=\"M7 6h10M7 12h10M7 18h6M3 6H1M23 6h-2M3 12H1M23 12h-2M3 18H1M23 18h-2\"/>", "journal")
export const IconDiary = makeIcon("<rect x=\"3\" y=\"2\" width=\"18\" height=\"20\" rx=\"1\"/><path d=\"M3 8h18M7 12h6M7 16h6M3 6H1M23 6h-2M3 14H1M23 14h-2\"/>", "diary")
export const IconBook3 = makeIcon("<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"1\"/><path d=\"M4 7h16M4 12h16M4 17h16M2 6h2M2 12h2M2 18h2M20 6h2M20 12h2M20 18h2\"/>", "book3")
export const IconBooklet = makeIcon("<rect x=\"3\" y=\"2\" width=\"18\" height=\"20\" rx=\"1\"/><path d=\"M8 2v20M12 6h6M12 10h6M12 14h6M12 18h4\"/>", "booklet")
export const IconBookmark2 = makeIcon("<path d=\"M6 2h12v20l-6-5-6 5zM9 6h6M9 10h6\"/>", "bookmark2")
export const IconBookstack = makeIcon("<path d=\"M2 18h20v2H2zM4 14h18v2H4zM2 10h18v2H2zM4 6h18v2H4zM6 2h18v2H6z\"/>", "bookstack")
export const IconStamp = makeIcon("<path d=\"M6 8h12v6H6zM8 14v4h8v-4M10 8V4h4v4M4 20h16v2H4zM8 18h8\"/>", "stamp")
export const IconStamp2 = makeIcon("<path d=\"M7 6h10v6H7zM8 12h8v4H8zM9 6V4h6v2M5 20h14v2H5z\"/>", "stamp2")
export const IconEnvelope = makeIcon("<path d=\"M2 5h20v14H2zM2 5l10 7 10-7\"/>", "envelope")
export const IconEnvelopeOpen = makeIcon("<path d=\"M2 8l10-6 10 6v12H2zM2 8l10 7 10-7M6 15l4 3M18 15l-4 3\"/>", "envelope-open")
export const IconPaperPlane = makeIcon("<path d=\"M22 2L11 13M22 2l-7 20-4-9-9-4z\"/>", "paper-plane")
export const IconPostcard = makeIcon("<path d=\"M2 5h20v14H2zM2 9h20M6 13h6M6 16h4M17 12h.01\"/>", "postcard")
export const IconFolder2 = makeIcon("<path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18\"/>", "folder-2")
export const IconFolderLock = makeIcon("<path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><rect x=\"9\" y=\"12\" width=\"6\" height=\"5\" rx=\"1\"/><path d=\"M10 12v-1a2 2 0 0 1 4 0v1\"/>", "folder-lock")
export const IconFileSearch = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7\"/><circle cx=\"11\" cy=\"17\" r=\"2\"/><path d=\"M12.5 18.5l2.5 2.5\"/>", "file-search")
export const IconFileCheck2 = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M9 14l2 2 4-4\"/>", "file-check-2")
export const IconFileX2 = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M10 12l5 5M15 12l-5 5\"/>", "file-x-2")
export const IconFilePlus2 = makeIcon("<path d=\"M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M12 12v6M9 15h6\"/>", "file-plus-2")
export const IconClipboard2 = makeIcon("<rect x=\"8\" y=\"2\" width=\"12\" height=\"4\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6\"/>", "clipboard-2")
export const IconClipboardList = makeIcon("<rect x=\"8\" y=\"2\" width=\"12\" height=\"4\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 11h.01M12 11h5M8 15h.01M12 15h5\"/>", "clipboard-list")
export const IconClipboardX = makeIcon("<rect x=\"8\" y=\"2\" width=\"12\" height=\"4\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M10 11l6 6M16 11l-6 6\"/>", "clipboard-x")
export const IconFridge = makeIcon("<rect x=\"6\" y=\"2\" width=\"12\" height=\"20\" rx=\"2\"/><path d=\"M6 10h12M9 6h.01M9 14h.01M9 18h.01\"/>", "fridge")
export const IconMicrowave = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\"/><path d=\"M2 10h20M14 12h6M14 16h6\"/><circle cx=\"8\" cy=\"14\" r=\"1\"/>", "microwave")
export const IconOven = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 8h18M8 5h.01M16 5h.01\"/><circle cx=\"12\" cy=\"15\" r=\"4\"/>", "oven")
export const IconDishwasher = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 8h18M8 5h.01M16 5h.01M7 12h10v7H7z\"/>", "dishwasher")
export const IconWashingMachine = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 8h18M8 5h.01M16 5h.01\"/><circle cx=\"12\" cy=\"15\" r=\"4\"/>", "washing-machine")
export const IconDryer = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 8h18M8 5h.01M16 5h.01M12 11v8M8 15a4 4 0 0 0 8 0\"/>", "dryer")
export const IconVacuum = makeIcon("<circle cx=\"12\" cy=\"16\" r=\"6\"/><path d=\"M12 10V4M8 4h8M4 16h-2M22 16h-2M6 16v4M18 16v4M9 16v4M15 16v4\"/>", "vacuum")
export const IconIron = makeIcon("<path d=\"M2 14c0-3 4-6 10-6h10v6zM2 14v4h20v-4M6 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2\"/>", "iron")
export const IconKettle = makeIcon("<path d=\"M5 8h12v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM5 12h12M17 10l3-3M10 8V4M12 4h4M20 12h1\"/>", "kettle")
export const IconToaster = makeIcon("<rect x=\"2\" y=\"8\" width=\"20\" height=\"10\" rx=\"3\"/><path d=\"M6 8V6h4v2M14 8V6h4v2M6 14h.01M18 14h.01M12 18v2\"/>", "toaster")
export const IconBlender = makeIcon("<path d=\"M7 2h10l-1 12H8zM8 14h8l-1 6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM12 2v2M10 6h4\"/>", "blender")
export const IconMixer2 = makeIcon("<path d=\"M3 8h10v10H3zM13 12h5a3 3 0 0 0 3-3V6M3 12h10M8 2V1M5 4L4 3M11 4l1-1\"/>", "mixer2")
export const IconRiceCooker = makeIcon("<rect x=\"3\" y=\"8\" width=\"18\" height=\"12\" rx=\"3\"/><path d=\"M3 12h18M8 8V6h8v2M12 3v3M8 20v2M16 20v2\"/>", "rice-cooker")
export const IconCoffeeMaker = makeIcon("<path d=\"M6 2h12v10H6zM6 6h12M8 12v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8M9 16h6\"/>", "coffee-maker")
export const IconElectricKettle = makeIcon("<path d=\"M6 6h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM6 10h12M18 8l3-2M9 6V4M15 6V4M20 10h1\"/>", "electric-kettle")
export const IconAirConditioner = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"8\" rx=\"2\"/><path d=\"M2 8h20M6 12v2M10 12v3M14 12v3M18 12v2M6 18h.01M12 18h.01M18 18h.01\"/>", "air-conditioner")
export const IconFan = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M12 6a3 3 0 0 0 0 6M18 12a3 3 0 0 0-6 0M12 18a3 3 0 0 0 0-6M6 12a3 3 0 0 0 6 0\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>", "fan")
export const IconHeater = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\"/><path d=\"M6 10v4M10 10v4M14 10v4M18 10v4M6 18h.01M12 18h.01M18 18h.01\"/>", "heater")
export const IconHumidifier = makeIcon("<path d=\"M5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM7 8V6h10v2M12 3V1M8 4L7 3M16 4l1-1\"/>", "humidifier")
export const IconDehumidifier = makeIcon("<rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 10h18M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01M17 18h.01\"/>", "dehumidifier")
export const IconWaterHeater = makeIcon("<rect x=\"6\" y=\"4\" width=\"12\" height=\"16\" rx=\"4\"/><path d=\"M6 10h12M9 6h.01M15 6h.01M9 14h.01M15 14h.01M9 18h.01M15 18h.01\"/>", "water-heater")
export const IconBoiler = makeIcon("<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"3\"/><path d=\"M4 10h16M12 6v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01\"/>", "boiler")
export const IconRadiator = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"1\"/><path d=\"M6 6v12M10 6v12M14 6v12M18 6v12M2 10h20M2 14h20\"/>", "radiator")
export const IconDoor2 = makeIcon("<path d=\"M4 22V2h16v20M12 12h.01M4 12h.01\"/>", "door2")
export const IconWindow2 = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 12h18M12 3v18M3 8h18M3 16h18\"/>", "window2")
export const IconSofa3 = makeIcon("<path d=\"M3 12v6a1 1 0 0 0 1 1h2v2M21 12v6a1 1 0 0 1-1 1h-2v2M3 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 12h18M3 16h18\"/>", "sofa3")
export const IconCushion = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><path d=\"M3 7c4-4 14-4 18 0M3 17c4 4 14 4 18 0M7 3c-4 4-4 14 0 18M17 3c4 4 4 14 0 18\"/>", "cushion")
export const IconCurtain = makeIcon("<path d=\"M2 2h20v2H2zM4 4v18M20 4v18M12 4v18M4 8c2 2 4 2 6 0M14 8c2 2 4 2 6 0M4 12c2 2 4 2 6 0M14 12c2 2 4 2 6 0M4 16c2 2 4 2 6 0M14 16c2 2 4 2 6 0\"/>", "curtain")
export const IconRug = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"1\"/><path d=\"M5 7v10M19 7v10M2 8h3M2 12h3M2 16h3M19 8h3M19 12h3M19 16h3M8 12h8\"/>", "rug")
export const IconMirror = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3v18M3 12h18M6 6a8 8 0 0 1 6-3\"/>", "mirror")
export const IconVase = makeIcon("<path d=\"M9 2h6v4l2 4v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10l2-4zM9 6h6M12 6v4M8 12h8\"/>", "vase")
export const IconCandle = makeIcon("<rect x=\"9\" y=\"6\" width=\"6\" height=\"16\" rx=\"1\"/><path d=\"M12 6V3M10 3c0-1 1-2 2-2s2 1 2 2M6 22h12\"/>", "candle")
export const IconClock2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 3M12 3V1M12 23v-2M3 12H1M23 12h-2\"/>", "clock2")
export const IconWallClock = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\"/><path d=\"M12 5v7l4 3M4 4L2 2M20 4l2-2M4 20l-2 2M20 20l2 2\"/>", "wall-clock")
export const IconDigitalClock = makeIcon("<rect x=\"2\" y=\"7\" width=\"20\" height=\"10\" rx=\"1\"/><path d=\"M6 9v6M9 9l1 6M13 9h2v3h-2v3h2M18 9l1 6M6 4h.01M9 4h.01M12 4h.01M15 4h.01M18 4h.01\"/>", "digital-clock")
export const IconHourglass = makeIcon("<path d=\"M6 2h12v6l-6 4-6-4zM6 22h12v-6l-6-4-6 4zM6 2v6M18 2v6M6 22v-6M18 22v-6\"/>", "hourglass")
export const IconThermometer2 = makeIcon("<path d=\"M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8\"/>", "thermometer2")
export const IconFlashlight = makeIcon("<path d=\"M6 2h12v6H6zM9 8v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8M12 4v2M9 12h.01M15 12h.01\"/>", "flashlight")
export const IconMicroSd = makeIcon("<path d=\"M6 4h10l2 2v14H6zM8 8v4h8V8M10 14h.01M14 14h.01M10 17h.01M14 17h.01\"/>", "micro-sd")
export const IconSim = makeIcon("<path d=\"M6 4h10l2 2v14H6zM9 8v6h6V8M11 12l2-2v2z\"/>", "sim")
export const IconUsb = makeIcon("<path d=\"M8 6h8v10H8zM12 16v6M10 22h4M10 6V4M14 6V4M12 4V1\"/>", "usb")
export const IconHdmi = makeIcon("<path d=\"M3 6h18v8H3zM6 14v4M9 14v4M15 14v4M18 14v4M6 10h12\"/>", "hdmi")
export const IconDisplayPort = makeIcon("<path d=\"M3 8h18v8H3zM6 6l-2-2M18 6l2-2M8 10h8M8 14h8\"/>", "display-port")
export const IconAudioJack = makeIcon("<path d=\"M12 2a4 4 0 0 1 4 4v4a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4zM9 12l-3 6a4 4 0 0 0 8 0l-3-6M12 22v.01\"/>", "audio-jack")
export const IconEthernet = makeIcon("<path d=\"M4 8h16v8H4zM7 8v4M11 8v4M15 8v4M19 8v4M7 16v4M11 16v4M15 16v4M19 16v4\"/>", "ethernet")
export const IconKeyboard2 = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\"/><path d=\"M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01M10 18h4\"/>", "keyboard2")
export const IconMouse = makeIcon("<rect x=\"6\" y=\"2\" width=\"12\" height=\"20\" rx=\"6\"/><path d=\"M12 2v6M9 6h6\"/>", "mouse")
export const IconTouchpad = makeIcon("<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 12h18M12 5v7\"/>", "touchpad")
export const IconTrackBall = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2\"/>", "track-ball")
export const IconJoystick2 = makeIcon("<circle cx=\"12\" cy=\"4\" r=\"3\"/><path d=\"M12 7v8M8 15h8a2 2 0 0 1 2 2v3H6v-3a2 2 0 0 1 2-2z\"/>", "joystick2")
export const IconProjector = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"10\" rx=\"2\"/><circle cx=\"10\" cy=\"9\" r=\"2\"/><path d=\"M18 7v4M6 14v4M18 14v4M10 18h4\"/>", "projector")
export const IconVrHeadset = makeIcon("<path d=\"M2 8h20v8H2zM2 12h20M9 12a3 3 0 0 0 6 0\"/>", "vr-headset")
export const IconDrone = makeIcon("<path d=\"M12 8v4M12 16v4M8 12h8M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4\"/><circle cx=\"6\" cy=\"6\" r=\"2\"/><circle cx=\"18\" cy=\"6\" r=\"2\"/><circle cx=\"6\" cy=\"18\" r=\"2\"/><circle cx=\"18\" cy=\"18\" r=\"2\"/>", "drone")
export const IconRobotArm = makeIcon("<path d=\"M2 22h20M4 18V8h4v10M8 12h8l4-4v8M16 16h.01M12 8V2M8 4h8\"/>", "robot-arm")
export const IconRobot = makeIcon("<rect x=\"5\" y=\"8\" width=\"14\" height=\"12\" rx=\"2\"/><circle cx=\"9\" cy=\"12\" r=\"1.5\"/><circle cx=\"15\" cy=\"12\" r=\"1.5\"/><path d=\"M12 8V4M8 4h8M9 16h6M8 20v2M16 20v2M2 12h3M19 12h3\"/>", "robot")
export const IconRobot2 = makeIcon("<rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\"/><circle cx=\"8\" cy=\"10\" r=\"1.5\"/><circle cx=\"16\" cy=\"10\" r=\"1.5\"/><path d=\"M12 6V3M6 3h12M7 14h10M6 18v4M18 18v4\"/>", "robot-2")
export const IconAi = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 6v3M12 15v3M6 12h3M15 12h3M8.5 8.5L10 10M14 14l1.5 1.5M15.5 8.5L14 10M10 14l-1.5 1.5\"/>", "ai")
export const IconChip = makeIcon("<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3\"/>", "chip")
export const IconQuantum = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12c0-5 4-9 9-9M21 12c0 5-4 9-9 9M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18\"/>", "quantum")
export const IconBitcoin = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9 6v12M11 6v12M9 6h4a3 3 0 0 1 0 6H9M9 12h5a3 3 0 0 1 0 6H9\"/>", "bitcoin")
export const IconEthereum = makeIcon("<path d=\"M12 2L5 12l7 4 7-4zM5 14l7 8 7-8-7 4z\"/>", "ethereum")
export const IconQrcode = makeIcon("<rect x=\"3\" y=\"3\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"15\" y=\"3\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"/><path d=\"M15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z\"/>", "qrcode")
export const IconBarCode2 = makeIcon("<path d=\"M3 5v14M6 5v14M8 5v14M11 5v14M13 5v14M15 5v14M18 5v14M20 5v14\"/>", "bar-code-2")
export const IconSword = makeIcon("<path d=\"M14 4l6 6-9 9-4 1-1-4zM3 21l3-3M18 3l3 3\"/>", "sword")
export const IconShield2 = makeIcon("<path d=\"M12 2l9 3v6c0 5-4 9-9 11-5-2-9-6-9-11V5z\"/>", "shield2")
export const IconShieldSword = makeIcon("<path d=\"M12 2l9 3v6c0 5-4 9-9 11-5-2-9-6-9-11V5zM12 7v10M9 11l3-3 3 3M9 15l3 3 3-3\"/>", "shield-sword")
export const IconDagger = makeIcon("<path d=\"M10 4l2-2 2 2-1 12h-2zM9 16h6v3H9zM8 19h8v2H8zM12 5v6\"/>", "dagger")
export const IconBow = makeIcon("<path d=\"M4 4a16 16 0 0 1 16 16M4 4l2 8-2 8M20 20l-8 2-8-2M6 12h12M12 8v8\"/>", "bow")
export const IconArrow = makeIcon("<path d=\"M3 21l18-18M21 3l-6 1 5 5zM21 3l-1 6-5-5z\"/>", "arrow")
export const IconTarget2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/><path d=\"M3 3L6 6M21 3l-3 3M3 21l3-3M21 21l-3-3\"/>", "target2")
export const IconHelmet = makeIcon("<path d=\"M4 14c0-5 4-9 8-9s8 4 8 9v3H4zM2 17h20v3H2zM9 5V3M15 5V3M12 5V2\"/>", "helmet")
export const IconMilitaryHelmet = makeIcon("<path d=\"M5 12c0-4 3-7 7-7s7 3 7 7v4H5zM3 16h18v4H3zM9 5V3M15 5V3\"/>", "military-helmet")
export const IconGrenade = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"6\"/><path d=\"M9 8V6h6v2M12 6V3M14 3l2-2M9 12h.01M15 12h.01M12 12v.01\"/>", "grenade")
export const IconBomb = makeIcon("<circle cx=\"12\" cy=\"16\" r=\"6\"/><path d=\"M10 10l-1-2M14 10l1-2M15 8l2-1M17 7l1-1M18 6l1 1M16 6l.5-.5M18 8l.5-.5\"/>", "bomb")
export const IconTank = makeIcon("<path d=\"M2 18v-4h16v4zM18 14l2-3h2v3M6 14V8h8v6M14 11h6M4 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/>", "tank")
export const IconWarship = makeIcon("<path d=\"M3 18l2-4h14l2 4-3 3-3-3-3 3-3-3-3 3zM6 14V6h12v8M10 6V4M14 6V4M12 8v6\"/>", "warship")
export const IconFighter = makeIcon("<path d=\"M12 2l4 10-4 2-4-2zM8 14l-6 2v2l6-1M16 14l6 2v2l-6-1M9 20h6M12 22V18\"/>", "fighter")
export const IconFighterJet = makeIcon("<path d=\"M12 2l4 10-4 2-4-2zM8 14l-6 2v2l6-1M16 14l6 2v2l-6-1M9 20h6M12 22V18\"/>", "fighter-jet")
export const IconMissile = makeIcon("<path d=\"M12 2c3 3 4 8 4 12l-4 2-4-2c0-4 1-9 4-12zM8 14l-2 4 2-1 4 3 4-3 2 1-2-4M10 22h4\"/>", "missile")
export const IconRadar = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 12L6 8M12 3a9 9 0 0 1 8 5M3 12h3M18 12h3\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>", "radar")
export const IconWalkieTalkie = makeIcon("<rect x=\"6\" y=\"6\" width=\"12\" height=\"16\" rx=\"2\"/><path d=\"M9 6V2h6v4M9 10h6M9 14h6M10 18h.01M14 18h.01M12 22v-2\"/>", "walkie-talkie")
export const IconBinoculars = makeIcon("<circle cx=\"6\" cy=\"12\" r=\"4\"/><circle cx=\"18\" cy=\"12\" r=\"4\"/><path d=\"M6 8V4M18 8V4M9 8h6M9 10h6M3 12h-1M22 12h-1\"/>", "binoculars")
export const IconScope = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3\"/>", "scope")
export const IconMedal2 = makeIcon("<circle cx=\"12\" cy=\"9\" r=\"5\"/><path d=\"M9 14l-3 8 6-3 6 3-3-8M7 3h10l-3 5M17 3l-3 5\"/>", "medal2")
export const IconMilitaryMedal = makeIcon("<circle cx=\"12\" cy=\"9\" r=\"5\"/><path d=\"M9 14l-3 8 6-3 6 3-3-8M7 3h10l-3 5M17 3l-3 5\"/>", "military-medal")
export const IconMicroscope2 = makeIcon("<path d=\"M6 18h8M3 22h18M14 22a7 7 0 1 0-7-7M9 14l2-2M12 3l4 4M10 5l4 4\"/>", "microscope-2")
export const IconTelescope3 = makeIcon("<path d=\"M4 20l6-8M2 14l8 6-2 2-8-6zM12 12l9-9 1 1-9 9zM3 21h12M21 21h-3M16 3l5 5\"/>", "telescope-3")
export const IconBarometer = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 12l3-3M12 3v2M12 19v2M3 12h2M19 12h2\"/>", "barometer")
export const IconAnemometer = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3\"/>", "anemometer")
export const IconSeismograph = makeIcon("<rect x=\"3\" y=\"10\" width=\"18\" height=\"8\" rx=\"1\"/><path d=\"M3 14h18M6 10V6M18 10V6M12 2v4M9 6l3 4 3-4\"/>", "seismograph")
export const IconGeigerCounter = makeIcon("<rect x=\"4\" y=\"6\" width=\"16\" height=\"14\" rx=\"2\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/><path d=\"M12 6V3M10 3h4M9 17h6M7 20h.01M17 20h.01\"/>", "geiger-counter")
export const IconSpectrometer = makeIcon("<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"1\"/><path d=\"M3 12h18M6 12v4M10 12v4M14 12v4M18 12v4M6 6v6M18 6v6\"/>", "spectrometer")
export const IconOscilloscope = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"14\" rx=\"1\"/><path d=\"M4 12c2-3 4 3 6 0s4 3 6 0 4 3 6 0M4 8h2M6 16h2M16 8h4M16 16h4\"/>", "oscilloscope")
export const IconMultimeter = makeIcon("<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><path d=\"M4 10h16M8 6h.01M12 6h.01M16 6h.01\"/><circle cx=\"12\" cy=\"15\" r=\"3\"/>", "multimeter")
export const IconVoltmeter = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 15l3-6 3 6M12 3v2M12 19v2M3 12h2M19 12h2\"/>", "voltmeter")
export const IconThermometer3 = makeIcon("<path d=\"M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM10 8h4M10 12h4M12 18h.01\"/>", "thermometer-3")
export const IconBalanceScale = makeIcon("<path d=\"M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2\"/>", "balance-scale")
export const IconWeighingScale = makeIcon("<rect x=\"2\" y=\"12\" width=\"20\" height=\"8\" rx=\"1\"/><path d=\"M6 20v-4M18 20v-4M2 12l4-8h12l4 8M9 8h6M9 4h6\"/>", "weighing-scale")
export const IconCentrifuge2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 3v3M12 18v3M3 12h3M18 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2\"/>", "centrifuge-2")
export const IconAutoclave = makeIcon("<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M4 10h16M9 4v4M15 4v4M9 16h6M8 20h.01M16 20h.01\"/>", "autoclave")
export const IconIncubator = makeIcon("<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 10h18M7 6h.01M17 6h.01M12 14v3M9 15h6\"/>", "incubator")
export const IconPetriDish = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"7\"/><circle cx=\"14\" cy=\"10\" r=\"1\"/><circle cx=\"9\" cy=\"13\" r=\"1\"/><circle cx=\"13\" cy=\"14\" r=\"1\"/>", "petri-dish")
export const IconCultureTube = makeIcon("<path d=\"M10 2h4v10l2 4v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4l2-4zM10 6h4M10 14h4\"/>", "culture-tube")
export const IconMagneticStirrer = makeIcon("<rect x=\"3\" y=\"10\" width=\"18\" height=\"8\" rx=\"2\"/><circle cx=\"12\" cy=\"14\" r=\"3\"/><path d=\"M6 10V6M18 10V6M9 6h6\"/>", "magnetic-stirrer")
export const IconHotPlate = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\"/><circle cx=\"8\" cy=\"12\" r=\"2\"/><circle cx=\"16\" cy=\"12\" r=\"2\"/><path d=\"M12 6v12M5 18h.01M19 18h.01\"/>", "hot-plate")
export const IconFumeHood = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"18\" rx=\"1\"/><path d=\"M2 8h20M8 8v13M16 8v13M11 12v4M13 12v4\"/>", "fume-hood")
export const IconVacuumPump = makeIcon("<rect x=\"4\" y=\"8\" width=\"16\" height=\"10\" rx=\"2\"/><circle cx=\"9\" cy=\"13\" r=\"3\"/><path d=\"M9 10v-2M20 13h2M4 13H2M6 18v2M18 18v2\"/>", "vacuum-pump")
export const IconMicroPipette = makeIcon("<path d=\"M10 2h4v9l1 2v5a3 3 0 0 1-6 0v-5l1-2zM10 6h4M10 12h4\"/>", "micro-pipette")
export const IconSampleVial = makeIcon("<path d=\"M9 2h6v4l1 2v13a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V8l1-2zM9 6h6M9 12h6M9 18h6\"/>", "sample-vial")
export const IconDesk = makeIcon("<rect x=\"2\" y=\"12\" width=\"20\" height=\"4\" rx=\"1\"/><path d=\"M4 16v6M20 16v6M8 12V6h8v6M2 8h20\"/>", "desk")
export const IconOfficeChair = makeIcon("<circle cx=\"12\" cy=\"4\" r=\"2\"/><path d=\"M8 6v6h8V6M12 12v6M7 20h10M9 22l3-2 3 2\"/>", "office-chair")
export const IconMeetingRoom = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"14\" rx=\"1\"/><path d=\"M2 11h20M12 4v7M6 15v3M18 15v3M6 15a1 1 0 1 0 0-2M18 13a1 1 0 1 0 0 2\"/>", "meeting-room")
export const IconProjector2 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"10\" rx=\"2\"/><circle cx=\"10\" cy=\"9\" r=\"2\"/><path d=\"M18 7v4M6 14v4M18 14v4M10 18h4\"/>", "projector2")
export const IconWhiteboard = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"1\"/><path d=\"M6 17v4M18 17v4M4 7h16M4 11h10M4 14h14\"/>", "whiteboard")
export const IconWhiteboard2 = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"1\"/><path d=\"M6 17v4M18 17v4M6 7h4M6 11h8M6 14h6\"/>", "whiteboard-2")
export const IconBulletinBoard = makeIcon("<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"1\"/><path d=\"M6 3v14M18 3v14M6 6h4v4H6zM14 10h4v4h-4zM10 14h4v4h-4z\"/>", "bulletin-board")
export const IconPenHolder = makeIcon("<path d=\"M4 10h16v12H4zM4 14h16M8 6l2-4M12 6V2M16 6l-2-4\"/>", "pen-holder")
export const IconPaperClip3 = makeIcon("<path d=\"M8 4l8 4v10a4 4 0 0 1-8 0V4M8 4a4 4 0 0 1 8 0v2\"/>", "paper-clip-3")
export const IconStaple = makeIcon("<path d=\"M6 10h12v4H6zM6 14v4h12v-4M10 10V6h4v4\"/>", "staple")
export const IconFileCabinet = makeIcon("<rect x=\"3\" y=\"2\" width=\"18\" height=\"20\" rx=\"1\"/><path d=\"M3 8h18M3 14h18M9 5h6M9 11h6M9 17h6\"/>", "file-cabinet")
export const IconFilingCabinet = makeIcon("<rect x=\"3\" y=\"2\" width=\"18\" height=\"20\" rx=\"1\"/><path d=\"M3 8h18M3 14h18M9 5h6M9 11h6M9 17h6\"/>", "filing-cabinet")
export const IconOfficeDesk = makeIcon("<rect x=\"2\" y=\"12\" width=\"20\" height=\"4\" rx=\"1\"/><path d=\"M4 16v6M20 16v6M12 12V4M4 4h16M4 8h16\"/>", "office-desk")
export const IconStamp2 = makeIcon("<path d=\"M6 8h12v6H6zM8 14v4h8v-4M10 8V4h4v4M4 20h16v2H4z\"/>", "stamp-2")
export const IconSignature = makeIcon("<path d=\"M3 18c3-6 6-6 8-3s3 4 6 0 4-8 4-8M3 20h18\"/>", "signature")
export const IconParaphe = makeIcon("<path d=\"M3 18c3-6 6-6 8-3M12 12c3 4 5 4 7-2M12 4v6M8 8h8\"/>", "paraphe")
export const IconHandshake = makeIcon("<path d=\"M2 12l3-3 4 3 3-3 4 3 3-3M5 9l3-3 4 3M15 9l3-3M8 15l4 4 4-4M12 19l3 3M4 14l3 3\"/>", "handshake")
export const IconBusinessCard = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\"/><circle cx=\"7\" cy=\"11\" r=\"2\"/><path d=\"M5 16a2 2 0 0 1 4 0M12 10h6M12 14h4\"/>", "business-card")
export const IconNameBadge = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 8h18\"/><circle cx=\"12\" cy=\"13\" r=\"2\"/><path d=\"M8 18a4 4 0 0 1 8 0\"/>", "name-badge")
export const IconBriefcase2 = makeIcon("<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M9 12v2h6v-2\"/>", "briefcase-2")
export const IconBriefcase3 = makeIcon("<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M9 12h6M12 12v4\"/>", "briefcase-3")
export const IconDragHandle = makeIcon("<path d=\"M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01\"/>", "drag-handle")
export const IconDragHandle2 = makeIcon("<path d=\"M9 6h.01M15 6h.01M9 12h.01M15 12h.01\"/>", "drag-handle-2")
export const IconResize = makeIcon("<path d=\"M3 3l4 4M21 3l-4 4M3 21l4-4M21 21l-4-4M12 8v-5M12 21v-5M8 12H3M21 12h-5\"/>", "resize")
export const IconResizeCorner = makeIcon("<path d=\"M21 21L11 21M21 21L21 11M21 21L15 15M21 15L15 21\"/>", "resize-corner")
export const IconResizeHorizontal = makeIcon("<path d=\"M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4\"/>", "resize-horizontal")
export const IconResizeVertical = makeIcon("<path d=\"M12 3v18M12 3l-4 4M12 3l4 4M12 21l-4-4M12 21l4-4\"/>", "resize-vertical")
export const IconMaximize2 = makeIcon("<path d=\"M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3\"/>", "maximize2")
export const IconMinimize2 = makeIcon("<path d=\"M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3\"/>", "minimize2")
export const IconCornerArrow = makeIcon("<path d=\"M20 4H8a4 4 0 0 0 0 8h4v4l-4-4 4-4M16 8l4 4-4 4\"/>", "corner-arrow")
export const IconSplit = makeIcon("<path d=\"M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4\"/>", "split")
export const IconSplitH = makeIcon("<path d=\"M3 12h18M7 8L3 12l4 4M17 8l4 4-4 4\"/>", "split-h")
export const IconMerge = makeIcon("<path d=\"M8 6v6a4 4 0 0 0 4 4h8M16 12l4 4-4 4M8 6H4M6 4L4 6l2 2\"/>", "merge")
export const IconLayoutDashboard = makeIcon("<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>", "layout-dashboard")
export const IconLayoutList = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M3 9h18M3 15h18M9 3v18\"/>", "layout-list")
export const IconLayoutSidebar = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M9 3v18\"/>", "layout-sidebar")
export const IconLayoutKanban = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"/><path d=\"M9 3v18M15 3v18\"/>", "layout-kanban")
export const IconLayoutMasonry = makeIcon("<rect x=\"3\" y=\"3\" width=\"7\" height=\"10\" rx=\"1\"/><rect x=\"3\" y=\"13\" width=\"7\" height=\"8\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"6\" rx=\"1\"/><rect x=\"14\" y=\"9\" width=\"7\" height=\"12\" rx=\"1\"/>", "layout-masonry")
export const IconCloudDownload = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><path d=\"M12 12v6M9 15l3 3 3-3\"/>", "cloud-download")
export const IconCloudUpload = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><path d=\"M12 21v-6M9 18l3-3 3 3\"/>", "cloud-upload")
export const IconCloudCheck = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><path d=\"M9 13l2 2 4-4\"/>", "cloud-check")
export const IconCloudX = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><path d=\"M10 12l5 5M15 12l-5 5\"/>", "cloud-x")
export const IconCloudOff = makeIcon("<path d=\"M3 3l18 18M18 16a5 5 0 0 0-1.5-9.8A6 6 0 0 0 6.5 8M6 16a4 4 0 0 1 0-8M18 16H6\"/>", "cloud-off")
export const IconSnow = makeIcon("<path d=\"M2 12h4M18 12h4M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8M12 8l2 2-2 2-2-2zM8 12l-2 2 2 2M16 12l2 2-2 2\"/>", "snow")
export const IconBlizzard = makeIcon("<path d=\"M4 6h.01M8 6h.01M12 6h.01M16 6h.01M20 6h.01M4 10h.01M8 10h.01M12 10h.01M16 10h.01M20 10h.01M4 14h.01M8 14h.01M12 14h.01M16 14h.01M20 14h.01M4 18h.01M8 18h.01M12 18h.01M16 18h.01M20 18h.01\"/>", "blizzard")
export const IconHot = makeIcon("<path d=\"M12 22s-4-4-4-8a4 4 0 0 1 4-4 4 4 0 0 1 4 4c0 4-4 8-4 8zM12 6a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2zM8 4a4 4 0 0 0 0 8M16 4a4 4 0 0 1 0 8\"/>", "hot")
export const IconCold = makeIcon("<path d=\"M12 3v18M6 9l6 3 6-3M6 15l6-3 6 3M3 12h3M18 12h3M3 6h3M18 6h3M3 18h3M18 18h3M6 3h3M15 3h3M6 21h3M15 21h3\"/>", "cold")
export const IconTemperatureHigh = makeIcon("<path d=\"M12 3v18M8 7l4 4 4-4M8 14h8M8 19h8\"/>", "temperature-high")
export const IconTemperatureLow = makeIcon("<path d=\"M12 3v18M8 17l4-4 4 4M8 10h8M8 5h8\"/>", "temperature-low")
export const IconSunDim = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1\"/>", "sun-dim")
export const IconSunMedium = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1\"/>", "sun-medium")
export const IconSunBright = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1\"/>", "sun-bright")
export const IconHaze = makeIcon("<path d=\"M4 8h16M4 12h16M4 16h16M4 20h16M6 4h12\"/>", "haze")
export const IconMist = makeIcon("<path d=\"M4 6h16M4 10h16M4 14h16M4 18h16\"/>", "mist")
export const IconSmog = makeIcon("<path d=\"M4 6h16M4 10h16M4 14h16M4 18h16M8 2h.01M12 2h.01M16 2h.01\"/>", "smog")
export const IconBagpipes = makeIcon("<path d=\"M8 6a4 4 0 1 1 8 0v6H8zM12 12v8M9 20h6M5 4l3 2M19 4l-3 2M6 6v10M18 6v10\"/>", "bagpipes")
export const IconLute = makeIcon("<circle cx=\"11\" cy=\"16\" r=\"6\"/><path d=\"M11 10V2l7 3-7 3M8 18h.01M13 18h.01M11 13h.01\"/>", "lute")
export const IconUkulele = makeIcon("<circle cx=\"12\" cy=\"14\" r=\"7\"/><path d=\"M12 7V2M10 2h4M9 12h.01M15 12h.01M12 11v6\"/>", "ukulele")
export const IconSitar = makeIcon("<circle cx=\"12\" cy=\"16\" r=\"6\"/><path d=\"M12 10V2M9 2h6M9 14h6M5 22l14-2\"/>", "sitar")
export const IconBalalaika = makeIcon("<path d=\"M12 2 L18 12 L12 22 L6 12 Z M12 8v6M9 22h6\"/>", "balalaika")
export const IconZither = makeIcon("<rect x=\"2\" y=\"8\" width=\"20\" height=\"8\" rx=\"1\"/><path d=\"M5 8v8M8 8v8M11 8v8M14 8v8M17 8v8M20 8v8\"/>", "zither")
export const IconSteelDrum = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3v9M6 6l6 6M18 6l-6 6M6 18l6-6M18 18l-6-6\"/>", "steel-drum")
export const IconWindChime = makeIcon("<path d=\"M12 2v4M10 6h4M8 8h8M6 10h12M4 12h16M6 14v6M10 14v6M14 14v6M18 14v6M8 20h8\"/>", "wind-chime")
export const IconBeaker2 = makeIcon("<path d=\"M5 3h14l-4 8v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8zM8 14h8\"/>", "beaker2")
export const IconErlenmeyer = makeIcon("<path d=\"M8 2h8v7l4 10a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l4-10zM5 15h14M10 2v7\"/>", "erlenmeyer")
export const IconVolumetricFlask = makeIcon("<circle cx=\"12\" cy=\"15\" r=\"5\"/><path d=\"M10 2h4v8l3 5a4 4 0 1 1-10 0l3-5zM10 10h4\"/>", "volumetric-flask")
export const IconWatchGlass = makeIcon("<path d=\"M4 14a8 4 0 0 1 16 0 8 2 0 0 1-16 0M12 10v4\"/>", "watch-glass")
export const IconDesiccator = makeIcon("<circle cx=\"12\" cy=\"16\" r=\"6\"/><path d=\"M6 16V6h12v10M4 16h16M8 6V4h8v2\"/>", "desiccator")
export const IconMortarPestle = makeIcon("<path d=\"M4 12a8 8 0 0 0 16 0zM12 12V6M8 4l4 2 4-2M6 20h12\"/>", "mortar-pestle")
export const IconWeighingBoat = makeIcon("<path d=\"M4 14l2 6h12l2-6zM6 14V8h12v6M8 8V6h8v2\"/>", "weighing-boat")
export const IconMagneticBar = makeIcon("<rect x=\"3\" y=\"10\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M3 10h4v4H3zM17 10h4v4h-4z\"/>", "magnetic-bar")
export const IconPhStrip = makeIcon("<rect x=\"3\" y=\"3\" width=\"4\" height=\"18\" rx=\"1\"/><rect x=\"8\" y=\"3\" width=\"4\" height=\"18\" rx=\"1\"/><rect x=\"13\" y=\"3\" width=\"4\" height=\"18\" rx=\"1\"/><rect x=\"18\" y=\"3\" width=\"4\" height=\"18\" rx=\"1\"/>", "ph-strip")
export const IconTestTube2 = makeIcon("<path d=\"M12 2v16a4 4 0 0 1-8 0V2M4 2h8M4 8h8M4 14h8\"/><path d=\"M16 6v12a4 4 0 0 0 4 4\"/>", "test-tube-2")
export const IconStar2 = makeIcon("<path d=\"M12 2l2 7 7 1-5 5 1 7-5-3-5 3 1-7-5-5 7-1z\"/>", "star-2")
export const IconMoonCrescent2 = makeIcon("<path d=\"M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z\"/>", "moon-crescent-2")
export const IconPlanet2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M3 9c3-1 15-3 18-1M3 15c3 1 15 3 18 1\"/>", "planet2")
export const IconComet2 = makeIcon("<circle cx=\"8\" cy=\"8\" r=\"3\"/><path d=\"M6 10l-3 3M10 6l1-3M2 8h-2M11 8l5 5M8 14l2 8\"/>", "comet-2")
export const IconStarShower = makeIcon("<path d=\"M2 2l3 3M5 5l-2 3M8 8l2-3M5 8l-3 2M3 3l3 2M11 3l3 3M14 6l-2 3M11 9l-3 2M6 12l3-3M14 9l2-3\"/>", "star-shower")
export const IconObservatory2 = makeIcon("<path d=\"M2 21h20v-2H2zM5 19l7-13 7 13M8 13h8M12 4l-5 7M12 4l5 7\"/>", "observatory-2")
export const IconSpaceHelmet = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V8a5 5 0 0 1 5-5zM8 9h.01M16 9h.01M10 13h4\"/>", "space-helmet")
export const IconStarMap = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M6 6l3 3M15 6l-3 3M6 18l3-3M15 18l-3-3M12 3v2M12 19v2M3 12h2M19 12h2\"/>", "star-map")
export const IconThermometer3 = makeIcon("<path d=\"M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8\"/>", "thermometer3")
export const IconOtoscope2 = makeIcon("<circle cx=\"12\" cy=\"9\" r=\"5\"/><path d=\"M12 14v6M9 20h6M8 6a4 4 0 0 1 8 0\"/>", "otoscope2")
export const IconOphthalmoscope = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M6 4L4 2M18 4l2-2M6 20l-2 2M18 20l2 2\"/>", "ophthalmoscope")
export const IconScalpel2 = makeIcon("<path d=\"M14 4l6 6-4 4-8-2-6 6v2h2l6-6 2 8 4-4-2-8 2-2z\"/>", "scalpel2")
export const IconSuture2 = makeIcon("<path d=\"M2 12h4M18 12h4M6 12a2 2 0 1 0 4 0M14 12a2 2 0 1 0 4 0M10 12h4\"/>", "suture2")
export const IconIvBag = makeIcon("<path d=\"M8 2h8v10l-2 3v5a2 2 0 0 1-4 0v-5l-2-3zM10 2V1h4v1M10 6h4M10 10h4\"/>", "iv-bag")
export const IconCatheter = makeIcon("<path d=\"M4 12h8M12 12a4 4 0 0 1 8 0v6a2 2 0 0 1-4 0v-6\"/>", "catheter")
export const IconPacemaker2 = makeIcon("<rect x=\"4\" y=\"8\" width=\"16\" height=\"10\" rx=\"3\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/><path d=\"M8 3v5M16 3v5M10 13h.01M14 13h.01\"/>", "pacemaker2")
export const IconDefib = makeIcon("<rect x=\"3\" y=\"7\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M12 10v6M9 13h6M7 19v3M17 19v3\"/>", "defib")
export const IconVentilator = makeIcon("<rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2\"/><circle cx=\"9\" cy=\"12\" r=\"3\"/><path d=\"M17 10v8M15 12h4M15 14h4M15 16h4M6 20v2M18 20v2\"/>", "ventilator")
export const IconMonorail = makeIcon("<path d=\"M4 6h16v10H4zM4 10h16M8 16v4M16 16v4M10 2v4M14 2v4M12 2v2M9 20h6\"/>", "monorail")
export const IconFunicular = makeIcon("<path d=\"M4 8l16-4v10L4 18zM4 8v10l16 4M4 14l16-4M8 12v2M16 8v2\"/>", "funicular")
export const IconGondola = makeIcon("<path d=\"M3 16c0 3 4 5 9 5s9-2 9-5c0-2-4-4-9-4s-9 2-9 4zM6 12l6-3 6 3M4 14l16 2\"/>", "gondola")
export const IconCatamaran = makeIcon("<path d=\"M2 16l2-4h16l2 4-3 3-3-3-3 3-3-3-3 3zM6 12l6-4 6 4M9 12h6\"/>", "catamaran")
export const IconHovercraft = makeIcon("<path d=\"M2 16h20v3a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zM6 10h12v4H6zM10 4h4v6h-4z\"/>", "hovercraft")
export const IconAirTaxi = makeIcon("<path d=\"M4 16h12l4-4v-2L8 12zM12 12v6M8 18l-2 4M16 18l2 4\"/><circle cx=\"8\" cy=\"21\" r=\"1.5\"/><circle cx=\"16\" cy=\"21\" r=\"1.5\"/>", "air-taxi")
export const IconSegway = makeIcon("<circle cx=\"12\" cy=\"4\" r=\"2\"/><path d=\"M12 6v8M6 14h12v4H6zM6 18v4M18 18v4M9 14v4M15 14v4\"/><circle cx=\"8\" cy=\"22\" r=\"1.5\"/><circle cx=\"16\" cy=\"22\" r=\"1.5\"/>", "segway")
export const IconUnicycle = makeIcon("<circle cx=\"12\" cy=\"4\" r=\"2\"/><circle cx=\"12\" cy=\"15\" r=\"6\"/><path d=\"M12 6v9M9 21h6M15 15l-3-6M9 15l3-6\"/>", "unicycle")
export const IconSkateboard = makeIcon("<path d=\"M2 16h20v3H2zM4 19v2M20 19v2M6 10h12v4H6zM9 6h6v4H9z\"/>", "skateboard")
export const IconRoller = makeIcon("<path d=\"M4 10h16v6H4zM4 16v4M20 16v4M9 6h6v4H9zM12 2v4\"/><circle cx=\"8\" cy=\"21\" r=\"1\"/><circle cx=\"16\" cy=\"21\" r=\"1\"/>", "roller")
export const IconBathtub = makeIcon("<path d=\"M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10V6a2 2 0 0 1 4 0v4M4 18v2M20 18v2M2 12h20M12 4v6\"/>", "bathtub")
export const IconShower = makeIcon("<path d=\"M6 4h12v6H6zM6 6H2M6 8H2M10 10v8a4 4 0 0 0 8 0M12 20h.01M14 18h.01M16 16h.01M18 14h.01\"/>", "shower")
export const IconSink = makeIcon("<path d=\"M4 8h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 8V4h4M12 4h6\"/><circle cx=\"12\" cy=\"14\" r=\"2\"/>", "sink")
export const IconToilet = makeIcon("<circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M9 9v6c0 3 2 5 3 5s3-2 3-5V9M6 20h12M12 9v11\"/>", "toilet")
export const IconUrinal = makeIcon("<path d=\"M5 4h14v10a7 7 0 0 1-14 0zM12 4V2M8 8h.01M12 8h.01M16 8h.01\"/>", "urinal")
export const IconStool = makeIcon("<path d=\"M6 10h12v4H6zM6 14l-2 6M18 14l2 6M4 20h4M16 20h4M12 10v4\"/>", "stool")
export const IconSideTable = makeIcon("<path d=\"M3 10h18v3H3zM6 13v9M18 13v9M4 10V6h16v4M9 6v4M15 6v4\"/>", "side-table")
export const IconShelf = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"1\"/><path d=\"M2 10h20M2 16h20M8 4v6M16 4v6M8 10v6M16 10v6M8 16v4M16 16v4\"/>", "shelf")
export const IconCoatRack = makeIcon("<path d=\"M4 22h16M12 4v18M8 8h8M6 6l6 2 6-2M8 4h8\"/>", "coat-rack")
export const IconShoeRack = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"14\" rx=\"1\"/><path d=\"M2 11h20M2 16h20M7 6v14M17 6v14M6 9h.01M12 9h.01M18 9h.01M6 14h.01M12 14h.01M18 14h.01M6 19h.01M12 19h.01M18 19h.01\"/>", "shoe-rack")
export const IconBookShelf = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"1\"/><path d=\"M2 10h20M2 16h20M5 6h2v4H5zM9 6h2v4H9zM13 6h2v4h-2zM5 12h2v4H5zM9 12h2v4H9zM13 12h2v4h-2zM17 12h2v4h-2zM5 18h2v2H5zM9 18h2v2H9z\"/>", "book-shelf")
export const IconCpu2 = makeIcon("<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><path d=\"M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3M7 7h.01M17 7h.01M7 17h.01M17 17h.01\"/>", "cpu-2")
export const IconGpu = makeIcon("<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M6 10v4M18 10v4M4 18v3M20 18v3M7 6V3M17 6V3\"/>", "gpu")
export const IconRam = makeIcon("<rect x=\"2\" y=\"8\" width=\"20\" height=\"8\" rx=\"1\"/><path d=\"M4 10v4M6 10v4M8 10v4M10 10v4M12 10v4M14 10v4M16 10v4M18 10v4M20 10v4M7 16v3M12 16v3M17 16v3\"/>", "ram")
export const IconSsd = makeIcon("<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M6 10h12M6 14h8\"/><circle cx=\"17\" cy=\"15\" r=\"1.5\"/>", "ssd")
export const IconMotherboard = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M6 6h.01M18 6h.01M6 18h.01M18 18h.01M4 12h4M16 12h4M12 4v4M12 16v4\"/>", "motherboard")
export const IconPowerSupply = makeIcon("<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"1\"/><circle cx=\"10\" cy=\"12\" r=\"4\"/><path d=\"M17 8v8M20 10v4M8 6V3M16 6V3M4 18v3M20 18v3\"/>", "power-supply")
export const IconCpuFan = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"7\"/><path d=\"M8 8l8 8M16 8l-8 8M12 5v4M12 15v4M5 12h4M15 12h4\"/>", "cpu-fan")
export const IconHeatsink = makeIcon("<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"1\"/><path d=\"M6 4v16M9 4v16M12 4v16M15 4v16M18 4v16M6 8h12M6 12h12M6 16h12\"/>", "heatsink")
export const IconServerRack = makeIcon("<rect x=\"3\" y=\"2\" width=\"18\" height=\"20\" rx=\"1\"/><path d=\"M3 8h18M3 14h18M3 20h18M6 5h.01M6 11h.01M6 17h.01M10 5h8M10 11h8M10 17h8\"/>", "server-rack")
export const IconDataCenter = makeIcon("<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"1\"/><path d=\"M2 7h20M2 12h20M2 17h20M6 4h.01M10 4h6M6 9h.01M10 9h6M6 14h.01M10 14h6M6 19h.01M10 19h6\"/>", "data-center")
export const IconCloudServer = makeIcon("<path d=\"M6 16a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 0 1 18 16\"/><rect x=\"7\" y=\"16\" width=\"10\" height=\"6\" rx=\"1\"/><path d=\"M9 19h.01M12 19h.01M15 19h.01\"/>", "cloud-server")
export const IconEdgeComputing = makeIcon("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 8V6M12 18v-2M8 12H6M18 12h-2M7 7l2 2M17 17l-2-2M7 17l2-2M17 7l-2 2\"/>", "edge-computing")
export const IconBlockchain = makeIcon("<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><path d=\"M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4M6.5 10L10 6.5M17.5 10L14 6.5M6.5 14L10 17.5M17.5 14L14 17.5\"/>", "blockchain")
export const IconBeaker2 = makeIcon("<path d=\"M5 3h14l-4 8v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8zM8 14h8\"/>", "beaker-2")
export const IconTestTube3 = makeIcon("<path d=\"M12 2v16a4 4 0 0 1-8 0V2M4 2h8M4 8h8M4 14h8M16 6v12a4 4 0 0 0 4 4\"/>", "test-tube-3")
export const IconPlanet2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M3 9c3-1 15-3 18-1M3 15c3 1 15 3 18 1\"/>", "planet-2")
export const IconThermometer4 = makeIcon("<path d=\"M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM12 10v8\"/>", "thermometer-4")
export const IconOtoscope2 = makeIcon("<circle cx=\"12\" cy=\"9\" r=\"5\"/><path d=\"M12 14v6M9 20h6M8 6a4 4 0 0 1 8 0\"/>", "otoscope-2")
export const IconScalpel3 = makeIcon("<path d=\"M14 4l6 6-4 4-8-2-6 6v2h2l6-6 2 8 4-4-2-8 2-2z\"/>", "scalpel-3")
export const IconSuture2 = makeIcon("<path d=\"M2 12h4M18 12h4M6 12a2 2 0 1 0 4 0M14 12a2 2 0 1 0 4 0M10 12h4\"/>", "suture-2")
export const IconPacemaker2 = makeIcon("<rect x=\"4\" y=\"8\" width=\"16\" height=\"10\" rx=\"3\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/><path d=\"M8 3v5M16 3v5M10 13h.01M14 13h.01\"/>", "pacemaker-2")
export const IconDefib2 = makeIcon("<rect x=\"3\" y=\"7\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M12 10v6M9 13h6M7 19v3M17 19v3\"/>", "defib-2")
export const IconRollerSkate = makeIcon("<path d=\"M4 10h16v6H4zM4 16v4M20 16v4M9 6h6v4H9zM12 2v4\"/><circle cx=\"8\" cy=\"21\" r=\"1\"/><circle cx=\"16\" cy=\"21\" r=\"1\"/>", "roller-skate")
export const IconSink2 = makeIcon("<path d=\"M4 8h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 8V4h4M12 4h6\"/><circle cx=\"12\" cy=\"14\" r=\"2\"/>", "sink-2")
export const IconToilet2 = makeIcon("<circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M9 9v6c0 3 2 5 3 5s3-2 3-5V9M6 20h12M12 9v11\"/>", "toilet-2")
export const IconUrinal2 = makeIcon("<path d=\"M5 4h14v10a7 7 0 0 1-14 0zM12 4V2M8 8h.01M12 8h.01M16 8h.01\"/>", "urinal-2")
export const IconShelf2 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"1\"/><path d=\"M2 10h20M2 16h20M8 4v6M16 4v6M8 10v6M16 10v6M8 16v4M16 16v4\"/>", "shelf-2")
export const IconBookShelf2 = makeIcon("<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"1\"/><path d=\"M2 10h20M2 16h20M5 6h2v4H5zM9 6h2v4H9zM13 6h2v4h-2zM5 12h2v4H5zM9 12h2v4H9zM13 12h2v4h-2zM17 12h2v4h-2zM5 18h2v2H5zM9 18h2v2H9z\"/>", "book-shelf-2")
export const IconAward2 = makeIcon("<circle cx=\"12\" cy=\"8\" r=\"5\"/><path d=\"M9 13l-3 9 6-3 6 3-3-9\"/>", "award-2")
export const IconTrophy2 = makeIcon("<path d=\"M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M6 5h12v6a6 6 0 0 1-12 0zM9 17h6M10 21h4M12 17v4\"/>", "trophy-2")
export const IconCertificate = makeIcon("<path d=\"M6 3h12v12H6zM9 7h6M9 11h6M12 15v6M10 19l2 2 2-2\"/>", "certificate")
export const IconBadgeCheck = makeIcon("<circle cx=\"12\" cy=\"10\" r=\"8\"/><path d=\"M9 10l2 2 4-4M9 16l-3 6 3-1 3 1 3-1 3 1-3-6\"/>", "badge-check")
export const IconRibbon = makeIcon("<path d=\"M12 2l3 4 5 1-3 4 3 4-5 1-3 4-3-4-5-1 3-4-3-4 5-1z\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>", "ribbon")
export const IconCrown2 = makeIcon("<path d=\"M4 18h16l1-10-4 3-3-6-3 6-4-3zM4 20h16\"/>", "crown-2")
export const IconShieldStar = makeIcon("<path d=\"M12 2l9 3v6c0 5-4 9-9 11-5-2-9-6-9-11V5zM12 7l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z\"/>", "shield-star")
export const IconSword2 = makeIcon("<path d=\"M20 4l-9 9-3-3M16 8l-4 4M3 21l3-3M14 4l6 6\"/>", "sword-2")
export const IconCrossedSwords = makeIcon("<path d=\"M14.5 9.5L21 3M21 3l-4 1 3 3zM3 21l5-5M14.5 14.5L21 21M21 21l-1-4-3 3M9.5 9.5L3 3M3 3l4 1-3 3M3 21l4-1M14.5 14.5L9.5 9.5\"/>", "crossed-swords")
export const IconFlame2 = makeIcon("<path d=\"M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10zM12 12v2\"/>", "flame-2")
export const IconSnowflake2 = makeIcon("<path d=\"M12 2v20M4 6l16 12M4 18L20 6M9 4l3 3 3-3M9 20l3-3 3 3\"/>", "snowflake-2")
export const IconDroplet2 = makeIcon("<path d=\"M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12zM9 14a3 3 0 0 0 3 3\"/>", "droplet-2")
export const IconLeaf2 = makeIcon("<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6\"/>", "leaf-2")
export const IconTree2 = makeIcon("<path d=\"M12 22V12M17 12a5 5 0 0 1-5-5 5 5 0 0 1-5 5 5 5 0 1 0 10 0zM12 2v5\"/>", "tree-2")
export const IconFlower3 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"3\"/><circle cx=\"12\" cy=\"6\" r=\"3\"/><circle cx=\"12\" cy=\"18\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"12\" r=\"3\"/>", "flower-3")
export const IconBird2 = makeIcon("<path d=\"M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M20 7l2 .5-2 .5M12 22l1.5-3M8 22l1-3\"/>", "bird-2")
export const IconCat2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"7\"/><path d=\"M6 6l1-3 3 2M18 6l-1-3-3 2M9 11h.01M15 11h.01M12 13v3M10 15h4\"/>", "cat-2")
export const IconDog2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"7\"/><path d=\"M6 6l-1-4M18 6l1-4M9 11h.01M15 11h.01M12 13v3M10 15h4\"/>", "dog-2")
export const IconPaw = makeIcon("<circle cx=\"9\" cy=\"7\" r=\"2\"/><circle cx=\"15\" cy=\"7\" r=\"2\"/><circle cx=\"5\" cy=\"11\" r=\"2\"/><circle cx=\"19\" cy=\"11\" r=\"2\"/><path d=\"M12 20a5 5 0 0 0 5-5c0-2-2-3-5-3s-5 1-5 3a5 5 0 0 0 5 5z\"/>", "paw")
export const IconBone = makeIcon("<path d=\"M7 6a3 3 0 1 1 3 3l4 4a3 3 0 1 1-3 3 3 3 0 1 1 3-3l-4-4a3 3 0 1 1-3-3z\"/>", "bone")
export const IconFish4 = makeIcon("<path d=\"M2 12c4-6 14-6 18 0-4 6-14 6-18 0zM18 12l4-3v6zM6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z\"/>", "fish-4")
export const IconBug3 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M12 6V3M12 21v-3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M9 3l3 3 3-3M9 21l3-3 3 3\"/>", "bug-3")
export const IconSnail2 = makeIcon("<path d=\"M8 20a8 8 0 0 1 8-14 6 6 0 0 1 6 6c0 4-4 8-8 8z\"/><path d=\"M14 12a3 3 0 1 0 0 6M16 8V4M14 4h4M4 20h16\"/>", "snail-2")
export const IconShrimp2 = makeIcon("<path d=\"M12 4c-4 0-7 3-7 7s3 7 7 7h4l4 4v-4l-2-2M5 11a7 7 0 0 0 14 0M12 4V2M10 2h4\"/>", "shrimp-2")
export const IconCrab2 = makeIcon("<circle cx=\"12\" cy=\"13\" r=\"6\"/><path d=\"M6 13L2 11l1-3 4 2M18 13l4-2-1-3-4 2M9 8L7 5M15 8l2-3M9 18l-2 3M15 18l2 3\"/>", "crab-2")
export const IconWhale2 = makeIcon("<path d=\"M3 12c0-5 6-8 12-6 3 1 5 3 6 5v2c0 3-3 5-7 5-2 0-4-1-5-2-3 1-6 0-6-4zM18 10l-3 2 3 2M9 13c1 2 3 3 5 3\"/>", "whale-2")
export const IconDolphin2 = makeIcon("<path d=\"M4 20c4 0 8-2 10-5 2-3 2-6 0-9-1-2-3-3-5-3 0 0 1 2 0 4s-4 3-4 6 1 5 4 6c-2 1-4 1-5 1zM6 14l-3 1M8 10L5 8M12 8l-2-4\"/>", "dolphin-2")
export const IconOctopus2 = makeIcon("<circle cx=\"12\" cy=\"10\" r=\"6\"/><path d=\"M6 10v6a3 3 0 0 0 3 3M9 19a3 3 0 0 0 3 3M12 19a3 3 0 0 0 3 3M15 19a3 3 0 0 0 3-3v-6M9 8h.01M15 8h.01\"/>", "octopus-2")
export const IconJellyfish2 = makeIcon("<path d=\"M12 3c-5 0-8 3-8 7 0 3 3 5 8 5s8-2 8-5c0-4-3-7-8-7zM6 15c0 3 1 4 1 6M10 15c0 2 0 4 0 6M14 15c0 2 0 4 0 6M18 15c0 3-1 4-1 6M9 9h.01M15 9h.01\"/>", "jellyfish-2")
export const IconShell3 = makeIcon("<path d=\"M12 3c-4 0-7 4-7 9 0 4 3 8 7 9 4-1 7-5 7-9 0-5-3-9-7-9zM12 3v18M6 10h12M5 15h14\"/>", "shell-3")
export const IconCoral3 = makeIcon("<path d=\"M12 22V10M12 10c0-3 2-5 4-5s3 2 3 4M12 10c0-2-1-4-3-4s-4 1-4 3M8 12c0 2-2 3-3 3M16 13c0 2 2 3 3 3M6 22h12\"/>", "coral-3")
export const IconMountain2 = makeIcon("<path d=\"M3 20l7-12 4 6 3-4 4 10zM9 8l3-4 4 6\"/>", "mountain-2")
export const IconVolcano2 = makeIcon("<path d=\"M3 22h18l-5-8H8zM8 14l4-12 4 12M10 6h4M9 10h6\"/>", "volcano-2")
export const IconIsland2 = makeIcon("<path d=\"M2 20h20M5 20a7 7 0 0 1 14 0M12 13V3M8 7l4-4 4 4\"/>", "island-2")
export const IconTent2 = makeIcon("<path d=\"M3.5 21L14 3l10.5 18M14 21l-3.5-6M14 21l3.5-6M10 15h8\"/>", "tent-2")
export const IconCompass2 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M16 8l-2 6-6 2 2-6z\"/>", "compass-2")
export const IconBinoculars2 = makeIcon("<circle cx=\"6\" cy=\"12\" r=\"4\"/><circle cx=\"18\" cy=\"12\" r=\"4\"/><path d=\"M6 8V4M18 8V4M9 8h6M9 10h6M3 12h-1M22 12h-1\"/>", "binoculars-2")
export const IconFlashlight2 = makeIcon("<path d=\"M6 2h12v6H6zM9 8v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8M12 4v2M9 12h.01M15 12h.01\"/>", "flashlight-2")
export const IconCompass3 = makeIcon("<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5l1.5-1.5M17 7l1.5-1.5\"/>", "compass-3")

// ============ 动态 + 查询 ============
const _registry = {
  "home": IconHome,
  "menu": IconMenu,
  "close": IconClose,
  "search": IconSearch,
  "settings": IconSettings,
  "user": IconUser,
  "users": IconUsers,
  "plus": IconPlus,
  "minus": IconMinus,
  "check": IconCheck,
  "edit": IconEdit,
  "trash": IconTrash,
  "copy": IconCopy,
  "download": IconDownload,
  "upload": IconUpload,
  "save": IconSave,
  "share": IconShare,
  "link": IconLink,
  "external-link": IconExternalLink,
  "arrow-up": IconArrowUp,
  "arrow-down": IconArrowDown,
  "arrow-left": IconArrowLeft,
  "arrow-right": IconArrowRight,
  "chevron-up": IconChevronUp,
  "chevron-down": IconChevronDown,
  "chevron-left": IconChevronLeft,
  "chevron-right": IconChevronRight,
  "play": IconPlay,
  "pause": IconPause,
  "stop": IconStop,
  "skip-back": IconSkipBack,
  "skip-forward": IconSkipForward,
  "volume": IconVolume,
  "mute": IconMute,
  "mic": IconMic,
  "file": IconFile,
  "folder": IconFolder,
  "image": IconImage,
  "video": IconVideo,
  "music": IconMusic,
  "camera": IconCamera,
  "mail": IconMail,
  "message": IconMessage,
  "phone": IconPhone,
  "send": IconSend,
  "calendar": IconCalendar,
  "clock": IconClock,
  "map-pin": IconMapPin,
  "map": IconMap,
  "globe": IconGlobe,
  "compass": IconCompass,
  "navigation": IconNavigation,
  "heart": IconHeart,
  "star": IconStar,
  "bell": IconBell,
  "bookmark": IconBookmark,
  "flag": IconFlag,
  "tag": IconTag,
  "gift": IconGift,
  "shopping-cart": IconShoppingCart,
  "credit-card": IconCreditCard,
  "package": IconPackage,
  "truck": IconTruck,
  "briefcase": IconBriefcase,
  "award": IconAward,
  "trending-up": IconTrendingUp,
  "trending-down": IconTrendingDown,
  "bar-chart": IconBarChart,
  "pie-chart": IconPieChart,
  "line-chart": IconLineChart,
  "activity": IconActivity,
  "lock": IconLock,
  "unlock": IconUnlock,
  "key": IconKey,
  "shield": IconShield,
  "eye": IconEye,
  "eye-off": IconEyeOff,
  "sun": IconSun,
  "moon": IconMoon,
  "cloud": IconCloud,
  "cloud-rain": IconCloudRain,
  "umbrella": IconUmbrella,
  "thermometer": IconThermometer,
  "wind": IconWind,
  "droplet": IconDroplet,
  "feather": IconFeather,
  "anchor": IconAnchor,
  "monitor": IconMonitor,
  "smartphone": IconSmartphone,
  "tablet": IconTablet,
  "watch": IconWatch,
  "headphones": IconHeadphones,
  "speaker": IconSpeaker,
  "battery": IconBattery,
  "wifi": IconWifi,
  "bluetooth": IconBluetooth,
  "bold": IconBold,
  "italic": IconItalic,
  "underline": IconUnderline,
  "align-left": IconAlignLeft,
  "align-center": IconAlignCenter,
  "align-right": IconAlignRight,
  "list": IconList,
  "filter": IconFilter,
  "sort": IconSort,
  "grid": IconGrid,
  "layers": IconLayers,
  "info": IconInfo,
  "alert": IconAlert,
  "help": IconHelp,
  "thumbs-up": IconThumbsUp,
  "thumbs-down": IconThumbsDown,
  "smile": IconSmile,
  "frown": IconFrown,
  "meh": IconMeh,
  "zap": IconZap,
  "target": IconTarget,
  "crosshair": IconCrosshair,
  "rocket": IconRocket,
  "crown": IconCrown,
  "diamond": IconDiamond,
  "flash": IconFlash,
  "sparkle": IconSparkle,
  "arrow-up-left": IconArrowUpLeft,
  "arrow-up-right": IconArrowUpRight,
  "arrow-down-left": IconArrowDownLeft,
  "arrow-down-right": IconArrowDownRight,
  "arrow-up-circle": IconArrowUpCircle,
  "arrow-down-circle": IconArrowDownCircle,
  "arrow-left-circle": IconArrowLeftCircle,
  "arrow-right-circle": IconArrowRightCircle,
  "arrow-left-right": IconArrowLeftRight,
  "arrow-up-down": IconArrowUpDown,
  "corner-up-left": IconCornerUpLeft,
  "corner-up-right": IconCornerUpRight,
  "corner-down-left": IconCornerDownLeft,
  "corner-down-right": IconCornerDownRight,
  "file-js": IconFileJs,
  "file-ts": IconFileTs,
  "file-json": IconFileJson,
  "file-py": IconFilePy,
  "file-go": IconFileGo,
  "file-rs": IconFileRs,
  "file-html": IconFileHtml,
  "file-css": IconFileCss,
  "file-md": IconFileMd,
  "file-pdf": IconFilePdf,
  "file-zip": IconFileZip,
  "file-image": IconFileImage,
  "file-video": IconFileVideo,
  "file-audio": IconFileAudio,
  "file-xml": IconFileXml,
  "file-yml": IconFileYml,
  "file-csv": IconFileCsv,
  "file-sh": IconFileSh,
  "file-lock": IconFileLock,
  "logo-twitter": IconLogoTwitter,
  "logo-github": IconLogoGithub,
  "logo-linkedin": IconLogoLinkedin,
  "logo-youtube": IconLogoYoutube,
  "logo-facebook": IconLogoFacebook,
  "logo-instagram": IconLogoInstagram,
  "logo-whatsapp": IconLogoWhatsapp,
  "logo-slack": IconLogoSlack,
  "logo-discord": IconLogoDiscord,
  "logo-telegram": IconLogoTelegram,
  "logo-wechat": IconLogoWechat,
  "cloud-snow": IconCloudSnow,
  "cloud-lightning": IconCloudLightning,
  "cloud-drizzle": IconCloudDrizzle,
  "cloud-fog": IconCloudFog,
  "sunrise": IconSunrise,
  "sunset": IconSunset,
  "snowflake": IconSnowflake,
  "rainbow": IconRainbow,
  "wind-strong": IconWindStrong,
  "moon-star": IconMoonStar,
  "hand": IconHand,
  "hand-heart": IconHandHeart,
  "hand-peace": IconHandPeace,
  "hand-thumbsup": IconHandThumbsup,
  "heart-hand": IconHeartHand,
  "heart-pulse": IconHeartPulse,
  "stethoscope": IconStethoscope,
  "pill": IconPill,
  "syringe": IconSyringe,
  "bandage": IconBandage,
  "thermometer-sun": IconThermometerSun,
  "wrench": IconWrench,
  "hammer": IconHammer,
  "screwdriver": IconScrewdriver,
  "drill": IconDrill,
  "ruler": IconRuler,
  "scissors": IconScissors,
  "pliers": IconPliers,
  "car": IconCar,
  "bike": IconBike,
  "plane": IconPlane,
  "train": IconTrain,
  "bus": IconBus,
  "ship": IconShip,
  "fuel": IconFuel,
  "building": IconBuilding,
  "building-2": IconBuilding2,
  "hospital": IconHospital,
  "school": IconSchool,
  "shopping-bag": IconShoppingBag,
  "shopping-bag-2": IconShoppingBag2,
  "store": IconStore,
  "factory": IconFactory,
  "warehouse": IconWarehouse,
  "dumbbell": IconDumbbell,
  "trophy": IconTrophy,
  "medal": IconMedal,
  "football": IconFootball,
  "basketball": IconBasketball,
  "tennis": IconTennis,
  "swimming": IconSwimming,
  "coffee": IconCoffee,
  "beer": IconBeer,
  "wine": IconWine,
  "cake": IconCake,
  "pizza": IconPizza,
  "burger": IconBurger,
  "leaf": IconLeaf,
  "tree": IconTree,
  "flower": IconFlower,
  "flower-2": IconFlower2,
  "bird": IconBird,
  "cat": IconCat,
  "dog": IconDog,
  "fish": IconFish,
  "rabbit": IconRabbit,
  "bug": IconBug,
  "home-circle": IconHomeCircle,
  "user-circle": IconUserCircle,
  "users-circle": IconUsersCircle,
  "search-circle": IconSearchCircle,
  "settings-circle": IconSettingsCircle,
  "bell-circle": IconBellCircle,
  "heart-circle": IconHeartCircle,
  "star-circle": IconStarCircle,
  "bookmark-circle": IconBookmarkCircle,
  "tag-circle": IconTagCircle,
  "plus-circle": IconPlusCircle,
  "minus-circle": IconMinusCircle,
  "check-circle": IconCheckCircle,
  "close-circle": IconCloseCircle,
  "edit-circle": IconEditCircle,
  "trash-circle": IconTrashCircle,
  "copy-circle": IconCopyCircle,
  "save-circle": IconSaveCircle,
  "share-circle": IconShareCircle,
  "link-circle": IconLinkCircle,
  "download-circle": IconDownloadCircle,
  "upload-circle": IconUploadCircle,
  "file-circle": IconFileCircle,
  "folder-circle": IconFolderCircle,
  "image-circle": IconImageCircle,
  "video-circle": IconVideoCircle,
  "music-circle": IconMusicCircle,
  "camera-circle": IconCameraCircle,
  "mail-circle": IconMailCircle,
  "message-circle": IconMessageCircle,
  "phone-circle": IconPhoneCircle,
  "send-circle": IconSendCircle,
  "calendar-circle": IconCalendarCircle,
  "clock-circle": IconClockCircle,
  "map-pin-circle": IconMapPinCircle,
  "globe-circle": IconGlobeCircle,
  "lock-circle": IconLockCircle,
  "unlock-circle": IconUnlockCircle,
  "key-circle": IconKeyCircle,
  "shield-circle": IconShieldCircle,
  "eye-circle": IconEyeCircle,
  "sun-circle": IconSunCircle,
  "moon-circle": IconMoonCircle,
  "cloud-circle": IconCloudCircle,
  "zap-circle": IconZapCircle,
  "target-circle": IconTargetCircle,
  "rocket-circle": IconRocketCircle,
  "crown-circle": IconCrownCircle,
  "diamond-circle": IconDiamondCircle,
  "flash-circle": IconFlashCircle,
  "thumbs-up-circle": IconThumbsUpCircle,
  "info-circle": IconInfoCircle,
  "alert-circle": IconAlertCircle,
  "help-circle": IconHelpCircle,
  "smile-circle": IconSmileCircle,
  "filter-circle": IconFilterCircle,
  "grid-circle": IconGridCircle,
  "layers-circle": IconLayersCircle,
  "play-circle": IconPlayCircle,
  "pause-circle": IconPauseCircle,
  "home-square": IconHomeSquare,
  "user-square": IconUserSquare,
  "users-square": IconUsersSquare,
  "search-square": IconSearchSquare,
  "settings-square": IconSettingsSquare,
  "bell-square": IconBellSquare,
  "heart-square": IconHeartSquare,
  "star-square": IconStarSquare,
  "bookmark-square": IconBookmarkSquare,
  "tag-square": IconTagSquare,
  "plus-square": IconPlusSquare,
  "minus-square": IconMinusSquare,
  "check-square": IconCheckSquare,
  "close-square": IconCloseSquare,
  "edit-square": IconEditSquare,
  "trash-square": IconTrashSquare,
  "copy-square": IconCopySquare,
  "save-square": IconSaveSquare,
  "share-square": IconShareSquare,
  "link-square": IconLinkSquare,
  "download-square": IconDownloadSquare,
  "upload-square": IconUploadSquare,
  "file-square": IconFileSquare,
  "folder-square": IconFolderSquare,
  "image-square": IconImageSquare,
  "video-square": IconVideoSquare,
  "music-square": IconMusicSquare,
  "camera-square": IconCameraSquare,
  "mail-square": IconMailSquare,
  "message-square": IconMessageSquare,
  "phone-square": IconPhoneSquare,
  "send-square": IconSendSquare,
  "calendar-square": IconCalendarSquare,
  "clock-square": IconClockSquare,
  "map-pin-square": IconMapPinSquare,
  "globe-square": IconGlobeSquare,
  "lock-square": IconLockSquare,
  "unlock-square": IconUnlockSquare,
  "key-square": IconKeySquare,
  "shield-square": IconShieldSquare,
  "eye-square": IconEyeSquare,
  "sun-square": IconSunSquare,
  "moon-square": IconMoonSquare,
  "cloud-square": IconCloudSquare,
  "zap-square": IconZapSquare,
  "target-square": IconTargetSquare,
  "rocket-square": IconRocketSquare,
  "crown-square": IconCrownSquare,
  "diamond-square": IconDiamondSquare,
  "flash-square": IconFlashSquare,
  "thumbs-up-square": IconThumbsUpSquare,
  "info-square": IconInfoSquare,
  "alert-square": IconAlertSquare,
  "help-square": IconHelpSquare,
  "smile-square": IconSmileSquare,
  "filter-square": IconFilterSquare,
  "grid-square": IconGridSquare,
  "layers-square": IconLayersSquare,
  "play-square": IconPlaySquare,
  "pause-square": IconPauseSquare,
  "badge-1": IconBadge1,
  "badge-2": IconBadge2,
  "badge-3": IconBadge3,
  "badge-4": IconBadge4,
  "badge-5": IconBadge5,
  "badge-6": IconBadge6,
  "badge-7": IconBadge7,
  "badge-8": IconBadge8,
  "badge-9": IconBadge9,
  "badge-10": IconBadge10,
  "badge-11": IconBadge11,
  "badge-12": IconBadge12,
  "badge-13": IconBadge13,
  "badge-14": IconBadge14,
  "badge-15": IconBadge15,
  "badge-16": IconBadge16,
  "badge-17": IconBadge17,
  "badge-18": IconBadge18,
  "badge-19": IconBadge19,
  "badge-20": IconBadge20,
  "badge-21": IconBadge21,
  "badge-22": IconBadge22,
  "badge-23": IconBadge23,
  "badge-24": IconBadge24,
  "badge-25": IconBadge25,
  "badge-26": IconBadge26,
  "badge-27": IconBadge27,
  "badge-28": IconBadge28,
  "badge-29": IconBadge29,
  "badge-30": IconBadge30,
  "badge-31": IconBadge31,
  "badge-32": IconBadge32,
  "badge-33": IconBadge33,
  "badge-34": IconBadge34,
  "badge-35": IconBadge35,
  "badge-36": IconBadge36,
  "badge-37": IconBadge37,
  "badge-38": IconBadge38,
  "badge-39": IconBadge39,
  "badge-40": IconBadge40,
  "badge-41": IconBadge41,
  "badge-42": IconBadge42,
  "badge-43": IconBadge43,
  "badge-44": IconBadge44,
  "badge-45": IconBadge45,
  "badge-46": IconBadge46,
  "badge-47": IconBadge47,
  "badge-48": IconBadge48,
  "badge-49": IconBadge49,
  "badge-50": IconBadge50,
  "badge-51": IconBadge51,
  "badge-52": IconBadge52,
  "badge-53": IconBadge53,
  "badge-54": IconBadge54,
  "badge-55": IconBadge55,
  "badge-56": IconBadge56,
  "badge-57": IconBadge57,
  "badge-58": IconBadge58,
  "badge-59": IconBadge59,
  "badge-60": IconBadge60,
  "badge-61": IconBadge61,
  "badge-62": IconBadge62,
  "badge-63": IconBadge63,
  "badge-64": IconBadge64,
  "badge-65": IconBadge65,
  "badge-66": IconBadge66,
  "badge-67": IconBadge67,
  "badge-68": IconBadge68,
  "badge-69": IconBadge69,
  "badge-70": IconBadge70,
  "badge-71": IconBadge71,
  "badge-72": IconBadge72,
  "badge-73": IconBadge73,
  "badge-74": IconBadge74,
  "badge-75": IconBadge75,
  "badge-76": IconBadge76,
  "badge-77": IconBadge77,
  "badge-78": IconBadge78,
  "badge-79": IconBadge79,
  "badge-80": IconBadge80,
  "badge-81": IconBadge81,
  "badge-82": IconBadge82,
  "badge-83": IconBadge83,
  "badge-84": IconBadge84,
  "badge-85": IconBadge85,
  "badge-86": IconBadge86,
  "badge-87": IconBadge87,
  "badge-88": IconBadge88,
  "badge-89": IconBadge89,
  "badge-90": IconBadge90,
  "badge-91": IconBadge91,
  "badge-92": IconBadge92,
  "badge-93": IconBadge93,
  "badge-94": IconBadge94,
  "badge-95": IconBadge95,
  "badge-96": IconBadge96,
  "badge-97": IconBadge97,
  "badge-98": IconBadge98,
  "badge-99": IconBadge99,
  "letter-A": IconLetterA,
  "letter-a": IconLetterA,
  "letter-A-circle-fill": IconLetterACircleFill,
  "letter-A-square-fill": IconLetterASquareFill,
  "letter-B": IconLetterB,
  "letter-b": IconLetterB,
  "letter-B-circle-fill": IconLetterBCircleFill,
  "letter-B-square-fill": IconLetterBSquareFill,
  "letter-C": IconLetterC,
  "letter-c": IconLetterC,
  "letter-C-circle-fill": IconLetterCCircleFill,
  "letter-C-square-fill": IconLetterCSquareFill,
  "letter-D": IconLetterD,
  "letter-d": IconLetterD,
  "letter-D-circle-fill": IconLetterDCircleFill,
  "letter-D-square-fill": IconLetterDSquareFill,
  "letter-E": IconLetterE,
  "letter-e": IconLetterE,
  "letter-E-circle-fill": IconLetterECircleFill,
  "letter-E-square-fill": IconLetterESquareFill,
  "letter-F": IconLetterF,
  "letter-f": IconLetterF,
  "letter-F-circle-fill": IconLetterFCircleFill,
  "letter-F-square-fill": IconLetterFSquareFill,
  "letter-G": IconLetterG,
  "letter-g": IconLetterG,
  "letter-G-circle-fill": IconLetterGCircleFill,
  "letter-G-square-fill": IconLetterGSquareFill,
  "letter-H": IconLetterH,
  "letter-h": IconLetterH,
  "letter-H-circle-fill": IconLetterHCircleFill,
  "letter-H-square-fill": IconLetterHSquareFill,
  "letter-I": IconLetterI,
  "letter-i": IconLetterI,
  "letter-I-circle-fill": IconLetterICircleFill,
  "letter-I-square-fill": IconLetterISquareFill,
  "letter-J": IconLetterJ,
  "letter-j": IconLetterJ,
  "letter-J-circle-fill": IconLetterJCircleFill,
  "letter-J-square-fill": IconLetterJSquareFill,
  "letter-K": IconLetterK,
  "letter-k": IconLetterK,
  "letter-K-circle-fill": IconLetterKCircleFill,
  "letter-K-square-fill": IconLetterKSquareFill,
  "letter-L": IconLetterL,
  "letter-l": IconLetterL,
  "letter-L-circle-fill": IconLetterLCircleFill,
  "letter-L-square-fill": IconLetterLSquareFill,
  "letter-M": IconLetterM,
  "letter-m": IconLetterM,
  "letter-M-circle-fill": IconLetterMCircleFill,
  "letter-M-square-fill": IconLetterMSquareFill,
  "letter-N": IconLetterN,
  "letter-n": IconLetterN,
  "letter-N-circle-fill": IconLetterNCircleFill,
  "letter-N-square-fill": IconLetterNSquareFill,
  "letter-O": IconLetterO,
  "letter-o": IconLetterO,
  "letter-O-circle-fill": IconLetterOCircleFill,
  "letter-O-square-fill": IconLetterOSquareFill,
  "letter-P": IconLetterP,
  "letter-p": IconLetterP,
  "letter-P-circle-fill": IconLetterPCircleFill,
  "letter-P-square-fill": IconLetterPSquareFill,
  "letter-Q": IconLetterQ,
  "letter-q": IconLetterQ,
  "letter-Q-circle-fill": IconLetterQCircleFill,
  "letter-Q-square-fill": IconLetterQSquareFill,
  "letter-R": IconLetterR,
  "letter-r": IconLetterR,
  "letter-R-circle-fill": IconLetterRCircleFill,
  "letter-R-square-fill": IconLetterRSquareFill,
  "letter-S": IconLetterS,
  "letter-s": IconLetterS,
  "letter-S-circle-fill": IconLetterSCircleFill,
  "letter-S-square-fill": IconLetterSSquareFill,
  "letter-T": IconLetterT,
  "letter-t": IconLetterT,
  "letter-T-circle-fill": IconLetterTCircleFill,
  "letter-T-square-fill": IconLetterTSquareFill,
  "letter-U": IconLetterU,
  "letter-u": IconLetterU,
  "letter-U-circle-fill": IconLetterUCircleFill,
  "letter-U-square-fill": IconLetterUSquareFill,
  "letter-V": IconLetterV,
  "letter-v": IconLetterV,
  "letter-V-circle-fill": IconLetterVCircleFill,
  "letter-V-square-fill": IconLetterVSquareFill,
  "letter-W": IconLetterW,
  "letter-w": IconLetterW,
  "letter-W-circle-fill": IconLetterWCircleFill,
  "letter-W-square-fill": IconLetterWSquareFill,
  "letter-X": IconLetterX,
  "letter-x": IconLetterX,
  "letter-X-circle-fill": IconLetterXCircleFill,
  "letter-X-square-fill": IconLetterXSquareFill,
  "letter-Y": IconLetterY,
  "letter-y": IconLetterY,
  "letter-Y-circle-fill": IconLetterYCircleFill,
  "letter-Y-square-fill": IconLetterYSquareFill,
  "letter-Z": IconLetterZ,
  "letter-z": IconLetterZ,
  "letter-Z-circle-fill": IconLetterZCircleFill,
  "letter-Z-square-fill": IconLetterZSquareFill,
  "big-0": IconBig0,
  "big-1": IconBig1,
  "big-2": IconBig2,
  "big-3": IconBig3,
  "big-4": IconBig4,
  "big-5": IconBig5,
  "big-6": IconBig6,
  "big-7": IconBig7,
  "big-8": IconBig8,
  "big-9": IconBig9,
  "big-10": IconBig10,
  "big-11": IconBig11,
  "big-12": IconBig12,
  "big-13": IconBig13,
  "big-14": IconBig14,
  "big-15": IconBig15,
  "big-16": IconBig16,
  "big-17": IconBig17,
  "big-18": IconBig18,
  "big-19": IconBig19,
  "big-20": IconBig20,
  "big-21": IconBig21,
  "big-22": IconBig22,
  "big-23": IconBig23,
  "big-24": IconBig24,
  "big-25": IconBig25,
  "big-26": IconBig26,
  "big-27": IconBig27,
  "big-28": IconBig28,
  "big-29": IconBig29,
  "big-30": IconBig30,
  "big-31": IconBig31,
  "big-32": IconBig32,
  "big-33": IconBig33,
  "big-34": IconBig34,
  "big-35": IconBig35,
  "big-36": IconBig36,
  "big-37": IconBig37,
  "big-38": IconBig38,
  "big-39": IconBig39,
  "big-40": IconBig40,
  "big-41": IconBig41,
  "big-42": IconBig42,
  "big-43": IconBig43,
  "big-44": IconBig44,
  "big-45": IconBig45,
  "big-46": IconBig46,
  "big-47": IconBig47,
  "big-48": IconBig48,
  "big-49": IconBig49,
  "big-50": IconBig50,
  "big-51": IconBig51,
  "big-52": IconBig52,
  "big-53": IconBig53,
  "big-54": IconBig54,
  "big-55": IconBig55,
  "big-56": IconBig56,
  "big-57": IconBig57,
  "big-58": IconBig58,
  "big-59": IconBig59,
  "big-60": IconBig60,
  "big-61": IconBig61,
  "big-62": IconBig62,
  "big-63": IconBig63,
  "big-64": IconBig64,
  "big-65": IconBig65,
  "big-66": IconBig66,
  "big-67": IconBig67,
  "big-68": IconBig68,
  "big-69": IconBig69,
  "big-70": IconBig70,
  "big-71": IconBig71,
  "big-72": IconBig72,
  "big-73": IconBig73,
  "big-74": IconBig74,
  "big-75": IconBig75,
  "big-76": IconBig76,
  "big-77": IconBig77,
  "big-78": IconBig78,
  "big-79": IconBig79,
  "big-80": IconBig80,
  "big-81": IconBig81,
  "big-82": IconBig82,
  "big-83": IconBig83,
  "big-84": IconBig84,
  "big-85": IconBig85,
  "big-86": IconBig86,
  "big-87": IconBig87,
  "big-88": IconBig88,
  "big-89": IconBig89,
  "big-90": IconBig90,
  "big-91": IconBig91,
  "big-92": IconBig92,
  "big-93": IconBig93,
  "big-94": IconBig94,
  "big-95": IconBig95,
  "big-96": IconBig96,
  "big-97": IconBig97,
  "big-98": IconBig98,
  "big-99": IconBig99,
  "time-0-0": IconTime00,
  "time-0-30": IconTime030,
  "time-1-0": IconTime10,
  "time-1-30": IconTime130,
  "time-2-0": IconTime20,
  "time-2-30": IconTime230,
  "time-3-0": IconTime30,
  "time-3-30": IconTime330,
  "time-4-0": IconTime40,
  "time-4-30": IconTime430,
  "time-5-0": IconTime50,
  "time-5-30": IconTime530,
  "time-6-0": IconTime60,
  "time-6-30": IconTime630,
  "time-7-0": IconTime70,
  "time-7-30": IconTime730,
  "time-8-0": IconTime80,
  "time-8-30": IconTime830,
  "time-9-0": IconTime90,
  "time-9-30": IconTime930,
  "time-10-0": IconTime100,
  "time-10-30": IconTime1030,
  "time-11-0": IconTime110,
  "time-11-30": IconTime1130,
  "time-12-0": IconTime120,
  "time-12-30": IconTime1230,
  "time-13-0": IconTime130,
  "time-13-30": IconTime1330,
  "time-14-0": IconTime140,
  "time-14-30": IconTime1430,
  "time-15-0": IconTime150,
  "time-15-30": IconTime1530,
  "time-16-0": IconTime160,
  "time-16-30": IconTime1630,
  "time-17-0": IconTime170,
  "time-17-30": IconTime1730,
  "time-18-0": IconTime180,
  "time-18-30": IconTime1830,
  "time-19-0": IconTime190,
  "time-19-30": IconTime1930,
  "time-20-0": IconTime200,
  "time-20-30": IconTime2030,
  "time-21-0": IconTime210,
  "time-21-30": IconTime2130,
  "time-22-0": IconTime220,
  "time-22-30": IconTime2230,
  "time-23-0": IconTime230,
  "time-23-30": IconTime2330,
  "arrow-up-ring": IconArrowUpRing,
  "arrow-up-fill-circle": IconArrowUpFillCircle,
  "arrow-up-fill-square": IconArrowUpFillSquare,
  "arrow-up-right-ring": IconArrowUpRightRing,
  "arrow-up-right-fill-circle": IconArrowUpRightFillCircle,
  "arrow-up-right-fill-square": IconArrowUpRightFillSquare,
  "arrow-right-ring": IconArrowRightRing,
  "arrow-right-fill-circle": IconArrowRightFillCircle,
  "arrow-right-fill-square": IconArrowRightFillSquare,
  "arrow-down-right-ring": IconArrowDownRightRing,
  "arrow-down-right-fill-circle": IconArrowDownRightFillCircle,
  "arrow-down-right-fill-square": IconArrowDownRightFillSquare,
  "arrow-down-ring": IconArrowDownRing,
  "arrow-down-fill-circle": IconArrowDownFillCircle,
  "arrow-down-fill-square": IconArrowDownFillSquare,
  "arrow-down-left-ring": IconArrowDownLeftRing,
  "arrow-down-left-fill-circle": IconArrowDownLeftFillCircle,
  "arrow-down-left-fill-square": IconArrowDownLeftFillSquare,
  "arrow-left-ring": IconArrowLeftRing,
  "arrow-left-fill-circle": IconArrowLeftFillCircle,
  "arrow-left-fill-square": IconArrowLeftFillSquare,
  "arrow-up-left-ring": IconArrowUpLeftRing,
  "arrow-up-left-fill-circle": IconArrowUpLeftFillCircle,
  "arrow-up-left-fill-square": IconArrowUpLeftFillSquare,
  "progress-0": IconProgress0,
  "progress-2": IconProgress2,
  "progress-4": IconProgress4,
  "progress-6": IconProgress6,
  "progress-8": IconProgress8,
  "progress-10": IconProgress10,
  "progress-12": IconProgress12,
  "progress-14": IconProgress14,
  "progress-16": IconProgress16,
  "progress-18": IconProgress18,
  "progress-20": IconProgress20,
  "progress-22": IconProgress22,
  "progress-24": IconProgress24,
  "progress-26": IconProgress26,
  "progress-28": IconProgress28,
  "progress-30": IconProgress30,
  "progress-32": IconProgress32,
  "progress-34": IconProgress34,
  "progress-36": IconProgress36,
  "progress-38": IconProgress38,
  "progress-40": IconProgress40,
  "progress-42": IconProgress42,
  "progress-44": IconProgress44,
  "progress-46": IconProgress46,
  "progress-48": IconProgress48,
  "progress-50": IconProgress50,
  "progress-52": IconProgress52,
  "progress-54": IconProgress54,
  "progress-56": IconProgress56,
  "progress-58": IconProgress58,
  "progress-60": IconProgress60,
  "progress-62": IconProgress62,
  "progress-64": IconProgress64,
  "progress-66": IconProgress66,
  "progress-68": IconProgress68,
  "progress-70": IconProgress70,
  "progress-72": IconProgress72,
  "progress-74": IconProgress74,
  "progress-76": IconProgress76,
  "progress-78": IconProgress78,
  "progress-80": IconProgress80,
  "progress-82": IconProgress82,
  "progress-84": IconProgress84,
  "progress-86": IconProgress86,
  "progress-88": IconProgress88,
  "progress-90": IconProgress90,
  "progress-92": IconProgress92,
  "progress-94": IconProgress94,
  "progress-96": IconProgress96,
  "progress-98": IconProgress98,
  "progress-100": IconProgress100,
  "grid-1x1": IconGrid1x1,
  "grid-2x2": IconGrid2x2,
  "grid-3x3": IconGrid3x3,
  "grid-4x4": IconGrid4x4,
  "grid-5x5": IconGrid5x5,
  "grid-6x6": IconGrid6x6,
  "grid-7x7": IconGrid7x7,
  "grid-8x8": IconGrid8x8,
  "grid-9x9": IconGrid9x9,
  "grid-10x10": IconGrid10x10,
  "grid-11x11": IconGrid11x11,
  "grid-12x12": IconGrid12x12,
  "poly-3-r0": IconPoly3R0,
  "poly-3-r45": IconPoly3R45,
  "poly-3-r90": IconPoly3R90,
  "poly-3-r135": IconPoly3R135,
  "poly-3-r180": IconPoly3R180,
  "poly-3-r270": IconPoly3R270,
  "poly-4-r0": IconPoly4R0,
  "poly-4-r45": IconPoly4R45,
  "poly-4-r90": IconPoly4R90,
  "poly-4-r135": IconPoly4R135,
  "poly-4-r180": IconPoly4R180,
  "poly-4-r270": IconPoly4R270,
  "poly-5-r0": IconPoly5R0,
  "poly-5-r45": IconPoly5R45,
  "poly-5-r90": IconPoly5R90,
  "poly-5-r135": IconPoly5R135,
  "poly-5-r180": IconPoly5R180,
  "poly-5-r270": IconPoly5R270,
  "poly-6-r0": IconPoly6R0,
  "poly-6-r45": IconPoly6R45,
  "poly-6-r90": IconPoly6R90,
  "poly-6-r135": IconPoly6R135,
  "poly-6-r180": IconPoly6R180,
  "poly-6-r270": IconPoly6R270,
  "poly-7-r0": IconPoly7R0,
  "poly-7-r45": IconPoly7R45,
  "poly-7-r90": IconPoly7R90,
  "poly-7-r135": IconPoly7R135,
  "poly-7-r180": IconPoly7R180,
  "poly-7-r270": IconPoly7R270,
  "poly-8-r0": IconPoly8R0,
  "poly-8-r45": IconPoly8R45,
  "poly-8-r90": IconPoly8R90,
  "poly-8-r135": IconPoly8R135,
  "poly-8-r180": IconPoly8R180,
  "poly-8-r270": IconPoly8R270,
  "poly-9-r0": IconPoly9R0,
  "poly-9-r45": IconPoly9R45,
  "poly-9-r90": IconPoly9R90,
  "poly-9-r135": IconPoly9R135,
  "poly-9-r180": IconPoly9R180,
  "poly-9-r270": IconPoly9R270,
  "poly-10-r0": IconPoly10R0,
  "poly-10-r45": IconPoly10R45,
  "poly-10-r90": IconPoly10R90,
  "poly-10-r135": IconPoly10R135,
  "poly-10-r180": IconPoly10R180,
  "poly-10-r270": IconPoly10R270,
  "poly-11-r0": IconPoly11R0,
  "poly-11-r45": IconPoly11R45,
  "poly-11-r90": IconPoly11R90,
  "poly-11-r135": IconPoly11R135,
  "poly-11-r180": IconPoly11R180,
  "poly-11-r270": IconPoly11R270,
  "poly-12-r0": IconPoly12R0,
  "poly-12-r45": IconPoly12R45,
  "poly-12-r90": IconPoly12R90,
  "poly-12-r135": IconPoly12R135,
  "poly-12-r180": IconPoly12R180,
  "poly-12-r270": IconPoly12R270,
  "poly-13-r0": IconPoly13R0,
  "poly-13-r45": IconPoly13R45,
  "poly-13-r90": IconPoly13R90,
  "poly-13-r135": IconPoly13R135,
  "poly-13-r180": IconPoly13R180,
  "poly-13-r270": IconPoly13R270,
  "poly-14-r0": IconPoly14R0,
  "poly-14-r45": IconPoly14R45,
  "poly-14-r90": IconPoly14R90,
  "poly-14-r135": IconPoly14R135,
  "poly-14-r180": IconPoly14R180,
  "poly-14-r270": IconPoly14R270,
  "poly-15-r0": IconPoly15R0,
  "poly-15-r45": IconPoly15R45,
  "poly-15-r90": IconPoly15R90,
  "poly-15-r135": IconPoly15R135,
  "poly-15-r180": IconPoly15R180,
  "poly-15-r270": IconPoly15R270,
  "poly-16-r0": IconPoly16R0,
  "poly-16-r45": IconPoly16R45,
  "poly-16-r90": IconPoly16R90,
  "poly-16-r135": IconPoly16R135,
  "poly-16-r180": IconPoly16R180,
  "poly-16-r270": IconPoly16R270,
  "star-4-fill": IconStar4Fill,
  "star-4-fill-circle": IconStar4FillCircle,
  "star-5-fill": IconStar5Fill,
  "star-5-fill-circle": IconStar5FillCircle,
  "star-6-fill": IconStar6Fill,
  "star-6-fill-circle": IconStar6FillCircle,
  "star-7-fill": IconStar7Fill,
  "star-7-fill-circle": IconStar7FillCircle,
  "star-8-fill": IconStar8Fill,
  "star-8-fill-circle": IconStar8FillCircle,
  "star-9-fill": IconStar9Fill,
  "star-9-fill-circle": IconStar9FillCircle,
  "star-10-fill": IconStar10Fill,
  "star-10-fill-circle": IconStar10FillCircle,
  "star-11-fill": IconStar11Fill,
  "star-11-fill-circle": IconStar11FillCircle,
  "star-12-fill": IconStar12Fill,
  "star-12-fill-circle": IconStar12FillCircle,
  "star-13-fill": IconStar13Fill,
  "star-13-fill-circle": IconStar13FillCircle,
  "star-14-fill": IconStar14Fill,
  "star-14-fill-circle": IconStar14FillCircle,
  "star-15-fill": IconStar15Fill,
  "star-15-fill-circle": IconStar15FillCircle,
  "star-16-fill": IconStar16Fill,
  "star-16-fill-circle": IconStar16FillCircle,
  "key-A": IconKeyA,
  "key-B": IconKeyB,
  "key-C": IconKeyC,
  "key-D": IconKeyD,
  "key-E": IconKeyE,
  "key-F": IconKeyF,
  "key-G": IconKeyG,
  "key-H": IconKeyH,
  "key-I": IconKeyI,
  "key-J": IconKeyJ,
  "key-K": IconKeyK,
  "key-L": IconKeyL,
  "key-M": IconKeyM,
  "key-N": IconKeyN,
  "key-O": IconKeyO,
  "key-P": IconKeyP,
  "key-Q": IconKeyQ,
  "key-R": IconKeyR,
  "key-S": IconKeyS,
  "key-T": IconKeyT,
  "key-U": IconKeyU,
  "key-V": IconKeyV,
  "key-W": IconKeyW,
  "key-X": IconKeyX,
  "key-Y": IconKeyY,
  "key-Z": IconKeyZ,
  "key-Enter": IconKeyEnter,
  "key-Esc": IconKeyEsc,
  "key-Tab": IconKeyTab,
  "key-Space": IconKeySpace,
  "key-Shift": IconKeyShift,
  "key-Ctrl": IconKeyCtrl,
  "key-Alt": IconKeyAlt,
  "key-Cmd": IconKeyCmd,
  "key-Backspace": IconKeyBackspace,
  "key-Delete": IconKeyDelete,
  "key-Insert": IconKeyInsert,
  "key-Home": IconKeyHome,
  "key-End": IconKeyEnd,
  "key-PgUp": IconKeyPgUp,
  "key-PgDn": IconKeyPgDn,
  "key-Up": IconKeyUp,
  "key-Down": IconKeyDown,
  "key-Left": IconKeyLeft,
  "key-Right": IconKeyRight,
  "key-F1": IconKeyF1,
  "key-F2": IconKeyF2,
  "key-F3": IconKeyF3,
  "key-F4": IconKeyF4,
  "key-F5": IconKeyF5,
  "key-F6": IconKeyF6,
  "key-F7": IconKeyF7,
  "key-F8": IconKeyF8,
  "key-F9": IconKeyF9,
  "key-F10": IconKeyF10,
  "key-F11": IconKeyF11,
  "key-F12": IconKeyF12,
  "percent-0": IconPercent0,
  "percent-2": IconPercent2,
  "percent-4": IconPercent4,
  "percent-6": IconPercent6,
  "percent-8": IconPercent8,
  "percent-10": IconPercent10,
  "percent-12": IconPercent12,
  "percent-14": IconPercent14,
  "percent-16": IconPercent16,
  "percent-18": IconPercent18,
  "percent-20": IconPercent20,
  "percent-22": IconPercent22,
  "percent-24": IconPercent24,
  "percent-26": IconPercent26,
  "percent-28": IconPercent28,
  "percent-30": IconPercent30,
  "percent-32": IconPercent32,
  "percent-34": IconPercent34,
  "percent-36": IconPercent36,
  "percent-38": IconPercent38,
  "percent-40": IconPercent40,
  "percent-42": IconPercent42,
  "percent-44": IconPercent44,
  "percent-46": IconPercent46,
  "percent-48": IconPercent48,
  "percent-50": IconPercent50,
  "percent-52": IconPercent52,
  "percent-54": IconPercent54,
  "percent-56": IconPercent56,
  "percent-58": IconPercent58,
  "percent-60": IconPercent60,
  "percent-62": IconPercent62,
  "percent-64": IconPercent64,
  "percent-66": IconPercent66,
  "percent-68": IconPercent68,
  "percent-70": IconPercent70,
  "percent-72": IconPercent72,
  "percent-74": IconPercent74,
  "percent-76": IconPercent76,
  "percent-78": IconPercent78,
  "percent-80": IconPercent80,
  "percent-82": IconPercent82,
  "percent-84": IconPercent84,
  "percent-86": IconPercent86,
  "percent-88": IconPercent88,
  "percent-90": IconPercent90,
  "percent-92": IconPercent92,
  "percent-94": IconPercent94,
  "percent-96": IconPercent96,
  "percent-98": IconPercent98,
  "percent-100": IconPercent100,
  "dots-row-1": IconDotsRow1,
  "dots-row-2": IconDotsRow2,
  "dots-row-3": IconDotsRow3,
  "dots-row-4": IconDotsRow4,
  "dots-row-5": IconDotsRow5,
  "dots-row-6": IconDotsRow6,
  "dots-row-7": IconDotsRow7,
  "dots-row-8": IconDotsRow8,
  "dots-row-9": IconDotsRow9,
  "dots-row-10": IconDotsRow10,
  "dots-row-11": IconDotsRow11,
  "dots-row-12": IconDotsRow12,
  "line-w1": IconLineW1,
  "line-w2": IconLineW2,
  "line-w3": IconLineW3,
  "line-w4": IconLineW4,
  "line-w5": IconLineW5,
  "line-w6": IconLineW6,
  "line-w7": IconLineW7,
  "line-w8": IconLineW8,
  "line-w9": IconLineW9,
  "line-w10": IconLineW10,
  "line-w11": IconLineW11,
  "line-w12": IconLineW12,
  "ring-w1": IconRingW1,
  "ring-w2": IconRingW2,
  "ring-w3": IconRingW3,
  "ring-w4": IconRingW4,
  "ring-w5": IconRingW5,
  "ring-w6": IconRingW6,
  "ring-w7": IconRingW7,
  "ring-w8": IconRingW8,
  "ring-w9": IconRingW9,
  "ring-w10": IconRingW10,
  "rect-r0": IconRectR0,
  "rect-r1": IconRectR1,
  "rect-r2": IconRectR2,
  "rect-r3": IconRectR3,
  "rect-r4": IconRectR4,
  "rect-r5": IconRectR5,
  "rect-r6": IconRectR6,
  "rect-r7": IconRectR7,
  "rect-r8": IconRectR8,
  "rect-r9": IconRectR9,
  "rect-r10": IconRectR10,
  "rect-r11": IconRectR11,
  "rect-r12": IconRectR12,
  "rating-1": IconRating1,
  "rating-2": IconRating2,
  "rating-3": IconRating3,
  "rating-4": IconRating4,
  "rating-5": IconRating5,
  "rating-6": IconRating6,
  "rating-7": IconRating7,
  "rating-8": IconRating8,
  "rating-9": IconRating9,
  "rating-10": IconRating10,
  "numkey-1": IconNumkey1,
  "numkey-2": IconNumkey2,
  "numkey-3": IconNumkey3,
  "numkey-4": IconNumkey4,
  "numkey-5": IconNumkey5,
  "numkey-6": IconNumkey6,
  "numkey-7": IconNumkey7,
  "numkey-8": IconNumkey8,
  "numkey-9": IconNumkey9,
  "numkey-0": IconNumkey0,
  "numkey-dot": IconNumkeyDot,
  "numkey-dash": IconNumkeyDash,
  "roman-I": IconRomanI,
  "roman-II": IconRomanII,
  "roman-III": IconRomanIII,
  "roman-IV": IconRomanIV,
  "roman-V": IconRomanV,
  "roman-VI": IconRomanVI,
  "roman-VII": IconRomanVII,
  "roman-VIII": IconRomanVIII,
  "roman-IX": IconRomanIX,
  "roman-X": IconRomanX,
  "roman-XI": IconRomanXI,
  "roman-XII": IconRomanXII,
  "sym-ampersand": IconSymAmpersand,
  "sym-asterisk": IconSymAsterisk,
  "sym-at": IconSymAt,
  "sym-backslash": IconSymBackslash,
  "sym-dollar": IconSymDollar,
  "sym-percent-sym": IconSymPercentSym,
  "sym-plus-sym": IconSymPlusSym,
  "sym-equal-sym": IconSymEqualSym,
  "sym-question": IconSymQuestion,
  "sym-exclaim": IconSymExclaim,
  "sym-quote": IconSymQuote,
  "sym-apostrophe": IconSymApostrophe,
  "sym-colon": IconSymColon,
  "sym-semicolon": IconSymSemicolon,
  "sym-comma": IconSymComma,
  "sym-period": IconSymPeriod,
  "sym-tilde": IconSymTilde,
  "sym-caret": IconSymCaret,
  "sym-underscore": IconSymUnderscore,
  "sym-pipe": IconSymPipe,
  "sym-less": IconSymLess,
  "sym-greater": IconSymGreater,
  "sym-paren-left": IconSymParenLeft,
  "sym-paren-right": IconSymParenRight,
  "sym-bracket-left": IconSymBracketLeft,
  "sym-bracket-right": IconSymBracketRight,
  "sym-brace-left": IconSymBraceLeft,
  "sym-brace-right": IconSymBraceRight,
  "label-new": IconLabelNew,
  "label-hot": IconLabelHot,
  "label-top": IconLabelTop,
  "label-vip": IconLabelVip,
  "label-pro": IconLabelPro,
  "label-beta": IconLabelBeta,
  "label-free": IconLabelFree,
  "label-live": IconLabelLive,
  "label-sale": IconLabelSale,
  "label-24h": IconLabel24h,
  "label-hd": IconLabelHd,
  "label-4k": IconLabel4k,
  "label-ai": IconLabelAi,
  "label-api": IconLabelApi,
  "label-sdk": IconLabelSdk,
  "label-css": IconLabelCss,
  "label-html": IconLabelHtml,
  "label-json": IconLabelJson,
  "label-yaml": IconLabelYaml,
  "label-http": IconLabelHttp,
  "bell-dot": IconBellDot,
  "bell-count": IconBellCount,
  "mail-dot": IconMailDot,
  "mail-count": IconMailCount,
  "message-dot": IconMessageDot,
  "message-count": IconMessageCount,
  "file-dot": IconFileDot,
  "file-count": IconFileCount,
  "folder-dot": IconFolderDot,
  "folder-count": IconFolderCount,
  "calendar-dot": IconCalendarDot,
  "calendar-count": IconCalendarCount,
  "tick-circle-8": IconTickCircle8,
  "tick-circle-10": IconTickCircle10,
  "tick-circle-12": IconTickCircle12,
  "tick-circle-14": IconTickCircle14,
  "tick-circle-16": IconTickCircle16,
  "tick-circle-18": IconTickCircle18,
  "tick-circle-20": IconTickCircle20,
  "tick-circle-22": IconTickCircle22,
  "tick-circle-24": IconTickCircle24,
  "tick-circle-26": IconTickCircle26,
  "tick-circle-28": IconTickCircle28,
  "tick-circle-30": IconTickCircle30,
  "tick-circle-32": IconTickCircle32,
  "microscope": IconMicroscope,
  "telescope": IconTelescope,
  "atom": IconAtom,
  "flask": IconFlask,
  "testTube": IconTestTube,
  "dna": IconDna,
  "pill2": IconPill2,
  "gavel": IconGavel,
  "scale": IconScale,
  "landmark": IconLandmark,
  "scroll": IconScroll,
  "contract": IconContract,
  "invoice": IconInvoice,
  "first-aid": IconFirstAid,
  "cross-medical": IconCrossMedical,
  "prescription": IconPrescription,
  "wheelchair": IconWheelchair,
  "heart-beat": IconHeartBeat,
  "brain": IconBrain,
  "blueprint": IconBlueprint,
  "crane": IconCrane,
  "gear": IconGear,
  "cog": IconCog,
  "gear2": IconGear2,
  "ruler-2": IconRuler2,
  "music-2": IconMusic2,
  "music-note": IconMusicNote,
  "music-3": IconMusic3,
  "piano": IconPiano,
  "guitar": IconGuitar,
  "drum": IconDrum,
  "palette": IconPalette,
  "brush": IconBrush,
  "pen-tool": IconPenTool,
  "pipette": IconPipette,
  "shapes": IconShapes,
  "aperture": IconAperture,
  "camera-off": IconCameraOff,
  "flash2": IconFlash2,
  "flash-off": IconFlashOff,
  "filter2": IconFilter2,
  "focus": IconFocus,
  "door": IconDoor,
  "window": IconWindow,
  "sofa": IconSofa,
  "bed": IconBed,
  "lamp": IconLamp,
  "chair": IconChair,
  "mountain": IconMountain,
  "volcano": IconVolcano,
  "wave": IconWave,
  "waves": IconWaves,
  "island": IconIsland,
  "tent": IconTent,
  "planet": IconPlanet,
  "satellite": IconSatellite,
  "telescope2": IconTelescope2,
  "orbit": IconOrbit,
  "gamepad-2": IconGamepad2,
  "joystick": IconJoystick,
  "dice": IconDice,
  "dice-2": IconDice2,
  "dice-3": IconDice3,
  "dice-4": IconDice4,
  "chess": IconChess,
  "binary": IconBinary,
  "git-fork": IconGitFork,
  "regex": IconRegex,
  "bug2": IconBug2,
  "webhook": IconWebhook,
  "heart-monitor": IconHeartMonitor,
  "router": IconRouter,
  "hard-drive-2": IconHardDrive2,
  "modem": IconModem,
  "signal-1": IconSignal1,
  "signal-2": IconSignal2,
  "signal-3": IconSignal3,
  "signal-4": IconSignal4,
  "graduation": IconGraduation,
  "backpack": IconBackpack,
  "book2": IconBook2,
  "book-open": IconBookOpen,
  "key2": IconKey2,
  "sofa2": IconSofa2,
  "church": IconChurch,
  "mosque": IconMosque,
  "shape-circle": IconShapeCircle,
  "shape-square": IconShapeSquare,
  "shape-triangle": IconShapeTriangle,
  "shape-diamond": IconShapeDiamond,
  "shape-pentagon": IconShapePentagon,
  "shape-hexagon": IconShapeHexagon,
  "shape-octagon": IconShapeOctagon,
  "shape-star": IconShapeStar,
  "coupon": IconCoupon,
  "shopping-basket": IconShoppingBasket,
  "qr-code": IconQrCode,
  "barcode": IconBarcode,
  "shopping-bag-3": IconShoppingBag3,
  "tractor": IconTractor,
  "forklift": IconForklift,
  "scooter": IconScooter,
  "motorcycle": IconMotorcycle,
  "helicopter": IconHelicopter,
  "submarine": IconSubmarine,
  "cloud-sun-2": IconCloudSun2,
  "fog": IconFog,
  "hail": IconHail,
  "cloud-hail": IconCloudHail,
  "tornado": IconTornado,
  "egg": IconEgg,
  "sandwich": IconSandwich,
  "salad": IconSalad,
  "soup": IconSoup,
  "chopsticks": IconChopsticks,
  "shirt": IconShirt,
  "shoe": IconShoe,
  "watch2": IconWatch2,
  "glasses": IconGlasses,
  "elephant": IconElephant,
  "turtle": IconTurtle,
  "butterfly": IconButterfly,
  "spider": IconSpider,
  "shield-check": IconShieldCheck,
  "shield-alert": IconShieldAlert,
  "shield-x": IconShieldX,
  "shield-plus": IconShieldPlus,
  "castle": IconCastle,
  "bridge": IconBridge,
  "sidebar": IconSidebar,
  "sidebar-right": IconSidebarRight,
  "sidebar-left": IconSidebarLeft,
  "panel-top": IconPanelTop,
  "panel-bottom": IconPanelBottom,
  "panel-left": IconPanelLeft,
  "panel-right": IconPanelRight,
  "maximize": IconMaximize,
  "minimize": IconMinimize,
  "toggle-left": IconToggleLeft,
  "toggle-right": IconToggleRight,
  "checkbox": IconCheckbox,
  "checkbox-checked": IconCheckboxChecked,
  "radio-button": IconRadioButton,
  "radio-button-checked": IconRadioButtonChecked,
  "switch-on": IconSwitchOn,
  "switch-off": IconSwitchOff,
  "star-half": IconStarHalf,
  "star-off": IconStarOff,
  "heart-crack": IconHeartCrack,
  "violin": IconViolin,
  "cello": IconCello,
  "double-bass": IconDoubleBass,
  "banjo": IconBanjo,
  "mandolin": IconMandolin,
  "harp": IconHarp,
  "flute": IconFlute,
  "clarinet": IconClarinet,
  "saxophone": IconSaxophone,
  "trumpet": IconTrumpet,
  "trombone": IconTrombone,
  "tuba": IconTuba,
  "french-horn": IconFrenchHorn,
  "accordion": IconAccordion,
  "harmonica": IconHarmonica,
  "xylophone": IconXylophone,
  "marimba": IconMarimba,
  "timpani": IconTimpani,
  "cymbal": IconCymbal,
  "gong": IconGong,
  "bongo": IconBongo,
  "conga": IconConga,
  "tambourine": IconTambourine,
  "metronome": IconMetronome,
  "tuning-fork": IconTuningFork,
  "music-stand": IconMusicStand,
  "amp": IconAmp,
  "mixer": IconMixer,
  "midi-keyboard": IconMidiKeyboard,
  "beaker": IconBeaker,
  "flask-round": IconFlaskRound,
  "flask-flat": IconFlaskFlat,
  "burette": IconBurette,
  "pipette-chem": IconPipetteChem,
  "graduated-cylinder": IconGraduatedCylinder,
  "test-tube-rack": IconTestTubeRack,
  "molecule": IconMolecule,
  "atom-2": IconAtom2,
  "bond": IconBond,
  "compound": IconCompound,
  "element": IconElement,
  "isotope": IconIsotope,
  "electron": IconElectron,
  "proton": IconProton,
  "neutron": IconNeutron,
  "benzene-ring": IconBenzeneRing,
  "ethanol": IconEthanol,
  "benzene": IconBenzene,
  "methane": IconMethane,
  "propane": IconPropane,
  "periodic-table": IconPeriodicTable,
  "catalyst": IconCatalyst,
  "solution": IconSolution,
  "solvent": IconSolvent,
  "acid": IconAcid,
  "base": IconBase,
  "ph-scale": IconPhScale,
  "crucible": IconCrucible,
  "tongs": IconTongs,
  "bunsen-burner": IconBunsenBurner,
  "distillation": IconDistillation,
  "centrifuge": IconCentrifuge,
  "comet": IconComet,
  "meteor": IconMeteor,
  "meteorite": IconMeteorite,
  "asteroid": IconAsteroid,
  "galaxy": IconGalaxy,
  "nebula": IconNebula,
  "constellation": IconConstellation,
  "black-hole": IconBlackHole,
  "supernova": IconSupernova,
  "quasar": IconQuasar,
  "pulsar": IconPulsar,
  "solar-system": IconSolarSystem,
  "sun-2": IconSun2,
  "moon-crescent": IconMoonCrescent,
  "moon-full": IconMoonFull,
  "moon-phase-1": IconMoonPhase1,
  "moon-phase-2": IconMoonPhase2,
  "moon-phase-3": IconMoonPhase3,
  "moon-phase-4": IconMoonPhase4,
  "moon-phase-5": IconMoonPhase5,
  "planet-mercury": IconPlanetMercury,
  "planet-venus": IconPlanetVenus,
  "planet-mars": IconPlanetMars,
  "planet-jupiter": IconPlanetJupiter,
  "planet-saturn": IconPlanetSaturn,
  "planet-uranus": IconPlanetUranus,
  "planet-neptune": IconPlanetNeptune,
  "star-cluster": IconStarCluster,
  "orion": IconOrion,
  "big-dipper": IconBigDipper,
  "north-star": IconNorthStar,
  "shooting-star": IconShootingStar,
  "eclipse": IconEclipse,
  "solar-eclipse": IconSolarEclipse,
  "lunar-eclipse": IconLunarEclipse,
  "observatory": IconObservatory,
  "telescope-2": IconTelescope2,
  "satellite-2": IconSatellite2,
  "space-station": IconSpaceStation,
  "astronaut": IconAstronaut,
  "spacesuit": IconSpacesuit,
  "rocket-2": IconRocket2,
  "ufo": IconUfo,
  "alien": IconAlien,
  "aurora": IconAurora,
  "scalpel": IconScalpel,
  "forceps": IconForceps,
  "iv-drip": IconIvDrip,
  "defibrillator": IconDefibrillator,
  "mri": IconMri,
  "ct-scan": IconCtScan,
  "x-ray": IconXRay,
  "ultrasound": IconUltrasound,
  "thermometer-med": IconThermometerMed,
  "blood-pressure": IconBloodPressure,
  "stethoscope-2": IconStethoscope2,
  "otoscope": IconOtoscope,
  "syringe-2": IconSyringe2,
  "vial": IconVial,
  "capsule": IconCapsule,
  "tablet-med": IconTabletMed,
  "syrup": IconSyrup,
  "ointment": IconOintment,
  "bandage-2": IconBandage2,
  "crutch": IconCrutch,
  "wheelchair-2": IconWheelchair2,
  "hospital-bed": IconHospitalBed,
  "ambulance": IconAmbulance,
  "scrubs": IconScrubs,
  "mask-medical": IconMaskMedical,
  "gloves-medical": IconGlovesMedical,
  "goggles-medical": IconGogglesMedical,
  "scalpel-2": IconScalpel2,
  "suture": IconSuture,
  "pacemaker": IconPacemaker,
  "insulin-pen": IconInsulinPen,
  "inhaler": IconInhaler,
  "hearing-aid": IconHearingAid,
  "braces": IconBraces,
  "splint": IconSplint,
  "shrimp": IconShrimp,
  "crab": IconCrab,
  "lobster": IconLobster,
  "octopus": IconOctopus,
  "squid": IconSquid,
  "jellyfish": IconJellyfish,
  "whale": IconWhale,
  "dolphin": IconDolphin,
  "seahorse": IconSeahorse,
  "coral": IconCoral,
  "coral-2": IconCoral2,
  "shell": IconShell,
  "shell-2": IconShell2,
  "starfish": IconStarfish,
  "sea-urchin": IconSeaUrchin,
  "plankton": IconPlankton,
  "algae": IconAlgae,
  "kelp": IconKelp,
  "fish-2": IconFish2,
  "fish-3": IconFish3,
  "puffer-fish": IconPufferFish,
  "anglerfish": IconAnglerfish,
  "eel": IconEel,
  "sea-turtle": IconSeaTurtle,
  "sea-snake": IconSeaSnake,
  "sea-star": IconSeaStar,
  "squirrel": IconSquirrel,
  "fox": IconFox,
  "bear": IconBear,
  "panda": IconPanda,
  "koala": IconKoala,
  "kangaroo": IconKangaroo,
  "lion": IconLion,
  "tiger": IconTiger,
  "giraffe": IconGiraffe,
  "hippo": IconHippo,
  "rhino": IconRhino,
  "zebra": IconZebra,
  "monkey": IconMonkey,
  "gorilla": IconGorilla,
  "wolf": IconWolf,
  "deer": IconDeer,
  "hamster": IconHamster,
  "hedgehog": IconHedgehog,
  "otter": IconOtter,
  "seal": IconSeal,
  "owl": IconOwl,
  "eagle": IconEagle,
  "dove": IconDove,
  "penguin": IconPenguin,
  "chicken": IconChicken,
  "duck": IconDuck,
  "rooster": IconRooster,
  "butterfly2": IconButterfly2,
  "bee": IconBee,
  "ant": IconAnt,
  "ladybug": IconLadybug,
  "caterpillar": IconCaterpillar,
  "snail": IconSnail,
  "slug": IconSlug,
  "worm": IconWorm,
  "donut": IconDonut,
  "croissant": IconCroissant,
  "pretzel": IconPretzel,
  "bagel": IconBagel,
  "baguette": IconBaguette,
  "bread-loaf": IconBreadLoaf,
  "cheese": IconCheese,
  "milk": IconMilk,
  "juice": IconJuice,
  "tea": IconTea,
  "tea-bag": IconTeaBag,
  "hotdog": IconHotdog,
  "taco": IconTaco,
  "burrito": IconBurrito,
  "ramen": IconRamen,
  "sushi": IconSushi,
  "sushi-2": IconSushi2,
  "bento": IconBento,
  "french-fries": IconFrenchFries,
  "ketchup": IconKetchup,
  "honey": IconHoney,
  "salt": IconSalt,
  "pepper": IconPepper,
  "avocado": IconAvocado,
  "watermelon": IconWatermelon,
  "grape": IconGrape,
  "cherry": IconCherry,
  "strawberry": IconStrawberry,
  "lemon": IconLemon,
  "peach": IconPeach,
  "pear": IconPear,
  "pineapple": IconPineapple,
  "coconut": IconCoconut,
  "mushroom2": IconMushroom2,
  "popcorn": IconPopcorn,
  "cereal": IconCereal,
  "hat": IconHat,
  "cap": IconCap,
  "boot": IconBoot,
  "scarf": IconScarf,
  "glove": IconGlove,
  "belt": IconBelt,
  "sock": IconSock,
  "tie": IconTie,
  "hoodie": IconHoodie,
  "pants": IconPants,
  "shorts": IconShorts,
  "skirt": IconSkirt,
  "dress": IconDress,
  "swimsuit": IconSwimsuit,
  "glasses2": IconGlasses2,
  "ring": IconRing,
  "necklace": IconNecklace,
  "earring": IconEarring,
  "bracelet": IconBracelet,
  "chess-king": IconChessKing,
  "chess-queen": IconChessQueen,
  "chess-rook": IconChessRook,
  "chess-bishop": IconChessBishop,
  "chess-knight": IconChessKnight,
  "chess-pawn": IconChessPawn,
  "poker-chip": IconPokerChip,
  "mahjong": IconMahjong,
  "card-deck": IconCardDeck,
  "dice-5": IconDice5,
  "dice-6": IconDice6,
  "domino": IconDomino,
  "go-board": IconGoBoard,
  "backgammon": IconBackgammon,
  "checkerboard": IconCheckerboard,
  "screwdriver2": IconScrewdriver2,
  "wrench-2": IconWrench2,
  "wrench-3": IconWrench3,
  "hammer-2": IconHammer2,
  "hammer-3": IconHammer3,
  "chisel": IconChisel,
  "caliper": IconCaliper,
  "level": IconLevel,
  "clamp": IconClamp,
  "vise": IconVise,
  "tape-measure": IconTapeMeasure,
  "crowbar": IconCrowbar,
  "nail-gun": IconNailGun,
  "power-drill": IconPowerDrill,
  "angle-grinder": IconAngleGrinder,
  "impact-drill": IconImpactDrill,
  "chisel-2": IconChisel2,
  "trowel": IconTrowel,
  "rake": IconRake,
  "hoe": IconHoe,
  "pitchfork": IconPitchfork,
  "shovel": IconShovel,
  "pickaxe": IconPickaxe,
  "hand-saw": IconHandSaw,
  "circular-saw": IconCircularSaw,
  "jig-saw": IconJigSaw,
  "chainsaw": IconChainsaw,
  "lathe": IconLathe,
  "anvil": IconAnvil,
  "furnace": IconFurnace,
  "welding-mask": IconWeldingMask,
  "safety-glasses": IconSafetyGlasses,
  "hard-hat": IconHardHat,
  "tool-box": IconToolBox,
  "brick-wall": IconBrickWall,
  "bricks": IconBricks,
  "scaffolding": IconScaffolding,
  "ladder": IconLadder,
  "cement": IconCement,
  "paint": IconPaint,
  "paint-roller": IconPaintRoller,
  "paint-brush": IconPaintBrush,
  "plumbing": IconPlumbing,
  "pipe": IconPipe,
  "valve": IconValve,
  "bolt": IconBolt,
  "nut": IconNut,
  "washer": IconWasher,
  "screw": IconScrew,
  "rivet": IconRivet,
  "plank": IconPlank,
  "roof-tile": IconRoofTile,
  "chimney": IconChimney,
  "drawing-compass": IconDrawingCompass,
  "protractor": IconProtractor,
  "trowel2": IconTrowel2,
  "car-2": IconCar2,
  "car-3": IconCar3,
  "taxi": IconTaxi,
  "van": IconVan,
  "pickup": IconPickup,
  "limousine": IconLimousine,
  "fire-truck": IconFireTruck,
  "police-car": IconPoliceCar,
  "garbage-truck": IconGarbageTruck,
  "cement-truck": IconCementTruck,
  "tractor2": IconTractor2,
  "forklift2": IconForklift2,
  "dump-truck": IconDumpTruck,
  "delivery-truck": IconDeliveryTruck,
  "tanker-truck": IconTankerTruck,
  "food-truck": IconFoodTruck,
  "subway": IconSubway,
  "tram": IconTram,
  "trolley": IconTrolley,
  "trolleybus": IconTrolleybus,
  "ferry": IconFerry,
  "yacht": IconYacht,
  "canoe": IconCanoe,
  "rowboat": IconRowboat,
  "sailboat": IconSailboat,
  "kayak": IconKayak,
  "hotair": IconHotair,
  "parachute": IconParachute,
  "cablecar": IconCablecar,
  "elevator": IconElevator,
  "escalator": IconEscalator,
  "bridge2": IconBridge2,
  "tunnel": IconTunnel,
  "highway": IconHighway,
  "roundabout": IconRoundabout,
  "pen-2": IconPen2,
  "pen-3": IconPen3,
  "pencil-2": IconPencil2,
  "eraser": IconEraser,
  "marker": IconMarker,
  "highlighter": IconHighlighter,
  "pencil-case": IconPencilCase,
  "pencil-sharpener": IconPencilSharpener,
  "stapler": IconStapler,
  "staples": IconStaples,
  "paper-clip": IconPaperClip,
  "push-pin": IconPushPin,
  "paper-clip-2": IconPaperClip2,
  "notepad": IconNotepad,
  "notebook": IconNotebook,
  "journal": IconJournal,
  "diary": IconDiary,
  "book3": IconBook3,
  "booklet": IconBooklet,
  "bookmark2": IconBookmark2,
  "bookstack": IconBookstack,
  "stamp": IconStamp,
  "stamp2": IconStamp2,
  "envelope": IconEnvelope,
  "envelope-open": IconEnvelopeOpen,
  "paper-plane": IconPaperPlane,
  "postcard": IconPostcard,
  "folder-2": IconFolder2,
  "folder-lock": IconFolderLock,
  "file-search": IconFileSearch,
  "file-check-2": IconFileCheck2,
  "file-x-2": IconFileX2,
  "file-plus-2": IconFilePlus2,
  "clipboard-2": IconClipboard2,
  "clipboard-list": IconClipboardList,
  "clipboard-x": IconClipboardX,
  "fridge": IconFridge,
  "microwave": IconMicrowave,
  "oven": IconOven,
  "dishwasher": IconDishwasher,
  "washing-machine": IconWashingMachine,
  "dryer": IconDryer,
  "vacuum": IconVacuum,
  "iron": IconIron,
  "kettle": IconKettle,
  "toaster": IconToaster,
  "blender": IconBlender,
  "mixer2": IconMixer2,
  "rice-cooker": IconRiceCooker,
  "coffee-maker": IconCoffeeMaker,
  "electric-kettle": IconElectricKettle,
  "air-conditioner": IconAirConditioner,
  "fan": IconFan,
  "heater": IconHeater,
  "humidifier": IconHumidifier,
  "dehumidifier": IconDehumidifier,
  "water-heater": IconWaterHeater,
  "boiler": IconBoiler,
  "radiator": IconRadiator,
  "door2": IconDoor2,
  "window2": IconWindow2,
  "sofa3": IconSofa3,
  "cushion": IconCushion,
  "curtain": IconCurtain,
  "rug": IconRug,
  "mirror": IconMirror,
  "vase": IconVase,
  "candle": IconCandle,
  "clock2": IconClock2,
  "wall-clock": IconWallClock,
  "digital-clock": IconDigitalClock,
  "hourglass": IconHourglass,
  "thermometer2": IconThermometer2,
  "flashlight": IconFlashlight,
  "micro-sd": IconMicroSd,
  "sim": IconSim,
  "usb": IconUsb,
  "hdmi": IconHdmi,
  "display-port": IconDisplayPort,
  "audio-jack": IconAudioJack,
  "ethernet": IconEthernet,
  "keyboard2": IconKeyboard2,
  "mouse": IconMouse,
  "touchpad": IconTouchpad,
  "track-ball": IconTrackBall,
  "joystick2": IconJoystick2,
  "projector": IconProjector,
  "vr-headset": IconVrHeadset,
  "drone": IconDrone,
  "robot-arm": IconRobotArm,
  "robot": IconRobot,
  "robot-2": IconRobot2,
  "ai": IconAi,
  "chip": IconChip,
  "quantum": IconQuantum,
  "bitcoin": IconBitcoin,
  "ethereum": IconEthereum,
  "qrcode": IconQrcode,
  "bar-code-2": IconBarCode2,
  "sword": IconSword,
  "shield2": IconShield2,
  "shield-sword": IconShieldSword,
  "dagger": IconDagger,
  "bow": IconBow,
  "arrow": IconArrow,
  "target2": IconTarget2,
  "helmet": IconHelmet,
  "military-helmet": IconMilitaryHelmet,
  "grenade": IconGrenade,
  "bomb": IconBomb,
  "tank": IconTank,
  "warship": IconWarship,
  "fighter": IconFighter,
  "fighter-jet": IconFighterJet,
  "missile": IconMissile,
  "radar": IconRadar,
  "walkie-talkie": IconWalkieTalkie,
  "binoculars": IconBinoculars,
  "scope": IconScope,
  "medal2": IconMedal2,
  "military-medal": IconMilitaryMedal,
  "microscope-2": IconMicroscope2,
  "telescope-3": IconTelescope3,
  "barometer": IconBarometer,
  "anemometer": IconAnemometer,
  "seismograph": IconSeismograph,
  "geiger-counter": IconGeigerCounter,
  "spectrometer": IconSpectrometer,
  "oscilloscope": IconOscilloscope,
  "multimeter": IconMultimeter,
  "voltmeter": IconVoltmeter,
  "thermometer-3": IconThermometer3,
  "balance-scale": IconBalanceScale,
  "weighing-scale": IconWeighingScale,
  "centrifuge-2": IconCentrifuge2,
  "autoclave": IconAutoclave,
  "incubator": IconIncubator,
  "petri-dish": IconPetriDish,
  "culture-tube": IconCultureTube,
  "magnetic-stirrer": IconMagneticStirrer,
  "hot-plate": IconHotPlate,
  "fume-hood": IconFumeHood,
  "vacuum-pump": IconVacuumPump,
  "micro-pipette": IconMicroPipette,
  "sample-vial": IconSampleVial,
  "desk": IconDesk,
  "office-chair": IconOfficeChair,
  "meeting-room": IconMeetingRoom,
  "projector2": IconProjector2,
  "whiteboard": IconWhiteboard,
  "whiteboard-2": IconWhiteboard2,
  "bulletin-board": IconBulletinBoard,
  "pen-holder": IconPenHolder,
  "paper-clip-3": IconPaperClip3,
  "staple": IconStaple,
  "file-cabinet": IconFileCabinet,
  "filing-cabinet": IconFilingCabinet,
  "office-desk": IconOfficeDesk,
  "stamp-2": IconStamp2,
  "signature": IconSignature,
  "paraphe": IconParaphe,
  "handshake": IconHandshake,
  "business-card": IconBusinessCard,
  "name-badge": IconNameBadge,
  "briefcase-2": IconBriefcase2,
  "briefcase-3": IconBriefcase3,
  "drag-handle": IconDragHandle,
  "drag-handle-2": IconDragHandle2,
  "resize": IconResize,
  "resize-corner": IconResizeCorner,
  "resize-horizontal": IconResizeHorizontal,
  "resize-vertical": IconResizeVertical,
  "maximize2": IconMaximize2,
  "minimize2": IconMinimize2,
  "corner-arrow": IconCornerArrow,
  "split": IconSplit,
  "split-h": IconSplitH,
  "merge": IconMerge,
  "layout-dashboard": IconLayoutDashboard,
  "layout-list": IconLayoutList,
  "layout-sidebar": IconLayoutSidebar,
  "layout-kanban": IconLayoutKanban,
  "layout-masonry": IconLayoutMasonry,
  "cloud-download": IconCloudDownload,
  "cloud-upload": IconCloudUpload,
  "cloud-check": IconCloudCheck,
  "cloud-x": IconCloudX,
  "cloud-off": IconCloudOff,
  "snow": IconSnow,
  "blizzard": IconBlizzard,
  "hot": IconHot,
  "cold": IconCold,
  "temperature-high": IconTemperatureHigh,
  "temperature-low": IconTemperatureLow,
  "sun-dim": IconSunDim,
  "sun-medium": IconSunMedium,
  "sun-bright": IconSunBright,
  "haze": IconHaze,
  "mist": IconMist,
  "smog": IconSmog,
  "bagpipes": IconBagpipes,
  "lute": IconLute,
  "ukulele": IconUkulele,
  "sitar": IconSitar,
  "balalaika": IconBalalaika,
  "zither": IconZither,
  "steel-drum": IconSteelDrum,
  "wind-chime": IconWindChime,
  "beaker2": IconBeaker2,
  "erlenmeyer": IconErlenmeyer,
  "volumetric-flask": IconVolumetricFlask,
  "watch-glass": IconWatchGlass,
  "desiccator": IconDesiccator,
  "mortar-pestle": IconMortarPestle,
  "weighing-boat": IconWeighingBoat,
  "magnetic-bar": IconMagneticBar,
  "ph-strip": IconPhStrip,
  "test-tube-2": IconTestTube2,
  "star-2": IconStar2,
  "moon-crescent-2": IconMoonCrescent2,
  "planet2": IconPlanet2,
  "comet-2": IconComet2,
  "star-shower": IconStarShower,
  "observatory-2": IconObservatory2,
  "space-helmet": IconSpaceHelmet,
  "star-map": IconStarMap,
  "thermometer3": IconThermometer3,
  "otoscope2": IconOtoscope2,
  "ophthalmoscope": IconOphthalmoscope,
  "scalpel2": IconScalpel2,
  "suture2": IconSuture2,
  "iv-bag": IconIvBag,
  "catheter": IconCatheter,
  "pacemaker2": IconPacemaker2,
  "defib": IconDefib,
  "ventilator": IconVentilator,
  "monorail": IconMonorail,
  "funicular": IconFunicular,
  "gondola": IconGondola,
  "catamaran": IconCatamaran,
  "hovercraft": IconHovercraft,
  "air-taxi": IconAirTaxi,
  "segway": IconSegway,
  "unicycle": IconUnicycle,
  "skateboard": IconSkateboard,
  "roller": IconRoller,
  "bathtub": IconBathtub,
  "shower": IconShower,
  "sink": IconSink,
  "toilet": IconToilet,
  "urinal": IconUrinal,
  "stool": IconStool,
  "side-table": IconSideTable,
  "shelf": IconShelf,
  "coat-rack": IconCoatRack,
  "shoe-rack": IconShoeRack,
  "book-shelf": IconBookShelf,
  "cpu-2": IconCpu2,
  "gpu": IconGpu,
  "ram": IconRam,
  "ssd": IconSsd,
  "motherboard": IconMotherboard,
  "power-supply": IconPowerSupply,
  "cpu-fan": IconCpuFan,
  "heatsink": IconHeatsink,
  "server-rack": IconServerRack,
  "data-center": IconDataCenter,
  "cloud-server": IconCloudServer,
  "edge-computing": IconEdgeComputing,
  "blockchain": IconBlockchain,
  "beaker-2": IconBeaker2,
  "test-tube-3": IconTestTube3,
  "planet-2": IconPlanet2,
  "thermometer-4": IconThermometer4,
  "otoscope-2": IconOtoscope2,
  "scalpel-3": IconScalpel3,
  "suture-2": IconSuture2,
  "pacemaker-2": IconPacemaker2,
  "defib-2": IconDefib2,
  "roller-skate": IconRollerSkate,
  "sink-2": IconSink2,
  "toilet-2": IconToilet2,
  "urinal-2": IconUrinal2,
  "shelf-2": IconShelf2,
  "book-shelf-2": IconBookShelf2,
  "award-2": IconAward2,
  "trophy-2": IconTrophy2,
  "certificate": IconCertificate,
  "badge-check": IconBadgeCheck,
  "ribbon": IconRibbon,
  "crown-2": IconCrown2,
  "shield-star": IconShieldStar,
  "sword-2": IconSword2,
  "crossed-swords": IconCrossedSwords,
  "flame-2": IconFlame2,
  "snowflake-2": IconSnowflake2,
  "droplet-2": IconDroplet2,
  "leaf-2": IconLeaf2,
  "tree-2": IconTree2,
  "flower-3": IconFlower3,
  "bird-2": IconBird2,
  "cat-2": IconCat2,
  "dog-2": IconDog2,
  "paw": IconPaw,
  "bone": IconBone,
  "fish-4": IconFish4,
  "bug-3": IconBug3,
  "snail-2": IconSnail2,
  "shrimp-2": IconShrimp2,
  "crab-2": IconCrab2,
  "whale-2": IconWhale2,
  "dolphin-2": IconDolphin2,
  "octopus-2": IconOctopus2,
  "jellyfish-2": IconJellyfish2,
  "shell-3": IconShell3,
  "coral-3": IconCoral3,
  "mountain-2": IconMountain2,
  "volcano-2": IconVolcano2,
  "island-2": IconIsland2,
  "tent-2": IconTent2,
  "compass-2": IconCompass2,
  "binoculars-2": IconBinoculars2,
  "flashlight-2": IconFlashlight2,
  "compass-3": IconCompass3,
}

export function Icon(props) {
  const { name } = px(props)
  const C = _registry[name]
  return C ? C(props) : null
}
export function iconNames() { return Object.keys(_registry) }
export function hasIcon(n) { return n in _registry }
export const icons = _registry
export default Icon