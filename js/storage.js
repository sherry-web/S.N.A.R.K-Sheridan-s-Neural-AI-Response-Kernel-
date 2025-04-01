const ConversationStorage = {
    init() {
        if (!localStorage.getItem('conversations')) {
            localStorage.setItem('conversations', JSON.stringify([]));
        }
    },
    
    saveMessage(message) {
        const conversations = JSON.parse(localStorage.getItem('conversations'));
        const currentTimestamp = new Date().toISOString();
        
        // Check if we have a conversation for today
        const today = new Date().toDateString();
        let todayConversation = conversations.find(conv => new Date(conv.date).toDateString() === today);
        
        if (!todayConversation) {
            todayConversation = {
                date: currentTimestamp,
                messages: []
            };
            conversations.push(todayConversation);
        }
        
        todayConversation.messages.push({
            timestamp: currentTimestamp,
            ...message
        });
        
        localStorage.setItem('conversations', JSON.stringify(conversations));
    },
    
    getTodayConversation() {
        const conversations = JSON.parse(localStorage.getItem('conversations'));
        const today = new Date().toDateString();
        return conversations.find(conv => new Date(conv.date).toDateString() === today)?.messages || [];
    },
    
    clearConversations() {
        localStorage.setItem('conversations', JSON.stringify([]));
    }
};