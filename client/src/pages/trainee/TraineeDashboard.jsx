import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Award,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import {
  Button,
  Card,
  StatCard,
  PageHeader,
  Badge,
} from '../../components/design-system';

/**
 * Government Minimalism Student Dashboard (Section 31)
 * Welcome back header, Continue Learning cards, Upcoming Sessions/Assessments, Skill Progress, Certificates
 */
const TraineeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrRes, certRes, sessRes] = await Promise.allSettled([
          api.getMyEnrollments(),
          api.getMyCertificates(),
          api.getSessions('upcoming=true&limit=4'),
        ]);

        if (enrRes.status === 'fulfilled' && enrRes.value?.success) {
          setEnrollments(enrRes.value.enrollments || []);
        } else {
          setEnrollments([]);
        }

        if (certRes.status === 'fulfilled' && certRes.value?.certificates) {
          setCertificates(certRes.value.certificates || []);
        } else {
          setCertificates([]);
        }

        if (sessRes.status === 'fulfilled' && sessRes.value?.sessions) {
          setSessions(sessRes.value.sessions || []);
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
        setEnrollments([]);
        setCertificates([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeEnrollments = enrollments.filter((e) => e.status !== 'completed');

  return (
    <div className="space-y-6">
      
      {/* Page Header (Section 31) */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'Student'}.`}
        description="Continue where you left off, review upcoming sessions, and monitor your meteorological skill passport."
        badge={<Badge variant="primary" size="sm">Enrolled Trainee</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/trainee/certificates')}
              icon={Award}
            >
              My Certificates
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/trainee/catalogue')}
              icon={BookOpen}
            >
              Browse Courses
            </Button>
          </div>
        }
      />

      {/* Continue Learning Section (Section 31) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-[#17202A] tracking-tight">
            Continue Learning
          </h2>
          <Link
            to="/trainee/my-courses"
            className="text-xs font-semibold text-[#1F4E79] hover:underline flex items-center gap-1"
          >
            <span>All Enrolled Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeEnrollments.map((enr) => {
            const course = enr.courseId || {};
            const progress = enr.progressPercent || 0;
            const nextMod = enr.nextModule || 'Next: Practical Diagnostic Exercise';

            return (
              <Card key={enr._id} padding="default" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#87919B] mb-2 font-mono">
                    <span>{course.courseCode || 'CC-MET'}</span>
                    <span className="font-semibold text-[#1F4E79]">{progress}% Complete</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#17202A] mb-2 line-clamp-1">
                    {course.title || 'Meteorological Course'}
                  </h3>

                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-[#1F4E79] h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB] text-xs text-[#5F6B76]">
                    <span className="font-semibold text-[#17202A] block text-[11px] uppercase tracking-wider mb-0.5">
                      Up Next:
                    </span>
                    <span className="line-clamp-1">{nextMod}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#E5E7EB]">
                  <span className="text-xs text-[#87919B]">80% Exam Required</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/trainee/course/${course._id || enr.courseId}`)}
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming Sessions & Assessments (Section 31) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Upcoming Sessions */}
        <Card padding="default">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#17202A]">
              Upcoming Sessions
            </h3>
            <Link to="/trainee/sessions" className="text-xs text-[#1F4E79] hover:underline font-medium">
              View Calendar
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5F6B76]">
              <Calendar className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
              <p className="font-semibold text-[#17202A]">No Live Sessions Scheduled</p>
              <p className="text-[11px] text-[#87919B] mt-1">
                Upcoming virtual lab demonstrations, Doppler radar simulations, and synoptic briefings will be announced here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {sessions.map((sess) => (
                <div key={sess._id} className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#17202A]">{sess.title}</div>
                    <div className="text-[#5F6B76] text-[11px] mt-0.5">
                      Instructor: {sess.trainerName || sess.trainerId?.name || 'Faculty Officer'} · {sess.courseTitle || sess.courseId?.title || 'Lecture'}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[#87919B] flex-shrink-0">
                    <div>{sess.scheduledDate ? new Date(sess.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Upcoming'}</div>
                    <div>{sess.scheduledDate ? new Date(sess.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Assessments */}
        <Card padding="default">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#17202A]">
              Upcoming Assessments
            </h3>
            <span className="text-xs text-[#87919B]">80% Minimum Standard</span>
          </div>

          {activeEnrollments.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5F6B76]">
              <CheckSquare className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
              <p className="font-semibold text-[#17202A]">No Pending Assessments</p>
              <p className="text-[11px] text-[#87919B] mt-1">
                Assessments unlock as you complete syllabus units in your enrolled courses.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {activeEnrollments.slice(0, 3).map((enr) => {
                const c = enr.courseId || {};
                const prog = enr.progressPercentage ?? enr.progressPercent ?? 0;
                const isReady = prog >= 80;
                return (
                  <div key={enr._id} className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#17202A]">{c.title || 'Course Examination'}</div>
                      <div className="text-[#5F6B76] text-[11px] mt-0.5 font-mono">
                        {c.code || c.courseCode || 'CC-EXAM'} · Current Progress: {prog}%
                      </div>
                    </div>
                    {isReady ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/trainee/assessment/${c._id || enr.courseId}`)}
                      >
                        Take Exam
                      </Button>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Locked ({prog}% / 80%)
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

      </div>

      {/* Skill Progress & Certificates (Section 31) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Skill Progress */}
        <Card padding="default">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#17202A]">
              Skill Progress (WMO-1083)
            </h3>
            <Link to="/trainee/competency-passport" className="text-xs text-[#1F4E79] hover:underline font-medium">
              Passport
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { skill: 'Radar Reflectivity & Echo Classification', level: '85%', status: 'Competent' },
              { skill: 'Numerical Weather Prediction Assimilation', level: '62%', status: 'In Progress' },
              { skill: 'Severe Weather Warning Dissemination', level: '90%', status: 'Mastered' },
            ].map((sk, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#17202A]">{sk.skill}</span>
                  <span className="font-mono text-[#5F6B76]">{sk.level}</span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1F4E79] h-full rounded-full" style={{ width: sk.level }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Certificates */}
        <Card padding="default">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#17202A]">
              Issued Certificates
            </h3>
            <Link to="/trainee/certificates" className="text-xs text-[#1F4E79] hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {certificates.map((c) => (
              <div
                key={c._id}
                className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB] flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#17202A]">{c.courseTitle}</div>
                  <div className="font-mono text-[11px] text-[#87919B] mt-0.5">{c.certificateNumber}</div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/verify/${c.certificateNumber}`)}
                >
                  Verify
                </Button>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
};

export default TraineeDashboard;
