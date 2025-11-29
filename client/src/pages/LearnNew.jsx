// LearnNew.jsx - Quy trình học từ vựng theo chủ đề (3 giai đoạn)
import React, { useEffect, useState, useContext } from 'react';
import { FaSearch, FaVolumeUp, FaMicrophone, FaArrowRight, FaCheckCircle, FaBullseye } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import pronunciationService from '../services/pronunciationService';

// Constants for phases
const PHASES = {
  INTRODUCTION: 'introduction',  // Giai đoạn 1: Giới thiệu từ mới
  PRACTICE: 'practice',           // Giai đoạn 2: Luyện tập
  APPLICATION: 'application',     // Giai đoạn 3: Ứng dụng
  SUMMARY: 'summary'             // Tổng kết
};

// Practice modes
const PRACTICE_MODES = {
  IMAGE_CHOICE: 'image_choice',     // Nhận dạng hình ảnh
  LISTENING: 'listening',            // Nghe - chọn nghĩa
  TYPING: 'typing'                  // Điền từ
};

// Application modes
const APPLICATION_MODES = {
  SENTENCE_COMPLETION: 'sentence_completion',  // Điền từ vào câu
  SPEAKING: 'speaking'                         // Luyện nói
};

// Template sentences for generating fallback examples
const SENTENCE_TEMPLATES = [
  (word, meaning) => `This is ${word}. It means "${meaning}".`,
  (word, meaning) => `Can you give me ${word}?`,
  (word, meaning) => `I need ${word} for this.`,
  (word, meaning) => `Do you have ${word}?`,
  (word, meaning) => `I want ${word}.`,
  (word, meaning) => `Please bring me ${word}.`,
  (word, meaning) => `${word} is very useful.`,
  (word, meaning) => `I'm looking for ${word}.`,
  (word, meaning) => `${word} is what I need.`,
  (word, meaning) => `Could you show me ${word}?`,
  (word, meaning) => `Where is the ${word}?`,
  (word, meaning) => `I'd like some ${word}.`,
  (word, meaning) => `Is there any ${word} here?`,
  (word, meaning) => `I need to find ${word}.`,
  (word, meaning) => `${word} seems interesting.`,
  (word, meaning) => `Let me try ${word}.`,
  (word, meaning) => `${word} is important.`,
  (word, meaning) => `I prefer ${word}.`,
  (word, meaning) => `${word} looks good.`,
  (word, meaning) => `What about ${word}?`
];

export default function LearnNew() {
  const { user } = useContext(AuthContext);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  
  // Phase states
  const [currentPhase, setCurrentPhase] = useState(PHASES.INTRODUCTION);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  
  // Practice states
  const [practiceMode, setPracticeMode] = useState(PRACTICE_MODES.IMAGE_CHOICE);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState([]);
  
  // Application states
  const [applicationMode, setApplicationMode] = useState(APPLICATION_MODES.SENTENCE_COMPLETION);
  const [applicationIndex, setApplicationIndex] = useState(0);
  const [sentenceInput, setSentenceInput] = useState('');
  const [applicationScore, setApplicationScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [applicationSentences, setApplicationSentences] = useState({}); // Store generated sentences
  
  // General states
  const [search, setSearch] = useState('');
  const [showContinueModal, setShowContinueModal] = useState(false);
  
  // Speech recognition and pronunciation analysis
  const [recognitionResult, setRecognitionResult] = useState('');
  const [pronunciationFeedback, setPronunciationFeedback] = useState('');
  const [pronunciationDetails, setPronunciationDetails] = useState(null); // AI feedback details
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  
  // ✅ Tracking Writing only (Speaking chưa có tính năng)
  const [writingCounts, setWritingCounts] = useState({}); // {vocabId: count}
  
  // Fetch topics on mount
  useEffect(() => {
    fetch('/api/topics')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTopics(data);
        else setTopics([]);
      })
      .catch(() => setTopics([]));
  }, []);

  // Fetch chapters when topic selected
  useEffect(() => {
    if (selectedTopic) {
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/chapters/topic/${selectedTopic}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setChapters(data.data);
            setSelectedChapter(null);
          } else {
            setChapters([]);
          }
        })
        .catch(() => setChapters([]));
    }
  }, [selectedTopic]);

  // Fetch vocabulary when chapter selected
  useEffect(() => {
    if (selectedChapter) {
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/chapters/${selectedChapter}/vocabulary`)
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setVocabList(data.data);
            setCurrentWordIndex(0);
            setCurrentPhase(PHASES.INTRODUCTION);
            setWordsLearned(0);
            setPracticeScore(0);
            setApplicationScore(0);
            setApplicationSentences({});
          } else {
            setVocabList([]);
          }
        })
        .catch(() => setVocabList([]));
    }
  }, [selectedChapter]);

  // Handle next word in introduction phase
  const handleNextWord = () => {
    if (currentWordIndex + 1 < vocabList.length) {
      setCurrentWordIndex(currentWordIndex + 1);
      setWordsLearned(wordsLearned + 1);
    } else {
      // Finished introduction phase
      setShowContinueModal(true);
    }
  };

  // Start practice phase
  const startPracticePhase = () => {
    setCurrentPhase(PHASES.PRACTICE);
    setPracticeMode(PRACTICE_MODES.IMAGE_CHOICE);
    setPracticeIndex(0);
    setPracticeScore(0);
    // Initialize practiceAnswers with empty strings for TYPING mode
    setPracticeAnswers(new Array(vocabList.length).fill(''));
    setShowContinueModal(false);
  };

  // Generate random choices for practice
  const generateChoices = (correctWord) => {
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    const choices = [correctWord];
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      if (shuffled[i].id !== correctWord.id) {
        choices.push(shuffled[i]);
      }
    }
    return choices.sort(() => 0.5 - Math.random());
  };

  // Handle practice answer
  const handlePracticeAnswer = (isCorrect) => {
    if (isCorrect) {
      setPracticeScore(practiceScore + 1);
      toast.success('Đúng rồi! ✅', { autoClose: 1000 });
    } else {
      toast.error('Sai rồi! ❌', { autoClose: 1000 });
    }
    
    // Only track boolean results for non-typing modes
    if (practiceMode !== PRACTICE_MODES.TYPING) {
      const newAnswers = [...practiceAnswers, isCorrect];
      setPracticeAnswers(newAnswers);
    }
    
    setTimeout(() => {
      // Check if finished current practice mode
      if (practiceIndex + 1 >= vocabList.length) {
        // Move to next practice mode
        if (practiceMode === PRACTICE_MODES.IMAGE_CHOICE) {
          setPracticeMode(PRACTICE_MODES.LISTENING);
          setPracticeIndex(0);
          // Clear answers for new mode
          const emptyAnswers = new Array(vocabList.length).fill('');
          setPracticeAnswers(emptyAnswers);
        } else if (practiceMode === PRACTICE_MODES.LISTENING) {
          setPracticeMode(PRACTICE_MODES.TYPING);
          setPracticeIndex(0);
          // Clear answers for new mode
          const emptyAnswers = new Array(vocabList.length).fill('');
          setPracticeAnswers(emptyAnswers);
        } else {
          // Finished all practice modes - transition to APPLICATION phase
          startApplicationPhase();
        }
      } else {
        setPracticeIndex(practiceIndex + 1);
        // Clear input for TYPING mode when moving to next question
        if (practiceMode === PRACTICE_MODES.TYPING) {
          const newAnswers = [...practiceAnswers];
          newAnswers[practiceIndex + 1] = '';
          setPracticeAnswers(newAnswers);
        }
      }
    }, 1500);
  };

  // Generate AI sentence for a word
  const generateAISentence = async (word, meaning) => {
    try {
      console.log(`🔍 Calling AI API for: ${word}`);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/vocab/generate-sentence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, meaning })
      });
      
      console.log(`📡 Response status: ${response.status}`);
      const data = await response.json();
      console.log(`📝 Response data:`, data);
      
      if (data.error) {
        console.error(`❌ API Error for ${word}:`, data.error);
        return null;
      }
      
      if (data.sentence) {
        console.log(`✅ Got sentence for ${word}: ${data.sentence}`);
        return data.sentence;
      } else {
        console.warn(`⚠️ No sentence in response for ${word}`, data);
        
        // Check if sentence is null explicitly
        if (data.sentence === null) {
          console.error(`❌ Server returned sentence: null for ${word}`);
        }
        
        return null;
      }
    } catch (error) {
      console.error('❌ Error generating AI sentence:', error);
      return null;
    }
  };

  // Start application phase
  const startApplicationPhase = async () => {
    // Generate sentences for all words at the start
    const sentences = {};
    
    // Show loading toast
    toast.info('Đang tạo câu AI (không có fallback)...', { autoClose: 3000 });
    
    // Generate AI sentences for ALL words - ONLY AI, NO FALLBACK
    for (const wordObj of vocabList) {
      // Only use AI - no fallback whatsoever
      const aiSentence = await generateAISentence(wordObj.word, wordObj.meaning);
      
      if (aiSentence && aiSentence.trim() !== '') {
        sentences[wordObj.word] = aiSentence.trim();
      } else {
        console.error(`AI failed to generate sentence for: ${wordObj.word}`);
      }
    }
    
    const successCount = Object.keys(sentences).length;
    
    if (successCount === 0) {
      toast.error('Không tạo được câu nào! Vui lòng kiểm tra API key.', { autoClose: 4000 });
      return;
    }
    
    if (successCount < vocabList.length) {
      toast.warning(`Chỉ tạo được ${successCount}/${vocabList.length} câu AI!`, { autoClose: 3000 });
    } else {
      toast.success(`Đã tạo thành công ${successCount} câu AI!`, { autoClose: 2000 });
    }
    
    setApplicationSentences(sentences);
    
    setCurrentPhase(PHASES.APPLICATION);
    setApplicationMode(APPLICATION_MODES.SENTENCE_COMPLETION);
    setApplicationIndex(0);
    setApplicationScore(0);
    setSentenceInput('');
    setIsRecording(false);
  };

  // Handle sentence completion
  const handleSentenceSubmit = () => {
    const currentWord = vocabList[applicationIndex];
    const isCorrect = sentenceInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    
    if (isCorrect) {
      toast.success('Đúng rồi! ✅', { autoClose: 1000 });
      setApplicationScore(applicationScore + 1);
      
      // ✅ Track writing (điền câu ví dụ đúng)
      setWritingCounts(prev => ({
        ...prev,
        [currentWord.id]: (prev[currentWord.id] || 0) + 1
      }));
    } else {
      toast.error(`Đáp án đúng: ${currentWord.word}`, { autoClose: 2000 });
    }
    
    setSentenceInput('');
    
    setTimeout(() => {
      if (applicationIndex + 1 < vocabList.length) {
        setApplicationIndex(applicationIndex + 1);
      } else {
        // Check if finished sentence completion, move to speaking or summary
        if (applicationMode === APPLICATION_MODES.SENTENCE_COMPLETION) {
          // Move to speaking practice
          setApplicationMode(APPLICATION_MODES.SPEAKING);
          setApplicationIndex(0);
        } else {
          // Finished all application modes
          setCurrentPhase(PHASES.SUMMARY);
        }
      }
    }, 2000);
  };

  // Initialize Speech Recognition
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!', { autoClose: 3000 });
      return;
    }
    
    setIsRecording(true);
    setRecognitionResult('');
    setPronunciationFeedback('');
    toast.info('Bắt đầu ghi âm...', { autoClose: 2000 });
    
    // Use WebKit speech recognition (Chrome, Edge, Opera)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    
    recognition.onstart = () => {
      setRecognitionActive(true);
      toast.info('Đang lắng nghe... Hãy phát âm!', { autoClose: 1000 });
    };
    
    recognition.onresult = async (event) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const currentWord = vocabList[applicationIndex];
      
      setRecognitionResult(transcript);
      await analyzePronunciation(transcript, currentWord.word, confidence);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setRecognitionActive(false);
      
      if (event.error === 'no-speech') {
        toast.warning('Không có âm thanh được phát hiện. Vui lòng thử lại!', { autoClose: 3000 });
      } else if (event.error === 'network') {
        toast.error('Lỗi kết nối mạng!', { autoClose: 3000 });
      } else {
        toast.error('Có lỗi xảy ra!', { autoClose: 3000 });
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      setRecognitionActive(false);
      
      if (recognitionResult) {
        toast.success('Đã thu âm xong!', { autoClose: 2000 });
      }
    };
    
    recognition.start();
    
    // Store recognition instance
    window.currentRecognition = recognition;
  };

  const stopRecording = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      window.currentRecognition = null;
    }
    setIsRecording(false);
    setRecognitionActive(false);
  };

  // Analyze pronunciation with AI feedback
  const analyzePronunciation = async (recognizedText, expectedWord, confidence) => {
    setIsAnalyzing(true);
    setPronunciationDetails(null);
    
    try {
      // Call AI pronunciation service
      const analysisResult = await pronunciationService.analyzePronunciation(
        recognizedText,
        expectedWord,
        confidence
      );
      
      const { similarityScore, feedback, detailedFeedback, suggestions, pronunciationIssues, isAI } = analysisResult;
      
      // Update state with AI results
      setPronunciationDetails({
        detailedFeedback,
        suggestions,
        pronunciationIssues,
        isAI
      });
      
      // Show toast based on score
      if (similarityScore >= 95) {
        toast.success(feedback, { autoClose: 2000 });
        setApplicationScore(applicationScore + 1);
      } else if (similarityScore >= 80) {
        toast.info(feedback, { autoClose: 2000 });
        setApplicationScore(applicationScore + 1);
      } else if (similarityScore >= 60) {
        toast.warning(feedback, { autoClose: 3000 });
      } else {
        toast.error(feedback, { autoClose: 3000 });
      }
      
      // Set feedback text
      const feedbackText = isAI 
        ? `Nhận diện: "${recognizedText}" | Độ chính xác: ${similarityScore}% ${isAI ? '🤖 AI' : ''}`
        : `Nhận diện: "${recognizedText}" | Độ chính xác: ${similarityScore}%`;
      
      setPronunciationFeedback(feedbackText);
      
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      // Fallback to basic analysis
      const recognizedLower = recognizedText.toLowerCase().trim();
      const expectedLower = expectedWord.toLowerCase().trim();
      const similarity = calculateWordSimilarity(recognizedLower, expectedLower);
      const similarityScore = Math.round(similarity * 100);
      
      let feedback = '';
      if (similarityScore >= 95) {
        feedback = '🎉 Hoàn hảo! Phát âm rất chính xác!';
        toast.success(feedback, { autoClose: 2000 });
        setApplicationScore(applicationScore + 1);
      } else if (similarityScore >= 80) {
        feedback = '🌟 Tốt lắm! Phát âm khá chính xác, có thể cải thiện thêm.';
        toast.info(feedback, { autoClose: 2000 });
        setApplicationScore(applicationScore + 1);
      } else if (similarityScore >= 60) {
        feedback = '👍 Còn hơi sai. Hãy nghe lại và phát âm rõ hơn!';
        toast.warning(feedback, { autoClose: 3000 });
      } else {
        feedback = '📚 Phát âm chưa đúng. Nghe mẫu và thử lại!';
        toast.error(feedback, { autoClose: 3000 });
      }
      
      setPronunciationFeedback(
        `Nhận diện: "${recognizedText}" | Độ chính xác: ${similarityScore}%`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate word similarity using Levenshtein distance
  const calculateWordSimilarity = (str1, str2) => {
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
  };

  // Handle speaking practice
  const handleSpeakingPractice = () => {
    if (!recognitionResult) {
      toast.warning('Vui lòng ghi âm phát âm của bạn trước!', { autoClose: 2000 });
      return;
    }
    
    setTimeout(() => {
      if (applicationIndex + 1 < vocabList.length) {
        setApplicationIndex(applicationIndex + 1);
        setRecognitionResult('');
        setPronunciationFeedback('');
        setPronunciationDetails(null);
      } else {
        // Finished application phase
        setCurrentPhase(PHASES.SUMMARY);
      }
    }, 2000);
  };

  // Reset and start over
  const resetLesson = () => {
    setCurrentPhase(PHASES.INTRODUCTION);
    setCurrentWordIndex(0);
    setWordsLearned(0);
    setPracticeMode(PRACTICE_MODES.IMAGE_CHOICE);
    setPracticeIndex(0);
    setPracticeScore(0);
    setApplicationMode(APPLICATION_MODES.SENTENCE_COMPLETION);
    setApplicationIndex(0);
    setApplicationScore(0);
    setSentenceInput('');
    setPracticeAnswers([]);
    setIsRecording(false);
    
    // ✅ Reset tracking
    setWritingCounts({});
  };

  // Main content based on phase
  const renderContent = () => {
    // Always render the same structure to avoid hooks issues
    // Topic selection
    if (!selectedTopic) {
      const filteredTopics = topics.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase())
      );
      
      return (
        <div className="learn-container" style={{
          minHeight: '100vh',
          // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px'
        }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
          textColor="#6b7280"
          currentTextColor="#6366f1"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Học từ mới', path: '/learn-new' }
            ]}
          />
          
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '30px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '900',
                color: '#1f2937',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                🎓 Học từ mới
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '30px'
              }}>
                Học từ vựng theo quy trình 3 giai đoạn: Giới thiệu → Luyện tập → Ứng dụng
              </p>
              
              {/* Search */}
              <div style={{
                position: 'relative',
                marginBottom: '30px'
              }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '20px'
                }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm chủ đề..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 56px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              {/* Topics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {filteredTopics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>
                      📚
                    </div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#1e293b',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      {topic.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      textAlign: 'center',
                      margin: '0 0 16px 0'
                    }}>
                      {topic.description}
                    </p>
                    <div style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>
                      Bắt đầu học
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Chapter selection
    if (selectedTopic && !selectedChapter) {
      const selectedTopicData = topics.find(t => t.id === selectedTopic);
      
      return (
        <div className="learn-container" style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px'
        }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
            textColor="rgba(255,255,255,0.8)"
            currentTextColor="white"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Học từ mới', path: '/learn-new' },
              { label: selectedTopicData?.title || 'Chọn chương', path: '#' }
            ]}
          />
          
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <button
              onClick={() => setSelectedTopic(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: 'white',
                cursor: 'pointer',
                marginBottom: '20px',
                fontWeight: '600'
              }}
            >
              ← Quay lại
            </button>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '30px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '900',
                color: '#1e293b',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                {selectedTopicData?.title || 'Chọn chương'}
              </h1>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
                marginTop: '30px'
              }}>
                {chapters.map(chapter => (
                  <div
                    key={chapter.id}
                    onClick={() => setSelectedChapter(chapter.id)}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      {chapter.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      marginBottom: '16px'
                    }}>
                      {chapter.description}
                    </p>
                    <div style={{
                      color: '#22c55e',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaBullseye /> {chapter.vocab_count} từ vựng
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Learning phases
    const currentWord = vocabList[currentWordIndex];
    
    switch (currentPhase) {
      case PHASES.INTRODUCTION:
        return renderIntroductionPhase(currentWord);
      case PHASES.PRACTICE:
        return renderPracticePhase();
      case PHASES.APPLICATION:
        return renderApplicationPhase();
      case PHASES.SUMMARY:
        return renderSummaryPhase();
      default:
        return null;
    }
  };

  // Render Introduction Phase (Giai đoạn 1)
  const renderIntroductionPhase = (word) => {
    if (!word) return null;
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
      }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Học từ mới', path: '/learn-new' }
          ]}
        />
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#1e293b'
              }}>
                Giai đoạn 1: Giới thiệu từ mới
              </h2>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                Từ {currentWordIndex + 1} / {vocabList.length}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '10px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                height: '100%',
                width: `${((currentWordIndex + 1) / vocabList.length) * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          {/* Word Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            {/* Image */}
            {word.image_url && (
              <div style={{ marginBottom: '30px' }}>
                <img
                  src={word.image_url}
                  alt={word.word}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }}
                />
              </div>
            )}
            
            {/* Word */}
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              {word.word}
            </h1>
            
            {/* Phonetic */}
            {word.phonetic && (
              <div style={{
                fontSize: '24px',
                color: '#6366f1',
                fontWeight: '600',
                marginBottom: '20px',
                fontFamily: 'monospace'
              }}>
                /{word.phonetic}/
              </div>
            )}
            
            {/* Audio */}
            <button
              onClick={() => {
                let played = false; // Flag to prevent double playing
                
                const speakWithTTS = () => {
                  if (!played) {
                    played = true;
                    const utterance = new SpeechSynthesisUtterance(word.word);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                  }
                };
                
                if (word.audio_url) {
                  const audio = new Audio(word.audio_url);
                  
                  // Handle error when audio file fails to load
                  audio.addEventListener('error', () => {
                    console.warn('Audio file not found, using TTS fallback');
                    speakWithTTS();
                  });
                  
                  // Try to play the audio, fallback to TTS on error
                  audio.play().catch(err => {
                    console.error('Error playing audio:', err);
                    speakWithTTS();
                  });
                } else {
                  speakWithTTS();
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                fontSize: '24px',
                cursor: 'pointer',
                marginBottom: '20px',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
              }}
            >
              <FaVolumeUp />
            </button>
            
            {/* Meaning */}
            <div style={{
              fontSize: '28px',
              color: '#4b5563',
              fontWeight: '600',
              marginBottom: '30px'
            }}>
              {word.meaning}
            </div>
            
            {/* Example */}
            {word.example && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '30px',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#22c55e',
                    margin: 0
                  }}>
                    Ví dụ
                  </h4>
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#4b5563',
                  lineHeight: '1.6'
                }}>
                  {word.example}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleNextWord}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Tiếp tục <FaArrowRight />
              </button>
              
              <button
                onClick={() => {
                  setCurrentPhase(PHASES.PRACTICE);
                  setPracticeMode(PRACTICE_MODES.IMAGE_CHOICE);
                  setPracticeIndex(0);
                }}
                style={{
                  background: 'transparent',
                  color: '#6366f1',
                  border: '2px solid #6366f1',
                  borderRadius: '16px',
                  padding: '14px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Bỏ qua → Luyện tập
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Practice Phase (Giai đoạn 2)
  const renderPracticePhase = () => {
    const currentWord = vocabList[practiceIndex];
    if (!currentWord) return null;
    
    const choices = generateChoices(currentWord);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
      }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Học từ mới', path: '/learn-new' }
          ]}
        />
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              Giai đoạn 2: Luyện tập
            </h2>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                Câu {practiceIndex + 1} / {vocabList.length}
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                Điểm: {practiceScore}
              </div>
            </div>
          </div>
          
          {/* Question Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            {practiceMode === PRACTICE_MODES.IMAGE_CHOICE && (
              <>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  marginBottom: '30px'
                }}>
                  Chọn từ đúng với nghĩa:
                </h3>
                <div style={{
                  fontSize: '36px',
                  color: '#6366f1',
                  fontWeight: '700',
                  marginBottom: '40px'
                }}>
                  {currentWord.meaning}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  {choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePracticeAnswer(choice.id === currentWord.id)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '16px',
                        padding: '20px',
                        fontSize: '24px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))';
                        e.currentTarget.style.color = '#1e293b';
                      }}
                    >
                      {choice.word}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {practiceMode === PRACTICE_MODES.LISTENING && (
              <>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  marginBottom: '30px'
                }}>
                  Nghe và chọn nghĩa đúng:
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                  <button
                    onClick={() => {
                      let played = false; // Flag to prevent double playing
                      
                      const speakWithTTS = () => {
                        if (!played) {
                          played = true;
                          const utterance = new SpeechSynthesisUtterance(currentWord.word);
                          utterance.lang = 'en-US';
                          utterance.rate = 0.9;
                          window.speechSynthesis.speak(utterance);
                        }
                      };
                      
                      if (currentWord.audio_url) {
                        const audio = new Audio(currentWord.audio_url);
                        
                        // Handle error when audio file fails to load
                        audio.addEventListener('error', () => {
                          console.warn('Audio file not found, using TTS fallback');
                          speakWithTTS();
                        });
                        
                        // Try to play the audio, fallback to TTS on error
                        audio.play().catch(err => {
                          console.error('Error playing audio:', err);
                          speakWithTTS();
                        });
                      } else {
                        speakWithTTS();
                      }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '100px',
                      height: '100px',
                      fontSize: '48px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                    }}
                  >
                    <FaVolumeUp />
                  </button>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  {choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePracticeAnswer(choice.id === currentWord.id)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '16px',
                        padding: '20px',
                        fontSize: '20px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))';
                        e.currentTarget.style.color = '#1e293b';
                      }}
                    >
                      {choice.meaning}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {practiceMode === PRACTICE_MODES.TYPING && (
              <>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  marginBottom: '30px'
                }}>
                  Nhập từ tiếng Anh cho nghĩa:
                </h3>
                <div style={{
                  fontSize: '36px',
                  color: '#6366f1',
                  fontWeight: '700',
                  marginBottom: '40px'
                }}>
                  {currentWord.meaning}
                </div>
                <input
                  type="text"
                  placeholder="Nhập từ..."
                  value={practiceAnswers[practiceIndex] || ''}
                  onChange={(e) => {
                    const answers = [...practiceAnswers];
                    answers[practiceIndex] = e.target.value;
                    setPracticeAnswers(answers);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePracticeAnswer(e.target.value.trim().toLowerCase() === currentWord.word.toLowerCase());
                    }
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '16px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    fontSize: '20px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                />
                <button
                  onClick={() => {
                    const userAnswer = practiceAnswers[practiceIndex] || '';
                    handlePracticeAnswer(userAnswer.trim().toLowerCase() === currentWord.word.toLowerCase());
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Kiểm tra
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Application Phase (Giai đoạn 3)
  const renderApplicationPhase = () => {
    const currentWord = vocabList[applicationIndex];
    if (!currentWord) return null;
    
    // Get pre-generated sentence for this word - ONLY AI, NO FALLBACK
    const sentence = applicationSentences[currentWord.word];
    
    // If no AI sentence, skip this word
    if (!sentence) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 20px'
        }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
            textColor="rgba(255,255,255,0.8)"
            currentTextColor="white"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Học từ mới', path: '/learn-new' }
            ]}
          />
          
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#ef4444',
                marginBottom: '10px'
              }}>
                Không có câu AI cho: "{currentWord.word}"
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                marginBottom: '30px'
              }}>
                AI không thể tạo câu cho từ này. Vui lòng kiểm tra lại.
              </p>
              <button
                onClick={() => {
                  if (applicationIndex + 1 < vocabList.length) {
                    setApplicationIndex(applicationIndex + 1);
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Bỏ qua từ này
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Replace the word with blank in the sentence
    const sentenceWithBlank = sentence.replace(new RegExp(currentWord.word, 'gi'), '______');
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
      }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Học từ mới', path: '/learn-new' }
          ]}
        />
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              {applicationMode === APPLICATION_MODES.SENTENCE_COMPLETION 
                ? 'Giai đoạn 3: Ứng dụng - Bước 6: Điền từ vào câu'
                : 'Giai đoạn 3: Ứng dụng - Bước 7: Luyện nói'}
            </h2>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                Câu {applicationIndex + 1} / {vocabList.length}
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                Điểm: {applicationScore}
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            {/* Sentence Completion Mode */}
            {applicationMode === APPLICATION_MODES.SENTENCE_COMPLETION ? (
              <>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  marginBottom: '30px'
                }}>
                  Điền từ vào chỗ trống:
                </h3>
                
                <div style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '16px',
                  padding: '30px',
                  marginBottom: '30px',
                  fontSize: '24px',
                  lineHeight: '1.8',
                  color: '#1e293b',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {sentenceWithBlank}
                </div>
                
                <input
                  type="text"
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSentenceSubmit();
                    }
                  }}
                  placeholder="Nhập từ cần điền..."
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '16px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    fontSize: '20px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                />
                
                <button
                  onClick={handleSentenceSubmit}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Kiểm tra
                </button>
              </>
            ) : (
              /* Speaking Practice Mode */
              <>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  marginBottom: '30px'
                }}>
                  Đọc to từ sau:
                </h3>
                
                <div style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  marginBottom: '30px',
                  fontSize: '48px',
                  fontWeight: '700',
                  color: '#6366f1'
                }}>
                  {currentWord.word}
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '20px',
                    color: '#64748b',
                    marginBottom: '10px'
                  }}>
                    Nghĩa: {currentWord.meaning}
                  </div>
                  {currentWord.phonetic && (
                    <div style={{
                      fontSize: '18px',
                      color: '#64748b',
                      fontStyle: 'italic'
                    }}>
                      /{currentWord.phonetic}/
                    </div>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <button
                    onClick={() => {
                      let played = false; // Flag to prevent double playing
                      
                      const speakWithTTS = () => {
                        if (!played) {
                          played = true;
                          const utterance = new SpeechSynthesisUtterance(currentWord.word);
                          utterance.lang = 'en-US';
                          utterance.rate = 0.9;
                          window.speechSynthesis.speak(utterance);
                        }
                      };
                      
                      if (currentWord.audio_url) {
                        const audio = new Audio(currentWord.audio_url);
                        
                        // Handle error when audio file fails to load
                        audio.addEventListener('error', () => {
                          console.warn('Audio file not found, using TTS fallback');
                          speakWithTTS();
                        });
                        
                        // Try to play the audio, fallback to TTS on error
                        audio.play().catch(err => {
                          console.error('Error playing audio:', err);
                          speakWithTTS();
                        });
                      } else {
                        speakWithTTS();
                      }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '100px',
                      height: '100px',
                      fontSize: '48px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaVolumeUp />
                  </button>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  marginBottom: '30px'
                }}>
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '16px 32px',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <FaMicrophone style={{ fontSize: '24px' }} />
                      Ghi âm phát âm
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '16px 32px',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <FaMicrophone style={{ fontSize: '24px', animation: 'pulse 1s infinite' }} />
                      Đang ghi âm... (Click để dừng)
                    </button>
                  )}
                </div>
                
                {recognitionResult && (
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    {isAnalyzing && (
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', fontStyle: 'italic' }}>
                        🤖 AI đang phân tích phát âm...
                      </div>
                    )}
                    <div style={{ fontSize: '16px', color: '#1e293b', marginBottom: '8px' }}>
                      <strong>Kết quả nhận diện:</strong> {recognitionResult}
                    </div>
                    {pronunciationFeedback && (
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                        {pronunciationFeedback}
                      </div>
                    )}
                    {pronunciationDetails && pronunciationDetails.isAI && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        {pronunciationDetails.detailedFeedback && (
                          <div style={{ fontSize: '14px', color: '#475569', marginBottom: '12px', lineHeight: '1.6' }}>
                            <strong style={{ color: '#1e293b' }}>📝 Phân tích chi tiết:</strong><br />
                            {pronunciationDetails.detailedFeedback}
                          </div>
                        )}
                        {pronunciationDetails.pronunciationIssues && pronunciationDetails.pronunciationIssues.length > 0 && (
                          <div style={{ fontSize: '13px', color: '#dc2626', marginBottom: '12px' }}>
                            <strong>⚠️ Vấn đề phát âm:</strong>
                            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                              {pronunciationDetails.pronunciationIssues.map((issue, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {pronunciationDetails.suggestions && pronunciationDetails.suggestions.length > 0 && (
                          <div style={{ fontSize: '13px', color: '#059669', marginBottom: '8px' }}>
                            <strong>💡 Gợi ý cải thiện:</strong>
                            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                              {pronunciationDetails.suggestions.map((suggestion, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={handleSpeakingPractice}
                  disabled={!recognitionResult}
                  style={{
                    background: recognitionResult 
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: recognitionResult ? 'pointer' : 'not-allowed',
                    opacity: recognitionResult ? 1 : 0.6
                  }}
                >
                  Tiếp theo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Save learning progress to backend
  const saveLearningProgress = async () => {
    if (!user?.id || !selectedTopic || !selectedChapter) return;
    
    try {
      // Calculate which words were remembered based on scores
      const vocabResults = vocabList.map((vocab, index) => {
        // Simple logic: if user got most questions right, they remembered the word
        const remembered = (practiceScore + applicationScore) >= vocabList.length * 2;
        return {
          vocabId: vocab.id,
          remembered: remembered,
          phase: 'complete',
          pronunciationCount: 0,  // ❌ Speaking: Chưa có tính năng
          writingCount: writingCounts[vocab.id] || 0  // ✅ Số lần điền câu
        };
      });

      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learner/${user.id}/save-learning-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: selectedTopic,
          chapterId: selectedChapter,
          vocabResults: vocabResults
        })
      });

      toast.success('Đã lưu tiến độ học tập! 📊', { autoClose: 2000 });
    } catch (error) {
      console.error('Lỗi lưu tiến độ:', error);
      toast.error('Không thể lưu tiến độ học tập', { autoClose: 2000 });
    }
  };

  // Auto-save progress when summary phase is shown
  useEffect(() => {
    if (currentPhase === PHASES.SUMMARY) {
      saveLearningProgress();
    }
  }, [currentPhase, user?.id, selectedTopic, selectedChapter, vocabList, practiceScore, applicationScore]);

  // Render Summary Phase
  const renderSummaryPhase = () => {
    const totalScore = practiceScore + applicationScore;
    const maxPossibleScore = vocabList.length * 4;
    const accuracy = Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
      }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Học từ mới', path: '/learn-new' }
          ]}
        />
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>
              🎉
            </div>
            
            <h1 style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#22c55e',
              marginBottom: '30px'
            }}>
              Hoàn thành chủ đề!
            </h1>
            
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '16px',
                padding: '30px',
                color: 'white'
              }}>
                <div style={{ fontSize: '48px', fontWeight: '900' }}>
                  {vocabList.length}
                </div>
                <div style={{ fontSize: '18px', opacity: '0.9' }}>
                  Từ đã học
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '16px',
                padding: '30px',
                color: 'white'
              }}>
                <div style={{ fontSize: '48px', fontWeight: '900' }}>
                  {totalScore}
                </div>
                <div style={{ fontSize: '18px', opacity: '0.9' }}>
                  Điểm tổng
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '16px',
                padding: '30px',
                color: 'white'
              }}>
                <div style={{ fontSize: '48px', fontWeight: '900' }}>
                  {accuracy}%
                </div>
                <div style={{ fontSize: '18px', opacity: '0.9' }}>
                  Độ chính xác
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '16px',
                padding: '30px',
                color: 'white'
              }}>
                <div style={{ fontSize: '48px', fontWeight: '900' }}>
                  {practiceScore}
                </div>
                <div style={{ fontSize: '18px', opacity: '0.9' }}>
                  Điểm luyện tập
                </div>
              </div>
            </div>
            
            {/* Learned Words List */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '30px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                📚 Danh sách từ đã học:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {vocabList.map((word, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>
                        {word.word}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {word.meaning}
                      </div>
                    </div>
                    <FaCheckCircle style={{ color: '#22c55e', fontSize: '20px' }} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Spaced Repetition Suggestion */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '30px',
              border: '2px solid #f59e0b'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '28px' }}>⏰</span>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#92400e',
                  margin: 0
                }}>
                  Bạn có muốn ôn lại sau 24h?
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#78350f',
                margin: 0,
                textAlign: 'center'
              }}>
                Hãy quay lại sau để củng cố trí nhớ! Ôn tập định kỳ giúp bạn nhớ từ vựng lâu hơn.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                onClick={resetLesson}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Học lại
              </button>
              
              <button
                onClick={() => setSelectedTopic(null)}
                style={{
                  background: 'transparent',
                  color: '#6366f1',
                  border: '2px solid #6366f1',
                  borderRadius: '16px',
                  padding: '14px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Chọn chủ đề khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Continue Modal
  const ContinueModal = () => {
    if (!showContinueModal) {
      return <div style={{ display: 'none' }}></div>;
    }
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            🎯
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '900',
            color: '#1e293b',
            marginBottom: '10px'
          }}>
            Bạn đã học xong từ mới!
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '30px'
          }}>
            Bạn có muốn tiếp tục luyện tập không?
          </p>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            <button
              onClick={startPracticePhase}
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Có, bắt đầu luyện tập
            </button>
            
            <button
              onClick={() => setShowContinueModal(false)}
              style={{
                background: 'transparent',
                color: '#64748b',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                padding: '14px 32px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {ContinueModal()}
      <ToastContainer position="top-center" />
    </>
  );
}

