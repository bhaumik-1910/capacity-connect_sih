import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import TraineeHeader from '../../components/TraineeHeader';
import { Calendar, Video, Clock, MapPin, CheckCircle, ExternalLink, Shield, Radio, Sparkles, User } from 'lucide-react';

const TrainingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.getSessions();
        if (res.success) setSessions(res.sessions || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trainee Executive Header */}
      <TraineeHeader
        title="Live Classes & Doppler Radar Hands-on Lab Calendar"
        subtitle="Scheduled virtual lab exercises, synoptic forecasting briefings, Doppler radar nowcasting workshops, and real-time interactive mentoring."
        badge="Synchronous Hands-on Operations"
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-sky-200 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{sessions.length} Scheduled Sessions</span>
            </span>
          </div>
        }
      />

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
            <Calendar className="w-7 h-7 text-sky-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Live Training Sessions Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upcoming virtual lab demonstrations, Doppler radar simulations, and synoptic briefings will be announced here by accredited faculty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((sess) => (
            <div
              key={sess._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-md border border-sky-200/60">
                      {sess.sessionType || 'Virtual Lab'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2 group-hover:text-sky-700 transition">
                      {sess.title}
                    </h3>
                    <p className="text-xs font-semibold text-sky-600 mt-0.5">
                      {sess.courseTitle}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Video className="w-5 h-5" />
                  </div>
                </div>

                {sess.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {sess.description}
                  </p>
                )}

                <div className="p-3 bg-slate-50/90 rounded-xl text-xs space-y-2 text-slate-600 border border-slate-200/70">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>
                      {new Date(sess.scheduledDate).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })} ({sess.durationMinutes || 60} mins)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Faculty: <strong className="text-slate-800">{sess.trainerName}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Verified Attendance Track</span>
                </span>

                <a
                  href={sess.venueOrMeetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Join Live Lab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingSessions;
