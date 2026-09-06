const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logAuditEvent } = require('../middleware/auditLogger');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || 'capacity_connect_gov_secure_key_2026_moes_imd', 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, organizationId, organizationName, department, designation, mobile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists' });
    }

    // New registrations require admin approval by default unless trainee
    const approvalStatus = role === 'trainee' ? 'approved' : 'pending';

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'trainee',
      organizationId: organizationId || undefined,
      organizationName: organizationName || 'India Meteorological Department (IMD)',
      department: department || 'Meteorology',
      designation: designation || 'Officer Trainee',
      mobile: mobile || '',
      approvalStatus
    });

    await logAuditEvent({
      actor: user,
      action: 'USER_REGISTERED',
      module: 'AUTH',
      targetId: user._id,
      targetName: user.name,
      metadata: { role: user.role, email: user.email }
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        organizationName: user.organizationName,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const input = email.trim();
    // Allow login via email or enrollment number (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: input.toLowerCase() },
        { enrollmentNumber: input },
        { enrollmentNumber: input.toUpperCase() },
        { enrollmentNumber: input.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user does not exist' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.approvalStatus === 'pending') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is pending verification and approval by MoES / IMD Central Administrator.' 
      });
    }

    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({ 
        success: false, 
        message: `Your account was rejected. Reason: ${user.rejectionReason || 'Contact MoES Administrator'}` 
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    await logAuditEvent({
      actor: user,
      action: 'USER_LOGIN',
      module: 'AUTH',
      targetId: user._id,
      targetName: user.name
    });

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNumber: user.enrollmentNumber,
        role: user.role,
        department: user.department,
        designation: user.designation,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        approvalStatus: user.approvalStatus,
        competencies: user.competencies
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };
