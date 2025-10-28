# Gemini AI Price Checker Setup Guide

## Getting Your Gemini API Key

1. **Visit Google AI Studio**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select your Google Cloud project (or create a new one)
   - Copy the generated API key

3. **Configure the Price Checker**
   - Open `/js/price-checker.js`
   - Replace `'YOUR_GEMINI_API_KEY'` on line 4 with your actual API key:
   ```javascript
   this.apiKey = 'your-actual-api-key-here';
   ```

## Security Best Practices

⚠️ **Important**: The current implementation stores the API key in the frontend code, which is suitable for development/testing only.

For production, consider:
- Store API key in environment variables
- Create a backend endpoint that proxies requests to Gemini
- Implement rate limiting and usage monitoring

## Usage

### In Post Item Form
1. Fill in item details (name, category, condition, price)
2. Click "🤖 Check Price" button
3. View AI-powered price analysis with:
   - Market price range
   - Fair/Overpriced/Underpriced assessment
   - Suggested price range
   - Confidence score
   - Market reasoning

### Features
- **Real-time Analysis**: Uses current Kenyan market data
- **Condition-aware**: Factors in item condition for pricing
- **Confidence Scoring**: Shows reliability of analysis (1-10)
- **Visual Feedback**: Color-coded results (green=fair, red=overpriced, blue=underpriced)

## API Limits
- Gemini API has usage limits
- Rate limiting implemented (1 second between batch requests)
- Error handling for API failures

## Troubleshooting

**"Unable to check price"**: 
- Verify API key is correct
- Check internet connection
- Ensure all required fields are filled

**Low confidence scores**:
- Add more detailed item descriptions
- Verify category and condition accuracy
- Some items may have limited market data
