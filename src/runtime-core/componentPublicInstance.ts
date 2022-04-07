import { isOwn } from "../shared";

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el
}

export const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance

        if (isOwn(setupState, key)) {
            return setupState[key]
        } else if (isOwn(props, key)) {
            return props[key]
        }

        const publicProperty = publicPropertiesMap[key]
        if (publicProperty) {
            return publicProperty(instance)
        }

    }
};
