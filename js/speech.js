const SpeechModule = {
    recognition: null,
    synthesis: window.speechSynthesis,
    isListening: false,
    
    init() {
        // Initialize speech recognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('user-input').value = transcript;
                // Trigger send after voice input
                document.getElementById('send-button').click();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                document.getElementById('voice-status').textContent = 'Error: ' + event.error;
                this.isListening = false;
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('voice-status').textContent = 'Ready';
                document.getElementById('mic-button').classList.remove('active');
            };
            
            return true;
        } else {
            console.error('Speech recognition not supported');
            document.getElementById('voice-status').textContent = 'Not Supported';
            document.getElementById('mic-button').disabled = true;
            return false;
        }
    },
    
    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.isListening = true;
            document.getElementById('voice-status').textContent = 'Listening...';
            document.getElementById('mic-button').classList.add('active');
        }
    },
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    },
    
    speak(text) {
        if (this.synthesis) {
            // Stop any current speech
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Get available voices and select a good one
            let voices = this.synthesis.getVoices();
            if (voices.length > 0) {
                // Try to find a nice voice - prefer English voices
                const preferredVoice = voices.find(voice => 
                    voice.lang.includes('en') && voice.name.includes('Google') || 
                    voice.name.includes('Microsoft')
                );
                
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
            }
            
            // Adjust speech parameters for better quality
            utterance.rate = 1.0;  // Normal speech rate
            utterance.pitch = 1.0; // Normal pitch
            utterance.volume = 1.0; // Full volume
            
            this.synthesis.speak(utterance);
            
            return true;
        } else {
            console.error('Speech synthesis not supported');
            return false;
        }
    }
};