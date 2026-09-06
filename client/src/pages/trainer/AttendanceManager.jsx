import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, Plus, CheckCircle, Video, Users, Clock, X, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../../context/NotificationContext';
import TrainerHeader from '../../components/TrainerHeader';
import InstituteHeader from '../../components/InstituteHeader';
import { useAuth } from '../../context/AuthContext';

const AttendanceManager = () => {
  const { user } = useAuth();
  const isInstituteAdmin = user?.role === 'institute_admin' || user?.role === 'org_admin';
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allTrainees, setAllTrainees] = useState([]);
  const [facultyTrainers, setFacultyTrainers] = useState([]);
  const [activeSessionForAttendance, setActiveSessionForAttendance] = useState(null);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const toast = useToast();
  
  // New session form state
  const [newSession, setNewSession] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledDate: '',
    durationMinutes: 90,
    venueOrMeetingUrl: '',
    sessionType: 'Live Virtual Class',
    assignedTrainerId: ''
  });

  const fetchData = async () => {
    try {
      const promises = [
        api.getSessions(),
        api.getTrainerCourses(),
        api.getTraineeAnalytics()
      ];
      if (isInstituteAdmin) {
        promises.push(api.getUsers('role=trainer'));
      }

      const results = await Promise.all(promises);
      const sessRes = results[0];
      const courseRes = results[1];
      const analRes = results[2];
      const trainersRes = isInstituteAdmin ? results[3] : null;

      if (sessRes.success) setSessions(sessRes.sessions || []);
      if (analRes.success) setAllTrainees(analRes.analytics || []);
      if (trainersRes && trainersRes.success) setFacultyTrainers(trainersRes.users || []);

      if (courseRes.success && courseRes.courses?.length > 0) {
        setCourses(courseRes.courses);
        setNewSession(prev => ({ ...prev, courseId: courseRes.courses[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSession(newSession);
      if (res.success) {
        toast.success('Live Training Session scheduled successfully!');
        setShowScheduleModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message, 'Scheduling Error');
    }
  };

  const handleOpenAttendanceModal = (sess) => {
    setActiveSessionForAttendance(sess);
    const existingList = sess.attendanceList || [];

    // Map all real enrolled trainees from MongoDB
    const roster = allTrainees.map(t => {
      const existing = existingList.find(e => 
        (e.traineeId && e.traineeId.toString() === t.traineeId?.toString()) || 
        e.traineeName === t.name
      );
      return {
        traineeId: t.traineeId,
        traineeName: t.name,
        department: t.dept,
        status: existing ? existing.status : 'Present'
      };
    });

    setAttendanceRoster(roster);
  };

  const handleToggleTraineeStatus = (index) => {
    setAttendanceRoster(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: updated[index].status === 'Present' ? 'Absent' : 'Present'
      };
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    if (!activeSessionForAttendance) return;
    try {
      const res = await api.markAttendance(activeSessionForAttendance._id, attendanceRoster);
      if (res.success) {
        toast.success('Attendance records finalized and logged to audit trail!');
        setActiveSessionForAttendance(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message, 'Attendance Error');
    }
  };

  const totalMarkedRecords = sessions.reduce((acc, s) => acc + (s.attendanceList?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <div className="text-slate-500 font-bold text-xs">Loading training sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      
      {/* Header: Adaptive for Institute Admin vs Trainer */}
      {isInstituteAdmin ? (
        <InstituteHeader
          title="Institute Session Attendance & Class Rosters"
          subtitle={`Schedule live synchronous lectures and track student cohort attendance for ${user?.organizationName || 'your institute'}.`}
          orgCode={user?.organizationName?.substring(0, 4)?.toUpperCase() || 'INST'}
          badge="Institute Attendance Registry"
          actions={
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Schedule Session</span>
            </button>
          }
        />
      ) : (
        <TrainerHeader
          title="Training Sessions & Attendance Operations"
          subtitle="Schedule live synchronous webinars, radar telemetry demonstrations, and verify forecaster attendance registers."
          department={user?.department || 'Operational Training'}
          badge="Session Operations"
          actions={
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-700" />
              <span>Schedule Session</span>
            </button>
          }
        />
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Sessions</div>
            <div className="text-2xl font-black text-slate-900">{sessions.length}</div>
            <div className="text-[10px] text-indigo-600 font-semibold flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Active Calendar</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Forecasters</div>
            <div className="text-2xl font-black text-slate-900">{allTrainees.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Tracked Cohorts</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marked Attendance Logs</div>
            <div className="text-2xl font-black text-slate-900">{totalMarkedRecords}</div>
            <div className="text-[10px] text-purple-600 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Synchronized Logs</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Training Sessions Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Schedule live interactive forecasting classes or radar telemetry laboratory sessions to record trainee attendance.
          </p>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Session</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {sessions.map((sess) => (
            <div
              key={sess._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {sess.sessionType || 'Live Session'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2 group-hover:text-indigo-900 transition leading-snug">
                      {sess.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{sess.courseTitle}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600 border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Date: {new Date(sess.scheduledDate).toLocaleString()} ({sess.durationMinutes || 60} mins)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Status: <strong className="text-slate-800">{sess.status}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {sess.attendanceList?.length || 0} Records Marked
                </span>
                <button
                  onClick={() => handleOpenAttendanceModal(sess)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Record / Sync Attendance</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowScheduleModal(false)}
        >
          <form 
            onSubmit={handleScheduleSession} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-200/90 space-y-4 text-xs animate-in zoom-in-95 relative"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Schedule Live Forecasting Session</h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Associated Course</label>
              <select
                value={newSession.courseId}
                onChange={(e) => setNewSession({ ...newSession, courseId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
                ))}
              </select>
            </div>

            {isInstituteAdmin && facultyTrainers.length > 0 && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Assigned Faculty Trainer (Optional)</span>
                </label>
                <select
                  value={newSession.assignedTrainerId}
                  onChange={(e) => setNewSession({ ...newSession, assignedTrainerId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="">Myself ({user?.name || 'Institute Admin'})</option>
                  {facultyTrainers.map((tr) => (
                    <option key={tr._id} value={tr._id}>
                      {tr.name} ({tr.designation || tr.department || 'Faculty Trainer'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Session Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Live Radar Velocity Dealiasing Case Study"
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={newSession.scheduledDate}
                  onChange={(e) => setNewSession({ ...newSession, scheduledDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Duration (Minutes)</label>
                <input
                  type="number"
                  value={newSession.durationMinutes}
                  onChange={(e) => setNewSession({ ...newSession, durationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Meeting / Virtual Lab URL</label>
              <input
                type="text"
                placeholder="e.g. https://nic-meet.gov.in/moes-live-class or Lecture Hall 3"
                value={newSession.venueOrMeetingUrl}
                onChange={(e) => setNewSession({ ...newSession, venueOrMeetingUrl: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow"
              >
                Confirm & Schedule
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Live Trainee Attendance Roster Modal */}
      {activeSessionForAttendance && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveSessionForAttendance(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/90 space-y-4 text-xs animate-in zoom-in-95 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Synchronous Session Attendance Roster</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {activeSessionForAttendance.title} • {activeSessionForAttendance.courseTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSessionForAttendance(null)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {attendanceRoster.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No enrolled trainees found in database for this cohort.
                </div>
              ) : (
                attendanceRoster.map((trainee, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{trainee.traineeName}</div>
                      {trainee.department && (
                        <div className="text-[11px] text-slate-500">{trainee.department}</div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleTraineeStatus(idx)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 ${
                        trainee.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${trainee.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{trainee.status}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Present: <strong>{attendanceRoster.filter(t => t.status === 'Present').length}</strong> | Absent: <strong>{attendanceRoster.filter(t => t.status === 'Absent').length}</strong>
              </span>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveSessionForAttendance(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Finalize & Sync to Audit Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
