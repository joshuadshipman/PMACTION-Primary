// pages/ttl/case-prep.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { auth, db, storage } from '../../lib/firebaseClient';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useApp } from '../../lib/context';
import { 
  ChevronRight, 
  Upload, 
  Stethoscope, 
  Camera, 
  FileText, 
  Users, 
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Info,
  MapPin,
  Clock,
  ArrowRight,
  Mic,
  MicOff,
  Car,
  Activity,
  ShieldCheck,
  History
} from 'lucide-react';

// --- Sub-Components ---

const CaseCard = ({ title, icon: Icon, status, onClick, children, advice, adviceEs }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-indigo-100 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {status === 'completed' ? 'Verified / Verificado' : 'Incomplete / Incompleto'}
          </span>
        </div>
      </div>
      <button onClick={onClick} className="text-slate-400 hover:text-indigo-600 p-2">
        <ChevronRight size={20} />
      </button>
    </div>

    {children}

    {(advice || adviceEs) && (
      <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-2">
        {advice && (
          <div className="flex gap-3">
            <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800 leading-relaxed">
              <span className="font-bold">Pro Tip:</span> {advice}
            </p>
          </div>
        )}
        {adviceEs && (
          <div className="flex gap-3 pt-2 border-t border-indigo-100/30">
            <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 italic leading-relaxed">
              <span className="font-bold">Consejo:</span> {adviceEs}
            </p>
          </div>
        )}
      </div>
    )}
  </div>
);

const RentalSubModal = ({ isOpen, onClose, onSave, currentData }) => {
  const [data, setData] = useState(currentData || {
    policy_has_rental: null,
    liability_accepted: null,
    is_drivable: null,
    offer_received_stopped_rental: null
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[101] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Rental Nuance</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 italic">Verificación de Transporte</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">1. Does your policy have rental?</p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button 
                  key={String(val)}
                  onClick={() => setData({ ...data, policy_has_rental: val })}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase transition-all ${data.policy_has_rental === val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">2. Has the other carrier accepted liability?</p>
            <div className="flex gap-2">
              {['pending', 'accepted', 'denied'].map(val => (
                <button 
                  key={val}
                  onClick={() => setData({ ...data, liability_accepted: val })}
                  className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${data.liability_accepted === val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">3. Is the vehicle currently drivable?</p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button 
                  key={String(val)}
                  onClick={() => setData({ ...data, is_drivable: val })}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase transition-all ${data.is_drivable === val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => onSave(data)}
          className="w-full mt-10 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          Update Logic <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const ConditionDataCard = ({ logs, onSave }) => {
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl space-y-6 border border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
          <Activity size={24} />
        </div>
        <div>
          <h4 className="text-white font-black uppercase text-sm tracking-widest">Condition Recovery</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Daily Feeling Audit • Texas Standard</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-bottom">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pain/Feeling Intensity</p>
          <span className="text-2xl font-black text-indigo-400">{score}/10</span>
        </div>
        <input 
          type="range" min="1" max="10" value={score} 
          onChange={(e) => setScore(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
          <span>Mild</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
      </div>

      <textarea 
        placeholder="How did your injuries impact your day? (e.g. Trouble sleeping, stiffness...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-sm text-slate-300 placeholder-slate-600 min-h-[80px] focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
      />

      <button 
        onClick={() => {
          if (!note.trim()) return;
          onSave({ score, note, date: new Date().toISOString() });
          setNote('');
        }}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-900/40 transition-all"
      >
        Log Status
      </button>

      {logs?.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-2">
          {logs.slice(-2).reverse().map((log, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-tighter bg-slate-800/20 p-2 rounded-lg">
              <span>{new Date(log.date).toLocaleDateString()}</span>
              <span className={log.score > 7 ? 'text-red-400' : 'text-emerald-400'}>Level {log.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CaseInputModal = ({ section, isOpen, onClose, onSave }) => {
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('PNC');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
      recorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {section === 'liability' ? 'Statement details' : 'Evidence Upload'}
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {section === 'liability' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 leading-relaxed italic">
                {isRecording ? "Listening... Speak clearly." : "\"Piense en esto como una declaración grabada.\""}
              </p>
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-indigo-100 text-indigo-600'}`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            
            <div className="relative">
              <textarea 
                className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Describe road conditions, signal colors, speed, and point of impact..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <div className={`absolute bottom-4 right-4 text-[10px] font-bold ${value.length < 500 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {value.length} / 500+
              </div>
            </div>

            {audioUrl && (
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600">Voice Recording Captured</span>
                <audio src={audioUrl} controls className="h-8 max-w-[150px]" />
                <button onClick={() => setAudioUrl(null)} className="text-slate-400"><X size={14} /></button>
              </div>
            )}
            {value.length < 500 && (
              <p className="text-[10px] text-amber-600 font-medium">
                Aim for 500+ characters to help your attorney build the strongest liability case.
              </p>
            )}
          </div>
        )}

        {(section === 'photos' || section === 'medical') && (
          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              {['PNC', 'DEF', 'Witness', 'Other'].map(l => (
                <button 
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${
                    label === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 group hover:border-indigo-400 transition-all cursor-pointer">
              <Camera size={32} className="text-slate-400 group-hover:text-indigo-600 transition-all" />
              <p className="text-xs font-bold text-slate-400">Snap or Upload {label} Evidence</p>
            </div>
          </div>
        )}

        <button 
          onClick={() => {
            if (section === 'liability') {
              onSave({ text: value, audioBlob: null }); // Placeholder
            } else {
              onSave(value || label);
            }
          }}
          className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          Save Details
        </button>
      </div>
    </div>
  );
};

// --- Layout Configurations ---
const LAYOUT_CONFIGS = {
  DEFAULT: {
    sections: ['total_loss', 'liability', 'medical', 'photos'],
    prioritize: ['total_loss'],
    show_rental: false // Hidden by default, unlocked by intake
  },
  TOTAL_LOSS_ADS: {
    sections: ['total_loss', 'medical', 'liability', 'impact_logs', 'photos'],
    prioritize: ['total_loss', 'medical'],
    show_rental: true
  },
  BI_LEGAL_BUILD: {
    sections: ['liability', 'medical', 'impact_logs', 'photos'],
    prioritize: ['liability', 'medical'],
    show_rental: false
  }
};

const SettlementCalculator = () => {
  const [offer, setOffer] = useState(1500);
  const net = Math.round(offer * 4.3); // High-level projection (e.g. 6.5x gross - fee)

  return (
    <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 mb-8 overflow-hidden relative group">
      <div className="relative z-10">
        <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tighter mb-4 flex items-center gap-2">
          Expectation Calculator / Calculadora
        </h4>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Adjuster's Quick Offer</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="500" max="5000" step="100" 
                value={offer} onChange={(e) => setOffer(parseInt(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="font-black text-indigo-900 text-lg">${offer.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-indigo-200/50">
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Potential Net Settlement</p>
              <p className="text-2xl font-black text-emerald-600">${net.toLocaleString()}+</p>
            </div>
            <ArrowRight className="text-indigo-300" />
          </div>
          <p className="text-[9px] text-indigo-500 italic leading-snug">
            *Representative of industry averages (IRC). Results not guaranteed. 
            <br />Attorney settlements are typically 3.5x higher before fees.
          </p>
        </div>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <ShieldCheck size={120} />
      </div>
    </div>
  );
};

const TTLCasePrep = () => {
  const router = useRouter();
  const { user } = useApp();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // Derive layout from campaign or default
  const campaign = caseData?.intake_data?.campaign_id || 'DEFAULT';
  const baseLayout = LAYOUT_CONFIGS[campaign] || LAYOUT_CONFIGS.DEFAULT;
  
  // Merge campaign layout with user-specific needs (e.g., manual rental unlock)
  const layout = {
    ...baseLayout,
    show_rental: baseLayout.show_rental || caseData?.intake_data?.needs_rental
  };

  // Sync with Firestore & Monitor URL Params
  useEffect(() => {
    if (!user) return;
    const caseRef = doc(db, 'cases', `ttl_${user.uid}`);
    
    // Capture Campaign Data if present in URL
    const campaignId = router.query.campaign || router.query.utm_campaign;
    const source = router.query.source || router.query.utm_source;

    const unsubscribe = onSnapshot(caseRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCaseData(data);
        
        // Persist campaign data if we just got a new one in the URL
        if (campaignId && data.intake_data?.campaign_id !== campaignId) {
          updateDoc(caseRef, { 
            'intake_data.campaign_id': campaignId,
            'intake_data.source': source || 'unknown'
          });
        }
        
        updateDoc(caseRef, { last_engaged_at: new Date().toISOString() });
      } else {
        setDoc(caseRef, {
          userId: user.uid,
          status: 'draft',
          sections: {},
          intake_data: {
            loss_location: '',
            current_address: '',
            willingness_to_treat: true,
            campaign_id: campaignId || 'direct',
            source: source || 'direct',
            needs_rental: false // Default to false unless campaign says otherwise
          },
          impact_logs: [],
          last_engaged_at: new Date().toISOString(),
          nurture_status: 'new',
          marketing_roi_sent: false
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router.query]);

  const saveImpactNote = async (newNote) => {
    const caseRef = doc(db, 'cases', `ttl_${user.uid}`);
    const updatedLogs = [newNote, ...(caseData?.impact_logs || [])];
    await updateDoc(caseRef, { impact_logs: updatedLogs });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin text-indigo-600">🌀</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Head>
        <title>Case Builder | Texas Total Loss</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* Hero Header */}
      <div className="bg-indigo-900 text-white p-8 pt-12 rounded-b-[40px] shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-indigo-800/50 rounded-xl">
            <ShieldCheck size={28} className="text-indigo-300" />
          </div>
          <div className="bg-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold border border-indigo-400/20">
            Case ID: {user?.uid.substring(0, 8).toUpperCase()}
          </div>
        </div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">Your Legal Fortress</h1>
        <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
          Build a bulletproof case card-by-card. The more data you provide, the harder it is for insurance to deny your claim.
        </p>

        {/* Case Timeline Visual */}
        <section className="px-1 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-1 min-w-[400px]">
            {[
              { label: 'Incident', labelEs: 'Incidente', active: true },
              { label: 'Evidence', labelEs: 'Evidencia', active: true },
              { label: 'Treatment', labelEs: 'Tratamiento', active: false },
              { label: 'Review', labelEs: 'Revisión', active: false },
              { label: 'Settlement', labelEs: 'Acuerdo', active: false },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center gap-1 flex-1 px-1">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    step.active ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-white border-slate-300'
                  }`} />
                  <span className={`text-[9px] font-bold ${step.active ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  <span className={`text-[8px] italic -mt-1 ${step.active ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {step.labelEs}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`h-[1px] flex-1 mb-5 ${step.active ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Daily Recovery/Feeling Log (Condition Data) */}
        {layout.sections.includes('impact_logs') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-black text-slate-800 text-xl tracking-tight">Recovery Progress</h2>
              <Activity size={20} className="text-indigo-600" />
            </div>
            <ConditionDataCard 
              logs={caseData?.treatment_logs || []}
              onSave={async (data) => {
                const caseRef = doc(db, 'cases', `ttl_${user.uid}`);
                await updateDoc(caseRef, {
                  treatment_logs: arrayUnion(data),
                  last_engaged_at: new Date().toISOString()
                });
              }}
            />
          </section>
        )}

        {/* Older Impact Note Section (Legacy) */}
        {!layout.sections.includes('impact_logs') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-black text-slate-800 text-xl tracking-tight">Today's Impact</h2>
              <History size={20} className="text-slate-400" />
            </div>
            <ImpactNoteInput onSave={saveImpactNote} />
          </section>
        )}

        {/* Step 1: Early Support Modules (Dynamic) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-slate-400 text-[10px] tracking-[.2em] uppercase">Step 1: Recovery Support</h2>
            <Car size={16} className="text-slate-300" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {layout.sections.includes('total_loss') && (
              <CaseCard 
                title="Total Loss" 
                icon={CheckCircle2}
                status={caseData?.sections?.total_loss ? 'completed' : 'incomplete'}
                onClick={() => setActiveSection('estimate')}
              >
                <p className="text-[10px] text-slate-500 font-medium">Evaluation & Estimate / Evaluación</p>
              </CaseCard>
            )}

            {layout.show_rental && (
              <CaseCard 
                title="Rental Car" 
                icon={Clock}
                status={caseData?.intake_data?.rental_nuance ? 'completed' : 'incomplete'}
                advice="We help you obtain a rental by navigating delayed policy acceptances."
                adviceEs="Le ayudamos a obtener un alquiler gestionando las aceptaciones de pólizas retrasadas."
                onClick={() => setIsRentalModalOpen(true)}
              >
                <p className="text-[10px] text-slate-500 font-medium">Relief & Advice / Alquiler</p>
              </CaseCard>
            )}
          </div>
        </section>

        {/* Section 2: Case Expectations Tool (Always Visible) */}
        <SettlementCalculator />

        {/* Section 3: Legal Case Builder (Dynamic) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-indigo-600 text-[10px] tracking-[.2em] uppercase">Step 2: Bulletproof Legal Case</h2>
            <ShieldCheck size={16} className="text-indigo-400" />
          </div>
          
          {layout.sections.includes('liability') && (
            <CaseCard 
              title="Liability & Statement" 
              icon={FileText}
              status={caseData?.sections?.liability ? 'completed' : 'incomplete'}
              advice="Firms prioritize cases with a clear Police Report. Include every detail. Think like a recorded statement."
              adviceEs="Las empresas priorizan los casos con un informe policial claro. Piense como una declaración grabada."
              onClick={() => setActiveSection('liability')}
            >
              <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                <MapPin size={12} className="text-indigo-400" />
                {caseData?.intake_data?.loss_location || "Location Not Set / Sin Ubicación"}
              </div>
            </CaseCard>
          )}

          {layout.sections.includes('medical') && (
            <CaseCard 
              title="Medical & MRI" 
              icon={Stethoscope}
              status={caseData?.sections?.treatment ? 'completed' : 'incomplete'}
              advice="Consistency is King. Advise waiting for firm direction before scheduling an MRI (lowers overall costs)."
              adviceEs="La consistencia es clave. Se aconseja esperar la dirección de la firma antes de programar una resonancia."
              onClick={() => setActiveSection('medical')}
            />
          )}

          {layout.sections.includes('photos') && (
            <CaseCard 
              title="Visual Evidence" 
              icon={Camera}
              status={caseData?.sections?.accident_photos ? 'completed' : 'incomplete'}
              advice="Capture skid marks and traffic signs. Label photos as PNC (You) or DEF (Other car)."
              adviceEs="Capture marcas de frenado y señales. Etiquete las fotos como PNC (Usted) o DEF (Otro auto)."
              onClick={() => setActiveSection('photos')}
            />
          )}
        </section>

        {/* Legal Strategy Alert */}
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
          <AlertCircle className="text-amber-600 shrink-0" size={24} />
          <div>
            <h4 className="font-black text-amber-900 text-base mb-1">Don't Get Dropped</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Firms often drop clients who are unresponsive. Checking in twice a week on this dashboard shows you're a serious, high-value client.
            </p>
          </div>
        </div>

        {/* Global Strategy Overlay (En/Es) - THE BI PIVOT */}
        <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter transition-all group-hover:tracking-normal cursor-default">
              Impact Economics / <span className="text-indigo-400">Economía del Impacto</span>
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 bg-indigo-400 rounded-full" />
                <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                  <span className="font-black block text-white mb-1 uppercase tracking-wider">The Texas Energy Link / El Vínculo de Energía</span>
                  In Texas litigation, your vehicle's 'Total Loss' is Proof #1 of a high-energy impact to your body. We doc evidence here to ensure you aren't 'low-balled' on your medical recovery.
                  <span className="block mt-2 font-bold italic text-indigo-300">
                    En los litigios de Texas, el 'Total Loss' de su vehículo es la Prueba #1 de un impacto de alta energía en su cuerpo. Documentamos evidencia aquí para asegurar que no le den una oferta baja.
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
            <ShieldCheck size={160} />
          </div>
        </div>

      </div>

      {/* Input Modal */}
      <CaseInputModal 
        section={activeSection} 
        isOpen={!!activeSection} 
        onClose={() => setActiveSection(null)} 
        onSave={async (data) => {
          const caseRef = doc(db, 'cases', `ttl_${user.uid}`);
          
          if (activeSection === 'liability' && typeof data === 'object' && data.audioBlob) {
            // Upload Voice Recording
            const audioRef = ref(storage, `cases/${user.uid}/fol_${Date.now()}.webm`);
            await uploadBytes(audioRef, data.audioBlob);
            const audioUrl = await getDownloadURL(audioRef);
            
            await updateDoc(caseRef, {
              [`sections.liability.audio_url`]: audioUrl,
              [`sections.liability.description`]: data.text,
              [`sections.liability.updated_at`]: new Date().toISOString()
            });
          } else {
            // Standard text/label save
            await updateDoc(caseRef, {
              [`sections.${activeSection}.value`]: data,
              [`sections.${activeSection}.updated_at`]: new Date().toISOString()
            });
          }
          setActiveSection(null);
        }}
      />
      {/* Support Modals */}
      <RentalSubModal 
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        currentData={caseData?.intake_data?.rental_nuance}
        onSave={async (data) => {
          const caseRef = doc(db, 'cases', `ttl_${user.uid}`);
          await updateDoc(caseRef, { 
            'intake_data.rental_nuance': data,
            'intake_data.needs_rental': data.policy_has_rental || data.liability_accepted === 'accepted'
          });
          setIsRentalModalOpen(false);
        }}
      />

      {/* Bottom Nav Bar (Quick Access) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 px-8 flex justify-between items-center z-50">
        <button className="text-indigo-600 flex flex-col items-center gap-1">
          <ShieldCheck size={24} />
          <span className="text-[10px] font-bold">Case</span>
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-1">
          <History size={24} />
          <span className="text-[10px] font-bold">Logs</span>
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-1">
          <PlusCircle size={24} />
          <span className="text-[10px] font-bold">Upload</span>
        </button>
      </div>
    </div>
  );
};

export default TTLCasePrep;
