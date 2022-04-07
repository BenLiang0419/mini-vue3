import { camelize, toHandlerKey } from "../shared";

export const emit = (instance, event, ...args) => {

    const { props } = instance

    // 通过自定义事件名称 获取 事件
    const handler = props[toHandlerKey(camelize(event))]

    handler && handler(...args)
};
