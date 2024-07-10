const sql = require("mssql")
const config = {
    user : 'adminammar',
     password: 'P@ssw0rd69', 
     server: 'serve24.database.windows.net',
      database: 'shoopingdb', 
      options: {
        encrypt: true
      }
};
sql.connect(config).catch(error => console.log(error))  // showing errors if there
module.exports = sql;    //exporting




