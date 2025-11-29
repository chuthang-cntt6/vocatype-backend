import React from 'react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setVisible(scrollY > 200);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check initial position
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => {
    // Khôi phục scroll trước khi scroll
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('dropdown-open');
    
    // Scroll to top với smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <div
      onClick={scrollTop}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '24px',
        zIndex: 99999,
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '20px',
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        opacity: 1,
        transform: 'scale(1)',
        pointerEvents: 'auto',
        visibility: 'visible',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
      }}
      title="Cuộn lên đầu trang"
      aria-label="Cuộn lên đầu trang"
    >
      ↑
    </div>
  );
}


