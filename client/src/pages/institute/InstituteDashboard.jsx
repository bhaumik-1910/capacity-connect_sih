import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  FileCheck,
  Plus,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  StatCard,
  Card,
  PageHeader,
  Badge,
  DataTable,
} from '../../components/design-system';

/**
 * Government Minimalism Institute Dashboard (Section 23)
 * Overview of institute's learning activities, 4 KPIs, structured logical sections
 */
const InstituteDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getInstituteMetrics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load institute metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const metrics = data?.metrics || {};
  const org = data?.organization || {};

  // 100% Dynamic values from live DB
  const totalStudents = metrics.totalStudents ?? 0;
  const totalTrainers = metrics.totalTrainers ?? 0;
  const totalCourses = metrics.totalCourses ?? 0;
  const certificatesIssued = metrics.certificatesIssued ?? 0;

  const totalEnrollments = metrics.totalEnrollments ?? 0;
  const avgCompletion = metrics.avgCompletion ?? 0;
  const avgAttendance = metrics.avgAttendance ?? 0;
  const avgAssessment = metrics.avgAssessment ?? 0;
  const cohortCapacityPercent = metrics.cohortCapacityPercent ?? 0;

  // 4 KPIs (Section 23)
  const kpis = [
    {
      title: 'Students',
      value: totalStudents,
      change: `+${metrics.activeStudents ?? totalStudents} Active`,
      changeType: 'positive',
      subtitle: 'Enrolled under institute',
      icon: GraduationCap,
    },
    {
      title: 'Trainers',
      value: totalTrainers,
      subtitle: `${metrics.activeTrainers ?? totalTrainers} active faculty`,
      icon: Users,
    },
    {
      title: 'Courses',
      value: totalCourses,
      subtitle: `${metrics.activeCourses ?? totalCourses} published syllabi`,
      icon: BookOpen,
    },
    {
      title: 'Certificates',
      value: certificatesIssued,
      subtitle: 'Issued to date',
      icon: Award,
    },
  ];

  // Dynamic Recent Students list strictly from database
  const displayStudents = Array.isArray(metrics.recentStudents) ? metrics.recentStudents : [];

  // Dynamic Upcoming Sessions strictly from database
  const displaySessions = Array.isArray(metrics.upcomingSessions) ? metrics.upcomingSessions : [];

  return (
    <div className="space-y-6">
      
      {/* Header (Section 23) */}
      <PageHeader
        title="Institute Dashboard"
        description="Overview of your institute's learning activities, faculty allocation, and credential issuance."
        badge={
          <Badge variant="primary" size="sm">
            {org.displayName || org.legalName || 'Accredited Center'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/institute/certificate-template')}
            >
              Certificate Designer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/institute/students')}
              icon={Plus}
            >
              Add Student
            </Button>
          </div>
        }
      />

      {/* 4 KPI Cards (Section 14 & 23) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Logical Section: Enrollment & Performance Analytics Overview (100% Dynamic from DB) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Dynamic Enrollment Overview */}
        <Card padding="default">
          <div className="text-xs font-semibold text-[#5F6B76] uppercase">Enrollment Overview</div>
          <div className="text-2xl font-bold text-[#17202A] mt-1">
            {totalEnrollments.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#5F6B76] mt-2">Active cohort capacity: {cohortCapacityPercent}%</div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#1F4E79] h-full rounded-full transition-all duration-300" style={{ width: `${cohortCapacityPercent}%` }} />
          </div>
        </Card>

        {/* Card 2: Dynamic Course Completion Rate */}
        <Card padding="default">
          <div className="text-xs font-semibold text-[#5F6B76] uppercase">Course Completion</div>
          <div className="text-2xl font-bold text-[#1F7A4D] mt-1">
            {avgCompletion}%
          </div>
          <div className="text-xs text-[#5F6B76] mt-2">Completed on-schedule</div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#1F7A4D] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, avgCompletion)}%` }} />
          </div>
        </Card>

        {/* Card 3: Dynamic Session Attendance Rate */}
        <Card padding="default">
          <div className="text-xs font-semibold text-[#5F6B76] uppercase">Session Attendance</div>
          <div className="text-2xl font-bold text-[#17202A] mt-1">
            {avgAttendance}%
          </div>
          <div className="text-xs text-[#5F6B76] mt-2">Minimum threshold: 80%</div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#1F4E79] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, avgAttendance)}%` }} />
          </div>
        </Card>

        {/* Card 4: Dynamic Assessment Average */}
        <Card padding="default">
          <div className="text-xs font-semibold text-[#5F6B76] uppercase">Assessment Average</div>
          <div className="text-2xl font-bold text-[#17202A] mt-1">
            {avgAssessment}%
          </div>
          <div className="text-xs text-[#1F7A4D] font-medium mt-2">
            {avgAssessment >= 80 ? 'Meets 80% passing rule' : 'Below 80% threshold'}
          </div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#1F7A4D] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, avgAssessment)}%` }} />
          </div>
        </Card>

      </div>

      {/* Logical Section: Recent Students & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Students Table (Section 23 & 27) */}
        <div className="lg:col-span-2 bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#17202A] uppercase tracking-wider">
              Recent Students
            </span>
            <Link
              to="/institute/students"
              className="text-xs font-semibold text-[#1F4E79] hover:underline flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {displayStudents.length === 0 ? (
            <div className="p-8 text-center text-xs">
              <GraduationCap className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="font-semibold text-[#17202A]">No Student Enrollments Found</p>
              <p className="text-[#5F6B76] mt-1 max-w-sm mx-auto">
                Student records and live syllabus progress will automatically appear here once students are enrolled in courses.
              </p>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/institute/students')}
                >
                  Go to Student Roster
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#5F6B76]">
                    <th className="px-4 py-2.5 font-semibold">Student ID</th>
                    <th className="px-4 py-2.5 font-semibold">Name</th>
                    <th className="px-4 py-2.5 font-semibold">Program</th>
                    <th className="px-4 py-2.5 font-semibold">Progress</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[#17202A]">
                  {displayStudents.map((st) => (
                    <tr key={st.id || st._id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-mono text-[#5F6B76]">{st.id}</td>
                      <td className="px-4 py-3 font-semibold">{st.name}</td>
                      <td className="px-4 py-3 text-[#5F6B76]">{st.program}</td>
                      <td className="px-4 py-3 font-mono font-medium">
                        <div className="flex items-center gap-2">
                          <span>{st.progress}</span>
                          <div className="w-16 bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#1F4E79] h-full rounded-full"
                              style={{ width: `${Math.min(100, st.progressValue || parseInt(st.progress) || 0)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={st.status === 'Completed' ? 'approved' : 'info'} size="sm">
                          {st.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Training Sessions (Section 23) */}
        <Card padding="default" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
              <span className="text-xs font-bold text-[#17202A] uppercase tracking-wider">
                Upcoming Sessions
              </span>
              <Link to="/institute/attendance" className="text-xs text-[#1F4E79] hover:underline">
                Calendar
              </Link>
            </div>

            {displaySessions.length === 0 ? (
              <div className="p-6 text-center text-xs">
                <Calendar className="w-7 h-7 text-[#94A3B8] mx-auto mb-2" />
                <p className="font-semibold text-[#17202A]">No Sessions Scheduled</p>
                <p className="text-[#5F6B76] mt-1 text-[11px]">
                  Scheduled webinars, lab sessions, and NWP modeling workshops will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {displaySessions.map((session, idx) => (
                  <div key={session._id || idx} className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB]">
                    <div className="font-semibold text-[#17202A] mb-1">
                      {session.title}
                    </div>
                    <div className="text-[#5F6B76] text-[11px] mb-2">
                      Faculty: {session.trainer}
                    </div>
                    <div className="flex items-center justify-between text-[#87919B] text-[11px] pt-1.5 border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{session.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => navigate('/institute/attendance')}
            >
              Session Schedule & Attendance
            </Button>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default InstituteDashboard;
