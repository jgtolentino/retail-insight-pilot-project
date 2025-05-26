
// Mock data generator for the TBWA retail dashboard POC
export const mockData = {
  getKPIs: (dateRange: string) => {
    const multiplier = dateRange === "7" ? 0.3 : dateRange === "30" ? 1 : 3;
    
    return {
      totalRevenue: Math.round(85000000 * multiplier), // PHP 85M base
      transactionCount: Math.round(12500 * multiplier),
      avgBasketSize: 285.75, // PHP average
      topProduct: "Alaska Evaporated Milk",
      marketShare: 18.5, // New KPI for TBWA
      storeCount: 2850 // New KPI for store penetration
    };
  },

  getDailyTrends: (dateRange: string) => {
    const days = parseInt(dateRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseTransactions = 420;
      const variance = Math.sin(i * 0.1) * 80 + Math.random() * 120;
      
      data.push({
        date: date.toISOString().split('T')[0],
        transactions: Math.round(baseTransactions + variance),
        revenue: Math.round((baseTransactions + variance) * 285.75)
      });
    }
    
    return data;
  },

  getTopProducts: (dateRange: string) => {
    const tbwaProducts = [
      "Alaska Evaporated Milk",
      "Oishi Prawn Crackers",
      "Del Monte Tomato Sauce",
      "Champion Detergent Bar",
      "Alaska Condensed Milk",
      "Pride Dishwashing Liquid",
      "Del Monte Sweet Style Spaghetti Sauce",
      "Oishi Potato Chips",
      "Alaska Fresh Milk",
      "Champion Liquid Detergent"
    ];
    
    const multiplier = dateRange === "7" ? 0.3 : dateRange === "30" ? 1 : 3;
    
    return tbwaProducts.map((product, index) => ({
      name: product,
      sales: Math.round((2800 - index * 220) * multiplier)
    }));
  },

  getRecentTransactions: () => {
    const philippineCities = [
      "Manila", 
      "Quezon City", 
      "Makati", 
      "Cebu City", 
      "Davao City",
      "Taguig",
      "Iloilo City",
      "Pampanga",
      "Alabang",
      "Pasay City"
    ];
    
    const transactions = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setHours(date.getHours() - i * 2);
      
      transactions.push({
        id: `TBWA${String(Date.now() + i).slice(-6)}`,
        store: philippineCities[Math.floor(Math.random() * philippineCities.length)],
        amount: Math.random() * 1200 + 150, // PHP amounts
        items: Math.floor(Math.random() * 8) + 1,
        date: date.toLocaleString('en-PH'),
        status: Math.random() > 0.1 ? "Completed" : "Processing"
      });
    }
    
    return transactions;
  }
};
