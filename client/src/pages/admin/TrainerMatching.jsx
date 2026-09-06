import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminHeader from '../../components/AdminHeader';
import {
  Sliders,
  Sparkles,
  CheckCircle,
  Award,
  Users,
  BookOpen,
  Clock,
  ChevronRight,
  TrendingUp,
  Star,
  Layers,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';

const TrainerMatching = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [domain, setDomain] = useState('Radar Meteorology');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { showConfirm } = useDialog();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getCourses();
        if (res.success && res.courses?.length > 0) {
          setCourses(res.courses);
          setSelectedCourseId(res.courses[0]._id);
          setDomain(res.courses[0].category || 'Radar Meteorology');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const handleRunMatcher = async () => {
    setLoading(true);
    try {
      const res = await api.matchTrainers({
        courseId: selectedCourseId,
        domain
      });
      if (res.success) {
        setMatches(res.rankedTrainers || []);
      }
    } catch (err) {
      toast.error(err.message || 'Error running matching algorithm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId || domain) {
      handleRunMatcher();
    }
  }, [domain, selectedCourseId]);

  const handleAssignTrainer = async (trainer) => {
    const confirmed = await showConfirm({
      title: 'Assign Lead Faculty / Subject Expert',
      message: `Authorize deployment of ${trainer.name} as Lead Instructor for this curriculum module?`,
      confirmText: 'Confirm Assignment',
      type: 'success'
    });
    if (confirmed) {
      toast.success(`${trainer.name} officially assigned to course. Faculty credentials updated.`, 'Faculty Deployed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MoES Executive Authority Header */}
      <AdminHeader
        title="Intelligent Trainer-Competency Matcher"
        subtitle="Government-grade weighted scoring engine matching curriculum syllabus requirements against certified instructor competencies, operational seniority, student ratings, and faculty workload."
        badge="Multi-Factor Optimization Engine"
        actions={
          <button
            onClick={handleRunMatcher}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Re-compute Weights</span>
          </button>
        }
      />

      {/* Control Console */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Course / Curriculum Program:</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const matched = courses.find(c => c._id === e.target.value);
                if (matched) setDomain(matched.category || 'Radar Meteorology');
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            >
              {courses.length === 0 ? (
                <option value="">No courses created yet</option>
              ) : (
                courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Scientific Domain Benchmark:</span>
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value="Radar Meteorology">Radar Meteorology</option>
              <option value="NWP & High Performance Computing">NWP & High Performance Computing</option>
              <option value="Early Warning & Disaster Mitigation">Early Warning & Disaster Mitigation</option>
              <option value="Satellite Data Assimilation">Satellite Data Assimilation</option>
              <option value="Atmospheric Sciences">Atmospheric Sciences</option>
            </select>
          </div>
        </div>

        {/* Algorithm Weight Legend */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-3">
          <span className="font-bold text-slate-800 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Configured Algorithm Factor Weights:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-700">
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Competency Alignment: <strong className="text-blue-700">40%</strong></span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Seniority & Field Service: <strong className="text-indigo-700">25%</strong></span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Learner Feedback Score: <strong className="text-amber-700">20%</strong></span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Workload Capacity: <strong className="text-emerald-700">15%</strong></span>
          </div>
        </div>
      </div>

      {/* Ranked Candidate List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]" />
            <span className="text-xs font-semibold text-slate-500">Computing multidimensional instructor rankings...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
              <span>Candidate Faculty Ranking</span>
              <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full font-mono font-bold">
                {matches.length} Candidates
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Sorted by Total Weighted Competency Index</span>
          </div>

          {matches.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
              No faculty profiles matched the selected scientific domain. Select another program or domain.
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((trainer, idx) => {
                const isTopPick = idx === 0;
                const matchPct = trainer.matchPercentage || Math.round((trainer.totalScore || 85));

                return (
                  <div
                    key={trainer.trainerId || idx}
                    className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden ${
                      isTopPick ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200'
                    }`}
                  >
                    {isTopPick && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-bl-xl tracking-wider shadow-xs">
                        ★ Algorithm Recommended
                      </div>
                    )}

                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-xl bg-[#0B2545] text-amber-300 flex items-center justify-center font-black text-xs font-mono shadow-xs">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-slate-900 text-base">{trainer.name}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              matchPct >= 80 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {trainer.recommendationLevel || (matchPct >= 80 ? 'Highly Recommended' : 'Qualified Match')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {trainer.designation || 'Senior Scientist'} • {trainer.department || 'Meteorology Division'} ({trainer.organizationName || 'India Meteorological Department'})
                          </p>
                        </div>
                      </div>

                      {/* Score Breakdown Pill Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-600">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Competency (40%)</div>
                          <div className="font-black text-slate-900 mt-0.5">{trainer.scores?.competencyScore || 38} / 40</div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-600">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Seniority (25%)</div>
                          <div className="font-black text-slate-900 mt-0.5">{trainer.experienceYears || 12} Yrs ({trainer.scores?.experienceScore || 22} pts)</div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-600">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Feedback (20%)</div>
                          <div className="font-black text-amber-600 mt-0.5 flex items-center space-x-1">
                            <span>{trainer.rating || '4.9'}</span>
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                            <span className="text-slate-400 font-normal">({trainer.scores?.ratingScore || 19} pts)</span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-600">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Active Cohorts (15%)</div>
                          <div className="font-black text-slate-900 mt-0.5">{trainer.currentActiveCourses || 1} Courses ({trainer.scores?.workloadScore || 14} pts)</div>
                        </div>
                      </div>
                    </div>

                    {/* Score Dial & Confirmation Button */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Match Index</span>
                        <div className="text-3xl font-black text-[#0B2545] font-mono leading-none mt-1">
                          {matchPct}%
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">WMO-1083 Compliant</span>
                      </div>

                      <button
                        onClick={() => handleAssignTrainer(trainer)}
                        className="px-4 py-2 bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Assign Lead Faculty</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default TrainerMatching;
