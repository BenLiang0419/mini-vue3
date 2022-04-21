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
        shapeFlag: getShapeFlags(type),
        key: props && props.key,
        children,
        el: null
    };
    // 使用二进制来进行判断
    if (isString(children)) {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    // 初始化slot
    // 组件 + children => object
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
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
    $slots: (instance) => instance.slots,
    $props: (instance) => instance.props
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
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
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
        component: null,
        update: null,
        next: null,
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
    // 组件代理对象 this.xx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        // 存储instance，用于getCurrentInstance
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

const shouldUpdateComponent = (n1, n2) => {
    const { props: prevProps } = n1;
    const { props: nextProps } = n2;
    for (const key in prevProps) {
        if (prevProps[key] !== nextProps[key]) {
            return true;
        }
    }
    return false;
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

const queue = [];
const promise = Promise.resolve();
// 解决不要多次创建Promise
let isExceute = false;
const nextTick = (fn) => {
    return fn ? promise.then(fn) : promise;
};
const queueJob = (job) => {
    // 判断一下是否存在队列，如果存在就不加了
    if (!queue.includes(job)) {
        queue.push(job);
    }
    // 执行微任务
    excuteQueue();
};
function excuteQueue() {
    // MDN https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
    if (isExceute)
        return;
    isExceute = true;
    nextTick(() => {
        isExceute = false;
        let job;
        while ((job = queue.shift())) {
            job & job();
        }
    });
}

const createRenderer = (options) => {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    const render = (n2, container) => {
        // 调用patch
        patch(null, n2, container, null, null);
    };
    const patch = (n1, n2, container, parent, anchor) => {
        // 判断 是不是 element类型
        // 如果是Component，type => Object
        // 如果是element类型，type => div等标签
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment: {
                processFragment(n1, n2, container, parent, anchor);
                break;
            }
            case Text: {
                processText(n1, n2, container);
                break;
            }
            default: {
                if (shapeFlag & 1 /* ELEMENT */) {
                    // 处理Element
                    processElement(n1, n2, container, parent, anchor);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parent, anchor);
                }
            }
        }
    };
    const processComponent = (n1, n2, container, parent, anchor) => {
        // 挂载组件
        // 如果n1有值，证明是需要进行更新
        if (!n1) {
            mountComponent(n2, container, parent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    };
    const updateComponent = (n1, n2) => {
        // 判断n1, n2的props是否相等
        // 相等才会进行组件更新
        const component = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            console.log('[Function:updateComponent]:组件更新n1', n1);
            console.log('[Function:updateComponent]:组件更新n2', n2);
            component.next = n2;
            component.update();
        }
        else {
            n2.el = n1.el;
            n2.vnode = n2;
        }
    };
    const processFragment = (n1, n2, container, parent, anchor) => {
        mountChildren(n2.children, container, parent, anchor);
    };
    const processText = (n1, n2, container) => {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    };
    function processElement(n1, n2, container, parent, anchor) {
        if (!n1) {
            mountElement(n2, container, parent, anchor);
        }
        else {
            patchElement(n1, n2, container, parent, anchor);
        }
    }
    function mountElement(vnode, container, parent, anchor) {
        const { type, props, children, shapeFlag } = vnode;
        // 创建对应的el
        // vnode -> element -> div
        const el = (vnode.el = hostCreateElement(type));
        // 处理props => 普通属性 和 注册事件
        for (const key in props) {
            hostPatchProp(el, key, null, props[key]);
        }
        // 处理children --> string, Array
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.innerText = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parent, anchor);
        }
        // 插入
        hostInsert(el, container, anchor);
    }
    function patchElement(n1, n2, container, parent, anchor) {
        console.log("n1", n1);
        console.log("n2", n2);
        const oldProps = n1.props;
        const newProps = n2.props;
        // 需要把 el 挂载到新的 vnode
        // n1: 旧的 => n2: 新的
        const el = (n2.el = n1.el);
        // 对比props
        patchProps(el, oldProps, newProps);
        // 对比children
        patchChildren(n1, n2, el, parent, anchor);
    }
    function patchProps(el, oldProps, newProps) {
        console.log('oldProps', oldProps);
        console.log('newProps', newProps);
        // 当不相同的时候才会去判断
        if (oldProps !== newProps) {
            // 遍历新值
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== newProps) {
                    // 对比属性值，如果不相同则需要进行更新
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            // 遍历旧值
            for (const key in oldProps) {
                const prevProp = oldProps[key];
                if (!(key in newProps)) {
                    // 判断新props没有的，没有的就去掉null
                    hostPatchProp(el, key, prevProp, null);
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parent, anchor) {
        // 获取shapeFlags 来判断类型
        const prevShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        // 新节点是 Text 时候
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            // 老节点是 Children 
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // 清空老的 Array子节点
                unmountChildren(n1.children);
            }
            // 新老节点都不相同， 新节点需要是Text
            if (n1.children !== n2.children) {
                // 插入新的 Text节点
                hostSetElementText(container, n2.children);
            }
        }
        else {
            // 新节点是 Children 时候
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                // 老节点是 Text
                hostSetElementText(container, "");
                mountChildren(n2.children, container, parent, anchor);
            }
            else {
                // 老节点是 Children
                patchKeyedChildren(n1.children, n2.children, container, parent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parent, anchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 1. 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        console.log('左侧之后i', i);
        // 2. 右侧
        while (e1 >= i && e2 >= i) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        console.log('右侧之后e1', e1);
        console.log('右侧之后e2', e2);
        // 3.新的比老的长, 新的进行创建
        // i > 旧的 证明旧的已经diff完了
        // 1 <= 新的 属于diff后需要新增的范围
        // 左侧 -> 新增
        // a b 
        // a b c d
        // i = 2  >   e1 = 2
        // i = 2  <=  e2 = 3
        // 左侧 -> 删除
        // a b c
        // a b 
        // i = 2  >   e1 = 3
        // i = 2  <=  e2 = 2
        // 右侧
        //     a b
        // c d a b
        // i = 0  >   e1 = -1
        // i = 0  <=  e2 = 1
        if (i > e1) {
            if (i <= e2) {
                const nextProp = e2 + 1;
                const anchor = nextProp < c2.length ? c2[nextProp].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 4. i值大于新节点长度e2, 进行remove
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 5. 中间进行对比
            let s1 = i;
            let s2 = i;
            let moved = false;
            let newIndexForMax = 0;
            // 新节点需要对比的节点数
            let toBePatched = e2 - s2 + 1;
            let patched = 0;
            // 新节点获取key值
            const keyToNewIndexMap = new Map();
            for (let j = s2; j <= e2; j++) {
                const nextChild = c2[j];
                keyToNewIndexMap.set(nextChild.key, j);
            }
            // 进行移动
            // 定一个长度为 新节点需要对比的节点数量
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            // 旧节点进行循环
            for (let index = s1; index <= e1; index++) {
                const pervChild = c1[index];
                const pervKey = pervChild.key;
                let nextIndex;
                // 旧节点长度比旧节点的要长 且已经不需要对比了 直接删除
                if (patched >= toBePatched) {
                    hostRemove(pervChild.el);
                    continue;
                }
                if (pervKey !== null) {
                    // 获取新节点的对应的keyindex
                    nextIndex = keyToNewIndexMap.get(pervKey);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(pervChild, c2[j])) {
                            nextIndex = j;
                            break;
                        }
                    }
                }
                if (nextIndex !== undefined) {
                    // 判断是否需要移动
                    if (nextIndex >= newIndexForMax) {
                        newIndexForMax = nextIndex;
                    }
                    else {
                        moved = true;
                    }
                    // +1 的原因是 在使用最长递增子序列算法时候，0是用于判断
                    newIndexToOldIndexMap[nextIndex - s2] = index + 1;
                    patch(pervChild, c2[nextIndex], container, parent, null);
                    patched++;
                }
                else {
                    // 旧的节点 不存在新的里面，需要删除
                    hostRemove(pervChild.el);
                }
            }
            // 得到了印射表newIndexToOldIndexMap后，进行移动处理
            const newIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = newIndexSequence.length - 1; // 索引 -1
            // 为了稳定的锚点，需要倒序
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const nextAnchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    // 当印射表里面等于 0 相当于 没有新的节点 没有需要移动的而且是不存在的，这时候需要添加一个节点
                    patch(null, nextChild, container, parent, nextAnchor);
                }
                else if (moved) {
                    if (i !== newIndexSequence[j]) {
                        console.log("需要移动位置");
                        hostInsert(nextChild, container, nextAnchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (const key in children) {
            hostRemove(children[key].el);
        }
    }
    function mountChildren(vnodes = [], container, parent, anchor) {
        vnodes.forEach(element => {
            patch(null, element, container, parent, anchor);
        });
    }
    const mountComponent = (n2, container, parent, anchor) => {
        console.log('parent', parent);
        // 创建组件实例， 收集数据
        const instance = (n2.component = createComponentInstance(n2, parent));
        // 初始化 props, slots, setup
        setupComponent(instance);
        // 进行拆箱
        setupRenderEffect(instance, n2, container, anchor);
    };
    const setupRenderEffect = (instance, n2, container, anchor) => {
        // 依赖收集
        instance.update = effect(() => {
            const { isMounted } = instance;
            if (!isMounted) {
                // 是否初始化
                // 指定代理对象 this.xxx
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                // subTree 虚拟节点树 n2 tree
                // n2 -> patch
                // n2 -> element -> mountElement
                patch(null, subTree, container, instance, anchor);
                // vnode节点存起来
                instance.subTree = subTree;
                // 完成了所有的patch后
                n2.el = subTree.el;
                // 初始化结束后，转换状态
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { proxy, next, vnode } = instance;
                // 更新props
                // 需要获取vnode, next-> 下次更新虚拟节点，vnode之前的虚拟节点
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                // 当前（新）节点
                const subTree = instance.render.call(proxy);
                // 旧节点
                const prevSubTree = instance.subTree;
                // vnode节点存起来
                instance.subTree = subTree;
                // 新节点 和 旧节点 进行对比
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler: () => {
                console.log('update - scheduler');
                // 将effect任务 加入到微任务里，再异步执行微任务
                queueJob(instance.update);
            }
        });
    };
    const updateComponentPreRender = (instance, nextVNode) => {
        instance.vnode = nextVNode;
        instance.props = nextVNode.props;
        instance.next = null;
    };
    return {
        createApp: createAppAPI(render)
    };
};
/**
 * 最长子序列算法LIS
 * @param arr
 * @returns
 */
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

const createElement = (type) => {
    return document.createElement(type);
};
const patchProp = (el, key, preValue, nextValue) => {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    else {
        if (nextValue === null || nextValue === undefined) {
            // 如果是 null 或者 undefined，直接remove
            el.removeAttribute(key);
        }
        else {
            // 正常设置
            el.setAttribute(key, nextValue);
        }
    }
};
const setElementText = (el, text) => {
    el.textContent = text;
};
const remove = (child) => {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
};
const insert = (child, parent, anchor) => {
    parent.insertBefore(child, anchor);
};
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createElement, createRenderer, createTextVNode, getCurrentInstance, h, inject, insert, isRef, nextTick, patchProp, provide, proxyRef, ref, remove, renderSlot, setElementText, unRef };
