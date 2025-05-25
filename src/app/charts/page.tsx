"use client";

import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  ChartData,
  ChartOptions,
  ChartType,
  ChartTypeRegistry,
  Point,
  BubbleDataPoint,
  CartesianScaleOptions,
  Chart, // Import Chart for defaults
  Tick, // For callback parameter typing
  Align, // For tick alignment
  TooltipItem, // For tooltip callback context typing
  Scale // For x-axis ticks callback 'this' context
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDown, 
  ChevronRight, 
  TrendingUp, 
  Info, 
  ShoppingCart, 
  Clock, 
  Tag, 
  AlertTriangle,
  Percent,
  DollarSign
} from "lucide-react";
import Header from "@/components/savvy-cart/Header";

// Type definitions
interface PlatformData {
  name: string;
  spending: number;
  color: string;
  deliveryFee: number;
  savings: number;
}

interface PriceHistoryData {
  date: string;
  blinkit: number;
  zepto: number;
  swiggy: number;
  bigbasket?: number;
  dmart?: number;
}

interface MonthlySavingsData {
  month: string;
  savings: number;
}

interface PriceAlert {
  item: string;
  platform: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  type: 'price_drop' | 'price_increase';
}

interface FrequentItem {
  name: string;
  count: number;
  avgPrice: number;
  bestPlatform: string;
  bestPrice: number;
  savings: number;
  image: string;
  priceRange?: string;
  priceHistory?: {platform: string; price: number}[];
}

// Theme colors - matching the app's color scheme from globals.css
const colors = {
  blinkit: "hsl(var(--chart-1))", // Sage green
  zepto: "hsl(var(--chart-2))", // Light sage/Peach yellow
  swiggy: "hsl(var(--chart-3))", // Bittersweet
  bigbasket: "hsl(var(--chart-4))", // Wine
  dmart: "hsl(var(--chart-5))", // Van Dyke
  savings: "hsl(var(--primary))", // Primary color
  warning: "hsl(var(--destructive))", // Destructive color
  background: "hsl(var(--background))",
  cardBg: "hsl(var(--card))",
  textPrimary: "hsl(var(--foreground))",
  textSecondary: "hsl(var(--muted-foreground))",
  saveitNeonGreen: "hsl(var(--primary))" // For consistency with existing code
} as const;

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement 
);
// Mock data with types - more realistic price data for grocery items
const priceHistoryData: PriceHistoryData[] = [
  { date: "Jan", blinkit: 82, zepto: 78, swiggy: 90 },
  { date: "Feb", blinkit: 85, zepto: 80, swiggy: 88 },
  { date: "Mar", blinkit: 79, zepto: 77, swiggy: 85 },
  { date: "Apr", blinkit: 76, zepto: 75, swiggy: 82 },
  { date: "May", blinkit: 78, zepto: 77, swiggy: 83 },
  { date: "Jun", blinkit: 75, zepto: 73, swiggy: 80 },
  { date: "Jul", blinkit: 77, zepto: 74, swiggy: 81 },
  { date: "Aug", blinkit: 74, zepto: 72, swiggy: 79 },
  { date: "Sep", blinkit: 73, zepto: 71, swiggy: 78 },
  { date: "Oct", blinkit: 72, zepto: 70, swiggy: 77 },
  { date: "Nov", blinkit: 70, zepto: 68, swiggy: 75 },
  { date: "Dec", blinkit: 69, zepto: 67, swiggy: 74 }
];

const monthlySavingsData: MonthlySavingsData[] = [
  { month: "Jan", savings: 320 },
  { month: "Feb", savings: 450 },
  { month: "Mar", savings: 380 },
  { month: "Apr", savings: 510 },
  { month: "May", savings: 420 },
  { month: "Jun", savings: 480 },
  { month: "Jul", savings: 495 },
  { month: "Aug", savings: 530 },
  { month: "Sep", savings: 515 },
  { month: "Oct", savings: 540 },
  { month: "Nov", savings: 580 },
  { month: "Dec", savings: 620 }
];

const platformData: PlatformData[] = [
  { name: "Blinkit", spending: 3245, color: colors.blinkit, deliveryFee: 19, savings: 420 },
  { name: "Zepto", spending: 2850, color: colors.zepto, deliveryFee: 25, savings: 380 },
  { name: "Swiggy", spending: 1520, color: colors.swiggy, deliveryFee: 35, savings: 290 },
  { name: "BigBasket", spending: 1850, color: colors.bigbasket, deliveryFee: 50, savings: 310 },
  { name: "DMart", spending: 1250, color: colors.dmart, deliveryFee: 40, savings: 270 }
];

const frequentItems: FrequentItem[] = [
  { 
    name: "Amul Taaza Milk (1L)", 
    count: 12, 
    avgPrice: 68, 
    bestPlatform: "Blinkit",
    bestPrice: 65,
    savings: 3,
    image: "🥛",
    priceRange: "₹65-75",
    priceHistory: [
      {platform: "Blinkit", price: 65},
      {platform: "Zepto", price: 68},
      {platform: "Swiggy", price: 70},
      {platform: "BigBasket", price: 69},
      {platform: "DMart", price: 67}
    ]
  },
  { 
    name: "Britannia Whole Wheat Bread", 
    count: 8, 
    avgPrice: 45, 
    bestPlatform: "Zepto",
    bestPrice: 42,
    savings: 3,
    image: "🍞",
    priceRange: "₹40-50",
    priceHistory: [
      {platform: "Blinkit", price: 45},
      {platform: "Zepto", price: 42},
      {platform: "Swiggy", price: 48},
      {platform: "BigBasket", price: 46},
      {platform: "DMart", price: 44}
    ]
  },
  { 
    name: "Fresho Farm Eggs (6pcs)", 
    count: 6, 
    avgPrice: 82, 
    bestPlatform: "Blinkit",
    bestPrice: 75,
    savings: 7,
    image: "🥚",
    priceRange: "₹75-90",
    priceHistory: [
      {platform: "Blinkit", price: 75},
      {platform: "Zepto", price: 80},
      {platform: "Swiggy", price: 85},
      {platform: "BigBasket", price: 82},
      {platform: "DMart", price: 78}
    ]
  },
  { 
    name: "Nescafe Classic Coffee (250g)", 
    count: 4, 
    avgPrice: 375, 
    bestPlatform: "Swiggy",
    bestPrice: 359,
    savings: 16,
    image: "☕",
    priceRange: "₹350-420",
    priceHistory: [
      {platform: "Blinkit", price: 375},
      {platform: "Zepto", price: 380},
      {platform: "Swiggy", price: 359},
      {platform: "BigBasket", price: 369},
      {platform: "DMart", price: 389}
    ]
  },
];

const priceAlerts: PriceAlert[] = [
  {
    item: "Himalaya Face Wash",
    platform: "Blinkit",
    oldPrice: 199,
    newPrice: 179,
    change: -10,
    type: "price_drop"
  },
  {
    item: "Dove Soap",
    platform: "Swiggy",
    oldPrice: 65,
    newPrice: 75,
    change: 15,
    type: "price_increase"
  },
  {
    item: "Maggi Noodles",
    platform: "Zepto",
    oldPrice: 60,
    newPrice: 54,
    change: -10,
    type: "price_drop"
  }
];

// Chart data and options
const lineChartData: ChartData<'line'> = {
  labels: priceHistoryData.map(d => d.date),
  datasets: [
    {
      label: "Blinkit",
      data: priceHistoryData.map(d => d.blinkit),
      borderColor: colors.blinkit,
      backgroundColor: `${colors.blinkit}40`,
      tension: 0.4,
      fill: true
    },
    {
      label: "Zepto",
      data: priceHistoryData.map(d => d.zepto),
      borderColor: colors.zepto,
      backgroundColor: `${colors.zepto}40`,
      tension: 0.4,
      fill: true
    },
    {
      label: "Swiggy",
      data: priceHistoryData.map(d => d.swiggy),
      borderColor: colors.swiggy,
      backgroundColor: `${colors.swiggy}40`,
      tension: 0.4,
      fill: true
    }
  ]
};

// Create product comparison data for a single product
const createProductComparisonData = (item: FrequentItem): ChartData<'bar'> => {
  return {
    labels: item.priceHistory?.map(p => p.platform) || [],
    datasets: [{
      label: `Price (₹) for ${item.name}`,
      data: item.priceHistory?.map(p => p.price) || [],
      backgroundColor: [
        colors.blinkit,
        colors.zepto,
        colors.swiggy,
        colors.bigbasket,
        colors.dmart
      ],
      borderRadius: 4
    }]
  };
};

// Create options for product comparison chart
const createProductComparisonOptions = (itemName: string): ChartOptions<'bar'> => {
  const base = getCartesianChartOptions<'bar'>();
  return {
    ...base,
    plugins: {
      ...base.plugins,
      title: {
        display: true,
        text: `Price Comparison: ${itemName}`,
        color: colors.textPrimary,
        font: { size: 16 },
        padding: { bottom: 10 }
      }
    },
    scales: {
      ...base.scales,
      y: {
        ...(base.scales?.y as CartesianScaleOptions),
        beginAtZero: true
      }
    }
  };
};

const monthlySavingsChartData: ChartData<'bar'> = {
  labels: monthlySavingsData.map(d => d.month),
  datasets: [{
    label: "Monthly Savings (₹)",
    data: monthlySavingsData.map(d => d.savings),
    backgroundColor: colors.savings,
    borderRadius: 4
  }]
};

const platformFeesData: ChartData<'bar'> = {
  labels: platformData.map(p => p.name),
  datasets: [
    {
      label: "Delivery Fee (₹)",
      data: platformData.map(p => p.deliveryFee),
      backgroundColor: `${colors.blinkit}80`,
      borderRadius: 4
    },
    {
      label: "Platform Fee (₹)",
      data: [5, 7, 10, 0, 0],
      backgroundColor: `${colors.swiggy}80`,
      borderRadius: 4
    }
  ]
};

const spendingByPlatformData: ChartData<'pie'> = {
  labels: platformData.map(p => p.name),
  datasets: [{
    data: platformData.map(p => p.spending),
    backgroundColor: platformData.map(p => p.color),
    borderWidth: 0
  }]
};

// Base chart options with type safety - common for all chart types
const getBaseChartOptions = <T extends ChartType = ChartType>() => {
  // Using a more general return type to avoid strict type checking issues
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: colors.textSecondary,
          padding: 20,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: colors.cardBg,
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: TooltipItem<T>) {
            return `₹${context.raw?.toLocaleString()}`;
          }
        }
      },
    }
  };
};

// Cartesian chart options (for line and bar charts)
const getCartesianChartOptions = <T extends 'line' | 'bar'>() => {
  const baseOptions = getBaseChartOptions<T>();
  
  const xScaleOptions: CartesianScaleOptions = {
    ...Chart.defaults.scales.linear,
    min: 0,
    max: 0,
    axis: 'x',
    bounds: 'ticks',
    position: 'bottom',
    offset: true,
    title: {
      display: false,
      text: '',
      align: 'center',
      color: colors.textSecondary,
      font: { size: 12, family: "'Inter', sans-serif", style: 'normal', weight: 'bold' },
      padding: { top: 10, bottom: 10, y: 0 }
    },
    border: {
      display: false,
      color: colors.textSecondary + '30',
      width: 1,
      dash: [],
      dashOffset: 0,
      z: 0
    },
    grid: {
      display: true,
      drawOnChartArea: true,
      color: colors.textSecondary + '30', // Lighter grid lines
      lineWidth: 1,
      drawTicks: true,
      tickBorderDash: [],
      tickBorderDashOffset: 0,
      tickColor: colors.textSecondary + '30',
      tickLength: 8,
      tickWidth: 1,
      offset: false,
      z: 0
    },
    ticks: {
      ...Chart.defaults.scale.ticks,
      sampleSize: 7,
      align: 'center' as Align,
      autoSkip: true,
      autoSkipPadding: 0,
      crossAlign: 'near' as const,
      includeBounds: false,
      labelOffset: 0,
      minRotation: 0,
      maxRotation: 0, 
      mirror: false,
      maxTicksLimit: 11,
      display: true,
      color: colors.textSecondary,
      font: { size: 10, family: "'Inter', sans-serif", style: 'normal', weight: 'normal', lineHeight: 1.2 }, 
      padding: 3, 
      major: { enabled: false },
      showLabelBackdrop: false,
      backdropColor: 'rgba(0,0,0,0)', 
      backdropPadding: 0,
      textStrokeColor: '',
      textStrokeWidth: 0,
      z: 0,
      callback: function(this: Scale, value: string | number, index: number, ticks: Tick[]) {
        const label = this.getLabelForValue(Number(value));
        return label.length > 15 ? label.substring(0,12) + '...' : label; 
      }
    }
  };

  const yScaleOptions: CartesianScaleOptions = {
    ...Chart.defaults.scales.linear,
    min: 0,
    max: 0,
    axis: 'y',
    bounds: 'ticks',
    position: 'left',
    offset: false,
    title: {
      display: false,
      text: '',
      align: 'center',
      color: colors.textSecondary,
      font: { size: 12, family: "'Inter', sans-serif", style: 'normal', weight: 'bold' },
      padding: { top: 10, bottom: 10, y: 0 }
    },
    border: {
      display: false,
      color: colors.textSecondary + '30',
      width: 1,
      dash: [],
      dashOffset: 0,
      z: 0
    },
    grid: {
      display: true,
      drawOnChartArea: true,
      color: colors.textSecondary + '30',
      lineWidth: 1,
      drawTicks: true,
      tickBorderDash: [],
      tickBorderDashOffset: 0,
      tickColor: colors.textSecondary + '30',
      tickLength: 8,
      tickWidth: 1,
      offset: false,
      z: 0
    },
    ticks: {
      ...Chart.defaults.scale.ticks,
      sampleSize: 7,
      align: 'center' as Align,
      autoSkip: true,
      autoSkipPadding: 0,
      crossAlign: 'near' as const,
      includeBounds: false,
      labelOffset: 0,
      minRotation: 0,
      maxRotation: 0,
      mirror: false,
      maxTicksLimit: 11,
      display: true,
      color: colors.textSecondary,
      font: { size: 10, family: "'Inter', sans-serif", style: 'normal', weight: 'normal', lineHeight: 1.2 }, 
      padding: 3, 
      major: { enabled: false },
      showLabelBackdrop: false,
      backdropColor: 'rgba(0,0,0,0)',
      backdropPadding: 0,
      textStrokeColor: '',
      textStrokeWidth: 0,
      z: 0,
      callback: function(value: string | number) {
        if (typeof value === 'number') {
          if (value >= 1000000) return (value / 1000000) + 'M';
          if (value >= 1000) return (value / 1000) + 'k';
        }
        return value;
      }
    }
  };

  return {
    ...baseOptions,
    scales: {
      x: xScaleOptions,
      y: yScaleOptions,
    }
  };
};

// Type-specific chart options factory functions
const createLineChartOptions = (): ChartOptions<'line'> => {
  const base = getCartesianChartOptions<'line'>();
  return {
    ...base,
    plugins: {
      ...base.plugins,
      title: {
        display: true,
        text: 'Price Trends Over Time',
        color: colors.textPrimary,
        font: { size: 16 },
        padding: { bottom: 20 }
      }
    },
    scales: {
      x: {
        ...base.scales.x,
        title: {
          display: true,
          text: 'Month',
          color: colors.textSecondary
        }
      },
      y: {
        ...base.scales.y,
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (₹)',
          color: colors.textSecondary
        }
      }
    }
  };
};

const createBarChartOptions = (): ChartOptions<'bar'> => {
  const base = getCartesianChartOptions<'bar'>();
  return {
    ...base,
    plugins: {
      ...base.plugins,
      legend: { display: false },
      title: {
        display: true,
        text: 'Monthly Savings (₹)',
        color: colors.textPrimary,
        font: { size: 16 },
        padding: { bottom: 10 }
      }
    },
    scales: {
      ...base.scales,
      y: {
        ...base.scales.y,
        beginAtZero: true
      }
    }
  };
};

const createPieChartOptions = (): ChartOptions<'pie' | 'doughnut'> => {
  const base = getBaseChartOptions<'pie'>();
  return {
    ...base,
    plugins: {
      ...base.plugins,
      legend: {
        ...base.plugins?.legend,
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Spending by Platform',
        color: colors.textPrimary,
        font: { size: 16 },
        padding: { bottom: 10 }
      }
    },
    cutout: '70%',
  } as ChartOptions<'pie'>;
};

const createStackedBarOptions = (): ChartOptions<'bar'> => {
  const base = getCartesianChartOptions<'bar'>();
  return {
    ...base,
    plugins: {
      ...base.plugins,
      title: {
        display: true,
        text: 'Savings Breakdown (Platform vs. Direct)',
        color: colors.textPrimary,
        font: { size: 16 },
        padding: { bottom: 10 }
      }
    },
    scales: {
      x: {
        ...(base.scales?.x as CartesianScaleOptions),
        stacked: true,
      },
      y: {
        ...(base.scales?.y as CartesianScaleOptions),
        stacked: true,
        beginAtZero: true
      }
    }
  };
};

const monthlySavingsBarOptions: ChartOptions<'bar'> = {
  ...createBarChartOptions(), // Use the factory function
  plugins: {
    ...createBarChartOptions().plugins,
    legend: {
      display: false // Typically, bar charts with single dataset don't need a legend
    },
    title: {
      display: true,
      text: 'Monthly Savings (₹)',
      color: colors.textPrimary,
      font: { size: 16 },
      padding: { bottom: 10 }
    }
  },
  scales: {
    ...createBarChartOptions().scales,
    y: {
      ...(createBarChartOptions().scales?.y as CartesianScaleOptions),
      beginAtZero: true
    }
  }
};

const spendingPieOptions: ChartOptions<'pie'> = {
  ...createPieChartOptions(), // Use the factory function
  plugins: {
    ...createPieChartOptions().plugins,
    legend: {
      ...(createPieChartOptions().plugins?.legend),
      position: 'right', // Keep specific override
    },
    title: {
      display: true,
      text: 'Spending by Platform',
      color: colors.textPrimary,
      font: { size: 16 },
      padding: { bottom: 10 }
    }
  },
  cutout: '70%', // Keep specific override
};

const platformFeesChartOptions: ChartOptions<'bar'> = {
  ...createBarChartOptions(),
  plugins: {
    ...createBarChartOptions().plugins,
    title: {
      display: true,
      text: 'Platform Fee Comparison',
      color: colors.textPrimary,
      font: { size: 16 },
      padding: { bottom: 10 }
    }
  },
  scales: {
    ...createBarChartOptions().scales,
    x: {
      ...(createBarChartOptions().scales?.x as CartesianScaleOptions),
      stacked: false, // Platforms (categories) are not stacked
    },
    y: {
      ...(createBarChartOptions().scales?.y as CartesianScaleOptions),
      stacked: true, // Stack different fees for the same platform
      beginAtZero: true,
    }
  }
};

const ChartsPage: React.FC = () => {
  // Calculate total savings
  const totalSavings = monthlySavingsData.reduce((sum, month) => sum + month.savings, 0);
  const avgMonthlySavings = Math.round(totalSavings / monthlySavingsData.length);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your spending and savings across platforms</p>
            </div>
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-primary">₹{totalSavings}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Avg. Monthly</p>
                <p className="text-xl font-medium">₹{avgMonthlySavings}</p>
              </div>
            </div>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Price Trends */}
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-xl font-semibold mb-4">Price Trends</h2>
              <div className="h-72">
                <Line data={lineChartData} options={createLineChartOptions()} />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-primary">
                    <ArrowDown size={12} className="inline mr-1" />
                    8% avg. price decrease
                  </span>
                  <button className="text-xs text-primary hover:underline flex items-center">
                    View details <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Spending by Platform */}
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-xl font-semibold mb-4">Spending by Platform</h2>
              <div className="h-72 flex items-center justify-center">
                <Pie data={spendingByPlatformData} options={spendingPieOptions} />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                You could save ~₹500 by shifting some purchases from Swiggy to Blinkit
              </p>
            </Card>
          </div>

          {/* Savings & Fees Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Savings */}
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-xl font-semibold mb-4">Monthly Savings</h2>
              <div className="h-80">
                <Bar data={monthlySavingsChartData} options={monthlySavingsBarOptions} />
              </div>
              <p className="text-sm text-slate-400 mt-3 flex items-center">
                <Info className="h-4 w-4 mr-1 text-slate-500" />
                Hover over the chart for detailed breakdown
              </p>
            </Card>

            {/* Platform Fees */}
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-xl font-semibold mb-4">Platform Fees</h2>
              <div className="h-80">
                <Bar data={platformFeesData} options={platformFeesChartOptions} />
              </div>
              <p className="text-sm text-slate-400 mt-3 flex items-center">
                <Info className="h-4 w-4 mr-1 text-slate-500" />
                Swiggy charges the highest platform fees. Consider alternatives for smaller orders.
              </p>
            </Card>
          </div>

          {/* Price Alerts and Frequent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Price Alerts */}
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-xl font-semibold mb-4">Price Alerts</h2>
              <div className="space-y-4">
                {priceAlerts.map((alert: PriceAlert, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{alert.item}</p>
                      <p className="text-sm text-muted-foreground">{alert.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{alert.newPrice}</p>
                      <p className={`text-xs ${alert.type === 'price_increase' ? 'text-destructive' : 'text-primary'}`}>
                        {alert.change > 0 ? '+' : ''}{alert.change}% from ₹{alert.oldPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Frequent Items */}
            <Card className="p-6 bg-card border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Frequently Purchased</h3>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  Best Prices
                </Badge>
              </div>
              <div className="space-y-4">
                {frequentItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{item.image}</span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center text-sm text-slate-400">
                          <span>Bought {item.count}x</span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors[item.bestPlatform.toLowerCase() as keyof typeof colors] || colors.textSecondary }}></span>
                            {item.bestPlatform}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.bestPrice}</p>
                      <p className="text-xs text-primary">Save ₹{item.savings} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Product Price Comparison */}
          <Card className="p-6 bg-card border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Product Price Comparison</h2>
            <div className="h-80">
              <Bar 
                data={createProductComparisonData(frequentItems[0])} 
                options={createProductComparisonOptions(frequentItems[0].name)} 
              />
            </div>
            <p className="text-sm text-slate-400 mt-3 flex items-center">
              <Info className="h-4 w-4 mr-1 text-slate-500" />
              Comparing prices across all platforms helps you save up to 15% per item
            </p>
          </Card>

          {/* Savings Tip */}
          <Card className="p-6 bg-gradient-to-r from-card to-card/90 border border-border mb-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:mr-6 mb-4 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Tag className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold mb-2">
                  Smart Savings Tips for You
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Buying in bulk on weekends when Blinkit offers extra discounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Using Zepto's 20% off coupon for first orders over ₹499</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Subscribing to Swiggy One for free deliveries on smaller orders</span>
                  </li>
                </ul>
              </div>
              <button className="mt-4 md:mt-0 px-6 py-2 bg-primary text-slate-900 font-medium rounded-md hover:bg-primary/90 transition-colors">
                Show Me How
              </button>
            </div>
          </Card>
          <div className="mt-4">
            <span className="text-xs text-primary flex items-center">
              <ArrowDown size={12} className="mr-1" />
              8% avg. price decrease
            </span>
          </div>

          {/* Additional Charts */}
          <div className="mt-6">
            <Card className="p-4 bg-card border border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Your Spending by Platform</h3>
                <Badge className="bg-primary/20 text-primary">
                  This Month
                </Badge>
              </div>

              <div className="mt-3 h-52">
                <Bar data={platformFeesData} options={platformFeesChartOptions} />
              </div>

              <div className="mt-3 text-sm text-slate-400">
                <p>
                  Total spending: <span className="text-white font-medium">₹7,615</span>
                </p>
                <p>
                  Savings vs. market average:{" "}
                  <span className="text-green-400 font-medium">₹1,243 (16%)</span>
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Frequently Purchased</h3>
              <span className="text-xs text-slate-400">Last 3 months</span>
            </div>

            <div className="mt-3 space-y-3">
              {frequentItems.map((item, index) => (
                <Card key={index} className="p-3 bg-card border border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                      <Badge className="ml-2 bg-purple-500/20 text-purple-400 text-xs">
                        {item.count}x
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Avg. price: ₹{item.avgPrice}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Best deals on:</span>
                    <div className="flex items-center mt-1">
                      <TrendingUp size={14} className="text-primary mr-1" />
                      <span className="text-primary text-sm">{item.bestPlatform}</span>
                      <ChevronRight size={16} className="text-muted-foreground ml-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChartsPage;
