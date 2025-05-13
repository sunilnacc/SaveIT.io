
import React from 'react';
import Image from 'next/image';
import type { ComparisonItem, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, BadgePercent, ArrowRight, X, Loader2, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ComparisonViewProps {
  comparisonResults: ComparisonItem[];
  onClose: () => void;
  isLoading: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparisonResults, onClose, isLoading }) => {
  const calculateTotalSavings = () => {
    let totalOriginalCost = 0;
    let totalCheapestEquivalentCost = 0;

    comparisonResults.forEach(compItem => {
      const originalPrice = parseFloat(String(compItem.originalItem.offer_price || compItem.originalItem.mrp));
      const originalItemTotal = originalPrice * compItem.originalItem.cartQuantity;
      totalOriginalCost += originalItemTotal;

      let cheapestEquivalentAlternativePrice = originalPrice;
      // Ensure alternatives exist and is an array before iterating
      if (Array.isArray(compItem.alternatives)) {
        compItem.alternatives.forEach(alt => {
          if (alt.isEquivalent) {
            const altPrice = parseFloat(String(alt.offer_price || alt.mrp));
            if (altPrice < cheapestEquivalentAlternativePrice) {
              cheapestEquivalentAlternativePrice = altPrice;
            }
          }
        });
      }
      totalCheapestEquivalentCost += cheapestEquivalentAlternativePrice * compItem.originalItem.cartQuantity;
    });
    
    return totalOriginalCost - totalCheapestEquivalentCost;
  };

  const totalPotentialSavings = calculateTotalSavings();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Comparing Prices...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing alternatives to find you the best deals!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && comparisonResults.length === 0) {
    return ( 
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Info className="h-6 w-6 mr-2 text-primary" />
              No Comparison Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Could not find enough data for comparison. This might be because there are no alternatives in the current search results or the cart is empty.
            </p>
            <Button onClick={onClose} variant="outline">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
 
  return (
    <React.Fragment>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2 md:p-4">
        <Card className="w-full max-w-4xl h-[90vh] md:h-[85vh] flex flex-col bg-card shadow-2xl">
          <CardHeader className="sticky top-0 bg-card z-10 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl md:text-2xl text-primary flex items-center">
                <BadgePercent className="mr-3 h-7 w-7" />
                Smart Price Comparison
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close comparison view">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {totalPotentialSavings > 0 && (
              <p className="text-lg font-semibold text-green-500 dark:text-green-400 mt-2">
                Potential Total Savings: ₹{totalPotentialSavings.toFixed(2)}
              </p>
            )}
            {totalPotentialSavings <= 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                You already have good prices, or no cheaper equivalent alternatives found.
              </p>
            )}
          </CardHeader>
          <ScrollArea className="flex-grow">
            <CardContent className="p-3 md:p-4 space-y-6">
              {comparisonResults.map((compItem, index) => {
                const originalItemPrice = parseFloat(String(compItem.originalItem.offer_price || compItem.originalItem.mrp));
                
                let bestEquivalentAlternative: (Product & { equivalencyReason?: string; isEquivalent?: boolean; savings: number }) | null = null;
                
                if (Array.isArray(compItem.alternatives) && compItem.alternatives.length > 0) {
                  compItem.alternatives.forEach(alt => {
                    if (alt.isEquivalent) {
                      const altPrice = parseFloat(String(alt.offer_price || alt.mrp));
                      if (altPrice < originalItemPrice) {
                        const savings = (originalItemPrice - altPrice) * compItem.originalItem.cartQuantity;
                        if (!bestEquivalentAlternative || altPrice < parseFloat(String(bestEquivalentAlternative.offer_price || bestEquivalentAlternative.mrp))) {
                          bestEquivalentAlternative = {...alt, savings};
                        }
                      }
                    }
                  });
                }

                return (
                  <Card key={index} className="overflow-hidden bg-background/50 shadow-md">
                    <CardHeader className="p-3 md:p-4 bg-muted/30 border-b">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Image
                          src={compItem.originalItem.images?.[0] || `https://picsum.photos/80/80?grayscale&random=${compItem.originalItem.id}`}
                          alt={compItem.originalItem.name}
                          width={60}
                          height={60}
                          className="rounded-md object-contain border bg-white"
                          data-ai-hint="original product"
                        />
                        <div className="flex-grow">
                          <h4 className="font-semibold text-base md:text-lg text-foreground">{compItem.originalItem.name} ({compItem.originalItem.cartQuantity}x)</h4>
                          <p className="text-sm text-muted-foreground">
                            Your choice: <span className="font-bold text-primary">₹{(originalItemPrice * compItem.originalItem.cartQuantity).toFixed(2)}</span> (₹{originalItemPrice.toFixed(2)} each) on {compItem.originalItem.platform.name}
                          </p>
                        </div>
                        {bestEquivalentAlternative && (
                          <Badge variant="destructive" className="text-xs whitespace-nowrap">
                            Save ₹{bestEquivalentAlternative.savings.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 space-y-3">
                      {Array.isArray(compItem.alternatives) && compItem.alternatives.length > 0 ? (
                        compItem.alternatives.map((alt, altIndex) => {
                          const altPrice = parseFloat(String(alt.offer_price || alt.mrp));
                          const isBestDeal = bestEquivalentAlternative?.id === alt.id && bestEquivalentAlternative?.platform.name === alt.platform.name;
                          const priceDifference = originalItemPrice - altPrice;

                          return (
                            <div 
                              key={altIndex} 
                              className={`relative p-3 rounded-lg border-2 ${
                                isBestDeal ? 'border-green-500 bg-green-500/10 shadow-lg' : 
                                alt.isEquivalent ? 'border-sky-500/50 bg-sky-500/10' : 
                                'border-amber-500/50 bg-amber-500/10'
                              }`}
                            >
                              {isBestDeal && (
                                <Badge variant="default" className="absolute -top-3 -right-3 text-xs bg-green-600 text-white px-2 py-1 shadow-md">
                                  Best Deal!
                                </Badge>
                              )}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3 flex-grow">
                                  <Image
                                    src={alt.platform.icon || `https://picsum.photos/40/40?grayscale&random=plat${alt.platform.name}`}
                                    alt={alt.platform.name}
                                    width={28}
                                    height={28}
                                    className="rounded-full border bg-white p-0.5"
                                    data-ai-hint={`${alt.platform.name} icon`}
                                  />
                                  <div>
                                    <span className="text-sm md:text-base font-medium text-foreground">
                                      {alt.name} ({alt.quantity})
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                      On {alt.platform.name}: <span className="font-bold text-foreground">₹{altPrice.toFixed(2)}</span>
                                      {priceDifference !== 0 && (
                                        <span className={`ml-2 font-semibold ${priceDifference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                          ({priceDifference > 0 ? '-' : '+'}₹{Math.abs(priceDifference).toFixed(2)})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0">
                                  {alt.isEquivalent ? (
                                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Equivalent
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30">
                                      <AlertCircle className="h-3.5 w-3.5 mr-1" /> Similar
                                    </Badge>
                                  )}
                                  <Button variant="ghost" size="sm" asChild className="p-1 h-auto">
                                    <a href={alt.deeplink} target="_blank" rel="noopener noreferrer" title={`View on ${alt.platform.name}`}>
                                      <ArrowRight className="h-4 w-4 text-primary"/>
                                    </a>
                                  </Button>
                                </div>
                              </div>
                              {alt.equivalencyReason && <p className="text-xs text-muted-foreground mt-1.5 pl-1 italic">AI: "{alt.equivalencyReason}"</p>}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground italic">No direct alternatives found in current search results for this item.</p>
                          <p className="text-xs text-muted-foreground mt-1">Try broadening your search query if needed.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </ScrollArea>
          <div className="p-3 md:p-4 border-t text-center">
            <Button onClick={onClose} size="lg">Done Comparing</Button>
          </div>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default ComparisonView;
