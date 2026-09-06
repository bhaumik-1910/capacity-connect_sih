import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminHeader from '../../components/AdminHeader';
import {
  Cpu,
  Plus,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Layers,
  Search,
  Filter,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';

const CompetencyFramework = () => {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingCompId, setDeletingCompId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const toast = useToast();
  const { showConfirm } = useDialog();

  const [newComp, setNewComp] = useState({
    code: '',
    name: '',
    domain: 'Radar Meteorology',
    description: '',
    evidenceCriteria: ''
  });

  const fetchCompetencies = async () => {
    setLoading(true);
    try {
      const res = await api.getCompetencies();
      if (res.success) setCompetencies(res.competencies || []);
    } catch (err) {
      console.error('Error fetching competencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, []);

  const handleCreateCompetency = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCompetency(newComp);
      if (res.success) {
        toast.success('Competency successfully added to National Framework!', 'Standard Created');
        setShowAddModal(false);
        setNewComp({ code: '', name: '', domain: 'Radar Meteorology', description: '', evidenceCriteria: '' });
        fetchCompetencies();
      }
    } catch (err) {
      toast.error(err.message, 'Competency Creation Error');
    }
  };

  const handleDeleteCompetency = async (comp) => {
    const confirmed = await showConfirm({
      title: 'Remove National Competency Standard',
      message: `Are you sure you want to permanently delete competency "${comp.code} - ${comp.name}"? Courses mapped to this standard will be affected.`,
      confirmText: 'Delete Standard',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeletingCompId(comp._id);
    try {
      const res = await api.deleteCompetency(comp._id);
      if (res.success) {
        toast.success(res.message || 'Competency standard removed successfully', 'Standard Deleted');
        setCompetencies((prev) => prev.filter((c) => c._id !== comp._id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete competency');
    } finally {
      setDeletingCompId(null);
    }
  };

  const domains = Array.from(new Set(competencies.map(c => c.domain).filter(Boolean)));

  const filteredCompetencies = competencies.filter(c => {
    const matchesDomain = selectedDomain === 'all' || c.domain === selectedDomain;
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      (c.code || '').toLowerCase().includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.domain || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
    return matchesDomain && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]" />
          <span className="text-xs font-semibold text-slate-500">Loading competency taxonomy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MoES Executive Authority Header */}
      <AdminHeader
        title="National Competency Framework Taxonomy"
        subtitle="Governed meteorological competencies, WMO-1083 proficiency benchmarks, and operational evidence thresholds across operational earth science disciplines."
        badge="WMO-No. 1083 Standard Taxonomy"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competency Standard</span>
          </button>
        }
      />

      {/* Filter & Search Strip */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. RAD-301), domain, title..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white"
          >
            <option value="all">All Domains ({domains.length})</option>
            {domains.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span>Standardized Framework:</span>
          <strong className="text-slate-900">{filteredCompetencies.length} Competencies</strong>
        </div>
      </div>

      {/* Competencies Grid */}
      {filteredCompetencies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
            <Cpu className="w-7 h-7" />
          </div>
          <div className="font-bold text-slate-800 text-base">No Competency Standards Found</div>
          <p className="text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'No competencies match your current filter. Clear your query to view all standards.'
              : 'Your National Taxonomy is ready for dynamic competency standards. Click below to add benchmark matrices.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competency Standard</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCompetencies.map((comp) => (
            <div key={comp._id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-200/80">
                      {comp.code}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {comp.domain}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug">{comp.name}</h3>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                    <Cpu className="w-4 h-4 text-blue-600" />
                  </div>
                  <button
                    type="button"
                    disabled={deletingCompId === comp._id}
                    onClick={() => handleDeleteCompetency(comp)}
                    title="Delete Competency Standard"
                    className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                  >
                    {deletingCompId === comp._id ? (
                      <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{comp.description}</p>

              {/* Proficiency Levels Grid */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Proficiency Tier Descriptors & Evidence Thresholds:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {(comp.levels || [
                    { level: 'Foundational', description: 'Theoretical knowledge & telemetry recall' },
                    { level: 'Intermediate', description: 'Standard chart & tool operational usage' },
                    { level: 'Proficient', description: 'Independent diagnosis & severe nowcasting' },
                    { level: 'Expert', description: 'Advanced assimilation & algorithmic oversight' }
                  ]).map((lvl, lIdx) => (
                    <div key={lIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:bg-slate-100/70 transition">
                      <span className="font-bold text-slate-900 block text-[11px]">{lvl.level}</span>
                      <span className="text-slate-500 text-[10px] leading-tight block mt-0.5">{lvl.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Competency Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/90 space-y-4 text-xs animate-in zoom-in-95 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Add National Competency Standard</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompetency} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">WMO Competency Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., RAD-301"
                    value={newComp.code}
                    onChange={(e) => setNewComp({ ...newComp, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Scientific Domain</label>
                  <select
                    value={newComp.domain}
                    onChange={(e) => setNewComp({ ...newComp, domain: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  >
                    <option value="Radar Meteorology">Radar Meteorology</option>
                    <option value="Satellite Meteorology">Satellite Meteorology</option>
                    <option value="Numerical Weather Prediction (NWP)">Numerical Weather Prediction (NWP)</option>
                    <option value="Cyclone Warning & Disaster Management">Cyclone Warning & Disaster Management</option>
                    <option value="Atmospheric Sciences">Atmospheric Sciences</option>
                    <option value="Aviation & Marine Forecasting">Aviation & Marine Forecasting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Competency Title / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Doppler Weather Radar Velocity Dealiasing & Nowcasting"
                  value={newComp.name}
                  onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Operational Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of competency expectations according to WMO-1083 training guide..."
                  value={newComp.description}
                  onChange={(e) => setNewComp({ ...newComp, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B2545] hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompetencyFramework;
