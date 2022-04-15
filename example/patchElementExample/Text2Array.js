
import { h, ref } from '../../lib/mini-vue.esm.js'

export const Text2Array = {
    name: 'Text2Text',
    setup() {
        const patchStatus = ref(true)
        window.patchStatus = patchStatus
        return {
            patchStatus
        }
    },
    render() {
        const oldText = h('div', {}, 'Text-Old')
        const arrayComponent = h('div', {}, [h('h1', {}, 'Array-1'), h('h1', {}, 'Array-2')])
        
        return this.patchStatus === true ? oldText : arrayComponent 
    }
};
