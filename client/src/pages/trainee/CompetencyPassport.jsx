import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TraineeHeader from '../../components/TraineeHeader';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles,
  Shield,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';

const LEVEL_COLORS = {
  Beginner: 'bg-slate-100 text-slate-700 border-slate-300',
  Working: 'bg-sky-100 text-sky-800 border-sky-300',
  Proficient: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Expert: 'bg-purple-100 text-purple-800 border-purple-300'
};

const CompetencyPassport = () => {
  const { user } = useAuth();
  const [targetRoleId, setTargetRoleId] = useState('radar_specialist');
  const [skillGapData, setSkillGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillGap = async () => {
      setLoading(true);
      try {
        const res = await api.getSkillGap(targetRoleId);
        if (res.success) {
          setSkillGapData(res);
        }
      } catch (err) {
        console.error('Error fetching skill gap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkillGap();
  }, [targetRoleId]);

  const userCompetencies = user?.competencies || [];

  return (
    <div className="space-y-6">
      {/* Trainee Executive Header */}
      <TraineeHeader
        title="National Competency Passport & Skill-Gap Engine"
        subtitle="Longitudinal, verified record of your operational meteorological competencies, dynamic skill gaps, and AI-curated training pathways aligned with NDEAR standards."
        badge="NDEAR-Aligned Capacity Credentialing"
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-sky-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{userCompetencies.length} Verified Competencies</span>
            </span>
          </div>
        }
      />

      {/* Target Role Selector & Readiness Meter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-sky-600" />
              <span>Target Benchmark Role</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {(skillGapData?.availableRoles || []).map((r) => (
                <button
                  key={r.roleId}
                  onClick={() => setTargetRoleId(r.roleId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    targetRoleId === r.roleId
                      ? 'bg-[#0c4a6e] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.roleTitle}
                </button>
              ))}
            </div>
          </div>

          {/* Readiness Meter Hero Card */}
          {skillGapData && (
            <div className="bg-gradient-to-br from-[#0c4a6e] to-[#0f172a] text-white p-4 sm:p-5 rounded-2xl flex items-center space-x-4 min-w-[250px] shadow-md border border-sky-600/30">
              <div>
                <span className="text-[10px] text-sky-300 uppercase font-bold tracking-wider">Role Readiness</span>
                <div className="text-3xl font-black text-amber-300">
                  {skillGapData.readinessScore}%
                </div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="text-[11px] text-sky-100 font-semibold">
                  {skillGapData.readinessScore >= 80 ? '✓ Role Qualified' : '⚡ Deficits Detected'}
                </div>
                <div className="w-full h-2.5 bg-slate-950/50 rounded-full overflow-hidden mt-1.5 border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      skillGapData.readinessScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(skillGapData.readinessScore || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Role Description */}
        {skillGapData?.targetRole && (
          <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs text-sky-950 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sky-900">Official Role Mandate: </span>
              <span>{skillGapData.targetRole.description}</span>
            </div>
          </div>
        )}
      </div>

      {/* Competency Gap Analysis Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[260px]">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Gap Matrix */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>Competency Benchmark vs Current Attainment</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                {skillGapData?.gapAnalysis?.length || 0} Domain Competencies
              </span>
            </div>

            <div className="space-y-3.5">
              {(skillGapData?.gapAnalysis || []).map((item, idx) => {
                const isAchieved = item.status === 'ACHIEVED';

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isAchieved ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border text-slate-600">
                            {item.competencyCode}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {item.domain}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">
                          {item.competencyName}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold">Current</div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${LEVEL_COLORS[item.currentLevel] || 'bg-slate-100 text-slate-600'}`}>
                            {item.currentLevel}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <div className="text-left">
                          <div className="text-[10px] text-slate-400 font-bold">Target Benchmark</div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${LEVEL_COLORS[item.requiredLevel] || 'bg-sky-100 text-sky-800'}`}>
                            {item.requiredLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gap Status Indicator */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        {isAchieved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <span className={`font-bold ${isAchieved ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {isAchieved ? 'Benchmark Satisfied' : `Competency Deficit (-${item.gapScore} pts)`}
                        </span>
                      </div>

                      {!isAchieved && item.recommendedCourses?.length > 0 && (
                        <Link
                          to={`/trainee/catalogue?search=${item.competencyCode}`}
                          className="text-xs text-sky-600 font-bold hover:underline flex items-center space-x-1"
                        >
                          <span>Bridge Gap in Catalogue</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Personalized Recommended Learning Sequence */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">AI-Curated Bridge Pathway</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Personalized course recommendations calculated to eliminate your competency deficits for the selected role.
              </p>

              {(skillGapData?.personalizedLearningPath || []).length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-medium">
                  🎉 No skill gaps detected! You satisfy all competency requirements for this benchmark role.
                </div>
              ) : (
                <div className="space-y-3">
                  {skillGapData.personalizedLearningPath.map((course) => (
                    <div key={course._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 hover:border-sky-300 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">
                          {course.code}
                        </span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                          {course.level}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 leading-snug">{course.title}</h4>
                      <Link
                        to={`/trainee/catalogue?search=${course.code}`}
                        className="block w-full text-center py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-[11px] shadow-xs transition"
                      >
                        Enroll to Bridge Deficit
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Verified Passport Items */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Verified Passport Skills</span>
                <span className="font-mono text-sky-600">({userCompetencies.length})</span>
              </h4>
              <div className="space-y-2">
                {userCompetencies.length === 0 ? (
                  <p className="text-xs text-slate-400 p-2 text-center">No passport competencies logged yet.</p>
                ) : (
                  userCompetencies.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">{c.competencyName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${LEVEL_COLORS[c.level]}`}>
                        {c.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default CompetencyPassport;
