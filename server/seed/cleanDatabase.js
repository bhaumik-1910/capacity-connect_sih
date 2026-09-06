const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Organization = require('../models/Organization');
const Competency = require('../models/Competency');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const Session = require('../models/Session');

dotenv.config({ path: __dirname + '/../.env' });

const cleanDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/capacity_connect');
    console.log('[Clean] Connected to MongoDB Atlas');

    // 1. Wipe all transactional / activity data (0 certificates, 0 enrollments, 0 sessions, 0 audit logs, 0 announcements)
    await Promise.all([
      Certificate.deleteMany({}),
      Enrollment.deleteMany({}),
      Session.deleteMany({}),
      AuditLog.deleteMany({}),
      Announcement.deleteMany({}),
      Course.deleteMany({}),
      Assessment.deleteMany({})
    ]);
    console.log('[Clean] Purged all dummy certificates, enrollments, sessions, announcements, courses, and assessments.');

    // 2. Remove all accounts except the 3 exact official accounts
    await User.deleteMany({
      email: {
        $nin: ['bhaumikkothiya1@gmail.com', 'rushit@gmail.com', 'deep@gmail.com']
      }
    });
    console.log('[Clean] Removed all dummy mock users.');

    // 3. Ensure the 3 real official accounts exist with known credentials
    const salt = await bcrypt.genSalt(10);

    // Core Organization (dynamic check, no static hardcoding)
    const imdOrg = await Organization.findOne();

    // 1. Admin
    const adminHash = await bcrypt.hash('Bhaumik@1910', salt);
    await User.findOneAndUpdate(
      { email: 'bhaumikkothiya1@gmail.com' },
      {
        name: 'Bhaumik Kothiya',
        email: 'bhaumikkothiya1@gmail.com',
        password: adminHash,
        role: 'platform_admin',
        designation: 'Central System Administrator',
        department: 'Governance & IT Directorate',
        organizationId: imdOrg?._id || undefined,
        organizationName: 'India Meteorological Department (IMD)',
        status: 'active',
        approvalStatus: 'approved'
      },
      { upsert: true, new: true }
    );

    // 2. Trainer
    const trainerHash = await bcrypt.hash('Rushit@123', salt);
    await User.findOneAndUpdate(
      { email: 'rushit@gmail.com' },
      {
        name: 'Rushit',
        email: 'rushit@gmail.com',
        password: trainerHash,
        role: 'trainer',
        designation: 'Senior Scientist & Lead Trainer',
        department: 'Radar Meteorology Division',
        organizationId: imdOrg?._id || undefined,
        organizationName: 'India Meteorological Department (IMD)',
        status: 'active',
        approvalStatus: 'approved',
        competencies: []
      },
      { upsert: true, new: true }
    );

    // 3. Trainee
    const traineeHash = await bcrypt.hash('110009', salt);
    await User.findOneAndUpdate(
      { $or: [{ email: 'deep@gmail.com' }, { enrollmentNumber: '25004406110009' }] },
      {
        name: 'Deep',
        email: 'deep@gmail.com',
        enrollmentNumber: '25004406110009',
        password: traineeHash,
        role: 'trainee',
        designation: 'Operational Forecaster',
        department: 'Weather Forecasting Division',
        organizationId: imdOrg?._id || undefined,
        organizationName: 'India Meteorological Department (IMD)',
        status: 'active',
        approvalStatus: 'approved',
        competencies: []
      },
      { upsert: true, new: true }
    );

    console.log('[Clean] Database successfully cleaned!');
    console.log('--- Current Real Database Counts ---');
    console.log('Certificates:', await Certificate.countDocuments());
    console.log('Enrollments :', await Enrollment.countDocuments());
    console.log('Sessions    :', await Session.countDocuments());
    console.log('Courses     :', await Course.countDocuments());
    console.log('Users       :', await User.countDocuments());
    console.log('Organizations:', await Organization.countDocuments());

    process.exit(0);
  } catch (err) {
    console.error('[Clean Error]', err);
    process.exit(1);
  }
};

cleanDatabase();
