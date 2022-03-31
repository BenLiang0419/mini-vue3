import { isObject, extend } from '../shared';
import { track, trigger } from './effect';
import { reactive, readonly } from './reactive';

export const enum flags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

const createGetter = (isReadOnly = false, isShallowReadonly = false) => {
    return (target, key) => {
        const res = Reflect.get(target, key)

         // shallowReadonly
         // shallow 只需要获取表面的那层数据
         if (isShallowReadonly) {
             return res
         }

        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res)
        }

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
const shallowReadonlyGet = createGetter(true, true)

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

export const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet
})

