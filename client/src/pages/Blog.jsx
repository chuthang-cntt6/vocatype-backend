import React, { useState, useMemo, useEffect } from 'react';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { FaCalendarAlt, FaUser, FaEye, FaHeart, FaComment, FaSearch, FaTag, FaArrowRight } from 'react-icons/fa';
// import { motion } from 'framer-motion'; 

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  // filteredPosts sẽ được tính phía dưới sau khi khai báo blogPosts

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Dữ liệu blog mẫu
  const blogPosts = [
    {
      id: 1,
      title: "10 Mẹo Học Từ Vựng Tiếng Anh Hiệu Quả",
      excerpt: "Khám phá những phương pháp học từ vựng tiếng Anh hiệu quả nhất để cải thiện vốn từ của bạn một cách nhanh chóng và bền vững.",
      content: "Học từ vựng tiếng Anh là một trong những thách thức lớn nhất khi học ngôn ngữ này. Trong bài viết này, chúng ta sẽ khám phá 10 mẹo học từ vựng hiệu quả nhất...",
      author: "VocaType Team",
      date: "2024-01-15",
      category: "Học tập",
      tags: ["từ vựng", "tiếng anh", "học tập"],
      readTime: "5 phút",
      views: 1250,
      likes: 89,
      comments: 23,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Luyện Gõ Phím: Từ Cơ Bản Đến Nâng Cao",
      excerpt: "Hướng dẫn chi tiết cách luyện gõ phím từ những bước đầu tiên đến khi thành thạo, giúp bạn tăng tốc độ gõ và độ chính xác.",
      content: "Gõ phím nhanh và chính xác là kỹ năng quan trọng trong thời đại số. Bài viết này sẽ hướng dẫn bạn từng bước để cải thiện kỹ năng gõ phím...",
      author: "VocaType Team",
      date: "2024-01-12",
      category: "Kỹ năng",
      tags: ["gõ phím", "kỹ năng", "luyện tập"],
      readTime: "7 phút",
      views: 980,
      likes: 67,
      comments: 15,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Cách Tạo Đề Thi Trắc Nghiệm Hiệu Quả",
      excerpt: "Hướng dẫn giáo viên cách tạo đề thi trắc nghiệm chất lượng cao, giúp đánh giá học sinh một cách chính xác và công bằng.",
      content: "Tạo đề thi trắc nghiệm hiệu quả là một nghệ thuật. Trong bài viết này, chúng ta sẽ tìm hiểu các nguyên tắc và kỹ thuật để tạo ra những câu hỏi trắc nghiệm chất lượng...",
      author: "VocaType Team",
      date: "2024-01-10",
      category: "Giáo dục",
      tags: ["đề thi", "trắc nghiệm", "giáo dục"],
      readTime: "6 phút",
      views: 756,
      likes: 45,
      comments: 12,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Tâm Lý Học Trong Việc Học Ngôn Ngữ",
      excerpt: "Khám phá những yếu tố tâm lý ảnh hưởng đến quá trình học ngôn ngữ và cách tối ưu hóa chúng để học hiệu quả hơn.",
      content: "Tâm lý học đóng vai trò quan trọng trong việc học ngôn ngữ. Hiểu được những yếu tố tâm lý này sẽ giúp bạn học ngôn ngữ hiệu quả hơn...",
      author: "VocaType Team",
      date: "2024-01-08",
      category: "Tâm lý",
      tags: ["tâm lý", "học tập", "ngôn ngữ"],
      readTime: "8 phút",
      views: 634,
      likes: 38,
      comments: 8,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Công Nghệ AI Trong Giáo Dục Ngôn Ngữ",
      excerpt: "Tìm hiểu về vai trò của trí tuệ nhân tạo trong việc dạy và học ngôn ngữ, và những tiềm năng trong tương lai.",
      content: "Trí tuệ nhân tạo đang thay đổi cách chúng ta học ngôn ngữ. Từ chatbot đến hệ thống đánh giá tự động, AI đang mở ra những cơ hội mới...",
      author: "VocaType Team",
      date: "2024-01-05",
      category: "Công nghệ",
      tags: ["AI", "công nghệ", "giáo dục"],
      readTime: "9 phút",
      views: 892,
      likes: 72,
      comments: 19,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Xây Dựng Thói Quen Học Tập Bền Vững",
      excerpt: "Cách xây dựng và duy trì thói quen học tập hiệu quả, giúp bạn đạt được mục tiêu học tập dài hạn.",
      content: "Thói quen học tập là nền tảng của thành công trong học tập. Trong bài viết này, chúng ta sẽ tìm hiểu cách xây dựng những thói quen học tập bền vững...",
      author: "VocaType Team",
      date: "2024-01-03",
      category: "Thói quen",
      tags: ["thói quen", "học tập", "bền vững"],
      readTime: "6 phút",
      views: 567,
      likes: 41,
      comments: 7,
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&h=300&fit=crop"
    }
  ];
  
  // Tính toán danh sách hiển thị trực tiếp để tránh trạng thái chớp tắt khi resize
  const filteredPosts = useMemo(() => {
    let filtered = blogPosts;
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    return filtered;
  }, [searchTerm, selectedCategory]);

  const categories = ['all', 'Học tập', 'Kỹ năng', 'Giáo dục', 'Tâm lý', 'Công nghệ', 'Thói quen'];

  // NOTE: Không dùng useEffect để set state lọc nhằm tránh lần render trống

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 12px' : '0 20px'
      }}>
        <PageBreadcrumb
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Blog', path: '/blog' }
          ]}
          backgroundColor="rgba(255,255,255,0.2)"
          textColor="#e5e7eb"
          currentTextColor="#ffffff"
          marginBottom={isMobile ? '12px' : '16px'}
          padding={isMobile ? '6px 10px' : '8px 12px'}
          borderRadius={isMobile ? '8px' : '10px'}
        />
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '20px' : isTablet ? '32px' : '40px',
          color: 'white',
          padding: isMobile ? '0 8px' : '0'
        }}>
          <h1 style={{
            fontSize: isMobile ? '1.8rem' : isTablet ? '2.5rem' : '3rem',
            fontWeight: '900',
            marginBottom: isMobile ? '12px' : '16px',
            background: 'linear-gradient(135deg, #fff, #e0e7ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            lineHeight: '1.2'
          }}>
            VocaType Blog
          </h1>
          <p style={{
            fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.2rem',
            opacity: '0.9',
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '600px',
            margin: '0 auto',
            padding: isMobile ? '0 8px' : '0',
            lineHeight: '1.5'
          }}>
            Khám phá những bài viết hay về học tập, kỹ năng và công nghệ giáo dục
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '12px' : isTablet ? '20px' : '24px',
          marginBottom: isMobile ? '24px' : '32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            gap: isMobile ? '10px' : isTablet ? '14px' : '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            {/* Search */}
            <div style={{ 
              flex: isMobile ? 'none' : '1', 
              minWidth: isMobile ? '100%' : '300px',
              width: isMobile ? '100%' : 'auto'
            }}>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: isMobile ? '10px' : '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: isMobile ? '13px' : isTablet ? '14px' : '16px'
                }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: isMobile ? '100%' : '90%',
                    padding: isMobile ? '10px 10px 10px 36px' : isTablet ? '11px 11px 11px 38px' : '12px 12px 12px 40px',
                    border: '2px solid #e2e8f0',
                    borderRadius: isMobile ? '10px' : '12px',
                    fontSize: isMobile ? '14px' : isTablet ? '15px' : '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    WebkitAppearance: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div style={{ 
              minWidth: isMobile ? '100%' : '200px',
              width: isMobile ? '100%' : 'auto'
            }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 14px' : isTablet ? '11px 15px' : '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '14px' : isTablet ? '15px' : '16px',
                  outline: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Tất cả danh mục' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

         {/* Blog Posts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: isMobile ? '12px' : isTablet ? '18px' : '24px',
          marginBottom: isMobile ? '32px' : '40px',
          alignItems: isMobile ? 'start' : 'stretch'
        }}>
           {filteredPosts.map(post => (
             <div key={post.id} style={{
               background: 'rgba(255,255,255,0.95)',
               borderRadius: isMobile ? '12px' : '16px',
               overflow: 'hidden',
               boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
               backdropFilter: 'blur(10px)',
               transition: 'all 0.3s ease',
               cursor: 'pointer',
               // Chống text flicker khi thay đổi layout/resize (GPU composition)
               transform: 'translateZ(0)',
               willChange: 'transform',
               backfaceVisibility: 'hidden',
               // Touch-friendly sizing - loại bỏ minHeight trên mobile
               display: 'flex',
               flexDirection: 'column'
             }}
             onMouseEnter={(e) => {
               if (!isMobile) {
                 e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
                 e.currentTarget.style.transform = 'translateY(-2px)';
               }
             }}
             onMouseLeave={(e) => {
               if (!isMobile) {
                 e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                 e.currentTarget.style.transform = 'translateY(0)';
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
              {/* Image */}
              <div style={{
                height: isMobile ? '160px' : isTablet ? '180px' : '200px',
                background: `url(${post.image}) center/cover`,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: isMobile ? '8px' : '12px',
                  left: isMobile ? '8px' : '12px',
                  background: 'rgba(99, 102, 241, 0.9)',
                  color: 'white',
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  borderRadius: isMobile ? '16px' : '20px',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: '600'
                }}>
                  {post.category}
                </div>
              </div>

               {/* Content */}
               <div style={{ 
                 padding: isMobile ? '12px' : isTablet ? '18px' : '24px', 
                 display: 'flex',
                 flexDirection: 'column'
               }}>
                <h3 style={{
                  fontSize: isMobile ? '1rem' : isTablet ? '1.15rem' : '1.25rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: isMobile ? '8px' : '12px',
                  lineHeight: '1.4'
                }}>
                  {post.title}
                </h3>

                <p style={{
                  color: '#64748b',
                  fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
                  lineHeight: '1.6',
                  marginBottom: isMobile ? '12px' : '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: isMobile ? 2 : isTablet ? 3 : 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: isMobile ? '4px' : '6px',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  {post.tags.slice(0, isMobile ? 2 : 3).map(tag => (
                    <span key={tag} style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: isMobile ? '3px 6px' : '4px 8px',
                      borderRadius: isMobile ? '4px' : '6px',
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: '500'
                    }}>
                      #{tag}
                    </span>
                  ))}
                  {isMobile && post.tags.length > 2 && (
                    <span style={{
                      background: '#e2e8f0',
                      color: '#64748b',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>
                      +{post.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  paddingTop: isMobile ? '12px' : '16px',
                  borderTop: '1px solid #e2e8f0',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '6px' : '0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '6px' : isTablet ? '12px' : '16px',
                    fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px',
                    color: '#64748b',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <FaUser size={isMobile ? 9 : isTablet ? 10 : 12} />
                      <span style={{ fontSize: isMobile ? '10px' : 'inherit' }}>{post.author}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <FaCalendarAlt size={isMobile ? 9 : isTablet ? 10 : 12} />
                      <span style={{ fontSize: isMobile ? '10px' : 'inherit' }}>{formatDate(post.date)}</span>
                    </div>
                    {!isMobile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaEye size={12} />
                        {post.views}
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '6px' : isTablet ? '10px' : '12px',
                    fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px',
                    color: '#64748b',
                    flexWrap: 'wrap'
                  }}>
                    {!isMobile && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaHeart size={12} />
                          {post.likes}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaComment size={12} />
                          {post.comments}
                        </div>
                      </>
                    )}
                    <span style={{
                      background: '#6366f1',
                      color: 'white',
                      padding: isMobile ? '2px 5px' : isTablet ? '3px 6px' : '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      fontSize: isMobile ? '9px' : isTablet ? '10px' : '12px'
                    }}>
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'white'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '16px'
            }}>
              🔍
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '8px'
            }}>
              Không tìm thấy bài viết nào
            </h3>
            <p style={{
              opacity: '0.8'
            }}>
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
