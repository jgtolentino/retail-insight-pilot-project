module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Try to import mssql
    const sql = require('mssql');
    
    // Simple connection test
    const config = {
      server: 'sqltbwaprojectscoutserver.database.windows.net',
      database: 'SQL-TBWA-ProjectScout-Reporting-Prod',
      user: 'TBWA',
      password: 'R@nd0mPA$$2025!',
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
      }
    };

    console.log('Attempting connection with config:', {
      server: config.server,
      database: config.database,
      user: config.user
    });

    // Try to connect
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    
    console.log('Connected successfully!');
    
    // Simple query
    const request = pool.request();
    const result = await request.query('SELECT @@VERSION as version, GETDATE() as current_time');
    
    await pool.close();
    
    res.status(200).json({
      status: 'success',
      message: 'Connection successful',
      data: result.recordset[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      code: error.code,
      number: error.number,
      state: error.state,
      class: error.class,
      serverName: error.serverName,
      procName: error.procName,
      lineNumber: error.lineNumber,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code,
      details: {
        number: error.number,
        state: error.state,
        class: error.class,
        serverName: error.serverName
      },
      timestamp: new Date().toISOString()
    });
  }
};
