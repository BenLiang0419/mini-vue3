const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el
}

export const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        var setupState = instance.setupState
        if (key in setupState) {
            return setupState[key]
        }

        const publicProperty = publicPropertiesMap[key]
        if(publicProperty) {
            return publicProperty(instance)
        }

    }
};
