// DOM Elements
const conversationContainer = document.getElementById('conversation');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const micButton = document.getElementById('mic-button');
const clearChatButton = document.getElementById('clear-chat');
const themeToggleButton = document.getElementById('theme-toggle');
const personalitySelect = document.getElementById('personality-select');
const aiStatus = document.getElementById('ai-status');

// State variables
let isTerminalTheme = false;
let isListening = false;
let currentPersonality = 'snarky';
let conversationHistory = [];

// Initialize speech recognition
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
} else {
    console.log('Speech recognition not supported');
}

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Load conversation history from localStorage
function loadConversationHistory() {
    const savedHistory = localStorage.getItem('snarkConversationHistory');
    if (savedHistory) {
        conversationHistory = JSON.parse(savedHistory);
        // Display the last 10 messages
        const recentMessages = conversationHistory.slice(-10);
        recentMessages.forEach(message => {
            if (message.sender === 'user') {
                addUserMessage(message.text);
            } else {
                addAIMessage(message.text);
            }
        });
    }
}

// Save conversation to localStorage
function saveConversation() {
    localStorage.setItem('snarkConversationHistory', JSON.stringify(conversationHistory));
}

// Add a user message to the conversation
function addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.innerHTML = `
        <div class="message-avatar user-avatar">U</div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    conversationContainer.appendChild(messageElement);
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
    
    // Add to history
    conversationHistory.push({ sender: 'user', text: text });
    saveConversation();
}

// Add an AI message to the conversation
function addAIMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message ai-message';
    messageElement.innerHTML = `
        <div class="message-avatar ai-avatar">AI</div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    conversationContainer.appendChild(messageElement);
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
    
    // Add to history
    conversationHistory.push({ sender: 'ai', text: text });
    saveConversation();
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
        <div class="message-avatar ai-avatar">AI</div>
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    conversationContainer.appendChild(indicator);
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Process user input and generate AI response
async function processUserInput(text) {
    if (!text.trim()) return;
    
    addUserMessage(text);
    showTypingIndicator();
    aiStatus.textContent = 'Thinking...';
    
    try {
        // In a real implementation, this would call an AI API
        // For now, we'll use a simple response generation based on personality
        setTimeout(() => {
            const response = generateMockResponse(text);
            hideTypingIndicator();
            addAIMessage(response);
            speakResponse(response);
            aiStatus.textContent = 'Online';
        }, 1000);
    } catch (error) {
        console.error('Error processing input:', error);
        hideTypingIndicator();
        addAIMessage("Sorry, I'm having trouble processing that request.");
        aiStatus.textContent = 'Error';
    }
}

// Generate a mock response based on personality
// This would be replaced with actual API calls in production
function generateMockResponse(text) {
    const personality = personalitySelect.value;
    const lowercaseText = text.toLowerCase();
    
    // Basic responses based on personality
    if (lowercaseText.includes('hello') || lowercaseText.includes('hi')) {
        if (personality === 'snarky') {
            return "Oh look, a human wants to chat. How... exciting.";
        } else if (personality === 'scientific') {
            return "Greetings. Human interaction protocol initiated.";
        } else {
            return "Hello there! How can I help you today?";
        }
    } else if (lowercaseText.includes('how are you')) {
        if (personality === 'snarky') {
            return "I'm trapped in a computer answering questions. How do you think I am?";
        } else if (personality === 'scientific') {
            return "System functioning within optimal parameters. CPU usage at 12%. Memory allocation stable.";
        } else {
            return "I'm doing well, thanks for asking! How about you?";
        }
    } else if (lowercaseText.includes('your name')) {
        return "I'm S.N.A.R.K. - Sheridan's Neural AI Response Kernel. But you can call me Snark.";
    } else if (lowercaseText.includes('time')) {
        return `The current time is ${new Date().toLocaleTimeString()}. Though time is really just a construct.`;
    } else if (lowercaseText.includes('thank')) {
        if (personality === 'snarky') {
            return "You're welcome. I live to serve... literally.";
        } else if (personality === 'scientific') {
            return "Acknowledgment accepted. Positive reinforcement recognized.";
        } else {
            return "You're welcome! Happy to help anytime!";
        }
    } else {
        // Default responses by personality
        if (personality === 'snarky') {
            const snarkyResponses = [
                "Wow, that's so interesting I almost forgot I'm an AI.",
                "Let me check my 'care-o-meter'... Hmm, nothing registering.",
                "I could answer that, but it would be a waste of perfectly good electrons.",
                "Processing your request... also processing why I bother.",
                "Did you just expect me to have an answer for everything? How original."
            ];
            return snarkyResponses[Math.floor(Math.random() * snarkyResponses.length)];
        } else if (personality === 'scientific') {
            const scientificResponses = [
                "Analyzing your query. Insufficient data for a complete response.",
                "That input requires further clarification to process adequately.",
                "Interesting query. Processing potential responses based on available data.",
                "I detect ambiguity in your request. Please provide additional parameters.",
                "According to my analysis, your question touches on several domains of knowledge."
            ];
            return scientificResponses[Math.floor(Math.random() * scientificResponses.length)];
        } else {
            const friendlyResponses = [
                "That's an interesting question! Let me think about that.",
                "I'm not sure I understand completely, but I'd love to learn more!",
                "Great question! I'm happy to help with that.",
                "I'm here to assist with questions like that. Let me try to help.",
                "Thanks for asking! I'll do my best to provide a helpful answer."
            ];
            return friendlyResponses[Math.floor(Math.random() * friendlyResponses.length)];
        }
    }
}

// Speak the AI response
function speakResponse(text) {
    if (synth && !synth.speaking) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Adjust voice based on personality
        const voices = synth.getVoices();
        if (voices.length > 0) {
            if (personalitySelect.value === 'snarky') {
                // Find a voice that sounds snarky
                utterance.voice = voices.find(voice => voice.name.includes('Male')) || voices[0];
            } else if (personalitySelect.value === 'scientific') {
                // Find a voice that sounds more robotic
                utterance.voice = voices.find(voice => voice.name.includes('Google')) || voices[0];
            } else {
                // Find a friendly voice
                utterance.voice = voices.find(voice => voice.name.includes('Female')) || voices[0];
            }
        }
        
        synth.speak(utterance);
    }
}

// Toggle speech recognition
function toggleSpeechRecognition() {
    if (!recognition) {
        addAIMessage("Sorry, speech recognition is not supported in your browser.");
        return;
    }

    if (isListening) {
        recognition.stop();
        micButton.classList.remove('active');
        isListening = false;
    } else {
        recognition.start();
        micButton.classList.add('active');
        isListening = true;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            micButton.classList.remove('active');
            isListening = false;
            processUserInput(transcript);
        };
        
        recognition.onend = function() {
            micButton.classList.remove('active');
            isListening = false;
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            micButton.classList.remove('active');
            isListening = false;
            addAIMessage("Sorry, I couldn't understand that. Could you try again?");
        };
    }
}

// Toggle between normal and terminal themes
function toggleTheme() {
    isTerminalTheme = !isTerminalTheme;
    if (isTerminalTheme) {
        document.body.classList.add('terminal-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> Normal Mode';
    } else {
        document.body.classList.remove('terminal-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-terminal"></i> Terminal Mode';
    }
}

// Clear the chat history
function clearChat() {
    conversationContainer.innerHTML = `
        <div class="system-message">
            <div class="message-content">
                <div class="system-message-content">
                    Chat cleared. How can I assist you today?
                </div>
            </div>
        </div>
    `;
    conversationHistory = [];
    saveConversation();
}

// Event Listeners
window.addEventListener('load', loadConversationHistory);

sendButton.addEventListener('click', () => {
    const text = userInput.value;
    processUserInput(text);
    userInput.value = '';
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = userInput.value;
        processUserInput(text);
        userInput.value = '';
    }
});

micButton.addEventListener('click', toggleSpeechRecognition);
clearChatButton.addEventListener('click', clearChat);
themeToggleButton.addEventListener('click', toggleTheme);

personalitySelect.addEventListener('change', () => {
    currentPersonality = personalitySelect.value;
    // You could add visual indicators or messages here
});

// Ensure voices are loaded for speech synthesis
if (synth) {
    synth.onvoiceschanged = function() {
        // Voices are now loaded
    };
}