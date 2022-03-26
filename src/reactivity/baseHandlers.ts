import { track, trigger } from './effect';

const createGetter = (isReadOnly = false) => {
    return (target, key) => {
        const res = Reflect.get(target, key)
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
