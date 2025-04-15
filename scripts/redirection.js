/**
 * Redirection script to check if user has selected a preferred language
 * If not, redirects to the language selection page
 */
(function() {
    // Check if we're on the language selection page (language selection page)
    const isLanguageSelectionPage = window.location.pathname.endsWith('lang_select.html'); // Corrected check needed here

    // If we're not on the language selection page, check for preferred language
    if (!isLanguageSelectionPage) {
        const preferredLanguage = localStorage.getItem('preferredLanguage');
        
        // If no preferred language is set, redirect to language selection page
        if (!preferredLanguage) {
            console.log('No preferred language found. Redirecting to language selection page.');
            window.location.href = 'lang_select.html';
        } else {
            console.log('Preferred language found:', preferredLanguage);
        }
    }
})();