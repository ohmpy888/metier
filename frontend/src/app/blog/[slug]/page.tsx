'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '../../../lib/api';

interface Comment {
  id: number;
  senderName: string;
  content: string;
  createdAt: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  additionalImages: string;
  views: number;
  createdAt: string;
  comments: Comment[];
}

export default function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [senderName, setSenderName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`${API_BASE}/blogs/detail/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchBlog();
    }
  }, [slug, router]);

  const validateComment = (text: string) => {
    if (!text) return true;
    const thaiNumbersRegex = /^[ \u0E00-\u0E7F0-9\s]+$/;
    return thaiNumbersRegex.test(text);
  };

  const handleCommentChange = (text: string) => {
    setCommentContent(text);
    if (!validateComment(text)) {
      setErrorMsg('ขอ้ความ Comment ต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น');
    } else {
      setErrorMsg('');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ส่ง');
      return;
    }
    if (!commentContent.trim()) {
      setErrorMsg('กรุณากรอกข้อความ');
      return;
    }
    if (!validateComment(commentContent)) {
      setErrorMsg('ข้อความ Comment ต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น (ห้ามระบุอักษรภาษาอังกฤษหรือสัญลักษณ์)');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/comments/blog/${blog?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName,
          content: commentContent,
        }),
      });

      if (res.ok) {
        setSenderName('');
        setCommentContent('');
        setSuccessMsg('ส่งความคิดเห็นสำเร็จแล้ว! ความคิดเห็นของคุณจะแสดงหลังจากได้รับการอนุมัติจากผู้ดูแลระบบ');
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.message || 'เกิดข้อผิดพลาดในการส่งความคิดเห็น');
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </main>
    );
  }

  if (!blog) return null;

  const additionalImagesList: string[] = blog.additionalImages
    ? JSON.parse(blog.additionalImages)
    : [];

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
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            METIER BLOG
          </Link>
          <Link href="/" className="btn btn-secondary">
            ย้อนกลับ
          </Link>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: '5rem', maxWidth: '800px', marginTop: '2rem' }}>
        <article>
          <img
            src={blog.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'}
            alt={blog.title}
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '1rem', marginBottom: '2rem' }}
          />

          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '1rem' }}>
            {blog.title}
          </h1>

          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--foreground-muted)', fontSize: '0.95rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
            <span>วันที่โพสต์: {formatDate(blog.createdAt)}</span>
            <span>ผู้เข้าชม: {blog.views} ครั้ง</span>
          </div>

          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '3rem' }}>
            {blog.content}
          </div>

          {additionalImagesList.length > 0 && (
            <div style={{ marginBottom: '4rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>รูปภาพเพิ่มเติม</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {additionalImagesList.map((imgUrl, index) => (
                  <a href={imgUrl} target="_blank" rel="noopener noreferrer" key={index}>
                    <img
                      src={imgUrl}
                      alt={`รูปภาพเพิ่มเติมที่ ${index + 1}`}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--card-border)', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>

        <section style={{ borderTop: '1px solid var(--card-border)', paddingTop: '3rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>
            ความคิดเห็น ({blog.comments ? blog.comments.length : 0})
          </h3>

          <div className="glass-card" style={{ marginBottom: '3rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>เขียนแสดงความคิดเห็น</h4>
            <form onSubmit={handleSubmitComment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>ชื่อผู้ส่ง</label>
                <input
                  type="text"
                  placeholder="กรอกชื่อของคุณ"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>ข้อความความคิดเห็น</label>
                <textarea
                  rows={4}
                  placeholder="พิมพ์ข้อความเป็นภาษาไทยและตัวเลขเท่านั้น..."
                  value={commentContent}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  required
                ></textarea>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', display: 'block', marginTop: '0.25rem' }}>
                  * แนวทางการ Validate: ตรวจสอบอักขระให้เป็นภาษาไทย (ก-ฮ, สระ, วรรณยุกต์) และตัวเลข (ไทย-อารบิก) เท่านั้น
                </span>
              </div>

              {errorMsg && (
                <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="badge badge-success" style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !!errorMsg}
                style={{ alignSelf: 'flex-start' }}
              >
                {isSubmitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {blog.comments && blog.comments.length > 0 ? (
              blog.comments.map((comment) => (
                <div key={comment.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{comment.senderName}</span>
                    <span style={{ color: 'var(--foreground-muted)' }}>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--foreground-muted)' }}>
                ยังไม่มีความคิดเห็นสำหรับบทความนี้
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Metier Blog. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
