# CapacityConnect — Complete Role-Based Access Control (RBAC) & Multi-Tenant Architecture

Please refer to the complete, detailed architecture and diagrams document located at:
**[docs/ROLE_BASED_ARCHITECTURE.md](file:///d:/SIH/docs/ROLE_BASED_ARCHITECTURE.md)**

---

### Quick Summary of Roles:

1. **Central Platform Super Admin / Admin (`platform_super_admin`, `platform_admin`, `admin`)**:
   - Central Ministry (MoES) / IMD headquarters governance.
   - Comprehensive nationwide access across all universities, institutes, courses, and trainees.
   - User approval queue, competency taxonomy, national certificate studio, and system-wide audit logs.

2. **Institute / Organization Admin (`institute_admin`, `org_admin`)**:
   - Dedicated University / College / Institute administration.
   - Full control over own faculty trainers, student cohorts, and academic structure.
   - Strictly isolated from other institutions; cannot access or leak other colleges' records.

3. **Faculty Trainer (`trainer`)**:
   - Curriculum designer and instructor.
   - Authors interactive courses, modules, question banks, and exams.
   - Manages enrolled student cohorts, reviews exam submissions, and tracks grades.
   - Isolated to own courses and own institute learners.

4. **Trainee / Student (`trainee`, `student`)**:
   - Enrolls in authorized courses, studies modules, and takes real-time exams.
   - Earns tamper-proof digital certificates with live QR codes and cryptographic hashes.
   - Builds personal Competency Passport and tracks learning progress.

5. **Certificate Verifier / Public (`certificate_verifier`, `guest`)**:
   - External employers, academic institutions, and government bodies.
   - Instant cryptographic verification of certificates via QR code or serial number.

---

*For full Mermaid architectural flowcharts, database ER diagrams, and security protocols, open [docs/ROLE_BASED_ARCHITECTURE.md](file:///d:/SIH/docs/ROLE_BASED_ARCHITECTURE.md).*
