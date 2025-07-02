"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/contexts/cart-context"
import { 
  ChefHat, 
  DollarSign, 
  Loader2, 
  Clock, 
  Users, 
  Lightbulb,
  TrendingDown,
  Star,
  AlertCircle
} from "lucide-react"

interface Recipe {
  name: string
  description: string
  cartIngredients: string[]
  additionalIngredients: string[]
  cookingTime: string
  difficulty: string
}

interface Alternative {
  originalItem: string
  originalPrice: number
  alternatives: {
    name: string
    estimatedPrice: number
    savings: number
    reason: string
    tradeoffs: string
  }[]
}

interface RecommendationResponse {
  success: boolean
  type: 'recipes' | 'alternatives'
  recommendations: Recipe[] | Alternative[] | { type: 'text', content: string }
  timestamp: string
}

export function AIRecommendations() {
  const { items } = useCart()
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendations = async (type: 'recipes' | 'alternatives') => {
    if (items.length === 0) {
      setError("Add some items to your cart first to get recommendations!")
      return
    }

    setLoading(true)
    setError(null)
    setRecommendations(null)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: items,
          type
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recommendations')
      }

      setRecommendations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderRecipes = (recipes: Recipe[]) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ChefHat className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recipe Suggestions</h3>
      </div>
      
      {recipes.map((recipe, index) => (
        <Card key={index} className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {recipe.cookingTime}
                </div>
              </div>
            </div>
            <CardDescription>{recipe.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <Star className="h-4 w-4 mr-1 text-green-600" />
                Using from your cart:
              </h4>
              <div className="flex flex-wrap gap-2">
                {recipe.cartIngredients?.map((ingredient, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
            
            {recipe.additionalIngredients?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1 text-blue-600" />
                  You might also need:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.additionalIngredients.map((ingredient, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderAlternatives = (alternatives: Alternative[]) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingDown className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Money-Saving Alternatives</h3>
      </div>
      
      {alternatives.map((alt, index) => (
        <Card key={index} className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg">{alt.originalItem}</CardTitle>
            <CardDescription>
              Current price: ${alt.originalPrice?.toFixed(2) || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alt.alternatives?.map((alternative, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{alternative.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-600">
                        ${alternative.estimatedPrice?.toFixed(2) || 'N/A'}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Save ${alternative.savings?.toFixed(2) || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alternative.reason}</p>
                  {alternative.tradeoffs && (
                    <p className="text-xs text-gray-500 flex items-start">
                      <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      {alternative.tradeoffs}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTextRecommendations = (content: string) => (
    <Card>
      <CardHeader>
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm">{content}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>AI-Powered Recommendations</span>
          </CardTitle>
          <CardDescription>
            Get personalized recipe suggestions or find cheaper alternatives for your cart items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => generateRecommendations('recipes')}
              disabled={loading || items.length === 0}
              className="flex-1"
            >
              {loading && recommendations?.type === 'recipes' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ChefHat className="h-4 w-4 mr-2" />
              )}
              Get Recipe Ideas
            </Button>
            
            <Button
              onClick={() => generateRecommendations('alternatives')}
              disabled={loading || items.length === 0}
              variant="outline"
              className="flex-1"
            >
              {loading && recommendations?.type === 'alternatives' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Find Cheaper Alternatives
            </Button>
          </div>
          
          {items.length === 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Add items to your cart to get AI-powered recommendations!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Generating recommendations...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Display */}
      {recommendations && !loading && (
        <div className="space-y-4">
          <Separator />
          {Array.isArray(recommendations.recommendations) ? (
            recommendations.type === 'recipes' ? (
              renderRecipes(recommendations.recommendations as Recipe[])
            ) : (
              renderAlternatives(recommendations.recommendations as Alternative[])
            )
          ) : (
            renderTextRecommendations((recommendations.recommendations as any).content)
          )}
          
          <div className="text-xs text-gray-500 text-center">
            Generated on {new Date(recommendations.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
} 