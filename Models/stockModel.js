'use strict';

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

module.exports = class stockModel {

    constructor() {
        this.stockSchema = new mongoose.Schema({
            symbol: { type: String, required: true },
            likes: { type: Number, required: true },
            ips: [String]
        });

        this.Stock = mongoose.model('Stock', this.stockSchema);
    }

    // Returns the number of likes for the given symbol or 0 if no likes were returned.
    async getLikes(symbol, ip = false) {
        const likes = ip
            ? await this.Stock.find({ symbol, ips: ip }).select({ likes: 1, _id: 0 })
            : await this.Stock.find({ symbol }).select({ likes: 1, _id: 0 });
        return likes[0] !== undefined ? likes[0].likes : 0;
    };

    // Stores one like for the given symbol per IP and returns the results or false.
    async likeSymbol(symbol, ip) {
        const likes = await this.getLikes(symbol, ip);

        if (likes) return false;

        const update = await this.Stock.updateOne(
            { symbol },
            {
                $push: { ips: ip },
                $inc: { likes: 1 }
            },
            { upsert: true }
        );
        return update;
    };

}