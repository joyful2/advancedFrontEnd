
import msg from './plugins/joeMsg'

 const plugin = {
  install(vue){
    console.log('vue:',vue);
    vue.$name = 'joe'
    vue.prototype.age = '18'
    vue.mixin({
      methods:{
        sayHi(name){
          alert('hi'+name)
        }
      }
    })

    vue.component(msg.name,msg)

  }
}
export default plugin
