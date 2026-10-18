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
  var _warnedSelfWrite = /* @__PURE__ */ new WeakSet();
  var _currentEffect = null;
  var _probing = null;
  var _activeTrackingVersion = 0;
  var _flushId = 0;
  var _inPropagate = false;
  function addSubscription(sig, sub) {
    const last = sub._lastLink;
    if (last && last._sig === sig) {
      last._version = sub._trackingVersion;
      sub._lastLinkSig = sig;
      return;
    }
    let link;
    const index = sub._sourceMap;
    if (index) {
      link = index.get(sig);
      if (link) {
        link._version = sub._trackingVersion;
        sub._lastLink = link;
        sub._lastLinkSig = sig;
        return;
      }
    } else {
      link = sub._sourcesHead;
      while (link) {
        if (link._sig === sig) {
          link._version = sub._trackingVersion;
          sub._lastLink = link;
          sub._lastLinkSig = sig;
          return;
        }
        link = link._nextSource;
      }
    }
    sub._simple = false;
    link = {
      _sig: sig,
      _sub: sub,
      _version: sub._trackingVersion,
      _nextSub: null,
      _prevSub: null,
      _nextSource: null,
      _prevSource: null
    };
    if (sig._subsTail) {
      sig._subsTail._nextSub = link;
      link._prevSub = sig._subsTail;
    } else sig._subsHead = link;
    sig._subsTail = link;
    if (sub._sourcesTail) {
      sub._sourcesTail._nextSource = link;
      link._prevSource = sub._sourcesTail;
    } else sub._sourcesHead = link;
    sub._sourcesTail = link;
    sub._lastLink = link;
    if (index) {
      index.set(sig, link);
    } else {
      let count = 0;
      for (let cur = sub._sourcesHead; cur; cur = cur._nextSource) {
        if (++count >= 16) {
          const map = /* @__PURE__ */ new Map();
          for (cur = sub._sourcesHead; cur; cur = cur._nextSource) {
            map.set(cur._sig, cur);
          }
          sub._sourceMap = map;
          break;
        }
      }
    }
  }
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
  function enqueuePendingEffect(rt, sub) {
    if (!sub || sub.disposed || rt.pendingEffects.has(sub)) return;
    rt.pendingEffects.add(sub);
    if (sub.__xunayComputedInternal) rt.pendingComputeds.add(sub);
    else rt.pendingEffectQueue.push(sub);
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
  function propagate(sig) {
    if (runtime.batchDepth > 0) {
      let link = sig._subsHead;
      while (link) {
        enqueuePendingEffect(runtime, link._sub);
        link = link._nextSub;
      }
      return;
    }
    const head = sig._subsHead;
    if (head !== null && head._nextSub === null && !_inPropagate) {
      const only = head._sub;
      if (only !== null && !only.disposed && !only.__xunayComputedInternal) {
        if (only._running) {
          enqueuePendingEffect(runtime, only);
        } else if (only._ultra) {
          only._ultraRun();
        } else if (only._simple) {
          only._quickRun();
        } else {
          _inPropagate = true;
          try {
            only.run();
          } finally {
            _inPropagate = false;
          }
        }
        if (!_currentEffect && runtime.batchDepth === 0 && runtime.pendingEffects.size > 0) {
          flushPendingEffects();
        }
        return;
      }
    }
    const isOuter = !_inPropagate;
    if (isOuter) {
      _flushId++;
      _inPropagate = true;
    }
    const myFlush = _flushId;
    let firstError = null;
    try {
      let link = sig._subsHead;
      while (link) {
        const sub = link._sub;
        const next = link._nextSub;
        if (!sub.disposed) {
          try {
            if (sub.__xunayComputedInternal) {
              if (!sub._dirty) {
                sub._dirty = true;
                propagate(sub);
              }
            } else if (sub._lastFlushId !== myFlush) {
              sub._lastFlushId = myFlush;
              enqueuePendingEffect(runtime, sub);
            }
          } catch (err2) {
            if (firstError === null) firstError = err2;
          }
        }
        link = next;
      }
    } finally {
      if (isOuter) _inPropagate = false;
    }
    if (isOuter && !_currentEffect && runtime.pendingEffects.size > 0) {
      flushPendingEffects();
    }
    if (firstError !== null) throw firstError;
  }
  function signal(init, opts) {
    const eq = opts && typeof opts.equals === "function" ? opts.equals : Object.is;
    let v = init;
    let writeCount = 0;
    function s(x) {
      if (x === void 0) {
        const e = _currentEffect;
        if (e !== null) {
          if (e._lastLinkSig === s) {
            e._lastLink._version = _activeTrackingVersion;
          } else {
            addSubscription(s, e);
          }
        } else if (_probing !== null) {
          _probing.push(s);
        }
        return v;
      }
      const n = typeof x === "function" ? x(v) : x;
      if (eq(n, v)) return v;
      const old = v;
      v = n;
      writeCount++;
      const _h = runtime.hooks;
      const _setHook = _h.onSignalSet;
      if (_setHook) _setHook(s, old, n, writeCount);
      if (runtime.dev && _currentEffect !== null) {
        let l = s._subsHead;
        while (l) {
          if (l._sub === _currentEffect) {
            if (!_warnedSelfWrite.has(s)) {
              _warnedSelfWrite.add(s);
              console.warn("[XuNay] signal \u5728\u8BA2\u9605\u5B83\u7684 effect \u91CC\u88AB\u5199\u5165");
            }
            break;
          }
          l = l._nextSub;
        }
      }
      if (s._subsHead) propagate(s);
      const ls = s._listeners;
      if (ls !== null) {
        for (let i = 0; i < ls.length; i++) ls[i]();
      }
      return v;
    }
    s._subsHead = null;
    s._subsTail = null;
    s._listeners = null;
    s.__xunay_signal = true;
    s.subsCount = () => {
      let n = 0, l = s._subsHead;
      while (l) {
        n++;
        l = l._nextSub;
      }
      return n;
    };
    s.writeCount = () => writeCount;
    if (runtime.hooks.onSignalCreate) runtime.hooks.onSignalCreate(s);
    return s;
  }
  function computed(fn) {
    let value;
    let evaluated = false;
    const internal = {
      _sourcesHead: null,
      _sourcesTail: null,
      _lastLink: null,
      _lastLinkSig: null,
      _sourceMap: null,
      _trackingVersion: 0,
      _dirty: true,
      disposed: false,
      skip: false,
      __xunayComputedInternal: true,
      _subsHead: null,
      _subsTail: null,
      run() {
        if (this.disposed || this._dirty) return;
        this._dirty = true;
        if (this._subsHead) propagate(this);
      },
      dispose() {
        if (this.disposed) return;
        this.disposed = true;
        let l = this._sourcesHead;
        while (l) {
          const n = l._nextSource;
          removeLink(l);
          l = n;
        }
        l = this._subsHead;
        while (l) {
          const n = l._nextSub;
          removeLink(l);
          l = n;
        }
      }
    };
    const evaluate = () => {
      const prev = _currentEffect;
      internal._trackingVersion++;
      const _prevTV2 = _activeTrackingVersion;
      _activeTrackingVersion = internal._trackingVersion;
      _currentEffect = internal;
      runtime.currentEffect = internal;
      try {
        value = fn();
        internal._dirty = false;
      } finally {
        _currentEffect = prev;
        runtime.currentEffect = prev;
        _activeTrackingVersion = _prevTV2;
        finishTracking(internal);
      }
    };
    const c = () => {
      const e = _currentEffect;
      if (e !== null) addSubscription(internal, e);
      if (!evaluated) {
        evaluated = true;
        evaluate();
      } else if (internal._dirty) evaluate();
      return value;
    };
    c.__xunay_computed = true;
    c.dispose = () => internal.dispose();
    return c;
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
  function createFragment(children) {
    return { [FRAGMENT]: true, children };
  }
  var N = "div span p a button input form label ul ol li h1 h2 h3 h4 h5 h6 img br hr table thead tbody tr td th pre code blockquote header footer nav main section article select option textarea checkbox switch radio progress slider tabs tab canvas video audio summary details".split(" ");
  var tags = {};
  for (const t of N) tags[t] = (p2, ...c) => createElement(t, p2, ...c);
  var div2 = tags.div;
  var span2 = tags.span;
  var p = tags.p;
  var a = tags.a;
  var button2 = tags.button;
  var input2 = tags.input;
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
  function el(v) {
    const { type, props, children } = v;
    const dom = document.createElement(type);
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
      } else set(dom, k, pv);
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
  function set(d, k, v) {
    if (v == null || v === false) {
      d.removeAttribute(k === "className" ? "class" : k);
      return;
    }
    if (k === "html") {
      d.innerHTML = sanitize(v);
      return;
    }
    if (k === "class" || k === "className") d.className = v;
    else if (k === "value") d.value = v;
    else if (k === "style" && typeof v === "object") Object.assign(d.style, v);
    else if (k === "checked" || k === "disabled" || k === "selected") d[k] = !!v;
    else d.setAttribute(k, v);
  }
  function list(arr, keyFn, renderFn) {
    const getArr = typeof arr === "function" ? arr : () => arr;
    return () => ({ __xunay_list: true, getArr, keyFn, renderFn });
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
  var toString2 = (v) => v == null ? "" : String(v);
  function bindTextDirect2(textNode, sig, toStr) {
    const update = () => {
      textNode.textContent = toStr(sig());
    };
    update();
    const ls = sig._listeners;
    if (!ls) sig._listeners = [update];
    else ls.push(update);
  }
  function bindText2(node, fn) {
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
  function bindAttr2(el2, name, fn) {
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
  function bindStyle2(el2, fn) {
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
      bindText: bindText2,
      bindAttr: bindAttr2,
      renderChild: renderChild2,
      bindTextDirect: bindTextDirect2,
      bindStyle: bindStyle2,
      applyProps,
      applyStyle: applyStyle2,
      classNames,
      createStatic,
      toString: toString2
    };
  }

  // ../../core/src/misc.js
  function frag(...children) {
    return createFragment(children);
  }
  function onMount(fn) {
    const sc = runtime.currentScope;
    if (!sc) return;
    if (!sc.mountFns) sc.mountFns = [];
    sc.mountFns.push(fn);
  }

  // ../../core/src/index.js
  install();

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
  function highlight(code2, lang2) {
    const rules = RULES[lang2] || RULES.js;
    const marks = [];
    let out = code2;
    for (const [re, cls] of rules) {
      out = out.replace(re, (m) => {
        if (m.indexOf("\uE000") >= 0) return m;
        const idx = marks.length;
        marks.push({ cls, text: m });
        return "\uE000" + String.fromCharCode(57344 + idx) + "\uE001";
      });
    }
    out = out.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    out = out.replace(/\uE000([\uE000-\uF8FF])\uE001/g, (_, ch) => {
      const m = marks[ch.charCodeAt(0) - 57344];
      if (!m) return "";
      const text2 = m.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return '<span class="h-' + m.cls + '">' + text2 + "</span>";
    });
    return out;
  }
  var languages = Object.keys(RULES);

  // .xuyc-entry.js
  var INIT = `// XuNay Code Editor
// Ctrl+F \u641C\u7D22  Ctrl+H \u66FF\u6362  Ctrl+Z \u64A4\u9500  Ctrl+/ \u6CE8\u91CA
// Ctrl+D \u9009\u76F8\u540C\u8BCD  Alt+\u2191/\u2193 \u79FB\u52A8\u884C  Tab \u7F29\u8FDB
// \u70B9 \u25BE \u6298\u53E0\u5F53\u524D\u5757

import { signal, computed, mount } from "/root/xunay/core/src/site-entry.js"

function App() {
  const n = signal(0)
  const double = computed(() => n() * 2)
  return div({ class: 'app' },
    h1(null, '\u8BA1\u6570\u5668'),
    button({ on: { click: () => n(v => v - 1) } }, '-'),
    span(null, () => 'n = ' + n()),
    button({ on: { click: () => n(v => v + 1) } }, '+'),
    p(null, () => '\u53CC\u500D: ' + double())
  )
}

mount(() => App(), '#app')
`;
  var THEMES = {
    onedark: {
      bg: "#282c34",
      gutter: "#21252b",
      bd: "#181a1f",
      fg: "#abb2bf",
      dim: "#5c6370",
      k: "#c678dd",
      s: "#98c379",
      c: "#5c6370",
      n: "#d19a66",
      f: "#61afef",
      t: "#e5c07b",
      m: "#56b6c2",
      o: "#56b6c2",
      b: "#d19a66",
      d: "#56b6c2",
      p: "#abb2bf",
      cur: "#2c313a",
      acc: "#61afef",
      sel: "rgba(97,175,239,.28)",
      hit: "rgba(229,192,123,.25)",
      hitOn: "rgba(229,192,123,.55)",
      guide: "#3b4048",
      map: "#21252b"
    },
    dracula: {
      bg: "#282a36",
      gutter: "#21222c",
      bd: "#191a21",
      fg: "#f8f8f2",
      dim: "#6272a4",
      k: "#ff79c6",
      s: "#f1fa8c",
      c: "#6272a4",
      n: "#bd93f9",
      f: "#50fa7b",
      t: "#8be9fd",
      m: "#ffb86c",
      o: "#ff79c6",
      b: "#bd93f9",
      d: "#8be9fd",
      p: "#f8f8f2",
      cur: "#44475a",
      acc: "#bd93f9",
      sel: "rgba(189,147,249,.28)",
      hit: "rgba(241,250,140,.2)",
      hitOn: "rgba(241,250,140,.5)",
      guide: "#383a4a",
      map: "#21222c"
    },
    tokyo: {
      bg: "#1a1b26",
      gutter: "#16161e",
      bd: "#101014",
      fg: "#a9b1d6",
      dim: "#565f89",
      k: "#bb9af7",
      s: "#9ece6a",
      c: "#565f89",
      n: "#ff9e64",
      f: "#7aa2f7",
      t: "#e0af68",
      m: "#7dcfff",
      o: "#89ddff",
      b: "#ff9e64",
      d: "#7dcfff",
      p: "#a9b1d6",
      cur: "#24283b",
      acc: "#7aa2f7",
      sel: "rgba(122,162,247,.28)",
      hit: "rgba(224,175,104,.2)",
      hitOn: "rgba(224,175,104,.5)",
      guide: "#2a2e42",
      map: "#16161e"
    },
    github: {
      bg: "#0d1117",
      gutter: "#010409",
      bd: "#21262d",
      fg: "#c9d1d9",
      dim: "#8b949e",
      k: "#ff7b72",
      s: "#a5d6ff",
      c: "#8b949e",
      n: "#79c0ff",
      f: "#d2a8ff",
      t: "#ffa657",
      m: "#7ee787",
      o: "#ff7b72",
      b: "#79c0ff",
      d: "#7ee787",
      p: "#c9d1d9",
      cur: "#161b22",
      acc: "#58a6ff",
      sel: "rgba(88,166,255,.28)",
      hit: "rgba(210,168,255,.2)",
      hitOn: "rgba(210,168,255,.5)",
      guide: "#21262d",
      map: "#010409"
    },
    monokai: {
      bg: "#272822",
      gutter: "#1e1f1c",
      bd: "#151513",
      fg: "#f8f8f2",
      dim: "#75715e",
      k: "#f92672",
      s: "#e6db74",
      c: "#75715e",
      n: "#ae81ff",
      f: "#a6e22e",
      t: "#66d9ef",
      m: "#fd971f",
      o: "#f92672",
      b: "#ae81ff",
      d: "#66d9ef",
      p: "#f8f8f2",
      cur: "#3e3d32",
      acc: "#a6e22e",
      sel: "rgba(166,226,46,.25)",
      hit: "rgba(230,219,116,.2)",
      hitOn: "rgba(230,219,116,.5)",
      guide: "#3e3d32",
      map: "#1e1f1c"
    },
    nord: {
      bg: "#2e3440",
      gutter: "#292e39",
      bd: "#1e222a",
      fg: "#d8dee9",
      dim: "#616e88",
      k: "#81a1c1",
      s: "#a3be8c",
      c: "#616e88",
      n: "#b48ead",
      f: "#88c0d0",
      t: "#ebcb8b",
      m: "#8fbcbb",
      o: "#81a1c1",
      b: "#b48ead",
      d: "#8fbcbb",
      p: "#d8dee9",
      cur: "#3b4252",
      acc: "#88c0d0",
      sel: "rgba(136,192,208,.25)",
      hit: "rgba(235,203,139,.2)",
      hitOn: "rgba(235,203,139,.5)",
      guide: "#3b4252",
      map: "#292e39"
    },
    catppuccin: {
      bg: "#1e1e2e",
      gutter: "#181825",
      bd: "#11111b",
      fg: "#cdd6f4",
      dim: "#6c7086",
      k: "#cba6f7",
      s: "#a6e3a1",
      c: "#6c7086",
      n: "#fab387",
      f: "#89b4fa",
      t: "#f9e2af",
      m: "#94e2d5",
      o: "#cba6f7",
      b: "#fab387",
      d: "#94e2d5",
      p: "#cdd6f4",
      cur: "#313244",
      acc: "#89b4fa",
      sel: "rgba(137,180,250,.25)",
      hit: "rgba(249,226,175,.2)",
      hitOn: "rgba(249,226,175,.5)",
      guide: "#313244",
      map: "#181825"
    },
    solarized: {
      bg: "#002b36",
      gutter: "#073642",
      bd: "#001f27",
      fg: "#839496",
      dim: "#586e75",
      k: "#859900",
      s: "#2aa198",
      c: "#586e75",
      n: "#d33682",
      f: "#268bd2",
      t: "#b58900",
      m: "#cb4b16",
      o: "#859900",
      b: "#d33682",
      d: "#cb4b16",
      p: "#839496",
      cur: "#073642",
      acc: "#268bd2",
      sel: "rgba(38,139,210,.25)",
      hit: "rgba(181,137,0,.2)",
      hitOn: "rgba(181,137,0,.5)",
      guide: "#073642",
      map: "#073642"
    },
    light: {
      bg: "#ffffff",
      gutter: "#f6f8fa",
      bd: "#d0d7de",
      fg: "#24292f",
      dim: "#8c959f",
      k: "#cf222e",
      s: "#0a3069",
      c: "#6e7781",
      n: "#0550ae",
      f: "#8250df",
      t: "#953800",
      m: "#116329",
      o: "#cf222e",
      b: "#0550ae",
      d: "#116329",
      p: "#24292f",
      cur: "#eaeef2",
      acc: "#0969da",
      sel: "rgba(9,105,218,.15)",
      hit: "rgba(255,193,7,.35)",
      hitOn: "rgba(255,193,7,.65)",
      guide: "#d8dee4",
      map: "#f6f8fa"
    }
  };
  var text = signal(INIT);
  var lang = signal("js");
  var theme = signal("onedark");
  var wrap = signal(false);
  var cursor = signal({ offset: 0, line: 0, col: 1, sel: 0 });
  var dirty = signal(false);
  var showLangs = signal(false);
  var searchOpen = signal(false);
  var searchMode = signal("find");
  var searchQ = signal("");
  var replaceQ = signal("");
  var activeHit = signal(0);
  var isMobile = signal(typeof window !== "undefined" && window.matchMedia("(max-width:900px)").matches);
  var bracketOn = signal(true);
  var minimapOn = signal(true);
  var guidesOn = signal(true);
  var multiCursors = signal([]);
  var folded = signal({});
  var fmetrics = signal({ lh: 22, py: 12, px: 20, ch: 8.13 });
  var lineCount = computed(() => text().split("\n").length);
  var charCount = computed(() => text().length);
  var hitCount = computed(() => {
    const q = searchQ(), t = text();
    if (!q) return 0;
    let n = 0, i = 0;
    while ((i = t.indexOf(q, i)) !== -1) {
      n++;
      i += q.length;
    }
    return n;
  });
  var foldList = computed(() => {
    const t = text();
    const fs = foldState(t);
    const fd = folded();
    const keys = /* @__PURE__ */ new Set();
    for (const k in fs) keys.add(+k);
    for (const k in fd) keys.add(+k);
    const m = fmetrics();
    const lines = t.split("\n");
    return [...keys].sort((a2, b) => a2 - b).map((ln) => {
      return {
        ln,
        collapsed: !!fd[ln],
        top: m.py + ln * m.lh + (m.lh - 16) / 2
      };
    });
  });
  function applyTheme(t) {
    const T = THEMES[t] || THEMES.onedark;
    if (typeof document === "undefined") return;
    const r = document.documentElement.style;
    for (const key in T) r.setProperty("--" + key, T[key]);
  }
  var hist = { stack: [INIT], index: 0, max: 500 };
  function commit(t) {
    if (hist.stack[hist.index] === t) return;
    hist.stack = hist.stack.slice(0, hist.index + 1);
    hist.stack.push(t);
    if (hist.stack.length > hist.max) hist.stack.shift();
    hist.index = hist.stack.length - 1;
  }
  function lineStarts(t) {
    const a2 = [0];
    for (let i = 0; i < t.length; i++) if (t[i] === "\n") a2.push(i + 1);
    return a2;
  }
  function offsetToLineCol(t, off) {
    const a2 = lineStarts(t);
    for (let i = a2.length - 1; i >= 0; i--) if (off >= a2[i]) return { line: i, col: off - a2[i] + 1 };
    return { line: 0, col: 1 };
  }
  function findHits(t, q) {
    if (!q) return [];
    const a2 = [];
    let i = 0;
    while ((i = t.indexOf(q, i)) !== -1) {
      a2.push(i);
      i += q.length;
    }
    return a2;
  }
  function findBracket(t, off) {
    const OPEN = "([{", CLOSE = ")]}";
    const PAIR = { "(": ")", "[": "]", "{": "}", ")": "(", "]": "[", "}": "{" };
    for (const pos of [off - 1, off]) {
      if (pos < 0 || pos >= t.length) continue;
      const ch = t[pos];
      if (!OPEN.includes(ch) && !CLOSE.includes(ch)) continue;
      const isOpen = OPEN.includes(ch);
      const match = PAIR[ch];
      const step = isOpen ? 1 : -1;
      let depth = 0;
      for (let i = pos; i >= 0 && i < t.length; i += step) {
        const c = t[i];
        if (c === ch) depth++;
        else if (c === match) {
          depth--;
          if (depth === 0) return [pos, i];
        }
      }
    }
    return null;
  }
  function foldState(t) {
    const out = {};
    const stack = [];
    const lines = t.split("\n");
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === "{") stack.push(i);
      else if (c === "}" && stack.length) {
        const open = stack.pop();
        const ol2 = offsetToLineCol(t, open).line;
        const cl = offsetToLineCol(t, i).line;
        if (cl <= ol2 + 1) continue;
        out[ol2] = { endLine: cl };
      }
    }
    return out;
  }
  function wordAt(t, off) {
    const isW = (c) => c && /[\w$]/.test(c);
    let s = off, e = off;
    while (s > 0 && isW(t[s - 1])) s--;
    while (e < t.length && isW(t[e])) e++;
    return e > s ? { start: s, end: e, text: t.slice(s, e) } : null;
  }
  if (typeof document !== "undefined" && !document.getElementById("xe-css")) {
    const s = document.createElement("style");
    s.id = "xe-css";
    s.textContent = `
:root{--lh:22px;--fs:13.5px;--px:20px;--py:12px}
html,body{margin:0;padding:0;height:100%;overflow:hidden}
.xe{display:flex;flex-direction:column;height:100dvh;background:var(--bg);color:var(--fg);
  font-family:"JetBrains Mono","Fira Code",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:var(--fs);line-height:var(--lh);position:relative}
.xe-top{display:flex;align-items:center;gap:4px;padding:0 10px;height:40px;flex-shrink:0;
  background:var(--gutter);border-bottom:1px solid var(--bd);z-index:10;overflow-x:auto;scrollbar-width:none}
.xe-top::-webkit-scrollbar{display:none}
.xe-logo{color:var(--acc);font-weight:700;font-size:12px;white-space:nowrap;margin-right:6px}
.xe-btn{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;height:26px;
  background:transparent;border:1px solid transparent;border-radius:5px;color:var(--dim);
  font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;flex-shrink:0}
.xe-btn:hover{background:var(--cur);color:var(--fg)}
.xe-btn.on{background:var(--cur);color:var(--acc);border-color:var(--bd)}
.xe-spacer{flex:1;min-width:8px}
.xe-menu{position:fixed;top:44px;z-index:210;background:var(--gutter);
  border:1px solid var(--bd);border-radius:8px;padding:6px;min-width:220px;
  max-height:70vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.7);font-size:12.5px}
.xe-menu.right{right:12px}
.xe-menu.left{left:8px;right:8px}
.xe-menu button{display:block;width:100%;text-align:left;padding:9px 12px;background:transparent;
  border:0;color:var(--fg);font:inherit;font-size:12.5px;cursor:pointer;border-radius:5px}
.xe-menu button:hover{background:var(--cur)}
.xe-menu button.on{color:var(--acc);font-weight:600}
.xe-menu .title{padding:6px 12px;color:var(--dim);font-size:11px;text-transform:uppercase;letter-spacing:.5px}
.xe-menu .item{display:flex;justify-content:space-between;gap:12px}
.xe-menu .lnum{color:var(--dim);font-size:11px}
.xe-mask{position:fixed;top:40px;left:0;right:0;bottom:0;z-index:150;background:rgba(0,0,0,.3)}
.xe-main{display:flex;flex:1;min-height:0;position:relative;overflow:hidden}
.xe-gut{background:var(--gutter);border-right:1px solid var(--bd);flex-shrink:0;
  overflow:hidden;position:relative;min-width:56px}
.xe-gut-inner{color:var(--dim);text-align:right;white-space:pre;user-select:none;
  padding:var(--py) 22px var(--py) 10px;font:inherit;line-height:inherit;
  will-change:transform;opacity:.65;position:absolute;top:0;left:0;right:0}
.xe-ed{position:relative;flex:1;min-width:0;overflow:hidden}
.xe-deco{position:absolute;top:0;left:0;pointer-events:none;z-index:1;will-change:transform}
.deco-line{position:absolute;left:0;right:0;background:var(--cur);opacity:.55}
.deco-hit{position:absolute;background:var(--hit);border-radius:2px}
.deco-hit.on{background:var(--hitOn)}
.deco-bracket{position:absolute;background:rgba(127,127,255,.35);border-radius:2px;
  box-shadow:inset 0 0 0 1px rgba(127,127,255,.6)}
.deco-multi{position:absolute;background:rgba(255,165,0,.3);border-radius:2px;
  box-shadow:inset 0 0 0 1px rgba(255,165,0,.55)}
.deco-guide{position:absolute;width:1px;background:var(--guide);opacity:.5}
.xe-folds{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:6;will-change:transform}
.xe-folds .fd{position:absolute;right:2px;width:16px;height:16px;line-height:14px;text-align:center;
  font-size:11px;font-weight:700;color:#fff;cursor:pointer;user-select:none;
  background:var(--acc);border:0;border-radius:3px;padding:0;
  transition:background .1s;pointer-events:auto;box-shadow:0 1px 3px rgba(0,0,0,.4)}
.xe-folds .fd:hover{background:#ff8c00}
.xe-folds .fd.on{background:#ff8c00}
.xe-pre{position:absolute;top:0;left:0;margin:0;padding:var(--py) 20px var(--py) 20px;
  white-space:pre;tab-size:2;font:inherit;line-height:inherit;color:var(--fg);
  pointer-events:none;z-index:2;will-change:transform;background:transparent}
.xe-ta{position:absolute;inset:0;padding:var(--py) 20px var(--py) 20px;
  background:transparent;color:transparent;-webkit-text-fill-color:transparent;
  caret-color:var(--acc);border:0;outline:0;resize:none;white-space:pre;tab-size:2;
  font:inherit;line-height:inherit;z-index:3;overflow:auto;box-sizing:border-box;
  width:100%;height:100%;user-select:text;-webkit-user-select:text;
  scrollbar-width:thin;scrollbar-color:var(--bd) transparent}
.xe-ta::-webkit-scrollbar{width:12px;height:12px}
.xe-ta::-webkit-scrollbar-thumb{background:var(--bd);border-radius:6px;border:3px solid var(--bg)}
.xe-ta::selection{background:var(--sel);color:transparent;-webkit-text-fill-color:transparent}
.xe-map{position:absolute;top:0;right:0;bottom:0;width:70px;background:var(--map);
  border-left:1px solid var(--bd);z-index:4;cursor:pointer;overflow:hidden}
.xe-map canvas{display:block;width:100%}
.xe-map-vp{position:absolute;left:0;right:0;background:rgba(255,255,255,.08);
  border-top:1px solid var(--acc);border-bottom:1px solid var(--acc);pointer-events:none}
.xe-foot{display:flex;align-items:center;gap:14px;padding:0 14px;height:28px;flex-shrink:0;
  background:var(--gutter);border-top:1px solid var(--bd);font-size:11.5px;color:var(--dim)}
.xe-foot span{white-space:nowrap}
.xe-foot .acc{color:var(--acc)}
.h-k{color:var(--k)}.h-s{color:var(--s)}.h-c{color:var(--c);font-style:italic}
.h-n{color:var(--n)}.h-f{color:var(--f)}.h-t{color:var(--t)}.h-m{color:var(--m)}
.h-o{color:var(--o)}.h-b{color:var(--b)}.h-d{color:var(--d)}.h-p{color:var(--p)}
.xe-search{position:absolute;top:8px;right:16px;z-index:50;background:var(--gutter);
  border:1px solid var(--bd);border-radius:8px;padding:6px 8px;
  box-shadow:0 8px 32px rgba(0,0,0,.5);display:flex;align-items:center;gap:6px;font-size:12px}
.xe-search input{background:var(--bg);border:1px solid var(--bd);border-radius:4px;
  color:var(--fg);padding:4px 8px;font:inherit;font-size:12px;outline:0;width:130px}
.xe-search input:focus{border-color:var(--acc)}
.xe-search .cnt{color:var(--dim);font-size:11.5px;min-width:34px;text-align:center}
.xe-search .sbtn{padding:3px 8px;height:22px;background:transparent;border:1px solid var(--bd);
  border-radius:4px;color:var(--fg);font:inherit;font-size:11.5px;cursor:pointer}
.xe-search .sbtn.close{border:0;color:var(--dim);font-size:14px}
.xe-complete{position:absolute;z-index:90;background:var(--gutter);
  border:1px solid var(--bd);border-radius:6px;padding:4px;min-width:140px;max-height:220px;
  overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.5);font-size:12.5px}
.xe-ci{padding:6px 10px;cursor:pointer;border-radius:4px;color:var(--fg)}
.xe-ci.on{background:var(--acc);color:var(--bg)}
.xe.wrap .xe-pre,.xe.wrap .xe-ta{white-space:pre-wrap;word-break:break-word}
@media (max-width:900px){.xe-map{display:none}}
@media (max-width:640px){
  .xe{font-size:14px;--lh:24px;--fs:14px}
  .xe-gut-inner{padding:var(--py) 22px var(--py) 6px;font-size:12px;opacity:.55}
  .xe-gut{min-width:52px}
  .xe-top{height:44px;padding:0 6px;gap:2px}
  .xe-logo{display:none}
  .xe-btn{padding:4px 6px;font-size:11px;height:24px}
  .xe-ta{caret-color:#ffffff;-webkit-text-fill-color:transparent}
  .xe-search input{width:100px}
  .xe-folds .fd{width:20px;height:20px;line-height:19px;font-size:13px}
}
`;
    document.head.appendChild(s);
  }
  function Editor() {
    let taEl = null, preEl = null, decoEl = null, gutInnerEl = null, foldsEl = null;
    let mapCanvas = null, mapVp = null, mapEl = null;
    let composing = false, pending = false;
    const M = () => fmetrics();
    const LH = () => M().lh;
    const CH = () => M().ch;
    const PY = () => M().py;
    const PX = () => M().px;
    const measure = () => {
      if (!taEl) return;
      const cs = getComputedStyle(taEl);
      const lh = parseFloat(cs.lineHeight) || 22;
      const py = parseFloat(cs.paddingTop) || 12;
      const px = parseFloat(cs.paddingLeft) || 20;
      const sp = document.createElement("span");
      sp.textContent = "x".repeat(100);
      sp.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:" + cs.font;
      document.body.appendChild(sp);
      const ch = sp.getBoundingClientRect().width / 100;
      document.body.removeChild(sp);
      fmetrics({ lh, py, px, ch });
    };
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        render2();
      });
    };
    const render2 = () => {
      const t = text(), cur = cursor(), q = searchQ();
      const ls = lineStarts(t);
      const lh = LH(), ch = CH(), py = PY(), px = PX();
      if (preEl) preEl.innerHTML = highlight(t, lang()) || "\u200B";
      if (gutInnerEl) {
        const a2 = new Array(ls.length);
        for (let i = 0; i < ls.length; i++) a2[i] = i + 1;
        gutInnerEl.textContent = a2.join("\n");
      }
      if (decoEl) {
        const parts = [];
        parts.push('<div class="deco-line" style="top:' + (py + cur.line * lh) + "px;height:" + lh + 'px"></div>');
        if (guidesOn()) {
          const lines = t.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const lead = lines[i].match(/^ +/)?.[0].length || 0;
            const levels = Math.floor(lead / 2);
            for (let k = 1; k <= levels; k++) {
              parts.push('<div class="deco-guide" style="top:' + (py + i * lh) + "px;left:" + (px + k * 2 * ch) + "px;height:" + lh + 'px"></div>');
            }
          }
        }
        if (q) {
          const hits = findHits(t, q);
          const ai = activeHit();
          for (let i = 0; i < hits.length; i++) {
            const { line, col } = offsetToLineCol(t, hits[i]);
            parts.push('<div class="deco-hit' + (i === ai ? " on" : "") + '" style="top:' + (py + line * lh) + "px;left:" + (px + (col - 1) * ch) + "px;width:" + q.length * ch + "px;height:" + lh + 'px"></div>');
          }
        }
        const br2 = bracketOn() ? findBracket(t, cur.offset) : null;
        if (br2) for (const p2 of br2) {
          const { line, col } = offsetToLineCol(t, p2);
          parts.push('<div class="deco-bracket" style="top:' + (py + line * lh) + "px;left:" + (px + (col - 1) * ch) + "px;width:" + ch + "px;height:" + lh + 'px"></div>');
        }
        for (const m of multiCursors()) {
          const { line, col } = offsetToLineCol(t, m.start);
          parts.push('<div class="deco-multi" style="top:' + (py + line * lh) + "px;left:" + (px + (col - 1) * ch) + "px;width:" + m.len * ch + "px;height:" + lh + 'px"></div>');
        }
        decoEl.innerHTML = parts.join("");
      }
      drawMinimap();
      syncScroll();
    };
    const syncScroll = () => {
      if (!taEl) return;
      const sl = taEl.scrollLeft, st = taEl.scrollTop;
      if (preEl) preEl.style.transform = "translate(" + -sl + "px," + -st + "px)";
      if (decoEl) decoEl.style.transform = "translate(" + -sl + "px," + -st + "px)";
      if (gutInnerEl) gutInnerEl.style.transform = "translateY(" + -st + "px)";
      if (foldsEl) foldsEl.style.transform = "translateY(" + -st + "px)";
      if (mapVp && taEl) {
        const total = taEl.scrollHeight, vh = taEl.clientHeight;
        if (total > 0) {
          mapVp.style.top = st / total * 100 + "%";
          mapVp.style.height = vh / total * 100 + "%";
        }
      }
    };
    const drawMinimap = () => {
      if (!mapCanvas || !minimapOn() || isMobile()) return;
      const lines = text().split("\n");
      const W = 70, H = mapEl.clientHeight;
      const lh = Math.max(1, Math.min(3, Math.floor(H / Math.max(lines.length, 1))));
      mapCanvas.width = W;
      mapCanvas.height = lines.length * lh;
      mapCanvas.style.height = lines.length * lh + "px";
      const ctx2 = mapCanvas.getContext("2d");
      ctx2.clearRect(0, 0, W, mapCanvas.height);
      const T = THEMES[theme()] || THEMES.onedark;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lead = line.match(/^ +/)?.[0].length || 0;
        const x = 4 + lead / 2 * 1.8;
        const w = Math.min(W - x - 4, line.length * 1.1);
        ctx2.fillStyle = line.trim().startsWith("//") ? T.c : T.fg;
        ctx2.globalAlpha = 0.65;
        ctx2.fillRect(x, i * lh, Math.max(2, w), Math.max(1, lh - 1));
        ctx2.globalAlpha = 1;
      }
    };
    const updateCursor = () => {
      if (!taEl) return;
      const s = taEl.selectionStart, e = taEl.selectionEnd;
      const { line, col } = offsetToLineCol(taEl.value, s);
      cursor({ offset: s, line, col, sel: e - s });
      schedule();
    };
    const ensureCaret = () => {
      if (!taEl) return;
      if (document.activeElement === taEl) {
        const s = taEl.selectionStart;
        taEl.selectionStart = s;
      }
    };
    const insert = (str) => {
      const s = taEl.selectionStart, e = taEl.selectionEnd;
      taEl.setRangeText(str, s, e, "end");
      const t = taEl.value;
      text(t);
      dirty(true);
      commit(t);
      multiCursors([]);
      schedule();
      updateCursor();
    };
    const replaceRange = (a2, b, s) => {
      taEl.setRangeText(s, a2, b, "end");
      const t = taEl.value;
      text(t);
      dirty(true);
      commit(t);
      schedule();
      updateCursor();
    };
    const currentLineInfo = () => {
      const v = taEl.value, s = taEl.selectionStart;
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      let le = v.indexOf("\n", s);
      if (le === -1) le = v.length;
      return { ls, le, line: v.substring(ls, le) };
    };
    const toggleFold = (ln) => {
      if (!taEl) return;
      const f = { ...folded() };
      const t2 = text();
      const lines = t2.split("\n");
      if (f[ln]) {
        const block = f[ln].block;
        const nt = lines.slice(0, ln + 1).concat(block).concat(lines.slice(ln + 1)).join("\n");
        delete f[ln];
        folded(f);
        taEl.value = nt;
        text(nt);
        dirty(true);
        commit(nt);
        schedule();
        updateCursor();
      } else {
        const fs = foldState(t2);
        const fd = fs[ln];
        if (!fd || fd.endLine <= ln + 1) return;
        const block = lines.slice(ln + 1, fd.endLine);
        if (!block.length) return;
        f[ln] = { block };
        folded(f);
        const nt = lines.slice(0, ln + 1).concat(lines.slice(fd.endLine)).join("\n");
        taEl.value = nt;
        text(nt);
        dirty(true);
        commit(nt);
        schedule();
        updateCursor();
      }
    };
    const onKeyDown = (e) => {
      if (!taEl) return;
      const mod = e.ctrlKey || e.metaKey;
      const alt = e.altKey;
      if (mod && e.key === "f") {
        e.preventDefault();
        searchMode("find");
        searchOpen(true);
        return;
      }
      if (mod && e.key === "h") {
        e.preventDefault();
        searchMode("replace");
        searchOpen(true);
        return;
      }
      if (e.key === "Escape") {
        if (searchOpen()) {
          searchOpen(false);
          return;
        }
        if (multiCursors().length) {
          multiCursors([]);
          schedule();
          return;
        }
      }
      if (mod && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (hist.index > 0) {
          hist.index--;
          taEl.value = hist.stack[hist.index];
          text(taEl.value);
          multiCursors([]);
          folded({});
          schedule();
          updateCursor();
        }
        return;
      }
      if (mod && (e.key === "y" || e.shiftKey && e.key === "z")) {
        e.preventDefault();
        if (hist.index < hist.stack.length - 1) {
          hist.index++;
          taEl.value = hist.stack[hist.index];
          text(taEl.value);
          multiCursors([]);
          folded({});
          schedule();
          updateCursor();
        }
        return;
      }
      if (mod && e.key === "d") {
        e.preventDefault();
        const t = taEl.value;
        const s = taEl.selectionStart, en = taEl.selectionEnd;
        let word = "";
        if (en > s) word = t.substring(s, en);
        else {
          const w = wordAt(t, s);
          if (!w) return;
          word = w.text;
          taEl.setSelectionRange(w.start, w.end);
        }
        if (!word) return;
        const all = findHits(t, word);
        const cur = multiCursors();
        if (!cur.length) cur.push({ start: s, len: word.length });
        const last = cur[cur.length - 1];
        const next = all.find((o) => o > last.start);
        if (next !== void 0) {
          cur.push({ start: next, len: word.length });
          multiCursors(cur.slice());
          taEl.setSelectionRange(next, next + word.length);
          schedule();
        }
        return;
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        const { ls, le, line } = currentLineInfo();
        const nl = line.trim().startsWith("//") ? line.replace(/^(\s*)\/\/\s?/, "$1") : line.replace(/^(\s*)/, "$1// ");
        replaceRange(ls, le, nl);
        return;
      }
      if (alt && (e.key === "ArrowUp" || e.key === "ArrowDown") && !e.shiftKey) {
        e.preventDefault();
        const t = taEl.value;
        const starts = lineStarts(t);
        const li2 = cursor().line;
        if (e.key === "ArrowUp" && li2 === 0) return;
        if (e.key === "ArrowDown" && li2 === starts.length - 1) return;
        const a2 = starts[li2];
        let b = t.indexOf("\n", a2);
        if (b === -1) b = t.length;
        const line = t.substring(a2, b);
        const sw = e.key === "ArrowUp" ? li2 - 1 : li2 + 1;
        const sa = starts[sw];
        let sb = t.indexOf("\n", sa);
        if (sb === -1) sb = t.length;
        const sLine = t.substring(sa, sb);
        const below = Math.max(b, sb);
        const nt = e.key === "ArrowUp" ? t.slice(0, sa) + line + "\n" + sLine + t.slice(below) : t.slice(0, a2) + sLine + "\n" + line + t.slice(below);
        const no = e.key === "ArrowUp" ? sa : sa + sLine.length + 1;
        taEl.value = nt;
        text(nt);
        dirty(true);
        commit(nt);
        taEl.setSelectionRange(no, no);
        schedule();
        updateCursor();
        return;
      }
      if (e.shiftKey && alt && e.key === "ArrowDown") {
        e.preventDefault();
        const t = taEl.value;
        const starts = lineStarts(t);
        const li2 = cursor().line;
        const a2 = starts[li2];
        let b = t.indexOf("\n", a2);
        if (b === -1) b = t.length;
        const line = t.substring(a2, b);
        const nt = t.slice(0, b) + "\n" + line + t.slice(b);
        taEl.value = nt;
        text(nt);
        dirty(true);
        commit(nt);
        const no = b + 1;
        taEl.setSelectionRange(no, no);
        schedule();
        updateCursor();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          const { ls, le, line } = currentLineInfo();
          replaceRange(ls, le, line.replace(/^ {1,2}/, ""));
        } else insert("  ");
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const { line } = currentLineInfo();
        const indent = (line.match(/^\s*/) || [""])[0];
        const extra = /[{\[(]\s*$/.test(line) ? "  " : "";
        insert("\n" + indent + extra);
        return;
      }
      if (e.key === "Backspace") {
        const s = taEl.selectionStart, en = taEl.selectionEnd;
        if (s === en && s > 1) {
          const before = taEl.value.substring(s - 2, s);
          if (["()", "[]", "{}", "''", '""', "``"].includes(before)) {
            e.preventDefault();
            replaceRange(s - 2, s, "");
            return;
          }
        }
      }
      const PAIR = { "(": ")", "[": "]", "{": "}" };
      if ([")", "]", "}"].includes(e.key)) {
        const s = taEl.selectionStart, en = taEl.selectionEnd;
        if (s === en && taEl.value[s] === e.key) {
          e.preventDefault();
          taEl.setSelectionRange(s + 1, s + 1);
          updateCursor();
          return;
        }
      }
      if (PAIR[e.key] || ["'", '"', "`"].includes(e.key)) {
        e.preventDefault();
        const close = PAIR[e.key] || e.key;
        const s = taEl.selectionStart, en = taEl.selectionEnd;
        const sel = taEl.value.substring(s, en);
        replaceRange(s, en, e.key + sel + close);
        const p2 = s + 1 + sel.length;
        taEl.setSelectionRange(p2, p2);
        updateCursor();
        return;
      }
    };
    const onInput = () => {
      if (composing) return;
      const mc = multiCursors();
      if (mc.length > 1) {
        const t = taEl.value;
        const word = t.substring(mc[mc.length - 1].start, mc[mc.length - 1].start + mc[mc.length - 1].len);
        if (!mc.every((m) => t.substring(m.start, m.start + m.len) === word)) multiCursors([]);
      }
      text(taEl.value);
      dirty(true);
      commit(taEl.value);
      schedule();
      updateCursor();
    };
    onMount(() => {
      taEl = document.querySelector(".xe-ta");
      preEl = document.querySelector(".xe-pre");
      decoEl = document.querySelector(".xe-deco");
      gutInnerEl = document.querySelector(".xe-gut-inner");
      foldsEl = document.querySelector(".xe-folds");
      mapCanvas = document.querySelector(".xe-map canvas");
      mapVp = document.querySelector(".xe-map-vp");
      mapEl = document.querySelector(".xe-map");
      if (!taEl) {
        console.error("[editor] .xe-ta not found");
        return;
      }
      taEl.value = text();
      applyTheme(theme());
      const mq = window.matchMedia("(max-width:900px)");
      const applyMQ = () => {
        isMobile(mq.matches);
        measure();
        schedule();
      };
      applyMQ();
      measure();
      const remeasure = () => {
        measure();
        schedule();
      };
      window.addEventListener("resize", remeasure);
      mq.addEventListener("change", applyMQ);
      const tap = () => {
        taEl.focus();
        updateCursor();
      };
      const cs = () => {
        composing = true;
      };
      const ce = () => {
        composing = false;
        onInput();
      };
      const ci = () => updateCursor();
      const sc = () => syncScroll();
      taEl.addEventListener("input", onInput);
      taEl.addEventListener("scroll", sc, { passive: true });
      taEl.addEventListener("click", tap);
      taEl.addEventListener("keyup", ci);
      taEl.addEventListener("select", ci);
      taEl.addEventListener("compositionstart", cs);
      taEl.addEventListener("compositionend", ce);
      taEl.addEventListener("touchend", tap, { passive: true });
      taEl.addEventListener("focus", () => {
        ci();
        requestAnimationFrame(ensureCaret);
      });
      document.addEventListener("selectionchange", ci);
      const caretTimer = setInterval(ensureCaret, 800);
      render2();
      onCleanup(() => {
        taEl.removeEventListener("input", onInput);
        taEl.removeEventListener("scroll", sc);
        taEl.removeEventListener("click", tap);
        taEl.removeEventListener("keyup", ci);
        taEl.removeEventListener("select", ci);
        taEl.removeEventListener("compositionstart", cs);
        taEl.removeEventListener("compositionend", ce);
        taEl.removeEventListener("touchend", tap);
        document.removeEventListener("selectionchange", ci);
        clearInterval(caretTimer);
        window.removeEventListener("resize", remeasure);
        mq.removeEventListener("change", applyMQ);
      });
    });
    const goHit = (dir) => {
      const hits = findHits(text(), searchQ());
      if (!hits.length) return;
      let i = activeHit() + dir;
      if (i < 0) i = hits.length - 1;
      if (i >= hits.length) i = 0;
      activeHit(i);
      const off = hits[i];
      taEl.focus();
      taEl.setSelectionRange(off, off + searchQ().length);
      updateCursor();
    };
    const replaceOne = () => {
      const t = text(), q = searchQ(), r = replaceQ();
      const hits = findHits(t, q);
      const h = hits[activeHit()];
      if (h === void 0) return;
      replaceRange(h, h + q.length, r);
    };
    const replaceAll = () => {
      const q = searchQ(), r = replaceQ();
      if (!q) return;
      taEl.value = text().split(q).join(r);
      text(taEl.value);
      dirty(true);
      commit(taEl.value);
      schedule();
      updateCursor();
    };
    const onMapClick = (e) => {
      if (!taEl || !mapEl) return;
      const r = mapEl.getBoundingClientRect();
      const pct = (e.clientY - r.top) / r.height;
      taEl.scrollTop = pct * taEl.scrollHeight - taEl.clientHeight / 2;
    };
    const toggleTheme = () => {
      const ks = Object.keys(THEMES);
      const i = ks.indexOf(theme());
      theme(ks[(i + 1) % ks.length]);
      applyTheme(theme());
      schedule();
    };
    return (() => {
      const _div0 = document.createElement("div");
      bindAttr(_div0, "class", () => "xe" + (wrap() ? " wrap" : ""));
      const _div1 = document.createElement("div");
      _div1.className = "xe-top";
      _div1.addEventListener("click", (e) => e.stopPropagation());
      const _button2 = document.createElement("button");
      _button2.className = "xe-btn";
      _button2.addEventListener("click", (e) => {
        e.stopPropagation();
        showLangs(!showLangs());
      });
      const _t3 = document.createElement("span");
      _t3.style.display = "contents";
      bindText(_t3, () => "\u2318 " + lang());
      _button2.appendChild(_t3);
      _div1.appendChild(_button2);
      const _button4 = document.createElement("button");
      bindAttr(_button4, "class", () => "xe-btn" + (searchOpen() ? " on" : ""));
      _button4.addEventListener("click", (e) => {
        e.stopPropagation();
        searchMode("find");
        searchOpen(!searchOpen());
      });
      _button4.appendChild(document.createTextNode("\u{1F50D}"));
      _div1.appendChild(_button4);
      const _button5 = document.createElement("button");
      bindAttr(_button5, "class", () => "xe-btn" + (bracketOn() ? " on" : ""));
      _button5.addEventListener("click", (e) => {
        e.stopPropagation();
        bracketOn(!bracketOn());
        schedule();
      });
      _button5.appendChild(document.createTextNode("( )"));
      _div1.appendChild(_button5);
      const _button6 = document.createElement("button");
      bindAttr(_button6, "class", () => "xe-btn" + (guidesOn() ? " on" : ""));
      _button6.addEventListener("click", (e) => {
        e.stopPropagation();
        guidesOn(!guidesOn());
        schedule();
      });
      _button6.appendChild(document.createTextNode("\u2502"));
      _div1.appendChild(_button6);
      const _button7 = document.createElement("button");
      bindAttr(_button7, "class", () => "xe-btn" + (minimapOn() ? " on" : ""));
      _button7.addEventListener("click", (e) => {
        e.stopPropagation();
        minimapOn(!minimapOn());
        schedule();
      });
      _button7.appendChild(document.createTextNode("\u25A4"));
      _div1.appendChild(_button7);
      const _button8 = document.createElement("button");
      bindAttr(_button8, "class", () => "xe-btn" + (wrap() ? " on" : ""));
      _button8.addEventListener("click", (e) => {
        e.stopPropagation();
        wrap(!wrap());
        setTimeout(measure, 0);
        schedule();
      });
      _button8.appendChild(document.createTextNode("\u21A9"));
      _div1.appendChild(_button8);
      const _span9 = document.createElement("span");
      _span9.className = "xe-spacer";
      _div1.appendChild(_span9);
      const _button10 = document.createElement("button");
      _button10.className = "xe-btn";
      _button10.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTheme();
      });
      const _t11 = document.createElement("span");
      _t11.style.display = "contents";
      bindText(_t11, () => "\u25D0 " + theme());
      _button10.appendChild(_t11);
      _div1.appendChild(_button10);
      _div0.appendChild(_div1);
      const _t12 = document.createElement("span");
      _t12.style.display = "contents";
      bindText(_t12, () => showLangs() ? frag(
        div({ class: "xe-mask", on: { click: (e) => {
          e.stopPropagation();
          showLangs(false);
        } } }),
        div(
          { class: "xe-menu right", on: { click: (e) => e.stopPropagation() } },
          div({ class: "title" }, "\u8BED\u8A00"),
          list(
            () => languages,
            (l) => l,
            (l) => button({
              class: () => lang() === l ? "on" : "",
              on: { click: () => {
                lang(l);
                showLangs(false);
                folded({});
                schedule();
              } }
            }, l)
          )
        )
      ) : null);
      _div0.appendChild(_t12);
      const _t13 = document.createElement("span");
      _t13.style.display = "contents";
      bindText(_t13, () => searchOpen() ? div(
        { class: "xe-search", on: { click: (e) => e.stopPropagation() } },
        input({
          placeholder: "\u641C\u7D22",
          value: () => searchQ(),
          on: { input: (e) => {
            searchQ(e.target.value);
            activeHit(0);
            schedule();
          } }
        }),
        span({ class: "cnt" }, () => hitCount() ? activeHit() + 1 + "/" + hitCount() : "0/0"),
        button({ class: "sbtn", on: { click: () => goHit(-1) } }, "\u2191"),
        button({ class: "sbtn", on: { click: () => goHit(1) } }, "\u2193"),
        searchMode() === "replace" ? frag(
          input({
            placeholder: "\u66FF\u6362",
            value: () => replaceQ(),
            on: { input: (e) => replaceQ(e.target.value) }
          }),
          button({ class: "sbtn", on: { click: replaceOne } }, "\u66FF"),
          button({ class: "sbtn", on: { click: replaceAll } }, "\u5168\u66FF")
        ) : null,
        button({ class: "sbtn close", on: { click: () => searchOpen(false) } }, "\xD7")
      ) : null);
      _div0.appendChild(_t13);
      const _div14 = document.createElement("div");
      _div14.className = "xe-main";
      const _div15 = document.createElement("div");
      _div15.className = "xe-gut";
      const _div16 = document.createElement("div");
      _div16.className = "xe-gut-inner";
      _div15.appendChild(_div16);
      const _div17 = document.createElement("div");
      _div17.className = "xe-folds";
      const _t18 = renderChild(list(
        foldList,
        (f) => "f" + f.ln,
        (f) => (() => {
          const _button19 = document.createElement("button");
          bindAttr(_button19, "class", () => "fd" + (f.collapsed ? " on" : ""));
          bindStyle(_button19, () => "top:" + f.top + "px");
          bindAttr(_button19, "title", () => "\u6298\u53E0\u7B2C " + (f.ln + 1) + " \u884C");
          _button19.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFold(f.ln);
          });
          const _t20 = document.createElement("span");
          _t20.style.display = "contents";
          bindText(_t20, () => f.collapsed ? "\u25B8" : "\u25BE");
          _button19.appendChild(_t20);
          return _button19;
        })()
      ));
      if (_t18) _div17.appendChild(_t18);
      _div15.appendChild(_div17);
      _div14.appendChild(_div15);
      const _div21 = document.createElement("div");
      _div21.className = "xe-ed";
      const _div22 = document.createElement("div");
      _div22.className = "xe-deco";
      _div21.appendChild(_div22);
      const _pre23 = document.createElement("pre");
      _pre23.className = "xe-pre";
      _div21.appendChild(_pre23);
      const _textarea24 = document.createElement("textarea");
      _textarea24.className = "xe-ta";
      _textarea24.setAttribute("spellcheck", "false");
      _textarea24.setAttribute("autocomplete", "off");
      _textarea24.setAttribute("autocorrect", "off");
      _textarea24.setAttribute("autocapitalize", "off");
      _textarea24.setAttribute("wrap", "off");
      _textarea24.addEventListener("keydown", onKeyDown);
      _div21.appendChild(_textarea24);
      const _t25 = document.createElement("span");
      _t25.style.display = "contents";
      bindText(_t25, () => minimapOn() && !isMobile() ? div(
        { class: "xe-map", on: { click: onMapClick } },
        canvas(null),
        div({ class: "xe-map-vp" })
      ) : null);
      _div21.appendChild(_t25);
      _div14.appendChild(_div21);
      _div0.appendChild(_div14);
      const _div26 = document.createElement("div");
      _div26.className = "xe-foot";
      const _span27 = document.createElement("span");
      _span27.className = "acc";
      const _t28 = document.createElement("span");
      _t28.style.display = "contents";
      bindTextDirect(_t28, lang, toString);
      _span27.appendChild(_t28);
      _div26.appendChild(_span27);
      const _span29 = document.createElement("span");
      const _t30 = document.createElement("span");
      _t30.style.display = "contents";
      bindText(_t30, () => "\u884C " + (cursor().line + 1) + "\uFF0C\u5217 " + cursor().col);
      _span29.appendChild(_t30);
      _div26.appendChild(_span29);
      const _t31 = renderChild(cursor().sel > 0 ? (() => {
        const _span32 = document.createElement("span");
        const _t33 = document.createElement("span");
        _t33.style.display = "contents";
        bindText(_t33, () => "\u9009\u4E2D " + cursor().sel);
        _span32.appendChild(_t33);
        return _span32;
      })() : null);
      if (_t31) _div26.appendChild(_t31);
      const _t34 = renderChild(multiCursors().length > 1 ? (() => {
        const _span35 = document.createElement("span");
        _span35.className = "acc";
        const _t36 = document.createElement("span");
        _t36.style.display = "contents";
        bindText(_t36, () => "\u2318D \xD7" + multiCursors().length);
        _span35.appendChild(_t36);
        return _span35;
      })() : null);
      if (_t34) _div26.appendChild(_t34);
      const _span37 = document.createElement("span");
      applyStyle(_span37, "flex:1");
      _div26.appendChild(_span37);
      const _span38 = document.createElement("span");
      const _t39 = document.createElement("span");
      _t39.style.display = "contents";
      bindText(_t39, () => lineCount() + " \u884C");
      _span38.appendChild(_t39);
      _div26.appendChild(_span38);
      const _span40 = document.createElement("span");
      const _t41 = document.createElement("span");
      _t41.style.display = "contents";
      bindText(_t41, () => charCount() + " \u5B57\u7B26");
      _span40.appendChild(_t41);
      _div26.appendChild(_span40);
      const _t42 = renderChild(dirty() ? (() => {
        const _span44 = document.createElement("span");
        _span44.className = "acc";
        _span44.appendChild(document.createTextNode("\u25CF \u672A\u4FDD\u5B58"));
        return _span44;
      })() : (() => {
        const _span43 = document.createElement("span");
        _span43.appendChild(document.createTextNode("\u5DF2\u4FDD\u5B58"));
        return _span43;
      })());
      if (_t42) _div26.appendChild(_t42);
      _div0.appendChild(_div26);
      return _div0;
    })();
  }
  document.addEventListener("click", () => {
    showLangs(false);
  });
  mount(() => Editor(), "#app");
})();
