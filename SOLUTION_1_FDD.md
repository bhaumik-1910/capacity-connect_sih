# 📋 Functional Design Document (FDD)
## Project: CapacityConnect — Digital Capacity Building & Competency Governance Portal

---

## 1. Document Overview & Executive Summary

### 1.1 Purpose
The purpose of this Functional Design Document (FDD) is to define the functional requirements, user journeys, acceptance criteria, and system boundaries for **CapacityConnect**. This platform serves as a centralized, multi-tenant digital capacity building and learning management ecosystem for organizational training, competency development, and knowledge sharing.

### 1.2 System Scope
CapacityConnect enables:
- Seamless training administration across decentralized campuses and institutes.
- Automated AI-assisted trainer allocation based on skill competence.
- Timed, anti-cheat assessments with instant scoring.
- Longitudinal competency progression tracking ("Competency Passport").
- Fraud-resistant digital certificate issuance with live cryptographic QR verification.

---

## 2. Core User Personas & User Stories

### Persona 1: Platform Super Admin (Central Headquarters / Ministry Level)
> **User Story 1.1: Multi-Tenant Governance**  
> *As a* Central Platform Super Admin,  
> *I want to* view national training metrics, approve newly registered training institutes, and monitor system-wide audit logs,  
> *So that* I can maintain complete operational governance and quality control across all participating organizations.

> **User Story 1.2: Global Competency & Certificate Standardization**  
> *As a* Central Platform Super Admin,  
> *I want to* configure standardized national certificate templates and master competency taxonomies (e.g., NDEAR, WMO-258),  
> *So that* all regional institutes adhere to uniform national training standards.

---

### Persona 2: Institute / Organization Admin (University or Regional Center Level)
> **User Story 2.1: Bulk Trainee Ingestion**  
> *As an* Institute Admin,  
> *I want to* upload a single Excel or CSV file containing hundreds of student/trainee records,  
> *So that* I can register and issue login credentials to entire batches in seconds without manual data entry.

> **User Story 2.2: Campus Faculty & Department Management**  
> *As an* Institute Admin,  
> *I want to* organize departmental cohorts, assign faculty trainers, and track local student completion rates,  
> *So that* our institute operates independently without viewing or interfering with other institutes' private data.

---

### Persona 3: Faculty Trainer (Instructor / Subject Matter Expert)
> **User Story 3.1: Course Curriculum & Assessment Authoring**  
> *As a* Faculty Trainer,  
> *I want to* create modular courses with multimedia lessons and build timed question banks,  
> *So that* learners have structured learning pathways with clear evaluation benchmarks.

> **User Story 3.2: AI-Powered Trainer Recommendation**  
> *As a* Faculty Trainer / Course Coordinator,  
> *I want to* receive AI-generated recommendations for suitable trainers based on domain expertise and past ratings,  
> *So that* training modules are led by the most qualified instructors.

---

### Persona 4: Trainee / Student (Learner / Operational Officer)
> **User Story 4.1: Interactive Learning & Anti-Cheat Examination**  
> *As a* Trainee,  
> *I want to* access my enrolled modules and take timed online assessments in a fair, secure arena,  
> *So that* I can validate my knowledge and qualify for course completion.

> **User Story 4.2: Competency Passport & Digital Credentials**  
> *As a* Trainee,  
> *I want to* track my personal skill growth via a visual radar chart and download verified PDF certificates,  
> *So that* I have verifiable proof of my competencies for career progression.

---

### Persona 5: Public Verifier / External Employer
> **User Story 5.1: Instant QR Credential Verification**  
> *As an* External Employer or Auditor,  
> *I want to* scan the QR code on any printed or digital certificate without logging in,  
> *So that* I can immediately verify whether the credential is authentic, tampered with, or expired.

---

## 3. Detailed Acceptance Criteria

### Feature 1: Multi-Tenant Role-Based Access Control (RBAC)
- **AC 1.1:** The system must restrict users strictly to their designated portal routes based on their role (`platform_admin`, `institute_admin`, `trainer`, `trainee`).
- **AC 1.2:** Database queries must automatically scope data by `organizationId` so that Institute Admins and Trainers can never see or modify records from another institute.
- **AC 1.3:** Unauthenticated requests to protected endpoints must be rejected with an `HTTP 401 Unauthorized` status.

---

### Feature 2: High-Speed Batch Trainee Ingestion
- **AC 2.1:** The system must accept `.xlsx` and `.csv` files up to 10 MB containing columns: `Full Name`, `Email`, `Department`, and `Enrollment ID`.
- **AC 2.2:** Duplicate emails within the same organization must be flagged with clear error notices before database insertion.
- **AC 2.3:** Successfully parsed trainees must receive automatically generated, randomized 6-digit access PINs and active enrollment status within 5 seconds for a batch of 500 records.

---

### Feature 3: Anti-Cheat Assessment Arena
- **AC 3.1:** When an assessment is loaded, the backend API must strip out all correct answer indices (`correctOptionIndex`) so answers cannot be discovered using browser inspect tools.
- **AC 3.2:** If a trainee switches browser tabs or minimizes the exam window, the interface must increment a warning counter and display a prominent warning banner.
- **AC 3.3:** When the exam countdown timer reaches `00:00`, the system must automatically lock the input fields and submit all currently selected answers.

---

### Feature 4: Competency Vector Progression & Radar Chart
- **AC 4.1:** Each completed assessment must dynamically recalculate the learner's skill score across predefined competency tags (e.g., *Data Analysis*, *Forecasting*, *Equipment Handling*).
- **AC 4.2:** The Trainee Dashboard must render an interactive Radar Chart showing current proficiency levels versus target proficiency levels.
- **AC 4.3:** If a competency score is below 60%, the system must highlight recommended remedial modules.

---

### Feature 5: Cryptographic QR Certificate Verification
- **AC 5.1:** Upon achieving passing criteria, the system must generate a digital certificate containing a unique SHA-256 hash calculated from `(traineeId + courseId + issueDate + secretSalt)`.
- **AC 5.2:** A scannable QR code must be embedded into the certificate pointing to `/verify/:certificateNumber`.
- **AC 5.3:** When scanned by any public device, the verification page must display: Graduate Name, Course Name, Issuing Institute, Issue Date, Final Grade, and a green "VERIFIED AUTHENTIC" badge.
- **AC 5.4:** Any alteration to the certificate URL or hash parameters must immediately trigger a red "INVALID OR TAMPERED CREDENTIAL" warning.

---

## 4. Out-of-Scope Boundaries (What is NOT in Scope for v1.0)

To ensure high quality and timely delivery, the following features are intentionally classified as **Out of Scope** for the initial release:

1. **Native Mobile App (iOS / Android):**  
   *In Scope:* Fully responsive Progressive Web App (PWA) accessible via mobile browser.  
   *Out of Scope:* Native app store distribution (Google Play / Apple App Store).

2. **Full Video Conferencing Server:**  
   *In Scope:* Integration with external meeting links (Zoom, Google Meet, Microsoft Teams) for live training sessions.  
   *Out of Scope:* Self-hosted WebRTC multi-party video conferencing infrastructure.

3. **Complex Payment Gateway Integration:**  
   *In Scope:* Organizational grant and voucher tracking for sponsored courses.  
   *Out of Scope:* Commercial B2C credit card / international payment gateway checkout.

4. **Biometric Eye-Tracking Proctoring:**  
   *In Scope:* Tab-switch heuristics, full-screen lockdown, window blur tracking, and timed exam limits.  
   *Out of Scope:* Continuous webcam video AI gaze/eye-tracking algorithms.

5. **Legacy LMS Migration Tools:**  
   *In Scope:* Standard Excel/CSV roster and curriculum file ingestion.  
   *Out of Scope:* Automated SCORM 1.2 or Moodle database backup import wizards.

---

## 5. Basic User Journey Flows

### 5.1 End-to-End Operational Lifecycle Flow

```
[ Central Admin ]
  └── Configures National Competency Standards & Approves Institutes
            │
            ▼
[ Institute Admin ]
  └── Uploads Trainee Batch (Excel) ➔ System Generates Logins & Enrolls Batch
            │
            ▼
[ Faculty Trainer ]
  └── Creates Modules & Tests ➔ AI Recommends Best Matching Trainer
            │
            ▼
[ Trainee / Officer ]
  └── Studies Content ➔ Takes Anti-Cheat Timed Exam ➔ Updates Competency Passport
            │
            ▼
[ Automated Certificate Engine ]
  └── Computes SHA-256 Cryptographic Hash ➔ Issues PDF Certificate with QR Code
            │
            ▼
[ Public Verifier / Employer ]
  └── Scans QR Code ➔ Live Database Check ➔ Displays Instant "VERIFIED" Screen
```

---

### 5.2 Detailed Journey: Trainee Course & Certification Flow

```
Step 1: Sign In
Trainee logs in with Email & 6-digit PIN ──▶ Redirected to Trainee Dashboard

Step 2: Course Engagement
Trainee selects enrolled course ──▶ Completes multimedia modules & reads syllabus

Step 3: Assessment Entry
Trainee clicks "Take Assessment" ──▶ Anti-cheat arena activates (timer starts)

Step 4: Proctoring & Submission
Tab switch detected? ──▶ Warning displayed
Timer expires / User submits ──▶ Server evaluates answers & records score

Step 5: Competency & Certification
Passed? (Score >= 70%)
  ├── YES: Competency Passport radar chart updates + QR Certificate issued
  └── NO: Remedial study modules recommended for re-attempt
```

---

### 5.3 Detailed Journey: Public Verification Flow

```
[ Physical Certificate / PDF Screen ]
                 │
                 │ (User scans QR Code with Smartphone Camera)
                 ▼
[ Browser Opens: https://portal.domain/verify/CERT-2026-XXXX ]
                 │
                 │ (Public GET request sent without authentication)
                 ▼
[ Server Backend ]
  Checks Certificate Number & Validates SHA-256 Cryptographic Signature
                 │
      ┌──────────┴──────────┐
      │                     │
[ Match Found ]       [ Altered / Not Found ]
      ▼                     ▼
Displays Verified Metadata:   Displays Red Error:
• Trainee Name                • "Certificate Not Found or Tampered"
• Course & Grade              • "Please contact the issuing authority"
• Issuing Institute
• Timestamp & Seal
```

---

## 6. Summary of Deliverable 1

This **Functional Design Document (FDD)** establishes a crystal-clear, unambiguous blueprint for the **CapacityConnect** platform. By detailing role-specific user stories, verifiable acceptance criteria, strict project boundaries, and sequential user journeys, it guarantees that subsequent technical architecture (Solution 2), software coding (Solution 3), and testing/deployment (Solution 4) proceed with 100% precision.
