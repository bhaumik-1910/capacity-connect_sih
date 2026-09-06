const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');

const setup = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('[Mongo] Connecting to Atlas...');
    await mongoose.connect(uri);
    console.log('[Mongo] Connected to Atlas successfully.');

    // 1. Find dynamic organization if exists (No hardcoded/static organization creation)
    const activeOrg = await Organization.findOne();

    // 2. Wipe users and configure exact test login accounts
    await User.deleteMany({});
    console.log('[Clean] Purged old user accounts.');

    const userAccounts = [
      // 1. Platform Super Admin (1 User Only)
      {
        name: 'Bhaumik Kothiya',
        email: 'bhaumikkothiya1@gmail.com',
        plainPassword: 'Bhaumik@1910',
        role: 'platform_admin',
        designation: 'Central System Administrator',
        department: 'Governance & Administration',
        organizationId: activeOrg?._id || undefined,
        organizationName: activeOrg?.displayName || activeOrg?.legalName || undefined,
        approvalStatus: 'approved'
      },

      // 2. Lead Trainer (1 User Only)
      {
        name: 'Rushit',
        email: 'rushit@gmail.com',
        plainPassword: 'Rushit@123',
        role: 'trainer',
        designation: 'Senior Scientist & Lead Trainer',
        department: 'Radar Meteorology Division',
        organizationId: activeOrg?._id || undefined,
        organizationName: activeOrg?.displayName || activeOrg?.legalName || undefined,
        approvalStatus: 'approved'
      },

      // 3. Officer Trainee / Student (1 User Only)
      {
        name: 'Deep Patel',
        email: 'deep@gmail.com',
        enrollmentNumber: '25004406110009',
        plainPassword: '110009',
        role: 'trainee',
        designation: 'Operational Forecaster',
        department: 'Synoptic Weather Division',
        organizationId: activeOrg?._id || undefined,
        organizationName: activeOrg?.displayName || activeOrg?.legalName || undefined,
        approvalStatus: 'approved'
      },

      // 4. Certificate Verifier (1 User Only)
      {
        name: 'Inspector R. C. Verma',
        email: 'verifier@moes.gov.in',
        plainPassword: 'Verifier@123',
        role: 'certificate_verifier',
        designation: 'National Credential Verification Officer',
        department: 'Quality Assurance & Accreditation',
        organizationId: activeOrg?._id || undefined,
        organizationName: activeOrg?.displayName || activeOrg?.legalName || undefined,
        approvalStatus: 'approved'
      }
    ];

    for (const acc of userAccounts) {
      const user = await User.create({
        name: acc.name,
        email: acc.email.toLowerCase(),
        enrollmentNumber: acc.enrollmentNumber || undefined,
        password: acc.plainPassword,
        role: acc.role,
        designation: acc.designation,
        department: acc.department,
        organizationId: acc.organizationId,
        organizationName: acc.organizationName,
        status: 'active',
        approvalStatus: acc.approvalStatus,
        competencies: []
      });

      const isMatch = await user.comparePassword(acc.plainPassword);
      console.log(`[User Created] ${acc.role.padEnd(20)} | ${acc.email.padEnd(28)} | Auth: ${isMatch} | Approval: ${acc.approvalStatus}`);
    }

    const totalInDb = await User.countDocuments();
    console.log('\n==================================================');
    console.log(`DATABASE STATE: ${totalInDb} ROLE-ACCREDITED REAL USERS CONFIGURED`);
    console.log('==================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Setup Error]', err);
    process.exit(1);
  }
};

setup();
