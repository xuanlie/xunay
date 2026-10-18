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
      const out2 = [];
      let i = 0;
      const arr = Array.isArray(children) ? children : children == null ? [] : [children];
      for (const c of arr) {
        if (c == null || c === false || c === true) continue;
        out2.push(fn(c, i++));
      }
      return out2;
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

  // ../../node_modules/@babel/runtime/helpers/esm/extends.js
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
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

  // ../../node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
  function _inheritsLoose(t, o) {
    t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
  }

  // ../../node_modules/react-window/node_modules/memoize-one/dist/memoize-one.esm.js
  var safeIsNaN = Number.isNaN || function ponyfill(value) {
    return typeof value === "number" && value !== value;
  };
  function isEqual(first, second) {
    if (first === second) {
      return true;
    }
    if (safeIsNaN(first) && safeIsNaN(second)) {
      return true;
    }
    return false;
  }
  function areInputsEqual(newInputs, lastInputs) {
    if (newInputs.length !== lastInputs.length) {
      return false;
    }
    for (var i = 0; i < newInputs.length; i++) {
      if (!isEqual(newInputs[i], lastInputs[i])) {
        return false;
      }
    }
    return true;
  }
  function memoizeOne(resultFn, isEqual2) {
    if (isEqual2 === void 0) {
      isEqual2 = areInputsEqual;
    }
    var lastThis;
    var lastArgs = [];
    var lastResult;
    var calledOnce = false;
    function memoized() {
      var newArgs = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        newArgs[_i] = arguments[_i];
      }
      if (calledOnce && lastThis === this && isEqual2(newArgs, lastArgs)) {
        return lastResult;
      }
      lastResult = resultFn.apply(this, newArgs);
      calledOnce = true;
      lastThis = this;
      lastArgs = newArgs;
      return lastResult;
    }
    return memoized;
  }
  var memoize_one_esm_default = memoizeOne;

  // ../../node_modules/react-window/dist/index.esm.js
  var hasNativePerformanceNow = typeof performance === "object" && typeof performance.now === "function";
  var now = hasNativePerformanceNow ? function() {
    return performance.now();
  } : function() {
    return Date.now();
  };
  function cancelTimeout(timeoutID) {
    cancelAnimationFrame(timeoutID.id);
  }
  function requestTimeout(callback, delay) {
    var start = now();
    function tick() {
      if (now() - start >= delay) {
        callback.call(null);
      } else {
        timeoutID.id = requestAnimationFrame(tick);
      }
    }
    var timeoutID = {
      id: requestAnimationFrame(tick)
    };
    return timeoutID;
  }
  var size = -1;
  function getScrollbarSize(recalculate) {
    if (recalculate === void 0) {
      recalculate = false;
    }
    if (size === -1 || recalculate) {
      var div2 = document.createElement("div");
      var style = div2.style;
      style.width = "50px";
      style.height = "50px";
      style.overflow = "scroll";
      document.body.appendChild(div2);
      size = div2.offsetWidth - div2.clientWidth;
      document.body.removeChild(div2);
    }
    return size;
  }
  var cachedRTLResult = null;
  function getRTLOffsetType(recalculate) {
    if (recalculate === void 0) {
      recalculate = false;
    }
    if (cachedRTLResult === null || recalculate) {
      var outerDiv = document.createElement("div");
      var outerStyle = outerDiv.style;
      outerStyle.width = "50px";
      outerStyle.height = "50px";
      outerStyle.overflow = "scroll";
      outerStyle.direction = "rtl";
      var innerDiv = document.createElement("div");
      var innerStyle = innerDiv.style;
      innerStyle.width = "100px";
      innerStyle.height = "100px";
      outerDiv.appendChild(innerDiv);
      document.body.appendChild(outerDiv);
      if (outerDiv.scrollLeft > 0) {
        cachedRTLResult = "positive-descending";
      } else {
        outerDiv.scrollLeft = 1;
        if (outerDiv.scrollLeft === 0) {
          cachedRTLResult = "negative";
        } else {
          cachedRTLResult = "positive-ascending";
        }
      }
      document.body.removeChild(outerDiv);
      return cachedRTLResult;
    }
    return cachedRTLResult;
  }
  var devWarningsOverscanCount = null;
  var devWarningsOverscanRowsColumnsCount = null;
  var devWarningsTagName = null;
  if (true) {
    if (typeof window !== "undefined" && typeof window.WeakSet !== "undefined") {
      devWarningsOverscanCount = /* @__PURE__ */ new WeakSet();
      devWarningsOverscanRowsColumnsCount = /* @__PURE__ */ new WeakSet();
      devWarningsTagName = /* @__PURE__ */ new WeakSet();
    }
  }
  var IS_SCROLLING_DEBOUNCE_INTERVAL$1 = 150;
  var defaultItemKey$1 = function defaultItemKey(index, data) {
    return index;
  };
  var devWarningsDirection = null;
  var devWarningsTagName$1 = null;
  if (true) {
    if (typeof window !== "undefined" && typeof window.WeakSet !== "undefined") {
      devWarningsDirection = /* @__PURE__ */ new WeakSet();
      devWarningsTagName$1 = /* @__PURE__ */ new WeakSet();
    }
  }
  function createListComponent(_ref) {
    var _class;
    var getItemOffset2 = _ref.getItemOffset, getEstimatedTotalSize2 = _ref.getEstimatedTotalSize, getItemSize2 = _ref.getItemSize, getOffsetForIndexAndAlignment2 = _ref.getOffsetForIndexAndAlignment, getStartIndexForOffset2 = _ref.getStartIndexForOffset, getStopIndexForStartIndex2 = _ref.getStopIndexForStartIndex, initInstanceProps2 = _ref.initInstanceProps, shouldResetStyleCacheOnItemSizeChange = _ref.shouldResetStyleCacheOnItemSizeChange, validateProps2 = _ref.validateProps;
    return _class = /* @__PURE__ */ function(_PureComponent) {
      _inheritsLoose(List, _PureComponent);
      function List(props) {
        var _this;
        _this = _PureComponent.call(this, props) || this;
        _this._instanceProps = initInstanceProps2(_this.props, _assertThisInitialized(_this));
        _this._outerRef = void 0;
        _this._resetIsScrollingTimeoutId = null;
        _this.state = {
          instance: _assertThisInitialized(_this),
          isScrolling: false,
          scrollDirection: "forward",
          scrollOffset: typeof _this.props.initialScrollOffset === "number" ? _this.props.initialScrollOffset : 0,
          scrollUpdateWasRequested: false
        };
        _this._callOnItemsRendered = void 0;
        _this._callOnItemsRendered = memoize_one_esm_default(function(overscanStartIndex, overscanStopIndex, visibleStartIndex, visibleStopIndex) {
          return _this.props.onItemsRendered({
            overscanStartIndex,
            overscanStopIndex,
            visibleStartIndex,
            visibleStopIndex
          });
        });
        _this._callOnScroll = void 0;
        _this._callOnScroll = memoize_one_esm_default(function(scrollDirection, scrollOffset, scrollUpdateWasRequested) {
          return _this.props.onScroll({
            scrollDirection,
            scrollOffset,
            scrollUpdateWasRequested
          });
        });
        _this._getItemStyle = void 0;
        _this._getItemStyle = function(index) {
          var _this$props = _this.props, direction = _this$props.direction, itemSize = _this$props.itemSize, layout = _this$props.layout;
          var itemStyleCache = _this._getItemStyleCache(shouldResetStyleCacheOnItemSizeChange && itemSize, shouldResetStyleCacheOnItemSizeChange && layout, shouldResetStyleCacheOnItemSizeChange && direction);
          var style;
          if (itemStyleCache.hasOwnProperty(index)) {
            style = itemStyleCache[index];
          } else {
            var _offset = getItemOffset2(_this.props, index, _this._instanceProps);
            var size2 = getItemSize2(_this.props, index, _this._instanceProps);
            var isHorizontal = direction === "horizontal" || layout === "horizontal";
            var isRtl = direction === "rtl";
            var offsetHorizontal = isHorizontal ? _offset : 0;
            itemStyleCache[index] = style = {
              position: "absolute",
              left: isRtl ? void 0 : offsetHorizontal,
              right: isRtl ? offsetHorizontal : void 0,
              top: !isHorizontal ? _offset : 0,
              height: !isHorizontal ? size2 : "100%",
              width: isHorizontal ? size2 : "100%"
            };
          }
          return style;
        };
        _this._getItemStyleCache = void 0;
        _this._getItemStyleCache = memoize_one_esm_default(function(_, __, ___) {
          return {};
        });
        _this._onScrollHorizontal = function(event) {
          var _event$currentTarget = event.currentTarget, clientWidth = _event$currentTarget.clientWidth, scrollLeft = _event$currentTarget.scrollLeft, scrollWidth = _event$currentTarget.scrollWidth;
          _this.setState(function(prevState) {
            if (prevState.scrollOffset === scrollLeft) {
              return null;
            }
            var direction = _this.props.direction;
            var scrollOffset = scrollLeft;
            if (direction === "rtl") {
              switch (getRTLOffsetType()) {
                case "negative":
                  scrollOffset = -scrollLeft;
                  break;
                case "positive-descending":
                  scrollOffset = scrollWidth - clientWidth - scrollLeft;
                  break;
              }
            }
            scrollOffset = Math.max(0, Math.min(scrollOffset, scrollWidth - clientWidth));
            return {
              isScrolling: true,
              scrollDirection: prevState.scrollOffset < scrollOffset ? "forward" : "backward",
              scrollOffset,
              scrollUpdateWasRequested: false
            };
          }, _this._resetIsScrollingDebounced);
        };
        _this._onScrollVertical = function(event) {
          var _event$currentTarget2 = event.currentTarget, clientHeight = _event$currentTarget2.clientHeight, scrollHeight = _event$currentTarget2.scrollHeight, scrollTop = _event$currentTarget2.scrollTop;
          _this.setState(function(prevState) {
            if (prevState.scrollOffset === scrollTop) {
              return null;
            }
            var scrollOffset = Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
            return {
              isScrolling: true,
              scrollDirection: prevState.scrollOffset < scrollOffset ? "forward" : "backward",
              scrollOffset,
              scrollUpdateWasRequested: false
            };
          }, _this._resetIsScrollingDebounced);
        };
        _this._outerRefSetter = function(ref) {
          var outerRef = _this.props.outerRef;
          _this._outerRef = ref;
          if (typeof outerRef === "function") {
            outerRef(ref);
          } else if (outerRef != null && typeof outerRef === "object" && outerRef.hasOwnProperty("current")) {
            outerRef.current = ref;
          }
        };
        _this._resetIsScrollingDebounced = function() {
          if (_this._resetIsScrollingTimeoutId !== null) {
            cancelTimeout(_this._resetIsScrollingTimeoutId);
          }
          _this._resetIsScrollingTimeoutId = requestTimeout(_this._resetIsScrolling, IS_SCROLLING_DEBOUNCE_INTERVAL$1);
        };
        _this._resetIsScrolling = function() {
          _this._resetIsScrollingTimeoutId = null;
          _this.setState({
            isScrolling: false
          }, function() {
            _this._getItemStyleCache(-1, null);
          });
        };
        return _this;
      }
      List.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
        validateSharedProps$1(nextProps, prevState);
        validateProps2(nextProps);
        return null;
      };
      var _proto = List.prototype;
      _proto.scrollTo = function scrollTo(scrollOffset) {
        scrollOffset = Math.max(0, scrollOffset);
        this.setState(function(prevState) {
          if (prevState.scrollOffset === scrollOffset) {
            return null;
          }
          return {
            scrollDirection: prevState.scrollOffset < scrollOffset ? "forward" : "backward",
            scrollOffset,
            scrollUpdateWasRequested: true
          };
        }, this._resetIsScrollingDebounced);
      };
      _proto.scrollToItem = function scrollToItem(index, align) {
        if (align === void 0) {
          align = "auto";
        }
        var _this$props2 = this.props, itemCount = _this$props2.itemCount, layout = _this$props2.layout;
        var scrollOffset = this.state.scrollOffset;
        index = Math.max(0, Math.min(index, itemCount - 1));
        var scrollbarSize = 0;
        if (this._outerRef) {
          var outerRef = this._outerRef;
          if (layout === "vertical") {
            scrollbarSize = outerRef.scrollWidth > outerRef.clientWidth ? getScrollbarSize() : 0;
          } else {
            scrollbarSize = outerRef.scrollHeight > outerRef.clientHeight ? getScrollbarSize() : 0;
          }
        }
        this.scrollTo(getOffsetForIndexAndAlignment2(this.props, index, align, scrollOffset, this._instanceProps, scrollbarSize));
      };
      _proto.componentDidMount = function componentDidMount() {
        var _this$props3 = this.props, direction = _this$props3.direction, initialScrollOffset = _this$props3.initialScrollOffset, layout = _this$props3.layout;
        if (typeof initialScrollOffset === "number" && this._outerRef != null) {
          var outerRef = this._outerRef;
          if (direction === "horizontal" || layout === "horizontal") {
            outerRef.scrollLeft = initialScrollOffset;
          } else {
            outerRef.scrollTop = initialScrollOffset;
          }
        }
        this._callPropsCallbacks();
      };
      _proto.componentDidUpdate = function componentDidUpdate() {
        var _this$props4 = this.props, direction = _this$props4.direction, layout = _this$props4.layout;
        var _this$state = this.state, scrollOffset = _this$state.scrollOffset, scrollUpdateWasRequested = _this$state.scrollUpdateWasRequested;
        if (scrollUpdateWasRequested && this._outerRef != null) {
          var outerRef = this._outerRef;
          if (direction === "horizontal" || layout === "horizontal") {
            if (direction === "rtl") {
              switch (getRTLOffsetType()) {
                case "negative":
                  outerRef.scrollLeft = -scrollOffset;
                  break;
                case "positive-ascending":
                  outerRef.scrollLeft = scrollOffset;
                  break;
                default:
                  var clientWidth = outerRef.clientWidth, scrollWidth = outerRef.scrollWidth;
                  outerRef.scrollLeft = scrollWidth - clientWidth - scrollOffset;
                  break;
              }
            } else {
              outerRef.scrollLeft = scrollOffset;
            }
          } else {
            outerRef.scrollTop = scrollOffset;
          }
        }
        this._callPropsCallbacks();
      };
      _proto.componentWillUnmount = function componentWillUnmount() {
        if (this._resetIsScrollingTimeoutId !== null) {
          cancelTimeout(this._resetIsScrollingTimeoutId);
        }
      };
      _proto.render = function render3() {
        var _this$props5 = this.props, children = _this$props5.children, className = _this$props5.className, direction = _this$props5.direction, height = _this$props5.height, innerRef = _this$props5.innerRef, innerElementType = _this$props5.innerElementType, innerTagName = _this$props5.innerTagName, itemCount = _this$props5.itemCount, itemData = _this$props5.itemData, _this$props5$itemKey = _this$props5.itemKey, itemKey = _this$props5$itemKey === void 0 ? defaultItemKey$1 : _this$props5$itemKey, layout = _this$props5.layout, outerElementType = _this$props5.outerElementType, outerTagName = _this$props5.outerTagName, style = _this$props5.style, useIsScrolling = _this$props5.useIsScrolling, width = _this$props5.width;
        var isScrolling = this.state.isScrolling;
        var isHorizontal = direction === "horizontal" || layout === "horizontal";
        var onScroll = isHorizontal ? this._onScrollHorizontal : this._onScrollVertical;
        var _this$_getRangeToRend = this._getRangeToRender(), startIndex = _this$_getRangeToRend[0], stopIndex = _this$_getRangeToRend[1];
        var items = [];
        if (itemCount > 0) {
          for (var _index = startIndex; _index <= stopIndex; _index++) {
            items.push(createElement2(children, {
              data: itemData,
              key: itemKey(_index, itemData),
              index: _index,
              isScrolling: useIsScrolling ? isScrolling : void 0,
              style: this._getItemStyle(_index)
            }));
          }
        }
        var estimatedTotalSize = getEstimatedTotalSize2(this.props, this._instanceProps);
        return createElement2(outerElementType || outerTagName || "div", {
          className,
          onScroll,
          ref: this._outerRefSetter,
          style: _extends({
            position: "relative",
            height,
            width,
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            willChange: "transform",
            direction
          }, style)
        }, createElement2(innerElementType || innerTagName || "div", {
          children: items,
          ref: innerRef,
          style: {
            height: isHorizontal ? "100%" : estimatedTotalSize,
            pointerEvents: isScrolling ? "none" : void 0,
            width: isHorizontal ? estimatedTotalSize : "100%"
          }
        }));
      };
      _proto._callPropsCallbacks = function _callPropsCallbacks() {
        if (typeof this.props.onItemsRendered === "function") {
          var itemCount = this.props.itemCount;
          if (itemCount > 0) {
            var _this$_getRangeToRend2 = this._getRangeToRender(), _overscanStartIndex = _this$_getRangeToRend2[0], _overscanStopIndex = _this$_getRangeToRend2[1], _visibleStartIndex = _this$_getRangeToRend2[2], _visibleStopIndex = _this$_getRangeToRend2[3];
            this._callOnItemsRendered(_overscanStartIndex, _overscanStopIndex, _visibleStartIndex, _visibleStopIndex);
          }
        }
        if (typeof this.props.onScroll === "function") {
          var _this$state2 = this.state, _scrollDirection = _this$state2.scrollDirection, _scrollOffset = _this$state2.scrollOffset, _scrollUpdateWasRequested = _this$state2.scrollUpdateWasRequested;
          this._callOnScroll(_scrollDirection, _scrollOffset, _scrollUpdateWasRequested);
        }
      };
      _proto._getRangeToRender = function _getRangeToRender() {
        var _this$props6 = this.props, itemCount = _this$props6.itemCount, overscanCount = _this$props6.overscanCount;
        var _this$state3 = this.state, isScrolling = _this$state3.isScrolling, scrollDirection = _this$state3.scrollDirection, scrollOffset = _this$state3.scrollOffset;
        if (itemCount === 0) {
          return [0, 0, 0, 0];
        }
        var startIndex = getStartIndexForOffset2(this.props, scrollOffset, this._instanceProps);
        var stopIndex = getStopIndexForStartIndex2(this.props, startIndex, scrollOffset, this._instanceProps);
        var overscanBackward = !isScrolling || scrollDirection === "backward" ? Math.max(1, overscanCount) : 1;
        var overscanForward = !isScrolling || scrollDirection === "forward" ? Math.max(1, overscanCount) : 1;
        return [Math.max(0, startIndex - overscanBackward), Math.max(0, Math.min(itemCount - 1, stopIndex + overscanForward)), startIndex, stopIndex];
      };
      return List;
    }(PureComponent), _class.defaultProps = {
      direction: "ltr",
      itemData: void 0,
      layout: "vertical",
      overscanCount: 2,
      useIsScrolling: false
    }, _class;
  }
  var validateSharedProps$1 = function validateSharedProps(_ref2, _ref3) {
    var children = _ref2.children, direction = _ref2.direction, height = _ref2.height, layout = _ref2.layout, innerTagName = _ref2.innerTagName, outerTagName = _ref2.outerTagName, width = _ref2.width;
    var instance = _ref3.instance;
    if (true) {
      if (innerTagName != null || outerTagName != null) {
        if (devWarningsTagName$1 && !devWarningsTagName$1.has(instance)) {
          devWarningsTagName$1.add(instance);
          console.warn("The innerTagName and outerTagName props have been deprecated. Please use the innerElementType and outerElementType props instead.");
        }
      }
      var isHorizontal = direction === "horizontal" || layout === "horizontal";
      switch (direction) {
        case "horizontal":
        case "vertical":
          if (devWarningsDirection && !devWarningsDirection.has(instance)) {
            devWarningsDirection.add(instance);
            console.warn('The direction prop should be either "ltr" (default) or "rtl". Please use the layout prop to specify "vertical" (default) or "horizontal" orientation.');
          }
          break;
        case "ltr":
        case "rtl":
          break;
        default:
          throw Error('An invalid "direction" prop has been specified. Value should be either "ltr" or "rtl". ' + ('"' + direction + '" was specified.'));
      }
      switch (layout) {
        case "horizontal":
        case "vertical":
          break;
        default:
          throw Error('An invalid "layout" prop has been specified. Value should be either "horizontal" or "vertical". ' + ('"' + layout + '" was specified.'));
      }
      if (children == null) {
        throw Error('An invalid "children" prop has been specified. Value should be a React component. ' + ('"' + (children === null ? "null" : typeof children) + '" was specified.'));
      }
      if (isHorizontal && typeof width !== "number") {
        throw Error('An invalid "width" prop has been specified. Horizontal lists must specify a number for width. ' + ('"' + (width === null ? "null" : typeof width) + '" was specified.'));
      } else if (!isHorizontal && typeof height !== "number") {
        throw Error('An invalid "height" prop has been specified. Vertical lists must specify a number for height. ' + ('"' + (height === null ? "null" : typeof height) + '" was specified.'));
      }
    }
  };
  var FixedSizeList = /* @__PURE__ */ createListComponent({
    getItemOffset: function getItemOffset(_ref, index) {
      var itemSize = _ref.itemSize;
      return index * itemSize;
    },
    getItemSize: function getItemSize(_ref2, index) {
      var itemSize = _ref2.itemSize;
      return itemSize;
    },
    getEstimatedTotalSize: function getEstimatedTotalSize(_ref3) {
      var itemCount = _ref3.itemCount, itemSize = _ref3.itemSize;
      return itemSize * itemCount;
    },
    getOffsetForIndexAndAlignment: function getOffsetForIndexAndAlignment(_ref4, index, align, scrollOffset, instanceProps, scrollbarSize) {
      var direction = _ref4.direction, height = _ref4.height, itemCount = _ref4.itemCount, itemSize = _ref4.itemSize, layout = _ref4.layout, width = _ref4.width;
      var isHorizontal = direction === "horizontal" || layout === "horizontal";
      var size2 = isHorizontal ? width : height;
      var lastItemOffset = Math.max(0, itemCount * itemSize - size2);
      var maxOffset = Math.min(lastItemOffset, index * itemSize);
      var minOffset = Math.max(0, index * itemSize - size2 + itemSize + scrollbarSize);
      if (align === "smart") {
        if (scrollOffset >= minOffset - size2 && scrollOffset <= maxOffset + size2) {
          align = "auto";
        } else {
          align = "center";
        }
      }
      switch (align) {
        case "start":
          return maxOffset;
        case "end":
          return minOffset;
        case "center": {
          var middleOffset = Math.round(minOffset + (maxOffset - minOffset) / 2);
          if (middleOffset < Math.ceil(size2 / 2)) {
            return 0;
          } else if (middleOffset > lastItemOffset + Math.floor(size2 / 2)) {
            return lastItemOffset;
          } else {
            return middleOffset;
          }
        }
        case "auto":
        default:
          if (scrollOffset >= minOffset && scrollOffset <= maxOffset) {
            return scrollOffset;
          } else if (scrollOffset < minOffset) {
            return minOffset;
          } else {
            return maxOffset;
          }
      }
    },
    getStartIndexForOffset: function getStartIndexForOffset(_ref5, offset) {
      var itemCount = _ref5.itemCount, itemSize = _ref5.itemSize;
      return Math.max(0, Math.min(itemCount - 1, Math.floor(offset / itemSize)));
    },
    getStopIndexForStartIndex: function getStopIndexForStartIndex(_ref6, startIndex, scrollOffset) {
      var direction = _ref6.direction, height = _ref6.height, itemCount = _ref6.itemCount, itemSize = _ref6.itemSize, layout = _ref6.layout, width = _ref6.width;
      var isHorizontal = direction === "horizontal" || layout === "horizontal";
      var offset = startIndex * itemSize;
      var size2 = isHorizontal ? width : height;
      var numVisibleItems = Math.ceil((size2 + scrollOffset - offset) / itemSize);
      return Math.max(0, Math.min(
        itemCount - 1,
        startIndex + numVisibleItems - 1
        // -1 is because stop index is inclusive
      ));
    },
    initInstanceProps: function initInstanceProps(props) {
    },
    shouldResetStyleCacheOnItemSizeChange: true,
    validateProps: function validateProps(_ref7) {
      var itemSize = _ref7.itemSize;
      if (true) {
        if (typeof itemSize !== "number") {
          throw Error('An invalid "itemSize" prop has been specified. Value should be a number. ' + ('"' + (itemSize === null ? "null" : typeof itemSize) + '" was specified.'));
        }
      }
    }
  });

  // .xuyc-entry.js
  var h = react_compat_default.createElement;
  function out(msg) {
    let el = document.getElementById("__diag");
    if (!el) {
      el = document.createElement("pre");
      el.id = "__diag";
      el.style.cssText = "position:fixed;bottom:0;left:0;right:0;background:#000;color:#0f0;padding:10px;font:12px monospace;max-height:40vh;overflow:auto;z-index:99999;white-space:pre-wrap;margin:0";
      document.body.appendChild(el);
    }
    el.textContent += msg + "\n";
    el.scrollTop = el.scrollHeight;
  }
  window.__XUNAY_DEBUG_LOG = out;
  out("[1] import OK, FixedSizeList=" + typeof FixedSizeList);
  var Row = ({ index, style }) => {
    return h("div", { style: { ...style, padding: "8px 16px", borderBottom: "1px solid #eee" } }, "\u7B2C " + (index + 1) + " \u884C");
  };
  function App() {
    out("[2] App \u8FDB\u5165");
    const listRef = react_compat_default.useRef(null);
    react_compat_default.useEffect(() => {
      out("[3] useEffect \u89E6\u53D1, listRef.current=" + (listRef.current ? "\u6709" : "\u65E0"));
      if (listRef.current) {
        const el = listRef.current;
        out("[4] list DOM \u5C3A\u5BF8: w=" + el.offsetWidth + " h=" + el.offsetHeight);
        out("[5] list \u5B50\u8282\u70B9\u6570: " + el.children.length);
      }
    }, []);
    return h(
      "div",
      { style: "padding:24px;background:#282c34;color:#abb2bf;font-family:system-ui;min-height:100vh" },
      h("h1", { style: { color: "#61afef" } }, "react-window"),
      h(
        "div",
        { style: "background:#fff;color:#000;width:100%;height:400px;overflow:hidden" },
        h(FixedSizeList, {
          ref: listRef,
          height: 400,
          itemCount: 1e3,
          itemSize: 40,
          width: "100%"
        }, Row)
      )
    );
  }
  try {
    react_compat_default.createRoot(document.getElementById("app")).render(h(App));
    out("[6] render \u8C03\u7528\u5B8C\u6210");
  } catch (e) {
    out("!! \u9876\u5C42: " + (e.stack || e.message));
  }
})();
