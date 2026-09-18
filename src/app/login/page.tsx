'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

// ── Componente interno que usa useSearchParams ─────────────────
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
        <p className={styles.subtitle}>Accede a tus 90 clases de inglés</p>

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
