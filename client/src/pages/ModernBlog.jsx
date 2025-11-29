import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaUser, FaEye, FaHeart, FaComment } from 'react-icons/fa';
import { blogPosts as sourcePosts } from './blogData';
import PageBreadcrumb from '../components/PageBreadcrumb';

export default function ModernBlog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(window.innerWidth <= 768 ? 4 : window.innerWidth <= 1024 ? 6 : 8);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
      setVisibleCount(window.innerWidth <= 768 ? 4 : window.innerWidth <= 1024 ? 6 : 8);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounce search term
  useEffect(() => {
    if (searchTerm === '') {
      setDebouncedSearchTerm('');
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const blogPosts = sourcePosts;

  const categories = ['all', 'Học tập', 'Kỹ năng', 'Giáo dục', 'Tâm lý'];

  const filteredPosts = useMemo(() => {
    let list = blogPosts;
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (selectedCategory !== 'all') list = list.filter(p => p.category === selectedCategory);
    return list;
  }, [debouncedSearchTerm, selectedCategory]);

  const formatDate = (s) => new Date(s).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  const highlight = (text, q) => {
    if (!q) return text;
    try {
      const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi'));
      return parts.map((part, i) => (
        part.toLowerCase() === q.toLowerCase() ? 
          <mark key={i} style={{ background: 'rgba(99,102,241,0.2)', padding: '0 2px', borderRadius: '2px' }}>{part}</mark> 
          : <span key={i}>{part}</span>
      ));
    } catch {
      return text;
    }
  };

  return (
    <div style={{ minHeight: '100vh',  padding: isMobile ? '12px' : '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 0 }}>
        
        <PageBreadcrumb 
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Blog', path: '/blog' }
          ]}
          //backgroundColor="rgba(255,255,255,0.9)"
          textColor="#6b7280"
          currentTextColor="#6366f1"
          marginBottom={isMobile ? '12px' : '24px'}
        />
        
        <header style={{ textAlign: 'center', color: 'rgb(31, 41, 55)', marginBottom: isMobile ? '16px' : '24px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: isMobile ? '1.8rem' : isTablet ? '2.2rem' : '2.4rem', 
            fontWeight: 900, 
            letterSpacing: .3,
            lineHeight: '1.2',
            color: 'rgb(31, 41, 55)'
          }}>VocaType Blog</h1>
          <p style={{ 
            marginTop: 8, 
            opacity: .9,
            fontSize: isMobile ? '0.9rem' : '1rem',
            padding: isMobile ? '0 8px' : '0',
            color: 'rgb(31, 41, 55)'
          }}>Bài viết hay về học tập, kỹ năng và công nghệ giáo dục</p>
        </header>

        <section style={{ 
          background: 'rgba(255,255,255,0.98)', 
          borderRadius: isMobile ? '16px' : '20px', 
          padding: isMobile ? '16px' : '24px', 
          boxShadow: '0 12px 40px rgba(0,0,0,.12)', 
          marginBottom: isMobile ? '20px' : '32px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '16px', 
            flexWrap: 'wrap',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center'
          }}>
            <div style={{ 
              flex: isMobile ? 'none' : '1', 
              minWidth: isMobile ? '100%' : '280px', 
              position: 'relative' 
            }}>
              <FaSearch style={{ 
                position: 'absolute', 
                top: '50%', 
                left: isMobile ? '14px' : '16px', 
                transform: 'translateY(-50%)', 
                color: '#6366f1',
                fontSize: isMobile ? '14px' : '16px',
                transition: 'all 0.3s ease'
              }} />
              <input 
                value={searchTerm} 
                onChange={(e)=>setSearchTerm(e.target.value)} 
                placeholder="Tìm kiếm bài viết, tác giả, hoặc tag..." 
                style={{ 
                  width: isMobile ? '100%' : '90%', 
                  padding: isMobile ? '12px 12px 12px 44px' : '14px 14px 14px 48px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: isMobile ? '12px' : '14px', 
                  fontSize: isMobile ? '14px' : '16px',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.9)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              />
            </div>
            <div style={{ 
              minWidth: isMobile ? '100%' : '200px',
              position: 'relative'
            }}>
              <select 
                value={selectedCategory} 
                onChange={(e)=>setSelectedCategory(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '12px 16px' : '14px 20px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: isMobile ? '12px' : '14px', 
                  fontSize: isMobile ? '14px' : '16px',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.9)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                {categories.map(c => <option key={c} value={c}>{c==='all'?'Tất cả danh mục':c}</option>)}
              </select>
            </div>
          </div>
          
          {/* Search Stats */}
          {debouncedSearchTerm && (
            <div style={{
              marginTop: isMobile ? '12px' : '16px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: isMobile ? '8px' : '10px',
              color: 'white',
              fontSize: isMobile ? '12px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <span>🔍</span>
              <span>Tìm thấy <strong>{filteredPosts.length}</strong> bài viết với từ khóa "<strong>{debouncedSearchTerm}</strong>"</span>
            </div>
          )}
        </section>

        <main style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : `repeat(auto-fit, minmax(${isTablet ? '250px' : '280px'}, 1fr))`, 
          gap: isMobile ? '12px' : isTablet ? '18px' : '24px',
          alignItems: isMobile ? 'start' : 'stretch'
        }}>
          {isSearching && Array.from({ length: Math.min(visibleCount, 6) }).map((_, idx) => (
            <article key={`s-${idx}`} style={{ 
              background: 'rgba(255,255,255,0.98)', 
              borderRadius: isMobile ? '12px' : '16px', 
              overflow: 'hidden', 
              boxShadow: '0 8px 24px rgba(0,0,0,.08)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'pulse 1.2s ease-in-out infinite'
            }}>
              <div style={{ width: '100%', height: isMobile ? '160px' : isTablet ? '180px' : '200px', background: '#eef2ff' }} />
              <div style={{ padding: isMobile ? '12px' : isTablet ? '16px' : '20px' }}>
                <div style={{ height: 16, background: '#e5e7eb', borderRadius: 6, marginBottom: 10, width: '70%' }} />
                <div style={{ height: 12, background: '#e5e7eb', borderRadius: 6, marginBottom: 8, width: '100%' }} />
                <div style={{ height: 12, background: '#e5e7eb', borderRadius: 6, width: '90%' }} />
              </div>
            </article>
          ))}
          {!isSearching && filteredPosts.slice(0, visibleCount).map(p => (
            <article key={p.id} style={{ 
              background: 'rgba(255,255,255,0.98)', 
              borderRadius: isMobile ? '12px' : '16px', 
              overflow: 'hidden', 
              boxShadow: '0 8px 24px rgba(0,0,0,.08)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)';
              }
            }}
            onTouchStart={(e) => {
              if (isMobile) {
                e.currentTarget.style.transform = 'scale(0.98)';
              }
            }}
            onTouchEnd={(e) => {
              if (isMobile) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}>
              <div style={{
                width: '100%',
                height: isMobile ? '160px' : isTablet ? '180px' : '200px',
                background: `url(${p.image}) center/cover`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                }} />
                <div style={{
                  position: 'absolute',
                  top: isMobile ? '8px' : '12px',
                  left: isMobile ? '8px' : '12px',
                  background: 'rgba(99, 102, 241, 0.9)',
                  color: 'white',
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  borderRadius: isMobile ? '16px' : '20px',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {p.category}
                </div>
              </div>
              <div style={{ 
                padding: isMobile ? '12px' : isTablet ? '16px' : '20px', 
                display: 'flex', 
                flexDirection: 'column'
              }}>
                <Link to={`/blog/${p.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#0f172a', 
                    fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.2rem', 
                    lineHeight: 1.35,
                    fontWeight: '700'
                  }}>{highlight(p.title, debouncedSearchTerm)}</h3>
                </Link>
                <p style={{ 
                  margin: 0, 
                  color: '#475569', 
                  lineHeight: 1.55,
                  fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
                  display: '-webkit-box',
                  WebkitLineClamp: isMobile ? 2 : isTablet ? 3 : 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{highlight(p.excerpt, debouncedSearchTerm)}</p>
                <div style={{ 
                  display: 'flex', 
                  gap: isMobile ? '4px' : '6px', 
                  flexWrap: 'wrap', 
                  marginTop: isMobile ? '8px' : '12px'
                }}>
                  {p.tags.slice(0, isMobile ? 2 : 3).map(t => (
                    <button
                      key={t}
                      onClick={() => setSearchTerm(t)}
                      style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        color: '#475569', 
                        background: '#f1f5f9', 
                        borderRadius: isMobile ? '4px' : '6px', 
                        padding: isMobile ? '3px 6px' : '4px 8px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>#{t}</button>
                  ))}
                  {isMobile && p.tags.length > 2 && (
                    <span style={{
                      fontSize: '10px',
                      color: '#64748b',
                      background: '#e2e8f0',
                      borderRadius: '4px',
                      padding: '3px 6px'
                    }}>
                      +{p.tags.length - 2}
                    </span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'flex-start' : 'center', 
                  borderTop: '1px solid #e2e8f0', 
                  marginTop: isMobile ? '12px' : '14px', 
                  paddingTop: isMobile ? '10px' : '12px', 
                  color: '#64748b', 
                  fontSize: isMobile ? '10px' : '12px',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '6px' : '0'
                }}>
                  <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaUser size={isMobile ? 9 : 12} />{p.author}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaCalendarAlt size={isMobile ? 9 : 12} />{formatDate(p.date)}</span>
                  </div>
                  {!isMobile && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaEye size={12} />{p.views}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaHeart size={12} />{p.likes}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaComment size={12} />{p.comments}</span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </main>

        {!isSearching && filteredPosts.length > visibleCount && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button
              onClick={() => setVisibleCount(c => c + (isMobile ? 4 : 6))}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(99, 102, 241, 0.3)'
              }}
            >Tải thêm</button>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#fff', 
            padding: isMobile ? '32px 16px' : '40px',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <div style={{
              fontSize: isMobile ? '3rem' : '4rem',
              marginBottom: isMobile ? '12px' : '16px'
            }}>
              🔍
            </div>
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              marginBottom: isMobile ? '6px' : '8px'
            }}>
              Không tìm thấy bài viết nào
            </h3>
            <p style={{
              opacity: '0.8',
              fontSize: isMobile ? '12px' : '14px'
            }}>
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </p>
          </div>
        )}
      </div>
      {/* Scroll to top button */}
      <div id="scroll-to-top-slot" />
    </div>
  );
}


