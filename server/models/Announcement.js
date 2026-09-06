const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['General', 'Urgent', 'Assessment', 'Workshop', 'System'], default: 'General' },
  audience: { type: String, enum: ['all', 'trainee', 'trainer', 'admin'], default: 'all' },
  authorName: { type: String, default: 'MoES Capacity Building Cell' },
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
