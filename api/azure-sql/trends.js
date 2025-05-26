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

  const { days = 30 } = req.query;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('days', pool.sql.Int, parseInt(days))
      .query`
        SELECT 
          CAST([date] as DATE) as date,
          COUNT(*) as transactions,
          SUM(CAST(total_value as DECIMAL(18,2))) as revenue
        FROM [dbo].[tbwa_transactions_mock]
        WHERE dataset_id = (
          SELECT MAX(dataset_id) 
          FROM [dbo].[tbwa_data_metadata] 
          WHERE is_mock = 1
        )
        AND [date] >= DATEADD(day, -@days, GETDATE())
        GROUP BY CAST([date] as DATE)
        ORDER BY date DESC
      `;

    // Transform to match frontend expectations
    const trends = result.recordset.map(row => ({
      date: row.date.toISOString().split('T')[0],
      transactions: row.transactions,
      revenue: row.revenue
    }));

    res.status(200).json(trends);
  } catch (error) {
    console.error('Trends query error:', error);
    
    // Fallback to mock data
    const daysCount = parseInt(days);
    const mockTrends = [];
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseTransactions = 420;
      const variance = Math.sin(i * 0.1) * 80 + Math.random() * 120;
      const transactions = Math.round(baseTransactions + variance);
      
      mockTrends.push({
        date: date.toISOString().split('T')[0],
        transactions: transactions,
        revenue: Math.round(transactions * 285.75)
      });
    }
    
    res.status(200).json(mockTrends);
  }
};
