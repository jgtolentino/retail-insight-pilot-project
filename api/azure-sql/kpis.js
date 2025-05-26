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

  // For now, return mock data to ensure the endpoint works
  // TODO: Implement Azure SQL connection once database access is confirmed
  const mockResponse = {
    totalRevenue: 85000000,
    transactionCount: 12500,
    avgBasketSize: 285.75,
    topProduct: "Alaska Evaporated Milk",
    marketShare: 18.5,
    storeCount: 2850,
    dataSource: "mock" // Indicator that this is mock data
  };
  
  res.status(200).json(mockResponse);

  /* Azure SQL implementation (commented out for now):
  try {
    const pool = await getConnection();
    const result = await pool.request().query`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CAST(total_value as DECIMAL(18,2))) as total_revenue,
        COUNT(DISTINCT brand) as unique_brands,
        COUNT(DISTINCT location) as unique_locations,
        AVG(CAST(total_value as DECIMAL(18,2))) as avg_transaction_value
      FROM [dbo].[tbwa_transactions_mock]
      WHERE dataset_id = (
        SELECT MAX(dataset_id) 
        FROM [dbo].[tbwa_data_metadata] 
        WHERE is_mock = 1
      )
    `;

    const data = result.recordset[0];
    
    const response = {
      totalRevenue: data.total_revenue || 0,
      transactionCount: data.total_transactions || 0,
      avgBasketSize: data.avg_transaction_value || 0,
      topProduct: "Alaska Evaporated Milk",
      marketShare: 18.5,
      storeCount: data.unique_locations || 0,
      dataSource: "azure-sql"
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('KPI query error:', error);
    res.status(200).json(mockResponse);
  }
  */
};
