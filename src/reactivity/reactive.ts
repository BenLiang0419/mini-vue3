
import { baseHandler, flags, readonlyHandler, shallowReadonlyHandler } from './baseHandlers';

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

const createReactive = (target, baseHandler) => {
    return new Proxy(target, baseHandler)
}