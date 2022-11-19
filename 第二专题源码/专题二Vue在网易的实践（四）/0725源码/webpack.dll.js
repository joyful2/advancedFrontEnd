/**
 * 利用dll技术，对包进行单独打包
 */
const path = require("path");
const { resolve } = require("path");
const webpack = require("webpack");
module.exports = {
  mode: "production",
  entry: {
    venders: ["vue","vuex","axios"]
  },
  output: {
    filename: "[name].js",
    path: resolve(__dirname, "dll"),
    library: "[name]_[hash]" //打包出来的库对外暴露出来的内容叫什么名字
  },

  // 如下是讲师的代码，说是不配别名会报错
  resolve:{
    alias: {
      vue$:path.resolve(__dirname,'../node_modules/vue/dist/vue.esm.js'),
      'vue-router$':path.resolve(__dirname,'../node_modules/vue-router/dist/vue-router.esm.js')
    }
  },
  // 如上是讲师的代码

  plugins: [
    // 配置环境变量
    // new webpack.DefinePlugin({
    //   'process.env':{
    //     NODE_ENV: `${env.NODE_ENV}`
    //   }
    // }),
    new webpack.optimize.UglifyPlugin({
      compress:{warnings:false}
    }),
    //打包生成一个manifest.json --> 提供映射关系
    new webpack.DllPlugin({
      name: "[name]_[hash]", //映射库的暴露的内容名称
      path: resolve(__dirname, "dll/manifest.json") //输出文件路径
    }),

  ]
};