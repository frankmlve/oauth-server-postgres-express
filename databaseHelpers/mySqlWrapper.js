module.exports = {
  query: query,
};

const {
  Pool
} = require('pg')
const connectionString = process.env.DATABASE_URL

function query(queryString, cbFunc) {
  const pool = new Pool({
     /* user: process.env.DATABASE_USER || 'adminuser',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'oauthdatabase',
    password: process.env.DATABASE_PASSWORD || 'test123', */
    //ssl: true 
    user: 'admin',
    host:  'localhost',
    database: 'oauthserver',
    password: 'admin',
    //connectionString: connectionString,
  });

  pool.query(queryString, (error, results) => {
    cbFunc(setResponse(error, results));
  });
}

function setResponse(error, results) {
  return {
    error: error,
    results: results ? results : null,
  };
}
