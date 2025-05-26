const { getConnection } = require('../_lib/azure-sql');

module.exports = async (req, res) => {
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

  // Fallback mock data
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
  
  const mockBrands = tbwaProducts.map((product, index) => ({
    name: product,
    sales: 2800 - index * 220
  }));

  try {
    console.log('Attempting to get brand performance data from Azure SQL...');
    const pool = await getConnection();
    
    const result = await pool.request().query`
      SELECT 
        brand,
        total_transactions,
        total_value,
        avg_transaction_value,
        market_share
      FROM [dbo].[vw_tbwa_brand_performance_mock]
      ORDER BY market_share DESC
    `;

    console.log('Brand query executed successfully, rows:', result.recordset.length);

    // Transform to match frontend expectations (top products format)
    const brands = result.recordset.map((brand, index) => ({
      name: brand.brand,
      sales: brand.total_value || (2800 - index * 220) // Fallback calculation
    }));

    console.log('Returning Azure SQL brand data:', brands);
    res.status(200).json(brands);
    
  } catch (error) {
    console.error('Brand query error:', error);
    console.log('Falling back to mock brand data');
    res.status(200).json(mockBrands);
  }
};
