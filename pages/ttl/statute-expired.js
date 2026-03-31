// pages/ttl/statute-expired.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Clock, AlertCircle, ArrowRight, PhoneCall, Info } from 'lucide-react';

export default function StatuteExpired() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Head>
        <title>Important Time Limit Information | Texas Total Loss</title>
        <meta name="description" content="Texas law has a 2-year time limit for personal injury claims. Learn about exceptions and how to proceed." />
      </Head>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
          <Clock size={40} className="text-amber-400" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-black tracking-tight leading-tight uppercase mb-4">
          Let's Talk About<br />
          <span className="text-amber-400">Your Timeline.</span>
        </h1>
        <p className="text-slate-400 font-medium leading-relaxed mb-2">
          In Texas, most personal injury claims have a <strong className="text-white">2-year deadline</strong> to file — called the Statute of Limitations. Based on the date you entered, that window may have passed.
        </p>
        <p className="text-slate-500 text-sm italic mb-10">
          En Texas, la mayoría de los reclamos de lesiones personales tienen un plazo de <strong className="text-slate-300">2 años</strong> para presentarse — llamado el Estatuto de Limitaciones.
        </p>

        {/* Alert */}
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 text-left mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-300 text-sm uppercase tracking-wide">Don't Close This Page Yet</p>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                There are <strong className="text-white">legal exceptions</strong> that can extend this deadline in certain situations. A quick conversation with our team can confirm if any exceptions apply to your case — at <strong className="text-white">no cost to you.</strong>
              </p>
              <p className="text-slate-500 text-xs italic mt-2">
                Existen <strong className="text-slate-400">excepciones legales</strong> que pueden extender este plazo. Una conversación rápida con nuestro equipo puede confirmar si aplica alguna excepción a tu caso.
              </p>
            </div>
          </div>
        </div>

        {/* Exception Cards */}
        <div className="w-full space-y-3 mb-10">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-left">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-xs uppercase tracking-wide mb-1">The "Discovery Rule" Exception</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  If your injury wasn't discovered right away (like a slow-developing back injury), the 2-year clock may start from when you *discovered* the injury, not the accident date.
                </p>
                <p className="text-slate-600 text-[10px] italic mt-1">La regla del "descubrimiento" — el plazo puede comenzar cuando *descubriste* la lesión.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-left">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-xs uppercase tracking-wide mb-1">Government Vehicle Exception</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  If a government-owned vehicle (city bus, police car, state truck) was involved, special notice deadlines apply — and they are often shorter than 2 years, but they have separate rules.
                </p>
                <p className="text-slate-600 text-[10px] italic mt-1">Vehículo gubernamental: se aplican plazos especiales de notificación.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-left">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-xs uppercase tracking-wide mb-1">Minor / Incapacitated Plaintiff</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  If the injured person was a minor (under 18) or was mentally incapacitated at the time of the accident, the 2-year clock may not start until they turn 18 or regain capacity.
                </p>
                <p className="text-slate-600 text-[10px] italic mt-1">Si el lesionado era menor de edad o estaba incapacitado, el plazo puede ser diferente.</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('tel:+18005555555')}
          className="w-full bg-amber-500 text-slate-950 py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl mb-4"
        >
          <PhoneCall size={18} />
          Talk to Someone Now — Free
        </button>
        <p className="text-slate-600 text-xs italic">
          Habla con alguien ahora — sin costo
        </p>

        <button
          onClick={() => router.push('/ttl')}
          className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
        >
          Back to Start <ArrowRight size={14} />
        </button>

        {/* Footer */}
        <p className="text-slate-700 text-xs font-medium mt-10">
          Texas Total Loss &nbsp;·&nbsp; Not legal advice. For educational purposes only.
        </p>

      </main>
    </div>
  );
}
