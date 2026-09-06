const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'capacity_connect_gov_secure_key_2026_moes_imd');
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'User account is inactive or suspended' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
};

const normalizeRole = (role) => {
  if (role === 'platform_super_admin' || role === 'platform_admin' || role === 'admin') return 'platform_admin';
  if (role === 'institute_admin' || role === 'org_admin') return 'institute_admin';
  if (role === 'student' || role === 'trainee') return 'student';
  if (role === 'certificate_verifier') return 'certificate_verifier';
  return role;
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const userRole = req.user.role;
    const normalizedUserRole = normalizeRole(userRole);

    // Platform Super Admin / Platform Admin has global administrative clearance
    if (normalizedUserRole === 'platform_admin') {
      return next();
    }

    const isAllowed = allowedRoles.some(allowed => {
      if (allowed === userRole) return true;
      if (allowed === 'admin' && (normalizedUserRole === 'platform_admin' || normalizedUserRole === 'institute_admin')) return true;
      if (allowed === 'institute_admin' && (normalizedUserRole === 'institute_admin' || normalizedUserRole === 'platform_admin')) return true;
      if (allowed === 'org_admin' && (normalizedUserRole === 'institute_admin' || normalizedUserRole === 'platform_admin')) return true;
      if (allowed === 'student' && normalizedUserRole === 'student') return true;
      if (allowed === 'trainee' && normalizedUserRole === 'student') return true;
      if (allowed === 'trainer' && userRole === 'trainer') return true;
      if (allowed === 'certificate_verifier' && normalizedUserRole === 'certificate_verifier') return true;
      return false;
    });

    if (!isAllowed) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Role '${userRole}' is not permitted to access this resource` 
      });
    }
    next();
  };
};

/**
 * Server-Side Multi-Tenant Isolation Guard
 * Prevents Institute A from querying, modifying, or accessing Institute B's records
 */
const enforceTenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const normalizedRole = normalizeRole(req.user.role);

  // Platform Admins have overarching national supervisory access
  if (normalizedRole === 'platform_admin') {
    return next();
  }

  // For tenant-level roles (Institute Admin, Trainer, Student):
  const userOrgId = req.user.organizationId?.toString();
  if (!userOrgId) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Denied: User account is not associated with an accredited institute tenant' 
    });
  }

  // Check requested organizationId in params, query, or body
  const targetOrgId = (req.params.orgId || req.params.id || req.query.organizationId || req.body?.organizationId)?.toString();
  if (targetOrgId && targetOrgId !== userOrgId) {
    return res.status(403).json({
      success: false,
      message: 'Security Violation: Multi-tenant boundary violation. Cross-tenant access is prohibited by server policy.'
    });
  }

  req.tenantOrgId = req.user.organizationId;
  next();
};

module.exports = { protect, authorizeRoles, enforceTenantIsolation, normalizeRole };

