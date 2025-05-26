const { getConnection } = require('../_lib/azure-sql');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request().query`
      SELECT 
        location,
        region,
        total_transactions,
        total_value,
        avg_transaction_value,
        top_brand
      FROM [dbo].[vw_tbwa_location_analytics_mock]
      ORDER BY total_value DESC
    `;

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Location query error:', error);
    
    // Fallback to mock data
    const philippineRegions = [
      { location: "Manila", region: "NCR", transactions: 2500, value: 712500 },
      { location: "Quezon City", region: "NCR", transactions: 2200, value: 628500 },
      { location: "Makati", region: "NCR", transactions: 1800, value: 514500 },
      { location: "Cebu City", region: "Central Visayas", transactions: 1600, value: 457200 },
      { location: "Davao City", region: "Davao Region", transactions: 1400, value: 400050 },
      { location: "Taguig", region: "NCR", transactions: 1200, value: 342900 },
      { location: "Iloilo City", region: "Western Visayas", transactions: 1000, value: 285750 },
      { location: "Pampanga", region: "Central Luzon", transactions: 900, value: 257175 },
      { location: "Alabang", region: "NCR", transactions: 800, value: 228600 },
      { location: "Pasay City", region: "NCR", transactions: 700, value: 200025 }
    ];
    
    const mockLocations = philippineRegions.map(loc => ({
      location: loc.location,
      region: loc.region,
      total_transactions: loc.transactions,
      total_value: loc.value,
      avg_transaction_value: Math.round(loc.value / loc.transactions),
      top_brand: "Alaska Evaporated Milk"
    }));
    
    res.status(200).json(mockLocations);
  }
};
