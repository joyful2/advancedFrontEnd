


// dll配置参考文章： https://blog.csdn.net/belloc_li/article/details/120709144
[
  //告诉webpack哪些库不参与打包，同时使用的名称也得变
  new webpack.DllReferencePlugin({
    manifest: path.resolve(__dirname, "dll/manifest.json")
  }),
  new AddAssetHtmlWebpackPlugin([
    {
      filepath: path.resolve(__dirname, "dll/venders.js"),
      publicPath: "./"
    }
  ])
]