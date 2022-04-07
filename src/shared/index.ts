
/**
 * 判断是否是对象
 * @param target 
 * @returns 
 */
export const isObject = (target) => {
    return target !== null && typeof target === 'object'
};

export const extend = Object.assign

export const hasChanged = (oldValue, newValue) => {
    return !Object.is(oldValue, newValue)
}

export const isString = (val) => typeof val === 'string'

export const isOwn = (val: any, key: string) => Object.prototype.hasOwnProperty.call(val, key)

// add -> Add
export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// add -> Add -> onAdd
export const toHandlerKey = (str: string) => {
    return str ? "on" + capitalize(str) : ""
}

// add-count -> addCount -> AddCount -> onAddCount
// 自定义事件是驼峰写法
export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (match, c: string) => {
        return c ? c.toUpperCase() : ""
    })
}