import { createComponentInstance, setupComponent } from "./component";

export const render = (vnode, container) => {
    
    // 调用patch
    patch(vnode, container)

};

export const patch = (vnode, container) => {
    
    // 判断 是不是 element类型

    // 处理组件
    processComponent(vnode, container)

    

};

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
    setupRenderEffect(instance, container)
    
};

export const setupRenderEffect = (instance, container) => {
    const subTree = instance.render

    // subTree 虚拟节点树 vnode tree
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)
};


