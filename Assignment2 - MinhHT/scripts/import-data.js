const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');
async function importData() {
  const mapping = { books: new Map(), members: new Map() };
  const counts = {};
  for (const [name, Model, unique] of [['books', Book, 'isbn'], ['members', Member, 'email'], ['loans', Loan, null]]) {
    const rows = JSON.parse(fs.readFileSync(path.join(__dirname, '../DB', name + '.json'), 'utf8'));
    let inserted = 0;
    for (const row of rows) {
      const sourceId = row._id;
      if (name === 'loans') {
        row.member_id = mapping.members.get(row.member_id) || row.member_id;
        row.items = row.items.map(item => ({ ...item, book_id: mapping.books.get(item.book_id) || item.book_id }));
        if (!await Member.exists({ _id: row.member_id })) throw new Error('Missing imported member');
        for (const item of row.items) if (!await Book.exists({ _id: item.book_id })) throw new Error('Missing imported book');
      }
      const document = new Model(row);
      await document.validate();
      const filter = unique ? { $or: [{ _id: document._id }, { [unique]: document[unique] }] } : { _id: document._id };
      const existing = await Model.find(filter);
      if (existing.length > 1) throw new Error('Conflicting existing ID and ' + unique + '; no records overwritten');
      if (existing.length) {
        if (unique && existing[0][unique] !== document[unique]) throw new Error('Existing ID belongs to another record; import stopped');
        if (mapping[name]) mapping[name].set(sourceId, existing[0]._id.toString());
        continue;
      }
      // Insert only; never reset timestamps, inventory, or loan status on reruns.
      const result = await Model.collection.updateOne({ _id: document._id }, { $setOnInsert: document.toObject() }, { upsert: true });
      inserted += result.upsertedCount;
      if (mapping[name]) mapping[name].set(sourceId, document._id.toString());
    }
    counts[name] = { source: rows.length, inserted, skipped: rows.length - inserted, total: await Model.countDocuments() };
  }
  return counts;
}
if (require.main === module) connectDB().then(importData).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error); process.exitCode = 1; }).finally(() => mongoose.disconnect());
module.exports = importData;
