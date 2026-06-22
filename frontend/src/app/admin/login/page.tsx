'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '../../../lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.access_token);
        router.push('/admin');
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="logo" style={{ fontSize: '1.75rem', display: 'inline-block', marginBottom: '0.5rem' }}>
            METIER BLOG
          </Link>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--foreground-muted)' }}>
            ผู้ดูแลระบบ (Admin Panel)
          </h2>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              placeholder="กรอกชื่อผู้ใช้งาน"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
            &larr; กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </main>
  );
}
