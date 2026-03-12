require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (thay thế MongoDB)
const users = [];

// Hash password helper for default admin
const hashPassword = async (pass) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pass, salt);
};

// Create default admin account
(async () => {
  const adminHashedPassword = await hashPassword('admin123');
  users.push({
    _id: 'admin_1',
    username: 'admin',
    email: 'admin@conson.com',
    password: adminHashedPassword,
    displayName: 'Quản trị viên',
    role: 'admin',
    completedTasks: [],
    longTermProgress: { distance: 0, usingPersonalBottle: false },
    createdAt: new Date()
  });
  console.log('🔑 Đã khởi tạo tài khoản Admin: admin / admin123');
})();

const JWT_SECRET = process.env.JWT_SECRET || 'conson_super_secret_key_2024';

// Auth Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Admin Middleware
const adminMiddleware = (req, res, next) => {
  const user = users.find(u => u._id === req.userId);
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho Admin.' });
  }
};

// Sample tasks data
const sampleTasks = [
  {
    _id: '1',
    title: 'Thưởng thức Bánh Xèo',
    description: 'Đến quầy bánh dân gian trải nghiệm món bánh xèo giòn rụm đặc trưng miền Tây',
    type: 'food',
    category: 'short-term',
    location: { name: 'Quầy Cô Ba', description: 'Đầu đường chính Cồn Sơn' },
    duration: 20,
    points: 15,
    icon: '🥞',
    order: 1
  },
  {
    _id: '2',
    title: 'Trang trí Nón Lá',
    description: 'Vẽ và trang trí nón lá theo phong cách riêng của bạn',
    type: 'craft',
    category: 'short-term',
    location: { name: 'Quầy Chú Năm', description: 'Khu thủ công mỹ nghệ' },
    duration: 30,
    points: 25,
    icon: '🎨',
    order: 2
  },
  {
    _id: '3',
    title: 'Trải nghiệm Bán Hàng',
    description: 'Trải nghiệm làm người đứng quầy bán bánh tráng trộn trong 30 phút',
    type: 'community',
    category: 'short-term',
    location: { name: 'Quầy Bánh Tráng Trộn', description: 'Khu ẩm thực đường chính' },
    duration: 30,
    points: 50,
    icon: '🏪',
    order: 3
  },
  {
    _id: '4',
    title: 'Hành trình khám phá',
    description: 'Khám phá Cồn Sơn bằng cách di chuyển và tích lũy ít nhất 2000m',
    type: 'health',
    category: 'long-term',
    location: { name: 'Toàn bộ Cồn Sơn' },
    duration: 0,
    points: 100,
    icon: '🏃',
    order: 4
  },
  {
    _id: '5',
    title: 'Bảo vệ Môi trường',
    description: 'Mang theo bình nước cá nhân, không sử dụng ly nhựa trong suốt chuyến tham quan',
    type: 'environment',
    category: 'long-term',
    location: { name: 'Toàn bộ Cồn Sơn' },
    duration: 0,
    points: 75,
    icon: '🌿',
    order: 5
  },
  {
    _id: '6',
    title: 'Thưởng thức Chè Bưởi',
    description: 'Nếm thử món chè bưởi mát lạnh đặc sản Cồn Sơn',
    type: 'food',
    category: 'short-term',
    location: { name: 'Quầy Chè Cô Tư', description: 'Gần bến thuyền' },
    duration: 15,
    points: 10,
    icon: '🍨',
    order: 6
  },
  {
    _id: '7',
    title: 'Học làm Bánh Dân Gian',
    description: 'Tham gia workshop học làm bánh lá dừa truyền thống',
    type: 'craft',
    category: 'short-term',
    location: { name: 'Khu Workshop', description: 'Nhà văn hóa Cồn Sơn' },
    duration: 45,
    points: 35,
    icon: '🍰',
    order: 7
  }
];

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc tên đăng nhập đã được sử dụng' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      _id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      displayName: displayName || username,
      role: 'user',
      completedTasks: [],
      longTermProgress: { distance: 0, usingPersonalBottle: false },
      createdAt: new Date()
    };
    users.push(newUser);

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Đăng ký thành công: ${username}`);

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Find user by email or username
    const user = users.find(u => u.email === identifier || u.username === identifier);
    if (!user) {
      return res.status(400).json({ message: 'Email/tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email/tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Đăng nhập thành công: ${user.username}`);

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        completedTasks: user.completedTasks,
        longTermProgress: user.longTermProgress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u._id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json({
    ...userWithoutPassword,
    id: user._id // Đảm bảo có id đồng nhất với login
  });
});

// ============ TASK ROUTES ============

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(sampleTasks);
});

// Get user's task progress
app.get('/api/tasks/progress', authMiddleware, (req, res) => {
  const user = users.find(u => u._id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  const completedTaskIds = user.completedTasks.map(t => t.taskId);
  const tasksWithProgress = sampleTasks.map(task => ({
    ...task,
    isCompleted: completedTaskIds.includes(task._id)
  }));

  res.json({
    tasks: tasksWithProgress,
    longTermProgress: user.longTermProgress,
    totalCompleted: user.completedTasks.length
  });
});

// Complete a task
app.post('/api/tasks/complete/:taskId', authMiddleware, (req, res) => {
  const { taskId } = req.params;
  const user = users.find(u => u._id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  const alreadyCompleted = user.completedTasks.some(t => t.taskId === taskId);
  if (alreadyCompleted) {
    return res.status(400).json({ message: 'Bạn đã hoàn thành nhiệm vụ này rồi!' });
  }

  user.completedTasks.push({ taskId, completedAt: new Date() });

  console.log(`🎉 ${user.username} hoàn thành task: ${taskId}`);

  res.json({
    message: '🎉 Chúc mừng! Bạn đã hoàn thành nhiệm vụ!',
    completedTasks: user.completedTasks
  });
});

// Update long-term progress
app.patch('/api/tasks/long-term', authMiddleware, (req, res) => {
  const { distance, usingPersonalBottle } = req.body;
  const user = users.find(u => u._id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  if (distance !== undefined) {
    user.longTermProgress.distance = distance;
  }
  if (usingPersonalBottle !== undefined) {
    user.longTermProgress.usingPersonalBottle = usingPersonalBottle;
  }

  res.json({
    message: 'Cập nhật tiến trình thành công!',
    longTermProgress: user.longTermProgress
  });
});

// ============ ADMIN ROUTES ============

// Get all users (Admin only)
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const totalTasksAvailable = sampleTasks.length;

  const allUsers = users.map(u => {
    const { password, ...userWithoutPassword } = u;

    // Calculate total points
    const userPoints = sampleTasks
      .filter(t => u.completedTasks.some(ct => ct.taskId === t._id))
      .reduce((sum, t) => sum + t.points, 0);

    // Get last completion time
    const lastCompletedAt = u.completedTasks.length > 0
      ? new Date(Math.max(...u.completedTasks.map(t => new Date(t.completedAt))))
      : null;

    // Determine status
    let status = 'Chưa bắt đầu';
    if (u.completedTasks.length === totalTasksAvailable) {
      status = 'Đã hoàn thành';
    } else if (u.completedTasks.length > 0 || u.longTermProgress.distance > 0) {
      status = 'Đang thực hiện';
    }

    return {
      ...userWithoutPassword,
      completedCount: u.completedTasks.length,
      totalTasks: totalTasksAvailable,
      points: userPoints,
      lastCompletedAt,
      status
    };
  });

  // Sort: Role Admin always on top, then by points (desc), then by lastCompletedAt (asc/earlier is better)
  const sortedUsers = allUsers.sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;

    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (a.lastCompletedAt && b.lastCompletedAt) {
      return new Date(a.lastCompletedAt) - new Date(b.lastCompletedAt);
    }

    return 0;
  });

  res.json(sortedUsers);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Cồn Sơn Tourism API is running!',
    users: users.length
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 In-memory storage (không cần MongoDB)`);
  console.log(`\n🔗 API Endpoints:`);
  console.log(`   POST /api/auth/register - Đăng ký`);
  console.log(`   POST /api/auth/login - Đăng nhập`);
  console.log(`   GET  /api/tasks - Lấy danh sách nhiệm vụ`);
});

module.exports = app;
