import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import AdminLayout from '../components/AdminLayout';
import { Users, Vote, CheckCircle, BarChart3, Loader2, Sparkles, Hash, FolderKanban } from 'lucide-react';

const AdminDashboard = () => {
  const { userData } = useAuth();

  const [members, setMembers] = useState([]);
  const [prVotes, setPRVotes] = useState([]);
  const [pocVotes, setPOCVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;

      setLoading(true);

      // Fetch project members
      const membersQuery = query(
        collection(db, "users"),
        where("projectId", "==", userData.projectId),
        where("role", "==", "user")
      );

      const membersSnap = await getDocs(membersQuery);
      const memberList = membersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMembers(memberList);

      // Fetch PR votes
      const prVotesQuery = query(
        collection(db, "votes_PR"),
        where("projectId", "==", userData.projectId)
      );
      const prVotesSnap = await getDocs(prVotesQuery);
      setPRVotes(prVotesSnap.docs.map(doc => doc.data()));

      // Fetch POC votes
      const pocVotesQuery = query(
        collection(db, "votes_POC"),
        where("projectId", "==", userData.projectId)
      );
      const pocVotesSnap = await getDocs(pocVotesQuery);
      setPOCVotes(pocVotesSnap.docs.map(doc => doc.data()));

      setLoading(false);
    };

    fetchData();
  }, [userData]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  // --- AGGREGATION LOGIC ---

  // PR Aggregation
  const prPref1 = {};
  const prPref2 = {};
  const prPref3 = {};

  members.forEach(member => {
    prPref1[member.id] = 0;
    prPref2[member.id] = 0;
    prPref3[member.id] = 0;
  });

  prVotes.forEach(vote => {
    if (vote.pref1) prPref1[vote.pref1] += 1;
    if (vote.pref2) prPref2[vote.pref2] += 1;
    if (vote.pref3) prPref3[vote.pref3] += 1;
  });

  const prResults = members.map(member => {
    const p1 = prPref1[member.id];
    const p2 = prPref2[member.id];
    const p3 = prPref3[member.id];
    const total = p1 + p2 + p3;
    return {
      id: member.id,
      name: member.name,
      pref1: p1,
      pref2: p2,
      pref3: p3,
      total: total
    };
  }).sort((a, b) => b.total - a.total);

  // POC Aggregation (2 Preferences)
  const pocPref1 = {};
  const pocPref2 = {};

  members.forEach(member => {
    pocPref1[member.id] = 0;
    pocPref2[member.id] = 0;
  });

  pocVotes.forEach(vote => {
    if (vote.pref1) pocPref1[vote.pref1] += 1;
    if (vote.pref2) pocPref2[vote.pref2] += 1;
  });

  const pocResults = members.map(member => {
    const p1 = pocPref1[member.id];
    const p2 = pocPref2[member.id];
    const total = p1 + p2;
    return {
      id: member.id,
      name: member.name,
      pref1: p1,
      pref2: p2,
      total: total
    };
  }).sort((a, b) => b.total - a.total);


  // Overall Statistics
  const totalMembers = members.length;
  // Determine uniquely active voters by assuming PR vote is main proxy, 
  // or combining unique voter emails from both sets. For now, we'll use PR Votes for turnout.
  const totalVotes = prVotes.length; 
  const turnout = totalMembers
    ? ((totalVotes / totalMembers) * 100).toFixed(1)
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        
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
                  <span className="text-sm font-medium">{userData?.email?.split('@')[0]}</span>
                </div>
                <div className="flex items-center justify-start gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 w-fit">
                  <FolderKanban size={16} className="text-indigo-400 dark:text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium">{userData?.projectId || 'Project Participant'}</span>
                </div>
                <div className="flex items-center justify-start gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 w-fit">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Admin Live View</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Header Section */}
        <section className="mb-12">
          <div>
            <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 block w-full text-center sm:text-left rounded-xl backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 absolute top-0 left-0 right-0" />
              <p className="text-slate-700 dark:text-slate-300 font-medium px-4 py-3">
                Live statistics for Project: <span className="font-semibold text-slate-900 dark:text-white">{userData?.projectId}</span>
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group flex items-center space-x-4">
              <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 absolute top-0 left-0 right-0" />
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Members</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalMembers}</p>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group flex items-center space-x-4">
              <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 absolute top-0 left-0 right-0" />
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-full text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">PR Votes Cast</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVotes}</p>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group flex items-center space-x-4">
              <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 absolute top-0 left-0 right-0" />
              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-full text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Turnout</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{turnout}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* PR Results Section */}
        <section className="mb-12">
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden relative group">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-500 dark:via-indigo-500 dark:to-blue-600 absolute top-0 left-0 right-0" />
            <div className="p-6 border-b border-indigo-50 dark:border-slate-700/50 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-slate-800 dark:to-slate-800/80 pt-8 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Vote size={20} className="text-primary-600 dark:text-primary-400" /> 
                PR Selection Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Candidate Name</th>
                    <th className="px-6 py-4 text-center">1st Pref</th>
                    <th className="px-6 py-4 text-center">2nd Pref</th>
                    <th className="px-6 py-4 text-center">3rd Pref</th>
                    <th className="px-6 py-4 text-center">Total Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {prResults.map((candidate, idx) => (
                    <tr key={candidate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {candidate.name}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {candidate.pref1}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        {candidate.pref2}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        {candidate.pref3}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{candidate.total}</span>
                      </td>
                    </tr>
                  ))}
                  
                  {prResults.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No candidate data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* POC Results Section */}
        <section>
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden relative group">
            <div className="h-1.5 bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700 dark:from-teal-400 dark:via-emerald-500 dark:to-teal-600 absolute top-0 left-0 right-0" />
            <div className="p-6 border-b border-teal-50 dark:border-slate-700/50 bg-gradient-to-br from-teal-50/50 to-emerald-50/30 dark:from-slate-800 dark:to-slate-800/80 pt-8 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={20} className="text-teal-600 dark:text-teal-400" /> 
                POC Recommendation Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Candidate Name</th>
                    <th className="px-6 py-4 text-center">1st Rec</th>
                    <th className="px-6 py-4 text-center">2nd Rec</th>
                    <th className="px-6 py-4 text-center">Total Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {pocResults.map((candidate, idx) => (
                    <tr key={candidate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {candidate.name}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {candidate.pref1}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        {candidate.pref2}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{candidate.total}</span>
                      </td>
                    </tr>
                  ))}
                  
                  {pocResults.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No candidate data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
