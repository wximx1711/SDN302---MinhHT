require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Student = require('../models/Student');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/se1900_db';
    console.log(`Đang kết nối tới MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const jsonPath = path.join(__dirname, '..', 'data', 'Students.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const students = JSON.parse(rawData);

    console.log(`Đọc được ${students.length} bản ghi từ Students.json.`);

    // Xóa dữ liệu cũ nếu muốn làm mới (hoặc chỉ insert nếu chưa có)
    await Student.deleteMany({});
    console.log('Đã làm sạch collection Students cũ.');

    const result = await Student.insertMany(students);
    console.log(`Đã nạp thành công ${result.length} sinh viên vào collection Students (database se1900_db)!`);

    await mongoose.disconnect();
    console.log('Ngắt kết nối MongoDB. Seed hoàn tất.');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu (seed):', error);
    process.exit(1);
  }
};

seedData();
