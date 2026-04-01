import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import UserLayout from '../components/UserLayout';
import PRVotingCard from '../components/PRVotingCard';
import POCVotingCard from '../components/POCVotingCard';
import { User, Hash, FolderKanban } from 'lucide-react';

const UserVoting = () => {
  const { userData } = useAuth();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!userData) return;

      const q = query(
        collection(db, "users"),
        where("projectId", "==", userData.projectId),
        where("role", "==", "user")
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map(doc => ({
        id: doc.id,        // email used as ID
        name: (doc.data().name || '').trim()
      })).filter(u => u.name).sort((a, b) => a.name.localeCompare(b.name));

      setCandidates(list);
    };

    fetchProjectMembers();
  }, [userData]);

  // Handle automatic email confirmation
  useEffect(() => {
    const checkAndSendEmail = async () => {
      if (!userData) return;

      // Check if both votes are cast AND the email hasn't been sent yet
      if (
        userData.hasVotedPR &&
        userData.hasVotedPOC &&
        !userData.confirmationEmailSent
      ) {
        try {
          console.log("Sending confirmation email to:", userData.email);
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userData.email,
              name: userData.name
            })
          });

          if (!response.ok) {
            throw new Error(`Email API failed: ${response.statusText}`);
          }

          // Mark in Firestore that the email was sent so we don't send it again
          const userRef = doc(db, "users", userData.email); // email is the doc ID
          await updateDoc(userRef, {
            confirmationEmailSent: true
          });
          
          console.log("Confirmation email marked as sent in Firestore.");

        } catch (error) {
          console.error("Failed to send confirmation email:", error);
        }
      }
    };

    checkAndSendEmail();
  }, [userData]);

  return (
    <UserLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* User Info Card */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50 relative group hover:shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 absolute top-0 left-0 right-0" />
          <div className="p-5 sm:p-8 flex flex-row items-center sm:items-start gap-4 sm:gap-6">
            
            {/* Project Icon Section */}
            <div className="flex-shrink-0 relative z-10">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={`/${userData?.projectId?.toLowerCase() || 'default'}.webp`} 
                  alt={userData?.projectId}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/${userData?.projectId?.toLowerCase() || 'default'}.png`;
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-2 sm:space-y-4 text-left z-10 relative">
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">Volunteer Details</h2>
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[200px] sm:max-w-none">{userData?.name || 'Voter'}</h1>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-1 sm:pt-2">
                <div className="flex items-center justify-start gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 w-fit">
                  <Hash size={16} className="text-indigo-400 dark:text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium">{userData?.rollNumber || userData?.email?.split('@')[0]}</span>
                </div>
                <div className="flex items-center justify-start gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 w-fit">
                  <FolderKanban size={16} className="text-indigo-400 dark:text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium">{userData?.projectId || 'Project Participant'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div>
          <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 block w-full text-center sm:text-left rounded-xl backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 absolute top-0 left-0 right-0" />
            <p className="text-slate-700 dark:text-slate-300 font-medium px-4 py-3">Please cast your votes carefully. Submissions are final.</p>
          </div>
        </div>
        
        <div className="space-y-8">
          {userData?.hasVotedPR ? (
            <div className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
              You have already submitted your PR vote.
            </div>
          ) : (
            <PRVotingCard candidates={candidates} />
          )}
          {userData?.hasVotedPOC ? (
            <div className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
              You have already submitted your POC recommendations.
            </div>
          ) : (
            <POCVotingCard candidates={candidates} />
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserVoting;
