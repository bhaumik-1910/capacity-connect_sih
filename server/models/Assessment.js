const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }, // 0-based
  marks: { type: Number, default: 2 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  competencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competency' },
  explanation: { type: String, default: '' }
});

const assessmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseTitle: { type: String, required: true },
  title: { type: String, required: true },
  instructions: { type: String, default: 'Select the best answer for each question. Time limit is strictly enforced.' },
  durationMinutes: { type: Number, default: 20 },
  passPercentage: { type: Number, default: 60 },
  totalMarks: { type: Number, default: 20 },
  maxAttempts: { type: Number, default: 3 },
  questions: [questionSchema],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
