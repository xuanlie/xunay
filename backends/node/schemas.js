export class ValidationError extends Error {
  constructor(msg) { super(msg); this.name = 'ValidationError' }
}

export class Todo {
  constructor({ id = 0, title = '', done = false, created_at = 0 } = {}) {
    this.id = id; this.title = title; this.done = done; this.created_at = created_at
  }
  validate() {
    this.title = String(this.title || '').trim()
    if (!this.title) throw new ValidationError('title 不能为空')
    if (this.title.length > 200) throw new ValidationError('title 最多 200 字')
    if (!this.created_at) this.created_at = Date.now()
    return this
  }
}

export class TodoIn {
  constructor({ id = 0 } = {}) { this.id = Number(id) || 0 }
  validateId() {
    if (this.id <= 0) throw new ValidationError('id 必填')
    return this
  }
}
