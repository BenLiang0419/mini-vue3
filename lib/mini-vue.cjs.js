'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 判断是否是对象
 * @param target
 * @returns
 */
const isObject = (target) => {
    return target !== null && typeof target === 'object';
};
const extend = Object.assign;
const isString = (val) => typeof val === 'string';
const isOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

// target -> key -> dep
const targetKeyMap = new Map();
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

const initProps = (instance, props) => {
    instance.props = props;
};

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el
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

const createComponentInstance = (vnode) => {
    const componentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    };
    return componentInstance;
};
const setupComponent = (instance) => {
    // TODO 后续处理 -> 只处理了普通的
    initProps(instance, instance.vnode.props);
    // initSlots()
    // 处理初始化setup
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const component = instance.type;
    // 组件代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setupResult 返回的值类型可能是 function | object
    // TODO Function先不处理， 先处理Object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // 保证render有值
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    // 暂时默认都有render
    instance.render = component.render;
}

const render = (vnode, container) => {
    // 调用patch
    patch(vnode, container);
};
const patch = (vnode, container) => {
    // 判断 是不是 element类型
    // 如果是Component，type => Object
    // 如果是element类型，type => div等标签
    const { shapeFlags } = vnode;
    if (shapeFlags & 1 /* ELEMENT */) {
        // 处理Element
        processElement(vnode, container);
    }
    else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
        // 处理组件
        processComponent(vnode, container);
    }
};
function processElement(vnode, container) {
    const { type, props, children, shapeFlags } = vnode;
    // 创建对应的el
    // vnode -> element -> div
    const el = (vnode.el = document.createElement(type));
    // 处理props => 普通属性 和 注册事件
    for (const key in props) {
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, props[key]);
        }
        else {
            el.setAttribute(key, props[key]);
        }
    }
    // 处理children --> string, Array
    if (shapeFlags & 4 /* TEXT_CHILDREN */) {
        el.innerText = children;
    }
    else if (shapeFlags & 8 /* ARRAY_CHILDREN */) {
        mountElementChildren(children, el);
    }
    container.append(el);
}
function mountElementChildren(vnodes, container) {
    vnodes.forEach(element => {
        patch(element, container);
    });
}
const processComponent = (vnode, container) => {
    // 挂载组件
    mountComponent(vnode, container);
};
const mountComponent = (vnode, container) => {
    // 创建组件实例， 收集数据
    const instance = createComponentInstance(vnode);
    // 初始化 props, slots, setup
    setupComponent(instance);
    // 进行拆箱
    setupRenderEffect(instance, vnode, container);
};
const setupRenderEffect = (instance, vnode, container) => {
    const { proxy } = instance;
    // 指定代理对象 this.xxx
    const subTree = instance.render.call(proxy);
    // subTree 虚拟节点树 vnode tree
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
    // 完成了所有的patch后
    vnode.el = subTree.el;
};

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
    return vnode;
};
function getShapeFlags(type) {
    return isString(type) ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

const createApp = (rootComponent) => {
    return {
        mount(rootContainer) {
            // 将component转换成vnode
            // 后续所有操作都会基于vnode 来进行操作
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
};

const h = (type, props, children) => {
    return createVNode(type, props, children);
};

exports.createApp = createApp;
exports.h = h;
