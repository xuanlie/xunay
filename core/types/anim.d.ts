export declare function anim(el: Element, keyframes: any, options?: any): Animation
export declare function timeline(): any
export declare function spring(el: Element, opts?: any): any
export declare function sequence(items: any[]): void
export declare function parallel(fns: any[]): Promise<any>
export declare function stagger(els: Element[], fn: (el: Element, opts?: any) => void, delay?: number): void
export declare function wait(ms: number): Promise<void>
export declare function cancelAll(el: Element): void
export declare function trans(duration?: number): { enter: (el: Element) => void; leave: (el: Element, done?: () => void) => void }
export declare const easings: Record<string, any>
export declare const ease: Record<string, any>
export declare const presets: Record<string, (el: Element, opts?: any) => Animation>
export declare function inView(target: any, fn: any, opts?: any): () => void
export declare function onScroll(fn: (y: number, w: Window) => void, opts?: any): () => void
export declare function typewriter(el: Element, opts?: any): void
export declare function countUp(el: Element, opts?: any): void
export declare function splitText(el: Element, mode?: string): NodeList
export declare function drawPath(el: SVGElement, opts?: any): Animation
export declare function followPath(el: Element, path: SVGPathElement, opts?: any): any
export declare function flip(container: Element, mutate: () => void, opts?: any): void
export declare function particles(container: Element, opts?: any): any[]
export declare function inertia(el: Element, opts?: any): () => void
export declare function queue(): any
export declare function prefersReducedMotion(): boolean
export declare function safeAnim(el: Element, keyframes: any, options?: any): Animation
export declare function parallax(el: Element, opts?: any): () => void
export declare function followMouse(el: Element, opts?: any): () => void
