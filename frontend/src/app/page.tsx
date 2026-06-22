'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE } from '../lib/api';

interface Blog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  createdAt: string;
  views: number;
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          search: debouncedSearch,
        });
        const res = await fetch(`${API_BASE}/blogs?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.blogs);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, [page, debouncedSearch]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <header className="header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem 0' }}>
        <div className="container header-content">
          <Link href="/" className="logo" style={{ fontSize: '1.2rem', letterSpacing: '0.15em', fontWeight: 700 }}>
            METIER / JOURNAL
          </Link>
          <Link href="/admin" className="btn btn-secondary" style={{ borderRadius: '0', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'transparent' }}>
            Admin Panel
          </Link>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: '6rem', marginTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1 }}>
              The Journal.
            </h1>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '1.1rem', maxWidth: '520px', lineHeight: '1.7' }}>
              แพลตฟอร์มแบ่งปันบทความ ความรู้ และความคิดเห็น จากชุมชนแอดมิน และผู้ใช้งานทั่วไป
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input
                type="text"
                placeholder="ค้นหาบทความ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', maxWidth: '350px', borderRadius: '0', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.01)' }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : (
          <>
            {blogs.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--foreground-muted)' }}>
                ไม่พบข้อมูลบทความที่คุณกำลังค้นหา
              </div>
            ) : (
              <>
                {page === 1 && !debouncedSearch && blogs.length > 0 && (
                  <div style={{ marginBottom: '4.5rem' }}>
                    <Link href={`/blog/${blogs[0].slug}`}>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '2rem', transition: 'border-color 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
                      >
                        <img
                          src={blogs[0].coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'}
                          alt={blogs[0].title}
                          style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>
                            Featured Article
                          </span>
                          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.25, marginBottom: '1.25rem' }}>
                            {blogs[0].title}
                          </h2>
                          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.75rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
                            {blogs[0].summary}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--foreground-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                            <span>{formatDate(blogs[0].createdAt)}</span>
                            <span>เข้าชม {blogs[0].views} ครั้ง</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                <div className="blog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
                  {(page === 1 && !debouncedSearch ? blogs.slice(1) : blogs).map((blog) => (
                    <Link href={`/blog/${blog.slug}`} key={blog.id}>
                      <article
                        className="blog-card"
                        style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '0', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                        }}
                      >
                        <img
                          src={blog.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'}
                          alt={blog.title}
                          style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '1.25rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.4 }}>{blog.title}</h3>
                          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.summary}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--foreground-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                            <span>{formatDate(blog.createdAt)}</span>
                            <span>เข้าชม {blog.views} ครั้ง</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className={`pagination-item ${page === 1 ? 'disabled' : ''}`}
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      style={{ borderRadius: '0' }}
                    >
                      &laquo;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`pagination-item ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                        style={{ borderRadius: '0' }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={`pagination-item ${page === totalPages ? 'disabled' : ''}`}
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      style={{ borderRadius: '0' }}
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '3.5rem 0', marginTop: '4rem' }}>
        <div className="container">
          <p>&copy; 2026 Metier Journal. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

