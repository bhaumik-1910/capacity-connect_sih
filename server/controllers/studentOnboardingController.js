const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Attempt = require('../models/Attempt');
const Organization = require('../models/Organization');
const { logAuditEvent } = require('../middleware/auditLogger');

/**
 * Extracts password as the last 6 digits (or characters) of the enrollment number.
 * e.g. "IMD2024123456" -> "123456"
 * e.g. "ENR987654" -> "987654"
 */
const extractLast6DigitsPassword = (enrollmentNumber) => {
  if (!enrollmentNumber) return '123456';
  const clean = String(enrollmentNumber).trim();
  const digitsOnly = clean.replace(/\D/g, '');
  if (digitsOnly.length >= 6) {
    return digitsOnly.slice(-6);
  }
  if (clean.length >= 6) {
    return clean.slice(-6);
  }
  return clean.padStart(6, '0');
};

// @route POST /api/v1/users/students/bulk-import
const bulkImportStudents = async (req, res) => {
  try {
    const { students, courseId } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Students array is required and must not be empty.' });
    }

    // Check Institute Capacity Quota (e.g. 1000 student plan)
    const orgId = req.user?.organizationId;
    if (orgId && req.user?.role !== 'platform_admin') {
      const org = await Organization.findById(orgId);
      if (org) {
        const currentCount = await User.countDocuments({ organizationId: org._id, role: { $in: ['trainee', 'student'] } });
        const maxQuota = org.subscription?.maxStudentQuota || 1000;
        const availableSlots = Math.max(0, maxQuota - currentCount);

        if (students.length > availableSlots) {
          return res.status(400).json({
            success: false,
            quotaExceeded: true,
            message: `Campus Capacity Quota Exceeded! Your plan allows up to ${maxQuota} students (${currentCount} active, ${availableSlots} slots remaining). You tried to import ${students.length} students. Please upgrade your campus subscription tier.`,
            metrics: { maxQuota, currentCount, availableSlots, requested: students.length }
          });
        }
      }
    }

    let targetCourse = null;
    if (courseId) {
      targetCourse = await Course.findById(courseId);
    }

    const processedResults = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      const rawEnrollment = row.enrollmentNumber || row.EnrollmentNumber || row.rollNo || row.RollNo || row.studentId || row.ID || row.id;
      const rawName = row.name || row.Name || row.fullName || row.FullName || row.studentName;

      if (!rawEnrollment || !rawName) {
        errors.push({ row: i + 1, error: 'Missing Enrollment Number or Student Name' });
        continue;
      }

      let enrollmentNumber = String(rawEnrollment).trim();
      if (/[eE][+-]?\d+/.test(enrollmentNumber)) {
        const num = Number(enrollmentNumber);
        if (!isNaN(num)) {
          enrollmentNumber = num.toLocaleString('fullwide', { useGrouping: false });
        }
      }
      if (enrollmentNumber.endsWith('.0')) {
        enrollmentNumber = enrollmentNumber.slice(0, -2);
      }

      const name = String(rawName).trim();
      const plainPassword = extractLast6DigitsPassword(enrollmentNumber);

      // Email fallback if not provided in Excel
      const rawEmail = row.email || row.Email || '';
      const cleanEmail = (rawEmail || `${enrollmentNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.ac.in`).trim().toLowerCase();
      const department = String(row.department || row.Department || '').trim();
      const isPlatformAdmin = req.user && (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin');
      const organizationName = (!isPlatformAdmin && req.user?.organizationName)
        ? req.user.organizationName
        : String(
            row.organizationName ||
            row.Organization ||
            row.institute ||
            row.Institute ||
            row.institution ||
            row.Institution ||
            req.user?.organizationName ||
            ''
          ).trim();
      
      let rawMobile = row.mobile ?? row.Mobile ?? row.phone ?? '';
      let mobile = String(rawMobile).trim();
      if (/[eE][+-]?\d+/.test(mobile)) {
        const num = Number(mobile);
        if (!isNaN(num)) {
          mobile = num.toLocaleString('fullwide', { useGrouping: false });
        }
      }
      if (mobile.endsWith('.0')) {
        mobile = mobile.slice(0, -2);
      }

      // Check if user exists by enrollmentNumber or email
      let user = await User.findOne({
        $or: [
          { enrollmentNumber },
          { email: cleanEmail }
        ]
      });

      let isNew = false;
      if (user) {
        // Update user record and ensure password is the enrollment's last 6 digits
        user.name = name;
        user.enrollmentNumber = enrollmentNumber;
        user.department = department;
        user.designation = designation;
        if (organizationName) user.organizationName = organizationName;
        if (req.user?.organizationId) user.organizationId = req.user.organizationId;
        if (req.user?._id && !user.createdBy) user.createdBy = req.user._id;
        if (mobile) user.mobile = mobile;
        user.password = plainPassword; // pre('save') hashes this
        user.role = 'trainee';
        user.approvalStatus = 'approved';
        await user.save();
      } else {
        isNew = true;
        const studentOrgId = (!isPlatformAdmin && req.user?.organizationId)
          ? req.user.organizationId
          : (req.user?.organizationId || targetCourse?.organizationId || null);
        const studentOrgName = organizationName;

        user = await User.create({
          name,
          email: cleanEmail,
          enrollmentNumber,
          password: plainPassword,
          role: 'trainee',
          organizationId: studentOrgId,
          organizationName: studentOrgName,
          createdBy: req.user?._id || null,
          department,
          designation,
          mobile,
          approvalStatus: 'approved'
        });
      }

      // Auto-enroll in course if specified
      let enrolled = false;
      if (targetCourse) {
        const existingEnrollment = await Enrollment.findOne({ traineeId: user._id, courseId: targetCourse._id });
        if (!existingEnrollment) {
          await Enrollment.create({
            traineeId: user._id,
            courseId: targetCourse._id,
            status: 'enrolled',
            progressPercentage: 0,
            enrolledAt: new Date()
          });
          targetCourse.enrolledCount = (targetCourse.enrolledCount || 0) + 1;
          await targetCourse.save();
          enrolled = true;
        } else {
          enrolled = true;
        }
      }

      processedResults.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNumber,
        plainPassword,
        department: user.department,
        designation: user.designation,
        isNew,
        enrolledInCourse: enrolled ? targetCourse.title : null
      });
    }

    if (req.user) {
      await logAuditEvent({
        actor: req.user,
        action: 'STUDENTS_BULK_IMPORTED',
        module: 'USER_MANAGEMENT',
        targetName: `Bulk Imported ${processedResults.length} Trainees`,
        metadata: {
          importedCount: processedResults.length,
          errorsCount: errors.length,
          courseId: courseId || null
        }
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully onboarded ${processedResults.length} students. Login ID is their Enrollment Number and Password is the last 6 digits.`,
      count: processedResults.length,
      students: processedResults,
      errors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/students/single
const createSingleStudent = async (req, res) => {
  try {
    const { name, email, enrollmentNumber, department, designation, organizationId, organizationName, mobile, courseId } = req.body;

    if (!enrollmentNumber || !name) {
      return res.status(400).json({ success: false, message: 'Enrollment Number and Student Name are required.' });
    }

    const cleanEnrollment = String(enrollmentNumber).trim();
    const plainPassword = extractLast6DigitsPassword(cleanEnrollment);
    const cleanEmail = (email || `${cleanEnrollment.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.ac.in`).trim().toLowerCase();

    const isPlatformAdmin = req.user && (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin');
    const studentOrgId = (!isPlatformAdmin && req.user?.organizationId)
      ? req.user.organizationId
      : (organizationId || req.user?.organizationId || null);
    const studentOrgName = (!isPlatformAdmin && req.user?.organizationName)
      ? req.user.organizationName
      : (organizationName || req.user?.organizationName || '');

    let user = await User.findOne({
      $or: [{ enrollmentNumber: cleanEnrollment }, { email: cleanEmail }]
    });

    let isNew = false;
    if (user) {
      user.name = name.trim();
      user.enrollmentNumber = cleanEnrollment;
      user.department = department || user.department;
      user.designation = designation || user.designation;
      if (studentOrgId) user.organizationId = studentOrgId;
      if (studentOrgName) user.organizationName = studentOrgName;
      if (req.user?._id && !user.createdBy) user.createdBy = req.user._id;
      if (mobile) user.mobile = mobile;
      user.password = plainPassword;
      user.role = 'trainee';
      user.approvalStatus = 'approved';
      user.status = 'active';
      await user.save();
    } else {
      isNew = true;
      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        enrollmentNumber: cleanEnrollment,
        password: plainPassword,
        role: 'trainee',
        organizationId: studentOrgId,
        organizationName: studentOrgName,
        createdBy: req.user?._id || null,
        department: department || '',
        designation: designation || 'Student',
        mobile: mobile || '',
        status: 'active',
        approvalStatus: 'approved'
      });
    }

    let enrolledCourseTitle = null;
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        const existingEnrollment = await Enrollment.findOne({ traineeId: user._id, courseId });
        if (!existingEnrollment) {
          await Enrollment.create({
            traineeId: user._id,
            courseId: course._id,
            status: 'enrolled',
            progressPercentage: 0,
            enrolledAt: new Date()
          });
          course.enrolledCount = (course.enrolledCount || 0) + 1;
          await course.save();
        }
        enrolledCourseTitle = course.title;
      }
    }

    res.status(201).json({
      success: true,
      message: `Student ${user.name} onboarded successfully with ID: ${cleanEnrollment} and Password: ${plainPassword}`,
      student: {
        _id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNumber: cleanEnrollment,
        plainPassword,
        department: user.department,
        designation: user.designation,
        organizationName: user.organizationName,
        isNew,
        enrolledInCourse: enrolledCourseTitle
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/users/students
const getStudentsList = async (req, res) => {
  try {
    const filter = { role: { $in: ['trainee', 'student'] } };

    // Tenant Isolation: If Institute Admin, return students belonging to institute or added by its faculty trainers
    const isPlatformAdmin = req.user && (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin');

    if (!isPlatformAdmin && req.user) {
      if (req.user.role === 'institute_admin' || req.user.role === 'org_admin') {
        const orgQuery = [];
        if (req.user.organizationId) orgQuery.push({ organizationId: req.user.organizationId });
        if (req.user.organizationName) {
          const escName = req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          orgQuery.push({ organizationName: new RegExp(`^${escName}$`, 'i') });
        }

        // Find faculty & trainers belonging to this institute
        const instituteTrainers = await User.find({
          role: 'trainer',
          $or: [
            ...(orgQuery.length > 0 ? orgQuery : []),
            { createdBy: req.user._id }
          ]
        }).select('_id');
        const trainerIds = instituteTrainers.map(t => t._id);

        // Find courses created by these trainers or this institute
        const instituteCourses = await Course.find({
          $or: [
            ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
            ...(req.user.organizationName ? [{ organizationName: new RegExp(`^${req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] : []),
            { trainerId: { $in: [...trainerIds, req.user._id] } }
          ]
        }).select('_id');
        const courseIds = instituteCourses.map(c => c._id);

        // Find students enrolled in institute courses
        let enrolledTraineeIds = [];
        if (courseIds.length > 0) {
          const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).select('traineeId');
          enrolledTraineeIds = enrollments.map(e => e.traineeId).filter(Boolean);
        }

        filter.$or = [
          ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
          ...(req.user.organizationName ? [
            { organizationName: new RegExp(`^${req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          ] : []),
          { createdBy: req.user._id },
          ...(trainerIds.length > 0 ? [{ createdBy: { $in: trainerIds } }] : []),
          ...(enrolledTraineeIds.length > 0 ? [{ _id: { $in: enrolledTraineeIds } }] : [])
        ];
      } else if (req.user.role === 'trainer') {
        const trainerCourses = await Course.find({ trainerId: req.user._id }).select('_id');
        const courseIds = trainerCourses.map(c => c._id);
        let enrolledTraineeIds = [];
        if (courseIds.length > 0) {
          const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).select('traineeId');
          enrolledTraineeIds = enrollments.map(e => e.traineeId).filter(Boolean);
        }

        filter.$or = [
          ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
          ...(req.user.organizationName ? [
            { organizationName: new RegExp(`^${req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          ] : []),
          { createdBy: req.user._id },
          ...(enrolledTraineeIds.length > 0 ? [{ _id: { $in: enrolledTraineeIds } }] : [])
        ];
      }
    } else if (req.query.organizationId) {
      filter.organizationId = req.query.organizationId;
    }

    const students = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    const studentIds = students.map(s => s._id);
    const [enrollments, attempts] = await Promise.all([
      Enrollment.find({ traineeId: { $in: studentIds } }).populate('courseId', 'title code'),
      Attempt.find({ traineeId: { $in: studentIds } }).populate('courseId', 'title code').sort({ submittedAt: -1 })
    ]);

    const mapped = students.map(s => {
      const studentEnrollments = enrollments.filter(e => String(e.traineeId) === String(s._id));
      const studentAttempts = attempts.filter(a => String(a.traineeId) === String(s._id));
      const plainPassword = extractLast6DigitsPassword(s.enrollmentNumber || s.email);

      const passedAttempts = studentAttempts.filter(a => a.passed);
      const bestScore = studentAttempts.length > 0 ? Math.max(...studentAttempts.map(a => a.percentage || 0)) : 0;
      const latestAttempt = studentAttempts[0] || null;

      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        enrollmentNumber: s.enrollmentNumber || 'N/A',
        defaultPassword: plainPassword,
        department: s.department,
        designation: s.designation,
        organizationName: s.organizationName,
        status: s.status,
        approvalStatus: s.approvalStatus,
        createdAt: s.createdAt,
        lastLoginAt: s.lastLoginAt,
        examStats: {
          totalAttempts: studentAttempts.length,
          passedCount: passedAttempts.length,
          bestScore,
          latestScore: latestAttempt ? latestAttempt.percentage : null,
          latestPassed: latestAttempt ? latestAttempt.passed : null,
          latestDate: latestAttempt ? latestAttempt.submittedAt : null
        },
        enrolledCourses: studentEnrollments.map(e => ({
          courseId: e.courseId?._id,
          title: e.courseId?.title,
          code: e.courseId?.code,
          progress: e.progressPercentage,
          status: e.status
        }))
      };
    });

    res.json({ success: true, count: mapped.length, students: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/students/exam-submissions
const getStudentExamSubmissions = async (req, res) => {
  try {
    const { courseId, studentId, search, status } = req.query;
    let query = {};
    if (courseId) query.courseId = courseId;
    if (studentId) query.traineeId = studentId;
    if (status === 'passed') query.passed = true;
    if (status === 'failed') query.passed = false;

    const isPlatformAdmin = req.user && (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin');

    if (!isPlatformAdmin && req.user) {
      if (req.user.role === 'institute_admin' || req.user.role === 'org_admin') {
        const instituteTrainers = await User.find({
          role: 'trainer',
          $or: [
            ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
            ...(req.user.organizationName ? [{ organizationName: new RegExp(`^${req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] : []),
            { createdBy: req.user._id }
          ]
        }).select('_id');
        const trainerIds = instituteTrainers.map(t => t._id);

        const instituteCourses = await Course.find({
          $or: [
            ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
            ...(req.user.organizationName ? [{ organizationName: new RegExp(`^${req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] : []),
            { trainerId: { $in: [...trainerIds, req.user._id] } }
          ]
        }).select('_id');
        const courseIds = instituteCourses.map(c => c._id);

        const instituteStudents = await User.find({
          role: { $in: ['trainee', 'student'] },
          $or: [
            ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
            ...(req.user.organizationName ? [{ organizationName: new RegExp(`^${req.user.organizationName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] : []),
            { createdBy: req.user._id },
            ...(trainerIds.length > 0 ? [{ createdBy: { $in: trainerIds } }] : [])
          ]
        }).select('_id');
        const studentIds = instituteStudents.map(s => s._id);

        query.$and = [
          ...(query.$and || []),
          {
            $or: [
              { courseId: { $in: courseIds } },
              { traineeId: { $in: studentIds } }
            ]
          }
        ];
      } else if (req.user.role === 'trainer') {
        const trainerCourses = await Course.find({ trainerId: req.user._id }).select('_id');
        const courseIds = trainerCourses.map(c => c._id);
        query.courseId = { $in: courseIds };
      }
    }

    const submissions = await Attempt.find(query)
      .populate('traineeId', 'name email enrollmentNumber department organizationName designation')
      .populate('courseId', 'title code durationWeeks trainerName')
      .populate('assessmentId', 'title passPercentage totalMarks durationMinutes questions')
      .sort({ submittedAt: -1, createdAt: -1 });

    let filtered = submissions;
    if (search) {
      const q = search.toLowerCase();
      filtered = submissions.filter(s => {
        const studentName = (s.traineeName || s.traineeId?.name || '').toLowerCase();
        const enrollment = (s.traineeId?.enrollmentNumber || '').toLowerCase();
        const email = (s.traineeId?.email || '').toLowerCase();
        const course = (s.courseId?.title || '').toLowerCase();
        return studentName.includes(q) || enrollment.includes(q) || email.includes(q) || course.includes(q);
      });
    }

    res.json({
      success: true,
      count: filtered.length,
      total: submissions.length,
      submissions: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/v1/users/students/:id
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, role: { $in: ['trainee', 'student'] } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const isPlatformAdmin = req.user && (req.user.role === 'platform_super_admin' || req.user.role === 'platform_admin' || req.user.role === 'admin');
    if (!isPlatformAdmin && req.user) {
      const isOwner =
        (req.user.organizationId && student.organizationId && String(student.organizationId) === String(req.user.organizationId)) ||
        (req.user.organizationName && student.organizationName && student.organizationName.trim().toLowerCase() === req.user.organizationName.trim().toLowerCase()) ||
        (student.createdBy && String(student.createdBy) === String(req.user._id));

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Unauthorized: You cannot remove students from other institutes' });
      }
    }

    await Enrollment.deleteMany({ traineeId: id });
    await Attempt.deleteMany({ traineeId: id });
    await User.findByIdAndDelete(id);

    res.json({ success: true, message: `Student ${student.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  extractLast6DigitsPassword,
  bulkImportStudents,
  createSingleStudent,
  getStudentsList,
  getStudentExamSubmissions,
  deleteStudent
};
