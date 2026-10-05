const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// [READ] Lấy top sinh viên GPA cao nhất (đặt trước :studentCode để tránh conflict route)
router.get('/top', studentController.getTopStudents);

// [READ] Lấy danh sách sinh viên & [CREATE] Tạo sinh viên mới
router.route('/')
  .get(studentController.getAllStudents)
  .post(studentController.createStudent);

// [READ], [UPDATE], [DELETE] theo studentCode
router.route('/:studentCode')
  .get(studentController.getStudentByCode)
  .put(studentController.updateStudent)
  .delete(studentController.deleteStudent);

module.exports = router;
