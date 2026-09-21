const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Session = require('../models/Session');
const Attempt = require('../models/Attempt');
const AuditLog = require('../models/AuditLog');
const Announcement = require('../models/Announcement');
const Organization = require('../models/Organization');
const { logAuditEvent } = require('../middleware/auditLogger');

// @route GET /api/v1/admin/dashboard-metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingApprovals = await User.countDocuments({ approvalStatus: 'pending' });
    const totalTrainers = await User.countDocuments({ role: 'trainer', status: 'active' });
    const totalTrainees = await User.countDocuments({ role: 'trainee', status: 'active' });

    const totalCourses = await Course.countDocuments();
    const activePublishedCourses = await Course.countDocuments({ status: 'published' });
    const coursesPendingReview = await Course.countDocuments({ status: 'review' });

    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    const totalInstitutes = await Organization.countDocuments();
    const pendingInstituteApprovals = await Organization.countDocuments({ 
      status: { $in: ['pending', 'PENDING_VERIFICATION', 'UNDER_REVIEW'] } 
    });

    const certificatesIssued = await Certificate.countDocuments({ status: 'valid' });
    const certificatesRevoked = await Certificate.countDocuments({ status: 'revoked' });
    const certificatesReissued = await Certificate.countDocuments({ status: 'reissued' });

    // Recent activity audit logs
    const recentAuditLogs = await AuditLog.find().sort({ timestamp: -1 }).limit(10);

    // Distribution by category
    const categoryStats = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, enrollments: { $sum: '$enrollmentCount' } } }
    ]);

    res.json({
      success: true,
      metrics: {
        totalUsers,
        pendingApprovals,
        totalInstitutes,
        pendingInstituteApprovals,
        totalTrainers,
        totalTrainees,
        totalCourses,
        activePublishedCourses,
        coursesPendingReview,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        certificatesIssued,
        certificatesRevoked,
        certificatesReissued,
        categoryStats,
        recentAuditLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, status, approvalStatus, organizationId, search } = req.query;
    const filter = {};
    const isPlatformAdmin = req.user && (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin');
    if (!isPlatformAdmin && req.user && req.user.organizationId) {
      filter.organizationId = req.user.organizationId;
    } else if (organizationId && organizationId !== 'all') {
      filter.organizationId = organizationId;
    }
    if (role && role !== 'all') {
      if (role === 'student' || role === 'trainee') {
        filter.role = { $in: ['student', 'trainee'] };
      } else if (role === 'admin') {
        filter.role = { $in: ['platform_admin', 'platform_super_admin', 'admin'] };
      } else if (role === 'institute_admin') {
        filter.role = { $in: ['institute_admin', 'org_admin'] };
      } else {
        filter.role = role;
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (approvalStatus && approvalStatus !== 'all') {
      filter.approvalStatus = approvalStatus;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .populate('organizationId', 'code legalName displayName type')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/admin/pending-users
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ approvalStatus: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: pendingUsers.length, users: pendingUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/admin/users/:id/approve
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.approvalStatus = 'approved';
    user.status = 'active';
    await user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'USER_APPROVED',
      module: 'USERS',
      targetId: user._id,
      targetName: user.name,
      metadata: { role: user.role, email: user.email }
    });

    res.json({ success: true, message: `User ${user.name} approved successfully`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/admin/users/:id/reject
const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.approvalStatus = 'rejected';
    user.rejectionReason = reason || 'Documentation incomplete or unauthorized access request';
    await user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'USER_REJECTED',
      module: 'USERS',
      targetId: user._id,
      targetName: user.name,
      severity: 'WARNING',
      metadata: { reason }
    });

    res.json({ success: true, message: `User ${user.name} was rejected`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/admin/courses/:id/status
const updateCourseGovernanceStatus = async (req, res) => {
  try {
    const { status, reviewFeedback } = req.body; // status: 'published', 'rejected', 'archived'
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const previousStatus = course.status;
    course.status = status;
    if (reviewFeedback) course.reviewFeedback = reviewFeedback;
    await course.save();

    await logAuditEvent({
      actor: req.user,
      action: `COURSE_${status.toUpperCase()}`,
      module: 'COURSES',
      targetId: course._id,
      targetName: course.title,
      metadata: { previousStatus, newStatus: status, reviewFeedback }
    });

    res.json({ success: true, message: `Course status changed to ${status}`, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const { module, action, severity, search } = req.query;
    const filter = {};
    if (module && module !== 'all') filter.module = module;
    if (action && action !== 'all') filter.action = action;
    if (severity && severity !== 'all') filter.severity = severity;

    // Tenant Isolation for Institute Admins: restrict to their own institute, trainers, and students
    if (req.user && (req.user.role === 'institute_admin' || req.user.role === 'org_admin')) {
      const orgQuery = [];
      if (req.user.organizationId) orgQuery.push({ organizationId: req.user.organizationId });
      if (req.user.organizationName) orgQuery.push({ organizationName: req.user.organizationName });

      const instituteUsers = await User.find(
        orgQuery.length > 0 ? { $or: orgQuery } : { organizationId: req.user.organizationId }
      ).select('_id name');

      const userIds = instituteUsers.map(u => u._id);
      const userNames = instituteUsers.map(u => u.name);

      const tenantOrClauses = [];
      if (req.user.organizationId) tenantOrClauses.push({ organizationId: req.user.organizationId });
      if (userIds.length > 0) tenantOrClauses.push({ actorId: { $in: userIds } });
      if (userNames.length > 0) tenantOrClauses.push({ actorName: { $in: userNames } });
      if (req.user.organizationName) {
        tenantOrClauses.push({ targetName: { $regex: req.user.organizationName, $options: 'i' } });
        tenantOrClauses.push({ 'metadata.organizationName': { $regex: req.user.organizationName, $options: 'i' } });
        tenantOrClauses.push({ 'metadata.targetInstitute': { $regex: req.user.organizationName, $options: 'i' } });
      }

      if (tenantOrClauses.length > 0) {
        filter.$and = filter.$and || [];
        filter.$and.push({ $or: tenantOrClauses });
      }
    }

    if (search) {
      const searchOr = [
        { actorName: { $regex: search, $options: 'i' } },
        { targetName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: searchOr });
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(150);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/v1/admin/audit-logs (Wipe audit records with tenant safety)
const clearAuditLogs = async (req, res) => {
  try {
    const deleteFilter = {};
    if (req.user && (req.user.role === 'institute_admin' || req.user.role === 'org_admin')) {
      const orgQuery = [];
      if (req.user.organizationId) orgQuery.push({ organizationId: req.user.organizationId });
      if (req.user.organizationName) orgQuery.push({ organizationName: req.user.organizationName });

      const instituteUsers = await User.find(
        orgQuery.length > 0 ? { $or: orgQuery } : { organizationId: req.user.organizationId }
      ).select('_id');

      deleteFilter.$or = [
        ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
        { actorId: { $in: instituteUsers.map(u => u._id) } },
        ...(req.user.organizationName ? [{ targetName: { $regex: req.user.organizationName, $options: 'i' } }] : [])
      ];
    }

    const result = await AuditLog.deleteMany(deleteFilter);
    res.json({
      success: true,
      message: `Audit records cleared successfully (${result.deletedCount} entries removed).`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/v1/admin/audit-logs/:id (Delete single audit record)
const deleteAuditLog = async (req, res) => {
  try {
    const { id } = req.params;
    await AuditLog.findByIdAndDelete(id);
    res.json({ success: true, message: 'Audit log record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/admin/announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ status: 'active' }).sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/admin/announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, audience, isPinned } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      audience: audience || 'all',
      authorName: req.user.name,
      isPinned: !!isPinned
    });

    await logAuditEvent({
      actor: req.user,
      action: 'ANNOUNCEMENT_CREATED',
      module: 'ANNOUNCEMENTS',
      targetId: announcement._id,
      targetName: announcement.title
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/admin/public-stats (Public for landing page)
const getPublicStats = async (req, res) => {
  try {
    const [coursesCount, trainersCount, traineesCount, certificatesCount, institutesCount] = await Promise.all([
      Course.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'trainer', status: 'active' }),
      User.countDocuments({ role: { $in: ['trainee', 'student'] } }),
      Certificate.countDocuments({ status: 'valid' }),
      Organization.countDocuments()
    ]);

    // Also get latest valid certificate if any exists for hero preview
    const sampleCert = await Certificate.findOne({ status: 'valid' }).sort({ issuedAt: -1 }).populate('courseId', 'title code');

    res.json({
      success: true,
      stats: {
        totalCourses: coursesCount,
        totalTrainers: trainersCount,
        totalTrainees: traineesCount,
        certificatesIssued: certificatesCount,
        totalInstitutes: institutesCount,
        sampleCertificate: sampleCert ? {
          recipientName: sampleCert.recipientName,
          recipientRole: sampleCert.recipientRole || 'Forecaster',
          courseTitle: sampleCert.courseTitle || sampleCert.courseId?.title || 'Operational Meteorology',
          grade: sampleCert.grade || '86%',
          certificateNumber: sampleCert.certificateNumber
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/v1/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Multi-tenant check: Institute admin can only delete users in their own institute
    const isPlatformAdmin = req.user && (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin');
    if (!isPlatformAdmin && req.user && req.user.organizationId && user.organizationId) {
      if (req.user.organizationId.toString() !== user.organizationId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized: Cannot delete faculty belonging to another institute' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    await logAuditEvent({
      actor: req.user,
      action: 'USER_DELETED',
      module: 'USERS',
      targetId: user._id,
      targetName: user.name,
      metadata: { role: user.role, email: user.email }
    });

    res.json({ success: true, message: `User ${user.name} removed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/admin/users/:id/progress
const getUserLearningProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('organizationId', 'displayName legalName code logo city state');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch all enrollments for this trainee with populated course and certificate
    const enrollments = await Enrollment.find({ traineeId: user._id })
      .populate({
        path: 'courseId',
        select: 'title code category level duration modules totalLessons thumbnail instructorId status isGovernmentCourse createdByRole'
      })
      .populate('certificateId', 'certificateNumber issuedAt status verificationQrCode verificationHash pdfUrl scorePercentage grade')
      .sort({ updatedAt: -1 });

    // Fetch certificates
    const certificates = await Certificate.find({ traineeId: user._id, status: 'valid' })
      .populate('courseId', 'title code category')
      .sort({ issueDate: -1 });

    // Fetch official examination attempts
    const attempts = await Attempt.find({ traineeId: user._id })
      .populate('courseId', 'title code category')
      .sort({ submittedAt: -1 })
      .lean();

    // Fetch session attendance records
    const sessions = await Session.find({
      'attendanceList.traineeId': user._id
    })
      .select('title courseTitle scheduledDate attendanceList sessionType')
      .sort({ scheduledDate: -1 })
      .lean();

    const attendanceRecords = sessions.map(sess => {
      const rec = (sess.attendanceList || []).find(a => String(a.traineeId) === String(user._id));
      return {
        _id: sess._id,
        sessionTitle: sess.title,
        courseTitle: sess.courseTitle,
        scheduledDate: sess.scheduledDate,
        sessionType: sess.sessionType,
        status: rec ? rec.status : 'Present',
        markedAt: rec ? rec.markedAt : sess.scheduledDate
      };
    });

    // Summary statistics
    const totalEnrolled = enrollments.length;
    const completedCount = enrollments.filter(e => e.status === 'completed' || (e.progressPercentage || 0) >= 100).length;
    const inProgressCount = enrollments.filter(e => (e.status === 'in_progress' || (e.status === 'enrolled' && (e.progressPercentage || 0) > 0)) && (e.progressPercentage || 0) < 100).length;
    const notStartedCount = enrollments.filter(e => e.status === 'enrolled' && (!e.progressPercentage || e.progressPercentage === 0)).length;

    const totalProgressSum = enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0);
    const avgProgress = totalEnrolled > 0 ? Math.round(totalProgressSum / totalEnrolled) : 0;

    // Best assessment scores across attempts or enrollments
    const allAttemptScores = attempts.map(a => a.percentage || 0);
    const avgScore = allAttemptScores.length > 0
      ? Math.round(allAttemptScores.reduce((sum, s) => sum + s, 0) / allAttemptScores.length)
      : (enrollments.some(e => (e.bestAssessmentScore || 0) > 0)
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.bestAssessmentScore || 0), 0) / enrollments.filter(e => (e.bestAssessmentScore || 0) > 0).length)
        : null);

    const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
    const attendancePct = attendanceRecords.length > 0 
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : (enrollments.length > 0 && enrollments[0].attendancePercentage !== undefined ? enrollments[0].attendancePercentage : 95);

    const isIndependentLearner = !user.organizationId || 
      (user.organizationName && (
        user.organizationName.toLowerCase().includes('open') || 
        user.organizationName.toLowerCase().includes('independent') || 
        user.organizationName.toLowerCase().includes('direct')
      )) ||
      (user.department && (
        user.department.toLowerCase().includes('open') || 
        user.department.toLowerCase().includes('direct') || 
        user.department.toLowerCase().includes('independent')
      ));

    res.json({
      success: true,
      user,
      isIndependentLearner,
      summary: {
        totalEnrolled,
        completedCount,
        inProgressCount,
        notStartedCount,
        avgProgress,
        avgScore,
        attendancePercentage: attendancePct,
        certificatesEarned: certificates.length,
        totalAttempts: attempts.length,
        passedAttempts: attempts.filter(a => a.passed).length
      },
      enrollments,
      certificates,
      attempts,
      attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  deleteUser,
  getUserLearningProgress,
  updateCourseGovernanceStatus,
  getAuditLogs,
  clearAuditLogs,
  deleteAuditLog,
  getAnnouncements,
  createAnnouncement,
  getPublicStats
};
