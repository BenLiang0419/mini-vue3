import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export const render = (vnode, container) => {

    // 调用patch
    patch(vnode, container)

};

export const patch = (vnode, container) => {

    // 判断 是不是 element类型
    // 如果是Component，type => Object
    // 如果是element类型，type => div等标签
    const { type } = vnode
    
    if (typeof type === 'string') {
        // 处理Element
        processElement(vnode, container)
    } else if (isObject(type)) {
        // 处理组件
        processComponent(vnode, container)
    }
};

function processElement(vnode, container) {
    const { type, props, children } = vnode

    // 创建对应的el
    // vnode -> element -> div
    const el = (vnode.el =  document.createElement(type))

    // 处理props
    for(const key in props) {
        const val = props[key]
        el.setAttribute(key, val)
    }

    // 处理children --> string, Array
    if (typeof children === 'string') {
        el.innerText = children
    } else if(Array.isArray(children)) {
        mountElementChildren(children, el)
    }

    container.append(el)

}

function mountElementChildren(vnodes, container) {
    vnodes.forEach(element => {
        patch(element, container)
    });
}

export const processComponent = (vnode, container) => {
    
    // 挂载组件
    mountComponent(vnode, container)

};

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




