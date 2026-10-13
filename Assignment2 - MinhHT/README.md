# Assignment 2 - Library Management API

Express and Mongoose MVC API for books, members, borrowing and returning.

## Setup

Install Node.js 22.12+ and MongoDB Community Server. Start the normal MongoDB service on port 27017, then open a terminal in `Assignment2 - MinhHT`:

```powershell
npm install
Copy-Item .env.example .env
npm run import
npm run dev
```

Open **http://localhost:3000/** for the success message and endpoint list. `npm start` runs without nodemon. Run only one API instance; if port 3000 is occupied, stop the earlier instance of this project.

The environment template contains:

```dotenv
MONGO_URL=mongodb://127.0.0.1:27017/Lab2_LibraryExam
PORT=3000
```

In MongoDB Compass, connect to `mongodb://127.0.0.1:27017` and open **Lab2_LibraryExam**. The import creates exactly `books`, `members` and `loans` from the original `DB/*.json` files (5 books, 4 members, 4 loans). Repeated imports preserve existing records, IDs, dates and inventory without duplicating records.

## Project files

`models/`, `controllers/`, `routes/`, `config/` and `middleware/` contain the MVC implementation. `app.js` configures Express for both startup and testing; `server.js` connects and listens. `scripts/import-data.js` imports the provided datasets. `DB/Shema.txt` is the original schema reference.

## API

| Method | Endpoint | Action |
| --- | --- | --- |
| GET | `/` | Success message and routes |
| GET, POST | `/api/books` | List/create books |
| GET | `/api/book/:id` | Book detail |
| GET, PUT, DELETE | `/api/books/:id` | Detail alias/update/delete |
| GET, POST | `/api/members` | List/create members |
| GET, PUT, DELETE | `/api/members/:id` | Detail/update/delete |
| GET, POST | `/api/loans` | List/borrow |
| GET | `/api/loans/members/:memberID` | Member loan history |
| PUT | `/api/loans/:id/return` | Return all loan items |

Borrow example:

```json
{
  "member_id": "671000000000000000000001",
  "items": [{ "book_id": "670000000000000000000001", "quantity": 1 }],
  "dueDate": "2099-01-01T00:00:00Z"
}
```

Return accepts `{}`. Loans populate selected member and book fields using ObjectId references. Only active members can borrow available copies. Returns restore quantities and cannot be repeated. ISBN/email are unique; membershipType is Student, Teacher or Guest; isActive defaults to true. Copies must be non-negative integers and quantities positive integers. Records referenced by loan history cannot be deleted. Stock edits preserve the number of borrowed copies.

Responses: 200 success, 201 created, 204 deleted, 400 invalid input/ID, 404 missing record, 409 conflict.

## Testing

In another terminal, with MongoDB running:

```powershell
npm test
Invoke-RestMethod http://localhost:3000/
```

Tests exercise all endpoints, validation, duplicate imports, concurrent borrowing/returns, simulated write failures and all 30 Postman requests. Tests use and remove only their own temporary database on port 27017; assignment records are untouched.

Import `postman/Library.postman_collection.json` into Postman and run requests in order. It uses `http://localhost:3000`, saves created IDs and retains demo loan history.

## Standalone MongoDB limitation

Requests are serialized within one API process, stock updates are conditional, and handled failures compensate completed inventory updates. Use Compass for viewing while the API is running. This is **not a multi-document transaction**: a crash, database/network outage or external writer can still require inventory reconciliation. Full crash-safe atomicity from Task 3 cannot be guaranteed on the required standalone MongoDB server.

`.env`, dependencies, logs, temporary files and local database storage are excluded from Git. Only the non-secret `.env.example` is submitted.
