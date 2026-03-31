// pages/admin/leads.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '../../lib/firebaseClient';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { 
  Briefcase, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  FileAudio, 
  Activity,
  DollarSign,
  ChevronRight,
  Filter
} from 'lucide-react';

const LeadCard = ({ lead }) => {
  const folQuality = lead.sections?.liability?.description?.length > 700 ? 'High' : 'Standard';
  const hasAudio = !!lead.sections?.liability?.audio_url;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              ID: {lead.id.substring(0, 8)}
            </span>
            {folQuality === 'High' && (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={10} /> Strong Liability
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            {lead.sections?.medical?.injury_type || "Soft Tissue / BI Potential"}
          </h3>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
          <ChevronRight size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin size={14} className="text-slate-400" />
          <span className="text-xs font-medium">{lead.intake_data?.loss_location || "Texas"}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Activity size={14} className="text-slate-400" />
          <span className="text-xs font-medium">{lead.impact_logs?.length || 0} AI-Nurtured Logs</span>
        </div>
        {hasAudio && (
          <div className="flex items-center gap-2 text-indigo-600">
            <FileAudio size={14} />
            <span className="text-xs font-black uppercase tracking-tight italic">Voice Statement Recorded</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">AI Nurture Summary</p>
        <p className="text-xs text-slate-600 italic leading-snug">
          "Claimant is logging daily pain levels (7-8) impacting sleep and child care. Consistent evidence build."
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Valuation Potential</span>
          <span className="text-lg font-black text-slate-900">$2,500 - $7,500 Target</span>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
          Purchase Lead
        </button>
      </div>
    </div>
  );
};

const LeadPurchaseDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'cases'),
      where('status', 'in', ['shielded', 'ready', 'draft']), // draft for testing
      orderBy('last_engaged_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Head>
        <title>Leads Dashboard | PMAction Intel</title>
      </Head>

      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 p-8 pt-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Daily Lead Intel</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qualified High-Value TTL Cases</p>
            </div>
          </div>
          <button className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200 transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 min-w-[140px]">
            <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Available Today</p>
            <p className="text-2xl font-black text-indigo-900">{leads.length}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[140px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg Liability</p>
            <p className="text-2xl font-black text-slate-900">High</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </div>

      {/* Floating Bottom Nav for Admin */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex justify-around">
        <button className="text-indigo-600 flex flex-col items-center gap-1 font-black text-[10px] uppercase">
          <TrendingUp size={22} />
          Leads
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-1 font-black text-[10px] uppercase">
          <Briefcase size={22} />
          Inventory
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-1 font-black text-[10px] uppercase">
          <Activity size={22} />
          Nurture
        </button>
      </div>
    </div>
  );
};

export default LeadPurchaseDashboard;
