
// Mock data generator for the retail dashboard POC
export const mockData = {
  getKPIs: (dateRange: string) => {
    const multiplier = dateRange === "7" ? 0.3 : dateRange === "30" ? 1 : 3;
    
    return {
      totalRevenue: Math.round(1250000 * multiplier),
      transactionCount: Math.round(3421 * multiplier),
      avgBasketSize: 365.50,
      topProduct: "Wireless Bluetooth Headphones"
    };
  },

  getDailyTrends: (dateRange: string) => {
    const days = parseInt(dateRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseTransactions = 120;
      const variance = Math.sin(i * 0.1) * 30 + Math.random() * 40;
      
      data.push({
        date: date.toISOString().split('T')[0],
        transactions: Math.round(baseTransactions + variance),
        revenue: Math.round((baseTransactions + variance) * 365.50)
      });
    }
    
    return data;
  },

  getTopProducts: (dateRange: string) => {
    const products = [
      "Wireless Bluetooth Headphones",
      "Smartphone Case",
      "Coffee Maker",
      "Running Shoes",
      "Laptop Stand",
      "Water Bottle",
      "Desk Lamp",
      "Phone Charger",
      "Backpack",
      "Wireless Mouse"
    ];
    
    const multiplier = dateRange === "7" ? 0.3 : dateRange === "30" ? 1 : 3;
    
    return products.map((product, index) => ({
      name: product,
      sales: Math.round((800 - index * 70) * multiplier)
    }));
  },

  getRecentTransactions: () => {
    const stores = ["Store #001", "Store #002", "Store #003", "Store #004", "Store #005"];
    const transactions = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setHours(date.getHours() - i * 2);
      
      transactions.push({
        id: `TXN${String(Date.now() + i).slice(-6)}`,
        store: stores[Math.floor(Math.random() * stores.length)],
        amount: Math.random() * 500 + 50,
        items: Math.floor(Math.random() * 8) + 1,
        date: date.toLocaleString(),
        status: Math.random() > 0.1 ? "Completed" : "Processing"
      });
    }
    
    return transactions;
  }
};
