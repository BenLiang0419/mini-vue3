import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    _value: any;
    public _rawValue;
    public dep
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

export const ref = (val: any) => {
    return new RefImpl(val)
};

function trackRefEffect(dep) {
    if (isTracking()) {
        trackEffect(dep)
    }
}

function convert(newValue) {
    return isObject(newValue) ? reactive(newValue) : newValue
}
