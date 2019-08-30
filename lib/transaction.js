class Transaction {
    constructor(line, prices) {
        this.rawLine = line;
        this.ignored = false;
        this.prices = prices;
        this.parsedLine = this.__parseLine(line);
    }

    __parseLine(line) {
        const parsedLine = {};

        if (!line) {
            this.ignored = true;
            return;
        }

        if (!this.prices) {
            this.ignored = true;
            return;
        } else {
            const lineSplit = line.split(' ');
            if (lineSplit.length < 3) {
                this.ignored = true;
                return;
            }

            parsedLine.date = new Date(lineSplit[0]);
            if (!(parsedLine.date.getFullYear()
                && parsedLine.date.getMonth()
                && parsedLine.date.getDate())) {
                this.ignored = true;
                return;
            }

            const size = lineSplit[1];
            const carrier = lineSplit[2];
            if (this.prices.getPrice(carrier, size)) {
                parsedLine.size = size;
                parsedLine.carrier = carrier;
            } else {
                this.ignored = true;
                return;
            }
        }

        return parsedLine;
    }

    isIgnored() {
        return this.ignored;
    }

    getDate() {
        return this.parsedLine ? this.parsedLine.date : undefined;
    }

    getSize() {
        return this.parsedLine ? this.parsedLine.size : undefined;
    }

    getCarrier() {
        return this.parsedLine ? this.parsedLine.carrier : undefined;
    }

    setPrice(price) {
        this.price = price;
    }

    setDiscount(discount) {
        this.discount = discount;
    }

    getDiscount() {
        return this.discount;
    }

    toString() {
        if (this.ignored) {
            return `${this.rawLine} Ignored`;
        }
        if (!this.price) return `${this.rawLine}`;
        if (!this.discount) return `${this.rawLine} ${this.price.toFixed(2)} -`;
        return `${this.rawLine} ${this.price.toFixed(2)} ${this.discount.toFixed(2)}`;
    }
}

module.exports = (line, prices) => new Transaction(line, prices);