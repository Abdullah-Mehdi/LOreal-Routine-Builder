# 💄 L'Oréal Smart Routine Builder

> An AI-powered beauty advisor that creates personalized skincare and beauty routines using real L'Oréal products.

![L'Oréal](https://img.shields.io/badge/Brand-L'Oréal-ff003b?style=for-the-badge&logo=loreal&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)

## ✨ Overview

Transform your beauty routine with AI! This interactive web application combines real L'Oréal product data with OpenAI's GPT-4o to deliver personalized skincare and beauty advice. Users can browse products by category, build custom product collections, and receive expert AI-generated routines tailored to their selections.

### 🌟 Key Features

- **🛍️ Interactive Product Selection**: Browse and select from real L'Oréal products across multiple categories
- **🤖 AI-Powered Routines**: Generate personalized step-by-step beauty routines using OpenAI GPT-4o
- **💬 Smart Chatbot**: Ask follow-up questions about skincare, makeup, and beauty tips
- **💾 Persistent Storage**: Your product selections are saved using localStorage
- **📱 Responsive Design**: Beautiful experience across desktop, tablet, and mobile
- **🎨 Brand-Authentic Styling**: Designed with L'Oréal's signature red and gold color palette

## 🛠️ Technologies Used

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **AI Integration**: OpenAI GPT-4o API
- **Backend**: Cloudflare Workers (for secure API requests)
- **Data**: Real L'Oréal product database (JSON)
- **Storage**: Browser localStorage for persistence
- **Design**: CSS Grid, Flexbox, CSS Custom Properties

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │ Cloudflare       │    │    OpenAI       │
│   (Browser)     │───▶│   Worker         │───▶│   GPT-4o        │
│                 │    │                  │    │     API         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  localStorage   │    │   Products.json  │
│   (Selections)  │    │  (Product Data)  │
└─────────────────┘    └──────────────────┘
```

## 🚦 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Cloudflare Worker setup (for AI integration)
- OpenAI API key (stored securely in Cloudflare Worker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdullah-Mehdi/LOreal-Routine-Builder.git
   cd LOreal-Routine-Builder
   ```

2. **Set up Cloudflare Worker**
   - Deploy the provided worker script to Cloudflare
   - Add your OpenAI API key to the worker environment variables
   - Update `WORKER_URL` in `script.js` with your worker endpoint

3. **Launch the application**
   ```bash
   # Serve locally using any HTTP server
   python -m http.server 8000
   # or
   npx live-server
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎯 How It Works

1. **Browse Products**: Select a category to view curated L'Oréal products
2. **Build Collection**: Click product cards to add/remove items from your selection
3. **Generate Routine**: Hit "Generate Routine" to get AI-powered recommendations
4. **Ask Questions**: Use the chat to ask follow-up questions about beauty and skincare
5. **Save & Return**: Your selections persist across browser sessions

## 🔧 Configuration

### Cloudflare Worker Setup
```javascript
// worker.js example
export default {
  async fetch(request, env) {
    const { messages } = await request.json();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
      }),
    });
    
    return new Response(await response.text(), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
```

## 📊 Product Data Structure
```json
{
  "products": [
    {
      "id": 1,
      "brand": "CeraVe",
      "name": "Foaming Facial Cleanser",
      "category": "cleanser",
      "image": "https://cdn.example.com/product.png",
      "description": "Gentle gel cleanser with ceramides..."
    }
  ]
}
```

## 🎨 Design System

### Colors
- **Primary Red**: `#ff003b` (L'Oréal signature)
- **Secondary Gold**: `#e3a535` (L'Oréal accent)
- **Dark**: `#1a1a1a`
- **Light Gray**: `#f8f8f8`

### Typography
- **Font Family**: Montserrat (Google Fonts)
- **Weights**: 300 (Light), 500 (Medium), 700 (Bold)

## 🤖 AI Integration

The application uses OpenAI's GPT-4o model with carefully crafted system prompts to:
- Generate professional beauty advice
- Create structured, step-by-step routines
- Maintain conversation context
- Stay focused on beauty-related topics
- Format responses with proper markdown styling

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔒 Security & Privacy

- API keys stored securely in Cloudflare Workers
- No sensitive data stored in browser
- CORS-enabled for secure cross-origin requests
- Local storage only contains product selections

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **L'Oréal** for product data and brand inspiration
- **OpenAI** for GPT-4o API
- **Cloudflare** for Workers platform
- **Font Awesome** for beautiful icons
- **Google Fonts** for Montserrat typography

## 📧 Contact

Abdullah Mehdi - [@Abdullah-Mehdi](https://github.com/Abdullah-Mehdi)

Project Link: [https://github.com/Abdullah-Mehdi/LOreal-Routine-Builder](https://github.com/Abdullah-Mehdi/LOreal-Routine-Builder)

---

⭐ **Star this repo if it helped you build something amazing!**oject 9: L'Oréal Routine Builder
L’Oréal is expanding what’s possible with AI, and now your chatbot is getting smarter. This week, you’ll upgrade it into a product-aware routine builder. 

Users will be able to browse real L’Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.
