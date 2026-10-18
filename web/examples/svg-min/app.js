(() => {
  // ../../core/src/runtime.js
  function createRuntime() {
    return {
      currentEffect: null,
      effectStack: [],
      currentScope: null,
      scopeStack: [],
      batchDepth: 0,
      pendingEffects: /* @__PURE__ */ new Set(),
      pendingComputeds: /* @__PURE__ */ new Set(),
      pendingEffectQueue: [],
      pendingEffectQueueHead: 0,
      ctxStack: [],
      dev: true,
      hooks: {
        onSignalCreate: null,
        onSignalSet: null,
        onEffectCreate: null,
        onEffectRun: null,
        onScopeCreate: null,
        onScopeDispose: null
      }
    };
  }
  var G = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
  if (!G.__XUNAY_RUNTIME__) G.__XUNAY_RUNTIME__ = createRuntime();
  var runtime = G.__XUNAY_RUNTIME__;
  function createScope(parent) {
    const s = { effects: null, children: /* @__PURE__ */ new Set(), mountFns: null, unmountFns: null, parent: parent || null, disposed: false };
    if (parent) parent.children.add(s);
    if (runtime.hooks.onScopeCreate) runtime.hooks.onScopeCreate(s);
    return s;
  }
  function disposeScope(s) {
    if (!s || s.disposed) return;
    s.disposed = true;
    if (runtime.hooks.onScopeDispose) runtime.hooks.onScopeDispose(s);
    if (s.unmountFns) {
      for (const f of s.unmountFns) try {
        f();
      } catch (e) {
        console.error(e);
      }
      ;
      s.unmountFns = null;
    }
    if (s.effects) {
      for (const e of s.effects) e.dispose();
      s.effects = null;
    }
    for (const c of s.children) disposeScope(c);
    s.children.clear();
    if (s.parent) s.parent.children.delete(s);
  }
  function runInScope(s, fn) {
    runtime.scopeStack.push(runtime.currentScope);
    runtime.currentScope = s;
    try {
      return fn();
    } finally {
      runtime.currentScope = runtime.scopeStack.pop();
    }
  }
  function runMountFns(s) {
    if (s.mountFns) {
      for (const f of s.mountFns) try {
        f();
      } catch (e) {
        console.error(e);
      }
      ;
      s.mountFns = null;
    }
    for (const c of s.children) runMountFns(c);
  }

  // ../../core/src/core.js
  var _currentEffect = null;
  var _activeTrackingVersion = 0;
  var _inPropagate = false;
  function removeLink(link) {
    const sig = link._sig, sub = link._sub;
    if (link._prevSub) link._prevSub._nextSub = link._nextSub;
    else sig._subsHead = link._nextSub;
    if (link._nextSub) link._nextSub._prevSub = link._prevSub;
    else sig._subsTail = link._prevSub;
    if (link._prevSource) link._prevSource._nextSource = link._nextSource;
    else sub._sourcesHead = link._nextSource;
    if (link._nextSource) link._nextSource._prevSource = link._prevSource;
    else sub._sourcesTail = link._prevSource;
    if (sub._lastLink === link) {
      sub._lastLink = null;
      sub._lastLinkSig = null;
    }
    if (sub._sourceMap && sub._sourceMap.get(sig) === link) {
      sub._sourceMap.delete(sig);
    }
  }
  function finishTracking(sub) {
    const v = sub._trackingVersion;
    let link = sub._sourcesHead;
    while (link) {
      const next = link._nextSource;
      if (link._version !== v) removeLink(link);
      link = next;
    }
  }
  function flushPendingEffects() {
    const rt = runtime;
    if (rt.batchDepth > 0 || rt._xunayFlushingEffects) return;
    if (!Number.isInteger(rt.pendingEffectQueueHead)) rt.pendingEffectQueueHead = 0;
    rt._xunayFlushingEffects = true;
    const maxRuns = rt.dev ? 100 : 1e3;
    const runCounts = /* @__PURE__ */ new Map();
    let firstError = null, hasError = false;
    try {
      while (rt.pendingEffects.size > 0) {
        let next = null;
        while (rt.pendingComputeds.size > 0 && !next) {
          const c = rt.pendingComputeds.values().next().value;
          rt.pendingComputeds.delete(c);
          if (rt.pendingEffects.has(c)) next = c;
        }
        while (!next && rt.pendingEffectQueueHead < rt.pendingEffectQueue.length) {
          const c = rt.pendingEffectQueue[rt.pendingEffectQueueHead++];
          if (rt.pendingEffects.has(c)) next = c;
        }
        if (!next) {
          next = rt.pendingEffects.values().next().value;
          if (next && next.__xunayComputedInternal) rt.pendingComputeds.delete(next);
        }
        if (!next) break;
        rt.pendingEffects.delete(next);
        if (next.disposed) continue;
        if (!next.__xunayComputedInternal) {
          const count = (runCounts.get(next) || 0) + 1;
          runCounts.set(next, count);
          if (count > maxRuns) {
            if (!hasError) {
              firstError = new Error("[XuNay] effect \u6B7B\u5FAA\u73AF");
              hasError = true;
            }
            continue;
          }
        }
        try {
          next.run();
        } catch (err2) {
          if (!hasError) {
            firstError = err2;
            hasError = true;
          }
        }
      }
    } finally {
      rt._xunayFlushingEffects = false;
      if (rt.pendingEffectQueueHead >= rt.pendingEffectQueue.length) {
        rt.pendingEffectQueue.length = 0;
        rt.pendingEffectQueueHead = 0;
      } else if (rt.pendingEffectQueueHead > 1024) {
        rt.pendingEffectQueue = rt.pendingEffectQueue.slice(rt.pendingEffectQueueHead);
        rt.pendingEffectQueueHead = 0;
      }
    }
    if (hasError) throw firstError;
  }
  function effect(fn) {
    const e = {
      _sourcesHead: null,
      _sourcesTail: null,
      _lastLink: null,
      _lastLinkSig: null,
      _sourceMap: null,
      _trackingVersion: 0,
      disposed: false,
      skip: false,
      cleanups: null,
      runs: 0,
      totalMs: 0,
      lastMs: 0,
      createdAt: Date.now(),
      _running: false,
      _reentry: 0,
      _simple: false,
      // 首次运行后判定：无 cleanup / 无嵌套
      _lastFlushId: 0,
      _ownerScope: null,
      run: null,
      dispose() {
        if (e.disposed) return;
        e.disposed = true;
        if (e._ownerScope && e._ownerScope.effects) e._ownerScope.effects.delete(e);
        if (e.cleanups) {
          const cs = e.cleanups;
          for (let i = 0; i < cs.length; i++) {
            try {
              cs[i]();
            } catch (err2) {
              console.error(err2);
            }
          }
          e.cleanups = null;
        }
        let l = e._sourcesHead;
        while (l) {
          const n = l._nextSource;
          removeLink(l);
          l = n;
        }
      }
    };
    e.run = function() {
      if (e.disposed) return;
      if (e._running) {
        e._reentry++;
        if (e._reentry > 100) throw new Error("[XuNay] effect \u9012\u5F52\u8D85 100");
      } else e._reentry = 0;
      const _dev = runtime.dev;
      const _wasRunning = e._running;
      e._running = true;
      try {
        if (e.cleanups) {
          const cs = e.cleanups;
          for (let i = 0; i < cs.length; i++) {
            try {
              cs[i]();
            } catch (err2) {
              console.error(err2);
            }
          }
          e.cleanups = null;
        }
        e._trackingVersion++;
        const _prevTV = _activeTrackingVersion;
        _activeTrackingVersion = e._trackingVersion;
        const prev = _currentEffect;
        _currentEffect = e;
        if (_dev) runtime.currentEffect = e;
        try {
          if (_dev && runtime.timing) {
            const t0 = performance.now();
            try {
              fn();
            } finally {
              const dt = performance.now() - t0;
              e.runs++;
              e.lastMs = dt;
              e.totalMs += dt;
              const _hook = runtime.hooks.onEffectRun;
              if (_hook) _hook(e, dt);
            }
          } else fn();
        } finally {
          _currentEffect = prev;
          if (_dev) runtime.currentEffect = prev;
          _activeTrackingVersion = _prevTV;
          finishTracking(e);
        }
      } finally {
        if (!_wasRunning) {
          e._running = false;
          if (!_currentEffect && !_inPropagate && runtime.batchDepth === 0 && runtime.pendingEffects.size > 0) {
            flushPendingEffects();
          }
        }
      }
    };
    e._quickRun = function() {
      if (e._running) {
        e.run();
        return;
      }
      e._running = true;
      const prev = _currentEffect;
      const prevTV = _activeTrackingVersion;
      _currentEffect = e;
      _activeTrackingVersion = ++e._trackingVersion;
      try {
        fn();
      } finally {
        _currentEffect = prev;
        _activeTrackingVersion = prevTV;
        e._running = false;
      }
    };
    e._ultraRun = function() {
      if (e._running) {
        e.run();
        return;
      }
      e._running = true;
      try {
        fn();
      } finally {
        e._running = false;
      }
    };
    const _cHook = runtime.hooks.onEffectCreate;
    if (_cHook) _cHook(e);
    const sc = runtime.currentScope;
    if (sc) {
      if (!sc.effects) sc.effects = /* @__PURE__ */ new Set();
      sc.effects.add(e);
    }
    e._ownerScope = sc;
    e.run();
    if (!e._simple && !runtime.dev && !e.cleanups && e._sourcesHead !== null && e._sourcesHead === e._sourcesTail) {
      e._simple = true;
      e._ultra = true;
    }
    return () => e.dispose();
  }
  function onCleanup(fn) {
    const e = runtime.currentEffect;
    if (!e) return;
    if (!e.cleanups) e.cleanups = [];
    e.cleanups.push(fn);
  }

  // ../../core/src/element.js
  var ELEMENT = Symbol.for("xunay.element");
  var FRAGMENT = Symbol.for("xunay.fragment");
  function createElement(type, props, ...children) {
    return { [ELEMENT]: true, type, props: props || {}, children };
  }
  var N = "div span p a button input form label ul ol li h1 h2 h3 h4 h5 h6 img br hr table thead tbody tr td th pre code blockquote header footer nav main section article select option textarea checkbox switch radio progress slider tabs tab canvas video audio summary details".split(" ");
  var tags = {};
  for (const t of N) tags[t] = (p2, ...c) => createElement(t, p2, ...c);
  var div = tags.div;
  var span = tags.span;
  var p = tags.p;
  var a = tags.a;
  var button = tags.button;
  var input = tags.input;
  var form = tags.form;
  var label = tags.label;
  var ul = tags.ul;
  var ol = tags.ol;
  var li = tags.li;
  var h1 = tags.h1;
  var h2 = tags.h2;
  var h3 = tags.h3;
  var h4 = tags.h4;
  var h5 = tags.h5;
  var h6 = tags.h6;
  var img = tags.img;
  var br = tags.br;
  var hr = tags.hr;
  var table = tags.table;
  var thead = tags.thead;
  var tbody = tags.tbody;
  var tr = tags.tr;
  var td = tags.td;
  var th = tags.th;
  var pre = tags.pre;
  var code = tags.code;
  var blockquote = tags.blockquote;
  var header = tags.header;
  var footer = tags.footer;
  var nav = tags.nav;
  var main = tags.main;
  var section = tags.section;
  var article = tags.article;
  var select = tags.select;
  var option = tags.option;
  var textarea = tags.textarea;
  var checkbox = tags.checkbox;
  var radio = tags.radio;
  var progress = tags.progress;
  var slider = tags.slider;
  var tabs = tags.tabs;
  var tab = tags.tab;
  var canvas2 = tags.canvas;
  var video = tags.video;
  var audio = tags.audio;
  var summary = tags.summary;
  var details = tags.details;

  // ../../core/src/events.js
  var NON_DELEGATED = /* @__PURE__ */ new Set([
    "focus",
    "blur",
    "load",
    "error",
    "mouseenter",
    "mouseleave",
    "pointerenter",
    "pointerleave",
    "focusin",
    "focusout",
    "DOMFocusIn",
    "DOMFocusOut"
  ]);
  var rootStack = [];
  var currentRoot = null;
  function setupDelegate(root) {
    rootStack.push(currentRoot);
    currentRoot = root;
    if (!root.__xunay_boundEvents) root.__xunay_boundEvents = /* @__PURE__ */ new Set();
    if (!root.__xunay_dispatchers) root.__xunay_dispatchers = {};
  }
  function teardownDelegate() {
    currentRoot = rootStack.pop();
  }
  function cleanupDelegate(root) {
    if (root.__xunay_dispatchers) {
      for (const t in root.__xunay_dispatchers) {
        root.removeEventListener(t, root.__xunay_dispatchers[t]);
      }
      root.__xunay_dispatchers = null;
      root.__xunay_boundEvents = null;
    }
  }
  function registerHandler(el2, eventType, raw) {
    if (!el2.__xunay_handlers) el2.__xunay_handlers = {};
    let fn, opts;
    if (typeof raw === "function") {
      fn = raw;
      opts = null;
    } else if (raw && typeof raw === "object" && typeof raw.fn === "function") {
      fn = raw.fn;
      opts = raw;
    } else return;
    const handler = opts ? (e) => {
      if (opts.prevent) e.preventDefault();
      if (opts.stop) e.stopPropagation();
      if (opts.self && e.target !== e.currentTarget) return;
      if (opts.value) {
        const t = e.target;
        fn(t && t.value !== void 0 ? t.value : e);
      } else fn(e);
    } : fn;
    if (NON_DELEGATED.has(eventType)) {
      el2.addEventListener(eventType, handler);
      return;
    }
    const root = currentRoot;
    if (!root) {
      el2.addEventListener(eventType, handler);
      return;
    }
    if (!el2.__xunay_handlers) el2.__xunay_handlers = {};
    if (!el2.__xunay_handlers[eventType]) el2.__xunay_handlers[eventType] = [handler];
    else el2.__xunay_handlers[eventType].push(handler);
    if (!root.__xunay_boundEvents.has(eventType)) {
      root.__xunay_boundEvents.add(eventType);
      const dispatcher = (e) => dispatch(e, root);
      root.__xunay_dispatchers[eventType] = dispatcher;
      root.addEventListener(eventType, dispatcher, false);
    }
  }
  function dispatch(e, root) {
    let node = e.target;
    while (node && node !== root) {
      const hs = node.__xunay_handlers;
      if (hs && hs[e.type]) {
        const arr = hs[e.type];
        for (let i = 0; i < arr.length; i++) {
          arr[i](e);
          if (e.cancelBubble) return;
        }
      }
      if (e.cancelBubble) return;
      node = node.parentNode;
    }
  }

  // ../../core/src/sanitize.js
  var ALLOWED = /* @__PURE__ */ new Set([
    "a",
    "b",
    "i",
    "em",
    "strong",
    "p",
    "br",
    "hr",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "code",
    "pre",
    "blockquote",
    "span",
    "div",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "img",
    "svg",
    "path",
    "circle",
    "rect",
    "line",
    "polyline",
    "polygon",
    "g",
    "defs",
    "use",
    "text",
    "tspan"
  ]);
  var ATTR_OK = /* @__PURE__ */ new Set([
    "href",
    "src",
    "alt",
    "title",
    "class",
    "id",
    "viewBox",
    "viewbox",
    "d",
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "cx",
    "cy",
    "r",
    "x",
    "y",
    "x1",
    "y1",
    "x2",
    "y2",
    "width",
    "height",
    "points",
    "transform",
    "xmlns"
  ]);
  function sanitize(html) {
    if (typeof html !== "string") return "";
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    walk(tpl.content);
    return tpl.innerHTML;
  }
  function walk(node) {
    for (const child of [...node.children]) walk(child);
    for (const el2 of [...node.children]) {
      const tag2 = el2.tagName.toLowerCase();
      if (!ALLOWED.has(tag2)) {
        el2.replaceWith(...el2.childNodes);
        continue;
      }
      for (const a2 of [...el2.attributes]) {
        const n = a2.name.toLowerCase();
        if (n.startsWith("data-") || n.startsWith("aria-")) continue;
        if (!ATTR_OK.has(n)) {
          el2.removeAttribute(a2.name);
          continue;
        }
        if (n === "href" || n === "src") {
          const v = a2.value.trim().toLowerCase().replace(/\s+/g, "");
          if (v.startsWith("javascript:") || v.startsWith("vbscript:") || v.startsWith("data:text/html")) {
            el2.removeAttribute(a2.name);
          }
        }
      }
    }
  }

  // ../../core/src/render.js
  function render(v) {
    if (Array.isArray(v)) {
      const f = document.createDocumentFragment();
      for (const c of v) f.appendChild(render(c));
      return f;
    }
    if (v == null || v === false || v === true) return document.createTextNode("");
    if (typeof v === "string" || typeof v === "number") return document.createTextNode(String(v));
    if (typeof v === "function") return render(v());
    if (typeof Node !== "undefined" && v instanceof Node) return v;
    if (v[FRAGMENT]) {
      const h = document.createElement("span");
      h.style.display = "contents";
      for (const c of v.children) h.appendChild(render(c));
      return h;
    }
    if (v.__xunay_show) return renderShow(v);
    if (v[ELEMENT]) return el(v);
    return document.createTextNode(String(v));
  }
  function renderShow(v) {
    if (typeof window !== "undefined" && !window.__rsLog) {
      window.__rsLog = 1;
      console.log("RENDERSHOW_NEW_LOGIC active");
    }
    const h = document.createElement("span");
    h.style.display = "contents";
    const outer = createScope(runtime.currentScope);
    h.__xunay_scope = outer;
    let cur = null, sc = null;
    let lastCond = void 0;
    runInScope(outer, () => {
      effect(() => {
        const now = v.cond();
        const active = !!now;
        const changed = now !== lastCond;
        lastCond = now;
        if (active && (!cur || changed)) {
          if (sc) {
            disposeScope(sc);
            sc = null;
          }
          if (cur) {
            cur.remove();
            cur = null;
          }
          sc = createScope(outer);
          runInScope(sc, () => {
            cur = render(v.renderFn());
            h.appendChild(cur);
          });
        } else if (!active && cur) {
          if (sc) {
            disposeScope(sc);
            sc = null;
          }
          cur.remove();
          cur = null;
        }
      });
      if (!outer.unmountFns) outer.unmountFns = [];
      outer.unmountFns.push(() => {
        if (sc) {
          disposeScope(sc);
          sc = null;
        }
        if (cur) {
          cur.remove();
          cur = null;
        }
      });
    });
    return h;
  }
  var SVG_NS = "http://www.w3.org/2000/svg";
  var SVG_TAGS = /* @__PURE__ */ new Set([
    "svg",
    "g",
    "rect",
    "circle",
    "ellipse",
    "line",
    "path",
    "polygon",
    "polyline",
    "text",
    "tspan",
    "textPath",
    "defs",
    "use",
    "symbol",
    "clipPath",
    "mask",
    "linearGradient",
    "radialGradient",
    "stop",
    "pattern",
    "marker",
    "filter",
    "foreignObject",
    "image",
    "switch",
    "view",
    "feGaussianBlur",
    "feColorMatrix",
    "feOffset",
    "feComposite",
    "feBlend",
    "feMorphology",
    "feTurbulence",
    "feDisplacementMap"
  ]);
  var SVG_KEEP_CAMEL = /* @__PURE__ */ new Set([
    "viewBox",
    "preserveAspectRatio",
    "gradientUnits",
    "gradientTransform",
    "patternUnits",
    "patternContentUnits",
    "patternTransform",
    "clipPathUnits",
    "maskUnits",
    "maskContentUnits",
    "primitiveUnits",
    "markerWidth",
    "markerHeight",
    "markerUnits",
    "markerStart",
    "markerEnd",
    "markerMid",
    "refX",
    "refY",
    "baseFrequency",
    "numOctaves",
    "kernelMatrix",
    "stdDeviation",
    "tableValues",
    "targetX",
    "targetY",
    "spreadMethod"
  ]);
  function toSvgAttr(name) {
    if (SVG_KEEP_CAMEL.has(name)) return name;
    if (name === "className") return "class";
    if (name === "htmlFor") return "for";
    return name.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  }
  function el(v) {
    const { type, props, children } = v;
    const isSvg = SVG_TAGS.has(type);
    const dom = isSvg ? document.createElementNS(SVG_NS, type) : document.createElement(type);
    const bind = [];
    let scope = null;
    const gs = () => scope || (scope = createScope(runtime.currentScope));
    for (const k in props) {
      const pv = props[k];
      if (k === "on") {
        for (const e in pv) registerHandler(dom, e, pv[e]);
      } else if (k === "ref") {
        if (typeof pv === "function") pv(dom);
      } else if (k === "class" && pv && typeof pv === "object") {
        gs();
        bind.push([2, pv]);
      } else if (k === "style" && typeof pv === "function") {
        gs();
        bind.push([3, pv]);
      } else if (typeof pv === "function") {
        gs();
        bind.push([1, k, pv]);
      } else set(dom, k, pv, isSvg);
    }
    let ci = 0;
    const clen = children.length;
    while (ci < clen) {
      const c = children[ci];
      if (typeof c === "function") {
        const __saved = runtime.currentEffect;
        runtime.currentEffect = null;
        let r, err2 = null;
        try {
          r = c();
        } catch (e) {
          err2 = e;
        } finally {
          runtime.currentEffect = __saved;
        }
        if (err2) {
          gs();
          const t = document.createTextNode("");
          t.textContent = "[XuNay] " + (err2.message || String(err2));
          dom.appendChild(t);
        } else if (r && r.__xunay_list) {
          gs();
          applyList(dom, r);
        } else if (r && r.__xunay_show) {
          gs();
          dom.appendChild(renderShow(r));
        } else if (r && typeof Node !== "undefined" && r instanceof Node) {
          gs();
          dom.appendChild(r);
        } else if (r && (r[ELEMENT] || r[FRAGMENT])) {
          gs();
          dom.appendChild(renderDyn(c));
        } else {
          gs();
          const t = document.createTextNode("");
          dom.appendChild(t);
          bind.push([0, t, c]);
        }
      } else dom.appendChild(render(c));
      ci++;
    }
    if (scope) {
      dom.__xunay_scope = scope;
      const N2 = bind.length;
      if (N2 === 1) {
        const b = bind[0];
        if (b[0] === 0) {
          const t = b[1], fn = b[2];
          let p2;
          runInScope(scope, () => effect(() => {
            const n = fn();
            const s = n == null ? "" : String(n);
            if (s !== p2) {
              t.textContent = s;
              p2 = s;
            }
          }));
        } else if (b[0] === 1) {
          const k = b[1], fn = b[2];
          let p2;
          runInScope(scope, () => effect(() => {
            const n = fn();
            if (n !== p2) {
              set(dom, k, n);
              p2 = n;
            }
          }));
        } else if (b[0] === 2) {
          const val = b[1];
          let p2;
          runInScope(scope, () => effect(() => {
            let c = "";
            for (const x in val) {
              const on = typeof val[x] === "function" ? val[x]() : val[x];
              if (on) c += (c ? " " : "") + x;
            }
            if (c !== p2) {
              dom.className = c;
              p2 = c;
            }
          }));
        } else {
          const fn = b[1];
          runInScope(scope, () => effect(() => {
            const s = fn();
            if (s && typeof s === "object") Object.assign(dom.style, s);
          }));
        }
      } else if (N2 > 1) {
        const prev = [];
        runInScope(scope, () => {
          effect(() => {
            for (let i = 0; i < N2; i++) {
              const b = bind[i], t = b[0];
              if (t === 0) {
                const n = b[2]();
                const s = n == null ? "" : String(n);
                if (s !== prev[i]) {
                  b[1].textContent = s;
                  prev[i] = s;
                }
              } else if (t === 1) {
                const n = b[2]();
                if (n !== prev[i]) {
                  set(dom, b[1], n);
                  prev[i] = n;
                }
              } else if (t === 2) {
                let c = "";
                for (const x in b[1]) {
                  const on = typeof b[1][x] === "function" ? b[1][x]() : b[1][x];
                  if (on) c += (c ? " " : "") + x;
                }
                if (c !== prev[i]) {
                  dom.className = c;
                  prev[i] = c;
                }
              } else if (t === 3) {
                const s = b[1]();
                if (s && typeof s === "object") Object.assign(dom.style, s);
              }
            }
          });
        });
      }
    }
    return dom;
  }
  function set(d, k, v, isSvg) {
    if (v == null || v === false) {
      const key = isSvg ? toSvgAttr(k) : k === "className" ? "class" : k;
      d.removeAttribute(key);
      return;
    }
    if (k === "html") {
      d.innerHTML = sanitize(v);
      return;
    }
    if (k === "style" && typeof v === "object") {
      Object.assign(d.style, v);
      return;
    }
    if (isSvg) {
      if (k === "fill" || k === "stroke" || k === "color") {
        d.style.setProperty(k, String(v));
        return;
      }
      if (k === "fillOpacity" || k === "fill-opacity") {
        d.style.setProperty("fill-opacity", String(v));
        return;
      }
      if (k === "strokeWidth" || k === "stroke-width") {
        d.style.setProperty("stroke-width", String(v));
        return;
      }
      if (k === "strokeDasharray" || k === "stroke-dasharray") {
        d.style.setProperty("stroke-dasharray", String(v));
        return;
      }
      if (k === "strokeDashoffset" || k === "stroke-dashoffset") {
        d.style.setProperty("stroke-dashoffset", String(v));
        return;
      }
      if (k === "strokeLinecap" || k === "stroke-linecap") {
        d.style.setProperty("stroke-linecap", String(v));
        return;
      }
      if (k === "strokeLinejoin" || k === "stroke-linejoin") {
        d.style.setProperty("stroke-linejoin", String(v));
        return;
      }
      if (k === "class" || k === "className") {
        d.setAttribute("class", v);
        return;
      }
      if (k === "textContent" || k === "innerText") {
        d.textContent = v;
        return;
      }
      d.setAttribute(toSvgAttr(k), String(v));
      return;
    }
    if (k === "class" || k === "className") d.className = v;
    else if (k === "value") d.value = v;
    else if (k === "checked" || k === "disabled" || k === "selected") d[k] = !!v;
    else d.setAttribute(k, v);
  }
  function applyList(parent, def) {
    const holder = document.createElement("span");
    holder.style.display = "contents";
    parent.appendChild(holder);
    const map = /* @__PURE__ */ new Map();
    const listScope = createScope(runtime.currentScope);
    holder.__xunay_scope = listScope;
    runInScope(listScope, () => {
      effect(() => {
        const items = def.getArr() || [];
        const N2 = items.length;
        if (N2 === 0) {
          if (map.size) {
            for (const [, e] of map) if (e.dom.__xunay_scope) disposeScope(e.dom.__xunay_scope);
            map.clear();
            holder.textContent = "";
          }
          return;
        }
        const newDoms = new Array(N2);
        const keySet = /* @__PURE__ */ new Set();
        for (let i = 0; i < N2; i++) {
          const item = items[i];
          const key = def.keyFn(item);
          if (runtime.dev && keySet.has(key)) {
            console.warn("[XuNay] list key \u91CD\u590D:", key);
          }
          keySet.add(key);
          let e = map.get(key);
          if (!e) {
            const dom = render(def.renderFn(item));
            e = { dom, item };
            map.set(key, e);
          } else if (e.item !== item) {
            if (!fastUpdate(e.dom, def.renderFn(item))) {
              if (e.dom.__xunay_scope) disposeScope(e.dom.__xunay_scope);
              const nd = render(def.renderFn(item));
              e.dom.replaceWith(nd);
              e.dom = nd;
            }
            e.item = item;
          }
          newDoms[i] = e.dom;
        }
        for (const [k, e] of map) {
          if (!keySet.has(k)) {
            if (e.dom.__xunay_scope) disposeScope(e.dom.__xunay_scope);
            e.dom.remove();
            map.delete(k);
          }
        }
        for (let j = N2 - 1; j >= 0; j--) {
          const cur = holder.childNodes[j];
          if (cur === newDoms[j]) continue;
          const next = j + 1 < N2 ? newDoms[j + 1] : null;
          holder.insertBefore(newDoms[j], next);
        }
      });
    });
    return holder;
  }
  function fastUpdate(dom, vnode) {
    if (vnode == null || vnode === false || vnode === true) return false;
    if (typeof vnode === "string" || typeof vnode === "number") {
      if (dom.nodeType === 3) {
        const s = String(vnode);
        if (dom.textContent !== s) dom.textContent = s;
        return true;
      }
      return false;
    }
    if (typeof vnode === "function") return false;
    if (!vnode[ELEMENT]) return false;
    if (dom.tagName.toLowerCase() !== vnode.type) return false;
    const props = vnode.props || {};
    for (const k in props) {
      if (k === "on" || k === "ref" || typeof props[k] === "function") return false;
    }
    const ch = vnode.children, dc = dom.childNodes;
    if (ch.length !== dc.length) return false;
    for (let i = 0; i < ch.length; i++) {
      if (!fastUpdate(dc[i], ch[i])) return false;
    }
    for (const k in props) {
      if (k === "style" && props[k] && typeof props[k] === "object") {
        dom.removeAttribute("style");
        Object.assign(dom.style, props[k]);
      } else {
        set(dom, k, props[k]);
      }
    }
    return true;
  }
  function renderDyn(fn) {
    const holder = document.createElement("span");
    holder.style.display = "contents";
    const outer = createScope(runtime.currentScope);
    holder.__xunay_scope = outer;
    let sc = null;
    runInScope(outer, () => {
      effect(() => {
        if (sc) disposeScope(sc);
        holder.textContent = "";
        sc = createScope(outer);
        runInScope(sc, () => {
          holder.appendChild(render(fn()));
          runMountFns(sc);
        });
        onCleanup(() => {
          if (sc) {
            disposeScope(sc);
            sc = null;
          }
        });
      });
    });
    return holder;
  }
  function mount(comp, target) {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) throw new Error("XuNay: target not found");
    if (root.__xunay_scope) {
      disposeScope(root.__xunay_scope);
      root.__xunay_scope = null;
    }
    cleanupDelegate(root);
    setupDelegate(root);
    root.innerHTML = "";
    const scope = createScope(null);
    root.__xunay_scope = scope;
    runInScope(scope, () => {
      const vnode = typeof comp === "function" ? comp() : comp;
      root.appendChild(render(vnode));
    });
    runMountFns(scope);
    teardownDelegate();
    return function() {
      disposeScope(scope);
      cleanupDelegate(root);
      root.innerHTML = "";
      root.__xunay_scope = null;
    };
  }

  // ../../compiler3/src/runtime.js
  function renderChild(...args) {
    if (args.length === 0) return document.createTextNode("");
    if (args.length === 1) return render(args[0]);
    const f = document.createDocumentFragment();
    for (const a2 of args) f.appendChild(render(a2));
    return f;
  }
  function applyStyle(el2, style) {
    if (style == null) return;
    if (typeof style === "string") el2.style.cssText = style;
    else if (typeof style === "object") Object.assign(el2.style, style);
  }

  // ../../core/src/rt.js
  function renderChild2(...args) {
    if (args.length === 0) return document.createTextNode("");
    if (args.length === 1) return render(args[0]);
    const f = document.createDocumentFragment();
    for (const a2 of args) f.appendChild(render(a2));
    return f;
  }
  var toString = (v) => v == null ? "" : String(v);
  function bindTextDirect(textNode, sig, toStr) {
    const update = () => {
      textNode.textContent = toStr(sig());
    };
    update();
    const ls = sig._listeners;
    if (!ls) sig._listeners = [update];
    else ls.push(update);
  }
  function bindText(node, fn) {
    let prev = void 0;
    let mode = null;
    let innerScope = null;
    function clearInner() {
      if (innerScope) {
        disposeScope(innerScope);
        innerScope = null;
      }
    }
    effect(() => {
      const v = fn();
      const isText = v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean";
      if (isText) {
        clearInner();
        const s = v == null || v === false || v === true ? "" : String(v);
        if (mode === "text" && s === prev) return;
        node.textContent = s;
        prev = s;
        mode = "text";
        return;
      }
      if (mode === "node" && v === prev) return;
      clearInner();
      node.textContent = "";
      innerScope = createScope(runtime.currentScope);
      let r;
      runInScope(innerScope, () => {
        r = render(v);
      });
      if (r) node.appendChild(r);
      prev = v;
      mode = "node";
      onCleanup(clearInner);
    });
  }
  function bindAttr(el2, name, fn) {
    let prev;
    effect(() => {
      const v = fn();
      if (v === prev) return;
      prev = v;
      if (v == null || v === false) {
        el2.removeAttribute(name);
        return;
      }
      if (name === "class" || name === "className") el2.className = v;
      else if (name === "value") el2.value = v;
      else if (name === "checked" || name === "disabled" || name === "selected") el2[name] = !!v;
      else el2.setAttribute(name, String(v));
    });
  }
  function bindStyle(el2, fn) {
    let prev = {};
    effect(() => {
      const s = fn();
      if (s == null) {
        el2.style.cssText = "";
        prev = {};
        return;
      }
      if (typeof s === "string") {
        el2.style.cssText = s;
        prev = {};
        return;
      }
      if (typeof s !== "object") return;
      for (const k of Object.keys(prev)) if (!(k in s)) el2.style[k] = "";
      for (const k of Object.keys(s)) if (el2.style[k] !== s[k]) el2.style[k] = s[k];
      prev = s;
    });
  }
  function applyProps(el2, props) {
    if (!props) return;
    for (const key of Object.keys(props)) {
      const v = props[key];
      if (key === "on" && v) {
        for (const ev of Object.keys(v)) el2.addEventListener(ev, v[ev]);
      } else if (key === "style" && v) {
        if (typeof v === "string") el2.style.cssText = v;
        else Object.assign(el2.style, v);
      } else if (key === "class" || key === "className") el2.className = v == null ? "" : v;
      else if (key === "ref" && typeof v === "function") v(el2);
      else if (key === "value" || key === "textContent") el2[key] = v == null ? "" : v;
      else if (typeof v === "boolean") {
        el2[key] = v;
        if (!v) el2.removeAttribute(key);
      } else if (v == null) {
      } else el2.setAttribute(key, v);
    }
  }
  function applyStyle2(el2, style) {
    if (style == null) return;
    if (typeof style === "string") el2.style.cssText = style;
    else if (typeof style === "object") Object.assign(el2.style, style);
  }
  function classNames(obj) {
    if (!obj || typeof obj !== "object") return "";
    const out = [];
    for (const k of Object.keys(obj)) if (obj[k]) out.push(k);
    return out.join(" ");
  }
  function createStatic(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    return tpl.content.firstChild;
  }
  function install() {
    if (typeof globalThis === "undefined") return;
    globalThis.__rt__ = {
      bindText,
      bindAttr,
      renderChild: renderChild2,
      bindTextDirect,
      bindStyle,
      applyProps,
      applyStyle: applyStyle2,
      classNames,
      createStatic,
      toString
    };
  }

  // ../../core/src/index.js
  install();

  // ../../core/src/kit-util.js
  function px(p2) {
    return p2 || {};
  }

  // ../../core/src/kit-data.js
  if (typeof document !== "undefined" && !document.getElementById("x-kit-style")) {
    const s = document.createElement("style");
    s.id = "x-kit-style";
    s.textContent = "@keyframes x-spin { to { transform: rotate(360deg) } }";
    document.head.appendChild(s);
  }

  // ../../core/src/hl.js
  var RULES = {
    js: [
      [/\/\/[^\n]*/g, "c"],
      [/\/\*[\s\S]*?\*\//g, "c"],
      [/`(?:[^`\\]|\\.)*`/g, "s"],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "s"],
      [/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|delete|void|yield|in|of|static|get|set)\b/g, "k"],
      [/\b(null|undefined|true|false|NaN|Infinity|this)\b/g, "b"],
      [/\b(console|window|document|Math|JSON|Object|Array|String|Number|Boolean|Promise|Map|Set|Date|RegExp|Error|Symbol|globalThis)\b/g, "b"],
      [/\b([A-Z][a-zA-Z0-9_]*)\b/g, "t"],
      [/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, "n"],
      [/\b(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g, "n"],
      [/[a-zA-Z_$][\w$]*(?=\s*\()/g, "f"],
      [/[+\-*/%=<>!&|^~?:]+/g, "o"],
      [/[{}()\[\];,.]/g, "m"]
    ],
    xuy: [
      [/\/\/[^\n]*/g, "c"],
      [/\/\*[\s\S]*?\*\//g, "c"],
      [/`(?:[^`\\]|\\.)*`/g, "s"],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "s"],
      [/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|delete|void|yield|in|of|static|get|set)\b/g, "k"],
      [/\b(null|undefined|true|false|NaN|Infinity|this)\b/g, "b"],
      [/\b(console|window|document|Math|JSON|Object|Array|String|Number|Boolean|Promise|Map|Set|Date|RegExp|Error|Symbol|globalThis)\b/g, "b"],
      [/\b([A-Z][a-zA-Z0-9_]*)\b/g, "t"],
      [/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, "n"],
      [/\b(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g, "n"],
      [/[a-zA-Z_$][\w$]*(?=\s*\()/g, "f"],
      [/[+\-*/%=<>!&|^~?:]+/g, "o"],
      [/[{}()\[\];,.]/g, "m"],
      [/\b(div|span|p|a|button|input|form|label|ul|ol|li|h1|h2|h3|h4|h5|h6|table|thead|tbody|tr|td|th|img|header|footer|nav|main|section|article|select|option|textarea|pre|code|br|hr)(?=\s*\()/g, "d"]
    ],
    ts: [
      [/\/\/[^\n]*/g, "c"],
      [/\/\*[\s\S]*?\*\//g, "c"],
      [/`(?:[^`\\]|\\.)*`/g, "s"],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "s"],
      [/\b(interface|type|enum|namespace|declare|abstract|implements|public|private|protected|readonly|const|let|var|function|return|if|else|for|while|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|typeof|new|this|as|is|keyof|infer)\b/g, "k"],
      [/\b(string|number|boolean|void|never|unknown|any|null|undefined|true|false)\b/g, "b"],
      [/\b(console|window|document|Math|JSON|Object|Array|Promise|Map|Set|Date)\b/g, "b"],
      [/\b([A-Z][a-zA-Z0-9_]*)\b/g, "t"],
      [/\b\d+(\.\d+)?\b/g, "n"],
      [/[a-zA-Z_$][\w$]*(?=\s*\()/g, "f"],
      [/[+\-*/%=<>!&|^~?:]+/g, "o"],
      [/[{}()\[\];,.]/g, "m"]
    ],
    py: [
      [/#[^\n]*/g, "c"],
      [/'''[\s\S]*?'''|"""[\s\S]*?"""/g, "s"],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "s"],
      [/\b(def|class|return|if|elif|else|for|while|break|continue|import|from|as|try|except|finally|raise|with|lambda|yield|global|nonlocal|pass|async|await|and|or|not|is|in)\b/g, "k"],
      [/\b(None|True|False|self|cls)\b/g, "b"],
      [/\b(print|len|range|str|int|float|list|dict|set|tuple|type|isinstance|super|open)\b/g, "b"],
      [/\b([A-Z][a-zA-Z0-9_]*)\b/g, "t"],
      [/\b\d+(\.\d+)?\b/g, "n"],
      [/[a-zA-Z_][\w]*(?=\s*\()/g, "f"],
      [/@\w+/g, "d"],
      [/[+\-*/%=<>!&|^~]+/g, "o"],
      [/[{}()\[\];,.:]/g, "m"]
    ],
    go: [
      [/\/\/[^\n]*/g, "c"],
      [/\/\*[\s\S]*?\*\//g, "c"],
      [/`[^`]*`/g, "s"],
      [/"(?:[^"\\]|\\.)*"/g, "s"],
      [/\b(package|import|func|return|if|else|for|range|break|continue|switch|case|default|var|const|type|struct|interface|map|chan|go|defer|select|make|new|len|cap|append|copy|delete|panic|recover)\b/g, "k"],
      [/\b(nil|true|false|iota)\b/g, "b"],
      [/\b(string|int|int8|int16|int32|int64|uint|float32|float64|bool|byte|rune|error|any)\b/g, "t"],
      [/\b(fmt|os|io|net|http|time|sync|context|errors|strings|strconv)\b/g, "b"],
      [/\b([A-Z][a-zA-Z0-9_]*)\b/g, "t"],
      [/\b\d+(\.\d+)?\b/g, "n"],
      [/[a-zA-Z_][\w]*(?=\s*\()/g, "f"],
      [/:=|<-|[+\-*/%=<>!&|^~]+/g, "o"],
      [/[{}()\[\];,.]/g, "m"]
    ],
    rust: [
      [/\/\/[^\n]*/g, "c"],
      [/\/\*[\s\S]*?\*\//g, "c"],
      [/"(?:[^"\\]|\\.)*"/g, "s"],
      [/\b(fn|let|mut|const|static|if|else|match|for|while|loop|break|continue|return|struct|enum|impl|trait|pub|use|mod|as|where|move|ref|self|Self|super|crate|async|await|dyn|unsafe)\b/g, "k"],
      [/\b(true|false|None|Some|Ok|Err)\b/g, "b"],
      [/\b(i8|i16|i32|i64|u8|u16|u32|u64|f32|f64|bool|char|str|String|Vec|Option|Result|HashMap|Box)\b/g, "t"],
      [/\b([A-Z][a-zA-Z0-9_]*)\b/g, "t"],
      [/\b\d+(\.\d+)?\b/g, "n"],
      [/[a-z_][\w]*(?=\s*\()/g, "f"],
      [/[a-z_]\w*!/g, "d"],
      [/[+\-*/%=<>!&|^~]+/g, "o"],
      [/[{}()\[\];,.:#]/g, "m"]
    ],
    css: [
      [/\/\*[\s\S]*?\*\//g, "c"],
      [/@[a-z-]+/g, "d"],
      [/\.[a-zA-Z_-][\w-]*/g, "t"],
      [/#[a-zA-Z_-][\w-]*/g, "t"],
      [/[a-zA-Z-]+(?=\s*:)/g, "p"],
      [/:[a-zA-Z-]+/g, "b"],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "s"],
      [/#[0-9a-fA-F]{3,8}\b/g, "n"],
      [/\b\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/g, "n"],
      [/[+\-*/]/g, "o"],
      [/[{}()\[\];,:]/g, "m"]
    ],
    html: [
      [/<!--[\s\S]*?-->/g, "c"],
      [/"[^"]*"|'[^']*'/g, "s"],
      [/<\/?[a-zA-Z][\w-]*/g, "t"],
      [/\/?>/g, "t"],
      [/[a-zA-Z-]+(?==)/g, "p"],
      [/[{}()\[\];,.:]/g, "m"]
    ],
    json: [
      [/"[^"\n]*"(?=\s*:)/g, "p"],
      [/"[^"\n]*"/g, "s"],
      [/\b(true|false|null)\b/g, "b"],
      [/-?\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, "n"],
      [/[{}[\],:]/g, "m"]
    ],
    sql: [
      [/--[^\n]*/g, "c"],
      [/\/\*[\s\S]*?\*\//g, "c"],
      [/'[^'\n]*'/g, "s"],
      [/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|VIEW|DROP|ALTER)\b/gi, "k"],
      [/\b(COUNT|SUM|AVG|MAX|MIN|NOW|COALESCE|CAST)\b/gi, "f"],
      [/\b\d+(\.\d+)?\b/g, "n"],
      [/[+\-*/%=<>]+/g, "o"],
      [/[{}()\[\];,.]/g, "m"]
    ],
    yaml: [
      [/#[^\n]*/g, "c"],
      [/^[\w-]+(?=:)/gm, "p"],
      [/"[^"\n]*"|'[^'\n]*'/g, "s"],
      [/\b(true|false|null|yes|no|on|off)\b/gi, "b"],
      [/\b\d+(\.\d+)?\b/g, "n"],
      [/[{}()\[\];,.:?|-]/g, "m"]
    ],
    bash: [
      [/#[^\n]*/g, "c"],
      [/"(?:[^"\\]|\\.)*"|'[^'\n]*'/g, "s"],
      [/\$\{[^}]+\}|\$\w+/g, "f"],
      [/\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|export|local|source|echo|cd|set|unset|read|test|alias|sudo)\b/g, "k"],
      [/\b(true|false)\b/g, "b"],
      [/\b\d+\b/g, "n"],
      [/[+\-*/%=<>!&|]+/g, "o"],
      [/[{}()\[\];,.]/g, "m"]
    ],
    md: [
      [/^#{1,6} .+$/gm, "k"],
      [/\*\*[^*]+\*\*|__[^_]+__/g, "f"],
      [/\*[^*]+\*|_[^_]+_/g, "t"],
      [/`[^`\n]+`/g, "s"],
      [/^\s*[-*+] /gm, "d"],
      [/^> .+$/gm, "c"],
      [/\[[^\]]+\]\([^)]+\)/g, "f"],
      [/```[\s\S]*?```/g, "c"]
    ]
  };
  var languages = Object.keys(RULES);

  // ../../core/src/kit-editor.js
  if (typeof document !== "undefined" && !document.getElementById("x-code-style")) {
    const THEMES = {
      onedark: { bg: "#282c34", ln: "#21252b", lnfg: "#495162", fg: "#abb2bf", k: "#c678dd", s: "#98c379", c: "#5c6370", n: "#d19a66", f: "#61afef", t: "#e5c07b", m: "#56b6c2", caret: "#528bff", bd: "#3e4451", sel: "rgba(82,139,255,.25)" },
      dracula: { bg: "#282a36", ln: "#21222c", lnfg: "#6272a4", fg: "#f8f8f2", k: "#ff79c6", s: "#f1fa8c", c: "#6272a4", n: "#bd93f9", f: "#50fa7b", t: "#8be9fd", m: "#ffb86c", caret: "#f8f8f0", bd: "#44475a", sel: "rgba(255,121,198,.25)" },
      monokai: { bg: "#272822", ln: "#1e1f1c", lnfg: "#75715e", fg: "#f8f8f2", k: "#f92672", s: "#e6db74", c: "#75715e", n: "#ae81ff", f: "#a6e22e", t: "#66d9ef", m: "#fd971f", caret: "#f8f8f0", bd: "#3e3d32", sel: "rgba(249,38,114,.25)" },
      "github-dark": { bg: "#0d1117", ln: "#161b22", lnfg: "#484f58", fg: "#c9d1d9", k: "#ff7b72", s: "#a5d6ff", c: "#8b949e", n: "#79c0ff", f: "#d2a8ff", t: "#ffa657", m: "#7ee787", caret: "#58a6ff", bd: "#30363d", sel: "rgba(88,166,255,.25)" },
      "github-light": { bg: "var(--x-text-inverse)", ln: "#f6f8fa", lnfg: "#8c959f", fg: "#24292f", k: "#cf222e", s: "#0a3069", c: "#6e7781", n: "#0550ae", f: "#8250df", t: "#953800", m: "#116329", caret: "#0969da", bd: "#d0d7de", sel: "rgba(9,105,218,.15)" },
      nord: { bg: "#2e3440", ln: "#3b4252", lnfg: "#616e88", fg: "#d8dee9", k: "#81a1c1", s: "#a3be8c", c: "#616e88", n: "#b48ead", f: "#88c0d0", t: "#ebcb8b", m: "#8fbcbb", caret: "#88c0d0", bd: "#434c5e", sel: "rgba(136,192,208,.25)" },
      "solarized-dark": { bg: "#002b36", ln: "#073642", lnfg: "#586e75", fg: "#839496", k: "#859900", s: "#2aa198", c: "#586e75", n: "#d33682", f: "#268bd2", t: "#b58900", m: "#cb4b16", caret: "#93a1a1", bd: "#073642", sel: "rgba(38,139,210,.25)" },
      "solarized-light": { bg: "#fdf6e3", ln: "#eee8d5", lnfg: "#93a1a1", fg: "#657b83", k: "#859900", s: "#2aa198", c: "#93a1a1", n: "#d33682", f: "#268bd2", t: "#b58900", m: "#cb4b16", caret: "#586e75", bd: "#eee8d5", sel: "rgba(38,139,210,.15)" },
      "tokyo-night": { bg: "#1a1b26", ln: "#16161e", lnfg: "#3b4261", fg: "#a9b1d6", k: "#bb9af7", s: "#9ece6a", c: "#565f89", n: "#ff9e64", f: "#7aa2f7", t: "#e0af68", m: "#7dcfff", caret: "#c0caf5", bd: "#292e42", sel: "rgba(122,162,247,.25)" },
      catppuccin: { bg: "#1e1e2e", ln: "#181825", lnfg: "#45475a", fg: "#cdd6f4", k: "#cba6f7", s: "#a6e3a1", c: "#6c7086", n: "#fab387", f: "#89b4fa", t: "#f9e2af", m: "#94e2d5", caret: "#f5e0dc", bd: "#313244", sel: "rgba(203,166,247,.25)" }
    };
    let themesCSS = "";
    for (const name in THEMES) {
      const t = THEMES[name];
      themesCSS += '.x-code[data-theme="' + name + '"]{--bg:' + t.bg + ";--ln:" + t.ln + ";--lnfg:" + t.lnfg + ";--fg:" + t.fg + ";--k:" + t.k + ";--s:" + t.s + ";--c:" + t.c + ";--n:" + t.n + ";--f:" + t.f + ";--t:" + t.t + ";--m:" + t.m + ";--caret:" + t.caret + ";--bd:" + t.bd + ";--sel:" + t.sel + "}\n";
    }
    const s = document.createElement("style");
    s.id = "x-code-style";
    s.textContent = `
.x-code{
  --bg:#282c34;--ln:#21252b;--lnfg:#495162;--fg:#abb2bf;
  --k:#c678dd;--s:#98c379;--c:#5c6370;--n:#d19a66;
  --f:#61afef;--t:#e5c07b;--m:#56b6c2;--caret:#528bff;
  --bd:#3e4451;--sel:rgba(82,139,255,.25);
  display:flex;border:1px solid var(--bd);border-radius:12px;overflow:hidden;
  font-family:"JetBrains Mono","Fira Code",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:13.5px;background:var(--bg);color:var(--fg);
  box-shadow:0 8px 32px rgba(0,0,0,.25);line-height:1.65;
  transition:background .2s,border-color .2s;
}
.x-code-wrap{position:relative;flex:1;min-width:0}
.x-code-pre{
  position:absolute;inset:0;margin:0;padding:14px 16px;
  overflow:auto;pointer-events:none;background:transparent;
  line-height:1.65;white-space:pre;counter-reset:xln;
  font-family:inherit;font-size:inherit;color:var(--fg);
  transition:color .2s;
}
.x-code-pre code{
  display:block;background:transparent!important;border:none!important;padding:0!important;
  font-family:inherit;font-size:inherit;color:inherit;
}
.x-line{
  display:block;
  min-height:1.65em;
  counter-increment:xln;
  padding-left:56px;
  position:relative;
  white-space:pre;
}
.x-line::before{
  content:counter(xln);
  position:absolute;
  left:0;
  width:40px;
  text-align:right;
  color:var(--lnfg);
  user-select:none;
  font-size:12.5px;
  padding-right:14px;
  border-right:1px solid var(--bd);
  margin-right:12px;
  height:100%;
  top:0;
}
.x-code-ta{
  position:absolute;inset:0;margin:0;padding:14px 16px;
  padding-left:72px;
  background:transparent;color:transparent;
  caret-color:var(--caret);
  border:none;outline:none;resize:none;
  font-family:inherit;font-size:inherit;line-height:1.65;
  white-space:pre;overflow:auto;tab-size:2;
}
.x-code-ta::selection{background:var(--sel)}
.h-k{color:var(--k);transition:color .2s}
.h-s{color:var(--s);transition:color .2s}
.h-c{color:var(--c);font-style:italic;transition:color .2s}
.h-n{color:var(--n);transition:color .2s}
.h-f{color:var(--f);transition:color .2s}
.h-t{color:var(--t);transition:color .2s}
.h-m{color:var(--m);transition:color .2s}
` + themesCSS;
    document.head.appendChild(s);
  }

  // ../../core/src/kit-overlay.js
  if (typeof document !== "undefined" && !document.getElementById("__xunay-anim")) {
    const s = document.createElement("style");
    s.id = "__xunay-anim";
    s.textContent = "@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(s);
  }

  // ../../core/src/kit-svg.js
  var S = (tag2, props, ...children) => createElement(tag2, props, ...children);
  var Svg = (props, ...c) => S("svg", px(props), ...c);
  var Rect = (props) => S("rect", px(props));
  var Circle = (props) => S("circle", px(props));
  var SvgText = (props, ...c) => S("text", px(props), ...c);

  // ../../core/src/kit-icon.js
  var S2 = (tag2, props, ...children) => createElement(tag2, props, ...children);
  var ICO = {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 1.8,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };
  function makeIcon(paths, opts = {}) {
    return function Icon(props) {
      const { size = 20, color, stroke = 1.8, style, class: cls, ...rest } = px(props);
      return S2("svg", {
        viewBox: "0 0 24 24",
        width: size,
        height: size,
        style: "display:inline-block;vertical-align:middle;flex-shrink:0;" + (color ? "color:" + color + ";" : "") + (style || ""),
        class: cls,
        ...rest
      }, ...paths.map(
        (d, i) => S2("path", { key: i, d, ...ICO, "stroke-width": stroke, ...opts.attrs || {} })
      ));
    };
  }
  var IconArrowRight = makeIcon(["M5 12h14", "M13 6l6 6-6 6"]);
  var IconArrowLeft = makeIcon(["M19 12H5", "M11 6l-6 6 6 6"]);
  var IconArrowUp = makeIcon(["M12 19V5", "M6 11l6-6 6 6"]);
  var IconArrowDown = makeIcon(["M12 5v14", "M6 13l6 6 6-6"]);
  var IconChevronRight = makeIcon(["M9 18l6-6-6-6"]);
  var IconChevronLeft = makeIcon(["M15 18l-6-6 6-6"]);
  var IconChevronDown = makeIcon(["M6 9l6 6 6-6"]);
  var IconChevronUp = makeIcon(["M18 15l-6-6-6 6"]);
  var IconExternalLink = makeIcon(["M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6", "M15 3h6v6", "M10 14L21 3"]);
  var IconCheck = makeIcon(["M5 12l4 4 10-10"]);
  var IconClose = makeIcon(["M6 6l12 12", "M18 6L6 18"]);
  var IconPlus = makeIcon(["M12 5v14", "M5 12h14"]);
  var IconMinus = makeIcon(["M5 12h14"]);
  var IconSearch = makeIcon(["M11 19a8 8 0 110-16 8 8 0 010 16z", "M21 21l-4.35-4.35"]);
  var IconMenu = makeIcon(["M4 6h16", "M4 12h16", "M4 18h16"]);
  var IconMoreH = makeIcon(["M5 12h.01", "M12 12h.01", "M19 12h.01"]);
  var IconMoreV = makeIcon(["M12 5h.01", "M12 12h.01", "M12 19h.01"]);
  var IconRefresh = makeIcon(["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0114.85-3.36L23 10", "M1 14l4.64 4.36A9 9 0 0020.49 15"]);
  var IconEdit = makeIcon(["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", "M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"]);
  var IconCopy = makeIcon(["M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2z", "M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"]);
  var IconTrash = makeIcon(["M3 6h18", "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6", "M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"]);
  var IconSave = makeIcon(["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z", "M17 21v-8H7v8", "M7 3v5h8"]);
  var IconDownload = makeIcon(["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]);
  var IconUpload = makeIcon(["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"]);
  var IconShare = makeIcon(["M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8", "M16 6l-4-4-4 4", "M12 2v13"]);
  var IconBookmark = makeIcon(["M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"]);
  var IconZoomIn = makeIcon(["M11 19a8 8 0 110-16 8 8 0 010 16z", "M21 21l-4.35-4.35", "M11 8v6", "M8 11h6"]);
  var IconZoomOut = makeIcon(["M11 19a8 8 0 110-16 8 8 0 010 16z", "M21 21l-4.35-4.35", "M8 11h6"]);
  var IconMaximize = makeIcon(["M15 3h6v6", "M9 21H3v-6", "M21 3l-7 7", "M3 21l7-7"]);
  var IconMinimize = makeIcon(["M4 14h6v6", "M20 10h-6V4", "M14 10l7-7", "M3 21l7-7"]);
  var IconGrid = makeIcon(["M3 3h7v7H3z", "M14 3h7v7h-7z", "M14 14h7v7h-7z", "M3 14h7v7H3z"]);
  var IconList = makeIcon(["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"]);
  var IconFilter = makeIcon(["M22 3H2l8 9.46V19l4 2v-8.54L22 3z"]);
  var IconSort = makeIcon(["M3 6h18", "M7 12h10", "M11 18h2"]);
  var IconEye = makeIcon(["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 15a3 3 0 100-6 3 3 0 000 6z"]);
  var IconEyeOff = makeIcon(["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94", "M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19", "M1 1l22 22"]);
  var IconUser = makeIcon(["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"]);
  var IconUsers = makeIcon(["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 11a4 4 0 100-8 4 4 0 000 8z", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"]);
  var IconHeart = makeIcon(["M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"]);
  var IconStar = makeIcon(["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"]);
  var IconMessage = makeIcon(["M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"]);
  var IconBell = makeIcon(["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 01-3.46 0"]);
  var IconMail = makeIcon(["M4 4h16v16H4z", "M22 6l-10 7L2 6"]);
  var IconPhone = makeIcon(["M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"]);
  var IconFile = makeIcon(["M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z", "M13 2v7h7"]);
  var IconFolder = makeIcon(["M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"]);
  var IconImage = makeIcon(["M3 3h18v18H3z", "M8.5 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z", "M21 15l-5-5L5 21"]);
  var IconCalendar = makeIcon(["M5 4h14v18H5z", "M16 2v4", "M8 2v4", "M3 10h18"]);
  var IconClock = makeIcon(["M12 22a10 10 0 100-20 10 10 0 000 20z", "M12 6v6l4 2"]);
  var IconTag = makeIcon(["M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z", "M7 7h.01"]);
  var IconFlag = makeIcon(["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", "M4 22v-7"]);
  var IconCloud = makeIcon(["M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"]);
  var IconDatabase = makeIcon(["M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3z", "M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5", "M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"]);
  var IconMap = makeIcon(["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z", "M8 2v16", "M16 6v16"]);
  var IconNavigation = makeIcon(["M3 11l19-9-9 19-2-8-8-2z"]);
  var IconCompass = makeIcon(["M12 22a10 10 0 100-20 10 10 0 000 20z", "M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"]);
  var IconPin = makeIcon(["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z", "M12 13a3 3 0 100-6 3 3 0 000 6z"]);
  var IconPlay = makeIcon(["M5 3l14 9-14 9V3z"]);
  var IconPause = makeIcon(["M6 4h4v16H6z", "M14 4h4v16h-4z"]);
  var IconCamera = makeIcon(["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z", "M12 17a4 4 0 100-8 4 4 0 000 8z"]);
  var IconMic = makeIcon(["M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z", "M19 10v2a7 7 0 01-14 0v-2", "M12 19v4", "M8 23h8"]);
  var IconVolume = makeIcon(["M11 5L6 9H2v6h4l5 4V5z", "M19.07 4.93a10 10 0 010 14.14", "M15.54 8.46a5 5 0 010 7.07"]);
  var IconVolumeOff = makeIcon(["M11 5L6 9H2v6h4l5 4V5z", "M23 9l-6 6", "M17 9l6 6"]);
  var IconInfo = makeIcon(["M12 22a10 10 0 100-20 10 10 0 000 20z", "M12 16v-4", "M12 8h.01"]);
  var IconWarn = makeIcon(["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"]);
  var IconCheckCircle = makeIcon(["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"]);
  var IconXCircle = makeIcon(["M12 22a10 10 0 100-20 10 10 0 000 20z", "M15 9l-6 6", "M9 9l6 6"]);
  var IconLock = makeIcon(["M5 11h14v10H5z", "M8 11V7a4 4 0 018 0v4"]);
  var IconUnlock = makeIcon(["M5 11h14v10H5z", "M8 11V7a4 4 0 015.6-3.6"]);
  var IconShield = makeIcon(["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]);
  var IconSun = makeIcon(["M12 17a5 5 0 100-10 5 5 0 000 10z", "M12 1v2", "M12 21v2", "M4.22 4.22l1.42 1.42", "M18.36 18.36l1.42 1.42", "M1 12h2", "M21 12h2", "M4.22 19.78l1.42-1.42", "M18.36 5.64l1.42-1.42"]);
  var IconMoon = makeIcon(["M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"]);
  var IconLink = makeIcon(["M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"]);
  var IconHome = makeIcon(["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z", "M9 22V12h6v10"]);
  var IconSettings = makeIcon(["M12 15a3 3 0 100-6 3 3 0 000 6z", "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"]);
  var IconLayout = makeIcon(["M3 3h18v18H3z", "M3 9h18", "M9 21V9"]);
  var IconSidebar = makeIcon(["M3 3h18v18H3z", "M9 3v18"]);
  var IconColumns = makeIcon(["M3 3h7v18H3z", "M14 3h7v18h-7z"]);
  var IconRows = makeIcon(["M3 3h18v7H3z", "M3 14h18v7H3z"]);

  // .xuyc-entry.js
  mount(() => (() => {
    const _div0 = document.createElement("div");
    applyStyle(_div0, "padding:24px;background:#111;color:#0f0;font:14px monospace");
    const _div1 = document.createElement("div");
    _div1.appendChild(document.createTextNode("=== SVG \u6700\u5C0F\u6D4B\u8BD5 ==="));
    _div0.appendChild(_div1);
    const _div2 = document.createElement("div");
    _div2.appendChild(document.createTextNode("1: \u84DD\u65B9\u5757 (\u671F\u671B\u770B\u5230)"));
    _div0.appendChild(_div2);
    const _t3 = renderChild(Svg(
      { width: 200, height: 100, viewBox: "0 0 200 100" },
      Rect({ x: 20, y: 20, width: 80, height: 60, fill: "#3b82f6" }),
      Rect({ x: 110, y: 20, width: 80, height: 60, fill: "#22c55e" }),
      Circle({ cx: 50, cy: 90, r: 8, fill: "#ec4899" })
    ));
    if (_t3) _div0.appendChild(_t3);
    const _div4 = document.createElement("div");
    _div4.appendChild(document.createTextNode("2: \u6587\u5B57\u5728 SVG \u91CC"));
    _div0.appendChild(_div4);
    const _t5 = renderChild(Svg(
      { width: 200, height: 60, viewBox: "0 0 200 60" },
      SvgText({ x: 20, y: 40, "font-size": 20, fill: "#f59e0b" }, "SVG TEXT \u4E2D\u6587")
    ));
    if (_t5) _div0.appendChild(_t5);
    const _div6 = document.createElement("div");
    _div6.appendChild(document.createTextNode("=== \u6D4B\u8BD5\u7ED3\u675F ==="));
    _div0.appendChild(_div6);
    return _div0;
  })(), "#app");
})();
