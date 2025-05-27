import { Request, Response } from 'express';
import sql from 'mssql';

// Azure SQL configuration
const config: sql.config = {
  server: 'sqltbwaprojectscoutserver.database.windows.net',
  database: 'SQL-TBWA-ProjectScout-Reporting-Prod',
  user: 'TBWA',
  password: 'R@nd0mPA$$2025!',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectionTimeout: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

async function getConnection() {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
  }
  return pool;
}

// GET /api/azure-sql/transactions - Get mock transactions
export async function getTransactions(req: Request, res: Response) {
  try {
    const { limit = 100, offset = 0, brand, location, startDate, endDate } = req.query;
    
    const conn = await getConnection();
    let query = `
      SELECT 
        [transaction_id], [date], [time], [brand], [category], [location], [region],
        [peso_value], [volume], [consumer_age], [consumer_gender], [payment_method]
      FROM [dbo].[vw_tbwa_latest_mock_transactions]
    `;
    
    const conditions = [];
    const request = conn.request();
    
    if (brand && brand !== 'all') {
      conditions.push('[brand] = @brand');
      request.input('brand', sql.VarChar, brand as string);
    }
    
    if (location && location !== 'all') {
      conditions.push('[location] = @location');
      request.input('location', sql.VarChar, location as string);
    }
    
    if (startDate) {
      conditions.push('[date] >= @startDate');
      request.input('startDate', sql.Date, new Date(startDate as string));
    }
    
    if (endDate) {
      conditions.push('[date] <= @endDate');
      request.input('endDate', sql.Date, new Date(endDate as string));
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY [date] DESC, [time] DESC OFFSET ${Number(offset)} ROWS FETCH NEXT ${Number(limit)} ROWS ONLY`;
    
    const result = await request.query(query);
    
    res.json({
      data: result.recordset,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: result.recordset.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

// GET /api/azure-sql/brands - Get brand performance
export async function getBrandPerformance(req: Request, res: Response) {
  try {
    const conn = await getConnection();
    const result = await conn.request().query(`
      SELECT 
        [brand], [category], [subcategory],
        [transaction_count], [total_value], [avg_value], 
        [total_volume], [unique_consumers], [market_share]
      FROM [dbo].[vw_tbwa_brand_performance_mock]
      ORDER BY [market_share] DESC
    `);
    
    res.json({
      data: result.recordset,
      summary: {
        totalBrands: result.recordset.length,
        totalValue: result.recordset.reduce((sum, brand) => sum + Number(brand.total_value), 0),
        totalTransactions: result.recordset.reduce((sum, brand) => sum + brand.transaction_count, 0)
      }
    });
    
  } catch (error) {
    console.error('Error fetching brand performance:', error);
    res.status(500).json({ error: 'Failed to fetch brand performance' });
  }
}

// GET /api/azure-sql/locations - Get location analytics
export async function getLocationAnalytics(req: Request, res: Response) {
  try {
    const conn = await getConnection();
    const result = await conn.request().query(`
      SELECT 
        [location], [region],
        [transaction_count], [total_value], [avg_value],
        [unique_consumers], [unique_brands]
      FROM [dbo].[vw_tbwa_location_analytics_mock]
      ORDER BY [total_value] DESC
    `);
    
    res.json({
      data: result.recordset,
      summary: {
        totalLocations: result.recordset.length,
        totalValue: result.recordset.reduce((sum, loc) => sum + Number(loc.total_value), 0),
        totalTransactions: result.recordset.reduce((sum, loc) => sum + loc.transaction_count, 0)
      }
    });
    
  } catch (error) {
    console.error('Error fetching location analytics:', error);
    res.status(500).json({ error: 'Failed to fetch location analytics' });
  }
}

// GET /api/azure-sql/kpi - Get key performance indicators
export async function getKPIMetrics(req: Request, res: Response) {
  try {
    const conn = await getConnection();
    
    // Get overall metrics
    const overallResult = await conn.request().query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM([peso_value]) as total_revenue,
        AVG([peso_value]) as avg_transaction_value,
        COUNT(DISTINCT [consumer_id]) as unique_customers,
        COUNT(DISTINCT [brand]) as active_brands,
        COUNT(DISTINCT [location]) as active_locations
      FROM [dbo].[vw_tbwa_latest_mock_transactions]
    `);
    
    // Get growth metrics (compare last 30 days vs previous 30 days)
    const growthResult = await conn.request().query(`
      WITH recent_period AS (
        SELECT SUM([peso_value]) as recent_revenue
        FROM [dbo].[vw_tbwa_latest_mock_transactions]
        WHERE [date] >= DATEADD(day, -30, GETDATE())
      ),
      previous_period AS (
        SELECT SUM([peso_value]) as previous_revenue
        FROM [dbo].[vw_tbwa_latest_mock_transactions]
        WHERE [date] >= DATEADD(day, -60, GETDATE()) 
        AND [date] < DATEADD(day, -30, GETDATE())
      )
      SELECT 
        r.recent_revenue,
        p.previous_revenue,
        CASE 
          WHEN p.previous_revenue > 0 
          THEN ((r.recent_revenue - p.previous_revenue) / p.previous_revenue) * 100
          ELSE 0 
        END as growth_percentage
      FROM recent_period r, previous_period p
    `);
    
    const metrics = overallResult.recordset[0];
    const growth = growthResult.recordset[0] || { growth_percentage: 0 };
    
    res.json({
      kpis: {
        totalRevenue: Number(metrics.total_revenue),
        totalTransactions: metrics.total_transactions,
        averageTransactionValue: Number(metrics.avg_transaction_value),
        uniqueCustomers: metrics.unique_customers,
        activeBrands: metrics.active_brands,
        activeLocations: metrics.active_locations,
        growthPercentage: Number(growth.growth_percentage) || 0
      },
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching KPI metrics:', error);
    res.status(500).json({ error: 'Failed to fetch KPI metrics' });
  }
}

// GET /api/azure-sql/trends - Get trend data
export async function getTrendData(req: Request, res: Response) {
  try {
    const { period = '30' } = req.query;
    
    const conn = await getConnection();
    const result = await conn.request()
      .input('days', sql.Int, Number(period))
      .query(`
        SELECT 
          [date],
          COUNT(*) as transaction_count,
          SUM([peso_value]) as daily_revenue,
          AVG([peso_value]) as avg_transaction_value,
          COUNT(DISTINCT [consumer_id]) as unique_customers
        FROM [dbo].[vw_tbwa_latest_mock_transactions]
        WHERE [date] >= DATEADD(day, -@days, GETDATE())
        GROUP BY [date]
        ORDER BY [date]
      `);
    
    res.json({
      data: result.recordset,
      period: `Last ${period} days`,
      summary: {
        totalDays: result.recordset.length,
        avgDailyRevenue: result.recordset.reduce((sum, day) => sum + Number(day.daily_revenue), 0) / result.recordset.length || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
}

// POST /api/azure-sql/query - Execute custom SQL query
export async function executeCustomQuery(req: Request, res: Response) {
  try {
    const { sql: sqlQuery } = req.body;
    
    if (!sqlQuery) {
      return res.status(400).json({ error: 'SQL query is required' });
    }
    
    // Basic security - only allow SELECT statements on our mock tables/views
    const upperQuery = sqlQuery.toUpperCase().trim();
    if (!upperQuery.startsWith('SELECT')) {
      return res.status(403).json({ error: 'Only SELECT queries are allowed' });
    }
    
    if (!upperQuery.includes('TBWA') && !upperQuery.includes('VW_TBWA')) {
      return res.status(403).json({ error: 'Query must use TBWA mock tables/views' });
    }
    
    const conn = await getConnection();
    const result = await conn.request().query(sqlQuery);
    
    res.json({
      data: result.recordset,
      rowCount: result.recordset.length,
      query: sqlQuery
    });
    
  } catch (error) {
    console.error('Error executing custom query:', error);
    res.status(500).json({ error: 'Failed to execute query', details: error.message });
  }
}

// GET /api/azure-sql/metadata - Get dataset metadata
export async function getDatasetMetadata(req: Request, res: Response) {
  try {
    const conn = await getConnection();
    const result = await conn.request().query(`
      SELECT * FROM [dbo].[tbwa_data_metadata] 
      WHERE [is_mock] = 1 
      ORDER BY [created_at] DESC
    `);
    
    res.json({
      datasets: result.recordset,
      availableTables: [
        'tbwa_transactions_mock',
        'vw_tbwa_latest_mock_transactions', 
        'vw_tbwa_brand_performance_mock',
        'vw_tbwa_location_analytics_mock'
      ]
    });
    
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
}