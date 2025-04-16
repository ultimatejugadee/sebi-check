/**
 * Redirection script to check if user has selected a preferred language
 * If not, redirects to the language selection page
 */
(function() {
    // Get the current page name from the URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // No need to check for language if we're already on the language selection page
    if (currentPage === 'lang_select.html') {
        return;
    }

    // Check for preferred language
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    
    // If no preferred language is set, redirect to language selection page
    if (!preferredLanguage) {
        console.log('No preferred language found. Redirecting to language selection page.');
        window.location.href = 'lang_select.html';
    } else {
        console.log('Preferred language found:', preferredLanguage);
    }
})();