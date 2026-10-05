const Student = require('../models/Student');

// [CREATE] Thêm mới 1 sinh viên
// POST /api/students
exports.createStudent = async (req, res) => {
  try {
    const { studentCode, fullName, gender, dateOfBirth, email, major, year, gpa } = req.body;

    // Kiểm tra trùng lặp studentCode hoặc email
    const existingStudent = await Student.findOne({
      $or: [{ studentCode: studentCode?.toUpperCase() }, { email: email?.toLowerCase() }],
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Sinh viên với mã sinh viên hoặc email này đã tồn tại',
      });
    }

    const newStudent = await Student.create({
      studentCode,
      fullName,
      gender,
      dateOfBirth,
      email,
      major,
      year,
      gpa,
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm mới sinh viên thành công',
      data: newStudent,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo sinh viên',
      error: error.message,
    });
  }
};

// [READ] Lấy danh sách tất cả sinh viên (hỗ trợ lọc theo major, gender, year, gpa, sắp xếp)
// GET /api/students
exports.getAllStudents = async (req, res) => {
  try {
    const { major, gender, year, minGpa, maxGpa, sortBy, order } = req.query;

    const filter = {};
    if (major) {
      filter.major = { $regex: new RegExp(major, 'i') };
    }
    if (gender) {
      filter.gender = gender;
    }
    if (year) {
      filter.year = Number(year);
    }
    if (minGpa || maxGpa) {
      filter.gpa = {};
      if (minGpa) filter.gpa.$gte = Number(minGpa);
      if (maxGpa) filter.gpa.$lte = Number(maxGpa);
    }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.studentCode = 1;
    }

    const students = await Student.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sinh viên',
      error: error.message,
    });
  }
};

// [READ] Lấy top sinh viên có GPA cao nhất
// GET /api/students/top?limit=3
exports.getTopStudents = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 3;
    const topStudents = await Student.find().sort({ gpa: -1 }).limit(limit);

    return res.status(200).json({
      success: true,
      count: topStudents.length,
      data: topStudents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách top sinh viên',
      error: error.message,
    });
  }
};

// [READ] Lấy chi tiết 1 sinh viên theo studentCode
// GET /api/students/:studentCode
exports.getStudentByCode = async (req, res) => {
  try {
    const { studentCode } = req.params;
    const student = await Student.findOne({ studentCode: studentCode.toUpperCase() });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sinh viên có mã: ${studentCode}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm sinh viên',
      error: error.message,
    });
  }
};

// [UPDATE] Cập nhật thông tin sinh viên theo studentCode
// PUT /api/students/:studentCode
exports.updateStudent = async (req, res) => {
  try {
    const { studentCode } = req.params;
    const updates = req.body;

    // Không cho phép sửa đổi studentCode qua route này
    delete updates.studentCode;

    const updatedStudent = await Student.findOneAndUpdate(
      { studentCode: studentCode.toUpperCase() },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sinh viên có mã: ${studentCode} để cập nhật`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin sinh viên thành công',
      data: updatedStudent,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật sinh viên',
      error: error.message,
    });
  }
};

// [DELETE] Xóa sinh viên theo studentCode
// DELETE /api/students/:studentCode
exports.deleteStudent = async (req, res) => {
  try {
    const { studentCode } = req.params;
    const deletedStudent = await Student.findOneAndDelete({
      studentCode: studentCode.toUpperCase(),
    });

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sinh viên có mã: ${studentCode} để xóa`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa thành công sinh viên ${studentCode}`,
      data: deletedStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sinh viên',
      error: error.message,
    });
  }
};
