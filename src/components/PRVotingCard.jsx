import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

import { useAuth } from "../context/AuthContext";

const PRVotingCard = ({ candidates = [] }) => {
  const { currentUser, userData } = useAuth();
  const [preferences, setPreferences] = useState({ pref1: '', pref2: '', pref3: '' });
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { pref1, pref2, pref3 } = preferences;

  const pref2Options = candidates.filter(c => c.id !== pref1);
  const pref3Options = candidates.filter(c => c.id !== pref1 && c.id !== pref2);

  const handlePref1Change = (value) => {
    setPreferences(prev => ({ ...prev, pref1: value }));
    setError('');
    
    if (value === pref2) setPreferences(prev => ({ ...prev, pref2: '' }));
    if (value === pref3) setPreferences(prev => ({ ...prev, pref3: '' }));
  };

  const handlePref2Change = (value) => {
    setPreferences(prev => ({ ...prev, pref2: value }));
    setError('');

    if (value === pref3) setPreferences(prev => ({ ...prev, pref3: '' }));
  };

  const handlePref3Change = (value) => {
    setPreferences(prev => ({ ...prev, pref3: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const { pref1, pref2, pref3 } = preferences;

    try {
      setError('');
      setIsSubmitting(true);

      // Basic frontend validation
      if (!pref1 || !pref2 || !pref3) {
        throw new Error("Please select all three preferences.");
      }

      const uniqueSelections = new Set([pref1, pref2, pref3]);
      if (uniqueSelections.size !== 3) {
        throw new Error("Preferences must be unique.");
      }

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", currentUser.email);
        const settingsRef = doc(db, "settings", "global");
        const voteRef = doc(db, "votes_PR", currentUser.email);

        const userSnap = await transaction.get(userRef);
        const settingsSnap = await transaction.get(settingsRef);

        if (!userSnap.exists()) {
          throw new Error("User not found.");
        }

        const userFresh = userSnap.data();
        const settings = settingsSnap.data();

        if (!settings.votingEnabledPR) {
          throw new Error("PR voting is currently closed.");
        }

        if (userFresh.hasVotedPR) {
          throw new Error("You have already voted.");
        }

        // Save vote
        transaction.set(voteRef, {
          voterEmail: currentUser.email,
          projectId: userFresh.projectId,
          pref1,
          pref2,
          pref3,
          timestamp: serverTimestamp(),
        });

        // Lock user
        transaction.update(userRef, {
          hasVotedPR: true,
        });
      });



      setIsSubmitted(true);
      setShowConfirm(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-800/30 p-8 text-center animate-fadeIn shadow-sm">
        <div className="flex bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Vote Successfully Recorded</h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium">Thank you for participating in the PR Selection.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl relative group">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-500 dark:via-indigo-500 dark:to-blue-600 absolute top-0 left-0 right-0 group-hover:h-2" />
        {/* ── Card Header ── */}
        <div className="p-6 border-b border-indigo-50 dark:border-slate-700/50 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-slate-800 dark:to-slate-800/80 pt-8 transition-colors space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Project Representative (PR) Selection</h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold uppercase tracking-wider">NSS SCE · Leadership Role</p>
          </div>

          {/* Role Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The <span className="font-semibold text-slate-800 dark:text-slate-100">Project Representative (PR)</span> is the primary student leader of an individual project within NSS SCE. Each of the nine projects is led by two Project Representatives, who work together collaboratively to achieve the project's goals.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The PRs are responsible for managing and supervising all activities within their respective project and ensuring its smooth and structured functioning. They serve as the official representatives of their project within NSS SCE at unit as well as central levels.
          </p>

          {/* Key Responsibilities */}
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-900/10 p-4 space-y-2">
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">Key Responsibilities</p>
            {[
              "Oversee the planning and execution of all project-related events and initiatives.",
              "Work together in coordination with other PRs to ensure effective fulfillment of project objectives and SDG alignment.",
              "Represent the project in central discussions, collaborations, and engagements.",
              "Work directly under the Student Coordinator and remain accountable for all activities within the project.",
              "Ensure discipline, coordination, and active participation of project members.",
              "Take responsibility for both achievements and challenges within the project.",
              "Contribute not only to the growth of their individual project but also to the overall progress and vision of NSS SCE.",
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">{i + 1}</span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Expected Qualities */}
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 p-4 space-y-2">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">Expected Qualities</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The Project Representatives must demonstrate leadership, accountability, teamwork, organizational ability, and a strong commitment to both their project and NSS SCE as a whole.
            </p>
          </div>

          {/* Voting Instructions */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Vote for <span className="font-semibold text-slate-800 dark:text-slate-100">three deserving candidates</span> from your project in order of preference. Each preference must be a <span className="font-semibold text-indigo-600 dark:text-indigo-400">different person</span> — no two selections can be the same. If you feel <span className="font-semibold text-slate-800 dark:text-slate-100">you yourself</span> are a suitable fit, you may suggest yourself as well.
          </p>

          {/* How It Works */}
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-900/10 p-3">
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1.5">How It Works</p>
            <div className="flex flex-col gap-1">
              {["Preference 1 — Your top/most deserving choice.", "Preference 2 — Your second choice (must differ from Pref 1).", "Preference 3 — Your third choice (must differ from Pref 1 & 2)."].map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center pt-1">Select your preferences below ↓</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="p-6 space-y-7">
          <div className="space-y-5">
          {/* Preference 1 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              Preference 1
            </label>
            <select 
              title="Preference 1"
              value={pref1}
              onChange={(e) => handlePref1Change(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select Candidate --</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Preference 2 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              Preference 2
            </label>
            <select 
              title="Preference 2"
              value={pref2}
              onChange={(e) => handlePref2Change(e.target.value)}
              disabled={!pref1}
              className="input-field disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Candidate --</option>
              {pref2Options.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Preference 3 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              Preference 3
            </label>
            <select 
              title="Preference 3"
              value={pref3}
              onChange={(e) => handlePref3Change(e.target.value)}
              disabled={!pref2}
              className="input-field disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Candidate --</option>
              {pref3Options.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="button" 
          onClick={() => setShowConfirm(true)}
          disabled={!pref1 || !pref2 || !pref3}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:shadow-none"
        >
          Review & Submit PR Preferences
        </button>
      </form>
    </div>

    {showConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scaleIn border border-slate-100 dark:border-slate-700 transition-colors">
            
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={20} />
              Confirm Submission
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed transition-colors">
              Once submitted, your vote cannot be modified. <br/>
              <span className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">Are you sure you want to proceed?</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 font-medium text-sm rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 font-medium text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PRVotingCard;
