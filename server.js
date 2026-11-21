const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname)))
app.use(express.json())

let todoList = []

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// 新增
app.post('/api/add', (req, res) => {
  const text = req.body.text
  if (!text) {
    return res.json({ ok: false, msg: '内容不能为空' })
  }
  if (todoList.includes(text)) {
    return res.json({ ok: false, msg: '该内容已存在，不能重复保存！' })
  }
  todoList.push(text)
  res.json({ ok: true, msg: '添加成功' })
})

// 获取列表
app.get('/api/get', (req, res) => {
  res.json(todoList)
})

// 删除（按索引）
app.post('/api/del', (req, res) => {
  const idx = req.body.index
  if (Number.isFinite(idx) && idx >= 0 && idx < todoList.length) {
    todoList.splice(idx, 1)
    return res.json({ ok: true, msg: '删除成功' })
  }
  res.json({ ok: false, msg: '删除失败，索引错误' })
})

// 修改
app.post('/api/edit', (req, res) => {
  const idx = req.body.index
  const text = req.body.text
  if (!text) {
    return res.json({ ok: false, msg: '内容不能为空' })
  }
  if(todoList.includes(text) && todoList[idx] !== text){
    return res.json({ ok: false, msg: '该内容已存在！' })
  }
  todoList[idx] = text
  res.json({ ok: true, msg: '修改成功' })
})

// AI 流式对话
app.get('/chat', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const content = req.query.content || ''
  let reply = ''
  if (content.includes('帮我加一条')) {
    const val = content.replace('帮我加一条', '').trim()
    if (!val) {
      reply = '请输入待办内容！'
    } else if (todoList.includes(val)) {
      reply = '⚠️该待办已存在，不能重复保存！'
    } else {
      todoList.push(val)
      reply = `✅已添加待办：${val}`
    }
  } else if (content.includes('查询我的待办')) {
    if(todoList.length === 0){
      reply = '📭暂无待办'
    }else{
      reply = '📋你的待办：\n' + todoList.map((item,i)=>`${i+1}. ${item}`).join('\n')
    }
  }else if(content.includes('删除第一条')){
    if(todoList.length>0){
      todoList.shift()
      reply = '✅已删除第一条待办'
    }else{
      reply = '没有待办可以删除'
    }
  }else{
    reply = '我是你的 AI 助手，可以对我说：帮我加一条 xxx、查询我的待办、删除第一条'
  }

  let i = 0
  const timer = setInterval(()=>{
    if(i < reply.length){
      res.write(`data:${reply[i]}\n\n`)
      i++
    }else{
      clearInterval(timer)
      res.write('data:[DONE]\n\n')
      res.end()
    }
  },80)
})

app.listen(port, () => {
  console.log(`服务启动：http://127.0.0.1:${port}`)
})
