import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }
      
      setIsSubmitted(true);
      toast.success('Email khôi phục mật khẩu đã được gửi!', { autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ 
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '48px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #10b981, #059669)', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s infinite'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: '#fff', 
            marginBottom: '16px',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Kiểm tra email của bạn
          </h1>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#94a3b8', 
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Chúng tôi đã gửi link khôi phục mật khẩu đến <strong style={{ color: '#a5b4fc' }}>{email}</strong>
          </p>
          
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#6ee7b7',
              margin: 0
            }}>
              💡 <strong>Lưu ý:</strong> Kiểm tra cả hộp thư spam nếu không thấy email
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#a5b4fc',
                padding: '12px 24px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(99, 102, 241, 0.2)';
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
            >
              Quay lại đăng nhập
            </button>
            
            <button
              onClick={() => {
                setEmail('');
                setIsSubmitted(false);
              }}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Gửi lại email
            </button>
          </div>
        </div>
        
        <ToastContainer position="top-center" />
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 10s ease-in-out infinite reverse' }}></div>
      
      <div style={{ 
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '48px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#94a3b8',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(148, 163, 184, 0.2)';
            e.target.style.color = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(148, 163, 184, 0.1)';
            e.target.style.color = '#94a3b8';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
              <polyline points="3 7 12 13 21 7"/>
            </svg>
          </div>
          
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: '#fff', 
            marginBottom: '8px',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Quên mật khẩu?
          </h1>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#94a3b8',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Nhập email để nhận link khôi phục mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#e2e8f0', 
              marginBottom: '10px',
              fontFamily: 'system-ui, sans-serif'
            }}>
              Địa chỉ email
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput('')}
                placeholder="Nhập email của bạn" 
                type="email" 
                required 
                style={{
                  width: '100%', 
                  padding: '14px 16px 14px 48px', 
                  borderRadius: '12px', 
                  border: focusedInput === 'email' ? '2px solid #6366f1' : '2px solid rgba(148, 163, 184, 0.3)', 
                  fontSize: '15px', 
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#f1f5f9',
                  transition: 'all 0.3s',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'system-ui, sans-serif'
                }}
              />
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24"
                fill="none" 
                stroke={focusedInput === 'email' ? '#6366f1' : '#94a3b8'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.3s', pointerEvents: 'none' }}
              >
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
                <polyline points="3 7 12 13 21 7"/>
              </svg>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%', 
              background: isLoading ? 'rgba(100, 116, 139, 0.5)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              color: '#fff', 
              padding: '15px', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '700', 
              fontSize: '16px', 
              letterSpacing: '0.3px', 
              boxShadow: isLoading ? 'none' : '0 10px 30px rgba(99, 102, 241, 0.4)', 
              transition: 'all 0.3s', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'system-ui, sans-serif'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.5)')}
            onMouseLeave={(e) => !isLoading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)')}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '18px', 
                  height: '18px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTopColor: '#fff', 
                  borderRadius: '50%', 
                  animation: 'spin 0.8s linear infinite' 
                }}></span>
                Đang gửi...
              </span>
            ) : 'Gửi link khôi phục'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
            Nhớ mật khẩu?{' '}
            <a href="/login" style={{ 
              color: '#a5b4fc', 
              fontWeight: '600', 
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}>
              Đăng nhập
            </a>
          </p>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #64748b;
          opacity: 1;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #f1f5f9 !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(15, 23, 42, 0.6) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
