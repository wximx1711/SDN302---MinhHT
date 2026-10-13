const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const app = require('../app');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');
let server, base, member, book, loan;
const missing = 'ffffffffffffffffffffffff';
const bookData = { title: 'Test book', author: 'Test author', category: 'Testing', isbn: 'test-isbn', totalCopies: 3, availableCopies: 3 };
const memberData = { fullName: 'Test member', email: 'test@example.com', phone: '0123456789', membershipType: 'Student' };
async function request(method, route, body, expected) {
  const response = await fetch(base + '/api' + route, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const result = response.status === 204 ? null : await response.json();
  if (expected) assert.equal(response.status, expected, JSON.stringify(result));
  return { status: response.status, data: result };
}
const borrow = (items = [{ book_id: book, quantity: 1 }], member_id = member) => ({ member_id, items, dueDate: '2099-01-01' });
before(async () => {
  // Use a unique test database; never delete or mutate the assignment database.
  const uri = new URL(process.env.TEST_MONGO_URL || 'mongodb://127.0.0.1:27017');
  uri.pathname = '/Lab2_LibraryExam_test_' + process.pid + '_' + Date.now();
  process.env.MONGO_URL = uri.toString();
  await connectDB();
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (mongoose.connection.db && /^Lab2_LibraryExam_test_/.test(mongoose.connection.name)) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
test('dataset import preserves BSON references, timestamps and is idempotent', async () => {
  const importer = require('../scripts/import-data');
  const first = await importer();
  assert.deepEqual(Object.values(first).map(x => x.inserted), [5, 4, 4]);
  const before = await Book.find().lean();
  const second = await importer();
  assert.deepEqual(Object.values(second).map(x => x.inserted), [0, 0, 0]);
  assert.deepEqual(await Book.find().lean(), before);
  assert.ok((await Loan.findOne()).member_id instanceof mongoose.Types.ObjectId);
});
test('book and member CRUD, unique values, defaults, enum and validation', async () => {
  book = (await request('POST', '/books', bookData, 201)).data._id;
  const created = (await request('POST', '/members', memberData, 201)).data;
  member = created._id;
  assert.equal(created.isActive, true);
  for (const path of ['/books', '/members', '/book/' + book, '/books/' + book, '/members/' + member]) await request('GET', path, undefined, 200);
  for (const [path, data] of [['/books', bookData], ['/members', memberData]]) {
    await request('POST', path, data, 409);
    await request('POST', path, {}, 400);
  }
  await request('POST', '/books', { ...bookData, isbn: 'negative', totalCopies: -1 }, 400);
  await request('POST', '/books', { ...bookData, isbn: 'fraction', availableCopies: 1.5 }, 400);
  await request('POST', '/books', { ...bookData, isbn: 'excess', availableCopies: 9 }, 400);
  await request('POST', '/members', { ...memberData, email: 'new@example.com', membershipType: 'VIP' }, 400);
  await request('POST', '/members', { ...memberData, email: 'bad' }, 400);
  await request('PUT', '/books/' + book, { title: 'Updated title' }, 200);
  await request('PUT', '/members/' + member, { fullName: 'Updated member' }, 200);
  await request('PUT', '/books/' + book, { isbn: '9780132350884' }, 409);
  await request('PUT', '/members/' + member, { email: 'an.nguyen@example.com' }, 409);
  await request('PUT', '/books/' + book, { availableCopies: 0 }, 409);
});
test('invalid IDs, missing records, malformed bodies and routes', async () => {
  for (const path of ['/book/', '/books/', '/members/']) {
    await request('GET', path + 'bad', undefined, 400);
    await request('GET', path + missing, undefined, 404);
  }
  for (const path of ['/books/', '/members/']) for (const method of ['PUT', 'DELETE']) {
    await request(method, path + 'bad', {}, 400);
    await request(method, path + missing, {}, 404);
  }
  await request('GET', '/loans/members/bad', undefined, 400);
  await request('GET', '/loans/members/' + missing, undefined, 404);
  await request('PUT', '/loans/bad/return', {}, 400);
  await request('PUT', '/loans/' + missing + '/return', {}, 404);
  await request('POST', '/books', { ...bookData, unexpected: true }, 400);
  const malformed = await fetch(base + '/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  await request('GET', '/unknown', undefined, 404);
});
test('borrowing failures roll back every inventory write', async () => {
  const original = (await Book.findById(book)).availableCopies;
  const count = await Loan.countDocuments();
  await request('POST', '/loans', borrow([], member), 400);
  for (const quantity of [0, -1, 1.5, '1']) await request('POST', '/loans', borrow([{ book_id: book, quantity }]), 400);
  await request('POST', '/loans', { ...borrow(), dueDate: 'invalid' }, 400);
  await request('POST', '/loans', { ...borrow(), dueDate: '2000-01-01' }, 400);
  await request('POST', '/loans', borrow(undefined, missing), 404);
  await request('POST', '/loans', borrow(undefined, '671000000000000000000003'), 409);
  await request('POST', '/loans', borrow([{ book_id: book, quantity: 1 }, { book_id: missing, quantity: 1 }]), 404);
  await request('POST', '/loans', borrow([{ book_id: book, quantity: 4 }]), 409);
  await request('POST', '/loans', borrow([{ book_id: book, quantity: 2 }, { book_id: book, quantity: 2 }]), 409);
  assert.equal((await Book.findById(book)).availableCopies, original);
  assert.equal(await Loan.countDocuments(), count);
});
test('borrow populates references, combines repeated books, protects history and returns once', async () => {
  const result = (await request('POST', '/loans', borrow([{ book_id: book, quantity: 1 }, { book_id: book, quantity: 1 }]), 201)).data;
  loan = result._id;
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].quantity, 2);
  assert.equal(result.member_id.email, memberData.email);
  assert.equal(result.items[0].book_id.isbn, bookData.isbn);
  assert.equal(result.items[0].book_id.availableCopies, undefined);
  assert.equal((await Book.findById(book)).availableCopies, 1);
  await request('GET', '/loans', undefined, 200);
  await request('GET', '/loans/members/' + member, undefined, 200);
  await request('DELETE', '/books/' + book, undefined, 409);
  await request('DELETE', '/members/' + member, undefined, 409);
  const resultReturn = (await request('PUT', '/loans/' + loan + '/return', {}, 200)).data;
  assert.equal(resultReturn.status, 'Returned');
  assert.ok(resultReturn.returnDate);
  await request('PUT', '/loans/' + loan + '/return', {}, 409);
  assert.equal((await Book.findById(book)).availableCopies, 3);
});
test('concurrent borrowers cannot oversell; concurrent returns restore only once', async () => {
  const results = await Promise.all(Array.from({ length: 6 }, () => request('POST', '/loans', borrow())));
  assert.equal(results.filter(x => x.status === 201).length, 3);
  assert.equal(results.filter(x => x.status === 409).length, 3);
  assert.equal((await Book.findById(book)).availableCopies, 0);
  for (const result of results.filter(x => x.status === 201)) {
    const returns = await Promise.all([request('PUT', '/loans/' + result.data._id + '/return', {}), request('PUT', '/loans/' + result.data._id + '/return', {})]);
    assert.deepEqual(returns.map(x => x.status).sort(), [200, 409]);
  }
  assert.equal((await Book.findById(book)).availableCopies, 3);
});
test('multi-book return failure rolls back status and earlier restored stock', async () => {
  const second = await Book.create({ ...bookData, isbn: 'rollback' });
  const borrowed = (await request('POST', '/loans', borrow([{ book_id: book, quantity: 1 }, { book_id: second.id, quantity: 1 }]), 201)).data;
  await Book.collection.updateOne({ _id: second._id }, { $set: { availableCopies: 3 } });
  await request('PUT', '/loans/' + borrowed._id + '/return', {}, 409);
  assert.equal((await Loan.findById(borrowed._id)).status, 'Borrowing');
  assert.equal((await Book.findById(book)).availableCopies, 2);
  await Book.collection.updateOne({ _id: second._id }, { $set: { availableCopies: 2 } });
  await request('PUT', '/loans/' + borrowed._id + '/return', {}, 200);
});
test('unreferenced records can be deleted', async () => {
  const b = (await request('POST', '/books', { ...bookData, isbn: 'delete' }, 201)).data;
  const m = (await request('POST', '/members', { ...memberData, email: 'delete@example.com' }, 201)).data;
  await request('DELETE', '/books/' + b._id, undefined, 204);
  await request('DELETE', '/members/' + m._id, undefined, 204);
});
test('root endpoint lists the API routes', async () => {
  const response = await fetch(base + '/');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.endpoints.includes('PUT /api/loans/:id/return'));
});

test('Postman collection: all 30 requests and embedded assertions', async () => {
  const vm = require('node:vm');
  const collection = require('../postman/Library.postman_collection.json');
  const variables = new Map([['baseUrl', base]]);
  const interpolate = value => value.replace(/\{\{(\w+)\}\}/g, (_, key) => variables.get(key));
  for (const item of collection.item) {
    const pm = { info: { requestName: item.name }, collectionVariables: { set: (key, value) => variables.set(key, value) } };
    for (const event of collection.event || []) vm.runInNewContext(event.script.exec.join('\n'), { pm, Date });
    const response = await fetch(interpolate(item.request.url), {
      method: item.request.method,
      headers: Object.fromEntries(item.request.header.map(header => [header.key, header.value])),
      body: item.request.body ? interpolate(item.request.body.raw) : undefined
    });
    const result = response.status === 204 ? null : await response.json();
    pm.response = { code: response.status, json: () => result, to: { have: { status: expected => assert.equal(response.status, expected, item.name + ': ' + JSON.stringify(result)) } } };
    pm.test = (name, callback) => callback();
    for (const event of item.event) vm.runInNewContext(event.script.exec.join('\n'), { pm });
  }
});

test('failed second stock update compensates the first during borrow and return', async () => {
  const second = await Book.create({ ...bookData, isbn: 'compensation-test' });
  const items = [{ book_id: book, quantity: 1 }, { book_id: second.id, quantity: 1 }];
  const initial = (await Book.findById(book)).availableCopies;
  const originalUpdate = Book.updateOne;
  let calls = 0;
  Book.updateOne = function (...args) {
    if (++calls === 2) return Promise.resolve({ modifiedCount: 0 });
    return originalUpdate.apply(this, args);
  };
  try { await request('POST', '/loans', borrow(items), 409); }
  finally { Book.updateOne = originalUpdate; }
  assert.equal((await Book.findById(book)).availableCopies, initial);
  const created = (await request('POST', '/loans', borrow(items), 201)).data;
  calls = 0;
  Book.updateOne = function (...args) {
    if (++calls === 2) return Promise.resolve({ modifiedCount: 0 });
    return originalUpdate.apply(this, args);
  };
  try { await request('PUT', '/loans/' + created._id + '/return', {}, 409); }
  finally { Book.updateOne = originalUpdate; }
  assert.equal((await Book.findById(book)).availableCopies, initial - 1);
  assert.equal((await Loan.findById(created._id)).status, 'Borrowing');
  await request('PUT', '/loans/' + created._id + '/return', {}, 200);
});

test('loan persistence failure compensates all stock updates', async () => {
  const initial = (await Book.findById(book)).availableCopies;
  const originalCreate = Loan.create;
  Loan.create = async () => { const error = new Error('Simulated rejected loan write'); error.status = 409; throw error; };
  try { await request('POST', '/loans', borrow(), 409); }
  finally { Loan.create = originalCreate; }
  assert.equal((await Book.findById(book)).availableCopies, initial);
  const created = (await request('POST', '/loans', borrow(), 201)).data;
  const originalSave = Loan.prototype.save;
  Loan.prototype.save = async () => { const error = new Error('Simulated rejected return write'); error.status = 409; throw error; };
  try { await request('PUT', '/loans/' + created._id + '/return', {}, 409); }
  finally { Loan.prototype.save = originalSave; }
  assert.equal((await Book.findById(book)).availableCopies, initial - 1);
  assert.equal((await Loan.findById(created._id)).status, 'Borrowing');
  await request('PUT', '/loans/' + created._id + '/return', {}, 200);
});
