const UIController = {
    init() {
        this.conversationContainer = document.getElementById('conversation-container');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.micButton = document.getElementById('mic-button');
        this.aiMode = document.getElementById('ai-mode');
        this.aiStatus = document.getElementById('ai-status');
        
        // Load today's conversation history
        this.loadConversationHistory();
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Handle microphone button for voice input
        this.micButton.addEventListener('click', () => {
            SpeechModule.startListening();
        });
        
        // Handle AI mode change
        this.aiMode.addEventListener('change', () => {
            const mode = this.aiMode.value;
            const result = AIService.setMode(mode);
            
            if (!result.success && mode === 'cloud') {
                // If cloud mode needs an API key, prompt for it
                const apiKey = prompt('Please enter your API key for cloud mode:');
                if (apiKey) {
                    AIService.setApiKey(apiKey);
                    AIService.setMode('cloud');
                    this.aiStatus.textContent = 'Cloud';
                } else {
                    // Revert to local mode if no API key provided
                    this.aiMode.value = 'local';
                    this.aiStatus.textContent = 'Local';
                }
            } else {
                this.aiStatus.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
            }
        });
    },
    
    loadConversationHistory() {
        const history = ConversationStorage.getTodayConversation();
        
        if (history && history.length > 0) {
            history.forEach(message => {
                this.addMessageToUI(message.sender, message.text);
            });
            
            // Add a separator for new conversation
            const separator = document.createElement('div');
            separator.className = 'conversation-separator';
            separator.textContent = '--- New Session ---';
            this.conversationContainer.appendChild(separator);
            
            // Scroll to the bottom
            this.scrollToBottom();
        }
    },
    
    sendMessage() {
        const message = this.userInput.value.trim();
        
        if (message === '') return;
        
        // Add user message to UI
        this.addMessageToUI('user', message);
        
        // Save user message to storage
        ConversationStorage.saveMessage({
            sender: 'user',
            text: message
        });
        
        // Clear input field
        this.userInput.value = '';
        
        // Get conversation history for context
        const history = ConversationStorage.getTodayConversation();
        
        // Process with AI
        this.processWithAI(message, history);
    },
    
    async processWithAI(message, history) {
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process the message with the AI service
            const aiResponse = await AIService.processInput(message, history);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            if (aiResponse.success) {
                // Add AI response to UI
                this.addMessageToUI('ai', aiResponse.response);
                
                // Save AI response to storage
                ConversationStorage.saveMessage({
                    sender: 'ai',
                    text: aiResponse.response
                });
                
                // Optional: Speak the response
                if (localStorage.getItem('ai_voice_enabled') === 'true') {
                    SpeechModule.speak(aiResponse.response);
                }
            } else {
                // Handle error
                this.addMessageToUI('system', `Error: ${aiResponse.message}`);
            }
        } catch (error) {
            console.error('Error processing AI response:', error);
            this.hideTypingIndicator();
            this.addMessageToUI('system', `An error occurred: ${error.message}`);
        }
    },
    
    addMessageToUI(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format the message based on sender
        if (sender === 'user') {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.formatMessageText(text)}</div>
                    <div class="message-timestamp">${timestamp}</div>
                </div>
                <div class="message-avatar user-avatar">You</div>
            `;
        } else if (sender === 'ai') {
            messageElement.innerHTML = `
                <div class="message-avatar ai-avatar">${AIService.personality.name.charAt(0)}</div>
                <div class="message-content">
                    <div class="message-text">${this.formatMessageText(text)}</div>
                    <div class="message-timestamp">${timestamp}</div>
                </div>
            `;
        } else {
            // System message
            messageElement.innerHTML = `
                <div class="system-message-content">
                    <div class="message-text">${this.formatMessageText(text)}</div>
                    <div class="message-timestamp">${timestamp}</div>
                </div>
            `;
        }
        
        this.conversationContainer.appendChild(messageElement);
        this.scrollToBottom();
    },
    
    formatMessageText(text) {
        // Convert URLs to links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert code blocks
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Convert inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    },
    
    showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="message-avatar ai-avatar">${AIService.personality.name.charAt(0)}</div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        typingIndicator.id = 'typing-indicator';
        this.conversationContainer.appendChild(typingIndicator);
        this.scrollToBottom();
    },
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },
    
    scrollToBottom() {
        this.conversationContainer.scrollTop = this.conversationContainer.scrollHeight;
    }
};