import crypto from 'crypto'

export class ValidationError extends Error {
  constructor(msg) { super(msg); this.name = 'ValidationError' }
}

export class Todo {
  constructor({ id = null, title = '', done = false, created_at = 0 } = {}) {
    this.id = id || crypto.randomUUID()
    this.title = title
    this.done = !!done
    this.created_at = created_at
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
  constructor({ id = '' } = {}) { this.id = String(id || '') }
  validateId() {
    if (!this.id) throw new ValidationError('id 必填')
    return this
  }
}
