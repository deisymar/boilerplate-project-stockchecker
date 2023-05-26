'use strict';
const stockController = require('../Controllers/stockController');

module.exports = function (app) {

  const stocks = new stockController();

  app.route('/api/stock-prices')
    .get(async function (req, res){
       if(req.query.stock){
           res.send(await stocks.getStocks(req));
       }else {
           res.status(400).send('Error: A stock must provided (e.g. /api/stock-prices?stock=nombreStock)');
       }
           
    });
    
};
