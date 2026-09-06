# Role-Based Access Control (RBAC) & Multi-Tenant Architecture

> **CapacityConnect (MoES / IMD Capacity Building Platform)**  
> Comprehensive Technical Architecture, Tenant Isolation Protocols, and Security Governance

<p align="center">
  <img src="./system_architecture_diagram.jpg" alt="CapacityConnect Enterprise System Architecture Diagram" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

---

## 1. High-Level Role Hierarchy & Architecture

The platform enforces a **Hybrid Multi-Tenant & Hierarchical RBAC System**. The Central Government platform admins govern the nationwide taxonomy and policies, while affiliated Universities and Autonomous Institutes enjoy isolated workspaces for their faculty and student cohorts.

```mermaid
graph TD
    classDef central fill:#0B2545,stroke:#134074,stroke-width:2px,color:#FFFFFF;
    classDef institute fill:#0F766E,stroke:#115E59,stroke-width:2px,color:#FFFFFF;
    classDef trainer fill:#4338CA,stroke:#3730A3,stroke-width:2px,color:#FFFFFF;
    classDef trainee fill:#2563EB,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF;
    classDef public fill:#475569,stroke:#334155,stroke-width:2px,color:#FFFFFF;

    subgraph CentralAuthority["Central Platform Governance (MoES / IMD Central Cell)"]
        SA["Platform Super Admin / Admin<br/>Role: platform_super_admin / platform_admin / admin"]:::central
    end

    subgraph TenantBoundary1["Institute Tenant A (e.g. Lok Jagruti Kendra University)"]
        IA1["Institute Admin / Org Admin<br/>Role: institute_admin / org_admin"]:::institute
        TR1["Faculty Trainer<br/>Role: trainer"]:::trainer
        ST1["Enrolled Trainees / Students<br/>Role: trainee / student"]:::trainee
    end

    subgraph TenantBoundary2["Institute Tenant B (e.g. IIT Bombay / NWI Pune)"]
        IA2["Institute Admin / Org Admin<br/>Role: institute_admin / org_admin"]:::institute
        TR2["Faculty Trainer<br/>Role: trainer"]:::trainer
        ST2["Enrolled Trainees / Students<br/>Role: trainee / student"]:::trainee
    end

    subgraph PublicBoundary["Public & External Ecosystem"]
        CV["Public / Third-Party Verifiers<br/>Role: certificate_verifier / Guest"]:::public
    end

    SA -->|"Approves, Audits & Oversees All Institutes"| IA1
    SA -->|"Approves, Audits & Oversees All Institutes"| IA2
    
    IA1 -->|"Manages Faculty & Depts"| TR1
    IA1 -->|"Bulk Imports & Manages Cohort"| ST1
    TR1 -->|"Authors Courses, Exams & Evaluates"| ST1

    IA2 -->|"Manages Faculty & Depts"| TR2
    IA2 -->|"Bulk Imports & Manages Cohort"| ST2
    TR2 -->|"Authors Courses, Exams & Evaluates"| ST2

    ST1 -->|"Earns Verifiable Certificates"| CV
    ST2 -->|"Earns Verifiable Certificates"| CV
```

---

## 2. Multi-Tenant Data Isolation Protocol

The platform implements strict tenant isolation:
- **Institute Admins & Trainers** can **NEVER** view, modify, or leak records from other institutions.
- **Central Platform Admins** possess comprehensive oversight across all institutes with dynamic filtering.

```mermaid
flowchart LR
    classDef auth fill:#1E293B,stroke:#0F172A,color:#FFF;
    classDef check fill:#F59E0B,stroke:#D97706,color:#000,font-weight:bold;
    classDef adminBranch fill:#0B2545,stroke:#134074,color:#FFF;
    classDef tenantBranch fill:#0F766E,stroke:#115E59,color:#FFF;

    Req["Client Request<br/>(GET /api/v1/users/students)"]:::auth --> JWT["authMiddleware<br/>Verify Bearer Token & User Record"]:::auth
    JWT --> CheckRole{"Role Check<br/>isPlatformAdmin?"}:::check

    CheckRole -- "YES (platform_admin / admin)" --> AdminFlow["Central Admin Scope<br/>Query: { role: trainee }<br/>Optional ?organizationId filter"]:::adminBranch
    CheckRole -- "NO (institute_admin / trainer)" --> TenantFlow["Tenant-Locked Scope<br/>Query restricted to:<br/>1. organizationId == req.user.organizationId<br/>2. organizationName == regex(user.orgName)<br/>3. createdBy == req.user._id / facultyIds<br/>4. enrolled in institute courses"]:::tenantBranch

    AdminFlow --> AllData[("All-India Records Database<br/>Every Institute & Student")]
    TenantFlow --> IsolatedData[("Tenant-Restricted Records<br/>Only Own Institute Students")]
```

---

## 3. Role Responsibilities & Capabilities Matrix

| Feature / Module | Platform Super Admin | Institute Admin | Faculty Trainer | Trainee / Student | Certificate Verifier |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **System Roles** | `platform_super_admin`, `platform_admin`, `admin` | `institute_admin`, `org_admin` | `trainer` | `trainee`, `student` | `certificate_verifier`, `guest` |
| **Institutional Scope** | **All Institutes (National)** | **Own Institute Only** | **Own Institute / Assigned Courses** | **Own Student Profile** | **Public Verification Only** |
| **Executive Dashboard** |  Full Nationwide KPIs |  Institute Specific |  Trainer Studio |  Personal Learner Hub | ❌ |
| **Excel Student Onboarding** |  Any / All Institutes |  Locked to Own Institute |  Locked to Own Institute | ❌ | ❌ |
| **Generate 6-Digit Password ID Cards** |  All Institutions |  Own Students |  Own Students | ❌ (View Own ID) | ❌ |
| **Print Admit / Credential Slips** |  Multi-Institute Select |  Own Institute Only |  Own Institute Only | ❌ | ❌ |
| **Course Authoring Wizard** |  Govt Course Builder |  Curriculum & Allocations |  Course Studio & Modules | ❌ | ❌ |
| **Question Bank & MCQ Studio** |  National Bank |  Dept Banks |  Personal & Course MCQs | ❌ | ❌ |
| **Attempt Exams & Quizzes** | ❌ (Review Only) | ❌ (Review Only) | ❌ (Review Only) |  Real-Time Exams | ❌ |
| **Attendance Tracking** |  Global Log |  Institute Sessions |  Classroom Attendance |  View Own Attendance | ❌ |
| **Competency Framework** |  Full Taxonomy Control |  Mapping & Alignment |  Rubric Mapping |  View Passport | ❌ |
| **Certificate Designer** |  National Seal & Master |  Institute Seal / Signature | ❌ | ❌ | ❌ |
| **QR Code Certificate Verification** |  Verify & Audit |  Verify Own Graduates |  Verify Own Graduates |  Share Verification Link |  Public QR Scan & Verify |
| **User Approvals / Verification** |  Full Authority |  Approve Dept Faculty | ❌ | ❌ | ❌ |
| **Security Audit Logs** |  System-Wide Trail |  Institute-Wide Trail | ❌ | ❌ | ❌ |

---

## 4. End-to-End Operational Lifecycle

The lifecycle demonstrates how roles interact across student onboarding, exam attempts, grading, and instant credential verification.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Central Admin / Institute Admin
    actor Trainer as Faculty Trainer
    actor Trainee as Trainee / Student
    actor Public as Verifier / Employer
    participant Server as Backend API & Security Layer
    participant DB as MongoDB Atlas Database

    Note over Admin,Server: 1. Cohort Onboarding & Credential Generation
    Admin->>Server: Upload Student Roster (Excel / CSV)
    Server->>Server: Lock organizationId & generate 6-digit PIN password
    Server->>DB: Store Users (role: trainee, status: approved)
    Admin->>Trainee: Issue Official Admit Slip with QR Code & Login ID

    Note over Trainer,Server: 2. Course Creation & Assessment Authoring
    Trainer->>Server: Create Course + Add Modules + Publish Exam MCQs
    Server->>DB: Save Course & Assessment (Linked to Institute)

    Note over Trainee,Server: 3. Learning, Exam Submission & Grading
    Trainee->>Server: Login with Enrollment ID & Last 6 Digits
    Trainee->>Server: Complete Modules & Submit Final Examination
    Server->>Server: Auto-evaluate answers against Answer Keys
    Server->>DB: Save Attempt Record (Score, Percentage, Passed Status)

    Note over Trainer,Server: 4. Analytics & Certificate Issuance
    Trainer->>Server: Review Exam Submissions Gradebook
    Server->>DB: Generate Certificate with Hash, QR Code & Institute Template

    Note over Trainee,Public: 5. Cryptographic Verification
    Trainee->>Public: Share Certificate / QR Code
    Public->>Server: GET /api/v1/certificates/verify/:certNumber
    Server-->>Public: 200 OK (Authentic, Tamper-Proof, Verified Credentials)
```

---

## 5. Database Schema & Relational Integrity

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : "employs / registers"
    ORGANIZATION ||--o{ COURSE : "sponsors / conducts"
    ORGANIZATION ||--o{ CERTIFICATE_TEMPLATE : "configures"
    
    USER ||--o{ COURSE : "authors (trainerId)"
    USER ||--o{ ENROLLMENT : "participates as student"
    USER ||--o{ ATTEMPT : "submits exam (traineeId)"
    USER ||--o{ CERTIFICATE : "awarded to"
    USER ||--o{ AUDIT_LOG : "triggers actor actions"

    COURSE ||--o{ ENROLLMENT : "contains student entries"
    COURSE ||--o{ ATTEMPT : "tested under"
    COURSE ||--o| ASSESSMENT : "evaluates with"
    COURSE ||--o{ CERTIFICATE : "graduates from"

    ORGANIZATION {
        ObjectId _id PK
        string code "e.g. LJKU-001"
        string legalName
        string displayName
        string type
        string status
    }

    USER {
        ObjectId _id PK
        string enrollmentNumber "Login ID (Unique)"
        string email "Unique"
        string password "Hashed bcrypt"
        string role "platform_admin | institute_admin | trainer | trainee"
        ObjectId organizationId FK
        string organizationName "Tenant Key"
        ObjectId createdBy FK "User reference"
        string department
        string designation
        string status "active | inactive"
        string approvalStatus "approved | pending"
    }

    COURSE {
        ObjectId _id PK
        string code "Unique Code"
        string title
        ObjectId trainerId FK
        string organizationName "Tenant Scope"
        ObjectId assessmentId FK
        string status "published | draft"
    }

    ATTEMPT {
        ObjectId _id PK
        ObjectId traineeId FK
        ObjectId courseId FK
        ObjectId assessmentId FK
        number scoreObtained
        number totalPossibleMarks
        number percentage
        boolean passed
        date submittedAt
    }

    CERTIFICATE {
        ObjectId _id PK
        string certificateNumber "Unique Serial"
        ObjectId traineeId FK
        ObjectId courseId FK
        ObjectId organizationId FK
        string cryptographicHash
        string qrCodeUrl
        date issuedAt
    }
```

---

## 6. Security Enforcement & Defense-in-Depth

1. **Authentication Token Inspection**:
   - Every request is validated by `authMiddleware` via JWT signed by cryptographic server secrets.
   - User identity, role, and organization association are injected into `req.user`.

2. **Query Scoping (Row-Level Security)**:
   - In `studentOnboardingController.js` and `courseController.js`, queries automatically append isolation clauses whenever `req.user.role !== 'platform_admin'`.
   - Trainee queries are scoped to:
     - `organizationId == req.user.organizationId`
     - `organizationName == regex(req.user.organizationName)`
     - `createdBy == req.user._id` or created by faculty trainers in that institute.

3. **Creator Protection**:
   - When bulk importing or creating single students, the server overwrites any client-supplied institute with `req.user.organizationName` and stamps `createdBy: req.user._id`.

4. **Destructive Action Lockdown**:
   - `DELETE /api/v1/users/students/:id` checks whether the target student belongs to the requester's organization. Cross-tenant deletion attempts return `403 Forbidden`.

5. **Tamper-Proof Audit Logging**:
   - Key lifecycle actions (`COURSE_CREATED`, `STUDENT_IMPORTED`, `EXAM_SUBMITTED`, `CERTIFICATE_GENERATED`) are logged to immutable `AuditLogs` preserving timestamp, IP, actor ID, and metadata.
