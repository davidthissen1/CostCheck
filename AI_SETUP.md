# AI Features Setup Guide

## 🤖 OpenAI Integration

This application now includes AI-powered recommendations for your grocery cart using OpenAI's GPT-4.

### Features:
- **Recipe Suggestions**: Get personalized recipe ideas based on items in your cart
- **Cheaper Alternatives**: Find budget-friendly substitutes for your cart items
- **Smart Recommendations**: AI analyzes your cart and provides contextual suggestions

### Setup Instructions:

1. **Get an OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key

2. **Configure Environment Variables**
   ```bash
   # Create a .env.local file in your project root
   touch .env.local
   
   # Add your OpenAI API key
   echo "OPENAI_API_KEY=your_actual_api_key_here" >> .env.local
   ```

3. **Restart the Development Server**
   ```bash
   npm run dev
   ```

### Usage:

1. **Add items to your cart** from the price table
2. **Navigate to the Shopping Cart tab**
3. **Click "Get Recipe Ideas"** to generate recipes using your cart items
4. **Click "Find Cheaper Alternatives"** to discover money-saving substitutes

### Important Notes:

- ⚠️ **API Key Required**: The AI features won't work without a valid OpenAI API key
- 💰 **API Costs**: OpenAI charges per API request (typically $0.01-0.03 per request)
- 🔒 **Security**: Never commit your `.env.local` file to version control
- 📊 **Model**: Currently uses GPT-4 for high-quality recommendations

### Example Environment File:

```bash
# .env.local
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Troubleshooting:

**"OpenAI API key not configured" error:**
- Ensure your `.env.local` file exists and contains the API key
- Restart your development server after adding the key
- Check that your API key is valid and has credits

**API request failures:**
- Verify your OpenAI account has sufficient credits
- Check your API key permissions
- Ensure you have access to GPT-4 (may require paid plan)

### Cost Optimization:

- The app uses GPT-4 with a 2000 token limit per request
- Typical requests cost $0.01-0.03 depending on cart size
- Consider using GPT-3.5-turbo for lower costs (change model in `/app/api/recommendations/route.ts`) 