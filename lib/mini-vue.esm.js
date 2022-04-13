/**
 * 判断是否是对象
 * @param target
 * @returns
 */
const isObject = (target) => {
    return target !== null && typeof target === 'object';
};
const extend = Object.assign;
const hasChanged = (oldValue, newValue) => {
    return !Object.is(oldValue, newValue);
};
const isString = (val) => typeof val === 'string';
const isOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// add -> Add
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// add -> Add -> onAdd
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};
// add-count -> addCount -> AddCount -> onAddCount
// 自定义事件是驼峰写法
const camelize = (str) => {
    return str.replace(/-(\w)/g, (match, c) => {
        return c ? c.toUpperCase() : "";
    });
};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
const createVNode = (type, props, children) => {
    const vnode = {
        type,
        props,
        shapeFlags: getShapeFlags(type),
        children,
        el: null
    };
    // 使用二进制来进行判断
    if (isString(children)) {
        vnode.shapeFlags |= 4 /* TEXT_CHILDREN */;
    }
    else {
        vnode.shapeFlags |= 8 /* ARRAY_CHILDREN */;
    }
    // 初始化slot
    // 组件 + children => object
    if (vnode.shapeFlags & 2 /* STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlags |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
};
const createTextVNode = (str) => {
    return createVNode(Text, {}, str);
};
function getShapeFlags(type) {
    return isString(type) ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

const h = (type, props, children) => {
    return createVNode(type, props, children);
};

const renderSlot = ($slots, name, props) => {
    // return vnode
    // return createVNode("div", {}, $slots)
    const slot = $slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
};

// target -> key -> dep
const targetKeyMap = new Map();
let activeEffect;
// 是否应该收集
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.state = true;
        this.fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 判断是不是被stop
        if (!this.state) {
            return this.fn();
        }
        // 如果不是被stop，可被收集依赖
        // shouldTrack 打开
        shouldTrack = true;
        activeEffect = this;
        const runner = this.fn();
        // shouldTrack 是全局，所以需要被reset
        shouldTrack = false;
        return runner;
    }
    stop() {
        if (this.state) {
            if (this.onStop) {
                this.onStop();
            }
            cleanDeps(this);
            this.state = false;
        }
    }
}
/**
 * 清除所有依赖dep
 * @param effect
 */
const cleanDeps = (effect) => {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
};
/**
 * 收集依赖
 * target -> key -> dep
 * @param target
 * @param key
 * @returns
 */
const track = (target, key) => {
    // 判断是否可以被收集依赖
    // 1. shouldTrack 是否放通
    // 2. activeEffect 在run时候是否有被赋值
    if (!isTracking())
        return;
    let depMap;
    let dep;
    if (!targetKeyMap.has(target)) {
        depMap = new Map();
        targetKeyMap.set(target, depMap);
    }
    depMap = targetKeyMap.get(target);
    if (!depMap.has(key)) {
        dep = new Set();
        depMap.set(key, dep);
    }
    dep = depMap.get(key);
    trackEffect(dep);
};
const trackEffect = (dep) => {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
/**
 * 触发依赖
 * @param target
 * @param key
 */
const trigger = (target, key) => {
    let depsMap = targetKeyMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
};
const triggerEffect = (dep) => {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
};
const effect = (fn, options = {}) => {
    const reactiveEffect = new ReactiveEffect(fn, options.scheduler);
    reactiveEffect.onStop = options.onStop;
    reactiveEffect.run();
    const runner = reactiveEffect.run.bind(reactiveEffect);
    runner.effect = reactiveEffect;
    return runner;
};
/**
 * 可以被收集依赖
 * @returns
 */
const isTracking = () => {
    return shouldTrack && activeEffect != undefined;
};

const createGetter = (isReadOnly = false, isShallowReadonly = false, isShallowReactive = false) => {
    return (target, key) => {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        const res = Reflect.get(target, key);
        // shallowReadonly
        // shallow 只需要获取表面的那层数据
        if (isShallowReadonly) {
            return res;
        }
        if (isObject(res) && !isShallowReactive) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        // 收集依赖
        if (!isReadOnly) {
            track(target, key);
        }
        return res;
    };
};
const createSetter = () => {
    return (target, key, value) => {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReactiveGet = createGetter(false, false, true);
const baseHandler = {
    get,
    set
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        throw new Error(`${target} 因为 readonly模式，所以无法修改`);
    }
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet
});
extend({}, baseHandler, {
    get: shallowReactiveGet
});

function reactive(params) {
    return createReactive(params, baseHandler);
}
const readonly = (params) => {
    return createReactive(params, readonlyHandler);
};
const shallowReadonly = (params) => {
    return createReactive(params, shallowReadonlyHandler);
};
const createReactive = (target, baseHandler) => {
    if (!isObject(target)) {
        console.warn(`Reactive target ${target} 只能是对象。`);
        return target;
    }
    return new Proxy(target, baseHandler);
};

class RefImpl {
    constructor(_value) {
        this.__v_isRef = true;
        this._value = convert(_value);
        this._rawValue = _value;
        this.dep = new Set();
    }
    get value() {
        trackRefEffect(this.dep);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffect(this.dep);
        }
    }
}
function trackRefEffect(dep) {
    if (isTracking()) {
        trackEffect(dep);
    }
}
function convert(newValue) {
    return isObject(newValue) ? reactive(newValue) : newValue;
}
const ref = (val) => {
    return new RefImpl(val);
};
const isRef = (ref) => {
    // 在RefImpl 里面给一个判断值
    return !!ref.__v_isRef;
};
// 判断是不是ref
//   -- 如果是ref，则直接ref.value
//   -- 如果不是ref，则直接返回ref
const unRef = (ref) => {
    return isRef(ref) ? ref.value : ref;
};
const proxyRef = (proxyTarget) => {
    return new Proxy(proxyTarget, {
        get(target, key) {
            // 利用unRef判断获取值
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 判断是不是ref 如果是ref，且返回的值不是ref，则使用.value来赋值
            // 否则直接赋值
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
};

const emit = (instance, event, ...args) => {
    const { props } = instance;
    // 通过自定义事件名称 获取 事件
    const handler = props[toHandlerKey(camelize(event))];
    handler && handler(...args);
};

const initProps = (instance, props) => {
    instance.props = props;
};

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (isOwn(setupState, key)) {
            return setupState[key];
        }
        else if (isOwn(props, key)) {
            return props[key];
        }
        const publicProperty = publicPropertiesMap[key];
        if (publicProperty) {
            return publicProperty(instance);
        }
    }
};

const initSlots = (instance, children) => {
    // 1. 单个
    // 2. array
    // 3. key->value object
    // instance.slots = Array.isArray(children) ? children : [children]
    const { vnode } = instance;
    if (vnode.shapeFlags & 16 /* SLOT_CHILDREN */) {
        normalizeObject(children, instance);
    }
};
function normalizeObject(children, instance) {
    const solts = {};
    for (const key in children) {
        const val = children[key];
        solts[key] = (props) => normalizeSlotValue(val(props));
    }
    instance.slots = solts;
}
function normalizeSlotValue(val) {
    return Array.isArray(val) ? val : [val];
}

let instance = null;
const createComponentInstance = (vnode, parent) => {
    const componentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        isMounted: false,
        subTree: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { }
    };
    // 初始化emit
    // 使用bind 返回一个函数
    componentInstance.emit = emit.bind(null, componentInstance);
    return componentInstance;
};
const setupComponent = (instance) => {
    // TODO 后续处理 -> 只处理了普通的
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 处理初始化setup
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const component = instance.type;
    // 组件代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setupResult 返回的值类型可能是 function | object
    // TODO Function先不处理， 先处理Object
    if (typeof setupResult === 'object') {
        // 通过proxyRef来解决Ref获取值
        instance.setupState = proxyRef(setupResult);
    }
    // 保证render有值
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    // 暂时默认都有render
    instance.render = component.render;
}
const getCurrentInstance = () => {
    return instance;
};
function setCurrentInstance(_instance) {
    instance = _instance;
}

// 场景1： 父组件 存， 子组件 取 ==> 存到provides里面
// 场景2： 父组件 存， 子孙组件 取 ==> provides指定父类的provides
// 场景3:  当在中间层组件中使用了 provide
const provide = (key, value) => {
    // 存值
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        // init
        if (provides === currentInstance.parent.provides) {
            // 原型指向父类的provides, 创建一个新的
            provides = currentInstance.provides = Object.create(currentInstance.provides);
        }
        provides[key] = value;
    }
};
const inject = (key) => {
    // 取值
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        // 父类里面拿
        const { parent } = currentInstance;
        const { provides } = parent;
        return provides[key];
    }
};

const createAppAPI = (render) => {
    return function (rootComponent) {
        return {
            mount(rootContainer) {
                // 将component转换成vnode
                // 后续所有操作都会基于vnode 来进行操作
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
};

const createRenderer = (options) => {
    const { createElement, patchProps, insert } = options;
    const render = (n2, container) => {
        // 调用patch
        patch(null, n2, container);
    };
    const patch = (n1, n2, container, parent = null) => {
        // 判断 是不是 element类型
        // 如果是Component，type => Object
        // 如果是element类型，type => div等标签
        const { shapeFlags, type } = n2;
        switch (type) {
            case Fragment: {
                processFragment(n1, n2, container, parent);
                break;
            }
            case Text: {
                processText(n1, n2, container);
                break;
            }
            default: {
                if (shapeFlags & 1 /* ELEMENT */) {
                    // 处理Element
                    processElement(n1, n2, container, parent);
                }
                else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parent);
                }
            }
        }
    };
    const processComponent = (n1, n2, container, parent) => {
        // 挂载组件
        mountComponent(n2, container, parent);
    };
    const processFragment = (n1, n2, container, parent) => {
        mountChildren(n2.children, container, parent);
    };
    const processText = (n1, n2, container) => {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    };
    function processElement(n1, n2, container, parent) {
        if (!n1) {
            mountElement(n2, container, parent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function mountElement(vnode, container, parent) {
        const { type, props, children, shapeFlags } = vnode;
        // 创建对应的el
        // vnode -> element -> div
        const el = (vnode.el = createElement(type));
        // 处理props => 普通属性 和 注册事件
        for (const key in props) {
            patchProps(el, key, props[key]);
        }
        // 处理children --> string, Array
        if (shapeFlags & 4 /* TEXT_CHILDREN */) {
            el.innerText = children;
        }
        else if (shapeFlags & 8 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parent);
        }
        insert(el, container);
    }
    function patchElement(n1, n2, container) {
        console.log("n1", n1);
        console.log("n2", n2);
    }
    function mountChildren(vnodes = [], container, parent) {
        vnodes.forEach(element => {
            patch(null, element, container, parent);
        });
    }
    const mountComponent = (n2, container, parent) => {
        console.log('parent', parent);
        // 创建组件实例， 收集数据
        const instance = createComponentInstance(n2, parent);
        // 初始化 props, slots, setup
        setupComponent(instance);
        // 进行拆箱
        setupRenderEffect(instance, n2, container);
    };
    const setupRenderEffect = (instance, n2, container) => {
        // 依赖收集
        effect(() => {
            const { isMounted } = instance;
            if (!isMounted) {
                // 是否初始化
                // 指定代理对象 this.xxx
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                // subTree 虚拟节点树 n2 tree
                // n2 -> patch
                // n2 -> element -> mountElement
                patch(null, subTree, container, instance);
                // vnode节点存起来
                instance.subTree = subTree;
                // 完成了所有的patch后
                n2.el = subTree.el;
                // 初始化结束后，转换状态
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                // 当前（新）节点
                const subTree = instance.render.call(proxy);
                // 旧节点
                const prevSubTree = instance.subTree;
                // vnode节点存起来
                instance.subTree = subTree;
                // 新节点 和 旧节点 进行对比
                patch(prevSubTree, subTree, container, instance);
            }
        });
    };
    return {
        createApp: createAppAPI(render)
    };
};

const createElement = (type) => {
    return document.createElement(type);
};
const patchProps = (el, key, value) => {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
    }
    else {
        el.setAttribute(key, value);
    }
};
const insert = (el, container) => {
    container.append(el);
};
const renderer = createRenderer({
    createElement,
    patchProps,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createElement, createRenderer, createTextVNode, getCurrentInstance, h, inject, insert, isRef, patchProps, provide, proxyRef, ref, renderSlot, unRef };
