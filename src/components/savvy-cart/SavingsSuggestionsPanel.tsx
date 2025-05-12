import React from 'react';
import type { SavingsSuggestion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp } from 'lucide-react';

interface SavingsSuggestionsPanelProps {
  suggestions: SavingsSuggestion[];
  isLoading: boolean;
}

const SavingsSuggestionsPanel: React.FC<SavingsSuggestionsPanelProps> = ({ suggestions, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="mr-2 h-5 w-5 text-secondary animate-pulse" />
            Generating Smart Savings Tips...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 bg-muted rounded animate-pulse w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null; // Or a placeholder like "Add items to cart to get savings suggestions!"
  }

  return (
    <Card className="mt-6 shadow-lg bg-gradient-to-br from-card to-background/50 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <Lightbulb className="mr-2 h-6 w-6" />
          Smart Savings Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="p-3 bg-card/70 rounded-md border border-border shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm">{suggestion.suggestion}</p>
              {suggestion.estimatedSavings > 0 && (
                <p className="text-xs font-semibold text-green-400 mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Estimated Savings: ₹{suggestion.estimatedSavings.toFixed(2)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SavingsSuggestionsPanel;
