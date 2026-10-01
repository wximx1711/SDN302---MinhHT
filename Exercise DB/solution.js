// Sử dụng database se1900_db
use se1900_db;

// 1. Liệt kê tất cả sinh viên trong collection Students
db.Students.find();

// 2. Liệt kê sinh viên nữ
db.Students.find({ gender: "Female" });

// 3. Liệt kê sinh viên nam
db.Students.find({ gender: "Male" });

// 4. Liệt kê sinh viên ngành Information Technology
db.Students.find({ major: "Information Technology" });

// 5. Liệt kê sinh viên ngành Computer Science
db.Students.find({ major: "Computer Science" });

// 6. Liệt kê sinh viên có GPA từ 3.5 trở lên
db.Students.find({ gpa: { $gte: 3.5 } });

// 7. Liệt kê sinh viên có GPA dưới 3.0
db.Students.find({ gpa: { $lt: 3.0 } });

// 8. Liệt kê sinh viên năm 4
db.Students.find({ year: 4 });

// 9. Liệt kê sinh viên năm 2 hoặc năm 3
db.Students.find({ year: { $in: [2, 3] } });

// 10. Tìm sinh viên có mã SV006
db.Students.find({ studentCode: "SV006" });

// 11. Chỉ hiển thị họ tên, ngành học và GPA của tất cả sinh viên
db.Students.find({}, { _id: 0, fullName: 1, major: 1, gpa: 1 });

// 12. Liệt kê sinh viên có GPA từ 3.0 đến 3.7
db.Students.find({ gpa: { $gte: 3.0, $lte: 3.7 } });

// 13. Sắp xếp danh sách sinh viên theo GPA giảm dần
db.Students.find().sort({ gpa: -1 });

// 14. Lấy 3 sinh viên có GPA cao nhất
db.Students.find().sort({ gpa: -1 }).limit(3);

// 15. Liệt kê tất cả các môn học trong collection Courses
db.Courses.find();

// 16. Liệt kê các môn học có 3 tín chỉ
db.Courses.find({ credits: 3 });

// 17. Liệt kê tất cả các lượt đăng ký môn học trong Enrollments
db.Enrollments.find();

// 18. Liệt kê các lượt đăng ký có điểm từ 8.0 trở lên
db.Enrollments.find({ score: { $gte: 8.0 } });

// 19. Tìm các môn học mà sinh viên SV001 đã đăng ký
db.Enrollments.find({ studentCode: "SV001" }, { _id: 0, courseCode: 1 });

// 20. Tìm các sinh viên đã đăng ký môn IT201
db.Enrollments.find({ courseCode: "IT201" }, { _id: 0, studentCode: 1 });
