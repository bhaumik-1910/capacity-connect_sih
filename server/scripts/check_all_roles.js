const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function checkAllRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- DATABASE ROLE DIAGNOSTIC REPORT ---');
    
    const trainers = await User.find({ role: 'trainer' }).lean();
    console.log(`\nTrainers (${trainers.length}):`, trainers.map(t => ({
      id: t._id,
      name: t.name,
      email: t.email,
      orgName: t.organizationName
    })));

    const instituteAdmins = await User.find({ role: { $in: ['institute_admin', 'org_admin'] } }).lean();
    console.log(`\nInstitute Admins (${instituteAdmins.length}):`, instituteAdmins.map(a => ({
      id: a._id,
      name: a.name,
      email: a.email,
      orgName: a.organizationName
    })));

    const trainees = await User.find({ role: { $in: ['trainee', 'student'] } }).lean();
    const counts = {};
    trainees.forEach(t => {
      const org = t.organizationName || 'Direct / Independent';
      counts[org] = (counts[org] || 0) + 1;
    });
    console.log(`\nTrainees by Organization (${trainees.length} total):`, counts);

    process.exit(0);
  } catch (err) {
    console.error('Diagnostic error:', err);
    process.exit(1);
  }
}

checkAllRoles();
