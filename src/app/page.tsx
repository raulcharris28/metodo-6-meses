'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlayCircle, CheckCircle2, BookOpen, Clock, Users, Star,
  X, Loader2, Headphones, Brain, MessageCircle, Mic, Quote,
  ShieldCheck, Zap, BarChart3, ChevronDown, ChevronUp,
  Briefcase, GraduationCap, Globe2, Baby, Plane, Heart
} from 'lucide-react';
import styles from './page.module.css';

// ─── Data ───────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Carlos Mendoza',
    country: '🇲🇽 México',
    role: 'Ingeniero de Software',
    stars: 5,
    text: 'Llevaba años intentando aprender inglés con apps y cursos de gramática sin ningún resultado. En 3 meses ya pude tener mi primera conversación real en una entrevista de trabajo. Ahora trabajo para una empresa de Estados Unidos.',
    imgX: 0,
  },
  {
    name: 'Valentina Ríos',
    country: '🇨🇴 Colombia',
    role: 'Estudiante de Medicina',
    stars: 5,
    text: 'Lo que más me sorprendió es que puedo estudiar mientras voy al hospital en el bus. Son 30 minutos al día que antes perdía. El método de escuchar y repetir en voz alta funciona increíblemente bien.',
    imgX: 1,
  },
  {
    name: 'Andrés Fuentes',
    country: '🇦🇷 Argentina',
    role: 'Emprendedor, 45 años',
    stars: 5,
    text: 'Pensé que era demasiado mayor para aprender un idioma. Este método demostró que estaba equivocado. No memorizas reglas, simplemente escuchas y tu cerebro aprende solo. Al sexto mes ya leía artículos en inglés sin dificultad.',
    imgX: 2,
  },
  {
    name: 'María González',
    country: '🇪🇸 España',
    role: 'Diseñadora Gráfica',
    stars: 5,
    text: 'Probé Duolingo, academias, YouTube... Nada funcionaba. Con el Método 6 Meses entendí por primera vez cómo funciona realmente el idioma. No te enseñan a traducir, te enseñan a PENSAR en inglés.',
    imgX: 3,
  },
  {
    name: 'Diego Paredes',
    country: '🇵🇪 Perú',
    role: 'Contador Público',
    stars: 5,
    text: 'Necesitaba el inglés para una certificación internacional y tenía solo 5 meses. Seguí el método al pie de la letra y pasé el examen. Mi oído mejoró tan rápido que me sorprendí a mí mismo.',
    imgX: 4,
  },
  {
    name: 'Lucía Hernández',
    country: '🇻🇪 Venezuela',
    role: 'Ejecutiva de Ventas',
    stars: 5,
    text: 'Con 3 hijos no tenía tiempo para clases. Este método encajó perfecto en mi vida: 30 minutos mientras preparaba el desayuno. Seis meses después negocio en inglés con clientes en Miami sin problemas.',
    imgX: 5,
  },
];

const METHODOLOGY_STEPS = [
  { icon: <Headphones size={28} />, color: '#38bdf8', bg: 'rgba(14,165,233,0.12)', title: 'Escucha Activa', desc: 'Tu cerebro procesa patrones del idioma de forma natural, igual que un niño aprende su lengua materna, sin necesidad de traducir.' },
  { icon: <Mic size={28} />, color: '#34d399', bg: 'rgba(16,185,129,0.12)', title: 'Producción Oral', desc: 'Respondes en voz alta usando lo que acabas de escuchar. La producción inmediata ancla las estructuras en tu memoria muscular.' },
  { icon: <Brain size={28} />, color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', title: 'Repetición Espaciada', desc: 'El sistema revisa el vocabulario en el momento exacto en que tu mente está a punto de olvidarlo. Científicamente probado.' },
  { icon: <MessageCircle size={28} />, color: '#fb923c', bg: 'rgba(251,146,60,0.12)', title: 'Comprensión Lectora', desc: 'En la segunda fase refuerzas con diálogos escritos para conectar la comprensión auditiva con la lectura de forma completa.' },
];

const FOR_WHO = [
  { icon: <Briefcase size={24} />, label: 'Profesionales', desc: 'que buscan un ascenso o trabajo internacional' },
  { icon: <GraduationCap size={24} />, label: 'Estudiantes', desc: 'que quieren certificaciones o intercambios' },
  { icon: <Baby size={24} />, label: 'Papás y mamás', desc: 'con poco tiempo libre para clases presenciales' },
  { icon: <Globe2 size={24} />, label: 'Emprendedores', desc: 'que quieren expandir su negocio al mercado anglosajón' },
  { icon: <Plane size={24} />, label: 'Viajeros', desc: 'que quieren viajar sin barreras de idioma' },
  { icon: <Heart size={24} />, label: 'Adultos mayores', desc: 'que quieren demostrar que nunca es tarde para aprender' },
];

const FAQS = [
  { q: '¿Necesito tener conocimientos previos de inglés?', a: 'No. El método está diseñado desde cero. Desde el primer día empezarás a escuchar y producir inglés básico de forma natural. No se requiere ningún nivel previo.' },
  { q: '¿Cuánto tiempo debo dedicar cada día?', a: 'Exactamente 30 minutos al día. Ese es el tiempo óptimo para que tu cerebro asimile sin saturarse. Puedes hacerlo mientras manejas, haces ejercicio o en cualquier momento del día.' },
  { q: '¿Qué pasa si un día no puedo estudiar?', a: 'No hay problema. El método es flexible. Si un día fallas, simplemente retoma al siguiente. Lo importante es la consistencia a largo plazo, no la perfección diaria.' },
  { q: '¿Cómo accedo al contenido después de pagar?', a: 'Inmediatamente. Al confirmar tu pago, recibirás tu correo y contraseña temporal automáticamente. Con esas credenciales puedes entrar a la plataforma en segundos.' },
  { q: '¿Puedo acceder desde mi celular?', a: 'Sí. La plataforma funciona perfectamente en cualquier dispositivo: computador, celular o tablet. Los audios están optimizados para reproducirse sin conexión a internet.' },
  { q: '¿Cuál es la diferencia entre el plan vitalicio y la suscripción mensual?', a: 'Con el plan vitalicio pagas una sola vez y accedes para siempre, incluyendo todas las actualizaciones futuras. Con la suscripción mensual pagas $20 USD cada mes y puedes cancelar en cualquier momento.' },
];

const TIMELINE = [
  { month: 'Mes 1-2', title: 'Activación del Oído', desc: 'Tu cerebro se adapta al ritmo, los sonidos y las estructuras básicas del inglés. Empezarás a entender frases sin necesidad de traducirlas.' },
  { month: 'Mes 2-3', title: 'Producción Básica', desc: 'Comienzas a construir oraciones simples de forma automática. Tu vocabulario activo crece sin esfuerzo consciente.' },
  { month: 'Mes 3-4', title: 'Consolidación', desc: 'Las estructuras se vuelven automáticas. Puedes seguir conversaciones cotidianas y entender el 70% de lo que escuchas.' },
  { month: 'Mes 4-5', title: 'Fluidez Progresiva', desc: 'Integras comprensión lectora con lo que ya sabes hablar. Tu cerebro ya procesa el inglés de forma nativa.' },
  { month: 'Mes 5-6', title: 'Independencia Total', desc: 'Puedes sostener conversaciones reales, leer artículos, ver series sin subtítulos. Eres un hablante funcional del inglés.' },
];

// ─── Countdown Timer ───────────────────────────────────────────
function useCountdown() {
  const getInitialTime = () => {
    if (typeof window === 'undefined') return { h: 23, m: 59, s: 59 };
    const stored = localStorage.getItem('oferta_end');
    if (stored) {
      const diff = Math.max(0, parseInt(stored) - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return { h, m, s };
    }
    const end = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('oferta_end', end.toString());
    return { h: 23, m: 59, s: 59 };
  };

  const [time, setTime] = useState({ h: 23, m: 59, s: 59 });
  useEffect(() => {
    setTime(getInitialTime());
    const id = setInterval(() => {
      setTime(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── FAQ Item ──────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem} onClick={() => setOpen(!open)}>
      <div className={styles.faqQ}>
        <span>{q}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {open && <p className={styles.faqA}>{a}</p>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function LandingPage() {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'monthly'>('lifetime');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const countdown = useCountdown();

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 40);
      const heroH = heroRef.current?.offsetHeight || 600;
      setShowStickyBar(window.scrollY > heroH);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openCheckout = (plan: 'lifetime' | 'monthly') => {
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutEmail) return;
    setLoadingCheckout(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: checkoutEmail, plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Error al crear el pago. Intenta de nuevo.');
        setLoadingCheckout(false);
      }
    } catch {
      alert('Error de conexión.');
      setLoadingCheckout(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={styles.container}>

      {/* ── Navbar ── */}
      <nav className={`${styles.navbar} ${navScrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.logo}>Método 6 Meses</div>
        <div className={styles.navLinks}>
          <a href="#metodologia" className={styles.navAnchor}>Metodología</a>
          <a href="#testimonios" className={styles.navAnchor}>Testimonios</a>
          <a href="#pricing" className={styles.navAnchor}>Precios</a>
          <a href="#faq" className={styles.navAnchor}>FAQ</a>
          <Link href="/login" className={styles.loginLink}>Ingresar</Link>
          <button onClick={() => openCheckout('lifetime')} className="btn btn-primary">Empezar Ahora</button>
        </div>
      </nav>

      {/* ── Urgency Bar ── */}
      <div className={styles.urgencyBar}>
        <span>🔥 Oferta especial — Precio de lanzamiento por tiempo limitado</span>
        <span className={styles.countdownInline}>
          Termina en: <strong>{pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}</strong>
        </span>
      </div>

      {/* ── Hero ── */}
      <section className={`${styles.hero} animate-fade-in`} ref={heroRef}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Star size={13} fill="currentColor" /> Calificación 4.9/5 · +5,000 estudiantes en Hispanoamérica
          </div>
          <h1 className={styles.title}>
            Habla Inglés en 6 Meses, <br/>
            <span className={styles.highlight}>30 Minutos al Día</span>
          </h1>
          <p className={styles.subtitle}>
            El único método de inmersión auditiva que activa tu cerebro para pensar en inglés de forma natural. Sin gramática aburrida. Sin listas de vocabulario. Solo escuchar, hablar y progresar.
          </p>
          <div className={styles.ctaGroup}>
            <button onClick={() => openCheckout('lifetime')} className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Empezar por $100 USD
            </button>
            <a href="#metodologia" className={`btn ${styles.btnDemo}`} style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              ▷ Ver cómo funciona
            </a>
          </div>
          <div className={styles.heroTrust}>
            <span><ShieldCheck size={14} /> Acceso instantáneo al pagar</span>
            <span><Zap size={14} /> Sin conocimientos previos</span>
            <span><BarChart3 size={14} /> Avance medible desde la semana 1</span>
          </div>
        </div>

        {/* Mock Audio Player */}
        <div className={styles.heroVisual}>
          <div className={styles.glow} />
          <div className={`glass ${styles.playerCard}`}>
            <h3 className={styles.playerTitle}>Día 1 – Inmersión Total</h3>
            <div className={styles.playerControls}>
              <button className={styles.playBtn}><PlayCircle size={32} /></button>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}><div className={styles.progressFill} /></div>
                <div className={styles.timeInfo}><span>10:05</span><span>30:00</span></div>
              </div>
            </div>
            <div className={styles.waveform}>
              {[...Array(30)].map((_, i) => (
                <div key={i} className={styles.waveBar} style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}><div className={`${styles.statIcon} ${styles.iconGreen}`}><BookOpen size={24} /></div><div className={styles.statValue}>195</div><div className={styles.statLabel}>Lecciones en Audio</div></div>
          <div className={styles.statItem}><div className={`${styles.statIcon} ${styles.iconBlue}`}><Clock size={24} /></div><div className={styles.statValue}>6</div><div className={styles.statLabel}>Meses de Programa</div></div>
          <div className={styles.statItem}><div className={`${styles.statIcon} ${styles.iconGreen}`}><Users size={24} /></div><div className={styles.statValue}>+5,000</div><div className={styles.statLabel}>Estudiantes Activos</div></div>
          <div className={styles.statItem}><div className={`${styles.statIcon} ${styles.iconAmber}`}><Star size={24} /></div><div className={styles.statValue}>4.9/5</div><div className={styles.statLabel}>Calificación Promedio</div></div>
        </div>
      </section>

      {/* ── For Who ── */}
      <section className={styles.forWhoSection}>
        <div className={styles.forWhoContainer}>
          <div className={styles.sectionLabel}>¿Es para mí?</div>
          <h2 className={styles.sectionTitle}>Este método es para ti si…</h2>
          <div className={styles.forWhoGrid}>
            {FOR_WHO.map((item, i) => (
              <div key={i} className={styles.forWhoCard}>
                <div className={styles.forWhoIcon}>{item.icon}</div>
                <div>
                  <div className={styles.forWhoLabel}>{item.label}</div>
                  <div className={styles.forWhoDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology ── */}
      <section id="metodologia" className={styles.methodSection}>
        <div className={styles.methodContainer}>
          <div className={styles.sectionLabel}>¿Por qué funciona?</div>
          <h2 className={styles.sectionTitle}>La ciencia detrás del método</h2>
          <p className={styles.sectionSubtitle}>
            Tu cerebro aprende idiomas escuchando y respondiendo, no memorizando reglas. Este método replica ese proceso natural y lo optimiza para adultos con poco tiempo.
          </p>
          <div className={styles.methodGrid}>
            {METHODOLOGY_STEPS.map((step, i) => (
              <div key={i} className={styles.methodCard}>
                <div className={styles.methodIcon} style={{ background: step.bg, color: step.color }}>{step.icon}</div>
                <h3 className={styles.methodTitle}>{step.title}</h3>
                <p className={styles.methodDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className={styles.timelineSection}>
        <div className={styles.timelineContainer}>
          <div className={styles.sectionLabel}>El camino</div>
          <h2 className={styles.sectionTitle}>Tu transformación mes a mes</h2>
          <div className={styles.timeline}>
            {TIMELINE.map((item, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                {i < TIMELINE.length - 1 && <div className={styles.timelineLine} />}
                <div className={styles.timelineMonth}>{item.month}</div>
                <div className={styles.timelineTitle}>{item.title}</div>
                <div className={styles.timelineDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className={styles.comparisonSection}>
        <div className={styles.comparisonContainer}>
          <div className={styles.sectionLabel}>Comparación</div>
          <h2 className={styles.sectionTitle}>Lo que otros no te dicen</h2>
          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCard} style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
              <h3 style={{ color: '#f87171', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>❌ Método Tradicional</h3>
              <ul className={styles.compList}>
                <li>Memorizar listas de vocabulario que olvidas en días</li>
                <li>Estudiar gramática sin contexto real de conversación</li>
                <li>Clases de 2 horas insostenibles a largo plazo</li>
                <li>Entiendes el inglés escrito pero no puedes hablar</li>
                <li>Años estudiando sin resultados concretos</li>
              </ul>
            </div>
            <div className={styles.comparisonCard} style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
              <h3 style={{ color: '#34d399', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>✅ Método 6 Meses</h3>
              <ul className={styles.compList}>
                <li>Vocabulario en contexto que tu cerebro retiene solo</li>
                <li>Estructuras aprendidas escuchando a nativos reales</li>
                <li>30 minutos al día, fácil de mantener como hábito</li>
                <li>Empiezas a hablar desde la primera semana</li>
                <li>Resultados medibles y progresivos cada semana</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonios" className={styles.testimonialsSection}>
        <div className={styles.sectionLabel}>Testimonios</div>
        <h2 className={styles.sectionTitle}>Lo que dicen nuestros estudiantes</h2>
        <p className={styles.sectionSubtitle}>Personas reales de toda Hispanoamérica que transformaron su inglés en 6 meses.</p>
        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={styles.testimonialCard}>
              <Quote size={22} className={styles.quoteIcon} />
              <p className={styles.testimonialText}>{t.text}</p>
              <div className={styles.testimonialStars}>
                {[...Array(t.stars)].map((_, s) => <Star key={s} size={14} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatarImg}>
                  <Image
                    src="/testimonials.jpg"
                    alt={t.name}
                    width={40}
                    height={40}
                    style={{ objectFit: 'cover', objectPosition: `${t.imgX * -40}px center`, borderRadius: '50%' }}
                  />
                </div>
                <div>
                  <div className={styles.testimonialName}>{t.name}</div>
                  <div className={styles.testimonialMeta}>{t.role} · {t.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.pricingContainer}>
          <div className={styles.pricingHeader}>
            <div className={styles.sectionLabel}>Precios</div>
            <h2 className={styles.pricingTitle}>Empieza tu viaje hacia la fluidez</h2>
            <p className={styles.pricingSubtitle}>Elige el plan que mejor se adapte a ti. Sin compromisos ocultos.</p>
          </div>
          <div className={styles.pricingGrid}>
            <div className={`${styles.pricingCard} ${styles.cardFeatured}`}>
              <div className={styles.badge}>Más Popular</div>
              <h3 className={styles.planName}>Acceso Vitalicio</h3>
              <div className={styles.priceRow}>
                <span className={styles.price}>$100</span>
                <span className={styles.period}>único pago</span>
              </div>
              <p className={styles.planDesc}>Paga una vez y accede para siempre a todo el contenido y futuras actualizaciones.</p>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>195 lecciones de audio completas</span></li>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>PDFs y manuales descargables</span></li>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>Actualizaciones de por vida</span></li>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>Seguimiento de tu progreso</span></li>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>Acceso inmediato tras el pago</span></li>
              </ul>
              <button onClick={() => openCheckout('lifetime')} className={`btn btn-primary ${styles.btnFull}`} style={{ fontSize: '1.125rem', padding: '1rem' }}>Comprar Acceso Vitalicio</button>
            </div>
            <div className={`${styles.pricingCard} ${styles.cardStandard}`}>
              <h3 className={styles.planName}>Suscripción Mensual</h3>
              <div className={styles.priceRow}>
                <span className={styles.price}>$20</span>
                <span className={styles.period}>/mes</span>
              </div>
              <p className={styles.planDesc}>Ideal si prefieres pagar poco a poco mientras avanzas en el programa.</p>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>Acceso a todas las lecciones activas</span></li>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>PDFs interactivos en la plataforma</span></li>
                <li className={styles.featureItem}><CheckCircle2 className={styles.checkIcon} size={20} /> <span>Cancela en cualquier momento</span></li>
              </ul>
              <button onClick={() => openCheckout('monthly')} className={`btn ${styles.btnSecondaryAction} ${styles.btnFull}`} style={{ fontSize: '1.125rem', padding: '1rem' }}>Empezar Suscripción</button>
            </div>
          </div>
          <div className={styles.guarantee}>
            <ShieldCheck size={20} />
            <p>Acceso inmediato al realizar el pago. Sin trámites, sin demoras.</p>
          </div>

          {/* Alternative Payments */}
          <div className={styles.altPayments}>
            <div className={styles.altPayTitle}>¿Prefieres pagar por transferencia?</div>
            <div className={styles.altPayMethods}>
              <div className={styles.altPayBadge} style={{ background: 'rgba(218,0,100,0.1)', border: '1px solid rgba(218,0,100,0.25)', color: '#ff4d9e' }}>
                <span style={{ fontSize: '1.1rem' }}>💜</span> Nequi
              </div>
              <div className={styles.altPayBadge} style={{ background: 'rgba(218,165,0,0.1)', border: '1px solid rgba(218,165,0,0.25)', color: '#f59e0b' }}>
                <span style={{ fontSize: '1.1rem' }}>🏦</span> Bancolombia
              </div>
              <div className={styles.altPayBadge} style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#38bdf8' }}>
                <span style={{ fontSize: '1.1rem' }}>🔑</span> Llave
              </div>
            </div>
            <a
              href="https://wa.me/573026441472?text=Hola%2C%20quiero%20pagar%20el%20M%C3%A9todo%206%20Meses%20por%20transferencia%20(Nequi%2FBancolombia%2FLlave).%20%C2%BFMe%20puedes%20dar%20los%20datos%20de%20la%20cuenta%3F%20%F0%9F%99%8F"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.altPayBtn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Obtener datos de cuenta por WhatsApp
            </a>
            <p className={styles.altPayNote}>
              Envíanos el comprobante por WhatsApp y activamos tu acceso manualmente en minutos.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <div className={styles.sectionLabel}>FAQ</div>
          <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
          <div className={styles.faqCta}>
            <p>¿Listo para empezar tu transformación?</p>
            <button onClick={() => openCheckout('lifetime')} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.875rem 2rem' }}>
              Quiero empezar ahora →
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.logo} style={{ marginBottom: '0.75rem' }}>Método 6 Meses</div>
        <p>© 2026 Método 6 Meses. Todos los derechos reservados.</p>
        <Link href="/login" style={{ color: '#475569', fontSize: '0.85rem', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}>Acceso para alumnos</Link>
      </footer>

      {/* ── Sticky CTA Bar ── */}
      {showStickyBar && (
        <div className={styles.stickyBar}>
          <div className={styles.stickyBarContent}>
            <div>
              <div className={styles.stickyTitle}>¿Listo para hablar inglés?</div>
              <div className={styles.stickyCountdown}>
                Oferta termina en: <strong>{pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}</strong>
              </div>
            </div>
            <button onClick={() => openCheckout('lifetime')} className="btn btn-primary">
              Empezar por $100 USD →
            </button>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ── */}
      {showCheckoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCheckoutModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowCheckoutModal(false)}><X size={20} /></button>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: selectedPlan === 'lifetime' ? '#38bdf8' : '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {selectedPlan === 'lifetime' ? 'Acceso Vitalicio — $100 USD' : 'Suscripción Mensual — $20 USD'}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Completar tu compra</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Ingresa el correo con el que deseas estudiar. Al completar el pago, crearemos tu cuenta automáticamente con la contraseña temporal <strong style={{ color: '#f8fafc' }}>Metodo123!</strong>
            </p>
            <form onSubmit={handleCheckout}>
              <input
                type="email" placeholder="tu@correo.com" required
                value={checkoutEmail} onChange={e => setCheckoutEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '1rem', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="submit" disabled={loadingCheckout || !checkoutEmail} className="btn btn-primary"
                style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                {loadingCheckout ? <><Loader2 className="animate-spin" size={20} /> Procesando...</> : `Pagar $${selectedPlan === 'monthly' ? '20' : '100'} USD en Mercado Pago`}
              </button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.875rem', textAlign: 'center' }}>
              🔒 Pago seguro vía Mercado Pago · Acceso inmediato
            </p>
          </div>
        </div>
      )}

      {/* ── WhatsApp Button ── */}
      <a
        href="https://wa.me/573026441472?text=Hola%2C%20me%20interesa%20el%20M%C3%A9todo%206%20Meses%20para%20aprender%20ingl%C3%A9s%20%F0%9F%91%8B"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappBtn}
        title="Chatea con nosotros en WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span>¿Dudas? Escríbenos</span>
      </a>
    </div>
  );
}
