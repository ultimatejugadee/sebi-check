// Language handling
let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
const buttonTexts = {};

// Load XML content
async function loadButtonTexts() {
    const response = await fetch('button_text.xml');
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const buttons = xmlDoc.getElementsByTagName('button');

    Array.from(buttons).forEach(button => {
        const id = button.getAttribute('id');
        buttonTexts[id] = {};
        const languages = button.children;
        Array.from(languages).forEach(lang => {
            buttonTexts[id][lang.tagName] = lang.textContent;
        });
    });
}

// Initialize language selection
async function initializeLanguage() {
    await loadButtonTexts();
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            localStorage.setItem('selectedLanguage', currentLanguage);
            updatePageText();
        });
    }

    // Check if we're on the first page and have a saved language
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        if (localStorage.getItem('selectedLanguage')) {
            window.location.href = 'main.html';
        }
    }

    updatePageText();
}

// Update text based on selected language
function updatePageText() {
    // Update main page buttons
    ['p1_b1', 'p1_b2', 'p1_b3'].forEach(id => {
        const button = document.getElementById(id);
        if (button && buttonTexts[id]) {
            button.textContent = buttonTexts[id][currentLanguage];
        }
    });

    // Update placeholders based on current page
    updatePlaceholders();
}

// Update input placeholders
function updatePlaceholders() {
    const placeholderTexts = {
        'upi-input': {
            en: 'Enter UPI ID',
            hi: 'यूपीआई आईडी दर्ज करें',
            // Add other languages as needed
        },
        'registration-number': {
            en: 'Registration Number',
            hi: 'पंजीकरण संख्या',
            // Add other languages as needed
        },
        'account-number': {
            en: 'Account Number',
            hi: 'खाता संख्या',
            // Add other languages as needed
        },
        'ifsc': {
            en: 'IFSC Code',
            hi: 'IFSC कोड',
            // Add other languages as needed
        }
    };

    Object.keys(placeholderTexts).forEach(id => {
        const input = document.getElementById(id);
        if (input && placeholderTexts[id][currentLanguage]) {
            input.placeholder = placeholderTexts[id][currentLanguage];
        }
    });
}

// Camera handling
async function initializeCamera() {
    if (document.getElementById('camera')) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            const video = document.getElementById('camera');
            video.srcObject = stream;
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    }
}

// Image capture and processing
async function captureImage() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');
    
    // Send to VPS server for processing
    try {
        const response = await fetch('https://your-vps-server.com/process-image', {
            method: 'POST',
            body: JSON.stringify({ image: imageData }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        displayUPIResults(result.upiIds);
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

// Display UPI results
function displayUPIResults(upiIds) {
    const upiList = document.getElementById('upi-list');
    if (!upiList) return;

    upiList.innerHTML = '';
    upiIds.forEach(upi => {
        const div = document.createElement('div');
        div.className = 'upi-item';
        div.innerHTML = `
            <span>${upi}</span>
            <button onclick="checkUPI('${upi}')" class="check-btn">Check UPI ID</button>
        `;
        upiList.appendChild(div);
    });
}

// Check UPI ID
async function checkUPI(upiId) {
    try {
        const response = await fetch('https://your-vps-server.com/check-upi', {
            method: 'POST',
            body: JSON.stringify({ upiId }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        showResult(result);
    } catch (err) {
        console.error('Error checking UPI:', err);
    }
}

// Check bank details
async function checkBankDetails(regNo, accountNo, ifsc) {
    try {
        const response = await fetch('https://your-vps-server.com/check-bank', {
            method: 'POST',
            body: JSON.stringify({ regNo, accountNo, ifsc }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        showResult(result);
    } catch (err) {
        console.error('Error checking bank details:', err);
    }
}

// Show result
function showResult(result) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="result-box ${result.status}">
                ${result.message}
            </div>
        `;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    await initializeLanguage();
    await initializeCamera();

    // Capture button
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
        captureBtn.addEventListener('click', captureImage);
    }

    // Check UPI button
    const checkUpiBtn = document.getElementById('check-upi-btn');
    if (checkUpiBtn) {
        checkUpiBtn.addEventListener('click', () => {
            const upiId = document.getElementById('upi-input').value;
            if (upiId) checkUPI(upiId);
        });
    }

    // Check bank details button
    const checkBankBtn = document.getElementById('check-bank-btn');
    if (checkBankBtn) {
        checkBankBtn.addEventListener('click', () => {
            const regNo = document.getElementById('registration-number').value;
            const accountNo = document.getElementById('account-number').value;
            const ifsc = document.getElementById('ifsc').value;
            if (regNo && accountNo && ifsc) {
                checkBankDetails(regNo, accountNo, ifsc);
            }
        });
    }

    // Main page button navigation
    ['p1_b1', 'p1_b2', 'p1_b3'].forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                switch(id) {
                    case 'p1_b1': window.location.href = 'capture.html'; break;
                    case 'p1_b2': window.location.href = 'check-upi.html'; break;
                    case 'p1_b3': window.location.href = 'bank-details.html'; break;
                }
            });
        }
    });
});