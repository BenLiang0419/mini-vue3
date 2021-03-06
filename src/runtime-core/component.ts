import { proxyRef } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmits";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

let instance = null
export const createComponentInstance = (vnode, parent) => {

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
        next: null, // 存储新的虚拟节点
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { }
    }

    // 初始化emit
    // 使用bind 返回一个函数
    componentInstance.emit = emit.bind(null, componentInstance) as any

    return componentInstance
};

export const setupComponent = (instance) => {
    // TODO 后续处理 -> 只处理了普通的
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)

    // 处理初始化setup
    setupStatefulComponent(instance)

};

export function setupStatefulComponent(instance: any) {

    const component = instance.type

    // 组件代理对象 this.xx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

    const { setup } = component

    if (setup) {
        // 存储instance，用于getCurrentInstance
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }


}

function handleSetupResult(instance, setupResult) {
    // setupResult 返回的值类型可能是 function | object
    // TODO Function先不处理， 先处理Object
    if (typeof setupResult === 'object') {
        // 通过proxyRef来解决Ref获取值
        instance.setupState = proxyRef(setupResult)
    }

    // 保证render有值
    finishComponentSetup(instance)

}

function finishComponentSetup(instance: any) {
    const component = instance.type
    // 暂时默认都有render
    instance.render = component.render
}

export const getCurrentInstance = () => {
    return instance
};

function setCurrentInstance(_instance) {
    instance = _instance
};
