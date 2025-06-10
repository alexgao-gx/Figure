import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // 前端实际端口
    methods: ["GET", "POST"],
    credentials: true
  }
});

function generateOrderStatus() {
  // 订单总数在 100~300 之间波动
  const total = 100 + Math.floor(Math.random() * 200);
  // 已完成 40~80% 之间
  const completed = Math.floor(total * (0.4 + Math.random() * 0.4));
  // 进行中 10~50% 之间（但不能超过剩余订单数）
  const inProgress = Math.floor((total - completed) * (0.1 + Math.random() * 0.4));
  // 异常为剩余
  const abnormal = total - completed - inProgress;
  return { total, completed, inProgress, abnormal };
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // 立即发送初始 mock 数据
  const now = Date.now();
  const mockData = Array.from({ length: 30 }).map((_, i) => {
    const status = generateOrderStatus();
    return {
      timestamp: new Date(now - (29 - i) * 1000).toISOString(),
      value: parseFloat((50 + (Math.random() - 0.5) * 10).toFixed(2)),
      ...status
    };
  });
  socket.emit('initialData', mockData);

  // 然后定时推送实时数据
  let value = 50;
  const interval = setInterval(() => {
    value += (Math.random() - 0.5) * 10;
    const status = generateOrderStatus();
    const data = {
      timestamp: new Date().toISOString(),
      value: parseFloat(value.toFixed(2)),
      ...status
    };
    socket.emit('newData', data);
  }, 1000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/mock', (req, res) => {
  const status = generateOrderStatus();
  const data = {
    timestamp: new Date().toISOString(),
    value: Math.floor(Math.random() * 100) + 1,
    ...status
  };
  res.json(data);
});

server.listen(3001, () => {
  console.log('Socket.IO server running on http://localhost:3001');
});
