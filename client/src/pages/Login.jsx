import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      setError('Đăng nhập OAuth thất bại. Vui lòng thử lại.');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('token', token); // Sử dụng localStorage thay vì sessionStorage
        login(userData);
        toast.success('Đăng nhập thành công!', {autoClose: 1200});
        const target = userData?.role === 'admin' ? '/admin' : '/dashboard';
        setTimeout(() => navigate(target), 1200);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        setError('Lỗi xử lý dữ liệu đăng nhập');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi đăng nhập');
      if (data.token) localStorage.setItem('token', data.token); // Sử dụng localStorage
      
      // Handle Remember Me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      let freshUser = data.user;
      try {
        const meRes = await fetch('http://localhost:5050/api/auth/users/me', {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        });
        if (meRes.ok) freshUser = await meRes.json();
      } catch {}
      
      login(freshUser);
      toast.success('Đăng nhập thành công!', {autoClose: 1200});
      const target = freshUser?.role === 'admin' ? '/admin' : '/dashboard';
      setTimeout(() => navigate(target), 1200);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'row',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Animated gradient orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 10s ease-in-out infinite reverse' }}></div>
      
      {/* Left side - Branding */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '40px 30px',
        position: 'relative',
        zIndex: 1,
        minWidth: 0
      }} className="left-branding">
        <div style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              minWidth: '56px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              animation: 'glow 2s ease-in-out infinite'
            }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#fff', fontFamily: 'Arial, sans-serif' }}>V</span>
            </div>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>VocaType</span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(32px, 5vw, 48px)', 
            fontWeight: '900', 
            color: '#fff', 
            marginBottom: '20px',
            lineHeight: '1.1',
            letterSpacing: '-1.5px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Nâng Cao<br/>
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Từ Vựng
            </span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(15px, 2vw, 18px)', 
            color: '#94a3b8', 
            lineHeight: '1.6',
            marginBottom: '40px',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Nâng cao kỹ năng ngôn ngữ với luyện gõ thông minh và quản lý từ vựng toàn diện.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', color: '#cbd5e1', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <span style={{ fontWeight: '500' }}>Học Thông Minh</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <span style={{ fontWeight: '500' }}>Theo Dõi Tiến Độ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <span style={{ fontWeight: '500' }}>Đạt Mục Tiêu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        zIndex: 1,
        minWidth: 0
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 'clamp(24px, 5vw, 48px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '800', color: '#fff', marginBottom: '8px', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.5px' }}>
              Chào Mừng Trở Lại
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
              Đăng nhập để tiếp tục hành trình học tập
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#e2e8f0', 
                marginBottom: '10px',
                fontFamily: 'system-ui, sans-serif'
              }}>
                Địa Chỉ Email
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput('')}
                  placeholder="Nhập email của bạn" 
                  type="email" 
                  required 
                  style={{
                    width:'100%', 
                    padding:'14px 16px 14px 48px', 
                    borderRadius:'12px', 
                    border: focusedInput === 'email' ? '2px solid #6366f1' : '2px solid rgba(148, 163, 184, 0.3)', 
                    fontSize:'15px', 
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#f1f5f9',
                    transition:'all 0.3s',
                    outline:'none',
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

            {/* Password Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#e2e8f0', 
                marginBottom: '10px',
                fontFamily: 'system-ui, sans-serif'
              }}>
                Mật Khẩu
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput('')}
                  placeholder="Nhập mật khẩu của bạn" 
                  type={showPassword ? "text" : "password"}
                  required 
                  style={{
                    width:'100%', 
                    padding:'14px 48px 14px 48px', 
                    borderRadius:'12px', 
                    border: focusedInput === 'password' ? '2px solid #6366f1' : '2px solid rgba(148, 163, 184, 0.3)', 
                    fontSize:'15px', 
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#f1f5f9',
                    transition:'all 0.3s',
                    outline:'none',
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

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#6366f1',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="rememberMe" 
                style={{
                  fontSize: '14px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif',
                  userSelect: 'none'
                }}
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background:'rgba(239, 68, 68, 0.15)', 
                color:'#fca5a5', 
                padding:'12px 14px', 
                borderRadius:'12px', 
                marginBottom:'20px', 
                fontSize:'13px', 
                fontWeight:'600',
                border:'1px solid rgba(239, 68, 68, 0.3)',
                animation:'shake 0.5s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                wordBreak: 'break-word',
                fontFamily: 'system-ui, sans-serif'
              }}>
                <span style={{ fontSize: '16px', minWidth: '16px' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width:'100%', 
                background: isLoading ? 'rgba(100, 116, 139, 0.5)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                color:'#fff', 
                padding:'15px', 
                border:'none', 
                borderRadius:'12px', 
                fontWeight:'700', 
                fontSize:'16px', 
                letterSpacing:'0.3px', 
                boxShadow: isLoading ? 'none' : '0 10px 30px rgba(99, 102, 241, 0.4)', 
                transition:'all 0.3s', 
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
                  Đang đăng nhập...
                </span>
              ) : 'Đăng Nhập'}
            </button>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <a 
                href="/forgot-password" 
                style={{ 
                  color: '#a5b4fc', 
                  fontSize: '14px', 
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                  fontFamily: 'system-ui, sans-serif'
                }}
                onMouseEnter={(e) => e.target.style.color = '#c7d2fe'}
                onMouseLeave={(e) => e.target.style.color = '#a5b4fc'}
              >
                Quên mật khẩu?
              </a>
            </div>
          </form>

          {/* OAuth Buttons */}
          <div style={{ margin: '24px 0' }}>
            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/google'}
              style={{
                width: '100%',
                background: '#fff',
                color: '#374151',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>

            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/facebook'}
              style={{
                width: '100%',
                background: '#1877f2',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#166fe5';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#1877f2';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Đăng nhập với Facebook
            </button>
          </div>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            margin: '24px 0' 
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.2)' }}></div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', fontFamily: 'system-ui, sans-serif' }}>hoặc</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.2)' }}></div>
          </div>

          {/* Sign Up Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
              Chưa có tài khoản?{' '}
              <a href="/register" style={{ 
                color: '#a5b4fc', 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                Đăng ký miễn phí
              </a>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        * {
          box-sizing: border-box;
        }
        
        @keyframes slideIn {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 8px 48px rgba(99, 102, 241, 0.5); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
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

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .left-branding {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          body {
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}