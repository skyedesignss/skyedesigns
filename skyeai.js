document.addEventListener('DOMContentLoaded', () => {
    // Handle "Coming soon" for login/signup buttons
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const comingSoon = document.createElement('div');
    comingSoon.id = 'coming-soon';
    comingSoon.className = 'coming-soon hidden';
    comingSoon.textContent = 'Coming soon';
    document.body.appendChild(comingSoon);

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        comingSoon.classList.remove('hidden');
        setTimeout(() => comingSoon.classList.add('hidden'), 2000);
    });

    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        comingSoon.classList.remove('hidden');
        setTimeout(() => comingSoon.classList.add('hidden'), 2000);
    });

    // Chatbot functionality
    const suggestedQuestions = [
        "What's the latest tech news?",
        "Tell me about artificial intelligence",
        "How does blockchain work?",
        "What is the future of AI?",
        "Back to portfolio"
    ];

    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotSendBtn = document.querySelector(".chatbot-send");
    const responseCache = new Map();
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing";
    typingIndicator.innerHTML = "<span class='typing-dot'></span><span class='typing-dot'></span><span class='typing-dot'></span>";
    let lastRequestTime = 0;
    const RATE_LIMIT_MS = 2000;

    function cleanMarkdown(text) {
        text = text.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/\*([^\*]+)\*/g, "<em>$1</em>");
        text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "");
        text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, "<a href='$2'>$1</a>");
        text = text.replace(/(?:^|\n)(\d+\.\s+)([^\n]+)/g, (match, number, content) => `<li>${content.trim()}</li>`);
        text = text.replace(/(?:^|\n)([-*]\s+)([^\n]+)/g, (match, bullet, content) => `<li>${content.trim()}</li>`);
        if (text.match(/\d+\.\s/)) {
            text = text.replace(/(<li>.*<\/li>)/g, "<ol>$1</ol>");
        }
        if (text.includes("<li>") && !text.match(/\d+\.\s/)) {
            text = text.replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");
        }
        text = text.trim().replace(/\n{2,}/g, "</p><p>");
        text = `<div class="response-content">${text}</div>`;
        text = text.replace(/\n/g, "<br>");
        text = text.replace(/<p>\s*<\/p>/g, "");
        return text;
    }

    async function fetchAIResponse(query) {
        if (responseCache.has(query.toLowerCase())) {
            return responseCache.get(query.toLowerCase());
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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",
                    "HTTP-Referer": "https://codewithskye.github.io",
                    "X-Title": "CodeWithSkye",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "deepseek/deepseek-r1:free",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are Skye AI, a versatile assistant created by Daniel Owolabi. Answer all questions in plain text without Markdown or emojis, using clear paragraphs and bullet points for lists (e.g., start each list item with a dash and newline, or use 1. for numbered lists). Provide accurate, structured answers for general questions (e.g., 'What's the latest tech news?', 'What is blockchain?'). Do not include portfolio links or suggestions unless explicitly requested."
                        },
                        {
                            "role": "user",
                            "content": query
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            let cleanedResponse = data.choices[0].message.content || "Sorry, I couldn't generate a response.";
            cleanedResponse = cleanedResponse.replace(/For insights into.*$/i, "").trim();
            cleanedResponse = cleanMarkdown(cleanedResponse);
            responseCache.set(query.toLowerCase(), cleanedResponse);
            return cleanedResponse;
        } catch (error) {
            console.error("Error fetching AI response:", error);
            return "<div class='response-content'><p>Sorry, something went wrong. Please try again.</p></div>";
        }
    }

    function getCustomResponse(query) {
        const lowerQuery = query.toLowerCase().trim();
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'yo', 'hiya', 'howdy', 'good morning', 'good afternoon', 'good evening', 'how are you', 'how you doing', 'what\'s up', 'sup'];
        const isGreeting = greetings.some(greeting => lowerQuery === greeting || lowerQuery.startsWith(greeting + ' '));
        if (isGreeting) {
            return `
                <div class='response-content'>
                    <p>Hello! I'm Skye AI, created by Daniel Owolabi. How can I assist you today?</p>
                </div>
            `;
        }
        if (lowerQuery.includes("who created you") || lowerQuery.includes("who made you")) {
            return `
                <div class='response-content'>
                    <p>I am Skye AI, created by Daniel Owolabi.</p>
                </div>
            `;
        }
        return null;
    }

    function initializeChatbot() {
        if (!chatbotInput || !chatbotMessages || !chatbotSendBtn) {
            console.error("Chatbot elements not found. Ensure HTML contains elements with IDs: chatbot-input, chatbot-messages, and class: chatbot-send");
            return;
        }

        displayWelcomeMessage();
        displaySuggestedQuestions();
        setupEventListeners();
    }

    function displayWelcomeMessage() {
        const welcomeMessage = document.createElement("div");
        welcomeMessage.className = "message bot-message";
        welcomeMessage.style.position = "relative";
        welcomeMessage.innerHTML = `
            <div class='response-content'>
                <p>Hello! I'm Skye AI. Ask me anything!</p>
            </div>
        `;
        chatbotMessages.appendChild(welcomeMessage);
        scrollToBottom();
        setupCopyButton(welcomeMessage.querySelector(".copy-btn"));
    }

    function displaySuggestedQuestions() {
        const suggestionsContainer = document.createElement("div");
        suggestionsContainer.className = "suggestions-container";
        suggestionsContainer.id = "suggestions-container";
        suggestedQuestions.forEach((question) => {
            const suggestion = document.createElement("button");
            suggestion.className = "suggestion-btn";
            if (question === "Back to portfolio") {
                suggestion.innerHTML = `<a href="https://codewithskye.github.io">Back to portfolio</a>`;
            } else {
                suggestion.textContent = question;
                suggestion.addEventListener("click", () => {
                    chatbotInput.value = question;
                    handleChatbotInput();
                });
            }
            suggestionsContainer.appendChild(suggestion);
        });
        const chatbotContainer = document.querySelector(".chatbot-container");
        chatbotContainer.appendChild(suggestionsContainer);
    }

    function setupEventListeners() {
        chatbotSendBtn.addEventListener("click", handleChatbotInput);
        chatbotInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleChatbotInput();
        });
    }

    async function handleChatbotInput() {
        const query = chatbotInput.value.trim();
        if (!query) return;

        const currentTime = Date.now();
        if (currentTime - lastRequestTime < RATE_LIMIT_MS) {
            displayBotMessage("<div class='response-content'><p>Please wait a moment before sending another message.</p></div>");
            return;
        }
        lastRequestTime = currentTime;

        displayUserMessage(query);
        chatbotInput.value = "";
        displayTypingIndicator();

        const customResponse = getCustomResponse(query);
        if (customResponse) {
            removeTypingIndicator();
            displayBotMessage(customResponse);
            return;
        }

        try {
            const aiResponse = await fetchAIResponse(query);
            removeTypingIndicator();
            displayBotMessage(aiResponse);
        } catch (error) {
            removeTypingIndicator();
            displayBotMessage("<div class='response-content'><p>Sorry, something went wrong. Please try again.</p></div>");
        }
    }

    function displayUserMessage(text) {
        const userMessage = document.createElement("div");
        userMessage.className = "message user-message";
        userMessage.textContent = text;
        chatbotMessages.appendChild(userMessage);
        scrollToBottom();
    }

    function displayBotMessage(text) {
        const botMessage = document.createElement("div");
        botMessage.className = "message bot-message";
        botMessage.style.position = "relative";
        botMessage.innerHTML = `
            ${text}
            <button class="copy-btn" title="Copy response"><i class='bx bx-copy'></i></button>
        `;
        chatbotMessages.appendChild(botMessage);
        scrollToBottom();
        setupCopyButton(botMessage.querySelector(".copy-btn"));
    }

    function setupCopyButton(button) {
        if (button) {
            button.style.position = "absolute";
            button.style.bottom = "5px";
            button.style.right = "5px";
            button.addEventListener("click", () => {
                const messageElement = button.parentElement;
                const messageText = Array.from(messageElement.querySelector(".response-content").childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BUTTON"))
                    .map(node => node.textContent || node.innerText)
                    .join("")
                    .trim();
                navigator.clipboard.writeText(messageText).then(() => {
                    button.innerHTML = "<i class='bx bx-check'></i>";
                    setTimeout(() => {
                        button.innerHTML = "<i class='bx bx-copy'></i>";
                    }, 2000);
                });
            });
        }
    }

    function displayTypingIndicator() {
        chatbotMessages.appendChild(typingIndicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        if (typingIndicator.parentElement) {
            typingIndicator.remove();
        }
    }

    function scrollToBottom() {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    initializeChatbot();
});