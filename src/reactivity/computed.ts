import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
    private _effect: any;
    private _dirty: boolean = true;
    private _value: string = '';
    constructor(runner) {
        this._effect = new ReactiveEffect(runner, () => {
            this._dirty = true;
        });
    }
    
    public get value() : string {
        // 判断是不是第一次获取，如果是第一次获取则使用 dirty 进行缓存
        if (this._dirty) {
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }

}

export const computed = (getterFn) => {
    return new ComputedRefImpl(getterFn)
};
