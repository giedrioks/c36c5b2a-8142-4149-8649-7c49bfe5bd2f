describe('Prices module', () => {

    test('When data not provided, method invocation should not fail', () => {
        const prices = require('../prices');
        expect(() => prices()).not.toThrow();
    });

    describe('Sizes', () => {
        test('When price data provided, module should expose size constants', () => {
            const prices = require('../prices')({ LP: { S: 1.5 } });
            expect(prices.SIZES).toMatchObject({ SMALL: 'S', MEDIUM: 'M', LARGE: 'L' });
        });

        test('When price data not provided, module should expose size constants', () => {
            const prices = require('../prices')();
            expect(prices.SIZES).toMatchObject({ SMALL: 'S', MEDIUM: 'M', LARGE: 'L' });
        });
    });

    describe('Get Price', () => {

        test('When invalid data provided (no size), method invocation should not fail', () => {
            const prices = require('../prices')({ LP: {} });
            expect(prices.getPrice('LP', 'S')).toBeUndefined();
        });

        test('When invalid data provided (no carrier), method invocation should not fail', () => {
            const prices = require('../prices')({});
            expect(prices.getPrice('LP', 'S')).toBeUndefined();
        });

        test('When data provided, method invocation should return price', () => {
            const prices = require('../prices')({ LP: { S: 1.5 } });
            expect(prices.getPrice('LP', 'S')).toBe(1.5);
        });

    });

    describe('Get Carriers', () => {

        test('When data not provided, method invocation should return empty array', () => {
            const prices = require('../prices')();
            expect(prices.getCarriers()).toMatchObject([]);
        });

        test('When single carrier provided, method invocation should return single carrier in array', () => {
            const prices = require('../prices')({ LP: { S: 1.5 } });
            expect(prices.getCarriers()).toMatchObject(['LP']);
        });

        test('When multiple carriers provided, method invocation should return multiple carriers in array', () => {
            const prices = require('../prices')({ LP: { S: 1.5 }, MR: { S: 1.5 }  });
            expect(prices.getCarriers()).toMatchObject(['LP', 'MR']);
        });

    });

});