export interface FormOptions {
  initial?: Record<string, any>
  rules?: Record<string, Array<(v: any, values: any) => string | null>>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  onSubmit?: (values: any) => void | Promise<void>
}
export declare function createForm(opts?: FormOptions): any
export declare const rules: {
  required: (msg?: string) => (v: any) => string | null
  minLength: (n: number, msg?: string) => (v: any) => string | null
  maxLength: (n: number, msg?: string) => (v: any) => string | null
  min: (n: number, msg?: string) => (v: any) => string | null
  max: (n: number, msg?: string) => (v: any) => string | null
  pattern: (re: RegExp, msg?: string) => (v: any) => string | null
  email: (msg?: string) => (v: any) => string | null
  phone: (msg?: string) => (v: any) => string | null
  url: (msg?: string) => (v: any) => string | null
  number: (msg?: string) => (v: any) => string | null
  integer: (msg?: string) => (v: any) => string | null
  sameAs: (otherKey: string, msg?: string) => (v: any, values: any) => string | null
  oneOf: (list: any[], msg?: string) => (v: any) => string | null
  custom: (fn: (v: any, values: any) => string | null) => (v: any, values: any) => string | null
}
