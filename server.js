const express = require('express')
const app = express()
const port = 3000
app.use(express.static('./'))
app.use(express.json())

let listData = []

// 增（增加重复校验）
app.post('/api/add', (req, res) => {
    const text = req.body.text.trim()
    if(!text) return res.json({code:0,msg:"内容不能为空"})
    // 判断是否存在相同内容
    const exist = listData.find(item => item.text === text)
    if(exist){
        return res.json({code:-1,msg:"内容重复，不能添加",data:listData})
    }
    listData.push({id:Date.now(), text})
    res.json({code:1,data:listData})
})
// 查
app.get('/api/get', (req, res) => {
    res.json({code:1,data:listData})
})
// 删除
app.post('/api/del', (req, res) => {
    const id = req.body.id
    listData = listData.filter(item=>item.id !== id)
    res.json({code:1,data:listData})
})
// 修改
app.post('/api/edit', (req, res) => {
    const {id,text} = req.body
    const newText = text.trim()
    if(!newText) return res.json({code:0,msg:"内容不能为空"})
    // 修改时也判断重复（排除自己）
    const exist = listData.find(item => item.text === newText && item.id != id)
    if(exist){
        return res.json({code:-1,msg:"内容重复，不能修改",data:listData})
    }
    const target = listData.find(item=>item.id == id)
    if(target) target.text = newText
    res.json({code:1,data:listData})
})

// AI流式聊天接口
app.get('/chat', (req, res) => {
    const msg = req.query.msg
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const reply = '你好呀！我是AI助手，支持聊天和待办管理。'
    let idx = 0
    const timer = setInterval(()=>{
        if(idx < reply.length){
            res.write(`data: ${JSON.stringify({content: reply[idx]})}\n\n`)
            idx++
        }else{
            clearInterval(timer)
            res.end()
        }
    },120)
    req.on('close',()=>clearInterval(timer))
})

app.listen(port, ()=>{
    console.log("服务启动在 http://localhost:3000")
})
