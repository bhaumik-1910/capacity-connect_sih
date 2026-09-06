import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminHeader from '../../components/AdminHeader';
import {
  Users,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  AlertTriangle,
  X,
  Loader2,
  Building,
  Briefcase,
  Mail,
  UserCheck,
  Filter,
  Check,
  GraduationCap
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';
import TraineeProgressModal from '../../components/TraineeProgressModal';

const UserApprovals = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectUserId, setRejectUserId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [progressModalUser, setProgressModalUser] = useState(null); // { id, name }
  const [isRejecting, setIsRejecting] = useState(false);
  const toast = useToast();
  const { showConfirm } = useDialog();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [pendRes, allRes] = await Promise.all([
        api.getPendingUsers(),
        api.getUsers()
      ]);
      if (pendRes.success) setPendingUsers(pendRes.users || []);
      if (allRes.success) setUsers(allRes.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId, userName) => {
    const confirmed = await showConfirm({
      title: 'Authorize Official Portal Access',
      message: `Are you sure you want to verify credentials and authorize official portal access for ${userName}?`,
      confirmText: 'Authorize & Approve',
      type: 'success'
    });
    if (!confirmed) return;

    setApprovingId(userId);
    try {
      const res = await api.approveUser(userId);
      if (res.success) {
        toast.success(`User ${userName} successfully approved!`, 'Access Granted');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message, 'Approval Error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectUserId) return;
    setIsRejecting(true);
    try {
      const res = await api.rejectUser(rejectUserId, rejectReason);
      if (res.success) {
        toast.warning('User account application rejected and logged to audit trail.', 'Application Rejected');
        setRejectUserId(null);
        setRejectReason('');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message, 'Rejection Error');
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredPending = pendingUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.organizationName || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  });

  const filteredAllUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.organizationName || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]" />
          <span className="text-xs font-semibold text-slate-500">Retrieving personnel registry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MoES Executive Authority Header */}
      <AdminHeader
        title="Personnel Verification & RBAC Queue"
        subtitle="Validate institutional credentials, authenticate official meteorological ranks, and grant clearance to accredited national LMS workspaces."
        badge="Identity & Access Governance"
        actions={
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/20">
            <button
              onClick={() => { setActiveTab('pending'); setSearchQuery(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span>Pending Queue</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-slate-900/30 rounded-full font-mono">
                {pendingUsers.length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span>All Personnel</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-slate-900/10 rounded-full font-mono">
                {users.length}
              </span>
            </button>
          </div>
        }
      />

      {/* Search Filter Strip */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'pending' ? 'pending registrations' : 'all personnel'} by name, email, department...`}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold self-end sm:self-auto">
          <span>Displaying: </span>
          <strong className="text-slate-900">
            {activeTab === 'pending' ? filteredPending.length : filteredAllUsers.length} records
          </strong>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {filteredPending.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Verification Queue Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No pending applications match your search query.'
                  : 'All registered forecaster and officer accounts have been reviewed and processed.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPending.map((pUser) => {
                const isTrainer = pUser.role === 'trainer';
                const isInstitute = pUser.role === 'institute_admin' || pUser.role === 'org_admin';

                return (
                  <div key={pUser._id} className="bg-white rounded-2xl border border-amber-300/80 p-5 shadow-xs hover:shadow-md transition space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs flex-shrink-0 ${
                          isTrainer ? 'bg-indigo-600' : (isInstitute ? 'bg-emerald-600' : 'bg-blue-600')
                        }`}>
                          {pUser.name ? pUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{pUser.name}</h3>
                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-mono truncate mt-0.5">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{pUser.email}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex-shrink-0 ${
                        isTrainer 
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                          : (isInstitute ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200')
                      }`}>
                        {pUser.role}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600 border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Designation:</span>
                        <strong className="text-slate-800">{pUser.designation || 'Not specified'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Department:</span>
                        <strong className="text-slate-800">{pUser.department || 'Not specified'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Organization:</span>
                        <strong className="text-slate-800 truncate max-w-[200px]">{pUser.organizationName || 'Not specified'}</strong>
                      </div>
                      {pUser.mobile && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Contact Mobile:</span>
                          <span className="font-mono font-semibold text-slate-700">{pUser.mobile}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 flex items-center justify-end space-x-2 border-t border-slate-100">
                      {(pUser.role === 'trainee' || pUser.role === 'student') && (
                        <button
                          onClick={() => setProgressModalUser({ id: pUser._id, name: pUser.name })}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition cursor-pointer flex items-center space-x-1"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Progress</span>
                        </button>
                      )}
                      <button
                        onClick={() => setRejectUserId(pUser._id)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        disabled={approvingId === pUser._id}
                        onClick={() => handleApprove(pUser._id, pUser.name)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {approvingId === pUser._id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Authorize Clearance</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALL PERSONNEL TABLE */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 whitespace-nowrap">Officer Name</th>
                  <th className="py-3 px-3 whitespace-nowrap">Official Email</th>
                  <th className="py-3 px-3 whitespace-nowrap">Assigned Role</th>
                  <th className="py-3 px-3">Organization / Institute</th>
                  <th className="py-3 px-3 whitespace-nowrap">Department</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Clearance Status</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center w-24">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No personnel records match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAllUsers.map((u) => {
                    const isTrainer = u.role === 'trainer';
                    const isInstitute = u.role === 'institute_admin' || u.role === 'org_admin';
                    const isPlatformAdmin = u.role === 'platform_admin' || u.role === 'admin';

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center border border-slate-200 shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="truncate max-w-[150px]" title={u.name}>{u.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          <div className="truncate max-w-[170px]" title={u.email}>{u.email}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isPlatformAdmin
                              ? 'bg-slate-900 text-white border-slate-900'
                              : (isTrainer 
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                                  : (isInstitute ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'))
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <div className="truncate max-w-[180px]" title={u.organizationName || '-'}>
                            {u.organizationName || '-'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div className="truncate max-w-[130px]" title={u.department || '-'}>
                            {u.department || '-'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5 ${
                            u.approvalStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : (u.approvalStatus === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.approvalStatus === 'approved' ? 'bg-emerald-500' : (u.approvalStatus === 'pending' ? 'bg-amber-500' : 'bg-rose-500')
                            }`} />
                            <span>{u.approvalStatus}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {(u.role === 'trainee' || u.role === 'student') ? (
                            <button
                              onClick={() => setProgressModalUser({ id: u._id, name: u.name })}
                              className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                              title="View Learning Progress & Courses"
                            >
                              <GraduationCap className="w-3 h-3 text-indigo-600" />
                              <span>Progress</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectUserId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setRejectUserId(null)}
        >
          <form 
            onSubmit={handleRejectSubmit} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in zoom-in-95 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Reject Clearance Application</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectUserId(null)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-600 leading-relaxed">
              Please enter an official justification for rejecting this personnel registration. This justification will be logged to the National Audit Trail.
            </p>
            
            <textarea
              required
              rows={3}
              placeholder="e.g., Incomplete official credentials, invalid meteorological division authorization..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
            
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectUserId(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRejecting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs inline-flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isRejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isRejecting ? 'Rejecting...' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trainee Learning Progress Dossier Modal */}
      <TraineeProgressModal
        traineeId={progressModalUser?.id}
        traineeName={progressModalUser?.name}
        isOpen={!!progressModalUser}
        onClose={() => setProgressModalUser(null)}
      />

    </div>
  );
};

export default UserApprovals;
