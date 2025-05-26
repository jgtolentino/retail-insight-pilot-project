const sql = require('mssql');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const config = {
    server: 'sqltbwaprojectscoutserver.database.windows.net',
    database: 'SQL-TBWA-ProjectScout-Reporting-Prod',
    user: 'TBWA',
    password: 'R@nd0mPA$$2025!',
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  try {
    console.log('Testing Azure SQL connection...');
    console.log('Server:', config.server);
    console.log('Database:', config.database);
    console.log('User:', config.user);
    
    const pool = await sql.connect(config);
    console.log('Connection successful!');
    
    // Test a simple query
    const result = await pool.request().query('SELECT @@VERSION as version, GETDATE() as current_time');
    console.log('Query result:', result.recordset[0]);
    
    // Test if our tables exist
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('tbwa_transactions_mock', 'tbwa_data_metadata')
    `);
    
    console.log('Available tables:', tableCheck.recordset);
    
    res.status(200).json({
      status: 'success',
      message: 'Azure SQL connection successful',
      serverInfo: result.recordset[0],
      availableTables: tableCheck.recordset,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Connection failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
};
