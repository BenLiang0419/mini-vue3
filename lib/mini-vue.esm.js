/**
 * 判断是否是对象
 * @param target
 * @returns
 */
const isObject = (target) => {
    return target !== null && typeof target === 'object';
};

const createComponentInstance = (vnode) => {
    const componentInstance = {
        vnode,
        type: vnode.type
    };
    return componentInstance;
};
const setupComponent = (instance) => {
    // TODO 后续处理
    // initProps()
    // initSlots()
    // 处理初始化setup
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
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
    const { type } = vnode;
    if (typeof type === 'string') {
        // 处理Element
        processElement(vnode, container);
    }
    else if (isObject(type)) {
        // 处理组件
        processComponent(vnode, container);
    }
};
function processElement(vnode, container) {
    const { type, props, children } = vnode;
    // 创建对应的el
    const el = document.createElement(type);
    // 处理props
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    // 处理children --> string, Array
    if (typeof children === 'string') {
        el.innerText = children;
    }
    else if (Array.isArray(children)) {
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
    setupRenderEffect(instance, container);
};
const setupRenderEffect = (instance, container) => {
    const subTree = instance.render();
    // subTree 虚拟节点树 vnode tree
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
};

const createVNode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
};

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

export { createApp, h };
