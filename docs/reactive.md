
# reactive

对象响应

Vue2 使用 Object.defineProperty()

Vue3 使用 Proxy代理

getter

Vue2: `return target[key]`

Vue3: `return Reflect.get(target, key)`

setter

Vue2: `target[key] = value`

Vue3: `Reflect.set(target, key, value)`


