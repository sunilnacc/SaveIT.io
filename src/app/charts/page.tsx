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
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ChevronRight, TrendingUp } from "lucide-react";
import Header from "@/components/savvy-cart/Header";

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
// Mock data (same as original)
const priceHistoryData = [
  { date: "Jan", blinkit: 82, zepto: 78, swiggy: 90 },
  { date: "Feb", blinkit: 85, zepto: 80, swiggy: 88 },
  { date: "Mar", blinkit: 79, zepto: 77, swiggy: 85 },
  { date: "Apr", blinkit: 76, zepto: 75, swiggy: 82 },
  { date: "May", blinkit: 78, zepto: 77, swiggy: 83 },
  { date: "Jun", blinkit: 75, zepto: 73, swiggy: 80 },
];
const monthlyItemVolume = [
  { month: "Jan", items: 25 },
  { month: "Feb", items: 30 },
  { month: "Mar", items: 28 },
  { month: "Apr", items: 22 },
  { month: "May", items: 26 },
  { month: "Jun", items: 31 },
];
const platformSpendingData = [
  { name: "Blinkit", spending: 3245, color: "#1EE2C7" },
  { name: "Zepto", spending: 2850, color: "#8B5CF6" },
  { name: "Swiggy", spending: 1520, color: "#FFA500" },
];

const frequentItems = [
  { name: "Milk", count: 12, avgPrice: 68, bestPlatform: "Blinkit" },
  { name: "Bread", count: 8, avgPrice: 45, bestPlatform: "Zepto" },
  { name: "Eggs", count: 6, avgPrice: 82, bestPlatform: "Blinkit" },
  { name: "Coffee", count: 4, avgPrice: 375, bestPlatform: "Swiggy" },
];

// Chart.js datasets
const lineChartData = {
  labels: priceHistoryData.map((d) => d.date),
  datasets: [
    {
      label: "Blinkit",
      data: priceHistoryData.map((d) => d.blinkit),
      borderColor: "#1EE2C7",
      backgroundColor: "#1EE2C7",
      tension: 0.4,
    },
    {
      label: "Zepto",
      data: priceHistoryData.map((d) => d.zepto),
      borderColor: "#8B5CF6",
      backgroundColor: "#8B5CF6",
      tension: 0.4,
    },
    {
      label: "Swiggy",
      data: priceHistoryData.map((d) => d.swiggy),
      borderColor: "#FFA500",
      backgroundColor: "#FFA500",
      tension: 0.4,
    },
  ],
};

const barChartData = {
  labels: platformSpendingData.map((d) => d.name),
  datasets: [
    {
      label: "Spending",
      data: platformSpendingData.map((d) => d.spending),
      backgroundColor: platformSpendingData.map((d) => d.color),
      borderRadius: 4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: "#ccc" },
    },
    tooltip: {
      backgroundColor: "#1E1E1E",
      titleColor: "#fff",
      bodyColor: "#fff",
    },
  },
  scales: {
    x: {
      ticks: { color: "#808080" },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
    y: {
      ticks: { color: "#808080" },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
};

const ComparisionPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="pb-20 pt-16 px-4 py-6">
      <h1 className="text-2xl font-bold font-poppins">
        <span className="gradient-text">Price</span> Insights
      </h1>
      <p className="text-gray-400 mt-1">Track prices & analyze your spending</p>
    
    <div className="mt-6">
  <Card className="p-4 bg-saveit-card-bg">
    <div className="flex justify-between items-center">
      <h3 className="font-medium">Price Insights (6 Months)</h3>
      <Badge className="bg-saveit-neon-green/20 text-saveit-neon-green">
        Last 6 Months
      </Badge>
    </div>

    <div className="mt-4 flex flex-col md:flex-row gap-6">
      {/* Line Chart */}
      <div className="md:w-2/3 w-full">
        <div className="h-64">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="md:w-1/3 w-full">
        <div className="h-64">
          <Doughnut
            data={{
              labels: monthlyItemVolume.map((d) => d.month),
              datasets: [
                {
                  data: monthlyItemVolume.map((d) => d.items),
                  backgroundColor: [
                    "#1EE2C7",
                    "#8B5CF6",
                    "#FFA500",
                    "#39FF14",
                    "#00FFFF",
                    "#FF69B4",
                  ],
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#ccc",
                    boxWidth: 12,
                    padding: 12,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between text-sm">
      <div className="flex gap-4">
        {platformSpendingData.map((item) => (
          <div className="flex items-center" key={item.name}>
            <div
              className="h-3 w-3 rounded-full mr-1"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-400">{item.name}</span>
          </div>
        ))}
      </div>
      <span className="text-xs text-saveit-neon-green">
        <ArrowDown size={12} className="inline mr-1" />
        8% avg. price decrease
      </span>
    </div>
  </Card>
</div>


      <div className="mt-6">
        <Card className="p-4 bg-saveit-card-bg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Your Spending by Platform</h3>
            <Badge className="bg-saveit-bright-blue/20 text-saveit-bright-blue">
              This Month
            </Badge>
          </div>

          <div className="mt-3 h-52">
            <Bar data={barChartData} options={chartOptions} />
          </div>

          <div className="mt-3 text-sm text-gray-400">
            <p>
              Total spending: <span className="text-white font-medium">₹7,615</span>
            </p>
            <p>
              Savings vs. market average:{" "}
              <span className="text-saveit-neon-green font-medium">₹1,243 (16%)</span>
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Frequently Purchased</h3>
          <span className="text-xs text-gray-400">Last 3 months</span>
        </div>

        <div className="mt-3 space-y-3">
          {frequentItems.map((item, index) => (
            <Card key={index} className="p-3 bg-saveit-card-bg flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{item.name}</span>
                  <Badge className="ml-2 bg-saveit-accent-purple/20 text-saveit-accent-purple text-xs">
                    {item.count}x
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Avg. price: ₹{item.avgPrice}
                </p>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Best deals on:</span>
                <div className="flex items-center mt-1">
                  <TrendingUp size={14} className="text-saveit-neon-green mr-1" />
                  <span className="text-saveit-neon-green text-sm">{item.bestPlatform}</span>
                  <ChevronRight size={16} className="text-gray-400 ml-1" />
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

export default ComparisionPage;
