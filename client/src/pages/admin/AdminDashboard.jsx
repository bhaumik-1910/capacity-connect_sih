import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ArrowRight,
  ShieldCheck,
  History,
  CheckCircle2,
  AlertTriangle,
  Plus,
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
 * Government Minimalism Platform Admin Dashboard (Section 24)
 * Platform Overview, 5 clean KPI cards, Pending Verification section, Activity
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [metricRes, approvalsRes, auditRes] = await Promise.allSettled([
          api.getAdminMetrics(),
          api.getPendingUsers ? api.getPendingUsers() : Promise.resolve({ success: true, users: [] }),
          api.getAuditLogs ? api.getAuditLogs('limit=6') : Promise.resolve({ success: true, logs: [] }),
        ]);

        if (metricRes.status === 'fulfilled' && metricRes.value?.metrics) {
          setMetrics(metricRes.value.metrics);
        }

        if (approvalsRes.status === 'fulfilled' && approvalsRes.value?.users) {
          setPendingApprovals(approvalsRes.value.users.slice(0, 5));
        } else {
          setPendingApprovals([]);
        }

        if (auditRes.status === 'fulfilled' && auditRes.value?.logs) {
          setRecentAudits(auditRes.value.logs.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // 5 Standard Platform KPI Cards (Section 24) - 100% Dynamic from MongoDB
  const kpiData = [
    {
      title: 'Institutes',
      value: metrics?.totalInstitutes ?? 0,
      subtitle: `${metrics?.pendingInstituteApprovals ?? pendingApprovals.length} pending review`,
      icon: Building2,
    },
    {
      title: 'Students',
      value: metrics?.totalTrainees ?? metrics?.totalUsers ?? 0,
      subtitle: `${metrics?.completionRate ?? 0}% platform completion`,
      icon: GraduationCap,
    },
    {
      title: 'Trainers',
      value: metrics?.totalTrainers ?? 0,
      subtitle: 'Active faculty',
      icon: Users,
    },
    {
      title: 'Courses',
      value: metrics?.totalCourses ?? 0,
      subtitle: `${metrics?.activePublishedCourses ?? 0} published`,
      icon: BookOpen,
    },
    {
      title: 'Certificates',
      value: metrics?.certificatesIssued ?? 0,
      subtitle: `${metrics?.certificatesRevoked ?? 0} revoked`,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header (Section 12 & 24) */}
      <PageHeader
        title="Platform Overview"
        description="National capacity oversight, curriculum quality moderation, and institutional accreditation."
        badge={<Badge variant="primary" size="sm">National Governance</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/user-approvals')}
            >
              Review Pending Queue ({pendingApprovals.length})
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/course-builder')}
              icon={Plus}
            >
              Create Course
            </Button>
          </div>
        }
      />

      {/* 5 Minimalist KPI Cards (Section 14 & 24) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpiData.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* IMPORTANT SECTION: Pending Institute Approvals (Section 24) */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#17202A] uppercase tracking-wider">
              Pending Institute Approvals
            </span>
            <Badge variant="warning" size="sm">
              {pendingApprovals.length} Action Required
            </Badge>
          </div>
          <Link
            to="/admin/user-approvals"
            className="text-xs font-semibold text-[#1F4E79] hover:underline flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {pendingApprovals.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5F6B76]">
              All submitted institute accreditation applications have been processed.
            </div>
          ) : (
            pendingApprovals.map((inst, idx) => (
              <div
                key={inst.id || idx}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#17202A]">
                    {inst.name || inst.organizationName || inst.email}
                  </div>
                  <div className="text-xs text-[#5F6B76] mt-0.5 flex items-center gap-2">
                    <span className="capitalize">{inst.role ? inst.role.replace('_', ' ') : (inst.state || 'Accredited Center')}</span>
                    <span>·</span>
                    <span className="text-[#87919B]">Submitted {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : (inst.submittedDate || 'Recently')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate('/admin/user-approvals')}
                  >
                    Review Dossier
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid: Course Statistics & Recent Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Course Statistics Card */}
        <Card padding="default">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#17202A]">
              Course Statistics by Domain
            </h3>
            <Link to="/admin/course-governance" className="text-xs text-[#1F4E79] hover:underline font-medium">
              Manage Courses
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.categoryStats && metrics.categoryStats.length > 0 ? (
              metrics.categoryStats.map((d, idx) => {
                const total = metrics.totalCourses || 1;
                const sharePercent = Math.round((d.count / total) * 100);
                return (
                  <div key={d._id || idx} className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-medium text-[#17202A]">{d._id || 'General Meteorology'}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#5F6B76]">{d.count} {d.count === 1 ? 'Course' : 'Courses'}</span>
                      <span className="w-10 text-right text-[#87919B] font-mono">{sharePercent}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-[#87919B]">
                No course domain statistics cataloged yet in the database.
              </div>
            )}
          </div>
        </Card>

        {/* Audit & Compliance Activity */}
        <Card padding="default">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#17202A]">
              Audit Activity
            </h3>
            <Link to="/admin/audit-logs" className="text-xs text-[#1F4E79] hover:underline font-medium">
              View Audit Log
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {(() => {
              const displayLogs = recentAudits.length > 0 ? recentAudits : (metrics?.recentAuditLogs || []);
              if (displayLogs.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-[#87919B]">
                    No system audit logs recorded yet.
                  </div>
                );
              }
              return displayLogs.slice(0, 5).map((log, idx) => {
                const timeStr = log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Recent';
                const dateStr = log.timestamp
                  ? new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : '';
                const actorDisplay = log.actorName || log.actorEmail || 'System Engine';
                return (
                  <div key={log._id || idx} className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB] last:border-b-0">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-[#17202A] flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-[#1F4E79]">{log.action || 'ACTIVITY'}</span>
                        <span className="text-[#87919B]">·</span>
                        <span className="text-[#5F6B76] truncate max-w-[180px]">{log.targetName || log.module || 'Platform'}</span>
                      </div>
                      <div className="text-[11px] text-[#87919B] mt-0.5">{dateStr} {timeStr} by {actorDisplay}</div>
                    </div>
                    <Badge variant={log.status === 'failure' ? 'rejected' : 'approved'} size="sm">
                      {log.status === 'failure' ? 'Failed' : 'Success'}
                    </Badge>
                  </div>
                );
              });
            })()}
          </div>
        </Card>

      </div>

    </div>
  );
};

export default AdminDashboard;
