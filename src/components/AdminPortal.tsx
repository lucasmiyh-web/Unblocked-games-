import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Lock, X, Search, ShieldAlert } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    console.log("Admin: Fetching users from Firestore...");
    try {
      const usersRef = collection(db, 'users');
      // Add a timeout for the fetch
      const fetchPromise = getDocs(usersRef);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection Timeout')), 8000)
      );
      
      const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;
      const fetchedUsers = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`Admin: Successfully fetched ${fetchedUsers.length} users`);
      setUsers(fetchedUsers);
    } catch (e: any) {
      console.error("Admin: Error fetching users:", e);
      setError(`Access Error: ${e.message || 'Unknown failure'}. Check database connection.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Robloxlol123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Access Token');
    }
  };

  const handlePurge = async (username: string) => {
    if (confirm(`Purge all data for ${username}?`)) {
      try {
        await deleteDoc(doc(db, 'users', username));
        fetchUsers();
      } catch (e) {
        console.error("Error purging user:", e);
        alert("Failed to purge user record.");
      }
    }
  };

  const filteredUsers = users.filter((u: any) => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div key="admin-login" className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 uppercase italic tracking-tighter mb-2">
            System Admin Access
          </h2>
          <p className="text-slate-500 text-center text-xs font-bold uppercase tracking-widest mb-8">
            Level 4 Clearance Required
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-100 transition-all font-mono text-center"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>
            )}
            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Admin Console</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management & Performance Metrics</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
              </div>
              <div className="text-3xl font-black text-slate-900">{users.length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registered Subjects</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <ShieldAlert className="w-6 h-6 text-red-600" />
                <span className="text-[10px] font-bold text-slate-400">Stable</span>
              </div>
              <div className="text-3xl font-black text-slate-900">0</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Alerts</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <Lock className="w-6 h-6 text-slate-900" />
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Active</span>
              </div>
              <div className="text-3xl font-black text-slate-900">v4.1</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Protocol</div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-black text-slate-900 uppercase italic">User Database</h2>
                <button 
                  onClick={fetchUsers}
                  disabled={loading}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  {loading ? 'Syncing...' : 'Sync Registry'}
                </button>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Identity</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Credentials</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Status</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Log</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user: any, idx: number) => {
                    const isOnline = user.lastLogin && 
                      (new Date().getTime() - new Date(user.lastLogin).getTime() < 300000); // Online if active in last 5 mins
                    
                    return (
                      <tr key={user.username || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900/5 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs text-center">
                              {(user.username || '??').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900">{user.username}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Internal Subject ID</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">Password</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-mono tracking-wider bg-slate-100 px-2 py-1 rounded-md inline-block w-fit">{user.password}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'} rounded-full`} />
                              <span className={`text-[10px] font-black ${isOnline ? 'text-emerald-600' : 'text-slate-400'} uppercase tracking-widest`}>
                                {isOnline ? 'Online Now' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.lastLogin ? (
                            <div className="flex flex-col">
                              <div className="text-[10px] font-bold text-slate-900">
                                {new Date(user.lastLogin).toLocaleString()}
                              </div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">System Timestamp</div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No Login Logged</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handlePurge(user.username)}
                            className="px-4 py-2 text-[10px] font-black bg-red-50 text-red-600 uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          >
                            Purge Data
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No subjects matching criteria found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
