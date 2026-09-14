const mongoose = require('mongoose');

const moduleItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf', 'slides', 'document', 'interactive'], default: 'video' },
  durationMinutes: { type: Number, default: 15 },
  contentUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  description: { type: String, default: '' },
  notes: { type: String, default: '' }
});

const courseModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sequence: { type: Number, default: 1 },
  items: [moduleItemSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { type: String, required: true },
  outcomes: [{ type: String }],
  prerequisites: [{ type: String }],
  level: { type: String, enum: ['Foundational', 'Intermediate', 'Advanced', 'Executive'], default: 'Intermediate' },
  durationWeeks: { type: Number, default: 4 },
  durationHours: { type: Number, default: 24 },
  capacity: { type: Number, default: 100 },
  thumbnail: { type: String, default: '' },
  
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerName: { type: String, default: 'Dr. A. K. Sharma' },
  
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  organizationName: { type: String, default: 'India Meteorological Department (IMD)' },
  
  competencyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competency' }],
  targetCompetencyLevel: { type: String, enum: ['Beginner', 'Working', 'Proficient', 'Expert'], default: 'Proficient' },

  modules: [courseModuleSchema],

  status: { 
    type: String, 
    enum: ['draft', 'review', 'published', 'archived', 'rejected'], 
    default: 'published' 
  },
  reviewFeedback: { type: String, default: '' },
  version: { type: Number, default: 1 },

  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', default: null },

  // --- Per-Course Certificate Template (set by Trainer) ---
  certificateTemplate: {
    // Background image URL (PNG/JPG — trainer uploads their design)
    backgroundUrl: { type: String, default: '' },
    // Custom title text on certificate (e.g. "Certificate of Excellence")
    titleText: { type: String, default: '' },
    // Trainer's name on cert (auto-set from trainerName if blank)
    trainerSignatureName: { type: String, default: '' },
    trainerSignatureDesignation: { type: String, default: '' },
    // Accent / border color for certificate frame (hex)
    accentColor: { type: String, default: '#b45309' },
    // Whether to use the custom background (overlay mode)
    useCustomBackground: { type: Boolean, default: false }
  }
}, { timestamps: true });

courseSchema.index({ status: 1, category: 1, createdAt: -1 });
courseSchema.index({ trainerId: 1, createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
