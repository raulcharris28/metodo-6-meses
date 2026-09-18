'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getClase, CLASES } from '@/lib/clases';
import {
  Play, Pause, SkipBack, SkipForward, CheckCircle2,
  ChevronLeft, Volume2, RotateCcw, ArrowLeft, ArrowRight
} from 'lucide-react';
import styles from './page.module.css';

export default function ClasePage() {
  const router = useRouter();
  const params = useParams();
  const claseId = Number(params.id);
  const clase = getClase(claseId);

  const [userId, setUserId] = useState('');
  const [completada, setCompletada] = useState(false);
  const [marcando, setMarcando] = useState(false);
  
  // Real Audio State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const prevClase = claseId > 1 ? getClase(claseId - 1) : null;
  const nextClase = claseId < CLASES.length ? getClase(claseId + 1) : null;

  // Real Audio URL from Supabase Storage
  const isAssimil = claseId > 90;
  const assimilLesson = claseId - 90; // 1..105
  // Every 7th Assimil lesson is a "taller" (review) with no audio
  const isTaller = isAssimil && assimilLesson % 7 === 0;

  let audioUrl = '';
  if (claseId <= 90) {
    // PIMSLEUR LOGIC (Classes 1-90)
    let level = "I";
    let lessonNum = claseId;
    if (claseId > 60) { level = "III"; lessonNum = claseId - 60; }
    else if (claseId > 30) { level = "II"; lessonNum = claseId - 30; }
    const formattedId = lessonNum.toString().padStart(2, '0');
    audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/INGLES/English%20${level}%20${formattedId}.mp3`;
  } else if (!isTaller) {
    // ASSIMIL LOGIC — only for non-taller lessons
    audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/INGLES/Leccion%20${assimilLesson}.mp3`;
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('progreso')
        .select('id')
        .eq('user_id', user.id)
        .eq('clase_id', claseId)
        .maybeSingle();

      setCompletada(!!data);
    };
    init();
  }, [claseId, router]);

  // Audio Events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsAudioLoaded(true);
      audioRef.current.volume = volume;
    }
  };

  const handleError = () => {
    setAudioError(true);
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Optionally auto-mark as complete when audio ends
  };

  // Audio Controls
  const togglePlay = () => {
    if (!audioRef.current || audioError) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setAudioError(true));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }
  };

  const handleForward = () => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (s: number) => {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleMarcarCompletada = async () => {
    if (completada || !userId || marcando) return;
    setMarcando(true);
    await supabase.from('progreso').upsert({
      user_id: userId,
      clase_id: claseId,
      completada_at: new Date().toISOString(),
    }, { onConflict: 'user_id,clase_id' });
    setCompletada(true);
    setMarcando(false);
  };

  if (!clase) {
    return (
      <div className={styles.notFound}>
        <p>Clase no encontrada.</p>
        <Link href="/dashboard">← Volver al dashboard</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hidden Real Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onEnded={handleEnded}
      />

      {/* Background decoration */}
      <div className={styles.bgBlob} />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/dashboard" className={styles.backLink} id="btn-back-dashboard">
          <ChevronLeft size={20} />
          Mis Clases
        </Link>
        <span className={styles.navTitle}>Clase {clase.id} / {CLASES.length}</span>
        <div className={styles.navSpacer} />
      </nav>

      <main className={styles.main}>
        {/* Class header */}
        <div className={styles.header}>
          <div className={styles.mesBadge}>Módulo {clase.modulo} · Semana {clase.semana}</div>
          <h1 className={styles.titulo}>{clase.titulo}</h1>
          <p className={styles.descripcion}>{clase.descripcion}</p>
        </div>

        {/* Pimsleur Method Instructions Box */}
        {!isAssimil && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(14,165,233,0.03))',
            border: '1px solid rgba(14,165,233,0.25)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🎧</span>
              <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>Cómo usar el Método Pimsleur en esta lección</strong>
            </div>
            <ul style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0, listStyleType: 'disc' }}>
              <li><strong style={{ color: '#f8fafc' }}>Solo escucha y habla:</strong> No necesitas tomar notas ni ver el manual durante el audio.</li>
              <li><strong style={{ color: '#f8fafc' }}>Responde en voz alta:</strong> El tutor te hará preguntas. Responde <em>antes</em> de que te den la respuesta correcta.</li>
              <li><strong style={{ color: '#f8fafc' }}>Cero distracciones:</strong> Busca un lugar tranquilo y concéntrate 100% en la pronunciación.</li>
              <li><strong style={{ color: '#f8fafc' }}>Una al día:</strong> Pimsleur está diseñado para tomar <strong style={{ color: '#38bdf8' }}>una sola lección por día</strong> para aprovechar la repetición espaciada.</li>
            </ul>
            <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(14,165,233,0.15)' }}>
              <a
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/INGLES/manual_modulo_1.pdf`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
              >
                <span>📄</span> Ver el Manual (Sólo si quieres repasar las lecturas o la transcripción)
              </a>
            </div>
          </div>
        )}

        {/* Assimil Method Instructions Box (for non-taller Assimil lessons) */}
        {isAssimil && !isTaller && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📖</span>
              <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>Cómo usar el Método Assimil en esta lección</strong>
            </div>
            <ol style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
              <li><strong style={{ color: '#f8fafc' }}>Abre el libro</strong> en la <strong style={{ color: '#34d399' }}>Lección {assimilLesson}</strong> (impreso o en pantalla). <em>Se recomienda imprimirlo para una mejor experiencia.</em></li>
              <li><strong style={{ color: '#f8fafc' }}>Lee el diálogo</strong> en inglés una vez, con la traducción al español al lado.</li>
              <li><strong style={{ color: '#f8fafc' }}>Escucha el audio</strong> mientras sigues el texto en el libro con los ojos.</li>
              <li><strong style={{ color: '#f8fafc' }}>Repite en voz alta</strong> cada frase que el audio te indique, imitando la pronunciación.</li>
              <li><strong style={{ color: '#f8fafc' }}>Vuelve a escuchar</strong> el audio una segunda vez sin ver el libro, sólo escuchando.</li>
            </ol>
            <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(16,185,129,0.15)' }}>
              <a
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/INGLES/manual_assimil.pdf`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
              >
                <span>📄</span> Abrir Manual Assimil (PDF)
              </a>
            </div>
          </div>
        )}

        {/* Audio Player Card */}
        {isTaller ? (
          /* TALLER / REPASO CARD */
          <div className={styles.playerCard} style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Lección de Repaso Assimil</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Esta es la <strong style={{ color: '#fbbf24' }}>Lección {assimilLesson}</strong> — una sesión de consolidación sin audio.</p>

            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pasos para completar este repaso:</p>
              <ol style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.9, paddingLeft: '1.25rem', margin: 0 }}>
                <li>Abre el libro en la <strong style={{ color: '#f8fafc' }}>Lección {assimilLesson}</strong>.</li>
                <li>Lee los <strong style={{ color: '#f8fafc' }}>ejercicios escritos</strong> de esta lección de repaso.</li>
                <li>Responde los ejercicios <strong style={{ color: '#f8fafc' }}>sin ver las respuestas</strong> primero.</li>
                <li>Verifica tus respuestas con la clave que está al final del ejercicio.</li>
                <li>Repasa mentalmente el vocabulario de las últimas 6 lecciones.</li>
              </ol>
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/INGLES/manual_assimil.pdf`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}
            >
              📄 Abrir Manual Assimil (PDF)
            </a>
            <br />
            <Link href="/dashboard" className={styles.backLink} style={{ justifyContent: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              ← Volver al Dashboard
            </Link>
          </div>
        ) : (
        <div className={styles.playerCard}>
          {audioError && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
              ⚠️ No se pudo cargar el audio real de Supabase (verifica que lo subiste al bucket correcto).
            </div>
          )}

          {/* Waveform visualization */}
          <div className={styles.waveform}>
            {[...Array(60)].map((_, i) => {
              const h = 15 + Math.abs(Math.sin(i * 0.5 + 1) * 70);
              const isActive = (i / 60) * 100 <= progressPct;
              return (
                <div
                  key={i}
                  className={`${styles.waveBar} ${isActive ? styles.waveBarActive : ''}`}
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>

          {/* Progress seekbar */}
          <div className={styles.seekbarWrapper} onClick={handleSeek} role="slider" aria-label="Progreso del audio">
            <div className={styles.seekbar}>
              <div className={styles.seekFill} style={{ width: `${progressPct}%` }} />
              <div className={styles.seekThumb} style={{ left: `${progressPct}%` }} />
            </div>
          </div>

          {/* Time */}
          <div className={styles.timeRow}>
            <span>{formatTime(currentTime)}</span>
            <span>{isAudioLoaded ? formatTime(duration) : 'Cargando...'}</span>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button
              className={styles.ctrlBtn}
              onClick={handleRewind}
              title="Retroceder 15s"
              id="btn-rewind"
              disabled={audioError}
            >
              <RotateCcw size={20} />
              <span className={styles.skipLabel}>15</span>
            </button>

            {prevClase && (
              <Link href={`/dashboard/clase/${prevClase.id}`} className={styles.ctrlBtn} id="btn-prev-clase" title="Clase anterior">
                <SkipBack size={22} />
              </Link>
            )}

            <button
              className={styles.playBtn}
              onClick={togglePlay}
              id="btn-play-pause"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              disabled={audioError}
            >
              {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
            </button>

            {nextClase && (
              <Link href={`/dashboard/clase/${nextClase.id}`} className={styles.ctrlBtn} id="btn-next-clase" title="Clase siguiente">
                <SkipForward size={22} />
              </Link>
            )}

            <button
              className={styles.ctrlBtn}
              onClick={handleForward}
              title="Adelantar 15s"
              id="btn-forward"
              disabled={audioError}
            >
              <SkipForward size={20} />
              <span className={styles.skipLabel}>15</span>
            </button>
          </div>

          {/* Volume */}
          <div className={styles.volumeRow}>
            <Volume2 size={16} className={styles.volIcon} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Volumen"
            />
          </div>
        </div>
        )} {/* end isTaller ternary */}

        {/* Topics */}
        <div className={styles.topicsCard}>
          <h2 className={styles.topicsTitle}>Temas de esta clase</h2>
          <div className={styles.topicsGrid}>
            {clase.temas.map((t, i) => (
              <span key={i} className={styles.topicChip}>{t}</span>
            ))}
          </div>
        </div>

        {/* Mark completed */}
        <div className={styles.completarSection}>
          {completada ? (
            <div className={styles.completadaBadge}>
              <CheckCircle2 size={22} />
              Clase completada ✓
            </div>
          ) : (
            <button
              id="btn-marcar-completada"
              className={styles.completarBtn}
              onClick={handleMarcarCompletada}
              disabled={marcando}
            >
              <CheckCircle2 size={20} />
              {marcando ? 'Guardando...' : 'Marcar como completada'}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className={styles.navClases}>
          {prevClase ? (
            <Link href={`/dashboard/clase/${prevClase.id}`} className={styles.navClaseBtn} id="btn-nav-prev">
              <ArrowLeft size={18} />
              <div>
                <div className={styles.navLabel}>Anterior</div>
                <div className={styles.navClaseName}>Clase {prevClase.id}: {prevClase.titulo}</div>
              </div>
            </Link>
          ) : <div />}

          {nextClase && (
            <Link href={`/dashboard/clase/${nextClase.id}`} className={`${styles.navClaseBtn} ${styles.navClaseBtnRight}`} id="btn-nav-next">
              <div style={{ textAlign: 'right' }}>
                <div className={styles.navLabel}>Siguiente</div>
                <div className={styles.navClaseName}>Clase {nextClase.id}: {nextClase.titulo}</div>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
