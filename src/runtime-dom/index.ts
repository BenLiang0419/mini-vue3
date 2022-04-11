
import { createRenderer } from '../runtime-core/index.js'

export const createElement = (type) => {
    return document.createElement(type)
};

export const patchProps = (el, key, value) => {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, value)
    } else {
        el.setAttribute(key, value)
    }
};

export const insert = (el, container) => {
    container.append(el)
};

const renderer: any = createRenderer({
    createElement,
    patchProps,
    insert
})

export function createApp (...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core'
