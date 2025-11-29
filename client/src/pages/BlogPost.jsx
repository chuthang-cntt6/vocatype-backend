import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById } from './blogData';
import { FaArrowLeft, FaCalendarAlt, FaUser } from 'react-icons/fa';

export default function BlogPost() {
  const { id } = useParams();
  const post = getPostById(id);

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: 24, color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link to="/blog" style={{ color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}><FaArrowLeft />Quay lại Blog</Link>
          <h2 style={{ marginTop: 20 }}>Không tìm thấy bài viết</h2>
        </div>
      </div>
    );
  }

  const formatDate = (s) => new Date(s).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg,#667eea,#764ba2)', 
      padding: isMobile ? '12px' : '24px' 
    }}>
      <div style={{ 
        maxWidth: isMobile ? '100%' : isTablet ? '800px' : '900px', 
        margin: '0 auto', 
        background: 'rgba(255,255,255,0.98)', 
        borderRadius: isMobile ? '12px' : '16px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 30px rgba(0,0,0,.12)' 
      }}>
       
        <div style={{ 
          padding: isMobile ? '12px' : '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link to="/blog" style={{ 
            color: '#4f46e5', 
            textDecoration: 'none', 
            fontWeight: 700, 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: isMobile ? '6px' : '8px',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <FaArrowLeft size={isMobile ? 14 : 16} />
            Quay lại Blog
          </Link>
        </div>
        <img 
          src={post.image} 
          alt={post.title} 
          style={{ 
            width: '100%', 
            height: 'auto', 
            aspectRatio: isMobile ? '4/3' : '16 / 9', 
            objectFit: 'cover', 
            display: 'block' 
          }} 
        />
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px', 
            fontWeight: 700, 
            color: '#6366f1', 
            background: '#eef2ff', 
            padding: isMobile ? '3px 8px' : '4px 10px', 
            borderRadius: 999, 
            display: 'inline-block', 
            marginBottom: isMobile ? '8px' : '12px' 
          }}>
            {post.category}
          </div>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            color: '#0f172a',
            fontSize: isMobile ? '1.3rem' : isTablet ? '1.6rem' : '2rem',
            lineHeight: '1.3'
          }}>
            {post.title}
          </h1>
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '16px', 
            alignItems: 'center', 
            color: '#475569', 
            fontSize: isMobile ? '12px' : '14px', 
            marginBottom: isMobile ? '12px' : '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px' }}>
              <FaUser size={isMobile ? 12 : 14} />
              {post.author}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px' }}>
              <FaCalendarAlt size={isMobile ? 12 : 14} />
              {formatDate(post.date)}
            </span>
          </div>
          <p style={{ 
            color: '#334155', 
            lineHeight: isMobile ? 1.6 : 1.7, 
            fontSize: isMobile ? '14px' : '16px', 
            whiteSpace: 'pre-line' 
          }}>
            {post.content}
          </p>
          <div style={{ 
            marginTop: isMobile ? '16px' : '24px', 
            display: 'flex', 
            gap: isMobile ? '6px' : '8px', 
            flexWrap: 'wrap' 
          }}>
            {post.tags.map(t => (
              <span key={t} style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#475569', 
                background: '#f1f5f9', 
                borderRadius: isMobile ? '4px' : '6px', 
                padding: isMobile ? '3px 6px' : '4px 8px' 
              }}>
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


