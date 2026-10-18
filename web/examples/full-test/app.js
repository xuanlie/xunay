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
  var canvas = tags.canvas;
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

  // ../../core/src/misc.js
  function show(cond, renderFn) {
    return { __xunay_show: true, cond, renderFn };
  }

  // ../../core/src/index.js
  install();

  // ../../core/src/kit-util.js
  function px(p2) {
    return p2 || {};
  }
  function cx(...args) {
    return args.filter(Boolean).join(" ");
  }

  // ../../core/src/kit.js
  var require_tags = { h4, h5, h6, a, code, pre };
  function Btn(props, ...children) {
    const { type = "default", size = "", block, disabled, onClick, icon } = px(props);
    const isDisabled = () => typeof disabled === "function" ? !!disabled() : !!disabled;
    return button({
      class: cx("btn", type !== "default" && "btn-" + type, size && "btn-" + size, block && "btn-block"),
      disabled: () => isDisabled() ? true : void 0,
      on: { click: (e) => {
        if (!isDisabled()) onClick && onClick(e);
      } }
    }, ...icon ? [icon, ...children] : children);
  }
  function Row(props, ...children) {
    const { gap = 4, align, justify, wrap: wrap2 } = px(props);
    return div({ class: cx("flex", "gap-" + gap, align && "items-" + align, justify && "justify-" + justify, wrap2 && "flex-wrap") }, ...children);
  }
  function Col(props, ...children) {
    const { gap = 4, align } = px(props);
    return div({ class: cx("flex", "flex-col", "gap-" + gap, align && "items-" + align) }, ...children);
  }
  function Text(props, ...children) {
    const { size, dim, bold, center, tag: tag2 = "p" } = px(props);
    const cls = cx(size && "text-" + size, dim && "text-dim", bold && "font-" + (bold === true ? "bold" : bold), center && "text-center");
    const { h4: h42, h5: h52, h6: h62, a: a2, code: _code, pre: _pre } = require_tags;
    const Tag2 = { p, span, h1, h2, h3, h4: h42, h5: h52, h6: h62, a: a2, code: _code, pre: _pre }[tag2] || p;
    return Tag2({ class: cls }, ...children);
  }
  function Card(props, ...children) {
    const { title, desc, footer: footer2, flat, hover } = px(props);
    return div(
      { class: cx("card", flat && "card-flat", hover && "card-hover") },
      title ? div(
        { class: "card-header" },
        div({ class: "card-title" }, title),
        desc ? div({ class: "card-desc" }, desc) : null
      ) : null,
      ...children,
      footer2 ? div({ class: "card-footer" }, footer2) : null
    );
  }
  function Divider(props) {
    const { text } = px(props);
    if (!text) return div({ class: "divider" });
    return div(
      { style: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0", color: "var(--x-text-mute)", fontSize: "13px" } },
      div({ style: { flex: 1, height: "1px", background: "var(--x-border)" } }),
      span(null, text),
      div({ style: { flex: 1, height: "1px", background: "var(--x-border)" } })
    );
  }
  function Space(props, ...children) {
    const { size = 16, direction = "horizontal" } = px(props);
    const real = children.length ? children : [props.children].filter(Boolean);
    if (!real.length) return div({ style: { height: size + "px" } });
    const gap = typeof size === "number" ? size : parseInt(size) || 16;
    const sty = direction === "vertical" ? { display: "flex", flexDirection: "column", gap: gap + "px" } : { display: "inline-flex", alignItems: "center", gap: gap + "px" };
    return div({ style: sty }, ...real);
  }
  function Tag(props, ...children) {
    const { type, closable, onClose } = px(props);
    return span(
      { class: cx("badge", type && "badge-" + type), style: { paddingRight: closable ? "4px" : "8px" } },
      ...children,
      closable ? span({ style: { marginLeft: "4px", cursor: "pointer", opacity: 0.7 }, on: { click: onClose } }, "\xD7") : null
    );
  }
  function Badge(props, ...children) {
    const { type } = px(props);
    return span({ class: cx("badge", type && "badge-" + type) }, ...children);
  }

  // ../../core/src/kit-form.js
  function Input(props) {
    const { label: label2, hint, error, type = "text", value, onChange, placeholder, size, disabled, name } = px(props);
    return div(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      input({
        class: cx("input", size && "input-" + size, error && "error"),
        type,
        name,
        placeholder: placeholder || "",
        disabled: !!disabled,
        value: typeof value === "function" ? value : value || "",
        on: { input: (e) => onChange && onChange(e.target.value, e) }
      }),
      error ? div({ class: "error-msg" }, error) : hint ? div({ class: "hint" }, hint) : null
    );
  }
  function Textarea(props) {
    const { label: label2, hint, error, value, onChange, placeholder, rows = 4 } = px(props);
    return div(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      textarea({
        class: cx("textarea", error && "error"),
        rows,
        placeholder: placeholder || "",
        value: typeof value === "function" ? value : value || "",
        on: { input: (e) => onChange && onChange(e.target.value, e) }
      }),
      error ? div({ class: "error-msg" }, error) : hint ? div({ class: "hint" }, hint) : null
    );
  }
  function Select(props) {
    const { label: label2, hint, error, options = [], value, onChange, placeholder, disabled, size } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      select(
        {
          class: cx("select", size && "input-" + size, error && "error"),
          disabled: !!disabled,
          value: typeof value === "function" ? value : value || "",
          on: { change: (e) => onChange && onChange(e.target.value) }
        },
        placeholder ? option({ value: "" }, placeholder) : null,
        ...options.map((o) => option({ value: o.value, selected: o.value === val ? true : void 0 }, o.label))
      ),
      error ? div({ class: "error-msg" }, error) : hint ? div({ class: "hint" }, hint) : null
    );
  }
  function Checkbox(props) {
    const { label: label2, checked, onChange, disabled } = px(props);
    return label(
      { class: "checkbox" },
      input({ type: "checkbox", checked: typeof checked === "function" ? () => !!checked() : !!checked, disabled: !!disabled, on: { change: (e) => onChange && onChange(e.target.checked) } }),
      span(null, label2 || "")
    );
  }
  function Radio(props) {
    const { label: label2, checked, onChange, name, disabled } = px(props);
    return label(
      { class: "radio" },
      input({ type: "radio", name, checked: typeof checked === "function" ? () => !!checked() : !!checked, disabled: !!disabled, on: { change: () => onChange && onChange() } }),
      span(null, label2 || "")
    );
  }
  function Switch(props) {
    const { label: label2, checked, onChange, disabled } = px(props);
    const isChecked = () => typeof checked === "function" ? !!checked() : !!checked;
    const toggle = () => {
      if (disabled) return;
      onChange && onChange(!isChecked());
    };
    return Row(
      { gap: 2, align: "center" },
      div(
        {
          class: "switch" + (isChecked() ? " on" : "") + (disabled ? " disabled" : ""),
          role: "switch",
          "aria-checked": () => isChecked() ? "true" : "false",
          tabindex: "0",
          on: {
            click: toggle,
            keydown: (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle();
              }
            }
          }
        },
        div({ class: "switch-thumb" })
      ),
      label2 ? span({ class: "switch-label", on: { click: toggle } }, label2) : null
    );
  }
  function NumberInput(props) {
    const { label: label2, hint, error, value, onChange, min, max, step = 1, disabled } = px(props);
    const val = typeof value === "function" ? value() : value;
    const clamp = (v) => {
      if (min !== void 0 && v < min) v = min;
      if (max !== void 0 && v > max) v = max;
      return v;
    };
    const set2 = (v) => {
      if (v === "" || v == null) {
        onChange && onChange("");
        return;
      }
      const n = Number(v);
      if (isNaN(n)) return;
      onChange && onChange(clamp(n));
    };
    return div(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      Row(
        { gap: 1, align: "center" },
        Btn({ size: "sm", onClick: () => set2((val || 0) - step) }, "\u2212"),
        input({ class: cx("input", error && "error"), type: "number", min, max, step, disabled: !!disabled, value: typeof value === "function" ? value : value || "", style: { textAlign: "center", flex: 1 }, on: { input: (e) => set2(e.target.value) } }),
        Btn({ size: "sm", onClick: () => set2((val || 0) + step) }, "+")
      ),
      error ? div({ class: "error-msg" }, error) : hint ? div({ class: "hint" }, hint) : null
    );
  }
  function DatePicker(props) {
    const { label: label2, hint, error, value, onChange, disabled } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      input({ class: cx("input", error && "error"), type: "date", disabled: !!disabled, value: typeof value === "function" ? value : value || "", on: { change: (e) => onChange && onChange(e.target.value) } }),
      error ? div({ class: "error-msg" }, error) : hint ? div({ class: "hint" }, hint) : null
    );
  }
  function TimePicker(props) {
    const { label: label2, hint, error, value, onChange, disabled } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      input({ class: cx("input", error && "error"), type: "time", disabled: !!disabled, value: typeof value === "function" ? value : value || "", on: { change: (e) => onChange && onChange(e.target.value) } }),
      error ? div({ class: "error-msg" }, error) : hint ? div({ class: "hint" }, hint) : null
    );
  }
  function SearchInput(props) {
    const { placeholder = "\u641C\u7D22...", value, onChange, onSearch } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div(
      { style: { position: "relative" } },
      span(
        { style: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--x-text-mute)", pointerEvents: "none", display: "flex" } },
        createElement(
          "svg",
          { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          createElement("circle", { cx: 11, cy: 11, r: 7 }),
          createElement("path", { d: "M21 21l-4.35-4.35" })
        )
      ),
      input({ class: "input", style: { paddingLeft: "36px" }, placeholder, value: typeof value === "function" ? value : value || "", on: { input: (e) => onChange && onChange(e.target.value), keydown: (e) => {
        if (e.key === "Enter" && onSearch) onSearch(val);
      } } })
    );
  }
  function PasswordStrength(props) {
    const { value } = px(props);
    const val = typeof value === "function" ? value : () => value;
    const score = () => {
      const v = val() || "";
      let s = 0;
      if (v.length >= 8) s++;
      if (/[a-z]/.test(v)) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^a-zA-Z0-9]/.test(v)) s++;
      return s;
    };
    const colors = ["", "#e33", "#f80", "#fc0", "#8c4", "#0a7"];
    const labels = ["", "\u5F88\u5F31", "\u5F31", "\u4E2D", "\u5F3A", "\u5F88\u5F3A"];
    return div(
      { style: { marginTop: "6px" } },
      div(
        { style: { height: "4px", background: "var(--x-bg-soft)", borderRadius: "2px", overflow: "hidden" } },
        div({ style: () => ({ width: score() * 20 + "%", height: "100%", background: colors[score()], transition: "all .3s" }) })
      ),
      div({ style: { fontSize: "12px", color: "var(--x-text-mute)", marginTop: "4px" } }, () => labels[score()])
    );
  }
  function Rate(props) {
    const { value, onChange, max = 5, size = 24 } = px(props);
    const val = typeof value === "function" ? value : () => value;
    const hover = signal(0);
    return Row(
      { gap: 0 },
      ...Array.from({ length: max }, (_, i) => {
        const idx = i + 1;
        return span({
          style: () => ({
            fontSize: size + "px",
            cursor: "pointer",
            color: idx <= (hover() || val()) ? "var(--x-warning)" : "var(--x-border-strong)",
            transition: "color .1s",
            lineHeight: "1"
          }),
          on: {
            click: () => onChange && onChange(idx),
            mouseenter: () => hover(idx),
            mouseleave: () => hover(0)
          }
        }, "\u2605");
      })
    );
  }

  // ../../core/src/mobile.js
  function swipe(el2, handlers = {}) {
    let sx = 0, sy = 0, st = 0;
    const { onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50, timeLimit = 800 } = handlers;
    const down = (e) => {
      const t = e.touches ? e.touches[0] : e;
      sx = t.clientX;
      sy = t.clientY;
      st = Date.now();
    };
    const up = (e) => {
      const t = e.changedTouches ? e.changedTouches[0] : e;
      const dx = t.clientX - sx, dy = t.clientY - sy;
      const dt = Date.now() - st;
      if (dt > timeLimit) return;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) onSwipeRight && onSwipeRight(e);
        else onSwipeLeft && onSwipeLeft(e);
        onSwipe && onSwipe(dx > 0 ? "right" : "left", e);
      } else {
        if (dy > 0) onSwipeDown && onSwipeDown(e);
        else onSwipeUp && onSwipeUp(e);
        onSwipe && onSwipe(dy > 0 ? "down" : "up", e);
      }
    };
    el2.addEventListener("touchstart", down, { passive: true });
    el2.addEventListener("touchend", up, { passive: true });
    return () => {
      el2.removeEventListener("touchstart", down);
      el2.removeEventListener("touchend", up);
    };
  }

  // ../../core/src/kit-display.js
  function Alert(props, ...children) {
    const { type = "info", title } = px(props);
    return div(
      { class: cx("alert", "alert-" + type) },
      title ? div({ class: "alert-title" }, title) : null,
      ...children
    );
  }
  function Spinner(props) {
    const { size = 20 } = px(props);
    return div({ style: { display: "inline-block", width: size + "px", height: size + "px", border: "2px solid var(--x-border)", borderTopColor: "var(--x-primary)", borderRadius: "50%", animation: "x-spin .6s linear infinite" } });
  }
  function Empty(props) {
    const { text = "\u6682\u65E0\u6570\u636E", icon } = px(props);
    return div(
      { style: { textAlign: "center", padding: "60px 20px", color: "var(--x-text-mute)" } },
      div(
        { style: { marginBottom: "12px", display: "flex", justifyContent: "center", opacity: 0.4, color: "var(--x-text-mute)" } },
        icon || createElement(
          "svg",
          { width: 64, height: 64, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" },
          createElement("path", { d: "M3 7h18v13H3z" }),
          createElement("path", { d: "M3 7l2-4h14l2 4" }),
          createElement("path", { d: "M3 7l9 6 9-6" })
        )
      ),
      div({ style: { fontSize: "14px" } }, text)
    );
  }
  function Progress(props) {
    const { value = 0, max = 100, size, showText, color } = px(props);
    const val = typeof value === "function" ? value() : value;
    const pct = Math.min(100, Math.max(0, val / max * 100));
    return div(
      { class: "field" },
      Row(
        { gap: 2, align: "center" },
        div(
          { class: cx("progress", size && "progress-" + size), style: { flex: 1 } },
          div({ class: "progress-bar", style: { width: pct + "%", background: color || void 0 } })
        ),
        showText ? Text({ size: "sm", dim: true }, Math.round(pct) + "%") : null
      )
    );
  }
  function Avatar(props) {
    const { src, text, size = "md" } = px(props);
    const cls = cx("avatar", size === "sm" && "avatar-sm", size === "lg" && "avatar-lg");
    if (src) return div({ class: cls }, img({ src }));
    return div({ class: cls }, String(text || "?").slice(0, 1).toUpperCase());
  }
  function Result(props) {
    const { status = "info", title, subTitle, extra } = px(props);
    const icons = { success: "\u2713", error: "\u2715", warning: "!", info: "i" };
    const colors = { success: "var(--x-success)", error: "var(--x-danger)", warning: "var(--x-warning)", info: "var(--x-primary)" };
    return div(
      { style: { textAlign: "center", padding: "40px 20px" } },
      div({ style: { width: "64px", height: "64px", borderRadius: "50%", background: colors[status], color: "var(--x-text-inverse)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "16px" } }, icons[status]),
      div({ style: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" } }, title || ""),
      subTitle ? div({ style: { color: "var(--x-text-dim)", marginBottom: "20px" } }, subTitle) : null,
      extra || null
    );
  }
  function Skeleton(props) {
    const { lines = 3 } = px(props);
    return Col(
      { gap: 2 },
      div({ class: "skeleton skeleton-title" }),
      ...Array.from({ length: lines }, () => div({ class: "skeleton skeleton-text" }))
    );
  }
  function Count(props) {
    const { value = 0, max = 99, type = "danger" } = px(props);
    const val = typeof value === "function" ? value() : value;
    if (val <= 0) return null;
    return span({ class: "badge badge-" + type, style: { marginLeft: "6px" } }, val > max ? max + "+" : String(val));
  }
  function Stat(props) {
    const { label: label2, value, unit, trend, color } = px(props);
    const val = typeof value === "function" ? value() : value;
    return Card(
      null,
      div({ style: { fontSize: "13px", color: "var(--x-text-dim)", marginBottom: "8px" } }, label2),
      Row(
        { gap: 1, align: "center" },
        div({ style: { fontSize: "28px", fontWeight: "700", color: color || "var(--x-text)" } }, val),
        unit ? span({ style: { fontSize: "14px", color: "var(--x-text-dim)" } }, unit) : null,
        trend ? span({ style: { fontSize: "13px", marginLeft: "8px", color: trend > 0 ? "var(--x-success)" : "var(--x-danger)" } }, (trend > 0 ? "\u2191 " : "\u2193 ") + Math.abs(trend) + "%") : null
      )
    );
  }
  function Descriptions(props) {
    const { items = [], columns = 2, bordered = false } = px(props);
    return div(
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(" + columns + ", 1fr)",
          gap: bordered ? "0" : "16px",
          border: bordered ? "1px solid var(--x-border)" : "none",
          borderRadius: bordered ? "var(--x-radius)" : "0",
          overflow: "hidden"
        }
      },
      ...items.map(
        (it) => div(
          {
            style: {
              padding: bordered ? "10px 14px" : "0",
              borderBottom: bordered ? "1px solid var(--x-border)" : "none",
              display: bordered ? "flex" : "block",
              gap: bordered ? "12px" : "0"
            }
          },
          div({ style: { fontSize: "13px", color: "var(--x-text-dim)", minWidth: bordered ? "80px" : "auto", marginBottom: bordered ? "0" : "4px" } }, it.label),
          div({ style: { fontSize: "14px" } }, it.value)
        )
      )
    );
  }
  function ItemCard(props) {
    const { title, desc, avatar, actions, onClick } = px(props);
    return div(
      {
        class: "card",
        style: { display: "flex", gap: "12px", alignItems: "flex-start", cursor: onClick ? "pointer" : "default" },
        on: { click: onClick }
      },
      avatar || null,
      Col(
        { gap: 1, style: { flex: 1 } },
        div({ style: { fontWeight: "600", fontSize: "15px" } }, title),
        desc ? div({ style: { fontSize: "13px", color: "var(--x-text-dim)" } }, desc) : null
      ),
      actions ? Row({ gap: 1 }, ...Array.isArray(actions) ? actions : [actions]) : null
    );
  }
  function QRCode(props) {
    const { text, size = 200 } = px(props);
    const canvasRef = (el2) => {
      if (!el2) return;
      const ctx2 = el2.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      el2.width = size * dpr;
      el2.height = size * dpr;
      el2.style.width = size + "px";
      el2.style.height = size + "px";
      ctx2.scale(dpr, dpr);
      ctx2.fillStyle = "#fff";
      ctx2.fillRect(0, 0, size, size);
      const s = String(typeof text === "function" ? text() : text || "");
      let h = 0;
      for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
      const grid = 21;
      const cell = size / grid;
      ctx2.fillStyle = "#000";
      for (let y = 0; y < grid; y++) {
        for (let x = 0; x < grid; x++) {
          h = h * 1103515245 + 12345 | 0;
          if (h >>> 16 & 1) ctx2.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    };
    return canvas({ ref: canvasRef, style: { display: "block", borderRadius: "8px" } });
  }

  // ../../core/src/kit-nav.js
  function Tabs(props) {
    const { items = [], active, onChange } = px(props);
    const isActive = typeof active === "function" ? active : () => active;
    return div(
      { class: "tabs" },
      ...items.map((it) => button({
        class: () => cx("tab", isActive() === it.key && "active"),
        on: { click: () => onChange && onChange(it.key) }
      }, it.title))
    );
  }
  function Breadcrumb(props) {
    const { items = [], separator = "/" } = px(props);
    const out = [];
    items.forEach((it, i) => {
      out.push(span({ style: { color: i === items.length - 1 ? "var(--x-text)" : "var(--x-text-dim)", cursor: it.onClick ? "pointer" : "default" }, on: { click: it.onClick } }, it.label));
      if (i < items.length - 1) out.push(span({ style: { margin: "0 8px", color: "var(--x-text-mute)" } }, separator));
    });
    return Row({ gap: 0, align: "center" }, ...out);
  }
  function Pagination(props) {
    const { page, total, pageSize = 20, onChange } = px(props);
    const cur = typeof page === "function" ? page() : page;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const jump = (p2) => {
      if (p2 >= 1 && p2 <= pages && onChange) onChange(p2);
    };
    const nums = () => {
      if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
      const out = [1];
      if (cur > 3) out.push("...");
      for (let i = Math.max(2, cur - 1); i <= Math.min(pages - 1, cur + 1); i++) out.push(i);
      if (cur < pages - 2) out.push("...");
      out.push(pages);
      return out;
    };
    const isMob = typeof window !== "undefined" && window.innerWidth < 768;
    return Row(
      { gap: 1, align: "center", class: isMob ? "pagination pagination-mobile" : "pagination" },
      Btn({ size: "sm", disabled: cur <= 1, onClick: () => jump(cur - 1) }, "\u2039"),
      ...nums().map(
        (p2) => typeof p2 === "number" ? Btn({ size: "sm", type: cur === p2 ? "primary" : "default", onClick: () => jump(p2) }, String(p2)) : span({ style: { padding: "0 4px", color: "var(--x-text-mute)" } }, "...")
      ),
      Btn({ size: "sm", disabled: cur >= pages, onClick: () => jump(cur + 1) }, "\u203A")
    );
  }
  function Steps(props) {
    const { steps = [], current = 0 } = px(props);
    return Row(
      { gap: 3, align: "center" },
      ...steps.map(
        (s, i) => Row(
          { gap: 2, align: "center" },
          div({ style: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", background: i < current ? "var(--x-success)" : i === current ? "var(--x-primary)" : "var(--x-bg-soft)", color: i <= current ? "var(--x-text-inverse)" : "var(--x-text-mute)" } }, i < current ? "\u2713" : String(i + 1)),
          span({ style: { fontSize: "14px", color: i <= current ? "var(--x-text)" : "var(--x-text-mute)", fontWeight: i === current ? "600" : "400" } }, s.label || s),
          i < steps.length - 1 ? div({ style: { width: "40px", height: "1px", background: "var(--x-border)" } }) : null
        )
      )
    );
  }
  function Accordion(props) {
    const { items = [], defaultOpen = 0 } = px(props);
    const openIdx = signal(defaultOpen);
    return Col(
      { gap: 0 },
      ...items.map(
        (it, i) => div(
          { style: { border: "1px solid var(--x-border)", borderRadius: "var(--x-radius)", marginBottom: "8px", overflow: "hidden" } },
          div(
            { style: { padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: openIdx() === i ? "var(--x-bg-soft)" : "transparent", fontWeight: "500" }, on: { click: () => openIdx(openIdx() === i ? -1 : i) } },
            span(null, it.title),
            span({ style: { transition: "transform .2s", transform: openIdx() === i ? "rotate(90deg)" : "none", color: "var(--x-text-mute)" } }, "\u203A")
          ),
          div({ style: { padding: "12px 16px", borderTop: "1px solid var(--x-border)", display: openIdx() === i ? "block" : "none" } }, it.content)
        )
      )
    );
  }

  // ../../core/src/kit-data.js
  function Table(props) {
    const { columns = [], data = [], keyFn, empty, wrap: wrap2 = true } = px(props);
    const tbl = table(
      { class: "table" },
      thead(
        null,
        tr(
          null,
          ...columns.map((c) => th({ style: c.width ? { width: c.width } : {} }, c.title))
        )
      ),
      tbody(
        null,
        ...data.length === 0 ? [tr(
          null,
          td({ colspan: columns.length, style: { textAlign: "center", color: "#999", padding: "32px" } }, empty || "\u6682\u65E0\u6570\u636E")
        )] : data.map((row, i) => tr(
          null,
          ...columns.map((c) => td(null, c.render ? c.render(row) : row[c.key]))
        ))
      )
    );
    return wrap2 ? div({ class: "table-wrap" }, tbl) : tbl;
  }
  function List(props) {
    const { items = [], keyFn, hover, render: render2 } = px(props);
    return ul(
      { class: cx("list", hover && "list-hover") },
      ...items.map((item, i) => li({ class: "list-item", key: keyFn ? keyFn(item) : i }, render2(item, i)))
    );
  }
  function Timeline(props) {
    const { items = [] } = px(props);
    return Col(
      { gap: 0 },
      ...items.map(
        (it, i) => Row(
          { gap: 3, align: "start" },
          Col(
            { gap: 0, align: "center" },
            div({ style: { width: "10px", height: "10px", borderRadius: "50%", background: it.color || "var(--x-primary)", marginTop: "6px" } }),
            i < items.length - 1 ? div({ style: { width: "2px", flex: 1, minHeight: "30px", background: "var(--x-border)", marginTop: "4px" } }) : null
          ),
          Col(
            { gap: 1 },
            div({ style: { fontSize: "12px", color: "var(--x-text-mute)" } }, it.time || ""),
            div({ style: { fontWeight: "500" } }, it.title || ""),
            it.desc ? div({ style: { fontSize: "13px", color: "var(--x-text-dim)" } }, it.desc) : null
          )
        )
      )
    );
  }
  function Tree(props) {
    const { data = [], render: render2, defaultExpandAll = true } = px(props);
    const collectKeys = (nodes, out = {}) => {
      for (const n of nodes) {
        const k = n.key != null ? n.key : n.label;
        if (n.children && n.children.length) {
          out[k] = defaultExpandAll;
          collectKeys(n.children, out);
        }
      }
      return out;
    };
    const openMap = signal(collectKeys(data));
    const toggle = (k) => openMap({ ...openMap(), [k]: !openMap()[k] });
    const Node2 = (node, depth) => {
      const k = node.key != null ? node.key : node.label;
      const hasChildren = node.children && node.children.length > 0;
      return div(
        null,
        div(
          { style: { padding: "6px 8px", paddingLeft: 8 + depth * 16 + "px", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }, on: { click: () => hasChildren ? toggle(k) : node.onClick && node.onClick() } },
          hasChildren ? span({ style: () => ({ transition: "transform .15s", display: "inline-block", transform: openMap()[k] ? "rotate(90deg)" : "none", color: "var(--x-text-mute)", fontSize: "12px" }) }, "\u203A") : span({ style: { width: "12px" } }),
          span(null, render2 ? render2(node) : node.label)
        ),
        hasChildren && openMap()[k] ? div(null, ...node.children.map((c) => Node2(c, depth + 1))) : null
      );
    };
    return Col({ gap: 0 }, ...data.map((n) => Node2(n, 0)));
  }
  if (typeof document !== "undefined" && !document.getElementById("x-kit-style")) {
    const s = document.createElement("style");
    s.id = "x-kit-style";
    s.textContent = "@keyframes x-spin { to { transform: rotate(360deg) } }";
    document.head.appendChild(s);
  }
  function TreeSelect(props) {
    const { data = [], value, onChange, placeholder = "\u8BF7\u9009\u62E9" } = px(props);
    const open = signal(false);
    const selected = typeof value === "function" ? value : () => value;
    const label2 = signal("");
    const findLabel = (nodes, val) => {
      for (const n of nodes) {
        if (n.value === val) return n.label;
        if (n.children) {
          const r = findLabel(n.children, val);
          if (r) return r;
        }
      }
      return "";
    };
    const Node2 = (node, depth) => {
      const hasChildren = node.children && node.children.length > 0;
      const isOpen = signal(true);
      return div(
        null,
        div(
          {
            style: { padding: "8px 12px", paddingLeft: 12 + depth * 16 + "px", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" },
            on: {
              click: () => {
                if (hasChildren) isOpen(!isOpen());
                else {
                  onChange && onChange(node.value);
                  label2(node.label);
                  open(false);
                }
              },
              mouseenter: (e) => e.currentTarget.style.background = "var(--x-bg-soft)",
              mouseleave: (e) => e.currentTarget.style.background = "transparent"
            }
          },
          hasChildren ? span({ style: { fontSize: "11px", color: "var(--x-text-mute)", display: "inline-block", transform: isOpen() ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A") : span({ style: { width: "11px" } }),
          span(null, node.label)
        ),
        hasChildren && isOpen() ? div(null, ...node.children.map((c) => Node2(c, depth + 1))) : null
      );
    };
    if (!label2() && selected()) label2(findLabel(data, selected()));
    return div(
      { style: { position: "relative" } },
      div(
        {
          class: "input",
          style: { cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" },
          on: { click: () => open(!open()) }
        },
        span({ style: { color: label2() ? "var(--x-text)" : "var(--x-text-mute)" } }, () => label2() || placeholder),
        span({ style: { color: "var(--x-text-mute)", fontSize: "12px" } }, "\u25BE")
      ),
      show(
        open,
        () => div({
          style: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--x-bg-elev)", border: "1px solid var(--x-border)", borderRadius: "var(--x-radius)", boxShadow: "var(--x-shadow-md)", maxHeight: "300px", overflowY: "auto", padding: "4px", zIndex: 100 }
        }, ...data.map((n) => Node2(n, 0)))
      )
    );
  }
  function Calendar(props) {
    const { value, onChange, month: initMonth } = px(props);
    const today = /* @__PURE__ */ new Date();
    const year = signal((initMonth ? new Date(initMonth) : today).getFullYear());
    const month = signal((initMonth ? new Date(initMonth) : today).getMonth());
    const selected = typeof value === "function" ? value : () => value;
    const days = () => {
      const y = year(), m = month();
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const out = [];
      for (let i = 0; i < firstDay; i++) out.push(null);
      for (let i = 1; i <= daysInMonth; i++) out.push(i);
      return out;
    };
    const fmt = (d) => {
      const y = year(), m = String(month() + 1).padStart(2, "0"), dd = String(d).padStart(2, "0");
      return y + "-" + m + "-" + dd;
    };
    const prev = () => {
      if (month() === 0) {
        month(11);
        year(year() - 1);
      } else month(month() - 1);
    };
    const next = () => {
      if (month() === 11) {
        month(0);
        year(year() + 1);
      } else month(month() + 1);
    };
    return div(
      {
        class: "card",
        style: { maxWidth: "340px" },
        ref: (el2) => {
          if (!el2) return;
          const cleanup = swipe(el2, {
            onSwipeLeft: () => next(),
            onSwipeRight: () => prev()
          });
          const sc = runtime.currentScope;
          if (sc) {
            if (!sc.unmountFns) sc.unmountFns = [];
            sc.unmountFns.push(cleanup);
          }
        }
      },
      Row(
        { gap: 2, align: "center", justify: "between" },
        Btn({ size: "sm", onClick: prev }, "\u2039"),
        div({ style: { fontWeight: "600" } }, () => year() + " \u5E74 " + (month() + 1) + " \u6708"),
        Btn({ size: "sm", onClick: next }, "\u203A")
      ),
      Space({ size: 12 }),
      div(
        { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" } },
        ...["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"].map(
          (d) => div({ style: { textAlign: "center", fontSize: "12px", color: "var(--x-text-mute)", padding: "4px" } }, d)
        ),
        ...days().map((d) => {
          if (d === null) return div();
          const dateStr = fmt(d);
          const isSelected = selected() === dateStr;
          const isToday = dateStr === today.toISOString().slice(0, 10);
          return div({
            style: () => ({
              textAlign: "center",
              padding: "8px 0",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              background: isSelected ? "var(--x-primary)" : isToday ? "var(--x-primary-soft)" : "transparent",
              color: isSelected ? "var(--x-text-inverse)" : isToday ? "var(--x-primary)" : "var(--x-text)",
              fontWeight: isSelected || isToday ? "600" : "400",
              transition: "all .1s"
            }),
            on: {
              click: () => onChange && onChange(dateStr),
              mouseenter: (e) => {
                if (!isSelected) e.currentTarget.style.background = "var(--x-bg-soft)";
              },
              mouseleave: (e) => {
                if (!isSelected && !isToday) e.currentTarget.style.background = "transparent";
              }
            }
          }, String(d));
        })
      )
    );
  }
  function SplitPane(props) {
    const { left, right, direction = "horizontal", initial = 50 } = px(props);
    const size = signal(initial);
    const dragging = signal(false);
    const onMouseDown = (ev) => {
      if (ev && ev.touches) ev.preventDefault();
      dragging(true);
      const move = (e) => {
        if (!dragging()) return;
        const container2 = e.currentTarget.parentElement;
        if (!container2) return;
        const rect = container2.getBoundingClientRect();
        const pct = direction === "horizontal" ? (e.clientX - rect.left) / rect.width * 100 : (e.clientY - rect.top) / rect.height * 100;
        size(Math.max(10, Math.min(90, pct)));
      };
      const up = () => {
        dragging(false);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };
    const isH = direction === "horizontal";
    return div(
      {
        style: { display: "flex", flexDirection: isH ? "row" : "column", height: "100%", gap: "4px" }
      },
      div({ style: () => isH ? { width: size() + "%", overflow: "auto" } : { height: size() + "%", overflow: "auto" } }, left),
      div({
        style: () => ({
          flex: "0 0 6px",
          background: dragging() ? "var(--x-primary)" : "var(--x-border)",
          cursor: isH ? "col-resize" : "row-resize",
          borderRadius: "3px",
          transition: "background .15s"
        }),
        on: { mousedown: onMouseDown, touchstart: onMouseDown }
      }),
      div({ style: { flex: 1, overflow: "auto" } }, right)
    );
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

  // ../../core/src/kit-layout.js
  function Layout(props, ...children) {
    const { direction = "column", style = {} } = px(props);
    return div({
      style: {
        display: "flex",
        flexDirection: direction,
        minHeight: "100vh",
        ...style
      }
    }, ...children);
  }
  function Grid(props, ...children) {
    const { cols = 12, gap = 16, style = {} } = px(props);
    return div({
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: gap + "px",
        ...style
      }
    }, ...children);
  }
  function Flex(props, ...children) {
    const { direction = "row", align, justify, wrap: wrap2, gap, style = {} } = px(props);
    return div({
      style: {
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap2 ? "wrap" : "nowrap",
        gap: gap !== void 0 ? gap + "px" : void 0,
        ...style
      }
    }, ...children);
  }
  function Affix(props, ...children) {
    const { top = 0, bottom } = px(props);
    const stuck = signal(false);
    effect(() => {
      const onScroll = () => {
        if (bottom !== void 0) {
          stuck(window.innerHeight - (bottom || 0) - document.documentElement.scrollTop < 0);
        } else {
          stuck(window.scrollY >= top);
        }
      };
      window.addEventListener("scroll", onScroll);
      onScroll();
      onCleanup(() => window.removeEventListener("scroll", onScroll));
    });
    return div({
      style: () => stuck() ? { position: "fixed", top: bottom !== void 0 ? "auto" : top + "px", bottom: bottom !== void 0 ? bottom + "px" : "auto", zIndex: 100 } : {}
    }, ...children);
  }

  // ../../core/src/kit-nav2.js
  function Menu(props) {
    const { items = [], mode = "vertical", selected, onSelect } = px(props);
    const sel = () => typeof selected === "function" ? selected() : selected;
    const renderItem = (it, depth = 0) => div({
      style: {
        padding: "10px 16px",
        paddingLeft: 16 + depth * 16 + "px",
        cursor: "pointer",
        borderRadius: "6px",
        fontSize: "14px",
        background: sel() === it.key ? "var(--x-primary-soft)" : "transparent",
        color: sel() === it.key ? "var(--x-primary)" : "var(--x-text)",
        fontWeight: sel() === it.key ? "600" : "400"
      },
      on: {
        click: () => onSelect && onSelect(it.key),
        mouseenter: (e) => {
          if (sel() !== it.key) e.currentTarget.style.background = "var(--x-bg-hover)";
        },
        mouseleave: (e) => {
          if (sel() !== it.key) e.currentTarget.style.background = "transparent";
        }
      }
    }, it.icon ? span({ style: { marginRight: "8px" } }, it.icon) : null, it.label);
    return div({
      style: { display: "flex", flexDirection: mode === "horizontal" ? "row" : "column", gap: "2px" }
    }, ...items.map((it) => renderItem(it)));
  }
  function Anchor(props) {
    const { items = [], offsetTop = 0 } = px(props);
    const active = signal(items[0]?.href || "");
    effect(() => {
      const onScroll = () => {
        let cur = items[0]?.href;
        for (const it of items) {
          let el2 = null;
          try {
            el2 = document.querySelector(it.href);
          } catch (e) {
            el2 = null;
          }
          if (el2 && el2.getBoundingClientRect().top <= offsetTop + 10) cur = it.href;
        }
        active(cur);
      };
      window.addEventListener("scroll", onScroll);
      onScroll();
      onCleanup(() => window.removeEventListener("scroll", onScroll));
    });
    return div(
      { style: { display: "flex", flexDirection: "column", gap: "4px" } },
      ...items.map((it) => a({
        href: it.href,
        style: () => ({
          padding: "6px 12px",
          fontSize: "13px",
          textDecoration: "none",
          color: active() === it.href ? "var(--x-primary)" : "var(--x-text-dim)",
          borderLeft: "2px solid " + (active() === it.href ? "var(--x-primary)" : "transparent"),
          fontWeight: active() === it.href ? "600" : "400"
        })
      }, it.label))
    );
  }
  function Collapse(props, ...children) {
    const { items = [] } = px(props);
    const openIdx = signal(-1);
    return div(
      { style: { display: "flex", flexDirection: "column", gap: "8px" } },
      ...items.map((it, i) => div(
        {
          style: { border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }
        },
        div(
          {
            style: {
              padding: "12px 16px",
              cursor: "pointer",
              fontWeight: "500",
              background: openIdx() === i ? "var(--x-bg-soft)" : "var(--x-text-inverse)",
              display: "flex",
              justifyContent: "space-between"
            },
            on: { click: () => openIdx(openIdx() === i ? -1 : i) }
          },
          span(null, it.title),
          span({ style: { transition: "transform .2s", transform: openIdx() === i ? "rotate(90deg)" : "none" } }, "\u203A")
        ),
        show(() => openIdx() === i, () => div({
          style: { padding: "12px 16px", borderTop: "1px solid #e5e7eb", fontSize: "13px" }
        }, it.content))
      ))
    );
  }

  // ../../core/src/kit-form2.js
  function ColorPicker(props) {
    const { value, onChange, showText = true } = px(props);
    const val = () => typeof value === "function" ? value() : value;
    return Row(
      { gap: 2, align: "center" },
      input({
        type: "color",
        value: val() || "#000000",
        style: { width: "40px", height: "32px", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer", padding: 0 },
        on: { input: (e) => onChange && onChange(e.target.value) }
      }),
      showText ? span({ style: { fontSize: "12px", fontFamily: "monospace", color: "var(--x-text-dim)" } }, () => val() || "#000000") : null
    );
  }
  function Slider(props) {
    const { value, onChange, min = 0, max = 100, step = 1, disabled } = px(props);
    const val = () => typeof value === "function" ? value() : value || 0;
    return input({
      type: "range",
      min,
      max,
      step,
      disabled: !!disabled,
      value: val(),
      style: { width: "100%", cursor: disabled ? "not-allowed" : "pointer" },
      on: { input: (e) => onChange && onChange(Number(e.target.value)) }
    });
  }
  function Mentions(props) {
    const { value, onChange, options = [], placeholder } = px(props);
    const val = () => typeof value === "function" ? value() : value || "";
    const filtered = signal([]);
    const showList = signal(false);
    return div(
      { style: { position: "relative" } },
      textarea({
        class: "input",
        rows: 3,
        placeholder: placeholder || "\u8F93\u5165 @ \u63D0\u53CA\u4ED6\u4EBA",
        value: val(),
        on: {
          input: (e) => {
            const v = e.target.value;
            onChange && onChange(v);
            const m = v.match(/@(\w*)$/);
            if (m) {
              const k = m[1].toLowerCase();
              const list2 = options.filter((o) => o.toLowerCase().includes(k));
              filtered(list2);
              showList(list2.length > 0);
            } else {
              showList(false);
            }
          }
        }
      }),
      show(showList, () => div(
        {
          style: {
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--x-text-inverse)",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,.1)",
            marginTop: "4px",
            maxHeight: "150px",
            overflow: "auto"
          }
        },
        ...filtered().map((o) => div({
          style: { padding: "8px 12px", cursor: "pointer", fontSize: "13px" },
          on: {
            click: () => {
              const v = val().replace(/@(\w*)$/, "@" + o + " ");
              onChange && onChange(v);
              showList(false);
            },
            mouseenter: (e) => e.currentTarget.style.background = "var(--x-bg-hover)",
            mouseleave: (e) => e.currentTarget.style.background = "transparent"
          }
        }, o))
      ))
    );
  }
  function Transfer(props) {
    const { data = [], value = [], onChange, titles = ["\u6E90\u5217\u8868", "\u5DF2\u9009"] } = px(props);
    const left = signal(data.filter((d) => !value.includes(d.key)));
    const right = signal(data.filter((d) => value.includes(d.key)));
    const selL = signal([]);
    const selR = signal([]);
    const Item = (it, side) => div({
      style: {
        padding: "6px 10px",
        fontSize: "13px",
        cursor: "pointer",
        borderRadius: "4px",
        background: (side === "L" ? selL() : selR()).includes(it.key) ? "var(--x-primary-soft)" : "transparent"
      },
      on: { click: () => {
        const s = side === "L" ? selL : selR;
        const arr = s();
        s(arr.includes(it.key) ? arr.filter((k) => k !== it.key) : [...arr, it.key]);
      } }
    }, it.label);
    const move = (from, to) => {
      const s = from === "L" ? selL : selR;
      const keys = s();
      if (!keys.length) return;
      const fromArr = from === "L" ? left() : right();
      const toArr = from === "L" ? right() : left();
      const moving = fromArr.filter((d) => keys.includes(d.key));
      const newFrom = fromArr.filter((d) => !keys.includes(d.key));
      from === "L" ? (left(newFrom), right([...toArr, ...moving])) : (right(newFrom), left([...toArr, ...moving]));
      s([]);
      onChange && onChange((from === "L" ? right() : left()).map((d) => d.key));
    };
    const Box = (title, arr, side) => div(
      {
        style: { flex: 1, border: "1px solid #e5e7eb", borderRadius: "8px", display: "flex", flexDirection: "column" }
      },
      div({ style: { padding: "8px 12px", background: "var(--x-bg-soft)", borderBottom: "1px solid #e5e7eb", fontSize: "12px", fontWeight: "600" } }, title),
      div(
        { style: { flex: 1, padding: "8px", maxHeight: "240px", overflow: "auto" } },
        ...arr().map((it) => Item(it, side))
      )
    );
    return Row(
      { gap: 2, align: "center" },
      Box(titles[0], left, "L"),
      Col(
        { gap: 1 },
        Btn({ size: "sm", onClick: () => move("L", "R") }, "\u2192"),
        Btn({ size: "sm", onClick: () => move("R", "L") }, "\u2190")
      ),
      Box(titles[1], right, "R")
    );
  }
  function Cascader(props) {
    const { options = [], value, onChange, placeholder = "\u8BF7\u9009\u62E9" } = px(props);
    const val = () => typeof value === "function" ? value() : value;
    const open = signal(false);
    const path = signal([]);
    const cur = () => {
      let arr = options;
      const res = [];
      for (const k of path()) {
        const found = arr.find((o) => o.value === k);
        if (!found) break;
        res.push(found);
        arr = found.children || [];
      }
      return { list: arr, chosen: res };
    };
    return div(
      { style: { position: "relative" } },
      div(
        {
          class: "input",
          style: { cursor: "pointer", display: "flex", justifyContent: "space-between" },
          on: { click: () => open(!open()) }
        },
        span({ style: { color: val() ? "var(--x-text)" : "var(--x-text-mute)" } }, () => val() ? val().join(" / ") : placeholder),
        span({ style: { color: "var(--x-text-mute)", fontSize: "12px" } }, "\u25BE")
      ),
      show(open, () => div(
        {
          style: {
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 100,
            marginTop: "4px",
            background: "var(--x-text-inverse)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,.1)",
            display: "flex",
            minWidth: "240px"
          }
        },
        div(
          { style: { minWidth: "120px", borderRight: "1px solid #f3f4f6", padding: "4px" } },
          ...cur().chosen.map((c, i) => div({
            style: { padding: "6px 10px", fontSize: "13px", cursor: "pointer" },
            on: { click: () => path(path().slice(0, i)) }
          }, c.label))
        ),
        div(
          { style: { minWidth: "120px", padding: "4px" } },
          ...cur().list.map((o) => div({
            style: { padding: "6px 10px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between" },
            on: {
              click: () => {
                if (o.children) path([...path(), o.value]);
                else {
                  onChange && onChange([...path(), o.value], o);
                  open(false);
                }
              },
              mouseenter: (e) => e.currentTarget.style.background = "var(--x-bg-hover)",
              mouseleave: (e) => e.currentTarget.style.background = "transparent"
            }
          }, o.label, o.children ? span({ style: { color: "var(--x-text-mute)" } }, "\u203A") : null))
        )
      ))
    );
  }

  // ../../core/src/kit-display2.js
  function Typography(props, ...children) {
    const { variant = "body", bold, italic, underline, delete: del, code: isCode, color, size } = px(props);
    const Tag2 = { h1: "h1", h2: "h2", h3: "h3", h4: "h4", body: "p", caption: "span" }[variant] || "p";
    const sizes = { h1: "28px", h2: "22px", h3: "18px", h4: "16px", body: "14px", caption: "12px" };
    const style = {
      fontWeight: bold ? "700" : void 0,
      fontStyle: italic ? "italic" : void 0,
      textDecoration: (underline ? "underline " : "") + (del ? "line-through" : ""),
      color,
      fontSize: size || sizes[variant]
    };
    if (isCode) return code({ style: { ...style, background: "var(--x-bg-hover)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" } }, ...children);
    return createElement(Tag2, { style }, ...children);
  }
  function Comment(props, ...children) {
    const { author, avatar, time, actions = [] } = px(props);
    return div(
      { style: { display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f3f4f6" } },
      avatar ? img({ src: avatar, style: { width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 } }) : div({ style: { width: "40px", height: "40px", borderRadius: "50%", background: "var(--x-primary)", color: "var(--x-text-inverse)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "600" } }, String(author || "?")[0]),
      div(
        { style: { flex: 1, minWidth: 0 } },
        Row(
          { gap: 2, align: "center" },
          span({ style: { fontWeight: "600", fontSize: "14px" } }, author || ""),
          time ? span({ style: { fontSize: "12px", color: "var(--x-text-mute)" } }, time) : null
        ),
        div({ style: { marginTop: "4px", fontSize: "14px", color: "var(--x-text)" } }, ...children),
        actions.length ? Row(
          { gap: 2, style: { marginTop: "8px" } },
          ...actions.map((a2) => span({ style: { fontSize: "12px", color: "var(--x-text-dim)", cursor: "pointer" } }, a2))
        ) : null
      )
    );
  }
  function Watermark(props, ...children) {
    const { text = "XuNay", opacity = 0.1, rotate = -22, gap = 100, fontSize = 16 } = px(props);
    return div({
      style: {
        position: "relative",
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${gap}' height='${gap}'><text x='50%' y='50%' transform='rotate(${rotate} 50 50)' font-size='${fontSize}' fill='#000' opacity='${opacity}' text-anchor='middle'>${text}</text></svg>`)}")`,
        backgroundRepeat: "repeat"
      }
    }, ...children);
  }
  function Ribbon(props, ...children) {
    const { text, color = "var(--x-primary)", position = "end" } = px(props);
    return div(
      { style: { position: "relative" } },
      ...children,
      div({
        style: {
          position: "absolute",
          top: 0,
          [position === "start" ? "left" : "right"]: 0,
          background: color,
          color: "var(--x-text-inverse)",
          padding: "4px 12px",
          fontSize: "12px",
          fontWeight: "600",
          borderRadius: position === "start" ? "0 0 6px 0" : "0 0 0 6px"
        }
      }, text)
    );
  }
  function Code(props) {
    const { children, language, copyable = true } = px(props);
    const copied = signal(false);
    const doCopy = () => {
      const t = typeof children === "string" ? children : String(children || "");
      navigator.clipboard ? navigator.clipboard.writeText(t) : 0;
      copied(true);
      setTimeout(() => copied(false), 1200);
    };
    return div(
      { style: { position: "relative", background: "#0d1117", color: "#e6edf3", borderRadius: "8px", padding: "14px 16px", fontFamily: "ui-monospace,monospace", fontSize: "13px", lineHeight: 1.6, overflow: "auto" } },
      copyable ? button({
        style: { position: "absolute", top: "8px", right: "8px", background: "rgba(255,255,255,.1)", color: "#e6edf3", border: 0, padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" },
        on: { click: doCopy }
      }, () => copied() ? "\u5DF2\u590D\u5236" : "\u590D\u5236") : null,
      pre({ style: { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" } }, children)
    );
  }
  function Keyboard(props, ...children) {
    return span({
      style: {
        display: "inline-block",
        padding: "2px 8px",
        background: "var(--x-bg-hover)",
        border: "1px solid #d1d5db",
        borderBottom: "2px solid #d1d5db",
        borderRadius: "4px",
        fontFamily: "ui-monospace,monospace",
        fontSize: "12px",
        fontWeight: "600",
        color: "var(--x-text)",
        margin: "0 2px"
      }
    }, ...children);
  }
  function Highlight(props, ...children) {
    const { text = "", keyword = "", color = "#fef08a" } = px(props);
    const parts = String(text).split(new RegExp(`(${keyword})`, "gi"));
    return span(null, ...parts.map(
      (p2) => p2.toLowerCase() === keyword.toLowerCase() ? span({ style: { background: color, padding: "0 2px", borderRadius: "2px" } }, p2) : p2
    ));
  }
  function Ellipsis(props, ...children) {
    const { lines = 1, tooltip = true } = px(props);
    const hoverSignal = signal(false);
    const setHover = (v) => hoverSignal(v);
    return span({
      style: lines === 1 ? { display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" },
      on: { mouseenter: () => setHover(true), mouseleave: () => setHover(false) },
      title: tooltip ? void 0 : void 0
    }, ...children);
  }

  // ../../core/src/kit-data2.js
  function Carousel(props, ...children) {
    const { auto = false, interval = 3e3, height = "300px" } = px(props);
    const items = Array.isArray(children[0]) ? children[0] : children;
    const idx = signal(0);
    effect(() => {
      if (!auto) return;
      const t = setInterval(() => idx((idx() + 1) % items.length), interval);
      onCleanup(() => clearInterval(t));
    });
    return div(
      {
        style: { position: "relative", overflow: "hidden", height, borderRadius: "8px" },
        ref: (el2) => {
          if (!el2 || el2.__xSwipeBound || typeof swipe !== "function") return;
          el2.__xSwipeBound = true;
          const cleanup = swipe(el2, {
            onSwipeLeft: () => idx((idx() + 1) % items.length),
            onSwipeRight: () => idx((idx() - 1 + items.length) % items.length)
          });
          const sc = runtime.currentScope;
          if (sc) {
            if (!sc.unmountFns) sc.unmountFns = [];
            sc.unmountFns.push(cleanup);
          }
        }
      },
      div({
        style: () => ({ display: "flex", transition: "transform .4s", transform: `translateX(-${idx() * 100}%)`, height: "100%" })
      }, ...items.map((c) => div({ style: { minWidth: "100%", height: "100%" } }, c))),
      div(
        { style: { position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" } },
        ...items.map((_, i) => span({
          style: () => ({
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            cursor: "pointer",
            background: idx() === i ? "var(--x-text-inverse)" : "rgba(255,255,255,.5)"
          }),
          on: { click: () => idx(i) }
        }))
      ),
      button({
        style: { position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.4)", color: "var(--x-text-inverse)", border: 0, width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer" },
        on: { click: () => idx((idx() - 1 + items.length) % items.length) }
      }, "\u2039"),
      button({
        style: { position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.4)", color: "var(--x-text-inverse)", border: 0, width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer" },
        on: { click: () => idx((idx() + 1) % items.length) }
      }, "\u203A")
    );
  }
  function Image(props) {
    const { src, alt = "", fallback, preview = true, width, height } = px(props);
    const err2 = signal(false);
    const showPreview = signal(false);
    return span(
      { style: { display: "inline-block", position: "relative" } },
      err2() && fallback ? fallback : img({
        src,
        alt,
        width,
        height,
        style: { display: "block", maxWidth: "100%", cursor: preview ? "zoom-in" : "default" },
        on: {
          error: () => err2(true),
          click: () => preview && showPreview(true)
        }
      }),
      show(showPreview, () => div({
        style: { position: "fixed", inset: 0, zIndex: 5e3, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" },
        on: { click: () => showPreview(false) }
      }, img({ src, style: { maxWidth: "90vw", maxHeight: "90vh" } })))
    );
  }
  function VirtualTable(props) {
    const { columns = [], data = [], rowHeight = 40, height = 400 } = px(props);
    const scrollTop = signal(0);
    const overscan = 5;
    const start = () => Math.max(0, Math.floor(scrollTop() / rowHeight) - overscan);
    const end = () => Math.min(data.length, Math.ceil((scrollTop() + height) / rowHeight) + overscan);
    const visible = () => data.slice(start(), end());
    const offset = () => start() * rowHeight;
    return div(
      {
        style: { height: height + "px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" },
        // V012 修复：rAF 节流，避免每次 scroll 都重渲染
        on: { scroll: (e) => {
          const el2 = e.target;
          if (el2.__scrollRaf) return;
          const top = el2.scrollTop;
          el2.__scrollRaf = requestAnimationFrame(() => {
            el2.__scrollRaf = 0;
            scrollTop(top);
          });
        } }
      },
      div(
        { style: { display: "flex", background: "var(--x-bg-soft)", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 1 } },
        ...columns.map((c) => div({ style: { flex: 1, padding: "10px 12px", fontWeight: "600", fontSize: "13px" } }, c.title))
      ),
      div(
        { style: { height: data.length * rowHeight + "px", position: "relative" } },
        div(
          { style: { transform: `translateY(${offset()}px)` } },
          ...visible().map(
            (row) => div({
              style: { display: "flex", height: rowHeight + "px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }
            }, ...columns.map((c) => div({ style: { flex: 1, padding: "0 12px", fontSize: "13px" } }, c.render ? c.render(row) : String(row[c.key] || ""))))
          )
        )
      )
    );
  }
  function Kanban(props) {
    const { columns = [], items = [], onMove } = px(props);
    const [drag, setDrag] = [signal(null), (v) => drag(v)];
    return div(
      { style: { display: "flex", gap: "12px", overflowX: "auto", padding: "4px" } },
      ...columns.map((col) => div(
        {
          style: { minWidth: "260px", background: "var(--x-bg-soft)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" },
          on: {
            dragover: (e) => e.preventDefault(),
            drop: (e) => {
              e.preventDefault();
              const id = drag();
              if (id != null && onMove) onMove(id, col.key);
              setDrag(null);
            }
          }
        },
        div(
          { style: { fontWeight: "600", fontSize: "14px", marginBottom: "4px", display: "flex", justifyContent: "space-between" } },
          span(null, col.title),
          span({ style: { color: "var(--x-text-mute)", fontSize: "12px" } }, String(items.filter((i) => i.status === col.key).length))
        ),
        ...items.filter((i) => i.status === col.key).map(
          (item) => div({
            draggable: true,
            style: { background: "var(--x-text-inverse)", padding: "10px 12px", borderRadius: "6px", cursor: "grab", boxShadow: "0 1px 3px rgba(0,0,0,.06)", fontSize: "13px" },
            on: {
              dragstart: () => setDrag(item.id),
              dragend: () => setDrag(null)
            }
          }, item.title)
        )
      ))
    );
  }
  function Gantt(props) {
    const { tasks = [], startDate, days = 30 } = px(props);
    const start = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
    const cellW = 40;
    const dayDiff = (d) => Math.floor((new Date(d) - start) / 864e5);
    return div(
      { style: { overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" } },
      div(
        { style: { display: "flex", borderBottom: "1px solid #e5e7eb", background: "var(--x-bg-soft)", minWidth: days * cellW + "px" } },
        ...Array.from({ length: days }, (_, i) => div({ style: { width: cellW + "px", padding: "8px 0", textAlign: "center", fontSize: "11px", color: "var(--x-text-dim)", borderRight: "1px solid #f3f4f6" } }, String(i + 1)))
      ),
      ...tasks.map((t) => div(
        { style: { display: "flex", borderBottom: "1px solid #f3f4f6", minWidth: days * cellW + "px", position: "relative" } },
        div({
          style: {
            position: "absolute",
            top: "8px",
            height: "24px",
            left: dayDiff(t.start) * cellW + "px",
            width: (dayDiff(t.end) - dayDiff(t.start) + 1) * cellW - 8 + "px",
            background: t.color || "var(--x-primary)",
            borderRadius: "4px",
            color: "var(--x-text-inverse)",
            fontSize: "12px",
            padding: "0 8px",
            lineHeight: "24px",
            whiteSpace: "nowrap",
            overflow: "hidden"
          }
        }, t.title)
      ))
    );
  }

  // ../../core/src/kit-svg.js
  var S = (tag2, props, ...children) => createElement(tag2, props, ...children);
  var _uid = 0;
  var uid = (p2 = "x") => p2 + "-" + (++_uid).toString(36) + Math.random().toString(36).slice(2, 6);
  var PALETTE = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#22c55e",
    "#06b6d4",
    "#eab308",
    "#ef4444"
  ];
  var pickColor = (i, custom) => custom && custom[i % custom.length] || PALETTE[i % PALETTE.length];
  function niceMax(v) {
    if (v <= 0) return 1;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / exp;
    if (n <= 1) return exp;
    if (n <= 2) return 2 * exp;
    if (n <= 5) return 5 * exp;
    return 10 * exp;
  }
  function formatNum(v, digits = 0) {
    if (v == null || isNaN(v)) return "";
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + "M";
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + "K";
    return digits ? v.toFixed(digits) : String(Math.round(v));
  }
  function useResize(ref2) {
    const w = signal(0);
    effect(() => {
      const el2 = ref2.current;
      if (!el2) return;
      const ro = new ResizeObserver((entries) => {
        const cr = entries[0].contentRect;
        if (cr.width > 0) w(cr.width);
      });
      ro.observe(el2);
      w(el2.clientWidth);
      onCleanup(() => ro.disconnect());
    });
    return w;
  }
  function ChartShell(props) {
    const {
      width,
      height,
      children,
      tooltip,
      legend,
      legendItems,
      legendActive,
      onLegendToggle,
      padding = 0
    } = props;
    const ref2 = { current: null };
    const wrapW = useResize(ref2);
    const W = () => width || wrapW() || 600;
    const H = () => height || 240;
    return div(
      {
        class: "x-chart",
        style: "position:relative;width:100%;" + (padding ? "padding:" + padding + "px;" : ""),
        ref: (el2) => {
          ref2.current = el2;
        }
      },
      S("svg", {
        viewBox: "0 0 " + W() + " " + H(),
        width: "100%",
        height: H(),
        style: "display:block;font-family:var(--x-font);overflow:visible",
        preserveAspectRatio: "xMidYMid meet"
      }, ...children({ w: W(), h: H() })),
      tooltip,
      legend ? Legend({ items: legendItems, active: legendActive, onToggle: onLegendToggle }) : null
    );
  }
  function Tooltip(props) {
    const { x, y, visible, title, items, containerW } = px(props);
    return show(
      visible,
      () => div(
        {
          class: "x-chart-tip",
          style: () => {
            const left = Math.max(8, Math.min(containerW - 8, x()));
            return `transform:translate3d(${left}px,${y()}px,0) translate(-50%,-100%)`;
          }
        },
        title ? div({ class: "x-chart-tip-title" }, title) : null,
        ...(items || []).map(
          (it) => div(
            { class: "x-chart-tip-row" },
            span({ class: "x-chart-tip-dot", style: "background:" + it.color }),
            span({ class: "x-chart-tip-label" }, it.label),
            span({ class: "x-chart-tip-value" }, it.value)
          )
        )
      )
    );
  }
  function Legend(props) {
    const { items = [], active, onToggle } = px(props);
    return div(
      { class: "x-chart-legend" },
      ...items.map(
        (it, i) => div(
          {
            class: () => "x-chart-legend-item" + (active && !active().has(it.key) ? " off" : ""),
            on: { click: () => onToggle && onToggle(it.key) }
          },
          span({ class: "x-chart-legend-dot", style: "background:" + it.color }),
          span(null, it.label)
        )
      )
    );
  }
  function wrap(props, inner) {
    return div(
      {
        class: "x-chart-card",
        style: "background:var(--x-bg-elev);border:1px solid var(--x-border);border-radius:var(--x-radius-lg);padding:16px"
      },
      props.title ? div({ class: "x-chart-title" }, props.title) : null,
      inner
    );
  }
  function BarChart(props) {
    const { data = [], labels = [], color, showValue = true, stack, group, horizontal = false, title } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const { w, h } = ctx2;
      const pad = { top: 20, right: 16, bottom: 32, left: 44 };
      const chartW = w - pad.left - pad.right;
      const chartH = h - pad.top - pad.bottom;
      const maxV = niceMax(Math.max(...data, 0));
      const n = data.length || 1;
      const slot = chartW / n;
      const bw = Math.min(60, slot * 0.6);
      const y0 = pad.top + chartH;
      const yOf = (v) => pad.top + chartH - v / maxV * chartH;
      return [
        // 背景 hover 高亮
        ...data.map((v, i) => {
          const x = pad.left + slot * i;
          return S("rect", {
            key: "hb" + i,
            x,
            y: pad.top,
            width: slot,
            height: chartH,
            fill: () => hover() === i ? "rgba(59,130,246,.06)" : "transparent",
            style: "transition:fill .15s;pointer-events:all;cursor:pointer",
            on: {
              mouseenter: () => hover(i),
              mouseleave: () => hover(-1)
            }
          });
        }),
        // 网格
        ...Array.from({ length: 5 }, (_, i) => {
          const y = yOf(maxV * (4 - i) / 4);
          return S("line", {
            key: "g" + i,
            x1: pad.left,
            x2: w - pad.right,
            y1: y,
            y2: y,
            stroke: "var(--x-border)",
            "stroke-width": 1,
            "stroke-dasharray": i === 4 ? "0" : "3 3"
          });
        }),
        // Y 轴刻度
        ...Array.from({ length: 5 }, (_, i) => {
          const v = maxV * (4 - i) / 4;
          const y = yOf(v);
          return S("text", {
            key: "yl" + i,
            x: pad.left - 8,
            y: y + 4,
            "text-anchor": "end",
            "font-size": 11,
            fill: "var(--x-text-mute)"
          }, formatNum(v));
        }),
        // 柱子
        ...data.map((v, i) => {
          const x = pad.left + slot * i + (slot - bw) / 2;
          const y = yOf(v);
          const bh = y0 - y;
          const fill = pickColor(i, color ? [color] : null);
          const isHover = () => hover() === i;
          return S(
            "g",
            {
              key: "b" + i,
              on: {
                mouseenter: (e) => {
                  hover(i);
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 8 });
                }
              }
            },
            S("rect", {
              x,
              y,
              width: bw,
              height: () => Math.max(0, bh),
              rx: 4,
              fill,
              style: () => "transition:opacity .2s, filter .2s;cursor:pointer;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:.4")
            }),
            showValue ? S("text", {
              x: x + bw / 2,
              y: y - 6,
              "text-anchor": "middle",
              "font-size": 11,
              "font-weight": 600,
              fill: "var(--x-text)",
              style: () => "transition:opacity .2s;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:0")
            }, formatNum(v)) : null
          );
        }),
        // X 轴标签
        ...labels.map((l, i) => S("text", {
          key: "xl" + i,
          x: pad.left + slot * i + slot / 2,
          y: h - 10,
          "text-anchor": "middle",
          "font-size": 11,
          fill: "var(--x-text-mute)"
        }, l)),
        // Tooltip
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          title: () => hover() >= 0 ? labels[hover()] || "" : "",
          items: () => hover() >= 0 ? [{ color: pickColor(hover(), color ? [color] : null), label: "\u503C", value: formatNum(data[hover()]) }] : []
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height: props.height || 240, children: inner }));
  }
  function LineChart(props) {
    return LineBase({ ...props, fill: false });
  }
  function AreaChart(props) {
    return LineBase({ ...props, fill: true });
  }
  function LineBase(props) {
    const { data = [], labels = [], color, fill = false, smooth = true, dots = true, title, height = 240 } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const { w, h } = ctx2;
      const pad = { top: 20, right: 20, bottom: 32, left: 44 };
      const chartW = w - pad.left - pad.right;
      const chartH = h - pad.top - pad.bottom;
      const maxV = niceMax(Math.max(...data, 0));
      const n = data.length || 1;
      const step = n > 1 ? chartW / (n - 1) : 0;
      const y0 = pad.top + chartH;
      const yOf = (v) => pad.top + chartH - v / maxV * chartH;
      const xOf = (i) => pad.left + step * i;
      const pts = data.map((v, i) => ({ x: xOf(i), y: yOf(v), v }));
      let linePath = "";
      if (pts.length) {
        if (smooth && pts.length > 2) {
          linePath = "M" + pts[0].x + "," + pts[0].y;
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i], p1 = pts[i + 1];
            const cx2 = (p0.x + p1.x) / 2;
            linePath += " C" + cx2 + "," + p0.y + " " + cx2 + "," + p1.y + " " + p1.x + "," + p1.y;
          }
        } else {
          linePath = "M" + pts.map((p2) => p2.x + "," + p2.y).join(" L");
        }
      }
      const areaPath = pts.length ? linePath + ` L${pts[pts.length - 1].x},${y0} L${pts[0].x},${y0} Z` : "";
      const gradId = uid("line-g");
      const lineColor = color || "var(--x-primary)";
      const crossX = () => hover() >= 0 ? xOf(hover()) : 0;
      return [
        S(
          "defs",
          null,
          S(
            "linearGradient",
            { id: gradId, x1: 0, y1: 0, x2: 0, y2: 1 },
            S("stop", { offset: "0%", "stop-color": lineColor, "stop-opacity": 0.3 }),
            S("stop", { offset: "100%", "stop-color": lineColor, "stop-opacity": 0 })
          )
        ),
        // 网格
        ...Array.from({ length: 5 }, (_, i) => {
          const y = yOf(maxV * (4 - i) / 4);
          return S("line", {
            key: "g" + i,
            x1: pad.left,
            x2: w - pad.right,
            y1: y,
            y2: y,
            stroke: "var(--x-border)",
            "stroke-width": 1,
            "stroke-dasharray": i === 4 ? "0" : "3 3"
          });
        }),
        // Y 轴刻度
        ...Array.from({ length: 5 }, (_, i) => {
          const v = maxV * (4 - i) / 4;
          const y = yOf(v);
          return S("text", {
            key: "yl" + i,
            x: pad.left - 8,
            y: y + 4,
            "text-anchor": "end",
            "font-size": 11,
            fill: "var(--x-text-mute)"
          }, formatNum(v));
        }),
        // 面积
        fill ? S("path", {
          d: areaPath,
          fill: "url(#" + gradId + ")",
          style: "transition:opacity .3s"
        }) : null,
        // 主线（描边动画）
        S("path", {
          d: linePath,
          fill: "none",
          stroke: lineColor,
          "stroke-width": 2.5,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: "transition:stroke-dashoffset .6s ease-out"
        }),
        // 十字线
        show(
          () => hover() >= 0,
          () => S("line", {
            x1: () => crossX(),
            x2: () => crossX(),
            y1: pad.top,
            y2: y0,
            stroke: lineColor,
            "stroke-width": 1,
            "stroke-dasharray": "3 3",
            opacity: 0.5,
            style: "transition:opacity .15s"
          })
        ),
        // 数据点
        ...dots ? pts.map(
          (p2, i) => S("circle", {
            key: "d" + i,
            cx: p2.x,
            cy: p2.y,
            r: () => hover() === i ? 6 : 4,
            fill: "var(--x-bg-elev)",
            stroke: lineColor,
            "stroke-width": 2.5,
            style: "transition:r .15s;cursor:pointer",
            on: {
              mouseenter: (e) => {
                hover(i);
                const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
              },
              mouseleave: () => hover(-1)
            }
          })
        ) : [],
        // 交互热区（整个图表响应鼠标移动）
        S("rect", {
          x: pad.left,
          y: pad.top,
          width: chartW,
          height: chartH,
          fill: "transparent",
          on: {
            mousemove: (e) => {
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
              const rx = e.clientX - rect.left;
              const i = Math.round((rx - pad.left) / step);
              const idx = Math.max(0, Math.min(n - 1, i));
              if (idx !== hover()) hover(idx);
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
            },
            mouseleave: () => hover(-1)
          }
        }),
        // X 轴标签
        ...labels.map((l, i) => S("text", {
          key: "xl" + i,
          x: xOf(i),
          y: h - 10,
          "text-anchor": "middle",
          "font-size": 11,
          fill: "var(--x-text-mute)"
        }, l)),
        // Tooltip
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          title: () => hover() >= 0 ? labels[hover()] || "" : "",
          items: () => hover() >= 0 ? [{ color: lineColor, label: "\u6570\u503C", value: formatNum(data[hover()]) }] : []
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height, children: inner }));
  }
  function PieChart(props) {
    return PieBase({ ...props, donut: false });
  }
  function DonutChart(props) {
    return PieBase({ ...props, donut: true });
  }
  function PieBase(props) {
    const { data = [], donut = false, size = 240, title, legend = true } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const disabled = signal(/* @__PURE__ */ new Set());
    const activeData = () => data.filter((d) => !disabled().has(d.label));
    const toggle = (k) => {
      const s = new Set(disabled());
      s.has(k) ? s.delete(k) : s.add(k);
      disabled(s);
    };
    const inner = (ctx2) => {
      const { h } = ctx2;
      const sz = Math.min(size, h);
      const cx2 = sz / 2, cy = sz / 2;
      const r = sz / 2 - 12;
      const ir = donut ? r * 0.6 : 0;
      const list2 = activeData();
      const total = list2.reduce((s, d) => s + (d.value || 0), 0) || 1;
      let a2 = -Math.PI / 2;
      const slices = list2.map((d, i) => {
        const idx = data.indexOf(d);
        const angle = d.value / total * Math.PI * 2;
        const color = d.color || pickColor(idx);
        const isHover = () => hover() === idx;
        const a0 = a2, a1 = a2 + angle;
        a2 = a1;
        const midAngle = (a0 + a1) / 2;
        const offX = () => isHover() ? Math.cos(midAngle) * 6 : 0;
        const offY = () => isHover() ? Math.sin(midAngle) * 6 : 0;
        const path = arcPath(cx2, cy, r, ir, a0, a1);
        return S(
          "g",
          {
            key: idx,
            on: {
              mouseenter: (e) => {
                hover(idx);
                const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
              },
              mouseleave: () => hover(-1)
            }
          },
          S("path", {
            d: path,
            fill: color,
            stroke: "var(--x-bg-elev)",
            "stroke-width": 2,
            style: () => `cursor:pointer;transition:transform .2s, filter .2s, opacity .2s;transform:translate(${offX()}px,${offY()}px);` + (hover() === -1 || isHover() ? "" : "opacity:.35;")
          })
        );
      });
      return [
        ...slices,
        // 中心百分比（环形）
        donut && hover() >= 0 ? S("text", {
          x: cx2,
          y: cy + 6,
          "text-anchor": "middle",
          "font-size": sz / 6,
          "font-weight": 700,
          fill: "var(--x-text)"
        }, Math.round(data[hover()].value / total * 100) + "%") : null,
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: ctx2.w,
          title: () => hover() >= 0 ? data[hover()].label || "" : "",
          items: () => hover() >= 0 ? [{ color: data[hover()].color || pickColor(hover()), label: "\u503C", value: formatNum(data[hover()].value) + " (" + Math.round(data[hover()].value / total * 100) + "%)" }] : []
        })
      ];
    };
    const legendItems = data.map((d, i) => ({ key: d.label, label: d.label, color: d.color || pickColor(i) }));
    const active = () => {
      const s = /* @__PURE__ */ new Set();
      for (const d of data) if (!disabled().has(d.label)) s.add(d.label);
      return s;
    };
    return wrap({ title }, ChartShell({
      width: props.width,
      height: props.height || size,
      children: inner,
      legend,
      legendItems,
      legendActive: active,
      onLegendToggle: toggle
    }));
  }
  function polar(cx2, cy, r, a2) {
    return { x: cx2 + r * Math.cos(a2), y: cy + r * Math.sin(a2) };
  }
  function arcPath(cx2, cy, r, ir, a0, a1) {
    const p0 = polar(cx2, cy, r, a0), p1 = polar(cx2, cy, r, a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    if (ir > 0) {
      const i0 = polar(cx2, cy, ir, a1), i1 = polar(cx2, cy, ir, a0);
      return `M${p0.x},${p0.y} A${r},${r} 0 ${large} 1 ${p1.x},${p1.y} L${i0.x},${i0.y} A${ir},${ir} 0 ${large} 0 ${i1.x},${i1.y} Z`;
    }
    return `M${cx2},${cy} L${p0.x},${p0.y} A${r},${r} 0 ${large} 1 ${p1.x},${p1.y} Z`;
  }
  function RingProgress(props) {
    const { value = 0, size = 140, stroke = 12, color, label: label2, title, animate = true } = px(props);
    const shown = signal(animate ? 0 : value);
    effect(() => {
      const target = value;
      if (!animate) {
        shown(target);
        return;
      }
      const start = shown();
      const duration = 600;
      const t0 = performance.now();
      let raf;
      const tick = (now) => {
        const p2 = Math.min(1, (now - t0) / duration);
        const ease = 1 - Math.pow(1 - p2, 3);
        shown(start + (target - start) * ease);
        if (p2 < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      onCleanup(() => cancelAnimationFrame(raf));
    }, [value]);
    const inner = (ctx2) => {
      const sz = Math.min(size, ctx2.h);
      const r = (sz - stroke) / 2;
      const c = 2 * Math.PI * r;
      const pct = () => Math.min(1, Math.max(0, shown() / 100));
      const cx2 = sz / 2, cy = sz / 2;
      const col = color || "var(--x-primary)";
      return [
        S("circle", { cx: cx2, cy, r, fill: "none", stroke: "var(--x-bg-soft)", "stroke-width": stroke }),
        S("circle", {
          cx: cx2,
          cy,
          r,
          fill: "none",
          stroke: col,
          "stroke-width": stroke,
          "stroke-linecap": "round",
          "stroke-dasharray": c,
          "stroke-dashoffset": () => c * (1 - pct()),
          transform: `rotate(-90 ${cx2} ${cy})`
        }),
        S("text", {
          x: cx2,
          y: cy + (label2 ? -2 : 8),
          "text-anchor": "middle",
          "font-size": sz / 5,
          "font-weight": 700,
          fill: "var(--x-text)"
        }, () => Math.round(shown()) + "%"),
        label2 ? S("text", {
          x: cx2,
          y: cy + 22,
          "text-anchor": "middle",
          "font-size": 12,
          fill: "var(--x-text-mute)"
        }, label2) : null
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height: props.height || size, children: inner }));
  }
  function Sparkline(props) {
    const { data = [], width = 120, height = 40, color, area = false, strokeWidth = 2 } = px(props);
    const max = Math.max(...data, 0), min = Math.min(...data, 0);
    const range = max - min || 1;
    const step = data.length > 1 ? width / (data.length - 1) : 0;
    const pts = data.map((v, i) => ({ x: i * step, y: height - (v - min) / range * (height - 6) - 3 }));
    const linePath = "M" + pts.map((p2) => p2.x.toFixed(2) + "," + p2.y.toFixed(2)).join(" L");
    const areaPath = linePath + ` L${width},${height} L0,${height} Z`;
    const gid = uid("spark");
    const col = color || "var(--x-primary)";
    return S(
      "svg",
      { viewBox: `0 0 ${width} ${height}`, width, height, style: "display:block;overflow:visible" },
      area ? S(
        "defs",
        null,
        S(
          "linearGradient",
          { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 },
          S("stop", { offset: "0%", "stop-color": col, "stop-opacity": 0.3 }),
          S("stop", { offset: "100%", "stop-color": col, "stop-opacity": 0 })
        )
      ) : null,
      area ? S("path", { d: areaPath, fill: "url(#" + gid + ")" }) : null,
      S("path", { d: linePath, fill: "none", stroke: col, "stroke-width": strokeWidth, "stroke-linecap": "round", "stroke-linejoin": "round" })
    );
  }
  function RadarChart(props) {
    const { data = [], size = 260, levels = 4, max, color, fillOpacity = 0.25, title } = px(props);
    const hover = signal(-1);
    const inner = (ctx2) => {
      const sz = Math.min(size, ctx2.h);
      const cx2 = sz / 2, cy = sz / 2, r = sz / 2 - 40;
      const n = data.length || 1;
      const mx = max || Math.max(...data.map((d) => d.value), 1);
      const angle = (i) => Math.PI * 2 * i / n - Math.PI / 2;
      const pt = (i, v) => ({ x: cx2 + Math.cos(angle(i)) * r * (v / mx), y: cy + Math.sin(angle(i)) * r * (v / mx) });
      const col = color || "var(--x-primary)";
      const grids = [];
      for (let l = 1; l <= levels; l++) {
        const pts = Array.from({ length: n }, (_, i) => {
          const p2 = pt(i, mx * l / levels);
          return p2.x + "," + p2.y;
        }).join(" ");
        grids.push(S("polygon", { key: "g" + l, points: pts, fill: "none", stroke: "var(--x-border)", "stroke-width": 1, "stroke-dasharray": l === levels ? "0" : "2 3" }));
      }
      const spokes = Array.from({ length: n }, (_, i) => {
        const p2 = pt(i, mx);
        return S("line", { key: "s" + i, x1: cx2, y1: cy, x2: p2.x, y2: p2.y, stroke: "var(--x-border)", "stroke-width": 1 });
      });
      const dataPts = data.map((d, i) => pt(i, d.value));
      const poly = dataPts.map((p2) => p2.x + "," + p2.y).join(" ");
      const labels = data.map((d, i) => {
        const p2 = pt(i, mx * 1.18);
        return S("text", { key: "l" + i, x: p2.x, y: p2.y + 4, "text-anchor": "middle", "font-size": 12, fill: "var(--x-text-dim)" }, d.label || "");
      });
      return [
        ...grids,
        ...spokes,
        S("polygon", {
          points: poly,
          fill: col,
          "fill-opacity": fillOpacity,
          stroke: col,
          "stroke-width": 2,
          style: "transition:all .3s"
        }),
        ...dataPts.map(
          (p2, i) => S(
            "circle",
            {
              key: "c" + i,
              cx: p2.x,
              cy: p2.y,
              r: () => hover() === i ? 6 : 4,
              fill: "var(--x-bg-elev)",
              stroke: col,
              "stroke-width": 2,
              style: "transition:r .15s;cursor:pointer",
              on: {
                mouseenter: () => hover(i),
                mouseleave: () => hover(-1)
              }
            },
            S("title", null, (data[i].label || "") + ": " + data[i].value)
          )
        ),
        ...labels
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height: props.height || size, children: inner }));
  }
  function GaugeChart(props) {
    const { value = 0, size = 200, stroke = 18, color, min = 0, max = 100, label: label2, title, zones } = px(props);
    const shown = signal(value);
    effect(() => {
      const target = value, start = shown(), duration = 500;
      const t0 = performance.now();
      let raf;
      const tick = (now) => {
        const p2 = Math.min(1, (now - t0) / duration);
        const ease = 1 - Math.pow(1 - p2, 3);
        shown(start + (target - start) * ease);
        if (p2 < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      onCleanup(() => cancelAnimationFrame(raf));
    }, [value]);
    const inner = (ctx2) => {
      const sz = Math.min(size, ctx2.h);
      const cx2 = sz / 2, cy = sz / 2 + 10;
      const r = sz / 2 - stroke - 4;
      const pct = () => Math.min(1, Math.max(0, (shown() - min) / (max - min)));
      const a0 = Math.PI, a1 = Math.PI * 2;
      const pEnd = () => a0 + (a1 - a0) * pct();
      const pTrack = polar(cx2, cy, r, a0);
      const pTrackEnd = polar(cx2, cy, r, a1);
      const col = color || "var(--x-primary)";
      return [
        S("path", {
          d: `M${pTrack.x},${pTrack.y} A${r},${r} 0 0 1 ${pTrackEnd.x},${pTrackEnd.y}`,
          fill: "none",
          stroke: "var(--x-bg-soft)",
          "stroke-width": stroke,
          "stroke-linecap": "round"
        }),
        S("path", {
          d: () => {
            const pe = polar(cx2, cy, r, pEnd());
            return `M${pTrack.x},${pTrack.y} A${r},${r} 0 ${pct() > 0.5 ? 1 : 0} 1 ${pe.x},${pe.y}`;
          },
          fill: "none",
          stroke: col,
          "stroke-width": stroke,
          "stroke-linecap": "round"
        }),
        S("text", {
          x: cx2,
          y: cy - 6,
          "text-anchor": "middle",
          "font-size": sz / 6,
          "font-weight": 700,
          fill: "var(--x-text)"
        }, () => Math.round(shown())),
        label2 ? S("text", {
          x: cx2,
          y: cy + 16,
          "text-anchor": "middle",
          "font-size": 12,
          fill: "var(--x-text-mute)"
        }, label2) : null
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height: props.height || size, children: inner }));
  }
  function ScatterChart(props) {
    const { data = [], height = 240, color, title } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const { w, h } = ctx2;
      const pad = { top: 20, right: 20, bottom: 32, left: 44 };
      const cw = w - pad.left - pad.right;
      const ch = h - pad.top - pad.bottom;
      const xs = data.map((d) => d.x), ys = data.map((d) => d.y);
      const xmin = Math.min(...xs, 0), xmax = niceMax(Math.max(...xs, 1));
      const ymax = niceMax(Math.max(...ys, 0));
      const sx = (v) => pad.left + (v - xmin) / (xmax - xmin || 1) * cw;
      const sy = (v) => pad.top + ch - v / ymax * ch;
      const col = color || "var(--x-primary)";
      return [
        ...Array.from({ length: 5 }, (_, i) => S("line", {
          key: "g" + i,
          x1: pad.left,
          x2: w - pad.right,
          y1: pad.top + ch * i / 4,
          y2: pad.top + ch * i / 4,
          stroke: "var(--x-border)",
          "stroke-width": 1,
          "stroke-dasharray": "3 3"
        })),
        ...data.map(
          (d, i) => S("circle", {
            key: i,
            cx: sx(d.x),
            cy: sy(d.y),
            r: () => hover() === i ? (d.r || 6) + 3 : d.r || 6,
            fill: d.color || col,
            "fill-opacity": 0.8,
            stroke: "var(--x-bg-elev)",
            "stroke-width": 1.5,
            style: "cursor:pointer;transition:r .15s",
            on: {
              mouseenter: (e) => {
                hover(i);
                const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
              },
              mouseleave: () => hover(-1)
            }
          })
        ),
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          items: () => hover() >= 0 ? [{ color: data[hover()].color || col, label: "x", value: data[hover()].x + ", y=" + data[hover()].y }] : []
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height, children: inner }));
  }
  function Heatmap(props) {
    const { data = [], rows = 7, cols = 12, cell = 24, gap = 3, colors, min, max, title } = px(props);
    const hover = signal(null);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const flat = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) flat.push(data[r] && data[r][c] || 0);
      const mx = max ?? Math.max(...flat, 1);
      const mn = min ?? 0;
      const range = mx - mn || 1;
      const palette = colors || ["#e5e7eb", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5"];
      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = data[r] && data[r][c] || 0;
          const idx = Math.min(palette.length - 1, Math.floor((v - mn) / range * palette.length));
          const isHover = () => hover() && hover().r === r && hover().c === c;
          cells.push(S("rect", {
            key: r + "-" + c,
            x: c * (cell + gap),
            y: r * (cell + gap),
            width: cell,
            height: cell,
            rx: 4,
            fill: palette[Math.max(0, idx)],
            style: () => "cursor:pointer;transition:opacity .15s;" + (hover() && !isHover() ? "opacity:.4" : ""),
            on: {
              mouseenter: (e) => {
                hover({ r, c, v });
                const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
              },
              mouseleave: () => hover(null)
            }
          }));
        }
      }
      const w = cols * (cell + gap);
      return [
        ...cells,
        Tooltip({
          visible: () => !!hover(),
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: ctx2.w,
          items: () => hover() ? [{ color: "var(--x-primary)", label: `[${hover().r},${hover().c}]`, value: String(hover().v) }] : []
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height: rows * (cell + gap) + 8, children: inner }));
  }
  function WaterfallChart(props) {
    const { data = [], labels = [], height = 240, title } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const { w, h } = ctx2;
      const pad = { top: 20, right: 20, bottom: 32, left: 44 };
      const cw = w - pad.left - pad.right;
      const ch = h - pad.top - pad.bottom;
      let cum = 0;
      const items = data.map((v) => {
        const s = cum;
        cum += v;
        return { start: s, end: cum, v };
      });
      const allV = items.flatMap((it) => [it.start, it.end]);
      const maxV = niceMax(Math.max(...allV, 0));
      const minV = Math.min(...allV, 0);
      const range = maxV - minV || 1;
      const yOf = (v) => pad.top + ch - (v - minV) / range * ch;
      const n = data.length || 1;
      const slot = cw / n;
      const bw = Math.min(50, slot * 0.6);
      return [
        ...Array.from({ length: 5 }, (_, i) => {
          const y = pad.top + ch * i / 4;
          return S("line", {
            key: "g" + i,
            x1: pad.left,
            x2: w - pad.right,
            y1: y,
            y2: y,
            stroke: "var(--x-border)",
            "stroke-width": 1,
            "stroke-dasharray": i === 4 ? "0" : "3 3"
          });
        }),
        ...items.map((it, i) => {
          const x = pad.left + slot * i + (slot - bw) / 2;
          const top = Math.min(yOf(it.start), yOf(it.end));
          const bot = Math.max(yOf(it.start), yOf(it.end));
          const isHover = () => hover() === i;
          const col = it.v >= 0 ? "var(--x-success)" : "var(--x-danger)";
          return S(
            "g",
            {
              key: i,
              on: {
                mouseenter: (e) => {
                  hover(i);
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
                },
                mouseleave: () => hover(-1)
              }
            },
            S("rect", {
              x,
              y: top,
              width: bw,
              height: Math.max(2, bot - top),
              fill: col,
              rx: 3,
              style: () => "cursor:pointer;transition:opacity .15s;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:.35")
            }),
            S(
              "text",
              {
                x: x + bw / 2,
                y: top - 6,
                "text-anchor": "middle",
                "font-size": 11,
                "font-weight": 600,
                fill: "var(--x-text)",
                style: () => "transition:opacity .15s;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:0")
              },
              (it.v > 0 ? "+" : "") + it.v
            ),
            labels[i] ? S("text", {
              x: x + bw / 2,
              y: h - 10,
              "text-anchor": "middle",
              "font-size": 11,
              fill: "var(--x-text-mute)"
            }, labels[i]) : null
          );
        }),
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          title: () => hover() >= 0 ? labels[hover()] : "",
          items: () => hover() >= 0 ? [{ color: data[hover()] >= 0 ? "var(--x-success)" : "var(--x-danger)", label: "\u53D8\u5316", value: (data[hover()] > 0 ? "+" : "") + data[hover()] }] : []
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height, children: inner }));
  }
  function FunnelChart(props) {
    const { data = [], width = 340, height = 260, colors, title } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const w = Math.min(width, ctx2.w);
      const h = ctx2.h;
      const n = data.length || 1;
      const max = Math.max(...data.map((d) => d.value), 1);
      const step = h / n;
      return [
        ...data.map((d, i) => {
          const wTop = d.value / max * (w - 40);
          const wBot = i < n - 1 ? data[i + 1].value / max * (w - 40) : wTop * 0.6;
          const y = i * step;
          const p2 = `M${(w - wTop) / 2},${y} L${(w + wTop) / 2},${y} L${(w + wBot) / 2},${y + step} L${(w - wBot) / 2},${y + step} Z`;
          const col = d.color || pickColor(i, colors);
          const isHover = () => hover() === i;
          return S(
            "g",
            {
              key: i,
              on: {
                mouseenter: (e) => {
                  hover(i);
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
                },
                mouseleave: () => hover(-1)
              }
            },
            S("path", {
              d: p2,
              fill: col,
              style: () => "cursor:pointer;transition:opacity .15s, transform .15s;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:.35;")
            }),
            S("text", {
              x: w / 2,
              y: y + step / 2 + 4,
              "text-anchor": "middle",
              "font-size": 13,
              fill: "#fff",
              "font-weight": 600
            }, (d.label || "") + " " + d.value)
          );
        }),
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          items: () => hover() >= 0 ? [{ color: data[hover()].color || pickColor(hover(), colors), label: data[hover()].label || "", value: String(data[hover()].value) }] : []
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height, children: inner }));
  }
  function Treemap(props) {
    const { data = [], width = 400, height = 240, colors, title } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const w = Math.min(width, ctx2.w);
      const h = ctx2.h;
      const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
      let x = 0;
      return [
        ...data.map((d, i) => {
          const bw = d.value / total * w;
          const col = d.color || pickColor(i, colors);
          const isHover = () => hover() === i;
          const g = S(
            "g",
            {
              key: i,
              on: {
                mouseenter: (e) => {
                  hover(i);
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
                },
                mouseleave: () => hover(-1)
              }
            },
            S("rect", {
              x,
              y: 0,
              width: bw,
              height: h,
              fill: col,
              stroke: "var(--x-bg-elev)",
              "stroke-width": 2,
              style: () => "cursor:pointer;transition:opacity .15s;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:.35")
            }),
            bw > 60 ? S("text", {
              x: x + bw / 2,
              y: h / 2 - 6,
              "text-anchor": "middle",
              "font-size": 14,
              fill: "#fff",
              "font-weight": 600
            }, d.label || "") : null,
            bw > 60 ? S("text", {
              x: x + bw / 2,
              y: h / 2 + 14,
              "text-anchor": "middle",
              "font-size": 12,
              fill: "rgba(255,255,255,.8)"
            }, formatNum(d.value)) : null
          );
          x += bw;
          return g;
        }),
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          items: () => hover() >= 0 ? [{ color: data[hover()].color || pickColor(hover(), colors), label: data[hover()].label || "", value: formatNum(data[hover()].value) }] : []
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height, children: inner }));
  }
  function CandlestickChart(props) {
    const { data = [], labels = [], height = 260, title } = px(props);
    const hover = signal(-1);
    const mouse = signal({ x: 0, y: 0 });
    const inner = (ctx2) => {
      const { w, h } = ctx2;
      const pad = { top: 20, right: 20, bottom: 32, left: 44 };
      const cw = w - pad.left - pad.right;
      const ch = h - pad.top - pad.bottom;
      const maxV = niceMax(Math.max(...data.map((d) => d.high), 0));
      const minV = Math.min(...data.map((d) => d.low), 0);
      const range = maxV - minV || 1;
      const yOf = (v) => pad.top + ch - (v - minV) / range * ch;
      const n = data.length || 1;
      const slot = cw / n;
      const bw = Math.min(20, slot * 0.6);
      return [
        ...Array.from({ length: 5 }, (_, i) => {
          const y = pad.top + ch * i / 4;
          return S("line", {
            key: "g" + i,
            x1: pad.left,
            x2: w - pad.right,
            y1: y,
            y2: y,
            stroke: "var(--x-border)",
            "stroke-width": 1,
            "stroke-dasharray": "3 3"
          });
        }),
        ...data.map((d, i) => {
          const x = pad.left + slot * i + slot / 2;
          const up = d.close >= d.open;
          const col = up ? "var(--x-success)" : "var(--x-danger)";
          const yHigh = yOf(d.high), yLow = yOf(d.low);
          const yO = yOf(d.open), yC = yOf(d.close);
          const yTop = Math.min(yO, yC), yBot = Math.max(yO, yC);
          const isHover = () => hover() === i;
          return S(
            "g",
            {
              key: i,
              on: {
                mouseenter: (e) => {
                  hover(i);
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 });
                },
                mouseleave: () => hover(-1)
              }
            },
            S("line", {
              x1: x,
              x2: x,
              y1: yHigh,
              y2: yLow,
              stroke: col,
              "stroke-width": 1.5,
              style: () => "transition:opacity .15s;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:.35")
            }),
            S("rect", {
              x: x - bw / 2,
              y: yTop,
              width: bw,
              height: Math.max(2, yBot - yTop),
              fill: col,
              style: () => "cursor:pointer;transition:opacity .15s;" + (hover() === -1 || isHover() ? "opacity:1" : "opacity:.35")
            }),
            labels[i] ? S("text", {
              x,
              y: h - 10,
              "text-anchor": "middle",
              "font-size": 11,
              fill: "var(--x-text-mute)"
            }, labels[i]) : null
          );
        }),
        Tooltip({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          title: () => hover() >= 0 ? labels[hover()] : "",
          items: () => {
            if (hover() < 0) return [];
            const d = data[hover()];
            return [
              { color: "var(--x-text-dim)", label: "\u5F00", value: String(d.open) },
              { color: "var(--x-success)", label: "\u9AD8", value: String(d.high) },
              { color: "var(--x-danger)", label: "\u4F4E", value: String(d.low) },
              { color: d.close >= d.open ? "var(--x-success)" : "var(--x-danger)", label: "\u6536", value: String(d.close) }
            ];
          }
        })
      ];
    };
    return wrap({ title }, ChartShell({ width: props.width, height, children: inner }));
  }

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
  var TESTS = [
    // 基础
    ["Btn", () => Btn(null, "x")],
    ["Tag", () => Tag(null, "x")],
    ["Badge", () => Badge(null, "x")],
    ["Avatar", () => Avatar({ text: "X" })],
    ["Spinner", () => Spinner()],
    ["Count", () => Count({ value: 5 })],
    ["Card", () => Card({ title: "Card" }, "body")],
    ["Divider", () => Divider({})],
    ["Space", () => Space({}, "a", "b")],
    ["Text", () => Text({}, "text")],
    // 表单
    ["Input", () => Input({ placeholder: "x" })],
    ["Textarea", () => Textarea({})],
    ["Select", () => Select({ options: [{ value: "a", label: "A" }] })],
    ["Checkbox", () => Checkbox({ label: "x" })],
    ["Radio", () => Radio({ label: "x" })],
    ["Switch", () => Switch({ label: "x" })],
    ["NumberInput", () => NumberInput({})],
    ["DatePicker", () => DatePicker({})],
    ["TimePicker", () => TimePicker({})],
    ["SearchInput", () => SearchInput({})],
    ["PasswordStrength", () => PasswordStrength({ value: "abc" })],
    ["Rate", () => Rate({ value: 3 })],
    ["ColorPicker", () => ColorPicker({})],
    ["Slider", () => Slider({})],
    ["Mentions", () => Mentions({ options: [] })],
    ["Transfer", () => Transfer({ data: [{ key: "a", label: "A" }] })],
    ["Cascader", () => Cascader({ options: [] })],
    // 展示
    ["Alert", () => Alert({ title: "A" }, "a")],
    ["Progress", () => Progress({ value: 50 })],
    ["Empty", () => Empty({})],
    ["Result", () => Result({ status: "success", title: "OK" })],
    ["Skeleton", () => Skeleton({ lines: 2 })],
    ["Stat", () => Stat({ label: "L", value: 100 })],
    ["Descriptions", () => Descriptions({ items: [{ label: "a", value: "1" }] })],
    ["ItemCard", () => ItemCard({ title: "T" })],
    ["QRCode", () => QRCode({ text: "x", size: 100 })],
    ["Typography", () => Typography({}, "x")],
    ["Comment", () => Comment({ author: "a" }, "c")],
    ["Watermark", () => Watermark({ text: "W" }, "x")],
    ["Ribbon", () => Ribbon({ text: "R" }, "x")],
    ["Code", () => Code({}, "code")],
    ["Keyboard", () => Keyboard(null, "Ctrl")],
    ["Highlight", () => Highlight({ text: "hello world", keyword: "world" })],
    ["Ellipsis", () => Ellipsis({}, "long text here")],
    // 导航
    ["Tabs", () => Tabs({ items: [{ key: "a", title: "A" }] })],
    ["Breadcrumb", () => Breadcrumb({ items: [{ label: "a" }] })],
    ["Pagination", () => Pagination({ page: 1, total: 100 })],
    ["Steps", () => Steps({ steps: [{ label: "a" }] })],
    ["Accordion", () => Accordion({ items: [{ title: "a", content: "b" }] })],
    ["Menu", () => Menu({ items: [{ key: "1", label: "a" }] })],
    ["Anchor", () => Anchor({ items: [] })],
    ["Collapse", () => Collapse({ items: [{ title: "a", content: "b" }] })],
    // 数据
    ["Table", () => Table({ columns: [{ title: "a", key: "a" }], data: [] })],
    ["List", () => List({ items: [], render: () => null })],
    ["Timeline", () => Timeline({ items: [] })],
    ["Tree", () => Tree({ data: [{ key: "a", label: "a" }] })],
    ["TreeSelect", () => TreeSelect({ data: [] })],
    ["Calendar", () => Calendar({})],
    ["SplitPane", () => SplitPane({ left: "L", right: "R" })],
    ["Carousel", () => Carousel({}, "a", "b")],
    ["Image", () => Image({ src: "x" })],
    ["VirtualTable", () => VirtualTable({ columns: [], data: [] })],
    ["Kanban", () => Kanban({ columns: [], items: [] })],
    ["Gantt", () => Gantt({ tasks: [] })],
    // 布局
    ["Layout", () => Layout({}, "x")],
    ["Grid", () => Grid({}, "x")],
    ["Flex", () => Flex({}, "x")],
    ["Affix", () => Affix({}, "x")],
    // 图表
    ["BarChart", () => BarChart({ data: [1, 2, 3], labels: ["a", "b", "c"], height: 80 })],
    ["LineChart", () => LineChart({ data: [1, 2, 3], labels: ["a", "b", "c"], height: 80 })],
    ["PieChart", () => PieChart({ data: [{ value: 1, label: "a" }], size: 80 })],
    ["Sparkline", () => Sparkline({ data: [1, 2, 3] })],
    ["RingProgress", () => RingProgress({ value: 50, size: 80 })],
    ["DonutChart", () => DonutChart({ data: [{ value: 1, label: "a" }], size: 80 })],
    ["AreaChart", () => AreaChart({ data: [1, 2, 3], labels: ["a", "b", "c"], height: 80 })],
    ["RadarChart", () => RadarChart({ data: [{ label: "a", value: 1 }], size: 80 })],
    ["GaugeChart", () => GaugeChart({ value: 50, size: 80 })],
    ["ScatterChart", () => ScatterChart({ data: [{ x: 1, y: 2 }], height: 80 })],
    ["Heatmap", () => Heatmap({ data: [[1, 2, 3]], cell: 15 })],
    ["WaterfallChart", () => WaterfallChart({ data: [1, 2, 3], labels: ["a", "b", "c"], height: 80 })],
    ["FunnelChart", () => FunnelChart({ data: [{ label: "a", value: 1 }], height: 80 })],
    ["Treemap", () => Treemap({ data: [{ label: "a", value: 1 }], height: 80 })],
    ["CandlestickChart", () => CandlestickChart({ data: [{ open: 1, high: 2, low: 0, close: 1.5 }], height: 80 })],
    // 图标（全部 64）
    ["IconArrowRight", () => IconArrowRight({})],
    ["IconArrowLeft", () => IconArrowLeft({})],
    ["IconArrowUp", () => IconArrowUp({})],
    ["IconArrowDown", () => IconArrowDown({})],
    ["IconChevronRight", () => IconChevronRight({})],
    ["IconChevronLeft", () => IconChevronLeft({})],
    ["IconChevronDown", () => IconChevronDown({})],
    ["IconChevronUp", () => IconChevronUp({})],
    ["IconExternalLink", () => IconExternalLink({})],
    ["IconCheck", () => IconCheck({})],
    ["IconClose", () => IconClose({})],
    ["IconPlus", () => IconPlus({})],
    ["IconMinus", () => IconMinus({})],
    ["IconSearch", () => IconSearch({})],
    ["IconMenu", () => IconMenu({})],
    ["IconMoreH", () => IconMoreH({})],
    ["IconMoreV", () => IconMoreV({})],
    ["IconRefresh", () => IconRefresh({})],
    ["IconEdit", () => IconEdit({})],
    ["IconCopy", () => IconCopy({})],
    ["IconTrash", () => IconTrash({})],
    ["IconSave", () => IconSave({})],
    ["IconDownload", () => IconDownload({})],
    ["IconUpload", () => IconUpload({})],
    ["IconShare", () => IconShare({})],
    ["IconBookmark", () => IconBookmark({})],
    ["IconZoomIn", () => IconZoomIn({})],
    ["IconZoomOut", () => IconZoomOut({})],
    ["IconMaximize", () => IconMaximize({})],
    ["IconMinimize", () => IconMinimize({})],
    ["IconGrid", () => IconGrid({})],
    ["IconList", () => IconList({})],
    ["IconFilter", () => IconFilter({})],
    ["IconSort", () => IconSort({})],
    ["IconEye", () => IconEye({})],
    ["IconEyeOff", () => IconEyeOff({})],
    ["IconUser", () => IconUser({})],
    ["IconUsers", () => IconUsers({})],
    ["IconHeart", () => IconHeart({})],
    ["IconStar", () => IconStar({})],
    ["IconMessage", () => IconMessage({})],
    ["IconBell", () => IconBell({})],
    ["IconMail", () => IconMail({})],
    ["IconPhone", () => IconPhone({})],
    ["IconFile", () => IconFile({})],
    ["IconFolder", () => IconFolder({})],
    ["IconImage", () => IconImage({})],
    ["IconCalendar", () => IconCalendar({})],
    ["IconClock", () => IconClock({})],
    ["IconTag", () => IconTag({})],
    ["IconFlag", () => IconFlag({})],
    ["IconCloud", () => IconCloud({})],
    ["IconDatabase", () => IconDatabase({})],
    ["IconMap", () => IconMap({})],
    ["IconNavigation", () => IconNavigation({})],
    ["IconCompass", () => IconCompass({})],
    ["IconPin", () => IconPin({})],
    ["IconPlay", () => IconPlay({})],
    ["IconPause", () => IconPause({})],
    ["IconCamera", () => IconCamera({})],
    ["IconMic", () => IconMic({})],
    ["IconVolume", () => IconVolume({})],
    ["IconVolumeOff", () => IconVolumeOff({})],
    ["IconInfo", () => IconInfo({})],
    ["IconWarn", () => IconWarn({})],
    ["IconCheckCircle", () => IconCheckCircle({})],
    ["IconXCircle", () => IconXCircle({})],
    ["IconLock", () => IconLock({})],
    ["IconUnlock", () => IconUnlock({})],
    ["IconShield", () => IconShield({})],
    ["IconSun", () => IconSun({})],
    ["IconMoon", () => IconMoon({})],
    ["IconLink", () => IconLink({})],
    ["IconHome", () => IconHome({})],
    ["IconSettings", () => IconSettings({})],
    ["IconLayout", () => IconLayout({})],
    ["IconSidebar", () => IconSidebar({})],
    ["IconColumns", () => IconColumns({})],
    ["IconRows", () => IconRows({})]
  ];
  var container = document.createElement("div");
  container.style.cssText = "padding:16px;background:#111;color:#0f0;font:12px monospace";
  document.getElementById("app").appendChild(container);
  var ok = [];
  var fail = [];
  TESTS.forEach(([name, make]) => {
    const wrap2 = document.createElement("div");
    wrap2.style.cssText = "display:inline-block;padding:6px 10px;margin:3px;border:1px solid #333;border-radius:4px;vertical-align:top;text-align:center;min-width:70px;color:#0f0";
    wrap2.textContent = name;
    container.appendChild(wrap2);
    const box = document.createElement("div");
    box.style.cssText = "margin-top:4px";
    wrap2.appendChild(box);
    try {
      mount(() => {
        try {
          return make();
        } catch (e) {
          return (() => {
            const _div0 = document.createElement("div");
            applyStyle(_div0, "color:#f55");
            const _t1 = renderChild("ERR:" + (e.message || e));
            if (_t1) _div0.appendChild(_t1);
            return _div0;
          })();
        }
      }, box);
      ok.push(name);
    } catch (e) {
      wrap2.style.borderColor = "#f55";
      wrap2.style.color = "#f55";
      box.textContent = "X " + (e.message || e);
      fail.push([name, e.message || String(e)]);
    }
  });
  var summary2 = document.createElement("div");
  summary2.style.cssText = "margin-top:20px;padding:12px;background:#000;border:1px solid #333;font-size:13px;white-space:pre-wrap";
  summary2.textContent = `\u901A\u8FC7 ${ok.length} / \u5931\u8D25 ${fail.length}

` + (fail.length ? "\u5931\u8D25\u5217\u8868\uFF1A\n" + fail.map(([n, e]) => "  \u2717 " + n + " \u2014 " + e).join("\n") : "\u2713 \u5168\u90E8\u901A\u8FC7");
  container.appendChild(summary2);
})();
