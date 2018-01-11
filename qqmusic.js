//引入express中间件
const express = require('express');
const app = express();

//指定启动服务器到哪个文件夹，我这边指的是dist文件夹
app.use(express.static('./dist'));

//监听端口为3000
app.listen(3500)

console.log('进入 localhost:3500 查看App演示')