'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '../../lib/api';


interface Blog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  additionalImages: string;
  views: number;
  isPublished: boolean;
  createdAt: string;
}

interface Comment {
  id: number;
  blogId: number;
  senderName: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  blog: {
    title: string;
    slug: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blogs' | 'comments'>('blogs');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editorMode, setEditorMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formAdditionalImages, setFormAdditionalImages] = useState<string[]>([]);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formError, setFormError] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  }, [router]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search: search,
      });
      const res = await fetch(`${API_BASE}/blogs/admin?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
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
  }, [token, page, search, handleLogout]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/comments/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, handleLogout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken) {
      router.push('/admin/login');
    } else {
      setTimeout(() => {
        setToken(storedToken);
      }, 0);
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      if (activeTab === 'blogs') {
        Promise.resolve().then(() => {
          fetchBlogs();
        });
      } else {
        Promise.resolve().then(() => {
          fetchComments();
        });
      }
    }
  }, [token, activeTab, fetchBlogs, fetchComments]);

  const handleGenerateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormSlug(slug);
  };

  const handleAddImageField = () => {
    if (formAdditionalImages.length < 6) {
      setFormAdditionalImages([...formAdditionalImages, '']);
    }
  };

  const handleRemoveImageField = (index: number) => {
    const updated = formAdditionalImages.filter((_, i) => i !== index);
    setFormAdditionalImages(updated);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...formAdditionalImages];
    updated[index] = val;
    setFormAdditionalImages(updated);
  };

  const handleOpenCreate = () => {
    setEditorMode('create');
    setEditingBlogId(null);
    setFormTitle('');
    setFormSlug('');
    setFormSummary('');
    setFormContent('');
    setFormCoverImage('');
    setFormAdditionalImages([]);
    setFormIsPublished(true);
    setFormError('');
  };

  const handleOpenEdit = (blog: Blog) => {
    setEditorMode('edit');
    setEditingBlogId(blog.id);
    setFormTitle(blog.title);
    setFormSlug(blog.slug);
    setFormSummary(blog.summary);
    setFormContent(blog.content);
    setFormCoverImage(blog.coverImage);
    const extraImages: string[] = blog.additionalImages ? JSON.parse(blog.additionalImages) : [];
    setFormAdditionalImages(extraImages);
    setFormIsPublished(blog.isPublished);
    setFormError('');
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload/single`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Upload failed');
    }
    const data = await res.json();
    return data.url;
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('กรุณากรอกหัวข้อ Blog');
      return;
    }
    if (!formSlug.trim()) {
      setFormError('กรุณากรอก URL Slug');
      return;
    }

    const filteredExtraImages = formAdditionalImages.filter((url) => url.trim() !== '');

    const payload = {
      title: formTitle,
      slug: formSlug,
      summary: formSummary,
      content: formContent,
      coverImage: formCoverImage,
      additionalImages: filteredExtraImages,
      isPublished: formIsPublished,
    };

    try {
      const url = editorMode === 'create' ? `${API_BASE}/blogs` : `${API_BASE}/blogs/${editingBlogId}`;
      const method = editorMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditorMode('list');
        fetchBlogs();
      } else {
        const errData = await res.json();
        setFormError(errData.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch {
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('คุณต้องการลบ Blog นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchBlogs();
      } else {
        alert('ไม่สามารถลบ Blog ได้');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      const extraImages: string[] = blog.additionalImages ? JSON.parse(blog.additionalImages) : [];
      const res = await fetch(`${API_BASE}/blogs/${blog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: blog.title,
          slug: blog.slug,
          summary: blog.summary,
          content: blog.content,
          coverImage: blog.coverImage,
          additionalImages: extraImages,
          isPublished: !blog.isPublished,
        }),
      });

      if (res.ok) {
        fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveComment = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/comments/${id}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectComment = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/comments/${id}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) return null;

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            METIER BLOG <span style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>(ADMIN)</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" className="btn btn-secondary">
              ดูหน้าเว็บบล็อก
            </Link>
            <button onClick={handleLogout} className="btn btn-danger">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ marginTop: '2.5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--card-border)', marginBottom: '2rem' }}>
          <button
            onClick={() => {
              setActiveTab('blogs');
              setEditorMode('list');
              setPage(1);
            }}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              color: activeTab === 'blogs' ? 'var(--primary)' : 'var(--foreground-muted)',
              borderBottom: activeTab === 'blogs' ? '2px solid var(--primary)' : 'none',
              fontWeight: 600,
            }}
          >
            จัดการบทความ (Blogs)
          </button>
          <button
            onClick={() => {
              setActiveTab('comments');
              setPage(1);
            }}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              color: activeTab === 'comments' ? 'var(--primary)' : 'var(--foreground-muted)',
              borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : 'none',
              fontWeight: 600,
            }}
          >
            อนุมัติความเห็น (Comments)
          </button>
        </div>

        {activeTab === 'blogs' ? (
          <>
            {editorMode === 'list' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                    <input
                      type="text"
                      placeholder="ค้นหาตามชื่อเรื่อง..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <button onClick={handleOpenCreate} className="btn btn-primary">
                    เขียน Blog ใหม่
                  </button>
                </div>

                {loading ? (
                  <div className="spinner"></div>
                ) : blogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-muted)' }}>
                    ยังไม่มีบทความในระบบ
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '0.5rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>ชื่อบทความ</th>
                            <th style={{ padding: '1rem' }}>URL Slug</th>
                            <th style={{ padding: '1rem' }}>จำนวนเข้าชม</th>
                            <th style={{ padding: '1rem' }}>สถานะ</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blogs.map((blog) => (
                            <tr key={blog.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '1rem', fontWeight: 500 }}>{blog.title}</td>
                              <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>{blog.slug}</td>
                              <td style={{ padding: '1rem' }}>{blog.views} ครั้ง</td>
                              <td style={{ padding: '1rem' }}>
                                <button
                                  onClick={() => handleTogglePublish(blog)}
                                  className={`badge ${blog.isPublished ? 'badge-success' : 'badge-danger'}`}
                                >
                                  {blog.isPublished ? 'เผยแพร่แล้ว (Publish)' : 'แบบร่าง (Draft)'}
                                </button>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <button onClick={() => handleOpenEdit(blog)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    แก้ไข
                                  </button>
                                  <button onClick={() => handleDeleteBlog(blog.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    ลบ
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="pagination" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className={`pagination-item ${page === 1 ? 'disabled' : ''}`}
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(p - 1, 1))}
                          style={{ borderRadius: '0' }}
                        >
                          &laquo;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            type="button"
                            key={p}
                            className={`pagination-item ${page === p ? 'active' : ''}`}
                            onClick={() => setPage(p)}
                            style={{ borderRadius: '0' }}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
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
              </div>
            ) : (
              <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>
                  {editorMode === 'create' ? 'สร้างบทความใหม่' : 'แก้ไขบทความ'}
                </h2>

                <form onSubmit={handleSaveBlog} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>หัวข้อ Blog</label>
                    <input
                      type="text"
                      placeholder="กรอกชื่อบทความ"
                      value={formTitle}
                      onChange={(e) => {
                        setFormTitle(e.target.value);
                        if (editorMode === 'create') {
                          handleGenerateSlug(e.target.value);
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>URL Slug</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="slug-url-here"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => handleGenerateSlug(formTitle)} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                        สร้างอัตโนมัติ
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>เนื้อหาย่อ (Summary)</label>
                    <textarea
                      rows={2}
                      placeholder="เขียนเนื้อหาอย่างย่อเพื่อแสดงในหน้ารวม..."
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>เนื้อหาเต็ม (Content)</label>
                    <textarea
                      rows={10}
                      placeholder="เขียนเนื้อหาฉบับเต็มของบทความ..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>รูปปก (Cover Image File)</label>
                    {formCoverImage && (
                      <div style={{ marginBottom: '1rem' }}>
                        <img src={formCoverImage} alt="Cover Preview" style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--card-border)' }} />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setFormError('กำลังอัปโหลดรูปปก...');
                            const url = await uploadFile(file);
                            setFormCoverImage(url);
                            setFormError('');
                          } catch {
                            setFormError('อัปโหลดรูปปกไม่สำเร็จ');
                          }
                        }
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)' }}>รูปเพิ่มเติม (สูงสุด 6 รูป)</label>
                      {formAdditionalImages.length < 6 && (
                        <button type="button" onClick={handleAddImageField} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                          + เพิ่มรูป
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {formAdditionalImages.map((imgUrl, idx) => (
                        <div key={idx} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {imgUrl && (
                            <div>
                              <img src={imgUrl} alt={`Extra Preview ${idx + 1}`} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    setFormError(`กำลังอัปโหลดรูปเพิ่มเติมที่ ${idx + 1}...`);
                                    const url = await uploadFile(file);
                                    handleImageChange(idx, url);
                                    setFormError('');
                                  } catch {
                                    setFormError(`อัปโหลดรูปเพิ่มเติมที่ ${idx + 1} ไม่สำเร็จ`);
                                  }
                                }
                              }}
                            />
                            <button type="button" onClick={() => handleRemoveImageField(idx)} className="btn btn-danger" style={{ padding: '0.75rem' }}>
                              ลบ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                    <input
                      type="checkbox"
                      id="isPublishedCheck"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="isPublishedCheck" style={{ cursor: 'pointer', userSelect: 'none' }}>
                      เผยแพร่บทความนี้ทันที (Publish)
                    </label>
                  </div>

                  {formError && (
                    <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                      {formError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary">
                      บันทึกบทความ
                    </button>
                    <button type="button" onClick={() => setEditorMode('list')} className="btn btn-secondary">
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              รายการความคิดเห็นทั้งหมด
            </h2>

            {loading ? (
              <div className="spinner"></div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-muted)' }}>
                ไม่มีความคิดเห็นใดๆ ส่งเข้ามาในขณะนี้
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '0.5rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem' }}>บทความ</th>
                      <th style={{ padding: '1rem' }}>ผู้ส่ง</th>
                      <th style={{ padding: '1rem' }}>ข้อความความคิดเห็น</th>
                      <th style={{ padding: '1rem' }}>สถานะ</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>การอนุมัติ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((comment) => (
                      <tr key={comment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                          <Link href={`/blog/${comment.blog?.slug}`} target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                            {comment.blog?.title}
                          </Link>
                        </td>
                        <td style={{ padding: '1rem' }}>{comment.senderName}</td>
                        <td style={{ padding: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{comment.content}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${comment.isApproved ? 'badge-success' : 'badge-warning'}`}>
                            {comment.isApproved ? 'อนุมัติแล้ว (Approved)' : 'รอการตรวจสอบ (Pending)'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {comment.isApproved ? (
                              <button onClick={() => handleRejectComment(comment.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                Reject (ยกเลิกอนุมัติ)
                              </button>
                            ) : (
                              <button onClick={() => handleApproveComment(comment.id)} className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                Approve (อนุมัติ)
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Metier Blog. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
