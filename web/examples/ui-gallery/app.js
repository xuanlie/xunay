(() => {
  // ../../../.nvm/versions/node/v22.23.3/lib/node_modules/xunay/src/runtime.js
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
      this.childInstances = [];
      this.nextChildInstances = null;
      this.childCursor = 0;
    }
  };
  function createElement(type, config, ...children) {
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
    if (!isValidElement(vnode)) {
      throw new TypeError("cloneElement: \u53C2\u6570\u5FC5\u987B\u662F\u6709\u6548\u7684 React element");
    }
    const props = { ...vnode.props };
    let key = vnode.key;
    let ref = vnode.ref;
    if (config != null) {
      if (config.key != null) key = config.key;
      if (Object.prototype.hasOwnProperty.call(config, "ref")) ref = config.ref;
      for (const k of Object.keys(config)) {
        if (k !== "key" && k !== "ref" && k !== "__self" && k !== "__source") {
          props[k] = config[k];
        }
      }
    }
    if (children.length === 1) props.children = children[0];
    else if (children.length > 1) props.children = children;
    const cloned = { $$typeof: REACT_ELEMENT, type: vnode.type, key, props };
    if (ref != null) cloned.ref = ref;
    return cloned;
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
  var pendingLayoutEffectInstances = /* @__PURE__ */ new Set();
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
    for (const inst of list) {
      if (allInstances.has(inst)) runEffects(inst, false);
    }
  }
  function flushLayoutEffectsNow() {
    const list = Array.from(pendingLayoutEffectInstances);
    pendingLayoutEffectInstances.clear();
    for (const inst of list) {
      if (allInstances.has(inst)) runEffects(inst, true);
    }
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
      if (!inst.effectQueue.includes(slot)) inst.effectQueue.push(slot);
    } else if (depsChanged(slot.deps, deps)) {
      slot.deps = deps;
      slot.fn = fn;
      slot.layout = layout;
      if (!inst.effectQueue.includes(slot)) inst.effectQueue.push(slot);
    } else {
      return;
    }
    if (layout) pendingLayoutEffectInstances.add(inst);
    else pendingEffectInstances.add(inst);
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
    const [state, setState] = useState(() => initFn ? initFn(init) : init);
    const dispatch = useCallback(
      (action) => setState((prev) => reducer(prev, action)),
      [reducer]
    );
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
  function forwardRef(render2) {
    const F = function forwardRefWrapper(props, ref) {
      return render2(props, ref !== void 0 ? ref : props.ref);
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
    let result;
    if (typeof fn === "function") result = fn();
    if (pendingInstances.size) flushUpdates();
    if (pendingEffectInstances.size) flushEffectsNow();
    return result;
  }
  function unstable_batchedUpdates(fn, a) {
    if (typeof fn === "function") return fn(a);
    return void 0;
  }
  function unstable_renderSubtreeIntoContainer() {
    console.warn("[xunay/compat] unstable_renderSubtreeIntoContainer \u672A\u5B9E\u73B0");
    return null;
  }
  function createFactory(type) {
    return function(config, ...children) {
      return createElement(type, config, ...children);
    };
  }
  function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    const readSnapshot = () => {
      try {
        const getter = typeof window === "undefined" && getServerSnapshot ? getServerSnapshot : getSnapshot;
        return getter();
      } catch (e) {
        console.error("[xunay/compat] useSyncExternalStore getSnapshot \u5931\u8D25:", e);
        return void 0;
      }
    };
    const [snapshot, setSnapshot] = useState(readSnapshot);
    useEffect(() => {
      let alive = true;
      const check = () => {
        if (!alive) return;
        const next = readSnapshot();
        setSnapshot((prev) => Object.is(prev, next) ? prev : next);
      };
      let unsubscribe;
      try {
        unsubscribe = subscribe(check);
      } catch (e) {
        console.error("[xunay/compat] useSyncExternalStore subscribe \u5931\u8D25:", e);
      }
      check();
      return () => {
        alive = false;
        if (typeof unsubscribe === "function") {
          try {
            unsubscribe();
          } catch (e) {
            console.error("[xunay/compat] useSyncExternalStore unsubscribe \u5931\u8D25:", e);
          }
        }
      };
    }, [subscribe, getSnapshot]);
    return readSnapshot();
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
      return renderComponent(type, props, ref, vnode.key);
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
      for (const p of inst.portals) {
        try {
          if (p.node && p.node.parentNode) p.node.parentNode.removeChild(p.node);
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
  function renderComponent(type, props, ref, key = null) {
    const vnode = { type, props, key };
    if (ref !== void 0 && ref !== null) vnode.ref = ref;
    const owner = currentInstance;
    let inst = null;
    if (owner && owner.nextChildInstances) {
      const pool = owner.nextChildInstances;
      for (let i = 0; i < pool.length; i++) {
        const candidate = pool[i];
        if (candidate && !candidate._reused && candidate.vnode.type === type && candidate.vnode.key === key) {
          inst = candidate;
          candidate._reused = true;
          pool.splice(i, 1);
          break;
        }
      }
    }
    if (inst) {
      inst.vnode = vnode;
      inst.contexts = new Map(currentContexts);
    } else {
      inst = new Instance(vnode);
      inst.contexts = new Map(currentContexts);
      allInstances.add(inst);
    }
    if (owner) owner.childInstances.push(inst);
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
    const oldChildren = inst.childInstances || [];
    for (const child of oldChildren) child._reused = false;
    inst.nextChildInstances = oldChildren.slice();
    inst.childInstances = [];
    let result;
    const previousClassProps = inst.classInst ? inst.classInst.props : null;
    const previousClassState = inst.classInst ? inst.classInst.state : null;
    try {
      const type = inst.vnode.type;
      const isClass = type.prototype && (type.prototype.isReactComponent || typeof type.prototype.render === "function");
      if (isClass) {
        const contextType = type.contextType;
        const classContext = contextType && contextType._key ? currentContexts.has(contextType._key) ? currentContexts.get(contextType._key) : contextType._defaultValue : void 0;
        if (!inst.classInst) {
          inst.classInst = new type(inst.vnode.props, classContext);
          inst.classInst._inst = inst;
          inst.classInst.props = inst.vnode.props;
          if (contextType) inst.classInst.context = classContext;
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
          if (contextType) inst.classInst.context = classContext;
        }
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
    const candidates = inst.nextChildInstances || [];
    for (const child of candidates) {
      if (child && !child._reused && allInstances.has(child)) {
        disposeInstance(child);
      }
    }
    inst.nextChildInstances = null;
    if (previousClassProps !== null && inst.classInst && typeof inst.classInst.componentDidUpdate === "function") {
      const classInst = inst.classInst;
      const prevProps = previousClassProps;
      const prevState = previousClassState;
      inst.effectQueue.push({
        fn: () => classInst.componentDidUpdate(prevProps, prevState),
        layout: true,
        cleanup: null
      });
      pendingLayoutEffectInstances.add(inst);
    }
    pendingEffectInstances.add(inst);
    scheduleFlushEffects();
    currentInstance = prev;
    currentContexts = prevCtx;
  }
  function runEffects(inst, layout = false) {
    const q = inst.effectQueue;
    const selected = [];
    const remaining = [];
    for (const slot of q) {
      if (!!slot.layout === layout) selected.push(slot);
      else remaining.push(slot);
    }
    inst.effectQueue = remaining;
    for (const slot of selected) {
      if (slot.cleanup) {
        try {
          slot.cleanup();
        } catch (e) {
          console.error(e);
        }
        slot.cleanup = null;
      }
      try {
        const cleanup = slot.fn();
        if (typeof cleanup === "function") {
          slot.cleanup = cleanup;
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
      const next = node.nextSibling;
      parent.removeChild(node);
      node = next;
    }
    const frag = document.createDocumentFragment();
    renderIntoInstance(inst, frag);
    parent.insertBefore(frag, inst.endMark);
    if (pendingLayoutEffectInstances.has(inst)) flushLayoutEffectsNow();
  }
  function disposeInstance(inst) {
    if (!inst || !allInstances.has(inst)) return;
    pendingInstances.delete(inst);
    pendingEffectInstances.delete(inst);
    pendingLayoutEffectInstances.delete(inst);
    const descendants = inst.childInstances ? inst.childInstances.slice() : [];
    inst.childInstances = [];
    inst.nextChildInstances = null;
    for (const child of descendants) {
      if (child && allInstances.has(child)) disposeInstance(child);
    }
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
  function disposeContainerInstances(container) {
    const roots = [];
    for (const inst of allInstances) {
      if (inst.startMark && container.contains(inst.startMark)) {
        roots.push(inst);
      }
    }
    for (const inst of roots) {
      if (allInstances.has(inst)) disposeInstance(inst);
    }
  }
  function createRoot(container) {
    let lastVNode = null;
    let rootInstance = null;
    let disposed = false;
    return {
      render(vnode) {
        if (disposed) throw new Error("[xunay/compat] \u4E0D\u80FD\u4F7F\u7528\u5DF2\u5378\u8F7D\u7684 root");
        const isComponentVNode = vnode && vnode.$$typeof === REACT_ELEMENT && typeof vnode.type === "function";
        if (rootInstance && isComponentVNode && rootInstance.vnode.type === vnode.type && rootInstance.vnode.key === vnode.key && allInstances.has(rootInstance)) {
          rootInstance.vnode = {
            type: vnode.type,
            props: vnode.props,
            key: vnode.key,
            ref: vnode.ref
          };
          rootInstance.contexts = new Map(currentContexts);
          lastVNode = vnode;
          rerenderInstance(rootInstance);
          if (pendingLayoutEffectInstances.size) flushLayoutEffectsNow();
          if (pendingEffectInstances.size) flushEffectsNow();
          return;
        }
        disposeContainerInstances(container);
        container.replaceChildren();
        rootInstance = null;
        lastVNode = vnode;
        if (isComponentVNode) {
          const frag = renderComponent(vnode.type, vnode.props, vnode.ref, vnode.key);
          container.appendChild(frag);
          rootInstance = Array.from(allInstances).find(
            (inst) => inst.vnode.type === vnode.type && inst.vnode.key === vnode.key && inst.startMark.parentNode === container
          ) || null;
        } else {
          container.appendChild(renderVNode(vnode));
        }
        if (pendingLayoutEffectInstances.size) flushLayoutEffectsNow();
        if (pendingEffectInstances.size) flushEffectsNow();
      },
      unmount() {
        if (disposed) return;
        disposeContainerInstances(container);
        container.replaceChildren();
        rootInstance = null;
        lastVNode = null;
        disposed = true;
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
  function render(vnode, container) {
    return createRoot(container).render(vnode);
  }
  function unmountComponentAtNode(container) {
    disposeContainerInstances(container);
    container.replaceChildren();
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
    createElement,
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
    render,
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

  // ui-gallery/.entry.js
  var h = react_compat_default.createElement;
  if (!document.getElementById("xunay-ui")) {
    const l = document.createElement("link");
    l.id = "xunay-ui";
    l.rel = "stylesheet";
    l.href = "./ui.css";
    document.head.appendChild(l);
  }
  var THEMES = ["light", "dark", "dracula", "nord", "solarized", "tokyo", "monokai"];
  var ACCENTS = ["\u9ED8\u8BA4", "green", "red", "orange", "purple", "cyan", "pink"];
  function Section({ title, children, note }) {
    return h(
      "section",
      { className: "card mb-6" },
      h(
        "div",
        { className: "card-header" },
        h("h2", { style: { margin: 0, fontSize: "var(--text-lg)" } }, title),
        note && h("p", { className: "card-desc", style: { marginTop: 4 } }, note)
      ),
      h("div", { className: "stack" }, children)
    );
  }
  function Row({ label, children }) {
    return h(
      "div",
      { className: "row", style: { alignItems: "center", gap: 12 } },
      h("div", { style: { minWidth: 120, color: "var(--color-fg-muted)", fontSize: "var(--text-xs)" } }, label),
      h("div", { className: "row", style: { gap: 8, flexWrap: "wrap", flex: 1 } }, children)
    );
  }
  function App() {
    const [theme, setTheme] = useState("light");
    const [accent, setAccent] = useState("\u9ED8\u8BA4");
    const [tab, setTab] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [checked, setChecked] = useState(true);
    const applyT = (v) => {
      setTheme(v);
      v === "light" ? document.documentElement.removeAttribute("data-theme") : document.documentElement.setAttribute("data-theme", v);
    };
    const applyA = (v) => {
      setAccent(v);
      v === "\u9ED8\u8BA4" ? document.documentElement.removeAttribute("data-accent") : document.documentElement.setAttribute("data-accent", v);
    };
    return h(
      "div",
      null,
      h(
        "div",
        { className: "card", style: { position: "sticky", top: 0, zIndex: 10, margin: 16, borderRadius: "var(--radius-xl)" } },
        h(
          "div",
          { className: "row", style: { gap: 16, flexWrap: "wrap", alignItems: "center" } },
          h("strong", null, "XuNay UI \u7EC4\u4EF6\u753B\u5ECA"),
          h(
            "div",
            { className: "row", style: { gap: 4, flexWrap: "wrap" } },
            ...THEMES.map((t) => h("button", { key: t, className: theme === t ? "btn btn-primary btn-sm" : "btn btn-sm", onClick: () => applyT(t) }, t))
          ),
          h(
            "div",
            { className: "row", style: { gap: 4, flexWrap: "wrap" } },
            ...ACCENTS.map((a) => h("button", { key: a, className: accent === a ? "btn btn-primary btn-sm" : "btn btn-sm", onClick: () => applyA(a) }, a))
          )
        )
      ),
      h(
        "div",
        { className: "container", style: { paddingBottom: 80 } },
        h(
          Section,
          { title: "\u6309\u94AE", note: "\u53D8\u4F53 \xD7 \u5C3A\u5BF8 \xD7 \u72B6\u6001" },
          h(
            Row,
            { label: "\u53D8\u4F53" },
            h("button", { className: "btn-primary" }, "Primary"),
            h("button", { className: "btn-danger" }, "Danger"),
            h("button", { className: "btn-success" }, "Success"),
            h("button", { className: "btn-outline" }, "Outline"),
            h("button", { className: "btn-ghost" }, "Ghost"),
            h("button", { className: "btn-link" }, "Link"),
            h("button", { className: "btn-gradient" }, "Gradient")
          ),
          h(
            Row,
            { label: "\u5C3A\u5BF8" },
            h("button", { className: "btn btn-xs" }, "XS"),
            h("button", { className: "btn btn-sm" }, "SM"),
            h("button", { className: "btn" }, "MD"),
            h("button", { className: "btn btn-lg" }, "LG"),
            h("button", { className: "btn btn-xl" }, "XL")
          ),
          h(
            Row,
            { label: "\u72B6\u6001" },
            h("button", { className: "btn" }, "\u9ED8\u8BA4"),
            h("button", { className: "btn", disabled: true }, "\u7981\u7528"),
            h("button", { className: "btn loading" }, "\u52A0\u8F7D\u4E2D"),
            h("button", { className: "btn", "aria-pressed": true }, "\u6309\u4E0B")
          ),
          h(
            Row,
            { label: "\u6309\u94AE\u7EC4" },
            h(
              "div",
              { className: "btn-group" },
              h("button", { className: "btn" }, "\u5DE6"),
              h("button", { className: "btn" }, "\u4E2D"),
              h("button", { className: "btn" }, "\u53F3")
            )
          )
        ),
        h(
          Section,
          { title: "\u8868\u5355" },
          h(
            "div",
            { className: "grid grid-2" },
            h(
              "div",
              { className: "field" },
              h("label", { className: "label" }, "\u666E\u901A ", h("span", { className: "required" }, "*")),
              h("input", { className: "input", placeholder: "\u8BF7\u8F93\u5165" }),
              h("div", { className: "hint" }, "\u63D0\u793A\u6587\u5B57")
            ),
            h(
              "div",
              { className: "field error" },
              h("label", { className: "label" }, "\u9519\u8BEF"),
              h("input", { className: "input", "aria-invalid": true, defaultValue: "\u9519\u8BEF\u503C" }),
              h("div", { className: "error-msg" }, "\u9519\u8BEF\u63D0\u793A")
            ),
            h(
              "div",
              { className: "field" },
              h("label", { className: "label" }, "\u6210\u529F"),
              h("input", { className: "input success", defaultValue: "OK" })
            ),
            h(
              "div",
              { className: "field" },
              h("label", { className: "label" }, "\u7981\u7528"),
              h("input", { className: "input", defaultValue: "\u4E0D\u53EF\u7F16\u8F91", disabled: true })
            ),
            h(
              "div",
              { className: "field" },
              h("label", { className: "label" }, "\u4E0B\u62C9"),
              h("select", { className: "select" }, h("option", null, "\u9009\u9879\u4E00"), h("option", null, "\u9009\u9879\u4E8C"))
            ),
            h(
              "div",
              { className: "field" },
              h("label", { className: "label" }, "\u6587\u672C\u57DF"),
              h("textarea", { className: "textarea", placeholder: "\u591A\u884C" })
            )
          ),
          h(
            Row,
            { label: "\u63A7\u4EF6" },
            h("label", { className: "checkbox" }, h("input", { type: "checkbox", checked, onChange: (e) => setChecked(e.target.checked) }), " \u590D\u9009"),
            h("label", { className: "radio" }, h("input", { type: "radio", name: "r", defaultChecked: true }), " \u5355\u9009 A"),
            h("label", { className: "radio" }, h("input", { type: "radio", name: "r" }), " \u5355\u9009 B"),
            h("button", { className: "switch" + (checked ? " on" : ""), role: "switch", "aria-checked": checked, onClick: () => setChecked(!checked) }, h("span", { className: "switch-thumb" })),
            h("input", { type: "range", style: { width: 160 } })
          )
        ),
        h(
          Section,
          { title: "\u5FBD\u7AE0 / \u63D0\u793A\u6761" },
          h(
            Row,
            { label: "Badge" },
            h("span", { className: "badge" }, "\u9ED8\u8BA4"),
            h("span", { className: "badge badge-primary" }, "Primary"),
            h("span", { className: "badge badge-success" }, "Success"),
            h("span", { className: "badge badge-warning" }, "Warning"),
            h("span", { className: "badge badge-danger" }, "Danger")
          ),
          h(
            "div",
            { style: { display: "grid", gap: 8 } },
            h("div", { className: "alert alert-info" }, "\u4FE1\u606F\uFF1A\u63D0\u793A"),
            h("div", { className: "alert alert-success" }, "\u6210\u529F\uFF1A\u5B8C\u6210"),
            h("div", { className: "alert alert-warning" }, "\u8B66\u544A\uFF1A\u6CE8\u610F"),
            h("div", { className: "alert alert-danger" }, "\u9519\u8BEF\uFF1A\u5F02\u5E38")
          )
        ),
        h(
          Section,
          { title: "\u6807\u7B7E\u9875" },
          h(
            "div",
            { className: "tabs", role: "tablist" },
            ...["\u6982\u89C8", "\u8BE6\u60C5", "\u8BBE\u7F6E", "\u6743\u9650"].map(
              (t, i) => h("button", { key: t, className: "tab" + (tab === i ? " active" : ""), role: "tab", "aria-selected": tab === i, onClick: () => setTab(i) }, t)
            )
          ),
          h("div", { style: { paddingTop: 16, color: "var(--color-fg-muted)" } }, `\u5F53\u524D\uFF1A${["\u6982\u89C8", "\u8BE6\u60C5", "\u8BBE\u7F6E", "\u6743\u9650"][tab]}`)
        ),
        h(
          Section,
          { title: "\u8868\u683C" },
          h(
            "div",
            { className: "table-wrap" },
            h(
              "table",
              { className: "table" },
              h("thead", null, h(
                "tr",
                null,
                h("th", { "aria-sort": "ascending" }, "\u540D\u79F0"),
                h("th", null, "\u72B6\u6001"),
                h("th", null, "\u6570\u91CF"),
                h("th", null, "\u64CD\u4F5C")
              )),
              h(
                "tbody",
                null,
                ...[["\u9879\u76EE A", "badge-success", "\u6B63\u5E38", 128], ["\u9879\u76EE B", "badge-warning", "\u8B66\u544A", 64], ["\u9879\u76EE C", "badge-danger", "\u5F02\u5E38", 0]].map(
                  ([n, c, s, v], i) => h(
                    "tr",
                    { key: i, "aria-selected": i === 1 },
                    h("td", null, n),
                    h("td", null, h("span", { className: "badge " + c }, s)),
                    h("td", null, String(v)),
                    h("td", null, h("button", { className: "btn btn-sm btn-link" }, "\u7F16\u8F91"))
                  )
                )
              )
            )
          )
        ),
        h(
          Section,
          { title: "\u5361\u7247" },
          h(
            "div",
            { className: "grid grid-3" },
            h(
              "div",
              { className: "card" },
              h("div", { className: "card-header" }, h("div", { className: "card-title" }, "\u666E\u901A\u5361\u7247")),
              h("p", null, "\u5E26 header/footer"),
              h("div", { className: "card-footer" }, "\u5E95\u90E8")
            ),
            h(
              "div",
              { className: "card card-hover" },
              h("div", { className: "card-title" }, "\u60AC\u505C\u5361\u7247"),
              h("p", { className: "card-desc" }, "hover \u6709\u4F4D\u79FB")
            ),
            h(
              "div",
              { className: "card card-flat" },
              h("div", { className: "card-title" }, "\u6241\u5361\u7247"),
              h("p", { className: "card-desc" }, "\u65E0\u9634\u5F71")
            )
          )
        ),
        h(
          Section,
          { title: "\u5934\u50CF / \u8FDB\u5EA6 / \u9AA8\u67B6" },
          h(
            Row,
            { label: "\u5934\u50CF" },
            h("span", { className: "avatar avatar-sm" }, "A"),
            h("span", { className: "avatar" }, "B"),
            h("span", { className: "avatar avatar-lg" }, "C")
          ),
          h(
            Row,
            { label: "\u8FDB\u5EA6" },
            h(
              "div",
              { style: { flex: 1 } },
              h("div", { className: "progress mb-2" }, h("div", { className: "progress-bar", style: { width: "35%" } })),
              h("div", { className: "progress mb-2" }, h("div", { className: "progress-bar", style: { width: "70%" } })),
              h("div", { className: "progress progress-sm" }, h("div", { className: "progress-bar", style: { width: "100%" } }))
            )
          ),
          h(
            Row,
            { label: "\u9AA8\u67B6" },
            h(
              "div",
              { style: { flex: 1 } },
              h("div", { className: "skeleton skeleton-title" }),
              h("div", { className: "skeleton skeleton-text" }),
              h("div", { className: "skeleton skeleton-text", style: { width: "60%" } })
            )
          )
        ),
        h(
          Section,
          { title: "\u6D6E\u5C42" },
          h(
            Row,
            { label: "\u6A21\u6001" },
            h("button", { className: "btn btn-primary", onClick: () => setShowModal(true) }, "\u6253\u5F00\u6A21\u6001")
          ),
          h(
            Row,
            { label: "\u4E0B\u62C9" },
            h(
              "div",
              { className: "dropdown" },
              h("button", { className: "btn" }, "\u4E0B\u62C9 \u25BE"),
              h(
                "div",
                { className: "dropdown-menu", style: { position: "static", marginTop: 4 } },
                h("div", { className: "dropdown-item" }, "\u83DC\u5355\u9879 1"),
                h("div", { className: "dropdown-item", "aria-selected": true }, "\u9009\u4E2D\u9879"),
                h("div", { className: "dropdown-divider" }),
                h("div", { className: "dropdown-item", "aria-disabled": true }, "\u7981\u7528\u9879")
              )
            )
          )
        ),
        h(
          Section,
          { title: "\u4EE3\u7801 / \u6E10\u53D8" },
          h("pre", null, h("code", null, "function hello(name) {\n  return `Hello, ${name}!`\n}")),
          h(
            "div",
            { className: "grid grid-4", style: { marginTop: 12 } },
            h("div", { className: "bg-gradient-blue", style: { height: 60, borderRadius: 8 } }),
            h("div", { className: "bg-gradient-green", style: { height: 60, borderRadius: 8 } }),
            h("div", { className: "bg-gradient-purple", style: { height: 60, borderRadius: 8 } }),
            h("div", { className: "bg-gradient-cyan", style: { height: 60, borderRadius: 8 } })
          ),
          h("div", { className: "text-gradient", style: { fontSize: 32, fontWeight: 700, marginTop: 12 } }, "\u6E10\u53D8\u6587\u5B57")
        ),
        h(
          Section,
          { title: "\u6587\u672C / \u5F15\u7528" },
          h("p", null, "\u666E\u901A\u6587\u672C\uFF0C\u542B ", h("strong", null, "\u52A0\u7C97"), "\u3001", h("em", null, "\u659C\u4F53"), "\u3001", h("code", null, "inline code"), " \u548C ", h("a", { href: "#" }, "\u94FE\u63A5"), "\u3002"),
          h("blockquote", null, "\u8FD9\u662F\u4E00\u6BB5\u5F15\u7528\u3002"),
          h("hr", null),
          h(
            "div",
            { className: "row" },
            h("span", { className: "text-sm text-dim" }, "\u5C0F\u5B57 \xB7 \u6B21\u8981"),
            h("span", { className: "divider-vertical" }),
            h("span", { className: "text-primary" }, "\u4E3B\u8272"),
            h("span", { className: "text-danger" }, "\u5371\u9669"),
            h("span", { className: "text-success" }, "\u6210\u529F")
          )
        )
      ),
      showModal && h(
        "div",
        { className: "modal-overlay", onClick: () => setShowModal(false) },
        h(
          "div",
          { className: "modal", onClick: (e) => e.stopPropagation() },
          h(
            "div",
            { className: "modal-header" },
            h("div", { className: "modal-title" }, "\u793A\u4F8B\u6A21\u6001\u6846"),
            h("button", { className: "modal-close", onClick: () => setShowModal(false) }, "\xD7")
          ),
          h(
            "div",
            { className: "modal-body" },
            h("p", null, "\u79FB\u52A8\u7AEF\u4F1A\u81EA\u52A8\u53D8\u6210\u5E95\u90E8\u62BD\u5C49\u3002"),
            h("input", { className: "input", placeholder: "\u8BD5\u8BD5\u8F93\u5165" })
          ),
          h(
            "div",
            { className: "modal-footer" },
            h("button", { className: "btn", onClick: () => setShowModal(false) }, "\u53D6\u6D88"),
            h("button", { className: "btn btn-primary", onClick: () => setShowModal(false) }, "\u786E\u5B9A")
          )
        )
      )
    );
  }
  react_compat_default.createRoot(document.getElementById("app")).render(h(App));
})();
