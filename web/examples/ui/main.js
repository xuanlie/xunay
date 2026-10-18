/* XuNay UI · 展示页交互层 · 纯原生 JS */
(() => {
  const $  = (s, r=document) => r.querySelector(s)
  const $$ = (s, r=document) => [...r.querySelectorAll(s)]

  window.xTheme = n => n
    ? document.documentElement.setAttribute('data-theme', n)
    : document.documentElement.removeAttribute('data-theme')
  window.xAccent = n => n
    ? document.documentElement.setAttribute('data-accent', n)
    : document.documentElement.removeAttribute('data-accent')

  // ─── 全局点击 ───
  document.addEventListener('click', e => {

    // Tabs / Segment
    const tab = e.target.closest('.tabs .tab, .tabs-pill .tab, .tabs-card .tab, .tabs-vertical .tab, .segment .segment-item')
    if (tab && !tab.disabled) {
      $$('.tab, .segment-item', tab.parentElement)
        .forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      return
    }

    // Accordion
    const accT = e.target.closest('.accordion-trigger')
    if (accT) {
      const item = accT.closest('.accordion-item')
      const open = item.getAttribute('aria-expanded') === 'true'
      item.setAttribute('aria-expanded', open ? 'false' : 'true')
      item.classList.toggle('open', !open)
      return
    }

    // Switch
    const sw = e.target.closest('.switch')
    if (sw && !sw.disabled && !sw.classList.contains('disabled')) {
      sw.classList.toggle('on')
      sw.setAttribute('aria-checked', sw.classList.contains('on'))
      return
    }

    // Rate
    const star = e.target.closest('.rate-star')
    if (star) {
      const stars = $$('.rate-star', star.closest('.rate'))
      const idx = stars.indexOf(star)
      stars.forEach((s, i) => s.classList.toggle('active', i <= idx))
      const txt = star.closest('.rate').querySelector('.rate-text')
      if (txt) txt.textContent = (idx + 1) + '.0 分'
      return
    }

    // Pagination
    const pageB = e.target.closest('.pagination button, .pagination .page-item')
    if (pageB && !pageB.disabled && !pageB.classList.contains('disabled') && !pageB.classList.contains('active')) {
      const txt = pageB.textContent.trim()
      if (/^\d+$/.test(txt) || txt === '‹' || txt === '›') {
        if (/^\d+$/.test(txt)) {
          $$('button, .page-item', pageB.parentElement).forEach(b => b.classList.remove('active'))
          pageB.classList.add('active')
        }
      }
      return
    }

    // Dropdown 触发
    const dd = e.target.closest('[data-dropdown]')
    if (dd) {
      const menu = dd.nextElementSibling
      if (menu && menu.classList.contains('dropdown-menu')) {
        const isOpen = menu.classList.contains('open')
        $$('.dropdown-menu.open').forEach(m => m.classList.remove('open'))
        if (!isOpen) menu.classList.add('open')
        e.stopPropagation()
      }
      return
    }
    // 点其他地方关闭
    if (!e.target.closest('.dropdown-menu')) {
      $$('.dropdown-menu.open').forEach(m => m.classList.remove('open'))
    }

    // Dropdown 菜单项
    const ddItem = e.target.closest('.dropdown-menu .dropdown-item, .menu-popup .menu-item')
    if (ddItem) {
      $$('.dropdown-item, .menu-item', ddItem.parentElement)
        .forEach(i => i.classList.remove('active'))
      ddItem.classList.add('active')
      $$('.dropdown-menu.open').forEach(m => m.classList.remove('open'))
      return
    }

    // Modal / Drawer 打开
    const openBtn = e.target.closest('[data-open]')
    if (openBtn) {
      const t = $('#' + openBtn.dataset.open)
      if (t) t.classList.add('open', 'visible')
      return
    }
    // 关闭
    const closeBtn = e.target.closest('[data-close], .modal-close, .drawer-close')
    if (closeBtn) {
      const wrap = closeBtn.closest('.modal-overlay, .drawer')
      if (wrap) wrap.classList.remove('open', 'visible')
      return
    }
    // 点击遮罩
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('drawer-mask')) {
      e.target.classList.remove('open', 'visible')
      return
    }

    // Tree 展开
    const tc = e.target.closest('.tree-content')
    if (tc && !tc.querySelector('.tree-arrow.leaf')) {
      tc.closest('.tree-node').classList.toggle('open')
      return
    }

    // 复制
    const copyBtn = e.target.closest('.copy-btn')
    if (copyBtn) {
      const text = copyBtn.dataset.copy || copyBtn.textContent.trim()
      navigator.clipboard?.writeText(text)
      const orig = copyBtn.innerHTML
      copyBtn.classList.add('copied')
      copyBtn.innerHTML = '✓ 已复制'
      setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.innerHTML = orig }, 1500)
      return
    }

    // Popconfirm
    const confirmBtn = e.target.closest('[data-confirm]')
    if (confirmBtn) {
      if (confirm(confirmBtn.dataset.confirm)) {
        confirmBtn.textContent = '✓ 已处理'
        confirmBtn.disabled = true
      }
      return
    }

    // BackTop
    if (e.target.closest('.backtop')) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Message
    const msgBtn = e.target.closest('[data-message]')
    if (msgBtn) {
      showMessage(msgBtn.dataset.message, msgBtn.dataset.type || 'info')
      return
    }

    // Notification
    const notiBtn = e.target.closest('[data-notification]')
    if (notiBtn) {
      showNotification(notiBtn.dataset.notification, notiBtn.dataset.type || 'info')
      return
    }

    // 关闭通知
    if (e.target.closest('.notification-close')) {
      e.target.closest('.notification').remove()
      return
    }
  })

  // 数字输入
  document.addEventListener('click', e => {
    const nb = e.target.closest('.number-input .num-btn')
    if (!nb) return
    const w = nb.closest('.number-input')
    const f = w.querySelector('.num-field')
    const step = Number(f.step) || 1
    const val  = Number(f.value) || 0
    f.value = nb.textContent.trim() === '+' ? val + step : val - step
  })

  // Slider 联动
  document.addEventListener('input', e => {
    if (e.target.matches('input[type="range"]')) {
      const v = e.target.closest('.slider')?.querySelector('.slider-value')
      if (v) v.textContent = e.target.value + (e.target.dataset.suffix || '%')
    }
  })

  // Tooltip 悬浮
  document.addEventListener('mouseover', e => {
    const tip = e.target.closest('[data-tooltip]')
    if (tip && !tip.querySelector('.tooltip-bubble')) {
      const b = document.createElement('div')
      b.className = 'tooltip tooltip-bubble'
      b.textContent = tip.dataset.tooltip
      b.setAttribute('data-side', tip.dataset.side || 'top')
      b.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;white-space:nowrap'
      tip.style.position = 'relative'
      tip.appendChild(b)
    }
  })
  document.addEventListener('mouseout', e => {
    const tip = e.target.closest('[data-tooltip]')
    if (tip) tip.querySelector('.tooltip-bubble')?.remove()
  })

  // Popover 点击
  document.addEventListener('click', e => {
    const popT = e.target.closest('[data-popover]')
    if (popT) {
      const body = popT.nextElementSibling
      if (body && body.classList.contains('popover')) {
        const isOpen = body.classList.contains('open')
        $$('.popover.open').forEach(p => p.classList.remove('open'))
        if (!isOpen) body.classList.add('open')
        e.stopPropagation()
      }
      return
    }
    if (!e.target.closest('.popover')) {
      $$('.popover.open').forEach(p => p.classList.remove('open'))
    }
  })

  // Esc 关闭
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $$('.dropdown-menu.open, .modal-overlay.open, .drawer.open, .popover.open')
        .forEach(el => el.classList.remove('open', 'visible'))
    }
  })

  // ─── Message / Notification ───
  function ensure(sel, cls) {
    let b = $(sel)
    if (!b) { b = document.createElement('div'); b.className = cls; document.body.appendChild(b) }
    return b
  }
  function showMessage(text, type) {
    const box = ensure('.message-container', 'message-container')
    const el = document.createElement('div')
    el.className = `message message-${type}`
    const icon = { success:'✓', danger:'✕', warning:'⚠', info:'ℹ' }[type] || 'ℹ'
    el.innerHTML = `<span class="message-icon">${icon}</span>${text}`
    box.appendChild(el)
    setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300) }, 2500)
  }
  function showNotification(title, type) {
    const box = ensure('.notification-container', 'notification-container')
    const el = document.createElement('div')
    el.className = `notification notification-${type}`
    const icon = { success:'✓', danger:'✕', warning:'⚠', info:'ℹ' }[type] || 'ℹ'
    el.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <div class="notification-body">
        <div class="notification-title">${title}</div>
        <div class="notification-desc">这是通知描述。</div>
      </div>
      <button class="notification-close">×</button>`
    box.appendChild(el)
    el.querySelector('.notification-close').onclick = () => el.remove()
    setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300) }, 4000)
  }
})()
