const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  enrollmentNumber: { type: String, trim: true, sparse: true, unique: true },
  mobile: { type: String, default: '' },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: [
      'platform_super_admin',
      'platform_admin',
      'institute_admin',
      'org_admin',
      'trainer',
      'trainee',
      'student',
      'certificate_verifier',
      'admin'
    ], 
    default: 'trainee' 
  },
  isFirstLogin: { type: Boolean, default: false },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    default: null 
  },
  organizationName: { type: String, default: '' },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  qualifications: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  competencies: [{
    competencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competency' },
    competencyName: String,
    level: { type: String, enum: ['Beginner', 'Working', 'Proficient', 'Expert'], default: 'Beginner' },
    score: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'approved' 
  },
  rejectionReason: { type: String, default: '' },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ organizationId: 1 });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
