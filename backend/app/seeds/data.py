"""
Seed data for forbidden words in Indonesian.
Contains 50+ words categorized into: profanity, hate_speech, spam, inappropriate
"""

FORBIDDEN_WORDS_DATA = [
    # ==================== PROFANITY (15 words, severity 4-5) ====================
    {"word": "bajingan", "category": "profanity", "severity": 5},
    {"word": "bangsat", "category": "profanity", "severity": 5},
    {"word": "brengsek", "category": "profanity", "severity": 4},
    {"word": "keparat", "category": "profanity", "severity": 5},
    {"word": "sialan", "category": "profanity", "severity": 4},
    {"word": "kampret", "category": "profanity", "severity": 4},
    {"word": "anjing", "category": "profanity", "severity": 4},
    {"word": "babi", "category": "profanity", "severity": 4},
    {"word": "monyet", "category": "profanity", "severity": 3},
    {"word": "goblok", "category": "profanity", "severity": 4},
    {"word": "tolol", "category": "profanity", "severity": 4},
    {"word": "bodoh", "category": "profanity", "severity": 3},
    {"word": "idiot", "category": "profanity", "severity": 4},
    {"word": "dungu", "category": "profanity", "severity": 3},
    {"word": "setan", "category": "profanity", "severity": 4},
    
    # ==================== HATE SPEECH (12 words, severity 5) ====================
    {"word": "kafir", "category": "hate_speech", "severity": 5},
    {"word": "rasis", "category": "hate_speech", "severity": 5},
    {"word": "rasisme", "category": "hate_speech", "severity": 5},
    {"word": "diskriminasi", "category": "hate_speech", "severity": 5},
    {"word": "sara", "category": "hate_speech", "severity": 5},
    {"word": "cina", "category": "hate_speech", "severity": 4},
    {"word": "pribumi", "category": "hate_speech", "severity": 4},
    {"word": "aseng", "category": "hate_speech", "severity": 5},
    {"word": "antek", "category": "hate_speech", "severity": 4},
    {"word": "pengkhianat", "category": "hate_speech", "severity": 4},
    {"word": "penjajah", "category": "hate_speech", "severity": 4},
    {"word": "teroris", "category": "hate_speech", "severity": 5},
    
    # ==================== SPAM (15 words, severity 1-2) ====================
    {"word": "klik disini", "category": "spam", "severity": 2},
    {"word": "gratis", "category": "spam", "severity": 1},
    {"word": "hadiah", "category": "spam", "severity": 1},
    {"word": "menang", "category": "spam", "severity": 1},
    {"word": "undian", "category": "spam", "severity": 2},
    {"word": "lotere", "category": "spam", "severity": 2},
    {"word": "promo", "category": "spam", "severity": 1},
    {"word": "diskon besar", "category": "spam", "severity": 2},
    {"word": "penawaran terbatas", "category": "spam", "severity": 2},
    {"word": "hubungi sekarang", "category": "spam", "severity": 2},
    {"word": "jangan lewatkan", "category": "spam", "severity": 1},
    {"word": "terbukti ampuh", "category": "spam", "severity": 2},
    {"word": "obat kuat", "category": "spam", "severity": 2},
    {"word": "pinjaman online", "category": "spam", "severity": 2},
    {"word": "investasi bodong", "category": "spam", "severity": 2},
    
    # ==================== INAPPROPRIATE (13 words, severity 2-3) ====================
    {"word": "bokep", "category": "inappropriate", "severity": 5},
    {"word": "porno", "category": "inappropriate", "severity": 5},
    {"word": "cabul", "category": "inappropriate", "severity": 4},
    {"word": "mesum", "category": "inappropriate", "severity": 4},
    {"word": "bugil", "category": "inappropriate", "severity": 4},
    {"word": "telanjang", "category": "inappropriate", "severity": 3},
    {"word": "ngewe", "category": "inappropriate", "severity": 5},
    {"word": "ngentot", "category": "inappropriate", "severity": 5},
    {"word": "kontol", "category": "inappropriate", "severity": 5},
    {"word": "memek", "category": "inappropriate", "severity": 5},
    {"word": "judi", "category": "inappropriate", "severity": 3},
    {"word": "narkoba", "category": "inappropriate", "severity": 4},
    {"word": "ganja", "category": "inappropriate", "severity": 4},
]

# Total: 55 words
