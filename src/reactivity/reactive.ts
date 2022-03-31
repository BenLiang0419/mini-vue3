
import { baseHandler, flags, readonlyHandler, shallowReadonlyHandler } from './baseHandlers';

type Proxy = ProxyConstructor

export const isReactive = (target) => {
    return !!target[flags.IS_REACTIVE]
};

export const isReadonly = (target) => {
    return !!target[flags.IS_READONLY]
};

export function reactive(params: any) {
    return createReactive(params, baseHandler)
};

export const readonly = (params: any) => {
    return createReactive(params, readonlyHandler)
};

export const shallowReadonly = (params: any) => {
    return createReactive(params, shallowReadonlyHandler)
};

export const isProxy = (params: any) => {
    // 判断是reactive 或者 判断是isReadOnly
    return isReactive(params) || isReadonly(params)
}

const createReactive = (target, baseHandler) => {
    return new Proxy(target, baseHandler)
}