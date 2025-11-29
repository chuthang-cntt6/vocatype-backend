// Pronunciation Service for AI-powered pronunciation analysis
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

class PronunciationService {
  /**
   * Phân tích phát âm sử dụng AI (Gemini)
   * @param {string} recognizedText - Text nhận diện được từ Web Speech API
   * @param {string} expectedWord - Từ mong đợi (chuẩn)
   * @param {number} confidence - Độ tin cậy từ Web Speech API (0-1)
   * @returns {Promise<Object>} - Kết quả phân tích với feedback chi tiết
   */
  async analyzePronunciation(recognizedText, expectedWord, confidence = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vocab/analyze-pronunciation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recognizedText,
          expectedWord,
          confidence,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Pronunciation analysis error:', error);
      // Fallback to basic similarity calculation
      return this.fallbackAnalysis(recognizedText, expectedWord);
    }
  }

  /**
   * Fallback analysis khi AI không khả dụng
   */
  fallbackAnalysis(recognizedText, expectedWord) {
    const similarity = this.calculateWordSimilarity(
      recognizedText.toLowerCase().trim(),
      expectedWord.toLowerCase().trim()
    );
    const similarityScore = Math.round(similarity * 100);

    let feedback = '';
    if (similarityScore >= 95) {
      feedback = '🎉 Hoàn hảo! Phát âm rất chính xác!';
    } else if (similarityScore >= 80) {
      feedback = '🌟 Tốt lắm! Phát âm khá chính xác, có thể cải thiện thêm.';
    } else if (similarityScore >= 60) {
      feedback = '👍 Còn hơi sai. Hãy nghe lại và phát âm rõ hơn!';
    } else {
      feedback = '📚 Phát âm chưa đúng. Nghe mẫu và thử lại!';
    }

    return {
      similarityScore,
      feedback,
      detailedFeedback: null,
      suggestions: null,
      pronunciationIssues: null,
      isAI: false,
    };
  }

  /**
   * Calculate word similarity using Levenshtein distance
   */
  calculateWordSimilarity(str1, str2) {
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

    const maxLen = Math.max(str1.length, str2.length);
    return 1 - (matrix[str2.length][str1.length] / maxLen);
  }
}

export default new PronunciationService();

