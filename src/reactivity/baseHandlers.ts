import { track, trigger } from './effect';

export const enum flags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

const createGetter = (isReadOnly = false) => {
    return (target, key) => {
        const res = Reflect.get(target, key)

        if (key === flags.IS_REACTIVE) {
            return !isReadOnly
        } else if (key === flags.IS_READONLY) {
            return isReadOnly
        }

        // 收集依赖
        if (!isReadOnly) {
            track(target, key)
        }
        return res
    }
}

const createSetter = () => {
    return (target, key, value) => {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export const baseHandler = {
    get,
    set
}

export const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        throw new Error(`${target} 因为 readonly模式，所以无法修改`)
    }
}
