const Assessment = require('../models/Assessment');
const Attempt = require('../models/Attempt');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { logAuditEvent } = require('../middleware/auditLogger');

// @route GET /api/v1/assessments/course/:courseId
const getCourseAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      courseId: req.params.courseId,
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'No active examination found for this course in the database' });
    }

    // For trainees taking the test, strip the correctOptionIndex and explanations to prevent cheating
    const isTrainerOrAdmin = ['trainer', 'platform_admin', 'org_admin'].includes(req.user.role);

    const sanitizedQuestions = assessment.questions.map((q, idx) => ({
      _id: q._id,
      index: idx,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      difficulty: q.difficulty,
      // Only include answers if user is trainer/admin
      ...(isTrainerOrAdmin ? { correctOptionIndex: q.correctOptionIndex, explanation: q.explanation } : {})
    }));

    res.json({
      success: true,
      assessment: {
        _id: assessment._id,
        courseId: assessment.courseId,
        courseTitle: assessment.courseTitle,
        title: assessment.title,
        instructions: assessment.instructions,
        durationMinutes: assessment.durationMinutes,
        passPercentage: assessment.passPercentage,
        totalMarks: assessment.totalMarks,
        questionsCount: assessment.questions.length,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/assessments/:id/submit
const submitAssessmentAttempt = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    const { userAnswers, timeSpentSeconds, mode = 'official' } = req.body;
    // userAnswers: [{ questionIndex: 0, selectedOption: 2 }, ...]

    let totalMarksAwarded = 0;
    let totalPossible = 0;

    const answerBreakdown = assessment.questions.map((q, idx) => {
      totalPossible += q.marks;
      const submitted = (userAnswers || []).find(a => a.questionIndex === idx);
      const selected = submitted ? submitted.selectedOption : -1;
      const isCorrect = selected === q.correctOptionIndex;
      const marks = isCorrect ? q.marks : 0;
      totalMarksAwarded += marks;

      return {
        questionIndex: idx,
        questionText: q.questionText,
        options: q.options,
        selectedOption: selected,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        marksAwarded: marks,
        explanation: q.explanation
      };
    });

    const percentage = totalPossible > 0 ? Math.round((totalMarksAwarded / totalPossible) * 100) : 0;
    const passed = percentage >= assessment.passPercentage;

    const attempt = await Attempt.create({
      assessmentId: assessment._id,
      courseId: assessment.courseId,
      traineeId: req.user._id,
      traineeName: req.user.name,
      answers: answerBreakdown,
      scoreObtained: totalMarksAwarded,
      totalPossibleMarks: totalPossible,
      percentage,
      passed,
      timeSpentSeconds: timeSpentSeconds || 0,
      mode
    });

    // If official attempt, update enrollment and user competencies
    if (mode === 'official') {
      const enrollment = await Enrollment.findOne({ traineeId: req.user._id, courseId: assessment.courseId });
      if (enrollment) {
        if (percentage > (enrollment.bestAssessmentScore || 0)) {
          enrollment.bestAssessmentScore = percentage;
        }
        if (passed) {
          enrollment.assessmentPassed = true;
          if (enrollment.progressPercentage >= 100) {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date();
          }
        }
        await enrollment.save();
      }

      // If passed, award competency credit in user's profile
      if (passed) {
        const course = await Course.findById(assessment.courseId).populate('competencyIds');
        if (course && course.competencyIds && course.competencyIds.length > 0) {
          const user = await User.findById(req.user._id);
          course.competencyIds.forEach(comp => {
            const existingComp = user.competencies.find(c => c.competencyName === comp.name);
            if (existingComp) {
              // Level up if proficient
              existingComp.level = course.targetCompetencyLevel || 'Proficient';
              existingComp.score = Math.max(existingComp.score, percentage);
              existingComp.verifiedAt = new Date();
            } else {
              user.competencies.push({
                competencyId: comp._id,
                competencyName: comp.name,
                level: course.targetCompetencyLevel || 'Working',
                score: percentage,
                verifiedAt: new Date()
              });
            }
          });
          await user.save();
        }
      }

      await logAuditEvent({
        actor: req.user,
        action: 'ASSESSMENT_SUBMITTED',
        module: 'ASSESSMENTS',
        targetId: attempt._id,
        targetName: assessment.title,
        metadata: { score: totalMarksAwarded, percentage, passed }
      });
    }

    res.json({
      success: true,
      attemptId: attempt._id,
      scoreObtained: totalMarksAwarded,
      totalPossibleMarks: totalPossible,
      percentage,
      passed,
      passPercentage: assessment.passPercentage,
      answers: answerBreakdown
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/assessments/my-attempts
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ traineeId: req.user._id })
      .populate('courseId', 'title code durationWeeks')
      .populate('assessmentId', 'title passPercentage questions durationMinutes')
      .sort({ createdAt: -1 });

    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/assessments
const createAssessment = async (req, res) => {
  try {
    const { courseId, title, instructions, durationMinutes, passPercentage, questions } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let totalMarks = 0;
    (questions || []).forEach(q => { totalMarks += (Number(q.marks) || 2); });

    let assessment = await Assessment.findOne({ courseId, status: 'active' });
    if (assessment) {
      assessment.title = title || assessment.title;
      assessment.instructions = instructions || assessment.instructions;
      assessment.durationMinutes = durationMinutes ? Number(durationMinutes) : assessment.durationMinutes;
      assessment.passPercentage = passPercentage ? Number(passPercentage) : assessment.passPercentage;
      assessment.totalMarks = totalMarks;
      assessment.questions = questions || [];
      assessment.status = 'active';
      await assessment.save();
    } else {
      assessment = await Assessment.create({
        courseId,
        courseTitle: course.title,
        title: title || `${course.title} Comprehensive Examination`,
        instructions: instructions || 'Read every question carefully before choosing.',
        durationMinutes: durationMinutes ? Number(durationMinutes) : 20,
        passPercentage: passPercentage ? Number(passPercentage) : 60,
        totalMarks,
        questions: questions || [],
        status: 'active'
      });
    }

    course.assessmentId = assessment._id;
    await course.save();

    await logAuditEvent({
      actor: req.user,
      action: 'ASSESSMENT_SAVED',
      module: 'ASSESSMENTS',
      targetId: assessment._id,
      targetName: assessment.title,
      metadata: { questionsCount: (questions || []).length, totalMarks }
    });

    res.status(201).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/assessments/course/:courseId/submissions
const getCourseSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const submissions = await Attempt.find({ courseId })
      .populate('traineeId', 'name email enrollmentNumber department organizationName designation')
      .populate('assessmentId', 'title passPercentage totalMarks durationMinutes questions')
      .sort({ submittedAt: -1, createdAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCourseAssessment,
  submitAssessmentAttempt,
  getMyAttempts,
  createAssessment,
  getCourseSubmissions
};
