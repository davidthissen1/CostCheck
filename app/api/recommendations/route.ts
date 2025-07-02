import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CartItem {
  id: string
  name: string
  currentPrice: number
  unit: string
  category: string
  source: "BLS" | "USDA"
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { cartItems, type } = await request.json()

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    if (!type || !['recipes', 'alternatives'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "recipes" or "alternatives"' },
        { status: 400 }
      )
    }

    // Format cart items for AI prompt
    const itemsList = cartItems
      .map((item: CartItem) => `${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''} of ${item.name} ($${item.currentPrice.toFixed(2)} per ${item.unit})`)
      .join('\n')

    let prompt = ''
    let systemMessage = ''

    if (type === 'recipes') {
      systemMessage = `You are a helpful cooking assistant that creates practical, delicious recipes based on available ingredients. Focus on realistic recipes that can be made with the provided ingredients, suggesting additional common pantry items if needed.`
      
      prompt = `Based on the following grocery items in my cart, suggest 3-4 practical recipes I can make:

${itemsList}

For each recipe, please provide:
1. Recipe name
2. Brief description (1-2 sentences)
3. Main ingredients from my cart that will be used
4. Additional ingredients I might need (keep to common pantry items)
5. Approximate cooking time
6. Difficulty level (Easy/Medium/Hard)

Format your response as a JSON array of recipe objects with these fields: name, description, cartIngredients, additionalIngredients, cookingTime, difficulty.`

    } else if (type === 'alternatives') {
      systemMessage = `You are a money-saving grocery shopping assistant. Help users find cheaper alternatives to their current cart items while maintaining similar nutritional value and cooking versatility.`
      
      prompt = `Based on the following grocery items in my cart, suggest money-saving alternatives for each item:

${itemsList}

For each item, provide:
1. The original item name and current price
2. 2-3 cheaper alternative suggestions
3. Estimated savings per alternative
4. Brief explanation of why it's a good substitute
5. Any trade-offs to consider

Focus on practical alternatives that are commonly available at most grocery stores. Consider generic brands, seasonal alternatives, bulk options, or different cuts/varieties.

Format your response as a JSON array of alternative objects with these fields: originalItem, originalPrice, alternatives (array of objects with: name, estimatedPrice, savings, reason, tradeoffs).`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse as JSON, fallback to plain text if it fails
    let recommendations
    try {
      recommendations = JSON.parse(content)
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      recommendations = {
        type: 'text',
        content: content
      }
    }

    return NextResponse.json({
      success: true,
      type,
      recommendations,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 