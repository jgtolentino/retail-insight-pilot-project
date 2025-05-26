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

  const { limit = 10, offset = 0 } = req.query;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('limit', pool.sql.Int, parseInt(limit))
      .input('offset', pool.sql.Int, parseInt(offset))
      .query`
        SELECT *
        FROM [dbo].[vw_tbwa_latest_mock_transactions]
        ORDER BY [date] DESC, [time] DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;

    // Transform to match frontend expectations
    const transactions = result.recordset.map(row => ({
      id: row.transaction_id || `TBWA${String(Date.now()).slice(-6)}`,
      store: row.location || row.store_location || 'Manila',
      amount: parseFloat(row.total_value) || parseFloat(row.amount) || 0,
      items: parseInt(row.item_count) || parseInt(row.items) || 1,
      date: row.date ? new Date(row.date).toLocaleString('en-PH') : new Date().toLocaleString('en-PH'),
      status: row.status || 'Completed'
    }));

    res.status(200).json({
      data: transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Transaction query error:', error);
    
    // Fallback to mock data
    const philippineCities = [
      "Manila", "Quezon City", "Makati", "Cebu City", "Davao City",
      "Taguig", "Iloilo City", "Pampanga", "Alabang", "Pasay City"
    ];
    
    const mockTransactions = [];
    for (let i = 0; i < parseInt(limit); i++) {
      const date = new Date();
      date.setHours(date.getHours() - i * 2);
      
      mockTransactions.push({
        id: `TBWA${String(Date.now() + i).slice(-6)}`,
        store: philippineCities[Math.floor(Math.random() * philippineCities.length)],
        amount: Math.random() * 1200 + 150,
        items: Math.floor(Math.random() * 8) + 1,
        date: date.toLocaleString('en-PH'),
        status: Math.random() > 0.1 ? "Completed" : "Processing"
      });
    }
    
    res.status(200).json({
      data: mockTransactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: mockTransactions.length
      }
    });
  }
};
