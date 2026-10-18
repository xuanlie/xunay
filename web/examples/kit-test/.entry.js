import * as __rt__ from "/root/.nvm/versions/node/v22.23.3/lib/node_modules/xunay/compiler3/src/runtime.js"
// title: XuNay Kit 全家福
import { signal, computed, effect, mount } from "/root/.nvm/versions/node/v22.23.3/lib/node_modules/xunay/core/src/index.js"
import {
  Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge,
  Input, Textarea, Select, Checkbox, Radio, Switch, NumberInput,
  DatePicker, TimePicker, SearchInput, PasswordStrength, Rate,
  ColorPicker, Slider, Mentions, Transfer, Cascader,
  Alert, Modal, Spinner, Empty, Progress, Avatar, Result,
  Skeleton, Count, Stat, Descriptions, ItemCard, QRCode,
  Typography, Comment, Watermark, Ribbon, Code, Keyboard, Highlight, Ellipsis,
  Tabs, Breadcrumb, Pagination, Steps, Accordion,
  Menu, Anchor, BackTop, Collapse,
  Table, List, Timeline, Tree, TreeSelect, Calendar, SplitPane,
  Carousel, Image, VirtualTable, Kanban, Gantt,
  Layout, Grid, Flex, Affix,
  BarChart, LineChart, PieChart, Sparkline, RingProgress,
  DonutChart, AreaChart, RadarChart, GaugeChart, ScatterChart,
  WaterfallChart, FunnelChart, CandlestickChart, Treemap,
  IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown,
  IconChevronRight, IconChevronLeft, IconChevronDown, IconChevronUp, IconExternalLink,
  IconCheck, IconClose, IconPlus, IconMinus, IconSearch, IconMenu,
  IconMoreH, IconMoreV, IconRefresh, IconEdit, IconCopy, IconTrash, IconSave,
  IconDownload, IconUpload, IconShare, IconBookmark,
  IconZoomIn, IconZoomOut, IconMaximize, IconMinimize, IconGrid, IconList,
  IconFilter, IconSort, IconEye, IconEyeOff,
  IconUser, IconUsers, IconHeart, IconStar, IconMessage, IconBell, IconMail, IconPhone,
  IconFile, IconFolder, IconImage, IconCalendar, IconClock, IconTag, IconFlag, IconCloud, IconDatabase,
  IconMap, IconNavigation, IconCompass, IconPin,
  IconPlay, IconPause, IconCamera, IconMic, IconVolume, IconVolumeOff,
  IconInfo, IconWarn, IconCheckCircle, IconXCircle, IconLock, IconUnlock, IconShield,
  IconSun, IconMoon, IconLink, IconHome, IconSettings,
  IconLayout, IconSidebar, IconColumns, IconRows,
  VirtualList, Sortable, InfiniteList,
  DragUpload, ImageUpload,
  Upload, FileList, Dropzone, FilePreview,
  CodeEditor, RichText, CopyButton, SplitButton,
  Markdown, JSONViewer, DiffViewer, Terminal, CommandPalette, ContextMenu,
  Tooltip, Popover, Dropdown, Drawer, Popconfirm, Message, Notification, Tour,
} from 'xunay/kit'

// 全局状态
const theme = signal('light')
const modalOpen = signal(false)
const drawerOpen = signal(false)
const cmdOpen = signal(false)
const tab = signal('a')
const page = signal(1)
const check = signal(true)
const rate = signal(3)
const num = signal(5)
const slider = signal(40)
const color = signal('#1f6feb')
const search = signal('')
const pass = signal('')
const text = signal('这是一段可以编辑的文字')

const ICON_GROUPS = [
  ['方向', [IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown, IconChevronRight, IconChevronLeft, IconChevronDown, IconChevronUp, IconExternalLink]],
  ['操作', [IconCheck, IconClose, IconPlus, IconMinus, IconSearch, IconMenu, IconMoreH, IconMoreV, IconRefresh, IconEdit, IconCopy, IconTrash, IconSave, IconDownload, IconUpload, IconShare, IconBookmark]],
  ['视图', [IconZoomIn, IconZoomOut, IconMaximize, IconMinimize, IconGrid, IconList, IconFilter, IconSort, IconEye, IconEyeOff]],
  ['用户', [IconUser, IconUsers, IconHeart, IconStar, IconMessage, IconBell, IconMail, IconPhone]],
  ['文件', [IconFile, IconFolder, IconImage, IconCalendar, IconClock, IconTag, IconFlag, IconCloud, IconDatabase, IconLink]],
  ['地图', [IconMap, IconNavigation, IconCompass, IconPin]],
  ['媒体', [IconPlay, IconPause, IconCamera, IconMic, IconVolume, IconVolumeOff]],
  ['状态', [IconInfo, IconWarn, IconCheckCircle, IconXCircle, IconLock, IconUnlock, IconShield]],
  ['主题', [IconSun, IconMoon, IconHome, IconSettings]],
  ['布局', [IconLayout, IconSidebar, IconColumns, IconRows]],
]

const section = (title, ...children) => Card({ title },
  Row({ gap: 2, wrap: true, align: 'center' }, ...children)
)

const gap = () => (() => {
  const _div137 = document.createElement("div")
  Object.assign(_div137.style, { height: '16px' })
  return _div137
})()

mount(() => (() => {
  const _div0 = document.createElement("div")
  __rt__.applyStyle(_div0, 'padding:24px;background:var(--x-bg-soft);min-height:100vh;font-family:system-ui')
  const _t1 = __rt__.renderChild(Row({ gap: 2, align: 'center', style: 'margin-bottom:20px' },
    Text({ tag: 'h1', size: '24px', bold: true }, 'XuNay Kit 全家福'),
    Badge({ type: 'primary' }, '106 组件'),
    Btn({ size: 'sm', onClick: () => theme(theme() === 'light' ? 'dark' : 'light') }, () => '主题：' + theme())
  ))
  if (_t1) _div0.appendChild(_t1)
  const _t2 = __rt__.renderChild(section('1. 基础',
    Btn(null, '默认'), Btn({ type: 'primary' }, '主要'), Btn({ type: 'dashed' }, '虚线'),
    Btn({ type: 'primary', disabled: true }, '禁用'),
    Tag(null, '标签'), Tag({ type: 'danger' }, '危险'),
    Badge({ type: 'success' }, '徽章'),
    Avatar({ text: 'X' }),
    Spinner(),
    Count({ value: 5 }),
    Tooltip({ text: '这是提示' }, '悬停看看')
  ))
  if (_t2) _div0.appendChild(_t2)
  const _t3 = __rt__.renderChild(gap())
  if (_t3) _div0.appendChild(_t3)
  const _t4 = __rt__.renderChild(section('2. 表单',
    (() => {
  const _div5 = document.createElement("div")
  __rt__.applyStyle(_div5, 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;width:100%')
  const _t6 = __rt__.renderChild(Input({ label: '姓名', placeholder: '请输入' }))
  if (_t6) _div5.appendChild(_t6)
  const _t7 = __rt__.renderChild(Input({ label: '带错误', error: '必填' }))
  if (_t7) _div5.appendChild(_t7)
  const _t8 = __rt__.renderChild(Select({ label: '城市', options: [{ value: 'bj', label: '北京' }, { value: 'sh', label: '上海' }] }))
  if (_t8) _div5.appendChild(_t8)
  const _t9 = __rt__.renderChild(DatePicker({ label: '日期' }))
  if (_t9) _div5.appendChild(_t9)
  const _t10 = __rt__.renderChild(TimePicker({ label: '时间' }))
  if (_t10) _div5.appendChild(_t10)
  const _t11 = __rt__.renderChild(SearchInput({ value: () => search(), onChange: v => search(v) }))
  if (_t11) _div5.appendChild(_t11)
  const _t12 = __rt__.renderChild(NumberInput({ label: '数字', value: () => num(), onChange: v => num(v) }))
  if (_t12) _div5.appendChild(_t12)
  const _t13 = __rt__.renderChild(Input({ label: '密码', type: 'password', value: () => pass(), onChange: v => pass(v) }))
  if (_t13) _div5.appendChild(_t13)
  const _t14 = __rt__.renderChild(Checkbox({ label: '同意', checked: () => check(), onChange: v => check(v) }))
  if (_t14) _div5.appendChild(_t14)
  const _t15 = __rt__.renderChild(Radio({ label: '选项 A', name: 'r', checked: true }))
  if (_t15) _div5.appendChild(_t15)
  const _t16 = __rt__.renderChild(Switch({ label: '开关' }))
  if (_t16) _div5.appendChild(_t16)
  return _div5
})()
  ))
  if (_t4) _div0.appendChild(_t4)
  const _t17 = __rt__.renderChild(gap())
  if (_t17) _div0.appendChild(_t17)
  const _t18 = __rt__.renderChild(section('3. 表单扩展',
    (() => {
  const _div19 = document.createElement("div")
  __rt__.applyStyle(_div19, 'display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;width:100%')
  const _t20 = __rt__.renderChild(ColorPicker({ value: () => color(), onChange: v => color(v) }))
  if (_t20) _div19.appendChild(_t20)
  const _div21 = document.createElement("div")
  const _t22 = __rt__.renderChild(Text({ size: '13px', dim: true }, '滑动条: ' + slider()))
  if (_t22) _div21.appendChild(_t22)
  const _t23 = __rt__.renderChild(Slider({ value: () => slider(), onChange: v => slider(v) }))
  if (_t23) _div21.appendChild(_t23)
  _div19.appendChild(_div21)
  const _t24 = __rt__.renderChild(Rate({ value: () => rate(), onChange: v => rate(v) }))
  if (_t24) _div19.appendChild(_t24)
  const _div25 = document.createElement("div")
  const _t26 = __rt__.renderChild(Text({ size: '13px', dim: true }, '密码强度'))
  if (_t26) _div25.appendChild(_t26)
  const _t27 = __rt__.renderChild(PasswordStrength({ value: () => pass() }))
  if (_t27) _div25.appendChild(_t27)
  _div19.appendChild(_div25)
  const _t28 = __rt__.renderChild(Transfer({ data: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }, { key: 'c', label: 'C' }], value: [] }))
  if (_t28) _div19.appendChild(_t28)
  const _t29 = __rt__.renderChild(Cascader({ options: [{ value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }] }] }))
  if (_t29) _div19.appendChild(_t29)
  return _div19
})()
  ))
  if (_t18) _div0.appendChild(_t18)
  const _t30 = __rt__.renderChild(gap())
  if (_t30) _div0.appendChild(_t30)
  const _t31 = __rt__.renderChild(section('4. 展示',
    Alert({ type: 'info', title: '提示' }, '这是信息提示'),
    Alert({ type: 'success', title: '成功' }, '操作成功'),
    Progress({ value: 65, showText: true }),
    Progress({ value: 40 }),
    (() => {
  const _div34 = document.createElement("div")
  __rt__.applyStyle(_div34, 'width:200px')
  const _t35 = __rt__.renderChild(Text({ size: '13px', dim: true }, '分段进度'))
  if (_t35) _div34.appendChild(_t35)
  return _div34
})(),
    (() => {
  const _div32 = document.createElement("div")
  __rt__.applyStyle(_div32, 'width:200px')
  const _t33 = __rt__.renderChild(BarChart({ data: [30, 60, 40, 80, 50], labels: ['一', '二', '三', '四', '五'], height: 150 }))
  if (_t33) _div32.appendChild(_t33)
  return _div32
})()
  ))
  if (_t31) _div0.appendChild(_t31)
  const _t36 = __rt__.renderChild(gap())
  if (_t36) _div0.appendChild(_t36)
  const _t37 = __rt__.renderChild(section('5. 展示扩展',
    Row({ gap: 2 },
      Ribbon({ text: 'New' }, Text({}, '带角标')),
      Watermark({ text: 'XUNAY' }, (() => {
  const _div38 = document.createElement("div")
  __rt__.applyStyle(_div38, 'padding:20px;border:1px solid var(--x-border)')
  _div38.appendChild(document.createTextNode('水印卡片'))
  return _div38
})())
    ),
    Keyboard(null, 'Ctrl'), '+', Keyboard(null, 'K'),
    Highlight({ text: 'XuNay 是最好的框架', keyword: '最好' }),
    Ellipsis({ lines: 1, style: 'width:150px' }, '这是一段很长很长很长很长的文字要被省略'),
    Stat({ label: '总用户', value: 12800, unit: '人', trend: 12 })
  ))
  if (_t37) _div0.appendChild(_t37)
  const _t39 = __rt__.renderChild(gap())
  if (_t39) _div0.appendChild(_t39)
  const _t40 = __rt__.renderChild(section('6. Modal & 反馈',
    Btn({ type: 'primary', onClick: () => modalOpen(true) }, '打开 Modal'),
    Btn({ onClick: () => drawerOpen(true) }, '打开 Drawer'),
    Btn({ onClick: () => Message.success('成功消息') }, 'Message'),
    Btn({ onClick: () => Notification.info({ title: '通知', desc: '内容' }) }, 'Notification'),
    Popconfirm({ title: '确定删除？', onConfirm: () => Message.info('已删除') }, Btn(null, 'Popconfirm')),
    Popover({ content: '气泡内容' }, Btn(null, 'Popover')),
    Dropdown({ items: [{ key: '1', label: '选项 1' }, { key: '2', label: '选项 2' }], onSelect: i => Message.info(i.label) }, Btn(null, 'Dropdown ▾')),
    CopyButton({ text: 'XuNay' }),
    Skeleton({ lines: 2 })
  ))
  if (_t40) _div0.appendChild(_t40)
  const _t41 = __rt__.renderChild(gap())
  if (_t41) _div0.appendChild(_t41)
  const _t42 = __rt__.renderChild(section('7. 数据',
    (() => {
  const _div47 = document.createElement("div")
  __rt__.applyStyle(_div47, 'width:100%')
  const _t48 = __rt__.renderChild(Table({
        columns: [
          { title: 'ID', key: 'id' },
          { title: '名称', key: 'name' },
          { title: '状态', render: r => Tag({ type: r.ok ? 'success' : 'danger' }, r.ok ? '正常' : '异常') },
        ],
        data: [
          { id: 1, name: '服务 A', ok: true },
          { id: 2, name: '服务 B', ok: false },
          { id: 3, name: '服务 C', ok: true },
        ],
      }))
  if (_t48) _div47.appendChild(_t48)
  return _div47
})(),
    (() => {
  const _div45 = document.createElement("div")
  __rt__.applyStyle(_div45, 'flex:1;min-width:200px')
  const _t46 = __rt__.renderChild(List({
        items: [{ title: '项目 1' }, { title: '项目 2' }, { title: '项目 3' }],
        hover: true,
        render: it => Row({ gap: 2, align: 'center', style: 'padding:8px' }, Badge({ type: 'primary' }, '●'), it.title)
      }))
  if (_t46) _div45.appendChild(_t46)
  return _div45
})(),
    (() => {
  const _div43 = document.createElement("div")
  __rt__.applyStyle(_div43, 'flex:1;min-width:200px')
  const _t44 = __rt__.renderChild(Timeline({
        items: [
          { time: '10:00', title: '创建订单', desc: '用户下单' },
          { time: '10:05', title: '支付成功', color: 'var(--x-success)' },
          { time: '10:10', title: '发货', desc: '顺丰 SF123' },
        ]
      }))
  if (_t44) _div43.appendChild(_t44)
  return _div43
})()
  ))
  if (_t42) _div0.appendChild(_t42)
  const _t49 = __rt__.renderChild(gap())
  if (_t49) _div0.appendChild(_t49)
  const _t50 = __rt__.renderChild(section('8. 图表',
    (() => {
  const _div79 = document.createElement("div")
  __rt__.applyStyle(_div79, 'background:#fff;padding:8px;border-radius:8px')
  const _t80 = __rt__.renderChild(LineChart({ data: [20, 40, 30, 60, 80, 50, 70], labels: ['一', '二', '三', '四', '五', '六', '日'], height: 180 }))
  if (_t80) _div79.appendChild(_t80)
  return _div79
})(),
    (() => {
  const _div77 = document.createElement("div")
  __rt__.applyStyle(_div77, 'background:#fff;padding:8px;border-radius:8px')
  const _t78 = __rt__.renderChild(BarChart({ data: [40, 70, 50, 90], labels: ['A', 'B', 'C', 'D'], height: 180 }))
  if (_t78) _div77.appendChild(_t78)
  return _div77
})(),
    (() => {
  const _div75 = document.createElement("div")
  __rt__.applyStyle(_div75, 'background:#fff;padding:8px;border-radius:8px')
  const _t76 = __rt__.renderChild(PieChart({ data: [{ value: 40, label: 'A' }, { value: 30, label: 'B' }, { value: 20, label: 'C' }], size: 180 }))
  if (_t76) _div75.appendChild(_t76)
  return _div75
})(),
    (() => {
  const _div73 = document.createElement("div")
  __rt__.applyStyle(_div73, 'background:#fff;padding:20px;border-radius:8px')
  const _t74 = __rt__.renderChild(RingProgress({ value: 72, size: 120 }))
  if (_t74) _div73.appendChild(_t74)
  return _div73
})(),
    (() => {
  const _div71 = document.createElement("div")
  __rt__.applyStyle(_div71, 'background:#fff;padding:20px;border-radius:8px')
  const _t72 = __rt__.renderChild(DonutChart({ data: [{ value: 50, label: 'A' }, { value: 30, label: 'B' }, { value: 20, label: 'C' }], size: 160 }))
  if (_t72) _div71.appendChild(_t72)
  return _div71
})(),
    (() => {
  const _div69 = document.createElement("div")
  __rt__.applyStyle(_div69, 'background:#fff;padding:20px;border-radius:8px')
  const _t70 = __rt__.renderChild(GaugeChart({ value: 68, size: 160, label: 'CPU' }))
  if (_t70) _div69.appendChild(_t70)
  return _div69
})(),
    (() => {
  const _div67 = document.createElement("div")
  __rt__.applyStyle(_div67, 'background:#fff;padding:20px;border-radius:8px')
  const _t68 = __rt__.renderChild(RadarChart({ data: [{ label: 'A', value: 80 }, { label: 'B', value: 60 }, { label: 'C', value: 90 }, { label: 'D', value: 50 }, { label: 'E', value: 70 }], size: 200 }))
  if (_t68) _div67.appendChild(_t68)
  return _div67
})(),
    (() => {
  const _div65 = document.createElement("div")
  __rt__.applyStyle(_div65, 'background:#fff;padding:8px;border-radius:8px')
  const _t66 = __rt__.renderChild(AreaChart({ data: [20, 40, 30, 60, 80, 50, 70], labels: ['一', '二', '三', '四', '五', '六', '日'], height: 180 }))
  if (_t66) _div65.appendChild(_t66)
  return _div65
})(),
    (() => {
  const _div63 = document.createElement("div")
  __rt__.applyStyle(_div63, 'background:#fff;padding:8px;border-radius:8px')
  const _t64 = __rt__.renderChild(WaterfallChart({ data: [20, -10, 15, -5, 30], labels: ['A', 'B', 'C', 'D', 'E'], height: 200 }))
  if (_t64) _div63.appendChild(_t64)
  return _div63
})(),
    (() => {
  const _div61 = document.createElement("div")
  __rt__.applyStyle(_div61, 'background:#fff;padding:8px;border-radius:8px')
  const _t62 = __rt__.renderChild(ScatterChart({ data: [{ x: 10, y: 20 }, { x: 20, y: 50 }, { x: 30, y: 30 }, { x: 50, y: 80 }, { x: 70, y: 45 }, { x: 80, y: 90 }], height: 200 }))
  if (_t62) _div61.appendChild(_t62)
  return _div61
})(),
    (() => {
  const _div59 = document.createElement("div")
  __rt__.applyStyle(_div59, 'background:#fff;padding:8px;border-radius:8px')
  const _t60 = __rt__.renderChild(FunnelChart({ data: [{ label: '访问', value: 100 }, { label: '注册', value: 60 }, { label: '下单', value: 30 }], height: 200 }))
  if (_t60) _div59.appendChild(_t60)
  return _div59
})(),
    (() => {
  const _div57 = document.createElement("div")
  __rt__.applyStyle(_div57, 'background:#fff;padding:8px;border-radius:8px')
  const _t58 = __rt__.renderChild(Treemap({ data: [{ label: 'A', value: 50 }, { label: 'B', value: 30 }, { label: 'C', value: 20 }], width: 400, height: 180 }))
  if (_t58) _div57.appendChild(_t58)
  return _div57
})(),
    (() => {
  const _div55 = document.createElement("div")
  __rt__.applyStyle(_div55, 'background:#fff;padding:8px;border-radius:8px')
  const _t56 = __rt__.renderChild(CandlestickChart({ data: [{ open: 100, high: 110, low: 95, close: 105 }, { open: 105, high: 115, low: 100, close: 102 }, { open: 102, high: 108, low: 90, close: 95 }, { open: 95, high: 105, low: 92, close: 103 }], labels: ['一', '二', '三', '四'], height: 200 }))
  if (_t56) _div55.appendChild(_t56)
  return _div55
})(),
    (() => {
  const _div53 = document.createElement("div")
  __rt__.applyStyle(_div53, 'background:#fff;padding:8px;border-radius:8px')
  const _t54 = __rt__.renderChild(Sparkline({ data: [3, 5, 4, 7, 6, 9, 8, 11], width: 120, height: 40, area: true }))
  if (_t54) _div53.appendChild(_t54)
  return _div53
})(),
    (() => {
  const _div51 = document.createElement("div")
  __rt__.applyStyle(_div51, 'background:#fff;padding:8px;border-radius:8px')
  const _t52 = __rt__.renderChild(Heatmap({ data: Array.from({ length: 7 }, (_, r) => Array.from({ length: 12 }, (_, c) => Math.round(Math.random() * 20)),), rows: 7, cols: 12, cell: 22 }))
  if (_t52) _div51.appendChild(_t52)
  return _div51
})()
  ))
  if (_t50) _div0.appendChild(_t50)
  const _t81 = __rt__.renderChild(gap())
  if (_t81) _div0.appendChild(_t81)
  const _t82 = __rt__.renderChild(section('9. 导航',
    (() => {
  const _div85 = document.createElement("div")
  __rt__.applyStyle(_div85, 'width:100%')
  const _t86 = __rt__.renderChild(Tabs({
        items: [{ key: 'a', title: '标签 A' }, { key: 'b', title: '标签 B' }, { key: 'c', title: '标签 C' }],
        active: () => tab(),
        onChange: k => tab(k)
      }))
  if (_t86) _div85.appendChild(_t86)
  return _div85
})(),
    (() => {
  const _div83 = document.createElement("div")
  __rt__.applyStyle(_div83, 'width:100%')
  const _t84 = __rt__.renderChild(Breadcrumb({ items: [{ label: '首页' }, { label: '列表' }, { label: '详情' }] }))
  if (_t84) _div83.appendChild(_t84)
  return _div83
})(),
    Pagination({ page: () => page(), total: 100, pageSize: 10, onChange: p => page(p) }),
    Steps({ steps: [{ label: '第一步' }, { label: '第二步' }, { label: '第三步' }], current: 1 })
  ))
  if (_t82) _div0.appendChild(_t82)
  const _t87 = __rt__.renderChild(gap())
  if (_t87) _div0.appendChild(_t87)
  const _t88 = __rt__.renderChild(section('10. 折叠与树',
    (() => {
  const _div93 = document.createElement("div")
  __rt__.applyStyle(_div93, 'flex:1;min-width:220px')
  const _t94 = __rt__.renderChild(Accordion({
        items: [{ title: '折叠 1', content: '内容 1' }, { title: '折叠 2', content: '内容 2' }]
      }))
  if (_t94) _div93.appendChild(_t94)
  return _div93
})(),
    (() => {
  const _div91 = document.createElement("div")
  __rt__.applyStyle(_div91, 'flex:1;min-width:220px')
  const _t92 = __rt__.renderChild(Tree({
        data: [
          { key: 'a', label: '父节点 A', children: [{ key: 'a1', label: '子 A1' }, { key: 'a2', label: '子 A2' }] },
          { key: 'b', label: '父节点 B', children: [{ key: 'b1', label: '子 B1' }] }
        ]
      }))
  if (_t92) _div91.appendChild(_t92)
  return _div91
})(),
    (() => {
  const _div89 = document.createElement("div")
  __rt__.applyStyle(_div89, 'flex:1;min-width:220px')
  const _t90 = __rt__.renderChild(Menu({ items: [{ key: '1', label: '菜单 1' }, { key: '2', label: '菜单 2' }], selected: '1' }))
  if (_t90) _div89.appendChild(_t90)
  return _div89
})()
  ))
  if (_t88) _div0.appendChild(_t88)
  const _t95 = __rt__.renderChild(gap())
  if (_t95) _div0.appendChild(_t95)
  const _t96 = __rt__.renderChild(section('11. 编辑器',
    (() => {
  const _div103 = document.createElement("div")
  __rt__.applyStyle(_div103, 'flex:1;min-width:300px')
  const _t104 = __rt__.renderChild(Text({ size: '13px', dim: true }, 'Markdown：'))
  if (_t104) _div103.appendChild(_t104)
  const _t105 = __rt__.renderChild(Markdown({ value: '# 标题\n\n**粗体** 和 *斜体*\n\n- 列表项 1\n- 列表项 2', height: '200px' }))
  if (_t105) _div103.appendChild(_t105)
  return _div103
})(),
    (() => {
  const _div100 = document.createElement("div")
  __rt__.applyStyle(_div100, 'flex:1;min-width:300px')
  const _t101 = __rt__.renderChild(Text({ size: '13px', dim: true }, 'JSON 查看器：'))
  if (_t101) _div100.appendChild(_t101)
  const _t102 = __rt__.renderChild(JSONViewer({ data: { name: 'XuNay', version: '1.2.8', features: ['signal', 'compiler'] } }))
  if (_t102) _div100.appendChild(_t102)
  return _div100
})(),
    (() => {
  const _div97 = document.createElement("div")
  __rt__.applyStyle(_div97, 'flex:1;min-width:300px')
  const _t98 = __rt__.renderChild(Text({ size: '13px', dim: true }, 'Diff：'))
  if (_t98) _div97.appendChild(_t98)
  const _t99 = __rt__.renderChild(DiffViewer({ oldText: 'line 1\nline 2\nline 3', newText: 'line 1\nline 2 modified\nline 3\nline 4' }))
  if (_t99) _div97.appendChild(_t99)
  return _div97
})()
  ))
  if (_t96) _div0.appendChild(_t96)
  const _t106 = __rt__.renderChild(gap())
  if (_t106) _div0.appendChild(_t106)
  const _t107 = __rt__.renderChild(section('12. 上传',
    (() => {
  const _div110 = document.createElement("div")
  __rt__.applyStyle(_div110, 'flex:1;min-width:250px')
  const _t111 = __rt__.renderChild(DragUpload({ onFiles: f => Message.success('选中 ' + f.length + ' 个文件') }))
  if (_t111) _div110.appendChild(_t111)
  return _div110
})(),
    (() => {
  const _div108 = document.createElement("div")
  __rt__.applyStyle(_div108, 'flex:1;min-width:250px')
  const _t109 = __rt__.renderChild(ImageUpload({ onFile: f => Message.success('图片: ' + f.name) }))
  if (_t109) _div108.appendChild(_t109)
  return _div108
})()
  ))
  if (_t107) _div0.appendChild(_t107)
  const _t112 = __rt__.renderChild(gap())
  if (_t112) _div0.appendChild(_t112)
  const _t113 = __rt__.renderChild(section('13. 虚拟滚动',
    (() => {
  const _div114 = document.createElement("div")
  __rt__.applyStyle(_div114, 'flex:1;min-width:280px')
  const _t115 = __rt__.renderChild(Text({ size: '13px', dim: true }, '1000 项虚拟列表：'))
  if (_t115) _div114.appendChild(_t115)
  const _t116 = __rt__.renderChild(VirtualList({
        items: Array.from({ length: 1000 }, (_, i) => '项目 ' + (i + 1)),
        itemHeight: 36,
        height: 300
      }))
  if (_t116) _div114.appendChild(_t116)
  return _div114
})()
  ))
  if (_t113) _div0.appendChild(_t113)
  const _t117 = __rt__.renderChild(gap())
  if (_t117) _div0.appendChild(_t117)
  const _t118 = __rt__.renderChild(section('13.5 SVG 图标（79 个）',
    (() => {
  const _div119 = document.createElement("div")
  __rt__.applyStyle(_div119, 'width:100%')
  const _t120 = __rt__.renderChild(ICON_GROUPS.map(([name, icons]) =>
        (() => {
  const _div121 = document.createElement("div")
  __rt__.applyStyle(_div121, 'margin-bottom:20px')
  const _div122 = document.createElement("div")
  __rt__.applyStyle(_div122, 'font-size:12px;font-weight:600;color:var(--x-text-dim);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px')
  const _t123 = __rt__.renderChild(name)
  if (_t123) _div122.appendChild(_t123)
  _div121.appendChild(_div122)
  const _div124 = document.createElement("div")
  __rt__.applyStyle(_div124, 'display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px')
  const _t125 = __rt__.renderChild(icons.map((Icon, i) =>
              (() => {
  const _div126 = document.createElement("div")
  __rt__.applyStyle(_div126, 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;background:var(--x-bg-elev);border:1px solid var(--x-border);border-radius:var(--x-radius);color:var(--x-text);cursor:pointer;transition:all .15s')
  _div126.addEventListener("mouseenter", e => { e.currentTarget.style.borderColor = 'var(--x-primary)'; e.currentTarget.style.color = 'var(--x-primary)'; e.currentTarget.style.transform = 'translateY(-2px)' })
  _div126.addEventListener("mouseleave", e => { e.currentTarget.style.borderColor = 'var(--x-border)'; e.currentTarget.style.color = 'var(--x-text)'; e.currentTarget.style.transform = 'none' })
  const _t127 = __rt__.renderChild(Icon({ size: 22 }))
  if (_t127) _div126.appendChild(_t127)
  const _div128 = document.createElement("div")
  __rt__.applyStyle(_div128, 'font-size:9px;color:var(--x-text-mute);font-family:var(--x-mono);text-align:center;line-height:1.2;overflow:hidden;text-overflow:ellipsis;width:100%')
  const _t129 = __rt__.renderChild('i' + i)
  if (_t129) _div128.appendChild(_t129)
  _div126.appendChild(_div128)
  return _div126
})()
            ))
  if (_t125) _div124.appendChild(_t125)
  _div121.appendChild(_div124)
  return _div121
})()
      ))
  if (_t120) _div119.appendChild(_t120)
  return _div119
})()
  ))
  if (_t118) _div0.appendChild(_t118)
  const _t130 = __rt__.renderChild(gap())
  if (_t130) _div0.appendChild(_t130)
  const _t131 = __rt__.renderChild(section('14. 状态',
    Result({ status: 'success', title: '操作成功', subTitle: '数据已保存' }),
    Empty({ text: '暂无数据' }),
    (() => {
  const _div132 = document.createElement("div")
  __rt__.applyStyle(_div132, 'flex:1;min-width:200px')
  const _t133 = __rt__.renderChild(Descriptions({ items: [{ label: '姓名', value: 'XuNay' }, { label: '版本', value: '1.2.8' }], bordered: true }))
  if (_t133) _div132.appendChild(_t133)
  return _div132
})()
  ))
  if (_t131) _div0.appendChild(_t131)
  const _t134 = __rt__.renderChild(Modal({
    open: () => modalOpen(),
    onClose: () => modalOpen(false),
    title: 'Modal 演示',
    footer: Row({ gap: 1, justify: 'end' },
      Btn({ onClick: () => modalOpen(false) }, '取消'),
      Btn({ type: 'primary', onClick: () => { Message.success('确定'); modalOpen(false) } }, '确定')
    )
  }, '这是一个 Modal，点 ESC 或遮罩关闭。'))
  if (_t134) _div0.appendChild(_t134)
  const _t135 = __rt__.renderChild(Drawer({
    open: () => drawerOpen(),
    onClose: () => drawerOpen(false),
    title: '抽屉标题'
  }, Text({}, '抽屉内容'), Text({}, '可以放任何东西')))
  if (_t135) _div0.appendChild(_t135)
  const _t136 = __rt__.renderChild(BackTop())
  if (_t136) _div0.appendChild(_t136)
  return _div0
})(), '#app')
