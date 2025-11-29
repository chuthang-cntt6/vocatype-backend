// AI Service for intelligent search using Gemini 2.0
class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyAVAY-gb3O1nZH1Di7yKKA0Xe95cJj_Da4';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Tìm kiếm thông minh sử dụng AI để tìm các từ/cụm từ liên quan
   * 
   * THUẬT TOÁN XỬ LÝ:
   * 1. Gọi Gemini API (mô hình ngôn ngữ lớn) để lấy các từ liên quan:
   *    - Gemini sử dụng kiến thức được huấn luyện trên lượng lớn dữ liệu văn bản
   *    - Dựa vào ngữ nghĩa, từ vựng, và ngữ cảnh để tìm: đồng nghĩa, tương tự, biến thể
   *    - Không có cơ sở dữ liệu từ vựng riêng, hoàn toàn dựa vào khả năng hiểu ngôn ngữ của AI
   * 2. Với mỗi item trong danh sách, tính điểm relevance (aiScore) dựa trên:
   *    - Exact match: +1.0 (title) hoặc +0.8 (description)
   *    - Related terms match: +0.6 (title) hoặc +0.4 (description) mỗi từ liên quan
   *    - Partial match: +0.3 (title) hoặc +0.2 (description) cho từng từ trong searchTerm
   *    - Fuzzy matching (Levenshtein distance): +0.5 * similarity nếu similarity > 60%
   * 3. Lọc các item có aiScore > 0.1 và sắp xếp giảm dần theo score
   * 4. Fallback: Nếu API fail → sử dụng tìm kiếm thông thường (exact match)
   * 
   * @param {string} searchTerm - Từ khóa tìm kiếm
   * @param {Array} availableItems - Danh sách các item có sẵn để tìm kiếm
   * @returns {Promise<Array>} - Danh sách các item phù hợp với AI scoring
   */
  async intelligentSearch(searchTerm, availableItems) {
    if (!searchTerm.trim()) {
      return availableItems;
    }

    try {
      // Gọi Gemini API để tìm các từ liên quan
      const relatedTerms = await this.getRelatedTerms(searchTerm);
      
      // Tạo scoring system cho từng item
      const scoredItems = availableItems.map(item => {
        const score = this.calculateRelevanceScore(
          searchTerm, 
          relatedTerms, 
          item.title, 
          item.description || ''
        );
        return { ...item, aiScore: score };
      });

      // Sắp xếp theo score và trả về
      return scoredItems
        .filter(item => item.aiScore > 0.1) // Chỉ trả về items có score > 0.1
        .sort((a, b) => b.aiScore - a.aiScore);
        
    } catch (error) {
      console.error('AI Search Error:', error);
      // Fallback về tìm kiếm thông thường nếu AI fail
      return this.fallbackSearch(searchTerm, availableItems);
    }
  }

  /**
   * Lấy các từ liên quan từ Gemini API
   * 
   * CÁCH THỨC HOẠT ĐỘNG:
   * - Gửi prompt đến Gemini 2.0 với yêu cầu tìm từ liên quan
   * - Gemini sử dụng kiến thức được huấn luyện từ hàng tỷ từ trong dữ liệu:
   *   + Từ điển, sách, bài báo, tài liệu học tập tiếng Anh
   *   + Hiểu ngữ nghĩa, mối quan hệ giữa các từ
   *   + Phân tích ngữ cảnh học tập để đưa ra từ phù hợp
   * - Không cần cơ sở dữ liệu từ vựng riêng, Gemini tự động tìm dựa trên kiến thức đã học
   * - Trả về danh sách các từ: đồng nghĩa, tương tự, biến thể, liên quan ngữ cảnh
   */
  async getRelatedTerms(searchTerm) {
    const prompt = `
    Tìm các từ/cụm từ liên quan đến "${searchTerm}" trong ngữ cảnh học tiếng Anh và flashcard.
    
    QUAN TRỌNG: Nếu từ khóa là tiếng Việt, hãy trả về cả từ tiếng Anh tương đương và các từ liên quan.
    Ví dụ: "trường học" → trả về: school, education, academy, institution, learning, university
    
    Trả về danh sách các từ liên quan, bao gồm:
    - Từ đồng nghĩa (cả tiếng Việt và tiếng Anh nếu có)
    - Từ có nghĩa tương tự
    - Từ dịch/tương đương giữa các ngôn ngữ
    - Từ có thể liên quan trong ngữ cảnh học tập
    - Các biến thể của từ gốc
    
    Chỉ trả về danh sách các từ, mỗi từ một dòng, không cần giải thích hay số thứ tự.
    `;

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const relatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse các từ liên quan từ response
      return relatedText
        .split('\n')
        .map(term => term.trim().toLowerCase())
        .filter(term => term.length > 0 && term !== searchTerm.toLowerCase());
        
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Fallback: tạo một số từ liên quan cơ bản
      return this.generateBasicRelatedTerms(searchTerm);
    }
  }

  /**
   * Tính điểm relevance cho một item
   */
  calculateRelevanceScore(searchTerm, relatedTerms, title, description) {
    const searchLower = searchTerm.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = (description || '').toLowerCase();
    
    let score = 0;

    // Exact match - điểm cao nhất
    if (titleLower.includes(searchLower)) {
      score += 1.0;
    }
    if (descLower.includes(searchLower)) {
      score += 0.8;
    }

    // Related terms matching
    relatedTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 0.6;
      }
      if (descLower.includes(term)) {
        score += 0.4;
      }
    });

    // Partial match scoring
    const searchWords = searchLower.split(' ');
    searchWords.forEach(word => {
      if (word.length > 2) {
        if (titleLower.includes(word)) {
          score += 0.3;
        }
        if (descLower.includes(word)) {
          score += 0.2;
        }
      }
    });

    // Fuzzy matching cho các từ gần đúng
    const fuzzyScore = this.calculateFuzzyScore(searchLower, titleLower);
    score += fuzzyScore * 0.5;

    return Math.min(score, 2.0); // Cap at 2.0
  }

  /**
   * Tính fuzzy score cho các từ gần đúng
   */
  calculateFuzzyScore(searchTerm, target) {
    if (searchTerm === target) return 1.0;
    
    // Levenshtein distance based scoring
    const distance = this.levenshteinDistance(searchTerm, target);
    const maxLength = Math.max(searchTerm.length, target.length);
    
    if (maxLength === 0) return 0;
    
    const similarity = 1 - (distance / maxLength);
    return similarity > 0.6 ? similarity : 0;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Fallback search khi AI không hoạt động
   */
  fallbackSearch(searchTerm, availableItems) {
    const searchLower = searchTerm.toLowerCase();
    return availableItems.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Tạo các từ liên quan cơ bản khi API fail
   */
  generateBasicRelatedTerms(searchTerm) {
    const term = searchTerm.toLowerCase();
    const related = [];
    
    // Thêm các biến thể cơ bản
    if (term.endsWith('s')) {
      related.push(term.slice(0, -1));
    } else {
      related.push(term + 's');
    }
    
    // Thêm các từ có thể liên quan
    const commonRelated = {
      'english': ['tiếng anh', 'english', 'eng'],
      'vocabulary': ['từ vựng', 'vocab', 'words'],
      'grammar': ['ngữ pháp', 'grammar'],
      'toeic': ['toeic', 'test', 'exam'],
      'practice': ['luyện tập', 'practice', 'exercise']
    };
    
    Object.entries(commonRelated).forEach(([key, values]) => {
      if (term.includes(key) || values.some(v => term.includes(v))) {
        related.push(...values);
      }
    });
    
    return [...new Set(related)]; // Remove duplicates
  }

  /**
   * Kiểm tra xem AI service có sẵn sàng không
   */
  isAvailable() {
    return this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY';
  }
}

export default new AIService();
