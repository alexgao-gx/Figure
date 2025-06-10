/// <reference path="./types.d.ts" />
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import cookie from 'cookie';

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // 前端实际端口
    methods: ["GET", "POST"],
    credentials: true
  }
});

interface User {
  username: string;
  password: string;
  role: 'admin' | 'supplier';
}

const users: User[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'supplier', password: 'supplier123', role: 'supplier' }
];

function auth(role: 'admin' | 'supplier'): express.RequestHandler {
  return (req, res, next) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    if (!cookies.user) {
      res.redirect('/login.html');
      return;
    }
    try {
      const user = JSON.parse(cookies.user);
      if (user.role !== role) {
        res.status(403).send('Forbidden');
        return;
      }
      (req as any).user = user;
      next();
    } catch {
      res.redirect('/login.html');
      return;
    }
  };
}

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

app.get('/', (_req, res) => {
  res.redirect('/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    u => u.username === username && u.password === password
  );
  if (!user) {
    return res.redirect('/login.html?error=1');
  }
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('user', JSON.stringify({ username: user.username, role: user.role }), {
      httpOnly: true,
      maxAge: 60 * 60
    })
  );
  res.redirect(user.role === 'admin' ? '/admin' : '/supplier');
});

app.get('/admin', auth('admin'), (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/supplier', auth('supplier'), (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/supplier.html'));
});

app.get('/logout', (_req, res) => {
  res.setHeader('Set-Cookie', cookie.serialize('user', '', { maxAge: -1 }));
  res.redirect('/login.html');
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
