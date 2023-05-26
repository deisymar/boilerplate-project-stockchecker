'use strict';

const DB = require('../Controllers/db');
const stockModel = require('../Models/stockModel');
const bcrypt = require('bcryptjs');
const axios = require('axios');

module.exports = class stockController {

    constructor(req) {
        new DB().connect();
        this.stocksModel = new stockModel();
    }

    async getStocks(req) {
        const symbol = req.query.stock;
        const like = req.query.like === undefined ? false : req.query.like !== 'false';
        //const ip = req.ip;
        const ip = bcrypt.hashSync(req.socket.remoteAddress, bcrypt.genSaltSync(12));

        //when two symbols are passed
        if (Array.isArray(symbol)) {
            const stock1 = await this.getDataStock(symbol[0], like, ip);
            const stock2 = await this.getDataStock(symbol[1], like, ip);

            if (stock1.ERROR || stock2.ERROR)
                return stock1.ERROR || stock2.ERROR

            const stockJsonData = {
                'stockData': [
                    { stock: stock1.symbol, price: stock1.price, rel_likes: stock1.likes - stock2.likes },
                    { stock: stock2.symbol, price: stock2.price, rel_likes: stock2.likes - stock1.likes }
                ]
            };
            //console.log(stockJsonData);
            return stockJsonData;

        }

        //when passing a only symbol
        const stock = await this.getDataStock(symbol, like, ip);
        if (stock.ERROR) return stock.ERROR;

        const stockJsonData = { 'stockData': { stock: stock.symbol, price: stock.price, likes: stock.likes } };

        //console.log(stockJsonData);
        return stockJsonData;

    }

    async getDataStock(symbol, like, ip) {
        symbol = symbol.toUpperCase();

        //setNewLike Store a like in the DB, if checking that it does not exist for the ip
        if (like) {
            const newLike = await this.stocksModel.likeSymbol(symbol, ip);
        }
        //get the number of likes for the given symbol from the BD
        const likes = await this.stocksModel.getLikes(symbol);

        const apiUrlStock = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;

        const results = await axios.get(apiUrlStock)
            .then(res => {
                //console.log('resdata: ', res.data.latestPrice);
                return { symbol, price: res.data.latestPrice, likes };
            })
            .catch(error => {
                console.log({ ERROR: 'Something went wrong while trying to access stock data. Please, try again.' });

                return { ERROR: 'Something went wrong while trying to access stock data. Please, try again.' }
            });

        return results;
    }


}