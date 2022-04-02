import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    _value: any;
    public _rawValue;
    public dep;
    private __v_isRef: boolean = true;
    constructor(_value: any) {
        this._value = convert(_value)
        this._rawValue = _value
        this.dep = new Set()
    }

    get value() {
        trackRefEffect(this.dep)
        return this._value
    }

    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            triggerEffect(this.dep)
        }
    }
}

function trackRefEffect(dep) {
    if (isTracking()) {
        trackEffect(dep)
    }
}

function convert(newValue) {
    return isObject(newValue) ? reactive(newValue) : newValue
}

export const ref = (val: any) => {
    return new RefImpl(val)
};

export const isRef = (ref) => {
    // 在RefImpl 里面给一个判断值
    return !!ref.__v_isRef
};

export const unRef = (ref) => {
    // 判断是不是ref
    //   -- 如果是ref，则直接ref.value
    //   -- 如果不是ref，则直接返回ref
    return isRef(ref) ? ref.value : ref
};

export const proxyRef = (proxyTarget) => {
    return new Proxy(proxyTarget, {
        get(target, key) {
            // 利用unRef判断获取值
            return unRef(Reflect.get(target, key))
        },
        set(target, key, value) {
            // 判断是不是ref 如果是ref，且返回的值不是ref，则使用.value来赋值
            // 否则直接赋值
            if(isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            } else {
                return Reflect.set(target, key, value)
            }
        }
    })
};



