'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { commonWords } from '@/data/words';

// Rastgele kelime seçme fonksiyonu
const getRandomWords = (language: 'en' | 'tr', count: number = 25, isHard: boolean = false): string => {
  const words = isHard ? 
    commonWords[`${language}Long` as keyof typeof commonWords] as string[] :
    commonWords[language];
  
  const selectedWords: string[] = [];
  const usedIndexes = new Set<number>();
  
  for (let i = 0; i < count; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * words.length);
    } while (usedIndexes.has(randomIndex));
    
    usedIndexes.add(randomIndex);
    selectedWords.push(words[randomIndex]);
  }

  return selectedWords.join(' ');
};

interface TypingTestProps {
  duration?: number;
}

interface TestStats {
  wpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalChars: number;
  correctWords: number;
}

export default function TypingTest({ duration = 60 }: TypingTestProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [testActive, setTestActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'tr'>('en');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [startTime, setStartTime] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [currentText, setCurrentText] = useState('');
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [isTestEnding, setIsTestEnding] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);

  // İlk yükleme ve dil/zorluk değişiminde metni güncelle
  useEffect(() => {
    const newText = getRandomWords(currentLanguage, 25, difficulty === 'hard');
    setCurrentText(difficulty === 'easy' ? newText.toLowerCase() : newText);
    setCompletedWords([]);
    setCurrentWord('');
    setIsTestComplete(false);
  }, [currentLanguage, difficulty]);

  const [stats, setStats] = useState<TestStats>({
    wpm: 0,
    accuracy: 0,
    errors: 0,
    correctChars: 0,
    totalChars: 0,
    correctWords: 0
  });

  const calculateStats = useCallback(() => {
    if (!startTime) return;

    // Geçen süreyi hesapla (dakika cinsinden)
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    if (elapsedMinutes === 0) return;

    const targetWords = currentText.split(' ');
    let correctChars = 0;
    let errors = 0;

    // Tamamlanmış kelimeler için karakter kontrolü
    completedWords.forEach((word, index) => {
      const targetWord = targetWords[index];
      if (word === targetWord) {
        correctChars += word.length;
      } else {
        errors += Math.max(word.length, targetWord ? targetWord.length : 0);
      }
      // Boşluk karakteri için +1
      correctChars += 1; // Her kelimeden sonraki boşluk
    });

    // Mevcut kelime için karakter kontrolü
    if (currentWord.length > 0) {
      const targetWord = targetWords[completedWords.length];
      for (let i = 0; i < currentWord.length; i++) {
        if (i < targetWord.length && currentWord[i] === targetWord[i]) {
          correctChars++;
        } else {
          errors++;
        }
      }
    }

    // Doğruluk oranı hesaplama
    const totalChars = completedWords.join(' ').length + currentWord.length;
    const accuracy = totalChars > 0 
      ? Math.round((correctChars / Math.max(totalChars, 1)) * 100)
      : 0;

    // Doğru kelime sayısı hesaplama
    const correctWords = completedWords.filter((word, index) => 
      word === targetWords[index]
    ).length;

    // WPM hesaplaması: (doğru karakter sayısı / 5) / geçen dakika
    const grossWPM = Math.round((correctChars / 5) / elapsedMinutes);

    setStats({
      wpm: Math.min(grossWPM, 250), // Gerçekçi bir üst limit
      accuracy,
      errors,
      correctChars,
      totalChars,
      correctWords
    });
  }, [completedWords, currentWord, currentText, startTime]);

  const endTest = useCallback(() => {
    setIsTestEnding(true);
    // Animasyon için 500ms bekle
    setTimeout(() => {
      setTestActive(false);
      setStartTime(null);
      calculateStats();
      setIsTestComplete(true);
      setIsTestEnding(false);
    }, 500);
  }, [calculateStats]);

  // Süre kontrolü
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testActive, endTest]);

  useEffect(() => {
    if (testActive && userInput.length === currentText.length) {
      endTest();
    }
  }, [userInput, currentText, testActive, endTest]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && testActive) {
        e.preventDefault();
        endTest();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testActive, endTest]);

  const startTest = () => {
    setTimeLeft(duration);
    setUserInput('');
    setCompletedWords([]);
    setCurrentWord('');
    setTestActive(true);
    setStartTime(Date.now());
    setStats({
      wpm: 0,
      accuracy: 0,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
      correctWords: 0
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!testActive && e.target.value.length === 1) {
      startTest();
    }
    
    if (testActive || e.target.value.length === 1) {
      const newValue = e.target.value;
      const lastChar = newValue[newValue.length - 1];
      
      // Space tuşuna basıldığında
      if (lastChar === ' ') {
        // Son kelimeyi al (boşluktan önceki kelime)
        const lastWord = newValue.trim();
        
        if (lastWord === '') {
          return;
        }
        
        // Kelimeyi tamamla
        const newCompletedWords = [...completedWords, lastWord];
        setCompletedWords(newCompletedWords);
        setCurrentWord('');
        setUserInput('');

        // Eğer bu son kelimeyse testi bitir
        const words = currentText.split(' ');
        if (newCompletedWords.length >= words.length) {
          endTest();
        }
        
        return;
      }
      
      // Boşluk yoksa sadece kelimeyi güncelle
      setCurrentWord(newValue);
      setUserInput(newValue);
      calculateStats();

      // Eğer son kelimeyse ve doğru yazıldıysa testi bitir
      const words = currentText.split(' ');
      if (completedWords.length === words.length - 1 && 
          newValue === words[words.length - 1]) {
        endTest();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      const selectionStart = e.currentTarget.selectionStart;
      const completedLength = completedWords.join(' ').length + (completedWords.length > 0 ? 1 : 0);
      
      // Eğer cursor tamamlanmış kelimelerin içindeyse veya hemen sonrasındaysa
      if (selectionStart <= completedLength) {
        e.preventDefault();
        return;
      }
    }
  };

  const handleLanguageChange = (language: 'en' | 'tr') => {
    if (language !== currentLanguage) {
      setCurrentLanguage(language);
      resetTest();
    }
  };

  const resetTest = () => {
    setUserInput('');
    setTestActive(false);
    setTimeLeft(duration);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 0,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
      correctWords: 0
    });
  };

  const getCharacterStyle = (index: number) => {
    const words = currentText.split(' ');
    let currentIndex = 0;
    let wordIndex = 0;
    
    // Tamamlanmış kelimelerin karakterlerini kontrol et
    for (let i = 0; i < completedWords.length; i++) {
      const word = words[i];
      if (index >= currentIndex && index < currentIndex + word.length) {
        return completedWords[i] === word ? "text-green-500" : "text-red-500";
      }
      currentIndex += word.length + 1; // +1 for space
      wordIndex++;
    }
    
    // Mevcut kelimenin karakterlerini kontrol et
    const currentTargetWord = words[wordIndex] || '';
    if (index >= currentIndex && index < currentIndex + currentTargetWord.length) {
      const relativeIndex = index - currentIndex;
      if (relativeIndex >= currentWord.length) return "text-gray-400";
      return currentWord[relativeIndex] === currentTargetWord[relativeIndex] 
        ? "text-green-500" 
        : "text-red-500";
    }
    
    return "text-gray-400";
  };

  const handleDifficultyChange = (newDifficulty: 'easy' | 'hard') => {
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      resetTest();
    }
  };

  // Yeni test başlatma fonksiyonu
  const retryTest = () => {
    setTimeLeft(duration);
    setUserInput('');
    setCompletedWords([]);
    setCurrentWord('');
    setTestActive(false);
    setStartTime(null);
    setIsTestEnding(false);
    setIsTestComplete(false);
    setStats({
      wpm: 0,
      accuracy: 0,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
      correctWords: 0
    });
    
    // Yeni kelimeler seç
    const newText = getRandomWords(currentLanguage, 25, difficulty === 'hard');
    setCurrentText(difficulty === 'easy' ? newText.toLowerCase() : newText);

    // Textarea'ya fokus
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Yazma sorununu çözmek için textarea'yı optimize et
  useEffect(() => {
    if (testActive && textareaRef.current) {
      textareaRef.current.focus();
      // Input seçimini sona getir
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [testActive]);

  // Klavye olaylarını yönet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!testActive) return;

      // Backspace tuşu için özel kontrol
      if (e.key === 'Backspace' && !isTestComplete) {
        e.preventDefault();
        const newValue = userInput.slice(0, -1);
        setUserInput(newValue);
        const lastWord = newValue.split(' ').pop() || '';
        setCurrentWord(lastWord);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [testActive, userInput, isTestComplete]);

  useEffect(() => {
    if (testActive && timeLeft === 0) {
      endTest();
    }
  }, [timeLeft, testActive, endTest]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button
            className={`px-4 py-2 rounded ${currentLanguage === 'en' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => handleLanguageChange('en')}
            disabled={testActive}
          >
            English
          </button>
          <button
            className={`px-4 py-2 rounded ${currentLanguage === 'tr' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => handleLanguageChange('tr')}
            disabled={testActive}
          >
            Türkçe
          </button>
        </div>
        <div className="space-x-2">
          <button
            className={`px-4 py-2 rounded ${difficulty === 'easy' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => handleDifficultyChange('easy')}
            disabled={testActive}
          >
            Kolay
          </button>
          <button
            className={`px-4 py-2 rounded ${difficulty === 'hard' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => handleDifficultyChange('hard')}
            disabled={testActive}
          >
            Zor
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <p className="text-gray-400 mb-2">Type the text below:</p>
          <div className="bg-gray-700 p-4 rounded text-lg font-mono">
            {currentText.split('').map((char, index) => (
              <span key={index} className={getCharacterStyle(index)}>
                {char}
              </span>
            ))}
          </div>
        </div>
        {!isTestComplete ? (
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`w-full h-10 p-2 text-lg border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              overflow-hidden resize-none
              ${isTestEnding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} 
              transition-all duration-500 ease-in-out`}
            disabled={!testActive && userInput.length > 0}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={1}
            placeholder="Type here..."
          />
        ) : (
          <button
            onClick={retryTest}
            className={`px-6 py-2 text-lg font-semibold text-white 
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-blue-600 hover:to-blue-700
              rounded-lg transform hover:scale-105
              transition-all duration-300 ease-in-out
              flex items-center justify-center gap-2
              ${isTestEnding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Try Again
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400">WPM</p>
          <p className="text-2xl font-bold">{stats.wpm}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400">Accuracy</p>
          <p className="text-2xl font-bold">{stats.accuracy}%</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400">Errors</p>
          <p className="text-2xl font-bold">{stats.errors}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400">Time</p>
          <p className="text-2xl font-bold">{timeLeft}s</p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={startTest}
          disabled={testActive || isTestComplete}
          className={`px-6 py-2 text-lg font-semibold text-white 
            ${testActive || isTestComplete 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }
            rounded-lg transform transition-all duration-300 ease-in-out
            ${!testActive && !isTestComplete ? 'hover:scale-105' : ''}`}
        >
          Start Test
        </button>
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          onClick={endTest}
          disabled={!testActive}
        >
          End Test
        </button>
      </div>
    </div>
  );
} 