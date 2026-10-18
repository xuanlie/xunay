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
  function useImperativeHandle(ref, create, deps) {
    useEffect(() => {
      if (!ref) return;
      const value = create();
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

  // ../../node_modules/@tanstack/table-core/build/lib/index.mjs
  function functionalUpdate(updater, input2) {
    return typeof updater === "function" ? updater(input2) : updater;
  }
  function makeStateUpdater(key, instance) {
    return (updater) => {
      instance.setState((old) => {
        return {
          ...old,
          [key]: functionalUpdate(updater, old[key])
        };
      });
    };
  }
  function isFunction(d) {
    return d instanceof Function;
  }
  function isNumberArray(d) {
    return Array.isArray(d) && d.every((val) => typeof val === "number");
  }
  function flattenBy(arr, getChildren) {
    const flat = [];
    const recurse = (subArr) => {
      subArr.forEach((item) => {
        flat.push(item);
        const children = getChildren(item);
        if (children != null && children.length) {
          recurse(children);
        }
      });
    };
    recurse(arr);
    return flat;
  }
  function memo2(getDeps, fn, opts) {
    let deps = [];
    let result;
    return (depArgs) => {
      let depTime;
      if (opts.key && opts.debug) depTime = Date.now();
      const newDeps = getDeps(depArgs);
      const depsChanged2 = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
      if (!depsChanged2) {
        return result;
      }
      deps = newDeps;
      let resultTime;
      if (opts.key && opts.debug) resultTime = Date.now();
      result = fn(...newDeps);
      opts == null || opts.onChange == null || opts.onChange(result);
      if (opts.key && opts.debug) {
        if (opts != null && opts.debug()) {
          const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
          const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
          const resultFpsPercentage = resultEndTime / 16;
          const pad = (str, num) => {
            str = String(str);
            while (str.length < num) {
              str = " " + str;
            }
            return str;
          };
          console.info(`%c\u23F1 ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120))}deg 100% 31%);`, opts == null ? void 0 : opts.key);
        }
      }
      return result;
    };
  }
  function getMemoOptions(tableOptions, debugLevel, key, onChange) {
    return {
      debug: () => {
        var _tableOptions$debugAl;
        return (_tableOptions$debugAl = tableOptions == null ? void 0 : tableOptions.debugAll) != null ? _tableOptions$debugAl : tableOptions[debugLevel];
      },
      key,
      onChange
    };
  }
  function createCell(table2, row, column, columnId) {
    const getRenderValue = () => {
      var _cell$getValue;
      return (_cell$getValue = cell.getValue()) != null ? _cell$getValue : table2.options.renderFallbackValue;
    };
    const cell = {
      id: `${row.id}_${column.id}`,
      row,
      column,
      getValue: () => row.getValue(columnId),
      renderValue: getRenderValue,
      getContext: memo2(() => [table2, column, row, cell], (table3, column2, row2, cell2) => ({
        table: table3,
        column: column2,
        row: row2,
        cell: cell2,
        getValue: cell2.getValue,
        renderValue: cell2.renderValue
      }), getMemoOptions(table2.options, "debugCells", "cell.getContext"))
    };
    table2._features.forEach((feature) => {
      feature.createCell == null || feature.createCell(cell, column, row, table2);
    }, {});
    return cell;
  }
  function createColumn(table2, columnDef, depth, parent) {
    var _ref, _resolvedColumnDef$id;
    const defaultColumn = table2._getDefaultColumnDef();
    const resolvedColumnDef = {
      ...defaultColumn,
      ...columnDef
    };
    const accessorKey = resolvedColumnDef.accessorKey;
    let id = (_ref = (_resolvedColumnDef$id = resolvedColumnDef.id) != null ? _resolvedColumnDef$id : accessorKey ? typeof String.prototype.replaceAll === "function" ? accessorKey.replaceAll(".", "_") : accessorKey.replace(/\./g, "_") : void 0) != null ? _ref : typeof resolvedColumnDef.header === "string" ? resolvedColumnDef.header : void 0;
    let accessorFn;
    if (resolvedColumnDef.accessorFn) {
      accessorFn = resolvedColumnDef.accessorFn;
    } else if (accessorKey) {
      if (accessorKey.includes(".")) {
        accessorFn = (originalRow) => {
          let result = originalRow;
          for (const key of accessorKey.split(".")) {
            var _result;
            result = (_result = result) == null ? void 0 : _result[key];
            if (result === void 0) {
              console.warn(`"${key}" in deeply nested key "${accessorKey}" returned undefined.`);
            }
          }
          return result;
        };
      } else {
        accessorFn = (originalRow) => originalRow[resolvedColumnDef.accessorKey];
      }
    }
    if (!id) {
      if (true) {
        throw new Error(resolvedColumnDef.accessorFn ? `Columns require an id when using an accessorFn` : `Columns require an id when using a non-string header`);
      }
      throw new Error();
    }
    let column = {
      id: `${String(id)}`,
      accessorFn,
      parent,
      depth,
      columnDef: resolvedColumnDef,
      columns: [],
      getFlatColumns: memo2(() => [true], () => {
        var _column$columns;
        return [column, ...(_column$columns = column.columns) == null ? void 0 : _column$columns.flatMap((d) => d.getFlatColumns())];
      }, getMemoOptions(table2.options, "debugColumns", "column.getFlatColumns")),
      getLeafColumns: memo2(() => [table2._getOrderColumnsFn()], (orderColumns2) => {
        var _column$columns2;
        if ((_column$columns2 = column.columns) != null && _column$columns2.length) {
          let leafColumns = column.columns.flatMap((column2) => column2.getLeafColumns());
          return orderColumns2(leafColumns);
        }
        return [column];
      }, getMemoOptions(table2.options, "debugColumns", "column.getLeafColumns"))
    };
    for (const feature of table2._features) {
      feature.createColumn == null || feature.createColumn(column, table2);
    }
    return column;
  }
  var debug = "debugHeaders";
  function createHeader(table2, column, options) {
    var _options$id;
    const id = (_options$id = options.id) != null ? _options$id : column.id;
    let header2 = {
      id,
      column,
      index: options.index,
      isPlaceholder: !!options.isPlaceholder,
      placeholderId: options.placeholderId,
      depth: options.depth,
      subHeaders: [],
      colSpan: 0,
      rowSpan: 0,
      headerGroup: null,
      getLeafHeaders: () => {
        const leafHeaders = [];
        const recurseHeader = (h7) => {
          if (h7.subHeaders && h7.subHeaders.length) {
            h7.subHeaders.map(recurseHeader);
          }
          leafHeaders.push(h7);
        };
        recurseHeader(header2);
        return leafHeaders;
      },
      getContext: () => ({
        table: table2,
        header: header2,
        column
      })
    };
    table2._features.forEach((feature) => {
      feature.createHeader == null || feature.createHeader(header2, table2);
    });
    return header2;
  }
  var Headers = {
    createTable: (table2) => {
      table2.getHeaderGroups = memo2(() => [table2.getAllColumns(), table2.getVisibleLeafColumns(), table2.getState().columnPinning.left, table2.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
        var _left$map$filter, _right$map$filter;
        const leftColumns = (_left$map$filter = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter : [];
        const rightColumns = (_right$map$filter = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter : [];
        const centerColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
        const headerGroups = buildHeaderGroups(allColumns, [...leftColumns, ...centerColumns, ...rightColumns], table2);
        return headerGroups;
      }, getMemoOptions(table2.options, debug, "getHeaderGroups"));
      table2.getCenterHeaderGroups = memo2(() => [table2.getAllColumns(), table2.getVisibleLeafColumns(), table2.getState().columnPinning.left, table2.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
        leafColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
        return buildHeaderGroups(allColumns, leafColumns, table2, "center");
      }, getMemoOptions(table2.options, debug, "getCenterHeaderGroups"));
      table2.getLeftHeaderGroups = memo2(() => [table2.getAllColumns(), table2.getVisibleLeafColumns(), table2.getState().columnPinning.left], (allColumns, leafColumns, left) => {
        var _left$map$filter2;
        const orderedLeafColumns = (_left$map$filter2 = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter2 : [];
        return buildHeaderGroups(allColumns, orderedLeafColumns, table2, "left");
      }, getMemoOptions(table2.options, debug, "getLeftHeaderGroups"));
      table2.getRightHeaderGroups = memo2(() => [table2.getAllColumns(), table2.getVisibleLeafColumns(), table2.getState().columnPinning.right], (allColumns, leafColumns, right) => {
        var _right$map$filter2;
        const orderedLeafColumns = (_right$map$filter2 = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter2 : [];
        return buildHeaderGroups(allColumns, orderedLeafColumns, table2, "right");
      }, getMemoOptions(table2.options, debug, "getRightHeaderGroups"));
      table2.getFooterGroups = memo2(() => [table2.getHeaderGroups()], (headerGroups) => {
        return [...headerGroups].reverse();
      }, getMemoOptions(table2.options, debug, "getFooterGroups"));
      table2.getLeftFooterGroups = memo2(() => [table2.getLeftHeaderGroups()], (headerGroups) => {
        return [...headerGroups].reverse();
      }, getMemoOptions(table2.options, debug, "getLeftFooterGroups"));
      table2.getCenterFooterGroups = memo2(() => [table2.getCenterHeaderGroups()], (headerGroups) => {
        return [...headerGroups].reverse();
      }, getMemoOptions(table2.options, debug, "getCenterFooterGroups"));
      table2.getRightFooterGroups = memo2(() => [table2.getRightHeaderGroups()], (headerGroups) => {
        return [...headerGroups].reverse();
      }, getMemoOptions(table2.options, debug, "getRightFooterGroups"));
      table2.getFlatHeaders = memo2(() => [table2.getHeaderGroups()], (headerGroups) => {
        return headerGroups.map((headerGroup) => {
          return headerGroup.headers;
        }).flat();
      }, getMemoOptions(table2.options, debug, "getFlatHeaders"));
      table2.getLeftFlatHeaders = memo2(() => [table2.getLeftHeaderGroups()], (left) => {
        return left.map((headerGroup) => {
          return headerGroup.headers;
        }).flat();
      }, getMemoOptions(table2.options, debug, "getLeftFlatHeaders"));
      table2.getCenterFlatHeaders = memo2(() => [table2.getCenterHeaderGroups()], (left) => {
        return left.map((headerGroup) => {
          return headerGroup.headers;
        }).flat();
      }, getMemoOptions(table2.options, debug, "getCenterFlatHeaders"));
      table2.getRightFlatHeaders = memo2(() => [table2.getRightHeaderGroups()], (left) => {
        return left.map((headerGroup) => {
          return headerGroup.headers;
        }).flat();
      }, getMemoOptions(table2.options, debug, "getRightFlatHeaders"));
      table2.getCenterLeafHeaders = memo2(() => [table2.getCenterFlatHeaders()], (flatHeaders) => {
        return flatHeaders.filter((header2) => {
          var _header$subHeaders;
          return !((_header$subHeaders = header2.subHeaders) != null && _header$subHeaders.length);
        });
      }, getMemoOptions(table2.options, debug, "getCenterLeafHeaders"));
      table2.getLeftLeafHeaders = memo2(() => [table2.getLeftFlatHeaders()], (flatHeaders) => {
        return flatHeaders.filter((header2) => {
          var _header$subHeaders2;
          return !((_header$subHeaders2 = header2.subHeaders) != null && _header$subHeaders2.length);
        });
      }, getMemoOptions(table2.options, debug, "getLeftLeafHeaders"));
      table2.getRightLeafHeaders = memo2(() => [table2.getRightFlatHeaders()], (flatHeaders) => {
        return flatHeaders.filter((header2) => {
          var _header$subHeaders3;
          return !((_header$subHeaders3 = header2.subHeaders) != null && _header$subHeaders3.length);
        });
      }, getMemoOptions(table2.options, debug, "getRightLeafHeaders"));
      table2.getLeafHeaders = memo2(() => [table2.getLeftHeaderGroups(), table2.getCenterHeaderGroups(), table2.getRightHeaderGroups()], (left, center, right) => {
        var _left$0$headers, _left$, _center$0$headers, _center$, _right$0$headers, _right$;
        return [...(_left$0$headers = (_left$ = left[0]) == null ? void 0 : _left$.headers) != null ? _left$0$headers : [], ...(_center$0$headers = (_center$ = center[0]) == null ? void 0 : _center$.headers) != null ? _center$0$headers : [], ...(_right$0$headers = (_right$ = right[0]) == null ? void 0 : _right$.headers) != null ? _right$0$headers : []].map((header2) => {
          return header2.getLeafHeaders();
        }).flat();
      }, getMemoOptions(table2.options, debug, "getLeafHeaders"));
    }
  };
  function buildHeaderGroups(allColumns, columnsToGroup, table2, headerFamily) {
    var _headerGroups$0$heade, _headerGroups$;
    let maxDepth = 0;
    const findMaxDepth = function(columns2, depth) {
      if (depth === void 0) {
        depth = 1;
      }
      maxDepth = Math.max(maxDepth, depth);
      columns2.filter((column) => column.getIsVisible()).forEach((column) => {
        var _column$columns;
        if ((_column$columns = column.columns) != null && _column$columns.length) {
          findMaxDepth(column.columns, depth + 1);
        }
      }, 0);
    };
    findMaxDepth(allColumns);
    let headerGroups = [];
    const createHeaderGroup = (headersToGroup, depth) => {
      const headerGroup = {
        depth,
        id: [headerFamily, `${depth}`].filter(Boolean).join("_"),
        headers: []
      };
      const pendingParentHeaders = [];
      headersToGroup.forEach((headerToGroup) => {
        const latestPendingParentHeader = [...pendingParentHeaders].reverse()[0];
        const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
        let column;
        let isPlaceholder = false;
        if (isLeafHeader && headerToGroup.column.parent) {
          column = headerToGroup.column.parent;
        } else {
          column = headerToGroup.column;
          isPlaceholder = true;
        }
        if (latestPendingParentHeader && (latestPendingParentHeader == null ? void 0 : latestPendingParentHeader.column) === column) {
          latestPendingParentHeader.subHeaders.push(headerToGroup);
        } else {
          const header2 = createHeader(table2, column, {
            id: [headerFamily, depth, column.id, headerToGroup == null ? void 0 : headerToGroup.id].filter(Boolean).join("_"),
            isPlaceholder,
            placeholderId: isPlaceholder ? `${pendingParentHeaders.filter((d) => d.column === column).length}` : void 0,
            depth,
            index: pendingParentHeaders.length
          });
          header2.subHeaders.push(headerToGroup);
          pendingParentHeaders.push(header2);
        }
        headerGroup.headers.push(headerToGroup);
        headerToGroup.headerGroup = headerGroup;
      });
      headerGroups.push(headerGroup);
      if (depth > 0) {
        createHeaderGroup(pendingParentHeaders, depth - 1);
      }
    };
    const bottomHeaders = columnsToGroup.map((column, index) => createHeader(table2, column, {
      depth: maxDepth,
      index
    }));
    createHeaderGroup(bottomHeaders, maxDepth - 1);
    headerGroups.reverse();
    const recurseHeadersForSpans = (headers) => {
      const filteredHeaders = headers.filter((header2) => header2.column.getIsVisible());
      return filteredHeaders.map((header2) => {
        let colSpan = 0;
        let rowSpan = 0;
        let childRowSpans = [0];
        if (header2.subHeaders && header2.subHeaders.length) {
          childRowSpans = [];
          recurseHeadersForSpans(header2.subHeaders).forEach((_ref) => {
            let {
              colSpan: childColSpan,
              rowSpan: childRowSpan
            } = _ref;
            colSpan += childColSpan;
            childRowSpans.push(childRowSpan);
          });
        } else {
          colSpan = 1;
        }
        const minChildRowSpan = Math.min(...childRowSpans);
        rowSpan = rowSpan + minChildRowSpan;
        header2.colSpan = colSpan;
        header2.rowSpan = rowSpan;
        return {
          colSpan,
          rowSpan
        };
      });
    };
    recurseHeadersForSpans((_headerGroups$0$heade = (_headerGroups$ = headerGroups[0]) == null ? void 0 : _headerGroups$.headers) != null ? _headerGroups$0$heade : []);
    return headerGroups;
  }
  var createRow = (table2, id, original, rowIndex, depth, subRows, parentId) => {
    let row = {
      id,
      index: rowIndex,
      original,
      depth,
      parentId,
      _valuesCache: {},
      _uniqueValuesCache: {},
      getValue: (columnId) => {
        if (row._valuesCache.hasOwnProperty(columnId)) {
          return row._valuesCache[columnId];
        }
        const column = table2.getColumn(columnId);
        if (!(column != null && column.accessorFn)) {
          return void 0;
        }
        row._valuesCache[columnId] = column.accessorFn(row.original, rowIndex);
        return row._valuesCache[columnId];
      },
      getUniqueValues: (columnId) => {
        if (row._uniqueValuesCache.hasOwnProperty(columnId)) {
          return row._uniqueValuesCache[columnId];
        }
        const column = table2.getColumn(columnId);
        if (!(column != null && column.accessorFn)) {
          return void 0;
        }
        if (!column.columnDef.getUniqueValues) {
          row._uniqueValuesCache[columnId] = [row.getValue(columnId)];
          return row._uniqueValuesCache[columnId];
        }
        row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, rowIndex);
        return row._uniqueValuesCache[columnId];
      },
      renderValue: (columnId) => {
        var _row$getValue;
        return (_row$getValue = row.getValue(columnId)) != null ? _row$getValue : table2.options.renderFallbackValue;
      },
      subRows: subRows != null ? subRows : [],
      getLeafRows: () => flattenBy(row.subRows, (d) => d.subRows),
      getParentRow: () => row.parentId ? table2.getRow(row.parentId, true) : void 0,
      getParentRows: () => {
        let parentRows = [];
        let currentRow = row;
        while (true) {
          const parentRow = currentRow.getParentRow();
          if (!parentRow) break;
          parentRows.push(parentRow);
          currentRow = parentRow;
        }
        return parentRows.reverse();
      },
      getAllCells: memo2(() => [table2.getAllLeafColumns()], (leafColumns) => {
        return leafColumns.map((column) => {
          return createCell(table2, row, column, column.id);
        });
      }, getMemoOptions(table2.options, "debugRows", "getAllCells")),
      _getAllCellsByColumnId: memo2(() => [row.getAllCells()], (allCells) => {
        return allCells.reduce((acc, cell) => {
          acc[cell.column.id] = cell;
          return acc;
        }, {});
      }, getMemoOptions(table2.options, "debugRows", "getAllCellsByColumnId"))
    };
    for (let i = 0; i < table2._features.length; i++) {
      const feature = table2._features[i];
      feature == null || feature.createRow == null || feature.createRow(row, table2);
    }
    return row;
  };
  var ColumnFaceting = {
    createColumn: (column, table2) => {
      column._getFacetedRowModel = table2.options.getFacetedRowModel && table2.options.getFacetedRowModel(table2, column.id);
      column.getFacetedRowModel = () => {
        if (!column._getFacetedRowModel) {
          return table2.getPreFilteredRowModel();
        }
        return column._getFacetedRowModel();
      };
      column._getFacetedUniqueValues = table2.options.getFacetedUniqueValues && table2.options.getFacetedUniqueValues(table2, column.id);
      column.getFacetedUniqueValues = () => {
        if (!column._getFacetedUniqueValues) {
          return /* @__PURE__ */ new Map();
        }
        return column._getFacetedUniqueValues();
      };
      column._getFacetedMinMaxValues = table2.options.getFacetedMinMaxValues && table2.options.getFacetedMinMaxValues(table2, column.id);
      column.getFacetedMinMaxValues = () => {
        if (!column._getFacetedMinMaxValues) {
          return void 0;
        }
        return column._getFacetedMinMaxValues();
      };
    }
  };
  var includesString = (row, columnId, filterValue) => {
    var _filterValue$toString, _row$getValue;
    const search = filterValue == null || (_filterValue$toString = filterValue.toString()) == null ? void 0 : _filterValue$toString.toLowerCase();
    return Boolean((_row$getValue = row.getValue(columnId)) == null || (_row$getValue = _row$getValue.toString()) == null || (_row$getValue = _row$getValue.toLowerCase()) == null ? void 0 : _row$getValue.includes(search));
  };
  includesString.autoRemove = (val) => testFalsey(val);
  var includesStringSensitive = (row, columnId, filterValue) => {
    var _row$getValue2;
    return Boolean((_row$getValue2 = row.getValue(columnId)) == null || (_row$getValue2 = _row$getValue2.toString()) == null ? void 0 : _row$getValue2.includes(filterValue));
  };
  includesStringSensitive.autoRemove = (val) => testFalsey(val);
  var equalsString = (row, columnId, filterValue) => {
    var _row$getValue3;
    return ((_row$getValue3 = row.getValue(columnId)) == null || (_row$getValue3 = _row$getValue3.toString()) == null ? void 0 : _row$getValue3.toLowerCase()) === (filterValue == null ? void 0 : filterValue.toLowerCase());
  };
  equalsString.autoRemove = (val) => testFalsey(val);
  var arrIncludes = (row, columnId, filterValue) => {
    var _row$getValue4;
    return (_row$getValue4 = row.getValue(columnId)) == null ? void 0 : _row$getValue4.includes(filterValue);
  };
  arrIncludes.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
  var arrIncludesAll = (row, columnId, filterValue) => {
    return !filterValue.some((val) => {
      var _row$getValue5;
      return !((_row$getValue5 = row.getValue(columnId)) != null && _row$getValue5.includes(val));
    });
  };
  arrIncludesAll.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
  var arrIncludesSome = (row, columnId, filterValue) => {
    return filterValue.some((val) => {
      var _row$getValue6;
      return (_row$getValue6 = row.getValue(columnId)) == null ? void 0 : _row$getValue6.includes(val);
    });
  };
  arrIncludesSome.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
  var equals = (row, columnId, filterValue) => {
    return row.getValue(columnId) === filterValue;
  };
  equals.autoRemove = (val) => testFalsey(val);
  var weakEquals = (row, columnId, filterValue) => {
    return row.getValue(columnId) == filterValue;
  };
  weakEquals.autoRemove = (val) => testFalsey(val);
  var inNumberRange = (row, columnId, filterValue) => {
    let [min2, max2] = filterValue;
    const rowValue = row.getValue(columnId);
    return rowValue >= min2 && rowValue <= max2;
  };
  inNumberRange.resolveFilterValue = (val) => {
    let [unsafeMin, unsafeMax] = val;
    let parsedMin = typeof unsafeMin !== "number" ? parseFloat(unsafeMin) : unsafeMin;
    let parsedMax = typeof unsafeMax !== "number" ? parseFloat(unsafeMax) : unsafeMax;
    let min2 = unsafeMin === null || Number.isNaN(parsedMin) ? -Infinity : parsedMin;
    let max2 = unsafeMax === null || Number.isNaN(parsedMax) ? Infinity : parsedMax;
    if (min2 > max2) {
      const temp = min2;
      min2 = max2;
      max2 = temp;
    }
    return [min2, max2];
  };
  inNumberRange.autoRemove = (val) => testFalsey(val) || testFalsey(val[0]) && testFalsey(val[1]);
  var filterFns = {
    includesString,
    includesStringSensitive,
    equalsString,
    arrIncludes,
    arrIncludesAll,
    arrIncludesSome,
    equals,
    weakEquals,
    inNumberRange
  };
  function testFalsey(val) {
    return val === void 0 || val === null || val === "";
  }
  var ColumnFiltering = {
    getDefaultColumnDef: () => {
      return {
        filterFn: "auto"
      };
    },
    getInitialState: (state) => {
      return {
        columnFilters: [],
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onColumnFiltersChange: makeStateUpdater("columnFilters", table2),
        filterFromLeafRows: false,
        maxLeafRowFilterDepth: 100
      };
    },
    createColumn: (column, table2) => {
      column.getAutoFilterFn = () => {
        const firstRow = table2.getCoreRowModel().flatRows[0];
        const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
        if (typeof value === "string") {
          return filterFns.includesString;
        }
        if (typeof value === "number") {
          return filterFns.inNumberRange;
        }
        if (typeof value === "boolean") {
          return filterFns.equals;
        }
        if (value !== null && typeof value === "object") {
          return filterFns.equals;
        }
        if (Array.isArray(value)) {
          return filterFns.arrIncludes;
        }
        return filterFns.weakEquals;
      };
      column.getFilterFn = () => {
        var _table$options$filter, _table$options$filter2;
        return isFunction(column.columnDef.filterFn) ? column.columnDef.filterFn : column.columnDef.filterFn === "auto" ? column.getAutoFilterFn() : (
          // @ts-ignore
          (_table$options$filter = (_table$options$filter2 = table2.options.filterFns) == null ? void 0 : _table$options$filter2[column.columnDef.filterFn]) != null ? _table$options$filter : filterFns[column.columnDef.filterFn]
        );
      };
      column.getCanFilter = () => {
        var _column$columnDef$ena, _table$options$enable, _table$options$enable2;
        return ((_column$columnDef$ena = column.columnDef.enableColumnFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table2.options.enableColumnFilters) != null ? _table$options$enable : true) && ((_table$options$enable2 = table2.options.enableFilters) != null ? _table$options$enable2 : true) && !!column.accessorFn;
      };
      column.getIsFiltered = () => column.getFilterIndex() > -1;
      column.getFilterValue = () => {
        var _table$getState$colum;
        return (_table$getState$colum = table2.getState().columnFilters) == null || (_table$getState$colum = _table$getState$colum.find((d) => d.id === column.id)) == null ? void 0 : _table$getState$colum.value;
      };
      column.getFilterIndex = () => {
        var _table$getState$colum2, _table$getState$colum3;
        return (_table$getState$colum2 = (_table$getState$colum3 = table2.getState().columnFilters) == null ? void 0 : _table$getState$colum3.findIndex((d) => d.id === column.id)) != null ? _table$getState$colum2 : -1;
      };
      column.setFilterValue = (value) => {
        table2.setColumnFilters((old) => {
          const filterFn = column.getFilterFn();
          const previousFilter = old == null ? void 0 : old.find((d) => d.id === column.id);
          const newFilter = functionalUpdate(value, previousFilter ? previousFilter.value : void 0);
          if (shouldAutoRemoveFilter(filterFn, newFilter, column)) {
            var _old$filter;
            return (_old$filter = old == null ? void 0 : old.filter((d) => d.id !== column.id)) != null ? _old$filter : [];
          }
          const newFilterObj = {
            id: column.id,
            value: newFilter
          };
          if (previousFilter) {
            var _old$map;
            return (_old$map = old == null ? void 0 : old.map((d) => {
              if (d.id === column.id) {
                return newFilterObj;
              }
              return d;
            })) != null ? _old$map : [];
          }
          if (old != null && old.length) {
            return [...old, newFilterObj];
          }
          return [newFilterObj];
        });
      };
    },
    createRow: (row, _table) => {
      row.columnFilters = {};
      row.columnFiltersMeta = {};
    },
    createTable: (table2) => {
      table2.setColumnFilters = (updater) => {
        const leafColumns = table2.getAllLeafColumns();
        const updateFn = (old) => {
          var _functionalUpdate;
          return (_functionalUpdate = functionalUpdate(updater, old)) == null ? void 0 : _functionalUpdate.filter((filter) => {
            const column = leafColumns.find((d) => d.id === filter.id);
            if (column) {
              const filterFn = column.getFilterFn();
              if (shouldAutoRemoveFilter(filterFn, filter.value, column)) {
                return false;
              }
            }
            return true;
          });
        };
        table2.options.onColumnFiltersChange == null || table2.options.onColumnFiltersChange(updateFn);
      };
      table2.resetColumnFilters = (defaultState) => {
        var _table$initialState$c, _table$initialState;
        table2.setColumnFilters(defaultState ? [] : (_table$initialState$c = (_table$initialState = table2.initialState) == null ? void 0 : _table$initialState.columnFilters) != null ? _table$initialState$c : []);
      };
      table2.getPreFilteredRowModel = () => table2.getCoreRowModel();
      table2.getFilteredRowModel = () => {
        if (!table2._getFilteredRowModel && table2.options.getFilteredRowModel) {
          table2._getFilteredRowModel = table2.options.getFilteredRowModel(table2);
        }
        if (table2.options.manualFiltering || !table2._getFilteredRowModel) {
          return table2.getPreFilteredRowModel();
        }
        return table2._getFilteredRowModel();
      };
    }
  };
  function shouldAutoRemoveFilter(filterFn, value, column) {
    return (filterFn && filterFn.autoRemove ? filterFn.autoRemove(value, column) : false) || typeof value === "undefined" || typeof value === "string" && !value;
  }
  var sum = (columnId, _leafRows, childRows) => {
    return childRows.reduce((sum2, next) => {
      const nextValue = next.getValue(columnId);
      return sum2 + (typeof nextValue === "number" ? nextValue : 0);
    }, 0);
  };
  var min = (columnId, _leafRows, childRows) => {
    let min2;
    childRows.forEach((row) => {
      const value = row.getValue(columnId);
      if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    });
    return min2;
  };
  var max = (columnId, _leafRows, childRows) => {
    let max2;
    childRows.forEach((row) => {
      const value = row.getValue(columnId);
      if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    });
    return max2;
  };
  var extent = (columnId, _leafRows, childRows) => {
    let min2;
    let max2;
    childRows.forEach((row) => {
      const value = row.getValue(columnId);
      if (value != null) {
        if (min2 === void 0) {
          if (value >= value) min2 = max2 = value;
        } else {
          if (min2 > value) min2 = value;
          if (max2 < value) max2 = value;
        }
      }
    });
    return [min2, max2];
  };
  var mean = (columnId, leafRows) => {
    let count2 = 0;
    let sum2 = 0;
    leafRows.forEach((row) => {
      let value = row.getValue(columnId);
      if (value != null && (value = +value) >= value) {
        ++count2, sum2 += value;
      }
    });
    if (count2) return sum2 / count2;
    return;
  };
  var median = (columnId, leafRows) => {
    if (!leafRows.length) {
      return;
    }
    const values = leafRows.map((row) => row.getValue(columnId));
    if (!isNumberArray(values)) {
      return;
    }
    if (values.length === 1) {
      return values[0];
    }
    const mid = Math.floor(values.length / 2);
    const nums = values.sort((a2, b) => a2 - b);
    return values.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  };
  var unique = (columnId, leafRows) => {
    return Array.from(new Set(leafRows.map((d) => d.getValue(columnId))).values());
  };
  var uniqueCount = (columnId, leafRows) => {
    return new Set(leafRows.map((d) => d.getValue(columnId))).size;
  };
  var count = (_columnId, leafRows) => {
    return leafRows.length;
  };
  var aggregationFns = {
    sum,
    min,
    max,
    extent,
    mean,
    median,
    unique,
    uniqueCount,
    count
  };
  var ColumnGrouping = {
    getDefaultColumnDef: () => {
      return {
        aggregatedCell: (props) => {
          var _toString, _props$getValue;
          return (_toString = (_props$getValue = props.getValue()) == null || _props$getValue.toString == null ? void 0 : _props$getValue.toString()) != null ? _toString : null;
        },
        aggregationFn: "auto"
      };
    },
    getInitialState: (state) => {
      return {
        grouping: [],
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onGroupingChange: makeStateUpdater("grouping", table2),
        groupedColumnMode: "reorder"
      };
    },
    createColumn: (column, table2) => {
      column.toggleGrouping = () => {
        table2.setGrouping((old) => {
          if (old != null && old.includes(column.id)) {
            return old.filter((d) => d !== column.id);
          }
          return [...old != null ? old : [], column.id];
        });
      };
      column.getCanGroup = () => {
        var _column$columnDef$ena, _table$options$enable;
        return ((_column$columnDef$ena = column.columnDef.enableGrouping) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table2.options.enableGrouping) != null ? _table$options$enable : true) && (!!column.accessorFn || !!column.columnDef.getGroupingValue);
      };
      column.getIsGrouped = () => {
        var _table$getState$group;
        return (_table$getState$group = table2.getState().grouping) == null ? void 0 : _table$getState$group.includes(column.id);
      };
      column.getGroupedIndex = () => {
        var _table$getState$group2;
        return (_table$getState$group2 = table2.getState().grouping) == null ? void 0 : _table$getState$group2.indexOf(column.id);
      };
      column.getToggleGroupingHandler = () => {
        const canGroup = column.getCanGroup();
        return () => {
          if (!canGroup) return;
          column.toggleGrouping();
        };
      };
      column.getAutoAggregationFn = () => {
        const firstRow = table2.getCoreRowModel().flatRows[0];
        const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
        if (typeof value === "number") {
          return aggregationFns.sum;
        }
        if (Object.prototype.toString.call(value) === "[object Date]") {
          return aggregationFns.extent;
        }
      };
      column.getAggregationFn = () => {
        var _table$options$aggreg, _table$options$aggreg2;
        if (!column) {
          throw new Error();
        }
        return isFunction(column.columnDef.aggregationFn) ? column.columnDef.aggregationFn : column.columnDef.aggregationFn === "auto" ? column.getAutoAggregationFn() : (_table$options$aggreg = (_table$options$aggreg2 = table2.options.aggregationFns) == null ? void 0 : _table$options$aggreg2[column.columnDef.aggregationFn]) != null ? _table$options$aggreg : aggregationFns[column.columnDef.aggregationFn];
      };
    },
    createTable: (table2) => {
      table2.setGrouping = (updater) => table2.options.onGroupingChange == null ? void 0 : table2.options.onGroupingChange(updater);
      table2.resetGrouping = (defaultState) => {
        var _table$initialState$g, _table$initialState;
        table2.setGrouping(defaultState ? [] : (_table$initialState$g = (_table$initialState = table2.initialState) == null ? void 0 : _table$initialState.grouping) != null ? _table$initialState$g : []);
      };
      table2.getPreGroupedRowModel = () => table2.getFilteredRowModel();
      table2.getGroupedRowModel = () => {
        if (!table2._getGroupedRowModel && table2.options.getGroupedRowModel) {
          table2._getGroupedRowModel = table2.options.getGroupedRowModel(table2);
        }
        if (table2.options.manualGrouping || !table2._getGroupedRowModel) {
          return table2.getPreGroupedRowModel();
        }
        return table2._getGroupedRowModel();
      };
    },
    createRow: (row, table2) => {
      row.getIsGrouped = () => !!row.groupingColumnId;
      row.getGroupingValue = (columnId) => {
        if (row._groupingValuesCache.hasOwnProperty(columnId)) {
          return row._groupingValuesCache[columnId];
        }
        const column = table2.getColumn(columnId);
        if (!(column != null && column.columnDef.getGroupingValue)) {
          return row.getValue(columnId);
        }
        row._groupingValuesCache[columnId] = column.columnDef.getGroupingValue(row.original);
        return row._groupingValuesCache[columnId];
      };
      row._groupingValuesCache = {};
    },
    createCell: (cell, column, row, table2) => {
      cell.getIsGrouped = () => column.getIsGrouped() && column.id === row.groupingColumnId;
      cell.getIsPlaceholder = () => !cell.getIsGrouped() && column.getIsGrouped();
      cell.getIsAggregated = () => {
        var _row$subRows;
        return !cell.getIsGrouped() && !cell.getIsPlaceholder() && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
      };
    }
  };
  function orderColumns(leafColumns, grouping, groupedColumnMode) {
    if (!(grouping != null && grouping.length) || !groupedColumnMode) {
      return leafColumns;
    }
    const nonGroupingColumns = leafColumns.filter((col) => !grouping.includes(col.id));
    if (groupedColumnMode === "remove") {
      return nonGroupingColumns;
    }
    const groupingColumns = grouping.map((g) => leafColumns.find((col) => col.id === g)).filter(Boolean);
    return [...groupingColumns, ...nonGroupingColumns];
  }
  var ColumnOrdering = {
    getInitialState: (state) => {
      return {
        columnOrder: [],
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onColumnOrderChange: makeStateUpdater("columnOrder", table2)
      };
    },
    createColumn: (column, table2) => {
      column.getIndex = memo2((position) => [_getVisibleLeafColumns(table2, position)], (columns2) => columns2.findIndex((d) => d.id === column.id), getMemoOptions(table2.options, "debugColumns", "getIndex"));
      column.getIsFirstColumn = (position) => {
        var _columns$;
        const columns2 = _getVisibleLeafColumns(table2, position);
        return ((_columns$ = columns2[0]) == null ? void 0 : _columns$.id) === column.id;
      };
      column.getIsLastColumn = (position) => {
        var _columns;
        const columns2 = _getVisibleLeafColumns(table2, position);
        return ((_columns = columns2[columns2.length - 1]) == null ? void 0 : _columns.id) === column.id;
      };
    },
    createTable: (table2) => {
      table2.setColumnOrder = (updater) => table2.options.onColumnOrderChange == null ? void 0 : table2.options.onColumnOrderChange(updater);
      table2.resetColumnOrder = (defaultState) => {
        var _table$initialState$c;
        table2.setColumnOrder(defaultState ? [] : (_table$initialState$c = table2.initialState.columnOrder) != null ? _table$initialState$c : []);
      };
      table2._getOrderColumnsFn = memo2(() => [table2.getState().columnOrder, table2.getState().grouping, table2.options.groupedColumnMode], (columnOrder, grouping, groupedColumnMode) => (columns2) => {
        let orderedColumns = [];
        if (!(columnOrder != null && columnOrder.length)) {
          orderedColumns = columns2;
        } else {
          const columnOrderCopy = [...columnOrder];
          const columnsCopy = [...columns2];
          while (columnsCopy.length && columnOrderCopy.length) {
            const targetColumnId = columnOrderCopy.shift();
            const foundIndex = columnsCopy.findIndex((d) => d.id === targetColumnId);
            if (foundIndex > -1) {
              orderedColumns.push(columnsCopy.splice(foundIndex, 1)[0]);
            }
          }
          orderedColumns = [...orderedColumns, ...columnsCopy];
        }
        return orderColumns(orderedColumns, grouping, groupedColumnMode);
      }, getMemoOptions(table2.options, "debugTable", "_getOrderColumnsFn"));
    }
  };
  var getDefaultColumnPinningState = () => ({
    left: [],
    right: []
  });
  var ColumnPinning = {
    getInitialState: (state) => {
      return {
        columnPinning: getDefaultColumnPinningState(),
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onColumnPinningChange: makeStateUpdater("columnPinning", table2)
      };
    },
    createColumn: (column, table2) => {
      column.pin = (position) => {
        const columnIds = column.getLeafColumns().map((d) => d.id).filter(Boolean);
        table2.setColumnPinning((old) => {
          var _old$left3, _old$right3;
          if (position === "right") {
            var _old$left, _old$right;
            return {
              left: ((_old$left = old == null ? void 0 : old.left) != null ? _old$left : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
              right: [...((_old$right = old == null ? void 0 : old.right) != null ? _old$right : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds]
            };
          }
          if (position === "left") {
            var _old$left2, _old$right2;
            return {
              left: [...((_old$left2 = old == null ? void 0 : old.left) != null ? _old$left2 : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds],
              right: ((_old$right2 = old == null ? void 0 : old.right) != null ? _old$right2 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
            };
          }
          return {
            left: ((_old$left3 = old == null ? void 0 : old.left) != null ? _old$left3 : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
            right: ((_old$right3 = old == null ? void 0 : old.right) != null ? _old$right3 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
          };
        });
      };
      column.getCanPin = () => {
        const leafColumns = column.getLeafColumns();
        return leafColumns.some((d) => {
          var _d$columnDef$enablePi, _ref, _table$options$enable;
          return ((_d$columnDef$enablePi = d.columnDef.enablePinning) != null ? _d$columnDef$enablePi : true) && ((_ref = (_table$options$enable = table2.options.enableColumnPinning) != null ? _table$options$enable : table2.options.enablePinning) != null ? _ref : true);
        });
      };
      column.getIsPinned = () => {
        const leafColumnIds = column.getLeafColumns().map((d) => d.id);
        const {
          left,
          right
        } = table2.getState().columnPinning;
        const isLeft = leafColumnIds.some((d) => left == null ? void 0 : left.includes(d));
        const isRight = leafColumnIds.some((d) => right == null ? void 0 : right.includes(d));
        return isLeft ? "left" : isRight ? "right" : false;
      };
      column.getPinnedIndex = () => {
        var _table$getState$colum, _table$getState$colum2;
        const position = column.getIsPinned();
        return position ? (_table$getState$colum = (_table$getState$colum2 = table2.getState().columnPinning) == null || (_table$getState$colum2 = _table$getState$colum2[position]) == null ? void 0 : _table$getState$colum2.indexOf(column.id)) != null ? _table$getState$colum : -1 : 0;
      };
    },
    createRow: (row, table2) => {
      row.getCenterVisibleCells = memo2(() => [row._getAllVisibleCells(), table2.getState().columnPinning.left, table2.getState().columnPinning.right], (allCells, left, right) => {
        const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
        return allCells.filter((d) => !leftAndRight.includes(d.column.id));
      }, getMemoOptions(table2.options, "debugRows", "getCenterVisibleCells"));
      row.getLeftVisibleCells = memo2(() => [row._getAllVisibleCells(), table2.getState().columnPinning.left], (allCells, left) => {
        const cells = (left != null ? left : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => ({
          ...d,
          position: "left"
        }));
        return cells;
      }, getMemoOptions(table2.options, "debugRows", "getLeftVisibleCells"));
      row.getRightVisibleCells = memo2(() => [row._getAllVisibleCells(), table2.getState().columnPinning.right], (allCells, right) => {
        const cells = (right != null ? right : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => ({
          ...d,
          position: "right"
        }));
        return cells;
      }, getMemoOptions(table2.options, "debugRows", "getRightVisibleCells"));
    },
    createTable: (table2) => {
      table2.setColumnPinning = (updater) => table2.options.onColumnPinningChange == null ? void 0 : table2.options.onColumnPinningChange(updater);
      table2.resetColumnPinning = (defaultState) => {
        var _table$initialState$c, _table$initialState;
        return table2.setColumnPinning(defaultState ? getDefaultColumnPinningState() : (_table$initialState$c = (_table$initialState = table2.initialState) == null ? void 0 : _table$initialState.columnPinning) != null ? _table$initialState$c : getDefaultColumnPinningState());
      };
      table2.getIsSomeColumnsPinned = (position) => {
        var _pinningState$positio;
        const pinningState = table2.getState().columnPinning;
        if (!position) {
          var _pinningState$left, _pinningState$right;
          return Boolean(((_pinningState$left = pinningState.left) == null ? void 0 : _pinningState$left.length) || ((_pinningState$right = pinningState.right) == null ? void 0 : _pinningState$right.length));
        }
        return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
      };
      table2.getLeftLeafColumns = memo2(() => [table2.getAllLeafColumns(), table2.getState().columnPinning.left], (allColumns, left) => {
        return (left != null ? left : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
      }, getMemoOptions(table2.options, "debugColumns", "getLeftLeafColumns"));
      table2.getRightLeafColumns = memo2(() => [table2.getAllLeafColumns(), table2.getState().columnPinning.right], (allColumns, right) => {
        return (right != null ? right : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
      }, getMemoOptions(table2.options, "debugColumns", "getRightLeafColumns"));
      table2.getCenterLeafColumns = memo2(() => [table2.getAllLeafColumns(), table2.getState().columnPinning.left, table2.getState().columnPinning.right], (allColumns, left, right) => {
        const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
        return allColumns.filter((d) => !leftAndRight.includes(d.id));
      }, getMemoOptions(table2.options, "debugColumns", "getCenterLeafColumns"));
    }
  };
  var defaultColumnSizing = {
    size: 150,
    minSize: 20,
    maxSize: Number.MAX_SAFE_INTEGER
  };
  var getDefaultColumnSizingInfoState = () => ({
    startOffset: null,
    startSize: null,
    deltaOffset: null,
    deltaPercentage: null,
    isResizingColumn: false,
    columnSizingStart: []
  });
  var ColumnSizing = {
    getDefaultColumnDef: () => {
      return defaultColumnSizing;
    },
    getInitialState: (state) => {
      return {
        columnSizing: {},
        columnSizingInfo: getDefaultColumnSizingInfoState(),
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        columnResizeMode: "onEnd",
        columnResizeDirection: "ltr",
        onColumnSizingChange: makeStateUpdater("columnSizing", table2),
        onColumnSizingInfoChange: makeStateUpdater("columnSizingInfo", table2)
      };
    },
    createColumn: (column, table2) => {
      column.getSize = () => {
        var _column$columnDef$min, _ref, _column$columnDef$max;
        const columnSize = table2.getState().columnSizing[column.id];
        return Math.min(Math.max((_column$columnDef$min = column.columnDef.minSize) != null ? _column$columnDef$min : defaultColumnSizing.minSize, (_ref = columnSize != null ? columnSize : column.columnDef.size) != null ? _ref : defaultColumnSizing.size), (_column$columnDef$max = column.columnDef.maxSize) != null ? _column$columnDef$max : defaultColumnSizing.maxSize);
      };
      column.getStart = memo2((position) => [position, _getVisibleLeafColumns(table2, position), table2.getState().columnSizing], (position, columns2) => columns2.slice(0, column.getIndex(position)).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table2.options, "debugColumns", "getStart"));
      column.getAfter = memo2((position) => [position, _getVisibleLeafColumns(table2, position), table2.getState().columnSizing], (position, columns2) => columns2.slice(column.getIndex(position) + 1).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table2.options, "debugColumns", "getAfter"));
      column.resetSize = () => {
        table2.setColumnSizing((_ref2) => {
          let {
            [column.id]: _,
            ...rest
          } = _ref2;
          return rest;
        });
      };
      column.getCanResize = () => {
        var _column$columnDef$ena, _table$options$enable;
        return ((_column$columnDef$ena = column.columnDef.enableResizing) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table2.options.enableColumnResizing) != null ? _table$options$enable : true);
      };
      column.getIsResizing = () => {
        return table2.getState().columnSizingInfo.isResizingColumn === column.id;
      };
    },
    createHeader: (header2, table2) => {
      header2.getSize = () => {
        let sum2 = 0;
        const recurse = (header3) => {
          if (header3.subHeaders.length) {
            header3.subHeaders.forEach(recurse);
          } else {
            var _header$column$getSiz;
            sum2 += (_header$column$getSiz = header3.column.getSize()) != null ? _header$column$getSiz : 0;
          }
        };
        recurse(header2);
        return sum2;
      };
      header2.getStart = () => {
        if (header2.index > 0) {
          const prevSiblingHeader = header2.headerGroup.headers[header2.index - 1];
          return prevSiblingHeader.getStart() + prevSiblingHeader.getSize();
        }
        return 0;
      };
      header2.getResizeHandler = (_contextDocument) => {
        const column = table2.getColumn(header2.column.id);
        const canResize = column == null ? void 0 : column.getCanResize();
        return (e) => {
          if (!column || !canResize) {
            return;
          }
          e.persist == null || e.persist();
          if (isTouchStartEvent(e)) {
            if (e.touches && e.touches.length > 1) {
              return;
            }
          }
          const startSize = header2.getSize();
          const columnSizingStart = header2 ? header2.getLeafHeaders().map((d) => [d.column.id, d.column.getSize()]) : [[column.id, column.getSize()]];
          const clientX = isTouchStartEvent(e) ? Math.round(e.touches[0].clientX) : e.clientX;
          const newColumnSizing = {};
          const updateOffset = (eventType, clientXPos) => {
            if (typeof clientXPos !== "number") {
              return;
            }
            table2.setColumnSizingInfo((old) => {
              var _old$startOffset, _old$startSize;
              const deltaDirection = table2.options.columnResizeDirection === "rtl" ? -1 : 1;
              const deltaOffset = (clientXPos - ((_old$startOffset = old == null ? void 0 : old.startOffset) != null ? _old$startOffset : 0)) * deltaDirection;
              const deltaPercentage = Math.max(deltaOffset / ((_old$startSize = old == null ? void 0 : old.startSize) != null ? _old$startSize : 0), -0.999999);
              old.columnSizingStart.forEach((_ref3) => {
                let [columnId, headerSize] = _ref3;
                newColumnSizing[columnId] = Math.round(Math.max(headerSize + headerSize * deltaPercentage, 0) * 100) / 100;
              });
              return {
                ...old,
                deltaOffset,
                deltaPercentage
              };
            });
            if (table2.options.columnResizeMode === "onChange" || eventType === "end") {
              table2.setColumnSizing((old) => ({
                ...old,
                ...newColumnSizing
              }));
            }
          };
          const onMove = (clientXPos) => updateOffset("move", clientXPos);
          const onEnd = (clientXPos) => {
            updateOffset("end", clientXPos);
            table2.setColumnSizingInfo((old) => ({
              ...old,
              isResizingColumn: false,
              startOffset: null,
              startSize: null,
              deltaOffset: null,
              deltaPercentage: null,
              columnSizingStart: []
            }));
          };
          const contextDocument = _contextDocument || typeof document !== "undefined" ? document : null;
          const mouseEvents = {
            moveHandler: (e2) => onMove(e2.clientX),
            upHandler: (e2) => {
              contextDocument == null || contextDocument.removeEventListener("mousemove", mouseEvents.moveHandler);
              contextDocument == null || contextDocument.removeEventListener("mouseup", mouseEvents.upHandler);
              onEnd(e2.clientX);
            }
          };
          const touchEvents = {
            moveHandler: (e2) => {
              if (e2.cancelable) {
                e2.preventDefault();
                e2.stopPropagation();
              }
              onMove(e2.touches[0].clientX);
              return false;
            },
            upHandler: (e2) => {
              var _e$touches$;
              contextDocument == null || contextDocument.removeEventListener("touchmove", touchEvents.moveHandler);
              contextDocument == null || contextDocument.removeEventListener("touchend", touchEvents.upHandler);
              if (e2.cancelable) {
                e2.preventDefault();
                e2.stopPropagation();
              }
              onEnd((_e$touches$ = e2.touches[0]) == null ? void 0 : _e$touches$.clientX);
            }
          };
          const passiveIfSupported = passiveEventSupported() ? {
            passive: false
          } : false;
          if (isTouchStartEvent(e)) {
            contextDocument == null || contextDocument.addEventListener("touchmove", touchEvents.moveHandler, passiveIfSupported);
            contextDocument == null || contextDocument.addEventListener("touchend", touchEvents.upHandler, passiveIfSupported);
          } else {
            contextDocument == null || contextDocument.addEventListener("mousemove", mouseEvents.moveHandler, passiveIfSupported);
            contextDocument == null || contextDocument.addEventListener("mouseup", mouseEvents.upHandler, passiveIfSupported);
          }
          table2.setColumnSizingInfo((old) => ({
            ...old,
            startOffset: clientX,
            startSize,
            deltaOffset: 0,
            deltaPercentage: 0,
            columnSizingStart,
            isResizingColumn: column.id
          }));
        };
      };
    },
    createTable: (table2) => {
      table2.setColumnSizing = (updater) => table2.options.onColumnSizingChange == null ? void 0 : table2.options.onColumnSizingChange(updater);
      table2.setColumnSizingInfo = (updater) => table2.options.onColumnSizingInfoChange == null ? void 0 : table2.options.onColumnSizingInfoChange(updater);
      table2.resetColumnSizing = (defaultState) => {
        var _table$initialState$c;
        table2.setColumnSizing(defaultState ? {} : (_table$initialState$c = table2.initialState.columnSizing) != null ? _table$initialState$c : {});
      };
      table2.resetHeaderSizeInfo = (defaultState) => {
        var _table$initialState$c2;
        table2.setColumnSizingInfo(defaultState ? getDefaultColumnSizingInfoState() : (_table$initialState$c2 = table2.initialState.columnSizingInfo) != null ? _table$initialState$c2 : getDefaultColumnSizingInfoState());
      };
      table2.getTotalSize = () => {
        var _table$getHeaderGroup, _table$getHeaderGroup2;
        return (_table$getHeaderGroup = (_table$getHeaderGroup2 = table2.getHeaderGroups()[0]) == null ? void 0 : _table$getHeaderGroup2.headers.reduce((sum2, header2) => {
          return sum2 + header2.getSize();
        }, 0)) != null ? _table$getHeaderGroup : 0;
      };
      table2.getLeftTotalSize = () => {
        var _table$getLeftHeaderG, _table$getLeftHeaderG2;
        return (_table$getLeftHeaderG = (_table$getLeftHeaderG2 = table2.getLeftHeaderGroups()[0]) == null ? void 0 : _table$getLeftHeaderG2.headers.reduce((sum2, header2) => {
          return sum2 + header2.getSize();
        }, 0)) != null ? _table$getLeftHeaderG : 0;
      };
      table2.getCenterTotalSize = () => {
        var _table$getCenterHeade, _table$getCenterHeade2;
        return (_table$getCenterHeade = (_table$getCenterHeade2 = table2.getCenterHeaderGroups()[0]) == null ? void 0 : _table$getCenterHeade2.headers.reduce((sum2, header2) => {
          return sum2 + header2.getSize();
        }, 0)) != null ? _table$getCenterHeade : 0;
      };
      table2.getRightTotalSize = () => {
        var _table$getRightHeader, _table$getRightHeader2;
        return (_table$getRightHeader = (_table$getRightHeader2 = table2.getRightHeaderGroups()[0]) == null ? void 0 : _table$getRightHeader2.headers.reduce((sum2, header2) => {
          return sum2 + header2.getSize();
        }, 0)) != null ? _table$getRightHeader : 0;
      };
    }
  };
  var passiveSupported = null;
  function passiveEventSupported() {
    if (typeof passiveSupported === "boolean") return passiveSupported;
    let supported = false;
    try {
      const options = {
        get passive() {
          supported = true;
          return false;
        }
      };
      const noop = () => {
      };
      window.addEventListener("test", noop, options);
      window.removeEventListener("test", noop);
    } catch (err) {
      supported = false;
    }
    passiveSupported = supported;
    return passiveSupported;
  }
  function isTouchStartEvent(e) {
    return e.type === "touchstart";
  }
  var ColumnVisibility = {
    getInitialState: (state) => {
      return {
        columnVisibility: {},
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onColumnVisibilityChange: makeStateUpdater("columnVisibility", table2)
      };
    },
    createColumn: (column, table2) => {
      column.toggleVisibility = (value) => {
        if (column.getCanHide()) {
          table2.setColumnVisibility((old) => ({
            ...old,
            [column.id]: value != null ? value : !column.getIsVisible()
          }));
        }
      };
      column.getIsVisible = () => {
        var _ref, _table$getState$colum;
        const childColumns = column.columns;
        return (_ref = childColumns.length ? childColumns.some((c) => c.getIsVisible()) : (_table$getState$colum = table2.getState().columnVisibility) == null ? void 0 : _table$getState$colum[column.id]) != null ? _ref : true;
      };
      column.getCanHide = () => {
        var _column$columnDef$ena, _table$options$enable;
        return ((_column$columnDef$ena = column.columnDef.enableHiding) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table2.options.enableHiding) != null ? _table$options$enable : true);
      };
      column.getToggleVisibilityHandler = () => {
        return (e) => {
          column.toggleVisibility == null || column.toggleVisibility(e.target.checked);
        };
      };
    },
    createRow: (row, table2) => {
      row._getAllVisibleCells = memo2(() => [row.getAllCells(), table2.getState().columnVisibility], (cells) => {
        return cells.filter((cell) => cell.column.getIsVisible());
      }, getMemoOptions(table2.options, "debugRows", "_getAllVisibleCells"));
      row.getVisibleCells = memo2(() => [row.getLeftVisibleCells(), row.getCenterVisibleCells(), row.getRightVisibleCells()], (left, center, right) => [...left, ...center, ...right], getMemoOptions(table2.options, "debugRows", "getVisibleCells"));
    },
    createTable: (table2) => {
      const makeVisibleColumnsMethod = (key, getColumns) => {
        return memo2(() => [getColumns(), getColumns().filter((d) => d.getIsVisible()).map((d) => d.id).join("_")], (columns2) => {
          return columns2.filter((d) => d.getIsVisible == null ? void 0 : d.getIsVisible());
        }, getMemoOptions(table2.options, "debugColumns", key));
      };
      table2.getVisibleFlatColumns = makeVisibleColumnsMethod("getVisibleFlatColumns", () => table2.getAllFlatColumns());
      table2.getVisibleLeafColumns = makeVisibleColumnsMethod("getVisibleLeafColumns", () => table2.getAllLeafColumns());
      table2.getLeftVisibleLeafColumns = makeVisibleColumnsMethod("getLeftVisibleLeafColumns", () => table2.getLeftLeafColumns());
      table2.getRightVisibleLeafColumns = makeVisibleColumnsMethod("getRightVisibleLeafColumns", () => table2.getRightLeafColumns());
      table2.getCenterVisibleLeafColumns = makeVisibleColumnsMethod("getCenterVisibleLeafColumns", () => table2.getCenterLeafColumns());
      table2.setColumnVisibility = (updater) => table2.options.onColumnVisibilityChange == null ? void 0 : table2.options.onColumnVisibilityChange(updater);
      table2.resetColumnVisibility = (defaultState) => {
        var _table$initialState$c;
        table2.setColumnVisibility(defaultState ? {} : (_table$initialState$c = table2.initialState.columnVisibility) != null ? _table$initialState$c : {});
      };
      table2.toggleAllColumnsVisible = (value) => {
        var _value;
        value = (_value = value) != null ? _value : !table2.getIsAllColumnsVisible();
        table2.setColumnVisibility(table2.getAllLeafColumns().reduce((obj, column) => ({
          ...obj,
          [column.id]: !value ? !(column.getCanHide != null && column.getCanHide()) : value
        }), {}));
      };
      table2.getIsAllColumnsVisible = () => !table2.getAllLeafColumns().some((column) => !(column.getIsVisible != null && column.getIsVisible()));
      table2.getIsSomeColumnsVisible = () => table2.getAllLeafColumns().some((column) => column.getIsVisible == null ? void 0 : column.getIsVisible());
      table2.getToggleAllColumnsVisibilityHandler = () => {
        return (e) => {
          var _target;
          table2.toggleAllColumnsVisible((_target = e.target) == null ? void 0 : _target.checked);
        };
      };
    }
  };
  function _getVisibleLeafColumns(table2, position) {
    return !position ? table2.getVisibleLeafColumns() : position === "center" ? table2.getCenterVisibleLeafColumns() : position === "left" ? table2.getLeftVisibleLeafColumns() : table2.getRightVisibleLeafColumns();
  }
  var GlobalFaceting = {
    createTable: (table2) => {
      table2._getGlobalFacetedRowModel = table2.options.getFacetedRowModel && table2.options.getFacetedRowModel(table2, "__global__");
      table2.getGlobalFacetedRowModel = () => {
        if (table2.options.manualFiltering || !table2._getGlobalFacetedRowModel) {
          return table2.getPreFilteredRowModel();
        }
        return table2._getGlobalFacetedRowModel();
      };
      table2._getGlobalFacetedUniqueValues = table2.options.getFacetedUniqueValues && table2.options.getFacetedUniqueValues(table2, "__global__");
      table2.getGlobalFacetedUniqueValues = () => {
        if (!table2._getGlobalFacetedUniqueValues) {
          return /* @__PURE__ */ new Map();
        }
        return table2._getGlobalFacetedUniqueValues();
      };
      table2._getGlobalFacetedMinMaxValues = table2.options.getFacetedMinMaxValues && table2.options.getFacetedMinMaxValues(table2, "__global__");
      table2.getGlobalFacetedMinMaxValues = () => {
        if (!table2._getGlobalFacetedMinMaxValues) {
          return;
        }
        return table2._getGlobalFacetedMinMaxValues();
      };
    }
  };
  var GlobalFiltering = {
    getInitialState: (state) => {
      return {
        globalFilter: void 0,
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onGlobalFilterChange: makeStateUpdater("globalFilter", table2),
        globalFilterFn: "auto",
        getColumnCanGlobalFilter: (column) => {
          var _table$getCoreRowMode;
          const value = (_table$getCoreRowMode = table2.getCoreRowModel().flatRows[0]) == null || (_table$getCoreRowMode = _table$getCoreRowMode._getAllCellsByColumnId()[column.id]) == null ? void 0 : _table$getCoreRowMode.getValue();
          return typeof value === "string" || typeof value === "number";
        }
      };
    },
    createColumn: (column, table2) => {
      column.getCanGlobalFilter = () => {
        var _column$columnDef$ena, _table$options$enable, _table$options$enable2, _table$options$getCol;
        return ((_column$columnDef$ena = column.columnDef.enableGlobalFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table2.options.enableGlobalFilter) != null ? _table$options$enable : true) && ((_table$options$enable2 = table2.options.enableFilters) != null ? _table$options$enable2 : true) && ((_table$options$getCol = table2.options.getColumnCanGlobalFilter == null ? void 0 : table2.options.getColumnCanGlobalFilter(column)) != null ? _table$options$getCol : true) && !!column.accessorFn;
      };
    },
    createTable: (table2) => {
      table2.getGlobalAutoFilterFn = () => {
        return filterFns.includesString;
      };
      table2.getGlobalFilterFn = () => {
        var _table$options$filter, _table$options$filter2;
        const {
          globalFilterFn
        } = table2.options;
        return isFunction(globalFilterFn) ? globalFilterFn : globalFilterFn === "auto" ? table2.getGlobalAutoFilterFn() : (_table$options$filter = (_table$options$filter2 = table2.options.filterFns) == null ? void 0 : _table$options$filter2[globalFilterFn]) != null ? _table$options$filter : filterFns[globalFilterFn];
      };
      table2.setGlobalFilter = (updater) => {
        table2.options.onGlobalFilterChange == null || table2.options.onGlobalFilterChange(updater);
      };
      table2.resetGlobalFilter = (defaultState) => {
        table2.setGlobalFilter(defaultState ? void 0 : table2.initialState.globalFilter);
      };
    }
  };
  var RowExpanding = {
    getInitialState: (state) => {
      return {
        expanded: {},
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onExpandedChange: makeStateUpdater("expanded", table2),
        paginateExpandedRows: true
      };
    },
    createTable: (table2) => {
      let registered = false;
      let queued = false;
      table2._autoResetExpanded = () => {
        var _ref, _table$options$autoRe;
        if (!registered) {
          table2._queue(() => {
            registered = true;
          });
          return;
        }
        if ((_ref = (_table$options$autoRe = table2.options.autoResetAll) != null ? _table$options$autoRe : table2.options.autoResetExpanded) != null ? _ref : !table2.options.manualExpanding) {
          if (queued) return;
          queued = true;
          table2._queue(() => {
            table2.resetExpanded();
            queued = false;
          });
        }
      };
      table2.setExpanded = (updater) => table2.options.onExpandedChange == null ? void 0 : table2.options.onExpandedChange(updater);
      table2.toggleAllRowsExpanded = (expanded) => {
        if (expanded != null ? expanded : !table2.getIsAllRowsExpanded()) {
          table2.setExpanded(true);
        } else {
          table2.setExpanded({});
        }
      };
      table2.resetExpanded = (defaultState) => {
        var _table$initialState$e, _table$initialState;
        table2.setExpanded(defaultState ? {} : (_table$initialState$e = (_table$initialState = table2.initialState) == null ? void 0 : _table$initialState.expanded) != null ? _table$initialState$e : {});
      };
      table2.getCanSomeRowsExpand = () => {
        return table2.getPrePaginationRowModel().flatRows.some((row) => row.getCanExpand());
      };
      table2.getToggleAllRowsExpandedHandler = () => {
        return (e) => {
          e.persist == null || e.persist();
          table2.toggleAllRowsExpanded();
        };
      };
      table2.getIsSomeRowsExpanded = () => {
        const expanded = table2.getState().expanded;
        return expanded === true || Object.values(expanded).some(Boolean);
      };
      table2.getIsAllRowsExpanded = () => {
        const expanded = table2.getState().expanded;
        if (typeof expanded === "boolean") {
          return expanded === true;
        }
        if (!Object.keys(expanded).length) {
          return false;
        }
        if (table2.getRowModel().flatRows.some((row) => !row.getIsExpanded())) {
          return false;
        }
        return true;
      };
      table2.getExpandedDepth = () => {
        let maxDepth = 0;
        const rowIds = table2.getState().expanded === true ? Object.keys(table2.getRowModel().rowsById) : Object.keys(table2.getState().expanded);
        rowIds.forEach((id) => {
          const splitId = id.split(".");
          maxDepth = Math.max(maxDepth, splitId.length);
        });
        return maxDepth;
      };
      table2.getPreExpandedRowModel = () => table2.getSortedRowModel();
      table2.getExpandedRowModel = () => {
        if (!table2._getExpandedRowModel && table2.options.getExpandedRowModel) {
          table2._getExpandedRowModel = table2.options.getExpandedRowModel(table2);
        }
        if (table2.options.manualExpanding || !table2._getExpandedRowModel) {
          return table2.getPreExpandedRowModel();
        }
        return table2._getExpandedRowModel();
      };
    },
    createRow: (row, table2) => {
      row.toggleExpanded = (expanded) => {
        table2.setExpanded((old) => {
          var _expanded;
          const exists = old === true ? true : !!(old != null && old[row.id]);
          let oldExpanded = {};
          if (old === true) {
            Object.keys(table2.getRowModel().rowsById).forEach((rowId) => {
              oldExpanded[rowId] = true;
            });
          } else {
            oldExpanded = old;
          }
          expanded = (_expanded = expanded) != null ? _expanded : !exists;
          if (!exists && expanded) {
            return {
              ...oldExpanded,
              [row.id]: true
            };
          }
          if (exists && !expanded) {
            const {
              [row.id]: _,
              ...rest
            } = oldExpanded;
            return rest;
          }
          return old;
        });
      };
      row.getIsExpanded = () => {
        var _table$options$getIsR;
        const expanded = table2.getState().expanded;
        return !!((_table$options$getIsR = table2.options.getIsRowExpanded == null ? void 0 : table2.options.getIsRowExpanded(row)) != null ? _table$options$getIsR : expanded === true || (expanded == null ? void 0 : expanded[row.id]));
      };
      row.getCanExpand = () => {
        var _table$options$getRow, _table$options$enable, _row$subRows;
        return (_table$options$getRow = table2.options.getRowCanExpand == null ? void 0 : table2.options.getRowCanExpand(row)) != null ? _table$options$getRow : ((_table$options$enable = table2.options.enableExpanding) != null ? _table$options$enable : true) && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
      };
      row.getIsAllParentsExpanded = () => {
        let isFullyExpanded = true;
        let currentRow = row;
        while (isFullyExpanded && currentRow.parentId) {
          currentRow = table2.getRow(currentRow.parentId, true);
          isFullyExpanded = currentRow.getIsExpanded();
        }
        return isFullyExpanded;
      };
      row.getToggleExpandedHandler = () => {
        const canExpand = row.getCanExpand();
        return () => {
          if (!canExpand) return;
          row.toggleExpanded();
        };
      };
    }
  };
  var defaultPageIndex = 0;
  var defaultPageSize = 10;
  var getDefaultPaginationState = () => ({
    pageIndex: defaultPageIndex,
    pageSize: defaultPageSize
  });
  var RowPagination = {
    getInitialState: (state) => {
      return {
        ...state,
        pagination: {
          ...getDefaultPaginationState(),
          ...state == null ? void 0 : state.pagination
        }
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onPaginationChange: makeStateUpdater("pagination", table2)
      };
    },
    createTable: (table2) => {
      let registered = false;
      let queued = false;
      table2._autoResetPageIndex = () => {
        var _ref, _table$options$autoRe;
        if (!registered) {
          table2._queue(() => {
            registered = true;
          });
          return;
        }
        if ((_ref = (_table$options$autoRe = table2.options.autoResetAll) != null ? _table$options$autoRe : table2.options.autoResetPageIndex) != null ? _ref : !table2.options.manualPagination) {
          if (queued) return;
          queued = true;
          table2._queue(() => {
            table2.resetPageIndex();
            queued = false;
          });
        }
      };
      table2.setPagination = (updater) => {
        const safeUpdater = (old) => {
          let newState = functionalUpdate(updater, old);
          return newState;
        };
        return table2.options.onPaginationChange == null ? void 0 : table2.options.onPaginationChange(safeUpdater);
      };
      table2.resetPagination = (defaultState) => {
        var _table$initialState$p;
        table2.setPagination(defaultState ? getDefaultPaginationState() : (_table$initialState$p = table2.initialState.pagination) != null ? _table$initialState$p : getDefaultPaginationState());
      };
      table2.setPageIndex = (updater) => {
        table2.setPagination((old) => {
          let pageIndex = functionalUpdate(updater, old.pageIndex);
          const maxPageIndex = typeof table2.options.pageCount === "undefined" || table2.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table2.options.pageCount - 1;
          pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
          return {
            ...old,
            pageIndex
          };
        });
      };
      table2.resetPageIndex = (defaultState) => {
        var _table$initialState$p2, _table$initialState;
        table2.setPageIndex(defaultState ? defaultPageIndex : (_table$initialState$p2 = (_table$initialState = table2.initialState) == null || (_table$initialState = _table$initialState.pagination) == null ? void 0 : _table$initialState.pageIndex) != null ? _table$initialState$p2 : defaultPageIndex);
      };
      table2.resetPageSize = (defaultState) => {
        var _table$initialState$p3, _table$initialState2;
        table2.setPageSize(defaultState ? defaultPageSize : (_table$initialState$p3 = (_table$initialState2 = table2.initialState) == null || (_table$initialState2 = _table$initialState2.pagination) == null ? void 0 : _table$initialState2.pageSize) != null ? _table$initialState$p3 : defaultPageSize);
      };
      table2.setPageSize = (updater) => {
        table2.setPagination((old) => {
          const pageSize = Math.max(1, functionalUpdate(updater, old.pageSize));
          const topRowIndex = old.pageSize * old.pageIndex;
          const pageIndex = Math.floor(topRowIndex / pageSize);
          return {
            ...old,
            pageIndex,
            pageSize
          };
        });
      };
      table2.setPageCount = (updater) => table2.setPagination((old) => {
        var _table$options$pageCo;
        let newPageCount = functionalUpdate(updater, (_table$options$pageCo = table2.options.pageCount) != null ? _table$options$pageCo : -1);
        if (typeof newPageCount === "number") {
          newPageCount = Math.max(-1, newPageCount);
        }
        return {
          ...old,
          pageCount: newPageCount
        };
      });
      table2.getPageOptions = memo2(() => [table2.getPageCount()], (pageCount) => {
        let pageOptions = [];
        if (pageCount && pageCount > 0) {
          pageOptions = [...new Array(pageCount)].fill(null).map((_, i) => i);
        }
        return pageOptions;
      }, getMemoOptions(table2.options, "debugTable", "getPageOptions"));
      table2.getCanPreviousPage = () => table2.getState().pagination.pageIndex > 0;
      table2.getCanNextPage = () => {
        const {
          pageIndex
        } = table2.getState().pagination;
        const pageCount = table2.getPageCount();
        if (pageCount === -1) {
          return true;
        }
        if (pageCount === 0) {
          return false;
        }
        return pageIndex < pageCount - 1;
      };
      table2.previousPage = () => {
        return table2.setPageIndex((old) => old - 1);
      };
      table2.nextPage = () => {
        return table2.setPageIndex((old) => {
          return old + 1;
        });
      };
      table2.firstPage = () => {
        return table2.setPageIndex(0);
      };
      table2.lastPage = () => {
        return table2.setPageIndex(table2.getPageCount() - 1);
      };
      table2.getPrePaginationRowModel = () => table2.getExpandedRowModel();
      table2.getPaginationRowModel = () => {
        if (!table2._getPaginationRowModel && table2.options.getPaginationRowModel) {
          table2._getPaginationRowModel = table2.options.getPaginationRowModel(table2);
        }
        if (table2.options.manualPagination || !table2._getPaginationRowModel) {
          return table2.getPrePaginationRowModel();
        }
        return table2._getPaginationRowModel();
      };
      table2.getPageCount = () => {
        var _table$options$pageCo2;
        return (_table$options$pageCo2 = table2.options.pageCount) != null ? _table$options$pageCo2 : Math.ceil(table2.getRowCount() / table2.getState().pagination.pageSize);
      };
      table2.getRowCount = () => {
        var _table$options$rowCou;
        return (_table$options$rowCou = table2.options.rowCount) != null ? _table$options$rowCou : table2.getPrePaginationRowModel().rows.length;
      };
    }
  };
  var getDefaultRowPinningState = () => ({
    top: [],
    bottom: []
  });
  var RowPinning = {
    getInitialState: (state) => {
      return {
        rowPinning: getDefaultRowPinningState(),
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onRowPinningChange: makeStateUpdater("rowPinning", table2)
      };
    },
    createRow: (row, table2) => {
      row.pin = (position, includeLeafRows, includeParentRows) => {
        const leafRowIds = includeLeafRows ? row.getLeafRows().map((_ref) => {
          let {
            id
          } = _ref;
          return id;
        }) : [];
        const parentRowIds = includeParentRows ? row.getParentRows().map((_ref2) => {
          let {
            id
          } = _ref2;
          return id;
        }) : [];
        const rowIds = /* @__PURE__ */ new Set([...parentRowIds, row.id, ...leafRowIds]);
        table2.setRowPinning((old) => {
          var _old$top3, _old$bottom3;
          if (position === "bottom") {
            var _old$top, _old$bottom;
            return {
              top: ((_old$top = old == null ? void 0 : old.top) != null ? _old$top : []).filter((d) => !(rowIds != null && rowIds.has(d))),
              bottom: [...((_old$bottom = old == null ? void 0 : old.bottom) != null ? _old$bottom : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)]
            };
          }
          if (position === "top") {
            var _old$top2, _old$bottom2;
            return {
              top: [...((_old$top2 = old == null ? void 0 : old.top) != null ? _old$top2 : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)],
              bottom: ((_old$bottom2 = old == null ? void 0 : old.bottom) != null ? _old$bottom2 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
            };
          }
          return {
            top: ((_old$top3 = old == null ? void 0 : old.top) != null ? _old$top3 : []).filter((d) => !(rowIds != null && rowIds.has(d))),
            bottom: ((_old$bottom3 = old == null ? void 0 : old.bottom) != null ? _old$bottom3 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
          };
        });
      };
      row.getCanPin = () => {
        var _ref3;
        const {
          enableRowPinning,
          enablePinning
        } = table2.options;
        if (typeof enableRowPinning === "function") {
          return enableRowPinning(row);
        }
        return (_ref3 = enableRowPinning != null ? enableRowPinning : enablePinning) != null ? _ref3 : true;
      };
      row.getIsPinned = () => {
        const rowIds = [row.id];
        const {
          top,
          bottom
        } = table2.getState().rowPinning;
        const isTop = rowIds.some((d) => top == null ? void 0 : top.includes(d));
        const isBottom = rowIds.some((d) => bottom == null ? void 0 : bottom.includes(d));
        return isTop ? "top" : isBottom ? "bottom" : false;
      };
      row.getPinnedIndex = () => {
        var _ref4, _visiblePinnedRowIds$;
        const position = row.getIsPinned();
        if (!position) return -1;
        const visiblePinnedRowIds = (_ref4 = position === "top" ? table2.getTopRows() : table2.getBottomRows()) == null ? void 0 : _ref4.map((_ref5) => {
          let {
            id
          } = _ref5;
          return id;
        });
        return (_visiblePinnedRowIds$ = visiblePinnedRowIds == null ? void 0 : visiblePinnedRowIds.indexOf(row.id)) != null ? _visiblePinnedRowIds$ : -1;
      };
    },
    createTable: (table2) => {
      table2.setRowPinning = (updater) => table2.options.onRowPinningChange == null ? void 0 : table2.options.onRowPinningChange(updater);
      table2.resetRowPinning = (defaultState) => {
        var _table$initialState$r, _table$initialState;
        return table2.setRowPinning(defaultState ? getDefaultRowPinningState() : (_table$initialState$r = (_table$initialState = table2.initialState) == null ? void 0 : _table$initialState.rowPinning) != null ? _table$initialState$r : getDefaultRowPinningState());
      };
      table2.getIsSomeRowsPinned = (position) => {
        var _pinningState$positio;
        const pinningState = table2.getState().rowPinning;
        if (!position) {
          var _pinningState$top, _pinningState$bottom;
          return Boolean(((_pinningState$top = pinningState.top) == null ? void 0 : _pinningState$top.length) || ((_pinningState$bottom = pinningState.bottom) == null ? void 0 : _pinningState$bottom.length));
        }
        return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
      };
      table2._getPinnedRows = (visibleRows, pinnedRowIds, position) => {
        var _table$options$keepPi;
        const rows = ((_table$options$keepPi = table2.options.keepPinnedRows) != null ? _table$options$keepPi : true) ? (
          //get all rows that are pinned even if they would not be otherwise visible
          //account for expanded parent rows, but not pagination or filtering
          (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => {
            const row = table2.getRow(rowId, true);
            return row.getIsAllParentsExpanded() ? row : null;
          })
        ) : (
          //else get only visible rows that are pinned
          (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => visibleRows.find((row) => row.id === rowId))
        );
        return rows.filter(Boolean).map((d) => ({
          ...d,
          position
        }));
      };
      table2.getTopRows = memo2(() => [table2.getRowModel().rows, table2.getState().rowPinning.top], (allRows, topPinnedRowIds) => table2._getPinnedRows(allRows, topPinnedRowIds, "top"), getMemoOptions(table2.options, "debugRows", "getTopRows"));
      table2.getBottomRows = memo2(() => [table2.getRowModel().rows, table2.getState().rowPinning.bottom], (allRows, bottomPinnedRowIds) => table2._getPinnedRows(allRows, bottomPinnedRowIds, "bottom"), getMemoOptions(table2.options, "debugRows", "getBottomRows"));
      table2.getCenterRows = memo2(() => [table2.getRowModel().rows, table2.getState().rowPinning.top, table2.getState().rowPinning.bottom], (allRows, top, bottom) => {
        const topAndBottom = /* @__PURE__ */ new Set([...top != null ? top : [], ...bottom != null ? bottom : []]);
        return allRows.filter((d) => !topAndBottom.has(d.id));
      }, getMemoOptions(table2.options, "debugRows", "getCenterRows"));
    }
  };
  var RowSelection = {
    getInitialState: (state) => {
      return {
        rowSelection: {},
        ...state
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onRowSelectionChange: makeStateUpdater("rowSelection", table2),
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableSubRowSelection: true
        // enableGroupingRowSelection: false,
        // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
        // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
      };
    },
    createTable: (table2) => {
      table2.setRowSelection = (updater) => table2.options.onRowSelectionChange == null ? void 0 : table2.options.onRowSelectionChange(updater);
      table2.resetRowSelection = (defaultState) => {
        var _table$initialState$r;
        return table2.setRowSelection(defaultState ? {} : (_table$initialState$r = table2.initialState.rowSelection) != null ? _table$initialState$r : {});
      };
      table2.toggleAllRowsSelected = (value) => {
        table2.setRowSelection((old) => {
          value = typeof value !== "undefined" ? value : !table2.getIsAllRowsSelected();
          const rowSelection = {
            ...old
          };
          const preGroupedFlatRows = table2.getPreGroupedRowModel().flatRows;
          if (value) {
            preGroupedFlatRows.forEach((row) => {
              if (!row.getCanSelect()) {
                return;
              }
              rowSelection[row.id] = true;
            });
          } else {
            preGroupedFlatRows.forEach((row) => {
              delete rowSelection[row.id];
            });
          }
          return rowSelection;
        });
      };
      table2.toggleAllPageRowsSelected = (value) => table2.setRowSelection((old) => {
        const resolvedValue = typeof value !== "undefined" ? value : !table2.getIsAllPageRowsSelected();
        const rowSelection = {
          ...old
        };
        table2.getRowModel().rows.forEach((row) => {
          mutateRowIsSelected(rowSelection, row.id, resolvedValue, true, table2);
        });
        return rowSelection;
      });
      table2.getPreSelectedRowModel = () => table2.getCoreRowModel();
      table2.getSelectedRowModel = memo2(() => [table2.getState().rowSelection, table2.getCoreRowModel()], (rowSelection, rowModel) => {
        if (!Object.keys(rowSelection).length) {
          return {
            rows: [],
            flatRows: [],
            rowsById: {}
          };
        }
        return selectRowsFn(table2, rowModel);
      }, getMemoOptions(table2.options, "debugTable", "getSelectedRowModel"));
      table2.getFilteredSelectedRowModel = memo2(() => [table2.getState().rowSelection, table2.getFilteredRowModel()], (rowSelection, rowModel) => {
        if (!Object.keys(rowSelection).length) {
          return {
            rows: [],
            flatRows: [],
            rowsById: {}
          };
        }
        return selectRowsFn(table2, rowModel);
      }, getMemoOptions(table2.options, "debugTable", "getFilteredSelectedRowModel"));
      table2.getGroupedSelectedRowModel = memo2(() => [table2.getState().rowSelection, table2.getSortedRowModel()], (rowSelection, rowModel) => {
        if (!Object.keys(rowSelection).length) {
          return {
            rows: [],
            flatRows: [],
            rowsById: {}
          };
        }
        return selectRowsFn(table2, rowModel);
      }, getMemoOptions(table2.options, "debugTable", "getGroupedSelectedRowModel"));
      table2.getIsAllRowsSelected = () => {
        const preGroupedFlatRows = table2.getFilteredRowModel().flatRows;
        const {
          rowSelection
        } = table2.getState();
        let isAllRowsSelected = Boolean(preGroupedFlatRows.length && Object.keys(rowSelection).length);
        if (isAllRowsSelected) {
          if (preGroupedFlatRows.some((row) => row.getCanSelect() && !rowSelection[row.id])) {
            isAllRowsSelected = false;
          }
        }
        return isAllRowsSelected;
      };
      table2.getIsAllPageRowsSelected = () => {
        const paginationFlatRows = table2.getPaginationRowModel().flatRows.filter((row) => row.getCanSelect());
        const {
          rowSelection
        } = table2.getState();
        let isAllPageRowsSelected = !!paginationFlatRows.length;
        if (isAllPageRowsSelected && paginationFlatRows.some((row) => !rowSelection[row.id])) {
          isAllPageRowsSelected = false;
        }
        return isAllPageRowsSelected;
      };
      table2.getIsSomeRowsSelected = () => {
        var _table$getState$rowSe;
        const totalSelected = Object.keys((_table$getState$rowSe = table2.getState().rowSelection) != null ? _table$getState$rowSe : {}).length;
        return totalSelected > 0 && totalSelected < table2.getFilteredRowModel().flatRows.length;
      };
      table2.getIsSomePageRowsSelected = () => {
        const paginationFlatRows = table2.getPaginationRowModel().flatRows;
        return table2.getIsAllPageRowsSelected() ? false : paginationFlatRows.filter((row) => row.getCanSelect()).some((d) => d.getIsSelected() || d.getIsSomeSelected());
      };
      table2.getToggleAllRowsSelectedHandler = () => {
        return (e) => {
          table2.toggleAllRowsSelected(e.target.checked);
        };
      };
      table2.getToggleAllPageRowsSelectedHandler = () => {
        return (e) => {
          table2.toggleAllPageRowsSelected(e.target.checked);
        };
      };
    },
    createRow: (row, table2) => {
      row.toggleSelected = (value, opts) => {
        const isSelected = row.getIsSelected();
        table2.setRowSelection((old) => {
          var _opts$selectChildren;
          value = typeof value !== "undefined" ? value : !isSelected;
          if (row.getCanSelect() && isSelected === value) {
            return old;
          }
          const selectedRowIds = {
            ...old
          };
          mutateRowIsSelected(selectedRowIds, row.id, value, (_opts$selectChildren = opts == null ? void 0 : opts.selectChildren) != null ? _opts$selectChildren : true, table2);
          return selectedRowIds;
        });
      };
      row.getIsSelected = () => {
        const {
          rowSelection
        } = table2.getState();
        return isRowSelected(row, rowSelection);
      };
      row.getIsSomeSelected = () => {
        const {
          rowSelection
        } = table2.getState();
        return isSubRowSelected(row, rowSelection) === "some";
      };
      row.getIsAllSubRowsSelected = () => {
        const {
          rowSelection
        } = table2.getState();
        return isSubRowSelected(row, rowSelection) === "all";
      };
      row.getCanSelect = () => {
        var _table$options$enable;
        if (typeof table2.options.enableRowSelection === "function") {
          return table2.options.enableRowSelection(row);
        }
        return (_table$options$enable = table2.options.enableRowSelection) != null ? _table$options$enable : true;
      };
      row.getCanSelectSubRows = () => {
        var _table$options$enable2;
        if (typeof table2.options.enableSubRowSelection === "function") {
          return table2.options.enableSubRowSelection(row);
        }
        return (_table$options$enable2 = table2.options.enableSubRowSelection) != null ? _table$options$enable2 : true;
      };
      row.getCanMultiSelect = () => {
        var _table$options$enable3;
        if (typeof table2.options.enableMultiRowSelection === "function") {
          return table2.options.enableMultiRowSelection(row);
        }
        return (_table$options$enable3 = table2.options.enableMultiRowSelection) != null ? _table$options$enable3 : true;
      };
      row.getToggleSelectedHandler = () => {
        const canSelect = row.getCanSelect();
        return (e) => {
          var _target;
          if (!canSelect) return;
          row.toggleSelected((_target = e.target) == null ? void 0 : _target.checked);
        };
      };
    }
  };
  var mutateRowIsSelected = (selectedRowIds, id, value, includeChildren, table2) => {
    var _row$subRows;
    const row = table2.getRow(id, true);
    if (value) {
      if (!row.getCanMultiSelect()) {
        Object.keys(selectedRowIds).forEach((key) => delete selectedRowIds[key]);
      }
      if (row.getCanSelect()) {
        selectedRowIds[id] = true;
      }
    } else {
      delete selectedRowIds[id];
    }
    if (includeChildren && (_row$subRows = row.subRows) != null && _row$subRows.length && row.getCanSelectSubRows()) {
      row.subRows.forEach((row2) => mutateRowIsSelected(selectedRowIds, row2.id, value, includeChildren, table2));
    }
  };
  function selectRowsFn(table2, rowModel) {
    const rowSelection = table2.getState().rowSelection;
    const newSelectedFlatRows = [];
    const newSelectedRowsById = {};
    const recurseRows = function(rows, depth) {
      return rows.map((row) => {
        var _row$subRows2;
        const isSelected = isRowSelected(row, rowSelection);
        if (isSelected) {
          newSelectedFlatRows.push(row);
          newSelectedRowsById[row.id] = row;
        }
        if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length) {
          row = {
            ...row,
            subRows: recurseRows(row.subRows)
          };
        }
        if (isSelected) {
          return row;
        }
      }).filter(Boolean);
    };
    return {
      rows: recurseRows(rowModel.rows),
      flatRows: newSelectedFlatRows,
      rowsById: newSelectedRowsById
    };
  }
  function isRowSelected(row, selection) {
    var _selection$row$id;
    return (_selection$row$id = selection[row.id]) != null ? _selection$row$id : false;
  }
  function isSubRowSelected(row, selection, table2) {
    var _row$subRows3;
    if (!((_row$subRows3 = row.subRows) != null && _row$subRows3.length)) return false;
    let allChildrenSelected = true;
    let someSelected = false;
    row.subRows.forEach((subRow) => {
      if (someSelected && !allChildrenSelected) {
        return;
      }
      if (subRow.getCanSelect()) {
        if (isRowSelected(subRow, selection)) {
          someSelected = true;
        } else {
          allChildrenSelected = false;
        }
      }
      if (subRow.subRows && subRow.subRows.length) {
        const subRowChildrenSelected = isSubRowSelected(subRow, selection);
        if (subRowChildrenSelected === "all") {
          someSelected = true;
        } else if (subRowChildrenSelected === "some") {
          someSelected = true;
          allChildrenSelected = false;
        } else {
          allChildrenSelected = false;
        }
      }
    });
    return allChildrenSelected ? "all" : someSelected ? "some" : false;
  }
  var reSplitAlphaNumeric = /([0-9]+)/gm;
  var alphanumeric = (rowA, rowB, columnId) => {
    return compareAlphanumeric(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
  };
  var alphanumericCaseSensitive = (rowA, rowB, columnId) => {
    return compareAlphanumeric(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
  };
  var text = (rowA, rowB, columnId) => {
    return compareBasic(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
  };
  var textCaseSensitive = (rowA, rowB, columnId) => {
    return compareBasic(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
  };
  var datetime = (rowA, rowB, columnId) => {
    const a2 = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);
    return a2 > b ? 1 : a2 < b ? -1 : 0;
  };
  var basic = (rowA, rowB, columnId) => {
    return compareBasic(rowA.getValue(columnId), rowB.getValue(columnId));
  };
  function compareBasic(a2, b) {
    return a2 === b ? 0 : a2 > b ? 1 : -1;
  }
  function toString(a2) {
    if (typeof a2 === "number") {
      if (isNaN(a2) || a2 === Infinity || a2 === -Infinity) {
        return "";
      }
      return String(a2);
    }
    if (typeof a2 === "string") {
      return a2;
    }
    return "";
  }
  function compareAlphanumeric(aStr, bStr) {
    const a2 = aStr.split(reSplitAlphaNumeric).filter(Boolean);
    const b = bStr.split(reSplitAlphaNumeric).filter(Boolean);
    while (a2.length && b.length) {
      const aa = a2.shift();
      const bb = b.shift();
      const an = parseInt(aa, 10);
      const bn = parseInt(bb, 10);
      const combo = [an, bn].sort();
      if (isNaN(combo[0])) {
        if (aa > bb) {
          return 1;
        }
        if (bb > aa) {
          return -1;
        }
        continue;
      }
      if (isNaN(combo[1])) {
        return isNaN(an) ? -1 : 1;
      }
      if (an > bn) {
        return 1;
      }
      if (bn > an) {
        return -1;
      }
    }
    return a2.length - b.length;
  }
  var sortingFns = {
    alphanumeric,
    alphanumericCaseSensitive,
    text,
    textCaseSensitive,
    datetime,
    basic
  };
  var RowSorting = {
    getInitialState: (state) => {
      return {
        sorting: [],
        ...state
      };
    },
    getDefaultColumnDef: () => {
      return {
        sortingFn: "auto",
        sortUndefined: 1
      };
    },
    getDefaultOptions: (table2) => {
      return {
        onSortingChange: makeStateUpdater("sorting", table2),
        isMultiSortEvent: (e) => {
          return e.shiftKey;
        }
      };
    },
    createColumn: (column, table2) => {
      column.getAutoSortingFn = () => {
        const firstRows = table2.getFilteredRowModel().flatRows.slice(10);
        let isString = false;
        for (const row of firstRows) {
          const value = row == null ? void 0 : row.getValue(column.id);
          if (Object.prototype.toString.call(value) === "[object Date]") {
            return sortingFns.datetime;
          }
          if (typeof value === "string") {
            isString = true;
            if (value.split(reSplitAlphaNumeric).length > 1) {
              return sortingFns.alphanumeric;
            }
          }
        }
        if (isString) {
          return sortingFns.text;
        }
        return sortingFns.basic;
      };
      column.getAutoSortDir = () => {
        const firstRow = table2.getFilteredRowModel().flatRows[0];
        const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
        if (typeof value === "string") {
          return "asc";
        }
        return "desc";
      };
      column.getSortingFn = () => {
        var _table$options$sortin, _table$options$sortin2;
        if (!column) {
          throw new Error();
        }
        return isFunction(column.columnDef.sortingFn) ? column.columnDef.sortingFn : column.columnDef.sortingFn === "auto" ? column.getAutoSortingFn() : (_table$options$sortin = (_table$options$sortin2 = table2.options.sortingFns) == null ? void 0 : _table$options$sortin2[column.columnDef.sortingFn]) != null ? _table$options$sortin : sortingFns[column.columnDef.sortingFn];
      };
      column.toggleSorting = (desc, multi) => {
        const nextSortingOrder = column.getNextSortingOrder();
        const hasManualValue = typeof desc !== "undefined" && desc !== null;
        table2.setSorting((old) => {
          const existingSorting = old == null ? void 0 : old.find((d) => d.id === column.id);
          const existingIndex = old == null ? void 0 : old.findIndex((d) => d.id === column.id);
          let newSorting = [];
          let sortAction;
          let nextDesc = hasManualValue ? desc : nextSortingOrder === "desc";
          if (old != null && old.length && column.getCanMultiSort() && multi) {
            if (existingSorting) {
              sortAction = "toggle";
            } else {
              sortAction = "add";
            }
          } else {
            if (old != null && old.length && existingIndex !== old.length - 1) {
              sortAction = "replace";
            } else if (existingSorting) {
              sortAction = "toggle";
            } else {
              sortAction = "replace";
            }
          }
          if (sortAction === "toggle") {
            if (!hasManualValue) {
              if (!nextSortingOrder) {
                sortAction = "remove";
              }
            }
          }
          if (sortAction === "add") {
            var _table$options$maxMul;
            newSorting = [...old, {
              id: column.id,
              desc: nextDesc
            }];
            newSorting.splice(0, newSorting.length - ((_table$options$maxMul = table2.options.maxMultiSortColCount) != null ? _table$options$maxMul : Number.MAX_SAFE_INTEGER));
          } else if (sortAction === "toggle") {
            newSorting = old.map((d) => {
              if (d.id === column.id) {
                return {
                  ...d,
                  desc: nextDesc
                };
              }
              return d;
            });
          } else if (sortAction === "remove") {
            newSorting = old.filter((d) => d.id !== column.id);
          } else {
            newSorting = [{
              id: column.id,
              desc: nextDesc
            }];
          }
          return newSorting;
        });
      };
      column.getFirstSortDir = () => {
        var _ref, _column$columnDef$sor;
        const sortDescFirst = (_ref = (_column$columnDef$sor = column.columnDef.sortDescFirst) != null ? _column$columnDef$sor : table2.options.sortDescFirst) != null ? _ref : column.getAutoSortDir() === "desc";
        return sortDescFirst ? "desc" : "asc";
      };
      column.getNextSortingOrder = (multi) => {
        var _table$options$enable, _table$options$enable2;
        const firstSortDirection = column.getFirstSortDir();
        const isSorted = column.getIsSorted();
        if (!isSorted) {
          return firstSortDirection;
        }
        if (isSorted !== firstSortDirection && ((_table$options$enable = table2.options.enableSortingRemoval) != null ? _table$options$enable : true) && // If enableSortRemove, enable in general
        (multi ? (_table$options$enable2 = table2.options.enableMultiRemove) != null ? _table$options$enable2 : true : true)) {
          return false;
        }
        return isSorted === "desc" ? "asc" : "desc";
      };
      column.getCanSort = () => {
        var _column$columnDef$ena, _table$options$enable3;
        return ((_column$columnDef$ena = column.columnDef.enableSorting) != null ? _column$columnDef$ena : true) && ((_table$options$enable3 = table2.options.enableSorting) != null ? _table$options$enable3 : true) && !!column.accessorFn;
      };
      column.getCanMultiSort = () => {
        var _ref2, _column$columnDef$ena2;
        return (_ref2 = (_column$columnDef$ena2 = column.columnDef.enableMultiSort) != null ? _column$columnDef$ena2 : table2.options.enableMultiSort) != null ? _ref2 : !!column.accessorFn;
      };
      column.getIsSorted = () => {
        var _table$getState$sorti;
        const columnSort = (_table$getState$sorti = table2.getState().sorting) == null ? void 0 : _table$getState$sorti.find((d) => d.id === column.id);
        return !columnSort ? false : columnSort.desc ? "desc" : "asc";
      };
      column.getSortIndex = () => {
        var _table$getState$sorti2, _table$getState$sorti3;
        return (_table$getState$sorti2 = (_table$getState$sorti3 = table2.getState().sorting) == null ? void 0 : _table$getState$sorti3.findIndex((d) => d.id === column.id)) != null ? _table$getState$sorti2 : -1;
      };
      column.clearSorting = () => {
        table2.setSorting((old) => old != null && old.length ? old.filter((d) => d.id !== column.id) : []);
      };
      column.getToggleSortingHandler = () => {
        const canSort = column.getCanSort();
        return (e) => {
          if (!canSort) return;
          e.persist == null || e.persist();
          column.toggleSorting == null || column.toggleSorting(void 0, column.getCanMultiSort() ? table2.options.isMultiSortEvent == null ? void 0 : table2.options.isMultiSortEvent(e) : false);
        };
      };
    },
    createTable: (table2) => {
      table2.setSorting = (updater) => table2.options.onSortingChange == null ? void 0 : table2.options.onSortingChange(updater);
      table2.resetSorting = (defaultState) => {
        var _table$initialState$s, _table$initialState;
        table2.setSorting(defaultState ? [] : (_table$initialState$s = (_table$initialState = table2.initialState) == null ? void 0 : _table$initialState.sorting) != null ? _table$initialState$s : []);
      };
      table2.getPreSortedRowModel = () => table2.getGroupedRowModel();
      table2.getSortedRowModel = () => {
        if (!table2._getSortedRowModel && table2.options.getSortedRowModel) {
          table2._getSortedRowModel = table2.options.getSortedRowModel(table2);
        }
        if (table2.options.manualSorting || !table2._getSortedRowModel) {
          return table2.getPreSortedRowModel();
        }
        return table2._getSortedRowModel();
      };
    }
  };
  var builtInFeatures = [
    Headers,
    ColumnVisibility,
    ColumnOrdering,
    ColumnPinning,
    ColumnFaceting,
    ColumnFiltering,
    GlobalFaceting,
    //depends on ColumnFaceting
    GlobalFiltering,
    //depends on ColumnFiltering
    RowSorting,
    ColumnGrouping,
    //depends on RowSorting
    RowExpanding,
    RowPagination,
    RowPinning,
    RowSelection,
    ColumnSizing
  ];
  function createTable(options) {
    var _options$_features, _options$initialState;
    if (options.debugAll || options.debugTable) {
      console.info("Creating Table Instance...");
    }
    const _features = [...builtInFeatures, ...(_options$_features = options._features) != null ? _options$_features : []];
    let table2 = {
      _features
    };
    const defaultOptions = table2._features.reduce((obj, feature) => {
      return Object.assign(obj, feature.getDefaultOptions == null ? void 0 : feature.getDefaultOptions(table2));
    }, {});
    const mergeOptions = (options2) => {
      if (table2.options.mergeOptions) {
        return table2.options.mergeOptions(defaultOptions, options2);
      }
      return {
        ...defaultOptions,
        ...options2
      };
    };
    const coreInitialState = {};
    let initialState = {
      ...coreInitialState,
      ...(_options$initialState = options.initialState) != null ? _options$initialState : {}
    };
    table2._features.forEach((feature) => {
      var _feature$getInitialSt;
      initialState = (_feature$getInitialSt = feature.getInitialState == null ? void 0 : feature.getInitialState(initialState)) != null ? _feature$getInitialSt : initialState;
    });
    const queued = [];
    let queuedTimeout = false;
    const coreInstance = {
      _features,
      options: {
        ...defaultOptions,
        ...options
      },
      initialState,
      _queue: (cb) => {
        queued.push(cb);
        if (!queuedTimeout) {
          queuedTimeout = true;
          Promise.resolve().then(() => {
            while (queued.length) {
              queued.shift()();
            }
            queuedTimeout = false;
          }).catch((error) => setTimeout(() => {
            throw error;
          }));
        }
      },
      reset: () => {
        table2.setState(table2.initialState);
      },
      setOptions: (updater) => {
        const newOptions = functionalUpdate(updater, table2.options);
        table2.options = mergeOptions(newOptions);
      },
      getState: () => {
        return table2.options.state;
      },
      setState: (updater) => {
        table2.options.onStateChange == null || table2.options.onStateChange(updater);
      },
      _getRowId: (row, index, parent) => {
        var _table$options$getRow;
        return (_table$options$getRow = table2.options.getRowId == null ? void 0 : table2.options.getRowId(row, index, parent)) != null ? _table$options$getRow : `${parent ? [parent.id, index].join(".") : index}`;
      },
      getCoreRowModel: () => {
        if (!table2._getCoreRowModel) {
          table2._getCoreRowModel = table2.options.getCoreRowModel(table2);
        }
        return table2._getCoreRowModel();
      },
      // The final calls start at the bottom of the model,
      // expanded rows, which then work their way up
      getRowModel: () => {
        return table2.getPaginationRowModel();
      },
      //in next version, we should just pass in the row model as the optional 2nd arg
      getRow: (id, searchAll) => {
        let row = (searchAll ? table2.getPrePaginationRowModel() : table2.getRowModel()).rowsById[id];
        if (!row) {
          row = table2.getCoreRowModel().rowsById[id];
          if (!row) {
            if (true) {
              throw new Error(`getRow could not find row with ID: ${id}`);
            }
            throw new Error();
          }
        }
        return row;
      },
      _getDefaultColumnDef: memo2(() => [table2.options.defaultColumn], (defaultColumn) => {
        var _defaultColumn;
        defaultColumn = (_defaultColumn = defaultColumn) != null ? _defaultColumn : {};
        return {
          header: (props) => {
            const resolvedColumnDef = props.header.column.columnDef;
            if (resolvedColumnDef.accessorKey) {
              return resolvedColumnDef.accessorKey;
            }
            if (resolvedColumnDef.accessorFn) {
              return resolvedColumnDef.id;
            }
            return null;
          },
          // footer: props => props.header.column.id,
          cell: (props) => {
            var _props$renderValue$to, _props$renderValue;
            return (_props$renderValue$to = (_props$renderValue = props.renderValue()) == null || _props$renderValue.toString == null ? void 0 : _props$renderValue.toString()) != null ? _props$renderValue$to : null;
          },
          ...table2._features.reduce((obj, feature) => {
            return Object.assign(obj, feature.getDefaultColumnDef == null ? void 0 : feature.getDefaultColumnDef());
          }, {}),
          ...defaultColumn
        };
      }, getMemoOptions(options, "debugColumns", "_getDefaultColumnDef")),
      _getColumnDefs: () => table2.options.columns,
      getAllColumns: memo2(() => [table2._getColumnDefs()], (columnDefs) => {
        const recurseColumns = function(columnDefs2, parent, depth) {
          if (depth === void 0) {
            depth = 0;
          }
          return columnDefs2.map((columnDef) => {
            const column = createColumn(table2, columnDef, depth, parent);
            const groupingColumnDef = columnDef;
            column.columns = groupingColumnDef.columns ? recurseColumns(groupingColumnDef.columns, column, depth + 1) : [];
            return column;
          });
        };
        return recurseColumns(columnDefs);
      }, getMemoOptions(options, "debugColumns", "getAllColumns")),
      getAllFlatColumns: memo2(() => [table2.getAllColumns()], (allColumns) => {
        return allColumns.flatMap((column) => {
          return column.getFlatColumns();
        });
      }, getMemoOptions(options, "debugColumns", "getAllFlatColumns")),
      _getAllFlatColumnsById: memo2(() => [table2.getAllFlatColumns()], (flatColumns) => {
        return flatColumns.reduce((acc, column) => {
          acc[column.id] = column;
          return acc;
        }, {});
      }, getMemoOptions(options, "debugColumns", "getAllFlatColumnsById")),
      getAllLeafColumns: memo2(() => [table2.getAllColumns(), table2._getOrderColumnsFn()], (allColumns, orderColumns2) => {
        let leafColumns = allColumns.flatMap((column) => column.getLeafColumns());
        return orderColumns2(leafColumns);
      }, getMemoOptions(options, "debugColumns", "getAllLeafColumns")),
      getColumn: (columnId) => {
        const column = table2._getAllFlatColumnsById()[columnId];
        if (!column) {
          console.error(`[Table] Column with id '${columnId}' does not exist.`);
        }
        return column;
      }
    };
    Object.assign(table2, coreInstance);
    for (let index = 0; index < table2._features.length; index++) {
      const feature = table2._features[index];
      feature == null || feature.createTable == null || feature.createTable(table2);
    }
    return table2;
  }
  function getCoreRowModel() {
    return (table2) => memo2(() => [table2.options.data], (data2) => {
      const rowModel = {
        rows: [],
        flatRows: [],
        rowsById: {}
      };
      const accessRows = function(originalRows, depth, parentRow) {
        if (depth === void 0) {
          depth = 0;
        }
        const rows = [];
        for (let i = 0; i < originalRows.length; i++) {
          const row = createRow(table2, table2._getRowId(originalRows[i], i, parentRow), originalRows[i], i, depth, void 0, parentRow == null ? void 0 : parentRow.id);
          rowModel.flatRows.push(row);
          rowModel.rowsById[row.id] = row;
          rows.push(row);
          if (table2.options.getSubRows) {
            var _row$originalSubRows;
            row.originalSubRows = table2.options.getSubRows(originalRows[i], i);
            if ((_row$originalSubRows = row.originalSubRows) != null && _row$originalSubRows.length) {
              row.subRows = accessRows(row.originalSubRows, depth + 1, row);
            }
          }
        }
        return rows;
      };
      rowModel.rows = accessRows(data2);
      return rowModel;
    }, getMemoOptions(table2.options, "debugTable", "getRowModel", () => table2._autoResetPageIndex()));
  }

  // ../../node_modules/@tanstack/react-table/build/lib/index.mjs
  function flexRender(Comp, props) {
    return !Comp ? null : isReactComponent(Comp) ? /* @__PURE__ */ createElement2(Comp, props) : Comp;
  }
  function isReactComponent(component) {
    return isClassComponent(component) || typeof component === "function" || isExoticComponent(component);
  }
  function isClassComponent(component) {
    return typeof component === "function" && (() => {
      const proto = Object.getPrototypeOf(component);
      return proto.prototype && proto.prototype.isReactComponent;
    })();
  }
  function isExoticComponent(component) {
    return typeof component === "object" && typeof component.$$typeof === "symbol" && ["react.memo", "react.forward_ref"].includes(component.$$typeof.description);
  }
  function useReactTable(options) {
    const resolvedOptions = {
      state: {},
      // Dummy state
      onStateChange: () => {
      },
      // noop
      renderFallbackValue: null,
      ...options
    };
    const [tableRef] = useState(() => ({
      current: createTable(resolvedOptions)
    }));
    const [state, setState] = useState(() => tableRef.current.initialState);
    tableRef.current.setOptions((prev) => ({
      ...prev,
      ...options,
      state: {
        ...state,
        ...options.state
      },
      // Similarly, we'll maintain both our internal state and any user-provided
      // state.
      onStateChange: (updater) => {
        setState(updater);
        options.onStateChange == null || options.onStateChange(updater);
      }
    }));
    return tableRef.current;
  }

  // .xuyc-entry.js
  var h = react_compat_default.createElement;
  var data = [
    { name: "\u5F20\u4E09", age: 28, city: "\u5317\u4EAC" },
    { name: "\u674E\u56DB", age: 34, city: "\u4E0A\u6D77" },
    { name: "\u738B\u4E94", age: 22, city: "\u5E7F\u5DDE" }
  ];
  var columns = [
    { accessorKey: "name", header: "\u59D3\u540D" },
    { accessorKey: "age", header: "\u5E74\u9F84" },
    { accessorKey: "city", header: "\u57CE\u5E02" }
  ];
  function Table() {
    const table2 = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    return h(
      "table",
      { style: { borderCollapse: "collapse", width: "100%", background: "#fff", color: "#000" } },
      h(
        "thead",
        null,
        table2.getHeaderGroups().map(
          (hg) => h(
            "tr",
            { key: hg.id },
            hg.headers.map(
              (header2) => h(
                "th",
                { key: header2.id, style: { border: "1px solid #ccc", padding: "8px", textAlign: "left" } },
                flexRender(header2.column.columnDef.header, header2.getContext())
              )
            )
          )
        )
      ),
      h(
        "tbody",
        null,
        table2.getRowModel().rows.map(
          (row) => h(
            "tr",
            { key: row.id },
            row.getVisibleCells().map(
              (cell) => h(
                "td",
                { key: cell.id, style: { border: "1px solid #ccc", padding: "8px" } },
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )
            )
          )
        )
      )
    );
  }
  function App() {
    return h(
      "div",
      { style: "padding:24px;background:#282c34;color:#abb2bf;font-family:system-ui;min-height:100vh" },
      h("h1", { style: { color: "#61afef" } }, "TanStack Table"),
      h(Table)
    );
  }
  react_compat_default.createRoot(document.getElementById("app")).render(h(App));
})();
/*! Bundled license information:

@tanstack/table-core/build/lib/index.mjs:
  (**
     * table-core
     *
     * Copyright (c) TanStack
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.md file in the root directory of this source tree.
     *
     * @license MIT
     *)

@tanstack/react-table/build/lib/index.mjs:
  (**
     * react-table
     *
     * Copyright (c) TanStack
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.md file in the root directory of this source tree.
     *
     * @license MIT
     *)
*/
