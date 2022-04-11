import { getCurrentInstance } from "./component";

// 场景1： 父组件 存， 子组件 取
// 场景2： 父组件 存， 子孙组件 取 

export const provide = (key, value) => {

    // 存值

    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        const { provides } = currentInstance

        provides[key] = value
    }
};

export const inject = (key) => {

    // 取值

    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        // 父类里面拿
        const { parent } = currentInstance
        const { provides } = parent
        // const { provides } = currentInstance

        return provides[key]
    }
};

