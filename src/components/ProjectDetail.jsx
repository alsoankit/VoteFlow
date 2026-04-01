import React from 'react';
import { Vote, Sparkles, List } from 'lucide-react';

const ProjectDetail = ({ projectId, users, votesPR, votesPOC }) => {

  const normalizedProjectId = projectId.toLowerCase();

  const projectUsers = users.filter(user => user.projectId?.toLowerCase() === normalizedProjectId);
  const projectVoters = projectUsers.filter(user => user.role === "user");

  const projectPrVotes = votesPR.filter(vote => vote.projectId?.toLowerCase() === normalizedProjectId);
  const projectPocVotes = votesPOC.filter(vote => vote.projectId?.toLowerCase() === normalizedProjectId);

  const emailToName = {};
  users.forEach(user => {
    emailToName[user.email] = user.name;
  });

  const aggregatePR = () => {
    const totalVotes = {};

    projectVoters.forEach(m => {
      totalVotes[m.email] = 0;
    });

    projectPrVotes.forEach(vote => {
      if (vote.pref1) { totalVotes[vote.pref1] = (totalVotes[vote.pref1] || 0) + 1; }
      if (vote.pref2) { totalVotes[vote.pref2] = (totalVotes[vote.pref2] || 0) + 1; }
      if (vote.pref3) { totalVotes[vote.pref3] = (totalVotes[vote.pref3] || 0) + 1; }
    });

    return projectVoters.map(m => ({
      name: m.name,
      email: m.email,
      totalVotes: totalVotes[m.email] || 0
    })).sort((a, b) => b.totalVotes - a.totalVotes);
  };

  const aggregatePOC = () => {
    const totalVotes = {};

    projectVoters.forEach(m => {
      totalVotes[m.email] = 0;
    });

    projectPocVotes.forEach(vote => {
      if (vote.pref1) { totalVotes[vote.pref1] = (totalVotes[vote.pref1] || 0) + 1; }
      if (vote.pref2) { totalVotes[vote.pref2] = (totalVotes[vote.pref2] || 0) + 1; }
    });

    return projectVoters.map(m => ({
      name: m.name,
      email: m.email,
      totalVotes: totalVotes[m.email] || 0
    })).sort((a, b) => b.totalVotes - a.totalVotes);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300 pb-12">
      <section>
        <div className="relative overflow-hidden mt-1 bg-white/80 dark:bg-slate-800/60 block w-full text-center sm:text-left rounded-xl backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 absolute top-0 left-0 right-0" />
          <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">{projectId} Detailed View</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1 md:mt-0 font-medium">Total Members: {projectVoters.length} | PR Votes: {projectPrVotes.length} | POC Votes: {projectPocVotes.length}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PR Summary Panel */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 absolute top-0 left-0 right-0" />
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50">
            <Vote size={18} className="text-primary-600 dark:text-primary-400" />
            <h4 className="font-bold text-slate-800 dark:text-white">PR Selection Summary</h4>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Candidate</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Total Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {aggregatePR().map(c => (
                  <tr key={c.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{c.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{c.totalVotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* POC Summary Panel */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 absolute top-0 left-0 right-0" />
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50">
            <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-slate-800 dark:text-white">POC Recommendation Summary</h4>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Candidate</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Total Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {aggregatePOC().map(c => (
                  <tr key={c.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{c.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{c.totalVotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Raw Votes Audit Log */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <List size={18} className="text-slate-500 dark:text-slate-400" />
            <h4 className="font-bold text-slate-800 dark:text-white">Raw PR Voting Log (Audit)</h4>
          </div>
          <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-red-200 dark:border-red-800">SuperAdmin Only</span>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          <table className="w-full text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-500 dark:text-slate-400 font-medium sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Voter Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Pref 1</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Pref 2</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Pref 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
              {projectPrVotes.map(vote => (
                <tr key={vote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{emailToName[vote.id] || 'Unknown User'}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{vote.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{emailToName[vote.pref1] || vote.pref1 || '-'}</div>
                    {vote.pref1 && <div className="text-slate-400 dark:text-slate-500 text-xs">{vote.pref1}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{emailToName[vote.pref2] || vote.pref2 || '-'}</div>
                    {vote.pref2 && <div className="text-slate-400 dark:text-slate-500 text-xs">{vote.pref2}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{emailToName[vote.pref3] || vote.pref3 || '-'}</div>
                    {vote.pref3 && <div className="text-slate-400 dark:text-slate-500 text-xs">{vote.pref3}</div>}
                  </td>
                </tr>
              ))}
              {projectPrVotes.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 font-medium">No PR votes recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Raw POC Votes Audit Log */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 mt-8 mb-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <List size={18} className="text-slate-500 dark:text-slate-400" />
            <h4 className="font-bold text-slate-800 dark:text-white">Raw POC Recommendation Log (Audit)</h4>
          </div>
          <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-red-200 dark:border-red-800">SuperAdmin Only</span>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          <table className="w-full text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-500 dark:text-slate-400 font-medium sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Voter Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Recommendation 1</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Recommendation 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
              {projectPocVotes.map(vote => (
                <tr key={vote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{emailToName[vote.id] || 'Unknown User'}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{vote.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{emailToName[vote.pref1] || vote.pref1 || '-'}</div>
                    {vote.pref1 && <div className="text-slate-400 dark:text-slate-500 text-xs">{vote.pref1}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{emailToName[vote.pref2] || vote.pref2 || '-'}</div>
                    {vote.pref2 && <div className="text-slate-400 dark:text-slate-500 text-xs">{vote.pref2}</div>}
                  </td>
                </tr>
              ))}
              {projectPocVotes.length === 0 && (
                <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 font-medium">No POC recommendations recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
