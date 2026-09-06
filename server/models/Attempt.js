const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  traineeName: { type: String, required: true },
  
  answers: [{
    questionIndex: Number,
    questionText: String,
    options: [String],
    selectedOption: Number,
    correctOptionIndex: Number,
    isCorrect: Boolean,
    marksAwarded: Number,
    explanation: String
  }],

  scoreObtained: { type: Number, required: true },
  totalPossibleMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },

  timeSpentSeconds: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  mode: { type: String, enum: ['official', 'practice'], default: 'official' }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
