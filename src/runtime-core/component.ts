import { publicInstanceProxyHandlers } from "./componentPublicInstance";

export const createComponentInstance = (vnode) => {

    const componentInstance = {
        vnode,
        type: vnode.type,
        setupState: {}
    }

    return componentInstance
};

export const setupComponent = (instance) => {
    // TODO 后续处理
    // initProps()
    // initSlots()

    // 处理初始化setup
    setupStatefulComponent(instance)

};

export function setupStatefulComponent(instance: any) {

    const component = instance.type

    // 组件代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

    const { setup } = component

    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }

}

function handleSetupResult(instance, setupResult) {
    // setupResult 返回的值类型可能是 function | object
    // TODO Function先不处理， 先处理Object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }

    // 保证render有值
    finishComponentSetup(instance)

}

function finishComponentSetup(instance: any) {
    const component = instance.type
    // 暂时默认都有render
    instance.render = component.render
}

