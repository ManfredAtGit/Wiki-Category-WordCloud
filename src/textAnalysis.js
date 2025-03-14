/**
 * Text analysis functionality
 * TODOs:
 * - multilangual stopwordlist
 * - re-work valid-words
 * - implement stemming (models == model )
 */

// Create a custom stopwords set
const stopwords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
    'have', 'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how',
    // Add more domain-specific stopwords
    'also', 'can', 'may', 'would', 'could', 'should', 'must', 'one', 'two',
    'many', 'such', 'either', 'often', 'sometimes', 'usually', 'typically',
    // Add more domain-specific stopwords
    'if', 'then', 'than', 'or', 'into', 'each','more','some', 'there', 'their', 'been'
]);

/**
 * Simple word tokenizer
 * @param {string} text - Text to tokenize
 * @returns {string[]} Array of tokens
 */
function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
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
        
        tokens.forEach(token => {
            // Skip if token is a stopword or not valid
            if (stopwords.has(token) || !isValidWord(token)) {
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
    // if (!/^[a-z]+$/.test(word)) return false;
    // if (/^[aeiou]+$/.test(word)) return false; // Probably not a real word
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
