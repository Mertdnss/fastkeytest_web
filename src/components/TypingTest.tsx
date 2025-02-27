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
    if (testActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            endTest();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testActive]);

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
      const words = currentText.split(' ');
      
      // Space tuşuna basıldığında
      if (lastChar === ' ') {
        // Birden fazla boşluğa izin verme
        if (newValue.match(/\s{2,}/g)) {
          return;
        }
        
        // Kelimeyi tamamla ve yeni kelimeye geç
        if (currentWord.length > 0) {
          setCompletedWords([...completedWords, currentWord]);
          setCurrentWord('');
        }
      } else {
        // Mevcut kelimeyi güncelle
        const newWord = newValue.split(' ').pop() || '';
        
        // Eğer önceki kelimelerden birini silmeye çalışıyorsa engelle
        if (newValue.split(' ').length - 1 < completedWords.length) {
          return;
        }
        
        setCurrentWord(newWord);
      }
      
      // Input değerini güncelle
      setUserInput(newValue);
      calculateStats();
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
    const newText = getRandomWords(currentLanguage, 25, difficulty === 'hard');
    setCurrentText(difficulty === 'easy' ? newText.toLowerCase() : newText);
    setUserInput('');
    setCompletedWords([]);
    setCurrentWord('');
    setTimeLeft(duration);
    setIsTestComplete(false);
    setStats({
      wpm: 0,
      accuracy: 0,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
      correctWords: 0
    });
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
            className={`w-full h-32 bg-gray-700 text-white p-4 rounded font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out ${
              isTestEnding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            placeholder="Start typing here..."
            value={userInput}
            onChange={handleInputChange}
            disabled={timeLeft === 0 || isTestEnding}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            onPaste={(e) => e.preventDefault()}
          />
        ) : (
          <div className="flex items-center justify-center h-32">
            <button
              onClick={retryTest}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Try Again</span>
            </button>
          </div>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          onClick={startTest}
          disabled={testActive}
        >
          {testActive ? 'Test in Progress' : 'Start Test'}
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