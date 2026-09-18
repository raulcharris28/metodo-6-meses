'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

// ── Componente Olvidé mi contraseña ────────────────────────────
function ForgotPassword() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://metodo6meses.com/reset-password',
    });
    setSent(true);
    setLoading(false);
  };

  if (!show) {
    return (
      <button onClick={() => setShow(true)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.83rem', cursor: 'pointer', textDecoration: 'underline' }}>
        ¿Olvidaste tu contraseña?
      </button>
    );
  }

  if (sent) {
    return <p style={{ color: '#34d399', fontSize: '0.83rem', margin: 0 }}>✅ Revisa tu correo para restablecer tu contraseña.</p>;
  }

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <input
        type="email" placeholder="tu@correo.com" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.85rem', marginBottom: '0.5rem', boxSizing: 'border-box' as const }}
      />
      <button onClick={handleReset} disabled={loading || !email}
        style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </button>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (successParam === 'true') {
      setSuccessMsg('¡Pago exitoso! Hemos creado tu cuenta con tu correo. Tu contraseña temporal es: Metodo123!');
    }
  }, [successParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : error.message
      );
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className={`glass ${styles.card}`}>
      <div className={styles.cardBody} style={{ padding: '2rem' }}>
        <h1 className={styles.title}>Bienvenido de vuelta</h1>
        <p className={styles.subtitle}>Accede a tus 195 clases de inglés</p>

        {error && <div className={styles.errorBox}>{error}</div>}
        {successMsg && <div className={styles.successBox}>{successMsg}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className={`input-field ${styles.input}`}
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className={`input-field ${styles.input}`}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className={`btn btn-primary ${styles.btnSubmit}`}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <ForgotPassword />
        </div>
      </div>
    </div>
  );
}

// ── Página principal con Suspense boundary ─────────────────────
export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.blobBlue} />
      <div className={styles.blobGreen} />

      <Link href="/" className={styles.logoLink}>
        <span className={styles.logoText}>Método 6 Meses</span>
      </Link>

      <Suspense fallback={
        <div className={`glass ${styles.card}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
          <p style={{ color: '#94a3b8' }}>Cargando...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>

      <p className={styles.footer}>© 2026 Método 6 Meses · Todos los derechos reservados</p>
    </div>
  );
}
