
import { createRenderer } from '../runtime-core/index.js'

export const createElement = (type) => {
    return document.createElement(type)
};

export const patchProp = (el, key, preValue, nextValue) => {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, nextValue)
    } else {
        if (nextValue === null || nextValue === undefined) {
            // 如果是 null 或者 undefined，直接remove
            el.removeAttribute(key)
        } else {
            // 正常设置
            el.setAttribute(key, nextValue)
        }
    }
};

export const setElementText = (el, text) => {
    el.textContent = text
};

export const remove = (child) => {
    const parent = child.parentNode
    if (parent) {
        parent.removeChild(child)
    }
}

export const insert = (child, parent, anchor) => {
    parent.insertBefore(child, anchor)
};

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})

export function createApp (...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core'
