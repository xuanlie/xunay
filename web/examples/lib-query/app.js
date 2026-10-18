(() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
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

  // ../../core/src/react-compat.js
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
    let ref = null;
    if (config) {
      for (const k in config) {
        if (k === "key") {
          key = config[k];
          continue;
        }
        if (k === "ref") {
          ref = config[k];
          continue;
        }
        props[k] = config[k];
      }
    }
    if (children.length === 1) props.children = children[0];
    else if (children.length > 1) props.children = children;
    const vnode = { $$typeof: REACT_ELEMENT, type, key, props };
    if (ref !== null) vnode.ref = ref;
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
    const list = Array.from(pendingEffectInstances);
    pendingEffectInstances.clear();
    for (const inst of list) runEffects(inst);
  }
  function flushUpdates() {
    scheduled = false;
    const list = Array.from(pendingInstances);
    pendingInstances.clear();
    for (const inst of list) rerenderInstance(inst);
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
        const next = typeof action === "function" ? action(slot.value) : action;
        if (Object.is(next, slot.value)) return;
        slot.value = next;
        scheduleUpdate(inst);
      };
    }
    return [slot.value, slot.setter];
  }
  function depsChanged(prev, next) {
    if (!prev) return true;
    if (!next) return true;
    if (prev.length !== next.length) return true;
    for (let i = 0; i < prev.length; i++) if (!Object.is(prev[i], next[i])) return true;
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
    const dispatch = useCallback((action) => setState((prev) => reducer(prev, action)), [reducer]);
    return [state, dispatch];
  }
  function useId() {
    const { slot } = hookSlot();
    if (!("id" in slot)) slot.id = ":x" + (++uid).toString(36);
    return slot.id;
  }
  function useImperativeHandle(ref, create, deps) {
    useEffect(() => {
      if (!ref) return;
      let value;
      try {
        value = create();
      } catch (e) {
        console.error("[compat] useImperativeHandle create \u5931\u8D25:", e);
        return;
      }
      if (typeof ref === "function") {
        try {
          ref(value);
        } catch (_) {
        }
      } else if (ref && typeof ref === "object") ref.current = value;
      return () => {
        if (typeof ref === "function") {
          try {
            ref(null);
          } catch (_) {
          }
        } else if (ref && typeof ref === "object") ref.current = null;
      };
    }, deps);
  }
  function useDebugValue() {
  }
  function createContext(defaultValue) {
    const key = Symbol("xunay-ctx");
    const ctx = {
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
    return ctx;
  }
  function useContext(ctx) {
    if (ctx && ctx._key && currentContexts.has(ctx._key)) {
      return currentContexts.get(ctx._key);
    }
    return ctx ? ctx._defaultValue : void 0;
  }
  function memo(comp) {
    const M = (props) => comp(props);
    M._isMemo = true;
    return M;
  }
  function forwardRef(render3) {
    const F = function forwardRefWrapper(props, ref) {
      return render3(props, ref !== void 0 ? ref : props.ref);
    };
    F._isForwardRef = true;
    return F;
  }
  function lazy(loader) {
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
    const r = typeof fn === "function" ? fn() : fn;
    if (r && typeof r.then === "function") {
      return r.then(() => {
      });
    }
    return r;
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
    const dispatch = useCallback((action) => {
      const next = updateFn ? updateFn(optimistic, action) : action;
      setOptimistic(next);
    }, [optimistic, updateFn]);
    return [optimistic, dispatch];
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
    const next = typeof partial === "function" ? partial(this.state, this.props) : partial;
    this.state = Object.assign({}, this.state || {}, next);
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
  function applyProp(el, key, value, isSvg) {
    if (key === "key" || key === "ref") return;
    if (key === "children") return;
    if (key === "className" || key === "class") {
      el.setAttribute("class", value == null ? "" : value);
      return;
    }
    if (key === "htmlFor") {
      el.setAttribute("for", value == null ? "" : value);
      return;
    }
    if (key === "style") {
      if (typeof value === "string") {
        el.setAttribute("style", value);
        return;
      }
      if (value && typeof value === "object") {
        for (const k in value) {
          const v = value[k];
          if (v == null) continue;
          const cssKey = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          el.style.setProperty(cssKey, String(v));
        }
      }
      return;
    }
    if (key === "dangerouslySetInnerHTML") {
      if (value && value.__html) el.innerHTML = value.__html;
      return;
    }
    if (key.startsWith("on") && typeof value === "function") {
      const evt = key.slice(2).toLowerCase();
      el.addEventListener(evt, value);
      return;
    }
    if (value === false || value == null) return;
    if (value === true) {
      el.setAttribute(key, "");
      return;
    }
    const name = isSvg ? toSvgAttr(key) : key;
    el.setAttribute(name, String(value));
  }
  function renderVNode(vnode) {
    if (vnode == null || vnode === false || vnode === true) {
      return document.createComment("empty");
    }
    const t = typeof vnode;
    if (t === "string" || t === "number") return document.createTextNode(String(vnode));
    if (Array.isArray(vnode)) {
      const frag = document.createDocumentFragment();
      for (const v of vnode) frag.appendChild(renderVNode(v));
      return frag;
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
    const { type, props, ref } = vnode;
    if (type === REACT_FRAGMENT) {
      const frag = document.createDocumentFragment();
      appendChildren(frag, props.children);
      return frag;
    }
    if (typeof type === "function") {
      return renderComponent(type, props, ref);
    }
    const isSvg = SVG_TAGS.has(type);
    const el = isSvg ? document.createElementNS(SVG_NS, type) : document.createElement(type);
    for (const k in props) {
      applyProp(el, k, props[k], isSvg);
    }
    appendChildren(el, props.children);
    if (ref) {
      if (typeof ref === "function") ref(el);
      else if (ref && typeof ref === "object") ref.current = el;
    }
    return el;
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
      const node = renderVNode(vnode.children);
      if (vnode.container && node) {
        vnode.container.appendChild(node);
        const inst = currentInstance;
        if (inst) {
          if (!inst.portals) inst.portals = [];
          inst.portals.push({ container: vnode.container, node });
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
  function renderComponent(type, props, ref) {
    const vnode = { type, props };
    if (ref !== void 0 && ref !== null) vnode.ref = ref;
    const inst = new Instance(vnode);
    inst.contexts = new Map(currentContexts);
    allInstances.add(inst);
    const frag = document.createDocumentFragment();
    frag.appendChild(inst.startMark);
    renderIntoInstance(inst, frag);
    frag.appendChild(inst.endMark);
    return frag;
  }
  function renderIntoInstance(inst, parent) {
    const prev = currentInstance;
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
    currentInstance = prev;
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
    let node = inst.startMark.nextSibling;
    while (node && node !== inst.endMark) {
      if (node._inst && node._inst !== inst) {
        disposeInstance(node._inst);
      }
      node = node.nextSibling;
    }
    node = inst.startMark.nextSibling;
    while (node && node !== inst.endMark) {
      const next = node.nextSibling;
      parent.removeChild(node);
      node = next;
    }
    const frag = document.createDocumentFragment();
    renderIntoInstance(inst, frag);
    parent.insertBefore(frag, inst.endMark);
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
        const node = renderVNode(vnode);
        container.appendChild(node);
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
  function findDOMNode(ref) {
    if (!ref) return null;
    if (ref instanceof Element) return ref;
    return ref._el || null;
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
    let ref = null;
    if (config) {
      for (const k in config) {
        if (k === "key") {
          if (maybeKey === void 0 || maybeKey === null) key = config[k] != null ? String(config[k]) : null;
          continue;
        }
        if (k === "ref") {
          ref = config[k];
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
    if (ref !== null && ref !== void 0) vnode.ref = ref;
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
    lazy,
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

  // ../../node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js
  var QueryClientContext = createContext(void 0);
  var useQueryClient = (queryClient) => {
    const client = useContext(QueryClientContext);
    if (queryClient) return queryClient;
    if (!client) throw new Error("No QueryClient set, use QueryClientProvider to set one");
    return client;
  };
  var QueryClientProvider = ({ client, children }) => {
    useEffect(() => {
      client.mount();
      return () => {
        client.unmount();
      };
    }, [client]);
    return /* @__PURE__ */ jsx(QueryClientContext.Provider, {
      value: client,
      children
    });
  };

  // ../../node_modules/@tanstack/query-core/build/modern/timeoutManager.js
  var defaultTimeoutProvider = {
    setTimeout: (callback, delay) => setTimeout(callback, delay),
    clearTimeout: (timeoutId) => clearTimeout(timeoutId),
    setInterval: (callback, delay) => setInterval(callback, delay),
    clearInterval: (intervalId) => clearInterval(intervalId)
  };
  var _provider, _providerCalled, _a;
  var TimeoutManager = (_a = class {
    constructor() {
      __privateAdd(this, _provider, defaultTimeoutProvider);
      __privateAdd(this, _providerCalled, false);
    }
    /**
    * `setTimeoutProvider` can be used to set a custom implementation of the
    * `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval` functions,
    * called a `TimeoutProvider`.
    *
    * This may be useful if you notice event loop performance issues with
    * thousands of queries. A custom TimeoutProvider could also support timer
    * delays longer than the global `setTimeout` maximum delay value of about
    * 24 days.
    *
    * It is important to call `setTimeoutProvider` before creating a
    * QueryClient or queries, so that the same provider is used consistently
    * for all timers in the application, since different TimeoutProviders
    * cannot cancel each others' timers.
    * @param provider - The `TimeoutProvider` to use for all timers from now on.
    * @example
    * ```ts
    * import { timeoutManager, QueryClient } from '@tanstack/query-core'
    * import { CustomTimeoutProvider } from './CustomTimeoutProvider'
    *
    * timeoutManager.setTimeoutProvider(new CustomTimeoutProvider())
    *
    * export const queryClient = new QueryClient()
    * ```
    */
    setTimeoutProvider(provider) {
      if (true) {
        if (__privateGet(this, _providerCalled) && provider !== __privateGet(this, _provider)) console.error(`[timeoutManager]: Switching provider after calls to previous provider might result in unexpected behavior.`, {
          previous: __privateGet(this, _provider),
          provider
        });
      }
      __privateSet(this, _provider, provider);
      if (true) __privateSet(this, _providerCalled, false);
    }
    /**
    * `setTimeout` schedules a callback to run after approximately `delay`
    * milliseconds, like the global `setTimeout` function. The callback can be
    * canceled with `clearTimeout`.
    *
    * It returns a timer ID, which may be a number or an object that can be
    * coerced to a number via `Symbol.toPrimitive`.
    * @param callback - The function to call when the timeout elapses.
    * @param delay - The time to wait before calling `callback`, in milliseconds.
    * @returns The timer ID, to pass to {@link TimeoutManager#clearTimeout}.
    * @example
    * ```ts
    * import { timeoutManager } from '@tanstack/query-core'
    *
    * const timeoutId = timeoutManager.setTimeout(
    *   () => console.log('ran at:', new Date()),
    *   1000,
    * )
    *
    * const timeoutIdNumber: number = Number(timeoutId)
    * ```
    */
    setTimeout(callback, delay) {
      if (true) __privateSet(this, _providerCalled, true);
      return __privateGet(this, _provider).setTimeout(callback, delay);
    }
    /**
    * `clearTimeout` cancels a timeout callback scheduled with `setTimeout`,
    * like the global `clearTimeout` function. It should be called with a
    * timer ID returned by `setTimeout`.
    * @param timeoutId - The timer ID returned by `setTimeout`, or `undefined`.
    * @example
    * ```ts
    * import { timeoutManager } from '@tanstack/query-core'
    *
    * const timeoutId = timeoutManager.setTimeout(
    *   () => console.log('ran at:', new Date()),
    *   1000,
    * )
    *
    * timeoutManager.clearTimeout(timeoutId)
    * ```
    */
    clearTimeout(timeoutId) {
      __privateGet(this, _provider).clearTimeout(timeoutId);
    }
    /**
    * `setInterval` schedules a callback to be called approximately every
    * `delay` milliseconds, like the global `setInterval` function.
    *
    * Like `setTimeout`, it returns a timer ID, which may be a number or an
    * object that can be coerced to a number via `Symbol.toPrimitive`.
    * @param callback - The function to call on every interval.
    * @param delay - The time between calls, in milliseconds.
    * @returns The timer ID, to pass to {@link TimeoutManager#clearInterval}.
    * @example
    * ```ts
    * import { timeoutManager } from '@tanstack/query-core'
    *
    * const intervalId = timeoutManager.setInterval(
    *   () => console.log('ran at:', new Date()),
    *   1000,
    * )
    * ```
    */
    setInterval(callback, delay) {
      if (true) __privateSet(this, _providerCalled, true);
      return __privateGet(this, _provider).setInterval(callback, delay);
    }
    /**
    * `clearInterval` can be used to cancel an interval, like the global
    * `clearInterval` function. It should be called with an interval ID
    * returned by `setInterval`.
    * @param intervalId - The timer ID returned by `setInterval`, or `undefined`.
    * @example
    * ```ts
    * import { timeoutManager } from '@tanstack/query-core'
    *
    * const intervalId = timeoutManager.setInterval(
    *   () => console.log('ran at:', new Date()),
    *   1000,
    * )
    *
    * timeoutManager.clearInterval(intervalId)
    * ```
    */
    clearInterval(intervalId) {
      __privateGet(this, _provider).clearInterval(intervalId);
    }
  }, _provider = new WeakMap(), _providerCalled = new WeakMap(), _a);
  var timeoutManager = new TimeoutManager();
  function systemSetTimeoutZero(callback) {
    setTimeout(callback, 0);
  }

  // ../../node_modules/@tanstack/query-core/build/modern/utils.js
  var isServer = typeof window === "undefined" || "Deno" in globalThis;
  function noop() {
  }
  function functionalUpdate(updater, input2) {
    return typeof updater === "function" ? updater(input2) : updater;
  }
  function isValidTimeout(value) {
    return typeof value === "number" && value >= 0 && value !== Infinity;
  }
  function timeUntilStale(updatedAt, staleTime) {
    return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
  }
  function resolveQueryValue(value, query) {
    return typeof value === "function" ? value(query) : value;
  }
  function matchQuery(filters, query) {
    const { type = "all", exact, fetchStatus, predicate, queryKey, stale } = filters;
    if (queryKey) {
      if (exact) {
        if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) return false;
      } else if (!partialMatchKey(query.queryKey, queryKey)) return false;
    }
    if (type !== "all") {
      const isActive = query.isActive();
      if (type === "active" && !isActive) return false;
      if (type === "inactive" && isActive) return false;
    }
    if (typeof stale === "boolean" && query.isStale() !== stale) return false;
    if (fetchStatus && fetchStatus !== query.state.fetchStatus) return false;
    if (predicate && !predicate(query)) return false;
    return true;
  }
  function matchMutation(filters, mutation) {
    const { exact, status, predicate, mutationKey } = filters;
    if (mutationKey) {
      if (!mutation.options.mutationKey) return false;
      if (exact) {
        if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) return false;
      } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) return false;
    }
    if (status && mutation.state.status !== status) return false;
    if (predicate && !predicate(mutation)) return false;
    return true;
  }
  function hashQueryKeyByOptions(queryKey, options) {
    return (options?.queryKeyHashFn || hashKey)(queryKey);
  }
  function hashKey(queryKey) {
    return JSON.stringify(queryKey, (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
      result[key] = val[key];
      return result;
    }, {}) : val);
  }
  function partialMatchKey(a2, b) {
    if (a2 === b) return true;
    if (typeof a2 !== typeof b) return false;
    if (a2 && b && typeof a2 === "object" && typeof b === "object") {
      if (Array.isArray(a2) && Array.isArray(b)) {
        if (b.length > a2.length) return false;
        for (let i = 0; i < b.length; i++) if (!partialMatchKey(a2[i], b[i])) return false;
        return true;
      }
      const bKeys = Object.keys(b);
      for (const key of bKeys) if (!partialMatchKey(a2[key], b[key])) return false;
      return true;
    }
    return false;
  }
  var hasOwn = Object.prototype.hasOwnProperty;
  function replaceEqualDeep(a2, b, depth = 0) {
    if (a2 === b) return a2;
    if (depth > 500) return b;
    const array = isPlainArray(a2) && isPlainArray(b);
    if (!array && !(isPlainObject(a2) && isPlainObject(b))) return b;
    const aSize = (array ? a2 : Object.keys(a2)).length;
    const bItems = array ? b : Object.keys(b);
    const bSize = bItems.length;
    const copy = array ? new Array(bSize) : {};
    let equalItems = 0;
    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i];
      const aItem = a2[key];
      const bItem = b[key];
      if (aItem === bItem) {
        copy[key] = aItem;
        if (array ? i < aSize : hasOwn.call(a2, key)) equalItems++;
        continue;
      }
      if (aItem === null || bItem === null || typeof aItem !== "object" || typeof bItem !== "object") {
        copy[key] = bItem;
        continue;
      }
      const v = replaceEqualDeep(aItem, bItem, depth + 1);
      copy[key] = v;
      if (v === aItem) equalItems++;
    }
    return aSize === bSize && equalItems === aSize ? a2 : copy;
  }
  function shallowEqualObjects(a2, b) {
    if (!b || Object.keys(a2).length !== Object.keys(b).length) return false;
    for (const key in a2) if (a2[key] !== b[key]) return false;
    return true;
  }
  function isPlainArray(value) {
    return Array.isArray(value) && value.length === Object.keys(value).length;
  }
  function isPlainObject(o) {
    if (!hasObjectPrototype(o)) return false;
    const objectPrototype = Object.getPrototypeOf(o);
    const ctor = objectPrototype?.constructor;
    if (ctor === void 0) return true;
    if (typeof ctor !== "function") return false;
    const prot = ctor.prototype;
    if (!hasObjectPrototype(prot)) return false;
    if (!prot.hasOwnProperty("isPrototypeOf")) return false;
    if (objectPrototype !== Object.prototype) return false;
    return true;
  }
  function hasObjectPrototype(o) {
    return Object.prototype.toString.call(o) === "[object Object]";
  }
  function sleep(timeout) {
    return new Promise((resolve) => {
      timeoutManager.setTimeout(resolve, timeout);
    });
  }
  function replaceData(prevData, data, options) {
    if (typeof options.structuralSharing === "function") return options.structuralSharing(prevData, data);
    else if (options.structuralSharing !== false) {
      if (true) try {
        return replaceEqualDeep(prevData, data);
      } catch (error) {
        console.error(`Structural sharing requires data to be JSON serializable. To fix this, turn off structuralSharing or return JSON-serializable data from your queryFn. [${options.queryHash}]: ${error}`);
        throw error;
      }
      return replaceEqualDeep(prevData, data);
    }
    return data;
  }
  function addToEnd(items, item, max = 0) {
    const newItems = [...items, item];
    return max && newItems.length > max ? newItems.slice(1) : newItems;
  }
  function addToStart(items, item, max = 0) {
    const newItems = [item, ...items];
    return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
  }
  var skipToken = Symbol();
  function ensureQueryFn(options, fetchOptions) {
    if (true) {
      if (options.queryFn === skipToken) console.error(`Attempted to invoke queryFn when set to skipToken. This is likely a configuration error. Query hash: '${options.queryHash}'`);
    }
    if (!options.queryFn && fetchOptions?.initialPromise) return () => fetchOptions.initialPromise;
    if (!options.queryFn || options.queryFn === skipToken) return () => Promise.reject(/* @__PURE__ */ new Error(`Missing queryFn: '${options.queryHash}'`));
    return options.queryFn;
  }
  function shouldThrowError(throwOnError, params) {
    if (typeof throwOnError === "function") return throwOnError(...params);
    return !!throwOnError;
  }
  function addConsumeAwareSignal(object, getSignal, onCancelled) {
    let consumed = false;
    let signal;
    Object.defineProperty(object, "signal", {
      enumerable: true,
      get: () => {
        signal ?? (signal = getSignal());
        if (consumed) return signal;
        consumed = true;
        if (signal.aborted) onCancelled();
        else signal.addEventListener("abort", onCancelled, { once: true });
        return signal;
      }
    });
    return object;
  }

  // ../../node_modules/@tanstack/query-core/build/modern/environmentManager.js
  var isServerFn = () => isServer;
  var isServer2 = () => isServerFn();

  // ../../node_modules/@tanstack/query-core/build/modern/subscribable.js
  var Subscribable = class {
    constructor() {
      this.listeners = /* @__PURE__ */ new Set();
      this.subscribe = this.subscribe.bind(this);
    }
    /**
    * Registers a listener to be called on every update this object notifies about. Returns a function
    * that removes the listener again — call it to stop listening. The base class never drops a listener
    * on its own, though some subclasses clear all of theirs in `destroy()`.
    * @param listener - Called on each update, with whatever the subclass passes to its subscribers.
    * @returns A function that removes the listener.
    * @example
    * ```ts
    * const unsubscribe = subscribable.subscribe(() => {
    *   // react to the update
    * })
    *
    * unsubscribe()
    * ```
    */
    subscribe(listener) {
      this.listeners.add(listener);
      this.onSubscribe();
      return () => {
        this.listeners.delete(listener);
        this.onUnsubscribe();
      };
    }
    /**
    * Returns `true` while at least one listener is registered, `false` once they have all unsubscribed.
    * @returns `true` if at least one listener is registered.
    */
    hasListeners() {
      return this.listeners.size > 0;
    }
    /**
    * Called after a listener is added. Does nothing here; subclasses override it, e.g. to start
    * tracking what they observe once the first listener subscribes.
    */
    onSubscribe() {
    }
    /**
    * Called after a listener is removed. Does nothing here; subclasses override it, e.g. to clean up
    * once the last listener unsubscribes.
    */
    onUnsubscribe() {
    }
  };

  // ../../node_modules/@tanstack/query-core/build/modern/focusManager.js
  var _focused, _cleanup, _setup, _a2;
  var FocusManager = (_a2 = class extends Subscribable {
    constructor() {
      super();
      __privateAdd(this, _focused);
      __privateAdd(this, _cleanup);
      __privateAdd(this, _setup);
      __privateSet(this, _setup, (onFocus) => {
        if (typeof window !== "undefined" && window.addEventListener) {
          const listener = () => onFocus();
          window.addEventListener("visibilitychange", listener, false);
          return () => {
            window.removeEventListener("visibilitychange", listener);
          };
        }
      });
    }
    onSubscribe() {
      if (!__privateGet(this, _cleanup)) this.setEventListener(__privateGet(this, _setup));
    }
    onUnsubscribe() {
      var _a11;
      if (!this.hasListeners()) {
        (_a11 = __privateGet(this, _cleanup)) == null ? void 0 : _a11.call(this);
        __privateSet(this, _cleanup, void 0);
      }
    }
    /**
    * `setEventListener` can be used to set a custom event listener that will
    * be used to determine the focus state. The provided `setup` function
    * receives a `setFocused` callback: call it with a `boolean` to manually
    * set the focus state, or with no arguments to re-evaluate the current
    * focus state and notify subscribers.
    * @param setup - Receives the `setFocused` callback, registers the event listener, and may return
    * a cleanup function that is called when the listener is replaced or no longer needed.
    * @example
    * ```ts
    * import { focusManager } from '@tanstack/query-core'
    *
    * focusManager.setEventListener((handleFocus) => {
    *   const listener = () => handleFocus()
    *   // Listen to visibilitychange
    *   if (typeof window !== 'undefined' && window.addEventListener) {
    *     window.addEventListener('visibilitychange', listener, false)
    *   }
    *
    *   return () => {
    *     // Be sure to unsubscribe if a new handler is set
    *     window.removeEventListener('visibilitychange', listener)
    *   }
    * })
    * ```
    */
    setEventListener(setup) {
      var _a11;
      __privateSet(this, _setup, setup);
      (_a11 = __privateGet(this, _cleanup)) == null ? void 0 : _a11.call(this);
      __privateSet(this, _cleanup, setup((focused) => {
        if (typeof focused === "boolean") this.setFocused(focused);
        else this.onFocus();
      }));
    }
    /**
    * `setFocused` can be used to manually set the focus state. Set `undefined`
    * to fall back to the default focus check.
    * @param focused - The focus state, or `undefined` to use the default focus check.
    * @example
    * ```ts
    * import { focusManager } from '@tanstack/query-core'
    *
    * // Set focused
    * focusManager.setFocused(true)
    *
    * // Set unfocused
    * focusManager.setFocused(false)
    *
    * // Fallback to the default focus check
    * focusManager.setFocused(undefined)
    * ```
    */
    setFocused(focused) {
      if (__privateGet(this, _focused) !== focused) {
        __privateSet(this, _focused, focused);
        this.onFocus();
      }
    }
    /**
    * `onFocus` notifies all subscribed listeners with the current focus state.
    */
    onFocus() {
      const isFocused = this.isFocused();
      this.listeners.forEach((listener) => {
        listener(isFocused);
      });
    }
    /**
    * `isFocused` can be used to get the current focus state.
    * @returns The focus state set with `setFocused`, or otherwise whether the document is visible.
    */
    isFocused() {
      if (typeof __privateGet(this, _focused) === "boolean") return __privateGet(this, _focused);
      return globalThis.document?.visibilityState !== "hidden";
    }
  }, _focused = new WeakMap(), _cleanup = new WeakMap(), _setup = new WeakMap(), _a2);
  var focusManager = new FocusManager();

  // ../../node_modules/@tanstack/query-core/build/modern/notifyManager.js
  var defaultScheduler = systemSetTimeoutZero;
  function createNotifyManager() {
    let queue = [];
    let transactions = 0;
    let notifyFn = (callback) => {
      callback();
    };
    let batchNotifyFn = (callback) => {
      callback();
    };
    let scheduleFn = defaultScheduler;
    const schedule = (callback) => {
      if (transactions) queue.push(callback);
      else scheduleFn(() => {
        notifyFn(callback);
      });
    };
    const flush = () => {
      const originalQueue = queue;
      queue = [];
      if (originalQueue.length) scheduleFn(() => {
        batchNotifyFn(() => {
          originalQueue.forEach((callback) => {
            notifyFn(callback);
          });
        });
      });
    };
    return {
      /**
      * Batches all updates scheduled inside the passed callback.
      * This is mainly used internally to optimize query client updating.
      * Batches can be nested; the queue is only flushed once the outermost `batch` call finishes.
      * The return value of `callback` is passed through.
      * @param callback - The function to run in the batch.
      * @returns The return value of `callback`.
      */
      batch: (callback) => {
        let result;
        transactions++;
        try {
          result = callback();
        } finally {
          transactions--;
          if (!transactions) flush();
        }
        return result;
      },
      /**
      * All calls to the wrapped function will be batched.
      * @param callback - The function to wrap.
      * @returns A function that schedules a call to `callback` with the given arguments.
      */
      batchCalls: (callback) => {
        return (...args) => {
          schedule(() => {
            callback(...args);
          });
        };
      },
      /**
      * Schedules a function to be run on the next batch.
      * By default, the batch is run with a `setTimeout`, but this can be configured via `setScheduler`.
      */
      schedule,
      /**
      * Use this method to set a custom notify function.
      * This can be used to for example wrap notifications with `React.act` while running tests.
      * @param fn - Receives each notification callback and must call it.
      */
      setNotifyFunction: (fn) => {
        notifyFn = fn;
      },
      /**
      * Use this method to set a custom function to batch notifications together into a single tick.
      * Framework adapters use this to plug in their own batching primitive, so that a single query
      * update only triggers one re-render instead of one per subscriber.
      * @param fn - Receives a function that runs a batch of notifications and must call it.
      * @example
      * ```ts
      * import { notifyManager } from '@tanstack/query-core'
      * import { batch } from 'solid-js'
      *
      * notifyManager.setBatchNotifyFunction(batch)
      * ```
      */
      setBatchNotifyFunction: (fn) => {
        batchNotifyFn = fn;
      },
      /**
      * Configures a custom callback that schedules when the next batch runs.
      * The default behavior is `setTimeout(callback, 0)`.
      * @param fn - Receives a callback that runs the next batch, and schedules it.
      * @example
      * ```ts
      * import { notifyManager } from '@tanstack/query-core'
      *
      * // Schedule batches in the next microtask
      * notifyManager.setScheduler(queueMicrotask)
      *
      * // Schedule batches before the next frame is rendered
      * notifyManager.setScheduler(requestAnimationFrame)
      *
      * // Schedule batches some time in the future
      * notifyManager.setScheduler((cb) => setTimeout(cb, 10))
      * ```
      */
      setScheduler: (fn) => {
        scheduleFn = fn;
      }
    };
  }
  var notifyManager = createNotifyManager();

  // ../../node_modules/@tanstack/query-core/build/modern/onlineManager.js
  var _online, _cleanup2, _setup2, _a3;
  var OnlineManager = (_a3 = class extends Subscribable {
    constructor() {
      super();
      __privateAdd(this, _online, true);
      __privateAdd(this, _cleanup2);
      __privateAdd(this, _setup2);
      __privateSet(this, _setup2, (onOnline) => {
        if (typeof window !== "undefined" && window.addEventListener) {
          const onlineListener = () => onOnline(true);
          const offlineListener = () => onOnline(false);
          window.addEventListener("online", onlineListener, false);
          window.addEventListener("offline", offlineListener, false);
          return () => {
            window.removeEventListener("online", onlineListener);
            window.removeEventListener("offline", offlineListener);
          };
        }
      });
    }
    onSubscribe() {
      if (!__privateGet(this, _cleanup2)) this.setEventListener(__privateGet(this, _setup2));
    }
    onUnsubscribe() {
      var _a11;
      if (!this.hasListeners()) {
        (_a11 = __privateGet(this, _cleanup2)) == null ? void 0 : _a11.call(this);
        __privateSet(this, _cleanup2, void 0);
      }
    }
    /**
    * `setEventListener` can be used to set a custom event listener that will
    * be used to determine the online state. The provided `setup` function
    * receives a `setOnline` callback that should be called with a `boolean`
    * whenever the online state changes.
    * @param setup - Receives the `setOnline` callback, registers the event listener, and may return
    * a cleanup function that is called when the listener is replaced or no longer needed.
    * @example
    * ```ts
    * import NetInfo from '@react-native-community/netinfo'
    * import { onlineManager } from '@tanstack/query-core'
    *
    * onlineManager.setEventListener((setOnline) => {
    *   return NetInfo.addEventListener((state) => {
    *     setOnline(!!state.isConnected)
    *   })
    * })
    * ```
    */
    setEventListener(setup) {
      var _a11;
      __privateSet(this, _setup2, setup);
      (_a11 = __privateGet(this, _cleanup2)) == null ? void 0 : _a11.call(this);
      __privateSet(this, _cleanup2, setup(this.setOnline.bind(this)));
    }
    /**
    * `setOnline` can be used to manually set the online state.
    * @param online - The online state.
    * @example
    * ```ts
    * import { onlineManager } from '@tanstack/query-core'
    *
    * // Set to online
    * onlineManager.setOnline(true)
    *
    * // Set to offline
    * onlineManager.setOnline(false)
    * ```
    */
    setOnline(online) {
      if (__privateGet(this, _online) !== online) {
        __privateSet(this, _online, online);
        this.listeners.forEach((listener) => {
          listener(online);
        });
      }
    }
    /**
    * `isOnline` can be used to get the current online state.
    * @returns `true` if online.
    */
    isOnline() {
      return __privateGet(this, _online);
    }
  }, _online = new WeakMap(), _cleanup2 = new WeakMap(), _setup2 = new WeakMap(), _a3);
  var onlineManager = new OnlineManager();

  // ../../node_modules/@tanstack/query-core/build/modern/retryer.js
  function defaultRetryDelay(failureCount) {
    return Math.min(1e3 * 2 ** failureCount, 3e4);
  }
  function canFetch(networkMode) {
    return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
  }
  var CancelledError = class extends Error {
    constructor(options) {
      super("CancelledError");
      this.revert = options?.revert;
      this.silent = options?.silent;
    }
  };
  function createRetryer(config) {
    let isRetryCancelled = false;
    let failureCount = 0;
    let continueFn;
    let status = "pending";
    let promiseResolve;
    let promiseReject;
    const promise = new Promise((resolve2, reject2) => {
      promiseResolve = resolve2;
      promiseReject = reject2;
    });
    promise.catch(noop);
    const isResolved = () => status !== "pending";
    const cancel = (cancelOptions) => {
      if (!isResolved()) {
        const error = new CancelledError(cancelOptions);
        reject(error);
        config.onCancel?.(error);
      }
    };
    const cancelRetry = () => {
      isRetryCancelled = true;
    };
    const continueRetry = () => {
      isRetryCancelled = false;
    };
    const canContinue = () => focusManager.isFocused() && (config.networkMode === "always" || onlineManager.isOnline()) && config.canRun();
    const canStart = () => canFetch(config.networkMode) && config.canRun();
    const resolve = (value) => {
      if (!isResolved()) {
        continueFn?.();
        status = "resolved";
        promiseResolve(value);
      }
    };
    const reject = (value) => {
      if (!isResolved()) {
        continueFn?.();
        status = "rejected";
        promiseReject(value);
      }
    };
    const pause = (canResume) => {
      return new Promise((continueResolve) => {
        continueFn = (value) => {
          if (isResolved() || canResume()) continueResolve(value);
        };
        config.onPause?.();
      }).then(() => {
        continueFn = void 0;
        if (!isResolved()) config.onContinue?.();
      });
    };
    const run = () => {
      if (isResolved()) return;
      let promiseOrValue;
      const initialPromise = failureCount === 0 ? config.initialPromise : void 0;
      try {
        promiseOrValue = initialPromise ?? config.fn();
      } catch (error) {
        promiseOrValue = Promise.reject(error);
      }
      Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
        if (isResolved()) return;
        const retry = config.retry ?? (isServer2() ? 0 : 3);
        const retryDelay = config.retryDelay ?? defaultRetryDelay;
        const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
        const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
        if (isRetryCancelled || !shouldRetry) {
          reject(error);
          return;
        }
        failureCount++;
        config.onFail?.(failureCount, error);
        sleep(delay).then(() => {
          return canContinue() ? void 0 : pause(canContinue);
        }).then(() => {
          if (isRetryCancelled) reject(error);
          else run();
        });
      });
    };
    return {
      promise,
      status: () => status,
      cancel,
      continue: () => {
        continueFn?.();
        return promise;
      },
      cancelRetry,
      continueRetry,
      canStart,
      start: () => {
        if (canStart()) run();
        else pause(canStart).then(run);
        return promise;
      }
    };
  }

  // ../../node_modules/@tanstack/query-core/build/modern/removable.js
  var _gcTimeout, _a4;
  var Removable = (_a4 = class {
    constructor() {
      __privateAdd(this, _gcTimeout);
    }
    /**
    * Clears the pending garbage collection timeout, so the entry is no longer scheduled for removal.
    * A subclass may override this to release what it holds on to as well — `Query` also cancels any
    * in-flight fetch.
    */
    destroy() {
      this.clearGcTimeout();
    }
    /**
    * Schedules the entry to be removed from its cache after `gcTime`, replacing any timeout scheduled
    * before. Nothing is scheduled if `gcTime` is `Infinity`.
    */
    scheduleGc() {
      this.clearGcTimeout();
      if (isValidTimeout(this.gcTime)) __privateSet(this, _gcTimeout, timeoutManager.setTimeout(() => {
        this.optionalRemove();
      }, this.gcTime));
    }
    /**
    * Updates `gcTime`, keeping the longest one seen so far. Without a value, it defaults to 5 minutes
    * on the client and `Infinity` on the server.
    * @param newGcTime - The `gcTime` from the latest options, if any.
    */
    updateGcTime(newGcTime) {
      this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? (isServer2() ? Infinity : 3e5));
    }
    /**
    * Cancels the scheduled removal, if there is one.
    */
    clearGcTimeout() {
      if (__privateGet(this, _gcTimeout) !== void 0) {
        timeoutManager.clearTimeout(__privateGet(this, _gcTimeout));
        __privateSet(this, _gcTimeout, void 0);
      }
    }
  }, _gcTimeout = new WeakMap(), _a4);

  // ../../node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js
  function infiniteQueryBehavior(pages) {
    return { onFetch: (context, query) => {
      const options = context.options;
      const direction = context.fetchOptions?.meta?.fetchMore?.direction;
      const oldPages = context.state.data?.pages || [];
      const oldPageParams = context.state.data?.pageParams || [];
      let result = {
        pages: [],
        pageParams: []
      };
      let currentPage = 0;
      const fetchFn = async () => {
        let cancelled = false;
        const addSignalProperty = (object) => {
          addConsumeAwareSignal(object, () => context.signal, () => cancelled = true);
        };
        const queryFn = ensureQueryFn(context.options, context.fetchOptions);
        const fetchPage = async (data, param, previous) => {
          if (cancelled) return Promise.reject(context.signal.reason);
          if (param == null && data.pages.length) return Promise.resolve(data);
          const createQueryFnContext = () => {
            const queryFnContext2 = {
              client: context.client,
              queryKey: context.queryKey,
              pageParam: param,
              direction: previous ? "backward" : "forward",
              meta: context.options.meta
            };
            addSignalProperty(queryFnContext2);
            return queryFnContext2;
          };
          const queryFnContext = createQueryFnContext();
          const page = await queryFn(queryFnContext);
          const { maxPages } = context.options;
          const addTo = previous ? addToStart : addToEnd;
          return {
            pages: addTo(data.pages, page, maxPages),
            pageParams: addTo(data.pageParams, param, maxPages)
          };
        };
        if (direction && oldPages.length) {
          const previous = direction === "backward";
          const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
          const oldData = {
            pages: oldPages,
            pageParams: oldPageParams
          };
          result = await fetchPage(oldData, pageParamFn(options, oldData), previous);
        } else {
          const remainingPages = pages ?? oldPages.length;
          do {
            const param = currentPage === 0 ? oldPageParams[0] ?? options.initialPageParam : getNextPageParam(options, result);
            if (currentPage > 0 && param == null) break;
            result = await fetchPage(result, param);
            currentPage++;
          } while (currentPage < remainingPages);
        }
        return result;
      };
      if (context.options.persister) context.fetchFn = () => {
        return context.options.persister?.(fetchFn, {
          client: context.client,
          queryKey: context.queryKey,
          meta: context.options.meta,
          signal: context.signal
        }, query);
      };
      else context.fetchFn = fetchFn;
    } };
  }
  function getNextPageParam(options, { pages, pageParams }) {
    const lastIndex = pages.length - 1;
    return pages.length > 0 ? options.getNextPageParam(pages[lastIndex], pages, pageParams[lastIndex], pageParams) : void 0;
  }
  function getPreviousPageParam(options, { pages, pageParams }) {
    return pages.length > 0 ? options.getPreviousPageParam?.(pages[0], pages, pageParams[0], pageParams) : void 0;
  }

  // ../../node_modules/@tanstack/query-core/build/modern/query.js
  var _queryType, _initialState, _revertState, _cache, _client, _retryer, _defaultOptions, _abortSignalConsumed, _Query_instances, dispatch_fn, _a5;
  var Query = (_a5 = class extends Removable {
    constructor(config) {
      super();
      __privateAdd(this, _Query_instances);
      __privateAdd(this, _queryType);
      __privateAdd(this, _initialState);
      __privateAdd(this, _revertState);
      __privateAdd(this, _cache);
      __privateAdd(this, _client);
      __privateAdd(this, _retryer);
      __privateAdd(this, _defaultOptions);
      __privateAdd(this, _abortSignalConsumed);
      __privateSet(this, _abortSignalConsumed, false);
      __privateSet(this, _defaultOptions, config.defaultOptions);
      this.setOptions(config.options);
      this.observers = [];
      __privateSet(this, _client, config.client);
      __privateSet(this, _cache, __privateGet(this, _client).getQueryCache());
      this.queryKey = config.queryKey;
      this.queryHash = config.queryHash;
      __privateSet(this, _initialState, getDefaultState(this.options));
      this.state = config.state ?? __privateGet(this, _initialState);
      this.scheduleGc();
    }
    /**
    * The `meta` object passed in the query's options, if any.
    * @returns The query's `meta`, or `undefined` if none was set.
    */
    get meta() {
      return this.options.meta;
    }
    /**
    * `'infinite'` for an infinite query, otherwise `undefined`.
    * @internal
    * @returns The type of the query, set from the `_type` option (e.g. `'infinite'`).
    */
    get queryType() {
      return __privateGet(this, _queryType);
    }
    /**
    * The promise for the currently in-flight fetch, if the query is fetching.
    * `undefined` when the query is not fetching.
    * @returns The promise of the in-flight fetch, or `undefined`.
    */
    get promise() {
      return __privateGet(this, _retryer)?.promise;
    }
    /**
    * Replaces the query's options and applies their `gcTime`. If the query has no data yet, it gets
    * the `initialData` from the new options, if any.
    * @internal
    * @param options - The new query options, merged on top of the query's default options.
    */
    setOptions(options) {
      this.options = {
        ...__privateGet(this, _defaultOptions),
        ...options
      };
      if (options?._type) __privateSet(this, _queryType, options._type);
      this.updateGcTime(this.options.gcTime);
      if (this.state && this.state.data === void 0) {
        const defaultState = getDefaultState(this.options);
        if (defaultState.data !== void 0) {
          this.setState(successState(defaultState.data, defaultState.dataUpdatedAt));
          __privateSet(this, _initialState, defaultState);
        }
      }
    }
    optionalRemove() {
      if (!this.observers.length && this.state.fetchStatus === "idle") __privateGet(this, _cache).remove(this);
    }
    /**
    * Writes new data to the query and marks it as successfully fetched.
    * @internal
    * @param newData - The data to write. Structural sharing with the current data is applied.
    * @param options - Set `updatedAt` to override the timestamp, and `manual` to mark the write as
    * manual (e.g. from `queryClient.setQueryData`).
    * @returns The data that was written.
    */
    setData(newData, options) {
      const data = replaceData(this.state.data, newData, this.options);
      __privateMethod(this, _Query_instances, dispatch_fn).call(this, {
        data,
        type: "success",
        dataUpdatedAt: options?.updatedAt,
        manual: options?.manual
      });
      return data;
    }
    /**
    * Merges the given partial state directly into this query's state, notifying observers. Used
    * by persistence and broadcast plugins to restore a state snapshot, and by devtools to let a
    * user manually trigger a loading/error state or edit the cached data.
    * @param state - The partial state to merge into the query's state.
    */
    setState(state) {
      __privateMethod(this, _Query_instances, dispatch_fn).call(this, {
        type: "setState",
        state
      });
    }
    /**
    * Cancels the query's currently in-flight fetch, if any.
    * - Returns a promise that resolves once the cancellation has settled.
    * - If no fetch is in progress, resolves immediately.
    * @param options - Set `revert` to restore the state from before the fetch started, and `silent`
    * to suppress the cancellation error when a new fetch replaces the cancelled one.
    * @returns A promise that resolves once the cancellation has settled.
    * @example
    * ```ts
    * await query.cancel()
    * ```
    */
    cancel(options) {
      const promise = __privateGet(this, _retryer)?.promise;
      __privateGet(this, _retryer)?.cancel(options);
      return promise ? promise.then(noop).catch(noop) : Promise.resolve();
    }
    /**
    * Clears the query's garbage collection timeout and silently cancels any
    * in-flight fetch. Called by `QueryCache` when the query is removed from
    * the cache.
    * @see {@link Query#cancel}
    */
    destroy() {
      super.destroy();
      this.cancel({ silent: true });
    }
    /**
    * The state the query was created with.
    * @internal
    * @returns The state the query had when it was first created, used by {@link Query#reset}.
    */
    get resetState() {
      return __privateGet(this, _initialState);
    }
    /**
    * Resets the query back to its initial state (the state it had when it was
    * first created, e.g. any `initialData`), destroying it first to cancel any
    * in-flight fetch.
    */
    reset() {
      this.destroy();
      this.setState(this.resetState);
    }
    /**
    * Returns `true` if the query has at least one observer for which `enabled`
    * does not resolve to `false`.
    * @returns `true` if the query has an enabled observer.
    */
    isActive() {
      return this.observers.some((observer) => resolveQueryValue(observer.options.enabled, this) !== false);
    }
    /**
    * Returns `true` if the query is disabled, meaning it will not fetch
    * automatically.
    * - If the query has observers, it is disabled when none of them are active
    *   (see `isActive`).
    * - If the query has no observers, it is disabled when its `queryFn` is
    *   `skipToken` or it has never been fetched.
    * @returns `true` if the query is disabled.
    */
    isDisabled() {
      if (this.getObserversCount() > 0) return !this.isActive();
      return this.options.queryFn === skipToken || !this.isFetched();
    }
    /**
    * Returns `true` if the query has been fetched, i.e. it has resolved with
    * either data or an error at least once.
    * @returns `true` if the query has been fetched.
    */
    isFetched() {
      return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
    }
    /**
    * Returns `true` if the query has at least one observer configured with
    * `staleTime: 'static'`, meaning it is treated as never stale.
    * @returns `true` if the query is static.
    */
    isStatic() {
      if (this.getObserversCount() > 0) return this.observers.some((observer) => resolveQueryValue(observer.options.staleTime, this) === "static");
      return false;
    }
    /**
    * Returns `true` if the query is stale.
    * - If the query has observers, defers to whether any observer's current
    *   result reports `isStale` (which accounts for each observer's own
    *   `staleTime` and `enabled` state).
    * - If the query has no observers, it is considered stale when it has no
    *   data or has been invalidated.
    * @returns `true` if the query is stale.
    * @see {@link Query#isStaleByTime}
    * @example
    * ```ts
    * if (query.isStale()) {
    *   // refetch or otherwise treat the cached data as outdated
    * }
    * ```
    */
    isStale() {
      if (this.getObserversCount() > 0) return this.observers.some((observer) => observer.getCurrentResult().isStale);
      return this.state.data === void 0 || this.state.isInvalidated;
    }
    /**
    * Returns `true` if the query's data is stale relative to the given
    * `staleTime` (defaults to `0`).
    * - A query with no data is always stale.
    * - `staleTime: 'static'` is never stale.
    * - An invalidated query is always stale.
    * - Otherwise, staleness is based on elapsed time since `dataUpdatedAt`.
    * @param staleTime - The time, in milliseconds, after which data is considered stale, or
    * `'static'` to never treat existing data as stale. A query without data is stale either way.
    * @returns `true` if the query's data is stale.
    * @see {@link Query#isStale}
    * @example
    * ```ts
    * const isStale = query.isStaleByTime(1000 * 60)
    * ```
    */
    isStaleByTime(staleTime = 0) {
      if (this.state.data === void 0) return true;
      if (staleTime === "static") return false;
      if (this.state.isInvalidated) return true;
      return !timeUntilStale(this.state.dataUpdatedAt, staleTime);
    }
    /**
    * Refetches the query when the window regains focus, if an observer wants that, and continues a
    * paused fetch.
    * @internal
    */
    onFocus() {
      this.observers.find((x) => x.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: false });
      __privateGet(this, _retryer)?.continue();
    }
    /**
    * Refetches the query when the app reconnects, if an observer wants that, and continues a paused
    * fetch.
    * @internal
    */
    onOnline() {
      this.observers.find((x) => x.shouldFetchOnReconnect())?.refetch({ cancelRefetch: false });
      __privateGet(this, _retryer)?.continue();
    }
    /**
    * Subscribes an observer to the query and stops its garbage collection.
    * @internal
    * @param observer - The observer to add. Adding an observer that is already subscribed does
    * nothing.
    */
    addObserver(observer) {
      if (!this.observers.includes(observer)) {
        this.observers.push(observer);
        this.clearGcTimeout();
        __privateGet(this, _cache).notify({
          type: "observerAdded",
          query: this,
          observer
        });
      }
    }
    /**
    * Unsubscribes an observer from the query.
    * @internal
    * @param observer - The observer to remove. When the last observer is removed, the in-flight
    * fetch is cancelled if its abort signal was consumed (otherwise only its retries are stopped),
    * and garbage collection is scheduled.
    */
    removeObserver(observer) {
      const index = this.observers.indexOf(observer);
      if (index !== -1) {
        this.observers.splice(index, 1);
        if (!this.observers.length) {
          if (__privateGet(this, _retryer)) {
            if (__privateGet(this, _abortSignalConsumed) || this.state.fetchStatus === "paused" && this.state.status === "pending") __privateGet(this, _retryer).cancel({ revert: true });
            else __privateGet(this, _retryer).cancelRetry();
          }
          this.scheduleGc();
        }
        __privateGet(this, _cache).notify({
          type: "observerRemoved",
          query: this,
          observer
        });
      }
    }
    /**
    * Returns the number of observers currently subscribed to this query.
    * @returns The number of observers.
    * @example
    * ```ts
    * if (query.getObserversCount() === 0) {
    *   // no component is currently watching this query
    * }
    * ```
    */
    getObserversCount() {
      return this.observers.length;
    }
    /**
    * Marks the query as invalidated, unless it is already invalidated. This
    * updates `state.isInvalidated` and notifies observers, but does not by
    * itself trigger a refetch.
    * @example
    * ```ts
    * query.invalidate()
    * ```
    */
    invalidate() {
      if (!this.state.isInvalidated) __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "invalidate" });
    }
    /**
    * Fetches the query, i.e. runs its `queryFn` (through any configured
    * retryer/behavior) and updates the query's state with the result.
    * - If a fetch is already in flight, returns its promise instead of
    *   starting a new one, unless `fetchOptions.cancelRefetch` is set and the
    *   query already has data, in which case the current fetch is silently
    *   cancelled first.
    * - If `options` is passed, it replaces the query's current options
    *   before fetching.
    * @param options - Query options that replace the query's current options before fetching. They
    * are not applied when an in-flight fetch is reused.
    * @param fetchOptions - Set `cancelRefetch` to cancel an in-flight fetch first (only if the query
    * already has data), and `meta` to pass extra information to the query's behavior.
    * @returns A promise that resolves with the fetched data, or rejects with the fetch error. If the
    * fetch is cancelled with `revert` while the query has data, it resolves with the restored data
    * instead.
    */
    async fetch(options, fetchOptions) {
      if (this.state.fetchStatus !== "idle" && __privateGet(this, _retryer)?.status() !== "rejected") {
        if (this.state.data !== void 0 && fetchOptions?.cancelRefetch) this.cancel({ silent: true });
        else if (__privateGet(this, _retryer)) {
          __privateGet(this, _retryer).continueRetry();
          return __privateGet(this, _retryer).promise;
        }
      }
      if (options) this.setOptions(options);
      if (!this.options.queryFn) {
        const observer = this.observers.find((x) => x.options.queryFn);
        if (observer) this.setOptions(observer.options);
      }
      if (true) {
        if (!Array.isArray(this.options.queryKey)) console.error(`As of v4, queryKey needs to be an Array. If you are using a string like 'repoData', please change it to an Array, e.g. ['repoData']`);
      }
      const abortController = new AbortController();
      const addSignalProperty = (object) => {
        Object.defineProperty(object, "signal", {
          enumerable: true,
          get: () => {
            __privateSet(this, _abortSignalConsumed, true);
            return abortController.signal;
          }
        });
      };
      const fetchFn = () => {
        const queryFn = ensureQueryFn(this.options, fetchOptions);
        const createQueryFnContext = () => {
          const queryFnContext2 = {
            client: __privateGet(this, _client),
            queryKey: this.queryKey,
            meta: this.meta
          };
          addSignalProperty(queryFnContext2);
          return queryFnContext2;
        };
        const queryFnContext = createQueryFnContext();
        __privateSet(this, _abortSignalConsumed, false);
        if (this.options.persister) return this.options.persister(queryFn, queryFnContext, this);
        return queryFn(queryFnContext);
      };
      const createFetchContext = () => {
        const context2 = {
          fetchOptions,
          options: this.options,
          queryKey: this.queryKey,
          client: __privateGet(this, _client),
          state: this.state,
          fetchFn
        };
        addSignalProperty(context2);
        return context2;
      };
      const context = createFetchContext();
      (__privateGet(this, _queryType) === "infinite" ? infiniteQueryBehavior(this.options.pages) : this.options.behavior)?.onFetch(context, this);
      __privateSet(this, _revertState, this.state);
      if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== context.fetchOptions?.meta) __privateMethod(this, _Query_instances, dispatch_fn).call(this, {
        type: "fetch",
        meta: context.fetchOptions?.meta
      });
      const retryer = __privateSet(this, _retryer, createRetryer({
        initialPromise: fetchOptions?.initialPromise,
        fn: context.fetchFn,
        onCancel: (error) => {
          if (error instanceof CancelledError && error.revert) this.setState({
            ...__privateGet(this, _revertState),
            fetchStatus: "idle"
          });
          abortController.abort();
        },
        onFail: (failureCount, error) => {
          __privateMethod(this, _Query_instances, dispatch_fn).call(this, {
            type: "failed",
            failureCount,
            error
          });
        },
        onPause: () => {
          __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "pause" });
        },
        onContinue: () => {
          __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "continue" });
        },
        retry: context.options.retry,
        retryDelay: context.options.retryDelay,
        networkMode: context.options.networkMode,
        canRun: () => true
      }));
      try {
        const data = await retryer.start();
        if (data === void 0) {
          if (true) console.error(`Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ${this.queryHash}`);
          throw new Error(`${this.queryHash} data is undefined`);
        }
        this.setData(data);
        __privateGet(this, _cache).config.onSuccess?.(data, this);
        __privateGet(this, _cache).config.onSettled?.(data, this.state.error, this);
        return data;
      } catch (error) {
        if (error instanceof CancelledError) {
          if (error.silent) return __privateGet(this, _retryer).promise;
          else if (error.revert) {
            if (this.state.data === void 0) throw error;
            return this.state.data;
          }
        }
        __privateMethod(this, _Query_instances, dispatch_fn).call(this, {
          type: "error",
          error
        });
        __privateGet(this, _cache).config.onError?.(error, this);
        __privateGet(this, _cache).config.onSettled?.(this.state.data, error, this);
        throw error;
      } finally {
        if (__privateGet(this, _retryer) === retryer) __privateSet(this, _retryer, void 0);
        this.scheduleGc();
      }
    }
  }, _queryType = new WeakMap(), _initialState = new WeakMap(), _revertState = new WeakMap(), _cache = new WeakMap(), _client = new WeakMap(), _retryer = new WeakMap(), _defaultOptions = new WeakMap(), _abortSignalConsumed = new WeakMap(), _Query_instances = new WeakSet(), dispatch_fn = function(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            fetchFailureCount: action.failureCount,
            fetchFailureReason: action.error
          };
        case "pause":
          return {
            ...state,
            fetchStatus: "paused"
          };
        case "continue":
          return {
            ...state,
            fetchStatus: "fetching"
          };
        case "fetch":
          return {
            ...state,
            ...fetchState(state.data, this.options),
            fetchMeta: action.meta ?? null
          };
        case "success":
          const newState = {
            ...state,
            ...successState(action.data, action.dataUpdatedAt),
            dataUpdateCount: state.dataUpdateCount + 1,
            ...!action.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null
            }
          };
          __privateSet(this, _revertState, action.manual ? newState : void 0);
          return newState;
        case "error":
          const error = action.error;
          return {
            ...state,
            error,
            errorUpdateCount: state.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: state.fetchFailureCount + 1,
            fetchFailureReason: error,
            fetchStatus: "idle",
            status: "error",
            isInvalidated: true
          };
        case "invalidate":
          return {
            ...state,
            isInvalidated: true
          };
        case "setState":
          return {
            ...state,
            ...action.state
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.observers.slice().forEach((observer) => {
        observer.onQueryUpdate();
      });
      __privateGet(this, _cache).notify({
        query: this,
        type: "updated",
        action
      });
    });
  }, _a5);
  function fetchState(data, options) {
    return {
      fetchFailureCount: 0,
      fetchFailureReason: null,
      fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
      ...data === void 0 && {
        error: null,
        status: "pending"
      }
    };
  }
  function successState(data, dataUpdatedAt) {
    return {
      data,
      dataUpdatedAt: dataUpdatedAt ?? Date.now(),
      error: null,
      isInvalidated: false,
      status: "success"
    };
  }
  function getDefaultState(options) {
    const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
    const hasData = data !== void 0;
    const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
    return {
      data,
      dataUpdateCount: 0,
      dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      fetchFailureCount: 0,
      fetchFailureReason: null,
      fetchMeta: null,
      isInvalidated: false,
      status: hasData ? "success" : "pending",
      fetchStatus: "idle"
    };
  }

  // ../../node_modules/@tanstack/query-core/build/modern/queryObserver.js
  var _client2, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, shouldScheduleTimer_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, _a6;
  var QueryObserver = (_a6 = class extends Subscribable {
    constructor(client, options) {
      super();
      __privateAdd(this, _QueryObserver_instances);
      __privateAdd(this, _client2);
      __privateAdd(this, _currentQuery);
      __privateAdd(this, _currentQueryInitialState);
      __privateAdd(this, _currentResult);
      __privateAdd(this, _currentResultState);
      __privateAdd(this, _currentResultOptions);
      __privateAdd(this, _selectError);
      __privateAdd(this, _selectFn);
      __privateAdd(this, _selectResult);
      __privateAdd(this, _lastQueryWithDefinedData);
      __privateAdd(this, _staleTimeoutId);
      __privateAdd(this, _refetchIntervalId);
      __privateAdd(this, _currentRefetchInterval);
      __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
      this.options = options;
      __privateSet(this, _client2, client);
      __privateSet(this, _selectError, null);
      this.bindMethods();
      this.setOptions(options);
    }
    /**
    * Binds the methods of the result (`refetch`) to the observer, so they keep working when destructured
    * from it. Subclasses override it to bind their own result methods as well.
    */
    bindMethods() {
      this.refetch = this.refetch.bind(this);
    }
    onSubscribe() {
      if (this.listeners.size === 1) {
        __privateGet(this, _currentQuery).addObserver(this);
        if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
        else this.updateResult();
        __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
      }
    }
    onUnsubscribe() {
      if (!this.hasListeners()) this.destroy();
    }
    /**
    * Returns whether the observed query is currently stale and configured
    * (via the `refetchOnReconnect` option) to refetch when the network
    * reconnects.
    * @returns `true` if the observer should refetch the query on reconnect.
    */
    shouldFetchOnReconnect() {
      return shouldFetchOn(__privateGet(this, _currentQuery), this.options, this.options.refetchOnReconnect);
    }
    /**
    * Returns whether the observed query is currently stale and configured
    * (via the `refetchOnWindowFocus` option) to refetch when the window
    * regains focus.
    * @returns `true` if the observer should refetch the query on window focus.
    */
    shouldFetchOnWindowFocus() {
      return shouldFetchOn(__privateGet(this, _currentQuery), this.options, this.options.refetchOnWindowFocus);
    }
    /**
    * Stops observing the current query: clears all listeners, cancels the
    * stale and refetch-interval timers, and removes this observer from the
    * query it was observing.
    */
    destroy() {
      this.listeners = /* @__PURE__ */ new Set();
      __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
      __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
      __privateGet(this, _currentQuery).removeObserver(this);
    }
    /**
    * Updates the observer's options. This will re-resolve the query being
    * observed (switching to a different query if the `queryKey` changed),
    * trigger a fetch if the new options require one and the observer has
    * subscribers, recompute the current result, and reschedule the stale and
    * refetch-interval timers as needed.
    * @param options - The new observer options. They are defaulted with {@link
    * QueryClient#defaultQueryOptions} before being applied.
    * @throws {Error} If `enabled` is neither a boolean nor a function.
    * @example
    * ```ts
    * observer.setOptions({ queryKey: ['posts', 1], queryFn: () => fetchPost(1) })
    * // later: switch to a different query, reusing the same observer
    * observer.setOptions({ queryKey: ['posts', 2], queryFn: () => fetchPost(2) })
    * ```
    */
    setOptions(options) {
      const prevOptions = this.options;
      const prevQuery = __privateGet(this, _currentQuery);
      this.options = __privateGet(this, _client2).defaultQueryOptions(options);
      if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveQueryValue(this.options.enabled, __privateGet(this, _currentQuery)) !== "boolean") throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
      __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
      __privateGet(this, _currentQuery).setOptions(this.options);
      if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) __privateGet(this, _client2).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
      const mounted = this.hasListeners();
      if (mounted && shouldFetchOptionally(__privateGet(this, _currentQuery), prevQuery, this.options, prevOptions)) __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
      this.updateResult();
      if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveQueryValue(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveQueryValue(prevOptions.enabled, __privateGet(this, _currentQuery)) || resolveQueryValue(this.options.staleTime, __privateGet(this, _currentQuery)) !== resolveQueryValue(prevOptions.staleTime, __privateGet(this, _currentQuery)))) __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
      const nextRefetchInterval = __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this);
      if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveQueryValue(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveQueryValue(prevOptions.enabled, __privateGet(this, _currentQuery)) || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
    /**
    * Computes the result the observer would produce for the given (already-defaulted) options
    * right now, building the underlying `Query` if it doesn't exist yet, without waiting for a
    * subscription callback. Called by framework adapters on every render (e.g. `useQuery`) so the
    * returned value is available synchronously, ahead of `setOptions` triggering an actual fetch.
    * @param options - The defaulted observer options to compute the result for.
    * @returns The result for the given options.
    */
    getOptimisticResult(options) {
      const query = __privateGet(this, _client2).getQueryCache().build(__privateGet(this, _client2), options);
      const result = this.createResult(query, options);
      if (!shallowEqualObjects(this.getCurrentResult(), result)) {
        __privateSet(this, _currentResult, result);
        __privateSet(this, _currentResultOptions, this.options);
        __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
      }
      return result;
    }
    /**
    * Returns the most recently computed `QueryObserverResult` for the
    * observed query. This is a point-in-time read; to be notified of updates
    * as they happen, subscribe to the observer instead (its inherited
    * `subscribe` method).
    * @returns The observer's latest result.
    * @example
    * ```ts
    * const result = observer.getCurrentResult()
    * console.log(result.status, result.data)
    * ```
    */
    getCurrentResult() {
      return __privateGet(this, _currentResult);
    }
    /**
    * Wraps a `QueryObserverResult` in a `Proxy` that records which properties are read, via
    * {@link QueryObserver#trackProp} (and an optional `onPropTracked` callback). Used by framework
    * adapters when `notifyOnChangeProps` is not set, to implement its default "only re-render on
    * properties you actually read" behavior.
    * @param result - The result to wrap.
    * @param onPropTracked - Called with the name of each property that is read.
    * @returns A proxy of `result` that tracks property reads.
    */
    trackResult(result, onPropTracked) {
      return new Proxy(result, { get: (target, key) => {
        this.trackProp(key);
        onPropTracked?.(key);
        return Reflect.get(target, key);
      } });
    }
    /**
    * Records that the given `QueryObserverResult` property was read, so a subsequent update only
    * notifies this observer if a tracked property actually changed. Normally called indirectly via
    * {@link QueryObserver#trackResult}'s proxy; exposed directly for adapters that track property
    * access themselves (e.g. through their own reactivity system) instead of via the proxy.
    * @param key - The name of the property that was read.
    */
    trackProp(key) {
      __privateGet(this, _trackedProps).add(key);
    }
    /**
    * Returns the `Query` instance this observer is currently observing.
    * @returns The observed query.
    */
    getCurrentQuery() {
      return __privateGet(this, _currentQuery);
    }
    /**
    * Refetches the observed query and returns a promise that resolves with
    * the resulting `QueryObserverResult`.
    * @param options - Set `cancelRefetch` to `false` to keep a running fetch instead of cancelling
    * it, and `throwOnError` to `true` to reject when the refetch fails.
    * @returns A promise that resolves with the result after the refetch.
    * @example
    * ```ts
    * const result = await observer.refetch({ cancelRefetch: false })
    * console.log(result.data)
    * ```
    */
    refetch({ ...options } = {}) {
      return this.fetch({ ...options });
    }
    /**
    * Fetches a query defined by the given options without affecting this
    * observer's own tracked query or result, and returns a promise that
    * resolves with the `QueryObserverResult` for that fetch. This is useful
    * for prefetching data that another observer (e.g. a query about to be
    * navigated to) will need, ahead of time.
    * @param options - The observer options of the query to fetch.
    * @returns A promise that resolves with the result for the fetched query.
    * @example
    * ```ts
    * const result = await observer.fetchOptimistic({
    *   queryKey: ['posts', 2],
    *   queryFn: () => fetchPost(2),
    * })
    * console.log(result.data)
    * ```
    */
    fetchOptimistic(options) {
      const defaultedOptions = __privateGet(this, _client2).defaultQueryOptions(options);
      const query = __privateGet(this, _client2).getQueryCache().build(__privateGet(this, _client2), defaultedOptions);
      let unsubscribe = () => {
      };
      let resolveEarly;
      const cachePromise = new Promise((resolve) => {
        resolveEarly = resolve;
        unsubscribe = __privateGet(this, _client2).getQueryCache().subscribe((event) => {
          if (event.type === "updated" && event.query.queryHash === query.queryHash && query.state.data !== void 0) {
            unsubscribe();
            resolve(this.createResult(query, defaultedOptions));
          }
        });
      });
      return Promise.race([query.fetch().then(() => {
        const result = this.createResult(query, defaultedOptions);
        resolveEarly?.(result);
        return result;
      }).finally(() => {
        unsubscribe();
      }), cachePromise]);
    }
    /**
    * Fetches the observed query and updates the result once the fetch settles. Used by `refetch` and,
    * in `InfiniteQueryObserver`, to fetch more pages.
    * @param fetchOptions - Options for this fetch. `cancelRefetch` defaults to `true`.
    * @returns A promise that resolves with the updated result.
    */
    fetch(fetchOptions) {
      return __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this, {
        ...fetchOptions,
        cancelRefetch: fetchOptions.cancelRefetch ?? true
      }).then(() => {
        this.updateResult();
        return __privateGet(this, _currentResult);
      });
    }
    /**
    * Computes the result for a query and options from the query's state, applying `select`,
    * `placeholderData`, and the derived flags. Subclasses override it to add their own fields.
    * @param query - The query to compute the result for.
    * @param options - The observer options to compute the result with.
    * @returns The computed result.
    */
    createResult(query, options) {
      const prevQuery = __privateGet(this, _currentQuery);
      const prevOptions = this.options;
      const prevResult = __privateGet(this, _currentResult);
      const prevResultState = __privateGet(this, _currentResultState);
      const prevResultOptions = __privateGet(this, _currentResultOptions);
      const queryInitialState = query !== prevQuery ? query.state : __privateGet(this, _currentQueryInitialState);
      const { state } = query;
      let newState = { ...state };
      let isPlaceholderData = false;
      let data;
      if (options._optimisticResults) {
        const mounted = this.hasListeners();
        const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
        const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
        if (fetchOnMount || fetchOptionally) newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
        if (options._optimisticResults === "isRestoring") newState.fetchStatus = "idle";
      }
      let { error, errorUpdatedAt, status } = newState;
      data = newState.data;
      let skipSelect = false;
      if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
        let placeholderData;
        if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
          placeholderData = prevResult.data;
          skipSelect = true;
        } else placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(__privateGet(this, _lastQueryWithDefinedData)?.state.data, __privateGet(this, _lastQueryWithDefinedData)) : options.placeholderData;
        if (placeholderData !== void 0) {
          status = "success";
          data = replaceData(prevResult?.data, placeholderData, options);
          isPlaceholderData = true;
        }
      }
      if (options.select && data !== void 0 && !skipSelect) {
        if (prevResult && data === prevResultState?.data && options.select === __privateGet(this, _selectFn)) data = __privateGet(this, _selectResult);
        else try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(data);
          data = replaceData(prevResult?.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      } else if (data === void 0) __privateSet(this, _selectError, null);
      if (__privateGet(this, _selectError)) {
        error = __privateGet(this, _selectError);
        data = __privateGet(this, _selectResult);
        errorUpdatedAt = Date.now();
        status = "error";
        isPlaceholderData = false;
      }
      const isFetching = newState.fetchStatus === "fetching";
      const isPending = status === "pending";
      const isError = status === "error";
      const isLoading = isPending && isFetching;
      const hasData = data !== void 0;
      return {
        status,
        fetchStatus: newState.fetchStatus,
        isPending,
        isSuccess: status === "success",
        isError,
        isInitialLoading: isLoading,
        isLoading,
        data,
        dataUpdatedAt: newState.dataUpdatedAt,
        error,
        errorUpdatedAt,
        failureCount: newState.fetchFailureCount,
        failureReason: newState.fetchFailureReason,
        errorUpdateCount: newState.errorUpdateCount,
        isFetched: query.isFetched(),
        isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
        isFetching,
        isRefetching: isFetching && !isPending,
        isLoadingError: isError && !hasData,
        isPaused: newState.fetchStatus === "paused",
        isPlaceholderData,
        isRefetchError: isError && hasData,
        isStale: isStale(query, options),
        refetch: this.refetch,
        isEnabled: resolveQueryValue(options.enabled, query) !== false
      };
    }
    /**
    * Recomputes and stores the current result from the current query/options, notifying listeners
    * if it changed. Framework adapters call this right after subscribing to make sure no query
    * update was missed in the gap between creating the observer and subscribing to it.
    */
    updateResult() {
      const prevResult = __privateGet(this, _currentResult);
      const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
      __privateSet(this, _currentResultOptions, this.options);
      if (__privateGet(this, _currentResultState).data !== void 0) __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
      if (shallowEqualObjects(nextResult, prevResult)) return;
      __privateSet(this, _currentResult, nextResult);
      const shouldNotifyListeners = () => {
        if (!prevResult) return true;
        const { notifyOnChangeProps } = this.options;
        const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
        if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) return true;
        const includedProps = new Set(notifyOnChangePropsValue ?? __privateGet(this, _trackedProps));
        if (this.options.throwOnError) includedProps.add("error");
        return Object.keys(__privateGet(this, _currentResult)).some((key) => {
          const typedKey = key;
          return __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey] && includedProps.has(typedKey);
        });
      };
      const notifyListeners = shouldNotifyListeners();
      notifyManager.batch(() => {
        if (notifyListeners) this.listeners.forEach((listener) => {
          listener(__privateGet(this, _currentResult));
        });
        __privateGet(this, _client2).getQueryCache().notify({
          query: __privateGet(this, _currentQuery),
          type: "observerResultsUpdated"
        });
      });
    }
    /**
    * Updates the observer's result when the observed query changes, and reschedules its timers if it
    * has listeners.
    * @internal
    */
    onQueryUpdate() {
      this.updateResult();
      if (this.hasListeners()) __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }, _client2 = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _QueryObserver_instances = new WeakSet(), executeFetch_fn = function(fetchOptions) {
    __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
    let promise = __privateGet(this, _currentQuery).fetch(this.options, fetchOptions);
    if (!fetchOptions?.throwOnError) promise = promise.catch(noop);
    return promise;
  }, shouldScheduleTimer_fn = function(timeout) {
    return !isServer2() && resolveQueryValue(this.options.enabled, __privateGet(this, _currentQuery)) !== false && isValidTimeout(timeout);
  }, updateStaleTimeout_fn = function() {
    __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
    const staleTime = resolveQueryValue(this.options.staleTime, __privateGet(this, _currentQuery));
    if (__privateGet(this, _currentResult).isStale || !__privateMethod(this, _QueryObserver_instances, shouldScheduleTimer_fn).call(this, staleTime)) return;
    const timeout = timeUntilStale(__privateGet(this, _currentResult).dataUpdatedAt, staleTime) + 1;
    __privateSet(this, _staleTimeoutId, timeoutManager.setTimeout(() => {
      if (!__privateGet(this, _currentResult).isStale) this.updateResult();
    }, timeout));
  }, computeRefetchInterval_fn = function() {
    return resolveQueryValue(this.options.refetchInterval, __privateGet(this, _currentQuery)) ?? false;
  }, updateRefetchInterval_fn = function(nextInterval) {
    __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
    __privateSet(this, _currentRefetchInterval, nextInterval);
    if (__privateGet(this, _currentRefetchInterval) === 0 || !__privateMethod(this, _QueryObserver_instances, shouldScheduleTimer_fn).call(this, __privateGet(this, _currentRefetchInterval))) return;
    __privateSet(this, _refetchIntervalId, timeoutManager.setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }, __privateGet(this, _currentRefetchInterval)));
  }, updateTimers_fn = function() {
    __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
    __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this));
  }, clearStaleTimeout_fn = function() {
    if (__privateGet(this, _staleTimeoutId) !== void 0) {
      timeoutManager.clearTimeout(__privateGet(this, _staleTimeoutId));
      __privateSet(this, _staleTimeoutId, void 0);
    }
  }, clearRefetchInterval_fn = function() {
    if (__privateGet(this, _refetchIntervalId) !== void 0) {
      timeoutManager.clearInterval(__privateGet(this, _refetchIntervalId));
      __privateSet(this, _refetchIntervalId, void 0);
    }
  }, updateQuery_fn = function() {
    const query = __privateGet(this, _client2).getQueryCache().build(__privateGet(this, _client2), this.options);
    if (query === __privateGet(this, _currentQuery)) return;
    const prevQuery = __privateGet(this, _currentQuery);
    __privateSet(this, _currentQuery, query);
    __privateSet(this, _currentQueryInitialState, query.state);
    if (this.hasListeners()) {
      prevQuery?.removeObserver(this);
      query.addObserver(this);
    }
  }, _a6);
  function shouldLoadOnMount(query, options) {
    return resolveQueryValue(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && resolveQueryValue(options.retryOnMount, query) === false);
  }
  function shouldFetchOnMount(query, options) {
    return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
  }
  function shouldFetchOn(query, options, field) {
    if (resolveQueryValue(options.enabled, query) !== false && resolveQueryValue(options.staleTime, query) !== "static") {
      const value = resolveQueryValue(field, query);
      return value === "always" || value !== false && isStale(query, options);
    }
    return false;
  }
  function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
    return (query !== prevQuery || resolveQueryValue(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
  }
  function isStale(query, options) {
    return resolveQueryValue(options.enabled, query) !== false && query.isStaleByTime(resolveQueryValue(options.staleTime, query));
  }

  // ../../node_modules/@tanstack/query-core/build/modern/mutation.js
  var _client3, _observers, _mutationCache, _retryer2, _Mutation_instances, dispatch_fn2, _a7;
  var Mutation = (_a7 = class extends Removable {
    constructor(config) {
      super();
      __privateAdd(this, _Mutation_instances);
      __privateAdd(this, _client3);
      __privateAdd(this, _observers);
      __privateAdd(this, _mutationCache);
      __privateAdd(this, _retryer2);
      __privateSet(this, _client3, config.client);
      this.mutationId = config.mutationId;
      __privateSet(this, _mutationCache, config.mutationCache);
      __privateSet(this, _observers, []);
      this.state = config.state || getDefaultState2();
      this.setOptions(config.options);
      this.scheduleGc();
    }
    /**
    * Replaces the mutation's options and applies their `gcTime`.
    * @internal
    * @param options - The new mutation options.
    */
    setOptions(options) {
      this.options = options;
      this.updateGcTime(this.options.gcTime);
    }
    /**
    * The `meta` object passed in the mutation's options, if any.
    * @returns The mutation's `meta`, or `undefined` if none was set.
    */
    get meta() {
      return this.options.meta;
    }
    /**
    * Subscribes an observer to the mutation and stops its garbage collection.
    * @internal
    * @param observer - The observer to add. Adding an observer that is already subscribed does
    * nothing.
    */
    addObserver(observer) {
      if (!__privateGet(this, _observers).includes(observer)) {
        __privateGet(this, _observers).push(observer);
        this.clearGcTimeout();
        __privateGet(this, _mutationCache).notify({
          type: "observerAdded",
          mutation: this,
          observer
        });
      }
    }
    /**
    * Unsubscribes an observer from the mutation.
    * @internal
    * @param observer - The observer to remove. Garbage collection is scheduled afterwards.
    */
    removeObserver(observer) {
      __privateSet(this, _observers, __privateGet(this, _observers).filter((x) => x !== observer));
      this.scheduleGc();
      __privateGet(this, _mutationCache).notify({
        type: "observerRemoved",
        mutation: this,
        observer
      });
    }
    optionalRemove() {
      if (!__privateGet(this, _observers).length) {
        if (this.state.status === "pending") this.scheduleGc();
        else __privateGet(this, _mutationCache).remove(this);
      }
    }
    /**
    * Resumes a mutation that is currently paused or was restored from a
    * dehydrated, still-`pending` state.
    *
    * - If this mutation has an active retryer (it paused mid-attempt, e.g. due
    *   to the network mode or scope-based queuing), its retryer is resumed.
    * - Otherwise, if the mutation's status is still `pending` (e.g. it was
    *   dehydrated while an attempt was in flight and never got a retryer in
    *   this instance), `execute` is called again with the last known variables.
    * - Otherwise the mutation has already settled and this resolves immediately
    *   without running anything again.
    * @returns A promise that settles with the resumed mutation: it rejects if the mutation fails.
    * It resolves immediately if the mutation has already settled.
    * @see {@link Mutation#execute}
    * @example
    * ```ts
    * // typically driven by reconnect handling, e.g. queryClient.resumePausedMutations()
    * const mutation = mutationCache.find({ mutationKey: ['addPost'] })
    * await mutation?.continue()
    * ```
    */
    continue() {
      return __privateGet(this, _retryer2)?.continue() ?? (this.state.status === "pending" ? this.execute(this.state.variables) : Promise.resolve());
    }
    /**
    * Runs the mutation function for the given variables through a retryer, and
    * drives the mutation's state and lifecycle callbacks through to settlement.
    *
    * If this mutation's state is already `pending` when `execute` is called
    * (i.e. it was restored, still in-flight, from a dehydrated state), the
    * `onMutate` step is skipped and a `continue` action is dispatched to
    * unpause it; otherwise a `pending` action is dispatched first, then the
    * mutation cache's `onMutate` and the mutation's own `onMutate` option are
    * awaited in that order, and the resulting context is stored.
    *
    * The mutation function is then run (subject to `retry`/`retryDelay`/
    * `networkMode`, and to the mutation cache's scope-based serialization).
    * On success, the cache's `onSuccess`/`onSettled` callbacks run before the
    * mutation's own `onSuccess`/`onSettled` options, a `success` action is
    * dispatched, and the resolved data is returned. On failure, the same
    * cache-then-option ordering is used for `onError`/`onSettled`, but each of
    * those four callbacks is individually caught so that a throwing callback
    * cannot mask the original error; an `error` action is then dispatched and
    * the original error is re-thrown.
    * @param variables - The variables passed to the `mutationFn`.
    * @returns A promise that resolves with the mutation's data, or rejects with its error.
    * @see {@link Mutation#continue}
    * @example
    * ```ts
    * // Called internally by `MutationObserver.mutate` and `Mutation.continue` —
    * // applications normally trigger mutations through those, not this method.
    * const data = await mutation.execute(variables)
    * ```
    */
    async execute(variables) {
      const onContinue = () => {
        __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "continue" });
      };
      const mutationFnContext = {
        client: __privateGet(this, _client3),
        meta: this.options.meta,
        mutationKey: this.options.mutationKey
      };
      const retryer = __privateSet(this, _retryer2, createRetryer({
        fn: () => {
          if (!this.options.mutationFn) return Promise.reject(/* @__PURE__ */ new Error("No mutationFn found"));
          return this.options.mutationFn(variables, mutationFnContext);
        },
        onFail: (failureCount, error) => {
          __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, {
            type: "failed",
            failureCount,
            error
          });
        },
        onPause: () => {
          __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "pause" });
        },
        onContinue,
        retry: this.options.retry ?? 0,
        retryDelay: this.options.retryDelay,
        networkMode: this.options.networkMode,
        canRun: () => __privateGet(this, _mutationCache).canRun(this)
      }));
      const restored = this.state.status === "pending";
      const isPaused = !retryer.canStart();
      try {
        if (restored) onContinue();
        else {
          __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, {
            type: "pending",
            variables,
            isPaused
          });
          if (__privateGet(this, _mutationCache).config.onMutate) await __privateGet(this, _mutationCache).config.onMutate(variables, this, mutationFnContext);
          const context = await this.options.onMutate?.(variables, mutationFnContext);
          if (context !== this.state.context) __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, {
            type: "pending",
            context,
            variables,
            isPaused
          });
        }
        const data = await retryer.start();
        await __privateGet(this, _mutationCache).config.onSuccess?.(data, variables, this.state.context, this, mutationFnContext);
        await this.options.onSuccess?.(data, variables, this.state.context, mutationFnContext);
        await __privateGet(this, _mutationCache).config.onSettled?.(data, null, this.state.variables, this.state.context, this, mutationFnContext);
        await this.options.onSettled?.(data, null, variables, this.state.context, mutationFnContext);
        __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, {
          type: "success",
          data
        });
        return data;
      } catch (error) {
        try {
          await __privateGet(this, _mutationCache).config.onError?.(error, variables, this.state.context, this, mutationFnContext);
        } catch (e) {
          Promise.reject(e);
        }
        try {
          await this.options.onError?.(error, variables, this.state.context, mutationFnContext);
        } catch (e) {
          Promise.reject(e);
        }
        try {
          await __privateGet(this, _mutationCache).config.onSettled?.(void 0, error, this.state.variables, this.state.context, this, mutationFnContext);
        } catch (e) {
          Promise.reject(e);
        }
        try {
          await this.options.onSettled?.(void 0, error, variables, this.state.context, mutationFnContext);
        } catch (e) {
          Promise.reject(e);
        }
        __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, {
          type: "error",
          error
        });
        throw error;
      } finally {
        if (__privateGet(this, _retryer2) === retryer) __privateSet(this, _retryer2, void 0);
        __privateGet(this, _mutationCache).runNext(this);
      }
    }
  }, _client3 = new WeakMap(), _observers = new WeakMap(), _mutationCache = new WeakMap(), _retryer2 = new WeakMap(), _Mutation_instances = new WeakSet(), dispatch_fn2 = function(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            failureCount: action.failureCount,
            failureReason: action.error
          };
        case "pause":
          return {
            ...state,
            isPaused: true
          };
        case "continue":
          return {
            ...state,
            isPaused: false
          };
        case "pending":
          return {
            ...state,
            context: action.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: action.isPaused,
            status: "pending",
            variables: action.variables,
            submittedAt: Date.now()
          };
        case "success":
          return {
            ...state,
            data: action.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: false
          };
        case "error":
          return {
            ...state,
            data: void 0,
            error: action.error,
            failureCount: state.failureCount + 1,
            failureReason: action.error,
            isPaused: false,
            status: "error"
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      __privateGet(this, _observers).forEach((observer) => {
        observer.onMutationUpdate(action);
      });
      __privateGet(this, _mutationCache).notify({
        mutation: this,
        type: "updated",
        action
      });
    });
  }, _a7);
  function getDefaultState2() {
    return {
      context: void 0,
      data: void 0,
      error: null,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: "idle",
      variables: void 0,
      submittedAt: 0
    };
  }

  // ../../node_modules/@tanstack/query-core/build/modern/mutationCache.js
  var _mutations, _scopes, _mutationId, _a8;
  var MutationCache = (_a8 = class extends Subscribable {
    constructor(config = {}) {
      super();
      __privateAdd(this, _mutations);
      __privateAdd(this, _scopes);
      __privateAdd(this, _mutationId);
      this.config = config;
      __privateSet(this, _mutations, /* @__PURE__ */ new Set());
      __privateSet(this, _scopes, /* @__PURE__ */ new Map());
      __privateSet(this, _mutationId, 0);
    }
    /**
    * Creates a mutation and adds it to the cache.
    * @internal
    * @param client - The client the mutation belongs to, used to default its options.
    * @param options - The mutation options. They are defaulted with {@link
    * QueryClient#defaultMutationOptions}.
    * @param state - The initial state of the mutation, e.g. when restoring a dehydrated mutation.
    * @returns The new mutation, already added to the cache.
    */
    build(client, options, state) {
      const mutation = new Mutation({
        client,
        mutationCache: this,
        mutationId: ++__privateWrapper(this, _mutationId)._,
        options: client.defaultMutationOptions(options),
        state
      });
      this.add(mutation);
      return mutation;
    }
    /**
    * Adds a mutation to the cache.
    * @internal
    * @param mutation - The mutation to add. If it has a `scope`, it is queued in that scope.
    */
    add(mutation) {
      __privateGet(this, _mutations).add(mutation);
      const scope = scopeFor(mutation);
      if (typeof scope === "string") {
        const scopedMutations = __privateGet(this, _scopes).get(scope);
        if (scopedMutations) scopedMutations.push(mutation);
        else __privateGet(this, _scopes).set(scope, [mutation]);
      }
      this.notify({
        type: "added",
        mutation
      });
    }
    /**
    * Removes a mutation from the cache.
    * @internal
    * @param mutation - The mutation to remove, also from its scope's queue.
    */
    remove(mutation) {
      if (__privateGet(this, _mutations).delete(mutation)) {
        const scope = scopeFor(mutation);
        if (typeof scope === "string") {
          const scopedMutations = __privateGet(this, _scopes).get(scope);
          if (scopedMutations) {
            if (scopedMutations.length > 1) {
              const index = scopedMutations.indexOf(mutation);
              if (index !== -1) scopedMutations.splice(index, 1);
            } else if (scopedMutations[0] === mutation) __privateGet(this, _scopes).delete(scope);
          }
        }
      }
      this.notify({
        type: "removed",
        mutation
      });
    }
    /**
    * Checks whether a mutation can run now, given the other mutations in its `scope`.
    * @internal
    * @param mutation - The mutation to check.
    * @returns `true` if the mutation has no `scope`, or no other mutation in its scope is pending
    * ahead of it.
    */
    canRun(mutation) {
      const scope = scopeFor(mutation);
      if (typeof scope === "string") {
        const firstPendingMutation = __privateGet(this, _scopes).get(scope)?.find((m) => m.state.status === "pending");
        return !firstPendingMutation || firstPendingMutation === mutation;
      } else return true;
    }
    /**
    * Continues the next paused mutation in the same `scope` after a mutation finishes.
    * @internal
    * @param mutation - The mutation that finished.
    * @returns A promise that resolves once the next paused mutation in the same scope has continued,
    * or immediately if there is none.
    */
    runNext(mutation) {
      const scope = scopeFor(mutation);
      if (typeof scope === "string") return __privateGet(this, _scopes).get(scope)?.find((m) => m !== mutation && m.state.isPaused)?.continue() ?? Promise.resolve();
      else return Promise.resolve();
    }
    /**
    * Removes all mutations from the cache.
    * @example
    * ```ts
    * const mutationCache = queryClient.getMutationCache()
    *
    * mutationCache.clear()
    * ```
    */
    clear() {
      notifyManager.batch(() => {
        __privateGet(this, _mutations).forEach((mutation) => {
          this.notify({
            type: "removed",
            mutation
          });
        });
        __privateGet(this, _mutations).clear();
        __privateGet(this, _scopes).clear();
      });
    }
    /**
    * Returns all mutations within the cache.
    *
    * This is not typically needed for most applications, but can come in handy when needing more
    * information about a mutation in rare scenarios.
    * @returns Every mutation in the cache.
    * @example
    * ```ts
    * const mutationCache = queryClient.getMutationCache()
    *
    * const mutations = mutationCache.getAll()
    * ```
    */
    getAll() {
      return Array.from(__privateGet(this, _mutations));
    }
    /**
    * A slightly more advanced method that can be used to get an existing mutation instance from
    * the cache. If the mutation does not exist, `undefined` is returned.
    *
    * This is not typically needed for most applications, but can come in handy when needing more
    * information about a mutation in rare scenarios.
    * @param filters - The filters to match. `exact` defaults to `true`.
    * @returns The first matching mutation, or `undefined`.
    * @see {@link MutationCache#findAll}
    * @example
    * ```ts
    * const mutationCache = queryClient.getMutationCache()
    *
    * const mutation = mutationCache.find({ mutationKey: ['addPost'] })
    * ```
    */
    find(filters) {
      const defaultedFilters = {
        exact: true,
        ...filters
      };
      return this.getAll().find((mutation) => matchMutation(defaultedFilters, mutation));
    }
    /**
    * An even more advanced method that can be used to get existing mutation instances from the
    * cache that match the given filters. If no mutations match, an empty array is returned.
    *
    * This is not typically needed for most applications, but can come in handy when needing more
    * information about mutations in rare scenarios.
    * @param filters - The filters to match. Without filters, every mutation is returned.
    * @returns The matching mutations.
    * @see {@link MutationCache#find}
    * @example
    * ```ts
    * const mutationCache = queryClient.getMutationCache()
    *
    * const mutations = mutationCache.findAll({ mutationKey: ['addPost'] })
    * ```
    */
    findAll(filters = {}) {
      return this.getAll().filter((mutation) => matchMutation(filters, mutation));
    }
    /**
    * Notifies every cache listener of an event, in one batch.
    * @internal
    * @param event - The event passed to every listener.
    */
    notify(event) {
      notifyManager.batch(() => {
        this.listeners.forEach((listener) => {
          listener(event);
        });
      });
    }
    /**
    * Continues every paused mutation, e.g. when the app comes back online.
    * @internal
    * @returns A promise that resolves once every paused mutation has continued and settled.
    */
    resumePausedMutations() {
      const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
      return notifyManager.batch(() => Promise.all(pausedMutations.map((mutation) => mutation.continue().catch(noop))));
    }
  }, _mutations = new WeakMap(), _scopes = new WeakMap(), _mutationId = new WeakMap(), _a8);
  function scopeFor(mutation) {
    return mutation.options.scope?.id;
  }

  // ../../node_modules/@tanstack/query-core/build/modern/queryCache.js
  var _queries, _a9;
  var QueryCache = (_a9 = class extends Subscribable {
    constructor(config = {}) {
      super();
      __privateAdd(this, _queries);
      this.config = config;
      __privateSet(this, _queries, /* @__PURE__ */ new Map());
    }
    /**
    * Returns the existing `Query` instance for the given options' `queryKey`/`queryHash`, or
    * builds and adds a new one to the cache if none exists yet. Used by framework adapters and
    * plugins (e.g. broadcast/persistence) that need to get-or-create a `Query` directly, bypassing
    * the reactive `QueryObserver` machinery.
    * @param client - The client the query belongs to, used to default its options.
    * @param options - The query options, including the `queryKey`. A new query is created with the
    * options defaulted by {@link QueryClient#defaultQueryOptions}.
    * @param state - The initial state of a newly created query, e.g. when hydrating. Ignored if the
    * query already exists.
    * @returns The existing or newly created query.
    * @example
    * ```ts
    * const queryCache = queryClient.getQueryCache()
    *
    * const query = queryCache.build(queryClient, {
    *   queryKey: ['posts'],
    *   queryFn: fetchPosts,
    * })
    * ```
    */
    build(client, options, state) {
      const queryKey = options.queryKey;
      const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
      let query = this.get(queryHash);
      if (!query) {
        query = new Query({
          client,
          queryKey,
          queryHash,
          options: client.defaultQueryOptions(options),
          state,
          defaultOptions: client.getQueryDefaults(queryKey)
        });
        this.add(query);
      }
      return query;
    }
    /**
    * Adds a query to the cache.
    * @internal
    * @param query - The query to add. If a query with the same hash is already cached, nothing
    * happens.
    */
    add(query) {
      if (!__privateGet(this, _queries).has(query.queryHash)) {
        __privateGet(this, _queries).set(query.queryHash, query);
        this.notify({
          type: "added",
          query
        });
      }
    }
    /**
    * Destroys the given `Query` and removes it from the cache, notifying subscribers with a
    * `'removed'` event. A no-op if the query is no longer the one currently stored under its hash
    * (e.g. it was already replaced). Used by plugins (e.g. the broadcast client) that mirror
    * removals across `QueryCache` instances.
    * @param query - The query to remove.
    * @example
    * ```ts
    * const queryCache = queryClient.getQueryCache()
    * const query = queryCache.find({ queryKey: ['posts'] })
    *
    * if (query) {
    *   queryCache.remove(query)
    * }
    * ```
    */
    remove(query) {
      if (__privateGet(this, _queries).get(query.queryHash) === query) {
        query.destroy();
        __privateGet(this, _queries).delete(query.queryHash);
        this.notify({
          type: "removed",
          query
        });
      }
    }
    /**
    * Removes all queries from the cache.
    * @example
    * ```ts
    * const queryCache = queryClient.getQueryCache()
    *
    * queryCache.clear()
    * ```
    */
    clear() {
      notifyManager.batch(() => {
        this.getAll().forEach((query) => {
          this.remove(query);
        });
      });
    }
    /**
    * Returns the `Query` instance stored under the given `queryHash`, or `undefined` if none
    * exists. Unlike {@link QueryCache#find}, this looks up by the already-computed hash rather
    * than by `QueryFilters`. Used by plugins (e.g. broadcast/hydration) that already have a hash
    * to look up directly.
    * @param queryHash - The hash of the query to look up.
    * @returns The query stored under the hash, or `undefined`.
    * @example
    * ```ts
    * const queryCache = queryClient.getQueryCache()
    * const queryHash = hashKey(['posts'])
    *
    * const query = queryCache.get(queryHash)
    * ```
    */
    get(queryHash) {
      return __privateGet(this, _queries).get(queryHash);
    }
    /**
    * Returns all queries within the cache.
    * @returns Every query in the cache.
    * @example
    * ```ts
    * const queryCache = queryClient.getQueryCache()
    *
    * const queries = queryCache.getAll()
    * ```
    */
    getAll() {
      return [...__privateGet(this, _queries).values()];
    }
    /**
    * A slightly more advanced method that can be used to get an existing query instance from the
    * cache. This instance not only contains all the state for the query, but all of the instances,
    * and underlying guts of the query as well. If the query does not exist, `undefined` is
    * returned.
    *
    * This is not typically needed for most applications, but can come in handy when needing more
    * information about a query in rare scenarios (e.g. looking at `query.state.dataUpdatedAt` to
    * decide whether a query is fresh enough to be used as an initial value).
    * @param filters - The filters to match, including the required `queryKey`. `exact` defaults to
    * `true`.
    * @returns The first matching query, or `undefined`.
    * @see {@link QueryCache#findAll}
    * @example
    * ```ts
    * const queryCache = queryClient.getQueryCache()
    *
    * const query = queryCache.find({ queryKey: ['posts'] })
    * ```
    */
    find(filters) {
      const defaultedFilters = {
        exact: true,
        ...filters
      };
      return this.getAll().find((query) => matchQuery(defaultedFilters, query));
    }
    /**
    * An even more advanced method that can be used to get existing query instances from the cache
    * that partially match a query key. If no queries match, an empty array is returned.
    *
    * This is not typically needed for most applications, but can come in handy when needing more
    * information about queries in rare scenarios.
    * @param filters - The filters to match. Without filters, every query is returned.
    * @returns The matching queries.
    * @see {@link QueryCache#find}
    * @example
    * ```ts
    * const queryCache = queryClient.getQueryCache()
    *
    * const queries = queryCache.findAll({ queryKey: ['posts'] })
    * ```
    */
    findAll(filters = {}) {
      const queries = this.getAll();
      return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
    }
    /**
    * Notifies every cache listener of an event, in one batch.
    * @internal
    * @param event - The event passed to every listener.
    */
    notify(event) {
      notifyManager.batch(() => {
        this.listeners.forEach((listener) => {
          listener(event);
        });
      });
    }
    /**
    * Calls {@link Query#onFocus} on every cached query, in one batch.
    * @internal
    */
    onFocus() {
      notifyManager.batch(() => {
        this.getAll().forEach((query) => {
          query.onFocus();
        });
      });
    }
    /**
    * Calls {@link Query#onOnline} on every cached query, in one batch.
    * @internal
    */
    onOnline() {
      notifyManager.batch(() => {
        this.getAll().forEach((query) => {
          query.onOnline();
        });
      });
    }
  }, _queries = new WeakMap(), _a9);

  // ../../node_modules/@tanstack/query-core/build/modern/queryClient.js
  var _queryCache, _mutationCache2, _defaultOptions2, _queryDefaults, _mutationDefaults, _mountCount, _unsubscribeFocus, _unsubscribeOnline, _a10;
  var QueryClient = (_a10 = class {
    constructor(config = {}) {
      __privateAdd(this, _queryCache);
      __privateAdd(this, _mutationCache2);
      __privateAdd(this, _defaultOptions2);
      __privateAdd(this, _queryDefaults);
      __privateAdd(this, _mutationDefaults);
      __privateAdd(this, _mountCount);
      __privateAdd(this, _unsubscribeFocus);
      __privateAdd(this, _unsubscribeOnline);
      __privateSet(this, _queryCache, config.queryCache || new QueryCache());
      __privateSet(this, _mutationCache2, config.mutationCache || new MutationCache());
      __privateSet(this, _defaultOptions2, config.defaultOptions || {});
      __privateSet(this, _queryDefaults, /* @__PURE__ */ new Map());
      __privateSet(this, _mutationDefaults, /* @__PURE__ */ new Map());
      __privateSet(this, _mountCount, 0);
    }
    /**
    * Called by a framework adapter's `QueryClientProvider`-equivalent when it mounts, to start
    * listening for focus/online events and resume paused mutations. Ref-counted via an internal
    * mount count, so nested or multiple providers sharing the same `QueryClient` don't tear down
    * the shared listeners until the last one unmounts.
    */
    mount() {
      __privateWrapper(this, _mountCount)._++;
      if (__privateGet(this, _mountCount) !== 1) return;
      __privateSet(this, _unsubscribeFocus, focusManager.subscribe(async (focused) => {
        if (focused) {
          await this.resumePausedMutations();
          __privateGet(this, _queryCache).onFocus();
        }
      }));
      __privateSet(this, _unsubscribeOnline, onlineManager.subscribe(async (online) => {
        if (online) {
          await this.resumePausedMutations();
          __privateGet(this, _queryCache).onOnline();
        }
      }));
    }
    /**
    * The inverse of {@link QueryClient#mount} — called by a framework adapter's
    * `QueryClientProvider`-equivalent when it unmounts. Only tears down the focus/online
    * listeners once the mount count returns to `0`.
    */
    unmount() {
      var _a11, _b;
      __privateWrapper(this, _mountCount)._--;
      if (__privateGet(this, _mountCount) !== 0) return;
      (_a11 = __privateGet(this, _unsubscribeFocus)) == null ? void 0 : _a11.call(this);
      __privateSet(this, _unsubscribeFocus, void 0);
      (_b = __privateGet(this, _unsubscribeOnline)) == null ? void 0 : _b.call(this);
      __privateSet(this, _unsubscribeOnline, void 0);
    }
    /**
    * Returns the number of queries in the cache that are currently fetching, optionally
    * matching a set of filters. This includes background-fetching, loading new pages, and
    * loading more infinite query results.
    * @param filters - Narrows down which fetching queries are counted. Without filters, every
    * fetching query is counted.
    * @returns The number of matching queries whose `fetchStatus` is `'fetching'`.
    * @example
    * ```ts
    * if (queryClient.isFetching()) {
    *   console.log('At least one query is fetching!')
    * }
    * ```
    */
    isFetching(filters) {
      return __privateGet(this, _queryCache).findAll({
        ...filters,
        fetchStatus: "fetching"
      }).length;
    }
    /**
    * Returns the number of mutations in the cache that are currently pending, optionally
    * matching a set of filters.
    * @param filters - Narrows down which pending mutations are counted. Without filters, every
    * pending mutation is counted.
    * @returns The number of matching mutations whose `status` is `'pending'`.
    * @example
    * ```ts
    * if (queryClient.isMutating()) {
    *   console.log('At least one mutation is pending!')
    * }
    * ```
    */
    isMutating(filters) {
      return __privateGet(this, _mutationCache2).findAll({
        ...filters,
        status: "pending"
      }).length;
    }
    /**
    * Imperative (non-reactive) way to retrieve data for a QueryKey.
    * Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
    *
    * Hint: Do not use this function inside a component, because it won't receive updates.
    * Use `useQuery` to create a `QueryObserver` that subscribes to changes.
    * @param queryKey - The query key of the query to read.
    * @returns The cached data for the query, or `undefined` if no query with this key has been observed yet.
    * @see {@link QueryClient#getQueriesData}
    */
    getQueryData(queryKey) {
      const options = this.defaultQueryOptions({ queryKey });
      return __privateGet(this, _queryCache).get(options.queryHash)?.state.data;
    }
    /**
    * Returns the cached data of a query, or fetches it if there is none. With `revalidateIfStale`,
    * stale cached data is also refetched in the background.
    * @param options - The query options. If the query has no cached data yet, it is fetched with
    * these options.
    * @returns A promise that resolves to the cached data, or to the fetched data if nothing was
    * cached yet.
    * @deprecated Use queryClient.query({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
    */
    ensureQueryData(options) {
      const defaultedOptions = this.defaultQueryOptions(options);
      const query = __privateGet(this, _queryCache).build(this, defaultedOptions);
      const cachedData = query.state.data;
      if (cachedData === void 0) return this.fetchQuery(options);
      if (options.revalidateIfStale && query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query))) this.prefetchQuery(defaultedOptions);
      return Promise.resolve(cachedData);
    }
    /**
    * Imperative (non-reactive) way to retrieve the cached data of multiple queries at once.
    * Only queries matching the given filters are returned; if none match, an empty array is
    * returned.
    *
    * Because the matched queries can hold data of different shapes (e.g. a broad filter can match
    * queries with unrelated data types), the `TQueryFnData` generic defaults to `unknown` rather
    * than being inferred. Passing a more specific type is a convenience for call sites that know
    * every matched query holds the same shape — it is not checked against the actual cache
    * contents.
    * @param filters - The filters that select which queries to read.
    * @returns An array of query key and data pairs. The data is `undefined` for a query with no cached data.
    * @see {@link QueryClient#getQueryData}
    * @example
    * ```ts
    * const data = queryClient.getQueriesData({ queryKey: ['posts'] })
    * ```
    */
    getQueriesData(filters) {
      return __privateGet(this, _queryCache).findAll(filters).map(({ queryKey, state }) => {
        return [queryKey, state.data];
      });
    }
    /**
    * Synchronous way to immediately update a query's cached data. If the updater (or the value
    * passed) resolves to `undefined`, the cache is left untouched and no query is created;
    * otherwise, if the query does not exist yet, it will be created. To update multiple queries
    * at once by partially matching query keys, use {@link QueryClient#setQueriesData} instead.
    *
    * Updates must be performed immutably: do not mutate `oldData`, or data previously retrieved
    * via {@link QueryClient#getQueryData}, in place.
    * @param queryKey - The query key to set data for.
    * @param updater - Either the new data, or a function that receives the current data (which
    * may be `undefined`) and returns the new data.
    * @param options - Set `updatedAt` to override the timestamp the written data is recorded with.
    * @returns The data that was written, or `undefined` if the updater returned `undefined` — in that case
    * the write is skipped and the cache is left unchanged.
    * @example
    * ```ts
    * queryClient.setQueryData(['posts'], newPosts)
    *
    * // Or, using an updater function that receives the current data:
    * queryClient.setQueryData(['posts'], (oldPosts) => [...oldPosts, newPost])
    * ```
    */
    setQueryData(queryKey, updater, options) {
      const defaultedOptions = this.defaultQueryOptions({ queryKey });
      const prevData = __privateGet(this, _queryCache).get(defaultedOptions.queryHash)?.state.data;
      const data = functionalUpdate(updater, prevData);
      if (data === void 0) return;
      return __privateGet(this, _queryCache).build(this, defaultedOptions).setData(data, {
        ...options,
        manual: true
      });
    }
    /**
    * Synchronous way to immediately update the cached data of multiple queries at once, using
    * filters or partial query key matching. Only queries that already exist and match the given
    * filters are updated; no new cache entries are created. Internally this calls
    * {@link QueryClient#setQueryData} for each matching query.
    * @param filters - The filters that select which existing queries to update.
    * @param updater - Either the new data, or a function that receives each matched query's current
    * data (which may be `undefined`) and returns the new data.
    * @param options - Set `updatedAt` to override the timestamp the written data is recorded with.
    * @returns One `[queryKey, data]` tuple per matched query, in the same shape and with the same
    * `undefined` case as {@link QueryClient#setQueryData}.
    * @example
    * ```ts
    * queryClient.setQueriesData({ queryKey: ['posts'] }, (oldPosts) =>
    *   oldPosts ? oldPosts.filter((post) => post.id !== deletedId) : oldPosts,
    * )
    * ```
    */
    setQueriesData(filters, updater, options) {
      return notifyManager.batch(() => __privateGet(this, _queryCache).findAll(filters).map(({ queryKey }) => [queryKey, this.setQueryData(queryKey, updater, options)]));
    }
    /**
    * Imperative (non-reactive) way to retrieve an existing query's state. If the query does not
    * exist, `undefined` is returned.
    * @param queryKey - The query key of the query to read.
    * @returns The query's state, or `undefined` if no query with this key exists.
    * @example
    * ```ts
    * const state = queryClient.getQueryState(['posts'])
    * console.log(state?.dataUpdatedAt)
    * ```
    */
    getQueryState(queryKey) {
      const options = this.defaultQueryOptions({ queryKey });
      return __privateGet(this, _queryCache).get(options.queryHash)?.state;
    }
    /**
    * Removes queries from the cache that match the given filters. Unlike
    * {@link QueryClient#invalidateQueries} or {@link QueryClient#refetchQueries}, this removes
    * matching queries from the cache instead of refetching them. Without filters, every query in
    * the cache is removed.
    * @param filters - The filters that select which queries to remove. Without filters, every query
    * is removed.
    * @example
    * ```ts
    * queryClient.removeQueries({ queryKey: ['posts'], exact: true })
    * ```
    */
    removeQueries(filters) {
      const queryCache = __privateGet(this, _queryCache);
      notifyManager.batch(() => {
        queryCache.findAll(filters).forEach((query) => {
          queryCache.remove(query);
        });
      });
    }
    /**
    * Resets queries matching the given filters back to their initial state (e.g. any
    * `initialData`), notifying subscribers rather than removing them. Active queries among the
    * matched set are then refetched, and the returned promise resolves once that refetch settles.
    * @param filters - The filters that select which queries to reset. Without filters, every query
    * is reset.
    * @param options - Passed to the refetch of the active matched queries, e.g. `cancelRefetch` and
    * `throwOnError`.
    * @returns A promise that resolves once the refetch of the active matched queries settles.
    * @example
    * ```ts
    * await queryClient.resetQueries({ queryKey: ['posts'], exact: true })
    * ```
    */
    resetQueries(filters, options) {
      const queryCache = __privateGet(this, _queryCache);
      return notifyManager.batch(() => {
        const matched = queryCache.findAll(filters);
        const queriesToRefetch = new Set(matched);
        matched.forEach((query) => {
          query.reset();
        });
        return this.refetchQueries({
          type: "active",
          predicate: (query) => queriesToRefetch.has(query)
        }, options);
      });
    }
    /**
    * Cancels outgoing fetches for queries matching the given filters. Most useful when performing
    * optimistic updates, since any outgoing refetch that resolves afterwards would otherwise
    * overwrite the optimistic update. By default (`revert: true`), a cancelled query's data is
    * reverted to its state before the outgoing fetch started.
    *
    * The returned promise never rejects, even if individual cancellations fail.
    * @param filters - The filters that select which queries to cancel. Without filters, every query
    * is cancelled.
    * @param cancelOptions - Passed to each matched query's cancellation. `revert` defaults to
    * `true`.
    * @returns A promise that resolves once every cancellation has settled.
    * @example
    * ```ts
    * await queryClient.cancelQueries({ queryKey: ['posts'], exact: true })
    * ```
    */
    cancelQueries(filters, cancelOptions = {}) {
      const defaultedCancelOptions = {
        revert: true,
        ...cancelOptions
      };
      const promises = notifyManager.batch(() => __privateGet(this, _queryCache).findAll(filters).map((query) => query.cancel(defaultedCancelOptions)));
      return Promise.all(promises).then(noop).catch(noop);
    }
    /**
    * Marks queries matching the given filters as invalidated. Unlike
    * {@link QueryClient#removeQueries}, invalidated queries stay in the cache.
    *
    * Unless `filters.refetchType` is `'none'`, matching queries are then refetched via
    * {@link QueryClient#refetchQueries}, using `filters.refetchType` if set, otherwise
    * `filters.type`, otherwise `'active'`.
    * @param filters - The filters that select which queries to invalidate, plus `refetchType` to
    * control which of them to refetch afterwards. Without filters, every query is invalidated.
    * @param options - Passed to {@link QueryClient#refetchQueries}, e.g. `cancelRefetch` and
    * `throwOnError`.
    * @returns A promise that resolves once the refetch settles, or immediately if `refetchType` is
    * `'none'`.
    * @example
    * ```ts
    * await queryClient.invalidateQueries({ queryKey: ['posts'], refetchType: 'active' })
    * ```
    */
    invalidateQueries(filters, options = {}) {
      return notifyManager.batch(() => {
        __privateGet(this, _queryCache).findAll(filters).forEach((query) => {
          query.invalidate();
        });
        if (filters?.refetchType === "none") return Promise.resolve();
        return this.refetchQueries({
          ...filters,
          type: filters?.refetchType ?? filters?.type ?? "active"
        }, options);
      });
    }
    /**
    * Refetches queries matching the given filters, regardless of whether they are stale. Without
    * filters, every query in the cache is refetched. Queries that are disabled, or static (only
    * have observers with a static `staleTime`), are never refetched.
    *
    * By default (`cancelRefetch: true`), a currently running fetch is cancelled before the new
    * one starts. The returned promise resolves once all matching queries have settled; it does
    * not reject on individual query failures unless `throwOnError` is set.
    * @param filters - The filters that select which queries to refetch. Without filters, every query
    * in the cache is included.
    * @param options - Set `cancelRefetch` to `false` to keep a running fetch instead of cancelling
    * it, and `throwOnError` to `true` to reject when a refetch fails.
    * @returns A promise that resolves once every matched query has settled.
    * @example
    * ```ts
    * // refetch all active queries partially matching a query key:
    * await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })
    * ```
    */
    refetchQueries(filters, options = {}) {
      const fetchOptions = {
        ...options,
        cancelRefetch: options.cancelRefetch ?? true
      };
      const promises = notifyManager.batch(() => __privateGet(this, _queryCache).findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
        let promise = query.fetch(void 0, fetchOptions);
        if (!fetchOptions.throwOnError) promise = promise.catch(noop);
        return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
      }));
      return Promise.all(promises).then(noop);
    }
    /**
    * Asynchronous method to fetch and cache a query, resolving with the data or throwing with
    * the error.
    *
    * If the query already exists in the cache and its data is not stale (per the given
    * `staleTime`), the cached data is returned without fetching. Otherwise, the query is fetched
    * and the promise resolves once the fetch settles. If a `select` function is provided, it is
    * applied to the data in both cases (cached or freshly fetched) before it is returned.
    *
    * Unlike a reactive observer, retries are disabled by default here (`retry: false`) unless
    * explicitly configured, since there is no component to catch a thrown error and retry through
    * re-render.
    *
    * The accepted options are `QueryObserverOptions` minus the fields that only make sense for a
    * reactive observer — `enabled`, `refetchInterval`, `refetchIntervalInBackground`,
    * `refetchOnWindowFocus`, `refetchOnReconnect`, `refetchOnMount`, `retryOnMount`,
    * `notifyOnChangeProps`, `throwOnError`, `suspense`, and `placeholderData` are not part of this
    * method's options.
    *
    * This method replaces the deprecated `fetchQuery`, and — combined with
    * `{ staleTime: 'static' }` — the deprecated `ensureQueryData`.
    * @param options - The query options, including the `queryKey` and the `queryFn` used if the
    * query needs to fetch.
    * @returns A promise that resolves to the data, or to the result of `select` if provided. It
    * rejects with the error from the fetch or from `select`.
    * @example
    * ```ts
    * try {
    *   const data = await queryClient.query({ queryKey, queryFn, staleTime: 10000 })
    * } catch (error) {
    *   console.log(error)
    * }
    * ```
    */
    async query(options) {
      const defaultedOptions = this.defaultQueryOptions(options);
      if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
      const query = __privateGet(this, _queryCache).build(this, defaultedOptions);
      const queryData = query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? await query.fetch(defaultedOptions) : query.state.data;
      const select2 = defaultedOptions.select;
      if (select2) return select2(queryData);
      return queryData;
    }
    /**
    * Fetches and caches a query, or returns its cached data if it isn't stale. Unlike in observers,
    * the fetch isn't retried unless `retry` is set.
    * @param options - The query options, including the `queryKey` and the `queryFn` used if the
    * query needs to fetch.
    * @returns A promise that resolves to the cached or fetched data, or rejects with the fetch
    * error.
    * @deprecated Use queryClient.query(options) instead. This method will be removed in the next major version.
    */
    fetchQuery(options) {
      const defaultedOptions = this.defaultQueryOptions(options);
      if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
      const query = __privateGet(this, _queryCache).build(this, defaultedOptions);
      return query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
    }
    /**
    * Fetches and caches a query like {@link QueryClient#fetchQuery}, but ignores the result and any
    * error.
    * @param options - The query options, including the `queryKey` and the `queryFn` used if the
    * query needs to fetch.
    * @returns A promise that resolves once the fetch settles. It never rejects.
    * @deprecated Use queryClient.query(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
    */
    prefetchQuery(options) {
      return this.fetchQuery(options).then(noop).catch(noop);
    }
    /**
    * Asynchronous method to fetch and cache an infinite query, resolving with an
    * {@link InfiniteData} object or throwing with the error.
    *
    * Behaves like {@link QueryClient#query}, accepting the same options (minus
    * `initialPageParam`), plus the required `initialPageParam`, and an optional `pages` /
    * `getNextPageParam` pair used to refetch a fixed number of pages from the start.
    *
    * This method replaces the deprecated `fetchInfiniteQuery`, and — combined with
    * `{ staleTime: 'static' }` — the deprecated `ensureInfiniteQueryData`.
    * @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
    * `initialPageParam`.
    * @returns A promise that resolves to the {@link InfiniteData}, or to the result of `select` if
    * provided. It rejects with the error from the fetch or from `select`.
    * @example
    * ```ts
    * try {
    *   const data = await queryClient.infiniteQuery({ queryKey, queryFn, initialPageParam: 0 })
    *   console.log(data.pages)
    * } catch (error) {
    *   console.log(error)
    * }
    * ```
    */
    infiniteQuery(options) {
      options._type = "infinite";
      return this.query(options);
    }
    /**
    * Fetches and caches an infinite query, or returns its cached data if it isn't stale.
    * @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
    * `initialPageParam`.
    * @returns A promise that resolves to the cached or fetched {@link InfiniteData}, or rejects with
    * the fetch error.
    * @deprecated Use queryClient.infiniteQuery(options) instead. This method will be removed in the next major version.
    */
    fetchInfiniteQuery(options) {
      options._type = "infinite";
      return this.fetchQuery(options);
    }
    /**
    * Fetches and caches an infinite query like {@link QueryClient#fetchInfiniteQuery}, but ignores
    * the result and any error.
    * @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
    * `initialPageParam`.
    * @returns A promise that resolves once the fetch settles. It never rejects.
    * @deprecated Use queryClient.infiniteQuery(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
    */
    prefetchInfiniteQuery(options) {
      return this.fetchInfiniteQuery(options).then(noop).catch(noop);
    }
    /**
    * Returns the cached data of an infinite query, or fetches it if there is none. With
    * `revalidateIfStale`, stale cached data is also refetched in the background.
    * @param options - The infinite query options. If the query has no cached data yet, it is fetched
    * with these options.
    * @returns A promise that resolves to the cached {@link InfiniteData}, or to the fetched data if
    * nothing was cached yet.
    * @deprecated Use queryClient.infiniteQuery({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
    */
    ensureInfiniteQueryData(options) {
      options._type = "infinite";
      return this.ensureQueryData(options);
    }
    /**
    * Resumes mutations that were paused because there was no network connection. Does nothing
    * (resolving immediately) if the client is currently offline.
    * @returns A promise that resolves once the resumed mutations have settled.
    * @example
    * ```ts
    * import { QueryClient } from '@tanstack/query-core'
    *
    * const queryClient = new QueryClient()
    * await queryClient.resumePausedMutations()
    * ```
    */
    resumePausedMutations() {
      if (onlineManager.isOnline()) return __privateGet(this, _mutationCache2).resumePausedMutations();
      return Promise.resolve();
    }
    /**
    * Returns the query cache this client is connected to.
    * @returns The {@link QueryCache} instance.
    * @example
    * ```ts
    * import { QueryClient } from '@tanstack/query-core'
    *
    * const queryClient = new QueryClient()
    * const queryCache = queryClient.getQueryCache()
    * const queries = queryCache.findAll({ queryKey: ['posts'] })
    * ```
    */
    getQueryCache() {
      return __privateGet(this, _queryCache);
    }
    /**
    * Returns the mutation cache this client is connected to.
    * @returns The {@link MutationCache} instance.
    * @example
    * ```ts
    * import { QueryClient } from '@tanstack/query-core'
    *
    * const queryClient = new QueryClient()
    * const mutationCache = queryClient.getMutationCache()
    * const mutations = mutationCache.findAll({ status: 'pending' })
    * ```
    */
    getMutationCache() {
      return __privateGet(this, _mutationCache2);
    }
    /**
    * Returns the default options that were set when creating the client, or via
    * {@link QueryClient#setDefaultOptions}.
    * @returns The client's current default options.
    * @example
    * ```ts
    * import { QueryClient } from '@tanstack/query-core'
    *
    * const queryClient = new QueryClient()
    * const defaultOptions = queryClient.getDefaultOptions()
    * ```
    */
    getDefaultOptions() {
      return __privateGet(this, _defaultOptions2);
    }
    /**
    * Dynamically sets the default options for this client, overwriting any previously defined
    * default options.
    * @param options - The new default options for queries and mutations.
    * @see {@link QueryClient#getDefaultOptions}
    * @example
    * ```ts
    * import { QueryClient } from '@tanstack/query-core'
    *
    * const queryClient = new QueryClient()
    * queryClient.setDefaultOptions({
    *   queries: {
    *     staleTime: Infinity,
    *   },
    * })
    * ```
    */
    setDefaultOptions(options) {
      __privateSet(this, _defaultOptions2, options);
    }
    /**
    * Sets default options for queries whose query key partially matches the given `queryKey`.
    *
    * If several registered query defaults match a given query key, they are merged together in
    * registration order by {@link QueryClient#getQueryDefaults}, so register defaults from the
    * most generic key to the least generic one — more specific defaults should be registered
    * after more generic ones so they take precedence.
    * @param queryKey - The query key that query keys are partially matched against.
    * @param options - The default options applied to matching queries.
    * @example
    * ```ts
    * queryClient.setQueryDefaults(['posts'], { queryFn: fetchPosts })
    *
    * await queryClient.query({ queryKey: ['posts'] })
    * ```
    */
    setQueryDefaults(queryKey, options) {
      __privateGet(this, _queryDefaults).set(hashKey(queryKey), {
        queryKey,
        defaultOptions: options
      });
    }
    /**
    * Returns the default options registered for queries whose query key partially matches the
    * given `queryKey`, via {@link QueryClient#setQueryDefaults}. If multiple registered defaults
    * match, they are merged together in registration order.
    * @param queryKey - The query key to look up registered defaults for.
    * @returns The merged default options of every registration that matches, or an empty object if
    * none match.
    * @example
    * ```ts
    * const defaultOptions = queryClient.getQueryDefaults(['posts'])
    * ```
    */
    getQueryDefaults(queryKey) {
      const defaults = [...__privateGet(this, _queryDefaults).values()];
      const result = {};
      defaults.forEach((queryDefault) => {
        if (partialMatchKey(queryKey, queryDefault.queryKey)) Object.assign(result, queryDefault.defaultOptions);
      });
      return result;
    }
    /**
    * Sets default options for mutations whose mutation key partially matches the given
    * `mutationKey`. As with {@link QueryClient#setQueryDefaults}, the order of registration
    * matters when several registered defaults match the same mutation key.
    * @param mutationKey - The mutation key that mutation keys are partially matched against.
    * @param options - The default options applied to matching mutations.
    * @see {@link QueryClient#getMutationDefaults}
    * @example
    * ```ts
    * queryClient.setMutationDefaults(['addPost'], { mutationFn: addPost })
    * ```
    */
    setMutationDefaults(mutationKey, options) {
      __privateGet(this, _mutationDefaults).set(hashKey(mutationKey), {
        mutationKey,
        defaultOptions: options
      });
    }
    /**
    * Returns the default options registered for mutations whose mutation key partially matches
    * the given `mutationKey`, via {@link QueryClient#setMutationDefaults}. If multiple registered
    * defaults match, they are merged together in registration order.
    * @param mutationKey - The mutation key to look up registered defaults for.
    * @returns The merged default options of every registration that matches, or an empty object if
    * none match.
    * @example
    * ```ts
    * const defaultOptions = queryClient.getMutationDefaults(['addPost'])
    * ```
    */
    getMutationDefaults(mutationKey) {
      const defaults = [...__privateGet(this, _mutationDefaults).values()];
      const result = {};
      defaults.forEach((queryDefault) => {
        if (partialMatchKey(mutationKey, queryDefault.mutationKey)) Object.assign(result, queryDefault.defaultOptions);
      });
      return result;
    }
    /**
    * Called by framework adapters (e.g. inside `useQuery`) to resolve the options passed by the
    * caller into their final, defaulted form: merging the client's own `defaultOptions.queries`,
    * then `queryClient.setQueryDefaults` for the given `queryKey`, then the caller's options on
    * top. A no-op if the options are already defaulted (`_defaulted: true`).
    * @param options - The query options passed by the caller.
    * @returns The defaulted options, with `queryHash` and dependent defaults (e.g.
    * `refetchOnReconnect`) filled in.
    */
    defaultQueryOptions(options) {
      if (options._defaulted) return options;
      const defaultedOptions = {
        ...__privateGet(this, _defaultOptions2).queries,
        ...this.getQueryDefaults(options.queryKey),
        ...options,
        _defaulted: true
      };
      if (!defaultedOptions.queryHash) defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
      if (defaultedOptions.refetchOnReconnect === void 0) defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
      if (defaultedOptions.throwOnError === void 0) defaultedOptions.throwOnError = !!defaultedOptions.suspense;
      if (!defaultedOptions.networkMode && defaultedOptions.persister) defaultedOptions.networkMode = "offlineFirst";
      if (defaultedOptions.queryFn === skipToken) defaultedOptions.enabled = false;
      return defaultedOptions;
    }
    /**
    * The mutation counterpart of {@link QueryClient#defaultQueryOptions}. Called by framework
    * adapters (e.g. inside `useMutation`) to merge the client's `defaultOptions.mutations`, then
    * `queryClient.setMutationDefaults` for the given `mutationKey`, then the caller's options on
    * top. A no-op if the options are already defaulted (`_defaulted: true`).
    * @param options - The mutation options passed by the caller.
    * @returns The defaulted options.
    */
    defaultMutationOptions(options) {
      if (options?._defaulted) return options;
      return {
        ...__privateGet(this, _defaultOptions2).mutations,
        ...options?.mutationKey && this.getMutationDefaults(options.mutationKey),
        ...options,
        _defaulted: true
      };
    }
    /**
    * Clears both the query cache and the mutation cache this client is connected to.
    * @example
    * ```ts
    * import { QueryClient } from '@tanstack/query-core'
    *
    * const queryClient = new QueryClient()
    * queryClient.clear()
    * ```
    */
    clear() {
      __privateGet(this, _queryCache).clear();
      __privateGet(this, _mutationCache2).clear();
    }
  }, _queryCache = new WeakMap(), _mutationCache2 = new WeakMap(), _defaultOptions2 = new WeakMap(), _queryDefaults = new WeakMap(), _mutationDefaults = new WeakMap(), _mountCount = new WeakMap(), _unsubscribeFocus = new WeakMap(), _unsubscribeOnline = new WeakMap(), _a10);

  // ../../node_modules/@tanstack/react-query/build/modern/IsRestoringProvider.js
  var IsRestoringContext = createContext(false);
  var useIsRestoring = () => useContext(IsRestoringContext);
  var IsRestoringProvider = IsRestoringContext.Provider;

  // ../../node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js
  function createValue() {
    let isReset = false;
    return {
      /**
      * Clears the reset state, so queries know not to try again until the boundary is reset again.
      */
      clearReset: () => {
        isReset = false;
      },
      /**
      * Resets any query errors within the boundary, so queries know they can try again.
      */
      reset: () => {
        isReset = true;
      },
      /**
      * Returns whether the boundary has been reset and not yet cleared.
      * @returns `true` if the boundary has been reset and not yet cleared.
      */
      isReset: () => {
        return isReset;
      }
    };
  }
  var QueryErrorResetBoundaryContext = createContext(createValue());
  var useQueryErrorResetBoundary = () => useContext(QueryErrorResetBoundaryContext);

  // ../../node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js
  var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
    const throwOnError = query?.state.error && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
    if (options.suspense || throwOnError) {
      if (!errorResetBoundary.isReset()) options.retryOnMount = false;
    }
  };
  var useClearResetErrorBoundary = (errorResetBoundary) => {
    useEffect(() => {
      errorResetBoundary.clearReset();
    }, [errorResetBoundary]);
  };
  var getHasError = ({ result, errorResetBoundary, throwOnError, query, suspense }) => {
    return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
  };

  // ../../node_modules/@tanstack/react-query/build/modern/suspense.js
  var ensureSuspenseTimers = (defaultedOptions) => {
    if (defaultedOptions.suspense) {
      const MIN_SUSPENSE_TIME_MS = 1e3;
      const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
      const originalStaleTime = defaultedOptions.staleTime;
      defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
      if (typeof defaultedOptions.gcTime === "number") defaultedOptions.gcTime = Math.max(defaultedOptions.gcTime, MIN_SUSPENSE_TIME_MS);
    }
  };
  var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
  var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
    errorResetBoundary.clearReset();
  });

  // ../../node_modules/@tanstack/react-query/build/modern/useBaseQuery.js
  function useBaseQuery(options, Observer, queryClient) {
    if (true) {
      if (typeof options !== "object" || Array.isArray(options)) throw new Error('Bad argument type. Starting with v5, only the "Object" form is allowed when calling query related functions. Please use the error stack to find the culprit call. More info here: https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5#supports-a-single-signature-one-object');
    }
    const isRestoring = useIsRestoring();
    const errorResetBoundary = useQueryErrorResetBoundary();
    const client = useQueryClient(queryClient);
    const defaultedOptions = client.defaultQueryOptions(options);
    const query = client.getQueryCache().get(defaultedOptions.queryHash);
    if (true) {
      if (!defaultedOptions.queryFn) console.error(`[${defaultedOptions.queryHash}]: No queryFn was passed as an option, and no default queryFn was found. The queryFn parameter is only optional when using a default queryFn. More info here: https://tanstack.com/query/latest/docs/framework/react/guides/default-query-function`);
    }
    const subscribed = options.subscribed !== false;
    defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : subscribed ? "optimistic" : void 0;
    ensureSuspenseTimers(defaultedOptions);
    ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
    useClearResetErrorBoundary(errorResetBoundary);
    const [observer] = useState(() => new Observer(client, defaultedOptions));
    const result = observer.getOptimisticResult(defaultedOptions);
    const shouldSubscribe = !isRestoring && subscribed;
    useSyncExternalStore(useCallback((onStoreChange) => {
      const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
      observer.updateResult();
      return unsubscribe;
    }, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
    useEffect(() => {
      observer.setOptions(defaultedOptions);
    }, [defaultedOptions, observer]);
    if (shouldSuspend(defaultedOptions, result)) throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
    if (getHasError({
      result,
      errorResetBoundary,
      throwOnError: defaultedOptions.throwOnError,
      query,
      suspense: defaultedOptions.suspense
    })) throw result.error;
    return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
  }

  // ../../node_modules/@tanstack/react-query/build/modern/useQuery.js
  function useQuery(options, queryClient) {
    return useBaseQuery(options, QueryObserver, queryClient);
  }

  // .xuyc-entry.js
  var h = react_compat_default.createElement;
  var qc = new QueryClient();
  function Todos() {
    const { isLoading, error, data, isFetching } = useQuery({
      queryKey: ["todos"],
      queryFn: () => fetch("https://jsonplaceholder.typicode.com/todos?_limit=5").then((r) => r.json())
    });
    if (isLoading) return h("div", null, "\u52A0\u8F7D\u4E2D...");
    if (error) return h("div", { style: { color: "#e06c75" } }, "\u9519\u8BEF: " + error.message);
    return h(
      "div",
      null,
      h(
        "div",
        { style: { color: "#98c379", marginBottom: "8px" } },
        "\u6570\u636E (5 \u6761)" + (isFetching ? " \xB7 \u5237\u65B0\u4E2D" : "")
      ),
      h("ul", null, data.map((t) => h("li", { key: t.id }, "#" + t.id + " \u2014 " + t.title)))
    );
  }
  function App() {
    return h(
      QueryClientProvider,
      { client: qc },
      h(
        "div",
        { style: "padding:24px;background:#282c34;color:#abb2bf;font-family:system-ui;min-height:100vh" },
        h("h1", { style: { color: "#61afef" } }, "react-query"),
        h(Todos)
      )
    );
  }
  react_compat_default.createRoot(document.getElementById("app")).render(h(App));
})();
