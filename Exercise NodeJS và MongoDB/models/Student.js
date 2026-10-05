const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentCode: {
      type: String,
      required: [true, 'Student code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a valid gender (Male, Female, Other)',
      },
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    major: {
      type: String,
      required: [true, 'Major is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year of study is required'],
      min: [1, 'Year must be at least 1'],
      max: [7, 'Year must not exceed 7'],
    },
    gpa: {
      type: Number,
      required: [true, 'GPA is required'],
      min: [0.0, 'GPA cannot be less than 0.0'],
      max: [4.0, 'GPA cannot be greater than 4.0'],
    },
  },
  {
    collection: 'Students',
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
