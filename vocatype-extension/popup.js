document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  
  let searchWord = localStorage.getItem('selectedWord') || '';
  let results = [];
  let selectedResult = null;
  let isPlaying = false;
  let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  let suggestions = []; // Lưu gợi ý
  
  localStorage.removeItem('selectedWord');

  const createUI = () => {
    root.innerHTML = `
      <div style="
        width: 420px;
        height: 600px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <div id="header" style="
          background: rgba(255,255,255,0.98);
          padding: 20px 24px 16px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        ">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <div style="
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              font-weight: bold;
              color: white;
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            ">V</div>
            <div style="flex: 1;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #1f2937; letter-spacing: -0.5px;">
                VocaType Dictionary
              </h2>
              <p style="margin: 0; font-size: 11px; color: #6b7280; font-weight: 500;">
                TOEIC Vocabulary Assistant
              </p>
            </div>
            <button id="openApp" style="
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              color: white;
              border: none;
              padding: 8px 14px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            ">📚 App</button>
          </div>

          <!-- Search Input with Dropdown -->
          <div style="position: relative;">
            <input 
              id="searchInput" 
              type="text" 
              placeholder="Type to search..."
              value="${searchWord}"
              style="
                width: 100%;
                padding: 14px 50px 14px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 15px;
                outline: none;
                background: #f9fafb;
                box-sizing: border-box;
              "
            />
            <div style="
              position: absolute;
              right: 8px;
              top: 50%;
              transform: translateY(-50%);
              display: flex;
              gap: 4px;
            ">
              <button id="clearBtn" style="
                background: transparent;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 6px;
                border-radius: 6px;
                display: ${searchWord ? 'flex' : 'none'};
                align-items: center;
              ">✕</button>
              <button id="searchBtn" style="
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
              ">🔍</button>
            </div>

            <!-- Suggestions Dropdown -->
            <div id="suggestions" style="
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: white;
              border: 2px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 12px 12px;
              max-height: 200px;
              overflow-y: auto;
              display: none;
              z-index: 1000;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            "></div>
          </div>

          <!-- Recent Searches -->
          <div id="recentContainer" style="
            margin-top: 12px;
            display: ${recentSearches.length > 0 && !selectedResult ? 'block' : 'none'};
          ">
            <p style="
              margin: 0 0 8px 0;
              font-size: 11px;
              color: #6b7280;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">Recent</p>
            <div id="recentList" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
          </div>
        </div>

        <div id="content" style="
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        "></div>
      </div>
    `;

    renderRecentSearches();
    
    if (searchWord) {
      searchVocab(searchWord);
    } else {
      showEmptyState();
    }

    // Event listeners
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    // Live search với debounce
    searchInput.addEventListener('input', (e) => {
      searchWord = e.target.value.trim();
      document.getElementById('clearBtn').style.display = searchWord ? 'flex' : 'none';
      
      clearTimeout(searchTimeout);
      
      if (searchWord.length >= 2) {
        // Hiện loading trong suggestions
        showSuggestionsLoading();
        
        searchTimeout = setTimeout(() => {
          fetchSuggestions(searchWord);
        }, 300); // Nhanh hơn để responsive
      } else {
        hideSuggestions();
        if (!searchWord) {
          showEmptyState();
          renderRecentSearches();
        }
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const word = e.target.value.trim();
        if (word) {
          hideSuggestions();
          searchVocab(word);
        }
      }
    });

    // Click outside to close suggestions
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#searchInput') && !e.target.closest('#suggestions')) {
        hideSuggestions();
      }
    });

    document.getElementById('searchBtn').addEventListener('click', () => {
      const word = searchInput.value.trim();
      if (word) {
        hideSuggestions();
        searchVocab(word);
      }
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      searchInput.value = '';
      searchWord = '';
      selectedResult = null;
      results = [];
      document.getElementById('clearBtn').style.display = 'none';
      hideSuggestions();
      showEmptyState();
      renderRecentSearches();
    });

    document.getElementById('openApp').addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000/flashcard' });
    });
  };

  const fetchSuggestions = async (word) => {
    try {
      const res = await fetch(`http://localhost:3000/api/vocab/search?word=${encodeURIComponent(word)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (!res.ok) throw new Error('Không tìm thấy');

      const data = await res.json();
      
      if (data && data.length > 0) {
        suggestions = data.slice(0, 5); // Lấy tối đa 5 gợi ý
        renderSuggestions();
      } else {
        hideSuggestions();
      }
    } catch (err) {
      hideSuggestions();
    }
  };

  const renderSuggestions = () => {
    const suggestionsDiv = document.getElementById('suggestions');
    
    if (suggestions.length === 0) {
      hideSuggestions();
      return;
    }

    suggestionsDiv.style.display = 'block';
    suggestionsDiv.innerHTML = suggestions.map(item => `
      <div class="suggestion-item" data-word="${item.word}" style="
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.2s;
      " 
      onmouseover="this.style.background='#f9fafb'"
      onmouseout="this.style.background='white'"
      >
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 2px;">
          ${item.word}
          ${item.phonetic ? `<span style="color: #9ca3af; font-weight: 400; font-size: 13px; margin-left: 8px;">/${item.phonetic}/</span>` : ''}
        </div>
        <div style="font-size: 13px; color: #6b7280;">
          ${item.meaning.substring(0, 50)}${item.meaning.length > 50 ? '...' : ''}
        </div>
      </div>
    `).join('');

    // Add click events
    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const word = item.dataset.word;
        document.getElementById('searchInput').value = word;
        searchWord = word;
        hideSuggestions();
        searchVocab(word);
      });
    });
  };

  const showSuggestionsLoading = () => {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.style.display = 'block';
    suggestionsDiv.innerHTML = `
      <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 13px;">
        🔍 Searching...
      </div>
    `;
  };

  const hideSuggestions = () => {
    document.getElementById('suggestions').style.display = 'none';
  };

  const renderRecentSearches = () => {
    const recentList = document.getElementById('recentList');
    const recentContainer = document.getElementById('recentContainer');
    
    if (!recentList || !recentContainer) return;
    
    recentContainer.style.display = recentSearches.length > 0 && !selectedResult ? 'block' : 'none';
    
    recentList.innerHTML = recentSearches.map(word => `
      <button class="recent-word" data-word="${word}" style="
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        color: #374151;
        cursor: pointer;
        font-weight: 500;
      ">${word}</button>
    `).join('');

    document.querySelectorAll('.recent-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = e.target.dataset.word;
        document.getElementById('searchInput').value = word;
        searchWord = word;
        searchVocab(word);
      });
    });
  };

  const searchVocab = async (word) => {
    const content = document.getElementById('content');
    
    content.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div style="
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255,255,255,0.2);
          border-top: 5px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 20px;
        "></div>
        <p style="color: white; font-size: 15px; font-weight: 600; margin: 0;">
          Searching vocabulary...
        </p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    try {
      const res = await fetch(`http://localhost:3000/api/vocab/search?word=${encodeURIComponent(word)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (!res.ok) throw new Error('Không tìm thấy từ');

      const data = await res.json();
      
      if (data && data.length > 0) {
        results = data;
        selectedResult = data[0];
        
        recentSearches = [word, ...recentSearches.filter(w => w !== word)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        
        renderResult();
      } else {
        showError('Không tìm thấy từ trong từ điển TOEIC');
      }
    } catch (err) {
      showError(err.message || 'Lỗi kết nối server');
    }
  };

  const renderResult = () => {
    const content = document.getElementById('content');
    const result = selectedResult;
    
    content.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      ">
        <div style="border-bottom: 2px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 20px;">
          <h3 style="
            margin: 0 0 12px 0;
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -1px;
          ">${result.word}</h3>
          
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            ${result.phonetic ? `
              <span style="
                color: #64748b;
                font-size: 16px;
                font-weight: 600;
                font-family: monospace;
              ">/${result.phonetic}/</span>
            ` : ''}
            
            <button id="playAudioBtn" style="
              background: linear-gradient(135deg, #eef2ff, #e0e7ff);
              color: #4338ca;
              border: none;
              border-radius: 10px;
              padding: 8px 14px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
              box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
            ">🔊 Listen</button>

            ${result.grammar || result.word_type ? `
              <span style="
                background: linear-gradient(135deg, #fef3c7, #fde68a);
                color: #92400e;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
              ">${result.grammar || result.word_type}</span>
            ` : ''}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="
            margin: 0 0 10px 0;
            font-size: 12px;
            font-weight: 700;
            color: #6366f1;
            text-transform: uppercase;
          ">📖 Vietnamese Meaning</h4>
          <p style="
            margin: 0;
            font-size: 16px;
            line-height: 1.7;
            color: #1f2937;
            font-weight: 500;
          ">${result.meaning}</p>
        </div>

        ${result.example_sentence || result.example_vi ? `
          <div style="
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
            border-left: 4px solid #10b981;
          ">
            <h4 style="
              margin: 0 0 10px 0;
              font-size: 12px;
              font-weight: 700;
              color: #059669;
              text-transform: uppercase;
            ">💡 Example</h4>
            ${result.example_sentence ? `
              <p style="
                margin: 0 0 8px 0;
                font-size: 14px;
                font-style: italic;
                color: #065f46;
                line-height: 1.6;
              ">"${result.example_sentence}"</p>
            ` : ''}
            ${result.example_vi ? `
              <p style="
                margin: 0;
                font-size: 13px;
                color: #047857;
                font-weight: 500;
              ">→ ${result.example_vi}</p>
            ` : ''}
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button id="addFlashcardBtn" style="
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 14px 20px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          ">➕ Add Flashcard</button>
          
          <button id="practiceBtn" style="
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 14px 20px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          ">📚 Practice Now</button>
        </div>
      </div>
    `;

    document.getElementById('playAudioBtn').addEventListener('click', () => playAudio());
    document.getElementById('addFlashcardBtn').addEventListener('click', () => addToFlashcard());
    document.getElementById('practiceBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000/flashcard' });
    });
  };

  const playAudio = () => {
    if (isPlaying) return;
    isPlaying = true;

    const result = selectedResult;

    if (!result.audio_url) {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(result.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.onend = () => { isPlaying = false; };
        utterance.onerror = () => { isPlaying = false; };
        speechSynthesis.speak(utterance);
      }
      return;
    }

    const audio = new Audio(result.audio_url);
    audio.addEventListener('ended', () => { isPlaying = false; });
    audio.addEventListener('error', () => {
      isPlaying = false;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(result.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.onend = () => { isPlaying = false; };
        speechSynthesis.speak(utterance);
        isPlaying = true;
      }
    });
    audio.play().catch(() => { isPlaying = false; });
  };

  const addToFlashcard = () => {
    const flashcards = JSON.parse(localStorage.getItem('pendingFlashcards') || '[]');
    flashcards.push(selectedResult);
    localStorage.setItem('pendingFlashcards', JSON.stringify(flashcards));
    
    const toast = document.createElement('div');
    toast.textContent = '✅ Đã thêm vào flashcard!';
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;font-weight:600;z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const showError = (message) => {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div style="
        background: rgba(239, 68, 68, 0.95);
        color: white;
        padding: 20px 24px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
      ">
        <div style="font-size: 32px; margin-bottom: 12px;">😢</div>
        <p style="margin: 0; font-size: 15px; font-weight: 600; line-height: 1.5;">
          ${message}
        </p>
      </div>
    `;
  };

  const showEmptyState = () => {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: white;">
        <div style="font-size: 64px; margin-bottom: 16px;">📚</div>
        <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">
          Ready to Learn!
        </h3>
        <p style="margin: 0; font-size: 14px; opacity: 0.9; line-height: 1.6;">
          Start typing to see suggestions<br/>or highlight text on any webpage
        </p>
      </div>
    `;
  };

  createUI();
});