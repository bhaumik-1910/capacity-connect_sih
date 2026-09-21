const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Organization = require('../models/Organization');
const { logAuditEvent } = require('../middleware/auditLogger');
const { resolveCompetencyIds } = require('./competencyController');

// @route GET /api/v1/courses
const getPublishedCourses = async (req, res) => {
  try {
    const { category, level, search, instituteOnly, excludeGovernment, organizationId } = req.query;
    const conditions = [{ status: 'published' }];

    const isPlatformAdmin = req.user && ['platform_admin', 'platform_super_admin', 'admin'].includes(req.user.role);
    const hasOrg = req.user && Boolean(req.user.organizationId);

    // 1. Institute admin or institute-only request: exclude government courses
    if (excludeGovernment === 'true' || instituteOnly === 'true' || (req.user && (req.user.role === 'institute_admin' || req.user.role === 'org_admin'))) {
      conditions.push({ isGovernmentCourse: { $ne: true } });
      if (req.user?.organizationId) {
        conditions.push({ organizationId: req.user.organizationId });
      }
    } else if (isPlatformAdmin) {
      // 2. Platform Admins can see all courses across system
      if (organizationId) {
        conditions.push({ organizationId });
      }
    } else if (hasOrg && (req.user.role === 'trainee' || req.user.role === 'student')) {
      // 3. Accredited Institute Student: Government courses + their own institute courses
      conditions.push({
        $or: [
          { isGovernmentCourse: true },
          { organizationId: null },
          { organizationId: req.user.organizationId }
        ]
      });
    } else {
      // 4. External / Direct Public student OR unauthenticated guest:
      // STRICT RULE: ONLY Central Government / MoES / IMD courses allowed!
      // Institute-specific private courses are strictly hidden.
      conditions.push({
        isGovernmentCourse: true
      });
    }

    if (category && category !== 'All') {
      conditions.push({ category });
    }
    if (level && level !== 'All') {
      conditions.push({ level });
    }
    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const filter = conditions.length === 1 ? conditions[0] : { $and: conditions };

    const courses = await Course.find(filter)
      .populate('trainerId', 'name email designation department')
      .populate('competencyIds', 'code name domain')
      .sort({ createdAt: -1 });

    const courseIds = courses.map(c => c._id);
    const enrollmentStats = await Enrollment.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$courseId', count: { $sum: 1 }, avgProgress: { $avg: '$progressPercentage' } } }
    ]);
    const statsMap = {};
    enrollmentStats.forEach(s => {
      statsMap[s._id.toString()] = { count: s.count, avgProgress: Math.round(s.avgProgress || 0) };
    });

    const coursesWithStats = courses.map(c => ({
      ...c.toObject(),
      enrolledCount: statsMap[c._id.toString()]?.count || c.enrollmentCount || 0,
      avgProgress: statsMap[c._id.toString()]?.avgProgress || 0
    }));

    res.json({ success: true, count: coursesWithStats.length, courses: coursesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/courses/:id
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('trainerId', 'name email designation department bio')
      .populate('competencyIds', 'code name domain levels')
      .populate('assessmentId', 'title durationMinutes passPercentage totalMarks questions');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check enrollment status if user logged in
    let userEnrollment = null;
    if (req.user) {
      userEnrollment = await Enrollment.findOne({
        traineeId: req.user._id,
        courseId: course._id
      });
      // Auto-create enrollment only if user is an affiliated institute student (or admin) and course is government-certified or own institute
      const isPlatformAdmin = ['platform_super_admin', 'platform_admin', 'admin'].includes(req.user.role);
      const isInstituteStudent = Boolean(req.user.organizationId) || isPlatformAdmin;
      const isGovCourse = course.isGovernmentCourse === true || 
                          course.isGovernmentFree === true || 
                          !course.organizationId ||
                          course.organizationName?.toLowerCase().includes('imd') || 
                          course.organizationName?.toLowerCase().includes('moes');
      const isOwnInstituteCourse = req.user.organizationId && course.organizationId && 
                                   course.organizationId.toString() === req.user.organizationId.toString();

      if (!userEnrollment && ['trainee', 'student', 'admin'].includes(req.user.role) && isInstituteStudent && (isGovCourse || isOwnInstituteCourse)) {
        userEnrollment = await Enrollment.create({
          traineeId: req.user._id,
          courseId: course._id,
          organizationId: req.user.organizationId || null,
          progressPercentage: 0,
          completedModuleItems: [],
          status: 'in_progress',
          enrolledAt: new Date(),
          lastAccessedAt: new Date()
        });
        await Course.findByIdAndUpdate(course._id, { $inc: { enrollmentCount: 1 } });
      }
    }

    res.json({ success: true, course, userEnrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/courses
const createCourse = async (req, res) => {
  try {
    const {
      title,
      code,
      category,
      description,
      outcomes,
      prerequisites,
      level,
      durationWeeks,
      durationHours,
      capacity,
      competencyIds,
      modules,
      status
    } = req.body;

    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: `Course code ${code} is already registered` });
    }

    const safeCompetencyIds = await resolveCompetencyIds(competencyIds);

    const isAdmin = req.user.role === 'admin' || req.user.role === 'platform_admin' || req.user.role === 'platform_super_admin';

    const isGovCourse = isAdmin || Boolean(req.body.isGovernmentCourse);

    const course = await Course.create({
      title,
      code: code.toUpperCase(),
      category,
      description,
      outcomes: outcomes || [],
      prerequisites: prerequisites || [],
      level: level || 'Intermediate',
      durationWeeks: durationWeeks || 4,
      durationHours: durationHours || 24,
      capacity: capacity || 100,
      trainerId: req.user._id,
      trainerName: isAdmin ? (req.body.trainerName || req.user.name || '') : req.user.name,
      organizationName: isGovCourse ? 'Ministry of Earth Sciences (MoES) / IMD' : (req.user.organizationName || ''),
      organizationId: isGovCourse ? null : (req.user.organizationId || null),
      isGovernmentCourse: isGovCourse,
      competencyIds: safeCompetencyIds,
      modules: modules || [],
      status: status || 'published' // Default to published so all courses appear immediately in catalogue
    });

    await logAuditEvent({
      actor: req.user,
      action: 'COURSE_CREATED',
      module: 'COURSES',
      targetId: course._id,
      targetName: course.title,
      metadata: { code: course.code, status: course.status }
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/courses/:id
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify trainer owns the course or user is admin
    if (course.trainerId.toString() !== req.user._id.toString() && !['platform_admin', 'org_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this course' });
    }

    if (req.body.competencyIds) {
      req.body.competencyIds = await resolveCompetencyIds(req.body.competencyIds);
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    await logAuditEvent({
      actor: req.user,
      action: 'COURSE_UPDATED',
      module: 'COURSES',
      targetId: updated._id,
      targetName: updated.title
    });

    res.json({ success: true, course: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/v1/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isOwner = course.trainerId && course.trainerId.toString() === req.user._id.toString();
    const isPlatformAdmin = ['platform_admin', 'platform_super_admin', 'admin'].includes(req.user.role);
    const isOrgAdmin = ['org_admin', 'institute_admin'].includes(req.user.role) &&
      course.organizationId && req.user.organizationId &&
      course.organizationId.toString() === req.user.organizationId.toString();

    // Verify trainer owns the course or user is admin
    if (!isOwner && !isPlatformAdmin && !isOrgAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ courseId: req.params.id });
    try {
      const Assessment = require('../models/Assessment');
      await Assessment.deleteMany({ courseId: req.params.id });
    } catch (e) {
      // Ignored if model not present
    }

    await logAuditEvent({
      actor: req.user,
      action: 'COURSE_DELETED',
      module: 'COURSES',
      targetId: req.params.id,
      targetName: course.title
    });

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/courses/trainer/my-courses
const getTrainerCourses = async (req, res) => {
  try {
    let courseQuery = { trainerId: req.user._id, isGovernmentCourse: { $ne: true } };

    if (req.user.role === 'institute_admin' || req.user.role === 'org_admin') {
      const orgQuery = [];
      if (req.user.organizationId) orgQuery.push({ organizationId: req.user.organizationId });
      if (req.user.organizationName) orgQuery.push({ organizationName: req.user.organizationName });

      const instituteTrainers = await User.find({
        role: 'trainer',
        ...(orgQuery.length > 0 ? { $or: orgQuery } : {})
      }).select('_id');
      const trainerIds = instituteTrainers.map(t => t._id);

      courseQuery = {
        isGovernmentCourse: { $ne: true },
        $or: [
          { trainerId: { $in: [...trainerIds, req.user._id] } },
          ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
          ...(req.user.organizationName ? [{ organizationName: req.user.organizationName }] : [])
        ]
      };
    } else if (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin') {
      courseQuery = {};
    }

    const courses = await Course.find(courseQuery)
      .populate('competencyIds', 'code name')
      .populate('assessmentId')
      .sort({ createdAt: -1 });

    // For each course, count enrolled trainees
    const courseIds = courses.map(c => c._id);
    const enrollments = await Enrollment.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$courseId', count: { $sum: 1 }, avgProgress: { $avg: '$progressPercentage' } } }
    ]);

    const statsMap = {};
    enrollments.forEach(e => {
      statsMap[e._id.toString()] = { count: e.count, avgProgress: Math.round(e.avgProgress || 0) };
    });

    const coursesWithStats = courses.map(c => ({
      ...c.toObject(),
      enrolledCount: statsMap[c._id.toString()]?.count || 0,
      avgProgress: statsMap[c._id.toString()]?.avgProgress || 0
    }));

    res.json({ success: true, courses: coursesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/courses/:id/enroll
const enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Course is not available for enrollment' });
    }

    const isPlatformAdmin = ['platform_super_admin', 'platform_admin', 'admin'].includes(req.user.role);
    const isGovCourse = course.isGovernmentCourse === true || 
                        course.isGovernmentFree === true || 
                        !course.organizationId ||
                        course.organizationName?.toLowerCase().includes('imd') || 
                        course.organizationName?.toLowerCase().includes('moes');
    const isOwnInstituteCourse = req.user.organizationId && course.organizationId && 
                                 course.organizationId.toString() === req.user.organizationId.toString();

    // 1. TIER 1: Institute Students (100% Free Campus Membership Access)
    if (req.user.organizationId) {
      const org = await Organization.findById(req.user.organizationId);
      if (org && (org.status === 'APPROVED' || org.status === 'active' || org.subscription?.status === 'ACTIVE')) {
        const enrollmentType = isGovCourse ? 'GOV_SCHOLARSHIP' : 'INSTITUTE_SPONSORED_FREE';
        enrollment = await Enrollment.create({
          traineeId: req.user._id,
          courseId,
          organizationId: req.user.organizationId,
          enrollmentType,
          status: 'enrolled',
          progressPercentage: 0,
          completedModuleItems: []
        });

        course.enrollmentCount = (course.enrollmentCount || 0) + 1;
        await course.save();

        await logAuditEvent({
          actor: req.user,
          action: 'COURSE_ENROLLED',
          module: 'COURSES',
          targetId: course._id,
          targetName: course.title,
          metadata: { enrollmentType }
        });

        return res.status(201).json({ success: true, enrollment, enrollmentType });
      }
    }

    // 2. TIER 2: External / Independent Students
    // If course is 100% free by government decree or user is admin
    if (isPlatformAdmin || course.isGovernmentFree || course.individualPrice === 0) {
      enrollment = await Enrollment.create({
        traineeId: req.user._id,
        courseId,
        organizationId: null,
        enrollmentType: 'GOV_SCHOLARSHIP',
        status: 'enrolled',
        progressPercentage: 0,
        completedModuleItems: []
      });

      course.enrollmentCount = (course.enrollmentCount || 0) + 1;
      await course.save();

      return res.status(201).json({ success: true, enrollment, enrollmentType: 'GOV_SCHOLARSHIP' });
    }

    // External student must complete payment checkout for government certification
    const individualPrice = course.individualPrice || 999;
    return res.status(402).json({
      success: false,
      paymentRequired: true,
      message: `External Independent Certification: Please complete checkout (₹${individualPrice}) to unlock full course curriculum & WMO certificate.`,
      price: individualPrice,
      currency: course.currency || 'INR',
      courseId: course._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/courses/:id/progress
const updateModuleProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { itemKey } = req.body; // e.g. "0-1" module index - item index

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let enrollment = await Enrollment.findOne({ traineeId: req.user._id, courseId });
    if (!enrollment) {
      enrollment = new Enrollment({
        traineeId: req.user._id,
        courseId,
        organizationId: req.user.organizationId || course.organizationId || null,
        progressPercentage: 0,
        completedModuleItems: [],
        status: 'in_progress',
        enrolledAt: new Date(),
        lastAccessedAt: new Date()
      });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    }

    if (!enrollment.organizationId && (req.user.organizationId || course.organizationId)) {
      enrollment.organizationId = req.user.organizationId || course.organizationId;
    }

    // Total items across all modules
    let totalItems = 0;
    (course.modules || []).forEach(m => {
      totalItems += (m.items || []).length;
    });
    if (totalItems === 0) totalItems = 1;

    if (!enrollment.completedModuleItems.includes(itemKey)) {
      enrollment.completedModuleItems.push(itemKey);
    }

    const completedCount = enrollment.completedModuleItems.length;
    enrollment.progressPercentage = Math.min(100, Math.round((completedCount / totalItems) * 100));

    if (enrollment.progressPercentage === 100) {
      if (!course.assessmentId || enrollment.assessmentPassed) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      } else {
        enrollment.status = 'in_progress';
      }
    } else {
      enrollment.status = 'in_progress';
    }

    enrollment.markModified('completedModuleItems');
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/courses/trainee/my-enrollments
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ traineeId: req.user._id })
      .populate({
        path: 'courseId',
        select: 'title code category level durationWeeks durationHours thumbnail trainerName assessmentId modules organizationName organizationId'
      })
      .populate('certificateId')
      .sort({ updatedAt: -1 });

    const enrolledCourseIds = enrollments
      .map(e => e.courseId?._id ? String(e.courseId._id) : String(e.courseId))
      .filter(Boolean);

    // Fetch courses created by trainee's institute/trainers only if user has an accredited organizationId
    let instituteCourses = [];
    if (req.user.organizationId) {
      const orgQuery = [{ organizationId: req.user.organizationId }];
      if (req.user.organizationName) {
        const esc = req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orgQuery.push({ organizationName: new RegExp(`^${esc}$`, 'i') });
      }

      const instituteTrainers = await User.find({
        role: 'trainer',
        $or: orgQuery
      }).select('_id');
      const trainerIds = instituteTrainers.map(t => t._id);

      const foundCourses = await Course.find({
        status: 'published',
        $or: [
          ...orgQuery,
          ...(trainerIds.length > 0 ? [{ trainerId: { $in: trainerIds } }] : [])
        ]
      })
        .populate('trainerId', 'name email designation department')
        .populate('assessmentId', 'title totalMarks passPercentage durationMinutes')
        .sort({ createdAt: -1 });

      instituteCourses = foundCourses.map(c => ({
        ...c.toObject(),
        isEnrolled: enrolledCourseIds.includes(String(c._id))
      }));
    }

    res.json({
      success: true,
      enrollments,
      instituteCourses,
      instituteName: req.user.organizationId ? (req.user.organizationName || '') : ''
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/courses/trainer/trainee-analytics
const getTraineeAnalytics = async (req, res) => {
  try {
    let courseFilter = {};
    if (req.user.role === 'trainer') {
      const myCourses = await Course.find({ trainerId: req.user._id }).select('_id');
      courseFilter = { courseId: { $in: myCourses.map(c => c._id) } };
    } else if (req.user.role === 'institute_admin' || req.user.role === 'org_admin') {
      const orgQuery = [];
      if (req.user.organizationId) orgQuery.push({ organizationId: req.user.organizationId });
      if (req.user.organizationName) orgQuery.push({ organizationName: req.user.organizationName });

      const instituteUsers = await User.find(
        orgQuery.length > 0 ? { $or: orgQuery } : { organizationId: req.user.organizationId }
      ).select('_id role');
      const studentIds = instituteUsers.filter(u => u.role === 'trainee' || u.role === 'student').map(u => u._id);
      const trainerIds = instituteUsers.filter(u => u.role === 'trainer').map(u => u._id);

      const instituteCourses = await Course.find({
        $or: [
          ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
          ...(req.user.organizationName ? [{ organizationName: req.user.organizationName }] : []),
          { trainerId: { $in: [...trainerIds, req.user._id] } }
        ]
      }).select('_id');
      const courseIds = instituteCourses.map(c => c._id);

      courseFilter = {
        $or: [
          { traineeId: { $in: studentIds } },
          { courseId: { $in: courseIds } }
        ]
      };
    }

    const enrollments = await Enrollment.find(courseFilter)
      .populate('traineeId', 'name email department organizationName designation')
      .populate('courseId', 'code title category trainerName')
      .sort({ updatedAt: -1 });

    const analytics = enrollments.map(enr => {
      const trainee = enr.traineeId || {};
      const course = enr.courseId || {};
      const progress = enr.progressPercentage || 0;
      const attendance = enr.attendancePercentage || 90;
      const score = enr.bestAssessmentScore || 0;

      let isAtRisk = false;
      let reason = '';
      if (attendance < 50) {
        isAtRisk = true;
        reason = `Attendance critically low (${attendance}%), below 50% threshold`;
      } else if (progress < 25 && enr.status !== 'completed') {
        isAtRisk = true;
        reason = `Course progress lagging at ${progress}%`;
      } else if (score > 0 && score < 40) {
        isAtRisk = true;
        reason = `Assessment score insufficient (${score}%)`;
      }

      return {
        id: enr._id,
        traineeId: trainee._id,
        name: trainee.name || '',
        email: trainee.email || '',
        dept: trainee.department || '',
        organization: trainee.organizationName || '',
        course: course.code || '',
        courseTitle: course.title || '',
        progress,
        score,
        attendance,
        status: enr.status === 'completed' ? 'Completed' : (isAtRisk ? 'Lagging' : 'In Progress'),
        isAtRisk,
        reason: isAtRisk ? reason : null,
        lastAccessedAt: enr.lastAccessedAt
      };
    });

    // Also include onboarded students from this institute who may not yet have formal course enrollments
    if (req.user.role === 'institute_admin' || req.user.role === 'org_admin') {
      const orgQuery = [];
      if (req.user.organizationId) orgQuery.push({ organizationId: req.user.organizationId });
      if (req.user.organizationName) orgQuery.push({ organizationName: req.user.organizationName });

      const allInstituteStudents = await User.find({
        role: { $in: ['trainee', 'student'] },
        ...(orgQuery.length > 0 ? { $or: orgQuery } : {})
      }).select('name email department organizationName designation');

      const enrolledTraineeIds = new Set(analytics.map(a => a.traineeId?.toString()));

      allInstituteStudents.forEach(stu => {
        if (!enrolledTraineeIds.has(stu._id.toString())) {
          analytics.push({
            id: `stu_${stu._id}`,
            traineeId: stu._id,
            name: stu.name || '',
            email: stu.email || '',
            dept: stu.department || '',
            organization: stu.organizationName || req.user.organizationName || '',
            course: '',
            courseTitle: '',
            progress: 0,
            score: 0,
            attendance: 100,
            status: 'Enrolled',
            isAtRisk: false,
            reason: null,
            lastAccessedAt: null
          });
        }
      });
    }

    res.json({ success: true, count: analytics.length, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/courses/:id/certificate-template (Trainer/Admin — own courses only)
const updateCourseCertTemplate = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Only the trainer who created the course (or admin) can set its template
    const userRole = req.user.role;
    const isAdmin = userRole === 'platform_admin' || userRole === 'org_admin' || userRole === 'admin';
    if (!isAdmin && String(course.trainerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only customize certificates for your own courses.' });
    }

    const {
      backgroundUrl,
      useCustomBackground,
      titleText,
      trainerSignatureName,
      trainerSignatureDesignation,
      accentColor
    } = req.body;

    if (!course.certificateTemplate) course.certificateTemplate = {};
    if (backgroundUrl !== undefined) course.certificateTemplate.backgroundUrl = backgroundUrl;
    if (useCustomBackground !== undefined) course.certificateTemplate.useCustomBackground = useCustomBackground;
    if (titleText !== undefined) course.certificateTemplate.titleText = titleText;
    if (trainerSignatureName !== undefined) course.certificateTemplate.trainerSignatureName = trainerSignatureName;
    if (trainerSignatureDesignation !== undefined) course.certificateTemplate.trainerSignatureDesignation = trainerSignatureDesignation;
    if (accentColor !== undefined) course.certificateTemplate.accentColor = accentColor;

    course.markModified('certificateTemplate');
    await course.save();

    res.json({ success: true, message: 'Certificate template saved!', certificateTemplate: course.certificateTemplate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/courses/:id/enrollments
const getCourseEnrollments = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).select('title code category level durationWeeks durationHours trainerName organizationName modules');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let totalLessonsCount = 0;
    (course.modules || []).forEach(m => {
      totalLessonsCount += (m.items || []).length;
    });

    const enrollments = await Enrollment.find({ courseId })
      .populate('traineeId', 'name email mobile organizationName department designation enrollmentNumber createdAt')
      .populate('certificateId', 'certificateNumber issuedAt status')
      .sort({ updatedAt: -1 });

    const totalEnrollments = enrollments.length;
    const completedCount = enrollments.filter(e => e.status === 'completed' || (e.progressPercentage || 0) >= 100).length;
    const inProgressCount = enrollments.filter(e => e.status === 'in_progress' || ((e.progressPercentage || 0) > 0 && (e.progressPercentage || 0) < 100)).length;
    const notStartedCount = enrollments.filter(e => (!e.progressPercentage || e.progressPercentage === 0) && e.status !== 'completed').length;
    const avgProgress = totalEnrollments > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / totalEnrollments) 
      : 0;

    res.json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        code: course.code,
        category: course.category,
        trainerName: course.trainerName,
        organizationName: course.organizationName,
        totalLessonsCount
      },
      summary: {
        totalEnrollments,
        completedCount,
        inProgressCount,
        notStartedCount,
        avgProgress
      },
      enrollments: enrollments.map(e => ({
        id: e._id,
        user: e.traineeId ? {
          _id: e.traineeId._id,
          name: e.traineeId.name || '',
          email: e.traineeId.email || '',
          organizationName: e.traineeId.organizationName || '',
          department: e.traineeId.department || '',
          designation: e.traineeId.designation || ''
        } : null,
        status: e.status === 'completed' || (e.progressPercentage || 0) >= 100 ? 'completed' : (((e.progressPercentage || 0) > 0) ? 'in_progress' : 'enrolled'),
        progressPercentage: e.progressPercentage || 0,
        completedItemsCount: (e.completedModuleItems || []).length,
        totalLessonsCount,
        enrolledAt: e.enrolledAt || e.createdAt,
        lastAccessedAt: e.lastAccessedAt || e.updatedAt,
        completedAt: e.completedAt,
        attendancePercentage: e.attendancePercentage || 95,
        assessmentPassed: e.assessmentPassed || false,
        bestAssessmentScore: e.bestAssessmentScore || 0,
        certificate: e.certificateId || null
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublishedCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTrainerCourses,
  enrollCourse,
  updateModuleProgress,
  getMyEnrollments,
  getTraineeAnalytics,
  updateCourseCertTemplate,
  getCourseEnrollments
};
