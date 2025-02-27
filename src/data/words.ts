interface WordList {
  en: string[];
  tr: string[];
  enLong: string[];
  trLong: string[];
}

// Her dil için en çok kullanılan 200 kelime ve uzun kelimeler
export const commonWords: WordList = {
  en: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    "word", "life", "keep", "feel", "great", "tell", "still", "try", "hand", "here",
    "talk", "put", "such", "help", "line", "end", "begin", "got", "yes", "play",
    "small", "part", "live", "home", "read", "where", "need", "move", "thing", "name",
    "walk", "same", "path", "grow", "learn", "tree", "rise", "fall", "send", "less",
    "real", "care", "late", "hard", "best", "far", "seem", "few", "case", "week",
    "call", "ask", "need", "born", "next", "find", "hope", "city", "page", "long",
    "side", "each", "mean", "old", "turn", "here", "real", "face", "form", "stay",
    "past", "view", "mind", "love", "cause", "reach", "local", "place", "kind", "item",
    "hold", "base", "hear", "let", "rest", "run", "keep", "warm", "mind", "cross",
    "stop", "plan", "half", "stand", "now", "clear", "full", "air", "term", "ever"
  ],
  tr: [
    "bir", "ve", "bu", "ile", "için", "ben", "sen", "o", "biz", "siz",
    "de", "da", "ki", "ne", "var", "yok", "çok", "az", "iyi", "kötü",
    "evet", "hayır", "gel", "git", "al", "ver", "gör", "bak", "yap", "et",
    "ol", "kal", "geç", "dur", "koş", "yürü", "otur", "kalk", "aç", "kapa",
    "gün", "ay", "yıl", "su", "ekmek", "yemek", "içmek", "uyku", "ev", "iş",
    "okul", "kitap", "kalem", "masa", "sandalye", "kapı", "pencere", "araba", "yol", "sokak",
    "şehir", "ülke", "dünya", "insan", "kadın", "erkek", "çocuk", "anne", "baba", "kardeş",
    "arkadaş", "dost", "sevgi", "mutlu", "üzgün", "sıcak", "soğuk", "büyük", "küçük", "uzun",
    "kısa", "yeni", "eski", "güzel", "çirkin", "doğru", "yanlış", "kolay", "zor", "hızlı",
    "yavaş", "açık", "kapalı", "temiz", "kirli", "ucuz", "pahalı", "az", "çok", "her",
    "hiç", "kim", "nasıl", "neden", "nerede", "hangi", "kaç", "tüm", "bütün", "bazı",
    "diğer", "başka", "şimdi", "sonra", "önce", "bugün", "yarın", "dün", "sabah", "akşam",
    "gece", "öğle", "saat", "zaman", "süre", "an", "dönem", "yön", "yer", "durum",
    "olay", "konu", "sorun", "çözüm", "fikir", "düşünce", "bilgi", "haber", "söz", "dil",
    "ses", "renk", "şekil", "yapı", "madde", "para", "iş", "güç", "yol", "yön",
    "alan", "bölge", "ülke", "kent", "köy", "cadde", "sokak", "bina", "oda", "salon",
    "mutfak", "banyo", "yatak", "masa", "koltuk", "dolap", "ayna", "resim", "telefon", "bilgisayar",
    "internet", "oyun", "spor", "müzik", "film", "dans", "sanat", "tarih", "bilim", "doğa",
    "hava", "toprak", "deniz", "nehir", "göl", "dağ", "orman", "çiçek", "ağaç", "kuş",
    "balık", "böcek", "hayvan", "yemek", "meyve", "sebze", "ekmek", "süt", "çay", "kahve"
  ],
  enLong: [
    "international", "responsibility", "understanding", "communication", "organization",
    "particularly", "relationship", "professional", "development", "environment",
    "information", "performance", "experience", "management", "technology",
    "government", "successful", "production", "conference", "everything",
    "commercial", "population", "particular", "operation", "situation",
    "investment", "collection", "protection", "secretary", "telephone",
    "association", "connection", "discussion", "difference", "television",
    "production", "foundation", "population", "president", "knowledge",
    "direction", "equipment", "operation", "property", "agreement",
    "community", "education", "political", "statement", "attention",
    "important", "something", "committee", "financial", "necessary",
    "structure", "following", "question", "industry", "practice",
    "condition", "increase", "material", "movement", "pressure",
    "building", "computer", "planning", "training", "personal",
    "research", "evidence", "national", "security", "current",
    "positive", "hospital", "language", "meaning", "present",
    "business", "involved", "interest", "possible", "special",
    "position", "pressure", "complete", "function", "quality",
    "decision", "purpose", "control", "science", "support",
    "century", "section", "customer", "military", "evening",
    "analysis", "history", "learning", "primary", "process"
  ],
  trLong: [
    "karşılaştırma", "değerlendirme", "gerçekleştirme", "farklılaştırma", "yapılandırılmış",
    "sorumluluklar", "düzenlemeler", "uygulamalar", "geliştirmek", "yöneticilik",
    "özellikler", "teknolojik", "topluluklar", "araştırmak", "belirlemek",
    "göstermek", "sağlamak", "çalışmak", "başlamak", "anlatmak",
    "kullanmak", "yaşamak", "düşünmek", "vermek", "almak",
    "uluslararası", "organizasyon", "değerlendirme", "yapılandırma", "karşılaştırma",
    "farklılaşmak", "gerçekleşmek", "uygulanabilir", "yönetimsel", "teknolojik",
    "araştırmacı", "geliştirici", "belirleyici", "göstermelik", "sağlayıcı",
    "çalışkanlık", "başlangıç", "anlatımsal", "kullanışlı", "yaşanabilir",
    "düşünülmüş", "verilmiş", "alınmış", "yapılmış", "edilmiş",
    "söylenmiş", "görülmüş", "bilinmiş", "duyulmuş", "hissedilmiş",
    "anlaşılmış", "öğrenilmiş", "gösterilmiş", "belirtilmiş", "açıklanmış",
    "değiştirilmiş", "dönüştürülmüş", "yerleştirilmiş", "konumlandırılmış", "yapılandırılmış",
    "farklılaştırılmış", "karşılaştırılmış", "değerlendirilmiş", "gerçekleştirilmiş", "uygulanmış",
    "yönetilmiş", "araştırılmış", "geliştirilmiş", "belirlenmiş", "gösterilmiş",
    "sağlanmış", "çalışılmış", "başlanmış", "anlatılmış", "kullanılmış",
    "yaşanmış", "düşünülmüş", "verilmiş", "alınmış", "yapılmış",
    "söylenmiş", "görülmüş", "bilinmiş", "duyulmuş", "hissedilmiş",
    "anlaşılmış", "öğrenilmiş", "gösterilmiş", "belirtilmiş", "açıklanmış",
    "değiştirilmiş", "dönüştürülmüş", "yerleştirilmiş", "konumlandırılmış", "yapılandırılmış"
  ]
}; 