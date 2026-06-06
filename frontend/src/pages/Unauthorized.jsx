import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl mb-6 animate-pulse">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h2 className="font-outfit font-extrabold text-2xl text-slate-100 tracking-tight">
        Access Denied
      </h2>
      <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
        You do not possess the required administrator credentials to view this analytics or operations log.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default Unauthorized;
