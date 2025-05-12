import React from 'react';
import Image from 'next/image';
import type { ComparisonItem, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, BadgePercent, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface ComparisonViewProps {
  comparisonResults: ComparisonItem[];
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparisonResults, onClose }) => {
  if (comparisonResults.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle>No Comparison Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Could not find alternatives or enough data to compare.</p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const calculateTotalSavings = () => {
    let totalOriginalCost = 0;
    let totalCheapestCost = 0;

    comparisonResults.forEach(compItem => {
        const originalPrice = parseFloat(String(compItem.originalItem.offer_price || compItem.originalItem.mrp));
        totalOriginalCost += originalPrice * compItem.originalItem.cartQuantity;

        let cheapestAlternativePrice = originalPrice;
        compItem.alternatives.forEach(alt => {
            if (alt.isEquivalent) {
                const altPrice = parseFloat(String(alt.offer_price || alt.mrp));
                if (altPrice < cheapestAlternativePrice) {
                    cheapestAlternativePrice = altPrice;
                }
            }
        });
        totalCheapestCost += cheapestAlternativePrice * compItem.originalItem.cartQuantity;
    });
    
    return totalOriginalCost - totalCheapestCost;
  };

  const totalSavings = calculateTotalSavings();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2 md:p-4">
      <Card className="w-full max-w-3xl h-[90vh] md:h-[85vh] flex flex-col">
        <CardHeader className="sticky top-0 bg-card z-10 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl md:text-2xl text-primary flex items-center">
              <BadgePercent className="mr-2 h-6 w-6" />
              Price Comparison
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
           {totalSavings > 0 && (
            <p className="text-lg font-semibold text-green-400 mt-2">
              Potential Total Savings: ₹{totalSavings.toFixed(2)}
            </p>
          )}
        </CardHeader>
        <ScrollArea className="flex-grow">
          <CardContent className="p-3 md:p-4 space-y-4">
            {comparisonResults.map((compItem, index) => (
              <Card key={index} className="overflow-hidden bg-background/30">
                <CardHeader className="p-3 bg-card/50 border-b">
                  <div className="flex items-center gap-3">
                    <Image
                      src={compItem.originalItem.images?.[0] || 'https://picsum.photos/80/80?random=' + compItem.originalItem.id}
                      alt={compItem.originalItem.name}
                      width={50}
                      height={50}
                      className="rounded-md object-contain border"
                      data-ai-hint="product item"
                    />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base">{compItem.originalItem.name} ({compItem.originalItem.cartQuantity}x)</h4>
                      <p className="text-xs text-muted-foreground">
                        Your choice: <span className="font-medium">₹{Number(compItem.originalItem.offer_price || compItem.originalItem.mrp).toFixed(2)}</span> on {compItem.originalItem.platform.name}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {compItem.alternatives.length > 0 ? (
                    compItem.alternatives.map((alt, altIndex) => (
                      <div key={altIndex} className={`p-2 rounded-md border ${alt.isEquivalent ? 'border-green-500/50 bg-green-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                             <Image
                                src={alt.platform.icon}
                                alt={alt.platform.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                                data-ai-hint={`${alt.platform.name} icon`}
                              />
                            <span className="text-xs md:text-sm">{alt.platform.name}: <span className="font-bold">₹{Number(alt.offer_price || alt.mrp).toFixed(2)}</span></span>
                          </div>
                           {alt.isEquivalent ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                            )}
                        </div>
                        {alt.equivalencyReason && <p className="text-xs text-muted-foreground mt-1 pl-1">{alt.equivalencyReason}</p>}
                         <a href={alt.deeplink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 flex items-center">
                            View on {alt.platform.name} <ArrowRight className="h-3 w-3 ml-1"/>
                         </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No direct alternatives found with current search data.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ComparisonView;
