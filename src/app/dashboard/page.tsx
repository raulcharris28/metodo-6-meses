'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CLASES, getModulo, NOMBRE_MODULO } from '@/lib/clases';
import { LogOut, CheckCircle2, Circle, Play, BookOpen, TrendingUp, Award, ChevronDown, ChevronUp, Headphones, BookMarked, Download, FileText, Shield } from 'lucide-react';
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

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserEmail(user.email ?? '');

      // Load progress from Supabase
      const { data } = await supabase
        .from('progreso')
        .select('clase_id')
        .eq('user_id', user.id);

      if (data) {
        setCompletadas(new Set(data.map((r: { clase_id: number }) => r.clase_id)));
      }
      setLoading(false);
    };
    init();
  }, [router]);

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
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.heroSection}>
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
                <div className={styles.materialBadge} style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>Pimsleur</div>
                <h3 className={styles.materialTitle}>Manual Pimsleur</h3>
                <p className={styles.materialDesc}>Modulos 1-3 - Clases 1 a 90</p>
              </div>
              <div className={styles.downloadBtn}><Download size={14} /> Abrir</div>
            </a>
            <a href={`${SUPA}/storage/v1/object/public/INGLES/manual_assimil.pdf`} target="_blank" rel="noopener noreferrer" className={styles.materialCard}>
              <div className={styles.materialIcon} style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}><BookMarked size={19} color="white" /></div>
              <div className={styles.materialInfo}>
                <div className={styles.materialBadge} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>Assimil</div>
                <h3 className={styles.materialTitle}>Manual Assimil</h3>
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
                <h2 className={styles.cursoTitle}>Pimsleur - Ingles Americano</h2>
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
                <h2 className={styles.cursoTitle}>Assimil - El Ingles Americano</h2>
                <p className={styles.cursoMeta}>Modulos 4, 5, 6 y 7 - 105 lecciones con talleres de repaso</p>
              </div>
            </div>
            <div className={styles.cursoPct} style={{ color: '#34d399' }}>{Math.round((assimilComp / 105) * 100)}%</div>
          </div>
          <div className={styles.modulosContainer}>{ASSIMIL_MODULOS.map(m => renderModuloAccordion(m, false))}</div>
        </section>

      </main>
    </div>
  );
}

