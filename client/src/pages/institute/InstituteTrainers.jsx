import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast, useDialog } from '../../context/NotificationContext';
import InstituteHeader from '../../components/InstituteHeader';
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Mail,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Sliders,
  Plus,
  X,
  Trash2,
  Loader2,
  Phone,
  Building2,
  GraduationCap
} from 'lucide-react';

const InstituteTrainers = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { showConfirm } = useDialog();
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  // Add Trainer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingTrainer, setAddingTrainer] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    mobile: ''
  });

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers('role=trainer');
      if (res.success) {
        setTrainers(res.users || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load institute trainers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    setAddingTrainer(true);
    try {
      const payload = {
        ...formData,
        role: 'trainer',
        organizationId: user?.organizationId?._id || user?.organizationId,
        organizationName: user?.organizationName || 'National Meteorological Institute'
      };
      const res = await api.register(payload);
      if (res.success) {
        toast.success(`Trainer ${formData.name} added to institute faculty!`, 'Trainer Added');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          department: '',
          designation: '',
          mobile: ''
        });
        loadTrainers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add trainer');
    } finally {
      setAddingTrainer(false);
    }
  };

  const handleDeleteTrainer = async (trainerId, trainerName) => {
    const confirmed = await showConfirm({
      title: 'Remove Faculty Member',
      message: `Are you sure you want to remove ${trainerName || 'this faculty member'} from this institute's accredited roster? This action cannot be undone.`,
      confirmText: 'Remove Trainer',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingId(trainerId);
    try {
      const res = await api.deleteUser(trainerId);
      if (res.success) {
        toast.success(`Faculty member ${trainerName || ''} removed successfully`, 'Trainer Removed');
        loadTrainers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove faculty member', 'Error');
    } finally {
      setDeletingId(null);
    }
  };

  // Distinct departments for filter
  const departmentsList = Array.from(new Set(trainers.map(t => t.department).filter(Boolean)));

  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase()) ||
      t.designation?.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'all' || t.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Executive Institutional Header */}
      <InstituteHeader
        title="Institute Faculty & Trainer Management"
        subtitle="Accredited faculty roster, specialized competencies, course allocations, and AI-assisted trainer matching."
        orgCode={user?.organizationCode || user?.organizationId?.code || 'INST'}
        badge="Accredited Faculty Roster"
        actions={
          <div className="flex items-center space-x-2">
            <Link
              to="/admin/trainer-matching"
              className="px-3.5 py-2 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Matcher</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Add Faculty</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Faculty</div>
            <div className="text-2xl font-black text-slate-900">{trainers.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Accredited Scientists & Instructors</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Departments Covered</div>
            <div className="text-2xl font-black text-slate-900">{departmentsList.length}</div>
            <div className="text-[10px] text-blue-600 font-semibold flex items-center space-x-1">
              <Building2 className="w-3 h-3" />
              <span>Academic Divisions</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Allocations</div>
            <div className="text-2xl font-black text-slate-900">{filteredTrainers.length} Active</div>
            <div className="text-[10px] text-indigo-600 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Matching Ready</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Sliders className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by faculty name, email, department or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {departmentsList.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer focus:bg-white"
            >
              <option value="all">All Departments ({trainers.length})</option>
              {departmentsList.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          )}

          <button
            onClick={loadTrainers}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition"
            title="Refresh Faculty Roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Trainers Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-slate-600 font-bold text-xs tracking-wide">Loading accredited faculty directory...</div>
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3 text-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="font-bold text-slate-800 text-sm">No Faculty Found</div>
          <p className="text-slate-500 max-w-sm mx-auto">
            {search || selectedDept !== 'all'
              ? 'No faculty members match your active filter criteria. Try adjusting your query.'
              : 'Add accredited faculty trainers using the button above to begin course allocations.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {filteredTrainers.map((tr) => (
            <div
              key={tr._id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-800 border border-emerald-200 font-black text-base flex items-center justify-center shadow-xs">
                      {tr.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-emerald-800 transition">
                        {tr.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {tr.designation || 'Faculty Member'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                    ACCREDITED
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-600 truncate text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{tr.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      Dept: <strong className="text-slate-800">{tr.department || 'General Science'}</strong>
                    </span>
                  </div>
                  {tr.mobile && (
                    <div className="flex items-center space-x-2 text-slate-600 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{tr.mobile}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  disabled={deletingId === tr._id}
                  onClick={() => handleDeleteTrainer(tr._id, tr.name)}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Remove from Faculty"
                >
                  {deletingId === tr._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>{deletingId === tr._id ? 'Removing...' : 'Remove'}</span>
                </button>
                <Link
                  to="/admin/trainer-matching"
                  className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100/70 px-2.5 py-1 rounded-lg transition"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Course Match</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Add Accredited Faculty</h3>
                  <p className="text-[10px] text-slate-400">Enroll new instructor into institute portal</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTrainer} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter faculty / trainer full name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter official email address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter academic department / unit"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Enter official designation / role"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Temporary Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter temporary login password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTrainer}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 transition cursor-pointer flex items-center space-x-1.5"
                >
                  {addingTrainer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{addingTrainer ? 'Registering...' : 'Add Faculty'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InstituteTrainers;
