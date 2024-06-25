// src/server.ts
import os from 'os'
import Fastify from 'fastify'
import httpProxy from 'http-proxy'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const { PORT, CORS } = process.env

// 获取网络接口列表
const interfaces = os.networkInterfaces()

const fastify = Fastify({
  // 日志
  // logger: true
})

const proxy = httpProxy.createProxyServer({
  // 目标域名
  target: CORS,
  changeOrigin: true,
})

fastify.all('*', (request, reply) => {
  proxy.web(request.raw, reply.raw)
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
    fastify.listen({ port: Number(PORT), host: '::' }).then(ipv6Set)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
