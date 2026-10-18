(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from2, except, desc) => {
    if (from2 && typeof from2 === "object" || typeof from2 === "function") {
      for (let key of __getOwnPropNames(from2))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // ../../node_modules/react-is/cjs/react-is.development.js
  var require_react_is_development = __commonJS({
    "../../node_modules/react-is/cjs/react-is.development.js"(exports) {
      "use strict";
      (function() {
        function typeOf(object) {
          if ("object" === typeof object && null !== object) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                switch (object = object.type, object) {
                  case REACT_FRAGMENT_TYPE2:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                  case REACT_SUSPENSE_LIST_TYPE:
                  case REACT_VIEW_TRANSITION_TYPE:
                    return object;
                  default:
                    switch (object = object && object.$$typeof, object) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                        return object;
                      case REACT_CONSUMER_TYPE:
                        return object;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
        }
        var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE2 = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
        exports.ContextConsumer = REACT_CONSUMER_TYPE;
        exports.ContextProvider = REACT_CONTEXT_TYPE;
        exports.Element = REACT_ELEMENT_TYPE;
        exports.ForwardRef = REACT_FORWARD_REF_TYPE;
        exports.Fragment = REACT_FRAGMENT_TYPE2;
        exports.Lazy = REACT_LAZY_TYPE;
        exports.Memo = REACT_MEMO_TYPE;
        exports.Portal = REACT_PORTAL_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.SuspenseList = REACT_SUSPENSE_LIST_TYPE;
        exports.isContextConsumer = function(object) {
          return typeOf(object) === REACT_CONSUMER_TYPE;
        };
        exports.isContextProvider = function(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        };
        exports.isElement = function(object) {
          return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
        };
        exports.isForwardRef = function(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        };
        exports.isFragment = function(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE2;
        };
        exports.isLazy = function(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        };
        exports.isMemo = function(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        };
        exports.isPortal = function(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        };
        exports.isProfiler = function(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        };
        exports.isStrictMode = function(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        };
        exports.isSuspense = function(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        };
        exports.isSuspenseList = function(object) {
          return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
        };
        exports.isValidElementType = function(type) {
          return "string" === typeof type || "function" === typeof type || type === REACT_FRAGMENT_TYPE2 || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_VIEW_TRANSITION_TYPE || "object" === typeof type && null !== type && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || void 0 !== type.getModuleId) ? true : false;
        };
        exports.typeOf = typeOf;
      })();
    }
  });

  // ../../node_modules/react-is/index.js
  var require_react_is = __commonJS({
    "../../node_modules/react-is/index.js"(exports, module2) {
      "use strict";
      if (false) {
        module2.exports = null;
      } else {
        module2.exports = require_react_is_development();
      }
    }
  });

  // ../../node_modules/is-mobile/index.js
  var require_is_mobile = __commonJS({
    "../../node_modules/is-mobile/index.js"(exports, module2) {
      "use strict";
      module2.exports = isMobile2;
      module2.exports.isMobile = isMobile2;
      module2.exports.default = isMobile2;
      var mobileRE = /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|redmi|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
      var notMobileRE = /CrOS/;
      var tabletRE = /android|ipad|playbook|silk/i;
      function isMobile2(opts) {
        if (!opts) opts = {};
        let ua = opts.ua;
        if (!ua && typeof navigator !== "undefined") ua = navigator.userAgent;
        if (ua && ua.headers && typeof ua.headers["user-agent"] === "string") {
          ua = ua.headers["user-agent"];
        }
        if (typeof ua !== "string") return false;
        let result = mobileRE.test(ua) && !notMobileRE.test(ua) || !!opts.tablet && tabletRE.test(ua);
        if (!result && opts.tablet && opts.featureDetect && navigator && navigator.maxTouchPoints > 1 && ua.indexOf("Macintosh") !== -1 && ua.indexOf("Safari") !== -1) {
          result = true;
        }
        return result;
      }
    }
  });

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
      const next2 = link._nextSource;
      if (link._version !== v) removeLink(link);
      link = next2;
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
        let next2 = null;
        while (rt.pendingComputeds.size > 0 && !next2) {
          const c = rt.pendingComputeds.values().next().value;
          rt.pendingComputeds.delete(c);
          if (rt.pendingEffects.has(c)) next2 = c;
        }
        while (!next2 && rt.pendingEffectQueueHead < rt.pendingEffectQueue.length) {
          const c = rt.pendingEffectQueue[rt.pendingEffectQueueHead++];
          if (rt.pendingEffects.has(c)) next2 = c;
        }
        if (!next2) {
          next2 = rt.pendingEffects.values().next().value;
          if (next2 && next2.__xunayComputedInternal) rt.pendingComputeds.delete(next2);
        }
        if (!next2) break;
        rt.pendingEffects.delete(next2);
        if (next2.disposed) continue;
        if (!next2.__xunayComputedInternal) {
          const count = (runCounts.get(next2) || 0) + 1;
          runCounts.set(next2, count);
          if (count > maxRuns) {
            if (!hasError) {
              firstError = new Error("[XuNay] effect \u6B7B\u5FAA\u73AF");
              hasError = true;
            }
            continue;
          }
        }
        try {
          next2.run();
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
        const prev2 = _currentEffect;
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
          _currentEffect = prev2;
          if (_dev) runtime.currentEffect = prev2;
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
      const prev2 = _currentEffect;
      const prevTV = _activeTrackingVersion;
      _currentEffect = e;
      _activeTrackingVersion = ++e._trackingVersion;
      try {
        fn();
      } finally {
        _currentEffect = prev2;
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
  var currentRoot = null;
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
    let node2 = e.target;
    while (node2 && node2 !== root) {
      const hs = node2.__xunay_handlers;
      if (hs && hs[e.type]) {
        const arr = hs[e.type];
        for (let i = 0; i < arr.length; i++) {
          arr[i](e);
          if (e.cancelBubble) return;
        }
      }
      if (e.cancelBubble) return;
      node2 = node2.parentNode;
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
  function walk(node2) {
    for (const child of [...node2.children]) walk(child);
    for (const el2 of [...node2.children]) {
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
      const h7 = document.createElement("span");
      h7.style.display = "contents";
      for (const c of v.children) h7.appendChild(render(c));
      return h7;
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
    const h7 = document.createElement("span");
    h7.style.display = "contents";
    const outer = createScope(runtime.currentScope);
    h7.__xunay_scope = outer;
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
            h7.appendChild(cur);
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
    return h7;
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
        let r2, err2 = null;
        try {
          r2 = c();
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
        } else if (r2 && r2.__xunay_list) {
          gs();
          applyList(dom, r2);
        } else if (r2 && r2.__xunay_show) {
          gs();
          dom.appendChild(renderShow(r2));
        } else if (r2 && typeof Node !== "undefined" && r2 instanceof Node) {
          gs();
          dom.appendChild(r2);
        } else if (r2 && (r2[ELEMENT] || r2[FRAGMENT])) {
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
        const prev2 = [];
        runInScope(scope, () => {
          effect(() => {
            for (let i = 0; i < N2; i++) {
              const b = bind[i], t = b[0];
              if (t === 0) {
                const n = b[2]();
                const s = n == null ? "" : String(n);
                if (s !== prev2[i]) {
                  b[1].textContent = s;
                  prev2[i] = s;
                }
              } else if (t === 1) {
                const n = b[2]();
                if (n !== prev2[i]) {
                  set(dom, b[1], n);
                  prev2[i] = n;
                }
              } else if (t === 2) {
                let c = "";
                for (const x in b[1]) {
                  const on = typeof b[1][x] === "function" ? b[1][x]() : b[1][x];
                  if (on) c += (c ? " " : "") + x;
                }
                if (c !== prev2[i]) {
                  dom.className = c;
                  prev2[i] = c;
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
          const next2 = j + 1 < N2 ? newDoms[j + 1] : null;
          holder.insertBefore(newDoms[j], next2);
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

  // ../../core/src/rt.js
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
  function bindText(node2, fn) {
    let prev2 = void 0;
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
        if (mode === "text" && s === prev2) return;
        node2.textContent = s;
        prev2 = s;
        mode = "text";
        return;
      }
      if (mode === "node" && v === prev2) return;
      clearInner();
      node2.textContent = "";
      innerScope = createScope(runtime.currentScope);
      let r2;
      runInScope(innerScope, () => {
        r2 = render(v);
      });
      if (r2) node2.appendChild(r2);
      prev2 = v;
      mode = "node";
      onCleanup(clearInner);
    });
  }
  function bindAttr(el2, name, fn) {
    let prev2;
    effect(() => {
      const v = fn();
      if (v === prev2) return;
      prev2 = v;
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
    let prev2 = {};
    effect(() => {
      const s = fn();
      if (s == null) {
        el2.style.cssText = "";
        prev2 = {};
        return;
      }
      if (typeof s === "string") {
        el2.style.cssText = s;
        prev2 = {};
        return;
      }
      if (typeof s !== "object") return;
      for (const k of Object.keys(prev2)) if (!(k in s)) el2.style[k] = "";
      for (const k of Object.keys(s)) if (el2.style[k] !== s[k]) el2.style[k] = s[k];
      prev2 = s;
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
  function applyStyle(el2, style2) {
    if (style2 == null) return;
    if (typeof style2 === "string") el2.style.cssText = style2;
    else if (typeof style2 === "object") Object.assign(el2.style, style2);
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
      renderChild,
      bindTextDirect,
      bindStyle,
      applyProps,
      applyStyle,
      classNames,
      createStatic,
      toString
    };
  }

  // ../../core/src/index.js
  install();

  // ../../core/src/react-compat.js
  var react_compat_exports = {};
  __export(react_compat_exports, {
    Children: () => Children,
    Component: () => Component,
    Fragment: () => Fragment,
    PureComponent: () => PureComponent,
    StrictMode: () => StrictMode,
    Suspense: () => Suspense,
    act: () => act,
    cloneElement: () => cloneElement,
    createContext: () => createContext,
    createElement: () => createElement2,
    createFactory: () => createFactory,
    createPortal: () => createPortal,
    createRoot: () => createRoot,
    default: () => react_compat_default,
    findDOMNode: () => findDOMNode,
    flushSync: () => flushSync,
    forwardRef: () => forwardRef,
    hydrateRoot: () => hydrateRoot,
    isValidElement: () => isValidElement,
    jsx: () => jsx,
    jsxDEV: () => jsxDEV,
    jsxs: () => jsxs,
    lazy: () => lazy2,
    memo: () => memo,
    render: () => render2,
    startTransition: () => startTransition,
    unmountComponentAtNode: () => unmountComponentAtNode,
    unstable_batchedUpdates: () => unstable_batchedUpdates,
    unstable_renderSubtreeIntoContainer: () => unstable_renderSubtreeIntoContainer,
    useCallback: () => useCallback,
    useContext: () => useContext,
    useDebugValue: () => useDebugValue,
    useDeferredValue: () => useDeferredValue,
    useEffect: () => useEffect,
    useId: () => useId,
    useImperativeHandle: () => useImperativeHandle,
    useInsertionEffect: () => useInsertionEffect,
    useLayoutEffect: () => useLayoutEffect,
    useMemo: () => useMemo,
    useOptimistic: () => useOptimistic,
    useReducer: () => useReducer,
    useRef: () => useRef,
    useState: () => useState,
    useSyncExternalStore: () => useSyncExternalStore,
    useTransition: () => useTransition,
    version: () => version
  });
  var REACT_ELEMENT = Symbol.for("react.element");
  var REACT_FRAGMENT = Symbol.for("react.fragment");
  var REACT_PROVIDER = Symbol.for("react.provider");
  var REACT_PORTAL = Symbol.for("react.portal");
  var currentInstance = null;
  var currentContexts = /* @__PURE__ */ new Map();
  var uid = 0;
  var Instance = class {
    constructor(vnode) {
      this.id = ++uid;
      this.vnode = vnode;
      this.hooks = [];
      this.hookIndex = 0;
      this.contexts = /* @__PURE__ */ new Map();
      this.portals = [];
      this.startMark = document.createComment("c" + this.id + "s");
      this.endMark = document.createComment("c" + this.id + "e");
      this.startMark._inst = this;
      this.endMark._inst = this;
      this.effectQueue = [];
      this.cleanupQueue = [];
      this.updateScheduled = false;
    }
  };
  function createElement2(type, config, ...children) {
    const props = {};
    let key = null;
    let ref2 = null;
    if (config) {
      for (const k in config) {
        if (k === "key") {
          key = config[k];
          continue;
        }
        if (k === "ref") {
          ref2 = config[k];
          continue;
        }
        props[k] = config[k];
      }
    }
    if (children.length === 1) props.children = children[0];
    else if (children.length > 1) props.children = children;
    const vnode = { $$typeof: REACT_ELEMENT, type, key, props };
    if (ref2 !== null) vnode.ref = ref2;
    return vnode;
  }
  function isValidElement(v) {
    return v != null && typeof v === "object" && v.$$typeof === REACT_ELEMENT;
  }
  function cloneElement(vnode, config, ...children) {
    const props = { ...vnode.props, ...config || {} };
    if (children.length === 1) props.children = children[0];
    else if (children.length > 1) props.children = children;
    return {
      $$typeof: REACT_ELEMENT,
      type: vnode.type,
      key: config && config.key != null ? config.key : vnode.key,
      props
    };
  }
  var Fragment = REACT_FRAGMENT;
  var pendingInstances = /* @__PURE__ */ new Set();
  var scheduled = false;
  function scheduleUpdate(inst) {
    pendingInstances.add(inst);
    if (scheduled) return;
    scheduled = true;
    Promise.resolve().then(flushUpdates);
  }
  function scheduleUpdateAll() {
    for (const inst of allInstances) scheduleUpdate(inst);
  }
  var allInstances = /* @__PURE__ */ new Set();
  var pendingEffectInstances = /* @__PURE__ */ new Set();
  var flushScheduled = false;
  function scheduleFlushEffects() {
    if (flushScheduled) return;
    flushScheduled = true;
    queueMicrotask(() => {
      flushScheduled = false;
      flushEffectsNow();
    });
  }
  function flushEffectsNow() {
    const list2 = Array.from(pendingEffectInstances);
    pendingEffectInstances.clear();
    for (const inst of list2) runEffects(inst);
  }
  function flushUpdates() {
    scheduled = false;
    const list2 = Array.from(pendingInstances);
    pendingInstances.clear();
    for (const inst of list2) rerenderInstance(inst);
  }
  function hookSlot() {
    const inst = currentInstance;
    if (!inst) throw new Error("[xunay/compat] hooks \u53EA\u80FD\u5728\u7EC4\u4EF6\u5185\u8C03\u7528");
    const idx = inst.hookIndex++;
    if (inst.hooks.length <= idx) inst.hooks[idx] = {};
    return { inst, idx, slot: inst.hooks[idx] };
  }
  function useState(init) {
    const { inst, slot } = hookSlot();
    if (!("value" in slot)) {
      slot.value = typeof init === "function" ? init() : init;
      slot.setter = (action) => {
        const next2 = typeof action === "function" ? action(slot.value) : action;
        if (Object.is(next2, slot.value)) return;
        slot.value = next2;
        scheduleUpdate(inst);
      };
    }
    return [slot.value, slot.setter];
  }
  function depsChanged(prev2, next2) {
    if (!prev2) return true;
    if (!next2) return true;
    if (prev2.length !== next2.length) return true;
    for (let i = 0; i < prev2.length; i++) if (!Object.is(prev2[i], next2[i])) return true;
    return false;
  }
  function useEffectImpl(fn, deps, layout) {
    const { inst, slot } = hookSlot();
    if (!("deps" in slot)) {
      slot.deps = deps;
      slot.fn = fn;
      slot.layout = layout;
      inst.effectQueue.push(slot);
      return;
    }
    if (depsChanged(slot.deps, deps)) {
      slot.deps = deps;
      slot.fn = fn;
      slot.layout = layout;
      inst.effectQueue.push(slot);
    }
  }
  function useEffect(fn, deps) {
    useEffectImpl(fn, deps, false);
  }
  function useLayoutEffect(fn, deps) {
    useEffectImpl(fn, deps, true);
  }
  function useMemo(fn, deps) {
    const { slot } = hookSlot();
    if (!("value" in slot) || depsChanged(slot.deps, deps)) {
      slot.value = fn();
      slot.deps = deps;
    }
    return slot.value;
  }
  function useCallback(fn, deps) {
    return useMemo(() => fn, deps);
  }
  function useRef(init) {
    const { slot } = hookSlot();
    if (!("current" in slot)) slot.current = init;
    return slot;
  }
  function useReducer(reducer, init, initFn) {
    const [state, setState] = useState(initFn ? initFn(init) : init);
    const dispatch2 = useCallback((action) => setState((prev2) => reducer(prev2, action)), [reducer]);
    return [state, dispatch2];
  }
  function useId() {
    const { slot } = hookSlot();
    if (!("id" in slot)) slot.id = ":x" + (++uid).toString(36);
    return slot.id;
  }
  function useImperativeHandle(ref2, create, deps) {
    useEffect(() => {
      if (!ref2) return;
      let value;
      try {
        value = create();
      } catch (e) {
        console.error("[compat] useImperativeHandle create \u5931\u8D25:", e);
        return;
      }
      if (typeof ref2 === "function") {
        try {
          ref2(value);
        } catch (_) {
        }
      } else if (ref2 && typeof ref2 === "object") ref2.current = value;
      return () => {
        if (typeof ref2 === "function") {
          try {
            ref2(null);
          } catch (_) {
          }
        } else if (ref2 && typeof ref2 === "object") ref2.current = null;
      };
    }, deps);
  }
  function useDebugValue() {
  }
  function createContext(defaultValue) {
    const key = Symbol("xunay-ctx");
    const ctx2 = {
      $$typeof: Symbol.for("react.context"),
      _key: key,
      _defaultValue: defaultValue,
      Provider(props) {
        return {
          $$typeof: REACT_PROVIDER,
          _key: key,
          value: props.value,
          children: props.children
        };
      }
    };
    return ctx2;
  }
  function useContext(ctx2) {
    if (ctx2 && ctx2._key && currentContexts.has(ctx2._key)) {
      return currentContexts.get(ctx2._key);
    }
    return ctx2 ? ctx2._defaultValue : void 0;
  }
  function memo(comp) {
    const M = (props) => comp(props);
    M._isMemo = true;
    return M;
  }
  function forwardRef(render4) {
    const F = function forwardRefWrapper(props, ref2) {
      return render4(props, ref2 !== void 0 ? ref2 : props.ref);
    };
    F._isForwardRef = true;
    return F;
  }
  function lazy2(loader) {
    let Comp = null;
    let started = false;
    let status = "pending";
    let error = null;
    const L = (props) => {
      if (status === "resolved") return Comp(props);
      if (status === "rejected") throw error;
      if (!started) {
        started = true;
        loader().then((m) => {
          Comp = m.default || m;
          status = "resolved";
          scheduleUpdateAll();
        }).catch((e) => {
          status = "rejected";
          error = e;
          scheduleUpdateAll();
        });
      }
      return null;
    };
    L.__lazy = true;
    L.__status = () => status;
    return L;
  }
  function hasPendingLazy(vnode) {
    if (!vnode) return false;
    if (typeof vnode === "function") {
      if (vnode.__lazy && vnode.__status() === "pending") return true;
      return false;
    }
    if (Array.isArray(vnode)) return vnode.some(hasPendingLazy);
    if (vnode.$$typeof === REACT_ELEMENT) {
      if (typeof vnode.type === "function" && vnode.type.__lazy) {
        return vnode.type.__status() === "pending";
      }
      return hasPendingLazy(vnode.props && vnode.props.children);
    }
    return false;
  }
  function Suspense(props) {
    const children = props.children;
    if (hasPendingLazy(children)) {
      return props.fallback !== void 0 ? props.fallback : null;
    }
    return children;
  }
  function StrictMode({ children }) {
    return children;
  }
  function useInsertionEffect(fn, deps) {
    useEffectImpl(fn, deps, true);
  }
  function createPortal(children, container, key) {
    if (!container) {
      console.warn("[xunay/compat] createPortal: container \u4E3A\u7A7A");
      return null;
    }
    return {
      $$typeof: REACT_PORTAL,
      children,
      container,
      key: key != null ? String(key) : null
    };
  }
  function flushSync(fn) {
    if (typeof fn === "function") return fn();
    return void 0;
  }
  function unstable_batchedUpdates(fn, a2) {
    if (typeof fn === "function") return fn(a2);
    return void 0;
  }
  function unstable_renderSubtreeIntoContainer() {
    console.warn("[xunay/compat] unstable_renderSubtreeIntoContainer \u672A\u5B9E\u73B0");
    return null;
  }
  function createFactory(type) {
    return function(config, ...children) {
      return createElement2(type, config, ...children);
    };
  }
  function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    const [, forceUpdate] = useState(0);
    const [, setTick] = useState(0);
    useEffect(() => {
      let alive = true;
      const check = () => {
        if (!alive) return;
        try {
          setTick((t) => (t + 1) % 1e6);
        } catch (_) {
        }
      };
      let unsub = null;
      try {
        unsub = subscribe(check);
      } catch (e) {
        console.error("[xunay/compat] useSyncExternalStore subscribe \u5931\u8D25:", e);
      }
      return () => {
        alive = false;
        if (typeof unsub === "function") {
          try {
            unsub();
          } catch (_) {
          }
        }
      };
    }, [subscribe]);
    try {
      return getSnapshot();
    } catch (e) {
      console.error("[xunay/compat] useSyncExternalStore getSnapshot \u5931\u8D25:", e);
      return void 0;
    }
  }
  function act(fn) {
    const r2 = typeof fn === "function" ? fn() : fn;
    if (r2 && typeof r2.then === "function") {
      return r2.then(() => {
      });
    }
    return r2;
  }
  function startTransition(fn) {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        try {
          fn();
        } catch (e) {
          console.error(e);
        }
      });
    } else {
      fn();
    }
  }
  function useTransition() {
    const [pending, setPending] = useState(false);
    const start = useCallback((fn) => {
      setPending(true);
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => {
          try {
            fn();
          } finally {
            setPending(false);
          }
        });
      } else {
        try {
          fn();
        } finally {
          setPending(false);
        }
      }
    }, []);
    return [pending, start];
  }
  function useDeferredValue(value) {
    const [deferred, setDeferred] = useState(value);
    useEffect(() => {
      if (Object.is(deferred, value)) return;
      if (typeof requestAnimationFrame === "function") {
        const id = requestAnimationFrame(() => setDeferred(value));
        return () => cancelAnimationFrame(id);
      } else {
        setDeferred(value);
      }
    }, [value]);
    return deferred;
  }
  function useOptimistic(actual, updateFn) {
    const [optimistic, setOptimistic] = useState(actual);
    useEffect(() => {
      setOptimistic(actual);
    }, [actual]);
    const dispatch2 = useCallback((action) => {
      const next2 = updateFn ? updateFn(optimistic, action) : action;
      setOptimistic(next2);
    }, [optimistic, updateFn]);
    return [optimistic, dispatch2];
  }
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = {};
    this.updater = updater;
    this.state = this.state || null;
    this._inst = null;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partial, cb) {
    const next2 = typeof partial === "function" ? partial(this.state, this.props) : partial;
    this.state = Object.assign({}, this.state || {}, next2);
    if (this._inst) scheduleUpdate(this._inst);
    if (typeof cb === "function") cb();
  };
  Component.prototype.forceUpdate = function(cb) {
    if (this._inst) scheduleUpdate(this._inst);
    if (typeof cb === "function") cb();
  };
  Component.prototype.render = function() {
    return null;
  };
  Component.prototype.isReactComponent = true;
  var PureComponent = Component;
  var SVG_TAGS = /* @__PURE__ */ new Set([
    "svg",
    "path",
    "circle",
    "rect",
    "line",
    "polygon",
    "polyline",
    "g",
    "defs",
    "use",
    "symbol",
    "text",
    "tspan",
    "textPath",
    "clipPath",
    "mask",
    "pattern",
    "marker",
    "linearGradient",
    "radialGradient",
    "stop",
    "filter",
    "feGaussianBlur",
    "feColorMatrix",
    "feOffset",
    "feComposite",
    "feBlend",
    "feMorphology",
    "feTurbulence",
    "feDisplacementMap",
    "foreignObject",
    "image",
    "switch",
    "view"
  ]);
  var SVG_NS = "http://www.w3.org/2000/svg";
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
    if (name.startsWith("xlink")) return "xlink:" + name.slice(5).toLowerCase();
    return name.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  }
  function applyProp(el2, key, value, isSvg) {
    if (key === "key" || key === "ref") return;
    if (key === "children") return;
    if (key === "className" || key === "class") {
      el2.setAttribute("class", value == null ? "" : value);
      return;
    }
    if (key === "htmlFor") {
      el2.setAttribute("for", value == null ? "" : value);
      return;
    }
    if (key === "style") {
      if (typeof value === "string") {
        el2.setAttribute("style", value);
        return;
      }
      if (value && typeof value === "object") {
        for (const k in value) {
          const v = value[k];
          if (v == null) continue;
          const cssKey = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          el2.style.setProperty(cssKey, String(v));
        }
      }
      return;
    }
    if (key === "dangerouslySetInnerHTML") {
      if (value && value.__html) el2.innerHTML = value.__html;
      return;
    }
    if (key.startsWith("on") && typeof value === "function") {
      const evt = key.slice(2).toLowerCase();
      el2.addEventListener(evt, value);
      return;
    }
    if (value === false || value == null) return;
    if (value === true) {
      el2.setAttribute(key, "");
      return;
    }
    const name = isSvg ? toSvgAttr(key) : key;
    el2.setAttribute(name, String(value));
  }
  function renderVNode(vnode) {
    if (vnode == null || vnode === false || vnode === true) {
      return document.createComment("empty");
    }
    const t = typeof vnode;
    if (t === "string" || t === "number") return document.createTextNode(String(vnode));
    if (Array.isArray(vnode)) {
      const frag2 = document.createDocumentFragment();
      for (const v of vnode) frag2.appendChild(renderVNode(v));
      return frag2;
    }
    if (t === "function") {
      return renderComponent(vnode, {});
    }
    if (vnode && vnode.$$typeof === REACT_PROVIDER) {
      return renderProvider(vnode);
    }
    if (vnode && vnode.$$typeof === REACT_PORTAL) {
      return renderPortal(vnode);
    }
    if (vnode && vnode.$$typeof === REACT_ELEMENT) {
      return renderElement(vnode);
    }
    return document.createComment("unknown");
  }
  function renderElement(vnode) {
    const { type, props, ref: ref2 } = vnode;
    if (type === REACT_FRAGMENT) {
      const frag2 = document.createDocumentFragment();
      appendChildren(frag2, props.children);
      return frag2;
    }
    if (typeof type === "function") {
      return renderComponent(type, props, ref2);
    }
    const isSvg = SVG_TAGS.has(type);
    const el2 = isSvg ? document.createElementNS(SVG_NS, type) : document.createElement(type);
    for (const k in props) {
      applyProp(el2, k, props[k], isSvg);
    }
    appendChildren(el2, props.children);
    if (ref2) {
      if (typeof ref2 === "function") ref2(el2);
      else if (ref2 && typeof ref2 === "object") ref2.current = el2;
    }
    return el2;
  }
  function appendChildren(parent, children) {
    if (children == null || children === false || children === true) return;
    if (Array.isArray(children)) {
      for (const c of children) appendChildren(parent, c);
      return;
    }
    parent.appendChild(renderVNode(children));
  }
  function renderPortal(vnode) {
    const placeholder = document.createComment("portal");
    try {
      const node2 = renderVNode(vnode.children);
      if (vnode.container && node2) {
        vnode.container.appendChild(node2);
        const inst = currentInstance;
        if (inst) {
          if (!inst.portals) inst.portals = [];
          inst.portals.push({ container: vnode.container, node: node2 });
        }
      }
    } catch (e) {
      console.error("[xunay/compat] portal \u6E32\u67D3\u5931\u8D25:", e);
    }
    return placeholder;
  }
  function cleanupPortals(inst) {
    if (inst.portals && inst.portals.length) {
      for (const p2 of inst.portals) {
        try {
          if (p2.node && p2.node.parentNode) p2.node.parentNode.removeChild(p2.node);
        } catch (_) {
        }
      }
      inst.portals = [];
    }
  }
  function renderProvider(vnode) {
    const saved = currentContexts;
    currentContexts = new Map(saved);
    currentContexts.set(vnode._key, vnode.value);
    try {
      return renderVNode(vnode.children);
    } finally {
      currentContexts = saved;
    }
  }
  function renderComponent(type, props, ref2) {
    const vnode = { type, props };
    if (ref2 !== void 0 && ref2 !== null) vnode.ref = ref2;
    const inst = new Instance(vnode);
    inst.contexts = new Map(currentContexts);
    allInstances.add(inst);
    const frag2 = document.createDocumentFragment();
    frag2.appendChild(inst.startMark);
    renderIntoInstance(inst, frag2);
    frag2.appendChild(inst.endMark);
    return frag2;
  }
  function renderIntoInstance(inst, parent) {
    const prev2 = currentInstance;
    const prevCtx = currentContexts;
    currentInstance = inst;
    currentContexts = inst.contexts;
    inst.hookIndex = 0;
    inst.effectQueue = [];
    let result;
    try {
      const type = inst.vnode.type;
      const isClass = type.prototype && (type.prototype.isReactComponent || typeof type.prototype.render === "function");
      if (isClass) {
        if (!inst.classInst) {
          inst.classInst = new type(inst.vnode.props);
          inst.classInst._inst = inst;
          inst.classInst.props = inst.vnode.props;
          const cref = inst.vnode.ref;
          if (cref !== void 0 && cref !== null) {
            if (typeof cref === "function") {
              try {
                cref(inst.classInst);
              } catch (_) {
              }
            } else if (typeof cref === "object") {
              cref.current = inst.classInst;
            }
          }
          if (typeof inst.classInst.componentDidMount === "function") {
            const didMount = inst.classInst.componentDidMount.bind(inst.classInst);
            inst.effectQueue.push({ fn: () => {
              didMount();
            }, deps: void 0, cleanup: null });
          }
          if (typeof inst.classInst.componentWillUnmount === "function") {
            const willUnmount = inst.classInst.componentWillUnmount.bind(inst.classInst);
            inst.cleanupQueue.push({ cleanup: () => {
              try {
                willUnmount();
              } catch (e) {
                console.error(e);
              }
              if (cref !== void 0 && cref !== null) {
                if (typeof cref === "function") {
                  try {
                    cref(null);
                  } catch (_) {
                  }
                } else if (typeof cref === "object") cref.current = null;
              }
            } });
          } else if (cref !== void 0 && cref !== null) {
            inst.cleanupQueue.push({ cleanup: () => {
              if (typeof cref === "function") {
                try {
                  cref(null);
                } catch (_) {
                }
              } else if (typeof cref === "object") cref.current = null;
            } });
          }
        } else {
          inst.classInst.props = inst.vnode.props;
        }
        if (!inst._firstRender && typeof inst.classInst.componentDidUpdate === "function") {
          const didUpdate = inst.classInst.componentDidUpdate.bind(inst.classInst);
          didUpdate(inst._prevProps || {}, inst.classInst.state);
        }
        inst._prevProps = inst.vnode.props;
        inst._firstRender = false;
        result = inst.classInst.render();
      } else {
        let props2 = inst.vnode.props;
        if (inst.vnode.ref !== void 0 && inst.vnode.ref !== null) {
          props2 = Object.assign({}, props2, { ref: inst.vnode.ref });
        }
        if (type._isForwardRef) {
          result = type(props2, inst.vnode.ref);
        } else {
          result = type(props2);
        }
      }
    } catch (e) {
      console.error("[xunay/compat] \u6E32\u67D3\u9519\u8BEF:", e);
      if (typeof window !== "undefined") {
        if (window.__XUNAY_COMPAT_THROW) throw e;
        if (typeof window.__XUNAY_DEBUG_LOG === "function") {
          try {
            window.__XUNAY_DEBUG_LOG("!! \u7EC4\u4EF6 " + (inst.vnode.type.name || "?") + " \u5D29\u6E83:\n" + (e.stack || e.message));
          } catch (_) {
          }
        }
      }
      result = null;
    }
    appendChildren(parent, result);
    pendingEffectInstances.add(inst);
    scheduleFlushEffects();
    currentInstance = prev2;
    currentContexts = prevCtx;
  }
  function runEffects(inst) {
    const q = inst.effectQueue;
    inst.effectQueue = [];
    for (const slot of q) {
      if (slot.cleanup) {
        try {
          slot.cleanup();
        } catch (e) {
          console.error(e);
        }
        slot.cleanup = null;
      }
      try {
        const c = slot.fn();
        if (typeof c === "function") {
          slot.cleanup = c;
          if (!inst.cleanupQueue.includes(slot)) inst.cleanupQueue.push(slot);
        }
      } catch (e) {
        console.error("[xunay/compat] effect \u9519\u8BEF:", e);
      }
    }
  }
  function rerenderInstance(inst) {
    const parent = inst.startMark.parentNode;
    if (!parent) {
      allInstances.delete(inst);
      return;
    }
    cleanupPortals(inst);
    let node2 = inst.startMark.nextSibling;
    while (node2 && node2 !== inst.endMark) {
      if (node2._inst && node2._inst !== inst) {
        disposeInstance(node2._inst);
      }
      node2 = node2.nextSibling;
    }
    node2 = inst.startMark.nextSibling;
    while (node2 && node2 !== inst.endMark) {
      const next2 = node2.nextSibling;
      parent.removeChild(node2);
      node2 = next2;
    }
    const frag2 = document.createDocumentFragment();
    renderIntoInstance(inst, frag2);
    parent.insertBefore(frag2, inst.endMark);
  }
  function disposeInstance(inst) {
    for (const slot of inst.cleanupQueue) {
      if (slot.cleanup) {
        try {
          slot.cleanup();
        } catch (e) {
          console.error(e);
        }
      }
      slot.cleanup = null;
    }
    inst.cleanupQueue = [];
    cleanupPortals(inst);
    allInstances.delete(inst);
  }
  function createRoot(container) {
    let lastVNode = null;
    return {
      render(vnode) {
        container.innerHTML = "";
        lastVNode = vnode;
        const node2 = renderVNode(vnode);
        container.appendChild(node2);
        if (typeof flushEffectsNow === "function") flushEffectsNow();
      },
      unmount() {
        container.innerHTML = "";
        lastVNode = null;
      },
      _container: container
    };
  }
  function hydrateRoot(container, initialChildren) {
    const root = createRoot(container);
    if (initialChildren !== void 0) root.render(initialChildren);
    return {
      render: root.render,
      unmount: root.unmount,
      _container: container
    };
  }
  function render2(vnode, container) {
    return createRoot(container).render(vnode);
  }
  function unmountComponentAtNode(container) {
    container.innerHTML = "";
    return true;
  }
  function findDOMNode(ref2) {
    if (!ref2) return null;
    if (ref2 instanceof Element) return ref2;
    return ref2._el || null;
  }
  var Children = {
    map(children, fn) {
      const out = [];
      let i = 0;
      const arr = Array.isArray(children) ? children : children == null ? [] : [children];
      for (const c of arr) {
        if (c == null || c === false || c === true) continue;
        out.push(fn(c, i++));
      }
      return out;
    },
    forEach(children, fn) {
      Children.map(children, fn);
    },
    count(children) {
      return Children.map(children, () => 1).length;
    },
    only(children) {
      if (!isValidElement(children)) throw new Error("[xunay/compat] Children.only \u53EA\u63A5\u53D7\u5355\u4E2A element");
      return children;
    },
    toArray(children) {
      return Children.map(children, (c) => c);
    }
  };
  function _jsxImpl(type, config, maybeKey) {
    const props = {};
    let key = maybeKey !== void 0 && maybeKey !== null ? String(maybeKey) : null;
    let ref2 = null;
    if (config) {
      for (const k in config) {
        if (k === "key") {
          if (maybeKey === void 0 || maybeKey === null) key = config[k] != null ? String(config[k]) : null;
          continue;
        }
        if (k === "ref") {
          ref2 = config[k];
          continue;
        }
        props[k] = config[k];
      }
    }
    const vnode = {
      $$typeof: REACT_ELEMENT,
      type,
      key,
      props
    };
    if (ref2 !== null && ref2 !== void 0) vnode.ref = ref2;
    return vnode;
  }
  function jsx(type, config, maybeKey) {
    return _jsxImpl(type, config, maybeKey);
  }
  function jsxs(type, config, maybeKey) {
    return _jsxImpl(type, config, maybeKey);
  }
  function jsxDEV(type, config, maybeKey, isStaticChildren, source, self) {
    const v = _jsxImpl(type, config, maybeKey);
    if (source) v._source = source;
    return v;
  }
  var React = {
    createElement: createElement2,
    cloneElement,
    isValidElement,
    Fragment,
    Children,
    Component,
    useState,
    useEffect,
    useLayoutEffect,
    useMemo,
    useCallback,
    useRef,
    useReducer,
    useContext,
    useImperativeHandle,
    useId,
    useDebugValue,
    createContext,
    memo,
    forwardRef,
    lazy: lazy2,
    Suspense,
    StrictMode,
    startTransition,
    useTransition,
    useDeferredValue,
    useOptimistic,
    createRoot,
    hydrateRoot,
    render: render2,
    unmountComponentAtNode,
    findDOMNode,
    jsx,
    jsxs,
    jsxDEV,
    useInsertionEffect,
    createPortal,
    flushSync,
    useSyncExternalStore,
    act,
    unstable_batchedUpdates,
    unstable_renderSubtreeIntoContainer,
    createFactory,
    PureComponent
  };
  var react_compat_default = React;
  var version = "0.1.0-xunay";

  // ../../node_modules/antd/es/_util/getReactMajorVersionCanDelMe.js
  function getReactMajorVersion() {
    const majorVersion = Number.parseInt(version.split(".")[0], 10);
    return majorVersion;
  }

  // ../../node_modules/@rc-component/util/es/hooks/useEvent.js
  var useEvent = (callback) => {
    const fnRef = useRef(callback);
    fnRef.current = callback;
    const memoFn = useCallback((...args) => fnRef.current?.(...args), []);
    return memoFn;
  };
  var useEvent_default = useEvent;

  // ../../node_modules/@rc-component/util/es/Dom/canUseDom.js
  function canUseDom() {
    return !!(typeof window !== "undefined" && window.document && window.document.createElement);
  }

  // ../../node_modules/@rc-component/util/es/hooks/useLayoutEffect.js
  var useInternalLayoutEffect = canUseDom() ? useLayoutEffect : useEffect;
  var useLayoutEffect2 = (callback, deps) => {
    const firstMountRef = useRef(true);
    useInternalLayoutEffect(() => {
      return callback(firstMountRef.current);
    }, deps);
    useInternalLayoutEffect(() => {
      firstMountRef.current = false;
      return () => {
        firstMountRef.current = true;
      };
    }, []);
  };
  var useLayoutEffect_default = useLayoutEffect2;

  // ../../node_modules/@rc-component/util/es/hooks/useState.js
  var useSafeState = (defaultValue) => {
    const destroyRef = useRef(false);
    const [value, setValue] = useState(defaultValue);
    useEffect(() => {
      destroyRef.current = false;
      return () => {
        destroyRef.current = true;
      };
    }, []);
    function safeSetState(updater, ignoreDestroy) {
      if (ignoreDestroy && destroyRef.current) {
        return;
      }
      setValue(updater);
    }
    return [value, safeSetState];
  };
  var useState_default = useSafeState;

  // ../../node_modules/@rc-component/util/es/hooks/useControlledState.js
  function useControlledState(defaultStateValue, value) {
    const [innerValue, setInnerValue] = useState(defaultStateValue);
    const mergedValue = value !== void 0 ? value : innerValue;
    useLayoutEffect_default((mount2) => {
      if (!mount2) {
        setInnerValue(value);
      }
    }, [value]);
    return [
      // Value
      mergedValue,
      // Update function
      setInnerValue
    ];
  }

  // ../../node_modules/@rc-component/util/es/raf.js
  var raf = (callback) => +setTimeout(callback, 16);
  var caf = (num) => clearTimeout(num);
  if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
    raf = (callback) => window.requestAnimationFrame(callback);
    caf = (handle) => window.cancelAnimationFrame(handle);
  }
  var rafUUID = 0;
  var rafIds = /* @__PURE__ */ new Map();
  function cleanup(id) {
    rafIds.delete(id);
  }
  var wrapperRaf = (callback, times = 1) => {
    rafUUID += 1;
    const id = rafUUID;
    function callRef(leftTimes) {
      if (leftTimes === 0) {
        cleanup(id);
        callback();
      } else {
        const realId = raf(() => {
          callRef(leftTimes - 1);
        });
        rafIds.set(id, realId);
      }
    }
    callRef(times);
    return id;
  };
  wrapperRaf.cancel = (id) => {
    const realId = rafIds.get(id);
    cleanup(id);
    return caf(realId);
  };
  if (true) {
    wrapperRaf.ids = () => rafIds;
  }
  var raf_default = wrapperRaf;

  // ../../node_modules/@rc-component/util/es/hooks/useDelayState.js
  function useDelayState(defaultValue) {
    const [value, setValue] = useState(defaultValue);
    const delayRef = useRef(null);
    const cancelPending = useEvent_default(() => {
      if (delayRef.current) {
        const [isRaf, delay] = delayRef.current;
        if (isRaf) {
          raf_default.cancel(delay);
        } else {
          clearTimeout(delay);
        }
        delayRef.current = null;
      }
    });
    useEffect(() => cancelPending, [cancelPending]);
    const setDelayValue = useEvent_default((nextValue, immediatelyOrDelay) => {
      const delayConfig = immediatelyOrDelay || {
        frame: 1
      };
      cancelPending();
      if (delayConfig === true) {
        setValue(nextValue);
      } else if ("ms" in delayConfig) {
        delayRef.current = [false, setTimeout(() => setValue(nextValue), delayConfig.ms)];
      } else {
        delayRef.current = [true, raf_default(() => setValue(nextValue), delayConfig.frame)];
      }
    });
    return [value, setDelayValue];
  }

  // ../../node_modules/@rc-component/util/es/hooks/useId.js
  function getUseId() {
    const fullClone = {
      ...react_compat_exports
    };
    return fullClone.useId;
  }
  var uuid = 0;
  var useOriginId = getUseId();
  var useId_default = useOriginId ? (
    // Use React `useId`
    function useId2(id) {
      const reactId = useOriginId();
      if (id) {
        return id;
      }
      if (false) {
        return "test-id";
      }
      return reactId;
    }
  ) : (
    // Use compatible of `useId`
    function useCompatId(id) {
      const [innerId, setInnerId] = useState("ssr-id");
      useEffect(() => {
        const nextId = uuid;
        uuid += 1;
        setInnerId(`rc_unique_${nextId}`);
      }, []);
      if (id) {
        return id;
      }
      if (false) {
        return "test-id";
      }
      return innerId;
    }
  );

  // ../../node_modules/@rc-component/util/es/hooks/useMemo.js
  function useMemo2(getValue2, condition, shouldUpdate) {
    const cacheRef = useRef({});
    if (!("value" in cacheRef.current) || shouldUpdate(cacheRef.current.condition, condition)) {
      cacheRef.current.value = getValue2();
      cacheRef.current.condition = condition;
    }
    return cacheRef.current.value;
  }

  // ../../node_modules/@rc-component/util/es/hooks/useSyncState.js
  function useSyncState(defaultValue) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const currentValueRef = useRef(defaultValue);
    const getValue2 = useEvent_default(() => {
      return currentValueRef.current;
    });
    const setValue = useEvent_default((updater) => {
      currentValueRef.current = typeof updater === "function" ? updater(currentValueRef.current) : updater;
      forceUpdate();
    });
    return [getValue2, setValue];
  }
  var useSyncState_default = useSyncState;

  // ../../node_modules/@rc-component/util/es/ref.js
  var import_react_is = __toESM(require_react_is());

  // ../../node_modules/@rc-component/util/es/React/isFragment.js
  var REACT_ELEMENT_TYPE_18 = Symbol.for("react.element");
  var REACT_ELEMENT_TYPE_19 = Symbol.for("react.transitional.element");
  var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function isFragment(object) {
    return (
      // Base object type
      object && typeof object === "object" && // React Element type
      (object.$$typeof === REACT_ELEMENT_TYPE_18 || object.$$typeof === REACT_ELEMENT_TYPE_19) && // React Fragment type
      object.type === REACT_FRAGMENT_TYPE
    );
  }

  // ../../node_modules/@rc-component/util/es/ref.js
  var ReactMajorVersion = Number(version?.split(".")[0]);
  var fillRef = (ref2, node2) => {
    if (typeof ref2 === "function") {
      ref2(node2);
    } else if (typeof ref2 === "object" && ref2 && "current" in ref2) {
      ref2.current = node2;
    }
  };
  var composeRef = (...refs) => {
    const refList = refs.filter(Boolean);
    if (refList.length <= 1) {
      return refList[0];
    }
    return (node2) => {
      refs.forEach((ref2) => {
        fillRef(ref2, node2);
      });
    };
  };
  var useComposeRef = (...refs) => {
    return useMemo2(
      () => composeRef(...refs),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      refs,
      (prev2, next2) => prev2.length !== next2.length || prev2.every((ref2, i) => ref2 !== next2[i])
    );
  };
  var supportRef = (nodeOrComponent) => {
    if (!nodeOrComponent) {
      return false;
    }
    if (isReactElement(nodeOrComponent) && ReactMajorVersion >= 19) {
      return true;
    }
    const type = (0, import_react_is.isMemo)(nodeOrComponent) ? nodeOrComponent.type.type : nodeOrComponent.type;
    if (typeof type === "function" && !type.prototype?.render && type.$$typeof !== import_react_is.ForwardRef) {
      return false;
    }
    if (typeof nodeOrComponent === "function" && !nodeOrComponent.prototype?.render && nodeOrComponent.$$typeof !== import_react_is.ForwardRef) {
      return false;
    }
    return true;
  };
  function isReactElement(node2) {
    return /* @__PURE__ */ isValidElement(node2) && !isFragment(node2);
  }
  var supportNodeRef = (node2) => {
    return isReactElement(node2) && supportRef(node2);
  };
  var getNodeRef = (node2) => {
    if (node2 && isReactElement(node2)) {
      const ele = node2;
      return ele.props.propertyIsEnumerable("ref") ? ele.props.ref : ele.ref;
    }
    return null;
  };

  // ../../node_modules/@rc-component/util/es/Dom/contains.js
  function contains(root, n) {
    if (!root) {
      return false;
    }
    if (root.contains) {
      return root.contains(n);
    }
    let node2 = n;
    while (node2) {
      if (node2 === root) {
        return true;
      }
      node2 = node2.parentNode;
    }
    return false;
  }

  // ../../node_modules/@rc-component/util/es/Dom/dynamicCSS.js
  var APPEND_ORDER = "data-rc-order";
  var APPEND_PRIORITY = "data-rc-priority";
  var MARK_KEY = `rc-util-key`;
  var containerCache = /* @__PURE__ */ new Map();
  function getMark({
    mark
  } = {}) {
    if (mark) {
      return mark.startsWith("data-") ? mark : `data-${mark}`;
    }
    return MARK_KEY;
  }
  function getContainer(option2) {
    if (option2.attachTo) {
      return option2.attachTo;
    }
    const head = document.querySelector("head");
    return head || document.body;
  }
  function getOrder(prepend) {
    if (prepend === "queue") {
      return "prependQueue";
    }
    return prepend ? "prepend" : "append";
  }
  function findStyles(container) {
    if (!container) {
      return [];
    }
    return Array.from((containerCache.get(container) || container).children).filter((node2) => node2.tagName === "STYLE");
  }
  function injectCSS(css, option2 = {}) {
    if (!canUseDom()) {
      return null;
    }
    const {
      csp,
      prepend,
      priority = 0
    } = option2;
    const mergedOrder = getOrder(prepend);
    const isPrependQueue = mergedOrder === "prependQueue";
    const styleNode = document.createElement("style");
    styleNode.setAttribute(APPEND_ORDER, mergedOrder);
    if (isPrependQueue && priority) {
      styleNode.setAttribute(APPEND_PRIORITY, `${priority}`);
    }
    if (csp?.nonce) {
      styleNode.nonce = csp?.nonce;
    }
    styleNode.innerHTML = css;
    const container = getContainer(option2);
    if (!container) {
      return null;
    }
    const {
      firstChild
    } = container;
    if (prepend) {
      if (isPrependQueue) {
        const existStyle = (option2.styles || findStyles(container)).filter((node2) => {
          if (!["prepend", "prependQueue"].includes(node2.getAttribute(APPEND_ORDER))) {
            return false;
          }
          const nodePriority = Number(node2.getAttribute(APPEND_PRIORITY) || 0);
          return priority >= nodePriority;
        });
        if (existStyle.length) {
          container.insertBefore(styleNode, existStyle[existStyle.length - 1].nextSibling);
          return styleNode;
        }
      }
      container.insertBefore(styleNode, firstChild);
    } else {
      container.appendChild(styleNode);
    }
    return styleNode;
  }
  function findExistNode(key, option2 = {}) {
    let {
      styles
    } = option2;
    styles || (styles = findStyles(getContainer(option2)));
    return styles.find((node2) => node2.getAttribute(getMark(option2)) === key);
  }
  function removeCSS(key, option2 = {}) {
    const existNode = findExistNode(key, option2);
    if (existNode) {
      const container = getContainer(option2);
      container?.removeChild(existNode);
    }
  }
  function syncRealContainer(container, option2) {
    const cachedRealContainer = containerCache.get(container);
    if (!cachedRealContainer || !contains(document, cachedRealContainer)) {
      const placeholderStyle = injectCSS("", option2);
      if (!placeholderStyle) {
        return;
      }
      const {
        parentNode
      } = placeholderStyle;
      containerCache.set(container, parentNode);
      container.removeChild(placeholderStyle);
    }
  }
  function updateCSS(css, key, originOption = {}) {
    const container = getContainer(originOption);
    if (!container) {
      return null;
    }
    const styles = findStyles(container);
    const option2 = {
      ...originOption,
      styles
    };
    syncRealContainer(container, option2);
    const existNode = findExistNode(key, option2);
    if (existNode) {
      if (option2.csp?.nonce && existNode.nonce !== option2.csp?.nonce) {
        existNode.nonce = option2.csp?.nonce;
      }
      if (existNode.innerHTML !== css) {
        existNode.innerHTML = css;
      }
      return existNode;
    }
    const newNode = injectCSS(css, option2);
    if (!newNode) {
      return null;
    }
    newNode.setAttribute(getMark(option2), key);
    return newNode;
  }

  // ../../node_modules/@rc-component/util/es/Dom/findDOMNode.js
  function isDOM(node2) {
    return node2 instanceof HTMLElement || node2 instanceof SVGElement;
  }
  function getDOM(node2) {
    if (node2 && typeof node2 === "object" && isDOM(node2.nativeElement)) {
      return node2.nativeElement;
    }
    if (isDOM(node2)) {
      return node2;
    }
    return null;
  }

  // ../../node_modules/@rc-component/util/es/Dom/isVisible.js
  var isVisible_default = (element) => {
    if (!element) {
      return false;
    }
    if (element instanceof Element) {
      if (element.offsetParent) {
        return true;
      }
      if (element.getBBox) {
        const {
          width,
          height
        } = element.getBBox();
        if (width || height) {
          return true;
        }
      }
      if (element.getBoundingClientRect) {
        const {
          width,
          height
        } = element.getBoundingClientRect();
        if (width || height) {
          return true;
        }
      }
    }
    return false;
  };

  // ../../node_modules/@rc-component/util/es/Dom/shadow.js
  function getRoot(ele) {
    return ele?.getRootNode?.();
  }
  function inShadow(ele) {
    return getRoot(ele) instanceof ShadowRoot;
  }
  function getShadowRoot(ele) {
    return inShadow(ele) ? getRoot(ele) : null;
  }

  // ../../node_modules/@rc-component/util/es/getScrollBarSize.js
  function measureScrollbarSize(ele) {
    const randomId = `rc-scrollbar-measure-${Math.random().toString(36).substring(7)}`;
    const measureEle = document.createElement("div");
    measureEle.id = randomId;
    const measureStyle = measureEle.style;
    measureStyle.position = "absolute";
    measureStyle.left = "0";
    measureStyle.top = "0";
    measureStyle.width = "100px";
    measureStyle.height = "100px";
    measureStyle.overflow = "scroll";
    let fallbackWidth;
    let fallbackHeight;
    if (ele) {
      const targetStyle = getComputedStyle(ele);
      measureStyle.scrollbarColor = targetStyle.scrollbarColor;
      measureStyle.scrollbarWidth = targetStyle.scrollbarWidth;
      const webkitScrollbarStyle = getComputedStyle(ele, "::-webkit-scrollbar");
      const width = parseInt(webkitScrollbarStyle.width, 10);
      const height = parseInt(webkitScrollbarStyle.height, 10);
      try {
        const widthStyle = width ? `width: ${webkitScrollbarStyle.width};` : "";
        const heightStyle = height ? `height: ${webkitScrollbarStyle.height};` : "";
        updateCSS(`
#${randomId}::-webkit-scrollbar {
${widthStyle}
${heightStyle}
}`, randomId);
      } catch (e) {
        console.error(e);
        fallbackWidth = width;
        fallbackHeight = height;
      }
    }
    document.body.appendChild(measureEle);
    const scrollWidth = ele && fallbackWidth && !Number.isNaN(fallbackWidth) ? fallbackWidth : measureEle.offsetWidth - measureEle.clientWidth;
    const scrollHeight = ele && fallbackHeight && !Number.isNaN(fallbackHeight) ? fallbackHeight : measureEle.offsetHeight - measureEle.clientHeight;
    document.body.removeChild(measureEle);
    removeCSS(randomId);
    return {
      width: scrollWidth,
      height: scrollHeight
    };
  }
  function getTargetScrollBarSize(target) {
    if (typeof document === "undefined" || !target || !(target instanceof Element)) {
      return {
        width: 0,
        height: 0
      };
    }
    return measureScrollbarSize(target);
  }

  // ../../node_modules/@rc-component/util/es/warning.js
  var warned = {};
  var preWarningFns = [];
  var preMessage = (fn) => {
    preWarningFns.push(fn);
  };
  function warning(valid, message) {
    if (!valid && console !== void 0) {
      const finalMessage = preWarningFns.reduce((msg, preMessageFn) => preMessageFn(msg ?? "", "warning"), message);
      if (finalMessage) {
        console.error(`Warning: ${finalMessage}`);
      }
    }
  }
  function note(valid, message) {
    if (!valid && console !== void 0) {
      const finalMessage = preWarningFns.reduce((msg, preMessageFn) => preMessageFn(msg ?? "", "note"), message);
      if (finalMessage) {
        console.warn(`Note: ${finalMessage}`);
      }
    }
  }
  function resetWarned() {
    warned = {};
  }
  function call(method, valid, message) {
    if (!valid && !warned[message]) {
      method(false, message);
      warned[message] = true;
    }
  }
  function warningOnce(valid, message) {
    call(warning, valid, message);
  }
  function noteOnce(valid, message) {
    call(note, valid, message);
  }
  warningOnce.preMessage = preMessage;
  warningOnce.resetWarned = resetWarned;
  warningOnce.noteOnce = noteOnce;
  var warning_default = warningOnce;

  // ../../node_modules/@rc-component/util/es/isEqual.js
  function isEqual(obj1, obj2, shallow = false) {
    const refSet = /* @__PURE__ */ new Set();
    function deepEqual(a2, b, level = 1) {
      const circular = refSet.has(a2);
      warning_default(!circular, "Warning: There may be circular references");
      if (circular) {
        return false;
      }
      if (a2 === b) {
        return true;
      }
      if (shallow && level > 1) {
        return false;
      }
      refSet.add(a2);
      const newLevel = level + 1;
      if (Array.isArray(a2)) {
        if (!Array.isArray(b) || a2.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a2.length; i++) {
          if (!deepEqual(a2[i], b[i], newLevel)) {
            return false;
          }
        }
        return true;
      }
      if (a2 && b && typeof a2 === "object" && typeof b === "object") {
        const keys2 = Object.keys(a2);
        if (keys2.length !== Object.keys(b).length) {
          return false;
        }
        return keys2.every((key) => deepEqual(a2[key], b[key], newLevel));
      }
      return false;
    }
    return deepEqual(obj1, obj2);
  }
  var isEqual_default = isEqual;

  // ../../node_modules/@rc-component/util/es/is.js
  function isNonNullable(value) {
    return value !== void 0 && value !== null;
  }
  function isReactRenderable(value) {
    return isNonNullable(value) && value !== false && value !== "";
  }

  // ../../node_modules/@rc-component/util/es/isMobile.js
  var import_is_mobile = __toESM(require_is_mobile());

  // ../../node_modules/@rc-component/util/es/omit.js
  function omit(obj, fields) {
    const clone = Object.assign({}, obj);
    if (Array.isArray(fields)) {
      fields.forEach((key) => {
        delete clone[key];
      });
    }
    return clone;
  }

  // ../../node_modules/@rc-component/util/es/pickAttrs.js
  var attributes = `accept acceptCharset accessKey action allowFullScreen allowTransparency
    alt async autoComplete autoFocus autoPlay capture cellPadding cellSpacing challenge
    charSet checked classID className colSpan cols content contentEditable contextMenu
    controls coords crossOrigin data dateTime default defer dir disabled download draggable
    encType form formAction formEncType formMethod formNoValidate formTarget frameBorder
    headers height hidden high href hrefLang htmlFor httpEquiv icon id inputMode integrity
    is keyParams keyType kind label lang list loop low manifest marginHeight marginWidth max maxLength media
    mediaGroup method min minLength multiple muted name noValidate nonce open
    optimum pattern placeholder poster preload radioGroup readOnly rel required
    reversed role rowSpan rows sandbox scope scoped scrolling seamless selected
    shape size sizes span spellCheck src srcDoc srcLang srcSet start step style
    summary tabIndex target title type useMap value width wmode wrap`;
  var eventsName = `onCopy onCut onPaste onCompositionEnd onCompositionStart onCompositionUpdate onKeyDown
    onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onClick onContextMenu onDoubleClick
    onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown
    onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onSelect onTouchCancel
    onTouchEnd onTouchMove onTouchStart onScroll onWheel onAbort onCanPlay onCanPlayThrough
    onDurationChange onEmptied onEncrypted onEnded onError onLoadedData onLoadedMetadata
    onLoadStart onPause onPlay onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend onTimeUpdate onVolumeChange onWaiting onLoad
    onPointerDown onPointerMove onPointerUp onPointerCancel onPointerEnter onPointerLeave onPointerOver onPointerOut onGotPointerCapture onLostPointerCapture
    onAnimationStart onAnimationEnd onAnimationIteration
    onTransitionEnd onTransitionRun onTransitionStart onTransitionCancel
    onBeforeInput onReset onInvalid
    onAuxClick onToggle onBeforeToggle onCancel onClose onResize onScrollEnd`;
  var propList = `${attributes} ${eventsName}`.split(/[\s\n]+/);
  var ariaPrefix = "aria-";
  var dataPrefix = "data-";
  function match(key, prefix2) {
    return key.indexOf(prefix2) === 0;
  }
  function pickAttrs(props, ariaOnly = false) {
    let mergedConfig;
    if (ariaOnly === false) {
      mergedConfig = {
        aria: true,
        data: true,
        attr: true
      };
    } else if (ariaOnly === true) {
      mergedConfig = {
        aria: true
      };
    } else {
      mergedConfig = {
        ...ariaOnly
      };
    }
    const attrs = {};
    Object.keys(props).forEach((key) => {
      if (
        // Aria
        mergedConfig.aria && (key === "role" || match(key, ariaPrefix)) || // Data
        mergedConfig.data && match(key, dataPrefix) || // Attr
        mergedConfig.attr && propList.includes(key)
      ) {
        attrs[key] = props[key];
      }
    });
    return attrs;
  }

  // ../../node_modules/@rc-component/util/es/Children/toArray.js
  function toArray(children, option2 = {}) {
    let ret = [];
    react_compat_default.Children.forEach(children, (child) => {
      if ((child === void 0 || child === null) && !option2.keepEmpty) {
        return;
      }
      if (Array.isArray(child)) {
        ret = ret.concat(toArray(child));
      } else if (isFragment(child) && child.props) {
        ret = ret.concat(toArray(child.props.children, option2));
      } else {
        ret.push(child);
      }
    });
    return ret;
  }

  // ../../node_modules/@rc-component/util/es/mergeProps.js
  function mergeProps(...items) {
    const ret = {};
    for (const item of items) {
      if (item) {
        for (const key of Object.keys(item)) {
          if (item[key] !== void 0) {
            ret[key] = item[key];
          }
        }
      }
    }
    return ret;
  }
  var mergeProps_default = mergeProps;

  // ../../node_modules/@rc-component/util/es/utils/get.js
  function get(entity, path) {
    let current = entity;
    for (let i = 0; i < path.length; i += 1) {
      if (current === null || current === void 0) {
        return void 0;
      }
      current = current[path[i]];
    }
    return current;
  }

  // ../../node_modules/@rc-component/util/es/utils/set.js
  function internalSet(entity, paths, value, removeIfUndefined) {
    if (!paths.length) {
      return value;
    }
    const [path, ...restPath] = paths;
    let clone;
    if (!entity && typeof path === "number") {
      clone = [];
    } else if (Array.isArray(entity)) {
      clone = [...entity];
    } else {
      clone = {
        ...entity
      };
    }
    if (removeIfUndefined && value === void 0 && restPath.length === 1) {
      const origin = clone[path];
      if (origin && typeof origin === "object") {
        const child = Array.isArray(origin) ? [...origin] : {
          ...origin
        };
        delete child[restPath[0]];
        clone[path] = child;
      }
    } else {
      clone[path] = internalSet(clone[path], restPath, value, removeIfUndefined);
    }
    return clone;
  }
  function set2(entity, paths, value, removeIfUndefined = false) {
    if (paths.length && removeIfUndefined && value === void 0 && !get(entity, paths.slice(0, -1))) {
      return entity;
    }
    return internalSet(entity, paths, value, removeIfUndefined);
  }
  function isObject(obj) {
    return typeof obj === "object" && obj !== null && Object.getPrototypeOf(obj) === Object.prototype;
  }
  function createEmpty(source) {
    return Array.isArray(source) ? [] : {};
  }
  var keys = typeof Reflect === "undefined" ? Object.keys : Reflect.ownKeys;
  function mergeWith(sources, config = {}) {
    const {
      prepareArray
    } = config;
    const finalPrepareArray = prepareArray || (() => []);
    let clone = createEmpty(sources[0]);
    sources.forEach((src) => {
      function internalMerge(path, parentLoopSet) {
        const loopSet = new Set(parentLoopSet);
        const value = get(src, path);
        const isArr = Array.isArray(value);
        if (isArr || isObject(value)) {
          if (!loopSet.has(value)) {
            loopSet.add(value);
            const originValue = get(clone, path);
            if (isArr) {
              clone = set2(clone, path, finalPrepareArray(originValue, value));
            } else if (!originValue || typeof originValue !== "object") {
              clone = set2(clone, path, createEmpty(value));
            }
            keys(value).forEach((key) => {
              if (Object.getOwnPropertyDescriptor(value, key).enumerable) {
                internalMerge([...path, key], loopSet);
              }
            });
          }
        } else {
          clone = set2(clone, path, value);
        }
      }
      internalMerge([]);
    });
    return clone;
  }
  function merge(...sources) {
    return mergeWith(sources);
  }

  // ../../node_modules/@rc-component/util/es/React/render.js
  var MARK = "__rc_react_root__";
  function render3(node2, container) {
    const root = container[MARK] || createRoot(container);
    root.render(node2);
    container[MARK] = root;
  }
  async function unmount(container) {
    return Promise.resolve().then(() => {
      container[MARK]?.unmount();
      delete container[MARK];
    });
  }

  // ../../node_modules/antd/es/_util/warning.js
  function noop() {
  }
  var {
    resetWarned: rcResetWarned
  } = warning_default;
  var deprecatedWarnList = null;
  var _warning = noop;
  if (true) {
    _warning = (valid, component, message) => {
      warning_default(valid, `[antd: ${component}] ${message}`);
      if (false) {
        resetWarned();
      }
    };
  }
  var warning2 = _warning;
  var WarningContext = /* @__PURE__ */ createContext({});
  var useDevWarning = true ? (component) => {
    const {
      strict
    } = useContext(WarningContext);
    const typeWarning = (valid, type, message) => {
      if (!valid) {
        if (strict === false && type === "deprecated") {
          const existWarning = deprecatedWarnList;
          if (!deprecatedWarnList) {
            deprecatedWarnList = {};
          }
          deprecatedWarnList[component] = deprecatedWarnList[component] || [];
          if (!deprecatedWarnList[component].includes(message || "")) {
            deprecatedWarnList[component].push(message || "");
          }
          if (!existWarning) {
            console.warn("[antd] There exists deprecated usage in your code:", deprecatedWarnList);
          }
        } else {
          true ? warning2(valid, component, message) : void 0;
        }
      }
    };
    typeWarning.deprecated = (valid, oldProp, newProp, message = "") => {
      typeWarning(valid, "deprecated", `\`${oldProp}\` is deprecated. Please use \`${newProp}\` instead.${message ? ` ${message}` : ""}`);
    };
    return typeWarning;
  } : () => {
    const noopWarning = () => {
    };
    noopWarning.deprecated = noop;
    return noopWarning;
  };
  var devUseWarning = useDevWarning;
  var warning_default2 = warning2;

  // ../../node_modules/@rc-component/resize-observer/es/Collection.js
  var CollectionContext = /* @__PURE__ */ createContext(null);
  function Collection({
    children,
    onBatchResize
  }) {
    const resizeIdRef = useRef(0);
    const resizeInfosRef = useRef([]);
    const onCollectionResize = useContext(CollectionContext);
    const onResize2 = useCallback((size, element, data) => {
      resizeIdRef.current += 1;
      const currentId = resizeIdRef.current;
      resizeInfosRef.current.push({
        size,
        element,
        data
      });
      Promise.resolve().then(() => {
        if (currentId === resizeIdRef.current) {
          onBatchResize?.(resizeInfosRef.current);
          resizeInfosRef.current = [];
        }
      });
      onCollectionResize?.(size, element, data);
    }, [onBatchResize, onCollectionResize]);
    return /* @__PURE__ */ createElement2(CollectionContext.Provider, {
      value: onResize2
    }, children);
  }

  // ../../node_modules/@rc-component/resize-observer/es/utils/observerUtil.js
  var elementListeners = /* @__PURE__ */ new Map();
  function onResize(entities) {
    entities.forEach((entity) => {
      const {
        target
      } = entity;
      elementListeners.get(target)?.forEach((listener) => listener(target));
    });
  }
  var observer;
  function ensureResizeObserver() {
    if (!observer) {
      observer = new ResizeObserver(onResize);
    }
    return observer;
  }
  function observe(element, callback) {
    if (!elementListeners.has(element)) {
      elementListeners.set(element, /* @__PURE__ */ new Set());
      ensureResizeObserver().observe(element);
    }
    elementListeners.get(element).add(callback);
  }
  function unobserve(element, callback) {
    if (elementListeners.has(element)) {
      elementListeners.get(element).delete(callback);
      if (!elementListeners.get(element).size) {
        ensureResizeObserver().unobserve(element);
        elementListeners.delete(element);
      }
    }
  }

  // ../../node_modules/@rc-component/resize-observer/es/useResizeObserver.js
  function useResizeObserver(enabled, getTarget, onDelayResize, onSyncResize) {
    const sizeRef = useRef({
      width: -1,
      height: -1,
      offsetWidth: -1,
      offsetHeight: -1
    });
    const onInternalResize = useEvent_default((target) => {
      const {
        width,
        height
      } = target.getBoundingClientRect();
      const {
        offsetWidth,
        offsetHeight
      } = target;
      const fixedWidth = Math.floor(width);
      const fixedHeight = Math.floor(height);
      if (sizeRef.current.width !== fixedWidth || sizeRef.current.height !== fixedHeight || sizeRef.current.offsetWidth !== offsetWidth || sizeRef.current.offsetHeight !== offsetHeight) {
        const size = {
          width: fixedWidth,
          height: fixedHeight,
          offsetWidth,
          offsetHeight
        };
        sizeRef.current = size;
        const mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
        const mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight;
        const sizeInfo = {
          ...size,
          offsetWidth: mergedOffsetWidth,
          offsetHeight: mergedOffsetHeight
        };
        onSyncResize?.(sizeInfo, target);
        Promise.resolve().then(() => {
          onDelayResize?.(sizeInfo, target);
        });
      }
    });
    const isFuncTarget = typeof getTarget === "function";
    const funcTargetIdRef = useRef(0);
    useEffect(() => {
      const target = isFuncTarget ? getTarget() : getTarget;
      if (target && enabled) {
        observe(target, onInternalResize);
      } else if (enabled && isFuncTarget) {
        funcTargetIdRef.current += 1;
      }
      return () => {
        if (target) {
          unobserve(target, onInternalResize);
        }
      };
    }, [
      enabled,
      // If function target resolves after a parent render, the bumped ref value
      // lets the next render re-run this effect without watching the function identity.
      isFuncTarget ? funcTargetIdRef.current : getTarget
    ]);
  }

  // ../../node_modules/@rc-component/resize-observer/es/SingleObserver/index.js
  function SingleObserver(props, ref2) {
    const {
      children,
      disabled,
      onResize: onResize2,
      data
    } = props;
    const elementRef = useRef(null);
    const onCollectionResize = useContext(CollectionContext);
    const isRenderProps = typeof children === "function";
    const mergedChildren = isRenderProps ? children(elementRef) : children;
    const canRef = !isRenderProps && /* @__PURE__ */ isValidElement(mergedChildren) && supportRef(mergedChildren);
    const originRef = canRef ? getNodeRef(mergedChildren) : null;
    const mergedRef = useComposeRef(originRef, elementRef);
    const getDomElement = () => {
      return getDOM(elementRef.current);
    };
    useImperativeHandle(ref2, () => getDomElement());
    useResizeObserver(!disabled, getDomElement, onResize2, (sizeInfo, target) => {
      onCollectionResize?.(sizeInfo, target, data);
    });
    return canRef ? /* @__PURE__ */ cloneElement(mergedChildren, {
      ref: mergedRef
    }) : mergedChildren;
  }
  var RefSingleObserver = /* @__PURE__ */ forwardRef(SingleObserver);
  if (true) {
    RefSingleObserver.displayName = "SingleObserver";
  }
  var SingleObserver_default = RefSingleObserver;

  // ../../node_modules/@rc-component/resize-observer/es/index.js
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  var INTERNAL_PREFIX_KEY = "rc-observer-key";
  function ResizeObserver2(props, ref2) {
    const {
      children
    } = props;
    const childNodes = typeof children === "function" ? [children] : toArray(children);
    if (true) {
      if (childNodes.length > 1) {
        warning(false, "Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.");
      } else if (childNodes.length === 0) {
        warning(false, "`children` of ResizeObserver is empty. Nothing is in observe.");
      }
    }
    return childNodes.map((child, index) => {
      const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`;
      return /* @__PURE__ */ createElement2(SingleObserver_default, _extends({}, props, {
        key,
        ref: index === 0 ? ref2 : void 0
      }), child);
    });
  }
  var RefResizeObserver = /* @__PURE__ */ forwardRef(ResizeObserver2);
  if (true) {
    RefResizeObserver.displayName = "ResizeObserver";
  }
  RefResizeObserver.Collection = Collection;
  var es_default = RefResizeObserver;

  // ../../node_modules/clsx/dist/clsx.mjs
  function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx() {
    for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
  function _arrayLikeToArray(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n = Array(a2); e < a2; e++) n[e] = r2[e];
    return n;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js
  function _arrayWithoutHoles(r2) {
    if (Array.isArray(r2)) return _arrayLikeToArray(r2);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/iterableToArray.js
  function _iterableToArray(r2) {
    if ("undefined" != typeof Symbol && null != r2[Symbol.iterator] || null != r2["@@iterator"]) return Array.from(r2);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js
  function _unsupportedIterableToArray(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray(r2, a2);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r2, a2) : void 0;
    }
  }

  // ../../node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // ../../node_modules/@babel/runtime/helpers/esm/toConsumableArray.js
  function _toConsumableArray(r2) {
    return _arrayWithoutHoles(r2) || _iterableToArray(r2) || _unsupportedIterableToArray(r2) || _nonIterableSpread();
  }

  // ../../node_modules/antd/es/config-provider/context.js
  var defaultPrefixCls = "ant";
  var defaultIconPrefixCls = "anticon";
  var defaultGetPrefixCls = (suffixCls, customizePrefixCls) => {
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls;
  };
  var ConfigContext = /* @__PURE__ */ createContext({
    // We provide a default function for Context without provider
    getPrefixCls: defaultGetPrefixCls,
    iconPrefixCls: defaultIconPrefixCls
  });
  var {
    Consumer: ConfigConsumer
  } = ConfigContext;
  var EMPTY_OBJECT = {};
  function useComponentConfig(propName) {
    const context = useContext(ConfigContext);
    const {
      getPrefixCls,
      direction,
      getPopupContainer,
      renderEmpty
    } = context;
    const propValue = context[propName];
    return {
      classNames: EMPTY_OBJECT,
      styles: EMPTY_OBJECT,
      ...propValue,
      getPrefixCls,
      direction,
      getPopupContainer,
      renderEmpty
    };
  }

  // ../../node_modules/@emotion/hash/dist/hash.browser.esm.js
  function murmur2(str) {
    var h7 = 0;
    var k, i = 0, len = str.length;
    for (; len >= 4; ++i, len -= 4) {
      k = str.charCodeAt(i) & 255 | (str.charCodeAt(++i) & 255) << 8 | (str.charCodeAt(++i) & 255) << 16 | (str.charCodeAt(++i) & 255) << 24;
      k = /* Math.imul(k, m): */
      (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16);
      k ^= /* k >>> r: */
      k >>> 24;
      h7 = /* Math.imul(k, m): */
      (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
      (h7 & 65535) * 1540483477 + ((h7 >>> 16) * 59797 << 16);
    }
    switch (len) {
      case 3:
        h7 ^= (str.charCodeAt(i + 2) & 255) << 16;
      case 2:
        h7 ^= (str.charCodeAt(i + 1) & 255) << 8;
      case 1:
        h7 ^= str.charCodeAt(i) & 255;
        h7 = /* Math.imul(h, m): */
        (h7 & 65535) * 1540483477 + ((h7 >>> 16) * 59797 << 16);
    }
    h7 ^= h7 >>> 13;
    h7 = /* Math.imul(h, m): */
    (h7 & 65535) * 1540483477 + ((h7 >>> 16) * 59797 << 16);
    return ((h7 ^ h7 >>> 15) >>> 0).toString(36);
  }
  var hash_browser_esm_default = murmur2;

  // ../../node_modules/@ant-design/cssinjs/es/Cache.js
  var SPLIT = "%";
  function pathKey(keys2) {
    return keys2.join(SPLIT);
  }
  var updateId = 0;
  var Entity = class {
    constructor(instanceId) {
      __publicField(this, "instanceId");
      /** @private Internal cache map. Do not access this directly */
      __publicField(this, "cache", /* @__PURE__ */ new Map());
      /** @private Record update times for each key */
      __publicField(this, "updateTimes", /* @__PURE__ */ new Map());
      __publicField(this, "extracted", /* @__PURE__ */ new Set());
      this.instanceId = instanceId;
    }
    get(keys2) {
      return this.opGet(pathKey(keys2));
    }
    /** A fast get cache with `get` concat. */
    opGet(keyPathStr) {
      return this.cache.get(keyPathStr) || null;
    }
    update(keys2, valueFn) {
      return this.opUpdate(pathKey(keys2), valueFn);
    }
    /** A fast get cache with `get` concat. */
    opUpdate(keyPathStr, valueFn) {
      const prevValue = this.cache.get(keyPathStr);
      const nextValue = valueFn(prevValue);
      if (nextValue === null) {
        this.cache.delete(keyPathStr);
        this.updateTimes.delete(keyPathStr);
      } else {
        this.cache.set(keyPathStr, nextValue);
        this.updateTimes.set(keyPathStr, updateId);
        updateId += 1;
      }
    }
  };
  var Cache_default = Entity;

  // ../../node_modules/@ant-design/cssinjs/es/StyleContext.js
  var ATTR_TOKEN = "data-token-hash";
  var ATTR_MARK = "data-css-hash";
  var ATTR_CACHE_PATH = "data-cache-path";
  var CSS_IN_JS_INSTANCE = "__cssinjs_instance__";
  function createCache() {
    const cssinjsInstanceId = Math.random().toString(12).slice(2);
    if (typeof document !== "undefined" && document.head && document.body) {
      const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`) || [];
      const {
        firstChild
      } = document.head;
      Array.from(styles).forEach((style2) => {
        style2[CSS_IN_JS_INSTANCE] || (style2[CSS_IN_JS_INSTANCE] = cssinjsInstanceId);
        if (style2[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
          document.head.insertBefore(style2, firstChild);
        }
      });
      const styleHash = {};
      Array.from(document.querySelectorAll(`style[${ATTR_MARK}]`)).forEach((style2) => {
        const hash2 = style2.getAttribute(ATTR_MARK);
        if (styleHash[hash2]) {
          if (style2[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
            style2.parentNode?.removeChild(style2);
          }
        } else {
          styleHash[hash2] = true;
        }
      });
    }
    return new Cache_default(cssinjsInstanceId);
  }
  var StyleContext = /* @__PURE__ */ createContext({
    hashPriority: "low",
    cache: createCache(),
    defaultCache: true,
    autoPrefix: false
  });
  var StyleContext_default = StyleContext;

  // ../../node_modules/@ant-design/cssinjs/es/theme/calc/CSSCalculator.js
  var CALC_UNIT = "CALC_UNIT";
  var regexp = new RegExp(CALC_UNIT, "g");

  // ../../node_modules/@ant-design/cssinjs/es/theme/ThemeCache.js
  function sameDerivativeOption(left, right) {
    if (left.length !== right.length) {
      return false;
    }
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) {
        return false;
      }
    }
    return true;
  }
  var _ThemeCache = class _ThemeCache {
    constructor() {
      __publicField(this, "cache");
      __publicField(this, "keys");
      __publicField(this, "cacheCallTimes");
      this.cache = /* @__PURE__ */ new Map();
      this.keys = [];
      this.cacheCallTimes = 0;
    }
    size() {
      return this.keys.length;
    }
    internalGet(derivativeOption, updateCallTimes = false) {
      let cache = {
        map: this.cache
      };
      derivativeOption.forEach((derivative2) => {
        if (!cache) {
          cache = void 0;
        } else {
          cache = cache?.map?.get(derivative2);
        }
      });
      if (cache?.value && updateCallTimes) {
        cache.value[1] = this.cacheCallTimes++;
      }
      return cache?.value;
    }
    get(derivativeOption) {
      return this.internalGet(derivativeOption, true)?.[0];
    }
    has(derivativeOption) {
      return !!this.internalGet(derivativeOption);
    }
    set(derivativeOption, value) {
      if (!this.has(derivativeOption)) {
        if (this.size() + 1 > _ThemeCache.MAX_CACHE_SIZE + _ThemeCache.MAX_CACHE_OFFSET) {
          const [targetKey] = this.keys.reduce((result, key) => {
            const [, callTimes] = result;
            if (this.internalGet(key)[1] < callTimes) {
              return [key, this.internalGet(key)[1]];
            }
            return result;
          }, [this.keys[0], this.cacheCallTimes]);
          this.delete(targetKey);
        }
        this.keys.push(derivativeOption);
      }
      let cache = this.cache;
      derivativeOption.forEach((derivative2, index) => {
        if (index === derivativeOption.length - 1) {
          cache.set(derivative2, {
            value: [value, this.cacheCallTimes++]
          });
        } else {
          const cacheValue = cache.get(derivative2);
          if (!cacheValue) {
            cache.set(derivative2, {
              map: /* @__PURE__ */ new Map()
            });
          } else if (!cacheValue.map) {
            cacheValue.map = /* @__PURE__ */ new Map();
          }
          cache = cache.get(derivative2).map;
        }
      });
    }
    deleteByPath(currentCache, derivatives) {
      const cache = currentCache.get(derivatives[0]);
      if (derivatives.length === 1) {
        if (!cache.map) {
          currentCache.delete(derivatives[0]);
        } else {
          currentCache.set(derivatives[0], {
            map: cache.map
          });
        }
        return cache.value?.[0];
      }
      const result = this.deleteByPath(cache.map, derivatives.slice(1));
      if ((!cache.map || cache.map.size === 0) && !cache.value) {
        currentCache.delete(derivatives[0]);
      }
      return result;
    }
    delete(derivativeOption) {
      if (this.has(derivativeOption)) {
        this.keys = this.keys.filter((item) => !sameDerivativeOption(item, derivativeOption));
        return this.deleteByPath(this.cache, derivativeOption);
      }
      return void 0;
    }
  };
  __publicField(_ThemeCache, "MAX_CACHE_SIZE", 20);
  __publicField(_ThemeCache, "MAX_CACHE_OFFSET", 5);
  var ThemeCache = _ThemeCache;

  // ../../node_modules/@ant-design/cssinjs/es/theme/Theme.js
  var uuid2 = 0;
  var Theme = class {
    constructor(derivatives) {
      __publicField(this, "derivatives");
      __publicField(this, "id");
      this.derivatives = Array.isArray(derivatives) ? derivatives : [derivatives];
      this.id = uuid2;
      if (derivatives.length === 0) {
        warning(derivatives.length > 0, "[Ant Design CSS-in-JS] Theme should have at least one derivative function.");
      }
      uuid2 += 1;
    }
    getDerivativeToken(token2) {
      return this.derivatives.reduce((result, derivative2) => derivative2(token2, result), void 0);
    }
  };

  // ../../node_modules/@ant-design/cssinjs/es/theme/createTheme.js
  var cacheThemes = new ThemeCache();
  function createTheme(derivatives) {
    const derivativeArr = Array.isArray(derivatives) ? derivatives : [derivatives];
    if (!cacheThemes.has(derivativeArr)) {
      cacheThemes.set(derivativeArr, new Theme(derivativeArr));
    }
    return cacheThemes.get(derivativeArr);
  }

  // ../../node_modules/@ant-design/cssinjs/es/util/index.js
  var resultCache = /* @__PURE__ */ new WeakMap();
  var RESULT_VALUE = {};
  function memoResult(callback, deps) {
    let current = resultCache;
    for (let i = 0; i < deps.length; i += 1) {
      const dep = deps[i];
      if (!current.has(dep)) {
        current.set(dep, /* @__PURE__ */ new WeakMap());
      }
      current = current.get(dep);
    }
    if (!current.has(RESULT_VALUE)) {
      current.set(RESULT_VALUE, callback());
    }
    return current.get(RESULT_VALUE);
  }
  var flattenTokenCache = /* @__PURE__ */ new WeakMap();
  function flattenToken(token2) {
    let str = flattenTokenCache.get(token2) || "";
    if (!str) {
      Object.keys(token2).forEach((key) => {
        const value = token2[key];
        str += key;
        if (value instanceof Theme) {
          str += value.id;
        } else if (value && typeof value === "object") {
          str += flattenToken(value);
        } else {
          str += value;
        }
      });
      str = hash_browser_esm_default(str);
      flattenTokenCache.set(token2, str);
    }
    return str;
  }
  function token2key(token2, salt) {
    return hash_browser_esm_default(`${salt}_${flattenToken(token2)}`);
  }
  var randomSelectorKey = `random-${Date.now()}-${Math.random()}`.replace(/\./g, "");
  var isClientSide = canUseDom();
  function unit(num) {
    if (typeof num === "number") {
      return `${num}px`;
    }
    return num;
  }
  function toStyleStr(style2, tokenKey, styleId, customizeAttrs = {}, plain = false) {
    if (plain) {
      return style2;
    }
    const attrs = {
      ...customizeAttrs,
      [ATTR_TOKEN]: tokenKey,
      [ATTR_MARK]: styleId
    };
    const attrStr = Object.keys(attrs).map((attr) => {
      const val = attrs[attr];
      return val ? `${attr}="${val}"` : null;
    }).filter((v) => v).join(" ");
    return `<style ${attrStr}>${style2}</style>`;
  }
  function where(options) {
    const {
      hashCls,
      hashPriority = "low"
    } = options || {};
    if (!hashCls) {
      return "";
    }
    const hashSelector = `.${hashCls}`;
    return hashPriority === "low" ? `:where(${hashSelector})` : hashSelector;
  }
  var isNonNullable2 = (val) => {
    return val !== void 0 && val !== null;
  };
  function injectCSPNonce(config, nonce) {
    const nonceStr = typeof nonce === "function" ? nonce() : nonce;
    if (nonceStr) {
      return {
        ...config,
        csp: {
          ...config.csp,
          nonce: nonceStr
        }
      };
    }
    return config;
  }

  // ../../node_modules/@ant-design/cssinjs/es/util/css-variables.js
  var token2CSSVar = (token2, prefix2 = "") => {
    return `--${prefix2 ? `${prefix2}-` : ""}${token2}`.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, "$1-$2").replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
  };
  var serializeCSSVar = (cssVars, hashId, options) => {
    const {
      hashCls,
      hashPriority = "low",
      scope
    } = options || {};
    if (!Object.keys(cssVars).length) {
      return "";
    }
    const baseSelector = `${where({
      hashCls,
      hashPriority
    })}.${hashId}`;
    const scopes = [scope].flat().filter(Boolean);
    const selector = scopes.length ? scopes.map((s) => `${baseSelector}.${s}`).join(", ") : baseSelector;
    return `${selector}{${Object.entries(cssVars).map(([key, value]) => `${key}:${value};`).join("")}}`;
  };
  var transformToken = (token2, themeKey, config) => {
    const {
      hashCls,
      hashPriority = "low",
      prefix: prefix2,
      unitless: unitless2,
      ignore: ignore2,
      preserve: preserve2
    } = config || {};
    const cssVars = {};
    const result = {};
    Object.entries(token2).forEach(([key, value]) => {
      if (preserve2?.[key]) {
        result[key] = value;
      } else if ((typeof value === "string" || typeof value === "number") && !ignore2?.[key]) {
        const cssVar = token2CSSVar(key, prefix2);
        cssVars[cssVar] = typeof value === "number" && !unitless2?.[key] ? `${value}px` : String(value);
        result[key] = `var(${cssVar})`;
      }
    });
    return [result, serializeCSSVar(cssVars, themeKey, {
      scope: config?.scope,
      hashCls,
      hashPriority
    })];
  };

  // ../../node_modules/@ant-design/cssinjs/es/hooks/useHMR.js
  var webpackHMR = false;
  function useDevHMR() {
    return webpackHMR;
  }
  var useHMR_default = false ? useProdHMR : useDevHMR;
  if (typeof module !== "undefined" && module && module.hot && typeof window !== "undefined") {
    const win = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : null;
    if (win && typeof win.webpackHotUpdate === "function") {
      const originWebpackHotUpdate = win.webpackHotUpdate;
      win.webpackHotUpdate = (...args) => {
        webpackHMR = true;
        setTimeout(() => {
          webpackHMR = false;
        }, 0);
        return originWebpackHotUpdate(...args);
      };
    }
  }

  // ../../node_modules/@ant-design/cssinjs/es/hooks/useGlobalCache.js
  var effectMap = /* @__PURE__ */ new Map();
  function useGlobalCache(prefix2, keyPath, cacheFn, onCacheRemove, onCacheEffect) {
    const {
      cache: globalCache
    } = useContext(StyleContext_default);
    const fullPath = [prefix2, ...keyPath];
    const fullPathStr = pathKey(fullPath);
    const HMRUpdate = useHMR_default();
    const buildCache = (updater) => {
      globalCache.opUpdate(fullPathStr, (prevCache) => {
        const [times = 0, cache] = prevCache || [void 0, void 0];
        let tmpCache = cache;
        if (cache && HMRUpdate) {
          onCacheRemove?.(tmpCache, HMRUpdate);
          tmpCache = null;
        }
        const mergedCache = tmpCache || cacheFn();
        const data = [times, mergedCache];
        return updater ? updater(data) : data;
      });
    };
    useMemo(
      () => {
        buildCache();
      },
      /* eslint-disable react-hooks/exhaustive-deps */
      [fullPathStr]
      /* eslint-enable */
    );
    let cacheEntity = globalCache.opGet(fullPathStr);
    if (!cacheEntity) {
      buildCache();
      cacheEntity = globalCache.opGet(fullPathStr);
    }
    const cacheContent = cacheEntity[1];
    useInsertionEffect(() => {
      buildCache(([times, cache]) => [times + 1, cache]);
      if (!effectMap.has(fullPathStr)) {
        onCacheEffect?.(cacheContent);
        effectMap.set(fullPathStr, true);
        Promise.resolve().then(() => {
          effectMap.delete(fullPathStr);
        });
      }
      return () => {
        globalCache.opUpdate(fullPathStr, (prevCache) => {
          const [times = 0, cache] = prevCache || [];
          const nextCount = times - 1;
          if (nextCount === 0) {
            onCacheRemove?.(cache, false);
            effectMap.delete(fullPathStr);
            return null;
          }
          return [times - 1, cache];
        });
      };
    }, [fullPathStr]);
    return cacheContent;
  }

  // ../../node_modules/@ant-design/cssinjs/es/hooks/useCacheToken.js
  var EMPTY_OVERRIDE = {};
  var hashPrefix = true ? "css-dev-only-do-not-override" : "css";
  var tokenKeys = /* @__PURE__ */ new Map();
  function recordCleanToken(tokenKey) {
    tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) + 1);
  }
  function removeStyleTags(key, instanceId) {
    if (typeof document !== "undefined") {
      const styles = document.querySelectorAll(`style[${ATTR_TOKEN}="${key}"]`);
      styles.forEach((style2) => {
        if (style2[CSS_IN_JS_INSTANCE] === instanceId) {
          style2.parentNode?.removeChild(style2);
        }
      });
    }
  }
  var TOKEN_THRESHOLD = -1;
  function cleanTokenStyle(tokenKey, instanceId) {
    tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) - 1);
    const cleanableKeyList = /* @__PURE__ */ new Set();
    tokenKeys.forEach((value, key) => {
      if (value <= 0) cleanableKeyList.add(key);
    });
    if (tokenKeys.size - cleanableKeyList.size > TOKEN_THRESHOLD) {
      cleanableKeyList.forEach((key) => {
        removeStyleTags(key, instanceId);
        tokenKeys.delete(key);
      });
    }
  }
  var getComputedToken = (originToken, overrideToken, theme, format) => {
    const derivativeToken = theme.getDerivativeToken(originToken);
    let mergedDerivativeToken = {
      ...derivativeToken,
      ...overrideToken
    };
    if (format) {
      mergedDerivativeToken = format(mergedDerivativeToken);
    }
    return mergedDerivativeToken;
  };
  var TOKEN_PREFIX = "token";
  function useCacheToken(theme, tokens, option2) {
    const {
      cache: {
        instanceId
      },
      container,
      hashPriority
    } = useContext(StyleContext_default);
    const {
      salt = "",
      override = EMPTY_OVERRIDE,
      formatToken: formatToken2,
      getComputedToken: compute,
      cssVar,
      nonce
    } = option2;
    const mergedToken = memoResult(() => Object.assign({}, ...tokens), tokens);
    const tokenStr = flattenToken(mergedToken);
    const overrideTokenStr = flattenToken(override);
    const cssVarStr = flattenToken(cssVar);
    const cachedToken = useGlobalCache(TOKEN_PREFIX, [salt, theme.id, tokenStr, overrideTokenStr, cssVarStr], () => {
      const mergedDerivativeToken = compute ? compute(mergedToken, override, theme) : getComputedToken(mergedToken, override, theme, formatToken2);
      const actualToken = {
        ...mergedDerivativeToken
      };
      const mergedSalt = `${salt}_${cssVar.prefix}`;
      const hashId = hash_browser_esm_default(mergedSalt);
      const hashCls = `${hashPrefix}-${hashId}`;
      actualToken._tokenKey = token2key(actualToken, mergedSalt);
      const [tokenWithCssVar, cssVarsStr] = transformToken(mergedDerivativeToken, cssVar.key, {
        prefix: cssVar.prefix,
        ignore: cssVar.ignore,
        unitless: cssVar.unitless,
        preserve: cssVar.preserve,
        hashPriority,
        hashCls: cssVar.hashed ? hashCls : void 0
      });
      tokenWithCssVar._hashId = hashId;
      recordCleanToken(cssVar.key);
      return [tokenWithCssVar, hashCls, actualToken, cssVarsStr, cssVar.key];
    }, ([, , , , themeKey]) => {
      cleanTokenStyle(themeKey, instanceId);
    }, ([, , , cssVarsStr, themeKey]) => {
      if (!cssVarsStr) {
        return;
      }
      let mergedCSSConfig = {
        mark: ATTR_MARK,
        prepend: "queue",
        attachTo: container,
        priority: -999
      };
      mergedCSSConfig = injectCSPNonce(mergedCSSConfig, nonce);
      const style2 = updateCSS(cssVarsStr, hash_browser_esm_default(`css-var-${themeKey}`), mergedCSSConfig);
      style2[CSS_IN_JS_INSTANCE] = instanceId;
      style2.setAttribute(ATTR_TOKEN, themeKey);
    });
    return cachedToken;
  }
  var extract = (cache, effectStyles, options) => {
    const [, , realToken, styleStr, cssVarKey] = cache;
    const {
      plain
    } = options || {};
    if (!styleStr) {
      return null;
    }
    const styleId = realToken._tokenKey;
    const order = -999;
    const sharedAttrs = {
      "data-rc-order": "prependQueue",
      "data-rc-priority": `${order}`
    };
    const styleText = toStyleStr(styleStr, cssVarKey, styleId, sharedAttrs, plain);
    return [order, styleId, styleText];
  };

  // ../../node_modules/@emotion/unitless/dist/unitless.browser.esm.js
  var unitlessKeys = {
    animationIterationCount: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    // SVG-related properties
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1
  };
  var unitless_browser_esm_default = unitlessKeys;

  // ../../node_modules/stylis/src/Enum.js
  var MS = "-ms-";
  var MOZ = "-moz-";
  var WEBKIT = "-webkit-";
  var COMMENT = "comm";
  var RULESET = "rule";
  var DECLARATION = "decl";
  var IMPORT = "@import";
  var NAMESPACE = "@namespace";
  var KEYFRAMES = "@keyframes";
  var LAYER = "@layer";

  // ../../node_modules/stylis/src/Utility.js
  var abs = Math.abs;
  var from = String.fromCharCode;
  var assign = Object.assign;
  function hash(value, length2) {
    return charat(value, 0) ^ 45 ? (((length2 << 2 ^ charat(value, 0)) << 2 ^ charat(value, 1)) << 2 ^ charat(value, 2)) << 2 ^ charat(value, 3) : 0;
  }
  function trim(value) {
    return value.trim();
  }
  function match2(value, pattern) {
    return (value = pattern.exec(value)) ? value[0] : value;
  }
  function replace(value, pattern, replacement) {
    return value.replace(pattern, replacement);
  }
  function indexof(value, search) {
    return value.indexOf(search);
  }
  function charat(value, index) {
    return value.charCodeAt(index) | 0;
  }
  function substr(value, begin, end) {
    return value.slice(begin, end);
  }
  function strlen(value) {
    return value.length;
  }
  function sizeof(value) {
    return value.length;
  }
  function append(value, array) {
    return array.push(value), value;
  }
  function combine(array, callback) {
    return array.map(callback).join("");
  }
  function filter(array, pattern) {
    return array.filter(function(value) {
      return !match2(value, pattern);
    });
  }

  // ../../node_modules/stylis/src/Tokenizer.js
  var line = 1;
  var column = 1;
  var length = 0;
  var position = 0;
  var character = 0;
  var characters = "";
  function node(value, root, parent, type, props, children, length2, siblings) {
    return { value, root, parent, type, props, children, line, column, length: length2, return: "", siblings };
  }
  function copy(root, props) {
    return assign(node("", null, null, "", null, null, 0, root.siblings), root, { length: -root.length }, props);
  }
  function lift(root) {
    while (root.root)
      root = copy(root.root, { children: [root] });
    append(root, root.siblings);
  }
  function char() {
    return character;
  }
  function prev() {
    character = position > 0 ? charat(characters, --position) : 0;
    if (column--, character === 10)
      column = 1, line--;
    return character;
  }
  function next() {
    character = position < length ? charat(characters, position++) : 0;
    if (column++, character === 10)
      column = 1, line++;
    return character;
  }
  function peek() {
    return charat(characters, position);
  }
  function caret() {
    return position;
  }
  function slice(begin, end) {
    return substr(characters, begin, end);
  }
  function token(type) {
    switch (type) {
      // \0 \t \n \r \s whitespace token
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;
      // ! + , / > @ ~ isolate token
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      // ; { } breakpoint token
      case 59:
      case 123:
      case 125:
        return 4;
      // : accompanied token
      case 58:
        return 3;
      // " ' ( [ opening delimit token
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;
      // ) ] closing delimit token
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  function alloc(value) {
    return line = column = 1, length = strlen(characters = value), position = 0, [];
  }
  function dealloc(value) {
    return characters = "", value;
  }
  function delimit(type) {
    return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)));
  }
  function whitespace(type) {
    while (character = peek())
      if (character < 33)
        next();
      else
        break;
    return token(type) > 2 || token(character) > 3 ? "" : " ";
  }
  function escaping(index, count) {
    while (--count && next())
      if (character < 48 || character > 102 || character > 57 && character < 65 || character > 70 && character < 97)
        break;
    return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32));
  }
  function delimiter(type) {
    while (next())
      switch (character) {
        // ] ) " '
        case type:
          return position;
        // " '
        case 34:
        case 39:
          if (type !== 34 && type !== 39)
            delimiter(character);
          break;
        // (
        case 40:
          if (type === 41)
            delimiter(type);
          break;
        // \
        case 92:
          next();
          break;
      }
    return position;
  }
  function commenter(type, index) {
    while (next())
      if (type + character === 47 + 10)
        break;
      else if (type + character === 42 + 42 && peek() === 47)
        break;
    return "/*" + slice(index, position - 1) + "*" + from(type === 47 ? type : next());
  }
  function identifier(index) {
    while (!token(peek()))
      next();
    return slice(index, position);
  }

  // ../../node_modules/stylis/src/Parser.js
  function compile(value) {
    return dealloc(parse("", null, null, null, [""], value = alloc(value), 0, [0], value));
  }
  function parse(value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
    var index = 0;
    var offset = 0;
    var length2 = pseudo;
    var atrule = 0;
    var property = 0;
    var previous = 0;
    var variable = 1;
    var scanning = 1;
    var ampersand = 1;
    var parens = 0;
    var character2 = 0;
    var type = "";
    var props = rules;
    var children = rulesets;
    var reference = rule;
    var characters2 = type;
    while (scanning)
      switch (previous = character2, character2 = next()) {
        // (
        case 40:
          if (previous != 108 && charat(characters2, length2 - 1) == 58) parens++, characters2 += "(";
          else characters2 += delimit(character2);
          break;
        // )
        case 41:
          parens--, characters2 += ")";
          break;
        // " ' [
        case 34:
        case 39:
        case 91:
          characters2 += delimit(character2);
          break;
        // \t \n \r \s
        case 9:
        case 10:
        case 13:
        case 32:
          if (parens > 0) {
            characters2 += from(character2);
            break;
          }
          characters2 += whitespace(previous);
          break;
        // \
        case 92:
          characters2 += escaping(caret() - 1, 7);
          continue;
        // /
        case 47:
          switch (peek()) {
            case 42:
            case 47:
              append(comment(commenter(next(), caret()), root, parent, declarations), declarations);
              if ((token(previous || 1) == 5 || token(peek() || 1) == 5) && strlen(characters2) && substr(characters2, -1, void 0) !== " ") characters2 += " ";
              break;
            default:
              characters2 += "/";
          }
          break;
        // {
        case 123 * variable:
          points[index++] = strlen(characters2) * ampersand;
        // } ; \0
        case 125 * variable:
        case 59:
        case 0:
          if (parens > 0 && character2) {
            characters2 += from(character2);
            break;
          }
          switch (character2) {
            // \0 }
            case 0:
            case 125:
              scanning = 0;
            // ;
            case 59 + offset:
              if (ampersand == -1) characters2 = replace(characters2, /\f/g, "");
              if (property > 0 && (strlen(characters2) - length2 || variable === 0))
                append(property > 32 ? declaration(characters2 + ";", rule, parent, length2 - 1, declarations) : declaration(replace(characters2, " ", "") + ";", rule, parent, length2 - 2, declarations), declarations);
              break;
            // @ ;
            case 59:
              characters2 += ";";
            // { rule/at-rule
            default:
              append(reference = ruleset(characters2, root, parent, index, offset, rules, points, type, props = [], children = [], length2, rulesets), rulesets);
              if (character2 === 123)
                if (offset === 0)
                  parse(characters2, root, reference, reference, props, rulesets, length2, points, children);
                else {
                  switch (atrule) {
                    // c(ontainer)
                    case 99:
                      if (charat(characters2, 3) === 110) break;
                    // l(ayer)
                    case 108:
                      if (charat(characters2, 2) === 97) break;
                    default:
                      offset = 0;
                    // d(ocument) m(edia) s(upports)
                    case 100:
                    case 109:
                    case 115:
                  }
                  if (offset) parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length2, children), children), rules, children, length2, points, rule ? props : children);
                  else parse(characters2, reference, reference, reference, [""], children, 0, points, children);
                }
          }
          index = offset = property = 0, variable = ampersand = 1, type = characters2 = "", length2 = pseudo;
          break;
        // :
        case 58:
          length2 = 1 + strlen(characters2), property = previous;
        default:
          if (variable < 1) {
            if (character2 == 123)
              --variable;
            else if (character2 == 125 && variable++ == 0 && prev() == 125)
              continue;
          }
          switch (characters2 += from(character2), character2 * variable) {
            // &
            case 38:
              ampersand = offset > 0 ? 1 : (characters2 += "\f", -1);
              break;
            // ,
            case 44:
              if (parens > 0) break;
              points[index++] = (strlen(characters2) - 1) * ampersand, ampersand = 1;
              break;
            // @
            case 64:
              if (peek() === 45)
                characters2 += delimit(next());
              atrule = peek(), offset = length2 = strlen(type = characters2 += identifier(caret())), character2++;
              break;
            // -
            case 45:
              if (previous === 45 && strlen(characters2) == 2)
                variable = 0;
          }
      }
    return rulesets;
  }
  function ruleset(value, root, parent, index, offset, rules, points, type, props, children, length2, siblings) {
    var post = offset - 1;
    var rule = offset === 0 ? rules : [""];
    var size = sizeof(rule);
    for (var i = 0, j = 0, k = 0; i < index; ++i)
      for (var x = 0, y = substr(value, post + 1, post = abs(j = points[i])), z = value; x < size; ++x)
        if (z = trim(j > 0 ? rule[x] + " " + y : replace(y, /&\f/g, rule[x])))
          props[k++] = z;
    return node(value, root, parent, offset === 0 ? RULESET : type, props, children, length2, siblings);
  }
  function comment(value, root, parent, siblings) {
    return node(value, root, parent, COMMENT, from(char()), substr(value, 2, -2), 0, siblings);
  }
  function declaration(value, root, parent, length2, siblings) {
    return node(value, root, parent, DECLARATION, substr(value, 0, length2), substr(value, length2 + 1, -1), length2, siblings);
  }

  // ../../node_modules/stylis/src/Prefixer.js
  function prefix(value, length2, children) {
    switch (hash(value, length2)) {
      // color-adjust
      case 5103:
        return WEBKIT + "print-" + value + value;
      // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
      // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
        return WEBKIT + value + value;
      // mask-composite
      case 4855:
        return WEBKIT + value.replace("add", "source-over").replace("substract", "source-out").replace("intersect", "source-in").replace("exclude", "xor") + value;
      // tab-size
      case 4789:
        return MOZ + value + value;
      // appearance, user-select, transform, hyphens, text-size-adjust
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return WEBKIT + value + MOZ + value + MS + value + value;
      // writing-mode
      case 5936:
        switch (charat(value, length2 + 11)) {
          // vertical-l(r)
          case 114:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb") + value;
          // vertical-r(l)
          case 108:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb-rl") + value;
          // horizontal(-)tb
          case 45:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "lr") + value;
        }
      // flex, flex-direction, scroll-snap-type, writing-mode
      case 6828:
      case 4268:
      case 2903:
        return WEBKIT + value + MS + value + value;
      // order
      case 6165:
        return WEBKIT + value + MS + "flex-" + value + value;
      // align-items
      case 5187:
        return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + "box-$1$2" + MS + "flex-$1$2") + value;
      // align-self
      case 5443:
        return WEBKIT + value + MS + "flex-item-" + replace(value, /flex-|-self/g, "") + (!match2(value, /flex-|baseline/) ? MS + "grid-row-" + replace(value, /flex-|-self/g, "") : "") + value;
      // align-content
      case 4675:
        return WEBKIT + value + MS + "flex-line-pack" + replace(value, /align-content|flex-|-self/g, "") + value;
      // flex-shrink
      case 5548:
        return WEBKIT + value + MS + replace(value, "shrink", "negative") + value;
      // flex-basis
      case 5292:
        return WEBKIT + value + MS + replace(value, "basis", "preferred-size") + value;
      // flex-grow
      case 6060:
        return WEBKIT + "box-" + replace(value, "-grow", "") + WEBKIT + value + MS + replace(value, "grow", "positive") + value;
      // transition
      case 4554:
        return WEBKIT + replace(value, /([^-])(transform)/g, "$1" + WEBKIT + "$2") + value;
      // cursor
      case 6187:
        return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + "$1"), /(image-set)/, WEBKIT + "$1"), value, "") + value;
      // background, background-image
      case 5495:
      case 3959:
        return replace(value, /(image-set\([^]*)/, WEBKIT + "$1$`$1");
      // justify-content
      case 4968:
        return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + "box-pack:$3" + MS + "flex-pack:$3"), /space-between/, "justify") + WEBKIT + value + value;
      // justify-self
      case 4200:
        if (!match2(value, /flex-|baseline/)) return MS + "grid-column-align" + substr(value, length2) + value;
        break;
      // grid-template-(columns|rows)
      case 2592:
      case 3360:
        return MS + replace(value, "template-", "") + value;
      // grid-(row|column)-start
      case 4384:
      case 3616:
        if (children && children.some(function(element, index) {
          return length2 = index, match2(element.props, /grid-\w+-end/);
        })) {
          return ~indexof(value + (children = children[length2].value), "span") ? value : MS + replace(value, "-start", "") + value + MS + "grid-row-span:" + (~indexof(children, "span") ? match2(children, /\d+/) : +match2(children, /\d+/) - +match2(value, /\d+/)) + ";";
        }
        return MS + replace(value, "-start", "") + value;
      // grid-(row|column)-end
      case 4896:
      case 4128:
        return children && children.some(function(element) {
          return match2(element.props, /grid-\w+-start/);
        }) ? value : MS + replace(replace(value, "-end", "-span"), "span ", "") + value;
      // (margin|padding)-inline-(start|end)
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return replace(value, /(.+)-inline(.+)/, WEBKIT + "$1$2") + value;
      // (min|max)?(width|height|inline-size|block-size)
      case 8116:
      case 7059:
      case 5753:
      case 5535:
      case 5445:
      case 5701:
      case 4933:
      case 4677:
      case 5533:
      case 5789:
      case 5021:
      case 4765:
        if (strlen(value) - 1 - length2 > 6)
          switch (charat(value, length2 + 1)) {
            // (m)ax-content, (m)in-content
            case 109:
              if (charat(value, length2 + 4) !== 45)
                break;
            // (f)ill-available, (f)it-content
            case 102:
              return replace(value, /(.+:)(.+)-([^]+)/, "$1" + WEBKIT + "$2-$3$1" + MOZ + (charat(value, length2 + 3) == 108 ? "$3" : "$2-$3")) + value;
            // (s)tretch
            case 115:
              return ~indexof(value, "stretch") ? prefix(replace(value, "stretch", "fill-available"), length2, children) + value : value;
          }
        break;
      // grid-(column|row)
      case 5152:
      case 5920:
        return replace(value, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function(_, a2, b, c, d, e, f) {
          return MS + a2 + ":" + b + f + (c ? MS + a2 + "-span:" + (d ? e : +e - +b) + f : "") + value;
        });
      // position: sticky
      case 4949:
        if (charat(value, length2 + 6) === 121)
          return replace(value, ":", ":" + WEBKIT) + value;
        break;
      // display: (flex|inline-flex|grid|inline-grid)
      case 6444:
        switch (charat(value, charat(value, 14) === 45 ? 18 : 11)) {
          // (inline-)?fle(x)
          case 120:
            return replace(value, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, "$1" + WEBKIT + (charat(value, 14) === 45 ? "inline-" : "") + "box$3$1" + WEBKIT + "$2$3$1" + MS + "$2box$3") + value;
          // (inline-)?gri(d)
          case 100:
            return replace(value, ":", ":" + MS) + value;
        }
        break;
      // scroll-margin, scroll-margin-(top|right|bottom|left)
      case 5719:
      case 2647:
      case 2135:
      case 3927:
      case 2391:
        return replace(value, "scroll-", "scroll-snap-") + value;
    }
    return value;
  }

  // ../../node_modules/stylis/src/Serializer.js
  function serialize(children, callback) {
    var output = "";
    for (var i = 0; i < children.length; i++)
      output += callback(children[i], i, children, callback) || "";
    return output;
  }
  function stringify(element, index, children, callback) {
    switch (element.type) {
      case LAYER:
        if (element.children.length) break;
      case IMPORT:
      case NAMESPACE:
      case DECLARATION:
        return element.return = element.return || element.value;
      case COMMENT:
        return "";
      case KEYFRAMES:
        return element.return = element.value + "{" + serialize(element.children, callback) + "}";
      case RULESET:
        if (!strlen(element.value = element.props.join(","))) return "";
    }
    return strlen(children = serialize(element.children, callback)) ? element.return = element.value + "{" + children + "}" : "";
  }

  // ../../node_modules/stylis/src/Middleware.js
  function middleware(collection) {
    var length2 = sizeof(collection);
    return function(element, index, children, callback) {
      var output = "";
      for (var i = 0; i < length2; i++)
        output += collection[i](element, index, children, callback) || "";
      return output;
    };
  }
  function prefixer(element, index, children, callback) {
    if (element.length > -1) {
      if (!element.return)
        switch (element.type) {
          case DECLARATION:
            element.return = prefix(element.value, element.length, children);
            return;
          case KEYFRAMES:
            return serialize([copy(element, { value: replace(element.value, "@", "@" + WEBKIT) })], callback);
          case RULESET:
            if (element.length)
              return combine(children = element.props, function(value) {
                switch (match2(value, callback = /(::plac\w+|:read-\w+)/)) {
                  // :read-(only|write)
                  case ":read-only":
                  case ":read-write":
                    lift(copy(element, { props: [replace(value, /:(read-\w+)/, ":" + MOZ + "$1")] }));
                    lift(copy(element, { props: [value] }));
                    assign(element, { props: filter(children, callback) });
                    break;
                  // :placeholder
                  case "::placeholder":
                    lift(copy(element, { props: [replace(value, /:(plac\w+)/, ":" + WEBKIT + "input-$1")] }));
                    lift(copy(element, { props: [replace(value, /:(plac\w+)/, ":" + MOZ + "$1")] }));
                    lift(copy(element, { props: [replace(value, /:(plac\w+)/, MS + "input-$1")] }));
                    lift(copy(element, { props: [value] }));
                    assign(element, { props: filter(children, callback) });
                    break;
                }
                return "";
              });
        }
    }
  }

  // ../../node_modules/@ant-design/cssinjs/es/linters/utils.js
  function lintWarning(message, info) {
    const {
      path,
      parentSelectors
    } = info;
    warning_default(false, `[Ant Design CSS-in-JS] ${path ? `Error in ${path}: ` : ""}${message}${parentSelectors.length ? ` Selector: ${parentSelectors.join(" | ")}` : ""}`);
  }

  // ../../node_modules/@ant-design/cssinjs/es/linters/contentQuotesLinter.js
  var linter = (key, value, info) => {
    if (key === "content") {
      const contentValuePattern = /(attr|counters?|url|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
      const contentValues = ["normal", "none", "initial", "inherit", "unset"];
      if (typeof value !== "string" || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && !value.startsWith("var(") && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
        lintWarning(`You seem to be using a value for 'content' without quotes, try replacing it with \`content: '"${value}"'\`.`, info);
      }
    }
  };
  var contentQuotesLinter_default = linter;

  // ../../node_modules/@ant-design/cssinjs/es/linters/hashedAnimationLinter.js
  var linter2 = (key, value, info) => {
    if (key === "animation") {
      if (info.hashId && value !== "none") {
        lintWarning(`You seem to be using hashed animation '${value}', in which case 'animationName' with Keyframe as value is recommended.`, info);
      }
    }
  };
  var hashedAnimationLinter_default = linter2;

  // ../../node_modules/@ant-design/cssinjs/es/util/cacheMapUtil.js
  var ATTR_CACHE_MAP = "data-ant-cssinjs-cache-path";
  var CSS_FILE_STYLE = "_FILE_STYLE__";
  var cachePathMap;
  var fromCSSFile = true;
  function prepare() {
    if (!cachePathMap) {
      cachePathMap = {};
      if (canUseDom()) {
        const div2 = document.createElement("div");
        div2.className = ATTR_CACHE_MAP;
        div2.style.position = "fixed";
        div2.style.visibility = "hidden";
        div2.style.top = "-9999px";
        document.body.appendChild(div2);
        let content = getComputedStyle(div2).content || "";
        content = content.replace(/^"/, "").replace(/"$/, "");
        content.split(";").forEach((item) => {
          const [path, hash2] = item.split(":");
          cachePathMap[path] = hash2;
        });
        const inlineMapStyle = document.querySelector(`style[${ATTR_CACHE_MAP}]`);
        if (inlineMapStyle) {
          fromCSSFile = false;
          inlineMapStyle.parentNode?.removeChild(inlineMapStyle);
        }
        document.body.removeChild(div2);
      }
    }
  }
  function existPath(path) {
    prepare();
    return !!cachePathMap[path];
  }
  function getStyleAndHash(path) {
    const hash2 = cachePathMap[path];
    let styleStr = null;
    if (hash2 && canUseDom()) {
      if (fromCSSFile) {
        styleStr = CSS_FILE_STYLE;
      } else {
        const style2 = document.querySelector(`style[${ATTR_MARK}="${cachePathMap[path]}"]`);
        if (style2) {
          styleStr = style2.innerHTML;
        } else {
          delete cachePathMap[path];
        }
      }
    }
    return [styleStr, hash2];
  }

  // ../../node_modules/@ant-design/cssinjs/es/hooks/useStyleRegister.js
  var SKIP_CHECK = "_skip_check_";
  var MULTI_VALUE = "_multi_value_";
  function normalizeStyle(styleStr, autoPrefix) {
    const serialized = autoPrefix ? serialize(compile(styleStr), middleware([prefixer, stringify])) : serialize(compile(styleStr), stringify);
    return serialized.replace(/\{%%%\:[^;];}/g, ";");
  }
  function isCompoundCSSProperty(value) {
    return typeof value === "object" && value && (SKIP_CHECK in value || MULTI_VALUE in value);
  }
  function injectSelectorHash(key, hashId, hashPriority = "high") {
    if (!hashId) {
      return key;
    }
    const hashSelector = where({
      hashCls: hashId,
      hashPriority
    });
    const keys2 = key.split(",").map((k) => {
      const fullPath = k.trim().split(/\s+/);
      let firstPath = fullPath[0] || "";
      const htmlElement = firstPath.match(/^\w+/)?.[0] || "";
      firstPath = `${htmlElement}${hashSelector}${firstPath.slice(htmlElement.length)}`;
      return [firstPath, ...fullPath.slice(1)].join(" ");
    });
    return keys2.join(",");
  }
  var parseStyle = (interpolation, config = {}, {
    root,
    injectHash,
    parentSelectors
  } = {
    root: true,
    parentSelectors: []
  }) => {
    const {
      hashId,
      layer,
      path,
      hashPriority,
      transformers = [],
      linters = []
    } = config;
    let styleStr = "";
    let effectStyle = {};
    function parseKeyframes(keyframes) {
      const animationName = keyframes.getName(hashId);
      if (!effectStyle[animationName]) {
        const [parsedStr] = parseStyle(keyframes.style, config, {
          root: false,
          parentSelectors
        });
        effectStyle[animationName] = `@keyframes ${keyframes.getName(hashId)}${parsedStr}`;
      }
    }
    function flattenList(list2, fullList = []) {
      list2.forEach((item) => {
        if (Array.isArray(item)) {
          flattenList(item, fullList);
        } else if (item) {
          fullList.push(item);
        }
      });
      return fullList;
    }
    const flattenStyleList = flattenList(Array.isArray(interpolation) ? interpolation : [interpolation]);
    flattenStyleList.forEach((originStyle) => {
      const style2 = typeof originStyle === "string" && !root ? {} : originStyle;
      if (typeof style2 === "string") {
        styleStr += `${style2}
`;
      } else if (style2._keyframe) {
        parseKeyframes(style2);
      } else {
        const mergedStyle = transformers.reduce((prev2, trans) => trans?.visit?.(prev2) || prev2, style2);
        Object.keys(mergedStyle).forEach((key) => {
          const value = mergedStyle[key];
          if (typeof value === "object" && value && (key !== "animationName" || !value._keyframe) && !isCompoundCSSProperty(value)) {
            let subInjectHash = false;
            let mergedKey = key.trim();
            let nextRoot = false;
            if ((root || injectHash) && hashId) {
              if (mergedKey.startsWith("@")) {
                subInjectHash = true;
              } else if (mergedKey === "&") {
                mergedKey = injectSelectorHash("", hashId, hashPriority);
              } else {
                mergedKey = injectSelectorHash(key, hashId, hashPriority);
              }
            } else if (root && !hashId && (mergedKey === "&" || mergedKey === "")) {
              mergedKey = "";
              nextRoot = true;
            }
            const [parsedStr, childEffectStyle] = parseStyle(value, config, {
              root: nextRoot,
              injectHash: subInjectHash,
              parentSelectors: [...parentSelectors, mergedKey]
            });
            effectStyle = {
              ...effectStyle,
              ...childEffectStyle
            };
            styleStr += `${mergedKey}${parsedStr}`;
          } else {
            let appendStyle = function(cssKey, cssValue) {
              if (typeof value !== "object" || !value?.[SKIP_CHECK]) {
                [contentQuotesLinter_default, hashedAnimationLinter_default, ...linters].forEach((linter3) => linter3(cssKey, cssValue, {
                  path,
                  hashId,
                  parentSelectors
                }));
              }
              const styleName = cssKey.replace(/[A-Z]/g, (match3) => `-${match3.toLowerCase()}`);
              let formatValue = cssValue;
              if (!unitless_browser_esm_default[cssKey] && typeof formatValue === "number" && formatValue !== 0) {
                formatValue = `${formatValue}px`;
              }
              if (cssKey === "animationName" && cssValue?._keyframe) {
                parseKeyframes(cssValue);
                formatValue = cssValue.getName(hashId);
              }
              styleStr += `${styleName}:${formatValue};`;
            };
            const actualValue = value?.value ?? value;
            if (typeof value === "object" && value?.[MULTI_VALUE] && Array.isArray(actualValue)) {
              actualValue.forEach((item) => {
                appendStyle(key, item);
              });
            } else {
              if (isNonNullable2(actualValue)) {
                appendStyle(key, actualValue);
              }
            }
          }
        });
      }
    });
    if (!root) {
      styleStr = `{${styleStr}}`;
    } else if (layer) {
      if (styleStr) {
        styleStr = `@layer ${layer.name} {${styleStr}}`;
      }
      if (layer.dependencies) {
        effectStyle[`@layer ${layer.name}`] = layer.dependencies.map((deps) => `@layer ${deps}, ${layer.name};`).join("\n");
      }
    }
    return [styleStr, effectStyle];
  };
  function uniqueHash(path, styleStr) {
    return hash_browser_esm_default(`${path.join("%")}${styleStr}`);
  }
  var STYLE_PREFIX = "style";
  function useStyleRegister(info, styleFn) {
    const {
      path,
      hashId,
      layer,
      nonce,
      clientOnly,
      order = 0
    } = info;
    const {
      mock,
      hashPriority,
      container,
      transformers,
      linters,
      cache,
      layer: enableLayer,
      autoPrefix
    } = useContext(StyleContext_default);
    const fullPath = [hashId || ""];
    if (enableLayer) {
      fullPath.push("layer");
    }
    fullPath.push(...path);
    let isMergedClientSide = isClientSide;
    if (mock !== void 0) {
      isMergedClientSide = mock === "client";
    }
    useGlobalCache(
      STYLE_PREFIX,
      fullPath,
      // Create cache if needed
      () => {
        const cachePath = fullPath.join("|");
        if (existPath(cachePath)) {
          const [inlineCacheStyleStr, styleHash] = getStyleAndHash(cachePath);
          if (inlineCacheStyleStr) {
            return [inlineCacheStyleStr, styleHash, {}, clientOnly, order];
          }
        }
        const styleObj = styleFn();
        const [parsedStyle, effectStyle] = parseStyle(styleObj, {
          hashId,
          hashPriority,
          layer: enableLayer ? layer : void 0,
          path: path.join("-"),
          transformers,
          linters
        });
        const styleStr = normalizeStyle(parsedStyle, autoPrefix || false);
        const styleId = uniqueHash(fullPath, styleStr);
        return [styleStr, styleId, effectStyle, clientOnly, order];
      },
      // Remove cache if no need
      (cacheValue, fromHMR) => {
        const [, styleId] = cacheValue;
        if (fromHMR && isClientSide) {
          removeCSS(styleId, {
            mark: ATTR_MARK,
            attachTo: container
          });
        }
      },
      // Effect: Inject style here
      (cacheValue) => {
        const [styleStr, styleId, effectStyle, , priority] = cacheValue;
        if (isMergedClientSide && styleStr !== CSS_FILE_STYLE) {
          let mergedCSSConfig = {
            mark: ATTR_MARK,
            prepend: enableLayer ? false : "queue",
            attachTo: container,
            priority
          };
          mergedCSSConfig = injectCSPNonce(mergedCSSConfig, nonce);
          const effectLayerKeys = [];
          const effectRestKeys = [];
          Object.keys(effectStyle).forEach((key) => {
            if (key.startsWith("@layer")) {
              effectLayerKeys.push(key);
            } else {
              effectRestKeys.push(key);
            }
          });
          effectLayerKeys.forEach((effectKey) => {
            updateCSS(normalizeStyle(effectStyle[effectKey], autoPrefix || false), `_layer-${effectKey}`, {
              ...mergedCSSConfig,
              prepend: true
            });
          });
          const style2 = updateCSS(styleStr, styleId, mergedCSSConfig);
          style2[CSS_IN_JS_INSTANCE] = cache.instanceId;
          if (true) {
            style2.setAttribute(ATTR_CACHE_PATH, fullPath.join("|"));
          }
          effectRestKeys.forEach((effectKey) => {
            updateCSS(normalizeStyle(effectStyle[effectKey], autoPrefix || false), `_effect-${effectKey}`, mergedCSSConfig);
          });
        }
      }
    );
  }
  var extract2 = (cache, effectStyles, options) => {
    const [styleStr, styleId, effectStyle, clientOnly, order] = cache;
    const {
      plain,
      autoPrefix
    } = options || {};
    if (clientOnly) {
      return null;
    }
    let keyStyleText = styleStr;
    const sharedAttrs = {
      "data-rc-order": "prependQueue",
      "data-rc-priority": `${order}`
    };
    keyStyleText = toStyleStr(styleStr, void 0, styleId, sharedAttrs, plain);
    if (effectStyle) {
      Object.keys(effectStyle).forEach((effectKey) => {
        if (!effectStyles[effectKey]) {
          effectStyles[effectKey] = true;
          const effectStyleStr = normalizeStyle(effectStyle[effectKey], autoPrefix || false);
          const effectStyleHTML = toStyleStr(effectStyleStr, void 0, `_effect-${effectKey}`, sharedAttrs, plain);
          if (effectKey.startsWith("@layer")) {
            keyStyleText = effectStyleHTML + keyStyleText;
          } else {
            keyStyleText += effectStyleHTML;
          }
        }
      });
    }
    return [order, styleId, keyStyleText];
  };

  // ../../node_modules/@ant-design/cssinjs/es/hooks/useCSSVarRegister.js
  var CSS_VAR_PREFIX = "cssVar";
  var useCSSVarRegister = (config, fn) => {
    const {
      key,
      prefix: prefix2,
      unitless: unitless2,
      ignore: ignore2,
      token: token2,
      hashId,
      scope,
      nonce
    } = config;
    const {
      cache: {
        instanceId
      },
      container,
      hashPriority
    } = useContext(StyleContext_default);
    const {
      _tokenKey: tokenKey
    } = token2;
    const scopeKey = Array.isArray(scope) ? scope.join("@@") : scope;
    const stylePath = [...config.path, key, scopeKey, tokenKey];
    const cache = useGlobalCache(CSS_VAR_PREFIX, stylePath, () => {
      const originToken = fn();
      const [mergedToken, cssVarsStr] = transformToken(originToken, key, {
        prefix: prefix2,
        unitless: unitless2,
        ignore: ignore2,
        scope,
        hashPriority,
        hashCls: hashId
      });
      const styleId = uniqueHash(stylePath, cssVarsStr);
      return [mergedToken, cssVarsStr, styleId, key];
    }, ([, , styleId]) => {
      if (isClientSide) {
        removeCSS(styleId, {
          mark: ATTR_MARK,
          attachTo: container
        });
      }
    }, ([, cssVarsStr, styleId]) => {
      if (!cssVarsStr) {
        return;
      }
      let mergedCSSConfig = {
        mark: ATTR_MARK,
        prepend: "queue",
        attachTo: container,
        priority: -999
      };
      mergedCSSConfig = injectCSPNonce(mergedCSSConfig, nonce);
      const style2 = updateCSS(cssVarsStr, styleId, mergedCSSConfig);
      style2[CSS_IN_JS_INSTANCE] = instanceId;
      style2.setAttribute(ATTR_TOKEN, key);
    });
    return cache;
  };
  var extract3 = (cache, effectStyles, options) => {
    const [, styleStr, styleId, cssVarKey] = cache;
    const {
      plain
    } = options || {};
    if (!styleStr) {
      return null;
    }
    const order = -999;
    const sharedAttrs = {
      "data-rc-order": "prependQueue",
      "data-rc-priority": `${order}`
    };
    const styleText = toStyleStr(styleStr, cssVarKey, styleId, sharedAttrs, plain);
    return [order, styleId, styleText];
  };
  var useCSSVarRegister_default = useCSSVarRegister;

  // ../../node_modules/@ant-design/cssinjs/es/extractStyle.js
  var ExtractStyleFns = {
    [STYLE_PREFIX]: extract2,
    [TOKEN_PREFIX]: extract,
    [CSS_VAR_PREFIX]: extract3
  };

  // ../../node_modules/@ant-design/cssinjs/es/Keyframes.js
  var Keyframe = class {
    constructor(name, style2) {
      __publicField(this, "name");
      __publicField(this, "style");
      __publicField(this, "_keyframe", true);
      this.name = name;
      this.style = style2;
    }
    getName(hashId = "") {
      return hashId ? `${hashId}-${this.name}` : this.name;
    }
  };
  var Keyframes_default = Keyframe;

  // ../../node_modules/@ant-design/cssinjs/es/transformers/legacyLogicalProperties.js
  function noSplit(list2) {
    list2.notSplit = true;
    return list2;
  }
  var keyMap = {
    // Inset
    inset: ["top", "right", "bottom", "left"],
    insetBlock: ["top", "bottom"],
    insetBlockStart: ["top"],
    insetBlockEnd: ["bottom"],
    insetInline: ["left", "right"],
    insetInlineStart: ["left"],
    insetInlineEnd: ["right"],
    // Margin
    marginBlock: ["marginTop", "marginBottom"],
    marginBlockStart: ["marginTop"],
    marginBlockEnd: ["marginBottom"],
    marginInline: ["marginLeft", "marginRight"],
    marginInlineStart: ["marginLeft"],
    marginInlineEnd: ["marginRight"],
    // Padding
    paddingBlock: ["paddingTop", "paddingBottom"],
    paddingBlockStart: ["paddingTop"],
    paddingBlockEnd: ["paddingBottom"],
    paddingInline: ["paddingLeft", "paddingRight"],
    paddingInlineStart: ["paddingLeft"],
    paddingInlineEnd: ["paddingRight"],
    // Border
    borderBlock: noSplit(["borderTop", "borderBottom"]),
    borderBlockStart: noSplit(["borderTop"]),
    borderBlockEnd: noSplit(["borderBottom"]),
    borderInline: noSplit(["borderLeft", "borderRight"]),
    borderInlineStart: noSplit(["borderLeft"]),
    borderInlineEnd: noSplit(["borderRight"]),
    // Border width
    borderBlockWidth: ["borderTopWidth", "borderBottomWidth"],
    borderBlockStartWidth: ["borderTopWidth"],
    borderBlockEndWidth: ["borderBottomWidth"],
    borderInlineWidth: ["borderLeftWidth", "borderRightWidth"],
    borderInlineStartWidth: ["borderLeftWidth"],
    borderInlineEndWidth: ["borderRightWidth"],
    // Border style
    borderBlockStyle: ["borderTopStyle", "borderBottomStyle"],
    borderBlockStartStyle: ["borderTopStyle"],
    borderBlockEndStyle: ["borderBottomStyle"],
    borderInlineStyle: ["borderLeftStyle", "borderRightStyle"],
    borderInlineStartStyle: ["borderLeftStyle"],
    borderInlineEndStyle: ["borderRightStyle"],
    // Border color
    borderBlockColor: ["borderTopColor", "borderBottomColor"],
    borderBlockStartColor: ["borderTopColor"],
    borderBlockEndColor: ["borderBottomColor"],
    borderInlineColor: ["borderLeftColor", "borderRightColor"],
    borderInlineStartColor: ["borderLeftColor"],
    borderInlineEndColor: ["borderRightColor"],
    // Border radius
    borderStartStartRadius: ["borderTopLeftRadius"],
    borderStartEndRadius: ["borderTopRightRadius"],
    borderEndStartRadius: ["borderBottomLeftRadius"],
    borderEndEndRadius: ["borderBottomRightRadius"]
  };

  // ../../node_modules/@babel/runtime/helpers/esm/typeof.js
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
  function _arrayWithHoles(r2) {
    if (Array.isArray(r2)) return r2;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
  function _iterableToArrayLimit(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a2 = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a2;
    }
  }

  // ../../node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // ../../node_modules/@babel/runtime/helpers/esm/slicedToArray.js
  function _slicedToArray(r2, e) {
    return _arrayWithHoles(r2) || _iterableToArrayLimit(r2, e) || _unsupportedIterableToArray(r2, e) || _nonIterableRest();
  }

  // ../../node_modules/@babel/runtime/helpers/esm/toPrimitive.js
  function toPrimitive(t, e) {
    if ("object" != _typeof(t) || !t) return t;
    var r2;
    if ("undefined" != typeof Symbol && void 0 !== (r2 = t[Symbol.toPrimitive])) {
      var i = r2.call(t, e || "default");
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === e ? String : Number)(t);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }

  // ../../node_modules/@babel/runtime/helpers/esm/defineProperty.js
  function _defineProperty(e, r2, t) {
    return (r2 = toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r2] = t, e;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/objectSpread2.js
  function ownKeys(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/classCallCheck.js
  function _classCallCheck(a2, n) {
    if (!(a2 instanceof n)) throw new TypeError("Cannot call a class as a function");
  }

  // ../../node_modules/@babel/runtime/helpers/esm/createClass.js
  function _defineProperties(e, r2) {
    for (var t = 0; t < r2.length; t++) {
      var o = r2[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r2, t) {
    return r2 && _defineProperties(e.prototype, r2), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
      return t2.__proto__ = e2, t2;
    }, _setPrototypeOf(t, e);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/inherits.js
  function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, {
      constructor: {
        value: t,
        writable: true,
        configurable: true
      }
    }), Object.defineProperty(t, "prototype", {
      writable: false
    }), e && _setPrototypeOf(t, e);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
  function _getPrototypeOf(t) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
      return t2.__proto__ || Object.getPrototypeOf(t2);
    }, _getPrototypeOf(t);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
  function _isNativeReflectConstruct() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t2) {
    }
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
      return !!t;
    })();
  }

  // ../../node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js
  function _possibleConstructorReturn(t, e) {
    if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return _assertThisInitialized(t);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/createSuper.js
  function _createSuper(t) {
    var r2 = _isNativeReflectConstruct();
    return function() {
      var e, o = _getPrototypeOf(t);
      if (r2) {
        var s = _getPrototypeOf(this).constructor;
        e = Reflect.construct(o, arguments, s);
      } else e = o.apply(this, arguments);
      return _possibleConstructorReturn(this, e);
    };
  }

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/calc/calculator.js
  var AbstractCalculator = /* @__PURE__ */ _createClass(function AbstractCalculator2() {
    _classCallCheck(this, AbstractCalculator2);
  });
  var calculator_default2 = AbstractCalculator;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/calc/CSSCalculator.js
  var CALC_UNIT2 = "CALC_UNIT";
  var regexp2 = new RegExp(CALC_UNIT2, "g");
  function unit2(value) {
    if (typeof value === "number") {
      return "".concat(value).concat(CALC_UNIT2);
    }
    return value;
  }
  var CSSCalculator2 = /* @__PURE__ */ function(_AbstractCalculator) {
    _inherits(CSSCalculator3, _AbstractCalculator);
    var _super = _createSuper(CSSCalculator3);
    function CSSCalculator3(num, unitlessCssVar) {
      var _this;
      _classCallCheck(this, CSSCalculator3);
      _this = _super.call(this);
      _defineProperty(_assertThisInitialized(_this), "result", "");
      _defineProperty(_assertThisInitialized(_this), "unitlessCssVar", void 0);
      _defineProperty(_assertThisInitialized(_this), "lowPriority", void 0);
      var numType = _typeof(num);
      _this.unitlessCssVar = unitlessCssVar;
      if (num instanceof CSSCalculator3) {
        _this.result = "(".concat(num.result, ")");
      } else if (numType === "number") {
        _this.result = unit2(num);
      } else if (numType === "string") {
        _this.result = num;
      }
      return _this;
    }
    _createClass(CSSCalculator3, [{
      key: "add",
      value: function add(num) {
        if (num instanceof CSSCalculator3) {
          this.result = "".concat(this.result, " + ").concat(num.getResult());
        } else if (typeof num === "number" || typeof num === "string") {
          this.result = "".concat(this.result, " + ").concat(unit2(num));
        }
        this.lowPriority = true;
        return this;
      }
    }, {
      key: "sub",
      value: function sub(num) {
        if (num instanceof CSSCalculator3) {
          this.result = "".concat(this.result, " - ").concat(num.getResult());
        } else if (typeof num === "number" || typeof num === "string") {
          this.result = "".concat(this.result, " - ").concat(unit2(num));
        }
        this.lowPriority = true;
        return this;
      }
    }, {
      key: "mul",
      value: function mul(num) {
        if (this.lowPriority) {
          this.result = "(".concat(this.result, ")");
        }
        if (num instanceof CSSCalculator3) {
          this.result = "".concat(this.result, " * ").concat(num.getResult(true));
        } else if (typeof num === "number" || typeof num === "string") {
          this.result = "".concat(this.result, " * ").concat(num);
        }
        this.lowPriority = false;
        return this;
      }
    }, {
      key: "div",
      value: function div2(num) {
        if (this.lowPriority) {
          this.result = "(".concat(this.result, ")");
        }
        if (num instanceof CSSCalculator3) {
          this.result = "".concat(this.result, " / ").concat(num.getResult(true));
        } else if (typeof num === "number" || typeof num === "string") {
          this.result = "".concat(this.result, " / ").concat(num);
        }
        this.lowPriority = false;
        return this;
      }
    }, {
      key: "getResult",
      value: function getResult(force) {
        return this.lowPriority || force ? "(".concat(this.result, ")") : this.result;
      }
    }, {
      key: "equal",
      value: function equal(options) {
        var _this2 = this;
        var _ref = options || {}, cssUnit = _ref.unit;
        var mergedUnit = true;
        if (typeof cssUnit === "boolean") {
          mergedUnit = cssUnit;
        } else if (Array.from(this.unitlessCssVar).some(function(cssVar) {
          return _this2.result.includes(cssVar);
        })) {
          mergedUnit = false;
        }
        this.result = this.result.replace(regexp2, mergedUnit ? "px" : "");
        if (typeof this.lowPriority !== "undefined") {
          return "calc(".concat(this.result, ")");
        }
        return this.result;
      }
    }]);
    return CSSCalculator3;
  }(calculator_default2);

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/calc/NumCalculator.js
  var NumCalculator2 = /* @__PURE__ */ function(_AbstractCalculator) {
    _inherits(NumCalculator3, _AbstractCalculator);
    var _super = _createSuper(NumCalculator3);
    function NumCalculator3(num) {
      var _this;
      _classCallCheck(this, NumCalculator3);
      _this = _super.call(this);
      _defineProperty(_assertThisInitialized(_this), "result", 0);
      if (num instanceof NumCalculator3) {
        _this.result = num.result;
      } else if (typeof num === "number") {
        _this.result = num;
      }
      return _this;
    }
    _createClass(NumCalculator3, [{
      key: "add",
      value: function add(num) {
        if (num instanceof NumCalculator3) {
          this.result += num.result;
        } else if (typeof num === "number") {
          this.result += num;
        }
        return this;
      }
    }, {
      key: "sub",
      value: function sub(num) {
        if (num instanceof NumCalculator3) {
          this.result -= num.result;
        } else if (typeof num === "number") {
          this.result -= num;
        }
        return this;
      }
    }, {
      key: "mul",
      value: function mul(num) {
        if (num instanceof NumCalculator3) {
          this.result *= num.result;
        } else if (typeof num === "number") {
          this.result *= num;
        }
        return this;
      }
    }, {
      key: "div",
      value: function div2(num) {
        if (num instanceof NumCalculator3) {
          this.result /= num.result;
        } else if (typeof num === "number") {
          this.result /= num;
        }
        return this;
      }
    }, {
      key: "equal",
      value: function equal() {
        return this.result;
      }
    }]);
    return NumCalculator3;
  }(calculator_default2);
  var NumCalculator_default = NumCalculator2;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/calc/index.js
  var genCalc = function genCalc2(type, unitlessCssVar) {
    var Calculator = type === "css" ? CSSCalculator2 : NumCalculator_default;
    return function(num) {
      return new Calculator(num, unitlessCssVar);
    };
  };
  var calc_default2 = genCalc;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/getCompVarPrefix.js
  var getCompVarPrefix = function getCompVarPrefix2(component, prefix2) {
    return "".concat([prefix2, component.replace(/([A-Z]+)([A-Z][a-z]+)/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2")].filter(Boolean).join("-"));
  };
  var getCompVarPrefix_default = getCompVarPrefix;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/getComponentToken.js
  function getComponentToken(component, token2, defaultToken, options) {
    var customToken = _objectSpread2({}, token2[component]);
    if (options !== null && options !== void 0 && options.deprecatedTokens) {
      var deprecatedTokens = options.deprecatedTokens;
      deprecatedTokens.forEach(function(_ref) {
        var _ref2 = _slicedToArray(_ref, 2), oldTokenKey = _ref2[0], newTokenKey = _ref2[1];
        if (true) {
          warning_default(!(customToken !== null && customToken !== void 0 && customToken[oldTokenKey]), "Component Token `".concat(String(oldTokenKey), "` of ").concat(String(component), " is deprecated. Please use `").concat(String(newTokenKey), "` instead."));
        }
        if (customToken !== null && customToken !== void 0 && customToken[oldTokenKey] || customToken !== null && customToken !== void 0 && customToken[newTokenKey]) {
          var _customToken$newToken;
          (_customToken$newToken = customToken[newTokenKey]) !== null && _customToken$newToken !== void 0 ? _customToken$newToken : customToken[newTokenKey] = customToken === null || customToken === void 0 ? void 0 : customToken[oldTokenKey];
        }
      });
    }
    var mergedToken = _objectSpread2(_objectSpread2({}, defaultToken), customToken);
    Object.keys(mergedToken).forEach(function(key) {
      if (mergedToken[key] === token2[key]) {
        delete mergedToken[key];
      }
    });
    return mergedToken;
  }
  var getComponentToken_default = getComponentToken;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/statistic.js
  var enableStatistic = true;
  var recording = true;
  function merge2() {
    for (var _len = arguments.length, objs = new Array(_len), _key = 0; _key < _len; _key++) {
      objs[_key] = arguments[_key];
    }
    if (!enableStatistic) {
      return Object.assign.apply(Object, [{}].concat(objs));
    }
    recording = false;
    var ret = {};
    objs.forEach(function(obj) {
      if (_typeof(obj) !== "object") {
        return;
      }
      var keys2 = Object.keys(obj);
      keys2.forEach(function(key) {
        Object.defineProperty(ret, key, {
          configurable: true,
          enumerable: true,
          get: function get2() {
            return obj[key];
          }
        });
      });
    });
    recording = true;
    return ret;
  }
  var statistic = {};
  function noop2() {
  }
  var statisticToken = function statisticToken2(token2) {
    var tokenKeys2;
    var proxy = token2;
    var flush = noop2;
    if (enableStatistic && typeof Proxy !== "undefined") {
      tokenKeys2 = /* @__PURE__ */ new Set();
      proxy = new Proxy(token2, {
        get: function get2(obj, prop) {
          if (recording) {
            var _tokenKeys;
            (_tokenKeys = tokenKeys2) === null || _tokenKeys === void 0 || _tokenKeys.add(prop);
          }
          return obj[prop];
        }
      });
      flush = function flush2(componentName, componentToken) {
        var _statistic$componentN;
        statistic[componentName] = {
          global: Array.from(tokenKeys2),
          component: _objectSpread2(_objectSpread2({}, (_statistic$componentN = statistic[componentName]) === null || _statistic$componentN === void 0 ? void 0 : _statistic$componentN.component), componentToken)
        };
      };
    }
    return {
      token: proxy,
      keys: tokenKeys2,
      flush
    };
  };
  var statistic_default = statisticToken;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/getDefaultComponentToken.js
  function getDefaultComponentToken(component, token2, getDefaultToken) {
    if (typeof getDefaultToken === "function") {
      var _token$component;
      return getDefaultToken(merge2(token2, (_token$component = token2[component]) !== null && _token$component !== void 0 ? _token$component : {}));
    }
    return getDefaultToken !== null && getDefaultToken !== void 0 ? getDefaultToken : {};
  }
  var getDefaultComponentToken_default = getDefaultComponentToken;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/maxmin.js
  function genMaxMin(type) {
    if (type === "js") {
      return {
        max: Math.max,
        min: Math.min
      };
    }
    return {
      max: function max() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return "max(".concat(args.map(function(value) {
          return unit(value);
        }).join(","), ")");
      },
      min: function min() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return "min(".concat(args.map(function(value) {
          return unit(value);
        }).join(","), ")");
      }
    };
  }
  var maxmin_default = genMaxMin;

  // ../../node_modules/@ant-design/cssinjs-utils/es/_util/hooks/useUniqueMemo.js
  var BEAT_LIMIT = 1e3 * 60 * 10;
  var ArrayKeyMap = /* @__PURE__ */ function() {
    function ArrayKeyMap2() {
      _classCallCheck(this, ArrayKeyMap2);
      _defineProperty(this, "map", /* @__PURE__ */ new Map());
      _defineProperty(this, "objectIDMap", /* @__PURE__ */ new WeakMap());
      _defineProperty(this, "nextID", 0);
      _defineProperty(this, "lastAccessBeat", /* @__PURE__ */ new Map());
      _defineProperty(this, "accessBeat", 0);
    }
    _createClass(ArrayKeyMap2, [{
      key: "set",
      value: function set3(keys2, value) {
        this.clear();
        var compositeKey = this.getCompositeKey(keys2);
        this.map.set(compositeKey, value);
        this.lastAccessBeat.set(compositeKey, Date.now());
      }
    }, {
      key: "get",
      value: function get2(keys2) {
        var compositeKey = this.getCompositeKey(keys2);
        var cache = this.map.get(compositeKey);
        this.lastAccessBeat.set(compositeKey, Date.now());
        this.accessBeat += 1;
        return cache;
      }
    }, {
      key: "getCompositeKey",
      value: function getCompositeKey(keys2) {
        var _this = this;
        var ids = keys2.map(function(key) {
          if (key && _typeof(key) === "object") {
            return "obj_".concat(_this.getObjectID(key));
          }
          return "".concat(_typeof(key), "_").concat(key);
        });
        return ids.join("|");
      }
    }, {
      key: "getObjectID",
      value: function getObjectID(obj) {
        if (this.objectIDMap.has(obj)) {
          return this.objectIDMap.get(obj);
        }
        var id = this.nextID;
        this.objectIDMap.set(obj, id);
        this.nextID += 1;
        return id;
      }
    }, {
      key: "clear",
      value: function clear() {
        var _this2 = this;
        if (this.accessBeat > 1e4) {
          var now = Date.now();
          this.lastAccessBeat.forEach(function(beat, key) {
            if (now - beat > BEAT_LIMIT) {
              _this2.map.delete(key);
              _this2.lastAccessBeat.delete(key);
            }
          });
          this.accessBeat = 0;
        }
      }
    }]);
    return ArrayKeyMap2;
  }();
  var uniqueMap = new ArrayKeyMap();
  function useUniqueMemo(memoFn, deps) {
    return react_compat_default.useMemo(function() {
      var cachedValue = uniqueMap.get(deps);
      if (cachedValue) {
        return cachedValue;
      }
      var newValue = memoFn();
      uniqueMap.set(deps, newValue);
      return newValue;
    }, deps);
  }
  var useUniqueMemo_default = useUniqueMemo;

  // ../../node_modules/@ant-design/cssinjs-utils/es/hooks/useCSP.js
  var useDefaultCSP = function useDefaultCSP2() {
    return {};
  };
  var useCSP_default = useDefaultCSP;

  // ../../node_modules/@ant-design/cssinjs-utils/es/util/genStyleUtils.js
  function genStyleUtils(config) {
    var _config$useCSP = config.useCSP, useCSP = _config$useCSP === void 0 ? useCSP_default : _config$useCSP, useToken2 = config.useToken, usePrefix = config.usePrefix, getResetStyles = config.getResetStyles, getCommonStyle = config.getCommonStyle, getCompUnitless = config.getCompUnitless;
    function genStyleHooks2(component, styleFn, getDefaultToken, options) {
      var componentName = Array.isArray(component) ? component[0] : component;
      function prefixToken(key) {
        return "".concat(String(componentName)).concat(key.slice(0, 1).toUpperCase()).concat(key.slice(1));
      }
      var originUnitless = (options === null || options === void 0 ? void 0 : options.unitless) || {};
      var originCompUnitless = typeof getCompUnitless === "function" ? getCompUnitless(component) : {};
      var compUnitless = _objectSpread2(_objectSpread2({}, originCompUnitless), {}, _defineProperty({}, prefixToken("zIndexPopup"), true));
      Object.keys(originUnitless).forEach(function(key) {
        compUnitless[prefixToken(key)] = originUnitless[key];
      });
      var mergedOptions = _objectSpread2(_objectSpread2({}, options), {}, {
        unitless: compUnitless,
        prefixToken
      });
      var useStyle = genComponentStyleHook2(component, styleFn, getDefaultToken, mergedOptions);
      var useCSSVar = genCSSVarRegister(componentName, getDefaultToken, mergedOptions);
      return function(prefixCls) {
        var rootCls = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : prefixCls;
        var hashId = useStyle(prefixCls, rootCls);
        var extraPrefixCls = options === null || options === void 0 ? void 0 : options.extraCssVarPrefixCls;
        var resolvedExtraPrefixCls = typeof extraPrefixCls === "function" ? extraPrefixCls({
          prefixCls,
          rootCls
        }) : extraPrefixCls;
        var cssVarCls = useCSSVar(resolvedExtraPrefixCls !== null && resolvedExtraPrefixCls !== void 0 && resolvedExtraPrefixCls.length ? [rootCls].concat(_toConsumableArray(resolvedExtraPrefixCls)) : rootCls);
        return [hashId, cssVarCls];
      };
    }
    function genCSSVarRegister(component, getDefaultToken, options) {
      var compUnitless = options.unitless, prefixToken = options.prefixToken, ignore2 = options.ignore;
      return function(rootCls) {
        var _useToken = useToken2(), cssVar = _useToken.cssVar, realToken = _useToken.realToken;
        var csp = useCSP();
        useCSSVarRegister_default({
          path: [component],
          prefix: cssVar.prefix,
          key: cssVar.key,
          unitless: compUnitless,
          ignore: ignore2,
          token: realToken,
          scope: rootCls,
          nonce: function nonce() {
            return csp.nonce;
          }
        }, function() {
          var defaultToken = getDefaultComponentToken_default(component, realToken, getDefaultToken);
          var componentToken = getComponentToken_default(component, realToken, defaultToken, {
            deprecatedTokens: options === null || options === void 0 ? void 0 : options.deprecatedTokens
          });
          if (defaultToken) {
            Object.keys(defaultToken).forEach(function(key) {
              componentToken[prefixToken(key)] = componentToken[key];
              delete componentToken[key];
            });
          }
          return componentToken;
        });
        return cssVar === null || cssVar === void 0 ? void 0 : cssVar.key;
      };
    }
    function genComponentStyleHook2(componentName, styleFn, getDefaultToken) {
      var options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
      var cells = Array.isArray(componentName) ? componentName : [componentName, componentName];
      var _cells = _slicedToArray(cells, 1), component = _cells[0];
      var concatComponent = cells.join("-");
      var mergedLayer = config.layer || {
        name: "antd"
      };
      return function(prefixCls) {
        var rootCls = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : prefixCls;
        var _useToken2 = useToken2(), theme = _useToken2.theme, realToken = _useToken2.realToken, hashId = _useToken2.hashId, token2 = _useToken2.token, cssVar = _useToken2.cssVar, zeroRuntime = _useToken2.zeroRuntime;
        var memoizedZeroRuntime = useMemo(function() {
          return zeroRuntime;
        }, []);
        if (memoizedZeroRuntime) {
          return hashId;
        }
        var _usePrefix = usePrefix(), rootPrefixCls = _usePrefix.rootPrefixCls, iconPrefixCls = _usePrefix.iconPrefixCls;
        var csp = useCSP();
        var type = "css";
        var calc = useUniqueMemo_default(function() {
          var unitlessCssVar = /* @__PURE__ */ new Set();
          Object.keys(options.unitless || {}).forEach(function(key) {
            unitlessCssVar.add(token2CSSVar(key, cssVar.prefix));
            unitlessCssVar.add(token2CSSVar(key, getCompVarPrefix_default(component, cssVar.prefix)));
          });
          return calc_default2(type, unitlessCssVar);
        }, [type, component, cssVar === null || cssVar === void 0 ? void 0 : cssVar.prefix]);
        var _genMaxMin = maxmin_default(type), max = _genMaxMin.max, min = _genMaxMin.min;
        var sharedConfig = {
          theme,
          token: token2,
          hashId,
          nonce: function nonce() {
            return csp.nonce;
          },
          clientOnly: options.clientOnly,
          layer: mergedLayer,
          // antd is always at top of styles
          order: options.order || -999
        };
        if (typeof getResetStyles === "function") {
          useStyleRegister(_objectSpread2(_objectSpread2({}, sharedConfig), {}, {
            clientOnly: false,
            path: ["Shared", rootPrefixCls]
          }), function() {
            return getResetStyles(token2, {
              prefix: {
                rootPrefixCls,
                iconPrefixCls
              },
              csp
            });
          });
        }
        useStyleRegister(_objectSpread2(_objectSpread2({}, sharedConfig), {}, {
          path: [concatComponent, prefixCls, iconPrefixCls]
        }), function() {
          if (options.injectStyle === false) {
            return [];
          }
          var _statisticToken = statistic_default(token2), proxyToken = _statisticToken.token, flush = _statisticToken.flush;
          var defaultComponentToken = getDefaultComponentToken_default(component, realToken, getDefaultToken);
          var componentCls = ".".concat(prefixCls);
          var componentToken = getComponentToken_default(component, realToken, defaultComponentToken, {
            deprecatedTokens: options.deprecatedTokens
          });
          if (defaultComponentToken && _typeof(defaultComponentToken) === "object") {
            Object.keys(defaultComponentToken).forEach(function(key) {
              defaultComponentToken[key] = "var(".concat(token2CSSVar(key, getCompVarPrefix_default(component, cssVar.prefix)), ")");
            });
          }
          var mergedToken = merge2(proxyToken, {
            componentCls,
            prefixCls,
            iconCls: ".".concat(iconPrefixCls),
            antCls: ".".concat(rootPrefixCls),
            calc,
            max,
            min
          }, defaultComponentToken);
          var styleInterpolation = styleFn(mergedToken, {
            hashId,
            prefixCls,
            rootPrefixCls,
            iconPrefixCls
          });
          flush(component, componentToken);
          var commonStyle = typeof getCommonStyle === "function" ? getCommonStyle(mergedToken, prefixCls, rootCls, options.resetFont) : null;
          return [options.resetStyle === false ? null : commonStyle, styleInterpolation];
        });
        return hashId;
      };
    }
    function genSubStyleComponent2(componentName, styleFn, getDefaultToken) {
      var options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
      var useStyle = genComponentStyleHook2(componentName, styleFn, getDefaultToken, _objectSpread2({
        resetStyle: false,
        // Sub Style should default after root one
        order: -998
      }, options));
      var StyledComponent = function StyledComponent2(_ref) {
        var prefixCls = _ref.prefixCls, _ref$rootCls = _ref.rootCls, rootCls = _ref$rootCls === void 0 ? prefixCls : _ref$rootCls;
        useStyle(prefixCls, rootCls);
        return null;
      };
      if (true) {
        StyledComponent.displayName = "SubStyle_".concat(String(Array.isArray(componentName) ? componentName.join(".") : componentName));
      }
      return StyledComponent;
    }
    return {
      genStyleHooks: genStyleHooks2,
      genSubStyleComponent: genSubStyleComponent2,
      genComponentStyleHook: genComponentStyleHook2
    };
  }
  var genStyleUtils_default = genStyleUtils;

  // ../../node_modules/antd/es/theme/interface/presetColors.js
  var PresetColors = ["blue", "purple", "cyan", "green", "magenta", "pink", "red", "orange", "yellow", "volcano", "geekblue", "lime", "gold"];

  // ../../node_modules/antd/es/theme/themes/shared/genFontSizes.js
  function getLineHeight(fontSize) {
    return (fontSize + 8) / fontSize;
  }
  function getFontSizes(base) {
    const fontSizes = Array.from({
      length: 10
    }).map((_, index) => {
      const i = index - 1;
      const baseSize = base * Math.E ** (i / 5);
      const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize);
      return Math.floor(intSize / 2) * 2;
    });
    fontSizes[1] = base;
    return fontSizes.map((size) => ({
      size,
      lineHeight: getLineHeight(size)
    }));
  }

  // ../../node_modules/antd/es/version/version.js
  var version_default = "6.6.6";

  // ../../node_modules/antd/es/version/index.js
  var version_default2 = version_default;

  // ../../node_modules/antd/es/theme/themes/seed.js
  var defaultPresetColors = {
    blue: "#1677FF",
    purple: "#722ED1",
    cyan: "#13C2C2",
    green: "#52C41A",
    magenta: "#EB2F96",
    /**
     * @deprecated Use magenta instead
     */
    pink: "#EB2F96",
    red: "#F5222D",
    orange: "#FA8C16",
    yellow: "#FADB14",
    volcano: "#FA541C",
    geekblue: "#2F54EB",
    gold: "#FAAD14",
    lime: "#A0D911"
  };
  var seedToken = {
    // preset color palettes
    ...defaultPresetColors,
    // Color
    colorPrimary: "#1677ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677ff",
    colorLink: "",
    colorTextBase: "",
    colorBgBase: "",
    // Font
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
'Noto Color Emoji'`,
    fontFamilyCode: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
    fontSize: 14,
    // Line
    lineWidth: 1,
    lineType: "solid",
    // Motion
    motionUnit: 0.1,
    motionBase: 0,
    motionEaseOutCirc: "cubic-bezier(0.08, 0.82, 0.17, 1)",
    motionEaseInOutCirc: "cubic-bezier(0.78, 0.14, 0.15, 0.86)",
    motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    motionEaseOutBack: "cubic-bezier(0.12, 0.4, 0.29, 1.46)",
    motionEaseInBack: "cubic-bezier(0.71, -0.46, 0.88, 0.6)",
    motionEaseInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
    motionEaseOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",
    // Radius
    borderRadius: 6,
    // Size
    sizeUnit: 4,
    sizeStep: 4,
    sizePopupArrow: 16,
    // Control Base
    controlHeight: 32,
    // zIndex
    zIndexBase: 0,
    zIndexPopupBase: 1e3,
    // Image
    opacityImage: 1,
    // Wireframe
    wireframe: false,
    // Focus Outline
    focusOutline: true,
    // Motion
    motion: true
  };
  var seed_default = seedToken;

  // ../../node_modules/@ant-design/fast-color/es/presetColors.js
  var presetColors_default = {
    aliceblue: "9ehhb",
    antiquewhite: "9sgk7",
    aqua: "1ekf",
    aquamarine: "4zsno",
    azure: "9eiv3",
    beige: "9lhp8",
    bisque: "9zg04",
    black: "0",
    blanchedalmond: "9zhe5",
    blue: "73",
    blueviolet: "5e31e",
    brown: "6g016",
    burlywood: "8ouiv",
    cadetblue: "3qba8",
    chartreuse: "4zshs",
    chocolate: "87k0u",
    coral: "9yvyo",
    cornflowerblue: "3xael",
    cornsilk: "9zjz0",
    crimson: "8l4xo",
    cyan: "1ekf",
    darkblue: "3v",
    darkcyan: "rkb",
    darkgoldenrod: "776yz",
    darkgray: "6mbhl",
    darkgreen: "jr4",
    darkgrey: "6mbhl",
    darkkhaki: "7ehkb",
    darkmagenta: "5f91n",
    darkolivegreen: "3bzfz",
    darkorange: "9yygw",
    darkorchid: "5z6x8",
    darkred: "5f8xs",
    darksalmon: "9441m",
    darkseagreen: "5lwgf",
    darkslateblue: "2th1n",
    darkslategray: "1ugcv",
    darkslategrey: "1ugcv",
    darkturquoise: "14up",
    darkviolet: "5rw7n",
    deeppink: "9yavn",
    deepskyblue: "11xb",
    dimgray: "442g9",
    dimgrey: "442g9",
    dodgerblue: "16xof",
    firebrick: "6y7tu",
    floralwhite: "9zkds",
    forestgreen: "1cisi",
    fuchsia: "9y70f",
    gainsboro: "8m8kc",
    ghostwhite: "9pq0v",
    goldenrod: "8j4f4",
    gold: "9zda8",
    gray: "50i2o",
    green: "pa8",
    greenyellow: "6senj",
    grey: "50i2o",
    honeydew: "9eiuo",
    hotpink: "9yrp0",
    indianred: "80gnw",
    indigo: "2xcoy",
    ivory: "9zldc",
    khaki: "9edu4",
    lavenderblush: "9ziet",
    lavender: "90c8q",
    lawngreen: "4vk74",
    lemonchiffon: "9zkct",
    lightblue: "6s73a",
    lightcoral: "9dtog",
    lightcyan: "8s1rz",
    lightgoldenrodyellow: "9sjiq",
    lightgray: "89jo3",
    lightgreen: "5nkwg",
    lightgrey: "89jo3",
    lightpink: "9z6wx",
    lightsalmon: "9z2ii",
    lightseagreen: "19xgq",
    lightskyblue: "5arju",
    lightslategray: "4nwk9",
    lightslategrey: "4nwk9",
    lightsteelblue: "6wau6",
    lightyellow: "9zlcw",
    lime: "1edc",
    limegreen: "1zcxe",
    linen: "9shk6",
    magenta: "9y70f",
    maroon: "4zsow",
    mediumaquamarine: "40eju",
    mediumblue: "5p",
    mediumorchid: "79qkz",
    mediumpurple: "5r3rv",
    mediumseagreen: "2d9ip",
    mediumslateblue: "4tcku",
    mediumspringgreen: "1di2",
    mediumturquoise: "2uabw",
    mediumvioletred: "7rn9h",
    midnightblue: "z980",
    mintcream: "9ljp6",
    mistyrose: "9zg0x",
    moccasin: "9zfzp",
    navajowhite: "9zest",
    navy: "3k",
    oldlace: "9wq92",
    olive: "50hz4",
    olivedrab: "472ub",
    orange: "9z3eo",
    orangered: "9ykg0",
    orchid: "8iu3a",
    palegoldenrod: "9bl4a",
    palegreen: "5yw0o",
    paleturquoise: "6v4ku",
    palevioletred: "8k8lv",
    papayawhip: "9zi6t",
    peachpuff: "9ze0p",
    peru: "80oqn",
    pink: "9z8wb",
    plum: "8nba5",
    powderblue: "6wgdi",
    purple: "4zssg",
    rebeccapurple: "3zk49",
    red: "9y6tc",
    rosybrown: "7cv4f",
    royalblue: "2jvtt",
    saddlebrown: "5fmkz",
    salmon: "9rvci",
    sandybrown: "9jn1c",
    seagreen: "1tdnb",
    seashell: "9zje6",
    sienna: "6973h",
    silver: "7ir40",
    skyblue: "5arjf",
    slateblue: "45e4t",
    slategray: "4e100",
    slategrey: "4e100",
    snow: "9zke2",
    springgreen: "1egv",
    steelblue: "2r1kk",
    tan: "87yx8",
    teal: "pds",
    thistle: "8ggk8",
    tomato: "9yqfb",
    turquoise: "2j4r4",
    violet: "9b10u",
    wheat: "9ld4j",
    white: "9zldr",
    whitesmoke: "9lhpx",
    yellow: "9zl6o",
    yellowgreen: "61fzm"
  };

  // ../../node_modules/@ant-design/fast-color/es/FastColor.js
  var round = Math.round;
  function splitColorStr(str, parseNum) {
    const match3 = str.replace(/^[^(]*\((.*)/, "$1").replace(/\).*/, "").match(/\d*\.?\d+%?/g) || [];
    const numList = match3.map((item) => parseFloat(item));
    for (let i = 0; i < 3; i += 1) {
      numList[i] = parseNum(numList[i] || 0, match3[i] || "", i);
    }
    if (match3[3]) {
      numList[3] = match3[3].includes("%") ? numList[3] / 100 : numList[3];
    } else {
      numList[3] = 1;
    }
    return numList;
  }
  var parseHSVorHSL = (num, _, index) => index === 0 ? num : num / 100;
  function limitRange(value, max) {
    const mergedMax = max || 255;
    if (value > mergedMax) {
      return mergedMax;
    }
    if (value < 0) {
      return 0;
    }
    return value;
  }
  var FastColor = class _FastColor {
    constructor(input2) {
      /**
       * All FastColor objects are valid. So isValid is always true. This property is kept to be compatible with TinyColor.
       */
      __publicField(this, "isValid", true);
      /**
       * Red, R in RGB
       */
      __publicField(this, "r", 0);
      /**
       * Green, G in RGB
       */
      __publicField(this, "g", 0);
      /**
       * Blue, B in RGB
       */
      __publicField(this, "b", 0);
      /**
       * Alpha/Opacity, A in RGBA/HSLA
       */
      __publicField(this, "a", 1);
      // HSV privates
      __publicField(this, "_h");
      __publicField(this, "_hsl_s");
      __publicField(this, "_hsv_s");
      __publicField(this, "_l");
      __publicField(this, "_v");
      // intermediate variables to calculate HSL/HSV
      __publicField(this, "_max");
      __publicField(this, "_min");
      __publicField(this, "_brightness");
      function matchFormat(str) {
        return str[0] in input2 && str[1] in input2 && str[2] in input2;
      }
      if (!input2) {
      } else if (typeof input2 === "string") {
        let matchPrefix = function(prefix2) {
          return trimStr.startsWith(prefix2);
        };
        const trimStr = input2.trim();
        if (/^#?[A-F\d]{3,8}$/i.test(trimStr)) {
          this.fromHexString(trimStr);
        } else if (matchPrefix("rgb")) {
          this.fromRgbString(trimStr);
        } else if (matchPrefix("hsl")) {
          this.fromHslString(trimStr);
        } else if (matchPrefix("hsv") || matchPrefix("hsb")) {
          this.fromHsvString(trimStr);
        } else {
          const presetColor = presetColors_default[trimStr.toLowerCase()];
          if (presetColor) {
            this.fromHexString(
              // Convert 36 hex to 16 hex
              parseInt(presetColor, 36).toString(16).padStart(6, "0")
            );
          }
        }
      } else if (input2 instanceof _FastColor) {
        this.r = input2.r;
        this.g = input2.g;
        this.b = input2.b;
        this.a = input2.a;
        this._h = input2._h;
        this._hsl_s = input2._hsl_s;
        this._hsv_s = input2._hsv_s;
        this._l = input2._l;
        this._v = input2._v;
      } else if (matchFormat("rgb")) {
        this.r = limitRange(input2.r);
        this.g = limitRange(input2.g);
        this.b = limitRange(input2.b);
        this.a = typeof input2.a === "number" ? limitRange(input2.a, 1) : 1;
      } else if (matchFormat("hsl")) {
        this.fromHsl(input2);
      } else if (matchFormat("hsv")) {
        this.fromHsv(input2);
      } else {
        throw new Error("@ant-design/fast-color: unsupported input " + JSON.stringify(input2));
      }
    }
    // ======================= Setter =======================
    setR(value) {
      return this._sc("r", value);
    }
    setG(value) {
      return this._sc("g", value);
    }
    setB(value) {
      return this._sc("b", value);
    }
    setA(value) {
      return this._sc("a", value, 1);
    }
    setHue(value) {
      const hsv = this.toHsv();
      hsv.h = value;
      return this._c(hsv);
    }
    // ======================= Getter =======================
    /**
     * Returns the perceived luminance of a color, from 0-1.
     * @see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
     */
    getLuminance() {
      function adjustGamma(raw) {
        const val = raw / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      }
      const R = adjustGamma(this.r);
      const G2 = adjustGamma(this.g);
      const B = adjustGamma(this.b);
      return 0.2126 * R + 0.7152 * G2 + 0.0722 * B;
    }
    getHue() {
      if (typeof this._h === "undefined") {
        const delta = this.getMax() - this.getMin();
        if (delta === 0) {
          this._h = 0;
        } else {
          this._h = round(60 * (this.r === this.getMax() ? (this.g - this.b) / delta + (this.g < this.b ? 6 : 0) : this.g === this.getMax() ? (this.b - this.r) / delta + 2 : (this.r - this.g) / delta + 4));
        }
      }
      return this._h;
    }
    /**
     * @deprecated should use getHSVSaturation or getHSLSaturation instead
     */
    getSaturation() {
      return this.getHSVSaturation();
    }
    getHSVSaturation() {
      if (typeof this._hsv_s === "undefined") {
        const delta = this.getMax() - this.getMin();
        if (delta === 0) {
          this._hsv_s = 0;
        } else {
          this._hsv_s = delta / this.getMax();
        }
      }
      return this._hsv_s;
    }
    getHSLSaturation() {
      if (typeof this._hsl_s === "undefined") {
        const delta = this.getMax() - this.getMin();
        if (delta === 0) {
          this._hsl_s = 0;
        } else {
          const l = this.getLightness();
          this._hsl_s = delta / 255 / (1 - Math.abs(2 * l - 1));
        }
      }
      return this._hsl_s;
    }
    getLightness() {
      if (typeof this._l === "undefined") {
        this._l = (this.getMax() + this.getMin()) / 510;
      }
      return this._l;
    }
    getValue() {
      if (typeof this._v === "undefined") {
        this._v = this.getMax() / 255;
      }
      return this._v;
    }
    /**
     * Returns the perceived brightness of the color, from 0-255.
     * Note: this is not the b of HSB
     * @see http://www.w3.org/TR/AERT#color-contrast
     */
    getBrightness() {
      if (typeof this._brightness === "undefined") {
        this._brightness = (this.r * 299 + this.g * 587 + this.b * 114) / 1e3;
      }
      return this._brightness;
    }
    // ======================== Func ========================
    darken(amount = 10) {
      const h7 = this.getHue();
      const s = this.getSaturation();
      let l = this.getLightness() - amount / 100;
      if (l < 0) {
        l = 0;
      }
      return this._c({
        h: h7,
        s,
        l,
        a: this.a
      });
    }
    lighten(amount = 10) {
      const h7 = this.getHue();
      const s = this.getSaturation();
      let l = this.getLightness() + amount / 100;
      if (l > 1) {
        l = 1;
      }
      return this._c({
        h: h7,
        s,
        l,
        a: this.a
      });
    }
    /**
     * Mix the current color a given amount with another color, from 0 to 100.
     * 0 means no mixing (return current color).
     */
    mix(input2, amount = 50) {
      const color = this._c(input2);
      const p2 = amount / 100;
      const calc = (key) => (color[key] - this[key]) * p2 + this[key];
      const rgba = {
        r: round(calc("r")),
        g: round(calc("g")),
        b: round(calc("b")),
        a: round(calc("a") * 100) / 100
      };
      return this._c(rgba);
    }
    /**
     * Mix the color with pure white, from 0 to 100.
     * Providing 0 will do nothing, providing 100 will always return white.
     */
    tint(amount = 10) {
      return this.mix({
        r: 255,
        g: 255,
        b: 255,
        a: 1
      }, amount);
    }
    /**
     * Mix the color with pure black, from 0 to 100.
     * Providing 0 will do nothing, providing 100 will always return black.
     */
    shade(amount = 10) {
      return this.mix({
        r: 0,
        g: 0,
        b: 0,
        a: 1
      }, amount);
    }
    onBackground(background) {
      const bg = this._c(background);
      const alpha = this.a + bg.a * (1 - this.a);
      const calc = (key) => {
        return round((this[key] * this.a + bg[key] * bg.a * (1 - this.a)) / alpha);
      };
      return this._c({
        r: calc("r"),
        g: calc("g"),
        b: calc("b"),
        a: alpha
      });
    }
    // ======================= Status =======================
    isDark() {
      return this.getBrightness() < 128;
    }
    isLight() {
      return this.getBrightness() >= 128;
    }
    // ======================== MISC ========================
    equals(other) {
      return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }
    clone() {
      return this._c(this);
    }
    // ======================= Format =======================
    toHexString() {
      let hex = "#";
      const rHex = (this.r || 0).toString(16);
      hex += rHex.length === 2 ? rHex : "0" + rHex;
      const gHex = (this.g || 0).toString(16);
      hex += gHex.length === 2 ? gHex : "0" + gHex;
      const bHex = (this.b || 0).toString(16);
      hex += bHex.length === 2 ? bHex : "0" + bHex;
      if (typeof this.a === "number" && this.a >= 0 && this.a < 1) {
        const aHex = round(this.a * 255).toString(16);
        hex += aHex.length === 2 ? aHex : "0" + aHex;
      }
      return hex;
    }
    /** CSS support color pattern */
    toHsl() {
      return {
        h: this.getHue(),
        s: this.getHSLSaturation(),
        l: this.getLightness(),
        a: this.a
      };
    }
    /** CSS support color pattern */
    toHslString() {
      const h7 = this.getHue();
      const s = round(this.getHSLSaturation() * 100);
      const l = round(this.getLightness() * 100);
      return this.a !== 1 ? `hsla(${h7},${s}%,${l}%,${this.a})` : `hsl(${h7},${s}%,${l}%)`;
    }
    /** Same as toHsb */
    toHsv() {
      return {
        h: this.getHue(),
        s: this.getHSVSaturation(),
        v: this.getValue(),
        a: this.a
      };
    }
    toRgb() {
      return {
        r: this.r,
        g: this.g,
        b: this.b,
        a: this.a
      };
    }
    toRgbString() {
      return this.a !== 1 ? `rgba(${this.r},${this.g},${this.b},${this.a})` : `rgb(${this.r},${this.g},${this.b})`;
    }
    toString() {
      return this.toRgbString();
    }
    // ====================== Privates ======================
    /** Return a new FastColor object with one channel changed */
    _sc(rgb, value, max) {
      const clone = this.clone();
      clone[rgb] = limitRange(value, max);
      return clone;
    }
    _c(input2) {
      return new this.constructor(input2);
    }
    getMax() {
      if (typeof this._max === "undefined") {
        this._max = Math.max(this.r, this.g, this.b);
      }
      return this._max;
    }
    getMin() {
      if (typeof this._min === "undefined") {
        this._min = Math.min(this.r, this.g, this.b);
      }
      return this._min;
    }
    fromHexString(trimStr) {
      const withoutPrefix = trimStr.replace("#", "");
      function connectNum(index1, index2) {
        return parseInt(withoutPrefix[index1] + withoutPrefix[index2 || index1], 16);
      }
      if (withoutPrefix.length < 6) {
        this.r = connectNum(0);
        this.g = connectNum(1);
        this.b = connectNum(2);
        this.a = withoutPrefix[3] ? connectNum(3) / 255 : 1;
      } else {
        this.r = connectNum(0, 1);
        this.g = connectNum(2, 3);
        this.b = connectNum(4, 5);
        this.a = withoutPrefix[6] ? connectNum(6, 7) / 255 : 1;
      }
    }
    fromHsl({
      h: _h,
      s,
      l,
      a: a2
    }) {
      const h7 = (_h % 360 + 360) % 360;
      this._h = h7;
      this._hsl_s = s;
      this._l = l;
      this.a = typeof a2 === "number" ? a2 : 1;
      if (s <= 0) {
        const rgb = round(l * 255);
        this.r = rgb;
        this.g = rgb;
        this.b = rgb;
        return;
      }
      let r2 = 0, g = 0, b = 0;
      const huePrime = h7 / 60;
      const chroma = (1 - Math.abs(2 * l - 1)) * s;
      const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
      if (huePrime >= 0 && huePrime < 1) {
        r2 = chroma;
        g = secondComponent;
      } else if (huePrime >= 1 && huePrime < 2) {
        r2 = secondComponent;
        g = chroma;
      } else if (huePrime >= 2 && huePrime < 3) {
        g = chroma;
        b = secondComponent;
      } else if (huePrime >= 3 && huePrime < 4) {
        g = secondComponent;
        b = chroma;
      } else if (huePrime >= 4 && huePrime < 5) {
        r2 = secondComponent;
        b = chroma;
      } else if (huePrime >= 5 && huePrime < 6) {
        r2 = chroma;
        b = secondComponent;
      }
      const lightnessModification = l - chroma / 2;
      this.r = round((r2 + lightnessModification) * 255);
      this.g = round((g + lightnessModification) * 255);
      this.b = round((b + lightnessModification) * 255);
    }
    fromHsv({
      h: _h,
      s,
      v,
      a: a2
    }) {
      const h7 = (_h % 360 + 360) % 360;
      this._h = h7;
      this._hsv_s = s;
      this._v = v;
      this.a = typeof a2 === "number" ? a2 : 1;
      const vv = round(v * 255);
      this.r = vv;
      this.g = vv;
      this.b = vv;
      if (s <= 0) {
        return;
      }
      const hh = h7 / 60;
      const i = Math.floor(hh);
      const ff = hh - i;
      const p2 = round(v * (1 - s) * 255);
      const q = round(v * (1 - s * ff) * 255);
      const t = round(v * (1 - s * (1 - ff)) * 255);
      switch (i) {
        case 0:
          this.g = t;
          this.b = p2;
          break;
        case 1:
          this.r = q;
          this.b = p2;
          break;
        case 2:
          this.r = p2;
          this.b = t;
          break;
        case 3:
          this.r = p2;
          this.g = q;
          break;
        case 4:
          this.r = t;
          this.g = p2;
          break;
        case 5:
        default:
          this.g = p2;
          this.b = q;
          break;
      }
    }
    fromHsvString(trimStr) {
      const cells = splitColorStr(trimStr, parseHSVorHSL);
      this.fromHsv({
        h: cells[0],
        s: cells[1],
        v: cells[2],
        a: cells[3]
      });
    }
    fromHslString(trimStr) {
      const cells = splitColorStr(trimStr, parseHSVorHSL);
      this.fromHsl({
        h: cells[0],
        s: cells[1],
        l: cells[2],
        a: cells[3]
      });
    }
    fromRgbString(trimStr) {
      const cells = splitColorStr(trimStr, (num, txt2) => (
        // Convert percentage to number. e.g. 50% -> 128
        txt2.includes("%") ? round(num / 100 * 255) : num
      ));
      this.r = cells[0];
      this.g = cells[1];
      this.b = cells[2];
      this.a = cells[3];
    }
  };

  // ../../node_modules/@ant-design/colors/es/generate.js
  var hueStep = 2;
  var saturationStep = 0.16;
  var saturationStep2 = 0.05;
  var brightnessStep1 = 0.05;
  var brightnessStep2 = 0.15;
  var lightColorCount = 5;
  var darkColorCount = 4;
  var darkColorMap = [{
    index: 7,
    amount: 15
  }, {
    index: 6,
    amount: 25
  }, {
    index: 5,
    amount: 30
  }, {
    index: 5,
    amount: 45
  }, {
    index: 5,
    amount: 65
  }, {
    index: 5,
    amount: 85
  }, {
    index: 4,
    amount: 90
  }, {
    index: 3,
    amount: 95
  }, {
    index: 2,
    amount: 97
  }, {
    index: 1,
    amount: 98
  }];
  function getHue(hsv, i, light) {
    let hue;
    if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
      hue = light ? Math.round(hsv.h) - hueStep * i : Math.round(hsv.h) + hueStep * i;
    } else {
      hue = light ? Math.round(hsv.h) + hueStep * i : Math.round(hsv.h) - hueStep * i;
    }
    if (hue < 0) {
      hue += 360;
    } else if (hue >= 360) {
      hue -= 360;
    }
    return hue;
  }
  function getSaturation(hsv, i, light) {
    if (hsv.h === 0 && hsv.s === 0) {
      return hsv.s;
    }
    let saturation;
    if (light) {
      saturation = hsv.s - saturationStep * i;
    } else if (i === darkColorCount) {
      saturation = hsv.s + saturationStep;
    } else {
      saturation = hsv.s + saturationStep2 * i;
    }
    if (saturation > 1) {
      saturation = 1;
    }
    if (light && i === lightColorCount && saturation > 0.1) {
      saturation = 0.1;
    }
    if (saturation < 0.06) {
      saturation = 0.06;
    }
    return Math.round(saturation * 100) / 100;
  }
  function getValue(hsv, i, light) {
    let value;
    if (light) {
      value = hsv.v + brightnessStep1 * i;
    } else {
      value = hsv.v - brightnessStep2 * i;
    }
    value = Math.max(0, Math.min(1, value));
    return Math.round(value * 100) / 100;
  }
  function generate(color, opts = {}) {
    const patterns = [];
    const pColor = new FastColor(color);
    const hsv = pColor.toHsv();
    for (let i = lightColorCount; i > 0; i -= 1) {
      const c = new FastColor({
        h: getHue(hsv, i, true),
        s: getSaturation(hsv, i, true),
        v: getValue(hsv, i, true)
      });
      patterns.push(c);
    }
    patterns.push(pColor);
    for (let i = 1; i <= darkColorCount; i += 1) {
      const c = new FastColor({
        h: getHue(hsv, i),
        s: getSaturation(hsv, i),
        v: getValue(hsv, i)
      });
      patterns.push(c);
    }
    if (opts.theme === "dark") {
      return darkColorMap.map(({
        index,
        amount
      }) => new FastColor(opts.backgroundColor || "#141414").mix(patterns[index], amount).toHexString());
    }
    return patterns.map((c) => c.toHexString());
  }

  // ../../node_modules/@ant-design/colors/es/presets.js
  var presetPrimaryColors = {
    "red": "#F5222D",
    "volcano": "#FA541C",
    "orange": "#FA8C16",
    "gold": "#FAAD14",
    "yellow": "#FADB14",
    "lime": "#A0D911",
    "green": "#52C41A",
    "cyan": "#13C2C2",
    "blue": "#1677FF",
    "geekblue": "#2F54EB",
    "purple": "#722ED1",
    "magenta": "#EB2F96",
    "grey": "#666666"
  };
  var red = ["#fff1f0", "#ffccc7", "#ffa39e", "#ff7875", "#ff4d4f", "#f5222d", "#cf1322", "#a8071a", "#820014", "#5c0011"];
  red.primary = red[5];
  var volcano = ["#fff2e8", "#ffd8bf", "#ffbb96", "#ff9c6e", "#ff7a45", "#fa541c", "#d4380d", "#ad2102", "#871400", "#610b00"];
  volcano.primary = volcano[5];
  var orange = ["#fff7e6", "#ffe7ba", "#ffd591", "#ffc069", "#ffa940", "#fa8c16", "#d46b08", "#ad4e00", "#873800", "#612500"];
  orange.primary = orange[5];
  var gold = ["#fffbe6", "#fff1b8", "#ffe58f", "#ffd666", "#ffc53d", "#faad14", "#d48806", "#ad6800", "#874d00", "#613400"];
  gold.primary = gold[5];
  var yellow = ["#feffe6", "#ffffb8", "#fffb8f", "#fff566", "#ffec3d", "#fadb14", "#d4b106", "#ad8b00", "#876800", "#614700"];
  yellow.primary = yellow[5];
  var lime = ["#fcffe6", "#f4ffb8", "#eaff8f", "#d3f261", "#bae637", "#a0d911", "#7cb305", "#5b8c00", "#3f6600", "#254000"];
  lime.primary = lime[5];
  var green = ["#f6ffed", "#d9f7be", "#b7eb8f", "#95de64", "#73d13d", "#52c41a", "#389e0d", "#237804", "#135200", "#092b00"];
  green.primary = green[5];
  var cyan = ["#e6fffb", "#b5f5ec", "#87e8de", "#5cdbd3", "#36cfc9", "#13c2c2", "#08979c", "#006d75", "#00474f", "#002329"];
  cyan.primary = cyan[5];
  var blue = ["#e6f4ff", "#bae0ff", "#91caff", "#69b1ff", "#4096ff", "#1677ff", "#0958d9", "#003eb3", "#002c8c", "#001d66"];
  blue.primary = blue[5];
  var geekblue = ["#f0f5ff", "#d6e4ff", "#adc6ff", "#85a5ff", "#597ef7", "#2f54eb", "#1d39c4", "#10239e", "#061178", "#030852"];
  geekblue.primary = geekblue[5];
  var purple = ["#f9f0ff", "#efdbff", "#d3adf7", "#b37feb", "#9254de", "#722ed1", "#531dab", "#391085", "#22075e", "#120338"];
  purple.primary = purple[5];
  var magenta = ["#fff0f6", "#ffd6e7", "#ffadd2", "#ff85c0", "#f759ab", "#eb2f96", "#c41d7f", "#9e1068", "#780650", "#520339"];
  magenta.primary = magenta[5];
  var grey = ["#a6a6a6", "#999999", "#8c8c8c", "#808080", "#737373", "#666666", "#404040", "#1a1a1a", "#000000", "#000000"];
  grey.primary = grey[5];
  var presetPalettes = {
    red,
    volcano,
    orange,
    gold,
    yellow,
    lime,
    green,
    cyan,
    blue,
    geekblue,
    purple,
    magenta,
    grey
  };
  var redDark = ["#2a1215", "#431418", "#58181c", "#791a1f", "#a61d24", "#d32029", "#e84749", "#f37370", "#f89f9a", "#fac8c3"];
  redDark.primary = redDark[5];
  var volcanoDark = ["#2b1611", "#441d12", "#592716", "#7c3118", "#aa3e19", "#d84a1b", "#e87040", "#f3956a", "#f8b692", "#fad4bc"];
  volcanoDark.primary = volcanoDark[5];
  var orangeDark = ["#2b1d11", "#442a11", "#593815", "#7c4a15", "#aa6215", "#d87a16", "#e89a3c", "#f3b765", "#f8cf8d", "#fae3b7"];
  orangeDark.primary = orangeDark[5];
  var goldDark = ["#2b2111", "#443111", "#594214", "#7c5914", "#aa7714", "#d89614", "#e8b339", "#f3cc62", "#f8df8b", "#faedb5"];
  goldDark.primary = goldDark[5];
  var yellowDark = ["#2b2611", "#443b11", "#595014", "#7c6e14", "#aa9514", "#d8bd14", "#e8d639", "#f3ea62", "#f8f48b", "#fafab5"];
  yellowDark.primary = yellowDark[5];
  var limeDark = ["#1f2611", "#2e3c10", "#3e4f13", "#536d13", "#6f9412", "#8bbb11", "#a9d134", "#c9e75d", "#e4f88b", "#f0fab5"];
  limeDark.primary = limeDark[5];
  var greenDark = ["#162312", "#1d3712", "#274916", "#306317", "#3c8618", "#49aa19", "#6abe39", "#8fd460", "#b2e58b", "#d5f2bb"];
  greenDark.primary = greenDark[5];
  var cyanDark = ["#112123", "#113536", "#144848", "#146262", "#138585", "#13a8a8", "#33bcb7", "#58d1c9", "#84e2d8", "#b2f1e8"];
  cyanDark.primary = cyanDark[5];
  var blueDark = ["#111a2c", "#112545", "#15325b", "#15417e", "#1554ad", "#1668dc", "#3c89e8", "#65a9f3", "#8dc5f8", "#b7dcfa"];
  blueDark.primary = blueDark[5];
  var geekblueDark = ["#131629", "#161d40", "#1c2755", "#203175", "#263ea0", "#2b4acb", "#5273e0", "#7f9ef3", "#a8c1f8", "#d2e0fa"];
  geekblueDark.primary = geekblueDark[5];
  var purpleDark = ["#1a1325", "#24163a", "#301c4d", "#3e2069", "#51258f", "#642ab5", "#854eca", "#ab7ae0", "#cda8f0", "#ebd7fa"];
  purpleDark.primary = purpleDark[5];
  var magentaDark = ["#291321", "#40162f", "#551c3b", "#75204f", "#a02669", "#cb2b83", "#e0529c", "#f37fb7", "#f8a8cc", "#fad2e3"];
  magentaDark.primary = magentaDark[5];
  var greyDark = ["#151515", "#1f1f1f", "#2d2d2d", "#393939", "#494949", "#5a5a5a", "#6a6a6a", "#7b7b7b", "#888888", "#969696"];
  greyDark.primary = greyDark[5];

  // ../../node_modules/antd/es/theme/themes/shared/genColorMapToken.js
  function genColorMapToken(seed, {
    generateColorPalettes: generateColorPalettes2,
    generateNeutralColorPalettes: generateNeutralColorPalettes2
  }) {
    const {
      colorSuccess: colorSuccessBase,
      colorWarning: colorWarningBase,
      colorError: colorErrorBase,
      colorInfo: colorInfoBase,
      colorPrimary: colorPrimaryBase,
      colorBgBase,
      colorTextBase
    } = seed;
    const primaryColors = generateColorPalettes2(colorPrimaryBase);
    const successColors = generateColorPalettes2(colorSuccessBase);
    const warningColors = generateColorPalettes2(colorWarningBase);
    const errorColors = generateColorPalettes2(colorErrorBase);
    const infoColors = generateColorPalettes2(colorInfoBase);
    const neutralColors = generateNeutralColorPalettes2(colorBgBase, colorTextBase);
    const colorLink = seed.colorLink || seed.colorInfo;
    const linkColors = generateColorPalettes2(colorLink);
    const colorErrorBgFilledHover = new FastColor(errorColors[1]).mix(new FastColor(errorColors[3]), 50).toHexString();
    const presetColorTokens = {};
    PresetColors.forEach((colorKey) => {
      const colorBase = seed[colorKey];
      if (colorBase) {
        const colorPalette = generateColorPalettes2(colorBase);
        presetColorTokens[`${colorKey}Hover`] = colorPalette[5];
        presetColorTokens[`${colorKey}Active`] = colorPalette[7];
      }
    });
    return {
      ...neutralColors,
      colorPrimaryBg: primaryColors[1],
      colorPrimaryBgHover: primaryColors[2],
      colorPrimaryBorder: primaryColors[3],
      colorPrimaryBorderHover: primaryColors[4],
      colorPrimaryHover: primaryColors[5],
      colorPrimary: primaryColors[6],
      colorPrimaryActive: primaryColors[7],
      colorPrimaryTextHover: primaryColors[8],
      colorPrimaryText: primaryColors[9],
      colorPrimaryTextActive: primaryColors[10],
      colorSuccessBg: successColors[1],
      colorSuccessBgHover: successColors[2],
      colorSuccessBorder: successColors[3],
      colorSuccessBorderHover: successColors[4],
      colorSuccessHover: successColors[4],
      colorSuccess: successColors[6],
      colorSuccessActive: successColors[7],
      colorSuccessTextHover: successColors[8],
      colorSuccessText: successColors[9],
      colorSuccessTextActive: successColors[10],
      colorErrorBg: errorColors[1],
      colorErrorBgHover: errorColors[2],
      colorErrorBgFilledHover,
      colorErrorBgActive: errorColors[3],
      colorErrorBorder: errorColors[3],
      colorErrorBorderHover: errorColors[4],
      colorErrorHover: errorColors[5],
      colorError: errorColors[6],
      colorErrorActive: errorColors[7],
      colorErrorTextHover: errorColors[8],
      colorErrorText: errorColors[9],
      colorErrorTextActive: errorColors[10],
      colorWarningBg: warningColors[1],
      colorWarningBgHover: warningColors[2],
      colorWarningBorder: warningColors[3],
      colorWarningBorderHover: warningColors[4],
      colorWarningHover: warningColors[4],
      colorWarning: warningColors[6],
      colorWarningActive: warningColors[7],
      colorWarningTextHover: warningColors[8],
      colorWarningText: warningColors[9],
      colorWarningTextActive: warningColors[10],
      colorInfoBg: infoColors[1],
      colorInfoBgHover: infoColors[2],
      colorInfoBorder: infoColors[3],
      colorInfoBorderHover: infoColors[4],
      colorInfoHover: infoColors[4],
      colorInfo: infoColors[6],
      colorInfoActive: infoColors[7],
      colorInfoTextHover: infoColors[8],
      colorInfoText: infoColors[9],
      colorInfoTextActive: infoColors[10],
      colorLinkHover: linkColors[4],
      colorLink: linkColors[6],
      colorLinkActive: linkColors[7],
      ...presetColorTokens,
      colorBgMask: new FastColor("#000").setA(0.45).toRgbString(),
      colorWhite: "#fff"
    };
  }

  // ../../node_modules/antd/es/theme/themes/shared/genRadius.js
  var genRadius = (radiusBase) => {
    let radiusLG = radiusBase;
    let radiusSM = radiusBase;
    let radiusXS = radiusBase;
    let radiusOuter = radiusBase;
    if (radiusBase < 6 && radiusBase >= 5) {
      radiusLG = radiusBase + 1;
    } else if (radiusBase < 16 && radiusBase >= 6) {
      radiusLG = radiusBase + 2;
    } else if (radiusBase >= 16) {
      radiusLG = 16;
    }
    if (radiusBase < 7 && radiusBase >= 5) {
      radiusSM = 4;
    } else if (radiusBase < 8 && radiusBase >= 7) {
      radiusSM = 5;
    } else if (radiusBase < 14 && radiusBase >= 8) {
      radiusSM = 6;
    } else if (radiusBase < 16 && radiusBase >= 14) {
      radiusSM = 7;
    } else if (radiusBase >= 16) {
      radiusSM = 8;
    }
    if (radiusBase < 6 && radiusBase >= 2) {
      radiusXS = 1;
    } else if (radiusBase >= 6) {
      radiusXS = 2;
    }
    if (radiusBase > 4 && radiusBase < 8) {
      radiusOuter = 4;
    } else if (radiusBase >= 8) {
      radiusOuter = 6;
    }
    return {
      borderRadius: radiusBase,
      borderRadiusXS: radiusXS,
      borderRadiusSM: radiusSM,
      borderRadiusLG: radiusLG,
      borderRadiusOuter: radiusOuter
    };
  };
  var genRadius_default = genRadius;

  // ../../node_modules/antd/es/theme/themes/shared/genCommonMapToken.js
  function genCommonMapToken(token2) {
    const {
      motionUnit,
      motionBase,
      borderRadius,
      lineWidth
    } = token2;
    return {
      // motion
      motionDurationFast: `${(motionBase + motionUnit).toFixed(1)}s`,
      motionDurationMid: `${(motionBase + motionUnit * 2).toFixed(1)}s`,
      motionDurationSlow: `${(motionBase + motionUnit * 3).toFixed(1)}s`,
      // line
      lineWidthBold: lineWidth + 1,
      // radius
      ...genRadius_default(borderRadius)
    };
  }

  // ../../node_modules/antd/es/theme/themes/shared/genControlHeight.js
  var genControlHeight = (token2) => {
    const {
      controlHeight
    } = token2;
    return {
      controlHeightSM: controlHeight * 0.75,
      controlHeightXS: controlHeight * 0.5,
      controlHeightLG: controlHeight * 1.25
    };
  };
  var genControlHeight_default = genControlHeight;

  // ../../node_modules/antd/es/theme/themes/shared/genFontMapToken.js
  var genFontMapToken = (fontSize) => {
    const fontSizePairs = getFontSizes(fontSize);
    const fontSizes = fontSizePairs.map((pair) => pair.size);
    const lineHeights = fontSizePairs.map((pair) => pair.lineHeight);
    const fontSizeMD = fontSizes[1];
    const fontSizeSM = fontSizes[0];
    const fontSizeLG = fontSizes[2];
    const lineHeight = lineHeights[1];
    const lineHeightSM = lineHeights[0];
    const lineHeightLG = lineHeights[2];
    return {
      fontSizeSM,
      fontSize: fontSizeMD,
      fontSizeLG,
      fontSizeXL: fontSizes[3],
      fontSizeHeading1: fontSizes[6],
      fontSizeHeading2: fontSizes[5],
      fontSizeHeading3: fontSizes[4],
      fontSizeHeading4: fontSizes[3],
      fontSizeHeading5: fontSizes[2],
      lineHeight,
      lineHeightLG,
      lineHeightSM,
      fontHeight: Math.round(lineHeight * fontSizeMD),
      fontHeightLG: Math.round(lineHeightLG * fontSizeLG),
      fontHeightSM: Math.round(lineHeightSM * fontSizeSM),
      lineHeightHeading1: lineHeights[6],
      lineHeightHeading2: lineHeights[5],
      lineHeightHeading3: lineHeights[4],
      lineHeightHeading4: lineHeights[3],
      lineHeightHeading5: lineHeights[2]
    };
  };
  var genFontMapToken_default = genFontMapToken;

  // ../../node_modules/antd/es/theme/themes/shared/genSizeMapToken.js
  function genSizeMapToken(token2) {
    const {
      sizeUnit,
      sizeStep
    } = token2;
    return {
      sizeXXL: sizeUnit * (sizeStep + 8),
      // 48
      sizeXL: sizeUnit * (sizeStep + 4),
      // 32
      sizeLG: sizeUnit * (sizeStep + 2),
      // 24
      sizeMD: sizeUnit * (sizeStep + 1),
      // 20
      sizeMS: sizeUnit * sizeStep,
      // 16
      size: sizeUnit * sizeStep,
      // 16
      sizeSM: sizeUnit * (sizeStep - 1),
      // 12
      sizeXS: sizeUnit * (sizeStep - 2),
      // 8
      sizeXXS: sizeUnit * (sizeStep - 3)
      // 4
    };
  }

  // ../../node_modules/antd/es/theme/themes/default/colorAlgorithm.js
  var getAlphaColor = (baseColor, alpha) => new FastColor(baseColor).setA(alpha).toRgbString();
  var getSolidColor = (baseColor, brightness) => {
    const instance = new FastColor(baseColor);
    return instance.darken(brightness).toHexString();
  };

  // ../../node_modules/antd/es/theme/themes/default/colors.js
  var generateColorPalettes = (baseColor) => {
    const colors = generate(baseColor);
    return {
      1: colors[0],
      2: colors[1],
      3: colors[2],
      4: colors[3],
      5: colors[4],
      6: colors[5],
      7: colors[6],
      8: colors[4],
      9: colors[5],
      10: colors[6]
    };
  };
  var generateNeutralColorPalettes = (bgBaseColor, textBaseColor, shadowColor) => {
    const colorBgBase = bgBaseColor || "#fff";
    const colorTextBase = textBaseColor || "#000";
    const colorShadow = shadowColor || "#000";
    return {
      colorBgBase,
      colorTextBase,
      colorShadow,
      colorText: getAlphaColor(colorTextBase, 0.88),
      colorTextSecondary: getAlphaColor(colorTextBase, 0.65),
      colorTextTertiary: getAlphaColor(colorTextBase, 0.45),
      colorTextQuaternary: getAlphaColor(colorTextBase, 0.25),
      colorFill: getAlphaColor(colorTextBase, 0.15),
      colorFillSecondary: getAlphaColor(colorTextBase, 0.06),
      colorFillTertiary: getAlphaColor(colorTextBase, 0.04),
      colorFillQuaternary: getAlphaColor(colorTextBase, 0.02),
      colorBgSolid: getAlphaColor(colorTextBase, 1),
      colorBgSolidHover: getAlphaColor(colorTextBase, 0.75),
      colorBgSolidActive: getAlphaColor(colorTextBase, 0.95),
      colorBgLayout: getSolidColor(colorBgBase, 4),
      colorBgContainer: getSolidColor(colorBgBase, 0),
      colorBgElevated: getSolidColor(colorBgBase, 0),
      colorBgSpotlight: getAlphaColor(colorTextBase, 0.85),
      colorBgBlur: "transparent",
      colorBorder: getSolidColor(colorBgBase, 15),
      colorBorderDisabled: getSolidColor(colorBgBase, 15),
      colorBorderSecondary: getSolidColor(colorBgBase, 6)
    };
  };

  // ../../node_modules/antd/es/theme/themes/default/index.js
  function derivative(token2) {
    presetPrimaryColors.pink = presetPrimaryColors.magenta;
    presetPalettes.pink = presetPalettes.magenta;
    const colorPalettes = Object.keys(defaultPresetColors).map((colorKey) => {
      const colors = token2[colorKey] === presetPrimaryColors[colorKey] ? presetPalettes[colorKey] : generate(token2[colorKey]);
      return Array.from({
        length: 10
      }, () => 1).reduce((prev2, _, i) => {
        prev2[`${colorKey}-${i + 1}`] = colors[i];
        prev2[`${colorKey}${i + 1}`] = colors[i];
        return prev2;
      }, {});
    }).reduce((prev2, cur) => {
      prev2 = {
        ...prev2,
        ...cur
      };
      return prev2;
    }, {});
    return {
      ...token2,
      ...colorPalettes,
      // Colors
      ...genColorMapToken(token2, {
        generateColorPalettes,
        generateNeutralColorPalettes
      }),
      // Font
      ...genFontMapToken_default(token2.fontSize),
      // Size
      ...genSizeMapToken(token2),
      // Height
      ...genControlHeight_default(token2),
      // Others
      ...genCommonMapToken(token2)
    };
  }

  // ../../node_modules/antd/es/theme/themes/default/theme.js
  var defaultTheme = createTheme(derivative);
  var theme_default = defaultTheme;

  // ../../node_modules/antd/es/theme/context.js
  var defaultConfig = {
    token: seed_default,
    override: {
      override: seed_default
    },
    hashed: true
  };
  var DesignTokenContext = /* @__PURE__ */ react_compat_default.createContext(defaultConfig);

  // ../../node_modules/antd/es/theme/util/getAlphaColor.js
  function isStableColor(color) {
    return color >= 0 && color <= 255;
  }
  function getAlphaColor2(frontColor, backgroundColor) {
    const {
      r: fR,
      g: fG,
      b: fB,
      a: originAlpha
    } = new FastColor(frontColor).toRgb();
    if (originAlpha < 1) {
      return frontColor;
    }
    const {
      r: bR,
      g: bG,
      b: bB
    } = new FastColor(backgroundColor).toRgb();
    for (let fA = 0.01; fA <= 1; fA += 0.01) {
      const r2 = Math.round((fR - bR * (1 - fA)) / fA);
      const g = Math.round((fG - bG * (1 - fA)) / fA);
      const b = Math.round((fB - bB * (1 - fA)) / fA);
      if (isStableColor(r2) && isStableColor(g) && isStableColor(b)) {
        return new FastColor({
          r: r2,
          g,
          b,
          a: Math.round(fA * 100) / 100
        }).toRgbString();
      }
    }
    return new FastColor({
      r: fR,
      g: fG,
      b: fB,
      a: 1
    }).toRgbString();
  }
  var getAlphaColor_default = getAlphaColor2;

  // ../../node_modules/antd/es/theme/util/alias.js
  function formatToken(derivativeToken) {
    const {
      override,
      ...restToken
    } = derivativeToken;
    const overrideTokens = {
      ...override
    };
    Object.keys(seed_default).forEach((token2) => {
      delete overrideTokens[token2];
    });
    const mergedToken = {
      ...restToken,
      ...overrideTokens
    };
    const shadowBaseColor = new FastColor(mergedToken.colorShadow);
    const shadowBaseAlpha = shadowBaseColor.a;
    const getShadowColor = (alpha) => shadowBaseColor.clone().setA(shadowBaseAlpha * alpha).toRgbString();
    const screenXS = 480;
    const screenSM = 576;
    const screenMD = 768;
    const screenLG = 992;
    const screenXL = 1200;
    const screenXXL = 1600;
    const screenXXXL = 1920;
    if (mergedToken.motion === false) {
      const fastDuration = "0s";
      mergedToken.motionDurationFast = fastDuration;
      mergedToken.motionDurationMid = fastDuration;
      mergedToken.motionDurationSlow = fastDuration;
    }
    const aliasToken = {
      ...mergedToken,
      // ============== Background ============== //
      colorFillContent: mergedToken.colorFillSecondary,
      colorFillContentHover: mergedToken.colorFill,
      colorFillAlter: mergedToken.colorFillQuaternary,
      colorBgContainerDisabled: mergedToken.colorFillTertiary,
      // ============== Split ============== //
      colorBorderBg: mergedToken.colorBgContainer,
      colorSplit: getAlphaColor_default(mergedToken.colorBorderSecondary, mergedToken.colorBgContainer),
      // ============== Text ============== //
      colorTextPlaceholder: mergedToken.colorTextQuaternary,
      colorTextDisabled: mergedToken.colorTextQuaternary,
      colorTextHeading: mergedToken.colorText,
      colorTextLabel: mergedToken.colorTextSecondary,
      colorTextDescription: mergedToken.colorTextTertiary,
      colorTextLightSolid: mergedToken.colorWhite,
      colorHighlight: mergedToken.colorError,
      colorBgTextHover: mergedToken.colorFillSecondary,
      colorBgTextActive: mergedToken.colorFill,
      colorIcon: mergedToken.colorTextTertiary,
      colorIconHover: mergedToken.colorText,
      colorErrorOutline: getAlphaColor_default(mergedToken.colorErrorBg, mergedToken.colorBgContainer),
      colorWarningOutline: getAlphaColor_default(mergedToken.colorWarningBg, mergedToken.colorBgContainer),
      colorErrorAffix: mergedToken.colorError,
      colorWarningAffix: mergedToken.colorWarning,
      // Font
      fontHeight: Math.round(mergedToken.fontSize * mergedToken.lineHeight),
      fontHeightSM: Math.round(mergedToken.fontSizeSM * mergedToken.lineHeightSM),
      fontHeightLG: Math.round(mergedToken.fontSizeLG * mergedToken.lineHeightLG),
      fontSizeIcon: mergedToken.fontSizeSM,
      // Line
      lineWidthFocus: mergedToken.focusOutline === false ? 0 : mergedToken.lineWidth * 3,
      // Control
      lineWidth: mergedToken.lineWidth,
      controlOutlineWidth: mergedToken.lineWidth * 2,
      // Checkbox size and expand icon size
      controlInteractiveSize: mergedToken.controlHeight / 2,
      controlItemBgHover: mergedToken.colorFillTertiary,
      controlItemBgActive: mergedToken.colorPrimaryBg,
      controlItemBgActiveHover: mergedToken.colorPrimaryBgHover,
      controlItemBgActiveDisabled: mergedToken.colorFill,
      controlTmpOutline: mergedToken.colorFillQuaternary,
      controlOutline: getAlphaColor_default(mergedToken.colorPrimaryBg, mergedToken.colorBgContainer),
      lineType: mergedToken.lineType,
      borderRadius: mergedToken.borderRadius,
      borderRadiusXS: mergedToken.borderRadiusXS,
      borderRadiusSM: mergedToken.borderRadiusSM,
      borderRadiusLG: mergedToken.borderRadiusLG,
      fontWeightStrong: 600,
      opacityLoading: 0.65,
      linkDecoration: "none",
      linkHoverDecoration: "none",
      linkFocusDecoration: "none",
      controlPaddingHorizontal: 12,
      controlPaddingHorizontalSM: 8,
      paddingXXS: mergedToken.sizeXXS,
      paddingXS: mergedToken.sizeXS,
      paddingSM: mergedToken.sizeSM,
      padding: mergedToken.size,
      paddingMD: mergedToken.sizeMD,
      paddingLG: mergedToken.sizeLG,
      paddingXL: mergedToken.sizeXL,
      paddingContentHorizontalLG: mergedToken.sizeLG,
      paddingContentVerticalLG: mergedToken.sizeMS,
      paddingContentHorizontal: mergedToken.sizeMS,
      paddingContentVertical: mergedToken.sizeSM,
      paddingContentHorizontalSM: mergedToken.size,
      paddingContentVerticalSM: mergedToken.sizeXS,
      marginXXS: mergedToken.sizeXXS,
      marginXS: mergedToken.sizeXS,
      marginSM: mergedToken.sizeSM,
      margin: mergedToken.size,
      marginMD: mergedToken.sizeMD,
      marginLG: mergedToken.sizeLG,
      marginXL: mergedToken.sizeXL,
      marginXXL: mergedToken.sizeXXL,
      boxShadow: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
      boxShadowSecondary: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
      boxShadowTertiary: `
      0 1px 2px 0 ${getShadowColor(0.05)},
      0 1px 6px -1px ${getShadowColor(0.03)},
      0 2px 4px 0 ${getShadowColor(0.03)}
    `,
      screenXS,
      screenXSMin: screenXS,
      screenXSMax: screenSM - 1,
      screenSM,
      screenSMMin: screenSM,
      screenSMMax: screenMD - 1,
      screenMD,
      screenMDMin: screenMD,
      screenMDMax: screenLG - 1,
      screenLG,
      screenLGMin: screenLG,
      screenLGMax: screenXL - 1,
      screenXL,
      screenXLMin: screenXL,
      screenXLMax: screenXXL - 1,
      screenXXL,
      screenXXLMin: screenXXL,
      screenXXLMax: screenXXXL - 1,
      screenXXXL,
      screenXXXLMin: screenXXXL,
      boxShadowPopoverArrow: `2px 2px 5px ${getShadowColor(0.05)}`,
      dropShadowPopover: `drop-shadow(0 6px 16px ${getShadowColor(0.08)}) drop-shadow(0 3px 6px ${getShadowColor(0.12)}) drop-shadow(0 9px 28px ${getShadowColor(0.05)})`,
      boxShadowCard: `
      0 1px 2px -2px ${getShadowColor(0.16)},
      0 3px 6px 0 ${getShadowColor(0.12)},
      0 5px 12px 4px ${getShadowColor(0.09)}
    `,
      boxShadowDrawerRight: `
      -6px 0 16px 0 ${getShadowColor(0.08)},
      -3px 0 6px -4px ${getShadowColor(0.12)},
      -9px 0 28px 8px ${getShadowColor(0.05)}
    `,
      boxShadowDrawerLeft: `
      6px 0 16px 0 ${getShadowColor(0.08)},
      3px 0 6px -4px ${getShadowColor(0.12)},
      9px 0 28px 8px ${getShadowColor(0.05)}
    `,
      boxShadowDrawerUp: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
      boxShadowDrawerDown: `
      0 -6px 16px 0 ${getShadowColor(0.08)},
      0 -3px 6px -4px ${getShadowColor(0.12)},
      0 -9px 28px 8px ${getShadowColor(0.05)}
    `,
      boxShadowTabsOverflowLeft: `inset 10px 0 8px -8px ${getShadowColor(0.08)}`,
      boxShadowTabsOverflowRight: `inset -10px 0 8px -8px ${getShadowColor(0.08)}`,
      boxShadowTabsOverflowTop: `inset 0 10px 8px -8px ${getShadowColor(0.08)}`,
      boxShadowTabsOverflowBottom: `inset 0 -10px 8px -8px ${getShadowColor(0.08)}`,
      // Override AliasToken
      ...overrideTokens
    };
    return aliasToken;
  }

  // ../../node_modules/antd/es/theme/useToken.js
  var unitless = {
    lineHeight: true,
    lineHeightSM: true,
    lineHeightLG: true,
    lineHeightHeading1: true,
    lineHeightHeading2: true,
    lineHeightHeading3: true,
    lineHeightHeading4: true,
    lineHeightHeading5: true,
    opacityLoading: true,
    fontWeightStrong: true,
    zIndexPopupBase: true,
    zIndexBase: true,
    opacityImage: true
  };
  var ignore = {
    motionBase: true,
    motionUnit: true
  };
  var preserve = {
    screenXS: true,
    screenXSMin: true,
    screenXSMax: true,
    screenSM: true,
    screenSMMin: true,
    screenSMMax: true,
    screenMD: true,
    screenMDMin: true,
    screenMDMax: true,
    screenLG: true,
    screenLGMin: true,
    screenLGMax: true,
    screenXL: true,
    screenXLMin: true,
    screenXLMax: true,
    screenXXL: true,
    screenXXLMin: true,
    screenXXLMax: true,
    screenXXXL: true,
    screenXXXLMin: true
  };
  var getComputedToken2 = (originToken, overrideToken, theme) => {
    const derivativeToken = theme.getDerivativeToken(originToken);
    const {
      override,
      ...components
    } = overrideToken;
    let mergedDerivativeToken = {
      ...derivativeToken,
      override
    };
    mergedDerivativeToken = formatToken(mergedDerivativeToken);
    if (components) {
      Object.entries(components).forEach(([key, value]) => {
        const {
          theme: componentTheme,
          ...componentTokens
        } = value;
        let mergedComponentToken = componentTokens;
        if (componentTheme) {
          mergedComponentToken = getComputedToken2({
            ...mergedDerivativeToken,
            ...componentTokens
          }, {
            override: componentTokens
          }, componentTheme);
        }
        mergedDerivativeToken[key] = mergedComponentToken;
      });
    }
    return mergedDerivativeToken;
  };
  function useToken() {
    const {
      token: rootDesignToken,
      hashed,
      theme,
      override,
      cssVar: ctxCssVar,
      zeroRuntime
    } = react_compat_default.useContext(DesignTokenContext);
    const {
      csp,
      getPrefixCls
    } = react_compat_default.useContext(ConfigContext);
    const cssVar = {
      prefix: ctxCssVar?.prefix ?? getPrefixCls(),
      key: ctxCssVar?.key ?? "css-var-root"
    };
    const salt = `${version_default2}-${hashed || ""}`;
    const mergedTheme = theme || theme_default;
    const [token2, hashId, realToken] = useCacheToken(mergedTheme, [seed_default, rootDesignToken], {
      salt,
      override,
      getComputedToken: getComputedToken2,
      cssVar: {
        ...cssVar,
        unitless,
        ignore,
        preserve
      },
      nonce: csp?.nonce
    });
    return [mergedTheme, realToken, hashed ? hashId : "", token2, cssVar, !!zeroRuntime];
  }

  // ../../node_modules/antd/es/style/index.js
  var resetComponent = (token2, needInheritFontFamily = false) => ({
    boxSizing: "border-box",
    margin: 0,
    padding: 0,
    color: token2.colorText,
    fontSize: token2.fontSize,
    // font-variant: @font-variant-base;
    lineHeight: token2.lineHeight,
    listStyle: "none",
    // font-feature-settings: @font-feature-settings-base;
    fontFamily: needInheritFontFamily ? "inherit" : token2.fontFamily
  });
  var resetIcon = () => ({
    display: "inline-flex",
    alignItems: "center",
    color: "inherit",
    fontStyle: "normal",
    lineHeight: 0,
    textAlign: "center",
    textTransform: "none",
    // for SVG icon, see https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4
    verticalAlign: "-0.125em",
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
    "> *": {
      lineHeight: 1
    },
    svg: {
      display: "inline-block",
      verticalAlign: "inherit"
    }
  });
  var loadingCircle = new Keyframes_default("loadingCircle", {
    "100%": {
      transform: "rotate(360deg)"
    }
  });
  var genFocusOutline = (token2, offset) => ({
    outline: `${unit(token2.lineWidthFocus)} solid ${token2.colorPrimaryBorder}`,
    outlineOffset: offset ?? 1,
    transition: [`outline-offset`, `outline`].map((prop) => `${prop} 0s`).join(", ")
  });
  var genFocusStyle = (token2, offset) => ({
    "&:focus-visible": genFocusOutline(token2, offset)
  });
  var genLinkStyle = (token2) => ({
    a: {
      color: token2.colorLink,
      textDecoration: token2.linkDecoration,
      backgroundColor: "transparent",
      // remove the gray background on active links in IE 10.
      outline: "none",
      cursor: "pointer",
      transition: `color ${token2.motionDurationSlow}`,
      "-webkit-text-decoration-skip": "objects",
      // remove gaps in links underline in iOS 8+ and Safari 8+.
      "&:hover": {
        color: token2.colorLinkHover
      },
      "&:active": {
        color: token2.colorLinkActive
      },
      "&:active, &:hover": {
        textDecoration: token2.linkHoverDecoration,
        outline: 0
      },
      // https://github.com/ant-design/ant-design/issues/22503
      "&:focus": {
        textDecoration: token2.linkFocusDecoration,
        outline: 0
      },
      ...genFocusStyle(token2),
      "&[disabled]": {
        color: token2.colorTextDisabled,
        cursor: "not-allowed"
      }
    }
  });
  var genCommonStyle = (token2, componentPrefixCls, rootCls, resetFont) => {
    const prefixSelector = `[class^="${componentPrefixCls}"], [class*=" ${componentPrefixCls}"]`;
    const rootPrefixSelector = rootCls ? `.${rootCls}` : prefixSelector;
    const resetStyle = {
      boxSizing: "border-box",
      "&::before, &::after": {
        boxSizing: "border-box"
      }
    };
    let resetFontStyle = {};
    if (resetFont !== false) {
      resetFontStyle = {
        fontFamily: token2.fontFamily,
        fontSize: token2.fontSize
      };
    }
    return {
      [rootPrefixSelector]: {
        ...resetFontStyle,
        ...resetStyle,
        [prefixSelector]: resetStyle
      }
    };
  };
  var genIconStyle = (iconPrefixCls) => ({
    [`.${iconPrefixCls}`]: {
      ...resetIcon(),
      "&::before": {
        display: "none"
      },
      "&[tabindex]": {
        cursor: "pointer"
      }
    },
    [`.${iconPrefixCls} .${iconPrefixCls}-icon`]: {
      display: "block"
    },
    [`.${iconPrefixCls}-spin`]: {
      animationName: loadingCircle,
      animationDuration: "1s",
      animationIterationCount: "infinite",
      animationTimingFunction: "linear"
    }
  });

  // ../../node_modules/antd/es/theme/util/genStyleUtils.js
  var {
    genStyleHooks,
    genComponentStyleHook,
    genSubStyleComponent
  } = genStyleUtils_default({
    usePrefix: () => {
      const {
        getPrefixCls,
        iconPrefixCls
      } = useContext(ConfigContext);
      const rootPrefixCls = getPrefixCls();
      return {
        rootPrefixCls,
        iconPrefixCls
      };
    },
    useToken: () => {
      const [theme, realToken, hashId, token2, cssVar, zeroRuntime] = useToken();
      return {
        theme,
        realToken,
        hashId,
        token: token2,
        cssVar,
        zeroRuntime
      };
    },
    useCSP: () => {
      const {
        csp
      } = useContext(ConfigContext);
      return csp ?? {};
    },
    getResetStyles: (token2, config) => {
      const linkStyle = genLinkStyle(token2);
      return [linkStyle, {
        "&": linkStyle
      }, genIconStyle(config?.prefix.iconPrefixCls ?? defaultIconPrefixCls)];
    },
    getCommonStyle: genCommonStyle,
    getCompUnitless: () => unitless
  });
  var genCssVar = (antCls, component) => {
    const cssPrefix = `--${antCls.replace(/\./g, "")}-${component}-`;
    const varName = (name) => {
      return `${cssPrefix}${name}`;
    };
    const varRef = (name, fallback) => {
      return fallback ? `var(${cssPrefix}${name}, ${fallback})` : `var(${cssPrefix}${name})`;
    };
    return [varName, varRef];
  };

  // ../../node_modules/antd/es/theme/util/genPresetColor.js
  function genPresetColor(token2, genCss) {
    return PresetColors.reduce((prev2, colorKey) => {
      const lightColor = token2[`${colorKey}1`];
      const lightBorderColor = token2[`${colorKey}3`];
      const darkColor = token2[`${colorKey}6`];
      const textColor = token2[`${colorKey}7`];
      return {
        ...prev2,
        ...genCss(colorKey, {
          lightColor,
          lightBorderColor,
          darkColor,
          textColor
        })
      };
    }, {});
  }

  // ../../node_modules/antd/es/theme/util/useResetIconStyle.js
  var useResetIconStyle = (iconPrefixCls, csp) => {
    const [theme, token2] = useToken();
    return useStyleRegister({
      theme,
      token: token2,
      hashId: "",
      path: ["ant-design-icons", iconPrefixCls],
      nonce: () => csp?.nonce,
      layer: {
        name: "antd"
      }
    }, () => genIconStyle(iconPrefixCls));
  };
  var useResetIconStyle_default = useResetIconStyle;

  // ../../node_modules/@ant-design/icons-svg/es/asn/CheckCircleFilled.js
  var CheckCircleFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" } }] }, "name": "check-circle", "theme": "filled" };
  var CheckCircleFilled_default = CheckCircleFilled;

  // ../../node_modules/@ant-design/icons/es/components/Context.js
  var IconContext = /* @__PURE__ */ createContext({});
  var Context_default = IconContext;

  // ../../node_modules/@ant-design/icons/es/cssUtils.js
  var APPEND_ORDER2 = "data-rc-order";
  var APPEND_PRIORITY2 = "data-rc-priority";
  var MARK_KEY2 = "rc-util-key";
  var containerCache2 = /* @__PURE__ */ new Map();
  function canUseDom2() {
    return !!(typeof window !== "undefined" && window.document && window.document.createElement);
  }
  function contains2(root, node2) {
    if (!root || !node2) {
      return false;
    }
    if (root.contains) {
      return root.contains(node2);
    }
    let current = node2;
    while (current) {
      if (current === root) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }
  function getMark2({
    mark
  } = {}) {
    if (mark) {
      return mark.startsWith("data-") ? mark : `data-${mark}`;
    }
    return MARK_KEY2;
  }
  function getContainer2(option2) {
    if (option2.attachTo) {
      return option2.attachTo;
    }
    const head = document.querySelector("head");
    return head || document.body;
  }
  function getOrder2(prepend) {
    if (prepend === "queue") {
      return "prependQueue";
    }
    return prepend ? "prepend" : "append";
  }
  function findStyles2(container) {
    return Array.from((containerCache2.get(container) || container).children).filter((node2) => node2.tagName === "STYLE");
  }
  function injectCSS2(css, option2 = {}) {
    if (!canUseDom2()) {
      return null;
    }
    const {
      csp,
      prepend,
      priority = 0
    } = option2;
    const mergedOrder = getOrder2(prepend);
    const isPrependQueue = mergedOrder === "prependQueue";
    const styleNode = document.createElement("style");
    styleNode.setAttribute(APPEND_ORDER2, mergedOrder);
    if (isPrependQueue && priority) {
      styleNode.setAttribute(APPEND_PRIORITY2, `${priority}`);
    }
    if (csp?.nonce) {
      styleNode.nonce = csp.nonce;
    }
    styleNode.innerHTML = css;
    const container = getContainer2(option2);
    const {
      firstChild
    } = container;
    if (prepend) {
      if (isPrependQueue) {
        const existStyle = (option2.styles || findStyles2(container)).filter((node2) => {
          if (!["prepend", "prependQueue"].includes(node2.getAttribute(APPEND_ORDER2))) {
            return false;
          }
          const nodePriority = Number(node2.getAttribute(APPEND_PRIORITY2) || 0);
          return priority >= nodePriority;
        });
        if (existStyle.length) {
          container.insertBefore(styleNode, existStyle[existStyle.length - 1].nextSibling);
          return styleNode;
        }
      }
      container.insertBefore(styleNode, firstChild);
    } else {
      container.appendChild(styleNode);
    }
    return styleNode;
  }
  function findExistNode2(key, option2 = {}) {
    let {
      styles
    } = option2;
    styles || (styles = findStyles2(getContainer2(option2)));
    return styles.find((node2) => node2.getAttribute(getMark2(option2)) === key);
  }
  function syncRealContainer2(container, option2) {
    const cachedRealContainer = containerCache2.get(container);
    if (!cachedRealContainer || !contains2(document, cachedRealContainer)) {
      const placeholderStyle = injectCSS2("", option2);
      if (!placeholderStyle) {
        return;
      }
      const {
        parentNode
      } = placeholderStyle;
      containerCache2.set(container, parentNode);
      container.removeChild(placeholderStyle);
    }
  }
  function updateCSS2(css, key, originOption = {}) {
    if (!canUseDom2()) {
      return null;
    }
    const container = getContainer2(originOption);
    const styles = findStyles2(container);
    const option2 = {
      ...originOption,
      styles
    };
    syncRealContainer2(container, option2);
    const existNode = findExistNode2(key, option2);
    if (existNode) {
      if (option2.csp?.nonce && existNode.nonce !== option2.csp.nonce) {
        existNode.nonce = option2.csp.nonce;
      }
      if (existNode.innerHTML !== css) {
        existNode.innerHTML = css;
      }
      return existNode;
    }
    const newNode = injectCSS2(css, option2);
    newNode?.setAttribute(getMark2(option2), key);
    return newNode;
  }
  function getRoot2(ele) {
    return ele?.getRootNode?.();
  }
  function getShadowRoot2(ele) {
    const root = getRoot2(ele);
    return typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : null;
  }
  var warned2 = {};
  function warningOnce2(valid, message) {
    if (valid || warned2[message]) {
      return;
    }
    if (typeof console !== "undefined") {
      console.error(`Warning: ${message}`);
    }
    warned2[message] = true;
  }

  // ../../node_modules/@ant-design/icons/es/renderUtils.js
  function camelCase(input2) {
    return input2.replace(/-(.)/g, (match3, g) => g.toUpperCase());
  }
  function warning3(valid, message) {
    warningOnce2(valid, `[@ant-design/icons] ${message}`);
  }
  function isIconDefinition(target) {
    return target !== null && typeof target === "object" && typeof target.name === "string" && typeof target.theme === "string" && (typeof target.icon === "object" || typeof target.icon === "function");
  }
  function normalizeAttrs(attrs = {}) {
    return Object.keys(attrs).reduce((acc, key) => {
      const val = attrs[key];
      switch (key) {
        case "class":
          acc.className = val;
          delete acc.class;
          break;
        default:
          delete acc[key];
          acc[camelCase(key)] = val;
      }
      return acc;
    }, {});
  }
  function generate2(node2, key, rootProps) {
    if (!rootProps) {
      return /* @__PURE__ */ react_compat_default.createElement(node2.tag, {
        key,
        ...normalizeAttrs(node2.attrs)
      }, (node2.children || []).map((child, index) => generate2(child, `${key}-${node2.tag}-${index}`)));
    }
    return /* @__PURE__ */ react_compat_default.createElement(node2.tag, {
      key,
      ...normalizeAttrs(node2.attrs),
      ...rootProps
    }, (node2.children || []).map((child, index) => generate2(child, `${key}-${node2.tag}-${index}`)));
  }
  var iconStyles = `
.anticon {
  display: inline-flex;
  align-items: center;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -0.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
  vertical-align: inherit;
}

.anticon::before {
  display: none;
}

.anticon .anticon-icon {
  display: block;
}

.anticon[tabindex] {
  cursor: pointer;
}

.anticon-spin {
  -webkit-animation: loadingCircle 1s infinite linear;
  animation: loadingCircle 1s infinite linear;
}

@-webkit-keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`;
  var useInsertStyles = (eleRef) => {
    const {
      csp,
      prefixCls,
      layer,
      zeroRuntime
    } = useContext(Context_default);
    let mergedStyleStr = iconStyles;
    if (prefixCls) {
      mergedStyleStr = mergedStyleStr.replace(/anticon/g, prefixCls);
    }
    if (layer) {
      mergedStyleStr = `@layer ${layer} {
${mergedStyleStr}
}`;
    }
    useEffect(() => {
      if (zeroRuntime) {
        return;
      }
      const ele = eleRef.current;
      const shadowRoot = getShadowRoot2(ele);
      updateCSS2(mergedStyleStr, "@ant-design-icons", {
        prepend: !layer,
        csp,
        attachTo: shadowRoot
      });
    }, []);
  };

  // ../../node_modules/@ant-design/icons/es/components/IconBase.js
  var IconBase = (props) => {
    const {
      icon,
      className,
      onClick,
      style: style2,
      primaryColor: _primaryColor,
      secondaryColor: _secondaryColor,
      ...restProps
    } = props;
    const svgRef = useRef(null);
    useInsertStyles(svgRef);
    warning3(isIconDefinition(icon), `icon should be icon definiton, but got ${typeof icon}`);
    if (!isIconDefinition(icon)) {
      return null;
    }
    const target = icon;
    return generate2(target.icon, `svg-${target.name}`, {
      className,
      onClick,
      style: style2,
      "data-icon": target.name,
      width: "1em",
      height: "1em",
      fill: "currentColor",
      "aria-hidden": "true",
      ...restProps,
      ref: svgRef
    });
  };
  IconBase.displayName = "IconReact";
  var IconBase_default = IconBase;

  // ../../node_modules/@ant-design/icons/es/components/AntdIconLight.js
  function _extends2() {
    _extends2 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends2.apply(this, arguments);
  }
  var Icon = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      // affect outter <i>...</i>
      className,
      // affect inner <svg>...</svg>
      icon,
      spin,
      rotate,
      tabIndex,
      onClick,
      twoToneColor: _twoToneColor,
      // other
      ...restProps
    } = props;
    const {
      prefixCls = "anticon",
      rootClassName
    } = useContext(Context_default);
    warning3(isIconDefinition(icon), `icon should be icon definiton, but got ${typeof icon}`);
    if (!isIconDefinition(icon)) {
      return null;
    }
    const classString = clsx(rootClassName, prefixCls, {
      [`${prefixCls}-${icon.name}`]: !!icon.name,
      [`${prefixCls}-spin`]: !!spin || icon.name === "loading"
    }, className);
    let iconTabIndex = tabIndex;
    if (iconTabIndex === void 0 && onClick) {
      iconTabIndex = -1;
    }
    const svgStyle = rotate ? {
      msTransform: `rotate(${rotate}deg)`,
      transform: `rotate(${rotate}deg)`
    } : void 0;
    return /* @__PURE__ */ createElement2("span", _extends2({
      role: "img",
      "aria-label": icon.name
    }, restProps, {
      ref: ref2,
      tabIndex: iconTabIndex,
      onClick,
      className: classString
    }), /* @__PURE__ */ createElement2(IconBase_default, {
      icon,
      style: svgStyle
    }));
  });
  if (true) {
    Icon.displayName = "AntdIcon";
  }
  var AntdIconLight_default = Icon;

  // ../../node_modules/@ant-design/icons/es/icons/CheckCircleFilled.js
  function _extends3() {
    _extends3 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends3.apply(this, arguments);
  }
  var CheckCircleFilled2 = (props, ref2) => /* @__PURE__ */ createElement2(AntdIconLight_default, _extends3({}, props, {
    ref: ref2,
    icon: CheckCircleFilled_default
  }));
  var RefIcon = /* @__PURE__ */ forwardRef(CheckCircleFilled2);
  if (true) {
    RefIcon.displayName = "CheckCircleFilled";
  }
  var CheckCircleFilled_default2 = RefIcon;

  // ../../node_modules/@ant-design/icons-svg/es/asn/CloseCircleFilled.js
  var CloseCircleFilled = { "icon": { "tag": "svg", "attrs": { "fill-rule": "evenodd", "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z" } }] }, "name": "close-circle", "theme": "filled" };
  var CloseCircleFilled_default = CloseCircleFilled;

  // ../../node_modules/@ant-design/icons/es/icons/CloseCircleFilled.js
  function _extends4() {
    _extends4 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends4.apply(this, arguments);
  }
  var CloseCircleFilled2 = (props, ref2) => /* @__PURE__ */ createElement2(AntdIconLight_default, _extends4({}, props, {
    ref: ref2,
    icon: CloseCircleFilled_default
  }));
  var RefIcon2 = /* @__PURE__ */ forwardRef(CloseCircleFilled2);
  if (true) {
    RefIcon2.displayName = "CloseCircleFilled";
  }
  var CloseCircleFilled_default2 = RefIcon2;

  // ../../node_modules/@ant-design/icons-svg/es/asn/CloseOutlined.js
  var CloseOutlined = { "icon": { "tag": "svg", "attrs": { "fill-rule": "evenodd", "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z" } }] }, "name": "close", "theme": "outlined" };
  var CloseOutlined_default = CloseOutlined;

  // ../../node_modules/@ant-design/icons/es/icons/CloseOutlined.js
  function _extends5() {
    _extends5 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends5.apply(this, arguments);
  }
  var CloseOutlined2 = (props, ref2) => /* @__PURE__ */ createElement2(AntdIconLight_default, _extends5({}, props, {
    ref: ref2,
    icon: CloseOutlined_default
  }));
  var RefIcon3 = /* @__PURE__ */ forwardRef(CloseOutlined2);
  if (true) {
    RefIcon3.displayName = "CloseOutlined";
  }
  var CloseOutlined_default2 = RefIcon3;

  // ../../node_modules/@ant-design/icons-svg/es/asn/ExclamationCircleFilled.js
  var ExclamationCircleFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" } }] }, "name": "exclamation-circle", "theme": "filled" };
  var ExclamationCircleFilled_default = ExclamationCircleFilled;

  // ../../node_modules/@ant-design/icons/es/icons/ExclamationCircleFilled.js
  function _extends6() {
    _extends6 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends6.apply(this, arguments);
  }
  var ExclamationCircleFilled2 = (props, ref2) => /* @__PURE__ */ createElement2(AntdIconLight_default, _extends6({}, props, {
    ref: ref2,
    icon: ExclamationCircleFilled_default
  }));
  var RefIcon4 = /* @__PURE__ */ forwardRef(ExclamationCircleFilled2);
  if (true) {
    RefIcon4.displayName = "ExclamationCircleFilled";
  }
  var ExclamationCircleFilled_default2 = RefIcon4;

  // ../../node_modules/@ant-design/icons-svg/es/asn/InfoCircleFilled.js
  var InfoCircleFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" } }] }, "name": "info-circle", "theme": "filled" };
  var InfoCircleFilled_default = InfoCircleFilled;

  // ../../node_modules/@ant-design/icons/es/icons/InfoCircleFilled.js
  function _extends7() {
    _extends7 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends7.apply(this, arguments);
  }
  var InfoCircleFilled2 = (props, ref2) => /* @__PURE__ */ createElement2(AntdIconLight_default, _extends7({}, props, {
    ref: ref2,
    icon: InfoCircleFilled_default
  }));
  var RefIcon5 = /* @__PURE__ */ forwardRef(InfoCircleFilled2);
  if (true) {
    RefIcon5.displayName = "InfoCircleFilled";
  }
  var InfoCircleFilled_default2 = RefIcon5;

  // ../../node_modules/@rc-component/motion/es/context.js
  var Context = /* @__PURE__ */ createContext({});
  var MotionProvider = (props) => {
    const {
      children,
      ...rest
    } = props;
    const memoizedValue = useMemo(() => {
      return {
        motion: rest.motion
      };
    }, [rest.motion]);
    return /* @__PURE__ */ createElement2(Context.Provider, {
      value: memoizedValue
    }, children);
  };
  var context_default = MotionProvider;

  // ../../node_modules/@rc-component/motion/es/interface.js
  var STATUS_NONE = "none";
  var STATUS_APPEAR = "appear";
  var STATUS_ENTER = "enter";
  var STATUS_LEAVE = "leave";
  var STEP_NONE = "none";
  var STEP_PREPARE = "prepare";
  var STEP_START = "start";
  var STEP_ACTIVE = "active";
  var STEP_ACTIVATED = "end";
  var STEP_PREPARED = "prepared";

  // ../../node_modules/@rc-component/motion/es/util/motion.js
  function makePrefixMap(styleProp, eventName) {
    const prefixes = {};
    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
    prefixes[`Webkit${styleProp}`] = `webkit${eventName}`;
    prefixes[`Moz${styleProp}`] = `moz${eventName}`;
    prefixes[`ms${styleProp}`] = `MS${eventName}`;
    prefixes[`O${styleProp}`] = `o${eventName.toLowerCase()}`;
    return prefixes;
  }
  function getVendorPrefixes(domSupport, win) {
    const prefixes = {
      animationend: makePrefixMap("Animation", "AnimationEnd"),
      transitionend: makePrefixMap("Transition", "TransitionEnd")
    };
    if (domSupport) {
      if (!("AnimationEvent" in win)) {
        delete prefixes.animationend.animation;
      }
      if (!("TransitionEvent" in win)) {
        delete prefixes.transitionend.transition;
      }
    }
    return prefixes;
  }
  var vendorPrefixes = getVendorPrefixes(canUseDom(), typeof window !== "undefined" ? window : {});
  var style = {};
  if (canUseDom()) {
    ({
      style
    } = document.createElement("div"));
  }
  var prefixedEventNames = {};
  function getVendorPrefixedEventName(eventName) {
    if (prefixedEventNames[eventName]) {
      return prefixedEventNames[eventName];
    }
    const prefixMap = vendorPrefixes[eventName];
    if (prefixMap) {
      const stylePropList = Object.keys(prefixMap);
      const len = stylePropList.length;
      for (let i = 0; i < len; i += 1) {
        const styleProp = stylePropList[i];
        if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
          prefixedEventNames[eventName] = prefixMap[styleProp];
          return prefixedEventNames[eventName];
        }
      }
    }
    return "";
  }
  var internalAnimationEndName = getVendorPrefixedEventName("animationend");
  var internalTransitionEndName = getVendorPrefixedEventName("transitionend");
  var supportTransition = !!(internalAnimationEndName && internalTransitionEndName);
  var animationEndName = internalAnimationEndName || "animationend";
  var transitionEndName = internalTransitionEndName || "transitionend";
  function getTransitionName(transitionName, transitionType) {
    if (!transitionName) return null;
    if (typeof transitionName === "object") {
      const type = transitionType.replace(/-\w/g, (match3) => match3[1].toUpperCase());
      return transitionName[type];
    }
    return `${transitionName}-${transitionType}`;
  }

  // ../../node_modules/@rc-component/motion/es/hooks/useDomMotionEvents.js
  var useDomMotionEvents_default = (onInternalMotionEnd) => {
    const cacheElementRef = useRef();
    function removeMotionEvents(element) {
      if (element) {
        element.removeEventListener(transitionEndName, onInternalMotionEnd);
        element.removeEventListener(animationEndName, onInternalMotionEnd);
      }
    }
    function patchMotionEvents(element) {
      if (cacheElementRef.current && cacheElementRef.current !== element) {
        removeMotionEvents(cacheElementRef.current);
      }
      if (element && element !== cacheElementRef.current) {
        element.addEventListener(transitionEndName, onInternalMotionEnd);
        element.addEventListener(animationEndName, onInternalMotionEnd);
        cacheElementRef.current = element;
      }
    }
    useEffect(() => () => {
      removeMotionEvents(cacheElementRef.current);
      cacheElementRef.current = null;
    }, []);
    return [patchMotionEvents, removeMotionEvents];
  };

  // ../../node_modules/@rc-component/motion/es/hooks/useIsomorphicLayoutEffect.js
  var useIsomorphicLayoutEffect = canUseDom() ? useLayoutEffect : useEffect;
  var useIsomorphicLayoutEffect_default = useIsomorphicLayoutEffect;

  // ../../node_modules/@rc-component/motion/es/hooks/useNextFrame.js
  var useNextFrame_default = () => {
    const nextFrameRef = useRef(null);
    function cancelNextFrame() {
      raf_default.cancel(nextFrameRef.current);
    }
    function nextFrame(callback, delay = 2) {
      cancelNextFrame();
      const nextFrameId = raf_default(() => {
        if (delay <= 1) {
          callback({
            isCanceled: () => nextFrameId !== nextFrameRef.current
          });
        } else {
          nextFrame(callback, delay - 1);
        }
      });
      nextFrameRef.current = nextFrameId;
    }
    useEffect(() => () => {
      cancelNextFrame();
    }, []);
    return [nextFrame, cancelNextFrame];
  };

  // ../../node_modules/@rc-component/motion/es/hooks/useStepQueue.js
  var FULL_STEP_QUEUE = [STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED];
  var SIMPLE_STEP_QUEUE = [STEP_PREPARE, STEP_PREPARED];
  var SkipStep = false;
  var DoStep = true;
  function isActive(step) {
    return step === STEP_ACTIVE || step === STEP_ACTIVATED;
  }
  var useStepQueue_default = (status, prepareOnly, callback) => {
    const [step, setStep] = useState_default(STEP_NONE);
    const [nextFrame, cancelNextFrame] = useNextFrame_default();
    function startQueue() {
      setStep(STEP_PREPARE, true);
    }
    const STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE;
    useIsomorphicLayoutEffect_default(() => {
      if (step !== STEP_NONE && step !== STEP_ACTIVATED) {
        const index = STEP_QUEUE.indexOf(step);
        const nextStep = STEP_QUEUE[index + 1];
        const result = callback(step);
        if (result === SkipStep) {
          setStep(nextStep, true);
        } else if (nextStep) {
          nextFrame((info) => {
            function doNext() {
              if (info.isCanceled()) return;
              setStep(nextStep, true);
            }
            if (result === true) {
              doNext();
            } else {
              Promise.resolve(result).then(doNext);
            }
          });
        }
      }
    }, [status, step]);
    useEffect(() => () => {
      cancelNextFrame();
    }, []);
    return [startQueue, step];
  };

  // ../../node_modules/@rc-component/motion/es/hooks/useStatus.js
  function useStatus(supportMotion, visible, getElement, {
    motionEnter = true,
    motionAppear = true,
    motionLeave = true,
    motionDeadline,
    motionLeaveImmediately,
    onAppearPrepare,
    onEnterPrepare,
    onLeavePrepare,
    onAppearStart,
    onEnterStart,
    onLeaveStart,
    onAppearActive,
    onEnterActive,
    onLeaveActive,
    onAppearEnd,
    onEnterEnd,
    onLeaveEnd,
    onVisibleChanged
  }) {
    const [asyncVisible, setAsyncVisible] = useState();
    const [getStatus, setStatus] = useSyncState_default(STATUS_NONE);
    const [style2, setStyle] = useState([null, null]);
    const currentStatus = getStatus();
    const mountedRef = useRef(false);
    const deadlineRef = useRef(null);
    function getDomElement() {
      return getElement();
    }
    const activeRef = useRef(false);
    function updateMotionEndStatus() {
      setStatus(STATUS_NONE);
      setStyle([null, null]);
    }
    const onInternalMotionEnd = useEvent_default((event) => {
      const status = getStatus();
      if (status === STATUS_NONE) {
        return;
      }
      const element = getDomElement();
      if (event && !event.deadline && event.target !== element) {
        return;
      }
      const currentActive = activeRef.current;
      let canEnd;
      if (status === STATUS_APPEAR && currentActive) {
        canEnd = onAppearEnd?.(element, event);
      } else if (status === STATUS_ENTER && currentActive) {
        canEnd = onEnterEnd?.(element, event);
      } else if (status === STATUS_LEAVE && currentActive) {
        canEnd = onLeaveEnd?.(element, event);
      }
      if (currentActive && canEnd !== false) {
        updateMotionEndStatus();
      }
    });
    const [patchMotionEvents] = useDomMotionEvents_default(onInternalMotionEnd);
    const getEventHandlers = (targetStatus) => {
      switch (targetStatus) {
        case STATUS_APPEAR:
          return {
            [STEP_PREPARE]: onAppearPrepare,
            [STEP_START]: onAppearStart,
            [STEP_ACTIVE]: onAppearActive
          };
        case STATUS_ENTER:
          return {
            [STEP_PREPARE]: onEnterPrepare,
            [STEP_START]: onEnterStart,
            [STEP_ACTIVE]: onEnterActive
          };
        case STATUS_LEAVE:
          return {
            [STEP_PREPARE]: onLeavePrepare,
            [STEP_START]: onLeaveStart,
            [STEP_ACTIVE]: onLeaveActive
          };
        default:
          return {};
      }
    };
    const eventHandlers = useMemo(() => getEventHandlers(currentStatus), [currentStatus]);
    const [startStep, step] = useStepQueue_default(currentStatus, !supportMotion, (newStep) => {
      if (newStep === STEP_PREPARE) {
        const onPrepare = eventHandlers[STEP_PREPARE];
        if (!onPrepare) {
          return SkipStep;
        }
        return onPrepare(getDomElement());
      }
      if (newStep in eventHandlers) {
        setStyle([eventHandlers[newStep]?.(getDomElement(), null) || null, newStep]);
      }
      if (newStep === STEP_ACTIVE && currentStatus !== STATUS_NONE) {
        patchMotionEvents(getDomElement());
        if (motionDeadline > 0) {
          clearTimeout(deadlineRef.current);
          deadlineRef.current = setTimeout(() => {
            onInternalMotionEnd({
              deadline: true
            });
          }, motionDeadline);
        }
      }
      if (newStep === STEP_PREPARED) {
        updateMotionEndStatus();
      }
      return DoStep;
    });
    const active = isActive(step);
    activeRef.current = active;
    const visibleRef = useRef(null);
    useIsomorphicLayoutEffect_default(() => {
      if (mountedRef.current && visibleRef.current === visible) {
        return;
      }
      setAsyncVisible(visible);
      const isMounted = mountedRef.current;
      mountedRef.current = true;
      let nextStatus;
      if (!isMounted && visible && motionAppear) {
        nextStatus = STATUS_APPEAR;
      }
      if (isMounted && visible && motionEnter) {
        nextStatus = STATUS_ENTER;
      }
      if (isMounted && !visible && motionLeave || !isMounted && motionLeaveImmediately && !visible && motionLeave) {
        nextStatus = STATUS_LEAVE;
      }
      const nextEventHandlers = getEventHandlers(nextStatus);
      if (nextStatus && (supportMotion || nextEventHandlers[STEP_PREPARE])) {
        setStatus(nextStatus);
        startStep();
      } else {
        setStatus(STATUS_NONE);
      }
      visibleRef.current = visible;
    }, [visible]);
    useEffect(() => {
      if (
        // Cancel appear
        currentStatus === STATUS_APPEAR && !motionAppear || // Cancel enter
        currentStatus === STATUS_ENTER && !motionEnter || // Cancel leave
        currentStatus === STATUS_LEAVE && !motionLeave
      ) {
        setStatus(STATUS_NONE);
      }
    }, [motionAppear, motionEnter, motionLeave]);
    useEffect(() => () => {
      mountedRef.current = false;
      clearTimeout(deadlineRef.current);
    }, []);
    const firstMountChangeRef = useRef(false);
    useEffect(() => {
      if (asyncVisible) {
        firstMountChangeRef.current = true;
      }
      if (asyncVisible !== void 0 && currentStatus === STATUS_NONE) {
        if (firstMountChangeRef.current || asyncVisible) {
          onVisibleChanged?.(asyncVisible);
        }
        firstMountChangeRef.current = true;
      }
    }, [asyncVisible, currentStatus]);
    let mergedStyle = style2[0];
    if (eventHandlers[STEP_PREPARE] && step === STEP_START) {
      mergedStyle = {
        transition: "none",
        ...mergedStyle
      };
    }
    const styleStep = style2[1];
    return [
      getStatus,
      step,
      mergedStyle,
      asyncVisible ?? visible,
      // Appear Check
      !mountedRef.current && currentStatus === STATUS_NONE && supportMotion && motionAppear ? "NONE" : (
        // Enter or Leave check
        step === STEP_START || step === STEP_ACTIVE ? styleStep === step : true
      )
    ];
  }

  // ../../node_modules/@rc-component/motion/es/CSSMotion.js
  function isRefNotConsumed(children) {
    return children?.length < 2;
  }
  function genCSSMotion(config) {
    let transitionSupport = config;
    if (typeof config === "object") {
      ({
        transitionSupport
      } = config);
    }
    function isSupportTransition(props, contextMotion) {
      return !!(props.motionName && transitionSupport && contextMotion !== false);
    }
    const CSSMotion = /* @__PURE__ */ forwardRef((props, ref2) => {
      const {
        // Default config
        visible = true,
        removeOnLeave = true,
        forceRender,
        children,
        motionName,
        leavedClassName,
        eventProps
      } = props;
      const {
        motion: contextMotion
      } = useContext(Context);
      const supportMotion = isSupportTransition(props, contextMotion);
      const nodeRef = useRef();
      function getDomElement() {
        return getDOM(nodeRef.current);
      }
      const [getStatus, statusStep, statusStyle, mergedVisible, styleReady] = useStatus(supportMotion, visible, getDomElement, props);
      const status = getStatus();
      const renderedRef = useRef(mergedVisible);
      if (mergedVisible) {
        renderedRef.current = true;
      }
      const refObj = useMemo(() => {
        const obj = {};
        Object.defineProperties(obj, {
          nativeElement: {
            enumerable: true,
            get: getDomElement
          },
          inMotion: {
            enumerable: true,
            get: () => () => getStatus() !== STATUS_NONE
          },
          enableMotion: {
            enumerable: true,
            get: () => () => supportMotion
          }
        });
        return obj;
      }, []);
      useImperativeHandle(ref2, () => refObj, []);
      const idRef = useRef(0);
      if (styleReady) {
        idRef.current += 1;
      }
      const returnNode = useMemo(() => {
        if (styleReady === "NONE") {
          return null;
        }
        let motionChildren;
        const mergedProps = {
          ...eventProps,
          visible
        };
        if (!children) {
          motionChildren = null;
        } else if (status === STATUS_NONE) {
          if (mergedVisible) {
            motionChildren = children({
              ...mergedProps
            }, nodeRef);
          } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
            motionChildren = children({
              ...mergedProps,
              className: leavedClassName
            }, nodeRef);
          } else if (forceRender || !removeOnLeave && !leavedClassName) {
            motionChildren = children({
              ...mergedProps,
              style: {
                display: "none"
              }
            }, nodeRef);
          } else {
            motionChildren = null;
          }
        } else {
          let statusSuffix;
          if (statusStep === STEP_PREPARE) {
            statusSuffix = "prepare";
          } else if (isActive(statusStep)) {
            statusSuffix = "active";
          } else if (statusStep === STEP_START) {
            statusSuffix = "start";
          }
          const motionCls = getTransitionName(motionName, `${status}-${statusSuffix}`);
          motionChildren = children({
            ...mergedProps,
            className: clsx(getTransitionName(motionName, status), {
              [motionCls]: motionCls && statusSuffix,
              [motionName]: typeof motionName === "string"
            }),
            style: statusStyle
          }, nodeRef);
        }
        return motionChildren;
      }, [idRef.current]);
      if (isRefNotConsumed(children) && supportNodeRef(returnNode)) {
        const originNodeRef = getNodeRef(returnNode);
        if (originNodeRef !== nodeRef) {
          return /* @__PURE__ */ cloneElement(returnNode, {
            ref: composeRef(originNodeRef, nodeRef)
          });
        }
      }
      return returnNode;
    });
    CSSMotion.displayName = "CSSMotion";
    return CSSMotion;
  }
  var CSSMotion_default = genCSSMotion(supportTransition);

  // ../../node_modules/@rc-component/motion/es/util/diff.js
  var STATUS_ADD = "add";
  var STATUS_KEEP = "keep";
  var STATUS_REMOVE = "remove";
  var STATUS_REMOVED = "removed";
  function wrapKeyToObject(key) {
    let keyObj;
    if (key && typeof key === "object" && "key" in key) {
      keyObj = key;
    } else {
      keyObj = {
        key
      };
    }
    return {
      ...keyObj,
      key: String(keyObj.key)
    };
  }
  function parseKeys(keys2 = []) {
    return keys2.map(wrapKeyToObject);
  }
  function diffKeys(prevKeys = [], currentKeys = []) {
    let list2 = [];
    let currentIndex = 0;
    const currentLen = currentKeys.length;
    const prevKeyObjects = parseKeys(prevKeys);
    const currentKeyObjects = parseKeys(currentKeys);
    prevKeyObjects.forEach((keyObj) => {
      let hit = false;
      for (let i = currentIndex; i < currentLen; i += 1) {
        const currentKeyObj = currentKeyObjects[i];
        if (currentKeyObj.key === keyObj.key) {
          if (currentIndex < i) {
            list2 = list2.concat(currentKeyObjects.slice(currentIndex, i).map((obj) => ({
              ...obj,
              status: STATUS_ADD
            })));
            currentIndex = i;
          }
          list2.push({
            ...currentKeyObj,
            status: STATUS_KEEP
          });
          currentIndex += 1;
          hit = true;
          break;
        }
      }
      if (!hit) {
        list2.push({
          ...keyObj,
          status: STATUS_REMOVE
        });
      }
    });
    if (currentIndex < currentLen) {
      list2 = list2.concat(currentKeyObjects.slice(currentIndex).map((obj) => ({
        ...obj,
        status: STATUS_ADD
      })));
    }
    const keys2 = {};
    list2.forEach(({
      key
    }) => {
      keys2[key] = (keys2[key] || 0) + 1;
    });
    const duplicatedKeys = Object.keys(keys2).filter((key) => keys2[key] > 1);
    duplicatedKeys.forEach((matchKey) => {
      list2 = list2.filter(({
        key,
        status
      }) => key !== matchKey || status !== STATUS_REMOVE);
      list2.forEach((node2) => {
        if (node2.key === matchKey) {
          node2.status = STATUS_KEEP;
        }
      });
    });
    return list2;
  }

  // ../../node_modules/@rc-component/motion/es/CSSMotionList.js
  function _extends8() {
    _extends8 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends8.apply(this, arguments);
  }
  var MOTION_PROP_NAMES = ["eventProps", "visible", "children", "motionName", "motionAppear", "motionEnter", "motionLeave", "motionLeaveImmediately", "motionDeadline", "removeOnLeave", "leavedClassName", "onAppearPrepare", "onAppearStart", "onAppearActive", "onAppearEnd", "onEnterStart", "onEnterActive", "onEnterEnd", "onLeaveStart", "onLeaveActive", "onLeaveEnd"];
  function genCSSMotionList(transitionSupport, CSSMotion = CSSMotion_default) {
    class CSSMotionList extends Component {
      constructor() {
        super(...arguments);
        __publicField(this, "state", {
          keyEntities: []
        });
        // ZombieJ: Return the count of rest keys. It's safe to refactor if need more info.
        __publicField(this, "removeKey", (removeKey) => {
          this.setState((prevState) => {
            const nextKeyEntities = prevState.keyEntities.map((entity) => {
              if (entity.key !== removeKey) return entity;
              return {
                ...entity,
                status: STATUS_REMOVED
              };
            });
            return {
              keyEntities: nextKeyEntities
            };
          }, () => {
            const {
              keyEntities
            } = this.state;
            const restKeysCount = keyEntities.filter(({
              status
            }) => status !== STATUS_REMOVED).length;
            if (restKeysCount === 0 && this.props.onAllRemoved) {
              this.props.onAllRemoved();
            }
          });
        });
      }
      static getDerivedStateFromProps({
        keys: keys2
      }, {
        keyEntities
      }) {
        const parsedKeyObjects = parseKeys(keys2);
        const mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);
        return {
          keyEntities: mixedKeyEntities.filter((entity) => {
            const prevEntity = keyEntities.find(({
              key
            }) => entity.key === key);
            if (prevEntity && prevEntity.status === STATUS_REMOVED && entity.status === STATUS_REMOVE) {
              return false;
            }
            return true;
          })
        };
      }
      render() {
        const {
          keyEntities
        } = this.state;
        const {
          component,
          children,
          onVisibleChanged,
          onAllRemoved,
          ...restProps
        } = this.props;
        const Component2 = component || Fragment;
        const motionProps = {};
        MOTION_PROP_NAMES.forEach((prop) => {
          motionProps[prop] = restProps[prop];
          delete restProps[prop];
        });
        delete restProps.keys;
        return /* @__PURE__ */ createElement2(Component2, restProps, keyEntities.map(({
          status,
          ...eventProps
        }, index) => {
          const visible = status === STATUS_ADD || status === STATUS_KEEP;
          return /* @__PURE__ */ createElement2(CSSMotion, _extends8({}, motionProps, {
            key: eventProps.key,
            visible,
            eventProps,
            onVisibleChanged: (changedVisible) => {
              onVisibleChanged?.(changedVisible, {
                key: eventProps.key
              });
              if (!changedVisible) {
                this.removeKey(eventProps.key);
              }
            }
          }), isRefNotConsumed(children) ? (props) => children({
            ...props,
            index
          }) : (props, ref2) => children({
            ...props,
            index
          }, ref2));
        }));
      }
    }
    __publicField(CSSMotionList, "defaultProps", {
      component: "div"
    });
    return CSSMotionList;
  }
  var CSSMotionList_default = genCSSMotionList(supportTransition);

  // ../../node_modules/@rc-component/motion/es/index.js
  var es_default2 = CSSMotion_default;

  // ../../node_modules/antd/es/_util/is.js
  var isNumber = (val) => {
    return typeof val === "number" && !Number.isNaN(val);
  };
  var isString = (val) => {
    return typeof val === "string";
  };
  var isPlainObject = (val) => {
    return val !== null && typeof val === "object";
  };
  var isFunction = (val) => {
    return typeof val === "function";
  };
  var isTransitionEvent = (event) => {
    return isPlainObject(event) && "propertyName" in event && isString(event.propertyName);
  };

  // ../../node_modules/antd/es/_util/hooks/useMergeSemantic/utils.js
  var fillObjectBySchema = (obj, schema) => {
    const newObj = {
      ...obj
    };
    Object.keys(schema).forEach((key) => {
      if (schema[key]._default) {
        newObj[key] || (newObj[key] = {});
      } else {
        newObj[key] = fillObjectBySchema(newObj[key], schema[key]);
      }
    });
    return newObj;
  };

  // ../../node_modules/antd/es/_util/hooks/useMergeSemantic/index.js
  var mergeClassNames = (schema = {}, ...classNames2) => {
    return classNames2.filter((item) => Boolean(item)).reduce((acc, cur) => {
      Object.keys(cur).forEach((key) => {
        const keySchema = schema[key];
        const curVal = cur[key];
        if (keySchema) {
          if (isPlainObject(curVal)) {
            acc[key] = mergeClassNames(keySchema, acc[key], curVal);
          } else {
            const {
              _default: defaultField
            } = keySchema;
            if (defaultField) {
              acc[key] = acc[key] || {};
              acc[key][defaultField] = clsx(acc[key][defaultField], curVal);
            }
          }
        } else {
          acc[key] = clsx(acc[key], curVal);
        }
      });
      return acc;
    }, {});
  };
  var useSemanticClassNames = (schema, ...classNames2) => {
    return useMemo(() => mergeClassNames.apply(void 0, [schema].concat(classNames2)), [schema].concat(classNames2));
  };
  var mergeStyles = (...styles) => {
    return styles.filter((item) => Boolean(item)).reduce((acc, cur = {}) => {
      Object.keys(cur).forEach((key) => {
        acc[key] = {
          ...acc[key],
          ...cur[key]
        };
      });
      return acc;
    }, {});
  };
  var useSemanticStyles = (...styles) => {
    return useMemo(() => mergeStyles.apply(void 0, styles), [].concat(styles));
  };
  var useSemanticRootStyle = (style2, key = "root") => {
    return useMemo(() => style2 ? {
      [key]: style2
    } : void 0, [style2, key]);
  };
  var resolveStyleOrClass = (value, info) => {
    return isFunction(value) ? value(info) : value;
  };
  var useMergeSemantic = (classNamesList, stylesList, info, schema) => {
    const resolvedClassNamesList = classNamesList.map((classNames2) => classNames2 ? resolveStyleOrClass(classNames2, info) : void 0);
    const resolvedStylesList = stylesList.map((styles) => styles ? resolveStyleOrClass(styles, info) : void 0);
    const mergedClassNames = useSemanticClassNames.apply(void 0, [schema].concat(_toConsumableArray(resolvedClassNamesList)));
    const mergedStyles = useSemanticStyles.apply(void 0, _toConsumableArray(resolvedStylesList));
    return useMemo(() => {
      if (!schema) {
        return [mergedClassNames, mergedStyles];
      }
      return [fillObjectBySchema(mergedClassNames, schema), fillObjectBySchema(mergedStyles, schema)];
    }, [mergedClassNames, mergedStyles, schema]);
  };

  // ../../node_modules/antd/es/alert/style/index.js
  var genAlertTypeStyle = (bgColor, iconColor, alertCls) => ({
    background: bgColor,
    [`${alertCls}-icon`]: {
      color: iconColor
    }
  });
  var genBaseStyle = (token2) => {
    const {
      componentCls,
      motionDurationSlow: duration,
      marginXS,
      marginSM,
      fontSize,
      fontSizeLG,
      lineHeight,
      motionEaseInOutCirc,
      borderRadius,
      withDescriptionIconSize,
      colorText,
      colorTextHeading,
      withDescriptionPadding,
      defaultPadding,
      lineWidth,
      lineType,
      colorSuccessBorder,
      colorWarningBorder,
      colorErrorBorder,
      colorInfoBorder
    } = token2;
    return {
      [componentCls]: {
        ...resetComponent(token2),
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: defaultPadding,
        wordWrap: "break-word",
        borderRadius,
        borderWidth: unit(lineWidth),
        borderStyle: lineType,
        [`&${componentCls}-success`]: {
          borderColor: colorSuccessBorder
        },
        [`&${componentCls}-info`]: {
          borderColor: colorInfoBorder
        },
        [`&${componentCls}-warning`]: {
          borderColor: colorWarningBorder
        },
        [`&${componentCls}-error`]: {
          borderColor: colorErrorBorder
        },
        [`&${componentCls}-filled`]: {
          borderColor: "transparent"
        },
        [`&${componentCls}-rtl`]: {
          direction: "rtl"
        },
        [`${componentCls}-section`]: {
          flex: 1,
          minWidth: 0
        },
        [`${componentCls}-icon`]: {
          marginInlineEnd: marginXS,
          lineHeight: 0
        },
        "&-description": {
          display: "none",
          fontSize,
          lineHeight
        },
        "&-title": {
          color: colorTextHeading
        },
        [`&${componentCls}-motion-leave`]: {
          overflow: "hidden",
          opacity: 1,
          transition: [`max-height`, `opacity`, `padding-top`, `padding-bottom`, `margin-bottom`].map((prop) => `${prop} ${duration} ${motionEaseInOutCirc}`).join(", ")
        },
        [`&${componentCls}-motion-leave-active`]: {
          maxHeight: 0,
          marginBottom: "0 !important",
          paddingTop: 0,
          paddingBottom: 0,
          opacity: 0
        },
        [`&${componentCls}-with-description`]: {
          alignItems: "flex-start",
          padding: withDescriptionPadding,
          [`${componentCls}-icon`]: {
            marginInlineEnd: marginSM,
            fontSize: withDescriptionIconSize,
            lineHeight: 0
          },
          [`${componentCls}-title`]: {
            display: "block",
            marginBottom: marginXS,
            color: colorTextHeading,
            fontSize: fontSizeLG
          },
          [`${componentCls}-description`]: {
            display: "block",
            color: colorText
          }
        },
        [`&${componentCls}-banner`]: {
          marginBottom: 0,
          border: "0 !important",
          borderRadius: 0
        }
      }
    };
  };
  var genTypeStyle = (token2) => {
    const {
      componentCls,
      colorSuccess,
      colorSuccessBg,
      colorWarning,
      colorWarningBg,
      colorError,
      colorErrorBg,
      colorInfo,
      colorInfoBg
    } = token2;
    return {
      [componentCls]: {
        "&-success": genAlertTypeStyle(colorSuccessBg, colorSuccess, componentCls),
        "&-info": genAlertTypeStyle(colorInfoBg, colorInfo, componentCls),
        "&-warning": genAlertTypeStyle(colorWarningBg, colorWarning, componentCls),
        "&-error": {
          ...genAlertTypeStyle(colorErrorBg, colorError, componentCls),
          [`${componentCls}-description > pre`]: {
            margin: 0,
            padding: 0
          }
        }
      }
    };
  };
  var genActionStyle = (token2) => {
    const {
      componentCls,
      iconCls,
      motionDurationMid,
      marginXS,
      fontSizeIcon,
      colorIcon,
      colorIconHover,
      colorTextDisabled
    } = token2;
    return {
      [componentCls]: {
        [`${componentCls}-actions`]: {
          marginInlineStart: marginXS
        },
        [`${componentCls}-close-icon`]: {
          marginInlineStart: marginXS,
          padding: 0,
          overflow: "hidden",
          fontSize: fontSizeIcon,
          lineHeight: unit(fontSizeIcon),
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          ...genFocusStyle(token2),
          [`${iconCls}-close`]: {
            color: colorIcon,
            transition: `color ${motionDurationMid}`,
            "&:hover": {
              color: colorIconHover
            }
          },
          "&:disabled": {
            cursor: "not-allowed",
            color: colorTextDisabled,
            [`${iconCls}-close`]: {
              color: "inherit",
              pointerEvents: "none"
            }
          }
        }
      }
    };
  };
  var prepareComponentToken = (token2) => {
    const paddingHorizontal = 12;
    return {
      borderRadius: token2.borderRadiusLG,
      withDescriptionIconSize: token2.fontSizeHeading3,
      defaultPadding: `${token2.paddingContentVerticalSM}px ${paddingHorizontal}px`,
      withDescriptionPadding: `${token2.paddingMD}px ${token2.paddingContentHorizontalLG}px`
    };
  };
  var style_default = genStyleHooks("Alert", (token2) => [genBaseStyle(token2), genTypeStyle(token2), genActionStyle(token2)], prepareComponentToken);

  // ../../node_modules/antd/es/alert/Alert.js
  var IconNode = (props) => {
    const {
      icon,
      type,
      className,
      style: style2,
      successIcon,
      infoIcon,
      warningIcon,
      errorIcon
    } = props;
    const iconMapFilled = {
      success: successIcon ?? /* @__PURE__ */ createElement2(CheckCircleFilled_default2, null),
      info: infoIcon ?? /* @__PURE__ */ createElement2(InfoCircleFilled_default2, null),
      error: errorIcon ?? /* @__PURE__ */ createElement2(CloseCircleFilled_default2, null),
      warning: warningIcon ?? /* @__PURE__ */ createElement2(ExclamationCircleFilled_default2, null)
    };
    return /* @__PURE__ */ createElement2("span", {
      className,
      style: style2
    }, icon ?? iconMapFilled[type]);
  };
  var CloseIconNode = (props) => {
    const {
      isClosable,
      disabled,
      prefixCls,
      closeIcon,
      handleClose,
      ariaProps,
      className,
      style: style2
    } = props;
    const mergedCloseIcon = closeIcon === true || closeIcon === void 0 ? /* @__PURE__ */ createElement2(CloseOutlined_default2, null) : closeIcon;
    return isClosable ? /* @__PURE__ */ createElement2("button", {
      type: "button",
      disabled,
      onClick: handleClose,
      className: clsx(`${prefixCls}-close-icon`, className),
      style: style2,
      ...ariaProps
    }, mergedCloseIcon) : null;
  };
  var Alert = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      description,
      prefixCls: customizePrefixCls,
      message,
      title,
      banner,
      className,
      rootClassName,
      style: style2,
      onMouseEnter,
      onMouseLeave,
      onClick,
      afterClose,
      showIcon,
      closable,
      closeText,
      closeIcon,
      action,
      id,
      styles,
      classNames: classNames2,
      ...otherProps
    } = props;
    const mergedTitle = title ?? message;
    const [closed, setClosed] = useState(false);
    if (true) {
      const warning4 = devUseWarning("Alert");
      [["closeText", "closable.closeIcon"], ["message", "title"]].forEach(([deprecatedName, newName]) => {
        warning4.deprecated(!(deprecatedName in props), deprecatedName, newName);
      });
    }
    const internalRef = useRef(null);
    useImperativeHandle(ref2, () => ({
      nativeElement: internalRef.current
    }));
    const {
      getPrefixCls,
      direction,
      variant: contextVariant,
      closable: contextClosable,
      closeIcon: contextCloseIcon,
      className: contextClassName,
      style: contextStyle,
      classNames: contextClassNames,
      styles: contextStyles,
      successIcon,
      infoIcon,
      warningIcon,
      errorIcon
    } = useComponentConfig("alert");
    const prefixCls = getPrefixCls("alert", customizePrefixCls);
    const [hashId, cssVarCls] = style_default(prefixCls);
    const {
      onClose: closableOnClose,
      afterClose: closableAfterClose,
      disabled: closeBtnIsDisabled
    } = isPlainObject(closable) ? closable : {};
    const handleClose = (e) => {
      setClosed(true);
      (closableOnClose ?? props.onClose)?.(e);
    };
    const type = useMemo(() => {
      if (props.type !== void 0) {
        return props.type;
      }
      return banner ? "warning" : "info";
    }, [props.type, banner]);
    const mergedVariant = props.variant ?? contextVariant ?? "outlined";
    const isClosable = useMemo(() => {
      if (isPlainObject(closable)) {
        return true;
      }
      if (closeText) {
        return true;
      }
      if (typeof closable === "boolean") {
        return closable;
      }
      if (closeIcon !== false && isNonNullable(closeIcon)) {
        return true;
      }
      return !!contextClosable;
    }, [closeText, closeIcon, closable, contextClosable]);
    const isShowIcon = banner && showIcon === void 0 ? true : showIcon;
    const mergedProps = {
      ...props,
      prefixCls,
      variant: mergedVariant,
      type,
      showIcon: isShowIcon,
      closable: isClosable
    };
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const styleRoot = useSemanticRootStyle(style2);
    const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames2], [contextStyles, contextStyleRoot, styles, styleRoot], {
      props: mergedProps
    });
    const alertCls = clsx(prefixCls, `${prefixCls}-${type}`, `${prefixCls}-${mergedVariant}`, {
      [`${prefixCls}-with-description`]: isReactRenderable(description),
      [`${prefixCls}-no-icon`]: !isShowIcon,
      [`${prefixCls}-banner`]: !!banner,
      [`${prefixCls}-rtl`]: direction === "rtl"
    }, contextClassName, className, rootClassName, mergedClassNames.root, cssVarCls, hashId);
    const restProps = pickAttrs(otherProps, {
      aria: true,
      data: true
    });
    const mergedCloseIcon = useMemo(() => {
      if (isPlainObject(closable) && closable.closeIcon) {
        return closable.closeIcon;
      }
      if (closeText) {
        return closeText;
      }
      if (closeIcon !== void 0) {
        return closeIcon;
      }
      if (isPlainObject(contextClosable) && contextClosable.closeIcon) {
        return contextClosable.closeIcon;
      }
      return contextCloseIcon;
    }, [closeIcon, closable, contextClosable, closeText, contextCloseIcon]);
    const mergedAriaProps = useMemo(() => {
      const merged = closable ?? contextClosable;
      if (isPlainObject(merged)) {
        return pickAttrs(merged, {
          data: true,
          aria: true
        });
      }
      return {};
    }, [closable, contextClosable]);
    return /* @__PURE__ */ createElement2(es_default2, {
      visible: !closed,
      motionName: `${prefixCls}-motion`,
      motionAppear: false,
      motionEnter: false,
      onLeaveStart: (node2) => ({
        maxHeight: node2.offsetHeight
      }),
      onLeaveEnd: closableAfterClose ?? afterClose
    }, ({
      className: motionClassName,
      style: motionStyle
    }, setRef) => /* @__PURE__ */ createElement2("div", {
      id,
      ref: composeRef(internalRef, setRef),
      "data-show": !closed,
      className: clsx(alertCls, motionClassName),
      style: {
        ...mergedStyles.root,
        ...motionStyle
      },
      onMouseEnter,
      onMouseLeave,
      onClick,
      role: "alert",
      ...restProps
    }, isShowIcon ? /* @__PURE__ */ createElement2(IconNode, {
      className: clsx(`${prefixCls}-icon`, mergedClassNames.icon),
      style: mergedStyles.icon,
      icon: props.icon,
      type,
      successIcon,
      infoIcon,
      warningIcon,
      errorIcon
    }) : null, /* @__PURE__ */ createElement2("div", {
      className: clsx(`${prefixCls}-section`, mergedClassNames.section),
      style: mergedStyles.section
    }, isReactRenderable(mergedTitle) ? /* @__PURE__ */ createElement2("div", {
      className: clsx(`${prefixCls}-title`, mergedClassNames.title),
      style: mergedStyles.title
    }, mergedTitle) : null, isReactRenderable(description) ? /* @__PURE__ */ createElement2("div", {
      className: clsx(`${prefixCls}-description`, mergedClassNames.description),
      style: mergedStyles.description
    }, description) : null), isReactRenderable(action) ? /* @__PURE__ */ createElement2("div", {
      className: clsx(`${prefixCls}-actions`, mergedClassNames.actions),
      style: mergedStyles.actions
    }, action) : null, /* @__PURE__ */ createElement2(CloseIconNode, {
      className: mergedClassNames.close,
      style: mergedStyles.close,
      isClosable,
      disabled: closeBtnIsDisabled,
      prefixCls,
      closeIcon: mergedCloseIcon,
      handleClose,
      ariaProps: mergedAriaProps
    })));
  });
  if (true) {
    Alert.displayName = "Alert";
  }
  var Alert_default = Alert;

  // ../../node_modules/@babel/runtime/helpers/esm/callSuper.js
  function _callSuper(t, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
  }

  // ../../node_modules/antd/es/alert/ErrorBoundary.js
  var ErrorBoundary = /* @__PURE__ */ function(_React$PureComponent) {
    function ErrorBoundary2() {
      var _this;
      _classCallCheck(this, ErrorBoundary2);
      _this = _callSuper(this, ErrorBoundary2, arguments);
      _this.state = {
        error: void 0,
        info: {}
      };
      return _this;
    }
    _inherits(ErrorBoundary2, _React$PureComponent);
    return _createClass(ErrorBoundary2, [{
      key: "componentDidCatch",
      value: function componentDidCatch(error, info) {
        this.setState({
          error,
          info
        });
      }
    }, {
      key: "render",
      value: function render4() {
        const {
          message,
          title,
          description,
          id,
          children
        } = this.props;
        const {
          error,
          info
        } = this.state;
        const mergedTitle = title ?? message;
        const componentStack = info?.componentStack || null;
        const errorMessage = isNonNullable(mergedTitle) ? mergedTitle : error?.toString();
        const errorDescription = isNonNullable(description) ? description : componentStack;
        if (error) {
          return /* @__PURE__ */ createElement2(Alert_default, {
            id,
            type: "error",
            title: errorMessage,
            description: /* @__PURE__ */ createElement2("pre", {
              style: {
                fontSize: "0.9em",
                overflowX: "auto"
              }
            }, errorDescription)
          });
        }
        return children;
      }
    }]);
  }(PureComponent);
  var ErrorBoundary_default = ErrorBoundary;

  // ../../node_modules/antd/es/alert/index.js
  var Alert2 = Alert_default;
  Alert2.ErrorBoundary = ErrorBoundary_default;
  var alert_default = Alert2;

  // ../../node_modules/antd/es/config-provider/hooks/useCSSVarCls.js
  var useCSSVarCls = (prefixCls) => `${prefixCls}-css-var`;
  var useCSSVarCls_default = useCSSVarCls;

  // ../../node_modules/antd/es/form/validateMessagesContext.js
  var validateMessagesContext_default = /* @__PURE__ */ createContext(void 0);

  // ../../node_modules/@rc-component/pagination/es/locale/en_US.js
  var locale = {
    // Options
    items_per_page: "/ page",
    jump_to: "Go to",
    jump_to_confirm: "confirm",
    page: "Page",
    // Pagination
    prev_page: "Previous Page",
    next_page: "Next Page",
    prev_5: "Previous 5 Pages",
    next_5: "Next 5 Pages",
    prev_3: "Previous 3 Pages",
    next_3: "Next 3 Pages",
    page_size: "Page Size"
  };
  var en_US_default = locale;

  // ../../node_modules/@rc-component/picker/es/locale/common.js
  var commonLocale = {
    yearFormat: "YYYY",
    dayFormat: "D",
    cellMeridiemFormat: "A",
    monthBeforeYear: true
  };

  // ../../node_modules/@rc-component/picker/es/locale/en_US.js
  var locale2 = {
    ...commonLocale,
    locale: "en_US",
    today: "Today",
    now: "Now",
    backToToday: "Back to today",
    ok: "OK",
    clear: "Clear",
    week: "Week",
    month: "Month",
    year: "Year",
    timeSelect: "select time",
    dateSelect: "select date",
    weekSelect: "Choose a week",
    monthSelect: "Choose a month",
    yearSelect: "Choose a year",
    decadeSelect: "Choose a decade",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    previousYear: "Last year",
    nextYear: "Next year",
    previousDecade: "Last decade",
    nextDecade: "Next decade",
    previousCentury: "Last century",
    nextCentury: "Next century"
  };
  var en_US_default2 = locale2;

  // ../../node_modules/antd/es/time-picker/locale/en_US.js
  var locale3 = {
    placeholder: "Select time",
    rangePlaceholder: ["Start time", "End time"]
  };
  var en_US_default3 = locale3;

  // ../../node_modules/antd/es/date-picker/locale/en_US.js
  var locale4 = {
    lang: {
      placeholder: "Select date",
      yearPlaceholder: "Select year",
      quarterPlaceholder: "Select quarter",
      monthPlaceholder: "Select month",
      weekPlaceholder: "Select week",
      rangePlaceholder: ["Start date", "End date"],
      rangeYearPlaceholder: ["Start year", "End year"],
      rangeQuarterPlaceholder: ["Start quarter", "End quarter"],
      rangeMonthPlaceholder: ["Start month", "End month"],
      rangeWeekPlaceholder: ["Start week", "End week"],
      ...en_US_default2
    },
    timePickerLocale: {
      ...en_US_default3
    }
  };
  var en_US_default4 = locale4;

  // ../../node_modules/antd/es/calendar/locale/en_US.js
  var en_US_default5 = en_US_default4;

  // ../../node_modules/antd/es/locale/en_US.js
  var typeTemplate = "${label} is not a valid ${type}";
  var localeValues = {
    locale: "en",
    Pagination: en_US_default,
    DatePicker: en_US_default4,
    TimePicker: en_US_default3,
    Calendar: en_US_default5,
    global: {
      placeholder: "Please select",
      close: "Close",
      sortable: "sortable",
      show: "Show",
      hide: "Hide"
    },
    Table: {
      filterTitle: "Filter menu",
      filterConfirm: "OK",
      filterReset: "Reset",
      filterEmptyText: "No filters",
      filterCheckAll: "Select all items",
      filterSearchPlaceholder: "Search in filters",
      emptyText: "No data",
      selectAll: "Select current page",
      selectInvert: "Invert current page",
      selectNone: "Clear all data",
      selectionAll: "Select all data",
      sortTitle: "Sort",
      expand: "Expand row",
      collapse: "Collapse row",
      triggerDesc: "Click to sort descending",
      triggerAsc: "Click to sort ascending",
      cancelSort: "Click to cancel sorting"
    },
    Tour: {
      Next: "Next",
      Previous: "Previous",
      Finish: "Finish"
    },
    Modal: {
      okText: "OK",
      cancelText: "Cancel",
      justOkText: "OK"
    },
    Popconfirm: {
      okText: "OK",
      cancelText: "Cancel"
    },
    Transfer: {
      titles: ["", ""],
      searchPlaceholder: "Search here",
      itemUnit: "item",
      itemsUnit: "items",
      remove: "Remove",
      selectCurrent: "Select current page",
      removeCurrent: "Remove current page",
      selectAll: "Select all data",
      deselectAll: "Deselect all data",
      removeAll: "Remove all data",
      selectInvert: "Invert current page"
    },
    Upload: {
      uploading: "Uploading...",
      removeFile: "Remove file",
      uploadError: "Upload error",
      previewFile: "Preview file",
      downloadFile: "Download file"
    },
    Empty: {
      description: "No data"
    },
    Icon: {
      icon: "icon"
    },
    Text: {
      edit: "Edit",
      copy: "Copy",
      copied: "Copied",
      expand: "Expand",
      collapse: "Collapse"
    },
    Carousel: {
      prevSlide: "Previous slide",
      nextSlide: "Next slide"
    },
    Form: {
      optional: "(optional)",
      defaultValidateMessages: {
        default: "Field validation error for ${label}",
        required: "Please enter ${label}",
        enum: "${label} must be one of [${enum}]",
        whitespace: "${label} cannot be a blank character",
        date: {
          format: "${label} date format is invalid",
          parse: "${label} cannot be converted to a date",
          invalid: "${label} is an invalid date"
        },
        types: {
          string: typeTemplate,
          method: typeTemplate,
          array: typeTemplate,
          object: typeTemplate,
          number: typeTemplate,
          date: typeTemplate,
          boolean: typeTemplate,
          integer: typeTemplate,
          float: typeTemplate,
          regexp: typeTemplate,
          email: typeTemplate,
          url: typeTemplate,
          hex: typeTemplate
        },
        string: {
          len: "${label} must be ${len} characters",
          min: "${label} must be at least ${min} characters",
          max: "${label} must be up to ${max} characters",
          range: "${label} must be between ${min}-${max} characters"
        },
        number: {
          len: "${label} must be equal to ${len}",
          min: "${label} must be minimum ${min}",
          max: "${label} must be maximum ${max}",
          range: "${label} must be between ${min}-${max}"
        },
        array: {
          len: "Must be ${len} ${label}",
          min: "At least ${min} ${label}",
          max: "At most ${max} ${label}",
          range: "The amount of ${label} must be between ${min}-${max}"
        },
        pattern: {
          mismatch: "${label} does not match the pattern ${pattern}"
        }
      }
    },
    QRCode: {
      expired: "QR code expired",
      refresh: "Refresh",
      scanned: "Scanned"
    },
    ColorPicker: {
      presetEmpty: "Empty",
      transparent: "Transparent",
      singleColor: "Single",
      gradientColor: "Gradient"
    }
  };
  var en_US_default6 = localeValues;

  // ../../node_modules/antd/es/modal/locale.js
  var runtimeLocale = {
    ...en_US_default6.Modal
  };
  var localeList = [];
  var generateLocale = () => localeList.reduce((merged, locale5) => ({
    ...merged,
    ...locale5
  }), en_US_default6.Modal);
  function changeConfirmLocale(newLocale) {
    if (newLocale) {
      const cloneLocale = {
        ...newLocale
      };
      localeList.push(cloneLocale);
      runtimeLocale = generateLocale();
      return () => {
        localeList = localeList.filter((locale5) => locale5 !== cloneLocale);
        runtimeLocale = generateLocale();
      };
    }
    runtimeLocale = {
      ...en_US_default6.Modal
    };
  }

  // ../../node_modules/antd/es/locale/context.js
  var LocaleContext = /* @__PURE__ */ createContext(void 0);
  var context_default2 = LocaleContext;

  // ../../node_modules/antd/es/locale/useLocale.js
  var useLocale = (componentName, defaultLocale) => {
    const fullLocale = useContext(context_default2);
    const getLocale = useMemo(() => {
      const locale5 = defaultLocale || en_US_default6[componentName];
      const localeFromContext = fullLocale?.[componentName] ?? {};
      return {
        ...isFunction(locale5) ? locale5() : locale5,
        ...localeFromContext || {}
      };
    }, [componentName, defaultLocale, fullLocale]);
    const getLocaleCode = useMemo(() => {
      const localeCode = fullLocale?.locale;
      if (fullLocale?.exist && !localeCode) {
        return en_US_default6.locale;
      }
      return localeCode;
    }, [fullLocale]);
    return [getLocale, getLocaleCode];
  };
  var useLocale_default = useLocale;

  // ../../node_modules/antd/es/locale/index.js
  var ANT_MARK = "internalMark";
  var LocaleProvider = (props) => {
    const {
      locale: locale5 = {},
      children,
      _ANT_MARK__
    } = props;
    if (true) {
      const warning4 = devUseWarning("LocaleProvider");
      true ? warning4(_ANT_MARK__ === ANT_MARK, "deprecated", "`LocaleProvider` is deprecated. Please use `locale` with `ConfigProvider` instead: http://u.ant.design/locale") : void 0;
    }
    useEffect(() => {
      const clearLocale = changeConfirmLocale(locale5?.Modal);
      return clearLocale;
    }, [locale5]);
    const getMemoizedContextValue = useMemo(() => ({
      ...locale5,
      exist: true
    }), [locale5]);
    return /* @__PURE__ */ createElement2(context_default2.Provider, {
      value: getMemoizedContextValue
    }, children);
  };
  if (true) {
    LocaleProvider.displayName = "LocaleProvider";
  }
  var locale_default = LocaleProvider;

  // ../../node_modules/@rc-component/portal/es/Context.js
  var OrderContext = /* @__PURE__ */ createContext(null);
  var Context_default2 = OrderContext;

  // ../../node_modules/@rc-component/portal/es/mock.js
  var inline = false;
  function inlineMock(nextInline) {
    if (typeof nextInline === "boolean") {
      inline = nextInline;
    }
    return inline;
  }

  // ../../node_modules/@rc-component/portal/es/useDom.js
  var EMPTY_LIST = [];
  function useDom(render4, debug) {
    const [ele] = useState(() => {
      if (!canUseDom()) {
        return null;
      }
      const defaultEle = document.createElement("div");
      if (debug) {
        defaultEle.setAttribute("data-debug", debug);
      }
      return defaultEle;
    });
    const appendedRef = useRef(false);
    const queueCreate = useContext(Context_default2);
    const [queue, setQueue] = useState(EMPTY_LIST);
    const mergedQueueCreate = queueCreate || (appendedRef.current ? void 0 : (appendFn) => {
      setQueue((origin) => {
        const newQueue = [appendFn, ...origin];
        return newQueue;
      });
    });
    function append2() {
      if (!ele.parentElement) {
        document.body.appendChild(ele);
      }
      appendedRef.current = true;
    }
    function cleanup2() {
      ele.parentElement?.removeChild(ele);
      appendedRef.current = false;
    }
    useLayoutEffect_default(() => {
      if (render4) {
        if (queueCreate) {
          queueCreate(append2);
        } else {
          append2();
        }
      } else {
        cleanup2();
      }
      return cleanup2;
    }, [render4]);
    useLayoutEffect_default(() => {
      if (queue.length) {
        queue.forEach((appendFn) => appendFn());
        setQueue(EMPTY_LIST);
      }
    }, [queue]);
    return [ele, mergedQueueCreate];
  }

  // ../../node_modules/@rc-component/portal/es/util.js
  function isBodyOverflowing() {
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) && window.innerWidth > document.body.offsetWidth;
  }

  // ../../node_modules/@rc-component/portal/es/useScrollLocker.js
  var UNIQUE_ID = `rc-util-locker-${Date.now()}`;
  var uuid3 = 0;
  function useScrollLocker(lock) {
    const mergedLock = !!lock;
    const [id] = useState(() => {
      uuid3 += 1;
      return `${UNIQUE_ID}_${uuid3}`;
    });
    useLayoutEffect_default(() => {
      if (mergedLock) {
        const scrollbarSize = getTargetScrollBarSize(document.body).width;
        const isOverflow = isBodyOverflowing();
        updateCSS(`
html body {
  overflow-y: hidden;
  ${isOverflow ? `width: calc(100% - ${scrollbarSize}px);` : ""}
}`, id);
      } else {
        removeCSS(id);
      }
      return () => {
        removeCSS(id);
      };
    }, [mergedLock, id]);
  }

  // ../../node_modules/@rc-component/portal/es/useEscKeyDown.js
  var stack = [];
  var IME_LOCK_DURATION = 200;
  var lastCompositionEndTime = 0;
  var onGlobalKeyDown = (event) => {
    if (event.key === "Escape" && !event.isComposing) {
      const now = Date.now();
      if (now - lastCompositionEndTime < IME_LOCK_DURATION) {
        return;
      }
      const len = stack.length;
      for (let i = len - 1; i >= 0; i -= 1) {
        stack[i].onEsc({
          top: i === len - 1,
          event
        });
      }
    }
  };
  var onGlobalCompositionEnd = () => {
    lastCompositionEndTime = Date.now();
  };
  function attachGlobalEventListeners() {
    window.addEventListener("keydown", onGlobalKeyDown);
    window.addEventListener("compositionend", onGlobalCompositionEnd);
  }
  function detachGlobalEventListeners() {
    if (stack.length === 0) {
      window.removeEventListener("keydown", onGlobalKeyDown);
      window.removeEventListener("compositionend", onGlobalCompositionEnd);
    }
  }
  function useEscKeyDown(open, onEsc) {
    const id = useId_default();
    const onEventEsc = useEvent_default(onEsc);
    const ensure = () => {
      if (!stack.find((item) => item.id === id)) {
        stack.push({
          id,
          onEsc: onEventEsc
        });
      }
    };
    const clear = () => {
      stack = stack.filter((item) => item.id !== id);
    };
    useMemo(() => {
      if (open) {
        ensure();
      } else if (!open) {
        clear();
      }
    }, [open]);
    useEffect(() => {
      if (open) {
        ensure();
        attachGlobalEventListeners();
        return () => {
          clear();
          detachGlobalEventListeners();
        };
      }
    }, [open]);
  }

  // ../../node_modules/@rc-component/portal/es/Portal.js
  var getPortalContainer = (getContainer3) => {
    if (getContainer3 === false) {
      return false;
    }
    if (!canUseDom() || !getContainer3) {
      return null;
    }
    if (typeof getContainer3 === "string") {
      return document.querySelector(getContainer3);
    }
    if (typeof getContainer3 === "function") {
      return getContainer3();
    }
    return getContainer3;
  };
  var Portal = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      open,
      autoLock,
      getContainer: getContainer3,
      debug,
      autoDestroy = true,
      children,
      onEsc
    } = props;
    const [shouldRender, setShouldRender] = useState(open);
    const mergedRender = shouldRender || open;
    if (true) {
      warning_default(canUseDom() || !open, `Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.`);
    }
    useEffect(() => {
      if (autoDestroy || open) {
        setShouldRender(open);
      }
    }, [open, autoDestroy]);
    const [innerContainer, setInnerContainer] = useState(() => getPortalContainer(getContainer3));
    useEffect(() => {
      const customizeContainer = getPortalContainer(getContainer3);
      setInnerContainer(() => (
        // React do the state update even the value is the same,
        // Use function call to force React to compare update
        customizeContainer ?? null
      ));
    });
    const [defaultContainer, queueCreate] = useDom(mergedRender && !innerContainer, debug);
    const mergedContainer = innerContainer ?? defaultContainer;
    useScrollLocker(autoLock && open && canUseDom() && (mergedContainer === defaultContainer || mergedContainer === document.body));
    useEscKeyDown(open, onEsc);
    let childRef = null;
    if (children && supportRef(children) && ref2) {
      childRef = getNodeRef(children);
    }
    const mergedRef = useComposeRef(childRef, ref2);
    if (!mergedRender || !canUseDom() || innerContainer === void 0) {
      return null;
    }
    const renderInline = mergedContainer === false || inlineMock();
    let reffedChildren = children;
    if (ref2) {
      reffedChildren = /* @__PURE__ */ cloneElement(children, {
        ref: mergedRef
      });
    }
    return /* @__PURE__ */ createElement2(Context_default2.Provider, {
      value: queueCreate
    }, renderInline ? reffedChildren : /* @__PURE__ */ createPortal(reffedChildren, mergedContainer));
  });
  if (true) {
    Portal.displayName = "Portal";
  }
  var Portal_default2 = Portal;

  // ../../node_modules/@rc-component/portal/es/index.js
  var es_default3 = Portal_default2;

  // ../../node_modules/@rc-component/trigger/es/Popup/Arrow.js
  function Arrow(props) {
    const {
      prefixCls,
      align,
      arrow,
      arrowPos
    } = props;
    const {
      className,
      content,
      style: style2
    } = arrow || {};
    const {
      x = 0,
      y = 0
    } = arrowPos;
    const arrowRef = useRef(null);
    if (!align || !align.points) {
      return null;
    }
    const alignStyle = {
      position: "absolute"
    };
    if (align.autoArrow !== false) {
      const popupPoints = align.points[0];
      const targetPoints = align.points[1];
      const popupTB = popupPoints[0];
      const popupLR = popupPoints[1];
      const targetTB = targetPoints[0];
      const targetLR = targetPoints[1];
      if (popupTB === targetTB || !["t", "b"].includes(popupTB)) {
        alignStyle.top = y;
      } else if (popupTB === "t") {
        alignStyle.top = 0;
      } else {
        alignStyle.bottom = 0;
      }
      if (popupLR === targetLR || !["l", "r"].includes(popupLR)) {
        alignStyle.left = x;
      } else if (popupLR === "l") {
        alignStyle.left = 0;
      } else {
        alignStyle.right = 0;
      }
    }
    return /* @__PURE__ */ createElement2("div", {
      ref: arrowRef,
      className: clsx(`${prefixCls}-arrow`, className),
      style: {
        ...alignStyle,
        ...style2
      }
    }, content);
  }

  // ../../node_modules/@rc-component/trigger/es/Popup/Mask.js
  function _extends9() {
    _extends9 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends9.apply(this, arguments);
  }
  function Mask(props) {
    const {
      prefixCls,
      open,
      zIndex,
      mask,
      motion,
      mobile
    } = props;
    if (!mask) {
      return null;
    }
    return /* @__PURE__ */ createElement2(es_default2, _extends9({}, motion, {
      motionAppear: true,
      visible: open,
      removeOnLeave: true
    }), ({
      className
    }) => /* @__PURE__ */ createElement2("div", {
      style: {
        zIndex
      },
      className: clsx(`${prefixCls}-mask`, mobile && `${prefixCls}-mobile-mask`, className)
    }));
  }

  // ../../node_modules/@rc-component/trigger/es/Popup/PopupContent.js
  var PopupContent = /* @__PURE__ */ memo(({
    children
  }) => children, (_, next2) => next2.cache);
  if (true) {
    PopupContent.displayName = "PopupContent";
  }
  var PopupContent_default = PopupContent;

  // ../../node_modules/@rc-component/trigger/es/hooks/useOffsetStyle.js
  function useOffsetStyle(isMobile2, ready, open, align, offsetR, offsetB, offsetX, offsetY) {
    const AUTO = "auto";
    const offsetStyle = isMobile2 ? {} : {
      left: "-1000vw",
      top: "-1000vh",
      right: AUTO,
      bottom: AUTO
    };
    if (!isMobile2 && (ready || !open)) {
      const {
        points
      } = align;
      const dynamicInset = align.dynamicInset || align._experimental?.dynamicInset;
      const alignRight = dynamicInset && points[0][1] === "r";
      const alignBottom = dynamicInset && points[0][0] === "b";
      if (alignRight) {
        offsetStyle.right = offsetR;
        offsetStyle.left = AUTO;
      } else {
        offsetStyle.left = offsetX;
        offsetStyle.right = AUTO;
      }
      if (alignBottom) {
        offsetStyle.bottom = offsetB;
        offsetStyle.top = AUTO;
      } else {
        offsetStyle.top = offsetY;
        offsetStyle.bottom = AUTO;
      }
    }
    return offsetStyle;
  }

  // ../../node_modules/@rc-component/trigger/es/Popup/index.js
  function _extends10() {
    _extends10 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends10.apply(this, arguments);
  }
  var Popup = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      onEsc,
      popup,
      className,
      prefixCls,
      style: style2,
      target,
      onVisibleChanged,
      // Open
      open,
      keepDom,
      fresh,
      // Click
      onClick,
      // Mask
      mask,
      // Arrow
      arrow,
      arrowPos,
      align,
      // Motion
      motion,
      maskMotion,
      // Mobile
      mobile,
      // Portal
      forceRender,
      getPopupContainer,
      autoDestroy,
      portal: Portal2,
      children,
      zIndex,
      onMouseEnter,
      onMouseLeave,
      onPointerEnter,
      onPointerDownCapture,
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      onAlign,
      onPrepare,
      // Resize
      onResize: onResize2,
      stretch,
      targetWidth,
      targetHeight
    } = props;
    const popupContent = typeof popup === "function" ? popup() : popup;
    const isNodeVisible = open || keepDom;
    const isMobile2 = !!mobile;
    const [mergedMask, mergedMaskMotion, mergedPopupMotion] = useMemo(() => {
      if (mobile) {
        return [mobile.mask, mobile.maskMotion, mobile.motion];
      }
      return [mask, maskMotion, motion];
    }, [mobile, mask, maskMotion, motion]);
    const getPopupContainerNeedParams = getPopupContainer?.length > 0;
    const [show2, setShow] = useState(!getPopupContainer || !getPopupContainerNeedParams);
    useLayoutEffect_default(() => {
      if (!show2 && getPopupContainerNeedParams && target) {
        setShow(true);
      }
    }, [show2, getPopupContainerNeedParams, target]);
    const onInternalResize = useEvent_default((size, ele) => {
      onResize2?.(size, ele);
      onAlign();
    });
    const offsetStyle = useOffsetStyle(isMobile2, ready, open, align, offsetR, offsetB, offsetX, offsetY);
    if (!show2) {
      return null;
    }
    const miscStyle = {};
    if (stretch) {
      if (stretch.includes("height") && targetHeight) {
        miscStyle.height = targetHeight;
      } else if (stretch.includes("minHeight") && targetHeight) {
        miscStyle.minHeight = targetHeight;
      }
      if (stretch.includes("width") && targetWidth) {
        miscStyle.width = targetWidth;
      } else if (stretch.includes("minWidth") && targetWidth) {
        miscStyle.minWidth = targetWidth;
      }
    }
    if (!open) {
      miscStyle.pointerEvents = "none";
    }
    return /* @__PURE__ */ createElement2(Portal2, {
      open: forceRender || isNodeVisible,
      getContainer: getPopupContainer && (() => getPopupContainer(target)),
      autoDestroy,
      onEsc
    }, /* @__PURE__ */ createElement2(Mask, {
      prefixCls,
      open,
      zIndex,
      mask: mergedMask,
      motion: mergedMaskMotion,
      mobile: isMobile2
    }), /* @__PURE__ */ createElement2(es_default, {
      onResize: onInternalResize,
      disabled: !open
    }, (resizeObserverRef) => {
      return /* @__PURE__ */ createElement2(es_default2, _extends10({
        motionAppear: true,
        motionEnter: true,
        motionLeave: true,
        removeOnLeave: false,
        forceRender,
        leavedClassName: `${prefixCls}-hidden`
      }, mergedPopupMotion, {
        onAppearPrepare: onPrepare,
        onEnterPrepare: onPrepare,
        visible: open,
        onVisibleChanged: (nextVisible) => {
          motion?.onVisibleChanged?.(nextVisible);
          onVisibleChanged(nextVisible);
        }
      }), ({
        className: motionClassName,
        style: motionStyle
      }, motionRef) => {
        const cls = clsx(prefixCls, motionClassName, className, {
          [`${prefixCls}-mobile`]: isMobile2
        });
        return /* @__PURE__ */ createElement2("div", {
          ref: composeRef(resizeObserverRef, ref2, motionRef),
          className: cls,
          style: {
            "--arrow-x": `${arrowPos.x || 0}px`,
            "--arrow-y": `${arrowPos.y || 0}px`,
            ...offsetStyle,
            ...miscStyle,
            ...motionStyle,
            boxSizing: "border-box",
            zIndex,
            ...style2
          },
          onMouseEnter,
          onMouseLeave,
          onPointerEnter,
          onClick,
          onPointerDownCapture
        }, arrow && /* @__PURE__ */ createElement2(Arrow, {
          prefixCls,
          arrow,
          arrowPos,
          align
        }), /* @__PURE__ */ createElement2(PopupContent_default, {
          cache: !open && !fresh
        }, popupContent));
      });
    }), children);
  });
  if (true) {
    Popup.displayName = "Popup";
  }
  var Popup_default = Popup;

  // ../../node_modules/@rc-component/trigger/es/context.js
  var TriggerContext = /* @__PURE__ */ createContext(null);
  var context_default3 = TriggerContext;
  var UniqueContext = /* @__PURE__ */ createContext(null);

  // ../../node_modules/@rc-component/trigger/es/hooks/useAction.js
  function toArray2(val) {
    return val ? Array.isArray(val) ? val : [val] : [];
  }
  function useAction(action, showAction, hideAction) {
    return useMemo(() => {
      const mergedShowAction = toArray2(showAction ?? action);
      const mergedHideAction = toArray2(hideAction ?? action);
      const showActionSet = new Set(mergedShowAction);
      const hideActionSet = new Set(mergedHideAction);
      if (showActionSet.has("hover") && !showActionSet.has("click")) {
        showActionSet.add("touch");
      }
      if (hideActionSet.has("hover") && !hideActionSet.has("click")) {
        hideActionSet.add("touch");
      }
      return [showActionSet, hideActionSet];
    }, [action, showAction, hideAction]);
  }

  // ../../node_modules/@rc-component/trigger/es/util.js
  function isPointsEq(a1 = [], a2 = [], isAlignPoint) {
    const getVal = (a3, index) => a3[index] || "";
    if (isAlignPoint) {
      return getVal(a1, 0) === getVal(a2, 0);
    }
    return getVal(a1, 0) === getVal(a2, 0) && getVal(a1, 1) === getVal(a2, 1);
  }
  function getAlignPopupClassName(builtinPlacements, prefixCls, align, isAlignPoint) {
    const {
      points
    } = align;
    const placements = Object.keys(builtinPlacements);
    for (let i = 0; i < placements.length; i += 1) {
      const placement = placements[i];
      if (isPointsEq(builtinPlacements[placement]?.points, points, isAlignPoint)) {
        return `${prefixCls}-placement-${placement}`;
      }
    }
    return "";
  }
  function getWin(ele) {
    return ele.ownerDocument.defaultView;
  }
  function collectScroller(ele) {
    const scrollerList = [];
    let current = ele?.parentElement;
    const scrollStyle = ["hidden", "scroll", "clip", "auto"];
    while (current) {
      const {
        overflowX,
        overflowY,
        overflow
      } = getWin(current).getComputedStyle(current);
      if ([overflowX, overflowY, overflow].some((o) => scrollStyle.includes(o))) {
        scrollerList.push(current);
      }
      current = current.parentElement;
    }
    return scrollerList;
  }
  function toNum(num, defaultValue = 1) {
    return Number.isNaN(num) ? defaultValue : num;
  }
  function getPxValue(val) {
    return toNum(parseFloat(val), 0);
  }
  function getVisibleArea(initArea, scrollerList) {
    const visibleArea = {
      ...initArea
    };
    (scrollerList || []).forEach((ele) => {
      if (ele instanceof HTMLBodyElement || ele instanceof HTMLHtmlElement) {
        return;
      }
      const {
        overflow,
        overflowClipMargin,
        borderTopWidth,
        borderBottomWidth,
        borderLeftWidth,
        borderRightWidth
      } = getWin(ele).getComputedStyle(ele);
      const eleRect = ele.getBoundingClientRect();
      const {
        offsetHeight: eleOutHeight,
        clientHeight: eleInnerHeight,
        offsetWidth: eleOutWidth,
        clientWidth: eleInnerWidth
      } = ele;
      const borderTopNum = getPxValue(borderTopWidth);
      const borderBottomNum = getPxValue(borderBottomWidth);
      const borderLeftNum = getPxValue(borderLeftWidth);
      const borderRightNum = getPxValue(borderRightWidth);
      const scaleX = toNum(Math.round(eleRect.width / eleOutWidth * 1e3) / 1e3);
      const scaleY = toNum(Math.round(eleRect.height / eleOutHeight * 1e3) / 1e3);
      const eleScrollWidth = (eleOutWidth - eleInnerWidth - borderLeftNum - borderRightNum) * scaleX;
      const eleScrollHeight = (eleOutHeight - eleInnerHeight - borderTopNum - borderBottomNum) * scaleY;
      const scaledBorderTopWidth = borderTopNum * scaleY;
      const scaledBorderBottomWidth = borderBottomNum * scaleY;
      const scaledBorderLeftWidth = borderLeftNum * scaleX;
      const scaledBorderRightWidth = borderRightNum * scaleX;
      let clipMarginWidth = 0;
      let clipMarginHeight = 0;
      if (overflow === "clip") {
        const clipNum = getPxValue(overflowClipMargin);
        clipMarginWidth = clipNum * scaleX;
        clipMarginHeight = clipNum * scaleY;
      }
      const eleLeft = eleRect.x + scaledBorderLeftWidth - clipMarginWidth;
      const eleTop = eleRect.y + scaledBorderTopWidth - clipMarginHeight;
      const eleRight = eleLeft + eleRect.width + 2 * clipMarginWidth - scaledBorderLeftWidth - scaledBorderRightWidth - eleScrollWidth;
      const eleBottom = eleTop + eleRect.height + 2 * clipMarginHeight - scaledBorderTopWidth - scaledBorderBottomWidth - eleScrollHeight;
      visibleArea.left = Math.max(visibleArea.left, eleLeft);
      visibleArea.top = Math.max(visibleArea.top, eleTop);
      visibleArea.right = Math.min(visibleArea.right, eleRight);
      visibleArea.bottom = Math.min(visibleArea.bottom, eleBottom);
    });
    return visibleArea;
  }

  // ../../node_modules/@rc-component/trigger/es/hooks/useAlign.js
  function getUnitOffset(size, offset = 0) {
    const offsetStr = `${offset}`;
    const cells = offsetStr.match(/^(.*)\%$/);
    if (cells) {
      return size * (parseFloat(cells[1]) / 100);
    }
    return parseFloat(offsetStr);
  }
  function getNumberOffset(rect, offset) {
    const [offsetX, offsetY] = offset || [];
    return [getUnitOffset(rect.width, offsetX), getUnitOffset(rect.height, offsetY)];
  }
  function splitPoints(points = "") {
    return [points[0], points[1]];
  }
  function getAlignPoint(rect, points) {
    const topBottom = points[0];
    const leftRight = points[1];
    let x;
    let y;
    if (topBottom === "t") {
      y = rect.y;
    } else if (topBottom === "b") {
      y = rect.y + rect.height;
    } else {
      y = rect.y + rect.height / 2;
    }
    if (leftRight === "l") {
      x = rect.x;
    } else if (leftRight === "r") {
      x = rect.x + rect.width;
    } else {
      x = rect.x + rect.width / 2;
    }
    return {
      x,
      y
    };
  }
  function reversePoints(points, index) {
    const reverseMap = {
      t: "b",
      b: "t",
      l: "r",
      r: "l"
    };
    const clone = [...points];
    clone[index] = reverseMap[points[index]] || "c";
    return clone;
  }
  function flatPoints(points) {
    return points.join("");
  }
  function useAlign(open, popupEle, target, placement, builtinPlacements, popupAlign, onPopupAlign, mobile) {
    const [offsetInfo, setOffsetInfo] = useState({
      ready: false,
      offsetX: 0,
      offsetY: 0,
      offsetR: 0,
      offsetB: 0,
      arrowX: 0,
      arrowY: 0,
      scaleX: 1,
      scaleY: 1,
      align: builtinPlacements[placement] || {}
    });
    const alignCountRef = useRef(0);
    const scrollerList = useMemo(() => {
      if (!popupEle || mobile) {
        return [];
      }
      return collectScroller(popupEle);
    }, [popupEle]);
    const prevFlipRef = useRef({});
    const resetFlipCache = () => {
      prevFlipRef.current = {};
    };
    if (!open) {
      resetFlipCache();
    }
    const onAlign = useEvent_default(() => {
      if (popupEle && target && open && !mobile) {
        let getIntersectionVisibleArea = function(offsetX, offsetY, area = visibleArea) {
          const l = popupRect.x + offsetX;
          const t = popupRect.y + offsetY;
          const r2 = l + popupWidth;
          const b = t + popupHeight;
          const visibleL = Math.max(l, area.left);
          const visibleT = Math.max(t, area.top);
          const visibleR = Math.min(r2, area.right);
          const visibleB = Math.min(b, area.bottom);
          return Math.max(0, (visibleR - visibleL) * (visibleB - visibleT));
        }, syncNextPopupPosition = function() {
          nextPopupY = popupRect.y + nextOffsetY;
          nextPopupBottom = nextPopupY + popupHeight;
          nextPopupX = popupRect.x + nextOffsetX;
          nextPopupRight = nextPopupX + popupWidth;
        };
        const popupElement = popupEle;
        const doc = popupElement.ownerDocument;
        const win = getWin(popupElement);
        const {
          position: popupPosition
        } = win.getComputedStyle(popupElement);
        const originLeft = popupElement.style.left;
        const originTop = popupElement.style.top;
        const originRight = popupElement.style.right;
        const originBottom = popupElement.style.bottom;
        const originOverflow = popupElement.style.overflow;
        const originOverflowX = popupElement.style.overflowX;
        const originOverflowY = popupElement.style.overflowY;
        const placementInfo = {
          ...builtinPlacements[placement],
          ...popupAlign
        };
        const placeholderElement = doc.createElement("div");
        popupElement.parentElement?.appendChild(placeholderElement);
        placeholderElement.style.left = `${popupElement.offsetLeft}px`;
        placeholderElement.style.top = `${popupElement.offsetTop}px`;
        placeholderElement.style.position = popupPosition;
        placeholderElement.style.height = `${popupElement.offsetHeight}px`;
        placeholderElement.style.width = `${popupElement.offsetWidth}px`;
        popupElement.style.left = "0";
        popupElement.style.top = "0";
        popupElement.style.right = "auto";
        popupElement.style.bottom = "auto";
        popupElement.style.overflow = "hidden";
        let targetRect;
        if (Array.isArray(target)) {
          targetRect = {
            x: target[0],
            y: target[1],
            width: 0,
            height: 0
          };
        } else {
          const rect = target.getBoundingClientRect();
          rect.x = rect.x ?? rect.left;
          rect.y = rect.y ?? rect.top;
          targetRect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        }
        const popupRect = popupElement.getBoundingClientRect();
        const {
          height,
          width
        } = win.getComputedStyle(popupElement);
        popupRect.x = popupRect.x ?? popupRect.left;
        popupRect.y = popupRect.y ?? popupRect.top;
        const {
          clientWidth,
          clientHeight,
          scrollWidth,
          scrollHeight,
          scrollTop,
          scrollLeft
        } = doc.documentElement;
        const popupHeight = popupRect.height;
        const popupWidth = popupRect.width;
        const targetHeight = targetRect.height;
        const targetWidth = targetRect.width;
        const visibleRegion = {
          left: 0,
          top: 0,
          right: clientWidth,
          bottom: clientHeight
        };
        const scrollRegion = {
          left: -scrollLeft,
          top: -scrollTop,
          right: scrollWidth - scrollLeft,
          bottom: scrollHeight - scrollTop
        };
        let {
          htmlRegion
        } = placementInfo;
        const VISIBLE = "visible";
        const VISIBLE_FIRST = "visibleFirst";
        if (htmlRegion !== "scroll" && htmlRegion !== VISIBLE_FIRST) {
          htmlRegion = VISIBLE;
        }
        const isVisibleFirst = htmlRegion === VISIBLE_FIRST;
        const scrollRegionArea = getVisibleArea(scrollRegion, scrollerList);
        const visibleRegionArea = getVisibleArea(visibleRegion, scrollerList);
        const visibleArea = htmlRegion === VISIBLE ? visibleRegionArea : scrollRegionArea;
        const adjustCheckVisibleArea = isVisibleFirst ? visibleRegionArea : visibleArea;
        popupElement.style.left = "auto";
        popupElement.style.top = "auto";
        popupElement.style.right = "0";
        popupElement.style.bottom = "0";
        const popupMirrorRect = popupElement.getBoundingClientRect();
        popupElement.style.left = originLeft;
        popupElement.style.top = originTop;
        popupElement.style.right = originRight;
        popupElement.style.bottom = originBottom;
        popupElement.style.overflow = originOverflow;
        popupElement.style.overflowX = originOverflowX;
        popupElement.style.overflowY = originOverflowY;
        popupElement.parentElement?.removeChild(placeholderElement);
        const scaleX = toNum(Math.round(popupWidth / parseFloat(width) * 1e3) / 1e3);
        const scaleY = toNum(Math.round(popupHeight / parseFloat(height) * 1e3) / 1e3);
        if (scaleX === 0 || scaleY === 0 || isDOM(target) && !isVisible_default(target)) {
          return;
        }
        const {
          offset,
          targetOffset
        } = placementInfo;
        let [popupOffsetX, popupOffsetY] = getNumberOffset(popupRect, offset);
        const [targetOffsetX, targetOffsetY] = getNumberOffset(targetRect, targetOffset);
        targetRect.x -= targetOffsetX;
        targetRect.y -= targetOffsetY;
        const [popupPoint, targetPoint] = placementInfo.points || [];
        const targetPoints = splitPoints(targetPoint);
        const popupPoints = splitPoints(popupPoint);
        const targetAlignPoint = getAlignPoint(targetRect, targetPoints);
        const popupAlignPoint = getAlignPoint(popupRect, popupPoints);
        const nextAlignInfo = {
          ...placementInfo
        };
        let nextPoints = [popupPoints, targetPoints];
        let nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX;
        let nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY;
        const originIntersectionVisibleArea = getIntersectionVisibleArea(nextOffsetX, nextOffsetY);
        const originIntersectionRecommendArea = getIntersectionVisibleArea(nextOffsetX, nextOffsetY, visibleRegionArea);
        const targetAlignPointTL = getAlignPoint(targetRect, ["t", "l"]);
        const popupAlignPointTL = getAlignPoint(popupRect, ["t", "l"]);
        const targetAlignPointBR = getAlignPoint(targetRect, ["b", "r"]);
        const popupAlignPointBR = getAlignPoint(popupRect, ["b", "r"]);
        const overflow = placementInfo.overflow || {};
        const {
          adjustX,
          adjustY,
          shiftX,
          shiftY
        } = overflow;
        const supportAdjust = (val) => {
          if (typeof val === "boolean") {
            return val;
          }
          return val >= 0;
        };
        let nextPopupY;
        let nextPopupBottom;
        let nextPopupX;
        let nextPopupRight;
        syncNextPopupPosition();
        const needAdjustY = supportAdjust(adjustY);
        const sameTB = popupPoints[0] === targetPoints[0];
        if (needAdjustY && popupPoints[0] === "t" && (nextPopupBottom > adjustCheckVisibleArea.bottom || prevFlipRef.current.bt)) {
          let tmpNextOffsetY = nextOffsetY;
          if (sameTB) {
            tmpNextOffsetY -= popupHeight - targetHeight;
          } else {
            tmpNextOffsetY = targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY;
          }
          const newVisibleArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY);
          const newVisibleRecommendArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY, visibleRegionArea);
          if (
            // Of course use larger one
            newVisibleArea > originIntersectionVisibleArea || newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
            newVisibleRecommendArea >= originIntersectionRecommendArea)
          ) {
            prevFlipRef.current.bt = true;
            nextOffsetY = tmpNextOffsetY;
            popupOffsetY = -popupOffsetY;
            nextPoints = [reversePoints(nextPoints[0], 0), reversePoints(nextPoints[1], 0)];
          } else {
            prevFlipRef.current.bt = false;
          }
        }
        if (needAdjustY && popupPoints[0] === "b" && (nextPopupY < adjustCheckVisibleArea.top || prevFlipRef.current.tb)) {
          let tmpNextOffsetY = nextOffsetY;
          if (sameTB) {
            tmpNextOffsetY += popupHeight - targetHeight;
          } else {
            tmpNextOffsetY = targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY;
          }
          const newVisibleArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY);
          const newVisibleRecommendArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY, visibleRegionArea);
          if (
            // Of course use larger one
            newVisibleArea > originIntersectionVisibleArea || newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
            newVisibleRecommendArea >= originIntersectionRecommendArea)
          ) {
            prevFlipRef.current.tb = true;
            nextOffsetY = tmpNextOffsetY;
            popupOffsetY = -popupOffsetY;
            nextPoints = [reversePoints(nextPoints[0], 0), reversePoints(nextPoints[1], 0)];
          } else {
            prevFlipRef.current.tb = false;
          }
        }
        const needAdjustX = supportAdjust(adjustX);
        const sameLR = popupPoints[1] === targetPoints[1];
        if (needAdjustX && popupPoints[1] === "l" && (nextPopupRight > adjustCheckVisibleArea.right || prevFlipRef.current.rl)) {
          let tmpNextOffsetX = nextOffsetX;
          if (sameLR) {
            tmpNextOffsetX -= popupWidth - targetWidth;
          } else {
            tmpNextOffsetX = targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX;
          }
          const newVisibleArea = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY);
          const newVisibleRecommendArea = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY, visibleRegionArea);
          if (
            // Of course use larger one
            newVisibleArea > originIntersectionVisibleArea || newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
            newVisibleRecommendArea >= originIntersectionRecommendArea)
          ) {
            prevFlipRef.current.rl = true;
            nextOffsetX = tmpNextOffsetX;
            popupOffsetX = -popupOffsetX;
            nextPoints = [reversePoints(nextPoints[0], 1), reversePoints(nextPoints[1], 1)];
          } else {
            prevFlipRef.current.rl = false;
          }
        }
        if (needAdjustX && popupPoints[1] === "r" && (nextPopupX < adjustCheckVisibleArea.left || prevFlipRef.current.lr)) {
          let tmpNextOffsetX = nextOffsetX;
          if (sameLR) {
            tmpNextOffsetX += popupWidth - targetWidth;
          } else {
            tmpNextOffsetX = targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX;
          }
          const newVisibleArea = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY);
          const newVisibleRecommendArea = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY, visibleRegionArea);
          if (
            // Of course use larger one
            newVisibleArea > originIntersectionVisibleArea || newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
            newVisibleRecommendArea >= originIntersectionRecommendArea)
          ) {
            prevFlipRef.current.lr = true;
            nextOffsetX = tmpNextOffsetX;
            popupOffsetX = -popupOffsetX;
            nextPoints = [reversePoints(nextPoints[0], 1), reversePoints(nextPoints[1], 1)];
          } else {
            prevFlipRef.current.lr = false;
          }
        }
        nextAlignInfo.points = [flatPoints(nextPoints[0]), flatPoints(nextPoints[1])];
        syncNextPopupPosition();
        const numShiftX = shiftX === true ? 0 : shiftX;
        if (typeof numShiftX === "number") {
          if (nextPopupX < visibleRegionArea.left) {
            nextOffsetX -= nextPopupX - visibleRegionArea.left - popupOffsetX;
            if (targetRect.x + targetWidth < visibleRegionArea.left + numShiftX) {
              nextOffsetX += targetRect.x - visibleRegionArea.left + targetWidth - numShiftX;
            }
          }
          if (nextPopupRight > visibleRegionArea.right) {
            nextOffsetX -= nextPopupRight - visibleRegionArea.right - popupOffsetX;
            if (targetRect.x > visibleRegionArea.right - numShiftX) {
              nextOffsetX += targetRect.x - visibleRegionArea.right + numShiftX;
            }
          }
        }
        const numShiftY = shiftY === true ? 0 : shiftY;
        if (typeof numShiftY === "number") {
          if (nextPopupY < visibleRegionArea.top) {
            nextOffsetY -= nextPopupY - visibleRegionArea.top - popupOffsetY;
            if (targetRect.y + targetHeight < visibleRegionArea.top + numShiftY) {
              nextOffsetY += targetRect.y - visibleRegionArea.top + targetHeight - numShiftY;
            }
          }
          if (nextPopupBottom > visibleRegionArea.bottom) {
            nextOffsetY -= nextPopupBottom - visibleRegionArea.bottom - popupOffsetY;
            if (targetRect.y > visibleRegionArea.bottom - numShiftY) {
              nextOffsetY += targetRect.y - visibleRegionArea.bottom + numShiftY;
            }
          }
        }
        const popupLeft = popupRect.x + nextOffsetX;
        const popupRight = popupLeft + popupWidth;
        const popupTop = popupRect.y + nextOffsetY;
        const popupBottom = popupTop + popupHeight;
        const targetLeft = targetRect.x;
        const targetRight = targetLeft + targetWidth;
        const targetTop = targetRect.y;
        const targetBottom = targetTop + targetHeight;
        const maxLeft = Math.max(popupLeft, targetLeft);
        const minRight = Math.min(popupRight, targetRight);
        const xCenter = (maxLeft + minRight) / 2;
        const nextArrowX = xCenter - popupLeft;
        const maxTop = Math.max(popupTop, targetTop);
        const minBottom = Math.min(popupBottom, targetBottom);
        const yCenter = (maxTop + minBottom) / 2;
        const nextArrowY = yCenter - popupTop;
        onPopupAlign?.(popupEle, nextAlignInfo);
        let offsetX4Right = popupMirrorRect.right - popupRect.x - (nextOffsetX + popupRect.width);
        let offsetY4Bottom = popupMirrorRect.bottom - popupRect.y - (nextOffsetY + popupRect.height);
        if (scaleX === 1) {
          nextOffsetX = Math.floor(nextOffsetX);
          offsetX4Right = Math.floor(offsetX4Right);
        }
        if (scaleY === 1) {
          nextOffsetY = Math.floor(nextOffsetY);
          offsetY4Bottom = Math.floor(offsetY4Bottom);
        }
        const nextOffsetInfo = {
          ready: true,
          offsetX: nextOffsetX / scaleX,
          offsetY: nextOffsetY / scaleY,
          offsetR: offsetX4Right / scaleX,
          offsetB: offsetY4Bottom / scaleY,
          arrowX: nextArrowX / scaleX,
          arrowY: nextArrowY / scaleY,
          scaleX,
          scaleY,
          align: nextAlignInfo
        };
        setOffsetInfo(nextOffsetInfo);
      }
    });
    const triggerAlign = () => {
      alignCountRef.current += 1;
      const id = alignCountRef.current;
      Promise.resolve().then(() => {
        if (alignCountRef.current === id) {
          onAlign();
        }
      });
    };
    const resetReady = () => {
      setOffsetInfo((ori) => ({
        ...ori,
        ready: false
      }));
    };
    useLayoutEffect_default(resetReady, [placement]);
    useLayoutEffect_default(() => {
      if (!open) {
        resetReady();
      }
    }, [open]);
    return [offsetInfo.ready, offsetInfo.offsetX, offsetInfo.offsetY, offsetInfo.offsetR, offsetInfo.offsetB, offsetInfo.arrowX, offsetInfo.arrowY, offsetInfo.scaleX, offsetInfo.scaleY, offsetInfo.align, triggerAlign];
  }

  // ../../node_modules/@rc-component/trigger/es/hooks/useDelay.js
  function useDelay() {
    const delayRef = useRef(null);
    const clearDelay = () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
    };
    const delayInvoke = (callback, delay) => {
      clearDelay();
      if (delay === 0) {
        callback();
      } else {
        delayRef.current = setTimeout(() => {
          callback();
        }, delay * 1e3);
      }
    };
    useEffect(() => {
      return () => {
        clearDelay();
      };
    }, []);
    return delayInvoke;
  }

  // ../../node_modules/@rc-component/trigger/es/hooks/useWatch.js
  function useWatch(open, target, popup, onAlign, onScroll) {
    useLayoutEffect_default(() => {
      if (open && target && popup) {
        let notifyScroll = function() {
          onAlign();
          onScroll();
        };
        const targetElement = target;
        const popupElement = popup;
        const targetScrollList = collectScroller(targetElement);
        const popupScrollList = collectScroller(popupElement);
        const win = getWin(popupElement);
        const mergedList = /* @__PURE__ */ new Set([win, ...targetScrollList, ...popupScrollList]);
        mergedList.forEach((scroller) => {
          scroller.addEventListener("scroll", notifyScroll, {
            passive: true
          });
        });
        win.addEventListener("resize", notifyScroll, {
          passive: true
        });
        onAlign();
        return () => {
          mergedList.forEach((scroller) => {
            scroller.removeEventListener("scroll", notifyScroll);
            win.removeEventListener("resize", notifyScroll);
          });
        };
      }
    }, [open, target, popup]);
  }

  // ../../node_modules/@rc-component/trigger/es/hooks/useWinClick.js
  function useWinClick(open, clickToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen) {
    const openRef = useRef(open);
    openRef.current = open;
    const popupPointerDownRef = useRef(false);
    useEffect(() => {
      if (clickToHide && popupEle && (!mask || maskClosable)) {
        const onPointerDown = () => {
          popupPointerDownRef.current = false;
        };
        const onTriggerClose = (e) => {
          if (openRef.current && !inPopupOrChild(e.composedPath?.()?.[0] || e.target) && !popupPointerDownRef.current) {
            triggerOpen(false);
          }
        };
        const win = getWin(popupEle);
        win.addEventListener("pointerdown", onPointerDown, true);
        win.addEventListener("mousedown", onTriggerClose, true);
        win.addEventListener("contextmenu", onTriggerClose, true);
        const targetShadowRoot = getShadowRoot(targetEle);
        if (targetShadowRoot) {
          targetShadowRoot.addEventListener("mousedown", onTriggerClose, true);
          targetShadowRoot.addEventListener("contextmenu", onTriggerClose, true);
        }
        if (targetEle) {
          const targetRoot = targetEle.getRootNode?.();
          const popupRoot = popupEle.getRootNode?.();
          warning_default(targetRoot === popupRoot, `trigger element and popup element should in same shadow root.`);
        }
        return () => {
          win.removeEventListener("pointerdown", onPointerDown, true);
          win.removeEventListener("mousedown", onTriggerClose, true);
          win.removeEventListener("contextmenu", onTriggerClose, true);
          if (targetShadowRoot) {
            targetShadowRoot.removeEventListener("mousedown", onTriggerClose, true);
            targetShadowRoot.removeEventListener("contextmenu", onTriggerClose, true);
          }
        };
      }
    }, [clickToHide, targetEle, popupEle, mask, maskClosable]);
    function onPopupPointerDown() {
      popupPointerDownRef.current = true;
    }
    return onPopupPointerDown;
  }

  // ../../node_modules/@rc-component/trigger/es/UniqueProvider/useTargetState.js
  function useTargetState() {
    const [options, setOptions] = react_compat_default.useState(null);
    const [open, setOpen] = react_compat_default.useState(false);
    const [isAnimating, setIsAnimating] = react_compat_default.useState(false);
    const pendingOptionsRef = react_compat_default.useRef(null);
    const trigger = useEvent_default((nextOptions) => {
      if (nextOptions === false) {
        pendingOptionsRef.current = null;
        setOpen(false);
      } else {
        if (isAnimating && open) {
          pendingOptionsRef.current = nextOptions;
        } else {
          setOpen(true);
          setOptions(nextOptions);
          pendingOptionsRef.current = null;
          if (!open) {
            setIsAnimating(true);
          }
        }
      }
    });
    const onVisibleChanged = useEvent_default((visible) => {
      if (visible) {
        setIsAnimating(false);
        if (pendingOptionsRef.current) {
          setOptions(pendingOptionsRef.current);
          pendingOptionsRef.current = null;
        }
      } else {
        setIsAnimating(false);
        pendingOptionsRef.current = null;
      }
    });
    return [trigger, open, options, onVisibleChanged];
  }

  // ../../node_modules/@rc-component/trigger/es/UniqueProvider/UniqueContainer.js
  function _extends11() {
    _extends11 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends11.apply(this, arguments);
  }
  var UniqueContainer = (props) => {
    const {
      prefixCls,
      isMobile: isMobile2,
      ready,
      open,
      align,
      offsetR,
      offsetB,
      offsetX,
      offsetY,
      arrowPos,
      popupSize,
      motion,
      uniqueContainerClassName,
      uniqueContainerStyle
    } = props;
    const containerCls = `${prefixCls}-unique-container`;
    const [motionVisible, setMotionVisible] = react_compat_default.useState(false);
    const offsetStyle = useOffsetStyle(isMobile2, ready, open, align, offsetR, offsetB, offsetX, offsetY);
    const cachedOffsetStyleRef = react_compat_default.useRef(offsetStyle);
    if (ready) {
      cachedOffsetStyleRef.current = offsetStyle;
    }
    const sizeStyle = {};
    if (popupSize) {
      sizeStyle.width = popupSize.width;
      sizeStyle.height = popupSize.height;
    }
    return /* @__PURE__ */ react_compat_default.createElement(es_default2, _extends11({
      motionAppear: true,
      motionEnter: true,
      motionLeave: true,
      removeOnLeave: false,
      leavedClassName: `${containerCls}-hidden`
    }, motion, {
      visible: open,
      onVisibleChanged: (nextVisible) => {
        setMotionVisible(nextVisible);
      }
    }), ({
      className: motionClassName,
      style: motionStyle
    }) => {
      const cls = clsx(containerCls, motionClassName, uniqueContainerClassName, {
        [`${containerCls}-visible`]: motionVisible
      });
      return /* @__PURE__ */ react_compat_default.createElement("div", {
        className: cls,
        style: {
          "--arrow-x": `${arrowPos?.x || 0}px`,
          "--arrow-y": `${arrowPos?.y || 0}px`,
          ...cachedOffsetStyleRef.current,
          ...sizeStyle,
          ...motionStyle,
          ...uniqueContainerStyle
        }
      });
    });
  };
  var UniqueContainer_default = UniqueContainer;

  // ../../node_modules/@rc-component/trigger/es/UniqueProvider/index.js
  var UniqueProvider = ({
    children,
    postTriggerProps
  }) => {
    const [trigger, open, options, onTargetVisibleChanged] = useTargetState();
    const mergedOptions = useMemo(() => {
      if (!options || !postTriggerProps) {
        return options;
      }
      return postTriggerProps(options);
    }, [options, postTriggerProps]);
    const [popupEle, setPopupEle] = useState(null);
    const [popupSize, setPopupSize] = useState(null);
    const externalPopupRef = useRef(null);
    const setPopupRef = useEvent_default((node2) => {
      externalPopupRef.current = node2;
      if (isDOM(node2) && popupEle !== node2) {
        setPopupEle(node2);
      }
    });
    const isOpenRef = useRef(null);
    const delayInvoke = useDelay();
    const show2 = useEvent_default((showOptions, isOpen) => {
      isOpenRef.current = isOpen;
      delayInvoke(() => {
        trigger(showOptions);
      }, showOptions.delay);
    });
    const hide = (delay) => {
      delayInvoke(() => {
        if (isOpenRef.current?.()) {
          return;
        }
        trigger(false);
      }, delay);
    };
    const onVisibleChanged = useEvent_default((visible) => {
      onTargetVisibleChanged(visible);
    });
    const [
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      arrowX,
      arrowY,
      // scaleX - not used in UniqueProvider
      ,
      ,
      // scaleY - not used in UniqueProvider
      alignInfo,
      onAlign
    ] = useAlign(
      open,
      popupEle,
      mergedOptions?.target,
      mergedOptions?.popupPlacement,
      mergedOptions?.builtinPlacements || {},
      mergedOptions?.popupAlign,
      void 0,
      // onPopupAlign
      false
      // isMobile
    );
    const alignedClassName = useMemo(() => {
      if (!mergedOptions) {
        return "";
      }
      const baseClassName = getAlignPopupClassName(
        mergedOptions.builtinPlacements || {},
        mergedOptions.prefixCls || "",
        alignInfo,
        false
        // alignPoint is false for UniqueProvider
      );
      return clsx(baseClassName, mergedOptions.getPopupClassNameFromAlign?.(alignInfo));
    }, [alignInfo, mergedOptions?.getPopupClassNameFromAlign, mergedOptions?.builtinPlacements, mergedOptions?.prefixCls]);
    const contextValue = useMemo(() => ({
      show: show2,
      hide
    }), []);
    useEffect(() => {
      onAlign();
    }, [mergedOptions?.target]);
    const onPrepare = useEvent_default(() => {
      onAlign();
      return Promise.resolve();
    });
    const subPopupElements = useRef({});
    const parentContext = useContext(context_default3);
    const triggerContextValue = useMemo(() => ({
      registerSubPopup: (id, subPopupEle) => {
        subPopupElements.current[id] = subPopupEle;
        parentContext?.registerSubPopup(id, subPopupEle);
      }
    }), [parentContext]);
    const prefixCls = mergedOptions?.prefixCls;
    return /* @__PURE__ */ createElement2(UniqueContext.Provider, {
      value: contextValue
    }, children, mergedOptions && /* @__PURE__ */ createElement2(context_default3.Provider, {
      value: triggerContextValue
    }, /* @__PURE__ */ createElement2(Popup_default, {
      ref: setPopupRef,
      portal: es_default3,
      onEsc: mergedOptions.onEsc,
      prefixCls,
      popup: mergedOptions.popup,
      className: clsx(mergedOptions.popupClassName, alignedClassName, `${prefixCls}-unique-controlled`),
      style: mergedOptions.popupStyle,
      target: mergedOptions.target,
      open,
      keepDom: true,
      fresh: true,
      autoDestroy: false,
      onVisibleChanged,
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      onAlign,
      onPrepare,
      onResize: (size) => setPopupSize({
        width: size.offsetWidth,
        height: size.offsetHeight
      }),
      arrowPos: {
        x: arrowX,
        y: arrowY
      },
      align: alignInfo,
      zIndex: mergedOptions.zIndex,
      mask: mergedOptions.mask,
      arrow: mergedOptions.arrow,
      motion: mergedOptions.popupMotion,
      maskMotion: mergedOptions.maskMotion,
      getPopupContainer: mergedOptions.getPopupContainer
    }, /* @__PURE__ */ createElement2(UniqueContainer_default, {
      prefixCls,
      isMobile: false,
      ready,
      open,
      align: alignInfo,
      offsetR,
      offsetB,
      offsetX,
      offsetY,
      arrowPos: {
        x: arrowX,
        y: arrowY
      },
      popupSize,
      motion: mergedOptions.popupMotion,
      uniqueContainerClassName: clsx(mergedOptions.uniqueContainerClassName, alignedClassName),
      uniqueContainerStyle: mergedOptions.uniqueContainerStyle
    }))));
  };
  var UniqueProvider_default = UniqueProvider;

  // ../../node_modules/@rc-component/trigger/es/index.js
  function generateTrigger(PortalComponent = es_default3) {
    const Trigger = /* @__PURE__ */ forwardRef((props, ref2) => {
      const {
        prefixCls = "rc-trigger-popup",
        children,
        // Action
        action = "hover",
        showAction,
        hideAction,
        disabled = false,
        // Open
        popupVisible,
        defaultPopupVisible,
        onOpenChange,
        afterOpenChange,
        onPopupVisibleChange,
        afterPopupVisibleChange,
        // Delay
        mouseEnterDelay,
        mouseLeaveDelay = 0.1,
        focusDelay,
        blurDelay,
        // Mask
        mask,
        maskClosable = true,
        // Portal
        getPopupContainer,
        forceRender,
        autoDestroy,
        // Popup
        popup,
        popupClassName,
        uniqueContainerClassName,
        uniqueContainerStyle,
        popupStyle,
        popupPlacement,
        builtinPlacements = {},
        popupAlign,
        zIndex,
        stretch,
        getPopupClassNameFromAlign,
        fresh,
        unique,
        alignPoint,
        onPopupClick,
        onPopupAlign,
        // Arrow
        arrow,
        // Motion
        popupMotion,
        maskMotion,
        // Private
        mobile,
        ...restProps
      } = props;
      const mergedAutoDestroy = autoDestroy || false;
      const openUncontrolled = popupVisible === void 0;
      const isMobile2 = !!mobile;
      const subPopupElements = useRef({});
      const parentContext = useContext(context_default3);
      const context = useMemo(() => {
        return {
          registerSubPopup: (id2, subPopupEle) => {
            subPopupElements.current[id2] = subPopupEle;
            parentContext?.registerSubPopup(id2, subPopupEle);
          }
        };
      }, [parentContext]);
      const uniqueContext = useContext(UniqueContext);
      const id = useId_default();
      const [popupEle, setPopupEle] = useState(null);
      const externalPopupRef = useRef(null);
      const setPopupRef = useEvent_default((node2) => {
        externalPopupRef.current = node2;
        if (isDOM(node2) && popupEle !== node2) {
          setPopupEle(node2);
        }
        parentContext?.registerSubPopup(id, node2);
      });
      const [targetEle, setTargetEle] = useState(null);
      const externalForwardRef = useRef(null);
      const setTargetRef = useEvent_default((node2) => {
        const domNode = getDOM(node2);
        if (isDOM(domNode) && targetEle !== domNode) {
          setTargetEle(domNode);
          externalForwardRef.current = domNode;
        }
      });
      const cloneProps = {};
      const inPopupOrChild = useEvent_default((ele) => {
        const childDOM = targetEle;
        return childDOM?.contains(ele) || getShadowRoot(childDOM)?.host === ele || ele === childDOM || popupEle?.contains(ele) || getShadowRoot(popupEle)?.host === ele || ele === popupEle || Object.values(subPopupElements.current).some((subPopupEle) => subPopupEle?.contains(ele) || ele === subPopupEle);
      });
      const innerArrow = arrow ? {
        // true and Object likely
        ...arrow !== true ? arrow : {}
      } : null;
      const [internalOpen, setInternalOpen] = useControlledState(defaultPopupVisible || false, popupVisible);
      const rawOpen = internalOpen || false;
      const mergedOpen = rawOpen && !disabled;
      const child = useMemo(() => {
        const nextChild = typeof children === "function" ? children({
          open: mergedOpen
        }) : children;
        return Children.only(nextChild);
      }, [children, mergedOpen]);
      const originChildProps = child?.props || {};
      const isOpen = useEvent_default(() => mergedOpen);
      const getUniqueOptions = useEvent_default((delay = 0) => ({
        popup,
        target: targetEle,
        delay,
        prefixCls,
        popupClassName,
        uniqueContainerClassName,
        uniqueContainerStyle,
        popupStyle,
        popupPlacement,
        builtinPlacements,
        popupAlign,
        zIndex,
        mask,
        maskClosable,
        popupMotion,
        maskMotion,
        arrow: innerArrow,
        getPopupContainer,
        getPopupClassNameFromAlign,
        id,
        onEsc
      }));
      useLayoutEffect_default(() => {
        if (uniqueContext && unique && targetEle && !openUncontrolled && !parentContext) {
          if (mergedOpen) {
            uniqueContext.show(getUniqueOptions(mouseEnterDelay), isOpen);
          } else {
            uniqueContext.hide(mouseLeaveDelay);
          }
        }
      }, [mergedOpen, targetEle]);
      const openRef = useRef(mergedOpen);
      openRef.current = mergedOpen;
      const internalTriggerOpen = useEvent_default((nextOpen) => {
        flushSync(() => {
          if (rawOpen !== nextOpen) {
            setInternalOpen(nextOpen);
            onOpenChange?.(nextOpen);
            onPopupVisibleChange?.(nextOpen);
          }
        });
      });
      const delayInvoke = useDelay();
      const triggerOpen = (nextOpen, delay = 0) => {
        if (popupVisible !== void 0) {
          delayInvoke(() => {
            internalTriggerOpen(nextOpen);
          }, delay);
          return;
        }
        if (uniqueContext && unique && openUncontrolled && !parentContext) {
          if (nextOpen) {
            uniqueContext.show(getUniqueOptions(delay), isOpen);
          } else {
            uniqueContext.hide(delay);
          }
          return;
        }
        delayInvoke(() => {
          internalTriggerOpen(nextOpen);
        }, delay);
      };
      function onEsc({
        top
      }) {
        if (top) {
          triggerOpen(false);
        }
      }
      const [inMotion, setInMotion] = useState(false);
      useLayoutEffect_default((firstMount) => {
        if (!firstMount || mergedOpen) {
          setInMotion(true);
        }
      }, [mergedOpen]);
      const [motionPrepareResolve, setMotionPrepareResolve] = useState(null);
      const [mousePos, setMousePos] = useState(null);
      const setMousePosByEvent = (event) => {
        setMousePos([event.clientX, event.clientY]);
      };
      const [ready, offsetX, offsetY, offsetR, offsetB, arrowX, arrowY, scaleX, scaleY, alignInfo, onAlign] = useAlign(mergedOpen, popupEle, alignPoint && mousePos !== null ? mousePos : targetEle, popupPlacement, builtinPlacements, popupAlign, onPopupAlign, isMobile2);
      const [showActions, hideActions] = useAction(action, showAction, hideAction);
      const clickToShow = showActions.has("click");
      const clickToHide = hideActions.has("click") || hideActions.has("contextMenu");
      const triggerAlign = useEvent_default(() => {
        if (!inMotion) {
          onAlign();
        }
      });
      const onScroll = () => {
        if (openRef.current && alignPoint && clickToHide) {
          triggerOpen(false);
        }
      };
      useWatch(mergedOpen, targetEle, popupEle, triggerAlign, onScroll);
      useLayoutEffect_default(() => {
        triggerAlign();
      }, [mousePos, popupPlacement]);
      useLayoutEffect_default(() => {
        if (mergedOpen && !builtinPlacements?.[popupPlacement]) {
          triggerAlign();
        }
      }, [JSON.stringify(popupAlign)]);
      const alignedClassName = useMemo(() => {
        const baseClassName = getAlignPopupClassName(builtinPlacements, prefixCls, alignInfo, alignPoint);
        return clsx(baseClassName, getPopupClassNameFromAlign?.(alignInfo));
      }, [alignInfo, getPopupClassNameFromAlign, builtinPlacements, prefixCls, alignPoint]);
      useImperativeHandle(ref2, () => ({
        nativeElement: externalForwardRef.current,
        popupElement: externalPopupRef.current,
        forceAlign: triggerAlign
      }));
      const [targetWidth, setTargetWidth] = useState(0);
      const [targetHeight, setTargetHeight] = useState(0);
      const syncTargetSize = () => {
        if (stretch && targetEle) {
          const rect = targetEle.getBoundingClientRect();
          setTargetWidth(rect.width);
          setTargetHeight(rect.height);
        }
      };
      const onTargetResize = () => {
        syncTargetSize();
        triggerAlign();
      };
      const onVisibleChanged = (visible) => {
        setInMotion(false);
        onAlign();
        afterOpenChange?.(visible);
        afterPopupVisibleChange?.(visible);
      };
      const onPrepare = () => new Promise((resolve) => {
        syncTargetSize();
        setMotionPrepareResolve(() => resolve);
      });
      useLayoutEffect_default(() => {
        if (motionPrepareResolve) {
          onAlign();
          motionPrepareResolve();
          setMotionPrepareResolve(null);
        }
      }, [motionPrepareResolve]);
      function wrapperAction(eventName, nextOpen, delay, callback, ignoreCheck) {
        cloneProps[eventName] = (event, ...args) => {
          if (!ignoreCheck || !ignoreCheck()) {
            callback?.(event);
            triggerOpen(nextOpen, delay);
          }
          originChildProps[eventName]?.(event, ...args);
        };
      }
      const touchToShow = showActions.has("touch");
      const touchToHide = hideActions.has("touch");
      const touchedRef = useRef(false);
      if (touchToShow || touchToHide) {
        cloneProps.onTouchStart = (...args) => {
          touchedRef.current = true;
          if (openRef.current && touchToHide) {
            triggerOpen(false);
          } else if (!openRef.current && touchToShow) {
            triggerOpen(true);
          }
          originChildProps.onTouchStart?.(...args);
        };
      }
      if (clickToShow || clickToHide) {
        cloneProps.onClick = (event, ...args) => {
          if (openRef.current && clickToHide) {
            triggerOpen(false);
          } else if (!openRef.current && clickToShow) {
            setMousePosByEvent(event);
            triggerOpen(true);
          }
          originChildProps.onClick?.(event, ...args);
          touchedRef.current = false;
        };
      }
      const onPopupPointerDown = useWinClick(mergedOpen, clickToHide || touchToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen);
      const hoverToShow = showActions.has("hover");
      const hoverToHide = hideActions.has("hover");
      let onPopupMouseEnter;
      let onPopupMouseLeave;
      const ignoreMouseTrigger = () => {
        return touchedRef.current;
      };
      if (hoverToShow) {
        const onMouseEnterCallback = (event) => {
          setMousePosByEvent(event);
        };
        wrapperAction("onMouseEnter", true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);
        wrapperAction("onPointerEnter", true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);
        onPopupMouseEnter = (event) => {
          if ((mergedOpen || inMotion) && popupEle?.contains(event.target)) {
            triggerOpen(true, mouseEnterDelay);
          }
        };
        if (alignPoint) {
          cloneProps.onMouseMove = (event) => {
            originChildProps.onMouseMove?.(event);
          };
        }
      }
      if (hoverToHide) {
        wrapperAction("onMouseLeave", false, mouseLeaveDelay, void 0, ignoreMouseTrigger);
        wrapperAction("onPointerLeave", false, mouseLeaveDelay, void 0, ignoreMouseTrigger);
        onPopupMouseLeave = () => {
          triggerOpen(false, mouseLeaveDelay);
        };
      }
      if (showActions.has("focus")) {
        wrapperAction("onFocus", true, focusDelay);
      }
      if (hideActions.has("focus")) {
        wrapperAction("onBlur", false, blurDelay);
      }
      if (showActions.has("contextMenu")) {
        cloneProps.onContextMenu = (event, ...args) => {
          if (openRef.current && hideActions.has("contextMenu")) {
            triggerOpen(false);
          } else {
            setMousePosByEvent(event);
            triggerOpen(true);
          }
          event.preventDefault();
          originChildProps.onContextMenu?.(event, ...args);
        };
      }
      const rendedRef = useRef(false);
      rendedRef.current || (rendedRef.current = forceRender || mergedOpen || inMotion);
      const mergedChildrenProps = {
        ...originChildProps,
        ...cloneProps
      };
      const passedProps = {};
      const passedEventList = ["onContextMenu", "onClick", "onMouseDown", "onTouchStart", "onMouseEnter", "onMouseLeave", "onFocus", "onBlur"];
      passedEventList.forEach((eventName) => {
        if (restProps[eventName]) {
          passedProps[eventName] = (...args) => {
            mergedChildrenProps[eventName]?.(...args);
            restProps[eventName](...args);
          };
        }
      });
      const arrowPos = {
        x: arrowX,
        y: arrowY
      };
      useResizeObserver(mergedOpen, targetEle, onTargetResize);
      const mergedRef = useComposeRef(setTargetRef, getNodeRef(child));
      const triggerNode = /* @__PURE__ */ cloneElement(child, {
        ...mergedChildrenProps,
        ...passedProps,
        ref: mergedRef
      });
      return /* @__PURE__ */ createElement2(Fragment, null, triggerNode, rendedRef.current && (!uniqueContext || !unique) && /* @__PURE__ */ createElement2(context_default3.Provider, {
        value: context
      }, /* @__PURE__ */ createElement2(Popup_default, {
        portal: PortalComponent,
        ref: setPopupRef,
        prefixCls,
        popup,
        className: clsx(popupClassName, !isMobile2 && alignedClassName),
        style: popupStyle,
        target: targetEle,
        onMouseEnter: onPopupMouseEnter,
        onMouseLeave: onPopupMouseLeave,
        onPointerEnter: onPopupMouseEnter,
        zIndex,
        open: mergedOpen,
        keepDom: inMotion,
        fresh,
        onClick: onPopupClick,
        onPointerDownCapture: onPopupPointerDown,
        mask,
        motion: popupMotion,
        maskMotion,
        onVisibleChanged,
        onPrepare,
        forceRender,
        autoDestroy: mergedAutoDestroy,
        getPopupContainer,
        onEsc,
        align: alignInfo,
        arrow: innerArrow,
        arrowPos,
        ready,
        offsetX,
        offsetY,
        offsetR,
        offsetB,
        onAlign: triggerAlign,
        stretch,
        targetWidth: targetWidth / scaleX,
        targetHeight: targetHeight / scaleY,
        mobile
      })));
    });
    if (true) {
      Trigger.displayName = "Trigger";
    }
    return Trigger;
  }
  var es_default4 = generateTrigger(es_default3);

  // ../../node_modules/antd/es/_util/reactNode.js
  function isFragment2(child) {
    return child && /* @__PURE__ */ react_compat_default.isValidElement(child) && child.type === react_compat_default.Fragment;
  }
  var replaceElement = (element, replacement, props) => {
    if (!/* @__PURE__ */ react_compat_default.isValidElement(element)) {
      return replacement;
    }
    return /* @__PURE__ */ react_compat_default.cloneElement(element, isFunction(props) ? props(element.props || {}) : props);
  };
  function cloneElement2(element, props) {
    return replaceElement(element, element, props);
  }

  // ../../node_modules/antd/es/tooltip/UniqueProvider/MotionContent.js
  var MotionContent = ({
    children
  }) => {
    const {
      getPrefixCls
    } = react_compat_default.useContext(ConfigContext);
    const rootPrefixCls = getPrefixCls();
    if (!/* @__PURE__ */ react_compat_default.isValidElement(children)) {
      return children;
    }
    return /* @__PURE__ */ react_compat_default.createElement(es_default2, {
      visible: true,
      motionName: `${rootPrefixCls}-fade`,
      motionAppear: true,
      motionEnter: true,
      motionLeave: false,
      removeOnLeave: false
    }, ({
      style: motionStyle,
      className: motionClassName
    }) => {
      return cloneElement2(children, (oriProps) => ({
        className: clsx(oriProps.className, motionClassName),
        style: {
          ...oriProps.style,
          ...motionStyle
        }
      }));
    });
  };
  var MotionContent_default = MotionContent;

  // ../../node_modules/antd/es/tooltip/UniqueProvider/index.js
  var cachedPlacements = [null, null];
  function uniqueBuiltinPlacements(ori) {
    if (cachedPlacements[0] !== ori) {
      const target = {};
      Object.keys(ori).forEach((placement) => {
        target[placement] = {
          ...ori[placement],
          dynamicInset: false
        };
      });
      cachedPlacements[0] = ori;
      cachedPlacements[1] = target;
    }
    return cachedPlacements[1];
  }
  var UniqueProvider2 = ({
    children
  }) => {
    const renderPopup = (options) => {
      const {
        id,
        builtinPlacements,
        popup
      } = options;
      const popupEle = isFunction(popup) ? popup() : popup;
      const parsedPlacements = uniqueBuiltinPlacements(builtinPlacements);
      return {
        ...options,
        getPopupContainer: null,
        arrow: false,
        popup: /* @__PURE__ */ react_compat_default.createElement(MotionContent_default, {
          key: id
        }, popupEle),
        builtinPlacements: parsedPlacements
      };
    };
    return /* @__PURE__ */ react_compat_default.createElement(UniqueProvider_default, {
      postTriggerProps: renderPopup
    }, children);
  };
  var UniqueProvider_default2 = UniqueProvider2;

  // ../../node_modules/antd/es/config-provider/DisabledContext.js
  var DisabledContext = /* @__PURE__ */ createContext(false);
  var DisabledContextProvider = ({
    children,
    disabled
  }) => {
    const originDisabled = useContext(DisabledContext);
    return /* @__PURE__ */ createElement2(DisabledContext.Provider, {
      value: disabled ?? originDisabled
    }, children);
  };
  var DisabledContext_default = DisabledContext;

  // ../../node_modules/antd/es/config-provider/SizeContext.js
  var SizeContext = /* @__PURE__ */ createContext(void 0);
  var SizeContextProvider = ({
    children,
    size
  }) => {
    const originSize = useContext(SizeContext);
    return /* @__PURE__ */ createElement2(SizeContext.Provider, {
      value: size || originSize
    }, children);
  };
  var SizeContext_default = SizeContext;

  // ../../node_modules/antd/es/config-provider/hooks/useConfig.js
  function useConfig() {
    const componentDisabled = useContext(DisabledContext_default);
    const componentSize = useContext(SizeContext_default);
    return {
      componentDisabled,
      componentSize
    };
  }
  var useConfig_default = useConfig;

  // ../../node_modules/antd/es/config-provider/hooks/useTheme.js
  function useTheme(theme, parentTheme, config) {
    const warning4 = devUseWarning("ConfigProvider");
    const themeConfig = theme || {};
    const parentThemeConfig = themeConfig.inherit === false || !parentTheme ? {
      ...defaultConfig,
      hashed: parentTheme?.hashed ?? defaultConfig.hashed,
      cssVar: parentTheme?.cssVar,
      zeroRuntime: parentTheme?.zeroRuntime
    } : parentTheme;
    const themeKey = useId();
    if (true) {
      const cssVarEnabled = themeConfig.cssVar || parentThemeConfig.cssVar;
      const validKey = !!(isPlainObject(themeConfig.cssVar) && themeConfig.cssVar?.key || themeKey);
      true ? warning4(!cssVarEnabled || validKey, "breaking", "Missing key in `cssVar` config. Please upgrade to React 18 or set `cssVar.key` manually in each ConfigProvider inside `cssVar` enabled ConfigProvider.") : void 0;
    }
    return useMemo2(() => {
      if (!theme) {
        return parentTheme;
      }
      const mergedComponents = {
        ...parentThemeConfig.components
      };
      Object.keys(theme.components || {}).forEach((componentName) => {
        mergedComponents[componentName] = {
          ...mergedComponents[componentName],
          ...theme.components[componentName]
        };
      });
      const cssVarKey = `css-var-${themeKey.replace(/:/g, "")}`;
      const mergedCssVar = {
        prefix: config?.prefixCls,
        // Same as prefixCls by default
        ...parentThemeConfig.cssVar,
        ...themeConfig.cssVar,
        key: themeConfig.cssVar?.key || cssVarKey
      };
      return {
        ...parentThemeConfig,
        ...themeConfig,
        token: {
          ...parentThemeConfig.token,
          ...themeConfig.token
        },
        components: mergedComponents,
        cssVar: mergedCssVar
      };
    }, [themeConfig, parentThemeConfig, config?.prefixCls, themeKey], (prev2, next2) => prev2.some((prevTheme, index) => {
      const nextTheme = next2[index];
      return !isEqual_default(prevTheme, nextTheme, true);
    }));
  }

  // ../../node_modules/antd/es/config-provider/MotionWrapper.js
  var MotionCacheContext = /* @__PURE__ */ createContext(true);
  if (true) {
    MotionCacheContext.displayName = "MotionCacheContext";
  }
  function MotionWrapper(props) {
    const parentMotion = useContext(MotionCacheContext);
    const {
      children
    } = props;
    const [, token2] = useToken();
    const {
      motion
    } = token2;
    const needWrapMotionProviderRef = useRef(false);
    needWrapMotionProviderRef.current || (needWrapMotionProviderRef.current = parentMotion !== motion);
    if (needWrapMotionProviderRef.current) {
      return /* @__PURE__ */ createElement2(MotionCacheContext.Provider, {
        value: motion
      }, /* @__PURE__ */ createElement2(context_default, {
        motion
      }, children));
    }
    return children;
  }

  // ../../node_modules/antd/es/config-provider/PropWarning.js
  var PropWarning = /* @__PURE__ */ memo((props) => {
    const {
      dropdownMatchSelectWidth
    } = props;
    const warning4 = devUseWarning("ConfigProvider");
    warning4.deprecated(dropdownMatchSelectWidth === void 0, "dropdownMatchSelectWidth", "popupMatchSelectWidth");
    return null;
  });
  if (true) {
    PropWarning.displayName = "PropWarning";
  }
  var PropWarning_default = true ? PropWarning : () => null;

  // ../../node_modules/antd/es/config-provider/index.js
  var IconStyle = ({
    iconPrefixCls,
    csp
  }) => {
    useResetIconStyle_default(iconPrefixCls, csp);
    return null;
  };
  var existThemeConfig = false;
  var PASSED_PROPS = ["getTargetContainer", "getPopupContainer", "renderEmpty", "input", "pagination", "form", "select", "button"];
  var globalPrefixCls;
  var globalIconPrefixCls;
  var globalTheme;
  var globalHolderRender;
  var setGlobalConfig = (props) => {
    const {
      prefixCls,
      iconPrefixCls,
      theme,
      holderRender
    } = props;
    if (prefixCls !== void 0) {
      globalPrefixCls = prefixCls;
    }
    if (iconPrefixCls !== void 0) {
      globalIconPrefixCls = iconPrefixCls;
    }
    if ("holderRender" in props) {
      globalHolderRender = holderRender;
    }
    if (theme) {
      globalTheme = theme;
    }
  };
  var ProviderChildren = (props) => {
    const {
      children,
      csp: customCsp,
      autoInsertSpaceInButton,
      alert,
      affix,
      anchor,
      app,
      form: form2,
      locale: rawLocale,
      componentSize,
      direction,
      space,
      splitter,
      virtual,
      dropdownMatchSelectWidth,
      popupMatchSelectWidth,
      popupOverflow,
      legacyLocale,
      parentContext,
      iconPrefixCls: customIconPrefixCls,
      theme,
      componentDisabled,
      segmented,
      statistic: statistic2,
      spin,
      calendar,
      carousel,
      cascader,
      collapse,
      typography,
      checkbox: checkbox2,
      descriptions,
      divider,
      drawer,
      skeleton,
      steps,
      image,
      layout,
      list: list2,
      listy,
      mentions,
      modal,
      progress: progress2,
      result,
      slider: slider2,
      breadcrumb,
      masonry,
      menu,
      pagination,
      input: input2,
      inputPassword,
      inputSearch,
      textArea,
      otp,
      empty,
      badge,
      borderBeam,
      radio: radio2,
      rate,
      ribbon,
      switch: SWITCH,
      transfer,
      avatar,
      message,
      tag: tag2,
      table: table2,
      card,
      cardMeta,
      tabs: tabs2,
      timeline,
      timePicker,
      upload,
      notification,
      tree,
      colorPicker,
      datePicker,
      rangePicker,
      flex,
      wave,
      dropdown,
      warning: warningConfig,
      tour,
      tooltip,
      popover,
      popconfirm,
      qrcode,
      floatButton,
      floatButtonGroup,
      variant,
      inputNumber,
      treeSelect,
      watermark
    } = props;
    const locale5 = useMemo(() => {
      if (isPlainObject(rawLocale) && Object.prototype.hasOwnProperty.call(rawLocale, "default") && rawLocale.default?.locale) {
        return rawLocale.default;
      }
      return rawLocale;
    }, [rawLocale]);
    const getPrefixCls = useCallback((suffixCls, customizePrefixCls) => {
      const {
        prefixCls
      } = props;
      if (customizePrefixCls) {
        return customizePrefixCls;
      }
      const mergedPrefixCls = prefixCls || parentContext.getPrefixCls("");
      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    }, [parentContext.getPrefixCls, props.prefixCls]);
    const iconPrefixCls = customIconPrefixCls || parentContext.iconPrefixCls || defaultIconPrefixCls;
    const csp = customCsp || parentContext.csp;
    const mergedTheme = useTheme(theme, parentContext.theme, {
      prefixCls: getPrefixCls("")
    });
    if (true) {
      existThemeConfig = existThemeConfig || !!mergedTheme;
    }
    const baseConfig = {
      csp,
      autoInsertSpaceInButton,
      alert,
      affix,
      anchor,
      app,
      locale: locale5 || legacyLocale,
      direction,
      space,
      splitter,
      virtual,
      popupMatchSelectWidth: popupMatchSelectWidth ?? dropdownMatchSelectWidth,
      popupOverflow,
      getPrefixCls,
      iconPrefixCls,
      theme: mergedTheme,
      segmented,
      statistic: statistic2,
      spin,
      calendar,
      carousel,
      cascader,
      collapse,
      typography,
      checkbox: checkbox2,
      descriptions,
      divider,
      drawer,
      skeleton,
      steps,
      image,
      input: input2,
      inputPassword,
      inputSearch,
      textArea,
      otp,
      layout,
      list: list2,
      listy,
      mentions,
      modal,
      progress: progress2,
      result,
      slider: slider2,
      breadcrumb,
      masonry,
      menu,
      pagination,
      empty,
      badge,
      borderBeam,
      radio: radio2,
      rate,
      ribbon,
      switch: SWITCH,
      transfer,
      avatar,
      message,
      tag: tag2,
      table: table2,
      card,
      cardMeta,
      tabs: tabs2,
      timeline,
      timePicker,
      upload,
      notification,
      tree,
      colorPicker,
      datePicker,
      rangePicker,
      flex,
      wave,
      dropdown,
      warning: warningConfig,
      tour,
      tooltip,
      popover,
      popconfirm,
      qrcode,
      floatButton,
      floatButtonGroup,
      variant,
      inputNumber,
      treeSelect,
      watermark
    };
    if (true) {
      const warningFn = devUseWarning("ConfigProvider");
      warningFn(!("autoInsertSpaceInButton" in props), "deprecated", "`autoInsertSpaceInButton` is deprecated. Please use `{ button: { autoInsertSpace: boolean }}` instead.");
    }
    const config = {
      ...parentContext
    };
    Object.keys(baseConfig).forEach((key) => {
      if (baseConfig[key] !== void 0) {
        config[key] = baseConfig[key];
      }
    });
    PASSED_PROPS.forEach((propName) => {
      const propValue = props[propName];
      if (propValue) {
        config[propName] = propValue;
      }
    });
    if (typeof autoInsertSpaceInButton !== "undefined") {
      config.button = {
        autoInsertSpace: autoInsertSpaceInButton,
        ...config.button
      };
    }
    const memoedConfig = useMemo2(() => config, config, (prevConfig, currentConfig) => {
      const prevKeys = Object.keys(prevConfig);
      const currentKeys = Object.keys(currentConfig);
      return prevKeys.length !== currentKeys.length || prevKeys.some((key) => prevConfig[key] !== currentConfig[key]);
    });
    const {
      layer
    } = useContext(StyleContext_default);
    const memoIconContextValue = useMemo(() => ({
      prefixCls: iconPrefixCls,
      csp,
      layer: layer ? "antd" : void 0,
      zeroRuntime: !!layer || mergedTheme?.zeroRuntime
    }), [iconPrefixCls, csp, layer, mergedTheme?.zeroRuntime]);
    let childNode = /* @__PURE__ */ createElement2(Fragment, null, /* @__PURE__ */ createElement2(IconStyle, {
      iconPrefixCls,
      csp
    }), /* @__PURE__ */ createElement2(PropWarning_default, {
      dropdownMatchSelectWidth
    }), children);
    const validateMessages = useMemo(() => merge(en_US_default6.Form?.defaultValidateMessages || {}, memoedConfig.locale?.Form?.defaultValidateMessages || {}, memoedConfig.form?.validateMessages || {}, form2?.validateMessages || {}), [memoedConfig, form2?.validateMessages]);
    if (Object.keys(validateMessages).length > 0) {
      childNode = /* @__PURE__ */ createElement2(validateMessagesContext_default.Provider, {
        value: validateMessages
      }, childNode);
    }
    if (locale5) {
      childNode = /* @__PURE__ */ createElement2(locale_default, {
        locale: locale5,
        _ANT_MARK__: ANT_MARK
      }, childNode);
    }
    if (iconPrefixCls || csp) {
      childNode = /* @__PURE__ */ createElement2(Context_default.Provider, {
        value: memoIconContextValue
      }, childNode);
    }
    if (componentSize) {
      childNode = /* @__PURE__ */ createElement2(SizeContextProvider, {
        size: componentSize
      }, childNode);
    }
    childNode = /* @__PURE__ */ createElement2(MotionWrapper, null, childNode);
    if (tooltip?.unique) {
      childNode = /* @__PURE__ */ createElement2(UniqueProvider_default2, null, childNode);
    }
    const memoTheme = useMemo(() => {
      const {
        algorithm,
        token: token2,
        components,
        cssVar,
        ...rest
      } = mergedTheme || {};
      const themeObj = algorithm && (!Array.isArray(algorithm) || algorithm.length > 0) ? createTheme(algorithm) : theme_default;
      const parsedComponents = {};
      Object.entries(components || {}).forEach(([componentName, componentToken]) => {
        const parsedToken = {
          ...componentToken
        };
        if ("algorithm" in parsedToken) {
          if (parsedToken.algorithm === true) {
            parsedToken.theme = themeObj;
          } else if (Array.isArray(parsedToken.algorithm) || isFunction(parsedToken.algorithm)) {
            parsedToken.theme = createTheme(parsedToken.algorithm);
          }
          delete parsedToken.algorithm;
        }
        parsedComponents[componentName] = parsedToken;
      });
      const mergedToken = {
        ...seed_default,
        ...token2
      };
      return {
        ...rest,
        theme: themeObj,
        token: mergedToken,
        components: parsedComponents,
        override: {
          override: mergedToken,
          ...parsedComponents
        },
        cssVar
      };
    }, [mergedTheme]);
    if (theme) {
      childNode = /* @__PURE__ */ createElement2(DesignTokenContext.Provider, {
        value: memoTheme
      }, childNode);
    }
    if (memoedConfig.warning) {
      childNode = /* @__PURE__ */ createElement2(WarningContext.Provider, {
        value: memoedConfig.warning
      }, childNode);
    }
    if (componentDisabled !== void 0) {
      childNode = /* @__PURE__ */ createElement2(DisabledContextProvider, {
        disabled: componentDisabled
      }, childNode);
    }
    return /* @__PURE__ */ createElement2(ConfigContext.Provider, {
      value: memoedConfig
    }, childNode);
  };
  var ConfigProvider = (props) => {
    const context = useContext(ConfigContext);
    const antLocale = useContext(context_default2);
    return /* @__PURE__ */ createElement2(ProviderChildren, {
      parentContext: context,
      legacyLocale: antLocale,
      ...props
    });
  };
  ConfigProvider.ConfigContext = ConfigContext;
  ConfigProvider.SizeContext = SizeContext_default;
  ConfigProvider.config = setGlobalConfig;
  ConfigProvider.useConfig = useConfig_default;
  Object.defineProperty(ConfigProvider, "SizeContext", {
    get: () => {
      true ? warning_default2(false, "ConfigProvider", "ConfigProvider.SizeContext is deprecated. Please use `ConfigProvider.useConfig().componentSize` instead.") : void 0;
      return SizeContext_default;
    }
  });
  if (true) {
    ConfigProvider.displayName = "ConfigProvider";
  }

  // ../../node_modules/@ant-design/icons-svg/es/asn/LoadingOutlined.js
  var LoadingOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "0 0 1024 1024", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" } }] }, "name": "loading", "theme": "outlined" };
  var LoadingOutlined_default = LoadingOutlined;

  // ../../node_modules/@ant-design/icons/es/icons/LoadingOutlined.js
  function _extends12() {
    _extends12 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends12.apply(this, arguments);
  }
  var LoadingOutlined2 = (props, ref2) => /* @__PURE__ */ createElement2(AntdIconLight_default, _extends12({}, props, {
    ref: ref2,
    icon: LoadingOutlined_default
  }));
  var RefIcon6 = /* @__PURE__ */ forwardRef(LoadingOutlined2);
  if (true) {
    RefIcon6.displayName = "LoadingOutlined";
  }
  var LoadingOutlined_default2 = RefIcon6;

  // ../../node_modules/antd/es/_util/hooks/useClosable.js
  var pickClosable = (context) => {
    if (!context) {
      return void 0;
    }
    const {
      closable,
      closeIcon
    } = context;
    return {
      closable,
      closeIcon
    };
  };
  var EmptyFallbackCloseCollection = {};
  var computeClosableConfig = (closable, closeIcon) => {
    if (!closable && (closable === false || closeIcon === false || closeIcon === null)) {
      return false;
    }
    if (!isNonNullable(closable) && !isNonNullable(closeIcon)) {
      return null;
    }
    let closableConfig = {
      closeIcon: typeof closeIcon !== "boolean" && isNonNullable(closeIcon) ? closeIcon : void 0
    };
    if (isPlainObject(closable)) {
      closableConfig = {
        ...closableConfig,
        ...closable
      };
    }
    return closableConfig;
  };
  var mergeClosableConfigs = (propConfig, contextConfig, fallbackConfig) => {
    if (propConfig === false) {
      return false;
    }
    if (propConfig) {
      return mergeProps_default(fallbackConfig, contextConfig, propConfig);
    }
    if (contextConfig === false) {
      return false;
    }
    if (contextConfig) {
      return mergeProps_default(fallbackConfig, contextConfig);
    }
    return fallbackConfig.closable ? fallbackConfig : false;
  };
  var computeCloseIcon = (mergedConfig, fallbackCloseCollection, closeLabel) => {
    const {
      closeIconRender
    } = fallbackCloseCollection;
    const {
      closeIcon,
      ...restConfig
    } = mergedConfig;
    let finalCloseIcon = closeIcon;
    const ariaOrDataProps = pickAttrs(restConfig, true);
    if (isNonNullable(finalCloseIcon)) {
      if (closeIconRender) {
        finalCloseIcon = closeIconRender(finalCloseIcon);
      }
      finalCloseIcon = /* @__PURE__ */ react_compat_default.isValidElement(finalCloseIcon) ? /* @__PURE__ */ react_compat_default.cloneElement(finalCloseIcon, {
        "aria-label": closeLabel,
        ...finalCloseIcon.props,
        ...ariaOrDataProps
      }) : /* @__PURE__ */ react_compat_default.createElement("span", {
        "aria-label": closeLabel,
        ...ariaOrDataProps
      }, finalCloseIcon);
    }
    return [finalCloseIcon, {
      "aria-label": closeLabel,
      ...ariaOrDataProps
    }];
  };
  var computeClosable = (propCloseCollection, contextCloseCollection, fallbackCloseCollection = EmptyFallbackCloseCollection, closeLabel = "Close") => {
    const propConfig = computeClosableConfig(propCloseCollection?.closable, propCloseCollection?.closeIcon);
    const contextConfig = computeClosableConfig(contextCloseCollection?.closable, contextCloseCollection?.closeIcon);
    const mergedFallback = {
      closeIcon: /* @__PURE__ */ react_compat_default.createElement(CloseOutlined_default2, null),
      ...fallbackCloseCollection
    };
    const mergedConfig = mergeClosableConfigs(propConfig, contextConfig, mergedFallback);
    const closeBtnIsDisabled = typeof mergedConfig !== "boolean" ? !!mergedConfig?.disabled : false;
    if (mergedConfig === false) {
      return [false, null, closeBtnIsDisabled, {}];
    }
    const [closeIcon, ariaProps] = computeCloseIcon(mergedConfig, mergedFallback, closeLabel);
    return [true, closeIcon, closeBtnIsDisabled, ariaProps];
  };
  var useClosable = (propCloseCollection, contextCloseCollection, fallbackCloseCollection = EmptyFallbackCloseCollection) => {
    const [contextLocale] = useLocale_default("global", en_US_default6.global);
    return react_compat_default.useMemo(() => {
      return computeClosable(propCloseCollection, contextCloseCollection, {
        closeIcon: /* @__PURE__ */ react_compat_default.createElement(CloseOutlined_default2, null),
        ...fallbackCloseCollection
      }, contextLocale.close);
    }, [propCloseCollection, contextCloseCollection, fallbackCloseCollection, contextLocale.close]);
  };

  // ../../node_modules/antd/es/_util/hooks/useOrientation.js
  var isValidOrientation = (orientation) => {
    return orientation === "horizontal" || orientation === "vertical";
  };
  var useOrientation = (orientation, vertical, legacyDirection) => {
    return useMemo(() => {
      const validOrientation = isValidOrientation(orientation);
      let mergedOrientation;
      if (validOrientation) {
        mergedOrientation = orientation;
      } else if (typeof vertical === "boolean") {
        mergedOrientation = vertical ? "vertical" : "horizontal";
      } else {
        const validLegacyDirection = isValidOrientation(legacyDirection);
        mergedOrientation = validLegacyDirection ? legacyDirection : "horizontal";
      }
      return [mergedOrientation, mergedOrientation === "vertical"];
    }, [legacyDirection, orientation, vertical]);
  };

  // ../../node_modules/antd/es/_util/wave/style.js
  var genWaveStyle = (token2) => {
    const {
      componentCls,
      colorPrimary,
      motionDurationSlow,
      motionEaseInOut,
      motionEaseOutCirc,
      antCls
    } = token2;
    const [, varRef] = genCssVar(antCls, "wave");
    return {
      [componentCls]: {
        position: "absolute",
        background: "transparent",
        pointerEvents: "none",
        boxSizing: "border-box",
        color: varRef("color", colorPrimary),
        boxShadow: `0 0 0 0 currentcolor`,
        opacity: 0.2,
        // =================== Motion ===================
        "&.wave-motion-appear": {
          transition: [`box-shadow 0.4s`, `opacity 2s`].map((prop) => `${prop} ${motionEaseOutCirc}`).join(","),
          "&-active": {
            boxShadow: `0 0 0 6px currentcolor`,
            opacity: 0
          },
          "&.wave-quick": {
            transition: [`box-shadow`, `opacity`].map((prop) => `${prop} ${motionDurationSlow} ${motionEaseInOut}`).join(",")
          }
        }
      }
    };
  };
  var style_default2 = genComponentStyleHook("Wave", genWaveStyle);

  // ../../node_modules/antd/es/_util/wave/interface.js
  var TARGET_CLS = `${defaultPrefixCls}-wave-target`;

  // ../../node_modules/antd/es/_util/wave/util.js
  var isValidWaveColor = (color) => {
    if (!color) {
      return false;
    }
    return isString(color) && color !== "#fff" && color !== "#ffffff" && color !== "rgb(255, 255, 255)" && color !== "rgba(255, 255, 255, 1)" && !/rgba\((?:\d*, ){3}0\)/i.test(color) && // any transparent rgba color
    !/^#(?:[0-9a-f]{3}0|[0-9a-f]{6}00)$/i.test(color) && // any transparent hex color
    color !== "transparent" && color !== "canvastext";
  };
  function getTargetWaveColor(node2, colorSource = null) {
    const style2 = getComputedStyle(node2);
    const {
      borderTopColor,
      borderColor,
      backgroundColor
    } = style2;
    if (colorSource && isValidWaveColor(style2[colorSource])) {
      return style2[colorSource];
    }
    return [borderTopColor, borderColor, backgroundColor].find(isValidWaveColor) ?? null;
  }

  // ../../node_modules/antd/es/_util/wave/WaveEffect.js
  function validateNum(value) {
    return Number.isNaN(value) ? 0 : value;
  }
  var WaveEffect = (props) => {
    const {
      className,
      target,
      component,
      colorSource
    } = props;
    const divRef = useRef(null);
    const {
      getPrefixCls
    } = useContext(ConfigContext);
    const rootPrefixCls = getPrefixCls();
    const [varName] = genCssVar(rootPrefixCls, "wave");
    const [waveColor, setWaveColor] = useState(null);
    const [borderRadius, setBorderRadius] = useState([]);
    const [left, setLeft] = useState(0);
    const [top, setTop] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [enabled, setEnabled] = useState(false);
    const waveStyle = {
      left,
      top,
      width,
      height,
      borderRadius: borderRadius.map((radius) => `${radius}px`).join(" ")
    };
    if (waveColor) {
      waveStyle[varName("color")] = waveColor;
    }
    function syncPos() {
      const nodeStyle = getComputedStyle(target);
      setWaveColor(getTargetWaveColor(target, colorSource));
      const isStatic = nodeStyle.position === "static";
      const {
        borderLeftWidth,
        borderTopWidth
      } = nodeStyle;
      setLeft(isStatic ? target.offsetLeft : validateNum(-Number.parseFloat(borderLeftWidth)));
      setTop(isStatic ? target.offsetTop : validateNum(-Number.parseFloat(borderTopWidth)));
      setWidth(target.offsetWidth);
      setHeight(target.offsetHeight);
      const {
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomLeftRadius,
        borderBottomRightRadius
      } = nodeStyle;
      setBorderRadius([borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius].map((radius) => validateNum(Number.parseFloat(radius))));
    }
    useEffect(() => {
      if (target) {
        const id = raf_default(() => {
          syncPos();
          setEnabled(true);
        });
        let resizeObserver;
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(syncPos);
          resizeObserver.observe(target);
        }
        return () => {
          raf_default.cancel(id);
          resizeObserver?.disconnect();
        };
      }
    }, [target]);
    if (!enabled) {
      return null;
    }
    const isSmallComponent = (component === "Checkbox" || component === "Radio") && target?.classList.contains(TARGET_CLS);
    return /* @__PURE__ */ createElement2(es_default2, {
      visible: true,
      motionAppear: true,
      motionName: "wave-motion",
      motionDeadline: 5e3,
      onAppearEnd: (_, event) => {
        if (event.deadline || isTransitionEvent(event) && event.propertyName === "opacity") {
          const holder = divRef.current?.parentElement;
          unmount(holder).then(() => {
            holder?.remove();
          });
        }
        return false;
      }
    }, ({
      className: motionClassName
    }, ref2) => /* @__PURE__ */ createElement2("div", {
      ref: composeRef(divRef, ref2),
      className: clsx(className, motionClassName, {
        "wave-quick": isSmallComponent
      }),
      style: waveStyle
    }));
  };
  var showWaveEffect = (target, info) => {
    const {
      component
    } = info;
    if (component === "Checkbox" && !target.querySelector("input")?.checked) {
      return;
    }
    const holder = document.createElement("div");
    holder.style.position = "absolute";
    holder.style.left = "0px";
    holder.style.top = "0px";
    target?.insertBefore(holder, target?.firstChild);
    render3(/* @__PURE__ */ createElement2(WaveEffect, {
      ...info,
      target
    }), holder);
  };
  var WaveEffect_default = showWaveEffect;

  // ../../node_modules/antd/es/_util/wave/useWave.js
  var useWave = (nodeRef, className, component, colorSource) => {
    const {
      wave
    } = useContext(ConfigContext);
    const [, token2, hashId] = useToken();
    const showWave = useEvent_default((event) => {
      const node2 = nodeRef.current;
      if (wave?.disabled || !node2) {
        return;
      }
      const targetNode = node2.querySelector(`.${TARGET_CLS}`) || node2;
      const {
        showEffect
      } = wave || {};
      (showEffect || WaveEffect_default)(targetNode, {
        className,
        token: token2,
        component,
        event,
        hashId,
        colorSource
      });
    });
    const rafIdRef = useRef(null);
    useEffect(() => () => {
      raf_default.cancel(rafIdRef.current);
    }, []);
    const showDebounceWave = (event) => {
      raf_default.cancel(rafIdRef.current);
      rafIdRef.current = raf_default(() => {
        showWave(event);
      });
    };
    return showDebounceWave;
  };
  var useWave_default = useWave;

  // ../../node_modules/antd/es/_util/wave/index.js
  var TRIGGER_TYPE_TO_EVENT_MAP = {
    click: "click",
    mousedown: "mousedown",
    mouseup: "mouseup",
    pointerdown: "pointerdown",
    pointerup: "pointerup"
  };
  var Wave = (props) => {
    const {
      children,
      disabled,
      component,
      colorSource
    } = props;
    const {
      getPrefixCls,
      wave
    } = useContext(ConfigContext);
    const containerRef = useRef(null);
    const prefixCls = getPrefixCls("wave");
    const hashId = style_default2(prefixCls);
    const showWave = useWave_default(containerRef, clsx(prefixCls, hashId), component, colorSource);
    react_compat_default.useEffect(() => {
      const node2 = containerRef.current;
      if (!node2 || node2.nodeType !== window.Node.ELEMENT_NODE || disabled) {
        return;
      }
      const onClick = (e) => {
        if (!isVisible_default(e.target) || !node2.getAttribute || node2.getAttribute("disabled") || node2.disabled || node2.className.includes("disabled") && !node2.className.includes("disabled:") || node2.getAttribute("aria-disabled") === "true" || node2.className.includes("-leave")) {
          return;
        }
        showWave(e);
      };
      const triggerType = wave?.triggerType;
      const eventName = triggerType && triggerType in TRIGGER_TYPE_TO_EVENT_MAP ? TRIGGER_TYPE_TO_EVENT_MAP[triggerType] : "click";
      node2.addEventListener(eventName, onClick, true);
      return () => {
        node2.removeEventListener(eventName, onClick, true);
      };
    }, [disabled, wave?.triggerType]);
    if (!/* @__PURE__ */ react_compat_default.isValidElement(children)) {
      return children ?? null;
    }
    const ref2 = supportRef(children) ? composeRef(getNodeRef(children), containerRef) : containerRef;
    return cloneElement2(children, {
      ref: ref2
    });
  };
  if (true) {
    Wave.displayName = "Wave";
  }
  var wave_default = Wave;

  // ../../node_modules/antd/es/config-provider/hooks/useSize.js
  var useSize = (customSize) => {
    const size = react_compat_default.useContext(SizeContext_default);
    const mergedSize = react_compat_default.useMemo(() => {
      if (!customSize) {
        return size;
      }
      if (isString(customSize)) {
        return customSize ?? size;
      }
      if (isFunction(customSize)) {
        return customSize(size);
      }
      return size;
    }, [customSize, size]);
    return mergedSize;
  };
  var useSize_default = useSize;

  // ../../node_modules/antd/es/space/style/compact.js
  var genSpaceCompactStyle = (token2) => {
    const {
      componentCls
    } = token2;
    return {
      [componentCls]: {
        display: "inline-flex",
        "&-block": {
          display: "flex",
          width: "100%"
        },
        "&-vertical": {
          flexDirection: "column"
        },
        "&-rtl": {
          direction: "rtl"
        }
      }
    };
  };
  var compact_default = genStyleHooks(["Space", "Compact"], genSpaceCompactStyle, () => ({}), {
    // Space component don't apply extra font style
    // https://github.com/ant-design/ant-design/issues/40315
    resetStyle: false
  });

  // ../../node_modules/antd/es/space/Compact.js
  var SpaceCompactItemContext = /* @__PURE__ */ createContext(null);
  var useCompactItemContext = (prefixCls, direction) => {
    const compactItemContext = useContext(SpaceCompactItemContext);
    const compactItemClassnames = useMemo(() => {
      if (!compactItemContext) {
        return "";
      }
      const {
        compactDirection,
        isFirstItem,
        isLastItem
      } = compactItemContext;
      const separator = compactDirection === "vertical" ? "-vertical-" : "-";
      return clsx(`${prefixCls}-compact${separator}item`, {
        [`${prefixCls}-compact${separator}first-item`]: isFirstItem,
        [`${prefixCls}-compact${separator}last-item`]: isLastItem,
        [`${prefixCls}-compact${separator}item-rtl`]: direction === "rtl"
      });
    }, [prefixCls, direction, compactItemContext]);
    return {
      compactSize: compactItemContext?.compactSize,
      compactDirection: compactItemContext?.compactDirection,
      compactItemClassnames
    };
  };
  var CompactItem = (props) => {
    const {
      children,
      ...others
    } = props;
    return /* @__PURE__ */ createElement2(SpaceCompactItemContext.Provider, {
      value: useMemo(() => others, [others])
    }, children);
  };
  var Compact = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      getPrefixCls,
      direction: directionConfig
    } = useContext(ConfigContext);
    const {
      size,
      direction,
      orientation,
      block,
      prefixCls: customizePrefixCls,
      className,
      rootClassName,
      children,
      vertical,
      ...restProps
    } = props;
    if (true) {
      const warning4 = devUseWarning("Space.Compact");
      warning4.deprecated(!direction, "direction", "orientation");
    }
    const [mergedOrientation, mergedVertical] = useOrientation(orientation, vertical, direction);
    const mergedSize = useSize_default((ctx2) => size ?? ctx2);
    const prefixCls = getPrefixCls("space-compact", customizePrefixCls);
    const [hashId] = compact_default(prefixCls);
    const clx = clsx(prefixCls, hashId, {
      [`${prefixCls}-rtl`]: directionConfig === "rtl",
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-vertical`]: mergedVertical
    }, className, rootClassName);
    const compactItemContext = useContext(SpaceCompactItemContext);
    const nativeElementRef = useRef(null);
    useImperativeHandle(ref2, () => ({
      nativeElement: nativeElementRef.current
    }));
    const childNodes = toArray(children);
    const nodes = useMemo(() => childNodes.map((child, i) => {
      const key = child?.key || `${prefixCls}-item-${i}`;
      return /* @__PURE__ */ createElement2(CompactItem, {
        key,
        compactSize: mergedSize,
        compactDirection: mergedOrientation,
        isFirstItem: i === 0 && (!compactItemContext || compactItemContext?.isFirstItem),
        isLastItem: i === childNodes.length - 1 && (!compactItemContext || compactItemContext?.isLastItem)
      }, child);
    }), [childNodes, compactItemContext, mergedOrientation, mergedSize, prefixCls]);
    if (childNodes.length === 0) {
      return null;
    }
    return /* @__PURE__ */ createElement2("div", {
      ref: nativeElementRef,
      className: clx,
      ...restProps
    }, nodes);
  });
  var Compact_default = Compact;

  // ../../node_modules/antd/es/button/ButtonGroup.js
  var GroupSizeContext = /* @__PURE__ */ createContext(void 0);
  var ButtonGroup = (props) => {
    const {
      getPrefixCls,
      direction
    } = useContext(ConfigContext);
    const {
      prefixCls: customizePrefixCls,
      size,
      className,
      ...others
    } = props;
    const prefixCls = getPrefixCls("btn-group", customizePrefixCls);
    const [, , hashId] = useToken();
    const sizeCls = useMemo(() => {
      switch (size) {
        case "large":
          return "lg";
        case "small":
          return "sm";
        default:
          return "";
      }
    }, [size]);
    if (true) {
      const warning4 = devUseWarning("Button.Group");
      warning4.deprecated(false, "Button.Group", "Space.Compact");
      true ? warning4(!size || ["large", "medium", "small"].includes(size), "usage", "Invalid prop `size`.") : void 0;
    }
    const classes = clsx(prefixCls, {
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-rtl`]: direction === "rtl"
    }, className, hashId);
    return /* @__PURE__ */ createElement2(GroupSizeContext.Provider, {
      value: size
    }, /* @__PURE__ */ createElement2("div", {
      ...others,
      className: classes
    }));
  };
  var ButtonGroup_default = ButtonGroup;

  // ../../node_modules/antd/es/button/buttonHelpers.js
  var rxTwoCNChar = /^[\u4E00-\u9FA5]{2}$/;
  var isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
  function isUnBorderedButtonVariant(type) {
    return type === "text" || type === "link";
  }
  function splitCNCharsBySpace(child, needInserted, style2, className) {
    if (!isReactRenderable(child)) {
      return;
    }
    const SPACE = needInserted ? " " : "";
    if (!isString(child) && !isNumber(child) && isString(child.type) && isTwoCNChar(child.props.children)) {
      return cloneElement2(child, (oriProps) => {
        const mergedCls = clsx(oriProps.className, className) || void 0;
        const mergedStyle = {
          ...style2,
          ...oriProps.style
        };
        return {
          ...oriProps,
          children: oriProps.children.split("").join(SPACE),
          className: mergedCls,
          style: mergedStyle
        };
      });
    }
    if (isString(child)) {
      return /* @__PURE__ */ react_compat_default.createElement("span", {
        className,
        style: style2
      }, isTwoCNChar(child) ? child.split("").join(SPACE) : child);
    }
    if (isFragment2(child)) {
      return /* @__PURE__ */ react_compat_default.createElement("span", {
        className,
        style: style2
      }, child);
    }
    return cloneElement2(child, (oriProps) => ({
      ...oriProps,
      className: clsx(oriProps.className, className) || void 0,
      style: {
        ...oriProps.style,
        ...style2
      }
    }));
  }
  function spaceChildren(children, needInserted, style2, className) {
    let isPrevChildPure = false;
    const childList = [];
    react_compat_default.Children.forEach(children, (child) => {
      const isCurrentChildPure = isString(child) || isNumber(child);
      if (isPrevChildPure && isCurrentChildPure) {
        const lastIndex = childList.length - 1;
        const lastChild = childList[lastIndex];
        childList[lastIndex] = `${lastChild}${child}`;
      } else {
        childList.push(child);
      }
      isPrevChildPure = isCurrentChildPure;
    });
    return react_compat_default.Children.map(childList, (child) => splitCNCharsBySpace(child, needInserted, style2, className));
  }
  var _ButtonColorTypes = ["default", "primary", "danger"].concat(_toConsumableArray(PresetColors));

  // ../../node_modules/antd/es/button/IconWrapper.js
  var IconWrapper = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      className,
      style: style2,
      children,
      prefixCls
    } = props;
    const iconWrapperCls = clsx(`${prefixCls}-icon`, className);
    return /* @__PURE__ */ react_compat_default.createElement("span", {
      ref: ref2,
      className: iconWrapperCls,
      style: style2
    }, children);
  });
  var IconWrapper_default = IconWrapper;

  // ../../node_modules/antd/es/button/DefaultLoadingIcon.js
  var InnerLoadingIcon = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      prefixCls,
      className,
      style: style2,
      iconClassName
    } = props;
    const mergedIconCls = clsx(`${prefixCls}-loading-icon`, className);
    return /* @__PURE__ */ react_compat_default.createElement(IconWrapper_default, {
      prefixCls,
      className: mergedIconCls,
      style: style2,
      ref: ref2
    }, /* @__PURE__ */ react_compat_default.createElement(LoadingOutlined_default2, {
      className: iconClassName
    }));
  });
  var getCollapsedWidth = () => ({
    width: 0,
    opacity: 0,
    transform: "scale(0)"
  });
  var getRealWidth = (node2) => ({
    width: node2.scrollWidth,
    opacity: 1,
    transform: "scale(1)"
  });
  var DefaultLoadingIcon = (props) => {
    const {
      prefixCls,
      loading,
      existIcon,
      className,
      style: style2,
      mount: mount2
    } = props;
    const visible = !!loading;
    if (existIcon) {
      return /* @__PURE__ */ react_compat_default.createElement(InnerLoadingIcon, {
        prefixCls,
        className,
        style: style2
      });
    }
    return /* @__PURE__ */ react_compat_default.createElement(es_default2, {
      visible,
      // Used for minus flex gap style only
      motionName: `${prefixCls}-loading-icon-motion`,
      motionAppear: !mount2,
      motionEnter: !mount2,
      motionLeave: !mount2,
      removeOnLeave: true,
      onAppearStart: getCollapsedWidth,
      onAppearActive: getRealWidth,
      onEnterStart: getCollapsedWidth,
      onEnterActive: getRealWidth,
      onLeaveStart: getRealWidth,
      onLeaveActive: getCollapsedWidth
    }, ({
      className: motionCls,
      style: motionStyle
    }, ref2) => {
      const mergedStyle = {
        ...style2,
        ...motionStyle
      };
      return /* @__PURE__ */ react_compat_default.createElement(InnerLoadingIcon, {
        prefixCls,
        className: clsx(className, motionCls),
        style: mergedStyle,
        ref: ref2
      });
    });
  };
  var DefaultLoadingIcon_default = DefaultLoadingIcon;

  // ../../node_modules/antd/es/style/motion/util.js
  var genNoMotionStyle = () => {
    return {
      "@media (prefers-reduced-motion: reduce)": {
        "&, &::before, &::after": {
          transition: "none",
          animation: "none"
        }
      }
    };
  };

  // ../../node_modules/antd/es/button/style/group.js
  var genButtonBorderStyle = (buttonTypeCls, borderColor) => ({
    // Border
    [`> span, > ${buttonTypeCls}`]: {
      "&:not(:last-child)": {
        [`&, & > ${buttonTypeCls}`]: {
          "&:not(:disabled)": {
            borderInlineEndColor: borderColor
          }
        }
      },
      "&:not(:first-child)": {
        [`&, & > ${buttonTypeCls}`]: {
          "&:not(:disabled)": {
            borderInlineStartColor: borderColor
          }
        }
      }
    }
  });
  var genGroupStyle = (token2) => {
    const {
      componentCls,
      fontSize,
      lineWidth,
      groupBorderColor,
      colorErrorHover
    } = token2;
    return {
      [`${componentCls}-group`]: [
        {
          position: "relative",
          display: "inline-flex",
          // Border
          [`> span, > ${componentCls}`]: {
            "&:not(:last-child)": {
              [`&, & > ${componentCls}`]: {
                borderStartEndRadius: 0,
                borderEndEndRadius: 0
              }
            },
            "&:not(:first-child)": {
              marginInlineStart: token2.calc(lineWidth).mul(-1).equal(),
              [`&, & > ${componentCls}`]: {
                borderStartStartRadius: 0,
                borderEndStartRadius: 0
              }
            }
          },
          [componentCls]: {
            position: "relative",
            zIndex: 1,
            "&:hover, &:focus, &:active": {
              zIndex: 2
            },
            "&[disabled]": {
              zIndex: 0
            }
          },
          [`${componentCls}-icon-only`]: {
            fontSize
          }
        },
        // Border Color
        genButtonBorderStyle(`${componentCls}-primary`, groupBorderColor),
        genButtonBorderStyle(`${componentCls}-danger`, colorErrorHover)
      ]
    };
  };
  var group_default = genGroupStyle;

  // ../../node_modules/@rc-component/color-picker/es/color.js
  var getRoundNumber = (value) => Math.round(Number(value || 0));
  var convertHsb2Hsv = (color) => {
    if (color instanceof FastColor) {
      return color;
    }
    if (color && typeof color === "object" && "h" in color && "b" in color) {
      const {
        b,
        ...resets
      } = color;
      return {
        ...resets,
        v: b
      };
    }
    if (typeof color === "string" && /hsb/.test(color)) {
      return color.replace(/hsb/, "hsv");
    }
    return color;
  };
  var Color = class extends FastColor {
    constructor(color) {
      super(convertHsb2Hsv(color));
    }
    toHsbString() {
      const hsb = this.toHsb();
      const saturation = getRoundNumber(hsb.s * 100);
      const lightness = getRoundNumber(hsb.b * 100);
      const hue = getRoundNumber(hsb.h);
      const alpha = hsb.a;
      const hsbString = `hsb(${hue}, ${saturation}%, ${lightness}%)`;
      const hsbaString = `hsba(${hue}, ${saturation}%, ${lightness}%, ${alpha.toFixed(alpha === 0 ? 0 : 2)})`;
      return alpha === 1 ? hsbString : hsbaString;
    }
    toHsb() {
      const {
        v,
        ...resets
      } = this.toHsv();
      return {
        ...resets,
        b: v,
        a: this.a
      };
    }
  };

  // ../../node_modules/@rc-component/color-picker/es/util.js
  var ColorPickerPrefixCls = "rc-color-picker";
  var generateColor = (color) => {
    if (color instanceof Color) {
      return color;
    }
    return new Color(color);
  };
  var defaultColor = generateColor("#1677ff");
  var calculateColor = (props) => {
    const {
      offset,
      targetRef,
      containerRef,
      color,
      type
    } = props;
    const {
      width,
      height
    } = containerRef.current.getBoundingClientRect();
    const {
      width: targetWidth,
      height: targetHeight
    } = targetRef.current.getBoundingClientRect();
    const centerOffsetX = targetWidth / 2;
    const centerOffsetY = targetHeight / 2;
    const saturation = (offset.x + centerOffsetX) / width;
    const bright = 1 - (offset.y + centerOffsetY) / height;
    const hsb = color.toHsb();
    const alphaOffset = saturation;
    const hueOffset = (offset.x + centerOffsetX) / width * 360;
    if (type) {
      switch (type) {
        case "hue":
          return generateColor({
            ...hsb,
            h: hueOffset <= 0 ? 0 : hueOffset
          });
        case "alpha":
          return generateColor({
            ...hsb,
            a: alphaOffset <= 0 ? 0 : alphaOffset
          });
      }
    }
    return generateColor({
      h: hsb.h,
      s: saturation <= 0 ? 0 : saturation,
      b: bright >= 1 ? 1 : bright,
      a: hsb.a
    });
  };
  var calcOffset = (color, type) => {
    const hsb = color.toHsb();
    switch (type) {
      case "hue":
        return {
          x: hsb.h / 360 * 100,
          y: 50
        };
      case "alpha":
        return {
          x: color.a * 100,
          y: 50
        };
      // Picker panel
      default:
        return {
          x: hsb.s * 100,
          y: (1 - hsb.b) * 100
        };
    }
  };

  // ../../node_modules/@rc-component/color-picker/es/components/ColorBlock.js
  var ColorBlock = ({
    color,
    prefixCls,
    className,
    style: style2,
    innerClassName,
    innerStyle,
    onClick
  }) => {
    const colorBlockCls = `${prefixCls}-color-block`;
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      className: clsx(colorBlockCls, className),
      style: style2,
      onClick
    }, /* @__PURE__ */ react_compat_default.createElement("div", {
      className: clsx(`${colorBlockCls}-inner`, innerClassName),
      style: {
        background: color,
        ...innerStyle
      }
    }));
  };
  var ColorBlock_default = ColorBlock;

  // ../../node_modules/@rc-component/color-picker/es/hooks/useColorDrag.js
  function getPosition(e) {
    const obj = "touches" in e ? e.touches[0] : e;
    const scrollXOffset = document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset;
    const scrollYOffset = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
    return {
      pageX: obj.pageX - scrollXOffset,
      pageY: obj.pageY - scrollYOffset
    };
  }
  function useColorDrag(props) {
    const {
      targetRef,
      containerRef,
      direction,
      onDragChange,
      onDragChangeComplete,
      calculate,
      color,
      disabledDrag
    } = props;
    const [offsetValue, setOffsetValue] = useState({
      x: 0,
      y: 0
    });
    const mouseMoveRef = useRef(null);
    const mouseUpRef = useRef(null);
    useEffect(() => {
      setOffsetValue(calculate());
    }, [color]);
    useEffect(() => () => {
      document.removeEventListener("mousemove", mouseMoveRef.current);
      document.removeEventListener("mouseup", mouseUpRef.current);
      document.removeEventListener("touchmove", mouseMoveRef.current);
      document.removeEventListener("touchend", mouseUpRef.current);
      mouseMoveRef.current = null;
      mouseUpRef.current = null;
    }, []);
    const updateOffset = (e) => {
      const {
        pageX,
        pageY
      } = getPosition(e);
      const {
        x: rectX,
        y: rectY,
        width,
        height
      } = containerRef.current.getBoundingClientRect();
      const {
        width: targetWidth,
        height: targetHeight
      } = targetRef.current.getBoundingClientRect();
      const centerOffsetX = targetWidth / 2;
      const centerOffsetY = targetHeight / 2;
      const offsetX = Math.max(0, Math.min(pageX - rectX, width)) - centerOffsetX;
      const offsetY = Math.max(0, Math.min(pageY - rectY, height)) - centerOffsetY;
      const calcOffset2 = {
        x: offsetX,
        y: direction === "x" ? offsetValue.y : offsetY
      };
      if (targetWidth === 0 && targetHeight === 0 || targetWidth !== targetHeight) {
        return false;
      }
      onDragChange?.(calcOffset2);
    };
    const onDragMove = (e) => {
      e.preventDefault();
      updateOffset(e);
    };
    const onDragStop = (e) => {
      e.preventDefault();
      document.removeEventListener("mousemove", mouseMoveRef.current);
      document.removeEventListener("mouseup", mouseUpRef.current);
      document.removeEventListener("touchmove", mouseMoveRef.current);
      document.removeEventListener("touchend", mouseUpRef.current);
      mouseMoveRef.current = null;
      mouseUpRef.current = null;
      onDragChangeComplete?.();
    };
    const onDragStart = (e) => {
      document.removeEventListener("mousemove", mouseMoveRef.current);
      document.removeEventListener("mouseup", mouseUpRef.current);
      if (disabledDrag) {
        return;
      }
      updateOffset(e);
      document.addEventListener("mousemove", onDragMove);
      document.addEventListener("mouseup", onDragStop);
      document.addEventListener("touchmove", onDragMove);
      document.addEventListener("touchend", onDragStop);
      mouseMoveRef.current = onDragMove;
      mouseUpRef.current = onDragStop;
    };
    return [offsetValue, onDragStart];
  }
  var useColorDrag_default = useColorDrag;

  // ../../node_modules/@rc-component/color-picker/es/components/Handler.js
  var Handler = ({
    size = "default",
    color,
    prefixCls
  }) => {
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      className: clsx(`${prefixCls}-handler`, {
        [`${prefixCls}-handler-sm`]: size === "small"
      }),
      style: {
        backgroundColor: color
      }
    });
  };
  var Handler_default = Handler;

  // ../../node_modules/@rc-component/color-picker/es/components/Palette.js
  var Palette = ({
    children,
    style: style2,
    prefixCls
  }) => {
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      className: `${prefixCls}-palette`,
      style: {
        position: "relative",
        ...style2
      }
    }, children);
  };
  var Palette_default = Palette;

  // ../../node_modules/@rc-component/color-picker/es/components/Transform.js
  var Transform = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      children,
      x,
      y
    } = props;
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      ref: ref2,
      style: {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        zIndex: 1,
        transform: "translate(-50%, -50%)"
      }
    }, children);
  });
  var Transform_default = Transform;

  // ../../node_modules/@rc-component/color-picker/es/components/Picker.js
  var Picker = ({
    color,
    onChange,
    prefixCls,
    onChangeComplete,
    disabled
  }) => {
    const pickerRef = useRef();
    const transformRef = useRef();
    const colorRef = useRef(color);
    const onDragChange = useEvent_default((offsetValue) => {
      const calcColor = calculateColor({
        offset: offsetValue,
        targetRef: transformRef,
        containerRef: pickerRef,
        color
      });
      colorRef.current = calcColor;
      onChange(calcColor);
    });
    const [offset, dragStartHandle] = useColorDrag_default({
      color,
      containerRef: pickerRef,
      targetRef: transformRef,
      calculate: () => calcOffset(color),
      onDragChange,
      onDragChangeComplete: () => onChangeComplete?.(colorRef.current),
      disabledDrag: disabled
    });
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      ref: pickerRef,
      className: `${prefixCls}-select`,
      onMouseDown: dragStartHandle,
      onTouchStart: dragStartHandle
    }, /* @__PURE__ */ react_compat_default.createElement(Palette_default, {
      prefixCls
    }, /* @__PURE__ */ react_compat_default.createElement(Transform_default, {
      x: offset.x,
      y: offset.y,
      ref: transformRef
    }, /* @__PURE__ */ react_compat_default.createElement(Handler_default, {
      color: color.toRgbString(),
      prefixCls
    })), /* @__PURE__ */ react_compat_default.createElement("div", {
      className: `${prefixCls}-saturation`,
      style: {
        backgroundColor: `hsl(${color.toHsb().h},100%, 50%)`,
        backgroundImage: "linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))"
      }
    })));
  };
  var Picker_default = Picker;

  // ../../node_modules/@rc-component/color-picker/es/hooks/useColorState.js
  var useColorState = (defaultValue, value) => {
    const [mergedValue, setValue] = useControlledState(defaultValue, value);
    const color = useMemo(() => generateColor(mergedValue), [mergedValue]);
    return [color, setValue];
  };
  var useColorState_default = useColorState;

  // ../../node_modules/@rc-component/color-picker/es/components/Gradient.js
  var Gradient = ({
    colors,
    children,
    direction = "to right",
    type,
    prefixCls
  }) => {
    const gradientColors = useMemo(() => colors.map((color, idx) => {
      let result = generateColor(color);
      if (type === "alpha" && idx === colors.length - 1) {
        result = new Color(result.setA(1));
      }
      return result.toRgbString();
    }).join(","), [colors, type]);
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      className: `${prefixCls}-gradient`,
      style: {
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${direction}, ${gradientColors})`
      }
    }, children);
  };
  var Gradient_default = Gradient;

  // ../../node_modules/@rc-component/color-picker/es/components/Slider.js
  var Slider = (props) => {
    const {
      prefixCls,
      colors,
      disabled,
      onChange,
      onChangeComplete,
      color,
      type
    } = props;
    const sliderRef = useRef(null);
    const transformRef = useRef(null);
    const colorRef = useRef(color);
    const getValue2 = (c) => {
      return type === "hue" ? c.getHue() : c.a * 100;
    };
    const onDragChange = useEvent_default((offsetValue) => {
      const calcColor = calculateColor({
        offset: offsetValue,
        targetRef: transformRef,
        containerRef: sliderRef,
        color,
        type
      });
      colorRef.current = calcColor;
      onChange(getValue2(calcColor));
    });
    const [offset, dragStartHandle] = useColorDrag_default({
      color,
      targetRef: transformRef,
      containerRef: sliderRef,
      calculate: () => calcOffset(color, type),
      onDragChange,
      onDragChangeComplete() {
        onChangeComplete(getValue2(colorRef.current));
      },
      direction: "x",
      disabledDrag: disabled
    });
    const handleColor = react_compat_default.useMemo(() => {
      if (type === "hue") {
        const hsb = color.toHsb();
        hsb.s = 1;
        hsb.b = 1;
        hsb.a = 1;
        const lightColor = new Color(hsb);
        return lightColor;
      }
      return color;
    }, [color, type]);
    const gradientList = react_compat_default.useMemo(() => colors.map((info) => `${info.color} ${info.percent}%`), [colors]);
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      ref: sliderRef,
      className: clsx(`${prefixCls}-slider`, `${prefixCls}-slider-${type}`),
      onMouseDown: dragStartHandle,
      onTouchStart: dragStartHandle
    }, /* @__PURE__ */ react_compat_default.createElement(Palette_default, {
      prefixCls
    }, /* @__PURE__ */ react_compat_default.createElement(Transform_default, {
      x: offset.x,
      y: offset.y,
      ref: transformRef
    }, /* @__PURE__ */ react_compat_default.createElement(Handler_default, {
      size: "small",
      color: handleColor.toHexString(),
      prefixCls
    })), /* @__PURE__ */ react_compat_default.createElement(Gradient_default, {
      colors: gradientList,
      type,
      prefixCls
    })));
  };
  var Slider_default = Slider;

  // ../../node_modules/@rc-component/color-picker/es/hooks/useComponent.js
  function useComponent(components) {
    return useMemo(() => {
      const {
        slider: slider2
      } = components || {};
      return [slider2 || Slider_default];
    }, [components]);
  }

  // ../../node_modules/@rc-component/color-picker/es/ColorPicker.js
  function _extends13() {
    _extends13 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends13.apply(this, arguments);
  }
  var HUE_COLORS = [{
    color: "rgb(255, 0, 0)",
    percent: 0
  }, {
    color: "rgb(255, 255, 0)",
    percent: 17
  }, {
    color: "rgb(0, 255, 0)",
    percent: 33
  }, {
    color: "rgb(0, 255, 255)",
    percent: 50
  }, {
    color: "rgb(0, 0, 255)",
    percent: 67
  }, {
    color: "rgb(255, 0, 255)",
    percent: 83
  }, {
    color: "rgb(255, 0, 0)",
    percent: 100
  }];
  var ColorPicker = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      value,
      defaultValue,
      prefixCls = ColorPickerPrefixCls,
      onChange,
      onChangeComplete,
      className,
      style: style2,
      panelRender,
      disabledAlpha = false,
      disabled = false,
      components
    } = props;
    const [Slider2] = useComponent(components);
    const [colorValue, setColorValue] = useColorState_default(defaultValue || defaultColor, value);
    const alphaColor = useMemo(() => colorValue.setA(1).toRgbString(), [colorValue]);
    const handleChange = (data, type) => {
      if (!value) {
        setColorValue(data);
      }
      onChange?.(data, type);
    };
    const getHueColor = (hue) => new Color(colorValue.setHue(hue));
    const getAlphaColor3 = (alpha) => new Color(colorValue.setA(alpha / 100));
    const onHueChange = (hue) => {
      handleChange(getHueColor(hue), {
        type: "hue",
        value: hue
      });
    };
    const onAlphaChange = (alpha) => {
      handleChange(getAlphaColor3(alpha), {
        type: "alpha",
        value: alpha
      });
    };
    const onHueChangeComplete = (hue) => {
      if (onChangeComplete) {
        onChangeComplete(getHueColor(hue));
      }
    };
    const onAlphaChangeComplete = (alpha) => {
      if (onChangeComplete) {
        onChangeComplete(getAlphaColor3(alpha));
      }
    };
    const mergeCls = clsx(`${prefixCls}-panel`, className, {
      [`${prefixCls}-panel-disabled`]: disabled
    });
    const sharedSliderProps = {
      prefixCls,
      disabled,
      color: colorValue
    };
    const defaultPanel = /* @__PURE__ */ react_compat_default.createElement(react_compat_default.Fragment, null, /* @__PURE__ */ react_compat_default.createElement(Picker_default, _extends13({
      onChange: handleChange
    }, sharedSliderProps, {
      onChangeComplete
    })), /* @__PURE__ */ react_compat_default.createElement("div", {
      className: `${prefixCls}-slider-container`
    }, /* @__PURE__ */ react_compat_default.createElement("div", {
      className: clsx(`${prefixCls}-slider-group`, {
        [`${prefixCls}-slider-group-disabled-alpha`]: disabledAlpha
      })
    }, /* @__PURE__ */ react_compat_default.createElement(Slider2, _extends13({}, sharedSliderProps, {
      type: "hue",
      colors: HUE_COLORS,
      min: 0,
      max: 359,
      value: colorValue.getHue(),
      onChange: onHueChange,
      onChangeComplete: onHueChangeComplete
    })), !disabledAlpha && /* @__PURE__ */ react_compat_default.createElement(Slider2, _extends13({}, sharedSliderProps, {
      type: "alpha",
      colors: [{
        percent: 0,
        color: "rgba(255, 0, 4, 0)"
      }, {
        percent: 100,
        color: alphaColor
      }],
      min: 0,
      max: 100,
      value: colorValue.a * 100,
      onChange: onAlphaChange,
      onChangeComplete: onAlphaChangeComplete
    }))), /* @__PURE__ */ react_compat_default.createElement(ColorBlock_default, {
      color: colorValue.toRgbString(),
      prefixCls
    })));
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      className: mergeCls,
      style: style2,
      ref: ref2
    }, typeof panelRender === "function" ? panelRender(defaultPanel) : defaultPanel);
  });
  if (true) {
    ColorPicker.displayName = "ColorPicker";
  }

  // ../../node_modules/antd/es/color-picker/color.js
  var toHexFormat = (value, alpha) => value?.replace(/[^0-9a-f]/gi, "").slice(0, alpha ? 8 : 6) || "";
  var getHex = (value, alpha) => value ? toHexFormat(value, alpha) : "";
  var AggregationColor = /* @__PURE__ */ function() {
    function AggregationColor2(color) {
      _classCallCheck(this, AggregationColor2);
      this.cleared = false;
      if (color instanceof AggregationColor2) {
        this.metaColor = color.metaColor.clone();
        this.colors = color.colors?.map((info) => ({
          color: new AggregationColor2(info.color),
          percent: info.percent
        }));
        this.cleared = color.cleared;
        return;
      }
      const isArray = Array.isArray(color);
      if (isArray && color.length) {
        this.colors = color.map(({
          color: c,
          percent
        }) => ({
          color: new AggregationColor2(c),
          percent
        }));
        this.metaColor = new Color(this.colors[0].color.metaColor);
      } else {
        this.metaColor = new Color(isArray ? "" : color);
      }
      if (!color || isArray && !this.colors) {
        this.metaColor = this.metaColor.setA(0);
        this.cleared = true;
      }
    }
    return _createClass(AggregationColor2, [{
      key: "toHsb",
      value: function toHsb() {
        return this.metaColor.toHsb();
      }
    }, {
      key: "toHsbString",
      value: function toHsbString() {
        return this.metaColor.toHsbString();
      }
    }, {
      key: "toHex",
      value: function toHex() {
        return getHex(this.toHexString(), this.metaColor.a < 1);
      }
    }, {
      key: "toHexString",
      value: function toHexString() {
        return this.metaColor.toHexString();
      }
    }, {
      key: "toRgb",
      value: function toRgb() {
        return this.metaColor.toRgb();
      }
    }, {
      key: "toRgbString",
      value: function toRgbString() {
        return this.metaColor.toRgbString();
      }
    }, {
      key: "isGradient",
      value: function isGradient() {
        return !!this.colors && !this.cleared;
      }
    }, {
      key: "getColors",
      value: function getColors() {
        return this.colors || [{
          color: this,
          percent: 0
        }];
      }
    }, {
      key: "toCssString",
      value: function toCssString() {
        const {
          colors
        } = this;
        if (colors) {
          const colorsStr = colors.map((c) => `${c.color.toRgbString()} ${c.percent}%`).join(", ");
          return `linear-gradient(90deg, ${colorsStr})`;
        }
        return this.metaColor.toRgbString();
      }
    }, {
      key: "equals",
      value: function equals(color) {
        if (!color || this.isGradient() !== color.isGradient()) {
          return false;
        }
        if (!this.isGradient()) {
          return this.toHexString() === color.toHexString();
        }
        return this.colors.length === color.colors.length && this.colors.every((c, i) => {
          const target = color.colors[i];
          return c.percent === target.percent && c.color.equals(target.color);
        });
      }
    }]);
  }();

  // ../../node_modules/antd/es/color-picker/components/ColorPresets.js
  var isBright = (value, bgColorToken) => {
    const {
      r: r2,
      g,
      b,
      a: a2
    } = value.toRgb();
    const hsv = new Color(value.toRgbString()).onBackground(bgColorToken).toHsv();
    if (a2 <= 0.5) {
      return hsv.v > 0.5;
    }
    return r2 * 0.299 + g * 0.587 + b * 0.114 > 192;
  };

  // ../../node_modules/antd/es/button/style/token.js
  var prepareToken = (token2) => {
    const {
      paddingInline,
      onlyIconSize,
      borderColorDisabled
    } = token2;
    const buttonToken = merge2(token2, {
      buttonPaddingHorizontal: paddingInline,
      buttonPaddingVertical: 0,
      buttonIconOnlyFontSize: onlyIconSize,
      colorBorderDisabled: borderColorDisabled
    });
    return buttonToken;
  };
  var prepareComponentToken2 = (token2) => {
    const contentFontSize = token2.contentFontSize ?? token2.fontSize;
    const contentFontSizeSM = token2.contentFontSizeSM ?? token2.fontSize;
    const contentFontSizeLG = token2.contentFontSizeLG ?? token2.fontSizeLG;
    const contentLineHeight = token2.contentLineHeight ?? getLineHeight(contentFontSize);
    const contentLineHeightSM = token2.contentLineHeightSM ?? getLineHeight(contentFontSizeSM);
    const contentLineHeightLG = token2.contentLineHeightLG ?? getLineHeight(contentFontSizeLG);
    const solidTextColor = isBright(new AggregationColor(token2.colorBgSolid), "#fff") ? "#000" : "#fff";
    const shadowColorTokens = PresetColors.reduce((prev2, colorKey) => ({
      ...prev2,
      [`${colorKey}ShadowColor`]: `0 ${unit(token2.controlOutlineWidth)} 0 ${getAlphaColor_default(token2[`${colorKey}1`], token2.colorBgContainer)}`
    }), {});
    const defaultBgDisabled = token2.colorBgContainerDisabled;
    const dashedBgDisabled = token2.colorBgContainerDisabled;
    return {
      ...shadowColorTokens,
      fontWeight: 400,
      iconGap: token2.marginXS,
      defaultShadow: `0 ${token2.controlOutlineWidth}px 0 ${token2.controlTmpOutline}`,
      primaryShadow: `0 ${token2.controlOutlineWidth}px 0 ${token2.controlOutline}`,
      dangerShadow: `0 ${token2.controlOutlineWidth}px 0 ${token2.colorErrorOutline}`,
      primaryColor: token2.colorTextLightSolid,
      dangerColor: token2.colorTextLightSolid,
      borderColorDisabled: token2.colorBorderDisabled,
      defaultGhostColor: token2.colorBgContainer,
      ghostBg: "transparent",
      defaultGhostBorderColor: token2.colorBgContainer,
      paddingInline: token2.paddingContentHorizontal - token2.lineWidth,
      paddingInlineLG: token2.paddingContentHorizontal - token2.lineWidth,
      paddingInlineSM: 8 - token2.lineWidth,
      onlyIconSize: "inherit",
      onlyIconSizeSM: "inherit",
      onlyIconSizeLG: "inherit",
      groupBorderColor: token2.colorPrimaryHover,
      linkHoverBg: "transparent",
      textTextColor: token2.colorText,
      textTextHoverColor: token2.colorText,
      textTextActiveColor: token2.colorText,
      textHoverBg: token2.colorFillTertiary,
      defaultColor: token2.colorText,
      defaultBg: token2.colorBgContainer,
      defaultBorderColor: token2.colorBorder,
      defaultBorderColorDisabled: token2.colorBorder,
      defaultHoverBg: token2.colorBgContainer,
      defaultHoverColor: token2.colorPrimaryHover,
      defaultHoverBorderColor: token2.colorPrimaryHover,
      defaultActiveBg: token2.colorBgContainer,
      defaultActiveColor: token2.colorPrimaryActive,
      defaultActiveBorderColor: token2.colorPrimaryActive,
      solidTextColor,
      contentFontSize,
      contentFontSizeSM,
      contentFontSizeLG,
      contentLineHeight,
      contentLineHeightSM,
      contentLineHeightLG,
      paddingBlock: Math.max((token2.controlHeight - contentFontSize * contentLineHeight) / 2 - token2.lineWidth, 0),
      paddingBlockSM: Math.max((token2.controlHeightSM - contentFontSizeSM * contentLineHeightSM) / 2 - token2.lineWidth, 0),
      paddingBlockLG: Math.max((token2.controlHeightLG - contentFontSizeLG * contentLineHeightLG) / 2 - token2.lineWidth, 0),
      defaultBgDisabled,
      dashedBgDisabled
    };
  };

  // ../../node_modules/antd/es/button/style/variant.js
  var genVariantStyle = (token2) => {
    const {
      componentCls,
      antCls,
      lineWidth,
      lineType
    } = token2;
    const [varName, varRef] = genCssVar(antCls, "btn");
    return {
      [componentCls]: [
        // ==============================================================
        // ==                         Variable                         ==
        // ==============================================================
        {
          // Border
          [varName("border-width")]: lineWidth,
          [varName("border-color")]: "#000",
          [varName("border-color-hover")]: varRef("border-color"),
          [varName("border-color-active")]: varRef("border-color"),
          [varName("border-color-disabled")]: varRef("border-color"),
          [varName("border-style")]: lineType,
          // Text
          [varName("text-color")]: "#000",
          [varName("text-color-hover")]: varRef("text-color"),
          [varName("text-color-active")]: varRef("text-color"),
          [varName("text-color-disabled")]: varRef("text-color"),
          // Background
          [varName("bg-color")]: "#ddd",
          [varName("bg-color-hover")]: varRef("bg-color"),
          [varName("bg-color-active")]: varRef("bg-color"),
          [varName("bg-color-disabled")]: token2.colorBgContainerDisabled,
          [varName("bg-color-container")]: token2.colorBgContainer,
          // Shadow
          [varName("shadow")]: "none"
        },
        // ==============================================================
        // ==                         Template                         ==
        // ==============================================================
        {
          // Basic
          border: [varRef("border-width"), varRef("border-style"), varRef("border-color")].join(" "),
          color: varRef("text-color"),
          backgroundColor: varRef("bg-color"),
          // Status
          [`&:not(:disabled):not(${componentCls}-disabled)`]: {
            // Hover
            "&:hover": {
              border: [varRef("border-width"), varRef("border-style"), varRef("border-color-hover")].join(" "),
              color: varRef("text-color-hover"),
              backgroundColor: varRef("bg-color-hover")
            },
            // Active
            "&:active": {
              border: [varRef("border-width"), varRef("border-style"), varRef("border-color-active")].join(" "),
              color: varRef("text-color-active"),
              backgroundColor: varRef("bg-color-active")
            }
          }
        },
        // ==============================================================
        // ==                         Variants                         ==
        // ==============================================================
        {
          // >>>>> Solid
          [`&${componentCls}-variant-solid`]: {
            // Solid Variables
            [varName("solid-bg-color")]: varRef("color-base"),
            [varName("solid-bg-color-hover")]: varRef("color-hover"),
            [varName("solid-bg-color-active")]: varRef("color-active"),
            // Variables
            [varName("border-color")]: "transparent",
            [varName("text-color")]: token2.colorTextLightSolid,
            [varName("bg-color")]: varRef("solid-bg-color"),
            [varName("bg-color-hover")]: varRef("solid-bg-color-hover"),
            [varName("bg-color-active")]: varRef("solid-bg-color-active"),
            // Box Shadow
            boxShadow: varRef("shadow")
          },
          // >>>>> Outlined & Dashed
          [`&${componentCls}-variant-outlined, &${componentCls}-variant-dashed`]: {
            [varName("border-color")]: varRef("color-base"),
            [varName("border-color-hover")]: varRef("color-hover"),
            [varName("border-color-active")]: varRef("color-active"),
            [varName("bg-color")]: varRef("bg-color-container"),
            [varName("text-color")]: varRef("color-base"),
            [varName("text-color-hover")]: varRef("color-hover"),
            [varName("text-color-active")]: varRef("color-active"),
            // Box Shadow
            boxShadow: varRef("shadow")
          },
          // >>>>> Dashed
          [`&${componentCls}-variant-dashed`]: {
            [varName("border-style")]: "dashed",
            [varName("bg-color-disabled")]: token2.dashedBgDisabled
          },
          // >>>>> Filled
          [`&${componentCls}-variant-filled`]: {
            [varName("border-color")]: "transparent",
            [varName("text-color")]: varRef("color-base"),
            [varName("bg-color")]: varRef("color-light"),
            [varName("bg-color-hover")]: varRef("color-light-hover"),
            [varName("bg-color-active")]: varRef("color-light-active")
          },
          // >>>>> Text & Link
          [`&${componentCls}-variant-text, &${componentCls}-variant-link`]: {
            [varName("border-color")]: "transparent",
            [varName("text-color")]: varRef("color-base"),
            [varName("text-color-hover")]: varRef("color-hover"),
            [varName("text-color-active")]: varRef("color-active"),
            [varName("bg-color")]: "transparent",
            [varName("bg-color-hover")]: "transparent",
            [varName("bg-color-active")]: "transparent",
            [`&:disabled, &${token2.componentCls}-disabled`]: {
              background: "transparent",
              borderColor: "transparent"
            }
          },
          // >>>>> Text
          [`&${componentCls}-variant-text`]: {
            [varName("bg-color-hover")]: varRef("color-light"),
            [varName("bg-color-active")]: varRef("color-light-active")
          }
        },
        // ==============================================================
        // ==                          Colors                          ==
        // ==============================================================
        {
          // ======================== By Default ========================
          // >>>>> Link
          [`&${componentCls}-variant-link`]: {
            [varName("color-base")]: token2.colorLink,
            [varName("color-hover")]: token2.colorLinkHover,
            [varName("color-active")]: token2.colorLinkActive,
            [varName("bg-color-hover")]: token2.linkHoverBg
          },
          // ======================== Compatible ========================
          // >>>>> Primary
          [`&${componentCls}-color-primary`]: {
            [varName("color-base")]: token2.colorPrimary,
            [varName("color-hover")]: token2.colorPrimaryHover,
            [varName("color-active")]: token2.colorPrimaryActive,
            [varName("color-light")]: token2.colorPrimaryBg,
            [varName("color-light-hover")]: token2.colorPrimaryBgHover,
            [varName("color-light-active")]: token2.colorPrimaryBorder,
            [varName("shadow")]: token2.primaryShadow,
            [`&${componentCls}-variant-solid`]: {
              [varName("text-color")]: token2.primaryColor,
              [varName("text-color-hover")]: varRef("text-color"),
              [varName("text-color-active")]: varRef("text-color")
            }
          },
          // >>>>> Danger
          [`&${componentCls}-color-dangerous`]: {
            [varName("color-base")]: token2.colorError,
            [varName("color-hover")]: token2.colorErrorHover,
            [varName("color-active")]: token2.colorErrorActive,
            [varName("color-light")]: token2.colorErrorBg,
            [varName("color-light-hover")]: token2.colorErrorBgFilledHover,
            [varName("color-light-active")]: token2.colorErrorBgActive,
            [varName("shadow")]: token2.dangerShadow,
            [`&${componentCls}-variant-solid`]: {
              [varName("text-color")]: token2.dangerColor,
              [varName("text-color-hover")]: varRef("text-color"),
              [varName("text-color-active")]: varRef("text-color")
            }
          },
          // >>>>> Default
          [`&${componentCls}-color-default`]: {
            [varName("solid-bg-color")]: token2.colorBgSolid,
            [varName("solid-bg-color-hover")]: token2.colorBgSolidHover,
            [varName("solid-bg-color-active")]: token2.colorBgSolidActive,
            [varName("color-base")]: token2.defaultBorderColor,
            [varName("color-hover")]: token2.defaultHoverBorderColor,
            [varName("color-active")]: token2.defaultActiveBorderColor,
            [varName("color-light")]: token2.colorFillTertiary,
            [varName("color-light-hover")]: token2.colorFillSecondary,
            [varName("color-light-active")]: token2.colorFill,
            [varName("text-color")]: token2.defaultColor,
            [varName("text-color-hover")]: token2.defaultHoverColor,
            [varName("text-color-active")]: token2.defaultActiveColor,
            [varName("shadow")]: token2.defaultShadow,
            [`&${componentCls}-variant-outlined`]: {
              [varName("bg-color-disabled")]: token2.defaultBgDisabled
            },
            [`&${componentCls}-variant-solid`]: {
              [varName("text-color")]: token2.solidTextColor,
              [varName("text-color-hover")]: varRef("text-color"),
              [varName("text-color-active")]: varRef("text-color")
            },
            [`&${componentCls}-variant-filled, &${componentCls}-variant-text`]: {
              [varName("text-color-hover")]: varRef("text-color"),
              [varName("text-color-active")]: varRef("text-color")
            },
            [`&${componentCls}-variant-outlined, &${componentCls}-variant-dashed`]: {
              [varName("text-color")]: token2.defaultColor,
              [varName("text-color-hover")]: token2.defaultHoverColor,
              [varName("text-color-active")]: token2.defaultActiveColor,
              [varName("bg-color-container")]: token2.defaultBg,
              [varName("bg-color-hover")]: token2.defaultHoverBg,
              [varName("bg-color-active")]: token2.defaultActiveBg
            },
            [`&${componentCls}-variant-text`]: {
              [varName("text-color")]: token2.textTextColor,
              [varName("text-color-hover")]: token2.textTextHoverColor,
              [varName("text-color-active")]: token2.textTextActiveColor,
              [varName("bg-color-hover")]: token2.textHoverBg
            },
            [`&${componentCls}-background-ghost`]: {
              [`&${componentCls}-variant-outlined, &${componentCls}-variant-dashed`]: {
                [varName("text-color")]: token2.defaultGhostColor,
                [varName("border-color")]: token2.defaultGhostBorderColor
              }
            }
          }
        },
        // >>>>> Preset Colors
        PresetColors.map((colorKey) => {
          const darkColor = token2[`${colorKey}6`];
          const lightColor = token2[`${colorKey}1`];
          const hoverColor = token2[`${colorKey}Hover`];
          const lightHoverColor = token2[`${colorKey}2`];
          const lightActiveColor = token2[`${colorKey}3`];
          const activeColor = token2[`${colorKey}Active`];
          const shadowColor = token2[`${colorKey}ShadowColor`];
          return {
            [`&${componentCls}-color-${colorKey}`]: {
              [varName("color-base")]: darkColor,
              [varName("color-hover")]: hoverColor,
              [varName("color-active")]: activeColor,
              [varName("color-light")]: lightColor,
              [varName("color-light-hover")]: lightHoverColor,
              [varName("color-light-active")]: lightActiveColor,
              [varName("shadow")]: shadowColor
            }
          };
        }),
        // ==============================================================
        // ==                         Disabled                         ==
        // ==============================================================
        {
          // Disabled
          [`&:disabled, &${token2.componentCls}-disabled`]: {
            cursor: "not-allowed",
            borderColor: token2.colorBorderDisabled,
            background: varRef("bg-color-disabled"),
            color: token2.colorTextDisabled,
            boxShadow: "none"
          }
        },
        // ==============================================================
        // ==                          Ghost                           ==
        // ==============================================================
        {
          // Ghost
          [`&${componentCls}-background-ghost`]: {
            [varName("bg-color")]: token2.ghostBg,
            [varName("bg-color-hover")]: token2.ghostBg,
            [varName("bg-color-active")]: token2.ghostBg,
            [varName("shadow")]: "none",
            [`&${componentCls}-variant-outlined, &${componentCls}-variant-dashed`]: {
              [varName("bg-color-hover")]: token2.ghostBg,
              [varName("bg-color-active")]: token2.ghostBg
            }
          }
        }
      ]
    };
  };
  var variant_default = genVariantStyle;

  // ../../node_modules/antd/es/button/style/index.js
  var genSharedButtonStyle = (token2) => {
    const {
      componentCls,
      iconCls,
      fontWeight,
      opacityLoading,
      motionDurationSlow,
      motionEaseInOut,
      iconGap,
      calc
    } = token2;
    return {
      [componentCls]: {
        outline: "none",
        position: "relative",
        display: "inline-flex",
        gap: iconGap,
        alignItems: "center",
        justifyContent: "center",
        fontWeight,
        whiteSpace: "nowrap",
        textAlign: "center",
        backgroundImage: "none",
        cursor: "pointer",
        transition: `all ${token2.motionDurationMid} ${token2.motionEaseInOut}`,
        userSelect: "none",
        touchAction: "manipulation",
        ...genNoMotionStyle(),
        "&:disabled > *": {
          pointerEvents: "none"
        },
        // https://github.com/ant-design/ant-design/issues/51380
        [`${componentCls}-icon > svg`]: resetIcon(),
        // https://github.com/ant-design/ant-design/issues/57727
        [`${componentCls}-icon`]: {
          display: "inline-flex",
          alignItems: "center",
          [iconCls]: {
            verticalAlign: "middle",
            // Baseline will align the first element.
            // So the Button with SVG will make the baseline to be the bottom of the SVG.
            // Let's use `:before` to add a space to make the baseline to be the center of the Button.
            // https://github.com/ant-design/ant-design/issues/58428
            "&:before": {
              content: '"\\a0"',
              display: "inline-block",
              width: 0
            }
          }
        },
        "> a": {
          color: "currentColor"
        },
        "&:not(:disabled)": genFocusStyle(token2),
        [`&${componentCls}-two-chinese-chars::first-letter`]: {
          letterSpacing: "0.34em"
        },
        [`&${componentCls}-two-chinese-chars > *:not(${iconCls})`]: {
          marginInlineEnd: "-0.34em",
          letterSpacing: "0.34em"
        },
        [`&${componentCls}-icon-only`]: {
          paddingInline: 0,
          // make `btn-icon-only` not too narrow
          [`&${componentCls}-compact-item`]: {
            flex: "none"
          }
        },
        // Loading
        [`&${componentCls}-loading`]: {
          opacity: opacityLoading,
          cursor: "default"
        },
        [`${componentCls}-loading-icon`]: {
          transition: ["width", "opacity", "margin"].map((prop) => `${prop} ${motionDurationSlow} ${motionEaseInOut}`).join(",")
        },
        // iconPlacement
        [`&:not(${componentCls}-icon-end)`]: {
          [`${componentCls}-loading-icon-motion`]: {
            "&-appear-start, &-enter-start, &-appear-prepare, &-enter-prepare": {
              marginInlineEnd: calc(iconGap).mul(-1).equal(),
              opacity: 0
            },
            "&-appear-active, &-enter-active": {
              marginInlineEnd: 0
            },
            "&-leave-start": {
              marginInlineEnd: 0
            },
            "&-leave-active": {
              marginInlineEnd: calc(iconGap).mul(-1).equal()
            }
          }
        },
        "&-icon-end": {
          flexDirection: "row-reverse",
          [`${componentCls}-loading-icon-motion`]: {
            "&-appear-start, &-enter-start, &-appear-prepare, &-enter-prepare": {
              marginInlineStart: calc(iconGap).mul(-1).equal(),
              opacity: 0
            },
            "&-appear-active, &-enter-active": {
              marginInlineStart: 0
            },
            "&-leave-start": {
              marginInlineStart: 0
            },
            "&-leave-active": {
              marginInlineStart: calc(iconGap).mul(-1).equal()
            }
          }
        }
      }
    };
  };
  var genCircleButtonStyle = (token2) => ({
    minWidth: token2.controlHeight,
    paddingInline: 0,
    borderRadius: "50%"
  });
  var genButtonStyle = (token2, prefixCls = "") => {
    const {
      componentCls,
      controlHeight,
      fontSize,
      borderRadius,
      buttonPaddingHorizontal,
      iconCls,
      buttonPaddingVertical,
      buttonIconOnlyFontSize
    } = token2;
    return [
      {
        [prefixCls]: {
          fontSize,
          height: controlHeight,
          padding: `${unit(buttonPaddingVertical)} ${unit(buttonPaddingHorizontal)}`,
          borderRadius,
          [`&${componentCls}-icon-only`]: {
            width: controlHeight,
            [iconCls]: {
              fontSize: buttonIconOnlyFontSize
            }
          }
        }
      },
      // Shape - patch prefixCls again to override solid border radius style
      {
        [`${componentCls}${componentCls}-circle${prefixCls}`]: genCircleButtonStyle(token2)
      },
      {
        [`${componentCls}${componentCls}-round${prefixCls}`]: {
          borderRadius: token2.controlHeight,
          [`&:not(${componentCls}-icon-only)`]: {
            paddingInline: token2.buttonPaddingHorizontal
          }
        }
      }
    ];
  };
  var genSizeBaseButtonStyle = (token2) => {
    const baseToken = merge2(token2, {
      fontSize: token2.contentFontSize
    });
    return genButtonStyle(baseToken, token2.componentCls);
  };
  var genSizeSmallButtonStyle = (token2) => {
    const smallToken = merge2(token2, {
      controlHeight: token2.controlHeightSM,
      fontSize: token2.contentFontSizeSM,
      padding: token2.paddingXS,
      buttonPaddingHorizontal: token2.paddingInlineSM,
      buttonPaddingVertical: 0,
      borderRadius: token2.borderRadiusSM,
      buttonIconOnlyFontSize: token2.onlyIconSizeSM
    });
    return genButtonStyle(smallToken, `${token2.componentCls}-sm`);
  };
  var genSizeLargeButtonStyle = (token2) => {
    const largeToken = merge2(token2, {
      controlHeight: token2.controlHeightLG,
      fontSize: token2.contentFontSizeLG,
      buttonPaddingHorizontal: token2.paddingInlineLG,
      buttonPaddingVertical: 0,
      borderRadius: token2.borderRadiusLG,
      buttonIconOnlyFontSize: token2.onlyIconSizeLG
    });
    return genButtonStyle(largeToken, `${token2.componentCls}-lg`);
  };
  var genBlockButtonStyle = (token2) => {
    const {
      componentCls
    } = token2;
    return {
      [componentCls]: {
        [`&${componentCls}-block`]: {
          width: "100%"
        }
      }
    };
  };
  var style_default3 = genStyleHooks("Button", (token2) => {
    const buttonToken = prepareToken(token2);
    return [
      // Shared
      genSharedButtonStyle(buttonToken),
      // Size
      genSizeBaseButtonStyle(buttonToken),
      genSizeSmallButtonStyle(buttonToken),
      genSizeLargeButtonStyle(buttonToken),
      // Block
      genBlockButtonStyle(buttonToken),
      // Variant
      variant_default(buttonToken),
      // Button Group
      group_default(buttonToken)
    ];
  }, prepareComponentToken2, {
    unitless: {
      fontWeight: true,
      contentLineHeight: true,
      contentLineHeightSM: true,
      contentLineHeightLG: true
    }
  });

  // ../../node_modules/antd/es/style/compact-item.js
  function compactItemBorder(token2, parentCls, options, prefixCls) {
    const {
      focusElCls,
      focus,
      borderElCls
    } = options;
    const childCombinator = borderElCls ? "> *" : "";
    const suffix = childCombinator ? ` ${childCombinator}` : "";
    const genEffects = (effects) => effects.filter(Boolean).map((n) => `&:${n}${suffix}`).join(",");
    const hoverEffects = genEffects(["hover", focusElCls ? `hover${focusElCls}` : null]);
    const focusEffects = genEffects([focus ? "focus" : null, "active"]);
    return {
      [`&-item:not(${parentCls}-last-item)`]: {
        marginInlineEnd: token2.calc(token2.lineWidth).mul(-1).equal()
      },
      [`&-item:not(${prefixCls}-status-success)`]: {
        zIndex: 2
      },
      "&-item": {
        [focusEffects]: {
          zIndex: 3
        },
        [hoverEffects]: {
          zIndex: 4
        },
        ...focusElCls ? {
          [`&${focusElCls}`]: {
            zIndex: 3
          }
        } : {},
        [`&[disabled] ${childCombinator}`]: {
          zIndex: 0
        }
      }
    };
  }
  function compactItemBorderRadius(prefixCls, parentCls, options) {
    const {
      borderElCls
    } = options;
    const childCombinator = borderElCls ? `> ${borderElCls}` : "";
    return {
      [`&-item:not(${parentCls}-first-item):not(${parentCls}-last-item) ${childCombinator}`]: {
        borderRadius: 0
      },
      [`&-item:not(${parentCls}-last-item)${parentCls}-first-item`]: {
        [`& ${childCombinator}, &${prefixCls}-sm ${childCombinator}, &${prefixCls}-lg ${childCombinator}`]: {
          borderStartEndRadius: 0,
          borderEndEndRadius: 0
        }
      },
      [`&-item:not(${parentCls}-first-item)${parentCls}-last-item`]: {
        [`& ${childCombinator}, &${prefixCls}-sm ${childCombinator}, &${prefixCls}-lg ${childCombinator}`]: {
          borderStartStartRadius: 0,
          borderEndStartRadius: 0
        }
      }
    };
  }
  function genCompactItemStyle(token2, options = {
    focus: true
  }) {
    const {
      componentCls
    } = token2;
    const {
      componentCls: customizePrefixCls
    } = options;
    const mergedComponentCls = customizePrefixCls || componentCls;
    const compactCls = `${mergedComponentCls}-compact`;
    return {
      [compactCls]: {
        ...compactItemBorder(token2, compactCls, options, mergedComponentCls),
        ...compactItemBorderRadius(mergedComponentCls, compactCls, options)
      }
    };
  }

  // ../../node_modules/antd/es/style/compact-item-vertical.js
  function compactItemVerticalBorder(token2, parentCls, prefixCls) {
    return {
      // border collapse
      [`&-item:not(${parentCls}-last-item)`]: {
        marginBottom: token2.calc(token2.lineWidth).mul(-1).equal()
      },
      [`&-item:not(${prefixCls}-status-success)`]: {
        zIndex: 2
      },
      "&-item": {
        "&:focus,&:active": {
          zIndex: 3
        },
        "&:hover": {
          zIndex: 4
        },
        "&[disabled]": {
          zIndex: 0
        }
      }
    };
  }
  function compactItemBorderVerticalRadius(prefixCls, parentCls) {
    return {
      [`&-item:not(${parentCls}-first-item):not(${parentCls}-last-item)`]: {
        borderRadius: 0
      },
      [`&-item${parentCls}-first-item:not(${parentCls}-last-item)`]: {
        [`&, &${prefixCls}-sm, &${prefixCls}-lg`]: {
          borderEndEndRadius: 0,
          borderEndStartRadius: 0
        }
      },
      [`&-item${parentCls}-last-item:not(${parentCls}-first-item)`]: {
        [`&, &${prefixCls}-sm, &${prefixCls}-lg`]: {
          borderStartStartRadius: 0,
          borderStartEndRadius: 0
        }
      }
    };
  }
  function genCompactItemVerticalStyle(token2) {
    const compactCls = `${token2.componentCls}-compact-vertical`;
    return {
      [compactCls]: {
        ...compactItemVerticalBorder(token2, compactCls, token2.componentCls),
        ...compactItemBorderVerticalRadius(token2.componentCls, compactCls)
      }
    };
  }

  // ../../node_modules/antd/es/button/style/compact.js
  var genButtonCompactStyle = (token2) => {
    const {
      antCls,
      componentCls,
      lineWidth,
      calc,
      colorBgContainer
    } = token2;
    const solidSelector = `${componentCls}-variant-solid:not([disabled])`;
    const insetOffset = calc(lineWidth).mul(-1).equal();
    const [varName, varRef] = genCssVar(antCls, "btn");
    const getCompactBorderStyle = (vertical) => {
      const itemCls = `${componentCls}-compact${vertical ? "-vertical" : ""}-item`;
      return {
        // TODO: Border color transition should be not cover when has color.
        [itemCls]: {
          [varName("compact-connect-border-color")]: varRef("bg-color-hover"),
          [`&${solidSelector}`]: {
            transition: `none`,
            [`& + ${solidSelector}:before`]: [{
              position: "absolute",
              backgroundColor: varRef("compact-connect-border-color"),
              content: '""'
            }, vertical ? {
              top: insetOffset,
              insetInline: insetOffset,
              height: lineWidth
            } : {
              insetBlock: insetOffset,
              insetInlineStart: insetOffset,
              width: lineWidth
            }],
            "&:hover:before": {
              display: "none"
            }
          }
        }
      };
    };
    return [getCompactBorderStyle(), getCompactBorderStyle(true), {
      [`${solidSelector}${componentCls}-color-default`]: {
        [varName("compact-connect-border-color")]: `color-mix(in srgb, ${varRef("bg-color-hover")} 75%, ${colorBgContainer})`
      }
    }];
  };
  var compact_default2 = genSubStyleComponent(["Button", "compact"], (token2) => {
    const buttonToken = prepareToken(token2);
    return [
      // Space Compact
      genCompactItemStyle(buttonToken),
      genCompactItemVerticalStyle(buttonToken),
      genButtonCompactStyle(buttonToken)
    ];
  }, prepareComponentToken2);

  // ../../node_modules/antd/es/button/Button.js
  function getLoadingConfig(loading) {
    if (isPlainObject(loading)) {
      let delay = loading?.delay;
      delay = isNumber(delay) ? delay : 0;
      return {
        loading: delay <= 0,
        delay
      };
    }
    return {
      loading: !!loading,
      delay: 0
    };
  }
  var ButtonTypeMap = {
    default: ["default", "outlined"],
    primary: ["primary", "solid"],
    dashed: ["default", "dashed"],
    // `link` is not a real color but we should compatible with it
    link: ["link", "link"],
    text: ["default", "text"]
  };
  var InternalCompoundedButton = /* @__PURE__ */ react_compat_default.forwardRef((props, ref2) => {
    const {
      _skipSemantic,
      loading = false,
      prefixCls: customizePrefixCls,
      color,
      variant,
      type,
      danger = false,
      shape: customizeShape,
      size: customizeSize,
      disabled: customDisabled,
      className,
      rootClassName,
      children,
      icon,
      iconPosition,
      iconPlacement,
      ghost = false,
      block = false,
      // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
      htmlType = "button",
      classNames: classNames2,
      styles,
      style: style2,
      autoInsertSpace,
      autoFocus,
      ...rest
    } = props;
    const childNodes = toArray(children);
    const mergedType = type || "default";
    const {
      getPrefixCls,
      direction,
      autoInsertSpace: contextAutoInsertSpace,
      className: contextClassName,
      style: contextStyle,
      classNames: contextClassNames,
      styles: contextStyles,
      loadingIcon: contextLoadingIcon,
      shape: contextShape,
      color: contextColor,
      variant: contextVariant
    } = useComponentConfig("button");
    const mergedShape = customizeShape || contextShape || "default";
    const [parsedColor, parsedVariant] = useMemo(() => {
      if (color && variant) {
        return [color, variant];
      }
      if (type || danger) {
        const colorVariantPair = ButtonTypeMap[mergedType] || [];
        if (danger) {
          return ["danger", colorVariantPair[1]];
        }
        return colorVariantPair;
      }
      if (variant === "solid") {
        return ["primary", variant];
      }
      if (contextColor && contextVariant) {
        return [contextColor, contextVariant];
      }
      if (contextVariant === "solid") {
        return ["primary", contextVariant];
      }
      return ["default", "outlined"];
    }, [color, variant, type, danger, contextColor, contextVariant, mergedType]);
    const [mergedColor, mergedVariant] = useMemo(() => {
      if (ghost && parsedVariant === "solid") {
        return [parsedColor, "outlined"];
      }
      return [parsedColor, parsedVariant];
    }, [parsedColor, parsedVariant, ghost]);
    const isDanger = mergedColor === "danger";
    const mergedColorText = isDanger ? "dangerous" : mergedColor;
    const mergedInsertSpace = autoInsertSpace ?? contextAutoInsertSpace ?? true;
    const prefixCls = getPrefixCls("btn", customizePrefixCls);
    const [hashId, cssVarCls] = style_default3(prefixCls);
    const disabled = useContext(DisabledContext_default);
    const mergedDisabled = customDisabled ?? disabled;
    const groupSize = useContext(GroupSizeContext);
    const loadingOrDelay = useMemo(() => getLoadingConfig(loading), [loading]);
    const [innerLoading, setInnerLoading] = useDelayState(loadingOrDelay.loading);
    const [hasTwoCNChar, setHasTwoCNChar] = useState(false);
    const buttonRef = useRef(null);
    const mergedRef = useComposeRef(ref2, buttonRef);
    const needInserted = childNodes.length === 1 && !icon && !isUnBorderedButtonVariant(mergedVariant);
    const isMountRef = useRef(true);
    react_compat_default.useEffect(() => {
      isMountRef.current = false;
      return () => {
        isMountRef.current = true;
      };
    }, []);
    useLayoutEffect_default(() => {
      if (loadingOrDelay.delay > 0) {
        setInnerLoading(true, {
          ms: loadingOrDelay.delay
        });
      } else {
        setInnerLoading(loadingOrDelay.loading, true);
      }
    }, [loadingOrDelay.delay, loadingOrDelay.loading]);
    useEffect(() => {
      if (!buttonRef.current || !mergedInsertSpace) {
        return;
      }
      const buttonText = buttonRef.current.textContent || "";
      if (needInserted && isTwoCNChar(buttonText)) {
        if (!hasTwoCNChar) {
          setHasTwoCNChar(true);
        }
      } else if (hasTwoCNChar) {
        setHasTwoCNChar(false);
      }
    });
    useEffect(() => {
      if (autoFocus) {
        buttonRef.current?.focus();
      }
    }, []);
    const handleClick = react_compat_default.useCallback((e) => {
      if (innerLoading || mergedDisabled) {
        e.preventDefault();
        return;
      }
      props.onClick?.("href" in props ? e : e);
    }, [props.onClick, innerLoading, mergedDisabled]);
    if (true) {
      const warning4 = devUseWarning("Button");
      true ? warning4(!(typeof icon === "string" && icon.length > 2), "breaking", `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`) : void 0;
      true ? warning4(!(ghost && isUnBorderedButtonVariant(mergedVariant)), "usage", "`link` or `text` button can't be a `ghost` button.") : void 0;
      warning4.deprecated(!iconPosition, "iconPosition", "iconPlacement");
    }
    const {
      compactSize,
      compactItemClassnames
    } = useCompactItemContext(prefixCls, direction);
    const sizeFullName = useSize_default((ctxSize) => customizeSize ?? compactSize ?? groupSize ?? ctxSize);
    const iconType = innerLoading ? "loading" : icon;
    const mergedIconPlacement = iconPlacement ?? iconPosition ?? "start";
    const linkButtonRestProps = omit(rest, ["navigate"]);
    const mergedProps = {
      ...props,
      type: mergedType,
      color: mergedColor,
      variant: mergedVariant,
      danger: isDanger,
      shape: mergedShape,
      size: sizeFullName,
      disabled: mergedDisabled,
      loading: innerLoading,
      iconPlacement: mergedIconPlacement
    };
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const styleRoot = useSemanticRootStyle(style2);
    const [mergedClassNames, mergedStyles] = useMergeSemantic([_skipSemantic ? void 0 : contextClassNames, classNames2], [_skipSemantic ? void 0 : contextStyles, contextStyleRoot, styles, styleRoot], {
      props: mergedProps
    });
    const classes = clsx(prefixCls, hashId, cssVarCls, {
      [`${prefixCls}-${mergedShape}`]: mergedShape !== "default" && mergedShape !== "square" && mergedShape,
      // Compatible with versions earlier than 5.21.0
      [`${prefixCls}-${mergedType}`]: mergedType,
      [`${prefixCls}-dangerous`]: danger,
      [`${prefixCls}-color-${mergedColorText}`]: mergedColorText,
      [`${prefixCls}-variant-${mergedVariant}`]: mergedVariant,
      [`${prefixCls}-lg`]: sizeFullName === "large",
      [`${prefixCls}-sm`]: sizeFullName === "small",
      [`${prefixCls}-icon-only`]: !children && children !== 0 && !!iconType,
      [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonVariant(mergedVariant),
      [`${prefixCls}-loading`]: innerLoading,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && mergedInsertSpace && !innerLoading,
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-rtl`]: direction === "rtl",
      [`${prefixCls}-icon-end`]: mergedIconPlacement === "end"
    }, compactItemClassnames, className, rootClassName, contextClassName, mergedClassNames.root);
    const iconSharedProps = {
      className: mergedClassNames.icon,
      style: mergedStyles.icon
    };
    const iconWrapperElement = (child) => /* @__PURE__ */ react_compat_default.createElement(IconWrapper_default, {
      prefixCls,
      ...iconSharedProps
    }, child);
    const defaultLoadingIconElement = /* @__PURE__ */ react_compat_default.createElement(DefaultLoadingIcon_default, {
      existIcon: !!icon,
      prefixCls,
      loading: innerLoading,
      mount: isMountRef.current,
      ...iconSharedProps
    });
    const mergedLoadingIcon = isPlainObject(loading) ? loading.icon || contextLoadingIcon : contextLoadingIcon;
    let iconNode;
    if (icon && !innerLoading) {
      iconNode = iconWrapperElement(icon);
    } else if (innerLoading && mergedLoadingIcon) {
      iconNode = iconWrapperElement(mergedLoadingIcon);
    } else {
      iconNode = defaultLoadingIconElement;
    }
    const contentNode = isReactRenderable(children) ? spaceChildren(children, needInserted && mergedInsertSpace, mergedStyles.content, mergedClassNames.content) : null;
    if (linkButtonRestProps.href !== void 0) {
      return /* @__PURE__ */ react_compat_default.createElement("a", {
        ...linkButtonRestProps,
        className: clsx(classes, {
          [`${prefixCls}-disabled`]: mergedDisabled
        }),
        href: mergedDisabled ? void 0 : linkButtonRestProps.href,
        style: mergedStyles.root,
        onClick: handleClick,
        ref: mergedRef,
        tabIndex: mergedDisabled ? -1 : 0,
        "aria-disabled": mergedDisabled
      }, iconNode, contentNode);
    }
    let buttonNode = /* @__PURE__ */ react_compat_default.createElement("button", {
      ...rest,
      type: htmlType,
      className: classes,
      style: mergedStyles.root,
      onClick: handleClick,
      disabled: mergedDisabled,
      ref: mergedRef
    }, iconNode, contentNode, compactItemClassnames && /* @__PURE__ */ react_compat_default.createElement(compact_default2, {
      prefixCls
    }));
    if (!isUnBorderedButtonVariant(mergedVariant)) {
      buttonNode = /* @__PURE__ */ react_compat_default.createElement(wave_default, {
        component: "Button",
        disabled: innerLoading
      }, buttonNode);
    }
    return buttonNode;
  });
  var Button = InternalCompoundedButton;
  Button.Group = ButtonGroup_default;
  Button.__ANT_BUTTON = true;
  if (true) {
    Button.displayName = "Button";
  }
  var Button_default = Button;

  // ../../node_modules/antd/es/_util/statusUtils.js
  var getStatusClassNames = (prefixCls, status, hasFeedback) => {
    return clsx({
      [`${prefixCls}-status-success`]: status === "success",
      [`${prefixCls}-status-warning`]: status === "warning",
      [`${prefixCls}-status-error`]: status === "error",
      [`${prefixCls}-status-validating`]: status === "validating",
      [`${prefixCls}-has-feedback`]: hasFeedback
    });
  };

  // ../../node_modules/antd/es/_util/colors.js
  var inverseColors = PresetColors.map((color) => `${color}-inverse`);
  var PresetStatusColors = ["success", "processing", "error", "default", "warning"];
  function isPresetColor(color, includeInverse = true) {
    if (includeInverse) {
      return [].concat(_toConsumableArray(inverseColors), _toConsumableArray(PresetColors)).includes(color);
    }
    return PresetColors.includes(color);
  }
  function isPresetStatusColor(color) {
    return PresetStatusColors.includes(color);
  }

  // ../../node_modules/antd/es/button/index.js
  var button_default = Button_default;

  // ../../node_modules/antd/es/space/style/addon.js
  var genSpaceAddonStyle = (token2) => {
    const {
      componentCls,
      borderRadius,
      paddingSM,
      colorBorder,
      paddingXS,
      fontSizeLG,
      fontSizeSM,
      borderRadiusLG,
      borderRadiusSM,
      colorBgContainerDisabled,
      lineWidth,
      lineType,
      antCls
    } = token2;
    const [varName, varRef] = genCssVar(antCls, "space-addon");
    return {
      [componentCls]: [
        // ==========================================================
        // ==                         Base                         ==
        // ==========================================================
        {
          ...resetComponent(token2),
          display: "inline-flex",
          alignItems: "center",
          gap: 0,
          whiteSpace: "nowrap",
          paddingInline: paddingSM,
          margin: 0,
          borderWidth: lineWidth,
          borderStyle: lineType,
          borderRadius,
          "&:hover": {
            zIndex: 0
          },
          [`&${componentCls}-disabled`]: {
            color: token2.colorTextDisabled
          },
          "&-large": {
            fontSize: fontSizeLG,
            borderRadius: borderRadiusLG
          },
          "&-small": {
            paddingInline: paddingXS,
            borderRadius: borderRadiusSM,
            fontSize: fontSizeSM
          },
          "&-compact-last-item": {
            borderEndStartRadius: 0,
            borderStartStartRadius: 0
          },
          "&-compact-first-item": {
            borderEndEndRadius: 0,
            borderStartEndRadius: 0
          },
          "&-compact-item:not(:first-child):not(:last-child)": {
            borderRadius: 0
          },
          "&-compact-item:not(:last-child)": {
            borderInlineEndWidth: 0
          },
          "&-compact-item:not(:first-child)": {
            borderInlineStartWidth: 0
          }
        },
        // ==========================================================
        // ==                       Variants                       ==
        // ==========================================================
        {
          [varName("addon-border-color")]: colorBorder,
          [varName("addon-background")]: colorBgContainerDisabled,
          // Filled
          [varName("addon-border-color-outlined")]: colorBorder,
          [varName("addon-background-filled")]: colorBgContainerDisabled,
          borderColor: varRef("addon-border-color"),
          background: varRef("addon-background"),
          // ======================= Outlined =======================
          "&-variant-outlined": {
            [varName("addon-border-color")]: varRef("addon-border-color-outlined")
          },
          // ======================== Filled ========================
          "&-variant-filled": {
            [varName("addon-border-color")]: "transparent",
            [varName("addon-background")]: varRef("addon-background-filled"),
            // Disabled
            [`&${componentCls}-disabled`]: {
              [varName("addon-border-color")]: colorBorder,
              [varName("addon-background")]: colorBgContainerDisabled
            }
          },
          // ====================== Borderless ======================
          "&-variant-borderless": {
            border: "none",
            background: "transparent"
          },
          // ====================== Underlined ======================
          "&-variant-underlined": {
            border: "none",
            background: "transparent"
          }
        },
        // ==========================================================
        // ==                        Status                        ==
        // ==========================================================
        {
          "&-status-error": {
            [varName("addon-border-color-outlined")]: token2.colorError,
            [varName("addon-background-filled")]: token2.colorErrorBg,
            color: token2.colorError
          },
          "&-status-warning": {
            [varName("addon-border-color-outlined")]: token2.colorWarning,
            [varName("addon-background-filled")]: token2.colorWarningBg,
            color: token2.colorWarning
          }
        }
      ]
    };
  };
  var addon_default = genStyleHooks("Addon", (token2) => [genSpaceAddonStyle(token2), genCompactItemStyle(token2, {
    focus: false
  })]);

  // ../../node_modules/antd/es/space/Addon.js
  var SpaceAddon = /* @__PURE__ */ react_compat_default.forwardRef((props, ref2) => {
    const {
      className,
      children,
      style: style2,
      prefixCls: customizePrefixCls,
      variant = "outlined",
      disabled,
      status,
      ...restProps
    } = props;
    const {
      getPrefixCls,
      direction: directionConfig
    } = react_compat_default.useContext(ConfigContext);
    const prefixCls = getPrefixCls("space-addon", customizePrefixCls);
    const [hashId, cssVarCls] = addon_default(prefixCls);
    const {
      compactItemClassnames,
      compactSize
    } = useCompactItemContext(prefixCls, directionConfig);
    const statusCls = getStatusClassNames(prefixCls, status);
    const classes = clsx(prefixCls, hashId, compactItemClassnames, cssVarCls, `${prefixCls}-variant-${variant}`, statusCls, {
      [`${prefixCls}-${compactSize}`]: compactSize,
      [`${prefixCls}-disabled`]: disabled
    }, className);
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      ref: ref2,
      className: classes,
      style: style2,
      ...restProps
    }, children);
  });
  var Addon_default = SpaceAddon;

  // ../../node_modules/antd/es/_util/gapSize.js
  function isPresetSize(size) {
    return ["small", "middle", "medium", "large"].includes(size);
  }
  function isValidGapNumber(size) {
    if (!size) {
      return false;
    }
    return isNumber(size);
  }

  // ../../node_modules/antd/es/space/context.js
  var SpaceContext = /* @__PURE__ */ react_compat_default.createContext({
    latestIndex: 0
  });
  var SpaceContextProvider = SpaceContext.Provider;

  // ../../node_modules/antd/es/space/Item.js
  var Item = (props) => {
    const {
      className,
      prefix: prefix2,
      index,
      children,
      separator,
      style: style2,
      classNames: classNames2,
      styles
    } = props;
    const {
      latestIndex
    } = useContext(SpaceContext);
    if (!isReactRenderable(children)) {
      return null;
    }
    return /* @__PURE__ */ createElement2(Fragment, null, /* @__PURE__ */ createElement2("div", {
      className,
      style: style2
    }, children), index < latestIndex && separator && /* @__PURE__ */ createElement2("span", {
      className: clsx(`${prefix2}-item-separator`, classNames2?.separator),
      style: styles?.separator
    }, separator));
  };
  var Item_default = Item;

  // ../../node_modules/antd/es/space/style/index.js
  var genSpaceStyle = (token2) => {
    const {
      componentCls,
      antCls
    } = token2;
    return {
      [componentCls]: {
        display: "inline-flex",
        "&-rtl": {
          direction: "rtl"
        },
        "&-vertical": {
          flexDirection: "column"
        },
        "&-align": {
          flexDirection: "column",
          "&-center": {
            alignItems: "center"
          },
          "&-start": {
            alignItems: "flex-start"
          },
          "&-end": {
            alignItems: "flex-end"
          },
          "&-baseline": {
            alignItems: "baseline"
          }
        },
        [`${componentCls}-item:empty`]: {
          display: "none"
        },
        // https://github.com/ant-design/ant-design/issues/47875
        [`${componentCls}-item > ${antCls}-badge-not-a-wrapper:only-child`]: {
          display: "block"
        }
      }
    };
  };
  var genSpaceGapStyle = (token2) => {
    const {
      componentCls
    } = token2;
    return {
      [componentCls]: {
        "&-gap-row-small": {
          rowGap: token2.spaceGapSmallSize
        },
        "&-gap-row-medium, &-gap-row-middle": {
          rowGap: token2.spaceGapMiddleSize
        },
        "&-gap-row-large": {
          rowGap: token2.spaceGapLargeSize
        },
        "&-gap-col-small": {
          columnGap: token2.spaceGapSmallSize
        },
        "&-gap-col-medium, &-gap-col-middle": {
          columnGap: token2.spaceGapMiddleSize
        },
        "&-gap-col-large": {
          columnGap: token2.spaceGapLargeSize
        }
      }
    };
  };
  var style_default4 = genStyleHooks("Space", (token2) => {
    const spaceToken = merge2(token2, {
      spaceGapSmallSize: token2.paddingXS,
      spaceGapMiddleSize: token2.padding,
      spaceGapLargeSize: token2.paddingLG
    });
    return [genSpaceStyle(spaceToken), genSpaceGapStyle(spaceToken)];
  }, () => ({}), {
    // Space component don't apply extra font style
    // https://github.com/ant-design/ant-design/issues/40315
    resetStyle: false
  });

  // ../../node_modules/antd/es/space/index.js
  var InternalSpace = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      getPrefixCls,
      direction: directionConfig,
      size: contextSize,
      className: contextClassName,
      style: contextStyle,
      classNames: contextClassNames,
      styles: contextStyles
    } = useComponentConfig("space");
    const {
      size = contextSize ?? "small",
      align,
      className,
      rootClassName,
      children,
      direction,
      orientation,
      prefixCls: customizePrefixCls,
      split,
      separator,
      style: style2,
      vertical,
      wrap = false,
      classNames: classNames2,
      styles,
      ...restProps
    } = props;
    const [horizontalSize, verticalSize] = Array.isArray(size) ? size : [size, size];
    const isPresetVerticalSize = isPresetSize(verticalSize);
    const isPresetHorizontalSize = isPresetSize(horizontalSize);
    const isValidVerticalSize = isValidGapNumber(verticalSize);
    const isValidHorizontalSize = isValidGapNumber(horizontalSize);
    const childNodes = toArray(children, {
      keepEmpty: true
    });
    const [mergedOrientation, mergedVertical] = useOrientation(orientation, vertical, direction);
    const mergedAlign = align === void 0 && !mergedVertical ? "center" : align;
    const mergedSeparator = separator ?? split;
    const prefixCls = getPrefixCls("space", customizePrefixCls);
    const [hashId, cssVarCls] = style_default4(prefixCls);
    const mergedProps = {
      ...props,
      size,
      orientation: mergedOrientation,
      align: mergedAlign
    };
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const styleRoot = useSemanticRootStyle(style2);
    const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames2], [contextStyles, contextStyleRoot, styles, styleRoot], {
      props: mergedProps
    });
    const rootClassNames = clsx(prefixCls, contextClassName, hashId, `${prefixCls}-${mergedOrientation}`, {
      [`${prefixCls}-rtl`]: directionConfig === "rtl",
      [`${prefixCls}-align-${mergedAlign}`]: mergedAlign,
      [`${prefixCls}-gap-row-${verticalSize}`]: isPresetVerticalSize,
      [`${prefixCls}-gap-col-${horizontalSize}`]: isPresetHorizontalSize
    }, className, rootClassName, cssVarCls, mergedClassNames.root);
    const itemClassName = clsx(`${prefixCls}-item`, mergedClassNames.item);
    const renderedItems = childNodes.map((child, i) => {
      const key = child?.key || `${itemClassName}-${i}`;
      return /* @__PURE__ */ createElement2(Item_default, {
        prefix: prefixCls,
        classNames: mergedClassNames,
        styles: mergedStyles,
        className: itemClassName,
        key,
        index: i,
        separator: mergedSeparator,
        style: mergedStyles.item
      }, child);
    });
    if (true) {
      const warning4 = devUseWarning("Space");
      [["direction", "orientation"], ["split", "separator"]].forEach(([deprecatedName, newName]) => {
        warning4.deprecated(!(deprecatedName in props), deprecatedName, newName);
      });
    }
    const memoizedSpaceContext = useMemo(() => {
      const calcLatestIndex = childNodes.reduce((latest, child, i) => isReactRenderable(child) ? i : latest, 0);
      return {
        latestIndex: calcLatestIndex
      };
    }, [childNodes]);
    if (childNodes.length === 0) {
      return null;
    }
    const gapStyle = {};
    if (wrap) {
      gapStyle.flexWrap = "wrap";
    }
    if (!isPresetHorizontalSize && isValidHorizontalSize) {
      gapStyle.columnGap = horizontalSize;
    }
    if (!isPresetVerticalSize && isValidVerticalSize) {
      gapStyle.rowGap = verticalSize;
    }
    return /* @__PURE__ */ createElement2("div", {
      ref: ref2,
      className: rootClassNames,
      style: {
        ...gapStyle,
        ...mergedStyles.root
      },
      ...restProps
    }, /* @__PURE__ */ createElement2(SpaceContextProvider, {
      value: memoizedSpaceContext
    }, renderedItems));
  });
  var Space = InternalSpace;
  Space.Compact = Compact_default;
  Space.Addon = Addon_default;
  if (true) {
    Space.displayName = "Space";
  }
  var space_default = Space;

  // ../../node_modules/antd/es/tag/style/index.js
  var genBaseStyle2 = (token2) => {
    const {
      paddingXXS,
      lineWidth,
      tagPaddingHorizontal,
      componentCls,
      calc
    } = token2;
    const paddingInline = calc(tagPaddingHorizontal).sub(lineWidth).equal();
    const iconMarginInline = calc(paddingXXS).sub(lineWidth).equal();
    return {
      // Result
      [componentCls]: {
        ...resetComponent(token2),
        display: "inline-block",
        height: "auto",
        paddingInline,
        fontSize: token2.tagFontSize,
        lineHeight: token2.tagLineHeight,
        whiteSpace: "nowrap",
        backgroundColor: token2.defaultBg,
        border: `${unit(token2.lineWidth)} ${token2.lineType} ${token2.colorBorder}`,
        borderRadius: token2.borderRadiusSM,
        opacity: 1,
        transition: `all ${token2.motionDurationMid}`,
        textAlign: "start",
        position: "relative",
        // RTL
        [`&${componentCls}-rtl`]: {
          direction: "rtl"
        },
        "&, a, a:hover": {
          color: token2.defaultColor
        },
        [`${componentCls}-close-icon`]: {
          marginInlineStart: iconMarginInline,
          fontSize: token2.tagIconSize,
          color: token2.colorIcon,
          cursor: "pointer",
          transition: `all ${token2.motionDurationMid}`,
          "&:hover": {
            color: token2.colorTextHeading
          }
        },
        "&-checkable": {
          backgroundColor: "transparent",
          borderColor: "transparent",
          cursor: "pointer",
          [`&:not(${componentCls}-checkable-checked):hover`]: {
            color: token2.colorPrimary,
            backgroundColor: token2.colorFillSecondary
          },
          "&:active, &-checked": {
            color: token2.colorTextLightSolid
          },
          "&-checked": {
            backgroundColor: token2.colorPrimary,
            "&:hover": {
              backgroundColor: token2.colorPrimaryHover
            }
          },
          "&:active": {
            backgroundColor: token2.colorPrimaryActive
          },
          "&-disabled": {
            cursor: "not-allowed",
            [`&:not(${componentCls}-checkable-checked)`]: {
              color: token2.colorTextDisabled,
              "&:hover": {
                backgroundColor: "transparent"
              }
            },
            [`&${componentCls}-checkable-checked`]: {
              color: token2.colorTextDisabled,
              backgroundColor: token2.colorBgContainerDisabled
            },
            "&:hover, &:active": {
              backgroundColor: token2.colorBgContainerDisabled,
              color: token2.colorTextDisabled
            },
            [`&:not(${componentCls}-checkable-checked):hover`]: {
              color: token2.colorTextDisabled
            }
          },
          "&-group": {
            display: "flex",
            flexWrap: "wrap",
            gap: token2.paddingXS
          }
        },
        "&-hidden": {
          display: "none"
        },
        // Icons from third-party libraries are a bare `<svg>`, which none of the `.anticon`
        // rules reach. An `<svg>` has no baseline of its own, so it is aligned by its bottom
        // margin edge (CSS 2.1 §10.8.1) and rides above the text. Centre it instead: unlike an
        // `.anticon` (whose `<svg>` is always `1em`, so a fixed `-0.125em` nudge suffices), a
        // third-party `<svg>` may be sized in `px`, so the correction must not depend on size.
        // `display: inline-block` keeps it an atomic inline box so `vertical-align` still applies even
        // under a CSS reset that forces `svg { display: block }` (e.g. Tailwind Preflight), which would
        // otherwise drop the icon onto its own line. `vertical-align: middle` centres the margin box on
        // the x-height line; `margin-block-end` then lifts it by half its own value onto the cap-height
        // centre (capHeight − xHeight ≈ 0.2em across typical fonts), keeping it centred at any icon size.
        // Only matches a bare `<svg>`: an `.anticon` keeps its `<svg>` one level deeper.
        "> svg": {
          display: "inline-block",
          verticalAlign: "middle",
          marginBlockEnd: "0.2em"
        },
        // To ensure that a space will be placed between character and `Icon`.
        [`> ${token2.iconCls} + span, > span + ${token2.iconCls}, > svg + span, > span + svg`]: {
          marginInlineStart: paddingInline
        }
      },
      [`&${token2.componentCls}-solid`]: {
        borderColor: "transparent",
        color: token2.colorTextLightSolid,
        backgroundColor: token2.colorBgSolid,
        [`&${componentCls}-default`]: {
          color: token2.solidTextColor
        }
      },
      [`${componentCls}-filled`]: {
        borderColor: "transparent",
        backgroundColor: token2.tagBorderlessBg
      },
      [`&${componentCls}-disabled`]: {
        color: token2.colorTextDisabled,
        cursor: "not-allowed",
        backgroundColor: token2.colorBgContainerDisabled,
        a: {
          cursor: "not-allowed",
          pointerEvents: "none",
          color: token2.colorTextDisabled,
          "&:hover": {
            color: token2.colorTextDisabled
          }
        },
        "a&": {
          "&:hover, &:active": {
            color: token2.colorTextDisabled
          }
        },
        [`&${componentCls}-outlined`]: {
          borderColor: token2.colorBorderDisabled
        },
        [`&${componentCls}-solid, &${componentCls}-filled`]: {
          color: token2.colorTextDisabled,
          [`${componentCls}-close-icon`]: {
            color: token2.colorTextDisabled
          }
        },
        [`${componentCls}-close-icon`]: {
          cursor: "not-allowed",
          color: token2.colorTextDisabled,
          "&:hover": {
            color: token2.colorTextDisabled
          }
        }
      }
    };
  };
  var prepareToken2 = (token2) => {
    const {
      lineWidth,
      fontSizeIcon,
      calc
    } = token2;
    const tagFontSize = token2.fontSizeSM;
    const tagToken = merge2(token2, {
      tagFontSize,
      tagLineHeight: unit(calc(token2.lineHeightSM).mul(tagFontSize).equal()),
      tagIconSize: calc(fontSizeIcon).sub(calc(lineWidth).mul(2)).equal(),
      // Tag icon is much smaller
      tagPaddingHorizontal: 8,
      // Fixed padding.
      tagBorderlessBg: token2.defaultBg
    });
    return tagToken;
  };
  var prepareComponentToken3 = (token2) => {
    const solidTextColor = isBright(new AggregationColor(token2.colorBgSolid), "#fff") ? "#000" : "#fff";
    return {
      defaultBg: new FastColor(token2.colorFillTertiary).onBackground(token2.colorBgContainer).toHexString(),
      defaultColor: token2.colorText,
      solidTextColor
    };
  };
  var style_default5 = genStyleHooks("Tag", (token2) => {
    const tagToken = prepareToken2(token2);
    return genBaseStyle2(tagToken);
  }, prepareComponentToken3);

  // ../../node_modules/antd/es/tag/CheckableTag.js
  var CheckableTag = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      prefixCls: customizePrefixCls,
      style: style2,
      className,
      checked,
      children,
      icon,
      onChange,
      onClick,
      onKeyDown,
      disabled: customDisabled,
      ...restProps
    } = props;
    const {
      getPrefixCls,
      tag: tag2
    } = useContext(ConfigContext);
    const disabled = useContext(DisabledContext_default);
    const mergedDisabled = customDisabled ?? disabled;
    const handleClick = (e) => {
      if (mergedDisabled) {
        return;
      }
      onChange?.(!checked);
      onClick?.(e);
    };
    const handleKeyDown = (e) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || mergedDisabled) {
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        if (!e.repeat) {
          onChange?.(!checked);
        }
      }
    };
    const prefixCls = getPrefixCls("tag", customizePrefixCls);
    const [hashId, cssVarCls] = style_default5(prefixCls);
    const cls = clsx(prefixCls, `${prefixCls}-checkable`, {
      [`${prefixCls}-checkable-checked`]: checked,
      [`${prefixCls}-checkable-disabled`]: mergedDisabled
    }, tag2?.className, className, hashId, cssVarCls);
    return /* @__PURE__ */ createElement2("span", {
      ...restProps,
      ref: ref2,
      role: "checkbox",
      "aria-checked": checked,
      "aria-disabled": mergedDisabled || void 0,
      tabIndex: mergedDisabled ? -1 : 0,
      style: {
        ...tag2?.style,
        ...style2
      },
      className: cls,
      onClick: handleClick,
      onKeyDown: handleKeyDown
    }, icon, /* @__PURE__ */ createElement2("span", null, children));
  });
  var CheckableTag_default = CheckableTag;

  // ../../node_modules/antd/es/tag/CheckableTagGroup.js
  var CheckableTagGroup = /* @__PURE__ */ react_compat_default.forwardRef((props, ref2) => {
    const {
      id,
      prefixCls: customizePrefixCls,
      rootClassName,
      className,
      style: style2,
      classNames: classNames2,
      styles,
      disabled,
      options,
      value,
      defaultValue,
      onChange,
      multiple,
      ...restProps
    } = props;
    const {
      getPrefixCls,
      direction,
      className: contextClassName,
      style: contextStyle,
      classNames: contextClassNames,
      styles: contextStyles
    } = useComponentConfig("tag");
    const prefixCls = getPrefixCls("tag", customizePrefixCls);
    const groupPrefixCls = `${prefixCls}-checkable-group`;
    const rootCls = useCSSVarCls_default(prefixCls);
    const [hashId, cssVarCls] = style_default5(prefixCls, rootCls);
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const styleRoot = useSemanticRootStyle(style2);
    const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames2], [contextStyles, contextStyleRoot, styles, styleRoot], {
      props
    });
    const parsedOptions = useMemo(() => {
      if (!Array.isArray(options)) {
        return [];
      }
      return options.map((option2) => {
        if (isPlainObject(option2)) {
          return option2;
        }
        return {
          value: option2,
          label: option2
        };
      });
    }, [options]);
    const [mergedValue, setMergedValue] = useControlledState(defaultValue, value);
    const handleChange = (checked, option2) => {
      let newValue = null;
      if (multiple) {
        const valueList = mergedValue || [];
        newValue = checked ? [].concat(_toConsumableArray(valueList), [option2.value]) : valueList.filter((item) => item !== option2.value);
      } else {
        newValue = checked ? option2.value : null;
      }
      setMergedValue(newValue);
      onChange?.(newValue);
    };
    const divRef = react_compat_default.useRef(null);
    useImperativeHandle(ref2, () => ({
      nativeElement: divRef.current
    }));
    const ariaProps = pickAttrs(restProps, {
      aria: true,
      data: true
    });
    return /* @__PURE__ */ react_compat_default.createElement("div", {
      ...ariaProps,
      className: clsx(groupPrefixCls, contextClassName, rootClassName, {
        [`${groupPrefixCls}-disabled`]: disabled,
        [`${groupPrefixCls}-rtl`]: direction === "rtl"
      }, hashId, cssVarCls, className, mergedClassNames.root),
      style: mergedStyles.root,
      id,
      ref: divRef
    }, parsedOptions.map((option2) => /* @__PURE__ */ react_compat_default.createElement(CheckableTag_default, {
      key: option2.value,
      className: clsx(`${groupPrefixCls}-item`, mergedClassNames.item, option2.className),
      style: {
        ...mergedStyles.item,
        ...option2.style
      },
      checked: multiple ? (mergedValue || []).includes(option2.value) : mergedValue === option2.value,
      onChange: (checked) => handleChange(checked, option2),
      disabled
    }, option2.label)));
  });
  if (true) {
    CheckableTagGroup.displayName = "CheckableTagGroup";
  }
  var CheckableTagGroup_default = CheckableTagGroup;

  // ../../node_modules/antd/es/tag/hooks/useColor.js
  function useColor(props, contextVariant) {
    const {
      color,
      variant,
      bordered
    } = props;
    return useMemo(() => {
      const isInverseColor = color?.endsWith("-inverse");
      let nextVariant;
      if (variant) {
        nextVariant = variant;
      } else if (isInverseColor) {
        nextVariant = "solid";
      } else if (bordered === false) {
        nextVariant = "filled";
      } else {
        nextVariant = contextVariant || "filled";
      }
      let nextColor = isInverseColor ? color?.replace("-inverse", "") : color;
      if (nextColor === void 0 && nextVariant === "solid") {
        nextColor = "default";
      }
      const nextIsPreset = isPresetColor(nextColor);
      const nextIsStatus = isPresetStatusColor(nextColor);
      const tagStyle = {};
      if (!nextIsPreset && !nextIsStatus && nextColor) {
        if (nextVariant === "solid") {
          tagStyle.backgroundColor = color;
        } else {
          const hsl = new FastColor(nextColor).toHsl();
          hsl.l = 0.95;
          tagStyle.backgroundColor = new FastColor(hsl).toHexString();
          tagStyle.color = color;
          if (nextVariant === "outlined") {
            tagStyle.borderColor = color;
          }
        }
      }
      return [nextVariant, nextColor, nextIsPreset, nextIsStatus, tagStyle];
    }, [color, variant, bordered, contextVariant]);
  }

  // ../../node_modules/antd/es/tag/style/presetCmp.js
  var genPresetStyle = (token2) => genPresetColor(token2, (colorKey, {
    textColor,
    lightBorderColor,
    lightColor,
    darkColor
  }) => ({
    [`${token2.componentCls}${token2.componentCls}-${colorKey}:not(${token2.componentCls}-disabled)`]: {
      [`&${token2.componentCls}-outlined`]: {
        backgroundColor: lightColor,
        borderColor: lightBorderColor,
        color: textColor
      },
      [`&${token2.componentCls}-solid`]: {
        backgroundColor: darkColor,
        borderColor: darkColor,
        color: token2.colorTextLightSolid
      },
      [`&${token2.componentCls}-filled`]: {
        backgroundColor: lightColor,
        color: textColor
      }
    }
  }));
  var presetCmp_default = genSubStyleComponent(["Tag", "preset"], (token2) => {
    const tagToken = prepareToken2(token2);
    return genPresetStyle(tagToken);
  }, prepareComponentToken3);

  // ../../node_modules/antd/es/_util/capitalize.js
  function capitalize(str) {
    if (typeof str !== "string") {
      return str;
    }
    const ret = str.charAt(0).toUpperCase() + str.slice(1);
    return ret;
  }

  // ../../node_modules/antd/es/tag/style/statusCmp.js
  var genTagStatusStyle = (token2, status, cssVariableType) => {
    const capitalizedCssVariableType = capitalize(cssVariableType);
    return {
      [`${token2.componentCls}${token2.componentCls}-${status}:not(${token2.componentCls}-disabled)`]: {
        [`&${token2.componentCls}-outlined`]: {
          backgroundColor: token2[`color${capitalizedCssVariableType}Bg`],
          borderColor: token2[`color${capitalizedCssVariableType}Border`],
          color: token2[`color${cssVariableType}`]
        },
        [`&${token2.componentCls}-solid`]: {
          backgroundColor: token2[`color${cssVariableType}`],
          borderColor: token2[`color${cssVariableType}`]
        },
        [`&${token2.componentCls}-filled`]: {
          backgroundColor: token2[`color${capitalizedCssVariableType}Bg`],
          color: token2[`color${cssVariableType}`]
        }
      }
    };
  };
  var statusCmp_default = genSubStyleComponent(["Tag", "status"], (token2) => {
    const tagToken = prepareToken2(token2);
    return [genTagStatusStyle(tagToken, "success", "Success"), genTagStatusStyle(tagToken, "processing", "Info"), genTagStatusStyle(tagToken, "error", "Error"), genTagStatusStyle(tagToken, "warning", "Warning")];
  }, prepareComponentToken3);

  // ../../node_modules/antd/es/tag/index.js
  var InternalTag = /* @__PURE__ */ forwardRef((props, ref2) => {
    const {
      prefixCls: customizePrefixCls,
      className,
      rootClassName,
      style: style2,
      children,
      icon,
      color,
      variant: _variant,
      onClose,
      bordered,
      disabled: customDisabled,
      href,
      target,
      styles,
      classNames: classNames2,
      ...restProps
    } = props;
    const {
      getPrefixCls,
      direction,
      className: contextClassName,
      variant: contextVariant,
      style: contextStyle,
      classNames: contextClassNames,
      styles: contextStyles
    } = useComponentConfig("tag");
    if (true) {
      const warning4 = devUseWarning("Tag");
      warning4.deprecated(bordered !== false, "bordered={false}", 'variant="filled"');
      warning4.deprecated(!color?.endsWith("-inverse"), 'color="xxx-inverse"', 'variant="solid"');
    }
    const [mergedVariant, mergedColor, isPreset, isStatus, customTagStyle] = useColor(props, contextVariant);
    const isInternalColor = isPreset || isStatus;
    const disabled = useContext(DisabledContext_default);
    const mergedDisabled = customDisabled ?? disabled;
    const {
      tag: tagContext
    } = useContext(ConfigContext);
    const [visible, setVisible] = useState(true);
    const domProps = omit(restProps, ["closeIcon", "closable"]);
    const mergedProps = {
      ...props,
      color: mergedColor,
      variant: mergedVariant,
      disabled: mergedDisabled
    };
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const styleRoot = useSemanticRootStyle(style2);
    const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames2], [contextStyles, contextStyleRoot, styles, styleRoot], {
      props: mergedProps
    });
    const tagStyle = useMemo(() => {
      let nextTagStyle = mergedStyles.root;
      if (!mergedDisabled) {
        nextTagStyle = {
          ...customTagStyle,
          ...nextTagStyle
        };
      }
      return nextTagStyle;
    }, [mergedStyles.root, customTagStyle, mergedDisabled]);
    const prefixCls = getPrefixCls("tag", customizePrefixCls);
    const [hashId, cssVarCls] = style_default5(prefixCls);
    const tagClassName = clsx(prefixCls, contextClassName, mergedClassNames.root, `${prefixCls}-${mergedVariant}`, {
      [`${prefixCls}-${mergedColor}`]: isInternalColor,
      [`${prefixCls}-hidden`]: !visible,
      [`${prefixCls}-rtl`]: direction === "rtl",
      [`${prefixCls}-disabled`]: mergedDisabled
    }, className, rootClassName, hashId, cssVarCls);
    const triggerClose = (e) => {
      if (mergedDisabled) {
        return;
      }
      e.stopPropagation();
      onClose?.(e);
      if (e.defaultPrevented) {
        return;
      }
      if (href) {
        e.preventDefault();
      }
      setVisible(false);
    };
    const handleCloseKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!e.repeat) {
          e.currentTarget.click();
        }
      }
    };
    const [, mergedCloseIcon] = useClosable(pickClosable(props), pickClosable(tagContext), {
      closable: false,
      closeIconRender: (iconNode2) => {
        const replacement = /* @__PURE__ */ createElement2("span", {
          role: "button",
          tabIndex: mergedDisabled ? -1 : 0,
          "aria-disabled": mergedDisabled || void 0,
          className: clsx(`${prefixCls}-close-icon`, mergedClassNames.close),
          onClick: triggerClose,
          onKeyDown: handleCloseKeyDown,
          style: mergedStyles.close
        }, iconNode2);
        return replaceElement(iconNode2, replacement, (originProps) => ({
          onClick: (e) => {
            originProps?.onClick?.(e);
            triggerClose(e);
          },
          onKeyDown: (e) => {
            originProps?.onKeyDown?.(e);
            if (!e.defaultPrevented) {
              handleCloseKeyDown(e);
            }
          },
          role: "button",
          tabIndex: mergedDisabled ? -1 : 0,
          "aria-disabled": mergedDisabled || void 0,
          className: clsx(originProps?.className, `${prefixCls}-close-icon`, mergedClassNames.close),
          style: {
            ...mergedStyles.close,
            ...originProps?.style
          }
        }));
      }
    });
    const isNeedWave = isFunction(restProps.onClick) || children && children.type === "a";
    const iconNode = cloneElement2(icon, {
      className: clsx(/* @__PURE__ */ isValidElement(icon) ? icon.props?.className : void 0, mergedClassNames.icon),
      style: mergedStyles.icon
    });
    const child = iconNode ? /* @__PURE__ */ createElement2(Fragment, null, iconNode, isReactRenderable(children) && /* @__PURE__ */ createElement2("span", {
      className: mergedClassNames.content,
      style: mergedStyles.content
    }, children)) : children;
    const TagWrapper = href ? "a" : "span";
    const tagNode = /* @__PURE__ */ createElement2(TagWrapper, {
      ...domProps,
      ref: ref2,
      className: tagClassName,
      style: tagStyle,
      href: mergedDisabled ? void 0 : href,
      target,
      onClick: mergedDisabled ? void 0 : domProps.onClick,
      ...href && mergedDisabled ? {
        "aria-disabled": true
      } : {}
    }, child, mergedCloseIcon, isPreset && /* @__PURE__ */ createElement2(presetCmp_default, {
      key: "preset",
      prefixCls
    }), isStatus && /* @__PURE__ */ createElement2(statusCmp_default, {
      key: "status",
      prefixCls
    }));
    return isNeedWave ? /* @__PURE__ */ createElement2(wave_default, {
      component: "Tag"
    }, tagNode) : tagNode;
  });
  var Tag = InternalTag;
  if (true) {
    Tag.displayName = "Tag";
  }
  Tag.CheckableTag = CheckableTag_default;
  Tag.CheckableTagGroup = CheckableTagGroup_default;
  var tag_default = Tag;

  // ../../node_modules/antd/es/index.js
  if (true) {
    const majorVersion = getReactMajorVersion();
    true ? warning_default2(majorVersion >= 18, "version", `antd v6 no longer supports React versions below 18. Please upgrade to React 18 or higher.`) : void 0;
  }

  // .xuyc-entry.js
  var h = react_compat_default.createElement;
  function App() {
    return h(
      "div",
      {
        style: { padding: "24px", background: "#282c34", color: "#abb2bf", fontFamily: "system-ui", minHeight: "100vh" }
      },
      h("h1", { style: { color: "#61afef" } }, "AntD \u8DD1\u5728 XuNay \u4E0A"),
      h("div", { style: { color: "#98c379", marginBottom: "16px" } }, "AntD \u52A0\u8F7D\u6210\u529F"),
      h(
        space_default,
        { direction: "vertical", size: "middle", style: { width: "100%" } },
        h(alert_default, { message: "\u6210\u529F", description: "AntD Alert \u8DD1\u5728 XuNay \u4E0A", type: "success", showIcon: true }),
        h(
          space_default,
          null,
          h(button_default, { type: "primary" }, "\u4E3B\u8981\u6309\u94AE"),
          h(button_default, null, "\u9ED8\u8BA4"),
          h(button_default, { type: "dashed" }, "\u865A\u7EBF"),
          h(button_default, { danger: true }, "\u5371\u9669")
        ),
        h(
          space_default,
          null,
          h(tag_default, { color: "magenta" }, "magenta"),
          h(tag_default, { color: "red" }, "red"),
          h(tag_default, { color: "green" }, "green"),
          h(tag_default, { color: "blue" }, "blue"),
          h(tag_default, { color: "purple" }, "purple")
        )
      )
    );
  }
  react_compat_default.createRoot(document.getElementById("app")).render(h(App));
})();
/*! Bundled license information:

react-is/cjs/react-is.development.js:
  (**
   * @license React
   * react-is.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
