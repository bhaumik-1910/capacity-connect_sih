const Competency = require('../models/Competency');
const Course = require('../models/Course');
const User = require('../models/User');

// Predefined target roles for MoES / IMD capacity building
const TARGET_GOV_ROLES = [
  {
    roleId: 'nwp_lead',
    roleTitle: 'Numerical Weather Prediction (NWP) Modeling Lead',
    description: 'Expertise in high-resolution atmospheric models, data assimilation, and cluster supercomputing.',
    requiredCompetencies: [
      { code: 'NWP-101', minLevel: 'Proficient' },
      { code: 'ATM-201', minLevel: 'Proficient' },
      { code: 'SAT-401', minLevel: 'Working' }
    ]
  },
  {
    roleId: 'radar_specialist',
    roleTitle: 'Doppler Weather Radar (DWR) Operations Specialist',
    description: 'Advanced monitoring, velocity dealiasing, nowcasting severe thunderstorms and squall lines.',
    requiredCompetencies: [
      { code: 'RAD-301', minLevel: 'Proficient' },
      { code: 'ATM-201', minLevel: 'Working' },
      { code: 'CYC-501', minLevel: 'Working' }
    ]
  },
  {
    roleId: 'cyclone_warning_director',
    roleTitle: 'Cyclone Early Warning & Disaster Mitigation Director',
    description: 'Tropical cyclone track and intensity forecasting, storm surge modeling, stakeholder dissemination.',
    requiredCompetencies: [
      { code: 'CYC-501', minLevel: 'Expert' },
      { code: 'RAD-301', minLevel: 'Proficient' },
      { code: 'SAT-401', minLevel: 'Proficient' }
    ]
  }
];

const LEVEL_WEIGHTS = {
  'None': 0,
  'Beginner': 25,
  'Working': 50,
  'Proficient': 75,
  'Expert': 100
};

const calculateSkillGap = async (userId, targetRoleId = 'radar_specialist') => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const targetRole = TARGET_GOV_ROLES.find(r => r.roleId === targetRoleId) || TARGET_GOV_ROLES[0];
  const allCompetencies = await Competency.find({ status: 'active' });

  // Map user's current competency levels
  const userCompMap = {};
  (user.competencies || []).forEach(c => {
    userCompMap[c.competencyName] = c.level || 'Beginner';
  });

  const gapAnalysis = [];
  let totalTargetPoints = 0;
  let totalCurrentPoints = 0;

  for (const req of targetRole.requiredCompetencies) {
    const compDoc = allCompetencies.find(c => c.code === req.code);
    const compName = compDoc ? compDoc.name : req.code;
    const currentLevel = userCompMap[compName] || 'None';
    
    const targetScore = LEVEL_WEIGHTS[req.minLevel] || 75;
    const currentScore = LEVEL_WEIGHTS[currentLevel] || 0;
    const gapScore = Math.max(0, targetScore - currentScore);

    totalTargetPoints += targetScore;
    totalCurrentPoints += Math.min(targetScore, currentScore);

    // Find recommended courses that bridge this specific competency
    const recommendedCourses = await Course.find({
      status: 'published',
      ...(compDoc ? { competencyIds: compDoc._id } : {})
    }).select('title code level category durationHours thumbnail');

    gapAnalysis.push({
      competencyCode: req.code,
      competencyName: compName,
      domain: compDoc ? compDoc.domain : 'Meteorological Sciences',
      currentLevel,
      requiredLevel: req.minLevel,
      currentScore,
      targetScore,
      gapScore,
      status: currentScore >= targetScore ? 'ACHIEVED' : (currentScore > 0 ? 'PARTIAL_GAP' : 'CRITICAL_GAP'),
      recommendedCourses
    });
  }

  const overallReadinessScore = totalTargetPoints > 0 ? Math.round((totalCurrentPoints / totalTargetPoints) * 100) : 100;

  return {
    targetRole,
    availableRoles: TARGET_GOV_ROLES.map(r => ({ roleId: r.roleId, roleTitle: r.roleTitle, description: r.description })),
    readinessScore: overallReadinessScore,
    gapPercentage: Math.max(0, 100 - overallReadinessScore),
    gapAnalysis,
    personalizedLearningPath: gapAnalysis
      .filter(item => item.gapScore > 0)
      .flatMap(item => item.recommendedCourses)
      .filter((v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i)
  };
};

module.exports = { calculateSkillGap, TARGET_GOV_ROLES };
