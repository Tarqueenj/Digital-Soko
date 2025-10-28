// Gemini AI Price Checker Module for Digital Soko
class PriceChecker {
  constructor() {
    // Note: In production, store API key securely (environment variables, backend)
    this.apiKey = 'AIzaSyAcFm9fGHXg-_MYjmmJLtYoIcUMGcF7qYQ'; // Replace with actual API key
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  /**
   * Check if an item price is fair compared to market prices
   * @param {Object} item - Item details
   * @param {string} item.name - Item name
   * @param {string} item.category - Item category
   * @param {string} item.condition - Item condition
   * @param {number} item.price - Item price in KSH
   * @param {string} item.description - Item description (optional)
   * @returns {Promise<Object>} Price analysis result
   */
  async checkPrice(item) {
    try {
      const prompt = this.buildPriceCheckPrompt(item);
      const response = await this.queryGemini(prompt);
      return this.parseGeminiResponse(response, item.price);
    } catch (error) {
      console.error('Price check failed:', error);
      return {
        status: 'error',
        message: 'Unable to check price at the moment',
        suggestion: null,
        confidence: 0
      };
    }
  }

  /**
   * Build prompt for Gemini AI to check item pricing
   */
  buildPriceCheckPrompt(item) {
    return `
You are a price analysis expert for the Kenyan market. Analyze the following item and determine if the price is fair, overpriced, or underpriced.

Item Details:
- Name: ${item.name}
- Category: ${item.category}
- Condition: ${item.condition}
- Listed Price: KSH ${item.price.toLocaleString()}
- Description: ${item.description || 'Not provided'}

Please provide:
1. Market price range for similar items in Kenya
2. Assessment: "fair", "overpriced", or "underpriced"
3. Suggested price range in KSH
4. Confidence level (1-10)
5. Brief reasoning

Consider:
- Current Kenyan market prices
- Item condition impact on value
- Brand reputation (if applicable)
- Local availability and demand

Respond in this exact JSON format:
{
  "assessment": "fair|overpriced|underpriced",
  "marketPriceRange": {
    "min": number,
    "max": number
  },
  "suggestedPrice": {
    "min": number,
    "max": number
  },
  "confidence": number,
  "reasoning": "brief explanation",
  "marketInsights": "additional market context"
}
`;
  }

  /**
   * Query Gemini AI API
   */
  async queryGemini(prompt) {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Parse Gemini response and format for UI
   */
  parseGeminiResponse(responseText, originalPrice) {
    try {
      // Extract JSON from response (Gemini might include extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        status: 'success',
        assessment: analysis.assessment,
        originalPrice: originalPrice,
        marketRange: analysis.marketPriceRange,
        suggestedRange: analysis.suggestedPrice,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        marketInsights: analysis.marketInsights,
        message: this.generateUserMessage(analysis, originalPrice)
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return {
        status: 'error',
        message: 'Unable to analyze price data',
        confidence: 0
      };
    }
  }

  /**
   * Generate user-friendly message based on analysis
   */
  generateUserMessage(analysis, originalPrice) {
    const { assessment, suggestedPrice, confidence } = analysis;
    
    if (confidence < 5) {
      return `⚠️ Low confidence analysis. Consider researching similar items manually.`;
    }

    switch (assessment) {
      case 'fair':
        return `✅ Your price (KSH ${originalPrice.toLocaleString()}) appears fair for the market.`;
      
      case 'overpriced':
        const overSavings = originalPrice - suggestedPrice.max;
        return `📈 Your price might be high. Consider KSH ${suggestedPrice.min.toLocaleString()} - ${suggestedPrice.max.toLocaleString()} (save up to KSH ${overSavings.toLocaleString()})`;
      
      case 'underpriced':
        const underGain = suggestedPrice.min - originalPrice;
        return `📉 You might be pricing too low. Consider KSH ${suggestedPrice.min.toLocaleString()} - ${suggestedPrice.max.toLocaleString()} (gain up to KSH ${underGain.toLocaleString()})`;
      
      default:
        return `🤔 Unable to determine price fairness. Market range: KSH ${suggestedPrice.min.toLocaleString()} - ${suggestedPrice.max.toLocaleString()}`;
    }
  }

  /**
   * Quick price check for marketplace items
   */
  async quickPriceCheck(itemName, category, price) {
    const item = {
      name: itemName,
      category: category || 'General',
      condition: 'Used', // Default assumption
      price: price,
      description: ''
    };

    return await this.checkPrice(item);
  }

  /**
   * Batch check multiple items (with rate limiting)
   */
  async batchPriceCheck(items, delayMs = 1000) {
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      try {
        const result = await this.checkPrice(items[i]);
        results.push({ ...result, itemIndex: i });
        
        // Rate limiting - wait between requests
        if (i < items.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        results.push({
          status: 'error',
          message: 'Failed to check price',
          itemIndex: i
        });
      }
    }
    
    return results;
  }
}

// Export for use in other modules
window.PriceChecker = PriceChecker;

// Initialize global instance
window.priceChecker = new PriceChecker();

// Utility functions for UI integration
window.PriceCheckerUI = {
  /**
   * Show price analysis in a modal or alert
   */
  showPriceAnalysis(analysis) {
    if (analysis.status === 'error') {
      alert(`❌ ${analysis.message}`);
      return;
    }

    const confidence = '⭐'.repeat(Math.floor(analysis.confidence / 2));
    const message = `
${analysis.message}

📊 Market Analysis:
• Market Range: KSH ${analysis.marketRange.min.toLocaleString()} - ${analysis.marketRange.max.toLocaleString()}
• Confidence: ${confidence} (${analysis.confidence}/10)
• Reasoning: ${analysis.reasoning}

💡 Market Insights:
${analysis.marketInsights}
    `;

    alert(message);
  },

  /**
   * Create price analysis badge for items
   */
  createPriceBadge(analysis) {
    if (analysis.status === 'error') return '';

    const badgeClass = {
      'fair': 'bg-green-100 text-green-800',
      'overpriced': 'bg-red-100 text-red-800', 
      'underpriced': 'bg-blue-100 text-blue-800'
    }[analysis.assessment] || 'bg-gray-100 text-gray-800';

    const icon = {
      'fair': '✅',
      'overpriced': '📈',
      'underpriced': '📉'
    }[analysis.assessment] || '🤔';

    return `
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}">
        ${icon} ${analysis.assessment.charAt(0).toUpperCase() + analysis.assessment.slice(1)} Price
      </span>
    `;
  },

  /**
   * Add price check button to forms
   */
  addPriceCheckButton(formElement, onCheck) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm';
    button.innerHTML = '🤖 Check Price with AI';
    button.onclick = onCheck;
    
    formElement.appendChild(button);
    return button;
  }
};
