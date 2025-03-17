/**
 * Text analysis functionality
 */

// Create language-specific stopwords sets
const stopwords = {
    en: new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
        'have', 'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how',
        'also', 'can', 'may', 'would', 'could', 'should', 'must', 'one', 'two',
        'many', 'such', 'either', 'often', 'sometimes', 'usually', 'typically',
        'if', 'then', 'than', 'or', 'into', 'each', 'more', 'some', 'there', 'their', 'been'
    ]),
    de: new Set([
        // Articles
        'der', 'die', 'das', 'den', 'dem', 'des',
        'ein', 'eine', 'einer', 'eines', 'einem', 'einen',
        // Pronouns
        'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie',
        'mich', 'mir', 'dich', 'dir', 'ihm', 'ihn', 'uns', 'euch',
        // Prepositions
        'in', 'an', 'auf', 'für', 'von', 'mit', 'bei', 'seit', 'aus',
        'nach', 'zu', 'zur', 'zum', 'unter', 'über', 'neben', 'zwischen',
        // Conjunctions
        'und', 'oder', 'aber', 'sondern', 'denn', 'weil', 'dass', 'ob',
        // Common verbs
        'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden',
        'hat', 'haben', 'hatte', 'hatten', 'kann', 'können', 'konnte', 'konnten',
        // Common adverbs
        'hier', 'dort', 'dann', 'wann', 'wie', 'wo', 'warum', 'weshalb',
        'sehr', 'mehr', 'weniger', 'wieder', 'immer', 'nie', 'manchmal',
        // Other common words
        'als', 'auch', 'noch', 'schon', 'nur', 'nicht', 'durch', 'bereits',
        'dabei', 'damit', 'dazu', 'daran', 'darauf', 'darum', 'davon', 'dafür'
    ])
};

let currentLanguage = 'en';

/**
 * Sets the current language for text analysis
 * @param {string} lang - Language code ('en' or 'de')
 */
export function setAnalysisLanguage(lang) {
    if (!stopwords[lang]) {
        throw new Error('Unsupported language. Supported languages are: en, de');
    }
    currentLanguage = lang;
}

/**
 * Simple word tokenizer
 * @param {string} text - Text to tokenize
 * @returns {string[]} Array of tokens
 */
function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^a-zäöüß\s]/g, ' ') // Added German special characters
        .split(/\s+/)
        .filter(token => token.length > 0);
}

/**
 * Analyzes text and returns word frequencies
 * @param {string} text - The text to analyze
 * @returns {Map<string, number>} Map of words to their frequencies
 */
export function analyzeText(text) {
    if (!text) {
        console.warn('Empty text provided to analyzeText');
        return new Map();
    }

    try {
        // Tokenize the text
        const tokens = tokenize(text);
        
        // Filter tokens and count frequencies
        const frequencies = new Map();
        const currentStopwords = stopwords[currentLanguage];
        
        tokens.forEach(token => {
            // Skip if token is a stopword or not valid
            if (currentStopwords.has(token) || !isValidWord(token)) {
                return;
            }
            
            frequencies.set(token, (frequencies.get(token) || 0) + 1);
        });
        
        return frequencies;
    } catch (error) {
        console.error('Error in analyzeText:', error);
        return new Map();
    }
}

/**
 * Checks if a word is valid for our analysis
 * @param {string} word - The word to check
 * @returns {boolean} Whether the word is valid
 */
function isValidWord(word) {
    // More comprehensive word validation
    if (word.length < 2) return false;
    if (word.length > 30) return false; // Probably not a real word
    return true;
}

/**
 * Merges multiple frequency maps into one
 * @param {Map<string, number>[]} frequencyMaps - Array of frequency maps
 * @returns {Map<string, number>} Combined frequency map
 */
export function mergeFrequencies(frequencyMaps) {
    const merged = new Map();
    
    frequencyMaps.forEach(map => {
        for (const [word, count] of map) {
            merged.set(word, (merged.get(word) || 0) + count);
        }
    });
    
    return merged;
}
