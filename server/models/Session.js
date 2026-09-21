const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  traineeName: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Excused'], default: 'Present' },
  markedAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseTitle: { type: String, required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerName: { type: String, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  organizationName: { type: String, default: '' },
  
  title: { type: String, required: true },
  description: { type: String, default: '' },
  scheduledDate: { type: Date, required: true },
  durationMinutes: { type: Number, default: 90 },
  venueOrMeetingUrl: { type: String, default: 'https://meet.gov.in/moes-imd-class' },
  sessionType: { type: String, enum: ['Live Virtual Class', 'Laboratory Exercise', 'Interactive Q&A', 'Hands-on Radar Lab'], default: 'Live Virtual Class' },
  
  attendanceList: [attendanceRecordSchema],
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
