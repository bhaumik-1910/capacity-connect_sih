const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const trainers = await User.find({ role: 'trainer' }).lean();
  console.log('ALL TRAINERS:', trainers.map(t => ({
    id: t._id,
    name: t.name,
    email: t.email,
    orgId: t.organizationId,
    orgName: t.organizationName,
    createdBy: t.createdBy
  })));

  const instituteAdmins = await User.find({ role: { $in: ['institute_admin', 'org_admin'] } }).lean();
  console.log('ALL INSTITUTE ADMINS:', instituteAdmins.map(a => ({
    id: a._id,
    name: a.name,
    email: a.email,
    orgId: a.organizationId,
    orgName: a.organizationName
  })));

  const trainees = await User.find({ role: { $in: ['trainee', 'student'] } }).lean();
  console.log('TRAINEES BY ORG:');
  const counts = {};
  trainees.forEach(t => {
    const org = t.organizationName || 'No Org';
    counts[org] = (counts[org] || 0) + 1;
  });
  console.log(counts);

  process.exit(0);
}
test();
