const { matchTrainersForCourse } = require('../services/trainerMatchingService');
const Course = require('../models/Course');

// @route POST /api/v1/trainer-matching/match
const getTrainerMatches = async (req, res) => {
  try {
    const { courseId, requiredCompetencyIds, domain } = req.body;

    let compIds = requiredCompetencyIds || [];
    let domainName = domain || '';

    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        compIds = course.competencyIds || [];
        domainName = course.category || '';
      }
    }

    const matches = await matchTrainersForCourse({
      requiredCompetencyIds: compIds,
      domain: domainName,
      courseId
    });

    res.json({
      success: true,
      count: matches.length,
      domain: domainName,
      matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTrainerMatches };
