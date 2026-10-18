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
  var div2 = tags.div;
  var span2 = tags.span;
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
    const { gap: gap2 = 4, align, justify, wrap: wrap2 } = px(props);
    return div2({ class: cx("flex", "gap-" + gap2, align && "items-" + align, justify && "justify-" + justify, wrap2 && "flex-wrap") }, ...children);
  }
  function Col(props, ...children) {
    const { gap: gap2 = 4, align } = px(props);
    return div2({ class: cx("flex", "flex-col", "gap-" + gap2, align && "items-" + align) }, ...children);
  }
  function Text(props, ...children) {
    const { size, dim, bold, center, tag: tag2 = "p" } = px(props);
    const cls = cx(size && "text-" + size, dim && "text-dim", bold && "font-" + (bold === true ? "bold" : bold), center && "text-center");
    const { h4: h42, h5: h52, h6: h62, a: a2, code: _code, pre: _pre } = require_tags;
    const Tag2 = { p, span: span2, h1, h2, h3, h4: h42, h5: h52, h6: h62, a: a2, code: _code, pre: _pre }[tag2] || p;
    return Tag2({ class: cls }, ...children);
  }
  function Card(props, ...children) {
    const { title, desc, footer: footer2, flat, hover } = px(props);
    return div2(
      { class: cx("card", flat && "card-flat", hover && "card-hover") },
      title ? div2(
        { class: "card-header" },
        div2({ class: "card-title" }, title),
        desc ? div2({ class: "card-desc" }, desc) : null
      ) : null,
      ...children,
      footer2 ? div2({ class: "card-footer" }, footer2) : null
    );
  }
  function Tag(props, ...children) {
    const { type, closable, onClose } = px(props);
    return span2(
      { class: cx("badge", type && "badge-" + type), style: { paddingRight: closable ? "4px" : "8px" } },
      ...children,
      closable ? span2({ style: { marginLeft: "4px", cursor: "pointer", opacity: 0.7 }, on: { click: onClose } }, "\xD7") : null
    );
  }
  function Badge(props, ...children) {
    const { type } = px(props);
    return span2({ class: cx("badge", type && "badge-" + type) }, ...children);
  }

  // ../../core/src/kit-form.js
  function Input(props) {
    const { label: label2, hint, error, type = "text", value, onChange, placeholder, size, disabled, name } = px(props);
    return div2(
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
      error ? div2({ class: "error-msg" }, error) : hint ? div2({ class: "hint" }, hint) : null
    );
  }
  function Select(props) {
    const { label: label2, hint, error, options = [], value, onChange, placeholder, disabled, size } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div2(
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
      error ? div2({ class: "error-msg" }, error) : hint ? div2({ class: "hint" }, hint) : null
    );
  }
  function Checkbox(props) {
    const { label: label2, checked, onChange, disabled } = px(props);
    return label(
      { class: "checkbox" },
      input({ type: "checkbox", checked: typeof checked === "function" ? () => !!checked() : !!checked, disabled: !!disabled, on: { change: (e) => onChange && onChange(e.target.checked) } }),
      span2(null, label2 || "")
    );
  }
  function Radio(props) {
    const { label: label2, checked, onChange, name, disabled } = px(props);
    return label(
      { class: "radio" },
      input({ type: "radio", name, checked: typeof checked === "function" ? () => !!checked() : !!checked, disabled: !!disabled, on: { change: () => onChange && onChange() } }),
      span2(null, label2 || "")
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
      div2(
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
        div2({ class: "switch-thumb" })
      ),
      label2 ? span2({ class: "switch-label", on: { click: toggle } }, label2) : null
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
    return div2(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      Row(
        { gap: 1, align: "center" },
        Btn({ size: "sm", onClick: () => set2((val || 0) - step) }, "\u2212"),
        input({ class: cx("input", error && "error"), type: "number", min, max, step, disabled: !!disabled, value: typeof value === "function" ? value : value || "", style: { textAlign: "center", flex: 1 }, on: { input: (e) => set2(e.target.value) } }),
        Btn({ size: "sm", onClick: () => set2((val || 0) + step) }, "+")
      ),
      error ? div2({ class: "error-msg" }, error) : hint ? div2({ class: "hint" }, hint) : null
    );
  }
  function DatePicker(props) {
    const { label: label2, hint, error, value, onChange, disabled } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div2(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      input({ class: cx("input", error && "error"), type: "date", disabled: !!disabled, value: typeof value === "function" ? value : value || "", on: { change: (e) => onChange && onChange(e.target.value) } }),
      error ? div2({ class: "error-msg" }, error) : hint ? div2({ class: "hint" }, hint) : null
    );
  }
  function TimePicker(props) {
    const { label: label2, hint, error, value, onChange, disabled } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div2(
      { class: "field" },
      label2 ? label({ class: "label" }, label2) : null,
      input({ class: cx("input", error && "error"), type: "time", disabled: !!disabled, value: typeof value === "function" ? value : value || "", on: { change: (e) => onChange && onChange(e.target.value) } }),
      error ? div2({ class: "error-msg" }, error) : hint ? div2({ class: "hint" }, hint) : null
    );
  }
  function SearchInput(props) {
    const { placeholder = "\u641C\u7D22...", value, onChange, onSearch } = px(props);
    const val = typeof value === "function" ? value() : value;
    return div2(
      { style: { position: "relative" } },
      span2(
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
    return div2(
      { style: { marginTop: "6px" } },
      div2(
        { style: { height: "4px", background: "var(--x-bg-soft)", borderRadius: "2px", overflow: "hidden" } },
        div2({ style: () => ({ width: score() * 20 + "%", height: "100%", background: colors[score()], transition: "all .3s" }) })
      ),
      div2({ style: { fontSize: "12px", color: "var(--x-text-mute)", marginTop: "4px" } }, () => labels[score()])
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
        return span2({
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
  var lockCount = 0;
  function lockScroll() {
    if (typeof document === "undefined") return () => {
    };
    if (lockCount === 0) {
      const top = window.scrollY;
      document.body.style.setProperty("--x-scroll-top", `-${top}px`);
      document.body.classList.add("x-scroll-lock");
    }
    lockCount++;
    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        const top = parseInt(document.body.style.getPropertyValue("--x-scroll-top") || "0", 10);
        document.body.classList.remove("x-scroll-lock");
        document.body.style.removeProperty("--x-scroll-top");
        window.scrollTo(0, -top);
      }
    };
  }
  function isTouch() {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  // ../../core/src/kit-display.js
  function Alert(props, ...children) {
    const { type = "info", title } = px(props);
    return div2(
      { class: cx("alert", "alert-" + type) },
      title ? div2({ class: "alert-title" }, title) : null,
      ...children
    );
  }
  function Modal(props, ...children) {
    const { open, onClose, title, footer: footer2, width, mobile = "sheet" } = px(props);
    const isOpen = typeof open === "function" ? open : () => open;
    let unlock = null;
    effect(() => {
      if (isOpen() && typeof document !== "undefined") {
        if (!unlock) unlock = lockScroll();
      } else {
        if (unlock) {
          unlock();
          unlock = null;
        }
      }
    });
    effect(() => {
      if (!isOpen()) return;
      const h = (e) => {
        if (e.key === "Escape") onClose && onClose();
      };
      document.addEventListener("keydown", h);
      onCleanup(() => document.removeEventListener("keydown", h));
    }, [() => isOpen()]);
    return div2(
      {
        class: "modal-overlay" + (mobile === "sheet" ? " modal-sheet" : ""),
        style: () => isOpen() ? { display: "flex" } : { display: "none" },
        on: { click: (e) => e.target.classList.contains("modal-overlay") && onClose && onClose() }
      },
      div2(
        {
          class: "modal",
          style: () => {
            const w = width ? { maxWidth: width } : {};
            return w;
          },
          on: { click: (e) => e.stopPropagation() }
        },
        title ? div2(
          { class: "modal-header" },
          h3({ class: "modal-title" }, title),
          button({ class: "modal-close", on: { click: onClose } }, "\xD7")
        ) : null,
        div2({ class: "modal-body" }, ...children),
        footer2 ? div2({ class: "modal-footer" }, footer2) : null
      )
    );
  }
  function Spinner(props) {
    const { size = 20 } = px(props);
    return div2({ style: { display: "inline-block", width: size + "px", height: size + "px", border: "2px solid var(--x-border)", borderTopColor: "var(--x-primary)", borderRadius: "50%", animation: "x-spin .6s linear infinite" } });
  }
  function Empty(props) {
    const { text: text2 = "\u6682\u65E0\u6570\u636E", icon } = px(props);
    return div2(
      { style: { textAlign: "center", padding: "60px 20px", color: "var(--x-text-mute)" } },
      div2(
        { style: { marginBottom: "12px", display: "flex", justifyContent: "center", opacity: 0.4, color: "var(--x-text-mute)" } },
        icon || createElement(
          "svg",
          { width: 64, height: 64, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" },
          createElement("path", { d: "M3 7h18v13H3z" }),
          createElement("path", { d: "M3 7l2-4h14l2 4" }),
          createElement("path", { d: "M3 7l9 6 9-6" })
        )
      ),
      div2({ style: { fontSize: "14px" } }, text2)
    );
  }
  function Progress(props) {
    const { value = 0, max = 100, size, showText, color: color2 } = px(props);
    const val = typeof value === "function" ? value() : value;
    const pct = Math.min(100, Math.max(0, val / max * 100));
    return div2(
      { class: "field" },
      Row(
        { gap: 2, align: "center" },
        div2(
          { class: cx("progress", size && "progress-" + size), style: { flex: 1 } },
          div2({ class: "progress-bar", style: { width: pct + "%", background: color2 || void 0 } })
        ),
        showText ? Text({ size: "sm", dim: true }, Math.round(pct) + "%") : null
      )
    );
  }
  function Avatar(props) {
    const { src, text: text2, size = "md" } = px(props);
    const cls = cx("avatar", size === "sm" && "avatar-sm", size === "lg" && "avatar-lg");
    if (src) return div2({ class: cls }, img({ src }));
    return div2({ class: cls }, String(text2 || "?").slice(0, 1).toUpperCase());
  }
  function Result(props) {
    const { status = "info", title, subTitle, extra } = px(props);
    const icons = { success: "\u2713", error: "\u2715", warning: "!", info: "i" };
    const colors = { success: "var(--x-success)", error: "var(--x-danger)", warning: "var(--x-warning)", info: "var(--x-primary)" };
    return div2(
      { style: { textAlign: "center", padding: "40px 20px" } },
      div2({ style: { width: "64px", height: "64px", borderRadius: "50%", background: colors[status], color: "var(--x-text-inverse)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "16px" } }, icons[status]),
      div2({ style: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" } }, title || ""),
      subTitle ? div2({ style: { color: "var(--x-text-dim)", marginBottom: "20px" } }, subTitle) : null,
      extra || null
    );
  }
  function Skeleton(props) {
    const { lines = 3 } = px(props);
    return Col(
      { gap: 2 },
      div2({ class: "skeleton skeleton-title" }),
      ...Array.from({ length: lines }, () => div2({ class: "skeleton skeleton-text" }))
    );
  }
  function Count(props) {
    const { value = 0, max = 99, type = "danger" } = px(props);
    const val = typeof value === "function" ? value() : value;
    if (val <= 0) return null;
    return span2({ class: "badge badge-" + type, style: { marginLeft: "6px" } }, val > max ? max + "+" : String(val));
  }
  function Stat(props) {
    const { label: label2, value, unit, trend, color: color2 } = px(props);
    const val = typeof value === "function" ? value() : value;
    return Card(
      null,
      div2({ style: { fontSize: "13px", color: "var(--x-text-dim)", marginBottom: "8px" } }, label2),
      Row(
        { gap: 1, align: "center" },
        div2({ style: { fontSize: "28px", fontWeight: "700", color: color2 || "var(--x-text)" } }, val),
        unit ? span2({ style: { fontSize: "14px", color: "var(--x-text-dim)" } }, unit) : null,
        trend ? span2({ style: { fontSize: "13px", marginLeft: "8px", color: trend > 0 ? "var(--x-success)" : "var(--x-danger)" } }, (trend > 0 ? "\u2191 " : "\u2193 ") + Math.abs(trend) + "%") : null
      )
    );
  }
  function Descriptions(props) {
    const { items = [], columns = 2, bordered = false } = px(props);
    return div2(
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
        (it) => div2(
          {
            style: {
              padding: bordered ? "10px 14px" : "0",
              borderBottom: bordered ? "1px solid var(--x-border)" : "none",
              display: bordered ? "flex" : "block",
              gap: bordered ? "12px" : "0"
            }
          },
          div2({ style: { fontSize: "13px", color: "var(--x-text-dim)", minWidth: bordered ? "80px" : "auto", marginBottom: bordered ? "0" : "4px" } }, it.label),
          div2({ style: { fontSize: "14px" } }, it.value)
        )
      )
    );
  }

  // ../../core/src/kit-nav.js
  function Tabs(props) {
    const { items = [], active, onChange } = px(props);
    const isActive = typeof active === "function" ? active : () => active;
    return div2(
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
      out.push(span2({ style: { color: i === items.length - 1 ? "var(--x-text)" : "var(--x-text-dim)", cursor: it.onClick ? "pointer" : "default" }, on: { click: it.onClick } }, it.label));
      if (i < items.length - 1) out.push(span2({ style: { margin: "0 8px", color: "var(--x-text-mute)" } }, separator));
    });
    return Row({ gap: 0, align: "center" }, ...out);
  }
  function Pagination(props) {
    const { page: page2, total, pageSize = 20, onChange } = px(props);
    const cur = typeof page2 === "function" ? page2() : page2;
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
        (p2) => typeof p2 === "number" ? Btn({ size: "sm", type: cur === p2 ? "primary" : "default", onClick: () => jump(p2) }, String(p2)) : span2({ style: { padding: "0 4px", color: "var(--x-text-mute)" } }, "...")
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
          div2({ style: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", background: i < current ? "var(--x-success)" : i === current ? "var(--x-primary)" : "var(--x-bg-soft)", color: i <= current ? "var(--x-text-inverse)" : "var(--x-text-mute)" } }, i < current ? "\u2713" : String(i + 1)),
          span2({ style: { fontSize: "14px", color: i <= current ? "var(--x-text)" : "var(--x-text-mute)", fontWeight: i === current ? "600" : "400" } }, s.label || s),
          i < steps.length - 1 ? div2({ style: { width: "40px", height: "1px", background: "var(--x-border)" } }) : null
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
        (it, i) => div2(
          { style: { border: "1px solid var(--x-border)", borderRadius: "var(--x-radius)", marginBottom: "8px", overflow: "hidden" } },
          div2(
            { style: { padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: openIdx() === i ? "var(--x-bg-soft)" : "transparent", fontWeight: "500" }, on: { click: () => openIdx(openIdx() === i ? -1 : i) } },
            span2(null, it.title),
            span2({ style: { transition: "transform .2s", transform: openIdx() === i ? "rotate(90deg)" : "none", color: "var(--x-text-mute)" } }, "\u203A")
          ),
          div2({ style: { padding: "12px 16px", borderTop: "1px solid var(--x-border)", display: openIdx() === i ? "block" : "none" } }, it.content)
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
    return wrap2 ? div2({ class: "table-wrap" }, tbl) : tbl;
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
            div2({ style: { width: "10px", height: "10px", borderRadius: "50%", background: it.color || "var(--x-primary)", marginTop: "6px" } }),
            i < items.length - 1 ? div2({ style: { width: "2px", flex: 1, minHeight: "30px", background: "var(--x-border)", marginTop: "4px" } }) : null
          ),
          Col(
            { gap: 1 },
            div2({ style: { fontSize: "12px", color: "var(--x-text-mute)" } }, it.time || ""),
            div2({ style: { fontWeight: "500" } }, it.title || ""),
            it.desc ? div2({ style: { fontSize: "13px", color: "var(--x-text-dim)" } }, it.desc) : null
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
      return div2(
        null,
        div2(
          { style: { padding: "6px 8px", paddingLeft: 8 + depth * 16 + "px", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }, on: { click: () => hasChildren ? toggle(k) : node.onClick && node.onClick() } },
          hasChildren ? span2({ style: () => ({ transition: "transform .15s", display: "inline-block", transform: openMap()[k] ? "rotate(90deg)" : "none", color: "var(--x-text-mute)", fontSize: "12px" }) }, "\u203A") : span2({ style: { width: "12px" } }),
          span2(null, render2 ? render2(node) : node.label)
        ),
        hasChildren && openMap()[k] ? div2(null, ...node.children.map((c) => Node2(c, depth + 1))) : null
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

  // ../../core/src/kit-upload.js
  function DragUpload(props) {
    const { onFiles, accept, multiple = true, text: text2 = "\u62D6\u62FD\u6587\u4EF6\u5230\u6B64\u5904\u6216\u70B9\u51FB\u4E0A\u4F20" } = px(props);
    const hovering = signal(false);
    const handle = (files) => {
      const list2 = Array.from(files || []);
      onFiles && onFiles(multiple ? list2 : list2[0]);
    };
    return label(
      {
        style: () => ({
          display: "block",
          border: "2px dashed " + (hovering() ? "var(--x-primary)" : "var(--x-border-strong)"),
          borderRadius: "var(--x-radius-lg)",
          padding: "40px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: hovering() ? "var(--x-primary-soft)" : "transparent",
          transition: "all .15s"
        }),
        on: {
          dragover: (e) => {
            e.preventDefault();
            hovering(true);
          },
          dragleave: () => hovering(false),
          drop: (e) => {
            e.preventDefault();
            hovering(false);
            handle(e.dataTransfer.files);
          }
        }
      },
      input({ type: "file", accept, multiple, style: { display: "none" }, on: { change: (e) => handle(e.target.files) } }),
      div2(
        { style: { marginBottom: "10px", display: "flex", justifyContent: "center", color: "var(--x-text-mute)" } },
        createElement(
          "svg",
          { width: 48, height: 48, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" },
          createElement("path", { d: "M3 7h18v13H3z" }),
          createElement("path", { d: "M3 7l2-4h14l2 4" })
        )
      ),
      div2({ style: { color: "var(--x-text-dim)" } }, text2)
    );
  }
  function ImageUpload(props) {
    const { onFile, maxSize = 5 * 1024 * 1024 } = px(props);
    const url = signal("");
    const err2 = signal("");
    return div2(
      null,
      label(
        {
          style: { display: "block", border: "2px dashed var(--x-border-strong)", borderRadius: "var(--x-radius-lg)", padding: "20px", textAlign: "center", cursor: "pointer" }
        },
        input({
          type: "file",
          accept: "image/*",
          style: { display: "none" },
          on: {
            change: (e) => {
              const file = e.target.files[0];
              if (!file) return;
              if (file.size > maxSize) {
                err2("\u6587\u4EF6\u8D85\u8FC7 " + Math.round(maxSize / 1024 / 1024) + "MB");
                return;
              }
              err2("");
              url(URL.createObjectURL(file));
              onFile && onFile(file);
            }
          }
        }),
        show(() => url(), () => img({ src: url(), style: { maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" } })),
        show(() => !url(), () => div2(
          null,
          div2(
            { style: { marginBottom: "6px", display: "flex", justifyContent: "center", color: "var(--x-text-mute)" } },
            createElement(
              "svg",
              { width: 40, height: 40, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" },
              createElement("rect", { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
              createElement("circle", { cx: 9, cy: 9, r: 2 }),
              createElement("path", { d: "M21 15l-5-5L5 21" })
            )
          ),
          div2({ style: { color: "var(--x-text-dim)" } }, "\u70B9\u51FB\u9009\u62E9\u56FE\u7247")
        ))
      ),
      err2() ? div2({ class: "error-msg" }, err2()) : null
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
  function CopyButton(props) {
    const { text: text2, label: label2 = "\u590D\u5236", copied = "\u5DF2\u590D\u5236" } = px(props);
    const state = signal(label2);
    const copy = () => {
      const t = typeof text2 === "function" ? text2() : text2;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(t).then(ok, fail);
      } else {
        const ta = document.createElement("textarea");
        ta.value = t;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy") ? ok() : fail();
        document.body.removeChild(ta);
      }
    };
    const ok = () => {
      state(copied);
      setTimeout(() => state(label2), 1200);
    };
    const fail = () => {
      state("\u5931\u8D25");
      setTimeout(() => state(label2), 1200);
    };
    return Btn({ size: "sm", onClick: copy }, () => state());
  }
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
  function Tooltip(props, ...children) {
    const { text: text2, position = "top", trigger } = px(props);
    const visible = signal(false);
    const useClick = trigger === "click" || trigger !== "hover" && isTouch();
    const evts = useClick ? { click: (e) => {
      e.stopPropagation();
      visible(!visible());
    } } : { mouseenter: () => visible(true), mouseleave: () => visible(false) };
    effect(() => {
      if (!useClick || !visible()) return;
      const close = () => visible(false);
      document.addEventListener("click", close);
      onCleanup(() => document.removeEventListener("click", close));
    });
    return span2(
      { style: { position: "relative", display: "inline-block" }, on: evts },
      ...children,
      show(visible, () => span2({
        style: {
          position: "absolute",
          zIndex: 1e3,
          whiteSpace: "nowrap",
          background: "#101828",
          color: "var(--x-text-inverse)",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          top: position === "bottom" ? "calc(100% + 6px)" : "auto",
          bottom: position === "top" ? "calc(100% + 6px)" : "auto",
          pointerEvents: "none"
        }
      }, text2))
    );
  }
  function Popover(props, ...children) {
    const { content, title, position = "bottom", trigger } = px(props);
    const useTrigger = trigger || (isTouch() ? "click" : "hover");
    const visible = signal(false);
    const evts = useTrigger === "hover" ? { mouseenter: () => visible(true), mouseleave: () => visible(false) } : { click: (e) => {
      e.stopPropagation();
      visible(!visible());
    } };
    return span2(
      { style: { position: "relative", display: "inline-block" }, on: evts },
      ...children,
      show(visible, () => div2(
        {
          style: {
            position: "absolute",
            zIndex: 1e3,
            background: "var(--x-text-inverse)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,.1)",
            minWidth: "200px",
            left: "50%",
            transform: "translateX(-50%)",
            top: position === "bottom" ? "calc(100% + 8px)" : "auto",
            bottom: position === "top" ? "calc(100% + 8px)" : "auto"
          }
        },
        title ? div2({ style: { fontWeight: "600", marginBottom: "6px", fontSize: "13px" } }, title) : null,
        content
      ))
    );
  }
  function Dropdown(props, ...children) {
    const { items = [], onSelect } = px(props);
    const visible = signal(false);
    effect(() => {
      if (!visible()) return;
      const close = () => visible(false);
      document.addEventListener("click", close);
      onCleanup(() => document.removeEventListener("click", close));
    });
    return span2(
      {
        style: { position: "relative", display: "inline-block" },
        on: { click: (e) => {
          e.stopPropagation();
          visible(!visible());
        } }
      },
      ...children,
      show(visible, () => div2(
        {
          style: {
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            zIndex: 1e3,
            background: "var(--x-text-inverse)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,.1)",
            minWidth: "140px",
            padding: "4px"
          }
        },
        ...items.map((it) => div2({
          style: { padding: "8px 12px", fontSize: "14px", cursor: "pointer", borderRadius: "6px" },
          on: {
            click: () => {
              onSelect && onSelect(it);
              visible(false);
            },
            mouseenter: (e) => e.currentTarget.style.background = "var(--x-bg-hover)",
            mouseleave: (e) => e.currentTarget.style.background = "transparent"
          }
        }, it.label || it))
      ))
    );
  }
  function Drawer(props, ...children) {
    const { open, onClose, title, width = "320px", position = "right", swipeClose = true } = px(props);
    const isOpen = typeof open === "function" ? open : () => open;
    let unlock = null;
    effect(() => {
      if (isOpen()) {
        if (!unlock) unlock = lockScroll();
      } else {
        if (unlock) {
          unlock();
          unlock = null;
        }
      }
    });
    effect(() => {
      if (!isOpen()) return;
      const esc = (e) => {
        if (e.key === "Escape") onClose && onClose();
      };
      document.addEventListener("keydown", esc);
      onCleanup(() => document.removeEventListener("keydown", esc));
    });
    return show(isOpen, () => div2(
      {
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 2e3,
          background: "rgba(0,0,0,.4)",
          display: "flex",
          justifyContent: position === "left" ? "flex-start" : "flex-end"
        },
        on: { click: (e) => e.target.style.position === "fixed" && onClose && onClose() }
      },
      div2(
        {
          style: {
            background: "var(--x-text-inverse)",
            width: position === "top" || position === "bottom" ? "100%" : width,
            height: position === "top" || position === "bottom" ? width : "100%",
            display: "flex",
            flexDirection: "column"
          },
          on: { click: (e) => e.stopPropagation() }
        },
        div2(
          { style: {
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          } },
          div2({ style: { fontWeight: "600", fontSize: "15px" } }, title || ""),
          button({
            style: { border: 0, background: "transparent", cursor: "pointer", fontSize: "20px", color: "var(--x-text-dim)" },
            on: { click: onClose }
          }, "\xD7")
        ),
        div2({ style: { flex: 1, overflow: "auto", padding: "20px" } }, ...children)
      )
    ));
  }
  function Popconfirm(props, ...children) {
    const { title = "\u786E\u5B9A\u8981\u6267\u884C\u5417\uFF1F", onConfirm, onCancel, okText = "\u786E\u5B9A", cancelText = "\u53D6\u6D88" } = px(props);
    const visible = signal(false);
    return span2(
      { style: { position: "relative", display: "inline-block" } },
      span2({ on: { click: (e) => {
        e.stopPropagation();
        visible(!visible());
      } } }, ...children),
      show(visible, () => div2(
        {
          style: {
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 1e3,
            background: "var(--x-text-inverse)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,.1)",
            minWidth: "200px"
          }
        },
        div2({ style: { fontSize: "14px", marginBottom: "12px" } }, title),
        Row(
          { gap: 1, justify: "end" },
          Btn({ size: "sm", onClick: () => {
            visible(false);
            onCancel && onCancel();
          } }, cancelText),
          Btn({ size: "sm", type: "primary", onClick: () => {
            visible(false);
            onConfirm && onConfirm();
          } }, okText)
        )
      ))
    );
  }
  var msgContainer = null;
  function ensureMsgContainer() {
    if (msgContainer && msgContainer.isConnected) return msgContainer;
    if (typeof document === "undefined" || !document.body) return null;
    msgContainer = document.createElement("div");
    msgContainer.id = "__xunay-msg";
    msgContainer.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;pointer-events:none";
    document.body.appendChild(msgContainer);
    return msgContainer;
  }
  function pushMessage(text2, type, duration = 2e3) {
    const msgContainer2 = ensureMsgContainer();
    if (!msgContainer2) return;
    const el2 = document.createElement("div");
    const colors = { info: "var(--x-primary)", success: "var(--x-success)", warning: "var(--x-warning)", error: "var(--x-danger)" };
    el2.style.cssText = `background:#fff;padding:10px 16px;border-radius:8px;margin-bottom:8px;
    box-shadow:0 4px 12px rgba(0,0,0,.15);font-size:14px;color:${colors[type] || colors.info};
    border-left:3px solid ${colors[type] || colors.info};animation:slideIn .2s`;
    el2.textContent = text2;
    msgContainer2.appendChild(el2);
    setTimeout(() => el2.remove(), duration);
  }
  var Message = {
    info: (t, d) => pushMessage(t, "info", d),
    success: (t, d) => pushMessage(t, "success", d),
    warning: (t, d) => pushMessage(t, "warning", d),
    error: (t, d) => pushMessage(t, "error", d)
  };
  var notiContainer = null;
  function ensureNotiContainer() {
    if (notiContainer && notiContainer.isConnected) return notiContainer;
    if (typeof document === "undefined" || !document.body) return null;
    notiContainer = document.createElement("div");
    notiContainer.id = "__xunay-noti";
    notiContainer.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;width:340px";
    document.body.appendChild(notiContainer);
    return notiContainer;
  }
  function pushNotification({ title, desc, type = "info", duration = 4e3 }) {
    const notiContainer2 = ensureNotiContainer();
    if (!notiContainer2) return;
    const colors = { info: "var(--x-primary)", success: "var(--x-success)", warning: "var(--x-warning)", error: "var(--x-danger)" };
    const el2 = document.createElement("div");
    el2.style.cssText = `background:#fff;padding:14px 16px;border-radius:8px;margin-bottom:10px;
    box-shadow:0 8px 24px rgba(0,0,0,.15);border-left:3px solid ${colors[type]};animation:slideIn .2s`;
    const titleEl = document.createElement("div");
    titleEl.style.cssText = "font-weight:600;font-size:14px;margin-bottom:4px";
    titleEl.textContent = title || "";
    const descEl = document.createElement("div");
    descEl.style.cssText = "font-size:13px;color:#6b7280";
    descEl.textContent = desc || "";
    el2.appendChild(titleEl);
    el2.appendChild(descEl);
    notiContainer2.appendChild(el2);
    setTimeout(() => el2.remove(), duration);
  }
  var Notification = {
    info: (o) => pushNotification({ ...o, type: "info" }),
    success: (o) => pushNotification({ ...o, type: "success" }),
    warning: (o) => pushNotification({ ...o, type: "warning" }),
    error: (o) => pushNotification({ ...o, type: "error" })
  };
  if (typeof document !== "undefined" && !document.getElementById("__xunay-anim")) {
    const s = document.createElement("style");
    s.id = "__xunay-anim";
    s.textContent = "@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(s);
  }

  // ../../core/src/kit-nav2.js
  function Menu(props) {
    const { items = [], mode = "vertical", selected, onSelect } = px(props);
    const sel = () => typeof selected === "function" ? selected() : selected;
    const renderItem = (it, depth = 0) => div2({
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
    }, it.icon ? span2({ style: { marginRight: "8px" } }, it.icon) : null, it.label);
    return div2({
      style: { display: "flex", flexDirection: mode === "horizontal" ? "row" : "column", gap: "2px" }
    }, ...items.map((it) => renderItem(it)));
  }
  function BackTop(props) {
    const { top = 400, right = 40, bottom = 40 } = px(props);
    const visible = signal(false);
    effect(() => {
      const onScroll = () => visible(window.scrollY > top);
      window.addEventListener("scroll", onScroll);
      onScroll();
      onCleanup(() => window.removeEventListener("scroll", onScroll));
    });
    return show(visible, () => button({
      style: {
        position: "fixed",
        right: right + "px",
        bottom: bottom + "px",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "var(--x-primary)",
        color: "var(--x-text-inverse)",
        border: 0,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(31,111,235,.4)",
        fontSize: "18px",
        zIndex: 100
      },
      on: { click: () => window.scrollTo({ top: 0, behavior: "smooth" }) }
    }, "\u2191"));
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
      showText ? span2({ style: { fontSize: "12px", fontFamily: "monospace", color: "var(--x-text-dim)" } }, () => val() || "#000000") : null
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
  function Transfer(props) {
    const { data = [], value = [], onChange, titles = ["\u6E90\u5217\u8868", "\u5DF2\u9009"] } = px(props);
    const left = signal(data.filter((d) => !value.includes(d.key)));
    const right = signal(data.filter((d) => value.includes(d.key)));
    const selL = signal([]);
    const selR = signal([]);
    const Item = (it, side) => div2({
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
    const Box = (title, arr, side) => div2(
      {
        style: { flex: 1, border: "1px solid #e5e7eb", borderRadius: "8px", display: "flex", flexDirection: "column" }
      },
      div2({ style: { padding: "8px 12px", background: "var(--x-bg-soft)", borderBottom: "1px solid #e5e7eb", fontSize: "12px", fontWeight: "600" } }, title),
      div2(
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
    return div2(
      { style: { position: "relative" } },
      div2(
        {
          class: "input",
          style: { cursor: "pointer", display: "flex", justifyContent: "space-between" },
          on: { click: () => open(!open()) }
        },
        span2({ style: { color: val() ? "var(--x-text)" : "var(--x-text-mute)" } }, () => val() ? val().join(" / ") : placeholder),
        span2({ style: { color: "var(--x-text-mute)", fontSize: "12px" } }, "\u25BE")
      ),
      show(open, () => div2(
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
        div2(
          { style: { minWidth: "120px", borderRight: "1px solid #f3f4f6", padding: "4px" } },
          ...cur().chosen.map((c, i) => div2({
            style: { padding: "6px 10px", fontSize: "13px", cursor: "pointer" },
            on: { click: () => path(path().slice(0, i)) }
          }, c.label))
        ),
        div2(
          { style: { minWidth: "120px", padding: "4px" } },
          ...cur().list.map((o) => div2({
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
          }, o.label, o.children ? span2({ style: { color: "var(--x-text-mute)" } }, "\u203A") : null))
        )
      ))
    );
  }

  // ../../core/src/kit-display2.js
  function Watermark(props, ...children) {
    const { text: text2 = "XuNay", opacity = 0.1, rotate = -22, gap: gap2 = 100, fontSize = 16 } = px(props);
    return div2({
      style: {
        position: "relative",
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${gap2}' height='${gap2}'><text x='50%' y='50%' transform='rotate(${rotate} 50 50)' font-size='${fontSize}' fill='#000' opacity='${opacity}' text-anchor='middle'>${text2}</text></svg>`)}")`,
        backgroundRepeat: "repeat"
      }
    }, ...children);
  }
  function Ribbon(props, ...children) {
    const { text: text2, color: color2 = "var(--x-primary)", position = "end" } = px(props);
    return div2(
      { style: { position: "relative" } },
      ...children,
      div2({
        style: {
          position: "absolute",
          top: 0,
          [position === "start" ? "left" : "right"]: 0,
          background: color2,
          color: "var(--x-text-inverse)",
          padding: "4px 12px",
          fontSize: "12px",
          fontWeight: "600",
          borderRadius: position === "start" ? "0 0 6px 0" : "0 0 0 6px"
        }
      }, text2)
    );
  }
  function Keyboard(props, ...children) {
    return span2({
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
    const { text: text2 = "", keyword = "", color: color2 = "#fef08a" } = px(props);
    const parts = String(text2).split(new RegExp(`(${keyword})`, "gi"));
    return span2(null, ...parts.map(
      (p2) => p2.toLowerCase() === keyword.toLowerCase() ? span2({ style: { background: color2, padding: "0 2px", borderRadius: "2px" } }, p2) : p2
    ));
  }
  function Ellipsis(props, ...children) {
    const { lines = 1, tooltip = true } = px(props);
    const hoverSignal = signal(false);
    const setHover = (v) => hoverSignal(v);
    return span2({
      style: lines === 1 ? { display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" },
      on: { mouseenter: () => setHover(true), mouseleave: () => setHover(false) },
      title: tooltip ? void 0 : void 0
    }, ...children);
  }

  // ../../core/src/kit-editor2.js
  function Markdown(props) {
    const { value, onChange, preview = true, height = "300px" } = px(props);
    const val = () => typeof value === "function" ? value() : value || "";
    const parse = (md) => String(md).replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/^- (.+)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>").replace(/\n\n/g, "</p><p>").replace(/^(.+)$/gm, "<p>$1</p>");
    return Row(
      { gap: 2, style: { height } },
      div2(
        { style: { flex: 1, display: "flex", flexDirection: "column" } },
        div2({ style: { fontSize: "11px", color: "var(--x-text-mute)", padding: "6px 0" } }, "\u7F16\u8F91"),
        textarea({
          style: { flex: 1, width: "100%", padding: "12px", fontFamily: "ui-monospace,monospace", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "8px", resize: "none", outline: "none" },
          value: val(),
          on: { input: (e) => onChange && onChange(e.target.value) }
        })
      ),
      preview ? div2(
        { style: { flex: 1, display: "flex", flexDirection: "column" } },
        div2({ style: { fontSize: "11px", color: "var(--x-text-mute)", padding: "6px 0" } }, "\u9884\u89C8"),
        div2({ style: { flex: 1, padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "auto", fontSize: "14px", lineHeight: 1.6 }, html: () => sanitize(parse(val())) })
      ) : null
    );
  }
  function JSONViewer(props) {
    const { data, indent = 2, collapsed = false } = px(props);
    const val = () => typeof data === "function" ? data() : data;
    let text2 = "";
    try {
      text2 = JSON.stringify(val(), null, indent);
    } catch (e) {
      text2 = String(val());
    }
    return pre({ style: { background: "#0d1117", color: "#e6edf3", padding: "14px 16px", borderRadius: "8px", fontSize: "13px", fontFamily: "ui-monospace,monospace", lineHeight: 1.6, overflow: "auto", margin: 0 } }, text2);
  }
  function DiffViewer(props) {
    const { oldText = "", newText = "" } = px(props);
    const oldLines = String(oldText).split("\n");
    const newLines = String(newText).split("\n");
    const max = Math.max(oldLines.length, newLines.length);
    const rows = [];
    for (let i = 0; i < max; i++) {
      const o = oldLines[i], n = newLines[i];
      if (o === n) rows.push({ type: "same", text: n || "" });
      else {
        if (o !== void 0) rows.push({ type: "del", text: o });
        if (n !== void 0) rows.push({ type: "add", text: n });
      }
    }
    const bg = { same: "transparent", del: "var(--x-danger-soft)", add: "var(--x-success-soft)" };
    const prefix = { same: " ", del: "-", add: "+" };
    return pre(
      { style: { background: "var(--x-text-inverse)", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px 0", fontSize: "13px", fontFamily: "ui-monospace,monospace", overflow: "auto", margin: 0 } },
      ...rows.map((r) => div2({
        style: { padding: "2px 16px", background: bg[r.type], whiteSpace: "pre" }
      }, prefix[r.type] + " " + r.text))
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
  function Tooltip2(props) {
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
    const { data = [], labels = [], color: color2, showValue = true, stack, group, horizontal = false, title } = px(props);
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
          const fill = pickColor(i, color2 ? [color2] : null);
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
        Tooltip2({
          visible: () => hover() >= 0,
          x: () => mouse().x,
          y: () => mouse().y,
          containerW: w,
          title: () => hover() >= 0 ? labels[hover()] || "" : "",
          items: () => hover() >= 0 ? [{ color: pickColor(hover(), color2 ? [color2] : null), label: "\u503C", value: formatNum(data[hover()]) }] : []
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
    const { data = [], labels = [], color: color2, fill = false, smooth = true, dots = true, title, height = 240 } = px(props);
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
      const lineColor = color2 || "var(--x-primary)";
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
        Tooltip2({
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
        const color2 = d.color || pickColor(idx);
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
            fill: color2,
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
        Tooltip2({
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
    const { value = 0, size = 140, stroke = 12, color: color2, label: label2, title, animate = true } = px(props);
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
      const col = color2 || "var(--x-primary)";
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
    const { data = [], width = 120, height = 40, color: color2, area = false, strokeWidth = 2 } = px(props);
    const max = Math.max(...data, 0), min = Math.min(...data, 0);
    const range = max - min || 1;
    const step = data.length > 1 ? width / (data.length - 1) : 0;
    const pts = data.map((v, i) => ({ x: i * step, y: height - (v - min) / range * (height - 6) - 3 }));
    const linePath = "M" + pts.map((p2) => p2.x.toFixed(2) + "," + p2.y.toFixed(2)).join(" L");
    const areaPath = linePath + ` L${width},${height} L0,${height} Z`;
    const gid = uid("spark");
    const col = color2 || "var(--x-primary)";
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
    const { data = [], size = 260, levels = 4, max, color: color2, fillOpacity = 0.25, title } = px(props);
    const hover = signal(-1);
    const inner = (ctx2) => {
      const sz = Math.min(size, ctx2.h);
      const cx2 = sz / 2, cy = sz / 2, r = sz / 2 - 40;
      const n = data.length || 1;
      const mx = max || Math.max(...data.map((d) => d.value), 1);
      const angle = (i) => Math.PI * 2 * i / n - Math.PI / 2;
      const pt = (i, v) => ({ x: cx2 + Math.cos(angle(i)) * r * (v / mx), y: cy + Math.sin(angle(i)) * r * (v / mx) });
      const col = color2 || "var(--x-primary)";
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
    const { value = 0, size = 200, stroke = 18, color: color2, min = 0, max = 100, label: label2, title, zones } = px(props);
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
      const col = color2 || "var(--x-primary)";
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
    const { data = [], height = 240, color: color2, title } = px(props);
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
      const col = color2 || "var(--x-primary)";
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
        Tooltip2({
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
        Tooltip2({
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
        Tooltip2({
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
        Tooltip2({
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
        Tooltip2({
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

  // ../../core/src/kit-virtual.js
  function VirtualList(props) {
    const { items = [], itemHeight = 40, height = 400, overscan = 5, render: render2, keyFn } = px(props);
    const scrollTop = signal(0);
    const start = () => Math.max(0, Math.floor(scrollTop() / itemHeight) - overscan);
    const end = () => Math.min(items.length, Math.ceil((scrollTop() + height) / itemHeight) + overscan);
    const offset = () => start() * itemHeight;
    const visible = () => items.slice(start(), end());
    return div2(
      {
        style: { height: height + "px", overflowY: "auto", position: "relative", border: "1px solid var(--x-border)", borderRadius: "var(--x-radius)" },
        // V019 修复：rAF 节流
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
      div2(
        { style: { height: items.length * itemHeight + "px", position: "relative" } },
        div2(
          { style: () => ({ transform: "translateY(" + offset() + "px)", willChange: "transform" }) },
          ...visible().map(
            (item, i) => div2(
              { key: keyFn ? keyFn(item) : start() + i, style: { height: itemHeight + "px", display: "flex", alignItems: "center", padding: "0 12px", borderBottom: "1px solid var(--x-border)" } },
              render2 ? render2(item, start() + i) : String(item)
            )
          )
        )
      )
    );
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
      const { size = 20, color: color2, stroke = 1.8, style, class: cls, ...rest } = px(props);
      return S2("svg", {
        viewBox: "0 0 24 24",
        width: size,
        height: size,
        style: "display:inline-block;vertical-align:middle;flex-shrink:0;" + (color2 ? "color:" + color2 + ";" : "") + (style || ""),
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
  var theme = signal("light");
  var modalOpen = signal(false);
  var drawerOpen = signal(false);
  var cmdOpen = signal(false);
  var tab2 = signal("a");
  var page = signal(1);
  var check = signal(true);
  var rate = signal(3);
  var num = signal(5);
  var slider2 = signal(40);
  var color = signal("#1f6feb");
  var search = signal("");
  var pass = signal("");
  var text = signal("\u8FD9\u662F\u4E00\u6BB5\u53EF\u4EE5\u7F16\u8F91\u7684\u6587\u5B57");
  var ICON_GROUPS = [
    ["\u65B9\u5411", [IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown, IconChevronRight, IconChevronLeft, IconChevronDown, IconChevronUp, IconExternalLink]],
    ["\u64CD\u4F5C", [IconCheck, IconClose, IconPlus, IconMinus, IconSearch, IconMenu, IconMoreH, IconMoreV, IconRefresh, IconEdit, IconCopy, IconTrash, IconSave, IconDownload, IconUpload, IconShare, IconBookmark]],
    ["\u89C6\u56FE", [IconZoomIn, IconZoomOut, IconMaximize, IconMinimize, IconGrid, IconList, IconFilter, IconSort, IconEye, IconEyeOff]],
    ["\u7528\u6237", [IconUser, IconUsers, IconHeart, IconStar, IconMessage, IconBell, IconMail, IconPhone]],
    ["\u6587\u4EF6", [IconFile, IconFolder, IconImage, IconCalendar, IconClock, IconTag, IconFlag, IconCloud, IconDatabase, IconLink]],
    ["\u5730\u56FE", [IconMap, IconNavigation, IconCompass, IconPin]],
    ["\u5A92\u4F53", [IconPlay, IconPause, IconCamera, IconMic, IconVolume, IconVolumeOff]],
    ["\u72B6\u6001", [IconInfo, IconWarn, IconCheckCircle, IconXCircle, IconLock, IconUnlock, IconShield]],
    ["\u4E3B\u9898", [IconSun, IconMoon, IconHome, IconSettings]],
    ["\u5E03\u5C40", [IconLayout, IconSidebar, IconColumns, IconRows]]
  ];
  var section2 = (title, ...children) => Card(
    { title },
    Row({ gap: 2, wrap: true, align: "center" }, ...children)
  );
  var gap = () => (() => {
    const _div137 = document.createElement("div");
    Object.assign(_div137.style, { height: "16px" });
    return _div137;
  })();
  mount(() => (() => {
    const _div0 = document.createElement("div");
    applyStyle(_div0, "padding:24px;background:var(--x-bg-soft);min-height:100vh;font-family:system-ui");
    const _t1 = renderChild(Row(
      { gap: 2, align: "center", style: "margin-bottom:20px" },
      Text({ tag: "h1", size: "24px", bold: true }, "XuNay Kit \u5168\u5BB6\u798F"),
      Badge({ type: "primary" }, "106 \u7EC4\u4EF6"),
      Btn({ size: "sm", onClick: () => theme(theme() === "light" ? "dark" : "light") }, () => "\u4E3B\u9898\uFF1A" + theme())
    ));
    if (_t1) _div0.appendChild(_t1);
    const _t2 = renderChild(section2(
      "1. \u57FA\u7840",
      Btn(null, "\u9ED8\u8BA4"),
      Btn({ type: "primary" }, "\u4E3B\u8981"),
      Btn({ type: "dashed" }, "\u865A\u7EBF"),
      Btn({ type: "primary", disabled: true }, "\u7981\u7528"),
      Tag(null, "\u6807\u7B7E"),
      Tag({ type: "danger" }, "\u5371\u9669"),
      Badge({ type: "success" }, "\u5FBD\u7AE0"),
      Avatar({ text: "X" }),
      Spinner(),
      Count({ value: 5 }),
      Tooltip({ text: "\u8FD9\u662F\u63D0\u793A" }, "\u60AC\u505C\u770B\u770B")
    ));
    if (_t2) _div0.appendChild(_t2);
    const _t3 = renderChild(gap());
    if (_t3) _div0.appendChild(_t3);
    const _t4 = renderChild(section2(
      "2. \u8868\u5355",
      (() => {
        const _div5 = document.createElement("div");
        applyStyle(_div5, "display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;width:100%");
        const _t6 = renderChild(Input({ label: "\u59D3\u540D", placeholder: "\u8BF7\u8F93\u5165" }));
        if (_t6) _div5.appendChild(_t6);
        const _t7 = renderChild(Input({ label: "\u5E26\u9519\u8BEF", error: "\u5FC5\u586B" }));
        if (_t7) _div5.appendChild(_t7);
        const _t8 = renderChild(Select({ label: "\u57CE\u5E02", options: [{ value: "bj", label: "\u5317\u4EAC" }, { value: "sh", label: "\u4E0A\u6D77" }] }));
        if (_t8) _div5.appendChild(_t8);
        const _t9 = renderChild(DatePicker({ label: "\u65E5\u671F" }));
        if (_t9) _div5.appendChild(_t9);
        const _t10 = renderChild(TimePicker({ label: "\u65F6\u95F4" }));
        if (_t10) _div5.appendChild(_t10);
        const _t11 = renderChild(SearchInput({ value: () => search(), onChange: (v) => search(v) }));
        if (_t11) _div5.appendChild(_t11);
        const _t12 = renderChild(NumberInput({ label: "\u6570\u5B57", value: () => num(), onChange: (v) => num(v) }));
        if (_t12) _div5.appendChild(_t12);
        const _t13 = renderChild(Input({ label: "\u5BC6\u7801", type: "password", value: () => pass(), onChange: (v) => pass(v) }));
        if (_t13) _div5.appendChild(_t13);
        const _t14 = renderChild(Checkbox({ label: "\u540C\u610F", checked: () => check(), onChange: (v) => check(v) }));
        if (_t14) _div5.appendChild(_t14);
        const _t15 = renderChild(Radio({ label: "\u9009\u9879 A", name: "r", checked: true }));
        if (_t15) _div5.appendChild(_t15);
        const _t16 = renderChild(Switch({ label: "\u5F00\u5173" }));
        if (_t16) _div5.appendChild(_t16);
        return _div5;
      })()
    ));
    if (_t4) _div0.appendChild(_t4);
    const _t17 = renderChild(gap());
    if (_t17) _div0.appendChild(_t17);
    const _t18 = renderChild(section2(
      "3. \u8868\u5355\u6269\u5C55",
      (() => {
        const _div19 = document.createElement("div");
        applyStyle(_div19, "display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;width:100%");
        const _t20 = renderChild(ColorPicker({ value: () => color(), onChange: (v) => color(v) }));
        if (_t20) _div19.appendChild(_t20);
        const _div21 = document.createElement("div");
        const _t22 = renderChild(Text({ size: "13px", dim: true }, "\u6ED1\u52A8\u6761: " + slider2()));
        if (_t22) _div21.appendChild(_t22);
        const _t23 = renderChild(Slider({ value: () => slider2(), onChange: (v) => slider2(v) }));
        if (_t23) _div21.appendChild(_t23);
        _div19.appendChild(_div21);
        const _t24 = renderChild(Rate({ value: () => rate(), onChange: (v) => rate(v) }));
        if (_t24) _div19.appendChild(_t24);
        const _div25 = document.createElement("div");
        const _t26 = renderChild(Text({ size: "13px", dim: true }, "\u5BC6\u7801\u5F3A\u5EA6"));
        if (_t26) _div25.appendChild(_t26);
        const _t27 = renderChild(PasswordStrength({ value: () => pass() }));
        if (_t27) _div25.appendChild(_t27);
        _div19.appendChild(_div25);
        const _t28 = renderChild(Transfer({ data: [{ key: "a", label: "A" }, { key: "b", label: "B" }, { key: "c", label: "C" }], value: [] }));
        if (_t28) _div19.appendChild(_t28);
        const _t29 = renderChild(Cascader({ options: [{ value: "zj", label: "\u6D59\u6C5F", children: [{ value: "hz", label: "\u676D\u5DDE" }] }] }));
        if (_t29) _div19.appendChild(_t29);
        return _div19;
      })()
    ));
    if (_t18) _div0.appendChild(_t18);
    const _t30 = renderChild(gap());
    if (_t30) _div0.appendChild(_t30);
    const _t31 = renderChild(section2(
      "4. \u5C55\u793A",
      Alert({ type: "info", title: "\u63D0\u793A" }, "\u8FD9\u662F\u4FE1\u606F\u63D0\u793A"),
      Alert({ type: "success", title: "\u6210\u529F" }, "\u64CD\u4F5C\u6210\u529F"),
      Progress({ value: 65, showText: true }),
      Progress({ value: 40 }),
      (() => {
        const _div34 = document.createElement("div");
        applyStyle(_div34, "width:200px");
        const _t35 = renderChild(Text({ size: "13px", dim: true }, "\u5206\u6BB5\u8FDB\u5EA6"));
        if (_t35) _div34.appendChild(_t35);
        return _div34;
      })(),
      (() => {
        const _div32 = document.createElement("div");
        applyStyle(_div32, "width:200px");
        const _t33 = renderChild(BarChart({ data: [30, 60, 40, 80, 50], labels: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94"], height: 150 }));
        if (_t33) _div32.appendChild(_t33);
        return _div32;
      })()
    ));
    if (_t31) _div0.appendChild(_t31);
    const _t36 = renderChild(gap());
    if (_t36) _div0.appendChild(_t36);
    const _t37 = renderChild(section2(
      "5. \u5C55\u793A\u6269\u5C55",
      Row(
        { gap: 2 },
        Ribbon({ text: "New" }, Text({}, "\u5E26\u89D2\u6807")),
        Watermark({ text: "XUNAY" }, (() => {
          const _div38 = document.createElement("div");
          applyStyle(_div38, "padding:20px;border:1px solid var(--x-border)");
          _div38.appendChild(document.createTextNode("\u6C34\u5370\u5361\u7247"));
          return _div38;
        })())
      ),
      Keyboard(null, "Ctrl"),
      "+",
      Keyboard(null, "K"),
      Highlight({ text: "XuNay \u662F\u6700\u597D\u7684\u6846\u67B6", keyword: "\u6700\u597D" }),
      Ellipsis({ lines: 1, style: "width:150px" }, "\u8FD9\u662F\u4E00\u6BB5\u5F88\u957F\u5F88\u957F\u5F88\u957F\u5F88\u957F\u7684\u6587\u5B57\u8981\u88AB\u7701\u7565"),
      Stat({ label: "\u603B\u7528\u6237", value: 12800, unit: "\u4EBA", trend: 12 })
    ));
    if (_t37) _div0.appendChild(_t37);
    const _t39 = renderChild(gap());
    if (_t39) _div0.appendChild(_t39);
    const _t40 = renderChild(section2(
      "6. Modal & \u53CD\u9988",
      Btn({ type: "primary", onClick: () => modalOpen(true) }, "\u6253\u5F00 Modal"),
      Btn({ onClick: () => drawerOpen(true) }, "\u6253\u5F00 Drawer"),
      Btn({ onClick: () => Message.success("\u6210\u529F\u6D88\u606F") }, "Message"),
      Btn({ onClick: () => Notification.info({ title: "\u901A\u77E5", desc: "\u5185\u5BB9" }) }, "Notification"),
      Popconfirm({ title: "\u786E\u5B9A\u5220\u9664\uFF1F", onConfirm: () => Message.info("\u5DF2\u5220\u9664") }, Btn(null, "Popconfirm")),
      Popover({ content: "\u6C14\u6CE1\u5185\u5BB9" }, Btn(null, "Popover")),
      Dropdown({ items: [{ key: "1", label: "\u9009\u9879 1" }, { key: "2", label: "\u9009\u9879 2" }], onSelect: (i) => Message.info(i.label) }, Btn(null, "Dropdown \u25BE")),
      CopyButton({ text: "XuNay" }),
      Skeleton({ lines: 2 })
    ));
    if (_t40) _div0.appendChild(_t40);
    const _t41 = renderChild(gap());
    if (_t41) _div0.appendChild(_t41);
    const _t42 = renderChild(section2(
      "7. \u6570\u636E",
      (() => {
        const _div47 = document.createElement("div");
        applyStyle(_div47, "width:100%");
        const _t48 = renderChild(Table({
          columns: [
            { title: "ID", key: "id" },
            { title: "\u540D\u79F0", key: "name" },
            { title: "\u72B6\u6001", render: (r) => Tag({ type: r.ok ? "success" : "danger" }, r.ok ? "\u6B63\u5E38" : "\u5F02\u5E38") }
          ],
          data: [
            { id: 1, name: "\u670D\u52A1 A", ok: true },
            { id: 2, name: "\u670D\u52A1 B", ok: false },
            { id: 3, name: "\u670D\u52A1 C", ok: true }
          ]
        }));
        if (_t48) _div47.appendChild(_t48);
        return _div47;
      })(),
      (() => {
        const _div45 = document.createElement("div");
        applyStyle(_div45, "flex:1;min-width:200px");
        const _t46 = renderChild(List({
          items: [{ title: "\u9879\u76EE 1" }, { title: "\u9879\u76EE 2" }, { title: "\u9879\u76EE 3" }],
          hover: true,
          render: (it) => Row({ gap: 2, align: "center", style: "padding:8px" }, Badge({ type: "primary" }, "\u25CF"), it.title)
        }));
        if (_t46) _div45.appendChild(_t46);
        return _div45;
      })(),
      (() => {
        const _div43 = document.createElement("div");
        applyStyle(_div43, "flex:1;min-width:200px");
        const _t44 = renderChild(Timeline({
          items: [
            { time: "10:00", title: "\u521B\u5EFA\u8BA2\u5355", desc: "\u7528\u6237\u4E0B\u5355" },
            { time: "10:05", title: "\u652F\u4ED8\u6210\u529F", color: "var(--x-success)" },
            { time: "10:10", title: "\u53D1\u8D27", desc: "\u987A\u4E30 SF123" }
          ]
        }));
        if (_t44) _div43.appendChild(_t44);
        return _div43;
      })()
    ));
    if (_t42) _div0.appendChild(_t42);
    const _t49 = renderChild(gap());
    if (_t49) _div0.appendChild(_t49);
    const _t50 = renderChild(section2(
      "8. \u56FE\u8868",
      (() => {
        const _div79 = document.createElement("div");
        applyStyle(_div79, "background:#fff;padding:8px;border-radius:8px");
        const _t80 = renderChild(LineChart({ data: [20, 40, 30, 60, 80, 50, 70], labels: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"], height: 180 }));
        if (_t80) _div79.appendChild(_t80);
        return _div79;
      })(),
      (() => {
        const _div77 = document.createElement("div");
        applyStyle(_div77, "background:#fff;padding:8px;border-radius:8px");
        const _t78 = renderChild(BarChart({ data: [40, 70, 50, 90], labels: ["A", "B", "C", "D"], height: 180 }));
        if (_t78) _div77.appendChild(_t78);
        return _div77;
      })(),
      (() => {
        const _div75 = document.createElement("div");
        applyStyle(_div75, "background:#fff;padding:8px;border-radius:8px");
        const _t76 = renderChild(PieChart({ data: [{ value: 40, label: "A" }, { value: 30, label: "B" }, { value: 20, label: "C" }], size: 180 }));
        if (_t76) _div75.appendChild(_t76);
        return _div75;
      })(),
      (() => {
        const _div73 = document.createElement("div");
        applyStyle(_div73, "background:#fff;padding:20px;border-radius:8px");
        const _t74 = renderChild(RingProgress({ value: 72, size: 120 }));
        if (_t74) _div73.appendChild(_t74);
        return _div73;
      })(),
      (() => {
        const _div71 = document.createElement("div");
        applyStyle(_div71, "background:#fff;padding:20px;border-radius:8px");
        const _t72 = renderChild(DonutChart({ data: [{ value: 50, label: "A" }, { value: 30, label: "B" }, { value: 20, label: "C" }], size: 160 }));
        if (_t72) _div71.appendChild(_t72);
        return _div71;
      })(),
      (() => {
        const _div69 = document.createElement("div");
        applyStyle(_div69, "background:#fff;padding:20px;border-radius:8px");
        const _t70 = renderChild(GaugeChart({ value: 68, size: 160, label: "CPU" }));
        if (_t70) _div69.appendChild(_t70);
        return _div69;
      })(),
      (() => {
        const _div67 = document.createElement("div");
        applyStyle(_div67, "background:#fff;padding:20px;border-radius:8px");
        const _t68 = renderChild(RadarChart({ data: [{ label: "A", value: 80 }, { label: "B", value: 60 }, { label: "C", value: 90 }, { label: "D", value: 50 }, { label: "E", value: 70 }], size: 200 }));
        if (_t68) _div67.appendChild(_t68);
        return _div67;
      })(),
      (() => {
        const _div65 = document.createElement("div");
        applyStyle(_div65, "background:#fff;padding:8px;border-radius:8px");
        const _t66 = renderChild(AreaChart({ data: [20, 40, 30, 60, 80, 50, 70], labels: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"], height: 180 }));
        if (_t66) _div65.appendChild(_t66);
        return _div65;
      })(),
      (() => {
        const _div63 = document.createElement("div");
        applyStyle(_div63, "background:#fff;padding:8px;border-radius:8px");
        const _t64 = renderChild(WaterfallChart({ data: [20, -10, 15, -5, 30], labels: ["A", "B", "C", "D", "E"], height: 200 }));
        if (_t64) _div63.appendChild(_t64);
        return _div63;
      })(),
      (() => {
        const _div61 = document.createElement("div");
        applyStyle(_div61, "background:#fff;padding:8px;border-radius:8px");
        const _t62 = renderChild(ScatterChart({ data: [{ x: 10, y: 20 }, { x: 20, y: 50 }, { x: 30, y: 30 }, { x: 50, y: 80 }, { x: 70, y: 45 }, { x: 80, y: 90 }], height: 200 }));
        if (_t62) _div61.appendChild(_t62);
        return _div61;
      })(),
      (() => {
        const _div59 = document.createElement("div");
        applyStyle(_div59, "background:#fff;padding:8px;border-radius:8px");
        const _t60 = renderChild(FunnelChart({ data: [{ label: "\u8BBF\u95EE", value: 100 }, { label: "\u6CE8\u518C", value: 60 }, { label: "\u4E0B\u5355", value: 30 }], height: 200 }));
        if (_t60) _div59.appendChild(_t60);
        return _div59;
      })(),
      (() => {
        const _div57 = document.createElement("div");
        applyStyle(_div57, "background:#fff;padding:8px;border-radius:8px");
        const _t58 = renderChild(Treemap({ data: [{ label: "A", value: 50 }, { label: "B", value: 30 }, { label: "C", value: 20 }], width: 400, height: 180 }));
        if (_t58) _div57.appendChild(_t58);
        return _div57;
      })(),
      (() => {
        const _div55 = document.createElement("div");
        applyStyle(_div55, "background:#fff;padding:8px;border-radius:8px");
        const _t56 = renderChild(CandlestickChart({ data: [{ open: 100, high: 110, low: 95, close: 105 }, { open: 105, high: 115, low: 100, close: 102 }, { open: 102, high: 108, low: 90, close: 95 }, { open: 95, high: 105, low: 92, close: 103 }], labels: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB"], height: 200 }));
        if (_t56) _div55.appendChild(_t56);
        return _div55;
      })(),
      (() => {
        const _div53 = document.createElement("div");
        applyStyle(_div53, "background:#fff;padding:8px;border-radius:8px");
        const _t54 = renderChild(Sparkline({ data: [3, 5, 4, 7, 6, 9, 8, 11], width: 120, height: 40, area: true }));
        if (_t54) _div53.appendChild(_t54);
        return _div53;
      })(),
      (() => {
        const _div51 = document.createElement("div");
        applyStyle(_div51, "background:#fff;padding:8px;border-radius:8px");
        const _t52 = renderChild(Heatmap({ data: Array.from({ length: 7 }, (_, r) => Array.from({ length: 12 }, (_2, c) => Math.round(Math.random() * 20))), rows: 7, cols: 12, cell: 22 }));
        if (_t52) _div51.appendChild(_t52);
        return _div51;
      })()
    ));
    if (_t50) _div0.appendChild(_t50);
    const _t81 = renderChild(gap());
    if (_t81) _div0.appendChild(_t81);
    const _t82 = renderChild(section2(
      "9. \u5BFC\u822A",
      (() => {
        const _div85 = document.createElement("div");
        applyStyle(_div85, "width:100%");
        const _t86 = renderChild(Tabs({
          items: [{ key: "a", title: "\u6807\u7B7E A" }, { key: "b", title: "\u6807\u7B7E B" }, { key: "c", title: "\u6807\u7B7E C" }],
          active: () => tab2(),
          onChange: (k) => tab2(k)
        }));
        if (_t86) _div85.appendChild(_t86);
        return _div85;
      })(),
      (() => {
        const _div83 = document.createElement("div");
        applyStyle(_div83, "width:100%");
        const _t84 = renderChild(Breadcrumb({ items: [{ label: "\u9996\u9875" }, { label: "\u5217\u8868" }, { label: "\u8BE6\u60C5" }] }));
        if (_t84) _div83.appendChild(_t84);
        return _div83;
      })(),
      Pagination({ page: () => page(), total: 100, pageSize: 10, onChange: (p2) => page(p2) }),
      Steps({ steps: [{ label: "\u7B2C\u4E00\u6B65" }, { label: "\u7B2C\u4E8C\u6B65" }, { label: "\u7B2C\u4E09\u6B65" }], current: 1 })
    ));
    if (_t82) _div0.appendChild(_t82);
    const _t87 = renderChild(gap());
    if (_t87) _div0.appendChild(_t87);
    const _t88 = renderChild(section2(
      "10. \u6298\u53E0\u4E0E\u6811",
      (() => {
        const _div93 = document.createElement("div");
        applyStyle(_div93, "flex:1;min-width:220px");
        const _t94 = renderChild(Accordion({
          items: [{ title: "\u6298\u53E0 1", content: "\u5185\u5BB9 1" }, { title: "\u6298\u53E0 2", content: "\u5185\u5BB9 2" }]
        }));
        if (_t94) _div93.appendChild(_t94);
        return _div93;
      })(),
      (() => {
        const _div91 = document.createElement("div");
        applyStyle(_div91, "flex:1;min-width:220px");
        const _t92 = renderChild(Tree({
          data: [
            { key: "a", label: "\u7236\u8282\u70B9 A", children: [{ key: "a1", label: "\u5B50 A1" }, { key: "a2", label: "\u5B50 A2" }] },
            { key: "b", label: "\u7236\u8282\u70B9 B", children: [{ key: "b1", label: "\u5B50 B1" }] }
          ]
        }));
        if (_t92) _div91.appendChild(_t92);
        return _div91;
      })(),
      (() => {
        const _div89 = document.createElement("div");
        applyStyle(_div89, "flex:1;min-width:220px");
        const _t90 = renderChild(Menu({ items: [{ key: "1", label: "\u83DC\u5355 1" }, { key: "2", label: "\u83DC\u5355 2" }], selected: "1" }));
        if (_t90) _div89.appendChild(_t90);
        return _div89;
      })()
    ));
    if (_t88) _div0.appendChild(_t88);
    const _t95 = renderChild(gap());
    if (_t95) _div0.appendChild(_t95);
    const _t96 = renderChild(section2(
      "11. \u7F16\u8F91\u5668",
      (() => {
        const _div103 = document.createElement("div");
        applyStyle(_div103, "flex:1;min-width:300px");
        const _t104 = renderChild(Text({ size: "13px", dim: true }, "Markdown\uFF1A"));
        if (_t104) _div103.appendChild(_t104);
        const _t105 = renderChild(Markdown({ value: "# \u6807\u9898\n\n**\u7C97\u4F53** \u548C *\u659C\u4F53*\n\n- \u5217\u8868\u9879 1\n- \u5217\u8868\u9879 2", height: "200px" }));
        if (_t105) _div103.appendChild(_t105);
        return _div103;
      })(),
      (() => {
        const _div100 = document.createElement("div");
        applyStyle(_div100, "flex:1;min-width:300px");
        const _t101 = renderChild(Text({ size: "13px", dim: true }, "JSON \u67E5\u770B\u5668\uFF1A"));
        if (_t101) _div100.appendChild(_t101);
        const _t102 = renderChild(JSONViewer({ data: { name: "XuNay", version: "1.2.8", features: ["signal", "compiler"] } }));
        if (_t102) _div100.appendChild(_t102);
        return _div100;
      })(),
      (() => {
        const _div97 = document.createElement("div");
        applyStyle(_div97, "flex:1;min-width:300px");
        const _t98 = renderChild(Text({ size: "13px", dim: true }, "Diff\uFF1A"));
        if (_t98) _div97.appendChild(_t98);
        const _t99 = renderChild(DiffViewer({ oldText: "line 1\nline 2\nline 3", newText: "line 1\nline 2 modified\nline 3\nline 4" }));
        if (_t99) _div97.appendChild(_t99);
        return _div97;
      })()
    ));
    if (_t96) _div0.appendChild(_t96);
    const _t106 = renderChild(gap());
    if (_t106) _div0.appendChild(_t106);
    const _t107 = renderChild(section2(
      "12. \u4E0A\u4F20",
      (() => {
        const _div110 = document.createElement("div");
        applyStyle(_div110, "flex:1;min-width:250px");
        const _t111 = renderChild(DragUpload({ onFiles: (f) => Message.success("\u9009\u4E2D " + f.length + " \u4E2A\u6587\u4EF6") }));
        if (_t111) _div110.appendChild(_t111);
        return _div110;
      })(),
      (() => {
        const _div108 = document.createElement("div");
        applyStyle(_div108, "flex:1;min-width:250px");
        const _t109 = renderChild(ImageUpload({ onFile: (f) => Message.success("\u56FE\u7247: " + f.name) }));
        if (_t109) _div108.appendChild(_t109);
        return _div108;
      })()
    ));
    if (_t107) _div0.appendChild(_t107);
    const _t112 = renderChild(gap());
    if (_t112) _div0.appendChild(_t112);
    const _t113 = renderChild(section2(
      "13. \u865A\u62DF\u6EDA\u52A8",
      (() => {
        const _div114 = document.createElement("div");
        applyStyle(_div114, "flex:1;min-width:280px");
        const _t115 = renderChild(Text({ size: "13px", dim: true }, "1000 \u9879\u865A\u62DF\u5217\u8868\uFF1A"));
        if (_t115) _div114.appendChild(_t115);
        const _t116 = renderChild(VirtualList({
          items: Array.from({ length: 1e3 }, (_, i) => "\u9879\u76EE " + (i + 1)),
          itemHeight: 36,
          height: 300
        }));
        if (_t116) _div114.appendChild(_t116);
        return _div114;
      })()
    ));
    if (_t113) _div0.appendChild(_t113);
    const _t117 = renderChild(gap());
    if (_t117) _div0.appendChild(_t117);
    const _t118 = renderChild(section2(
      "13.5 SVG \u56FE\u6807\uFF0879 \u4E2A\uFF09",
      (() => {
        const _div119 = document.createElement("div");
        applyStyle(_div119, "width:100%");
        const _t120 = renderChild(ICON_GROUPS.map(
          ([name, icons]) => (() => {
            const _div121 = document.createElement("div");
            applyStyle(_div121, "margin-bottom:20px");
            const _div122 = document.createElement("div");
            applyStyle(_div122, "font-size:12px;font-weight:600;color:var(--x-text-dim);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px");
            const _t123 = renderChild(name);
            if (_t123) _div122.appendChild(_t123);
            _div121.appendChild(_div122);
            const _div124 = document.createElement("div");
            applyStyle(_div124, "display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px");
            const _t125 = renderChild(icons.map(
              (Icon, i) => (() => {
                const _div126 = document.createElement("div");
                applyStyle(_div126, "display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;background:var(--x-bg-elev);border:1px solid var(--x-border);border-radius:var(--x-radius);color:var(--x-text);cursor:pointer;transition:all .15s");
                _div126.addEventListener("mouseenter", (e) => {
                  e.currentTarget.style.borderColor = "var(--x-primary)";
                  e.currentTarget.style.color = "var(--x-primary)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                });
                _div126.addEventListener("mouseleave", (e) => {
                  e.currentTarget.style.borderColor = "var(--x-border)";
                  e.currentTarget.style.color = "var(--x-text)";
                  e.currentTarget.style.transform = "none";
                });
                const _t127 = renderChild(Icon({ size: 22 }));
                if (_t127) _div126.appendChild(_t127);
                const _div128 = document.createElement("div");
                applyStyle(_div128, "font-size:9px;color:var(--x-text-mute);font-family:var(--x-mono);text-align:center;line-height:1.2;overflow:hidden;text-overflow:ellipsis;width:100%");
                const _t129 = renderChild("i" + i);
                if (_t129) _div128.appendChild(_t129);
                _div126.appendChild(_div128);
                return _div126;
              })()
            ));
            if (_t125) _div124.appendChild(_t125);
            _div121.appendChild(_div124);
            return _div121;
          })()
        ));
        if (_t120) _div119.appendChild(_t120);
        return _div119;
      })()
    ));
    if (_t118) _div0.appendChild(_t118);
    const _t130 = renderChild(gap());
    if (_t130) _div0.appendChild(_t130);
    const _t131 = renderChild(section2(
      "14. \u72B6\u6001",
      Result({ status: "success", title: "\u64CD\u4F5C\u6210\u529F", subTitle: "\u6570\u636E\u5DF2\u4FDD\u5B58" }),
      Empty({ text: "\u6682\u65E0\u6570\u636E" }),
      (() => {
        const _div132 = document.createElement("div");
        applyStyle(_div132, "flex:1;min-width:200px");
        const _t133 = renderChild(Descriptions({ items: [{ label: "\u59D3\u540D", value: "XuNay" }, { label: "\u7248\u672C", value: "1.2.8" }], bordered: true }));
        if (_t133) _div132.appendChild(_t133);
        return _div132;
      })()
    ));
    if (_t131) _div0.appendChild(_t131);
    const _t134 = renderChild(Modal({
      open: () => modalOpen(),
      onClose: () => modalOpen(false),
      title: "Modal \u6F14\u793A",
      footer: Row(
        { gap: 1, justify: "end" },
        Btn({ onClick: () => modalOpen(false) }, "\u53D6\u6D88"),
        Btn({ type: "primary", onClick: () => {
          Message.success("\u786E\u5B9A");
          modalOpen(false);
        } }, "\u786E\u5B9A")
      )
    }, "\u8FD9\u662F\u4E00\u4E2A Modal\uFF0C\u70B9 ESC \u6216\u906E\u7F69\u5173\u95ED\u3002"));
    if (_t134) _div0.appendChild(_t134);
    const _t135 = renderChild(Drawer({
      open: () => drawerOpen(),
      onClose: () => drawerOpen(false),
      title: "\u62BD\u5C49\u6807\u9898"
    }, Text({}, "\u62BD\u5C49\u5185\u5BB9"), Text({}, "\u53EF\u4EE5\u653E\u4EFB\u4F55\u4E1C\u897F")));
    if (_t135) _div0.appendChild(_t135);
    const _t136 = renderChild(BackTop());
    if (_t136) _div0.appendChild(_t136);
    return _div0;
  })(), "#app");
})();
