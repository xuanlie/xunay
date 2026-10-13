// 表单双向绑定：把 signal 和 input 绑成一行
export function model(sig) {
  return {
    value: () => sig(),
    on: {
      input: e => sig(e.target.value)
    }
  }
}

export function modelCheck(sig) {
  return {
    checked: () => sig(),
    on: { change: e => sig(e.target.checked) }
  }
}

export function modelNum(sig) {
  return {
    value: () => sig(),
    on: { input: e => {
      const raw = e.target.value
      if (raw === '-' || raw === '-.') return
      // V008 修复：空串保留 ''，不强制归 0
      sig(raw === '' ? '' : Number(raw) || 0)
    } }
  }
}

// 用法：input({ class:'input', ...model(draft) })

