import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [schoolName, setSchoolName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, school_name: schoolName, specialty, bio })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi đăng ký');
      toast.success('Đăng ký thành công! Chuyển đến trang đăng nhập...', {autoClose: 2000});
      setTimeout(() => navigate('/login'), 2500);
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
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 10s ease-in-out infinite reverse' }}></div>
      
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
              background: 'linear-gradient(135deg, #22c55e, #6366f1)', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
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
            Bắt Đầu<br/>
            <span style={{ background: 'linear-gradient(135deg, #22c55e, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Hành Trình Học
            </span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(15px, 2vw, 18px)', 
            color: '#94a3b8', 
            lineHeight: '1.6',
            marginBottom: '40px',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Tạo tài khoản để trải nghiệm hệ thống học từ vựng thông minh và hiệu quả.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', color: '#cbd5e1', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎓</span>
              <span style={{ fontWeight: '500' }}>Học Miễn Phí</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontWeight: '500' }}>Nhanh Chóng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🔒</span>
              <span style={{ fontWeight: '500' }}>Bảo Mật</span>
            </div>
          </div>
        </div>
      </div>

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
          maxWidth: '500px',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 'clamp(24px, 5vw, 40px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '800', color: '#fff', marginBottom: '8px', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.5px' }}>
              Đăng Ký Tài Khoản
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
              Điền thông tin để tạo tài khoản mới
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#e2e8f0', 
                marginBottom: '8px',
                fontFamily: 'system-ui, sans-serif'
              }}>
                Họ và Tên
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  value={name} 
                  onChange={e=>setName(e.target.value)}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput('')}
                  placeholder="Nhập họ và tên" 
                  type="text" 
                  required 
                  style={{
                    width:'100%', 
                    padding:'12px 16px 12px 44px', 
                    borderRadius:'12px', 
                    border: focusedInput === 'name' ? '2px solid #22c55e' : '2px solid rgba(148, 163, 184, 0.3)', 
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
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke={focusedInput === 'name' ? '#22c55e' : '#94a3b8'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.3s', pointerEvents: 'none' }}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#e2e8f0', 
                marginBottom: '8px',
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
                    padding:'12px 16px 12px 44px', 
                    borderRadius:'12px', 
                    border: focusedInput === 'email' ? '2px solid #22c55e' : '2px solid rgba(148, 163, 184, 0.3)', 
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
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke={focusedInput === 'email' ? '#22c55e' : '#94a3b8'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.3s', pointerEvents: 'none' }}
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
                  <polyline points="3 7 12 13 21 7"/>
                </svg>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#e2e8f0', 
                marginBottom: '8px',
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
                  placeholder="Tạo mật khẩu" 
                  type={showPassword ? "text" : "password"}
                  required 
                  style={{
                    width:'100%', 
                    padding:'12px 44px 12px 44px', 
                    borderRadius:'12px', 
                    border: focusedInput === 'password' ? '2px solid #22c55e' : '2px solid rgba(148, 163, 184, 0.3)', 
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
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke={focusedInput === 'password' ? '#22c55e' : '#94a3b8'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.3s', pointerEvents: 'none' }}
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '14px', 
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            <div style={{ marginBottom: '18px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#e2e8f0', 
                marginBottom: '8px',
                fontFamily: 'system-ui, sans-serif'
              }}>
                Vai Trò
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <select 
                  value={role} 
                  onChange={e=>setRole(e.target.value)}
                  onFocus={() => setFocusedInput('role')}
                  onBlur={() => setFocusedInput('')}
                  style={{
                    width:'100%', 
                    padding:'12px 16px 12px 44px', 
                    borderRadius:'12px', 
                    border: focusedInput === 'role' ? '2px solid #22c55e' : '2px solid rgba(148, 163, 184, 0.3)', 
                    fontSize:'15px', 
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#f1f5f9',
                    transition:'all 0.3s',
                    outline:'none',
                    boxSizing: 'border-box',
                    fontFamily: 'system-ui, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none'
                  }}
                >
                  <option value="learner" style={{ background: '#1e293b', color: '#f1f5f9' }}>Học viên</option>
                  <option value="teacher" style={{ background: '#1e293b', color: '#f1f5f9' }}>Giáo viên</option>
                </select>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke={focusedInput === 'role' ? '#22c55e' : '#94a3b8'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.3s', pointerEvents: 'none' }}
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {role === 'teacher' && (
              <>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#e2e8f0', 
                    marginBottom: '8px',
                    fontFamily: 'system-ui, sans-serif'
                  }}>
                    Tên Trường
                  </label>
                  <input 
                    value={schoolName} 
                    onChange={e=>setSchoolName(e.target.value)}
                    placeholder="Nhập tên trường" 
                    type="text" 
                    required 
                    style={{
                      width:'100%', 
                      padding:'12px 16px', 
                      borderRadius:'12px', 
                      border: '2px solid rgba(148, 163, 184, 0.3)', 
                      fontSize:'15px', 
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: '#f1f5f9',
                      transition:'all 0.3s',
                      outline:'none',
                      boxSizing: 'border-box',
                      fontFamily: 'system-ui, sans-serif'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#e2e8f0', 
                    marginBottom: '8px',
                    fontFamily: 'system-ui, sans-serif'
                  }}>
                    Chuyên Môn
                  </label>
                  <input 
                    value={specialty} 
                    onChange={e=>setSpecialty(e.target.value)}
                    placeholder="Nhập chuyên môn" 
                    type="text" 
                    required 
                    style={{
                      width:'100%', 
                      padding:'12px 16px', 
                      borderRadius:'12px', 
                      border: '2px solid rgba(148, 163, 184, 0.3)', 
                      fontSize:'15px', 
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: '#f1f5f9',
                      transition:'all 0.3s',
                      outline:'none',
                      boxSizing: 'border-box',
                      fontFamily: 'system-ui, sans-serif'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#e2e8f0', 
                    marginBottom: '8px',
                    fontFamily: 'system-ui, sans-serif'
                  }}>
                    Giới Thiệu Bản Thân
                  </label>
                  <textarea 
                    value={bio} 
                    onChange={e=>setBio(e.target.value)}
                    placeholder="Viết vài dòng giới thiệu về bạn..." 
                    required 
                    style={{
                      width:'100%', 
                      padding:'12px 16px', 
                      borderRadius:'12px', 
                      border: '2px solid rgba(148, 163, 184, 0.3)', 
                      fontSize:'15px', 
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: '#f1f5f9',
                      transition:'all 0.3s',
                      outline:'none',
                      boxSizing: 'border-box',
                      fontFamily: 'system-ui, sans-serif',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </>
            )}

            {error && (
              <div style={{
                background:'rgba(239, 68, 68, 0.15)', 
                color:'#fca5a5', 
                padding:'12px 14px', 
                borderRadius:'12px', 
                marginBottom:'18px', 
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

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width:'100%', 
                background: isLoading ? 'rgba(100, 116, 139, 0.5)' : 'linear-gradient(135deg, #22c55e 0%, #6366f1 100%)', 
                color:'#fff', 
                padding:'14px', 
                border:'none', 
                borderRadius:'12px', 
                fontWeight:'700', 
                fontSize:'16px', 
                letterSpacing:'0.3px', 
                boxShadow: isLoading ? 'none' : '0 10px 30px rgba(34, 197, 94, 0.4)', 
                transition:'all 0.3s', 
                cursor: isLoading ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'system-ui, sans-serif'
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.5)')}
              onMouseLeave={(e) => !isLoading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.4)')}
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
                  Đang đăng ký...
                </span>
              ) : 'Đăng Ký'}
            </button>
          </form>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            margin: '20px 0' 
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.2)' }}></div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', fontFamily: 'system-ui, sans-serif' }}>hoặc</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.2)' }}></div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
              Đã có tài khoản?{' '}
              <a href="/login" style={{ 
                color: '#86efac', 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                Đăng nhập ngay
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
          0%, 100% { box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 8px 48px rgba(34, 197, 94, 0.5); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
          }
          @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
          input::placeholder,
    textarea::placeholder {
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

    div::-webkit-scrollbar {
      width: 8px;
    }
    
    div::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.4);
      border-radius: 10px;
    }
    
    div::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.3);
      border-radius: 10px;
    }
    
    div::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.5);
    }

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