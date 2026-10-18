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
      bindAttr: bindAttr2,
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
  var currentTheme = signal("light");
  var currentAccent = signal("");
  var setTheme = (name) => {
    currentTheme(name);
    document.documentElement.setAttribute("data-theme", name === "light" ? "" : name);
  };
  var setAccent = (name) => {
    currentAccent(name);
    if (name) document.documentElement.setAttribute("data-accent", name);
    else document.documentElement.removeAttribute("data-accent");
  };
  var setCustom = (color) => {
    document.documentElement.style.setProperty("--x-primary", color);
    document.documentElement.style.setProperty("--x-primary-hover", color);
    document.documentElement.style.setProperty("--x-primary-soft", color + "22");
  };
  var THEMES = [
    ["light", "\u6D45\u8272"],
    ["dark", "\u6DF1\u8272"],
    ["dracula", "Dracula"],
    ["nord", "Nord"],
    ["solarized", "Solarized"],
    ["tokyo", "Tokyo"],
    ["monokai", "Monokai"]
  ];
  var ACCENTS = [
    ["", "\u9ED8\u8BA4"],
    ["green", "\u7EFF"],
    ["red", "\u7EA2"],
    ["orange", "\u6A59"],
    ["purple", "\u7D2B"],
    ["cyan", "\u9752"],
    ["pink", "\u7C89"]
  ];
  var GRADIENTS = [
    ["bg-gradient-blue", "Blue"],
    ["bg-gradient-green", "Green"],
    ["bg-gradient-orange", "Orange"],
    ["bg-gradient-red", "Red"],
    ["bg-gradient-purple", "Purple"],
    ["bg-gradient-cyan", "Cyan"],
    ["bg-gradient-sunset", "Sunset"],
    ["bg-gradient-ocean", "Ocean"],
    ["bg-gradient-forest", "Forest"],
    ["bg-gradient-rainbow", "Rainbow"],
    ["bg-gradient-mesh", "Mesh"]
  ];
  mount(() => (() => {
    const _div0 = document.createElement("div");
    applyStyle(_div0, "padding:24px;max-width:900px;margin:0 auto");
    const _h11 = document.createElement("h1");
    _h11.appendChild(document.createTextNode("\u4E3B\u9898\u7CFB\u7EDF"));
    _div0.appendChild(_h11);
    const _h32 = document.createElement("h3");
    _h32.appendChild(document.createTextNode("1. \u9884\u8BBE\u4E3B\u9898"));
    _div0.appendChild(_h32);
    const _div3 = document.createElement("div");
    _div3.className = "flex flex-wrap gap-2";
    applyStyle(_div3, "margin:12px 0");
    const _t4 = renderChild(THEMES.map(
      ([k, label2]) => (() => {
        const _button5 = document.createElement("button");
        bindAttr(_button5, "class", () => "sm" + (currentTheme() === k ? " primary" : ""));
        _button5.addEventListener("click", () => setTheme(k));
        const _t6 = renderChild(label2);
        if (_t6) _button5.appendChild(_t6);
        return _button5;
      })()
    ));
    if (_t4) _div3.appendChild(_t4);
    _div0.appendChild(_div3);
    const _h37 = document.createElement("h3");
    _h37.appendChild(document.createTextNode("2. \u4E3B\u8272\u53D8\u4F53"));
    _div0.appendChild(_h37);
    const _div8 = document.createElement("div");
    _div8.className = "flex flex-wrap gap-2";
    applyStyle(_div8, "margin:12px 0");
    const _t9 = renderChild(ACCENTS.map(
      ([k, label2]) => (() => {
        const _button10 = document.createElement("button");
        bindAttr(_button10, "class", () => "sm" + (currentAccent() === k ? " primary" : ""));
        _button10.addEventListener("click", () => setAccent(k));
        const _t11 = renderChild(label2);
        if (_t11) _button10.appendChild(_t11);
        return _button10;
      })()
    ));
    if (_t9) _div8.appendChild(_t9);
    _div0.appendChild(_div8);
    const _h312 = document.createElement("h3");
    _h312.appendChild(document.createTextNode("3. \u4EFB\u610F\u8272"));
    _div0.appendChild(_h312);
    const _div13 = document.createElement("div");
    _div13.className = "flex flex-wrap gap-2";
    applyStyle(_div13, "margin:12px 0");
    const _t14 = renderChild([
      ["#ff6600", "\u6A59"],
      ["#00d4aa", "\u8584\u8377"],
      ["#e91e63", "\u73AB\u7470"],
      ["#4caf50", "\u8349\u7EFF"],
      ["#2196f3", "\u5929\u84DD"],
      ["#9c27b0", "\u8461\u8404"]
    ].map(
      ([c, label2]) => (() => {
        const _button15 = document.createElement("button");
        _button15.className = "sm";
        applyStyle(_button15, "background:" + c + ";color:#fff;border-color:" + c);
        _button15.addEventListener("click", () => setCustom(c));
        const _t16 = renderChild(label2);
        if (_t16) _button15.appendChild(_t16);
        return _button15;
      })()
    ));
    if (_t14) _div13.appendChild(_t14);
    _div0.appendChild(_div13);
    const _h317 = document.createElement("h3");
    _h317.appendChild(document.createTextNode("4. \u6E10\u53D8\u5361\u7247"));
    _div0.appendChild(_h317);
    const _div18 = document.createElement("div");
    _div18.className = "grid-3";
    applyStyle(_div18, "margin:12px 0");
    const _t19 = renderChild(GRADIENTS.map(
      ([cls, label2]) => (() => {
        const _div20 = document.createElement("div");
        _div20.className = cls;
        applyStyle(_div20, "height:100px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;text-shadow:0 1px 2px rgba(0,0,0,.3)");
        const _t21 = renderChild(label2);
        if (_t21) _div20.appendChild(_t21);
        return _div20;
      })()
    ));
    if (_t19) _div18.appendChild(_t19);
    _div0.appendChild(_div18);
    const _h322 = document.createElement("h3");
    _h322.appendChild(document.createTextNode("5. \u6E10\u53D8\u5E94\u7528"));
    _div0.appendChild(_h322);
    const _div23 = document.createElement("div");
    _div23.className = "flex flex-wrap gap-3";
    applyStyle(_div23, "margin:12px 0;align-items:center");
    const _button24 = document.createElement("button");
    _button24.className = "btn-gradient";
    _button24.appendChild(document.createTextNode("\u6E10\u53D8\u6309\u94AE"));
    _div23.appendChild(_button24);
    const _span25 = document.createElement("span");
    _span25.className = "text-gradient";
    applyStyle(_span25, "font-size:24px;font-weight:700");
    _span25.appendChild(document.createTextNode("\u6E10\u53D8\u6587\u5B57"));
    _div23.appendChild(_span25);
    const _div26 = document.createElement("div");
    _div26.className = "border-gradient";
    applyStyle(_div26, "padding:12px 20px;border-radius:8px");
    _div26.appendChild(document.createTextNode("\u6E10\u53D8\u8FB9\u6846"));
    _div23.appendChild(_div26);
    const _div27 = document.createElement("div");
    _div27.className = "progress progress-gradient";
    applyStyle(_div27, "width:200px");
    const _div28 = document.createElement("div");
    _div28.className = "progress-bar";
    applyStyle(_div28, "width:65%");
    _div27.appendChild(_div28);
    _div23.appendChild(_div27);
    _div0.appendChild(_div23);
    const _h329 = document.createElement("h3");
    _h329.appendChild(document.createTextNode("6. \u73BB\u7483\u62DF\u6001 / \u53D1\u5149"));
    _div0.appendChild(_h329);
    const _div30 = document.createElement("div");
    _div30.className = "flex flex-wrap gap-3";
    applyStyle(_div30, "margin:12px 0");
    const _div31 = document.createElement("div");
    _div31.className = "glass";
    applyStyle(_div31, "padding:20px;border-radius:12px;flex:1;min-width:200px");
    _div31.appendChild(document.createTextNode("\u73BB\u7483\u62DF\u6001"));
    _div30.appendChild(_div31);
    const _div32 = document.createElement("div");
    _div32.className = "card";
    applyStyle(_div32, "padding:20px;flex:1;min-width:200px");
    const _div33 = document.createElement("div");
    _div33.className = "glow";
    applyStyle(_div33, "padding:16px;border-radius:8px;background:var(--x-primary);color:var(--x-text-inverse);text-align:center");
    _div33.appendChild(document.createTextNode("\u53D1\u5149\u6548\u679C"));
    _div32.appendChild(_div33);
    _div30.appendChild(_div32);
    _div0.appendChild(_div30);
    const _h334 = document.createElement("h3");
    _h334.appendChild(document.createTextNode("7. \u5E38\u7528\u7EC4\u4EF6\u9884\u89C8"));
    _div0.appendChild(_h334);
    const _div35 = document.createElement("div");
    _div35.className = "flex flex-wrap gap-2";
    applyStyle(_div35, "margin:12px 0");
    const _button36 = document.createElement("button");
    _button36.appendChild(document.createTextNode("\u6309\u94AE"));
    _div35.appendChild(_button36);
    const _button37 = document.createElement("button");
    _button37.className = "primary";
    _button37.appendChild(document.createTextNode("\u4E3B\u8272"));
    _div35.appendChild(_button37);
    const _button38 = document.createElement("button");
    _button38.className = "danger";
    _button38.appendChild(document.createTextNode("\u5371\u9669"));
    _div35.appendChild(_button38);
    const _button39 = document.createElement("button");
    _button39.className = "success";
    _button39.appendChild(document.createTextNode("\u6210\u529F"));
    _div35.appendChild(_button39);
    const _button40 = document.createElement("button");
    _button40.className = "ghost";
    _button40.appendChild(document.createTextNode("\u5E7D\u7075"));
    _div35.appendChild(_button40);
    const _button41 = document.createElement("button");
    _button41.className = "dashed";
    _button41.appendChild(document.createTextNode("\u865A\u7EBF"));
    _div35.appendChild(_button41);
    const _span42 = document.createElement("span");
    _span42.className = "badge primary";
    _span42.appendChild(document.createTextNode("\u6807\u7B7E"));
    _div35.appendChild(_span42);
    const _input43 = document.createElement("input");
    _input43.setAttribute("placeholder", "\u8F93\u5165\u6846");
    applyStyle(_input43, "width:160px");
    _div35.appendChild(_input43);
    _div0.appendChild(_div35);
    const _div44 = document.createElement("div");
    _div44.className = "card";
    applyStyle(_div44, "margin:12px 0");
    const _div45 = document.createElement("div");
    _div45.className = "card-header";
    const _div46 = document.createElement("div");
    _div46.className = "card-title";
    _div46.appendChild(document.createTextNode("\u5361\u7247\u6807\u9898"));
    _div45.appendChild(_div46);
    const _div47 = document.createElement("div");
    _div47.className = "card-desc";
    _div47.appendChild(document.createTextNode("\u4E3B\u9898\u5207\u6362\u65F6\uFF0C\u8FD9\u91CC\u6240\u6709\u989C\u8272\u81EA\u52A8\u8DDF\u968F"));
    _div45.appendChild(_div47);
    _div44.appendChild(_div45);
    const _p48 = document.createElement("p");
    _p48.appendChild(document.createTextNode("\u5185\u5BB9\u6BB5\u843D\uFF0C\u770B\u6587\u5B57\u989C\u8272\u662F\u5426\u6B63\u5E38\u3002"));
    _div44.appendChild(_p48);
    const _div49 = document.createElement("div");
    _div49.className = "card-footer";
    const _button50 = document.createElement("button");
    _button50.className = "primary sm";
    _button50.appendChild(document.createTextNode("\u786E\u5B9A"));
    _div49.appendChild(_button50);
    const _button51 = document.createElement("button");
    _button51.className = "sm";
    applyStyle(_button51, "margin-left:8px");
    _button51.appendChild(document.createTextNode("\u53D6\u6D88"));
    _div49.appendChild(_button51);
    _div44.appendChild(_div49);
    _div0.appendChild(_div44);
    return _div0;
  })(), "#app");
})();
