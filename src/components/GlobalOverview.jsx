import React from 'react';
import { Activity, ChevronDown, ChevronUp, Vote, Sparkles, List } from 'lucide-react';

const GlobalOverview = ({ users, votesPR, votesPOC, expandedProject, setExpandedProject }) => {
  // Aggregate data globally
  const usersByProject = {};
  const emailToName = {};

  users.forEach(user => {
    // Only aggregate actual voters for project counts
    if (user.role === "user") {
      if (!usersByProject[user.projectId]) usersByProject[user.projectId] = [];
      usersByProject[user.projectId].push(user);
    }
    
    // O(1) Lookup Map for Audit Reporting (All users)
    emailToName[user.email] = user.name;
  });

  const prVotesByProject = {};
  votesPR.forEach(vote => {
    if (!prVotesByProject[vote.projectId]) prVotesByProject[vote.projectId] = [];
    prVotesByProject[vote.projectId].push(vote);
  });

  const pocVotesByProject = {};
  votesPOC.forEach(vote => {
    if (!pocVotesByProject[vote.projectId]) pocVotesByProject[vote.projectId] = [];
    pocVotesByProject[vote.projectId].push(vote);
  });

  const results = Object.keys(usersByProject).map(projectId => {
    const members = usersByProject[projectId].length;
    const prVotes = prVotesByProject[projectId]?.length || 0;
    const pocVotes = pocVotesByProject[projectId]?.length || 0;

    const prTurnout = members ? ((prVotes / members) * 100).toFixed(1) : 0;
    const pocTurnout = members ? ((pocVotes / members) * 100).toFixed(1) : 0;

    return {
      projectId,
      members,
      prVotes,
      pocVotes,
      prTurnout,
      pocTurnout
    };
  });

  results.sort((a, b) => a.projectId.localeCompare(b.projectId));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Table Section */}
      <section className="mb-12 mt-6">
        <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 absolute top-0 left-0 right-0" />
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-white/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-primary-600 dark:text-primary-400" /> 
              Global Project Turnout
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Project ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center">Total Members</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center">PR Votes</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center">PR Turnout</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center">POC Votes</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center">POC Turnout</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((project) => {
                  return (
                  <React.Fragment key={project.projectId}>
                      {/* Parent Row */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-50 dark:border-slate-700/30 last:border-0">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                            {project.projectId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{project.members}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{project.prVotes}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${Number(project.prTurnout) >= 75 ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : Number(project.prTurnout) >= 40 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                            {project.prTurnout}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{project.pocVotes}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${Number(project.pocTurnout) >= 75 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : Number(project.pocTurnout) >= 40 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                            {project.pocTurnout}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400">
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
                
                {results.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      No projects found or user data empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </section>
    </div>
  );
};

export default GlobalOverview;
