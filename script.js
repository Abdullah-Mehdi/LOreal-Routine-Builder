/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");

/* Global variables to track application state */
let allProducts = []; // Store all products from JSON
let selectedProducts = []; // Track selected products
let conversationHistory = []; // Store chat history for context
let isGeneratingResponse = false; // Prevent multiple simultaneous requests

/* Cloudflare Worker endpoint for API requests */
const WORKER_URL = "https://loreal-worker.thetrueqwerty97.workers.dev/";

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category above to discover L'Oréal products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  try {
    const response = await fetch("products.json");
    const data = await response.json();
    allProducts = data.products;
    return allProducts;
  } catch (error) {
    console.error("Error loading products:", error);
    showError("Failed to load products. Please refresh the page.");
    return [];
  }
}

/* Load selected products from localStorage on page load */
function loadSelectedProducts() {
  const saved = localStorage.getItem("selectedProducts");
  if (saved) {
    selectedProducts = JSON.parse(saved);
    updateSelectedProductsDisplay();
    updateProductCardSelection();
  }
}

/* Save selected products to localStorage */
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        No products found in this category
      </div>
    `;
    return;
  }

  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <div class="brand">${product.brand}</div>
        <h3>${product.name}</h3>
        <div class="category-tag">${product.category}</div>
        <button class="show-description-btn" data-product-id="${product.id}">
          View Details
        </button>
      </div>
      <div class="product-description" id="desc-${product.id}">
        <h4>Product Details</h4>
        <p>${product.description}</p>
        <button class="hide-description-btn" data-product-id="${product.id}">
          Close
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners for product selection and description toggle
  addProductEventListeners();
  updateProductCardSelection();
}

/* Add event listeners to product cards */
function addProductEventListeners() {
  // Product card selection
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't toggle selection if clicking on buttons
      if (e.target.classList.contains("show-description-btn") || 
          e.target.classList.contains("hide-description-btn")) {
        return;
      }
      toggleProductSelection(parseInt(card.dataset.productId));
    });
  });

  // Show description buttons
  const showDescButtons = document.querySelectorAll(".show-description-btn");
  showDescButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      showProductDescription(btn.dataset.productId);
    });
  });

  // Hide description buttons
  const hideDescButtons = document.querySelectorAll(".hide-description-btn");
  hideDescButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      hideProductDescription(btn.dataset.productId);
    });
  });
}

/* Toggle product selection */
function toggleProductSelection(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const isSelected = selectedProducts.some((p) => p.id === productId);
  
  if (isSelected) {
    // Remove from selection
    selectedProducts = selectedProducts.filter((p) => p.id !== productId);
  } else {
    // Add to selection
    selectedProducts.push(product);
  }
  
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  updateProductCardSelection();
}

/* Update visual selection state of product cards */
function updateProductCardSelection() {
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    const productId = parseInt(card.dataset.productId);
    const isSelected = selectedProducts.some((p) => p.id === productId);
    
    if (isSelected) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

/* Show product description overlay */
function showProductDescription(productId) {
  const descriptionEl = document.getElementById(`desc-${productId}`);
  if (descriptionEl) {
    descriptionEl.classList.add("show");
  }
}

/* Hide product description overlay */
function hideProductDescription(productId) {
  const descriptionEl = document.getElementById(`desc-${productId}`);
  if (descriptionEl) {
    descriptionEl.classList.remove("show");
  }
}

/* Update the selected products display */
function updateSelectedProductsDisplay() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <div style="color: var(--loreal-medium-gray); text-align: center; padding: 20px; font-style: italic;">
        Select products to build your routine
      </div>
    `;
    generateRoutineBtn.disabled = true;
    return;
  }

  const clearAllBtn = `
    <button class="clear-all-btn" onclick="clearAllSelections()">
      Clear All (${selectedProducts.length})
    </button>
  `;

  const productItems = selectedProducts
    .map(
      (product) => `
    <div class="selected-product-item">
      <span>${product.name}</span>
      <button class="remove-product-btn" onclick="removeSelectedProduct(${product.id})" title="Remove ${product.name}">
        ×
      </button>
    </div>
  `
    )
    .join("");

  selectedProductsList.innerHTML = clearAllBtn + productItems;
  generateRoutineBtn.disabled = false;
}

/* Remove a specific product from selection */
function removeSelectedProduct(productId) {
  selectedProducts = selectedProducts.filter((p) => p.id !== productId);
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  updateProductCardSelection();
}

/* Clear all selected products */
function clearAllSelections() {
  selectedProducts = [];
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  updateProductCardSelection();
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  if (allProducts.length === 0) {
    await loadProducts();
  }
  
  const selectedCategory = e.target.value;
  
  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = allProducts.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Generate routine using OpenAI API via Cloudflare Worker */
generateRoutineBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    showError("Please select at least one product to generate a routine.");
    return;
  }

  if (isGeneratingResponse) {
    return; // Prevent multiple requests
  }

  try {
    isGeneratingResponse = true;
    generateRoutineBtn.disabled = true;
    generateRoutineBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    // Prepare product data for API
    const productData = selectedProducts.map(product => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description
    }));

    // Create system message for routine generation
    const systemMessage = {
      role: "system",
      content: `You are a professional beauty and skincare consultant for L'Oréal. Create a personalized routine using only the provided products. 

Format your response with clear structure:
- Use ## for main sections (like "Morning Routine" or "Evening Routine")
- Use ### for subsections
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use bullet points (-) for tips and notes
- Use **bold** for product names and important points
- Use *italic* for timing or frequency recommendations
- Include proper line breaks between sections

Focus on:
1. Proper order of application
2. Best practices for each product type  
3. Timing recommendations (AM/PM)
4. Any important tips or warnings
5. How products work together

Keep your response friendly, professional, and educational.`
    };

    const userMessage = {
      role: "user",
      content: `Please create a personalized beauty routine using these L'Oréal products: ${JSON.stringify(productData, null, 2)}`
    };

    // Make API request to Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [systemMessage, userMessage]
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const routineContent = data.choices?.[0]?.message?.content;
    
    if (!routineContent) {
      throw new Error("No routine generated from API response");
    }

    // Add routine to conversation history
    conversationHistory.push(userMessage);
    conversationHistory.push({
      role: "assistant",
      content: routineContent
    });

    // Display the routine in chat
    displayMessage("Here's your personalized L'Oréal routine:", "user");
    displayMessage(routineContent, "ai");

    // Scroll to chat window
    document.querySelector(".chatbox").scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error("Error generating routine:", error);
    showError("Sorry, I couldn't generate your routine right now. Please try again later.");
  } finally {
    isGeneratingResponse = false;
    generateRoutineBtn.disabled = false;
    generateRoutineBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine';
  }
});

/* Chat form submission handler */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const message = userInput.value.trim();
  if (!message || isGeneratingResponse) return;

  try {
    isGeneratingResponse = true;
    
    // Display user message
    displayMessage(message, "user");
    userInput.value = "";
    
    // Show loading message
    const loadingId = displayMessage("Thinking...", "loading");

    // Prepare conversation context
    const systemMessage = {
      role: "system",
      content: `You are a helpful L'Oréal beauty consultant. Answer questions about skincare, haircare, makeup, fragrance, and beauty routines. 

Format your responses clearly:
- Use ## for main topics
- Use ### for subtopics  
- Use numbered lists (1. 2. 3.) for steps
- Use bullet points (-) for tips and benefits
- Use **bold** for product names and key points
- Use *italic* for emphasis
- Include line breaks between sections

Keep responses friendly, informative, and focused on beauty-related topics. If asked about non-beauty topics, politely redirect to beauty and skincare advice.`
    };

    // Include conversation history for context
    const messages = [systemMessage, ...conversationHistory, {
      role: "user",
      content: message
    }];

    // Make API request to Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Remove loading message
    removeMessage(loadingId);

    // Add to conversation history
    conversationHistory.push({
      role: "user",
      content: message
    });
    conversationHistory.push({
      role: "assistant",
      content: aiResponse
    });

    // Display AI response
    displayMessage(aiResponse, "ai");

  } catch (error) {
    console.error("Error in chat:", error);
    removeMessage(loadingId);
    showError("Sorry, I couldn't process your message. Please try again.");
  } finally {
    isGeneratingResponse = false;
  }
});

/* Display a message in the chat window */
function displayMessage(content, type) {
  const messageId = Date.now() + Math.random();
  const messageEl = document.createElement("div");
  messageEl.className = `chat-message ${type}-message`;
  messageEl.dataset.messageId = messageId;
  
  // Format content for better readability
  if (type === "ai" || type === "user") {
    messageEl.innerHTML = formatMessageContent(content);
  } else {
    messageEl.textContent = content;
  }
  
  chatWindow.appendChild(messageEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return messageId;
}

/* Format message content with proper line breaks and styling */
function formatMessageContent(content) {
  // Convert markdown-style formatting to HTML
  let formatted = content
    // Convert double line breaks to paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Convert single line breaks to <br> tags
    .replace(/\n/g, '<br>')
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert numbered lists (1. 2. 3.)
    .replace(/^(\d+)\.\s(.+)$/gm, '<div class="list-item"><span class="list-number">$1.</span> $2</div>')
    // Convert bullet points (- or •)
    .replace(/^[-•]\s(.+)$/gm, '<div class="list-item"><span class="bullet">•</span> $2</div>')
    // Convert headings (### or ##)
    .replace(/^###\s(.+)$/gm, '<h4>$1</h4>')
    .replace(/^##\s(.+)$/gm, '<h3>$1</h3>');
  
  // Wrap in paragraph tags if not already wrapped
  if (!formatted.includes('<p>') && !formatted.includes('<div>') && !formatted.includes('<h')) {
    formatted = `<p>${formatted}</p>`;
  } else if (formatted.includes('</p><p>')) {
    formatted = `<p>${formatted}</p>`;
  }
  
  return formatted;
}

/* Remove a message from chat window */
function removeMessage(messageId) {
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageEl) {
    messageEl.remove();
  }
}

/* Show error message in chat */
function showError(message) {
  displayMessage(`❌ ${message}`, "ai");
}

/* Initialize the application */
async function init() {
  // Load products data
  await loadProducts();
  
  // Load saved selections from localStorage
  loadSelectedProducts();
  
  // Initialize chat window
  chatWindow.innerHTML = `
    <div class="placeholder-message">
      Select products and generate a routine, or ask me any beauty questions!
    </div>
  `;
}

/* Global functions for inline event handlers */
window.removeSelectedProduct = removeSelectedProduct;
window.clearAllSelections = clearAllSelections;

/* Start the application when DOM is loaded */
document.addEventListener("DOMContentLoaded", init);
