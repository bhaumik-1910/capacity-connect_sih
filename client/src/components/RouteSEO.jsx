import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route-Aware Dynamic SEO Manager
 * Dynamically synchronizes document.title, meta descriptions, and OpenGraph tags per route.
 */
const ROUTE_SEO_MAP = {
  '/': {
    title: 'CAPACITY CONNECT | Ministry of Earth Sciences (MoES) & IMD - National Capacity Building Ecosystem',
    description: 'National Digital Capacity Building & Learning Management Ecosystem for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD).'
  },
  '/about': {
    title: 'Institutional Framework & Ministry Mission | CAPACITY CONNECT - MoES & IMD',
    description: 'Explore the mission, autonomous institutes, and WMO-1083 accreditation standards governing the MoES Capacity Connect training platform.'
  },
  '/login': {
    title: 'Accredited Workspace Terminal | CAPACITY CONNECT - MoES & IMD',
    description: 'Unified authentication gateway for operational meteorologists, autonomous faculty, academy administrators, and Ministry governance councils.'
  },
  '/register': {
    title: 'Official Trainee Registration | CAPACITY CONNECT - MoES & IMD',
    description: 'Direct enrollment portal for officers and trainees to access accredited meteorological courses, Doppler radar training, and satellite forecasting.'
  },
  '/register-institute': {
    title: 'Institutional Affiliation Dossier | CAPACITY CONNECT - MoES & IMD',
    description: 'Apply for accredited institutional membership across 28 states & UTs within the Ministry of Earth Sciences capacity building network.'
  },
  '/verify': {
    title: 'Digital Certificate Verification Registry | MoES & IMD Credentials',
    description: 'Cryptographically verify the authenticity and competency benchmarks of digital certificates issued by MoES and IMD.'
  },
  '/trainee/dashboard': {
    title: 'Trainee Learning Terminal | CAPACITY CONNECT - MoES & IMD',
    description: 'Personalized meteorologist learning dashboard, syllabus tracking, and upcoming live training sessions.'
  },
  '/trainee/courses': {
    title: 'National Meteorological Course Catalogue | CAPACITY CONNECT',
    description: 'Browse accredited courses in Doppler Weather Radar, Numerical Weather Prediction, Tropical Cyclone Tracking, and Atmospheric Sciences.'
  },
  '/trainee/my-courses': {
    title: 'Enrolled Syllabi & Assessments | CAPACITY CONNECT - MoES & IMD',
    description: 'Track your ongoing meteorological modules, progress scores, and comprehensive examinations.'
  },
  '/trainee/passport': {
    title: 'Competency Passport & Skill Radar | MoES & IMD Trainee Portal',
    description: 'National Competency Framework progress visualization aligned with WMO-No. 1083 training requirements.'
  },
  '/trainee/certificates': {
    title: 'My Accredited Certificates | MoES & IMD Credentials',
    description: 'Download and verify tamper-proof digital certificates awarded by the Ministry of Earth Sciences.'
  },
  '/trainer/dashboard': {
    title: 'Faculty & Trainer Command Center | CAPACITY CONNECT - MoES & IMD',
    description: 'Author national curriculum, manage student cohorts, schedule live labs, and monitor competency acquisitions.'
  },
  '/trainer/create-course': {
    title: 'Curriculum Builder & Syllabus Studio | CAPACITY CONNECT Trainer',
    description: 'Author multimedia lectures, define competency mappings, and configure outcomes for national meteorological programs.'
  },
  '/trainer/question-bank': {
    title: 'Question Bank & Examination Manager | CAPACITY CONNECT Trainer',
    description: 'Create multi-tiered assessment questions, set grading thresholds, and supervise candidate evaluation.'
  },
  '/institute/dashboard': {
    title: 'Autonomous Institute Academy Portal | CAPACITY CONNECT',
    description: 'Institute administrative console for faculty onboarding, student rosters, and branded certificate credentials.'
  },
  '/admin/dashboard': {
    title: 'Central Governance Council Dashboard | Ministry of Earth Sciences (MoES)',
    description: 'National regulatory oversight console monitoring platform-wide accreditation, courses, certificates, and institutional compliance.'
  }
};

const RouteSEO = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find matching SEO config or fallback
    let match = ROUTE_SEO_MAP[currentPath];
    if (!match) {
      // Check prefix matching for dynamic sub-routes
      const prefix = Object.keys(ROUTE_SEO_MAP).find(k => k !== '/' && currentPath.startsWith(k));
      match = prefix ? ROUTE_SEO_MAP[prefix] : ROUTE_SEO_MAP['/'];
    }

    // 1. Update Title
    if (match.title) {
      document.title = match.title;
    }

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && match.description) {
      metaDesc.setAttribute('content', match.description);
    }

    // 3. Update OpenGraph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && match.title) {
      ogTitle.setAttribute('content', match.title);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && match.description) {
      ogDesc.setAttribute('content', match.description);
    }

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://capacityconnect.moes.gov.in${currentPath}`);
    }

    // 4. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://capacityconnect.moes.gov.in${currentPath}`);
    }
  }, [location.pathname]);

  return null;
};

export default RouteSEO;
