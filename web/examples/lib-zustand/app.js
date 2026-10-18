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
    if (config) {
      for (const k in config) {
        if (k === "key") {
          key = config[k];
          continue;
        }
        props[k] = config[k];
      }
    }
    if (children.length === 1) props.children = children[0];
    else if (children.length > 1) props.children = children;
    return { $$typeof: REACT_ELEMENT, type, key, props };
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
  function useImperativeHandle(ref, create2, deps) {
    useEffect(() => {
      if (!ref) return;
      const value = create2();
      if (typeof ref === "function") ref(value);
      else ref.current = value;
      return () => {
        if (typeof ref === "function") ref(null);
        else ref.current = null;
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
    const F = (props) => render3(props, props.ref);
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
  var Component = class {
    constructor(props) {
      this.props = props;
      this.state = this.state || null;
      this._inst = null;
    }
    setState(partial) {
      const next = typeof partial === "function" ? partial(this.state) : partial;
      this.state = { ...this.state || {}, ...next };
      if (this._inst) scheduleUpdate(this._inst);
    }
    forceUpdate() {
      if (this._inst) scheduleUpdate(this._inst);
    }
    render() {
      return null;
    }
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
    const { type, props } = vnode;
    if (type === REACT_FRAGMENT) {
      const frag = document.createDocumentFragment();
      appendChildren(frag, props.children);
      return frag;
    }
    if (typeof type === "function") {
      return renderComponent(type, props);
    }
    const isSvg = SVG_TAGS.has(type);
    const el = isSvg ? document.createElementNS(SVG_NS, type) : document.createElement(type);
    let ref = null;
    for (const k in props) {
      if (k === "ref") {
        ref = props[k];
        continue;
      }
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
  function renderComponent(type, props) {
    const vnode = { type, props };
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
      result = inst.vnode.type(inst.vnode.props);
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
    runEffects(inst);
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
    if (ref !== null) vnode.ref = ref;
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

  // ../../node_modules/zustand/esm/vanilla.mjs
  var createStoreImpl = (createState) => {
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial, replace) => {
      const nextState = typeof partial === "function" ? partial(state) : partial;
      if (!Object.is(nextState, state)) {
        const previousState = state;
        state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
        listeners.forEach((listener) => listener(state, previousState));
      }
    };
    const getState = () => state;
    const getInitialState = () => initialState;
    const subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    const api = { setState, getState, getInitialState, subscribe };
    const initialState = state = createState(setState, getState, api);
    return api;
  };
  var createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

  // ../../node_modules/zustand/esm/react.mjs
  var identity = (arg) => arg;
  function useStore(api, selector = identity) {
    const slice = react_compat_default.useSyncExternalStore(
      api.subscribe,
      react_compat_default.useCallback(() => selector(api.getState()), [api, selector]),
      react_compat_default.useCallback(() => selector(api.getInitialState()), [api, selector])
    );
    react_compat_default.useDebugValue(slice);
    return slice;
  }
  var createImpl = (createState) => {
    const api = createStore(createState);
    const useBoundStore = (selector) => useStore(api, selector);
    Object.assign(useBoundStore, api);
    return useBoundStore;
  };
  var create = (createState) => createState ? createImpl(createState) : createImpl;

  // .xuyc-entry.js
  var h = react_compat_default.createElement;
  function out(msg) {
    let el = document.getElementById("__diag");
    if (!el) {
      el = document.createElement("pre");
      el.id = "__diag";
      el.style.cssText = "position:fixed;bottom:0;left:0;right:0;background:#000;color:#0f0;padding:10px;font:12px monospace;max-height:60vh;overflow:auto;z-index:99999;white-space:pre-wrap;margin:0";
      document.body.appendChild(el);
    }
    el.textContent += msg + "\n";
    el.scrollTop = el.scrollHeight;
  }
  window.__XUNAY_DEBUG_LOG = out;
  out("[1] import OK");
  var useStore2 = create((set) => ({
    bears: 0,
    increase: () => set((s) => ({ bears: s.bears + 1 })),
    decrease: () => set((s) => ({ bears: s.bears - 1 })),
    reset: () => set({ bears: 0 })
  }));
  out("[2] create() OK");
  function Counter() {
    out("[3] Counter \u8FDB\u5165");
    const bears = useStore2((s) => s.bears);
    out("[4] useStore(selector) = " + bears);
    return h("div", null, "bears = " + bears);
  }
  out("[5] Counter \u5B9A\u4E49");
  function App() {
    out("[6] App \u8FDB\u5165");
    return h(
      "div",
      { style: "padding:16px;background:#282c34;color:#fff;font-family:system-ui;min-height:100vh" },
      h("h1", null, "zustand \u8BCA\u65AD"),
      h(Counter)
    );
  }
  out("[7] \u5F00\u59CB render");
  react_compat_default.createRoot(document.getElementById("app")).render(h(App));
  out("[8] render \u8C03\u7528\u5B8C\u6210");
})();
