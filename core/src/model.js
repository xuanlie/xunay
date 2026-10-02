// 表单双向绑定：把 signal 和 input 绑成一行
export function model(sig) {
  return {
    value: () => sig(),
    on: {
      input: e => sig(e.target.value),
      change: e => sig(e.target.value)
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
    on: { input: e => sig(Number(e.target.value) || 0) }
  }
}

// 用法：input({ class:'input', ...model(draft) })

