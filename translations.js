/**
 * Loads translations from XML file and applies them to the page
 * @param {string} languageCode - The language code to use (e.g., 'en', 'hi')
 */
function loadTranslations(languageCode) {
    // Default to English if no language code provided
    languageCode = languageCode || 'en';
    
    fetch('translations.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            
            // Check for XML parsing errors
            const parserError = xmlDoc.querySelector("parsererror");
            if (parserError) {
                console.error('Error parsing XML:', parserError);
                throw new Error('Failed to parse translations XML.');
            }

            // Find the requested language
            const languageNode = xmlDoc.querySelector(`language[id="${languageCode}"]`);
            
            // Fall back to English if the requested language isn't found
            const fallbackNode = xmlDoc.querySelector('language[id="en"]');
            const targetNode = languageNode || fallbackNode;
            
            if (!targetNode) {
                console.error('No translations found for', languageCode);
                return;
            }
            
            // Store translations in global cache for dynamic content
            window.translationsCache = {};
            
            // Get all text elements
            const textNodes = targetNode.getElementsByTagName('text');
            
            // Apply translations to the page
            for (let i = 0; i < textNodes.length; i++) {
                const textNode = textNodes[i];
                const textId = textNode.getAttribute('id');
                const textValue = textNode.textContent;
                
                // Store in cache for dynamic content
                window.translationsCache[textId] = textValue;
                
                // Find the element and update its text
                const element = document.getElementById(textId);
                if (element) {
                    element.textContent = textValue;
                }
            }
            
            console.log(`Translations applied for language: ${languageCode}`);
        })
        .catch(error => {
            console.error('Error loading translations:', error);
        });
}

/**
 * Get translated text for a specific text ID
 * @param {string} textId - The ID of the text to translate
 * @param {string} defaultText - Default text to use if translation is not found
 * @return {string} The translated text or default text
 */
function getTranslatedText(textId, defaultText) {
    // Check if translations cache exists
    if (window.translationsCache && window.translationsCache[textId]) {
        return window.translationsCache[textId];
    }
    return defaultText;
}
