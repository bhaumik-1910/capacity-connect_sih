import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast, useDialog } from '../../context/NotificationContext';
import {
  Building2,
  Users,
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  ShieldCheck,
  Plus,
  Building,
  Radio,
  FileCheck,
  Award,
  Save,
  X,
  Trash2,
  Loader2
} from 'lucide-react';
import InstituteVerificationModal from '../../components/InstituteVerificationModal';
import TraineeProgressModal from '../../components/TraineeProgressModal';
import AdminHeader from '../../components/AdminHeader';

const InstitutionalDirectory = ({ initialTab = 'institutes' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { showConfirm } = useDialog();
  const [deletingOrgId, setDeletingOrgId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [approvingUserId, setApprovingUserId] = useState(null);
  const [progressModalUser, setProgressModalUser] = useState(null); // { id, name }

  // Determine active tab based on prop or route
  const getTabFromPath = () => {
    if (location.pathname.includes('/trainers')) return 'trainers';
    if (location.pathname.includes('/trainees')) return 'trainees';
    if (location.pathname.includes('/institutes')) return 'institutes';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Certificate Template Editor state
  const [certEditorOrgId, setCertEditorOrgId] = useState(null);
  const [certTemplate, setCertTemplate] = useState({});
  const [savingCertTemplate, setSavingCertTemplate] = useState(false);

  // Institute Check / Verification Dossier Modal
  const [verificationOrgId, setVerificationOrgId] = useState(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgRes, trainerRes, traineeRes] = await Promise.all([
        api.getAllOrganizations(),
        api.getUsers('role=trainer'),
        api.getUsers('role=trainee')
      ]);

      if (orgRes.success) setOrganizations(orgRes.organizations || []);
      if (trainerRes.success) setTrainers(trainerRes.users || []);
      if (traineeRes.success) setTrainees(traineeRes.users || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load institutional directory', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCertEditor = (org) => {
    setCertEditorOrgId(org._id);
    setCertTemplate({
      orgDisplayName: org.certificateTemplate?.orgDisplayName || org.displayName || org.legalName || '',
      logoUrl: org.certificateTemplate?.logoUrl || org.logo || '',
      signatoryName: org.certificateTemplate?.signatoryName || org.signatory?.name || '',
      signatoryDesignation: org.certificateTemplate?.signatoryDesignation || org.signatory?.designation || '',
      headerLine: org.certificateTemplate?.headerLine || '',
      minScoreForCertificate: org.certificateTemplate?.minScoreForCertificate ?? 80,
      footerNote: org.certificateTemplate?.footerNote || ''
    });
  };

  const saveCertTemplate = async () => {
    if (!certEditorOrgId) return;
    setSavingCertTemplate(true);
    try {
      const res = await api.updateCertificateTemplate(certEditorOrgId, certTemplate);
      if (res.success) {
        toast.success('Certificate template saved! Students of this institute will now receive customized certificates.', 'Template Saved');
        setCertEditorOrgId(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save template', 'Error');
    } finally {
      setSavingCertTemplate(false);
    }
  };

  const handleApproveOrg = async (orgId, orgName) => {
    const confirmed = await showConfirm({
      title: 'Approve Organization',
      message: `Are you sure you want to approve "${orgName}" as an accredited institutional tenant? Associated admin accounts and faculty trainers will also be activated.`,
      confirmText: 'Approve & Activate',
      type: 'info'
    });

    if (!confirmed) return;

    try {
      const res = await api.approveOrganization(orgId);
      if (res.success) {
        toast.success(`${orgName} approved successfully`, 'Institute Activated');
        loadData();
      }
    } catch (err) {
      toast.error(err.message, 'Approval Failed');
    }
  };

  const handleApproveUser = async (userId, userName, roleName = 'Trainer') => {
    const confirmed = await showConfirm({
      title: `Approve & Authorize ${roleName}`,
      message: `Are you sure you want to verify credentials and authorize official portal access for ${roleName.toLowerCase()} "${userName}"? Their account will be activated immediately.`,
      confirmText: 'Approve & Activate',
      type: 'success'
    });

    if (!confirmed) return;

    setApprovingUserId(userId);
    try {
      const res = await api.approveUser(userId);
      if (res.success) {
        toast.success(`${roleName} "${userName}" approved & activated successfully!`, 'Account Approved');
        if (roleName === 'Trainer') {
          setTrainers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, approvalStatus: 'approved', status: 'active' } : u))
          );
        } else {
          setTrainees((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, approvalStatus: 'approved', status: 'active' } : u))
          );
        }
      } else {
        toast.error(res.message || `Failed to approve ${roleName}`);
      }
    } catch (err) {
      toast.error(err.message || `Failed to approve ${roleName}`, 'Approval Error');
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleDeleteOrganization = async (orgId, orgName, orgCode) => {
    const confirmed = await showConfirm({
      title: 'Delete Institute Tenant',
      message: `Are you sure you want to permanently delete institute "${orgName}" (${orgCode})? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingOrgId(orgId);
    try {
      const res = await api.deleteOrganization(orgId);
      if (res.success) {
        toast.success(res.message || `${orgName} deleted successfully`);
        setOrganizations((prev) => prev.filter((o) => o._id !== orgId));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete institute');
    } finally {
      setDeletingOrgId(null);
    }
  };

  const handleDeleteUser = async (userId, userName, roleName) => {
    const confirmed = await showConfirm({
      title: `Delete ${roleName}`,
      message: `Are you sure you want to permanently delete "${userName}"? Their account credentials will be removed.`,
      confirmText: 'Delete Account',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingUserId(userId);
    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        toast.success(res.message || `${userName} removed successfully`);
        if (roleName === 'Trainer') {
          setTrainers((prev) => prev.filter((u) => u._id !== userId));
        } else {
          setTrainees((prev) => prev.filter((u) => u._id !== userId));
        }
      }
    } catch (err) {
      toast.error(err.message || `Failed to delete ${roleName}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  // Switch tab and sync with route
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchQuery('');
    setSelectedInstituteFilter('all');
    setStatusFilter('all');
    if (tabKey === 'institutes') navigate('/admin/institutes');
    else if (tabKey === 'trainers') navigate('/admin/trainers');
    else if (tabKey === 'trainees') navigate('/admin/trainees');
  };

  // Filtered Institutes
  const filteredInstitutes = organizations.filter((org) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      org.legalName?.toLowerCase().includes(q) ||
      org.displayName?.toLowerCase().includes(q) ||
      org.code?.toLowerCase().includes(q) ||
      org.type?.toLowerCase().includes(q) ||
      org.address?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (org.status === 'active' || org.status === 'APPROVED' || org.verificationStatus === 'verified')) ||
      (statusFilter === 'pending' && (org.status === 'pending' || org.status === 'PENDING_VERIFICATION' || org.verificationStatus === 'unverified')) ||
      (statusFilter === 'under_review' && (org.status === 'UNDER_REVIEW' || org.verificationStatus === 'correction_requested')) ||
      (statusFilter === 'rejected' && (org.status === 'REJECTED' || org.verificationStatus === 'rejected')) ||
      (statusFilter === 'suspended' && org.status === 'SUSPENDED');

    return matchesSearch && matchesStatus;
  });

  // Filtered Trainers
  const filteredTrainers = trainers.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.designation?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q) ||
      t.organizationName?.toLowerCase().includes(q);

    const matchesInstitute =
      selectedInstituteFilter === 'all' ||
      t.organizationId?._id === selectedInstituteFilter ||
      t.organizationId === selectedInstituteFilter ||
      t.organizationName === selectedInstituteFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && t.status === 'active') ||
      (statusFilter === 'pending' && t.approvalStatus === 'pending');

    return matchesSearch && matchesInstitute && matchesStatus;
  });

  // Filtered Trainees
  const filteredTrainees = trainees.filter((tr) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      tr.name?.toLowerCase().includes(q) ||
      tr.email?.toLowerCase().includes(q) ||
      tr.designation?.toLowerCase().includes(q) ||
      tr.department?.toLowerCase().includes(q) ||
      tr.organizationName?.toLowerCase().includes(q);

    const isIndependent = !tr.organizationId ||
      (tr.organizationName && (
        tr.organizationName.toLowerCase().includes('open') ||
        tr.organizationName.toLowerCase().includes('independent') ||
        tr.organizationName.toLowerCase().includes('direct')
      )) ||
      (tr.department && (
        tr.department.toLowerCase().includes('open') ||
        tr.department.toLowerCase().includes('direct') ||
        tr.department.toLowerCase().includes('independent')
      ));

    const matchesInstitute =
      selectedInstituteFilter === 'all' ||
      (selectedInstituteFilter === 'independent' && isIndependent) ||
      (selectedInstituteFilter !== 'independent' && !isIndependent && (
        tr.organizationId?._id === selectedInstituteFilter ||
        tr.organizationId === selectedInstituteFilter ||
        tr.organizationName === selectedInstituteFilter
      ));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && tr.status === 'active') ||
      (statusFilter === 'pending' && tr.approvalStatus === 'pending');

    return matchesSearch && matchesInstitute && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* MoES Executive Authority Header */}
      <AdminHeader
        title="Institutional Governance & Personnel Directory"
        subtitle="Centralized administrative ledger of participating autonomous bodies, accredited university departments, meteorological faculty trainers, and operational forecasters."
        badge="Autonomous Institutes & National Academy Roster"
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition flex items-center space-x-1.5 text-xs font-semibold backdrop-blur-sm cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-300' : ''}`} />
              <span className="hidden sm:inline">Sync Atlas</span>
            </button>
            <Link
              to="/register-institute"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Institute</span>
            </Link>
          </div>
        }
      />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => handleTabChange('institutes')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeTab === 'institutes'
                ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Institutes
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{organizations.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Regional Centers & Academies</div>
          </div>

          <div
            onClick={() => handleTabChange('trainers')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeTab === 'trainers'
                ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Faculty
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{trainers.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Scientists & Senior Instructors</div>
          </div>

          <div
            onClick={() => handleTabChange('trainees')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeTab === 'trainees'
                ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Forecasters
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{trainees.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Active Trainees & Observers</div>
          </div>
        </div>

      {/* 2. Navigation Tabs (Mobile Horizontally Scrollable) */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">
        <button
          onClick={() => handleTabChange('institutes')}
          className={`pb-3 px-4 border-b-2 flex items-center space-x-2 transition flex-shrink-0 cursor-pointer ${
            activeTab === 'institutes'
              ? 'border-blue-700 text-blue-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institutes & Academies ({organizations.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('trainers')}
          className={`pb-3 px-4 border-b-2 flex items-center space-x-2 transition flex-shrink-0 cursor-pointer ${
            activeTab === 'trainers'
              ? 'border-indigo-700 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Trainers Directory ({trainers.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('trainees')}
          className={`pb-3 px-4 border-b-2 flex items-center space-x-2 transition flex-shrink-0 cursor-pointer ${
            activeTab === 'trainees'
              ? 'border-emerald-700 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Trainees Directory ({trainees.length})</span>
        </button>
      </div>

      {/* 3. Filter & Search Bar - Responsive Stacking */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'institutes'
                ? 'Search institutes by name, code, city, or domain...'
                : activeTab === 'trainers'
                ? 'Search trainers by name, email, or designation...'
                : 'Search trainees by name, email, or meteorological role...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Dynamic Institute Filter for Trainers & Trainees */}
          {activeTab !== 'institutes' && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <select
                value={selectedInstituteFilter}
                onChange={(e) => setSelectedInstituteFilter(e.target.value)}
                className="py-1 bg-transparent text-xs font-semibold focus:outline-none w-full"
              >
                <option value="all">All Institutes & Regional Centers</option>
                <option value="independent">🌐 Direct Open Learners (No Institute)</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.displayName || org.legalName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 bg-transparent text-xs font-semibold focus:outline-none w-full"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active / Approved Only</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: INSTITUTES DIRECTORY */}
      {activeTab === 'institutes' && (
        <div className="space-y-4">
          {filteredInstitutes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No Institutes Configured</div>
              <div className="text-slate-500 max-w-sm mx-auto">
                No organizations match your current search criteria. All dummy institutes have been cleaned and the directory is ready for dynamic registrations.
              </div>
              <Link
                to="/register-institute"
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Onboard / Register New Institute</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInstitutes.map((org) => {
                const isVerified = org.status === 'active' || org.verificationStatus === 'verified';
                return (
                  <div
                    key={org._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                              {org.code}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}>
                              {isVerified ? 'VERIFIED TENANT' : 'PENDING APPROVAL'}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                            {org.displayName || org.legalName}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-medium">{org.legalName}</div>
                        </div>

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                            {org.code?.substring(0, 3)}
                          </div>
                          <button
                            type="button"
                            disabled={deletingOrgId === org._id}
                            onClick={() => handleDeleteOrganization(org._id, org.displayName || org.legalName, org.code)}
                            title="Delete Institute Tenant"
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingOrgId === org._id ? (
                              <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Trainers Faculty</div>
                          <div className="text-base font-black text-indigo-700">{org.trainersCount ?? 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Enrolled Trainees</div>
                          <div className="text-base font-black text-emerald-700">{org.traineesCount ?? 0}</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>Type: <strong>{org.type || 'Government Ministry'}</strong></span>
                        </div>
                        {org.address && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="truncate">{org.address}</span>
                          </div>
                        )}
                        {org.website && (
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <a href={org.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                              {org.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Certificate Template Editor Panel */}
                    {certEditorOrgId === org._id && (
                      <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50 space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-600" />
                            Certificate Template Settings
                          </span>
                          <button type="button" onClick={() => setCertEditorOrgId(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Institute Name on Certificate</label>
                            <input
                              type="text"
                              value={certTemplate.orgDisplayName || ''}
                              onChange={(e) => setCertTemplate({ ...certTemplate, orgDisplayName: e.target.value })}
                              placeholder={org.displayName || org.legalName}
                              className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Logo URL (public image link)</label>
                            <input
                              type="url"
                              value={certTemplate.logoUrl || ''}
                              onChange={(e) => setCertTemplate({ ...certTemplate, logoUrl: e.target.value })}
                              placeholder="https://example.gov.in/logo.png"
                              className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs font-mono"
                            />
                            {certTemplate.logoUrl && (
                              <img src={certTemplate.logoUrl} alt="Preview" className="mt-1 h-8 object-contain rounded border border-slate-200" onError={(e) => { e.target.style.display='none'; }} />
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Signatory Name</label>
                              <input
                                type="text"
                                value={certTemplate.signatoryName || ''}
                                onChange={(e) => setCertTemplate({ ...certTemplate, signatoryName: e.target.value })}
                                placeholder="Dr. M. Mohapatra"
                                className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Signatory Designation</label>
                              <input
                                type="text"
                                value={certTemplate.signatoryDesignation || ''}
                                onChange={(e) => setCertTemplate({ ...certTemplate, signatoryDesignation: e.target.value })}
                                placeholder="Director General"
                                className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Certificate Header Line</label>
                            <input
                              type="text"
                              value={certTemplate.headerLine || ''}
                              onChange={(e) => setCertTemplate({ ...certTemplate, headerLine: e.target.value })}
                              placeholder="National Capacity Building Registry"
                              className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                              Minimum Score for Certificate (%)
                              <span className="text-[10px] text-amber-700 font-normal">(Default: 80%)</span>
                            </label>
                            <input
                              type="number"
                              min="50"
                              max="100"
                              value={certTemplate.minScoreForCertificate ?? 80}
                              onChange={(e) => setCertTemplate({ ...certTemplate, minScoreForCertificate: Number(e.target.value) })}
                              className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Footer Note on Certificate (optional)</label>
                            <input
                              type="text"
                              value={certTemplate.footerNote || ''}
                              onChange={(e) => setCertTemplate({ ...certTemplate, footerNote: e.target.value })}
                              placeholder="Valid subject to satisfactory service. Issued by..."
                              className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={saveCertTemplate}
                          disabled={savingCertTemplate}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingCertTemplate ? 'Saving...' : 'Save Certificate Template'}</span>
                        </button>
                      </div>
                    )}

                    {/* Action Buttons row */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      {/* Institute Check Dossier Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationOrgId(org._id);
                          setVerificationModalOpen(true);
                        }}
                        className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                        <span>Institute Check & Verification Dossier</span>
                      </button>

                      {/* Certificate Template Button */}
                      <button
                        type="button"
                        onClick={() => certEditorOrgId === org._id ? setCertEditorOrgId(null) : openCertEditor(org)}
                        className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {org.certificateTemplate?.signatoryName
                            ? `Edit Certificate Template · Min ${org.certificateTemplate.minScoreForCertificate ?? 80}%`
                            : 'Set Certificate Template'}
                        </span>
                      </button>

                      {/* Quick Approve button for pending orgs */}
                      {!isVerified && (
                        <button
                          onClick={() => handleApproveOrg(org._id, org.legalName)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Quick Approve & Activate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRAINERS DIRECTORY */}
      {activeTab === 'trainers' && (
        <div className="space-y-4">
          {filteredTrainers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No Trainers Found</div>
              <div className="text-slate-500 max-w-sm mx-auto">
                No active trainers match the selected institute filter or search query.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrainers.map((tr) => (
                <div
                  key={tr._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {tr.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{tr.name}</h4>
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-bold uppercase">
                            TRAINER
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          tr.approvalStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}>
                          {tr.approvalStatus?.toUpperCase() || 'ACTIVE'}
                        </span>
                        {tr.approvalStatus !== 'approved' && (
                          <button
                            type="button"
                            disabled={approvingUserId === tr._id || deletingUserId === tr._id}
                            onClick={() => handleApproveUser(tr._id, tr.name, 'Trainer')}
                            title="Approve Trainer Access"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                          >
                            {approvingUserId === tr._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>{approvingUserId === tr._id ? 'Approving...' : 'Approve'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={deletingUserId === tr._id}
                          onClick={() => handleDeleteUser(tr._id, tr.name, 'Trainer')}
                          title="Delete Trainer"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingUserId === tr._id ? (
                            <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{tr.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {tr.organizationName || tr.organizationId?.displayName || 'IMD New Delhi'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Radio className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{tr.designation || 'Scientist / Trainer'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Dept: <strong>{tr.department || 'Meteorology'}</strong></span>
                    <span className="text-slate-400">{new Date(tr.createdAt).toLocaleDateString()}</span>
                  </div>

                  {tr.approvalStatus !== 'approved' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={approvingUserId === tr._id || deletingUserId === tr._id}
                        onClick={() => handleApproveUser(tr._id, tr.name, 'Trainer')}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        {approvingUserId === tr._id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                            <span>Authorizing & Approving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Approve & Authorize Trainer Access</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRAINEES DIRECTORY */}
      {activeTab === 'trainees' && (
        <div className="space-y-4">
          {filteredTrainees.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs space-y-2">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No Trainees Found</div>
              <div className="text-slate-500 max-w-sm mx-auto">
                No active forecasters/trainees match the selected institute filter or search query.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrainees.map((st) => (
                <div
                  key={st._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {st.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{st.name}</h4>
                          <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-bold uppercase">
                            TRAINEE
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          st.approvalStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}>
                          {st.approvalStatus?.toUpperCase() || 'ACTIVE'}
                        </span>
                        {st.approvalStatus !== 'approved' && (
                          <button
                            type="button"
                            disabled={approvingUserId === st._id || deletingUserId === st._id}
                            onClick={() => handleApproveUser(st._id, st.name, 'Trainee')}
                            title="Approve Trainee Access"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                          >
                            {approvingUserId === st._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>{approvingUserId === st._id ? 'Approving...' : 'Approve'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={deletingUserId === st._id}
                          onClick={() => handleDeleteUser(st._id, st.name, 'Trainee')}
                          title="Delete Trainee"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingUserId === st._id ? (
                            <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{st.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {(!st.organizationId || st.organizationName?.toLowerCase().includes('open') || st.organizationName?.toLowerCase().includes('independent') || st.department === 'Direct Open Learner') ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] truncate">
                            🌐 Direct Open Learner (Independent)
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-800 truncate">
                            {st.organizationName || st.organizationId?.displayName || 'IMD New Delhi'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{st.designation || 'Forecaster / Observers'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Dept: <strong>{st.department || 'Synoptic Weather'}</strong></span>
                    <span className="text-slate-400">{new Date(st.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* LEARNING PROGRESS & DOSSIER BUTTON */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setProgressModalUser({ id: st._id, name: st.name })}
                      className="w-full py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-900 border border-indigo-200/90 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>View Learning Progress & Courses</span>
                    </button>
                  </div>

                  {st.approvalStatus !== 'approved' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={approvingUserId === st._id || deletingUserId === st._id}
                        onClick={() => handleApproveUser(st._id, st.name, 'Trainee')}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        {approvingUserId === st._id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                            <span>Authorizing & Approving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Approve & Authorize Trainee Access</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification Dossier Check Modal */}
      <InstituteVerificationModal
        organizationId={verificationOrgId}
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onUpdated={loadData}
      />

      {/* Trainee Learning Progress & Course Dossier Modal */}
      <TraineeProgressModal
        traineeId={progressModalUser?.id}
        traineeName={progressModalUser?.name}
        isOpen={!!progressModalUser}
        onClose={() => setProgressModalUser(null)}
      />

    </div>
  );
};

export default InstitutionalDirectory;
