class Calculator {
    constructor(transactions, prices, rules) {
        this.input = transactions || [];
        this.prices = prices;
        this.rules = rules || [];
        this.output = [];
    }
    
    calculate() {
        this.input.forEach(tx => {
            if (!tx.isIgnored())
                tx.setPrice(this.prices.getPrice(tx.getCarrier(), tx.getSize()));
        });

        this.rules.forEach(rule => {
           this.output = rule.apply(this.input, this.prices);
        });
        return this.output;
    }
}

module.exports = (transactions, prices, rules) => new Calculator(transactions, prices, rules);