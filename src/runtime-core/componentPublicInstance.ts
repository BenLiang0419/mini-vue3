
export const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        var setupState = instance.setupState
        if (key in setupState) {
            return setupState[key]
        }

        if (key === '$el') {
            return instance.vnode.el
        }

    }
};
