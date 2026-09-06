const mongoose = require('mongoose');

const competencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  domain: { 
    type: String, 
    enum: [
      'Atmospheric Sciences', 
      'Radar Meteorology', 
      'Numerical Weather Prediction (NWP)', 
      'Cyclone Warning & Disaster Management', 
      'Satellite Meteorology',
      'Agrometeorology',
      'Ocean State Forecast'
    ],
    required: true 
  },
  description: { type: String, required: true },
  levels: [{
    level: { type: String, enum: ['Beginner', 'Working', 'Proficient', 'Expert'], required: true },
    description: String,
    evidenceCriteria: String
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Competency', competencySchema);
