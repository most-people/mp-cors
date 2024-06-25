// src/server.ts
import os from 'os'
import dotenv from 'dotenv'
import fastify from 'fastify'
import cors from '@fastify/cors'
import httpProxy from 'http-proxy'

// 加载环境变量
dotenv.config()

const { PORT, CORS } = process.env

// 获取网络接口列表
const interfaces = os.networkInterfaces()

const app = fastify({ logger: false })

const proxy = httpProxy.createProxyServer({
  target: CORS, // 目标域名
  changeOrigin: true,
})

// 注册并配置 @fastify/cors 插件
app.register(cors, {
  origin: '*', // 允许所有来源
  methods: '*', // ['GET', 'POST', 'OPTIONS'] 允许的 HTTP 方法
  allowedHeaders: '*', // ['Content-Type', 'Authorization'] 允许的请求头
  credentials: true, // 是否允许发送 Cookie
})

// 代理所有请求
// app.all('*', (request, reply) => {
//   proxy.web(request.raw, reply.raw);
// });

// 代理除 OPTIONS 以外的所有请求
app.route({
  method: ['GET', 'POST'], // 根据需要添加更多的方法
  url: '*',
  handler: (request, reply) => {
    proxy.web(request.raw, reply.raw)
  },
})

proxy.on('error', (err, req, res) => {
  res.end(
    JSON.stringify({
      code: 500,
      msg: 'CORS server: Unknown error',
    }),
  )
})

// 启动服务器
const ipv6Set = () => {
  let ipv4 = ''
  let ipv6 = ''
  // 遍历所有网络接口
  for (const key in interfaces) {
    const faces = interfaces[key]
    // 确保该地址是IPv6且不是内部地址
    if (faces) {
      for (const iface of faces) {
        if (iface && !iface.internal) {
          if (!ipv4 && iface.family === 'IPv4') {
            ipv4 = `http://${iface.address}:${PORT}`
          } else if (!ipv6 && iface.family === 'IPv6') {
            ipv6 = `http://[${iface.address}]:${PORT}`
          }
        }
      }
    }
  }
  console.log(`➜  IPV6:   ${ipv6}`)
  console.log(`➜  IPV4:   ${ipv4}`)
}
const start = () => {
  try {
    app.listen({ port: Number(PORT), host: '::' }).then(ipv6Set)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
