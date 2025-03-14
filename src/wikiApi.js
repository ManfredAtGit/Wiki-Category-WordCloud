/**
 * Handles all Wikipedia API interactions
 * 
 * TODOs:
 * - user choosable language-specific endpoint (en, de, )
 */

const API_ENDPOINT = 'https://en.wikipedia.org/w/api.php';

/**
 * Creates a JSONP request to the Wikipedia API
 * @param {Object} params - API parameters
 * @returns {Promise} Promise that resolves with the API response
 */
function jsonpRequest(params) {
    return new Promise((resolve, reject) => {
        // Create a unique callback name
        const callbackName = 'wikipediaCallback_' + Math.random().toString(36).substr(2, 9);
        
        // Create script element
        const script = document.createElement('script');
        const urlParams = new URLSearchParams({
            ...params,
            format: 'json',
            origin: '*',
            callback: callbackName
        });
        
        script.src = `${API_ENDPOINT}?${urlParams}`;
        
        // Set up the callback
        window[callbackName] = (data) => {
            // Clean up
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };
        
        // Handle errors
        script.onerror = () => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('Failed to load Wikipedia API data'));
        };
        
        // Add script to document
        document.body.appendChild(script);
        
        // Set a timeout
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('Wikipedia API request timed out'));
            }
        }, 10000); // 10 second timeout
    });
}

/**
 * Fetches all pages in a given category from Wikipedia
 * @param {string} category - The category name without the "Category:" prefix
 * @returns {Promise<string[]>} Array of page titles
 */
export async function getCategoryMembers(category) {
    try {
        const params = {
            action: 'query',
            list: 'categorymembers',
            cmtitle: `Category:${category}`,
            cmlimit: '500',
            formatversion: '2'
        };

        const data = await jsonpRequest(params);
        
        if (!data.query?.categorymembers) {
            throw new Error('Invalid category or no pages found');
        }
        
        return data.query.categorymembers
            .filter(page => page.ns === 0) // Only include articles (namespace 0)
            .map(page => page.title);
    } catch (error) {
        console.error('Error fetching category members:', error);
        throw new Error(`Failed to fetch category members: ${error.message}`);
    }
}

/**
 * Fetches the content of a Wikipedia page
 * @param {string} title - The page title
 * @returns {Promise<string>} The page content
 */
export async function getPageContent(title) {
    try {
        const params = {
            action: 'query',
            prop: 'extracts',
            exintro: '1', // Get only the introduction section
            exlimit: '1',
            titles: title,
            explaintext: '1',
            formatversion: '2'
        };

        const data = await jsonpRequest(params);
        const page = data.query.pages[0];
        
        if (!page || !page.extract) {
            throw new Error('Page content not found');
        }
        
        return page.extract;
    } catch (error) {
        console.error('Error fetching page content:', error);
        throw new Error(`Failed to fetch page content: ${error.message}`);
    }
}
