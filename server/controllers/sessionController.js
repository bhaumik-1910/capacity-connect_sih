const Session = require('../models/Session');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { logAuditEvent } = require('../middleware/auditLogger');

// @route GET /api/v1/sessions
const getSessions = async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;

    if (req.user.role === 'trainer') {
      filter.trainerId = req.user._id;
    } else if (req.user.role === 'institute_admin' || req.user.role === 'org_admin') {
      const orgQuery = [];
      if (req.user.organizationId) orgQuery.push({ organizationId: req.user.organizationId });
      if (req.user.organizationName) orgQuery.push({ organizationName: req.user.organizationName });

      const instituteTrainers = await User.find({
        role: 'trainer',
        ...(orgQuery.length > 0 ? { $or: orgQuery } : {})
      }).select('_id');
      const trainerIds = instituteTrainers.map(t => t._id);

      const instituteCourses = await Course.find({
        $or: [
          ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : []),
          ...(req.user.organizationName ? [{ organizationName: req.user.organizationName }] : []),
          { trainerId: { $in: [...trainerIds, req.user._id] } }
        ]
      }).select('_id');
      const courseIds = instituteCourses.map(c => c._id);

      filter.$or = [
        { trainerId: { $in: [...trainerIds, req.user._id] } },
        { courseId: { $in: courseIds } }
      ];
    }

    const sessions = await Session.find(filter).sort({ scheduledDate: 1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/sessions
const createSession = async (req, res) => {
  try {
    const { courseId, title, description, scheduledDate, durationMinutes, venueOrMeetingUrl, sessionType, assignedTrainerId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let targetTrainerId = req.user._id;
    let targetTrainerName = req.user.name;

    if (assignedTrainerId && (req.user.role === 'institute_admin' || req.user.role === 'org_admin' || req.user.role === 'admin')) {
      const assignedTrainer = await User.findById(assignedTrainerId);
      if (assignedTrainer) {
        targetTrainerId = assignedTrainer._id;
        targetTrainerName = assignedTrainer.name;
      }
    }

    const session = await Session.create({
      courseId,
      courseTitle: course.title,
      trainerId: targetTrainerId,
      trainerName: targetTrainerName,
      title,
      description,
      scheduledDate,
      durationMinutes: durationMinutes || 90,
      venueOrMeetingUrl: venueOrMeetingUrl || 'https://meet.gov.in/moes-live-lecture',
      sessionType: sessionType || 'Live Virtual Class'
    });

    await logAuditEvent({
      actor: req.user,
      action: 'SESSION_SCHEDULED',
      module: 'COURSES',
      targetId: session._id,
      targetName: `${course.title}: ${title}`,
      metadata: {
        scheduledDate,
        trainerName: targetTrainerName,
        organizationName: req.user.organizationName || course.organizationName
      }
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/v1/sessions/:id/attendance
const markAttendance = async (req, res) => {
  try {
    const { attendanceList } = req.body; // [{ traineeId, traineeName, status: 'Present'|'Absent' }]
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    session.attendanceList = attendanceList;
    session.status = 'Completed';
    await session.save();

    await logAuditEvent({
      actor: req.user,
      action: 'ATTENDANCE_RECORDED',
      module: 'COURSES',
      targetId: session._id,
      targetName: `${session.courseTitle}: ${session.title}`,
      metadata: {
        totalRoster: attendanceList.length,
        presentCount: attendanceList.filter(a => a.status === 'Present').length,
        organizationName: req.user.organizationName
      }
    });

    res.json({ success: true, message: 'Attendance recorded successfully', session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSessions,
  createSession,
  markAttendance
};
