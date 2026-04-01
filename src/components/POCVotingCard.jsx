import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

import { useAuth } from "../context/AuthContext";

const POCVotingCard = ({ candidates = [] }) => {
  const { currentUser, userData } = useAuth();
  const [pref1, setPref1] = useState("");
  const [pref2, setPref2] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pref2Options = candidates.filter(c => c.id !== pref1);

  const handlePref1Change = (value) => {
    setPref1(value);
    if (value === pref2) setPref2("");
    setError(null);
  };

  const handlePref2Change = (value) => {
    setPref2(value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setError(null);
      setSubmitting(true);

      if (!pref1 || !pref2) {
        throw new Error("Please select both recommendations.");
      }

      if (pref1 === pref2) {
        throw new Error("Recommendations must be unique.");
      }

      await runTransaction(db, async (transaction) => {

        const userRef = doc(db, "users", currentUser.email);
        const settingsRef = doc(db, "settings", "global");
        const voteRef = doc(db, "votes_POC", currentUser.email);

        const userSnap = await transaction.get(userRef);
        const settingsSnap = await transaction.get(settingsRef);

        if (!userSnap.exists()) {
          throw new Error("User not found.");
        }

        const userFresh = userSnap.data();
        const settings = settingsSnap.data();

        if (!settings.votingEnabledPOC) {
          throw new Error("POC voting is currently closed.");
        }

        if (userFresh.hasVotedPOC) {
          throw new Error("You have already submitted your POC recommendations.");
        }

        transaction.set(voteRef, {
          voterEmail: currentUser.email,
          projectId: userFresh.projectId,
          pref1,
          pref2,
          timestamp: serverTimestamp(),
        });

        transaction.update(userRef, {
          hasVotedPOC: true,
        });
      });



      setSuccess(true);
      setShowConfirm(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-800/30 p-8 text-center animate-fadeIn shadow-sm mt-8">
        <div className="flex bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Recommendation Successfully Recorded</h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium">Thank you for participating in the POC Recommendations.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden hover:shadow-2xl relative group mt-8">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700 dark:from-teal-400 dark:via-emerald-500 dark:to-teal-600 absolute top-0 left-0 right-0 group-hover:h-2" />

        {/* ── Card Header ── */}
        <div className="p-6 border-b border-teal-50 dark:border-slate-700/50 bg-gradient-to-br from-teal-50/50 to-emerald-50/30 dark:from-slate-800 dark:to-slate-800/80 pt-8 transition-colors space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Point of Contact (POC) Recommendations</h2>
            <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-semibold uppercase tracking-wider">NSS SCE · Leadership Role</p>
          </div>

          {/* Role Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The <span className="font-semibold text-slate-800 dark:text-slate-100">POC</span> is a key leadership position within NSS SCE, functioning directly under the Coordinators. This role is designed for responsible and proactive volunteers who are willing to contribute actively to the smooth functioning of NSS SCE as a whole for the upcoming tenure.
          </p>

          {/* Key Aspects */}
          <div className="rounded-xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/60 dark:bg-teal-900/10 p-4 space-y-2">
            <p className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2">Key Aspects of the Role</p>
            {[
              "Acts as a communication link between NSS SCE and other NSS units within KIIT University.",
              "Serves as a connecting point between project representatives, coordinators, and program officers.",
              "Ensures smooth coordination and effective information flow across different teams and units.",
              "Works closely with the overall functioning of NSS SCE as an organization (not limited to a single project).",
              "Supports collaboration, clarity, and alignment within the unit.",
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-teal-500 dark:bg-teal-600 flex items-center justify-center text-[10px] font-bold text-white">{i + 1}</span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Expected Qualities */}
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-900/10 p-4 space-y-2">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Expected Qualities</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Strong sense of responsibility and accountability",
                "Effective communication and coordination skills",
                "Leadership mindset with initiative-taking ability",
                "Willingness to stay committed throughout the tenure",
              ].map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            If you believe a volunteer from your project aligns with the above role and responsibilities — or if you feel <span className="font-semibold text-slate-800 dark:text-slate-100">you yourself</span> are a suitable fit — you may suggest names below.
          </p>

          {/* Notes */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-900/10 p-4 space-y-1.5">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Note</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              • Even if you have suggested someone in the <span className="font-semibold">PR</span> section, you may still suggest the same person here.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              • The two names you suggest in the POC section must be <span className="font-semibold text-amber-700 dark:text-amber-400">different from each other</span> — no duplicate names within the POC suggestions.
            </p>
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center pt-1">Select your top 2 candidates for recommendation below ↓</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="p-6 space-y-7">
          <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              Recommendation 1
            </label>
            <select 
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

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              Recommendation 2
            </label>
            <select 
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
          disabled={!pref1 || !pref2}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:shadow-none"
        >
          Review & Submit POC Recommendations
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
                disabled={submitting}
                className="px-4 py-2 font-medium text-sm rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 font-medium text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
              >
                {submitting ? (
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

export default POCVotingCard;
