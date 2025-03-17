/**
 * Main application entry point
 */
import { getCategoryMembers, getPageContent, setWikiLanguage } from './wikiApi.js';
import { analyzeText, mergeFrequencies, setAnalysisLanguage } from './textAnalysis.js';
import { createWordCloud } from './visualization.js';

// Cache implementation using localStorage
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function loadCache(category, lang) {
    const cacheKey = `wiki-freq-${lang}-${category}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    try {
        const { timestamp, frequencies } = JSON.parse(cached);
        
        // Check if cache is expired
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(cacheKey);
            return null;
        }
        
        return new Map(frequencies);
    } catch (error) {
        console.warn('Error loading cache:', error);
        localStorage.removeItem(cacheKey);
        return null;
    }
}

function saveCache(category, frequencies, lang) {
    try {
        const cacheKey = `wiki-freq-${lang}-${category}`;
        const cacheData = {
            timestamp: Date.now(),
            frequencies: Array.from(frequencies.entries())
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Error saving cache:', error);
    }
}

// UI Elements
const categoryInput = document.getElementById('categoryInput');
const languageSelect = document.getElementById('languageSelect');
const analyzeBtn = document.getElementById('analyzeBtn');
const progress = document.getElementById('progress');
const progressText = document.getElementById('progressText');

// Initialize language selection
setWikiLanguage(languageSelect.value);
setAnalysisLanguage(languageSelect.value);

// Update both Wiki API and text analysis language when selection changes
languageSelect.addEventListener('change', () => {
    const selectedLang = languageSelect.value;
    setWikiLanguage(selectedLang);
    setAnalysisLanguage(selectedLang);
});

// Process pages in batches to avoid overwhelming the browser
async function processPagesInBatches(pages, batchSize = 5) {
    const frequencies = new Map();
    const batches = [];
    
    // Split pages into batches
    for (let i = 0; i < pages.length; i += batchSize) {
        batches.push(pages.slice(i, i + batchSize));
    }
    
    let processed = 0;
    
    // Process each batch
    for (const batch of batches) {
        const batchPromises = batch.map(async (page) => {
            try {
                console.log(`Processing page: ${page}`);
                const content = await getPageContent(page);
                console.log(`Got content length: ${content.length}`);
                return analyzeText(content);
            } catch (error) {
                console.warn(`Error processing page ${page}:`, error);
                return new Map();
            }
        });
        
        // Wait for all pages in the batch to be processed
        const batchResults = await Promise.all(batchPromises);
        
        // Merge frequencies from this batch
        batchResults.forEach(pageFreq => {
            for (const [word, count] of pageFreq) {
                frequencies.set(word, (frequencies.get(word) || 0) + count);
            }
        });
        
        // Update progress
        processed += batch.length;
        const percent = Math.round((processed / pages.length) * 100);
        progress.querySelector('progress').value = percent;
        progressText.textContent = `Processing page ${processed} of ${pages.length} (${percent}%)...`;
    }
    
    return frequencies;
}

async function analyzeCategoryPages(category) {
    const currentLang = languageSelect.value;
    console.log('Starting analysis for category:', category, 'in language:', currentLang);
    
    // Check cache first
    const cached = loadCache(category, currentLang);
    if (cached) {
        console.log('Using cached results');
        progressText.textContent = 'Using cached results...';
        return cached;
    }

    try {
        // Get all pages in the category
        console.log('Fetching category members...');
        const pages = await getCategoryMembers(category);
        console.log(`Found ${pages.length} pages to analyze`);
        
        if (pages.length === 0) {
            throw new Error('No pages found in this category');
        }
        
        progressText.textContent = `Found ${pages.length} pages to analyze...`;
        
        // Process pages in batches
        const frequencies = await processPagesInBatches(pages);
        console.log('Analysis complete, total unique words:', frequencies.size);
        
        // Cache results with language
        saveCache(category, frequencies, currentLang);
        
        return frequencies;
    } catch (error) {
        console.error('Error during analysis:', error);
        throw error;
    }
}

// Event Handlers
analyzeBtn.addEventListener('click', async () => {
    const category = categoryInput.value.trim();
    if (!category) {
        alert('Please enter a Wikipedia category name');
        return;
    }
    
    console.log('Starting analysis for:', category);
    
    // Show progress and disable button
    progress.style.display = 'block';
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    
    try {
        const frequencies = await analyzeCategoryPages(category);
        console.log('Creating word cloud with frequencies:', frequencies);
        createWordCloud(frequencies, '.word-cloud');
        progressText.textContent = 'Analysis complete!';
    } catch (error) {
        console.error('Error:', error);
        progressText.textContent = 'Error: ' + error.message;
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze';
    }
});

// Enter key handler
categoryInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !analyzeBtn.disabled) {
        analyzeBtn.click();
    }
});
