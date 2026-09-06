import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminHeader from '../../components/AdminHeader';
import InstituteHeader from '../../components/InstituteHeader';
import CustomDropdown from '../../components/CustomDropdown';
import { useAuth } from '../../context/AuthContext';
import {
  History,
  Shield,
  Search,
  Filter,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  User,
  X,
  FileText
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';

const AuditLogsCenter = () => {
  const { user } = useAuth();
  const isInstituteAdmin = user?.role === 'institute_admin' || user?.role === 'org_admin';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [clearingLogs, setClearingLogs] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [inspectLog, setInspectLog] = useState(null);
  const toast = useToast();
  const { showConfirm } = useDialog();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = '';
      const params = [];
      if (moduleFilter !== 'all') params.push(`module=${moduleFilter}`);
      if (severityFilter !== 'all') params.push(`severity=${severityFilter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (params.length > 0) query = `?${params.join('&')}`;

      const res = await api.getAuditLogs(query);
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, severityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleClearAllLogs = async () => {
    const confirmed = await showConfirm({
      title: 'Purge Entire Audit Trail',
      message: 'Are you sure you want to permanently clear all audit logs? This action is irreversible and logged for compliance.',
      confirmText: 'Purge All Logs',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setClearingLogs(true);
    try {
      const res = await api.clearAuditLogs();
      if (res.success) {
        toast.success(res.message || 'Audit logs cleared from database', 'Audit Logs Cleared');
        setLogs([]);
      } else {
        toast.error(res.message || 'Failed to clear audit logs');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to clear audit logs');
    } finally {
      setClearingLogs(false);
    }
  };

  const handleDeleteSingleLog = async (id) => {
    const confirmed = await showConfirm({
      title: 'Delete Audit Record',
      message: 'Are you sure you want to permanently delete this audit record from the database?',
      confirmText: 'Delete Record',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await api.deleteAuditLog(id);
      if (res.success) {
        toast.success(res.message || 'Audit record deleted successfully', 'Record Deleted');
        setLogs(prev => prev.filter(l => l._id !== id));
      } else {
        toast.error(res.message || 'Failed to delete record');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]" />
          <span className="text-xs font-semibold text-slate-500">Querying National Security Audit Trail...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header: Adaptive for Institute Admin vs Platform Admin */}
      {isInstituteAdmin ? (
        <InstituteHeader
          title="Institute Security & Forensic Audit Trail"
          subtitle={`Verified immutable records capturing authentication, attendance, exams, and operations by faculty trainers and students of ${user?.organizationName || 'your institute'}.`}
          orgCode={user?.organizationName?.substring(0, 4)?.toUpperCase() || 'INST'}
          badge="Institute Security Vault"
          actions={
            logs.length > 0 && (
              <button
                type="button"
                disabled={clearingLogs || deletingId !== null}
                onClick={handleClearAllLogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer flex-shrink-0 disabled:opacity-50 active:scale-98"
              >
                {clearingLogs ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{clearingLogs ? 'Purging...' : 'Purge Institute Logs'}</span>
              </button>
            )
          }
        />
      ) : (
        <AdminHeader
          title="Security & Administrative Audit Trail"
          subtitle="Cryptographically immutable records capturing every privileged administrative action, authentication attempt, user authorization, and credential transaction."
          badge="Compliance & Forensic Audit Trail"
          actions={
            logs.length > 0 && (
              <button
                type="button"
                disabled={clearingLogs || deletingId !== null}
                onClick={handleClearAllLogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer flex-shrink-0 disabled:opacity-50 active:scale-98"
              >
                {clearingLogs ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{clearingLogs ? 'Purging...' : 'Purge All Logs'}</span>
              </button>
            )
          }
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search action, trainer, student, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); fetchLogs(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <CustomDropdown
            value={moduleFilter}
            onChange={(val) => setModuleFilter(val)}
            buttonWidth="w-36 sm:w-40"
            menuWidth="w-48"
            title="Filter by System Module"
            options={[
              { value: 'all', label: 'All Modules' },
              { value: 'AUTH', label: 'AUTH' },
              { value: 'USERS', label: 'USERS' },
              { value: 'COURSES', label: 'COURSES' },
              { value: 'ASSESSMENTS', label: 'ASSESSMENTS' },
              { value: 'CERTIFICATES', label: 'CERTIFICATES' },
              { value: 'ADMIN', label: 'ADMIN' },
            ]}
          />

          <CustomDropdown
            value={severityFilter}
            onChange={(val) => setSeverityFilter(val)}
            buttonWidth="w-36 sm:w-40"
            menuWidth="w-44"
            title="Filter by Severity"
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'INFO', label: 'INFO (Normal)' },
              { value: 'WARNING', label: 'WARNING' },
              { value: 'CRITICAL', label: 'CRITICAL' },
            ]}
          />

          {(moduleFilter !== 'all' || severityFilter !== 'all' || search) && (
            <button
              type="button"
              onClick={() => {
                setModuleFilter('all');
                setSeverityFilter('all');
                setSearch('');
              }}
              className="h-10 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Clear All Filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Timestamp</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Severity</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Module</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Action</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Actor</th>
                <th className="py-2.5 px-3">Context Details</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap w-16">Purge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                      <History className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">No Security Audit Records Found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Audit events will be captured automatically as administrative workflows execute.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isCritical = log.severity === 'CRITICAL';
                  const isWarning = log.severity === 'WARNING';

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {new Date(log.timestamp).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center space-x-1 ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : (isWarning ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200')
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isCritical ? 'bg-rose-500 animate-ping' : (isWarning ? 'bg-amber-500' : 'bg-blue-500')
                          }`} />
                          <span>{log.severity || 'INFO'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[120px] lg:max-w-[150px]">{log.actorName || 'System'}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px] lg:max-w-[150px]">{log.actorRole || 'Internal Service'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-xs leading-relaxed">
                        <div
                          className="truncate font-mono text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200/70 max-w-[160px] md:max-w-[220px] lg:max-w-[280px]"
                          title={typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                        >
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={deletingId === log._id}
                          onClick={() => handleDeleteSingleLog(log._id)}
                          title="Purge Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                          {deletingId === log._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AuditLogsCenter;
