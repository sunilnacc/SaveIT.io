
import React from 'react';
import Image from 'next/image';
import type { ComparisonItem, Product, PlatformCostDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, BadgePercent, ArrowRight, X, Loader2, Info, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ComparisonViewProps {
  comparisonResults: ComparisonItem[];
  onClose: () => void;
  isLoading: boolean;
  platformCostConfig: Record<string, PlatformCostDetails>;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparisonResults, onClose, isLoading, platformCostConfig }) => {

  const calculateAlternativeTotalCost = (alt: Product, originalItemQuantity: number): number => {
    const itemCost = parseFloat(String(alt.offer_price || alt.mrp)) * originalItemQuantity;
    const platformConfig = alt.platform as PlatformCostDetails; // Already enriched in dashboard page
    const deliveryFee = platformConfig?.deliveryFee || 0;
    const platformFee = platformConfig?.platformFee || 0;
    // Simple discount application - could be more complex
    let totalCost = itemCost + deliveryFee + platformFee;
    if (platformConfig?.discount && itemCost >= (platformConfig.discount.threshold || 0) ) {
        if(platformConfig.discount.type === 'fixed') totalCost -= platformConfig.discount.value;
        if(platformConfig.discount.type === 'percentage') totalCost -= itemCost * (platformConfig.discount.value / 100);
    }
    return totalCost < 0 ? 0 : totalCost; // Ensure cost doesn't go negative
  };
  
  const calculateTotalPotentialSavings = () => {
    let totalOriginalEffectiveCost = 0;
    let totalBestAlternativeEffectiveCost = 0;

    comparisonResults.forEach(compItem => {
      const originalPlatformCfg = compItem.originalItem.platform as PlatformCostDetails;
      const originalItemPrice = parseFloat(String(compItem.originalItem.offer_price || compItem.originalItem.mrp));
      let originalItemTotal = originalItemPrice * compItem.originalItem.cartQuantity;
      
      // Add fees for original item to its cost for a fair comparison base
      originalItemTotal += (originalPlatformCfg.deliveryFee || 0) + (originalPlatformCfg.platformFee || 0);
      // Apply discount to original if applicable (simplified for this calculation)
      if (originalPlatformCfg.discount && (originalItemPrice * compItem.originalItem.cartQuantity) >= (originalPlatformCfg.discount.threshold || 0)) {
        if(originalPlatformCfg.discount.type === 'fixed') originalItemTotal -= originalPlatformCfg.discount.value;
        if(originalPlatformCfg.discount.type === 'percentage') originalItemTotal -= (originalItemPrice * compItem.originalItem.cartQuantity) * (originalPlatformCfg.discount.value / 100);
      }
      totalOriginalEffectiveCost += Math.max(0, originalItemTotal);


      let cheapestEquivalentAlternativeEffectiveCost = originalItemTotal; // Start with original's effective cost

      if (Array.isArray(compItem.alternatives)) {
        compItem.alternatives.forEach(alt => {
          if (alt.isEquivalent) { // Only consider equivalent items for direct savings calculation
            const altEffectiveCost = calculateAlternativeTotalCost(alt, compItem.originalItem.cartQuantity);
            if (altEffectiveCost < cheapestEquivalentAlternativeEffectiveCost) {
              cheapestEquivalentAlternativeEffectiveCost = altEffectiveCost;
            }
          }
        });
      }
      totalBestAlternativeEffectiveCost += cheapestEquivalentAlternativeEffectiveCost;
    });
    
    return totalOriginalEffectiveCost - totalBestAlternativeEffectiveCost;
  };

  const totalPotentialSavings = calculateTotalPotentialSavings();

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
                Potential Total Savings (incl. est. fees): ₹{totalPotentialSavings.toFixed(2)}
              </p>
            )}
            {totalPotentialSavings <= 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                You already have good prices, or no cheaper equivalent alternatives found considering estimated fees.
              </p>
            )}
          </CardHeader>
          <ScrollArea className="flex-grow">
            <CardContent className="p-3 md:p-4 space-y-6">
              {comparisonResults.map((compItem, index) => {
                const originalItemPrice = parseFloat(String(compItem.originalItem.offer_price || compItem.originalItem.mrp));
                const originalItemTotal = originalItemPrice * compItem.originalItem.cartQuantity;
                const originalPlatformConfig = compItem.originalItem.platform as PlatformCostDetails;
                const originalEffectiveCost = calculateAlternativeTotalCost(compItem.originalItem, compItem.originalItem.cartQuantity);

                let bestEquivalentAlternative: (Product & { platformDetails: PlatformCostDetails; calculatedTotalCost: number; savings: number; meetsMOV?: boolean; }) | null = null;
                
                if (Array.isArray(compItem.alternatives) && compItem.alternatives.length > 0) {
                  compItem.alternatives.forEach(alt => {
                    const altPlatformConfig = alt.platform as PlatformCostDetails; // Assumes platform details are enriched
                    const altEffectiveCost = calculateAlternativeTotalCost(alt, compItem.originalItem.cartQuantity);
                    const savings = originalEffectiveCost - altEffectiveCost;

                    if (alt.isEquivalent && savings > 0) {
                       const meetsMOV = (parseFloat(String(alt.offer_price || alt.mrp)) * compItem.originalItem.cartQuantity) >= (altPlatformConfig?.minOrderValue || 0);
                      if (!bestEquivalentAlternative || altEffectiveCost < bestEquivalentAlternative.calculatedTotalCost) {
                        bestEquivalentAlternative = {...alt, platformDetails: altPlatformConfig, calculatedTotalCost: altEffectiveCost, savings, meetsMOV };
                      }
                    }
                  });
                }

                return (
                  <Card key={index} className="overflow-hidden bg-background/50 shadow-md">
                    <CardHeader className="p-3 md:p-4 bg-muted/30 border-b">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Image
                          src={compItem.originalItem.images?.[0] || `https://placehold.co/80x80.png`}
                          alt={compItem.originalItem.name}
                          width={60}
                          height={60}
                          className="rounded-md object-contain border bg-white"
                          data-ai-hint="original product"
                        />
                        <div className="flex-grow">
                          <h4 className="font-semibold text-base md:text-lg text-foreground">{compItem.originalItem.name} ({compItem.originalItem.cartQuantity}x)</h4>
                          <p className="text-sm text-muted-foreground">
                            Your choice on {compItem.originalItem.platform.name}: <span className="font-bold text-primary">₹{originalItemTotal.toFixed(2)}</span> (₹{originalItemPrice.toFixed(2)} each)
                          </p>
                           <p className="text-xs text-muted-foreground">Est. delivery ₹{originalPlatformConfig.deliveryFee || 0}, platform fee ₹{originalPlatformConfig.platformFee || 0}. Est. effective total: ₹{originalEffectiveCost.toFixed(2)}</p>
                        </div>
                        {bestEquivalentAlternative && bestEquivalentAlternative.savings > 0 && (
                          <Badge variant="destructive" className="text-xs whitespace-nowrap bg-green-600 hover:bg-green-700">
                            Save ~₹{bestEquivalentAlternative.savings.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 space-y-3">
                      {Array.isArray(compItem.alternatives) && compItem.alternatives.length > 0 ? (
                        compItem.alternatives.map((alt, altIndex) => {
                          const altPrice = parseFloat(String(alt.offer_price || alt.mrp));
                          const altItemTotal = altPrice * compItem.originalItem.cartQuantity;
                          const altPlatformConfig = alt.platform as PlatformCostDetails; // Assumes platform details are enriched
                          const altEffectiveCost = calculateAlternativeTotalCost(alt, compItem.originalItem.cartQuantity);
                          const priceDifferenceFromOriginalItem = originalItemPrice - altPrice;
                          const effectiveDifferenceFromOriginal = originalEffectiveCost - altEffectiveCost;
                          
                          const isBestEquivalentDeal = bestEquivalentAlternative?.id === alt.id && bestEquivalentAlternative?.platform.name === alt.platform.name;
                          const meetsMOV = altItemTotal >= (altPlatformConfig?.minOrderValue || 0);

                          return (
                            <div 
                              key={altIndex} 
                              className={`relative p-3 rounded-lg border-2 ${
                                isBestEquivalentDeal ? 'border-green-500 bg-green-500/10 shadow-lg' : 
                                alt.isEquivalent ? (effectiveDifferenceFromOriginal > 0 ? 'border-sky-500/50 bg-sky-500/10' : 'border-gray-400/50 bg-gray-500/10') : 
                                'border-amber-500/50 bg-amber-500/10'
                              }`}
                            >
                              {isBestEquivalentDeal && (
                                <Badge variant="default" className="absolute -top-3 -right-3 text-xs bg-green-600 text-white px-2 py-1 shadow-md">
                                  Best Deal!
                                </Badge>
                              )}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3 flex-grow">
                                  <Image
                                    src={alt.platform.icon || `https://placehold.co/40x40.png`}
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
                                      On {alt.platform.name}: <span className="font-bold text-foreground">₹{altItemTotal.toFixed(2)}</span> (₹{altPrice.toFixed(2)} each)
                                      {priceDifferenceFromOriginalItem !== 0 && (
                                        <span className={`ml-1 font-semibold ${priceDifferenceFromOriginalItem > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                          (Item {priceDifferenceFromOriginalItem > 0 ? '-' : '+'}₹{Math.abs(priceDifferenceFromOriginalItem).toFixed(2)})
                                        </span>
                                      )}
                                    </div>
                                     <div className="text-xs text-muted-foreground">
                                      Est. delivery ₹{altPlatformConfig?.deliveryFee || 0}, platform ₹{altPlatformConfig?.platformFee || 0}. <span className="font-semibold">Eff. total: ₹{altEffectiveCost.toFixed(2)}</span>
                                       {effectiveDifferenceFromOriginal > 0 && <span className="text-green-500 font-bold ml-1">(Save ~₹{effectiveDifferenceFromOriginal.toFixed(2)})</span>}
                                       {effectiveDifferenceFromOriginal < 0 && <span className="text-red-500 font-bold ml-1">(+₹{Math.abs(effectiveDifferenceFromOriginal).toFixed(2)})</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
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
                              {!meetsMOV && altPlatformConfig?.minOrderValue && (
                                <div className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 p-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start">
                                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5 shrink-0 mt-px" />
                                  <span>Item total ₹{altItemTotal.toFixed(2)} is below {altPlatformConfig.name}'s ₹{altPlatformConfig.minOrderValue} min. order. Extra fees may apply or more items needed on {altPlatformConfig.name}.</span>
                                </div>
                              )}
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
          <CardFooter className="p-3 md:p-4 border-t text-center">
            <Button onClick={onClose} size="lg" variant="primary">Done Comparing</Button>
          </CardFooter>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default ComparisonView;
