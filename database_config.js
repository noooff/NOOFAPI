const sql = require("mssql")
const config = {
    user : 'sa',
     password: 'sa', 
     server: 'localhost',
      database: 'ShoppingDB', 
      options: {
        trustServerCertificate: true
      }
};
sql.connect(config).catch(error => console.log(error))  // showing errors if there
module.exports = sql;    //exporting




