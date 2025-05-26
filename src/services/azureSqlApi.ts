
// Azure SQL API endpoints for server-side database access
import sql from 'mssql';

const config: sql.config = {
  server: 'sqltbwaprojectscoutserver.database.windows.net',
  database: 'SQL-TBWA-ProjectScout-Reporting-Prod',
  user: 'TBWA',
  password: 'R@nd0mPA$$2025!',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000,
  connectionTimeout: 60000,
};

let pool: sql.ConnectionPool | null = null;

async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}

export async function getKPIs(days: number = 30) {
  const conn = await getConnection();
  const result = await conn.request()
    .input('days', sql.Int, days)
    .query(`
      SELECT 
        CAST(SUM(amount) as DECIMAL(18,2)) as total_revenue,
        COUNT(*) as transaction_count,
        CAST(AVG(amount) as DECIMAL(18,2)) as avg_basket_size,
        COUNT(DISTINCT store_location) as store_count,
        (SELECT TOP 1 brand_name FROM tbwa_transactions_mock 
         WHERE date >= DATEADD(day, -@days, GETDATE())
         GROUP BY brand_name ORDER BY SUM(amount) DESC) as top_product
      FROM tbwa_transactions_mock 
      WHERE date >= DATEADD(day, -@days, GETDATE())
    `);
  
  return result.recordset[0];
}

export async function getTransactions(limit: number = 10) {
  const conn = await getConnection();
  const result = await conn.request()
    .input('limit', sql.Int, limit)
    .query(`
      SELECT TOP (@limit) 
        transaction_id as id,
        store_location as store,
        amount,
        quantity as items,
        FORMAT(date, 'yyyy-MM-dd HH:mm:ss') as date,
        'Completed' as status
      FROM tbwa_transactions_mock 
      ORDER BY date DESC
    `);
  
  return result.recordset;
}

export async function getTrends(days: number = 30) {
  const conn = await getConnection();
  const result = await conn.request()
    .input('days', sql.Int, days)
    .query(`
      SELECT 
        FORMAT(CAST(date as DATE), 'yyyy-MM-dd') as date,
        COUNT(*) as transactions,
        CAST(SUM(amount) as DECIMAL(18,2)) as revenue
      FROM tbwa_transactions_mock 
      WHERE date >= DATEADD(day, -@days, GETDATE())
      GROUP BY CAST(date as DATE)
      ORDER BY date
    `);
  
  return result.recordset;
}

export async function getTopProducts(days: number = 30) {
  const conn = await getConnection();
  const result = await conn.request()
    .input('days', sql.Int, days)
    .query(`
      SELECT TOP 10
        brand_name as name,
        CAST(SUM(amount) as DECIMAL(18,2)) as sales
      FROM tbwa_transactions_mock 
      WHERE date >= DATEADD(day, -@days, GETDATE())
      GROUP BY brand_name
      ORDER BY sales DESC
    `);
  
  return result.recordset;
}
