
export const App = {
    setup() {
        return {
            username: 'BoLi'
        }
    },
    render() {
        return h('div', `hi, ${this.username} `)
    }
};
