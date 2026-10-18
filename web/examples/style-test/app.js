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
      bindText: bindText2,
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

  // .xuyc-entry.js
  var isDark = signal(false);
  var toggleTheme = () => {
    isDark(!isDark());
    document.documentElement.setAttribute("data-theme", isDark() ? "dark" : "");
  };
  var themeBtn = (() => {
    const _button105 = document.createElement("button");
    applyStyle(_button105, "position:fixed;top:16px;right:16px;z-index:9999;padding:8px 16px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.2);font-weight:600");
    _button105.addEventListener("click", toggleTheme);
    const _t106 = document.createElement("span");
    _t106.style.display = "contents";
    bindText(_t106, () => isDark() ? "\u2600 \u5207\u6D45\u8272" : "\u263E \u5207\u6DF1\u8272");
    _button105.appendChild(_t106);
    return _button105;
  })();
  mount(() => (() => {
    const _div0 = document.createElement("div");
    applyStyle(_div0, "padding:24px;max-width:800px;margin:0 auto");
    const _t1 = renderChild(themeBtn);
    if (_t1) _div0.appendChild(_t1);
    const _h12 = document.createElement("h1");
    _h12.appendChild(document.createTextNode("\u7528\u6CD5 A\uFF1A\u88F8\u6807\u7B7E\u81EA\u52A8\u6709\u6837\u5F0F"));
    _div0.appendChild(_h12);
    const _p3 = document.createElement("p");
    _p3.appendChild(document.createTextNode("\u4E0D\u7528\u52A0\u4EFB\u4F55 class\uFF0C\u5199 <button> <input> <table> \u5C31\u6709\u6837\u5F0F\u3002"));
    _div0.appendChild(_p3);
    const _div4 = document.createElement("div");
    _div4.className = "gap-4 flex flex-wrap items-center";
    applyStyle(_div4, "margin:16px 0");
    const _button5 = document.createElement("button");
    _button5.appendChild(document.createTextNode("\u6309\u94AE"));
    _div4.appendChild(_button5);
    const _button6 = document.createElement("button");
    _button6.disabled = true;
    _button6.appendChild(document.createTextNode("\u7981\u7528"));
    _div4.appendChild(_button6);
    const _input7 = document.createElement("input");
    _input7.setAttribute("placeholder", "\u8F93\u5165\u6846");
    applyStyle(_input7, "width:200px");
    _div4.appendChild(_input7);
    const _input8 = document.createElement("input");
    _input8.setAttribute("type", "checkbox");
    _div4.appendChild(_input8);
    const _label9 = document.createElement("label");
    _label9.appendChild(document.createTextNode(" \u590D\u9009\u6846"));
    _div4.appendChild(_label9);
    const _select10 = document.createElement("select");
    const _option11 = document.createElement("option");
    _option11.appendChild(document.createTextNode("\u9009\u9879 A"));
    _select10.appendChild(_option11);
    const _option12 = document.createElement("option");
    _option12.appendChild(document.createTextNode("\u9009\u9879 B"));
    _select10.appendChild(_option12);
    _div4.appendChild(_select10);
    _div0.appendChild(_div4);
    const _table13 = document.createElement("table");
    const _thead14 = document.createElement("thead");
    const _tr15 = document.createElement("tr");
    const _th16 = document.createElement("th");
    _th16.appendChild(document.createTextNode("\u59D3\u540D"));
    _tr15.appendChild(_th16);
    const _th17 = document.createElement("th");
    _th17.appendChild(document.createTextNode("\u5E74\u9F84"));
    _tr15.appendChild(_th17);
    const _th18 = document.createElement("th");
    _th18.appendChild(document.createTextNode("\u57CE\u5E02"));
    _tr15.appendChild(_th18);
    _thead14.appendChild(_tr15);
    _table13.appendChild(_thead14);
    const _tbody19 = document.createElement("tbody");
    const _tr20 = document.createElement("tr");
    const _td21 = document.createElement("td");
    _td21.appendChild(document.createTextNode("\u5F20\u4E09"));
    _tr20.appendChild(_td21);
    const _td22 = document.createElement("td");
    _td22.appendChild(document.createTextNode("28"));
    _tr20.appendChild(_td22);
    const _td23 = document.createElement("td");
    _td23.appendChild(document.createTextNode("\u5317\u4EAC"));
    _tr20.appendChild(_td23);
    _tbody19.appendChild(_tr20);
    const _tr24 = document.createElement("tr");
    const _td25 = document.createElement("td");
    _td25.appendChild(document.createTextNode("\u674E\u56DB"));
    _tr24.appendChild(_td25);
    const _td26 = document.createElement("td");
    _td26.appendChild(document.createTextNode("34"));
    _tr24.appendChild(_td26);
    const _td27 = document.createElement("td");
    _td27.appendChild(document.createTextNode("\u4E0A\u6D77"));
    _tr24.appendChild(_td27);
    _tbody19.appendChild(_tr24);
    const _tr28 = document.createElement("tr");
    const _td29 = document.createElement("td");
    _td29.appendChild(document.createTextNode("\u738B\u4E94"));
    _tr28.appendChild(_td29);
    const _td30 = document.createElement("td");
    _td30.appendChild(document.createTextNode("22"));
    _tr28.appendChild(_td30);
    const _td31 = document.createElement("td");
    _td31.appendChild(document.createTextNode("\u5E7F\u5DDE"));
    _tr28.appendChild(_td31);
    _tbody19.appendChild(_tr28);
    _table13.appendChild(_tbody19);
    _div0.appendChild(_table13);
    const _hr32 = document.createElement("hr");
    _div0.appendChild(_hr32);
    const _h133 = document.createElement("h1");
    _h133.appendChild(document.createTextNode("\u7528\u6CD5 B\uFF1A\u52A0 class \u7CBE\u786E\u63A7\u5236"));
    _div0.appendChild(_h133);
    const _h334 = document.createElement("h3");
    _h334.appendChild(document.createTextNode("\u6309\u94AE\u53D8\u4F53"));
    _div0.appendChild(_h334);
    const _div35 = document.createElement("div");
    _div35.className = "gap-2 flex flex-wrap";
    applyStyle(_div35, "margin:12px 0");
    const _button36 = document.createElement("button");
    _button36.className = "primary";
    _button36.appendChild(document.createTextNode("\u4E3B\u8272"));
    _div35.appendChild(_button36);
    const _button37 = document.createElement("button");
    _button37.className = "danger";
    _button37.appendChild(document.createTextNode("\u5371\u9669"));
    _div35.appendChild(_button37);
    const _button38 = document.createElement("button");
    _button38.className = "success";
    _button38.appendChild(document.createTextNode("\u6210\u529F"));
    _div35.appendChild(_button38);
    const _button39 = document.createElement("button");
    _button39.className = "ghost";
    _button39.appendChild(document.createTextNode("\u5E7D\u7075"));
    _div35.appendChild(_button39);
    const _button40 = document.createElement("button");
    _button40.className = "dashed";
    _button40.appendChild(document.createTextNode("\u865A\u7EBF"));
    _div35.appendChild(_button40);
    const _button41 = document.createElement("button");
    _button41.className = "primary sm";
    _button41.appendChild(document.createTextNode("\u5C0F"));
    _div35.appendChild(_button41);
    const _button42 = document.createElement("button");
    _button42.className = "primary lg";
    _button42.appendChild(document.createTextNode("\u5927"));
    _div35.appendChild(_button42);
    const _button43 = document.createElement("button");
    _button43.className = "primary block";
    applyStyle(_button43, "margin-top:12px");
    _button43.appendChild(document.createTextNode("\u6574\u884C\u6309\u94AE"));
    _div35.appendChild(_button43);
    _div0.appendChild(_div35);
    const _h344 = document.createElement("h3");
    _h344.appendChild(document.createTextNode("\u8F93\u5165\u6846\u53D8\u4F53"));
    _div0.appendChild(_h344);
    const _div45 = document.createElement("div");
    applyStyle(_div45, "display:grid;gap:8px;margin:12px 0");
    const _input46 = document.createElement("input");
    _input46.setAttribute("placeholder", "\u9ED8\u8BA4\u8F93\u5165\u6846");
    _div45.appendChild(_input46);
    const _input47 = document.createElement("input");
    _input47.className = "error";
    _input47.setAttribute("placeholder", "\u9519\u8BEF\u72B6\u6001");
    _div45.appendChild(_input47);
    const _input48 = document.createElement("input");
    _input48.className = "sm";
    _input48.setAttribute("placeholder", "\u5C0F\u53F7");
    _div45.appendChild(_input48);
    const _input49 = document.createElement("input");
    _input49.className = "lg";
    _input49.setAttribute("placeholder", "\u5927\u53F7");
    _div45.appendChild(_input49);
    _div0.appendChild(_div45);
    const _h350 = document.createElement("h3");
    _h350.appendChild(document.createTextNode("\u8868\u683C\u53D8\u4F53"));
    _div0.appendChild(_h350);
    const _div51 = document.createElement("div");
    applyStyle(_div51, "margin:12px 0");
    const _table52 = document.createElement("table");
    _table52.className = "striped bordered";
    const _thead53 = document.createElement("thead");
    const _tr54 = document.createElement("tr");
    const _th55 = document.createElement("th");
    _th55.appendChild(document.createTextNode("ID"));
    _tr54.appendChild(_th55);
    const _th56 = document.createElement("th");
    _th56.appendChild(document.createTextNode("\u4EA7\u54C1"));
    _tr54.appendChild(_th56);
    const _th57 = document.createElement("th");
    _th57.appendChild(document.createTextNode("\u4EF7\u683C"));
    _tr54.appendChild(_th57);
    _thead53.appendChild(_tr54);
    _table52.appendChild(_thead53);
    const _tbody58 = document.createElement("tbody");
    const _tr59 = document.createElement("tr");
    const _td60 = document.createElement("td");
    _td60.appendChild(document.createTextNode("1"));
    _tr59.appendChild(_td60);
    const _td61 = document.createElement("td");
    _td61.appendChild(document.createTextNode("\u952E\u76D8"));
    _tr59.appendChild(_td61);
    const _td62 = document.createElement("td");
    _td62.appendChild(document.createTextNode("\xA5299"));
    _tr59.appendChild(_td62);
    _tbody58.appendChild(_tr59);
    const _tr63 = document.createElement("tr");
    const _td64 = document.createElement("td");
    _td64.appendChild(document.createTextNode("2"));
    _tr63.appendChild(_td64);
    const _td65 = document.createElement("td");
    _td65.appendChild(document.createTextNode("\u9F20\u6807"));
    _tr63.appendChild(_td65);
    const _td66 = document.createElement("td");
    _td66.appendChild(document.createTextNode("\xA599"));
    _tr63.appendChild(_td66);
    _tbody58.appendChild(_tr63);
    const _tr67 = document.createElement("tr");
    const _td68 = document.createElement("td");
    _td68.appendChild(document.createTextNode("3"));
    _tr67.appendChild(_td68);
    const _td69 = document.createElement("td");
    _td69.appendChild(document.createTextNode("\u8033\u673A"));
    _tr67.appendChild(_td69);
    const _td70 = document.createElement("td");
    _td70.appendChild(document.createTextNode("\xA5599"));
    _tr67.appendChild(_td70);
    _tbody58.appendChild(_tr67);
    const _tr71 = document.createElement("tr");
    const _td72 = document.createElement("td");
    _td72.appendChild(document.createTextNode("4"));
    _tr71.appendChild(_td72);
    const _td73 = document.createElement("td");
    _td73.appendChild(document.createTextNode("\u663E\u793A\u5668"));
    _tr71.appendChild(_td73);
    const _td74 = document.createElement("td");
    _td74.appendChild(document.createTextNode("\xA51299"));
    _tr71.appendChild(_td74);
    _tbody58.appendChild(_tr71);
    _table52.appendChild(_tbody58);
    _div51.appendChild(_table52);
    _div0.appendChild(_div51);
    const _h375 = document.createElement("h3");
    _h375.appendChild(document.createTextNode("\u5FBD\u7AE0 / \u63D0\u793A / \u5361\u7247"));
    _div0.appendChild(_h375);
    const _div76 = document.createElement("div");
    _div76.className = "gap-2 flex flex-wrap";
    applyStyle(_div76, "margin:12px 0");
    const _span77 = document.createElement("span");
    _span77.className = "badge";
    _span77.appendChild(document.createTextNode("\u9ED8\u8BA4"));
    _div76.appendChild(_span77);
    const _span78 = document.createElement("span");
    _span78.className = "badge primary";
    _span78.appendChild(document.createTextNode("\u4E3B\u8272"));
    _div76.appendChild(_span78);
    const _span79 = document.createElement("span");
    _span79.className = "badge success";
    _span79.appendChild(document.createTextNode("\u6210\u529F"));
    _div76.appendChild(_span79);
    const _span80 = document.createElement("span");
    _span80.className = "badge danger";
    _span80.appendChild(document.createTextNode("\u5371\u9669"));
    _div76.appendChild(_span80);
    const _span81 = document.createElement("span");
    _span81.className = "badge warning";
    _span81.appendChild(document.createTextNode("\u8B66\u544A"));
    _div76.appendChild(_span81);
    _div0.appendChild(_div76);
    const _div82 = document.createElement("div");
    _div82.className = "alert info";
    _div82.appendChild(document.createTextNode("\u8FD9\u662F\u4E00\u6761\u4FE1\u606F\u63D0\u793A"));
    _div0.appendChild(_div82);
    const _div83 = document.createElement("div");
    _div83.className = "alert success";
    _div83.appendChild(document.createTextNode("\u64CD\u4F5C\u6210\u529F"));
    _div0.appendChild(_div83);
    const _div84 = document.createElement("div");
    _div84.className = "alert warning";
    _div84.appendChild(document.createTextNode("\u6CE8\u610F"));
    _div0.appendChild(_div84);
    const _div85 = document.createElement("div");
    _div85.className = "alert danger";
    _div85.appendChild(document.createTextNode("\u51FA\u9519\u4E86"));
    _div0.appendChild(_div85);
    const _div86 = document.createElement("div");
    _div86.className = "card hover";
    applyStyle(_div86, "margin:16px 0");
    const _div87 = document.createElement("div");
    _div87.className = "card-header";
    const _div88 = document.createElement("div");
    _div88.className = "card-title";
    _div88.appendChild(document.createTextNode("\u5361\u7247\u6807\u9898"));
    _div87.appendChild(_div88);
    const _div89 = document.createElement("div");
    _div89.className = "card-desc";
    _div89.appendChild(document.createTextNode("\u8FD9\u662F\u63CF\u8FF0\u6587\u5B57"));
    _div87.appendChild(_div89);
    _div86.appendChild(_div87);
    const _p90 = document.createElement("p");
    _p90.appendChild(document.createTextNode("\u5361\u7247\u5185\u5BB9"));
    _div86.appendChild(_p90);
    const _div91 = document.createElement("div");
    _div91.className = "card-footer";
    const _button92 = document.createElement("button");
    _button92.className = "primary sm";
    _button92.appendChild(document.createTextNode("\u786E\u5B9A"));
    _div91.appendChild(_button92);
    const _button93 = document.createElement("button");
    _button93.className = "sm";
    applyStyle(_button93, "margin-left:8px");
    _button93.appendChild(document.createTextNode("\u53D6\u6D88"));
    _div91.appendChild(_button93);
    _div86.appendChild(_div91);
    _div0.appendChild(_div86);
    const _h394 = document.createElement("h3");
    _h394.appendChild(document.createTextNode("\u5E03\u5C40\u7C7B"));
    _div0.appendChild(_h394);
    const _div95 = document.createElement("div");
    _div95.className = "grid-3";
    applyStyle(_div95, "margin:12px 0");
    const _div96 = document.createElement("div");
    _div96.className = "card";
    _div96.appendChild(document.createTextNode("\u683C\u5B50 1"));
    _div95.appendChild(_div96);
    const _div97 = document.createElement("div");
    _div97.className = "card";
    _div97.appendChild(document.createTextNode("\u683C\u5B50 2"));
    _div95.appendChild(_div97);
    const _div98 = document.createElement("div");
    _div98.className = "card";
    _div98.appendChild(document.createTextNode("\u683C\u5B50 3"));
    _div95.appendChild(_div98);
    _div0.appendChild(_div95);
    const _h399 = document.createElement("h3");
    _h399.appendChild(document.createTextNode("\u94FE\u63A5 / \u4EE3\u7801"));
    _div0.appendChild(_h399);
    const _p100 = document.createElement("p");
    _p100.appendChild(document.createTextNode("\u8FD9\u662F\u4E00\u4E2A "));
    const _a101 = document.createElement("a");
    _a101.setAttribute("href", "#");
    _a101.appendChild(document.createTextNode("\u94FE\u63A5"));
    _p100.appendChild(_a101);
    _p100.appendChild(document.createTextNode("\u3002"));
    _div0.appendChild(_p100);
    const _p102 = document.createElement("p");
    _p102.appendChild(document.createTextNode("\u884C\u5185\u4EE3\u7801 "));
    const _code103 = document.createElement("code");
    _code103.appendChild(document.createTextNode("const x = 1"));
    _p102.appendChild(_code103);
    _p102.appendChild(document.createTextNode("\u3002"));
    _div0.appendChild(_p102);
    const _pre104 = document.createElement("pre");
    _pre104.appendChild(document.createTextNode('function hello() {\n  console.log("world")\n}'));
    _div0.appendChild(_pre104);
    return _div0;
  })(), "#app");
})();
