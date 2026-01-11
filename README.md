# SignalRank - Decision-Maker Verification Engine

A real-time email verification system that identifies and classifies decision-makers using enrichment APIs. Built with Node.js and Express, SignalRank helps sales and GTM teams qualify leads by determining whether an email belongs to a decision-maker, influencer, or non-buyer.

## 🎯 Features

- **Email Verification**: Verify email addresses in real-time
- **Decision-Maker Classification**: Automatically classify contacts by role:
  - **Decision Maker**: Founders, CEOs, CTOs at small companies
  - **Influencer**: Directors, Heads, Managers who can influence purchasing decisions
  - **Non-Buyer**: Other roles with lower influence
- **Real-time Enrichment**: Integrate with external enrichment APIs for comprehensive data
- **Webhook Support**: Receive asynchronous enrichment results via webhooks
- **Polling Status**: Client-side polling for enrichment completion status

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- An enrichment API key (e.g., FullEnrich, Hunter.io, Clearbit)
- ngrok (for local webhook testing)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/MeNaCode01/SignalRank.git
cd SignalRank
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
API_KEY=your_enrichment_api_key
BASE_URL=https://your-ngrok-url.ngrok-free.dev/api/enrich
```

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## 📁 Project Structure

```
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   └── script.js          # Client-side logic
├── services/              
│   └── fullEnrich.js      # External API integration
├── logic/
│   └── classifyRole.js    # Role classification logic
├── store/
│   └── results.js         # In-memory verification results
├── server.js              # Express server & API routes
├── package.json           # Project dependencies
├── .env                   # Environment variables (not tracked)
└── README.md              # This file
```

## 🔌 API Endpoints

### POST `/verify`
Verify an email and start enrichment process.

**Request:**
```json
{
  "email": "user@company.com"
}
```

**Response:**
```json
{
  "status": "IN_PROGRESS",
  "message": "Verification started. Please wait 30–90 seconds."
}
```

### GET `/status`
Check the verification status of an email.

**Query Parameters:**
- `email`: The email address to check

**Response:**
```json
{
  "status": "COMPLETED",
  "result": {
    "category": "Decision Maker",
    "confidence": "High",
    "reason": "CEO at TechCorp"
  }
}
```

### POST `/webhook/full-enrich`
Webhook endpoint to receive enrichment results from external API.

**Request Body:**
```json
{
  "datas": [
    {
      "email": "user@company.com",
      "title": "Chief Executive Officer",
      "companyName": "TechCorp",
      "companySize": 150
    }
  ]
}
```

## 🎨 How It Works

1. **User enters email** in the web interface
2. **Frontend calls `/verify`** endpoint with the email
3. **Backend initiates enrichment** via external API
4. **Frontend polls `/status`** every 10 seconds
5. **External API sends webhook** when enrichment completes
6. **Webhook processes data** and classifies the role
7. **Frontend displays result** when status changes to COMPLETED

## 🔐 Classification Logic

The system classifies contacts based on job title and company size:

- **Decision Maker** (High Confidence):
  - Founder, CEO, or CTO (at companies with < 200 employees)
  
- **Influencer** (Medium Confidence):
  - Head of department, Director, or Manager
  - Can influence purchasing decisions

- **Non-Buyer** (Low Confidence):
  - Individual contributors, support staff, etc.

## 🛠️ Development

### Run in development mode with auto-reload:
```bash
npm run dev
```

### Environment Variables
- `API_KEY`: Your enrichment service API key
- `BASE_URL`: The enrichment API endpoint URL

## 🔗 Integration Guide

To connect your enrichment API:

1. Replace `BASE_URL` in `.env` with your API endpoint
2. Update the request payload in `services/fullEnrich.js` to match your API's schema
3. Update the webhook parser in `server.js` to handle your API's response format

## 📝 Example Workflow

```
Email: john.doe@techcorp.com
      ↓
External API enrichment
      ↓
Data received: {"title": "CEO", "companySize": 80}
      ↓
Classification: Decision Maker (High Confidence)
      ↓
Result: ✅ John is a decision-maker at TechCorp
```

## 🚨 Troubleshooting

### Issue: 404 Not Found on `/verify`
- Ensure the server is running: `npm start`
- Check if port 3000 is available

### Issue: Verification stuck on "IN_PROGRESS"
- Verify the enrichment API credentials in `.env`
- Check if the webhook URL is publicly accessible (use ngrok)
- Review server logs for API errors

### Issue: Empty enrichment results
- Ensure the external API is returning valid data
- Check webhook URL is correctly configured
- Verify the response payload format matches expectations

## 📚 Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript (HTML, CSS, JS)
- **HTTP Client**: Axios
- **Environment**: dotenv
- **Tunneling**: ngrok (for webhook testing)

## 📄 License

ISC

## 👤 Author

Manav Singh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub: [SignalRank Issues](https://github.com/MeNaCode01/SignalRank/issues)

---

**Repository**: https://github.com/MeNaCode01/SignalRank.git
