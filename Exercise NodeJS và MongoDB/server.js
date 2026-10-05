require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/students', studentRoutes);

// Trang chủ / thông tin API
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Exercise NodeJS & MongoDB API - Collection Students',
    database: 'se1900_db',
    collection: 'Students',
    endpoints: {
      'GET /api/students': 'Lấy danh sách tất cả sinh viên (lọc theo major, gender, year, minGpa, maxGpa, sortBy)',
      'GET /api/students/top?limit=3': 'Lấy danh sách top sinh viên có GPA cao nhất',
      'GET /api/students/:studentCode': 'Lấy thông tin chi tiết 1 sinh viên theo mã SV (VD: SV001)',
      'POST /api/students': 'Thêm mới 1 sinh viên (Body JSON)',
      'PUT /api/students/:studentCode': 'Cập nhật thông tin sinh viên theo mã SV',
      'DELETE /api/students/:studentCode': 'Xóa sinh viên theo mã SV'
    }
  });
});

// Middleware xử lý 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn ${req.originalUrl} không tồn tại`
  });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('[Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi trên máy chủ',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Test API tại: http://localhost:${PORT}/api/students`);
  console.log(`====================================================`);
});
