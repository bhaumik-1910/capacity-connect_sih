const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Organization = require('../models/Organization');
const GovernmentCertificateTemplate = require('../models/GovernmentCertificateTemplate');
const QRCode = require('qrcode');
const { logAuditEvent } = require('../middleware/auditLogger');

// @route POST /api/v1/certificates/claim/:courseId
const claimCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const traineeId = req.user._id;

    // 1. Check existing certificate
    let existingCert = await Certificate.findOne({ traineeId, courseId, status: 'valid' });
    if (existingCert) {
      return res.json({ success: true, message: 'Certificate already issued', certificate: existingCert });
    }

    // 2. Server-side eligibility check
    const enrollment = await Enrollment.findOne({ traineeId, courseId });
    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
    }

    // 3. Fetch course & user
    const course = await Course.findById(courseId);
    const user = await User.findById(traineeId);

    // 4. Determine if external/independent user or government course
    const isIndependentUser = !user?.organizationId || 
      user?.organizationName?.toLowerCase().includes('open') || 
      user?.organizationName?.toLowerCase().includes('independent') || 
      user?.department?.toLowerCase().includes('direct') ||
      user?.department?.toLowerCase().includes('open');

    const isGovCourse = course?.isGovernmentCourse || !course?.organizationId;

    let org = null;
    if (!isIndependentUser && !isGovCourse) {
      const orgId = course?.organizationId || user?.organizationId;
      if (orgId) {
        org = await Organization.findById(orgId);
      }
    }

    // Load Government Certificate Template for independent/external users or government courses
    let govTemplate = null;
    if (isIndependentUser || isGovCourse || !org) {
      govTemplate = await GovernmentCertificateTemplate.findOne();
    }

    // Resolve minimum score threshold: org template > gov template > 75%
    const minScore = (org?.certificateTemplate?.minScoreForCertificate != null)
      ? org.certificateTemplate.minScoreForCertificate
      : (govTemplate?.minScoreForCertificate != null ? govTemplate.minScoreForCertificate : 75);

    // 5. Check assessment pass
    if (!enrollment.assessmentPassed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Must pass the mandatory course assessment before certificate issuance.' 
      });
    }

    // 6. Enforce minimum score threshold
    const score = enrollment.bestAssessmentScore || 0;
    if (score < minScore) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum ${minScore}% score required for certificate. Your best score: ${score}%. Please retake the exam to qualify.`
      });
    }

    // 7. Compute grade
    let grade = 'Pass';
    if (score >= 90) grade = 'Distinction';
    else if (score >= 75) grade = 'First Class with Merit';
    else if (score >= 60) grade = 'First Class';

    // 8. Resolve certificate branding
    let resolvedOrgName = 'Ministry of Earth Sciences (MoES), Government of India';
    let resolvedLogoUrl = '/logo-imd.svg';
    let resolvedSignatoryName = 'Dr. Mrutyunjay Mohapatra';
    let resolvedSignatoryDesignation = 'Director General of Meteorology, Govt. of India';
    let resolvedHeaderLine = 'National Skill Qualification Framework (NSQF) • Government of India Accredited';
    let resolvedFooterNote = 'Issued to open public citizen learners upon successful verification of meteorological competencies. Valid nationwide and WMO compliant.';
    let resolvedCertTitle = 'National Certificate of Competency & Professional Excellence';
    let resolvedAccentColor = '#1e3a8a';

    if (org && !isIndependentUser && !isGovCourse) {
      // Institute Student -> Use Institute Custom Template
      const tmpl = org.certificateTemplate || {};
      resolvedOrgName = tmpl.orgDisplayName || course?.organizationName || org.displayName || org.legalName || resolvedOrgName;
      resolvedLogoUrl = tmpl.logoUrl || org.logo || resolvedLogoUrl;
      resolvedSignatoryName = tmpl.signatoryName || org.signatory?.name || resolvedSignatoryName;
      resolvedSignatoryDesignation = tmpl.signatoryDesignation || org.signatory?.designation || resolvedSignatoryDesignation;
      resolvedHeaderLine = tmpl.headerLine || resolvedHeaderLine;
      resolvedFooterNote = tmpl.footerNote || resolvedFooterNote;
      resolvedAccentColor = tmpl.accentColor || '#b45309';
    } else if (govTemplate) {
      // External / Independent User -> Use Official Government Certificate Template
      resolvedOrgName = govTemplate.orgDisplayName || resolvedOrgName;
      resolvedLogoUrl = govTemplate.logoUrl || resolvedLogoUrl;
      resolvedSignatoryName = govTemplate.signatoryName || resolvedSignatoryName;
      resolvedSignatoryDesignation = govTemplate.signatoryDesignation || resolvedSignatoryDesignation;
      resolvedHeaderLine = govTemplate.headerLine || resolvedHeaderLine;
      resolvedFooterNote = govTemplate.footerNote || resolvedFooterNote;
      resolvedCertTitle = govTemplate.certTitleText || resolvedCertTitle;
      resolvedAccentColor = govTemplate.accentColor || resolvedAccentColor;
    }

    // 8b. Resolve course-level certificate template overrides (if trainer customized)
    const courseTmpl = course?.certificateTemplate || {};
    const resolvedBackgroundUrl = courseTmpl.backgroundUrl || '';
    const resolvedUseCustomBg = !!(courseTmpl.useCustomBackground && courseTmpl.backgroundUrl);
    if (courseTmpl.titleText) resolvedCertTitle = courseTmpl.titleText;
    const resolvedTrainerSigName = courseTmpl.trainerSignatureName || course?.trainerName || '';
    const resolvedTrainerSigDesignation = courseTmpl.trainerSignatureDesignation || 'Course Instructor';
    if (courseTmpl.accentColor) resolvedAccentColor = courseTmpl.accentColor;

    // 9. Unique certificate number
    const certPrefix = (org && !isIndependentUser && !isGovCourse) ? (org.code || 'INST') : 'GOV-IN';
    const certNumber = 'CC-' + certPrefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
    
    // 10. QR payload
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${certNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl);

    // 11. Snapshot at issuance!
    const certificate = await Certificate.create({
      certificateNumber: certNumber,
      traineeId: user._id,
      courseId: course._id,
      organizationId: orgId || null,
      studentName: user.name,
      studentEmail: user.email,
      studentDesignation: user.designation || 'Officer Trainee',
      studentDepartment: user.department || 'Training Division',
      organizationName: resolvedOrgName,
      organizationLogo: resolvedLogoUrl,
      signatoryName: resolvedSignatoryName,
      signatoryDesignation: resolvedSignatoryDesignation,
      courseTitle: course.title,
      courseCode: course.code,
      grade,
      scorePercentage: score,
      issueDate: new Date(),
      status: 'valid',
      qrPayload: qrDataUrl,
      // Store extra template fields
      headerLine: resolvedHeaderLine,
      footerNote: resolvedFooterNote,
      enrollmentNumber: user.enrollmentNumber || '',
      // Course-level trainer design
      backgroundUrl: resolvedBackgroundUrl,
      useCustomBackground: resolvedUseCustomBg,
      certTitleText: resolvedCertTitle,
      trainerSignatureName: resolvedTrainerSigName,
      trainerSignatureDesignation: resolvedTrainerSigDesignation,
      accentColor: resolvedAccentColor
    });

    enrollment.certificateIssued = true;
    enrollment.certificateId = certificate._id;
    enrollment.status = 'completed';
    await enrollment.save();

    await logAuditEvent({
      actor: req.user,
      action: 'CERTIFICATE_ISSUED',
      module: 'CERTIFICATES',
      targetId: certificate._id,
      targetName: certNumber,
      metadata: { course: course.title, recipient: user.name, score, minRequired: minScore }
    });

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/certificates/my-certificates
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ traineeId: req.user._id, status: 'valid' })
      .populate('courseId', 'title code level category durationWeeks')
      .sort({ issueDate: -1 });

    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/certificates/verify/:certificateNumber (PUBLIC ENDPOINT)
const verifyCertificatePublic = async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    const cert = await Certificate.findOne({ 
      certificateNumber: certificateNumber.trim().toUpperCase() 
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'No certificate matching this record was found in the MoES / IMD National Registry.'
      });
    }

    // Return ONLY safe, minimal public verification fields (as mandated by Government security guidelines)
    res.json({
      success: true,
      valid: cert.status === 'valid',
      status: cert.status,
      certificateNumber: cert.certificateNumber,
      studentName: cert.studentName,
      courseTitle: cert.courseTitle,
      courseCode: cert.courseCode,
      organizationName: cert.organizationName,
      signatoryName: cert.signatoryName,
      signatoryDesignation: cert.signatoryDesignation,
      grade: cert.grade,
      issueDate: cert.issueDate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/certificates/:id/revoke (ADMIN ONLY)
const revokeCertificate = async (req, res) => {
  try {
    const { reason } = req.body;
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });

    cert.status = 'revoked';
    cert.revocationReason = reason || 'Revoked by Platform Administrator';
    await cert.save();

    await logAuditEvent({
      actor: req.user,
      action: 'CERTIFICATE_REVOKED',
      module: 'CERTIFICATES',
      targetId: cert._id,
      targetName: cert.certificateNumber,
      severity: 'WARNING',
      metadata: { reason }
    });

    res.json({ success: true, message: 'Certificate has been revoked', certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/certificates/admin/all
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('traineeId', 'name email department')
      .populate('courseId', 'title code')
      .sort({ createdAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/certificates/trainer/my-course-certs
// Returns certificates for all courses authored by the logged-in trainer
const getTrainerCertificates = async (req, res) => {
  try {
    const trainerId = req.user._id;

    // 1. Find all courses by this trainer
    const Course = require('../models/Course');
    const trainerCourses = await Course.find({ trainerId }).select('_id title code');
    const courseIds = trainerCourses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.json({ success: true, certificates: [], total: 0 });
    }

    // 2. Fetch certificates for those courses only
    const certificates = await Certificate.find({ courseId: { $in: courseIds } })
      .populate('traineeId', 'name email enrollmentNumber department designation')
      .populate('courseId', 'title code')
      .sort({ issueDate: -1 });

    res.json({ success: true, certificates, total: certificates.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/certificates/government-template
const getGovernmentCertificateTemplate = async (req, res) => {
  try {
    let tmpl = await GovernmentCertificateTemplate.findOne().populate('updatedBy', 'name email');
    if (!tmpl) {
      tmpl = await GovernmentCertificateTemplate.create({
        orgDisplayName: 'Ministry of Earth Sciences (MoES), Government of India',
        subHeader: 'National Digital Capacity Building & Competency Assurance Registry',
        logoUrl: '/logo-moes.png',
        nationalEmblemUrl: '/emblem-india.png',
        signatoryName: 'Dr. Mrutyunjay Mohapatra',
        signatoryDesignation: 'Director General of Meteorology, Govt. of India',
        headerLine: 'National Skill Qualification Framework (NSQF) • Government of India Accredited',
        footerNote: 'Issued to open public citizen learners upon successful verification of meteorological competencies. Valid nationwide and WMO compliant.',
        certTitleText: 'National Certificate of Competency & Professional Excellence',
        accentColor: '#1e3a8a',
        borderStyle: 'ornate-gold',
        minScoreForCertificate: 75
      });
    } else {
      let needsSave = false;
      if (!tmpl.logoUrl || tmpl.logoUrl === '/logo-imd.svg' || tmpl.logoUrl === '/logo-imd.png' || tmpl.logoUrl.includes('wikipedia')) {
        tmpl.logoUrl = '/logo-moes.png';
        needsSave = true;
      }
      if (!tmpl.nationalEmblemUrl || tmpl.nationalEmblemUrl === '/emblem-india.svg' || tmpl.nationalEmblemUrl.includes('wikipedia')) {
        tmpl.nationalEmblemUrl = '/emblem-india.png';
        needsSave = true;
      }
      if (needsSave) {
        await tmpl.save();
      }
    }
    res.json({ success: true, template: tmpl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/certificates/government-template
const updateGovernmentCertificateTemplate = async (req, res) => {
  try {
    const updateData = { ...req.body, updatedBy: req.user._id };
    let tmpl = await GovernmentCertificateTemplate.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    await logAuditEvent({
      actor: req.user,
      action: 'GOVERNMENT_CERTIFICATE_TEMPLATE_UPDATED',
      module: 'CERTIFICATES',
      targetId: tmpl._id,
      targetName: 'Official Government Certificate Template',
      metadata: { orgDisplayName: tmpl.orgDisplayName, signatoryName: tmpl.signatoryName }
    });

    res.json({ success: true, message: 'Government Certificate Template updated successfully', template: tmpl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  claimCertificate,
  getMyCertificates,
  verifyCertificatePublic,
  revokeCertificate,
  getAllCertificates,
  getTrainerCertificates,
  getGovernmentCertificateTemplate,
  updateGovernmentCertificateTemplate
};
