# Caretta (W26) – Real-Time Sales Intelligence Agent

## Overview

Caretta is a real-time AI assistant designed to support sales professionals during technical sales calls. The platform listens to prospect questions, identifies technical objections, and instantly provides AI-generated answers, coaching guidance, and recommended follow-up questions.

By bridging the gap between technical expertise and sales communication, Caretta enables non-technical sales representatives to confidently handle complex product discussions while maintaining a natural conversation flow.

## Key Features

* 🤖 AI-generated responses to technical questions
* 📊 Objection detection and classification
* 💡 Live coaching recommendations for sales representatives
* ❓ Suggested follow-up questions to advance the sales conversation
* 🌍 Multilingual support for global sales teams
* 🔐 Secure user authentication and session management
* 📈 Insights and analytics for sales performance improvement

## Use Cases

* Technical software sales
* SaaS product demonstrations
* Enterprise solution consulting
* Customer discovery calls
* Objection handling and sales coaching

## Technology Stack

### Frontend

* JavaScript
* HTML5 & CSS3

### Backend

* Node.js
* MongoDB

### AI Services

* Google Gemini AI
* Speech-to-Text Integration
* ElevenLabs Voice AI

## How It Works

1. The salesperson joins a customer call.
2. Caretta listens to the conversation in real time.
3. Technical objections and product-related questions are detected automatically.
4. AI generates accurate responses and coaching suggestions.
5. Recommended follow-up questions are displayed instantly.
6. The salesperson uses these insights to guide the conversation effectively.

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/caretta.git
cd caretta
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongo_uri
GEMINI_API_KEY=your_gemini_api_key
ELEVEN_LABS_API_KEY=your_eleven_labs_api_key
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

Run the application:

```bash
npm run dev
```

## Future Enhancements

* CRM integration
* Meeting summaries and action items
* Sales call analytics dashboard
* Multi-agent coaching system
* Industry-specific knowledge bases

## Author

Deva Prasath N N

## License

MIT License
