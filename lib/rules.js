class SmallPackageGetsLowestPriceRule {
    apply(transactions, prices) {
        if (!transactions) transactions = [];

        const lowestPrice = this.__getLowestPrice(prices);
        transactions.forEach(tx => {
            if (tx.isIgnored()) return;

            if (tx.getSize() === prices.SIZES.SMALL) {
                tx.setPrice(lowestPrice);
                const originalPrice = prices.getPrice(tx.getCarrier(), tx.getSize());
                if (originalPrice > lowestPrice) {
                    const discount = originalPrice - lowestPrice;
                    tx.setDiscount(discount)
                }
            }
        });
        return transactions;
    }
    __getLowestPrice(prices) {
        let lowestPrice = 0;
        prices.getCarriers().forEach((carrier, index) => {
            const price = prices.getPrice(carrier, prices.SIZES.SMALL);
            if (index === 0) lowestPrice = price;
            if (price < lowestPrice) lowestPrice = price;
        });
        return lowestPrice;
    }
}

class ThirdShipmentFreeRule {
    apply(transactions, prices) {
        if (!transactions) transactions = [];

        let currentMonth = 0;
        let freeShipmentCounter = 0;
        let discountApplied = false;

        transactions.sort((a,b) =>  a.getDate() - b.getDate());

        transactions.forEach(tx => {
            if (tx.isIgnored()) return;

            if (tx.getCarrier() === 'LP' && tx.getSize() === 'L') {
                if (currentMonth === 0)
                    currentMonth = tx.getDate().getMonth() + 1;

                if (currentMonth !== (tx.getDate().getMonth() + 1)) {
                    currentMonth = tx.getDate().getMonth() + 1;
                    freeShipmentCounter = 0;
                    discountApplied = false;
                }


                const originalPrice = prices.getPrice(tx.getCarrier(), tx.getSize());
                if (freeShipmentCounter === 2 && !discountApplied) {
                    freeShipmentCounter = 0;
                    discountApplied = true;
                    tx.setPrice(0.001);
                    tx.setDiscount(originalPrice);
                } else {
                    freeShipmentCounter += 1;
                    tx.setPrice(originalPrice);
                }
            }
        });
        return transactions;
    }
}

class DiscountLimitRule {
    constructor(limit = 10) {
        this.limit = limit;
    }
    apply(transactions, prices) {
        if (!transactions) transactions = [];

        let currentMonth = 0;
        let accumulatedDiscount = 0;
        let limitReached = false;

        transactions.sort((a,b) =>  a.getDate() - b.getDate());

        transactions.forEach(tx => {
            if (tx.isIgnored()) return;

            if (currentMonth === 0)
                currentMonth = tx.getDate().getMonth() + 1;

            if (currentMonth !== (tx.getDate().getMonth() + 1)) {
                currentMonth = tx.getDate().getMonth() + 1;
                accumulatedDiscount = 0;
                limitReached = false;
            }

            const txDiscount = tx.getDiscount();
            if (!txDiscount) return;

            const originalPrice = prices.getPrice(tx.getCarrier(), tx.getSize());
            if (limitReached) {
                tx.setPrice(originalPrice);
                tx.setDiscount(undefined);
            } else {
                if (accumulatedDiscount + txDiscount > this.limit) {
                    tx.setDiscount(this.limit - accumulatedDiscount);
                    tx.setPrice(originalPrice - tx.getDiscount());
                    accumulatedDiscount = this.limit;
                    limitReached = true;
                } else {
                    accumulatedDiscount += txDiscount;
                }
            }
        });
        return transactions;
    }
}

module.exports = {
    SmallPackageGetsLowestPriceRule,
    ThirdShipmentFreeRule,
    DiscountLimitRule
};