const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('--- Starting CAPACITY CONNECT Automated API Verification ---');

  // 1. Health Check
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/health',
    method: 'GET'
  });
  console.log(`1. Health Check: Status ${healthRes.status}, data:`, healthRes.data);

  // 2. Trainee Login
  const traineeLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: '25004406110009', password: '110009' });
  console.log(`2. Trainee Login: Status ${traineeLogin.status}, Role: ${traineeLogin.data?.user?.role}`);
  const traineeToken = traineeLogin.data?.token;

  // 3. Admin Login
  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'bhaumikkothiya1@gmail.com', password: 'Bhaumik@1910' });
  console.log(`3. Admin Login: Status ${adminLogin.status}, Role: ${adminLogin.data?.user?.role}`);
  const adminToken = adminLogin.data?.token;

  // 4. Test RBAC: Trainee attempting Admin metrics (SHOULD FAIL with 403)
  const forbiddenRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/dashboard-metrics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${traineeToken}` }
  });
  console.log(`4. RBAC Check (Trainee accessing Admin): Status ${forbiddenRes.status} (Expected 403 Forbidden)`);

  // 5. Admin Dashboard Metrics (SHOULD SUCCEED with 200)
  const adminMetricsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/dashboard-metrics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`5. Admin Dashboard KPIs: Users: ${adminMetricsRes.data?.metrics?.totalUsers}, Courses: ${adminMetricsRes.data?.metrics?.totalCourses}, Certs: ${adminMetricsRes.data?.metrics?.certificatesIssued}`);

  // 6. Skill Gap Analysis for Trainee
  const skillGapRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/competencies/skill-gap?roleId=radar_specialist',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${traineeToken}` }
  });
  console.log(`6. Skill Gap Engine: Readiness Score: ${skillGapRes.data?.readinessScore}%, Target Role: ${skillGapRes.data?.targetRole?.roleTitle}`);

  // 7. Trainer Matching Engine
  const matchRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/trainer-matching/match',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}` 
    }
  }, { domain: 'Radar Meteorology' });
  console.log(`7. Trainer Matcher: Found ${matchRes.data?.count} candidate trainers. Top rank: ${matchRes.data?.matches?.[0]?.name} (${matchRes.data?.matches?.[0]?.matchPercentage}% match)`);

  // 8. Public Certificate Verification (No token!)
  const certsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/certificates/my-certificates',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${traineeToken}` }
  });
  const firstCertNum = certsRes.data?.certificates?.[0]?.certificateNumber;
  if (firstCertNum) {
    const publicVerifyRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/certificates/verify/${firstCertNum}`,
      method: 'GET'
    });
    console.log(`8. Public Verification for ${firstCertNum}: Valid: ${publicVerifyRes.data?.valid}, Student: ${publicVerifyRes.data?.studentName}, Grade: ${publicVerifyRes.data?.grade}`);
  }

  console.log('--- Verification Finished Successfully ---');
}

runVerification().catch(console.error);
