import React from 'react';
import { Calculator, BookOpen, LineChart, Cpu, Sigma, FunctionSquare } from 'lucide-react';

export default function MathRevision() {
  const topics = [
    { title: 'Differential Calculus', icon: FunctionSquare, status: 'Completed', progress: 100 },
    { title: 'Linear Algebra', icon: Calculator, status: 'In Progress', progress: 65 },
    { title: 'Probability Theory', icon: LineChart, status: 'Upcoming', progress: 0 },
    { title: 'Number Systems', icon: Sigma, status: 'Completed', progress: 100 },
    { title: 'Logic Gates', icon: Cpu, status: 'In Progress', progress: 12 },
    { title: 'Set Theory', icon: BookOpen, status: 'Upcoming', progress: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calculator className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">EduLearn Mastery Portal</h1>
              <p className="text-slate-500 text-sm font-medium">Student Dashboard: Year 12 Advanced Mathematics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => (window as any).toggleCloak?.()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all opacity-0 hover:opacity-100 focus:opacity-100"
            >
              Exit Dashboard
            </button>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">Academic Score: 92%</div>
              <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Top 5% Rank</div>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-full border-2 border-white shadow-sm" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Current Module</h3>
            <div className="text-2xl font-bold text-slate-900 mb-2">Matrix Inversions</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-[65%]" />
            </div>
            <div className="mt-4 flex justify-between text-xs font-medium">
              <span className="text-slate-400">Progress</span>
              <span className="text-indigo-600">65%</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Study Time</h3>
            <div className="text-2xl font-bold text-slate-900 mb-2">14.5 Hours</div>
            <p className="text-slate-400 text-xs">Total focus time this week</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Next Exam</h3>
            <div className="text-2xl font-bold text-slate-900 mb-2">May 24th</div>
            <p className="text-slate-400 text-xs text-red-500 font-medium italic">10 days remaining</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-6">Course Curriculum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <topic.icon className="text-slate-400 w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">{topic.title}</div>
                  <div className={`text-[10px] font-black uppercase tracking-tighter ${
                    topic.status === 'Completed' ? 'text-emerald-500' : 
                    topic.status === 'In Progress' ? 'text-amber-500' : 'text-slate-300'
                  }`}>
                    {topic.status}
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    topic.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-400'
                  }`} 
                  style={{ width: `${topic.progress}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-indigo-900 rounded-[2rem] text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4 italic">Preparation: Unit 4 Assessment</h3>
            <p className="text-indigo-200 max-w-lg text-sm leading-relaxed mb-6 font-medium">
              This module covers advanced integration techniques, including integration by parts, partial fractions, and trigonometric substitutions. Review the theory before attempting the practice set.
            </p>
            <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
              Open Revision Guide
            </button>
          </div>
          <Calculator className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
        </div>
      </div>
    </div>
  );
}
