# Exercise: NodeJS và MongoDB - CRUD Collection Students

Bài tập thực hành kết nối **Node.js** với **MongoDB** (sử dụng **Mongoose**) để thực hiện đầy đủ các thao tác **CRUD** (Create - Read - Update - Delete) trên collection `Students` thuộc cơ sở dữ liệu `se1900_db` (dựa trên bài **Exercise DB**).

---

## 1. Cấu trúc thư mục

```
Exercise NodeJS và MongoDB/
├── config/
│   └── db.js                 # Cấu hình kết nối MongoDB qua Mongoose
├── controllers/
│   └── studentController.js  # Xử lý logic nghiệp vụ CRUD cho Students
├── data/
│   └── Students.json         # Dữ liệu mẫu ban đầu từ Exercise DB
├── models/
│   └── Student.js            # Mongoose Schema & Model cho collection Students
├── routes/
│   └── studentRoutes.js      # Định tuyến các API RESTful CRUD
├── scripts/
│   ├── crudDemo.js           # Kịch bản demo tự động chạy CRUD và in log ra console
│   └── seed.js               # Script nạp dữ liệu mẫu từ Students.json vào MongoDB
├── .env.example              # File cấu hình mẫu môi trường
├── package.json              # Khai báo thông tin dự án & dependencies
├── README.md                 # Hướng dẫn chi tiết
└── server.js                 # Entry point khởi chạy Express Server
```

---

## 2. Chuẩn bị & Cài đặt

### Bước 1: Mở terminal tại thư mục bài tập
```bash
cd "Exercise NodeJS và MongoDB"
```

### Bước 2: Cài đặt thư viện dependencies
```bash
npm install
```

### Bước 3: Đảm bảo MongoDB đang chạy
Mặc định kết nối tới MongoDB local: `mongodb://127.0.0.1:27017/se1900_db`.  
(Bạn có thể tạo file `.env` nếu cần thay đổi cổng hoặc chuỗi kết nối).

---

## 3. Cách chạy ứng dụng

### Cách 1: Nạp dữ liệu mẫu ban đầu (Seed Data)
Để nạp 12 sinh viên mẫu từ `data/Students.json` vào MongoDB:
```bash
npm run seed
```

### Cách 2: Chạy Demo CRUD trực tiếp trên Terminal
Lệnh này sẽ tự động thực hiện tuần tự:
- **C**REATE: Thêm mới 1 sinh viên (`SV999`).
- **R**EAD: Lấy tổng số lượng sinh viên, tìm kiếm theo mã, và lọc sinh viên theo điều kiện (GPA >= 3.5, IT).
- **U**PDATE: Nâng GPA và năm học của sinh viên `SV999`.
- **D**ELETE: Xóa sinh viên `SV999` và xác nhận kết quả xóa.

```bash
npm run crud:demo
```

### Cách 3: Khởi chạy REST API Server
```bash
npm start
```
Server sẽ chạy tại: `http://localhost:5000`

---

## 4. Danh sách các API Endpoints (CRUD)

| Phương thức | Endpoint | Chức năng | Body / Query |
|---|---|---|---|
| **GET** | `/` | Thông tin hướng dẫn và trạng thái API | Không |
| **GET** | `/api/students` | Lấy danh sách tất cả sinh viên | Hỗ trợ query: `gender`, `major`, `year`, `minGpa`, `maxGpa`, `sortBy`, `order` |
| **GET** | `/api/students/top?limit=3` | Lấy danh sách top sinh viên GPA cao nhất | Query: `limit` (mặc định 3) |
| **GET** | `/api/students/:studentCode` | Lấy thông tin chi tiết 1 sinh viên theo mã SV | Param: `studentCode` (ví dụ `SV001`) |
| **POST** | `/api/students` | Thêm mới 1 sinh viên (**Create**) | Body JSON sinh viên |
| **PUT** | `/api/students/:studentCode` | Cập nhật thông tin sinh viên (**Update**) | Body JSON các trường cần cập nhật |
| **DELETE**| `/api/students/:studentCode` | Xóa sinh viên theo mã SV (**Delete**) | Param: `studentCode` |

---

## 5. Ví dụ Request Body (JSON)

### Thêm sinh viên mới (POST `/api/students`)
```json
{
  "studentCode": "SV013",
  "fullName": "Nguyen Van A",
  "gender": "Male",
  "dateOfBirth": "2004-05-10",
  "email": "a.nguyen@example.com",
  "major": "Information Technology",
  "year": 3,
  "gpa": 3.6
}
```

### Cập nhật sinh viên (PUT `/api/students/SV013`)
```json
{
  "fullName": "Nguyen Van A (Updated)",
  "gpa": 3.85,
  "year": 4
}
```
