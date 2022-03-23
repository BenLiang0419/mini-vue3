
export function reactive(params) {
    
    return new Proxy(params, {

        get (target, key) {
           const res = Reflect.get(target, key)
           // 收集依赖
           return res
        },

        set (target, key, value) {
            const res = Reflect.set(target, key, value)

            // 触发依赖
            return res
        }
        
    })

};
