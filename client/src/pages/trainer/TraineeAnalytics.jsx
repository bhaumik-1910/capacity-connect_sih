import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Shield,
  Send,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  RefreshCw,
  Mail,
  GraduationCap
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';
import { api } from '../../services/api';
import TrainerHeader from '../../components/TrainerHeader';
import { useAuth } from '../../context/AuthContext';
import TraineeProgressModal from '../../components/TraineeProgressModal';

const TraineeAnalytics = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [cohortData, setCohortData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressModalUser, setProgressModalUser] = useState(null); // { id, name }
  const toast = useToast();
  const { showConfirm } = useDialog();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getTraineeAnalytics();
      if (res.success) {
        setCohortData(res.analytics || []);
      }
    } catch (err) {
      console.error('Error fetching trainee analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const atRiskCount = cohortData.filter(c => c.isAtRisk).length;
  const onTrackCount = cohortData.filter(c => !c.isAtRisk).length;

  const filtered = cohortData.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (item.dept || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.course || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(search.toLowerCase());

    if (filterRisk === 'atRisk') return matchesSearch && item.isAtRisk;
    if (filterRisk === 'normal') return matchesSearch && !item.isAtRisk;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <div className="text-slate-500 font-bold text-xs">Computing cohort velocity analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Executive Trainer Header */}
      <TrainerHeader
        title="Trainee Performance & At-Risk Analytics"
        subtitle="Real-time cohort velocity tracking, progress monitoring, attendance benchmarks, and automated early intervention flags."
        department={user?.department || ''}
        badge="Academic Gradebook"
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterRisk('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterRisk === 'all'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              All ({cohortData.length})
            </button>
            <button
              onClick={() => setFilterRisk('atRisk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                filterRisk === 'atRisk'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-300/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>At-Risk ({atRiskCount})</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cohort Learners</div>
            <div className="text-2xl font-black text-slate-900">{cohortData.length}</div>
            <div className="text-[10px] text-indigo-600 font-semibold flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Active Forecasters</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pace Standards Met</div>
            <div className="text-2xl font-black text-emerald-600">{onTrackCount}</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>On Target Velocity</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">At-Risk Interventions</div>
            <div className="text-2xl font-black text-rose-600">{atRiskCount}</div>
            <div className="text-[10px] text-rose-600 font-semibold flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Advisory Needed</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Trainee Roster Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by forecaster name, station, email or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 justify-end">
            <span>Showing <strong className="text-slate-900">{filtered.length}</strong> Forecasters</span>
            <button
              onClick={fetchAnalytics}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
              title="Refresh Gradebook"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
            <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Forecaster Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Department</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Course</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Progress</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Score</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Attendance</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No Enrolled Forecasters Found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                      {search || filterRisk !== 'all'
                        ? 'Try clearing your search query or filter toggle.'
                        : 'When trainees enroll in courses, their attendance, progress, and performance analytics will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((learner) => (
                  <tr key={learner.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shrink-0">
                          {learner.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-900 transition truncate max-w-[130px] lg:max-w-[170px]">
                            {learner.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px] lg:max-w-[170px]">{learner.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      <span className="truncate max-w-[120px] lg:max-w-[160px] block" title={learner.dept || '—'}>
                        {learner.dept || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                        {learner.course}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-14 sm:w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              learner.progress >= 80 ? 'bg-emerald-500' : learner.progress >= 50 ? 'bg-blue-600' : 'bg-rose-500'
                            }`}
                            style={{ width: `${learner.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-[11px]">{learner.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded border text-[11px] ${
                        learner.score >= 60
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : 'text-rose-800 bg-rose-50 border-rose-200'
                      }`}>
                        {learner.score}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800 whitespace-nowrap font-mono text-[11px]">
                      {learner.attendance}%
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {learner.isAtRisk ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          <span>AT-RISK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                          <span>ON TRACK</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {learner.traineeId && (
                          <button
                            type="button"
                            onClick={() => setProgressModalUser({ id: learner.traineeId, name: learner.name })}
                            className="h-7 px-2 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 shadow-2xs transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
                            title="View Complete Learning Records & All Courses"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Dossier</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: 'Dispatch Academic Advisory',
                              message: `Send an official competency progression advisory notice to ${learner.name} (${learner.email})?`,
                              confirmText: 'Dispatch Notice',
                              type: 'warning'
                            });
                            if (confirmed) {
                              toast.success(`Academic Advisory successfully dispatched to ${learner.name} via official IMD email gateway.`);
                            }
                          }}
                          className="h-7 px-2 text-xs bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-700 font-semibold rounded-lg border border-slate-200 hover:border-indigo-300 shadow-2xs transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Send Academic Advisory Notice"
                        >
                          <Send className="w-3 h-3 text-indigo-600" />
                          <span>Notice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainee Progress Dossier Modal */}
      <TraineeProgressModal
        traineeId={progressModalUser?.id}
        traineeName={progressModalUser?.name}
        isOpen={!!progressModalUser}
        onClose={() => setProgressModalUser(null)}
      />
    </div>
  );
};

export default TraineeAnalytics;
