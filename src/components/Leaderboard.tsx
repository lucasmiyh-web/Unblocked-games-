import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, Star, Users } from 'lucide-react';

export default function Leaderboard() {
  const users = (() => {
    try {
      const saved = localStorage.getItem('maths-revision-users');
      const parsed = JSON.parse(saved || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  })();

  const topUsers = [...users]
    .sort((a: any, b: any) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 10);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Global Vanguard</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Top Subject Efficiency Rankings</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
          <Trophy className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      <div className="p-4">
        {topUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No active subjects recorded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topUsers.map((user: any, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={user.username}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  index === 0 
                  ? 'bg-amber-50 border-amber-100' 
                  : index === 1 
                  ? 'bg-slate-50 border-slate-200'
                  : index === 2
                  ? 'bg-orange-50 border-orange-100'
                  : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center font-black italic text-lg">
                    {index === 0 ? <Crown className="w-6 h-6 text-amber-500" /> : 
                     index === 1 ? <Medal className="w-6 h-6 text-slate-400" /> :
                     index === 2 ? <Medal className="w-6 h-6 text-orange-400" /> :
                     <span className="text-slate-300">#{index + 1}</span>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{user.username}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialist</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 font-mono tracking-tighter italic">{(user.playCount || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Plays</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
