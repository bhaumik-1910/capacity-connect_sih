const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Intelligent Trainer-Competency Matching Engine
 * Weighting schema:
 * - Competency & Domain Alignment: 40%
 * - Experience & Seniority: 25%
 * - Learner Feedback / Quality Rating: 20%
 * - Workload / Availability Availability: 15%
 */
const matchTrainersForCourse = async ({ requiredCompetencyIds = [], domain = '', courseId = null }) => {
  // Fetch all trainers
  const trainers = await User.find({ role: 'trainer', status: 'active' }).populate('competencies.competencyId');

  // Count active courses per trainer
  const activeCourseCounts = await Course.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$trainerId', count: { $sum: 1 } } }
  ]);
  const workloadMap = {};
  activeCourseCounts.forEach(c => {
    workloadMap[c._id.toString()] = c.count;
  });

  // Calculate dynamic average ratings per trainer
  const trainerRatings = await Course.aggregate([
    { $match: { rating: { $gt: 0 } } },
    { $group: { _id: '$trainerId', avgRating: { $avg: '$rating' } } }
  ]);
  const ratingMap = {};
  trainerRatings.forEach(r => {
    ratingMap[r._id.toString()] = Number(r.avgRating.toFixed(1));
  });

  const rankedTrainers = trainers.map(trainer => {
    // 1. Competency score (0 - 40)
    let compScore = 15; // baseline
    if (trainer.department && domain && trainer.department.toLowerCase().includes(domain.toLowerCase())) {
      compScore += 10;
    }
    const matchedCount = (trainer.competencies || []).filter(c => 
      requiredCompetencyIds.some(reqId => reqId.toString() === (c.competencyId?._id || c.competencyId)?.toString())
    ).length;
    compScore += Math.min(15, matchedCount * 5);

    // 2. Experience score (0 - 25)
    const expYears = trainer.experienceYears || 5;
    const expScore = Math.min(25, Math.round((expYears / 20) * 25));

    // 3. Dynamic Feedback rating score (0 - 20)
    const trainerRating = ratingMap[trainer._id.toString()] !== undefined ? ratingMap[trainer._id.toString()] : 0;
    const ratingScore = trainerRating > 0 ? Math.round((trainerRating / 5) * 20) : 0;

    // 4. Workload score (0 - 15)
    // 0 courses = 15 pts, 1 course = 12 pts, 2 courses = 9 pts, 3+ courses = 5 pts
    const currentCourses = workloadMap[trainer._id.toString()] || 0;
    let workloadScore = 15;
    if (currentCourses === 1) workloadScore = 12;
    else if (currentCourses === 2) workloadScore = 9;
    else if (currentCourses >= 3) workloadScore = 5;

    const totalWeightedScore = Math.min(100, compScore + expScore + ratingScore + workloadScore);

    return {
      trainerId: trainer._id,
      name: trainer.name,
      email: trainer.email,
      designation: trainer.designation,
      department: trainer.department,
      organizationName: trainer.organizationName,
      experienceYears: trainer.experienceYears,
      currentActiveCourses: currentCourses,
      rating: trainerRating,
      scores: {
        competencyScore: compScore,
        experienceScore: expScore,
        ratingScore: ratingScore,
        workloadScore: workloadScore,
        totalScore: totalWeightedScore
      },
      matchPercentage: totalWeightedScore,
      recommendationLevel: totalWeightedScore >= 80 ? 'Highly Recommended' : (totalWeightedScore >= 65 ? 'Qualified' : 'Candidate')
    };
  });

  // Sort descending by total score
  rankedTrainers.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return rankedTrainers;
};

module.exports = { matchTrainersForCourse };
