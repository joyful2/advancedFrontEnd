<template>
  <div class="hello">
   
  </div>
</template>

<script>
export default {
  name: 'keep',
  data(){
    return{

    }
  },
  // todo  如下是keep-alive的原理（老师翻车没写完），待自己补充学习
//   created(){
//       //创建一个cache对象 缓存的容器 
//       this.cache = Object.create(null)
//   },
//   //销毁
//   destroyed(){
//       for (const key in this.cache) {
//          pruneCacheEntry(this.cache[key])
//       }
//   },
//   render(){
//       //得到slot插槽里面的第一个组件
//       const vnode: VNode = getFirstComponentChild(this.$slots.default)
//       const componentOptions : ?VNodeCompoentOptions = vnode && vnode.componentOptions

//       if(componentOptions){
//           const name: ?string = getComponentName(componentOptions);
//       }
//       if(name &&
//         (this.inclde && !matchs(this.inclde,name))||
//         (this.exclude && matches(this.exclude,name)){
//             return vnode;
//         })
           
        
//   }
}
</script>


