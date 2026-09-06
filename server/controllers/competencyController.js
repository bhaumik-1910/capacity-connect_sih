const Competency = require('../models/Competency');
const { calculateSkillGap, TARGET_GOV_ROLES } = require('../services/skillGapService');

const DEFAULT_SEED_COMPETENCIES = [
  {
    code: 'RAD-301',
    name: 'Doppler Weather Radar (DWR) Analysis & Nowcasting',
    domain: 'Radar Meteorology',
    description: 'Interpretation of radar reflectivity (Z), radial velocity (V), and spectrum width (W) for real-time severe storm warnings.',
    levels: [
      { level: 'Beginner', description: 'Radar echoes interpretation and clutter identification', evidenceCriteria: 'Completion of radar foundational theory' },
      { level: 'Working', description: 'Real-time monitoring of convective cells', evidenceCriteria: '5 case analyses of squall lines' },
      { level: 'Proficient', description: 'Velocity dealiasing, hook echo and downburst detection', evidenceCriteria: 'Passing advanced DWR assessment with >75%' },
      { level: 'Expert', description: 'Radar data assimilation and dual-polarization hydrometeor classification', evidenceCriteria: 'Peer-reviewed research and operational briefing lead' }
    ]
  },
  {
    code: 'NWP-101',
    name: 'Numerical Weather Prediction & Data Assimilation',
    domain: 'Numerical Weather Prediction (NWP)',
    description: 'Configuration, parameterization, and execution of primitive equation atmospheric models (WRF, GFS-NCMRWF).',
    levels: [
      { level: 'Beginner', description: 'Basic Linux shell and GrADS/CDO post-processing', evidenceCriteria: 'Successful model output plotting' },
      { level: 'Working', description: 'Running standard forecast cycles on HPC cluster', evidenceCriteria: 'Operational batch job automation' },
      { level: 'Proficient', description: 'Data assimilation (3D-Var / 4D-Var) of Doppler & satellite radiances', evidenceCriteria: 'Passing NWP validation testing' },
      { level: 'Expert', description: 'Ensemble prediction systems and model physics customization', evidenceCriteria: 'Published operational model tuning' }
    ]
  },
  {
    code: 'CYC-501',
    name: 'Tropical Cyclone Tracking & Storm Surge Modeling',
    domain: 'Cyclone Warning & Disaster Management',
    description: 'Dvorak technique intensity estimation, parabolic track forecasting, and INCOIS storm surge coastal risk warnings.',
    levels: [
      { level: 'Beginner', description: 'Basin climatology and cyclone categorization', evidenceCriteria: 'Course assessment completion' },
      { level: 'Working', description: 'Dvorak T-number estimation from IR/Visible imagery', evidenceCriteria: '10 verified satellite estimations' },
      { level: 'Proficient', description: 'Ensemble track consensus and coastal landfall prediction', evidenceCriteria: 'Mock national cyclone warning bulletin creation' },
      { level: 'Expert', description: 'Real-time operational cyclone warning command lead', evidenceCriteria: 'MoES certified lead cyclone forecaster' }
    ]
  },
  {
    code: 'SAT-401',
    name: 'INSAT-3D/3DR Satellite Radiance & Cloud Motion Vectors',
    domain: 'Satellite Meteorology',
    description: 'Interpretation of multispectral geostationary imagery (VIS, SWIR, TIR1, TIR2, WV) for deep convective cloud tracking.',
    levels: [
      { level: 'Beginner', description: 'RGB composite interpretation', evidenceCriteria: 'Basic satellite imagery quiz' },
      { level: 'Working', description: 'Cloud top brightness temperature extraction and rainfall estimation', evidenceCriteria: 'Operational satellite product generation' },
      { level: 'Proficient', description: 'Atmospheric Motion Vectors (AMVs) calculation and assimilation', evidenceCriteria: 'Satellite product validation study' },
      { level: 'Expert', description: 'Sounder profile retrieval algorithms and microphysical diagnostics', evidenceCriteria: 'MoES national satellite mission lead' }
    ]
  },
  {
    code: 'ATM-201',
    name: 'Atmospheric Thermodynamics & Meso-Scale Dynamics',
    domain: 'Atmospheric Sciences',
    description: 'Tephigram analysis, convective available potential energy (CAPE), wind shear, and boundary layer thermodynamics.',
    levels: [
      { level: 'Beginner', description: 'Thermodynamic diagram plotting and stability index calculation', evidenceCriteria: 'Tephigram computation worksheet' },
      { level: 'Working', description: 'Meso-scale squall line and thunderstorm genesis diagnosis', evidenceCriteria: 'Pre-monsoon thunderstorm forecasting exercise' },
      { level: 'Proficient', description: 'Gravity wave propagation and low-level jet structure analysis', evidenceCriteria: 'Dynamic instability case report' },
      { level: 'Expert', description: 'Advanced parameterization of boundary layer turbulence and convection', evidenceCriteria: 'National training program leadership' }
    ]
  }
];

// Helper to resolve string codes or ObjectIds to valid MongoDB ObjectIds
const resolveCompetencyIds = async (inputIds) => {
  if (!Array.isArray(inputIds) || inputIds.length === 0) return [];
  const resolved = [];

  for (let rawItem of inputIds) {
    if (!rawItem) continue;

    // Handle possible nested arrays or stringified arrays like "['RAD-301']"
    if (typeof rawItem === 'string' && (rawItem.startsWith('[') || rawItem.includes(','))) {
      try {
        const cleaned = rawItem.replace(/['"[\]]/g, '').trim();
        const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
        for (const p of parts) {
          const subResolved = await resolveCompetencyIds([p]);
          resolved.push(...subResolved);
        }
        continue;
      } catch (e) {}
    }

    const strVal = String(rawItem).replace(/['"[\]]/g, '').trim();
    if (!strVal) continue;

    // Check if it's already a valid 24-char hex ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(strVal)) {
      resolved.push(strVal);
      continue;
    }

    // It is a code (e.g. 'RAD-301') or name
    let comp = await Competency.findOne({
      $or: [{ code: strVal.toUpperCase() }, { name: strVal }]
    });

    if (!comp) {
      // Find in defaults and seed it
      const defaultSeed = DEFAULT_SEED_COMPETENCIES.find(
        c => c.code.toUpperCase() === strVal.toUpperCase()
      );
      if (defaultSeed) {
        comp = await Competency.create(defaultSeed);
      }
    }

    if (comp) {
      resolved.push(comp._id);
    }
  }

  // Deduplicate ObjectIds
  return [...new Set(resolved.map(id => String(id)))];
};

// @route GET /api/v1/competencies
const getCompetencies = async (req, res) => {
  try {
    let competencies = await Competency.find({
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    }).sort({ domain: 1, name: 1 });

    // Auto-seed default competencies if collection is empty
    if (!competencies || competencies.length === 0) {
      for (const item of DEFAULT_SEED_COMPETENCIES) {
        await Competency.findOneAndUpdate(
          { code: item.code.toUpperCase() },
          { $setOnInsert: item },
          { upsert: true, new: true }
        );
      }
      competencies = await Competency.find({
        $or: [{ status: 'active' }, { status: { $exists: false } }]
      }).sort({ domain: 1, name: 1 });
    }

    res.json({ success: true, count: competencies.length, competencies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/competencies
const createCompetency = async (req, res) => {
  try {
    const { code, name, domain, description, levels } = req.body;
    const competency = await Competency.create({
      code: code.toUpperCase(),
      name,
      domain,
      description,
      levels: levels || [
        { level: 'Beginner', description: 'Foundational awareness and concept comprehension' },
        { level: 'Working', description: 'Operational execution under supervision' },
        { level: 'Proficient', description: 'Independent operational capability and troubleshooting' },
        { level: 'Expert', description: 'Mastery, research, guidance, and strategic advisory' }
      ]
    });
    res.status(201).json({ success: true, competency });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/competencies/skill-gap
const getMySkillGap = async (req, res) => {
  try {
    const targetRoleId = req.query.roleId || 'radar_specialist';
    const analysis = await calculateSkillGap(req.user._id, targetRoleId);
    res.json({ success: true, ...analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/competencies/target-roles
const getTargetRoles = async (req, res) => {
  try {
    res.json({ success: true, roles: TARGET_GOV_ROLES });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/v1/competencies/:id
const deleteCompetency = async (req, res) => {
  try {
    const { id } = req.params;
    const competency = await Competency.findById(id);
    if (!competency) {
      return res.status(404).json({ success: false, message: 'Competency not found' });
    }

    await Competency.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Competency standard ${competency.code} (${competency.name}) deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompetencies,
  createCompetency,
  getMySkillGap,
  getTargetRoles,
  deleteCompetency,
  resolveCompetencyIds,
  DEFAULT_SEED_COMPETENCIES
};

