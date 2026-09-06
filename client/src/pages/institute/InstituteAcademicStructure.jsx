import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast, useDialog } from '../../context/NotificationContext';
import InstituteHeader from '../../components/InstituteHeader';
import {
  Layers,
  Building2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  FolderTree,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Sparkles,
  Search,
  Hash
} from 'lucide-react';

const InstituteAcademicStructure = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { showConfirm } = useDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  // Inputs for adding items
  const [newDept, setNewDept] = useState('');
  const [newProg, setNewProg] = useState('');
  const [newBatch, setNewBatch] = useState('');

  // Local filter queries
  const [deptSearch, setDeptSearch] = useState('');
  const [progSearch, setProgSearch] = useState('');
  const [batchSearch, setBatchSearch] = useState('');

  const loadStructure = async () => {
    setLoading(true);
    try {
      const metricRes = await api.getInstituteMetrics();
      if (metricRes.success && metricRes.organization?._id) {
        const id = metricRes.organization._id;
        setOrgId(id);
        const res = await api.getAcademicStructure(id);
        if (res.success && res.academicStructure) {
          setDepartments(res.academicStructure.departments || []);
          setPrograms(res.academicStructure.programs || []);
          setBatches(res.academicStructure.batches || []);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load academic structure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStructure();
  }, []);

  const persistStructure = async (updatedDepts, updatedProgs, updatedBatches, successMsg) => {
    if (!orgId) return;
    setSaving(true);
    try {
      const res = await api.updateAcademicStructure(orgId, {
        departments: updatedDepts,
        programs: updatedProgs,
        batches: updatedBatches
      });
      if (res.success && successMsg) {
        toast.success(successMsg, 'Database Updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save changes to database', 'Database Error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await persistStructure(departments, programs, batches, 'Institute academic structure saved in MongoDB!');
  };

  const addDepartment = async () => {
    const val = newDept.trim();
    if (!val) return;
    if (!departments.includes(val)) {
      const updated = [...departments, val];
      setDepartments(updated);
      setNewDept('');
      await persistStructure(updated, programs, batches, `Department "${val}" added to database`);
    } else {
      setNewDept('');
    }
  };

  const removeDepartment = async (dept) => {
    const updated = departments.filter(d => d !== dept);
    setDepartments(updated);
    await persistStructure(updated, programs, batches, `Department "${dept}" deleted from database`);
  };

  const clearDepartments = async () => {
    const ok = await showConfirm({
      title: 'Clear All Departments',
      message: 'Are you sure you want to remove all registered departments? This will affect newly enrolled cohorts.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!ok) return;
    setDepartments([]);
    await persistStructure([], programs, batches, 'All departments cleared from database');
  };

  const addProgram = async () => {
    const val = newProg.trim();
    if (!val) return;
    if (!programs.includes(val)) {
      const updated = [...programs, val];
      setPrograms(updated);
      setNewProg('');
      await persistStructure(departments, updated, batches, `Program "${val}" added to database`);
    } else {
      setNewProg('');
    }
  };

  const removeProgram = async (prog) => {
    const updated = programs.filter(p => p !== prog);
    setPrograms(updated);
    await persistStructure(departments, updated, batches, `Program "${prog}" deleted from database`);
  };

  const clearPrograms = async () => {
    const ok = await showConfirm({
      title: 'Clear All Programs',
      message: 'Are you sure you want to remove all academic programs?',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!ok) return;
    setPrograms([]);
    await persistStructure(departments, [], batches, 'All programs cleared from database');
  };

  const addBatch = async () => {
    const val = newBatch.trim();
    if (!val) return;
    if (!batches.includes(val)) {
      const updated = [...batches, val];
      setBatches(updated);
      setNewBatch('');
      await persistStructure(departments, programs, updated, `Batch "${val}" added to database`);
    } else {
      setNewBatch('');
    }
  };

  const removeBatch = async (batch) => {
    const updated = batches.filter(b => b !== batch);
    setBatches(updated);
    await persistStructure(departments, programs, updated, `Batch "${batch}" deleted from database`);
  };

  const clearBatches = async () => {
    const ok = await showConfirm({
      title: 'Clear All Batches',
      message: 'Are you sure you want to remove all training batches?',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!ok) return;
    setBatches([]);
    await persistStructure(departments, programs, [], 'All batches cleared from database');
  };

  const filteredDepts = departments.filter(d => !deptSearch || d.toLowerCase().includes(deptSearch.toLowerCase()));
  const filteredProgs = programs.filter(p => !progSearch || p.toLowerCase().includes(progSearch.toLowerCase()));
  const filteredBatches = batches.filter(b => !batchSearch || b.toLowerCase().includes(batchSearch.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Executive Institutional Header */}
      <InstituteHeader
        title="Academic Structure: Departments, Programs & Batches"
        subtitle="Manage organizational faculties, degree & certification programs, and cohort batches used across trainer assignments and trainee enrollments."
        orgCode={user?.organizationCode || user?.organizationId?.code || 'INST'}
        badge="Accredited Academic Framework"
        actions={
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-white/20 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Syncing...' : 'Sync Structure'}</span>
          </button>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Departments</div>
            <div className="text-2xl font-black text-slate-900">{departments.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Active Divisions</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Training Programs</div>
            <div className="text-2xl font-black text-slate-900">{programs.length}</div>
            <div className="text-[10px] text-purple-600 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Curriculum Tracks</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Academic Batches</div>
            <div className="text-2xl font-black text-slate-900">{batches.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Cohort Identifiers</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-slate-600 font-bold text-xs tracking-wide">Syncing academic structure from cloud...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* 1. Departments */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Departments</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{departments.length} registered</span>
                  </div>
                </div>
                {departments.length > 0 && (
                  <button
                    type="button"
                    onClick={clearDepartments}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Add Input */}
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                  placeholder="e.g. Atmospheric Physics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={addDepartment}
                  className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Add Department"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Filter */}
              {departments.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Filter departments..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-slate-50/70 border border-slate-200 rounded-lg text-[11px] outline-none"
                  />
                </div>
              )}

              {/* List */}
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {filteredDepts.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <FolderTree className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-blue-500" />
                    <p className="text-[11px]">No departments found.</p>
                  </div>
                ) : (
                  filteredDepts.map((dept, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 rounded-xl flex items-center justify-between group transition"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs">{dept}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDepartment(dept)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
              <span>Auto-synced with DB</span>
              <span className="font-mono">DEPT-UNIT</span>
            </div>
          </div>

          {/* 2. Programs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Training Programs</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{programs.length} registered</span>
                  </div>
                </div>
                {programs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearPrograms}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Add Input */}
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={newProg}
                  onChange={(e) => setNewProg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProgram()}
                  placeholder="e.g. Cyclone Dynamics Cert"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={addProgram}
                  className="px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Add Program"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Filter */}
              {programs.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Filter programs..."
                    value={progSearch}
                    onChange={(e) => setProgSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-slate-50/70 border border-slate-200 rounded-lg text-[11px] outline-none"
                  />
                </div>
              )}

              {/* List */}
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {filteredProgs.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <GraduationCap className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-purple-500" />
                    <p className="text-[11px]">No programs found.</p>
                  </div>
                ) : (
                  filteredProgs.map((prog, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50 hover:bg-purple-50/40 border border-slate-200/80 rounded-xl flex items-center justify-between group transition"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs">{prog}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProgram(prog)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition cursor-pointer"
                        title="Delete Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
              <span>Accreditation Valid</span>
              <span className="font-mono">PROG-NDEAR</span>
            </div>
          </div>

          {/* 3. Batches */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Academic Batches</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{batches.length} registered</span>
                  </div>
                </div>
                {batches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearBatches}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Add Input */}
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBatch()}
                  placeholder="e.g. 2026-COHORT-A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={addBatch}
                  className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Add Batch"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Filter */}
              {batches.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Filter batches..."
                    value={batchSearch}
                    onChange={(e) => setBatchSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-slate-50/70 border border-slate-200 rounded-lg text-[11px] outline-none"
                  />
                </div>
              )}

              {/* List */}
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {filteredBatches.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <Calendar className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-emerald-500" />
                    <p className="text-[11px]">No batches found.</p>
                  </div>
                ) : (
                  filteredBatches.map((batch, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 rounded-xl flex items-center justify-between group transition"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs font-mono">{batch}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBatch(batch)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition cursor-pointer"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
              <span>Enrollment Active</span>
              <span className="font-mono">BATCH-ENR</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default InstituteAcademicStructure;
