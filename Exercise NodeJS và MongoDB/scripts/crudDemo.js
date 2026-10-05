require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const runCRUDDemo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/se1900_db';
    console.log('===============================================================');
    console.log('   BẮT ĐẦU CHƯƠNG TRÌNH DEMO CRUD NODE.JS & MONGODB');
    console.log('===============================================================');
    console.log(`[1] Đang kết nối tới MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('    -> Kết nối cơ sở dữ liệu se1900_db thành công!\n');

    // -----------------------------------------------------------------
    // 1. CREATE (Tạo mới)
    // -----------------------------------------------------------------
    console.log('---------------------------------------------------------------');
    console.log(' [CREATE] 1. Thêm mới 1 sinh viên vào collection Students');
    console.log('---------------------------------------------------------------');
    
    // Dọn dẹp dữ liệu test cũ nếu có
    await Student.deleteOne({ studentCode: 'SV999' });

    const newStudentData = {
      studentCode: 'SV999',
      fullName: 'Hoang Tuan Minh',
      gender: 'Male',
      dateOfBirth: '2004-10-15',
      email: 'minh.ht@fpt.edu.vn',
      major: 'Information Technology',
      year: 3,
      gpa: 3.85,
    };

    const createdStudent = await Student.create(newStudentData);
    console.log(' Sinh viên vừa tạo thành công:');
    console.log({
      _id: createdStudent._id,
      studentCode: createdStudent.studentCode,
      fullName: createdStudent.fullName,
      major: createdStudent.major,
      gpa: createdStudent.gpa,
      year: createdStudent.year,
      email: createdStudent.email,
    });
    console.log('');

    // -----------------------------------------------------------------
    // 2. READ (Đọc dữ liệu)
    // -----------------------------------------------------------------
    console.log('---------------------------------------------------------------');
    console.log(' [READ] 2. Truy vấn dữ liệu từ collection Students');
    console.log('---------------------------------------------------------------');

    // a. Tổng số lượng sinh viên
    const totalCount = await Student.countDocuments();
    console.log(`a) Tổng số sinh viên hiện có: ${totalCount}`);

    // b. Tìm sinh viên theo mã SV999 vừa tạo
    const foundStudent = await Student.findOne({ studentCode: 'SV999' });
    console.log(`b) Tìm kiếm theo studentCode 'SV999':`, {
      studentCode: foundStudent.studentCode,
      fullName: foundStudent.fullName,
      major: foundStudent.major,
      gpa: foundStudent.gpa,
    });

    // c. Tìm sinh viên có GPA >= 3.5 và thuộc ngành Information Technology (dựa vào Exercise DB)
    const highGpaStudents = await Student.find({
      major: 'Information Technology',
      gpa: { $gte: 3.5 },
    }).select('studentCode fullName gpa major');
    console.log(`c) Danh sách SV ngành IT có GPA >= 3.5 (tìm thấy ${highGpaStudents.length} bạn):`);
    highGpaStudents.forEach((st) => {
      console.log(`   - [${st.studentCode}] ${st.fullName} | GPA: ${st.gpa}`);
    });
    console.log('');

    // -----------------------------------------------------------------
    // 3. UPDATE (Cập nhật dữ liệu)
    // -----------------------------------------------------------------
    console.log('---------------------------------------------------------------');
    console.log(" [UPDATE] 3. Cập nhật thông tin sinh viên 'SV999'");
    console.log('---------------------------------------------------------------');
    const updatedStudent = await Student.findOneAndUpdate(
      { studentCode: 'SV999' },
      {
        $set: {
          gpa: 3.99,
          year: 4,
          fullName: 'Hoang Tuan Minh (Updated)',
        },
      },
      { new: true } // Trả về tài liệu sau khi update
    );
    console.log(" Kết quả sau khi update sinh viên 'SV999':");
    console.log({
      studentCode: updatedStudent.studentCode,
      fullName: updatedStudent.fullName,
      year: updatedStudent.year,
      gpa: updatedStudent.gpa,
      updatedAt: updatedStudent.updatedAt,
    });
    console.log('');

    // -----------------------------------------------------------------
    // 4. DELETE (Xóa dữ liệu)
    // -----------------------------------------------------------------
    console.log('---------------------------------------------------------------');
    console.log(" [DELETE] 4. Xóa sinh viên test 'SV999' khỏi collection");
    console.log('---------------------------------------------------------------');
    const deleteResult = await Student.deleteOne({ studentCode: 'SV999' });
    console.log(` Kết quả xóa: deletedCount = ${deleteResult.deletedCount}`);

    // Kiểm tra lại để xác thực đã xóa
    const checkDeleted = await Student.findOne({ studentCode: 'SV999' });
    console.log(` Kiểm tra lại SV999 sau khi xóa: ${checkDeleted === null ? 'ĐÃ XÓA THÀNH CÔNG (null)' : 'Vẫn còn'}`);
    console.log('');

    console.log('===============================================================');
    console.log('   HOÀN THÀNH TOÀN BỘ CÁC THAO TÁC CRUD TRÊN MONGODB!');
    console.log('===============================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình thực thi CRUD Demo:', error);
    process.exit(1);
  }
};

runCRUDDemo();
