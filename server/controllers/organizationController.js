const Organization = require('../models/Organization');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Session = require('../models/Session');
const { logAuditEvent } = require('../middleware/auditLogger');

// @route POST /api/v1/organizations/register (Public Institute Onboarding / Registration)
const registerOrganization = async (req, res) => {
  try {
    const {
      legalName,
      displayName,
      code,
      type,
      domain,
      website,
      address,
      contactPerson,
      signatoryName,
      signatoryDesignation,
      adminName,
      adminEmail,
      adminPassword,
      adminMobile,
      authorizedRepresentative,
      verificationDocuments,
      departments,
      programs,
      batches
    } = req.body;

    if (!legalName || !code || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Legal name, institute code, admin email, and password are required.'
      });
    }

    // Check unique code
    const existingOrg = await Organization.findOne({ code: code.toUpperCase() });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: `An institute with code ${code.toUpperCase()} is already registered.`
      });
    }

    // Check unique admin email
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email ${adminEmail} already exists in the system.`
      });
    }

    // Default sample verification documents if not supplied
    const docs = Array.isArray(verificationDocuments) && verificationDocuments.length > 0 
      ? verificationDocuments 
      : [
          {
            name: `${legalName} - MoES Affiliation & MOU Document.pdf`,
            url: `https://moes.gov.in/sites/default/files/accreditation_${code.toLowerCase()}.pdf`,
            type: 'PDF',
            uploadedAt: new Date()
          },
          {
            name: `${legalName} - Institutional Registration & Tax Exemption.pdf`,
            url: `https://gov.in/records/registration_${code.toLowerCase()}.pdf`,
            type: 'PDF',
            uploadedAt: new Date()
          }
        ];

    // Create Organization Tenant with canonical workflow state: PENDING_VERIFICATION
    const organization = await Organization.create({
      legalName,
      displayName: displayName || legalName,
      code: code.toUpperCase(),
      type: type || 'Autonomous Institute',
      domain: domain || '',
      website: website || '',
      address: address || '',
      contactPerson: contactPerson || {
        name: adminName,
        email: adminEmail,
        phone: adminMobile
      },
      authorizedRepresentative: authorizedRepresentative || {
        name: adminName,
        designation: signatoryDesignation || '',
        email: adminEmail,
        phone: adminMobile || '',
        idProofUrl: 'https://uidai.gov.in/verified_id.pdf'
      },
      verificationDocuments: docs,
      departments: departments && departments.length ? departments : [],
      programs: programs && programs.length ? programs : [],
      batches: batches && batches.length ? batches : [],
      signatory: {
        name: signatoryName || '',
        designation: signatoryDesignation || ''
      },
      certificateTemplate: {
        orgDisplayName: displayName || legalName,
        logoUrl: '',
        signatoryName: signatoryName || '',
        signatoryDesignation: signatoryDesignation || '',
        headerLine: 'National Digital Education Architecture (NDEAR) • MoES / IMD Accredited',
        minScoreForCertificate: 80,
        footerNote: 'Valid subject to verified national meteorological capacity building registry.',
        templateVersion: 1
      },
      subscription: {
        planTier: req.body.subscriptionPlan === 'STARTER_250' ? 'STARTER_250' : req.body.subscriptionPlan === 'ENTERPRISE_5000' ? 'ENTERPRISE_5000' : 'STANDARD_1000',
        maxStudentQuota: req.body.subscriptionPlan === 'STARTER_250' ? 250 : req.body.subscriptionPlan === 'ENTERPRISE_5000' ? 5000 : 1000,
        billingAmount: req.body.subscriptionPlan === 'STARTER_250' ? 25000 : req.body.subscriptionPlan === 'ENTERPRISE_5000' ? 250000 : 75000,
        activeStudentCount: 0,
        status: 'ACTIVE'
      },
      status: 'PENDING_VERIFICATION',
      verificationStatus: 'unverified'
    });

    // Create Tenant Admin User (Institute Admin) - starts as pending approval
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'institute_admin',
      organizationId: organization._id,
      organizationName: organization.legalName,
      department: 'Institutional Administration',
      designation: signatoryDesignation || 'Institute Coordinator',
      mobile: adminMobile || '',
      status: 'active',
      approvalStatus: 'pending' // Requires Platform Admin approval
    });

    await logAuditEvent({
      actor: adminUser,
      action: 'ORGANIZATION_REGISTERED',
      module: 'ORGANIZATIONS',
      targetId: organization._id,
      targetName: organization.legalName,
      metadata: { code: organization.code, adminEmail: adminUser.email }
    });

    res.status(201).json({
      success: true,
      message: 'Institute registration application submitted successfully. It will be reviewed and verified by the MoES / IMD Central Authority.',
      organization: {
        _id: organization._id,
        code: organization.code,
        legalName: organization.legalName,
        status: organization.status,
        verificationStatus: organization.verificationStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/organizations (Public / dropdowns)
const getOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({ 
      status: { $in: ['active', 'APPROVED'] } 
    }).select('code legalName displayName type logo website verificationStatus status');
    res.json({ success: true, count: orgs.length, organizations: orgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/organizations/admin/all (Platform Admin view with verification metrics)
const getAllOrganizationsForAdmin = async (req, res) => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 }).lean();
    
    // Dynamically calculate associated trainers & trainees for each institute
    const enrichedOrgs = await Promise.all(
      orgs.map(async (org) => {
        const trainersCount = await User.countDocuments({
          $or: [{ organizationId: org._id }, { organizationName: org.legalName }],
          role: 'trainer'
        });
        const traineesCount = await User.countDocuments({
          $or: [{ organizationId: org._id }, { organizationName: org.legalName }],
          role: { $in: ['trainee', 'student'] }
        });
        const coursesCount = await Course.countDocuments({
          organizationId: org._id
        });
        const certsCount = await Certificate.countDocuments({
          organizationId: org._id,
          status: 'valid'
        });

        return {
          ...org,
          trainersCount,
          traineesCount,
          coursesCount,
          certsCount
        };
      })
    );

    res.json({ success: true, count: enrichedOrgs.length, organizations: enrichedOrgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/organizations/:id/verification-dossier (Platform Admin: "Institute Check")
const getOrganizationVerificationDossier = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findById(id).populate('reviewedBy', 'name email designation').lean();
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const adminUser = await User.findOne({
      organizationId: org._id,
      role: { $in: ['institute_admin', 'org_admin'] }
    }).select('-password').lean();

    const trainersCount = await User.countDocuments({ organizationId: org._id, role: 'trainer' });
    const studentsCount = await User.countDocuments({ organizationId: org._id, role: { $in: ['trainee', 'student'] } });

    res.json({
      success: true,
      dossier: {
        organization: org,
        adminUser,
        stats: {
          trainersCount,
          studentsCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/organizations/:id/review (Platform Admin: "Institute Check" Actions)
const reviewOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, correctionNotes } = req.body;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const validActions = ['APPROVE', 'REJECT', 'REQUEST_CORRECTION', 'SUSPEND', 'REACTIVATE', 'ARCHIVE'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Invalid review action. Must be one of: ${validActions.join(', ')}`
      });
    }

    org.reviewedBy = req.user._id;
    org.reviewedAt = new Date();

    if (action === 'APPROVE') {
      org.status = 'APPROVED';
      org.verificationStatus = 'verified';
      org.rejectionReason = '';
      org.correctionNotes = '';

      // Activate all associated Institute Admins, Trainers, and Trainees
      await User.updateMany(
        { 
          $or: [
            { organizationId: org._id },
            { organizationName: org.displayName },
            { organizationName: org.legalName }
          ],
          role: { $in: ['institute_admin', 'org_admin', 'trainer', 'trainee', 'student'] } 
        },
        { approvalStatus: 'approved', status: 'active', organizationId: org._id }
      );
    } else if (action === 'REJECT') {
      org.status = 'REJECTED';
      org.verificationStatus = 'rejected';
      org.rejectionReason = reason || 'Accreditation criteria not satisfied during MoES review.';

      // Suspend associated Institute Admins
      await User.updateMany(
        { organizationId: org._id, role: { $in: ['institute_admin', 'org_admin'] } },
        { approvalStatus: 'rejected', status: 'inactive' }
      );
    } else if (action === 'REQUEST_CORRECTION') {
      org.status = 'UNDER_REVIEW';
      org.verificationStatus = 'correction_requested';
      org.correctionNotes = correctionNotes || reason || 'Please resubmit verified affiliation documents.';
    } else if (action === 'SUSPEND') {
      org.status = 'SUSPENDED';
      await User.updateMany(
        { organizationId: org._id },
        { status: 'suspended' }
      );
    } else if (action === 'REACTIVATE') {
      org.status = 'APPROVED';
      org.verificationStatus = 'verified';
      await User.updateMany(
        { organizationId: org._id, approvalStatus: 'approved' },
        { status: 'active' }
      );
    } else if (action === 'ARCHIVE') {
      org.status = 'ARCHIVED';
    }

    await org.save();

    await logAuditEvent({
      actor: req.user,
      action: `ORGANIZATION_${action}`,
      module: 'ORGANIZATIONS',
      targetId: org._id,
      targetName: org.legalName,
      metadata: { action, reason: reason || correctionNotes || '' }
    });

    res.json({
      success: true,
      message: `Organization ${org.legalName} has been processed with action: ${action}`,
      organization: org
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/organizations/:id/approve (Legacy alias)
const approveOrganization = async (req, res) => {
  req.body = { action: 'APPROVE' };
  return reviewOrganization(req, res);
};

// @route PUT /api/v1/organizations/:id/certificate-template
const updateCertificateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orgDisplayName,
      logoUrl,
      signatoryName,
      signatoryDesignation,
      headerLine,
      minScoreForCertificate,
      footerNote
    } = req.body;

    const org = await Organization.findById(id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Update fields and increment template version for snapshot safety
    if (orgDisplayName !== undefined) org.certificateTemplate.orgDisplayName = orgDisplayName;
    if (logoUrl !== undefined) org.certificateTemplate.logoUrl = logoUrl;
    if (signatoryName !== undefined) org.certificateTemplate.signatoryName = signatoryName;
    if (signatoryDesignation !== undefined) org.certificateTemplate.signatoryDesignation = signatoryDesignation;
    if (headerLine !== undefined) org.certificateTemplate.headerLine = headerLine;
    if (minScoreForCertificate !== undefined) {
      const score = Number(minScoreForCertificate);
      org.certificateTemplate.minScoreForCertificate = (score >= 0 && score <= 100) ? score : 80;
    }
    if (footerNote !== undefined) org.certificateTemplate.footerNote = footerNote;

    org.certificateTemplate.templateVersion = (org.certificateTemplate.templateVersion || 1) + 1;

    await org.save();

    await logAuditEvent({
      actor: req.user,
      action: 'CERTIFICATE_TEMPLATE_UPDATED',
      module: 'ORGANIZATIONS',
      targetId: org._id,
      targetName: org.legalName,
      metadata: { 
        minScore: org.certificateTemplate.minScoreForCertificate,
        templateVersion: org.certificateTemplate.templateVersion 
      }
    });

    res.json({
      success: true,
      message: 'Certificate template updated successfully! Template version incremented.',
      certificateTemplate: org.certificateTemplate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/organizations/institute/metrics (Dedicated Institute Dashboard KPIs)
const getInstituteMetrics = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'No institute associated with this user account' });
    }

    const org = await Organization.findById(orgId).lean();
    if (!org) {
      return res.status(404).json({ success: false, message: 'Institute tenant not found' });
    }

    const orgQuery = [{ organizationId: orgId }];
    if (org.legalName) {
      const escLegal = org.legalName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orgQuery.push({ organizationName: new RegExp(`^${escLegal}$`, 'i') });
    }
    if (org.displayName && org.displayName !== org.legalName) {
      const escDisplay = org.displayName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orgQuery.push({ organizationName: new RegExp(`^${escDisplay}$`, 'i') });
    }

    const courseQuery = [{ organizationId: orgId }];
    if (org.legalName) {
      const escLegal = org.legalName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      courseQuery.push({ organizationName: new RegExp(`^${escLegal}$`, 'i') });
    }
    if (org.displayName && org.displayName !== org.legalName) {
      const escDisplay = org.displayName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      courseQuery.push({ organizationName: new RegExp(`^${escDisplay}$`, 'i') });
    }

    const [
      students,
      trainers,
      courses,
      certificatesIssued,
      certificatesRevoked
    ] = await Promise.all([
      User.find({ $or: orgQuery, role: { $in: ['student', 'trainee'] } })
        .select('_id name email enrollmentNumber department designation status approvalStatus createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      User.find({ $or: orgQuery, role: 'trainer' })
        .select('_id name email department status')
        .lean(),
      Course.find({ $or: courseQuery })
        .select('_id title code status enrollmentCount')
        .lean(),
      Certificate.countDocuments({
        $or: [
          { organizationId: orgId },
          ...(org.legalName ? [{ organizationName: new RegExp(`^${org.legalName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] : [])
        ],
        status: 'valid'
      }),
      Certificate.countDocuments({
        $or: [
          { organizationId: orgId },
          ...(org.legalName ? [{ organizationName: new RegExp(`^${org.legalName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] : [])
        ],
        status: 'revoked'
      })
    ]);

    const studentIds = students.map(s => s._id);
    const courseIds = courses.map(c => c._id);

    // Dynamic Calculations from Live Database Enrollments matching this institute's courses or students
    const enrollmentQuery = [
      { organizationId: orgId }
    ];
    if (studentIds.length > 0) {
      enrollmentQuery.push({ traineeId: { $in: studentIds } });
    }
    if (courseIds.length > 0) {
      enrollmentQuery.push({ courseId: { $in: courseIds } });
    }

    const enrollments = await Enrollment.find({ $or: enrollmentQuery })
      .select('attendancePercentage progressPercentage assessmentPassed bestAssessmentScore traineeId courseId status updatedAt')
      .lean();

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const pendingStudents = students.filter(s => s.approvalStatus === 'pending').length;

    const totalTrainers = trainers.length;
    const activeTrainers = trainers.filter(t => t.status === 'active').length;

    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'published').length;

    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed' || (e.progressPercentage || 0) >= 100);

    const avgAttendance = enrollments.length > 0 
      ? Number((enrollments.reduce((acc, curr) => acc + (curr.attendancePercentage || 0), 0) / enrollments.length).toFixed(1))
      : 0;

    const avgCompletion = enrollments.length > 0 
      ? Number((enrollments.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) / enrollments.length).toFixed(1))
      : 0;

    const enrollmentsWithScores = enrollments.filter(e => (e.bestAssessmentScore || 0) > 0);
    const avgAssessment = enrollmentsWithScores.length > 0
      ? Number((enrollmentsWithScores.reduce((acc, curr) => acc + (curr.bestAssessmentScore || 0), 0) / enrollmentsWithScores.length).toFixed(1))
      : 0;

    const maxQuota = org.subscription?.maxStudentQuota || 1000;
    const cohortCapacityPercent = maxQuota > 0 ? Math.min(100, Math.round((totalEnrollments / maxQuota) * 100)) : 0;

    // Fetch real recent students with their dynamic live progress calculated from Enrollment collection
    const recentStudentsList = students.slice(0, 5).map(st => {
      const studentEnrs = enrollments.filter(e => String(e.traineeId) === String(st._id));
      const studentProg = studentEnrs.length > 0
        ? Math.round(studentEnrs.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / studentEnrs.length)
        : 0;
      const isCompleted = studentEnrs.some(e => e.status === 'completed' || (e.progressPercentage || 0) >= 100);
      
      return {
        _id: st._id,
        id: st.enrollmentNumber || `ST-${String(st._id).slice(-4).toUpperCase()}`,
        name: st.name,
        email: st.email,
        program: st.department || '',
        progress: `${studentProg}%`,
        progressValue: studentProg,
        status: isCompleted ? 'Completed' : (st.status === 'active' ? 'Active' : (st.status || 'Enrolled')),
        coursesCount: studentEnrs.length
      };
    });

    // Fetch live scheduled sessions for this institute
    const sessionQuery = [
      { organizationId: orgId }
    ];
    if (courseIds.length > 0) {
      sessionQuery.push({ courseId: { $in: courseIds } });
    }
    if (trainers.length > 0) {
      sessionQuery.push({ trainerId: { $in: trainers.map(t => t._id) } });
    }
    if (org.legalName) {
      sessionQuery.push({ organizationName: new RegExp(`^${org.legalName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    }

    const upcomingSessionsList = await Session.find({
      $or: sessionQuery,
      status: { $ne: 'Cancelled' },
      scheduledDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
      .populate('courseId', 'title')
      .sort({ scheduledDate: 1 })
      .limit(5)
      .lean();

    const formattedSessions = upcomingSessionsList.map(sess => ({
      _id: sess._id,
      title: sess.title || sess.courseId?.title || '',
      trainer: sess.trainerName || '',
      date: sess.scheduledDate ? new Date(sess.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled',
      time: sess.scheduledDate ? new Date(sess.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'
    }));

    res.json({
      success: true,
      organization: {
        _id: org._id,
        legalName: org.legalName,
        displayName: org.displayName,
        code: org.code,
        status: org.status,
        verificationStatus: org.verificationStatus,
        certificateTemplate: org.certificateTemplate
      },
      metrics: {
        totalStudents,
        activeStudents,
        pendingStudents,
        totalTrainers,
        activeTrainers,
        totalCourses,
        activeCourses,
        certificatesIssued,
        certificatesRevoked,
        sessionsCount: upcomingSessionsList.length,
        totalEnrollments,
        completedEnrollmentsCount: completedEnrollments.length,
        cohortCapacityPercent,
        maxStudentQuota: maxQuota,
        avgAttendance,
        avgCompletion,
        avgAssessment,
        recentStudents: recentStudentsList,
        upcomingSessions: formattedSessions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/organizations/:id/academic-structure
const getAcademicStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findById(id).select('departments programs batches legalName displayName code');
    if (!org) return res.status(404).json({ success: false, message: 'Institute not found' });
    res.json({ success: true, academicStructure: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/organizations/:id/academic-structure
const updateAcademicStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { departments, programs, batches } = req.body;

    const org = await Organization.findById(id);
    if (!org) return res.status(404).json({ success: false, message: 'Institute not found' });

    if (Array.isArray(departments)) org.departments = departments;
    if (Array.isArray(programs)) org.programs = programs;
    if (Array.isArray(batches)) org.batches = batches;

    await org.save();

    await logAuditEvent({
      actor: req.user,
      action: 'ACADEMIC_STRUCTURE_UPDATED',
      module: 'ORGANIZATIONS',
      targetId: org._id,
      targetName: org.legalName,
      metadata: { departmentsCount: org.departments.length, programsCount: org.programs.length }
    });

    res.json({
      success: true,
      message: 'Academic structure updated successfully',
      academicStructure: {
        departments: org.departments,
        programs: org.programs,
        batches: org.batches
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/v1/organizations/:id
const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    await Organization.findByIdAndDelete(id);

    await logAuditEvent({
      actor: req.user,
      action: 'ORGANIZATION_DELETED',
      module: 'ORGANIZATIONS',
      targetId: org._id,
      targetName: org.legalName,
      metadata: { code: org.code }
    });

    res.json({ success: true, message: `Institute ${org.displayName || org.legalName} successfully deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerOrganization,
  getOrganizations,
  getAllOrganizationsForAdmin,
  getOrganizationVerificationDossier,
  reviewOrganization,
  approveOrganization,
  updateCertificateTemplate,
  getInstituteMetrics,
  getAcademicStructure,
  updateAcademicStructure,
  deleteOrganization
};

