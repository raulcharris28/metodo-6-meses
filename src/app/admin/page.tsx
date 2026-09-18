'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LogOut, Users, TrendingUp, Award, Search,
  UserPlus, CheckCircle2, X, RefreshCw, Shield
} from 'lucide-react';
import styles from './page.module.css';

type Alumno = {
  id: string;
  email: string;
  created_at: string;
  clases_completadas: number;
  porcentaje: number;
};

const ADMIN_EMAIL = 'raulcharris28@gmail.com';

export default function AdminPage() {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filtered, setFiltered] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [token, setToken] = useState('');

  const fetchAlumnos = useCallback(async (tok: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${tok}` },
    });
    const json = await res.json();
    if (json.users) {
      setAlumnos(json.users);
      setFiltered(json.users);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      if (session.user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return; }
      setToken(session.access_token);
      fetchAlumnos(session.access_token);
    };
    init();
  }, [router, fetchAlumnos]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(alumnos.filter(a => a.email.toLowerCase().includes(q)));
  }, [search, alumnos]);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return;
    setCreating(true);
    setCreateMsg(null);
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    });
    const json = await res.json();
    if (json.success) {
      setCreateMsg({ type: 'ok', text: `✅ Alumno ${newEmail} creado exitosamente.` });
      setNewEmail('');
      setNewPassword('');
      fetchAlumnos(token);
    } else {
      setCreateMsg({ type: 'err', text: `❌ ${json.error}` });
    }
    setCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Stats
  const total = alumnos.length;
  const promedio = total > 0 ? Math.round(alumnos.reduce((s, a) => s + a.porcentaje, 0) / total) : 0;
  const completaron = alumnos.filter(a => a.porcentaje === 100).length;
  const masDeMetad = alumnos.filter(a => a.porcentaje >= 50).length;

  const getModulo = (clases: number) => {
    if (clases === 0) return '—';
    const m = Math.ceil(clases / 30);
    return `Módulo ${Math.min(m, 7)}`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/dashboard" className={styles.logo}>Método 6 Meses</Link>
          <div className={styles.adminBadge}><Shield size={12} /> ADMIN</div>
        </div>
        <div className={styles.navRight}>
          <span className={styles.userEmail}>{ADMIN_EMAIL}</span>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Panel de Administración</h1>
          <div className={styles.headerActions}>
            <button className={styles.refreshBtn} onClick={() => fetchAlumnos(token)} title="Actualizar">
              <RefreshCw size={16} />
            </button>
            <button className={styles.addBtn} onClick={() => { setShowModal(true); setCreateMsg(null); }}>
              <UserPlus size={16} /> Agregar Alumno
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{total}</div>
              <div className={styles.statLabel}>Total alumnos</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{promedio}%</div>
              <div className={styles.statLabel}>Progreso promedio</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{masDeMetad}</div>
              <div className={styles.statLabel}>Más del 50%</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
              <Award size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{completaron}</div>
              <div className={styles.statLabel}>Completaron 100%</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Alumnos <span className={styles.countBadge}>{filtered.length}</span></h2>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por correo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              {search ? 'No se encontraron alumnos con ese correo.' : 'Aún no hay alumnos registrados.'}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Registro</th>
                    <th>Clases</th>
                    <th>Progreso</th>
                    <th>Módulo actual</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(alumno => (
                    <tr key={alumno.id}>
                      <td>
                        <div className={styles.emailCell}>
                          <div className={styles.avatar}>{alumno.email[0].toUpperCase()}</div>
                          <span>{alumno.email}</span>
                        </div>
                      </td>
                      <td className={styles.dateCell}>{formatDate(alumno.created_at)}</td>
                      <td className={styles.clasesCell}>
                        <span className={styles.clasesNum}>{alumno.clases_completadas}</span>
                        <span className={styles.clasesTotal}>/195</span>
                      </td>
                      <td>
                        <div className={styles.progressCell}>
                          <div className={styles.miniBar}>
                            <div
                              className={styles.miniBarFill}
                              style={{
                                width: `${alumno.porcentaje}%`,
                                background: alumno.porcentaje === 100
                                  ? 'linear-gradient(90deg,#10b981,#34d399)'
                                  : alumno.porcentaje >= 50
                                  ? 'linear-gradient(90deg,#0ea5e9,#38bdf8)'
                                  : 'linear-gradient(90deg,#6366f1,#818cf8)',
                              }}
                            />
                          </div>
                          <span className={styles.pctLabel}>{alumno.porcentaje}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.moduloBadge}>{getModulo(alumno.clases_completadas)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Add User */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}><UserPlus size={18} /> Agregar Alumno</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <p className={styles.modalDesc}>
              Crea una cuenta manualmente para alumnos que pagaron por transferencia o efectivo.
              El alumno podrá iniciar sesión inmediatamente con estas credenciales.
            </p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Correo electrónico</label>
              <input
                type="email"
                className={styles.formInput}
                placeholder="alumno@correo.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contraseña temporal</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <p className={styles.formHint}>📌 Compártela con el alumno. Podrá cambiarla después.</p>
            </div>
            {createMsg && (
              <div className={`${styles.createMsg} ${createMsg.type === 'ok' ? styles.createMsgOk : styles.createMsgErr}`}>
                {createMsg.type === 'ok' ? <CheckCircle2 size={16} /> : <X size={16} />}
                {createMsg.text}
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={styles.createBtn} onClick={handleCreateUser} disabled={creating || !newEmail || !newPassword}>
                {creating ? 'Creando...' : 'Crear Acceso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
