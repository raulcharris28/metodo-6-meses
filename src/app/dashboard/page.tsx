'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CLASES, getModulo, NOMBRE_MODULO } from '@/lib/clases';
import { LogOut, CheckCircle2, Circle, Play, BookOpen, TrendingUp, Award, ChevronDown, ChevronUp, Headphones, BookMarked, Download, FileText, Shield, Flame, Lock } from 'lucide-react';
import styles from './page.module.css';

type Clase = { id: number; modulo: number; titulo: string; descripcion: string; duracion: string; temas: string[]; };
const PIMSLEUR_MODULOS = [1, 2, 3];
const ASSIMIL_MODULOS = [4, 5, 6, 7];

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [completadas, setCompletadas] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expandedModulo, setExpandedModulo] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const [isTrial, setIsTrial] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserEmail(user.email ?? '');

      const meta = user.user_metadata || {};

      // Detectar si debe cambiar contraseña
      if (meta.must_change_password) {
        setMustChangePassword(true);
      }

      // Lógica de Prueba Gratis (7 días)
      if (meta.plan_type === 'trial' && meta.trial_start_date) {
        setIsTrial(true);
        const start = new Date(meta.trial_start_date).getTime();
        const now = new Date().getTime();
        const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const remaining = 7 - diffDays;
        
        if (remaining <= 0) {
          setIsExpired(true);
          setDaysLeft(0);
        } else {
          setDaysLeft(remaining);
        }
      }

      // Load progress from Supabase
      const { data } = await supabase
        .from('progreso')
        .select('clase_id, created_at')
        .eq('user_id', user.id);

      if (data) {
        setCompletadas(new Set(data.map((r: { clase_id: number }) => r.clase_id)));

        // Calcular racha de días
        const days = new Set(
          data.map((r: { created_at: string }) => new Date(r.created_at).toDateString())
        );
        let s = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (days.has(d.toDateString())) { s++; } else if (i > 0) { break; }
        }
        setStreak(s);
      }
      setLoading(false);
    };
    init();
  }, [router]);


  const handleChangePassword = async () => {
    if (newPwd.length < 6) { setPwdError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (newPwd !== newPwd2) { setPwdError('Las contraseñas no coinciden.'); return; }
    setChangingPwd(true);
    setPwdError('');
    const { error } = await supabase.auth.updateUser({
      password: newPwd,
      data: { must_change_password: false },
    });
    if (error) { setPwdError(error.message); setChangingPwd(false); return; }
    setMustChangePassword(false);
    setChangingPwd(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const totalCompletadas = completadas.size;
  const porcentaje = Math.round((totalCompletadas / CLASES.length) * 100);
  const siguienteClase = CLASES.find(c => !completadas.has(c.id));
  const pimsleurComp = CLASES.filter(c => c.id <= 90 && completadas.has(c.id)).length;
  const assimilComp = CLASES.filter(c => c.id > 90 && completadas.has(c.id)).length;
  const toggleModulo = (m: number) => setExpandedModulo(prev => prev === m ? null : m);

  const renderModuloAccordion = (moduloNum: number, isPimsleur: boolean) => {
    const clasesDelModulo = getModulo(moduloNum);
    const completadasEnModulo = clasesDelModulo.filter((c: Clase) => completadas.has(c.id)).length;
    const isExpanded = expandedModulo === moduloNum;
    const pct = Math.round((completadasEnModulo / clasesDelModulo.length) * 100);
    const isComplete = completadasEnModulo === clasesDelModulo.length;
    const accent = isPimsleur ? '#0ea5e9' : '#10b981';
    const accentBg = isPimsleur ? 'rgba(14,165,233,0.1)' : 'rgba(16,185,129,0.1)';
    const accentBorder = isPimsleur ? 'rgba(14,165,233,0.3)' : 'rgba(16,185,129,0.3)';
    return (
      <div key={moduloNum} className={styles.moduloBlock} style={{ borderColor: isExpanded ? accentBorder : 'rgba(255,255,255,0.07)' }}>
        <button className={styles.moduloHeader} onClick={() => toggleModulo(moduloNum)} id={'btn-modulo-' + moduloNum} style={{ background: isExpanded ? accentBg : 'transparent' }}>
          <div className={styles.moduloHeaderLeft}>
            <div className={styles.moduloBadge} style={{ background: isComplete ? 'linear-gradient(135deg,#10b981,#059669)' : `linear-gradient(135deg,${accent},${isPimsleur ? '#0284c7' : '#059669'})` }}>
              {isComplete && <CheckCircle2 size={12} />}M{moduloNum}
            </div>
            <div className={styles.moduloInfo}>
              <span className={styles.moduloNombre}>{NOMBRE_MODULO[moduloNum]}</span>
              <span className={styles.moduloMeta}>{completadasEnModulo}/{clasesDelModulo.length} clases &middot; {pct}%</span>
            </div>
          </div>
          <div className={styles.moduloHeaderRight}>
            <div className={styles.miniBar}>
              <div className={styles.miniBarFill} style={{ width: `${pct}%`, background: `linear-gradient(90deg,${accent},${isPimsleur ? '#10b981' : '#34d399'})` }} />
            </div>
            <span style={{ color: isExpanded ? accent : '#475569', display: 'flex' }}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
        </button>
        {isExpanded && (
          <div className={styles.clasesList}>
            {clasesDelModulo.map((clase: Clase) => {
              const hecha = completadas.has(clase.id);
              const isTaller = clase.id > 90 && (clase.id - 90) % 7 === 0;
              return (
                <Link key={clase.id} href={`/dashboard/clase/${clase.id}`} className={`${styles.claseItem} ${hecha ? styles.claseHecha : ''}`} id={`btn-clase-${clase.id}`}>
                  <div className={styles.claseCheck}>{hecha ? <CheckCircle2 size={17} className={styles.iconDone} /> : <Circle size={17} className={styles.iconPending} />}</div>
                  <div className={styles.claseInfo}>
                    <span className={styles.claseTitulo}>{clase.titulo}</span>
                    {isTaller && <span className={styles.tallerTag}>Repaso - Sin audio</span>}
                  </div>
                  <Play size={13} className={styles.clasePlay} style={{ color: accent, opacity: hecha ? 0.3 : 0.5 }} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>Metodo 6 Meses</Link>
        <div className={styles.navRight}>
          {userEmail === 'raulcharris28@gmail.com' && (
            <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
              <Shield size={14} /> Panel Admin
            </Link>
          )}
          <span className={styles.userEmail}>{userEmail}</span>
          <button id="btn-logout" className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesion"><LogOut size={18} /></button>
        </div>
      </nav>
      
      {/* ── Trial Banner ── */}
      {isTrial && !isExpired && (
        <div style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '0.75rem', textAlign: 'center', color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>
          <span>Prueba Gratis: Te quedan {daysLeft} {daysLeft === 1 ? 'día' : 'días'}. </span>
          <a href="/#pricing" style={{ color: 'white', textDecoration: 'underline', marginLeft: '0.5rem' }}>Adquiere el acceso de por vida aquí</a>
        </div>
      )}

      <main className={styles.main}>

        {/* ── Expired Paywall Overlay ── */}
        {isExpired && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, backdropFilter: 'blur(10px)', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: '#1e293b', padding: '3rem 2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Lock size={32} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Tu prueba ha expirado</h2>
              <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
                Esperamos que hayas disfrutado tus 7 días de inmersión. Para continuar escuchando las clases y dominar el inglés, adquiere el acceso de por vida.
              </p>
              <a href="/#pricing" className="btn btn-primary" style={{ display: 'block', width: '100%', padding: '1rem', fontSize: '1.1rem', textDecoration: 'none' }}>
                Desbloquear acceso de por vida
              </a>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#64748b', marginTop: '1.5rem', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
        <section className={styles.heroSection}>

          {/* Streak Widget */}
          {streak > 0 && (
            <div className={styles.streakWidget}>
              <Flame size={18} className={styles.streakIcon} />
              <span><strong>{streak}</strong> {streak === 1 ? 'día' : 'días'} seguido{streak > 1 ? 's' : ''} estudiando</span>
              {streak >= 7 && <span className={styles.streakBadge}>🏆 Racha semanal</span>}
            </div>
          )}

          <div className={styles.heroTop}>
            <div>
              <h1 className={styles.welcomeTitle}>Tu progreso</h1>
              <p className={styles.welcomeSub}><strong>{totalCompletadas}</strong> de <strong>{CLASES.length}</strong> clases completadas</p>
            </div>
            {siguienteClase && (
              <Link href={`/dashboard/clase/${siguienteClase.id}`} className={styles.nextClassBtn} id="btn-siguiente-clase">
                <Play size={15} fill="white" /> Continuar
              </Link>
            )}
          </div>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${porcentaje}%` }} /></div>
            <span className={styles.progressPct}>{porcentaje}%</span>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}><BookOpen size={17} /></div>
              <div><div className={styles.statValue}>{totalCompletadas}</div><div className={styles.statLabel}>Completadas</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}><TrendingUp size={17} /></div>
              <div><div className={styles.statValue}>{porcentaje}%</div><div className={styles.statLabel}>Avance</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}><Award size={17} /></div>
              <div><div className={styles.statValue}>{CLASES.length - totalCompletadas}</div><div className={styles.statLabel}>Restantes</div></div>
            </div>
          </div>
        </section>

        {/* Materials */}
        <section className={styles.materialesSection}>
          <h2 className={styles.sectionTitle}><FileText size={16} /> Materiales de Apoyo</h2>
          <div className={styles.materialesGrid}>
            <a href={`${SUPA}/storage/v1/object/public/INGLES/manual_modulo_1.pdf`} target="_blank" rel="noopener noreferrer" className={styles.materialCard}>
              <div className={styles.materialIcon} style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}><BookMarked size={19} color="white" /></div>
              <div className={styles.materialInfo}>
                <div className={styles.materialBadge} style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>Inmersión</div>
                <h3 className={styles.materialTitle}>Manual de Inmersión</h3>
                <p className={styles.materialDesc}>Modulos 1-3 - Clases 1 a 90</p>
              </div>
              <div className={styles.downloadBtn}><Download size={14} /> Abrir</div>
            </a>
            <a href={`${SUPA}/storage/v1/object/public/INGLES/manual_assimil.pdf`} target="_blank" rel="noopener noreferrer" className={styles.materialCard}>
              <div className={styles.materialIcon} style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}><BookMarked size={19} color="white" /></div>
              <div className={styles.materialInfo}>
                <div className={styles.materialBadge} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>Consolidación</div>
                <h3 className={styles.materialTitle}>Manual de Consolidación</h3>
                <p className={styles.materialDesc}>Modulos 4-7 - Clases 91 a 195</p>
              </div>
              <div className={styles.downloadBtn}><Download size={14} /> Abrir</div>
            </a>
          </div>
        </section>

        {/* Pimsleur */}
        <section className={styles.cursoSection}>
          <div className={styles.cursoHeader} style={{ borderLeftColor: '#0ea5e9' }}>
            <div className={styles.cursoHeaderLeft}>
              <div className={styles.cursoIcon} style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}><Headphones size={19} /></div>
              <div>
                <h2 className={styles.cursoTitle}>Etapa 1: Inmersión Auditiva</h2>
                <p className={styles.cursoMeta}>Modulos 1, 2 y 3 - 90 lecciones de audio</p>
              </div>
            </div>
            <div className={styles.cursoPct} style={{ color: '#38bdf8' }}>{Math.round((pimsleurComp / 90) * 100)}%</div>
          </div>
          <div className={styles.modulosContainer}>{PIMSLEUR_MODULOS.map(m => renderModuloAccordion(m, true))}</div>
        </section>

        {/* Assimil */}
        <section className={styles.cursoSection}>
          <div className={styles.cursoHeader} style={{ borderLeftColor: '#10b981' }}>
            <div className={styles.cursoHeaderLeft}>
              <div className={styles.cursoIcon} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}><BookOpen size={19} /></div>
              <div>
                <h2 className={styles.cursoTitle}>Etapa 2: Consolidación y Fluidez</h2>
                <p className={styles.cursoMeta}>Modulos 4, 5, 6 y 7 - 105 lecciones con talleres de repaso</p>
              </div>
            </div>
            <div className={styles.cursoPct} style={{ color: '#34d399' }}>{Math.round((assimilComp / 105) * 100)}%</div>
          </div>
          <div className={styles.modulosContainer}>{ASSIMIL_MODULOS.map(m => renderModuloAccordion(m, false))}</div>
        </section>

      </main>

      {/* ── Modal: Cambio de Contraseña Obligatorio ── */}
      {mustChangePassword && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem', maxWidth: '420px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(251,191,36,0.15)', borderRadius: '0.5rem', padding: '0.5rem', color: '#fbbf24' }}>
                <Lock size={22} />
              </div>
              <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 700 }}>Elige tu contraseña</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Por seguridad, debes crear una contraseña personal antes de continuar. No podrás acceder al contenido sin completar este paso.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Nueva contraseña (mín. 6 caracteres)</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Confirmar contraseña</label>
              <input type="password" value={newPwd2} onChange={e => setNewPwd2(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' as const }} />
            </div>
            {pwdError && <p style={{ color: '#f87171', fontSize: '0.83rem', marginBottom: '1rem' }}>{pwdError}</p>}
            <button onClick={handleChangePassword} disabled={changingPwd || !newPwd || !newPwd2}
              style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg,#7c3aed,#0ea5e9)', border: 'none', borderRadius: '0.5rem', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: changingPwd ? 0.7 : 1 }}>
              {changingPwd ? 'Guardando...' : 'Guardar mi contraseña →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
