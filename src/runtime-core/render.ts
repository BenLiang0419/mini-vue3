import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export const render = (vnode, container) => {

    // 调用patch
    patch(vnode, container)

};

export const patch = (vnode, container) => {

    // 判断 是不是 element类型
    // 如果是Component，type => Object
    // 如果是element类型，type => div等标签
    const { shapeFlags, type } = vnode

    switch (type) {
        case Fragment: {
            processFragment(vnode, container)
            break;
        }
        case Text: {
            processText(vnode, container)
            break;
        }
        default: {
            if (shapeFlags & ShapeFlags.ELEMENT) {
                // 处理Element
                processElement(vnode, container)
            } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
                // 处理组件
                processComponent(vnode, container)
            }
        }
    }
};

export const processComponent = (vnode, container) => {

    // 挂载组件
    mountComponent(vnode, container)

};

export const processFragment = (vnode, container) => {
    mountChildren(vnode.children, container)
};

export const processText = (vnode, container) => {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}

function processElement(vnode, container) {
    const { type, props, children, shapeFlags } = vnode

    // 创建对应的el
    // vnode -> element -> div
    const el = (vnode.el = document.createElement(type))

    // 处理props => 普通属性 和 注册事件
    for (const key in props) {
        const isOn = (key: string) => /^on[A-Z]/.test(key)
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event, props[key])
        } else {
            el.setAttribute(key, props[key])
        }
    }

    // 处理children --> string, Array
    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
        el.innerText = children
    } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el)
    }

    container.append(el)

}

function mountChildren(vnodes, container) {
    vnodes.forEach(element => {
        patch(element, container)
    });
}

export const mountComponent = (vnode, container) => {

    // 创建组件实例， 收集数据
    const instance = createComponentInstance(vnode)

    // 初始化 props, slots, setup
    setupComponent(instance)

    // 进行拆箱
    setupRenderEffect(instance, vnode, container)

};

export const setupRenderEffect = (instance, vnode, container) => {
    const { proxy } = instance
    // 指定代理对象 this.xxx
    const subTree = instance.render.call(proxy)

    // subTree 虚拟节点树 vnode tree
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)

    // 完成了所有的patch后
    vnode.el = subTree.el

};




