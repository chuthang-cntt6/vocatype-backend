import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const BulkCreateModal = ({ onClose, onCreate }) => {
  const [cards, setCards] = useState([
    { word: '', definition: '', example1: '', example2: '', phonetic: '', note: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const addCard = () => {
    setCards(prev => [...prev, { word: '', definition: '', example1: '', example2: '', phonetic: '', note: '' }]);
  };

  const removeCard = (index) => {
    if (cards.length > 1) {
      setCards(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index, field, value) => {
    setCards(prev => prev.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validCards = cards.filter(card => card.word.trim() && card.definition.trim());
    
    if (validCards.length === 0) {
      alert('Vui lòng nhập ít nhất một flashcard hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await onCreate(validCards);
    } catch (error) {
      console.error('Error bulk creating cards:', error);
      alert('Có lỗi xảy ra khi tạo flashcard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: window.innerWidth < 768 ? '10px' : '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: window.innerWidth < 768 ? '12px' : '16px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        width: '100%',
        maxWidth: window.innerWidth < 768 ? '100%' : '1400px',
        maxHeight: window.innerWidth < 768 ? '98vh' : '95vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: window.innerWidth < 768 ? '15px' : '25px'
        }}>
          <h2 style={{
            fontSize: window.innerWidth < 768 ? '20px' : '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            Tạo flashcards
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#6b7280';
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Scrollable Content */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            marginBottom: window.innerWidth < 768 ? '15px' : '20px',
            minHeight: '0'
          }}>
            {/* Table Header */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: window.innerWidth < 768 ? '10px' : '15px',
              marginBottom: window.innerWidth < 768 ? '15px' : '20px',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 
                  ? '35px 0.8fr 1fr 0.8fr 0.7fr 0.8fr 35px'
                  : '45px 1fr 1.2fr 1fr 0.8fr 1fr 45px',
                gap: window.innerWidth < 768 ? '6px' : '8px',
                alignItems: 'center',
                fontWeight: '600',
                color: '#374151',
                fontSize: window.innerWidth < 768 ? '11px' : '13px',
                minWidth: '0'
              }}>
                <div>#</div>
                <div>Từ mới *</div>
                <div>Định nghĩa *</div>
                <div>Ví dụ</div>
                <div>Phiên âm</div>
                <div>Ghi chú</div>
                <div>Thao tác</div>
              </div>
            </div>

          {/* Cards */}
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 
                  ? '35px 0.8fr 1fr 0.8fr 0.7fr 0.8fr 35px'
                  : '45px 1fr 1.2fr 1fr 0.8fr 1fr 45px',
                gap: window.innerWidth < 768 ? '6px' : '8px',
                alignItems: 'center',
                padding: window.innerWidth < 768 ? '10px' : '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '10px',
                background: 'white',
                minWidth: '0'
              }}
            >
              {/* Row Number */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#6366f1',
                color: 'white',
                width: window.innerWidth < 768 ? '20px' : '25px',
                height: window.innerWidth < 768 ? '20px' : '25px',
                borderRadius: '50%',
                fontSize: window.innerWidth < 768 ? '12px' : '14px',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>

              {/* Word */}
              <input
                type="text"
                value={card.word}
                onChange={(e) => updateCard(index, 'word', e.target.value)}
                placeholder="Nhập từ..."
                style={{
                  padding: window.innerWidth < 768 ? '6px 8px' : '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: window.innerWidth < 768 ? '12px' : '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minWidth: '0',
                  overflow: 'hidden'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              {/* Definition */}
              <input
                type="text"
                value={card.definition}
                onChange={(e) => updateCard(index, 'definition', e.target.value)}
                placeholder="Nhập định nghĩa..."
                style={{
                  padding: window.innerWidth < 768 ? '6px 8px' : '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: window.innerWidth < 768 ? '12px' : '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minWidth: '0',
                  overflow: 'hidden'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              {/* Example */}
              <input
                type="text"
                value={card.example1}
                onChange={(e) => updateCard(index, 'example1', e.target.value)}
                placeholder="Ví dụ..."
                style={{
                  padding: window.innerWidth < 768 ? '6px 8px' : '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: window.innerWidth < 768 ? '12px' : '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minWidth: '0',
                  overflow: 'hidden'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              {/* Phonetic */}
              <input
                type="text"
                value={card.phonetic}
                onChange={(e) => updateCard(index, 'phonetic', e.target.value)}
                placeholder="/kʊk/"
                style={{
                  padding: window.innerWidth < 768 ? '6px 8px' : '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: window.innerWidth < 768 ? '12px' : '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minWidth: '0',
                  overflow: 'hidden'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              {/* Note */}
              <input
                type="text"
                value={card.note}
                onChange={(e) => updateCard(index, 'note', e.target.value)}
                placeholder="Ghi chú..."
                style={{
                  padding: window.innerWidth < 768 ? '6px 8px' : '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: window.innerWidth < 768 ? '12px' : '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minWidth: '0',
                  overflow: 'hidden'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeCard(index)}
                disabled={cards.length === 1}
                style={{
                  background: cards.length === 1 ? '#f3f4f6' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: cards.length === 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  width: window.innerWidth < 768 ? '20px' : '25px',
                  height: window.innerWidth < 768 ? '20px' : '25px',
                  borderRadius: '50%',
                  cursor: cards.length === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (cards.length > 1) {
                    e.target.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <FaTrash size={10} />
              </button>
            </div>
          ))}

          </div>

          {/* Add Card Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={addCard}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
              }}
            >
              <FaPlus /> Thêm dòng
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#6b7280',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#6b7280';
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                }
              }}
            >
              {loading ? 'Đang xử lý...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkCreateModal;
