
import { baseHandler, readonlyHandler } from './baseHandlers';

export function reactive(params: any) {
    return createReactive(params, baseHandler)
};

export const readonly = (params: any) => {
    return createReactive(params, readonlyHandler)
};

const createReactive = (target, baseHandler) => {
    return new Proxy(target, baseHandler)
}