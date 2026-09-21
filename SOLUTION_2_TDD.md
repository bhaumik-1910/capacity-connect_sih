# 🛠️ Technical Design Document (TDD)
## Project: CapacityConnect — Digital Capacity Building & Competency Governance Portal
**Role:** Solution Architect  
**Context:** Based on Functional Design Document (FDD v1.0)  
**Deliverable:** Solution 2 of 4 (Technical Architecture, Database Schema, and API Contracts)

---

## 1. Chosen Technology Stack & Architectural Rationale

CapacityConnect uses a high-performance, decoupled **3-Tier Full-Stack JavaScript/MERN Architecture** engineered for scalability, low latency, and strict multi-tenant isolation.

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT TIER                           │
│  React 18 + Vite + Tailwind CSS + Lucide Icons + Axios      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / Bearer JWT
┌──────────────────────────────▼──────────────────────────────┐
│                    API GATEWAY & BACKEND                    │
│  Node.js + Express.js Cluster Engine                        │
│  ├── Security: Helmet, CORS, Express-Rate-Limit, Bcrypt     │
│  ├── Multi-Tenant Scoper & RBAC Authorization Middleware    │
│  ├── Core Engines: AI Matcher, Ingestion, Exam Proctor      │
│  └── Async Audit Event Logger                               │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM / TLS 1.3
┌──────────────────────────────▼──────────────────────────────┐
│                      DATABASE TIER                          │
│  MongoDB Atlas (Replica Set, WiredTiger AES-256 at Rest)    │
│  ├── Multi-Tenant Compound Indexes                          │
│  └── Point-in-Time Recovery (PITR)                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 Technology Stack Matrix

| Layer | Technology | Version | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React.js (Vite) | 18.x | High-speed Single Page Application (SPA), component reusability, Virtual DOM performance, dynamic code splitting with sub-2s initial paint. |
| **Styling & UI** | Tailwind CSS | 3.4.x | Utility-first, zero runtime overhead, responsive layout primitives, consistent design tokens. |
| **Backend Runtime** | Node.js | 18+ LTS | Event-driven, non-blocking I/O ideal for handling concurrent API traffic, batch file uploads, and async socket events. |
| **Web API Framework**| Express.js | 4.19+ | Lightweight, robust middleware ecosystem (Helmet, CORS, Rate-Limiting), clean MVC separation. |
| **Database** | MongoDB Atlas | 7.0+ | Document model allows dynamic schema flexibility for multi-module course content, assessment question banks, and rapid JSON serialization. |
| **ODM / Data Layer** | Mongoose | 8.x | Strict schema validation, pre-save cryptographic hooks, compound indexing, and population helpers. |
| **Authentication** | JSON Web Tokens (JWT) | 9.x | Stateless authentication enabling horizontal backend scaling without server-side session memory locks. |
| **Password Security**| Bcrypt.js | 2.4.x | Industry standard salted key derivation function (10 salt rounds) resilient against rainbow-table attacks. |
| **Testing** | Playwright | 1.40+ | Cross-browser End-to-End (E2E) automated verification covering authentications, tenant guards, and QR lookup. |

---

## 2. Database Schema Design (Entity Models & History)

The database schema is designed with **Multi-Tenant Row-Level Scoping** using `organizationId` as the tenancy partition key.

### 2.1 User Entity Schema (`models/User.js`)
Stores authentication identities, role definitions, tenant mapping, and competency vector snapshots.

```javascript
{
  _id: ObjectId,
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['platform_super_admin', 'institute_admin', 'trainer', 'trainee'], 
    default: 'trainee',
    index: true 
  },
  organizationId: { 
    type: ObjectId, 
    ref: 'Organization', 
    required: function() { return this.role !== 'platform_super_admin'; },
    index: true 
  },
  department: { type: String, default: 'General' },
  enrollmentId: { type: String, sparse: true, index: true },
  temporaryPin: { type: String, select: false },
  isApproved: { type: Boolean, default: true },
  competencies: [{
    competencyName: String,
    score: { type: Number, min: 0, max: 100 },
    lastEvaluated: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

### 2.2 Organization / Tenant Schema (`models/Organization.js`)
Defines the multi-tenant institutional boundaries (universities, research institutes, regional forecast centers).

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g., 'IITM-PUNE', 'IMD-DELHI'
  type: { 
    type: String, 
    enum: ['university', 'research_institute', 'regional_center', 'ministry_hq'],
    default: 'university' 
  },
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },
  adminUser: { type: ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

---

### 2.3 Course & Curriculum Schema (`models/Course.js`)
Defines training programs, syllabus modules, assigned trainers, and learning objectives.

```javascript
{
  _id: ObjectId,
  title: { type: String, required: true, trim: true },
  courseCode: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  trainerId: { type: ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true },
  durationHours: { type: Number, default: 20 },
  modules: [{
    moduleNumber: Number,
    title: String,
    contentType: { type: String, enum: ['video', 'pdf', 'quiz', 'markdown'] },
    contentUrl: String,
    durationMinutes: Number
  }],
  targetedCompetencies: [String],
  publishedStatus: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
}
```

---

### 2.4 Assessment & Exam Schema (`models/Assessment.js`)
Configures anti-cheat parameters, question banks, time limits, and answer keys.

```javascript
{
  _id: ObjectId,
  courseId: { type: ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true },
  timeLimitMinutes: { type: Number, default: 30 },
  passPercentage: { type: Number, default: 70 },
  antiCheatConfig: {
    maxTabSwitchesAllowed: { type: Number, default: 3 },
    lockdownMode: { type: Boolean, default: true }
  },
  questions: [{
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true, select: false }, // Stripped when sent to trainees
    points: { type: Number, default: 10 }
  }],
  createdAt: { type: Date, default: Date.now }
}
```

---

### 2.5 Enrollment & Progress History Schema (`models/Enrollment.js`)
Tracks trainee progress, module completions, assessment attempts, and competency outputs.

```javascript
{
  _id: ObjectId,
  traineeId: { type: ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: ObjectId, ref: 'Course', required: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedModules: [Number],
  assessmentAttempt: {
    score: { type: Number, default: null },
    totalQuestions: Number,
    tabSwitchCount: { type: Number, default: 0 },
    submittedAt: Date,
    status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' }
  },
  certificateIssued: { type: Boolean, default: false },
  enrolledAt: { type: Date, default: Date.now }
}
```

---

### 2.6 Certificate & Cryptographic QR Schema (`models/Certificate.js`)
Stores immutable credentials with cryptographic validation hashes.

```javascript
{
  _id: ObjectId,
  certificateNumber: { type: String, required: true, unique: true, index: true }, // e.g. "CERT-2026-88319"
  traineeId: { type: ObjectId, ref: 'User', required: true },
  traineeName: { type: String, required: true },
  courseId: { type: ObjectId, ref: 'Course', required: true },
  courseTitle: { type: String, required: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  organizationName: { type: String, required: true },
  finalScore: { type: Number, required: true },
  issueDate: { type: Date, default: Date.now },
  verificationHash: { type: String, required: true, unique: true }, // SHA-256
  qrCodeUrl: { type: String, required: true },
  isRevoked: { type: Boolean, default: false }
}
```

---

### 2.7 System Audit Log Schema (`models/AuditLog.js`)
Maintains non-repudiation security records for governance and compliance.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  userRole: String,
  organizationId: { type: ObjectId, ref: 'Organization' },
  action: { type: String, required: true }, // e.g., 'BATCH_STUDENT_INGESTION', 'EXAM_SUBMISSION'
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true }
}
```

---

## 3. RESTful API Endpoints & JSON Contracts

All protected API endpoints require the standard HTTP Authorization header:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

### 3.1 Authentication Endpoints

#### Endpoint: `POST /api/auth/login`
- **Description:** Authenticates user credentials and issues signed stateless JWT token.
- **Access Level:** Public

**Request Body:**
```json
{
  "email": "trainer.sharma@iitm.ac.in",
  "password": "Password@123"
}
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWIxMGFjZDEyYTM0...",
  "user": {
    "id": "65b10acd12a34f001b987a01",
    "fullName": "Dr. Rajesh Sharma",
    "email": "trainer.sharma@iitm.ac.in",
    "role": "trainer",
    "organizationId": "65b10a2212a34f001b987999",
    "organizationName": "IITM Pune",
    "department": "Meteorology"
  }
}
```

**Error Response (`401 Unauthorized`):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### 3.2 Batch Trainee Ingestion

#### Endpoint: `POST /api/students/bulk-import`
- **Description:** Parses an Excel/CSV roster and creates bulk student accounts.
- **Access Level:** Protected (`institute_admin`)
- **Content-Type:** `multipart/form-data` (form field: `file`)

**Response Body (`201 Created`):**
```json
{
  "success": true,
  "message": "Bulk ingestion completed successfully",
  "summary": {
    "totalRowsProcessed": 120,
    "successfulRegistrations": 118,
    "skippedDuplicates": 2
  },
  "createdStudents": [
    {
      "fullName": "Aarav Patel",
      "email": "aarav.p@students.iitm.ac.in",
      "enrollmentId": "ENR-2026-001",
      "temporaryPin": "849201"
    }
  ]
}
```

---

### 3.3 AI-Powered Trainer Recommendation

#### Endpoint: `POST /api/trainer-matching/recommend`
- **Description:** Evaluates available faculty using the 4-factor scoring heuristic.
- **Access Level:** Protected (`platform_super_admin`, `institute_admin`)

**Request Body:**
```json
{
  "courseTitle": "Advanced Atmospheric Radar Systems",
  "requiredCompetencies": ["Radar Meteorology", "Signal Processing", "Data Ingestion"],
  "targetOrganizationId": "65b10a2212a34f001b987999"
}
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "recommendations": [
    {
      "trainerId": "65b10acd12a34f001b987a01",
      "fullName": "Dr. Rajesh Sharma",
      "matchScore": 94.5,
      "breakdown": {
        "skillOverlapScore": 40.0,
        "experienceScore": 23.5,
        "feedbackScore": 18.0,
        "availabilityScore": 13.0
      },
      "status": "Recommended"
    }
  ]
}
```

---

### 3.4 Anti-Cheat Exam Arena Endpoints

#### Endpoint 1: `GET /api/assessments/:assessmentId/start`
- **Description:** Initiates exam; returns questions with answer keys safely omitted.
- **Access Level:** Protected (`trainee`)

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "assessment": {
    "id": "65b21ef012a34f001c456b10",
    "title": "Atmospheric Dynamics Mid-Term Exam",
    "timeLimitMinutes": 30,
    "totalQuestions": 2,
    "questions": [
      {
        "questionId": "Q-101",
        "questionText": "What causes the Coriolis effect on atmospheric winds?",
        "options": [
          "Earth's revolution around the Sun",
          "Earth's rotation on its axis",
          "Gravitational pull of the Moon",
          "Solar flare activity"
        ],
        "points": 10
      }
    ]
  }
}
```

#### Endpoint 2: `POST /api/assessments/:assessmentId/submit`
- **Description:** Evaluates trainee answers server-side, logs proctoring metrics, and updates competency passport.
- **Access Level:** Protected (`trainee`)

**Request Body:**
```json
{
  "answers": [
    { "questionId": "Q-101", "selectedOptionIndex": 1 }
  ],
  "tabSwitchCount": 1,
  "timeSpentSeconds": 1140
}
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "result": {
    "scorePercentage": 85.0,
    "status": "passed",
    "correctCount": 1,
    "totalQuestions": 1,
    "tabSwitchWarningFlag": false,
    "certificateEligible": true,
    "certificateId": "CERT-2026-88319"
  }
}
```

---

### 3.5 Cryptographic Certificate Verification

#### Endpoint: `GET /api/certificates/verify/:certificateNumber`
- **Description:** Zero-login public verification endpoint for scanned QR codes.
- **Access Level:** Public

**Response Body (`200 OK` - Valid Credential):**
```json
{
  "status": "AUTHENTIC",
  "verified": true,
  "certificate": {
    "certificateNumber": "CERT-2026-88319",
    "traineeName": "Priya V. Nair",
    "courseTitle": "Doppler Weather Radar Interpretation",
    "issuingInstitute": "IITM Pune",
    "finalScore": "92%",
    "issueDate": "2026-09-18T10:30:00Z",
    "verificationHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

**Response Body (`404 Not Found` - Altered / Invalid):**
```json
{
  "status": "INVALID_OR_REVOKED",
  "verified": false,
  "error": "No matching official credential found. This certificate may be counterfeit or tampered."
}
```

---

## 4. Summary of Solution 2 (TDD)

This **Technical Design Document (TDD)** satisfies all Solution Architect standards:
1. **Tech Stack Justification:** High-throughput, stateless MERN architecture.
2. **Normalized Multi-Tenant Data Models:** Comprehensive MongoDB schemas with field definitions, indices, and audit logging.
3. **Rigorous JSON API Contracts:** Complete payload specifications for authentication, batch ingestion, AI scoring, exam proctoring, and QR verification.
