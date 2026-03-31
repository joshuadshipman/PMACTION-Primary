// pages/ttl/intro.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db, auth } from '../../lib/firebaseClient';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { useApp } from '../../lib/context';
import { 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  Users,
  Stethoscope,
  Info,
  FileText,
  Briefcase,
  UserX
} from 'lucide-react';

const TOTAL_STEPS = 10;

const TTLIntro = () => {
  const router = useRouter();
  const { user } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    has_attorney: null,         // Knock-out #1
    date_of_loss: '',           // Auto-calculates SOL
    estimate_completed: null,
    initial_offer_received: null,
    airbags_deployed: null,
    was_towed: null,
    hit_type: null,
    medical_status: 'none',
    police_report_filed: null,  // New: liability anchor
    other_driver_cited: null,   // New: fault corroboration
    missed_work: null,          // New: economic damages signal
    is_commercial: null,
    is_not_at_fault: null,      // Commitment close - last step
    campaign_id: ''
  });

  useEffect(() => {
    if (router.query.campaign) {
      setFormData(prev => ({ ...prev, campaign_id: router.query.campaign }));
    }
  }, [router.query]);

  // SOL auto-check from date_of_loss
  const getDaysSinceLoss = () => {
    if (!formData.date_of_loss) return null;
    const ms = Date.now() - new Date(formData.date_of_loss).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };

  const handleNext = async () => {
    // Step 1 knock-out: if they already have an attorney, route to info page
    if (step === 1 && formData.has_attorney === true) {
      router.push('/ttl/already-represented');
      return;
    }
    // SOL knock-out: if loss was over 2 years ago
    if (step === 2 && getDaysSinceLoss() > 730) {
      router.push('/ttl/statute-expired');
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep(prev => prev + 1);
    } else {
      setLoading(true);
      try {
        if (!user) {
          router.push(`/login?redirect=/ttl/case-prep&data=${JSON.stringify(formData)}`);
          return;
        }

        const caseRef = doc(db, 'cases', `ttl_${user.uid}`);
        const caseSnap = await getDoc(caseRef);
        const intakePayload = {
          'intake_data.has_attorney': formData.has_attorney,
          'intake_data.date_of_loss': formData.date_of_loss,
          'intake_data.estimate_completed': formData.estimate_completed,
          'intake_data.initial_offer_received': formData.initial_offer_received,
          'intake_data.airbags_deployed': formData.airbags_deployed,
          'intake_data.was_towed': formData.was_towed,
          'intake_data.hit_type': formData.hit_type,
          'intake_data.medical_status': formData.medical_status,
          'intake_data.police_report_filed': formData.police_report_filed,
          'intake_data.other_driver_cited': formData.other_driver_cited,
          'intake_data.missed_work': formData.missed_work,
          'intake_data.is_commercial': formData.is_commercial,
          'intake_data.is_not_at_fault': formData.is_not_at_fault,
          'intake_data.campaign_id': formData.campaign_id || 'direct',
          last_engaged_at: new Date().toISOString()
        };

        if (caseSnap.exists()) {
          await updateDoc(caseRef, intakePayload);
        } else {
          await setDoc(caseRef, {
            userId: user.uid,
            status: 'draft',
            sections: {},
            intake_data: {
              ...formData,
              campaign_id: formData.campaign_id || 'direct',
              source: router.query.source || 'direct',
              willingness_to_treat: true
            },
            impact_logs: [],
            last_engaged_at: new Date().toISOString(),
            nurture_status: 'new'
          });
        }
        router.push('/ttl/case-prep');
      } catch (err) {
        console.error("Error saving intake:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const QuizStep = ({ title, description, icon: Icon, children }) => (
    <div className="flex flex-col h-full justify-between animate-in slide-in-from-right duration-300">
      <div className="space-y-6">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
          <Icon size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight uppercase underline decoration-indigo-200 decoration-8 underline-offset-4">
            {title}
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
        {children}
      </div>
      <button 
        onClick={handleNext}
        disabled={loading}
        className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl mt-8"
      >
        {loading ? 'Processing Case...' : step === TOTAL_STEPS ? 'Review My Rapid Case' : 'Continue'}
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const OptionBtn = ({ label, labelEs, selected, onClick }) => (
    <button 
      onClick={onClick}
      className={`p-6 rounded-3xl text-left border-3 transition-all ${
        selected 
        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
        : 'border-slate-100 hover:border-indigo-200 bg-slate-50'
      }`}
    >
      <p className="font-black text-slate-800 text-lg uppercase leading-tight">{label}</p>
      <p className="text-slate-400 text-sm italic mt-1">{labelEs}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <Head>
        <title>Rapid Case Review | Texas Total Loss</title>
      </Head>

      {/* Progress Header */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-white/80 backdrop-blur-md">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-6 bg-indigo-600' : 'w-3 bg-slate-100'}`}
            />
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {step}/{TOTAL_STEPS}</span>
      </div>

      <main className="max-w-md mx-auto h-screen p-8 pt-24 pb-12 flex flex-col">

        {/* STEP 1: Attorney Knock-out */}
        {step === 1 && (
          <QuizStep 
            title="Representation"
            description="Do you already have an attorney working on this case?"
            icon={UserX}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              <OptionBtn label="Yes, I have an attorney" labelEs="Sí, ya tengo abogado" selected={formData.has_attorney === true} onClick={() => setFormData({ ...formData, has_attorney: true })} />
              <OptionBtn label="No, I'm looking for help" labelEs="No, estoy buscando ayuda" selected={formData.has_attorney === false} onClick={() => setFormData({ ...formData, has_attorney: false })} />
            </div>
          </QuizStep>
        )}

        {/* STEP 2: Date of Loss (SOL check) */}
        {step === 2 && (
          <QuizStep 
            title="Date of Loss"
            description="When did the accident happen? In Texas, evidence collected early is critical to your case."
            icon={Calendar}
          >
            <div className="space-y-6 mt-8">
              <input 
                type="date" 
                max={new Date().toISOString().split('T')[0]}
                value={formData.date_of_loss}
                onChange={(e) => setFormData({ ...formData, date_of_loss: e.target.value })}
                className="w-full p-6 rounded-3xl border-3 border-indigo-600 bg-indigo-50 text-indigo-900 font-black text-xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all uppercase"
              />
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  Texas law gives you 2 years to file a claim. The sooner you act, the stronger the case.
                </p>
              </div>
            </div>
          </QuizStep>
        )}

        {/* STEP 3: Property Estimate */}
        {step === 3 && (
          <QuizStep 
            title="Property Evaluation"
            description="Has the insurance company looked at your vehicle and given you a damage estimate?"
            icon={CheckCircle2}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              <OptionBtn label="Yes, I have an estimate" labelEs="Sí, tengo un presupuesto" selected={formData.estimate_completed === true} onClick={() => setFormData({ ...formData, estimate_completed: true })} />
              <OptionBtn label="No / Not sure yet" labelEs="No / Aún no estoy seguro" selected={formData.estimate_completed === false} onClick={() => setFormData({ ...formData, estimate_completed: false })} />
            </div>
          </QuizStep>
        )}

        {/* STEP 4: Initial Offer */}
        {step === 4 && (
          <QuizStep 
            title="Settlement Offer"
            description="Has an insurance adjuster made you any offer for your vehicle or your injury?"
            icon={DollarSign}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              <OptionBtn label="Yes, an offer was made" labelEs="Sí, se hizo una oferta" selected={formData.initial_offer_received === true} onClick={() => setFormData({ ...formData, initial_offer_received: true })} />
              <OptionBtn label="No offer yet" labelEs="Aún no hay oferta" selected={formData.initial_offer_received === false} onClick={() => setFormData({ ...formData, initial_offer_received: false })} />
            </div>
          </QuizStep>
        )}

        {/* STEP 5: Impact Intensity */}
        {step === 5 && (
          <QuizStep 
            title="Impact Intensity"
            description="How bad was the hit? Check everything that applies."
            icon={Activity}
          >
            <div className="space-y-4 mt-8">
              <div className="flex gap-4">
                {[
                  { label: 'Airbags Deployed', labelEs: 'Airbags Desplegadas', key: 'airbags_deployed' },
                  { label: 'Car was Towed', labelEs: 'Auto Remolcado', key: 'was_towed' }
                ].map(opt => (
                  <button 
                    key={opt.key}
                    onClick={() => setFormData({ ...formData, [opt.key]: !formData[opt.key] })}
                    className={`flex-1 p-5 rounded-3xl text-left border-3 transition-all ${
                      formData[opt.key]
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
                      : 'border-slate-100 hover:border-indigo-200 bg-slate-50'
                    }`}
                  >
                    <p className="font-black text-slate-800 text-sm uppercase leading-tight">{opt.label}</p>
                    <p className="text-slate-400 text-[10px] italic mt-1">{opt.labelEs}</p>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setFormData({ ...formData, hit_type: formData.hit_type === 'heavy' ? null : 'heavy' })}
                className={`w-full p-6 rounded-3xl text-left border-3 transition-all ${
                  formData.hit_type === 'heavy'
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
                  : 'border-slate-100 hover:border-indigo-200 bg-slate-50'
                }`}
              >
                <p className="font-black text-slate-800 text-lg uppercase leading-tight">It was a HEAVY HIT</p>
                <p className="text-slate-400 text-xs italic mt-1">Fue un golpe fuerte</p>
              </button>
            </div>
          </QuizStep>
        )}

        {/* STEP 6: Treatment Status */}
        {step === 6 && (
          <QuizStep 
            title="Treatment Status"
            description="Have you received medical attention, or do you plan to see a doctor?"
            icon={Stethoscope}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              {[
                { label: 'ER / Ambulance', labelEs: 'Emergencias / Ambulancia', val: 'urgent', icon: ShieldCheck },
                { label: 'Currently Treating', labelEs: 'Recibiendo tratamiento', val: 'treating', icon: Activity },
                { label: 'Need Medical Direction', labelEs: 'Necesito dirección médica', val: 'willing', icon: Info },
                { label: 'No Treatment Planned', labelEs: 'Sin tratamiento planificado', val: 'none', icon: AlertCircle }
              ].map(opt => (
                <button 
                  key={opt.label}
                  onClick={() => setFormData({ ...formData, medical_status: opt.val })}
                  className={`p-6 rounded-3xl text-left border-3 transition-all ${
                    formData.medical_status === opt.val 
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
                    : 'border-slate-100 hover:border-indigo-200 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-black text-slate-800 text-lg uppercase leading-tight">{opt.label}</p>
                      <p className="text-slate-400 text-sm italic mt-1">{opt.labelEs}</p>
                    </div>
                    <opt.icon className={formData.medical_status === opt.val ? 'text-indigo-600' : 'text-slate-300'} size={24} />
                  </div>
                </button>
              ))}
            </div>
          </QuizStep>
        )}

        {/* STEP 7: Police Report + Citation */}
        {step === 7 && (
          <QuizStep 
            title="Police Report"
            description="Was a police report filed at the scene?"
            icon={FileText}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              <OptionBtn label="Yes, report was filed" labelEs="Sí, se presentó un informe" selected={formData.police_report_filed === true} onClick={() => setFormData({ ...formData, police_report_filed: true })} />
              <OptionBtn label="No report / Not sure" labelEs="Sin informe / No estoy seguro" selected={formData.police_report_filed === false} onClick={() => setFormData({ ...formData, police_report_filed: false })} />

              {formData.police_report_filed === true && (
                <div className="mt-2 space-y-3">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Was the other driver cited?</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setFormData({ ...formData, other_driver_cited: true })}
                      className={`flex-1 p-4 rounded-2xl border-3 transition-all text-sm font-black uppercase ${formData.other_driver_cited === true ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                      Yes, they got a ticket<br/><span className="text-[10px] italic text-slate-400">Sí, le dieron una multa</span>
                    </button>
                    <button 
                      onClick={() => setFormData({ ...formData, other_driver_cited: false })}
                      className={`flex-1 p-4 rounded-2xl border-3 transition-all text-sm font-black uppercase ${formData.other_driver_cited === false ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                      No ticket issued<br/><span className="text-[10px] italic text-slate-400">No le dieron multa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </QuizStep>
        )}

        {/* STEP 8: Lost Wages */}
        {step === 8 && (
          <QuizStep 
            title="Work Impact"
            description="Did this accident cause you to miss work or affect your ability to do your job?"
            icon={Briefcase}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              <OptionBtn label="Yes — missed work / still out" labelEs="Sí, falté / todavía no puedo trabajar" selected={formData.missed_work === 'yes_ongoing'} onClick={() => setFormData({ ...formData, missed_work: 'yes_ongoing' })} />
              <OptionBtn label="Missed some days, back now" labelEs="Falté algunos días, pero regresé" selected={formData.missed_work === 'yes_returned'} onClick={() => setFormData({ ...formData, missed_work: 'yes_returned' })} />
              <OptionBtn label="No missed work" labelEs="No falté al trabajo" selected={formData.missed_work === 'no'} onClick={() => setFormData({ ...formData, missed_work: 'no' })} />
            </div>
          </QuizStep>
        )}

        {/* STEP 9: Other Party – Commercial */}
        {step === 9 && (
          <QuizStep 
            title="Other Vehicle"
            description="Was the other driver in a company truck, delivery van, or an 18-wheeler?"
            icon={Users}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              <OptionBtn label="Commercial / Company Truck" labelEs="Camión comercial / de empresa" selected={formData.is_commercial === true} onClick={() => setFormData({ ...formData, is_commercial: true })} />
              <OptionBtn label="Personal Vehicle" labelEs="Vehículo personal" selected={formData.is_commercial === false} onClick={() => setFormData({ ...formData, is_commercial: false })} />
            </div>
          </QuizStep>
        )}

        {/* STEP 10: Fault — Commitment Close */}
        {step === 10 && (
          <QuizStep 
            title="Who Was at Fault?"
            description="Based on what happened, who do you believe caused the accident?"
            icon={ShieldCheck}
          >
            <div className="grid grid-cols-1 gap-4 mt-8">
              <OptionBtn label="The other driver was at fault" labelEs="El otro conductor tuvo la culpa" selected={formData.is_not_at_fault === true} onClick={() => setFormData({ ...formData, is_not_at_fault: true })} />
              <OptionBtn label="I may have been at fault" labelEs="Yo podría tener la culpa" selected={formData.is_not_at_fault === false} onClick={() => setFormData({ ...formData, is_not_at_fault: false })} />
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3 mt-4">
              <ShieldCheck className="text-blue-600 shrink-0" size={18} />
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                Personal Injury firms in Texas only handle not-at-fault cases. Your honest answer helps us connect you with the right team.
                <br/><span className="italic text-blue-500">Los bufetes de Texas solo trabajan casos sin culpa.</span>
              </p>
            </div>
          </QuizStep>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-center items-center pointer-events-none opacity-20">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-slate-900" />
          <span className="text-xs font-black tracking-[.2em] uppercase text-slate-900">Texas Total Loss</span>
        </div>
      </footer>
    </div>
  );
};

export default TTLIntro;
