// XuNay Form · 表单校验 + 状态管理
import { signal, computed } from './core.js'

// ===== 内置校验规则 =====
export const rules = {
  required: (msg = '必填') => v => (v === '' || v == null || (Array.isArray(v) && !v.length)) ? msg : null,
  minLength: (n, msg) => v => v && v.length < n ? (msg || `至少 ${n} 个字符`) : null,
  maxLength: (n, msg) => v => v && v.length > n ? (msg || `最多 ${n} 个字符`) : null,
  min: (n, msg) => v => Number(v) < n ? (msg || `不能小于 ${n}`) : null,
  max: (n, msg) => v => Number(v) > n ? (msg || `不能大于 ${n}`) : null,
  pattern: (re, msg = '格式错误') => v => v && !re.test(v) ? msg : null,
  email: (msg = '邮箱格式错误') => v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : null,
  phone: (msg = '手机号格式错误') => v => v && !/^1[3-9]\d{9}$/.test(v) ? msg : null,
  url: (msg = 'URL 格式错误') => v => { try { new URL(v); return null } catch { return msg } },
  number: (msg = '必须是数字') => v => v !== '' && isNaN(Number(v)) ? msg : null,
  integer: (msg = '必须是整数') => v => v !== '' && !Number.isInteger(Number(v)) ? msg : null,
  sameAs: (otherKey, msg = '两次输入不一致') => (v, values) => v !== values[otherKey] ? msg : null,
  oneOf: (list, msg = '不在允许范围') => v => !list.includes(v) ? msg : null,
  custom: (fn) => fn,
}

// ===== 表单 =====
export function createForm(opts = {}) {
  const {
    initial = {},
    rules: formRules = {},
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit = null,
  } = opts

  const values = signal({ ...initial })
  const errors = signal({})
  const touched = signal({})
  const submitting = signal(false)

  // 校验单个字段
  function validateField(key, value, allValues) {
    const list = formRules[key]
    if (!list) return null
    for (const rule of list) {
      const err = typeof rule === 'function' ? rule(value, allValues || values()) : null
      if (err) return err
    }
    return null
  }

  // 校验全部
  function validate() {
    const vals = values()
    const errs = {}
    for (const k in formRules) {
      const err = validateField(k, vals[k], vals)
      if (err) errs[k] = err
    }
    errors(errs)
    return Object.keys(errs).length === 0
  }

  const form = {
    values,
    errors,
    touched,
    submitting,
    isValid: computed(() => Object.keys(errors()).length === 0),
    isDirty: computed(() => {
      const v = values(), i = initial
      for (const k in i) if (v[k] !== i[k]) return true
      return false
    }),

    get(key) { return values()[key] },
    set(key, value) {
      values({ ...values(), [key]: value })
      if (validateOnChange) {
        const err = validateField(key, value)
        const errs = { ...errors() }
        if (err) errs[key] = err
        else delete errs[key]
        errors(errs)
      }
    },
    setValues(v) { values({ ...values(), ...v }) },
    blur(key) {
      touched({ ...touched(), [key]: true })
      if (validateOnBlur) {
        const err = validateField(key, values()[key])
        const errs = { ...errors() }
        if (err) errs[key] = err
        else delete errs[key]
        errors(errs)
      }
    },
    reset() {
      values({ ...initial })
      errors({})
      touched({})
    },
    validate,
    validateField: (key) => validateField(key, values()[key]),

    async handleSubmit(fn) {
      touched(Object.fromEntries(Object.keys(values()).map(k => [k, true])))
      if (!validate()) return false
      submitting(true)
      try {
        if (fn) await fn(values())
        else if (onSubmit) await onSubmit(values())
        return true
      } finally {
        submitting(false)
      }
    },

    // 便捷绑定：直接传给 input
    field(key) {
      return {
        value: () => values()[key] ?? '',
        on: {
          input: e => form.set(key, e.target.value),
          blur: () => form.blur(key),
        },
        class: () => errors()[key] && touched()[key] ? 'error' : '',
      }
    },
  }

  return form
}

export default createForm
