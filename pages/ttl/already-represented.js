// pages/ttl/already-represented.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck, Users, ArrowRight, PhoneCall, BookOpen } from 'lucide-react';

export default function AlreadyRepresented() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Head>
        <title>You Have Representation | Texas Total Loss</title>
        <meta name="description" content="Already have an attorney for your Texas accident case? That's great. Here are resources to help you support your case." />
      </Head>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
          <ShieldCheck size={40} className="text-emerald-400" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-black tracking-tight leading-tight uppercase mb-4">
          You're Already<br />
          <span className="text-emerald-400">Protected.</span>
        </h1>
        <p className="text-slate-400 font-medium leading-relaxed mb-2">
          The fact that you have an attorney working on your case is a great sign. That's the most important first step.
        </p>
        <p className="text-slate-500 text-sm italic mb-10">
          Ya tienes un abogado trabajando en tu caso — eso es lo más importante.
        </p>

        {/* Resource Cards */}
        <div className="w-full space-y-4 mb-10">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
            <div className="flex items-start gap-4">
              <BookOpen size={20} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-sm uppercase tracking-wide">Support Your Own Case</p>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  You can still build a stronger case file. Document your daily recovery, keep all medical receipts, and photograph any visible injuries. 
                </p>
                <p className="text-slate-500 text-xs italic mt-1">
                  Documenta tu recuperación diaria. Cada detalle ayuda.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
            <div className="flex items-start gap-4">
              <Users size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-sm uppercase tracking-wide">Know Someone Who Needs Help?</p>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  If a friend or family member was hurt in an similar accident and doesn't have an attorney yet, we can help them get a free rapid case review.
                </p>
                <p className="text-slate-500 text-xs italic mt-1">
                  ¿Tienes un familiar o amigo en una situación similar? Podemos ayudarles.
                </p>
                <button
                  onClick={() => router.push('/ttl/intro')}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Refer Someone <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
            <div className="flex items-start gap-4">
              <PhoneCall size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-sm uppercase tracking-wide">Want a Second Opinion?</p>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  You have the right to get a second opinion at any time — even with an attorney. If something doesn't feel right about your current representation, we can connect you with a review team.
                </p>
                <p className="text-slate-500 text-xs italic mt-1">
                  Tienes el derecho de obtener una segunda opinión en cualquier momento.
                </p>
                <a
                  href="tel:+18005555555"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Call Us <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer nudge */}
        <p className="text-slate-600 text-xs font-medium">
          Texas Total Loss &nbsp;·&nbsp; Powered by PMAction
        </p>

      </main>
    </div>
  );
}
