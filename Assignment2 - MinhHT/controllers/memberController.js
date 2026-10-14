const Member = require('../models/Member');
const Loan = require('../models/Loan');
const { fail, validId, bodyFields } = require('./validation');
const fields = ["fullName","email","phone","membershipType","isActive"];

exports.list = async (req, res) => res.json(await Member.find());

exports.get = async (req, res) => {
  validId(req.params.id);
  const record = await Member.findById(req.params.id);
  if (!record) fail(404, 'Member not found');
  res.json(record);
};

exports.create = async (req, res) => {
  const record = await Member.create(bodyFields(req.body, fields));
  res.status(201).json(record);
};

exports.update = async (req, res) => {
  validId(req.params.id);
  const input = bodyFields(req.body, fields);
  const record = await Member.findById(req.params.id);
  if (!record) fail(404, 'Member not found');
  record.set(input);
  await record.save();
  res.json(record);
};

exports.remove = async (req, res) => {
  validId(req.params.id);
  const record = await Member.findById(req.params.id);
  if (!record) fail(404, 'Member not found');
  if (await Loan.exists({ 'member_id': record._id })) fail(409, 'Cannot delete a record referenced by a loan');
  await record.deleteOne();
  res.status(204).end();
};
