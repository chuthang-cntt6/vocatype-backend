import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Token không hợp lệ', { autoClose: 3000 });
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp', { autoClose: 3000 });
      return;
    }
    
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự', { autoClose: 3000 });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }
      
      setIsSuccess(true);
      toast.success('Mật khẩu đã được đặt lại thành công!', { autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            Thành công!
          </h1>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#94a3b8', 
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập với mật khẩu mới.
          </p>
          
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff',
              padding: '15px 32px',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
            }}
          >
            Đăng nhập ngay
          </button>
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
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: '#fff', 
            marginBottom: '8px',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Đặt lại mật khẩu
          </h1>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#94a3b8',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#e2e8f0', 
              marginBottom: '10px',
              fontFamily: 'system-ui, sans-serif'
            }}>
              Mật khẩu mới
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput('')}
                placeholder="Nhập mật khẩu mới" 
                type={showPassword ? "text" : "password"}
                required 
                style={{
                  width: '100%', 
                  padding: '14px 48px 14px 48px', 
                  borderRadius: '12px', 
                  border: focusedInput === 'password' ? '2px solid #6366f1' : '2px solid rgba(148, 163, 184, 0.3)', 
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
                stroke={focusedInput === 'password' ? '#6366f1' : '#94a3b8'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.3s', pointerEvents: 'none' }}
              >
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#e2e8f0', 
              marginBottom: '10px',
              fontFamily: 'system-ui, sans-serif'
            }}>
              Xác nhận mật khẩu
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput('')}
                placeholder="Nhập lại mật khẩu mới" 
                type={showConfirmPassword ? "text" : "password"}
                required 
                style={{
                  width: '100%', 
                  padding: '14px 48px 14px 48px', 
                  borderRadius: '12px', 
                  border: focusedInput === 'confirmPassword' ? '2px solid #6366f1' : '2px solid rgba(148, 163, 184, 0.3)', 
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
                stroke={focusedInput === 'confirmPassword' ? '#6366f1' : '#94a3b8'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.3s', pointerEvents: 'none' }}
              >
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showConfirmPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
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
                Đang xử lý...
              </span>
            ) : 'Đặt lại mật khẩu'}
          </button>
        </form>
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
