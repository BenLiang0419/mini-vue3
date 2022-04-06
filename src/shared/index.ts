
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


