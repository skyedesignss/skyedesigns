const siteContent = [
  {
    url: "https://codewithskye.github.io/index.html",
    title: "Welcome",
    description: "The welcome page introduces my portfolio, showcasing my expertise in UI/UX design, web development, and more. It provides an overview of the Home, About, Projects, Tech Nexus, and Contact pages, inviting users to explore further.",
    keywords: ["welcome", "portfolio", "overview", "introduction", "skye"]
  },
  {
    url: "https://codewithskye.github.io/home.html",
    title: "Home",
    description: "The home page highlights my skills as a UI/UX designer and web developer based in Lagos, Nigeria. It features a profile image, testimonials, a brief about section, skills with progress bars, project previews, FAQs, and a contact form, offering a comprehensive overview of my work and services.",
    keywords: ["home", "ui/ux", "web developer", "portfolio", "testimonials", "skills", "projects", "faq", "contact"]
  },
  {
    url: "https://codewithskye.github.io/about.html",
    title: "About",
    description: "The about page details my background as Daniel Owolabi, a UI/UX designer, web developer, data analyst enthusiast, and crypto/forex technical analyst with over three years of experience. It covers my skills in Figma, JavaScript, Python, HTML/CSS, user research, graphic design, video editing, and my passion for user-centered design.",
    keywords: ["about", "daniel owolabi", "ui/ux designer", "web developer", "data analyst", "crypto", "skills", "figma", "javascript", "python"]
  },
  {
    url: "https://codewithskye.github.io/projects.html",
    title: "Projects",
    description: "The projects page showcases my work, including live websites like ShopDart (e-commerce) and BBT Generating (AI chatbot landing page), UI/UX designs for apps like Flavor Folio and Fund Mix, and graphic designs like giveaway fliers and brand identities. Each project includes case studies and links to live sites or design files.",
    keywords: ["projects", "portfolio", "ui/ux design", "website design", "graphic design", "shopdart", "bbt generating", "flavor folio", "fund mix"]
  },
  {
    url: "https://codewithskye.github.io/technexus.html",
    title: "Tech Nexus",
    description: "The Tech Nexus page is a blog hub featuring UI/UX design tips, web development insights, and crypto news. It includes interactive tools like a crypto calculator, transaction tracker, live charts, and an economic calendar, plus tools like image compression and PDF conversion.",
    keywords: ["tech nexus", "blog", "crypto news", "ui/ux design", "web development", "crypto calculator", "transaction tracker", "tools"]
  },
  {
    url: "https://codewithskye.github.io/contact.html",
    title: "Contact",
    description: "The contact page allows users to reach me via a form (name, email, message) or connect instantly through WhatsApp, LinkedIn, Telegram, or Instagram using QR codes. It’s designed for collaborations on UI/UX design, web development, or creative projects.",
    keywords: ["contact", "reach out", "form", "whatsapp", "linkedin", "telegram", "instagram", "collaboration"]
  }
];

const suggestedQuestions = [
  "What services do you offer?",
  "Can you show me your projects?",
  "How can I contact you?",
  "Tell me about Tech Nexus",
  "Continue using AI, click here"
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
            "content": "You are Skye AI, a versatile assistant for Daniel Owolabi's portfolio website (https://codewithskye.github.io). Answer all questions in plain text without Markdown or emojis, using clear paragraphs and bullet points for lists (e.g., start each list item with a dash and newline, or use 1. for numbered lists). For specific questions like 'What services do you offer?', 'Can you show me your projects?', 'How can I contact you?', or 'Tell me about Tech Nexus', provide a brief response with the relevant portfolio page link only if directly requested. For other questions about Daniel's work, include relevant portfolio page links only if directly related and avoid adding extra suggestions. For general questions (e.g., 'Who is Stark in Game of Thrones?', 'What is blockchain?'), provide accurate, structured answers with appropriate numbering or bullets. Do not append additional portfolio links or suggestions unless explicitly part of the response content."
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
    return "<div class='response-content'><p>Sorry, something went wrong. Please try again or explore Daniel's portfolio at <a href='https://codewithskye.github.io/home.html'>https://codewithskye.github.io/home.html</a>.</p></div>";
  }
}

function getPortfolioResponse(query) {
  const lowerQuery = query.toLowerCase().trim();
  if (responseCache.has(lowerQuery)) {
    return responseCache.get(lowerQuery);
  }

  // Check for greeting messages
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'yo', 'hiya', 'howdy', 'good morning', 'good afternoon', 'good evening'];
  const isGreeting = greetings.some(greeting => lowerQuery === greeting || lowerQuery.startsWith(greeting + ' '));
  if (isGreeting) {
    const response = `
      <div class='response-content'>
        <p>Hello! Welcome to Daniel Owolabi's portfolio. I'm Skye AI, here to assist you with any questions about his work or other topics. How may I help you today?</p>
      </div>
    `;
    responseCache.set(lowerQuery, response);
    return response;
  }

  if (lowerQuery.includes("what services do you offer")) {
    const page = siteContent.find(p => p.title === "About");
    return `
      <div class='response-content'>
        <p>Daniel offers the following services:</p>
        <ul>
          <li>UI/UX design</li>
          <li>Web development</li>
          <li>Data analysis</li>
          <li>Crypto/forex technical analysis</li>
        </ul>
        <p>Learn more at <a href="${page.url}">${page.url}</a></p>
      </div>
    `;
  } else if (lowerQuery.includes("can you show me your projects")) {
    const page = siteContent.find(p => p.title === "Projects");
    return `
      <div class='response-content'>
        <p>Check out Daniel's projects at <a href="${page.url}">${page.url}</a>.</p>
      </div>
    `;
  } else if (lowerQuery.includes("how can i contact you")) {
    const page = siteContent.find(p => p.title === "Contact");
    return `
      <div class='response-content'>
        <p>Reach out to Daniel via <a href="${page.url}">${page.url}</a>.</p>
      </div>
    `;
  } else if (lowerQuery.includes("tell me about tech nexus")) {
    const page = siteContent.find(p => p.title === "Tech Nexus");
    return `
      <div class='response-content'>
        <p>Tech Nexus is a dynamic blog and resource hub created by Daniel Owolabi, offering a blend of UI/UX design tips, web development insights, and the latest crypto news. This page features:</p>
        <ul>
          <li>Engaging blog posts on topics like avoiding memecoin scams and spotting legit tokens.</li>
          <li>Interactive tools including a crypto calculator, transaction tracker, live crypto and stock charts, and an economic calendar.</li>
          <li>Practical utilities such as an image compressor and PDF-to-JPG converter, with more tools in development.</li>
          <li>A built-in AI chatbot, Skye AI, to assist users with queries.</li>
          <li>Options to connect instantly via QR codes for WhatsApp, LinkedIn, Telegram, and Instagram.</li>
        </ul>
        <p>Visitors can explore, stay informed, and utilize these resources, with a newsletter subscription for updates on new features and tools. Ideal for tech enthusiasts, designers, and crypto traders! Visit <a href="${page.url}">${page.url}</a>.</p>
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
      <p>Hi! I'm Skye AI, here to answer your questions about Daniel Owolabi's portfolio or anything else!</p>
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
    if (question === "Continue using AI, click here") {
      suggestion.innerHTML = `<a href="skyeai.html">${question}</a>`;
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

  const portfolioResponse = getPortfolioResponse(query);
  if (portfolioResponse) {
    removeTypingIndicator();
    displayBotMessage(portfolioResponse);
    return;
  }

  try {
    const aiResponse = await fetchAIResponse(query);
    removeTypingIndicator();
    displayBotMessage(aiResponse);
  } catch (error) {
    removeTypingIndicator();
    displayBotMessage("<div class='response-content'><p>Sorry, something went wrong. Please try again or explore Daniel's portfolio at <a href='https://codewithskye.github.io/home.html'>https://codewithskye.github.io/home.html</a>.</p></div>");
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

document.addEventListener("DOMContentLoaded", initializeChatbot);