
import React from 'react';
import type { SavingsSuggestion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SavingsSuggestionsPanelProps {
  suggestions: SavingsSuggestion[];
  isLoading: boolean;
}

const SavingsSuggestionsPanel: React.FC<SavingsSuggestionsPanelProps> = ({ suggestions, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-card-foreground">
            <Lightbulb className="mr-2 h-5 w-5 text-secondary animate-pulse" />
            Generating Smart Savings Tips...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse w-5/6"></div>
            <div className="h-10 bg-muted rounded animate-pulse w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
     return (
      <Card className="mt-6 shadow-md bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-card-foreground">
            <Lightbulb className="mr-2 h-5 w-5 text-muted-foreground" />
            Savings Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center text-muted-foreground py-4">
            <Info className="h-10 w-10 mb-3" />
            <p className="text-sm">Add items to your cart to get personalized savings suggestions from our AI assistant!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSuggestionIcon = (type?: SavingsSuggestion['type']) => {
    switch (type) {
      case 'cost':
        return <TrendingUp className="mr-2 h-4 w-4 text-green-500" />;
      case 'mov_alert':
        return <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />;
      case 'fee_optimization':
        return <TrendingUp className="mr-2 h-4 w-4 text-sky-500" />; // Using TrendingUp for fee opt too
      case 'convenience':
        return <Info className="mr-2 h-4 w-4 text-blue-500" />;
      default:
        return <Lightbulb className="mr-2 h-4 w-4 text-primary" />;
    }
  };
  
  const getBadgeVariant = (type?: SavingsSuggestion['type']) => {
    switch (type) {
      case 'cost': return "default"; // primary
      case 'mov_alert': return "destructive"; // will use destructive colors (reddish)
      case 'fee_optimization': return "secondary"; // secondary color (blueish)
      case 'convenience': return "outline"; 
      default: return "default";
    }
  }

  return (
    <Card className="mt-6 shadow-lg bg-gradient-to-br from-card to-background/50 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <Lightbulb className="mr-2 h-6 w-6" />
          Smart Savings & Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="p-3 bg-card/80 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out">
              <div className="flex items-start">
                <span className="mt-0.5">{getSuggestionIcon(suggestion.type)}</span>
                <p className="text-sm text-foreground flex-1">{suggestion.suggestion}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                {suggestion.estimatedSavings > 0 && (
                  <p className="text-xs font-semibold text-green-500 dark:text-green-400 flex items-center">
                    <TrendingUp className="mr-1 h-3.5 w-3.5" />
                    Est. Savings: ₹{suggestion.estimatedSavings.toFixed(2)}
                  </p>
                )}
                {suggestion.type && (
                  <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs capitalize">
                    {suggestion.type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SavingsSuggestionsPanel;
