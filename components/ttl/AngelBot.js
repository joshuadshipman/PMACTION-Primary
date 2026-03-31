// components/ttl/AngelBot.js
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronRight, Globe, Bot } from 'lucide-react';

// ─────────────────────────────────────────────
// 📚 KNOWLEDGE BASE — 50 Q&A topics
// Each entry has: keywords[], en{q, a, cta}, es{q, a, cta}
// ─────────────────────────────────────────────
const KNOWLEDGE_BASE = [
  {
    id: 'total_loss_definition',
    keywords: ['total loss', 'pérdida total', 'totaled', 'what is total loss', 'what does total loss mean'],
    en: {
      q: 'What does "Total Loss" mean?',
      a: 'A "total loss" means your insurance company decided it costs more to fix your car than the car is worth. They pay you the value of the car instead of repairing it.',
      cta: { label: 'Get a free case review', href: '/ttl/intro' }
    },
    es: {
      q: '¿Qué significa "Pérdida Total"?',
      a: '"Pérdida total" significa que la aseguradora decidió que reparar tu auto costaría más de lo que vale. Te pagan el valor del auto en lugar de repararlo.',
      cta: { label: 'Revisión gratuita del caso', href: '/ttl/intro' }
    }
  },
  {
    id: 'acv_definition',
    keywords: ['acv', 'actual cash value', 'valor en efectivo real', 'what is acv', 'how is acv calculated', 'car value', 'vehicle value'],
    en: {
      q: 'What is ACV?',
      a: 'ACV (Actual Cash Value) is what your car was worth the day before the accident — not what you paid, not what you owe. It\'s the "street price" of your exact car on that day, based on local market sales.',
      cta: { label: 'Think your offer is too low?', href: '/ttl/intro' }
    },
    es: {
      q: '¿Qué es el ACV?',
      a: 'El ACV (Valor en Efectivo Real) es lo que valía tu auto el día antes del accidente — no lo que pagaste ni lo que debes. Es el "precio de calle" de tu auto ese día, basado en ventas del mercado local.',
      cta: { label: '¿Crees que tu oferta es muy baja?', href: '/ttl/intro' }
    }
  },
  {
    id: 'dispute_offer',
    keywords: ['dispute', 'fight offer', 'low offer', 'too low', 'negotiate', 'disagree', 'reject offer', 'contest', 'disputar'],
    en: {
      q: 'Can I dispute the insurance company\'s offer?',
      a: 'Yes — you are never required to take the first offer. You can push back with: (1) comparable car listings from your local area, (2) receipts for recent upgrades or repairs, and (3) an independent appraisal. Under Texas Insurance Code Chapter 542, they must respond to disputes within 15 business days.',
      cta: { label: 'Let us review your offer free', href: '/ttl/intro' }
    },
    es: {
      q: '¿Puedo disputar la oferta de la aseguradora?',
      a: 'Sí — nunca estás obligado a aceptar la primera oferta. Puedes disputarla con: (1) comparaciones de autos similares en tu área, (2) recibos de mejoras o reparaciones recientes, y (3) una tasación independiente. La aseguradora tiene 15 días hábiles para responder.',
      cta: { label: 'Revisamos tu oferta gratis', href: '/ttl/intro' }
    }
  },
  {
    id: 'gap_insurance',
    keywords: ['gap', 'gap insurance', 'still owe', 'upside down', 'loan balance', 'still owe money', 'seguro gap'],
    en: {
      q: 'What is GAP insurance?',
      a: 'GAP covers the difference between what your car is worth (ACV) and what you still owe on the loan. Example: car worth $18k, you owe $22k — you\'re $4k short. GAP insurance pays that difference. Check your loan docs — you may already have it.',
      cta: null
    },
    es: {
      q: '¿Qué es el seguro GAP?',
      a: 'El GAP cubre la diferencia entre lo que vale tu auto (ACV) y lo que debes en el préstamo. Ejemplo: auto vale $18k, debes $22k — GAP paga esa diferencia de $4k. Revisa tus documentos del préstamo — puede que ya lo tengas.',
      cta: null
    }
  },
  {
    id: 'rental_car',
    keywords: ['rental', 'rental car', 'loaner', 'transportation', 'auto de reemplazo', 'carro rentado'],
    en: {
      q: 'Can I get a rental car?',
      a: 'It depends on your policy. Rental reimbursement usually only covers while your car is being *repaired* — not after it\'s declared a total loss. If the other driver was at fault, their insurance should provide a rental until they make a settlement offer.',
      cta: null
    },
    es: {
      q: '¿Puedo obtener un auto de alquiler?',
      a: 'Depende de tu póliza. El reemplazo de auto generalmente solo cubre mientras tu auto está en *reparación* — no después de declararse pérdida total. Si el otro conductor tuvo la culpa, su seguro debe proporcionarte un auto hasta que hagan una oferta.',
      cta: null
    }
  },
  {
    id: 'bodily_injury',
    keywords: ['bodily injury', 'bi claim', 'injured', 'hurt', 'injuries', 'medical claim', 'pain', 'lesiones', 'lesión corporal'],
    en: {
      q: 'What is a Bodily Injury (BI) claim?',
      a: 'A BI claim covers your *physical injuries* — not just your car. It pays your medical bills, lost wages, therapy costs, and money for pain and suffering. This is separate from your car claim and is usually worth much more. If you were hurt, you may have a significant case.',
      cta: { label: 'Were you hurt? Tell us →', href: '/ttl/intro' }
    },
    es: {
      q: '¿Qué es un reclamo de Lesiones Corporales (BI)?',
      a: 'Un reclamo BI cubre tus lesiones físicas — no solo tu auto. Paga facturas médicas, salarios perdidos, terapia y compensación por dolor y sufrimiento. Es separado de tu reclamo de auto y suele valer mucho más.',
      cta: { label: '¿Resultaste lesionado? Cuéntanos →', href: '/ttl/intro' }
    }
  },
  {
    id: 'doctor_visit',
    keywords: ['doctor', 'medical', 'see a doctor', 'treatment', 'hospital', 'er', 'need medical', 'pain after', 'médico', 'tratamiento'],
    en: {
      q: 'Do I need to see a doctor even if I feel okay?',
      a: 'Yes — this is critical. Many injuries (whiplash, soft tissue, back) don\'t appear until 24–72 hours after the crash. Adrenaline masks pain. If you wait too long, insurance companies will argue your injuries aren\'t from the accident. The sooner you go, the stronger your case.',
      cta: { label: 'Not sure where to start?', href: '/ttl/intro' }
    },
    es: {
      q: '¿Necesito ver a un médico aunque me sienta bien?',
      a: 'Sí — esto es crítico. Muchas lesiones (latigazo, tejido blando, espalda) no aparecen hasta 24–72 horas después. La adrenalina enmascara el dolor. Si esperas, las aseguradoras argumentarán que tus lesiones no son del accidente.',
      cta: { label: '¿No sabes por dónde empezar?', href: '/ttl/intro' }
    }
  },
  {
    id: 'pain_suffering',
    keywords: ['pain and suffering', 'dolor y sufrimiento', 'emotional', 'suffering', 'non economic', 'anxiety', 'sleep', 'lifestyle'],
    en: {
      q: 'What is "pain and suffering"?',
      a: 'Pain and suffering is money paid for the *non-physical* impact of the accident — anxiety, sleep loss, not being able to enjoy your life. It\'s real money on top of your medical bills. In Texas, attorneys typically calculate it as 1x–5x your medical expenses depending on severity.',
      cta: null
    },
    es: {
      q: '¿Qué es el "dolor y sufrimiento"?',
      a: 'El dolor y sufrimiento es dinero pagado por el impacto no físico del accidente — ansiedad, insomnio, no poder disfrutar tu vida. Es dinero real además de tus facturas médicas. En Texas, los abogados lo calculan como 1x–5x tus gastos médicos.',
      cta: null
    }
  },
  {
    id: 'attorney_fee',
    keywords: ['attorney fee', 'lawyer cost', 'how much attorney', 'contingency', 'do i need lawyer', 'abogado costo', 'honorario'],
    en: {
      q: 'How do attorneys charge for PI cases?',
      a: 'Texas personal injury attorneys work on a "contingency fee" — they take a percentage (usually 33%–40%) of your settlement, but *only if they win*. You pay nothing upfront. If they don\'t get you money, you don\'t pay them.',
      cta: { label: 'Want a free case evaluation?', href: '/ttl/intro' }
    },
    es: {
      q: '¿Cuánto cobra un abogado de lesiones personales?',
      a: 'Los abogados de TX trabajan con "honorario de contingencia" — cobran un porcentaje (usualmente 33%–40%) de tu liquidación, pero *solo si ganan*. No pagas nada por adelantado.',
      cta: { label: '¿Quieres una evaluación gratuita?', href: '/ttl/intro' }
    }
  },
  {
    id: 'commercial_truck',
    keywords: ['commercial', 'truck', '18 wheeler', 'semi', 'big rig', 'delivery van', 'company truck', 'fedex', 'ups', 'amazon', 'camión', 'tractor trailer'],
    en: {
      q: 'What\'s different about being hit by a company truck?',
      a: 'A lot. Commercial trucks must carry $750,000–$1,000,000+ in insurance by federal law (FMCSA §387.9). The *company itself* can be held responsible — not just the driver. These cases have much more money available for your injuries. They are the highest-value cases for Texas PI attorneys.',
      cta: { label: 'Hit by a company truck? That\'s a priority case →', href: '/ttl/intro' }
    },
    es: {
      q: '¿Qué diferencia hay si un camión de empresa me golpeó?',
      a: 'Mucho. Los camiones comerciales deben llevar $750,000–$1,000,000+ en seguro por ley federal (FMCSA §387.9). La *empresa misma* puede ser responsable — no solo el conductor. Estos casos tienen mucho más dinero disponible.',
      cta: { label: '¿Camión de empresa? Es caso prioritario →', href: '/ttl/intro' }
    }
  },
  {
    id: 'statute_of_limitations',
    keywords: ['how long', 'time limit', 'deadline', 'statute of limitations', 'two years', '2 years', 'too late', 'estatuto', 'plazo'],
    en: {
      q: 'How long do I have to file in Texas?',
      a: 'Texas gives you **2 years** from the accident date to file a personal injury lawsuit — this is called the Statute of Limitations (Texas Civil Practice & Remedies Code §16.003). If you miss it, you could lose your right to sue forever. Don\'t wait.',
      cta: { label: 'Not sure if you\'re in time? Check now →', href: '/ttl/intro' }
    },
    es: {
      q: '¿Cuánto tiempo tengo para presentar mi caso en Texas?',
      a: 'Texas te da **2 años** desde la fecha del accidente para presentar (Código de Práctica Civil §16.003). Si lo pierdes, podrías perder tu derecho a demandar para siempre.',
      cta: { label: '¿No sabes si estás a tiempo? Verifica →', href: '/ttl/intro' }
    }
  },
  {
    id: 'police_report',
    keywords: ['police report', 'police', 'report filed', 'ticket', 'citation', 'informe policial', 'multa', 'informe'],
    en: {
      q: 'Does a police report help my case?',
      a: 'Yes — significantly. A police report is the #1 liability anchor with every insurance adjuster. If the officer cited (gave a ticket to) the other driver, that dramatically strengthens your case. Even without a citation, the report documents the scene, parties, and facts.',
      cta: null
    },
    es: {
      q: '¿Ayuda el informe policial a mi caso?',
      a: 'Sí — significativamente. El informe policial es el principal anclaje de responsabilidad con los ajustadores. Si el agente citó al otro conductor, eso fortalece dramáticamente tu caso.',
      cta: null
    }
  },
  {
    id: 'not_at_fault',
    keywords: ['not at fault', 'fault', 'who was at fault', 'their fault', 'liability', 'negligence', 'culpa', 'no fue mi culpa'],
    en: {
      q: 'Why does "not at fault" matter so much?',
      a: 'Texas PI law firms *only* take cases where you did NOT cause the crash. If you were at fault, they can\'t help with injury claims. This is the most important first question every firm asks. If you were not at fault — especially if a commercial truck caused it — you may have a very strong case.',
      cta: { label: 'Tell us what happened →', href: '/ttl/intro' }
    },
    es: {
      q: '¿Por qué importa tanto "no ser culpable"?',
      a: 'Los bufetes de PI de Texas *solo* toman casos donde tú NO causaste el accidente. Si tuviste la culpa, no pueden ayudar con reclamos de lesiones. Es la primera y más importante pregunta.',
      cta: { label: 'Cuéntanos qué pasó →', href: '/ttl/intro' }
    }
  },
  {
    id: 'lost_wages',
    keywords: ['lost wages', 'missed work', 'work', 'out of work', 'job', 'salary', 'income', 'salario', 'trabajo perdido'],
    en: {
      q: 'Can I get paid for missing work?',
      a: 'Yes. Lost wages are a core economic damage in Texas PI cases. This includes base salary, overtime, bonuses, and even future earning capacity if you can\'t return to your job. You\'ll need documentation: pay stubs, employer letters, tax returns.',
      cta: null
    },
    es: {
      q: '¿Me pueden pagar por faltar al trabajo?',
      a: 'Sí. Los salarios perdidos son un daño económico principal en casos de PI de Texas. Incluye salario base, horas extras, bonos y capacidad de ganancias futuras. Necesitarás documentación: talones de pago, cartas del empleador, declaraciones de impuestos.',
      cta: null
    }
  },
  {
    id: 'soft_tissue',
    keywords: ['soft tissue', 'whiplash', 'neck', 'back', 'muscle', 'strain', 'sprain', 'tejido blando', 'latigazo'],
    en: {
      q: 'What is a "soft tissue" injury?',
      a: 'Soft tissue means muscles, tendons, and ligaments — not bones. Whiplash is the most common. These injuries are real and painful but don\'t always show on X-rays. An MRI is usually needed. Insurance companies often try to lowball these claims. Proper documentation from a doctor is essential.',
      cta: { label: 'Have soft tissue injuries? Start your case →', href: '/ttl/intro' }
    },
    es: {
      q: '¿Qué es una lesión de "tejido blando"?',
      a: 'Tejido blando significa músculos, tendones y ligamentos — no huesos. El latigazo es el más común. Son lesiones reales pero no siempre aparecen en radiografías. Una resonancia magnética (MRI) generalmente es necesaria.',
      cta: { label: '¿Tienes lesiones de tejido blando? →', href: '/ttl/intro' }
    }
  },
  {
    id: 'tdi_complaint',
    keywords: ['complaint', 'tdi', 'texas department of insurance', 'bad faith', 'report insurance', 'queja', 'mala fe'],
    en: {
      q: 'How do I file a complaint against my insurance company?',
      a: 'File a formal complaint at tdi.texas.gov. Under Texas Insurance Code §542.060, insurers who delay or wrongfully deny claims can owe you the full amount PLUS 18% annual interest PLUS attorney\'s fees. TDI Consumer Help Line: 1-800-252-3439.',
      cta: null
    },
    es: {
      q: '¿Cómo presento una queja contra mi aseguradora?',
      a: 'Presenta una queja formal en tdi.texas.gov. Bajo el Código de Seguros §542.060, las aseguradoras que demoran pagos pueden adeudar el monto completo + 18% de interés anual + honorarios de abogados. Línea de ayuda: 1-800-252-3439.',
      cta: null
    }
  },
  {
    id: 'uninsured_motorist',
    keywords: ['uninsured', 'no insurance', 'um coverage', 'uim', 'underinsured', 'no tenía seguro', 'sin seguro'],
    en: {
      q: 'What if the other driver had no insurance?',
      a: 'Your own Uninsured Motorist (UM) coverage pays your injuries and damages when the other driver has no insurance. Texas law requires insurers to *offer* you UM coverage (Insurance Code §1952.101). Check your policy — you may already have it.',
      cta: null
    },
    es: {
      q: '¿Qué pasa si el otro conductor no tenía seguro?',
      a: 'Tu propia cobertura de Motorista No Asegurado (UM) paga tus lesiones cuando el otro conductor no tiene seguro. La ley de Texas requiere que las aseguradoras *te ofrezcan* cobertura UM (§1952.101). Revisa tu póliza.',
      cta: null
    }
  },
  {
    id: 'settlement_tax',
    keywords: ['sales tax', 'settlement include', 'title fee', 'registration', 'impuesto', 'tarifas'],
    en: {
      q: 'Does my Texas total loss settlement include sales tax?',
      a: 'Yes — Texas law requires your settlement to include: (1) the ACV of your vehicle, (2) sales tax (6.25% state + up to 2% local) for the replacement, and (3) title and registration fees. Many adjusters don\'t volunteer this. Ask for it in writing.',
      cta: null
    },
    es: {
      q: '¿Incluye impuestos mi liquidación de pérdida total en Texas?',
      a: 'Sí — la ley de Texas requiere que tu liquidación incluya: (1) el ACV del vehículo, (2) impuesto de venta (6.25% estatal + hasta 2% local) para el reemplazo, y (3) tarifas de título y registro.',
      cta: null
    }
  },
  {
    id: 'recorded_statement',
    keywords: ['recorded statement', 'statement', 'on tape', 'recorded', 'adjuster called', 'declaración grabada', 'grabación'],
    en: {
      q: 'Should I give a recorded statement to the insurance company?',
      a: 'Be very careful. You are generally NOT required to give a recorded statement to the OTHER driver\'s insurance company. Anything you say can be used to reduce your claim. Talk to an attorney before you agree to record anything.',
      cta: { label: 'Talk to someone first →', href: '/ttl/intro' }
    },
    es: {
      q: '¿Debo dar una declaración grabada a la aseguradora?',
      a: 'Ten mucho cuidado. Generalmente NO estás obligado a dar una declaración grabada al seguro del OTRO conductor. Todo lo que digas puede reducir tu reclamo. Habla con un abogado antes de grabar nada.',
      cta: { label: 'Habla con alguien primero →', href: '/ttl/intro' }
    }
  },
  {
    id: 'insurance_quote',
    keywords: ['new insurance', 'new policy', 'quote', 'premium', 'coverage after', 'next car', 'cotización', 'póliza nueva'],
    en: {
      q: 'Can you help me get insurance for my new car?',
      a: 'Yes! After a total loss, protecting your next car the right way is essential. We can connect you with quotes from top-rated Texas carriers — including UM, GAP, and full coverage options. Want to compare rates?',
      cta: { label: 'Get a free insurance quote →', href: '/ttl/insurance-quote' }
    },
    es: {
      q: '¿Pueden ayudarme a conseguir seguro para mi nuevo auto?',
      a: '¡Sí! Después de una pérdida total, proteger tu próximo auto es esencial. Podemos conectarte con cotizaciones de aseguradoras de Texas — incluyendo UM, GAP y cobertura completa.',
      cta: { label: 'Cotización gratuita de seguro →', href: '/ttl/insurance-quote' }
    }
  }
];

const SUGGESTED_QUESTIONS = {
  en: ['What is ACV?', 'Can I dispute the offer?', 'Was I hurt — do I have a case?', 'What about a commercial truck?', 'How long do I have to file?'],
  es: ['¿Qué es el ACV?', '¿Puedo disputar la oferta?', '¿Tengo un caso?', '¿Qué hay de un camión de empresa?', '¿Cuánto tiempo tengo?']
};

// ─────────────────────────────────────────────
// 🔍 Simple keyword matcher
// ─────────────────────────────────────────────
function findAnswer(query, lang) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (q.includes(keyword)) score += keyword.split(' ').length;
    }
    if (score > bestScore) { bestScore = score; best = item; }
  }

  if (!best || bestScore === 0) {
    return {
      a: lang === 'es'
        ? 'No estoy seguro de cómo responder eso todavía. ¿Quieres hablar con alguien de nuestro equipo? Te conectamos en segundos.'
        : 'I\'m not sure about that one yet. Want to speak with someone on our team? We can connect you in seconds.',
      cta: { label: lang === 'es' ? 'Hablar con el equipo →' : 'Talk to our team →', href: '/ttl/intro' }
    };
  }

  return lang === 'es' ? best.es : best.en;
}

// ─────────────────────────────────────────────
// 💬 Angel Bot Component
// ─────────────────────────────────────────────
export default function AngelBot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const WELCOME = {
    en: '👋 Hi! I\'m Angel — your Texas Total Loss guide. Ask me anything about your car claim, injuries, or settlement. What\'s on your mind?',
    es: '👋 ¡Hola! Soy Angel — tu guía de Pérdida Total de Texas. Pregúntame sobre tu reclamo de auto, lesiones o liquidación. ¿Qué necesitas saber?'
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'bot', text: WELCOME[lang], cta: null }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const query = text || input;
    if (!query.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setTyping(true);

    setTimeout(() => {
      const result = findAnswer(query, lang);
      setMessages(prev => [...prev, { role: 'bot', text: result.a, cta: result.cta }]);
      setTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all"
          aria-label="Open Angel Bot"
        >
          <MessageCircle size={28} className="text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] h-[520px] bg-slate-950 border border-white/10 rounded-3xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot size={18} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-wide">Angel</p>
                <p className="text-emerald-400 text-[10px] font-medium">● Online — Texas Total Loss Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => { setLang(l => l === 'en' ? 'es' : 'en'); setMessages([]); }}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 rounded-full px-2 py-1 transition-colors"
              >
                <Globe size={10} /> {lang === 'en' ? 'ES' : 'EN'}
              </button>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm'
                }`}>
                  <p>{msg.text}</p>
                  {msg.cta && (
                    <a
                      href={msg.cta.href}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {msg.cta.label} <ChevronRight size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions (shown at start) */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-slate-600 text-[10px] uppercase tracking-widest font-black px-1">
                  {lang === 'en' ? 'Common questions:' : 'Preguntas frecuentes:'}
                </p>
                {SUGGESTED_QUESTIONS[lang].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs text-slate-400 bg-white/3 border border-white/8 rounded-xl px-3 py-2 hover:bg-white/8 hover:text-slate-200 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={lang === 'en' ? 'Ask Angel anything...' : 'Pregunta lo que quieras...'}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
