const transaction = require('../transaction');
const prices = require('../prices');
const { SmallPackageGetsLowestPriceRule,
    ThirdShipmentFreeRule,
    DiscountLimitRule } = require('../rules');

describe('Rules module ', () => {

    const defaultPrices = prices({
        LP: { S: 1.1, M: 2.0, L: 2.5 },
        MR: { S: 0.9, M: 1.5, L: 2.1 }
    });

    describe('Small package gets lowest price rule', () => {

        test('When empty transaction array passed, output is also empty array', () => {
            const instance = new SmallPackageGetsLowestPriceRule();
            const output = instance.apply([], defaultPrices);
            expect(output).toMatchObject([]);
        });

        test('When transaction array is not defined, output is also empty array', () => {
            const instance = new SmallPackageGetsLowestPriceRule();
            const output = instance.apply(null, defaultPrices);
            expect(output).toMatchObject([]);
        });

        test('When matching transactions provided, rule applied', () => {
            const tx1 = transaction('2015-02-05 S LP', defaultPrices);
            const tx2 = transaction('2015-02-02 M LP', defaultPrices);
            const tx3 = transaction('2015-02-04 S MR', defaultPrices);
            const transactions = [tx1, tx2, tx3];

            const instance = new SmallPackageGetsLowestPriceRule();
            const output = instance.apply(transactions, defaultPrices);

            expect(output.length).toBe(transactions.length);

            expect(output[0].price).toBe(0.9);
            expect(output[0].discount.toFixed(2)).toBe(Number(0.2).toFixed(2));

            expect(output[1].price).toBeUndefined();
            expect(output[1].discount).toBeUndefined();

            expect(output[2].price).toBe(0.9);
            expect(output[2].discount).toBeUndefined();
        });

    });

    describe('Third shipment free rule', () => {
        test('When empty transaction array passed, output is also empty array', () => {
            const instance = new ThirdShipmentFreeRule();
            const output = instance.apply([], defaultPrices);
            expect(output).toMatchObject([]);
        });

        test('When transaction array is not defined, output is also empty array', () => {
            const instance = new ThirdShipmentFreeRule();
            const output = instance.apply(null, defaultPrices);
            expect(output).toMatchObject([]);
        });

        test('When apply called, method should sort transactions ascending', () => {
            const tx1 = transaction('2015-02-05 S MR', defaultPrices);
            const tx2 = transaction('2015-02-02 S MR', defaultPrices);
            const tx3 = transaction('2015-02-04 S MR', defaultPrices);
            const transactions = [tx1, tx2, tx3];

            const instance = new ThirdShipmentFreeRule();
            const output = instance.apply(transactions, defaultPrices);

            expect(output[0].rawLine).toBe('2015-02-02 S MR');
            expect(output[1].rawLine).toBe('2015-02-04 S MR');
            expect(output[2].rawLine).toBe('2015-02-05 S MR');
        });

        test('When matching transactions provided, rule applied', () => {
            const tx1 = transaction('2015-02-02', defaultPrices);
            const tx2 = transaction('2015-02-03 L LP', defaultPrices);
            const tx3 = transaction('2015-02-05 L LP', defaultPrices);
            const tx4 = transaction('2015-02-23 S MR', defaultPrices);
            const tx5 = transaction('2015-02-24 L LP', defaultPrices);
            const tx6 = transaction('2015-02-25 L LP', defaultPrices);
            const tx7 = transaction('2015-02-26 L LP', defaultPrices);
            const tx8 = transaction('2015-02-27 L LP', defaultPrices);
            const tx9 = transaction('2015-03-01 L LP', defaultPrices);

            const transactions = [tx1, tx2, tx3, tx4, tx5, tx6, tx7, tx8, tx9];

            const instance = new ThirdShipmentFreeRule();
            const output = instance.apply(transactions, defaultPrices);

            expect(output.length).toBe(transactions.length);

            expect(output[0].isIgnored()).toBeTruthy();

            expect(output[1].price).toBe(2.5);
            expect(output[1].discount).toBeUndefined();

            expect(output[2].price).toBe(2.5);
            expect(output[2].discount).toBeUndefined();

            expect(output[3].price).toBeUndefined();
            expect(output[3].discount).toBeUndefined();

            expect(output[4].price.toFixed(2)).toBe(Number(0.00).toFixed(2));
            expect(output[4].discount).toBe(2.5);

            expect(output[5].price).toBe(2.5);
            expect(output[5].discount).toBeUndefined();

            expect(output[6].price).toBe(2.5);
            expect(output[6].discount).toBeUndefined();

            expect(output[7].price).toBe(2.5);
            expect(output[7].discount).toBeUndefined();

            expect(output[8].price).toBe(2.5);
            expect(output[8].discount).toBeUndefined();
        });
    });

    describe('Discount limit rule', () => {
        test('When empty transaction array passed, output is also empty array', () => {
            const instance = new DiscountLimitRule();
            const output = instance.apply([], defaultPrices);
            expect(output).toMatchObject([]);
        });

        test('When transaction array is not defined, output is also empty array', () => {
            const instance = new DiscountLimitRule();
            const output = instance.apply(null, defaultPrices);
            expect(output).toMatchObject([]);
        });

        test('When apply called, method should sort transactions ascending', () => {
            const tx1 = transaction('2015-02-05 S MR', defaultPrices);
            const tx2 = transaction('2015-02-02 S MR', defaultPrices);
            const tx3 = transaction('2015-02-04 S MR', defaultPrices);
            const transactions = [tx1, tx2, tx3];

            const instance = new DiscountLimitRule();
            const output = instance.apply(transactions, defaultPrices);

            expect(output[0].rawLine).toBe('2015-02-02 S MR');
            expect(output[1].rawLine).toBe('2015-02-04 S MR');
            expect(output[2].rawLine).toBe('2015-02-05 S MR');
        });

        test('When matching transactions provided, rule applied', () => {
            const currentPrices = prices({
                LP: { S: 4.5, M: 5.2, L: 6.9 },
                MR: { S: 3.3, M: 4.3, L: 5.4 }
            });

            const tx1 = transaction('2015-02-02 S LP', currentPrices);
            tx1.setPrice(4.5);
            tx1.setDiscount(4.0);
            const tx2 = transaction('2015-02-03 L LP', currentPrices);
            tx2.setPrice(6.9);
            tx2.setDiscount(5.1);
            const tx3 = transaction('2015-02-05 L LP', currentPrices);
            tx3.setPrice(6.9);
            tx3.setDiscount(3.1);
            const tx4 = transaction('2015-02-23 S MR', currentPrices);
            tx4.setPrice(1);
            tx4.setDiscount(3.1);
            const tx5 = transaction('2015-02-24 L LP', currentPrices);
            tx5.setPrice(1);
            tx5.setDiscount(3.1);
            const tx6 = transaction('2015-03-24 M LP', currentPrices);
            tx6.setPrice(2.2);
            tx6.setDiscount(3.1);
            const tx7 = transaction('2015-03-24', currentPrices);

            const transactions = [tx1, tx2, tx3, tx4, tx5, tx6, tx7];

            const instance = new DiscountLimitRule();
            const output = instance.apply(transactions, currentPrices);

            expect(output.length).toBe(transactions.length);

            expect(output[0].price.toFixed(2)).toBe(Number(4.5).toFixed(2));
            expect(output[0].discount.toFixed(2)).toBe(Number(4.0).toFixed(2));

            expect(output[1].price.toFixed(2)).toBe(Number(6.9).toFixed(2));
            expect(output[1].discount.toFixed(2)).toBe(Number(5.1).toFixed(2));

            expect(output[2].price.toFixed(2)).toBe(Number(6.0).toFixed(2));
            expect(output[2].discount.toFixed(2)).toBe(Number(0.9).toFixed(2));

            expect(output[3].price.toFixed(2)).toBe(Number(3.3).toFixed(2));
            expect(output[3].discount).toBeUndefined();

            expect(output[4].price.toFixed(2)).toBe(Number(6.9).toFixed(2));
            expect(output[4].discount).toBeUndefined();

            expect(output[5].price.toFixed(2)).toBe(Number(2.2).toFixed(2));
            expect(output[5].discount.toFixed(2)).toBe(Number(3.1).toFixed(2));

            expect(output[6].isIgnored()).toBeTruthy();

        });
    });

});