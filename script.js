const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const cleanBtn = document.getElementById('cleanBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const outputSection = document.getElementById('outputSection');
const message = document.getElementById('message');

cleanBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    
    if (!text) {
        showMessage('Please enter some text to clean.', 'error');
        return;
    }
    
    cleanBtn.disabled = true;
    cleanBtn.textContent = 'Cleaning...';
    message.textContent = '';
    
    try {
        const response = await fetch('/api/clean', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to clean text');
        }

        if (!data.cleaned) {
            throw new Error('No response from server');
        }

        outputText.value = data.cleaned;
        outputSection.style.display = 'block';
        showMessage('Text cleaned successfully!', 'success');
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
        console.error('Error:', error);
    } finally {
        cleanBtn.disabled = false;
        cleanBtn.textContent = 'Clean English';
    }
});

copyBtn.addEventListener('click', () => {
    outputText.select();
    document.execCommand('copy');
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    showMessage('Copied to clipboard!', 'success');
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});

clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    outputSection.style.display = 'none';
    message.textContent = '';
    inputText.focus();
});

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}