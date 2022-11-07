
<template>
<div class="msg-box" v-if="show">
  {{msg}}
</div>

</template>

<script>
export default {
  name:'joeMsg',
  data(){
    return {
      msg:'默认信息',
      show:false,
    }
  },
    props:{
      
    },

    methods:{
      alert(msg,time){
        this.msg = msg
        this.show = true 
        setTimeout(()=>{
          this.show = false 
        },time || 1000)
      }

    }
   
   
}
</script>
<style scoped>
.msg-box {
  width: 100px;
  height: 100px;
  background-color: #ccc;
  position: fixed;
  left: 50%;
  top: 50%;
  transform:translate(-50%,-50%);
  /* display: none; */
}
</style>
