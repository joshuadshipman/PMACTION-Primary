// pages/ttl/insurance-quote.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Shield, CheckCircle2, ChevronRight, Car, AlertCircle, Star, Lock } from 'lucide-react';
import { db } from '../../lib/firebaseClient';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const COVERAGE_OPTIONS = [
  { id: 'full', label: 'Full Coverage', labelEs: 'Cobertura Completa', desc: 'Liability + Collision + Comprehensive', recommended: true },
  { id: 'liability', label: 'Liability Only', labelEs: 'Solo Responsabilidad Civil', desc: 'State minimum — meets legal requirement', recommended: false },
  { id: 'gap', label: 'Full Coverage + GAP', labelEs: 'Cobertura Completa + GAP', desc: 'Best choice if you have a car loan', recommended: false },
];

const REASONS = [
  { icon: Shield, title: 'Better Coverage', titleEs: 'Mejor Cobertura', desc: 'You now know exactly what happens with the wrong policy.' },
  { icon: Car, title: 'New Vehicle', titleEs: 'Vehículo Nuevo', desc: 'New car means new coverage needs — often at a lower rate.' },
  { icon: CheckCircle2, title: 'Texas Experts', titleEs: 'Expertos en Texas', desc: 'We connect you with carriers who know Texas law.' },
];

export default function InsuranceQuote() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    coverage_type: '',
    zip_code: '',
    full_name: '',
    phone: '',
    has_loan: null,
    wants_gap: null,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'insurance_leads'), {
        ...form,
        source: 'ttl_post_case',
        created_at: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Insurance lead error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 text-white font-sans">
      <Head>
        <title>Get Auto Insurance After a Total Loss | Texas Total Loss</title>
        <meta name="description" content="After a Texas total loss claim, make sure your new car is properly covered. Compare quotes from top-rated Texas carriers — UM, GAP, and full coverage options." />
      </Head>

      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <button onClick={() => router.back()} className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-slate-300 transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <Lock size={12} className="text-slate-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Form</span>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-6 py-10">

        {submitted ? (
          /* ── CONFIRMATION ── */
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">You're All Set!</h1>
            <p className="text-slate-400 leading-relaxed">
              A licensed Texas insurance specialist will contact you within <strong className="text-white">24 hours</strong> with personalized quotes. No pressure, no obligation.
            </p>
            <p className="text-slate-600 text-sm italic">Un especialista se comunicará contigo en 24 horas con cotizaciones personalizadas.</p>
            <button onClick={() => router.push('/ttl/intro')} className="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black text-sm tracking-widest uppercase hover:bg-indigo-500 transition-all mt-4">
              Start a New Case Review →
            </button>
          </div>
        ) : (
          <>
            {/* ── HERO ── */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
                <Star size={12} className="text-indigo-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Post-Total Loss Service</span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tight leading-tight mb-3">
                Protect Your<br /><span className="text-indigo-400">Next Car Right.</span>
              </h1>
              <p className="text-slate-400 leading-relaxed">
                You've been through a total loss. Now you know exactly what the wrong coverage costs. Let's make sure your new vehicle is fully protected from day one.
              </p>
              <p className="text-slate-600 text-sm italic mt-2">
                Protege tu próximo auto desde el primer día — con la cobertura correcta.
              </p>
            </div>

            {/* ── WHY CARDS ── */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {REASONS.map(r => (
                <div key={r.title} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
                  <r.icon size={20} className="text-indigo-400 mx-auto mb-2" />
                  <p className="text-white font-black text-[11px] uppercase leading-tight">{r.title}</p>
                  <p className="text-slate-500 text-[10px] italic mt-0.5">{r.titleEs}</p>
                </div>
              ))}
            </div>

            {/* ── FORM ── */}
            <div className="space-y-5">

              {/* Vehicle Info */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Your New Vehicle</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'vehicle_year', placeholder: 'Year / Año', type: 'number' },
                    { key: 'vehicle_make', placeholder: 'Make / Marca', type: 'text' },
                    { key: 'vehicle_model', placeholder: 'Model / Modelo', type: 'text' },
                  ].map(f => (
                    <input
                      key={f.key}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  ))}
                </div>
              </div>

              {/* Coverage Type */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Coverage Needed</p>
                <div className="space-y-2">
                  {COVERAGE_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => set('coverage_type', c.id)}
                      className={`w-full p-4 rounded-2xl text-left border transition-all ${
                        form.coverage_type === c.id
                          ? 'border-indigo-500/60 bg-indigo-500/10'
                          : 'border-white/8 bg-white/3 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-white text-sm uppercase">{c.label}</p>
                          <p className="text-slate-500 text-xs italic">{c.labelEs}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{c.desc}</p>
                        </div>
                        {c.recommended && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                            Recommended
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan Check */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Do you have a car loan on the new vehicle?</p>
                <div className="flex gap-3">
                  {[
                    { val: true, label: 'Yes — Financed', labelEs: 'Sí, tiene préstamo' },
                    { val: false, label: 'No — Paid Cash', labelEs: 'No, pagué en efectivo' },
                  ].map(o => (
                    <button
                      key={String(o.val)}
                      onClick={() => set('has_loan', o.val)}
                      className={`flex-1 p-4 rounded-2xl border text-sm font-black uppercase transition-all ${
                        form.has_loan === o.val
                          ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                          : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {o.label}<br /><span className="text-[10px] italic font-normal normal-case text-slate-500">{o.labelEs}</span>
                    </button>
                  ))}
                </div>
                {form.has_loan === true && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex gap-2">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200 leading-relaxed">
                      <strong>Heads up:</strong> Since you have a loan, your lender requires Full Coverage AND we strongly recommend adding <strong>GAP insurance</strong> — so you're never stuck like last time. <span className="italic text-amber-400">Tu prestamista requiere cobertura completa + GAP.</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Where Should We Send Your Quotes?</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name / Nombre Completo"
                    value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <div className="flex gap-3">
                    <input
                      type="tel"
                      placeholder="Phone / Teléfono"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      maxLength={5}
                      value={form.zip_code}
                      onChange={e => set('zip_code', e.target.value)}
                      className="w-28 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !form.full_name || !form.phone || !form.zip_code || !form.coverage_type}
                className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
              >
                {loading ? 'Sending...' : 'Get My Free Quotes'}
                <ChevronRight size={18} />
              </button>
              <p className="text-center text-[10px] text-slate-600 font-medium">
                No spam. No commitment. A licensed agent will call within 24 hours.<br />
                <span className="italic">Sin spam. Sin compromiso. Un agente licenciado llamará en 24 horas.</span>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
