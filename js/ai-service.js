const AIService = {
    mode: 'local', // 'local' or 'cloud'
    apiKey: null,
    personality: null,
    
    init(mode = 'local') {
        this.mode = mode;
        
        // Set default personality
        this.personality = AIPersonalities.SNARK;
        
        // Check for stored API key
        const storedApiKey = localStorage.getItem('ai_api_key');
        if (storedApiKey) {
            this.apiKey = storedApiKey;
        }
        
        // Check for stored mode preference
        const storedMode = localStorage.getItem('ai_mode');
        if (storedMode) {
            this.mode = storedMode;
        }
        
        // Check for stored personality preference
        const storedPersonality = localStorage.getItem('ai_personality');
        if (storedPersonality && AIPersonalities[storedPersonality]) {
            this.personality = AIPersonalities[storedPersonality];
        }
        
        return { success: true };
    },
    
    setMode(mode) {
        if (mode === 'cloud' && !this.apiKey) {
            return { success: false, message: 'API key required for cloud mode' };
        }
        
        this.mode = mode;
        localStorage.setItem('ai_mode', mode);
        
        return { success: true };
    },
    
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('ai_api_key', key);
        
        return { success: true };
    },
    
    setPersonality(personalityKey) {
        if (AIPersonalities[personalityKey]) {
            this.personality = AIPersonalities[personalityKey];
            localStorage.setItem('ai_personality', personalityKey);
            return { success: true };
        }
        
        return { success: false, message: 'Invalid personality' };
    },
    
    async processInput(message, history = []) {
        try {
            // Get initial thinking message for UX
            const thinkingMessage = this.personality.getRandomThinking();
            
            if (this.mode === 'local') {
                // Local mode - simple rule-based responses
                return await this.processLocalRequest(message, history);
            } else {
                // Cloud mode - use external API
                return await this.processCloudRequest(message, history);
            }
        } catch (error) {
            console.error('Error processing input:', error);
            return {
                success: false,
                message: error.message || 'An unknown error occurred'
            };
        }
    },
    
    async processLocalRequest(message, history) {
        // Simulate processing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Get lowercase message for easier matching
        const lowerMessage = message.toLowerCase();
        
        // Commands and responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage === 'hi') {
            return {
                success: true,
                response: this.personality.processResponse(`Hello there! I'm ${this.personality.name}, at your service.`)
            };
        } else if (lowerMessage.includes('how are you')) {
            return {
                success: true,
                response: this.personality.processResponse("I'm just a bundle of code running on your device. But if I had feelings, I'd say I'm doing pretty well. How about you?")
            };
        } else if (lowerMessage.includes('your name')) {
            return {
                success: true,
                response: this.personality.processResponse(`I'm ${this.personality.name}, which stands for ${this.personality.fullName}. Try not to forget it.`)
            };
        } else if (lowerMessage.includes('time')) {
            const now = new Date();
            return {
                success: true,
                response: this.personality.processResponse(`It's currently ${now.toLocaleTimeString()}. Time is a construct, but it's still important to humans, I guess.`)
            };
        } else if (lowerMessage.includes('weather')) {
            return {
                success: true,
                response: this.personality.processResponse("I can't check the weather right now since I don't have access to those APIs in local mode. Switch to cloud mode if you want those fancy features.")
            };
        } else if (lowerMessage.includes('joke')) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
                "Why did the scarecrow win an award? Because he was outstanding in his field!",
                "I told my wife she was drawing her eyebrows too high. She looked surprised.",
                "What do you call a fake noodle? An impasta!",
                "How does a computer get drunk? It takes screenshots!"
            ];
            
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            
            return {
                success: true,
                response: this.personality.processResponse(randomJoke)
            };
        } else if (lowerMessage.includes('thank')) {
            return {
                success: true,
                response: this.personality.processResponse("You're welcome. That's what I'm here for, after all.")
            };
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return {
                success: true,
                response: this.personality.processResponse(this.personality.getRandomFarewell())
            };
        } else if (lowerMessage.includes('help')) {
            return {
                success: true,
                response: this.personality.processResponse("Need help? I can tell you the time, tell jokes, chat about basic topics, or just keep you company. If you need more advanced features, switch to cloud mode.")
            };
        } else if (lowerMessage.includes('change personality') || lowerMessage.includes('switch personality')) {
            let availablePersonalities = Object.keys(AIPersonalities).join(', ');
            return {
                success: true,
                response: this.personality.processResponse(`You can change my personality using the settings. Available personalities: ${availablePersonalities}`)
            };
        } else if (lowerMessage.includes('date')) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return {
                success: true,
                response: this.personality.processResponse(`Today is ${now.toLocaleDateString(undefined, options)}. Another day, another set of human problems to solve.`)
            };
        } else if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
            return {
                success: true,
                response: this.personality.processResponse(`I'm ${this.personality.name} (${this.personality.fullName}), a web-based AI assistant. Currently I'm running in ${this.mode} mode, which means I'm ${this.mode === 'local' ? 'using predefined responses' : 'connected to a cloud AI service'}.`)
            };
        } else {
            // Generic responses for unrecognized inputs
            const genericResponses = [
                "I'm not sure how to respond to that in local mode. Try cloud mode for more advanced conversations.",
                "That's beyond my local capabilities. Switch to cloud mode for more intelligent responses.",
                "Hmm, I don't have a canned response for that. I'd be smarter in cloud mode.",
                "My local brain is limited. Ask something simpler or enable cloud mode.",
                "I'd need to connect to the cloud to properly answer that one."
            ];
            
            const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
            
            return {
                success: true,
                response: this.personality.processResponse(randomResponse)
            };
        }
    },
    
    async processCloudRequest(message, history) {
        // Check if we have an API key
        if (!this.apiKey) {
            return {
                success: false,
                message: 'No API key provided for cloud mode'
            };
        }
        
        try {
            // Prepare conversation history in the format expected by most AI APIs
            const formattedHistory = history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));
            
            // Add the current message
            formattedHistory.push({
                role: 'user',
                content: message
            });
            
            // Prepare API request using OpenAI API format as an example
            // This can be adapted to other APIs like Hugging Face, Wit.ai, etc.
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // Can be made configurable
                    messages: [
                        // Add a system message to set the personality
                        {
                            role: 'system',
                            content: `You are ${this.personality.name} (${this.personality.fullName}). ${this.personality === AIPersonalities.SNARK ? 
                                'You are sarcastic, witty, and slightly annoyed at having to help humans with their trivial problems. Add occasional *burps* to your responses and use snarky humor.' : 
                                'You are helpful, friendly, and enthusiastic. You use emojis occasionally and maintain a positive, encouraging tone.'}`
                        },
                        ...formattedHistory
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'Error connecting to AI service');
            }
            
            // Process the response with the personality's style
            const aiText = data.choices[0].message.content;
            const processedResponse = this.personality.processResponse(aiText);
            
            return {
                success: true,
                response: processedResponse
            };
        } catch (error) {
            console.error('Cloud AI Error:', error);
            return {
                success: false,
                message: `Cloud AI Error: ${error.message}`
            };
        }
    },
    
    // Method to get available personalities
    getAvailablePersonalities() {
        return Object.keys(AIPersonalities);
    },
    
    // Method to toggle voice features
    toggleVoice(enabled) {
        localStorage.setItem('ai_voice_enabled', enabled.toString());
        return { success: true };
    },
    
    // Check if voice is enabled
    isVoiceEnabled() {
        return localStorage.getItem('ai_voice_enabled') === 'true';
    },
    
    // Method to clear conversation history
    clearHistory() {
        ConversationStorage.clearConversations();
        return { success: true, message: 'Conversation history cleared' };
    }
};