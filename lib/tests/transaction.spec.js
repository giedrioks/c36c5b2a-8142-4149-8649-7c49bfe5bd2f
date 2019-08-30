const transaction = require('../transaction');
const prices = require('../prices');

describe('Transaction module', () => {

    const defaultPrices = prices({ LP: { S: 1 }});

    describe('Creating instance', () => {
        test('When passed line is empty, transaction is ignored', () => {
            const instance = transaction('', defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line is not defined, transaction is ignored', () => {
            const instance = transaction(null, defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When prices not defined, transaction is ignored', () => {
            const instance = transaction('2016-02-23 S LP', null);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line contains 1 parameter, transaction is ignored', () => {
            const instance = transaction('2015-02-23', defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line contains 2 parameter, transaction is ignored', () => {
            const instance = transaction('2015-02-23 S', defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line contains wrong date format (still creates date), transaction is ignored', () => {
            const instance = transaction('16-02-23 S LP', defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line contains wrong date format (not parsed), transaction is ignored', () => {
            const instance = transaction('* S LP', defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line contains unknown size, transaction is ignored', () => {
            const instance = transaction('2016-02-23 X LP', defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line contains unknown carrier, transaction is ignored', () => {
            const instance = transaction('2016-02-23 S XX', defaultPrices);
            expect(instance.isIgnored()).toBeTruthy();
        });
        test('When passed line format is correct, transaction is not ignored', () => {
            const instance = transaction('2016-02-23 S LP', defaultPrices);
            expect(instance.isIgnored()).toBeFalsy();
        });
        test('When passed line format is correct, date, size and carrier are returned', () => {
            const instance = transaction('2016-02-23 S LP', defaultPrices);
            expect(instance.getDate()).toMatchObject(new Date('2016-02-23'));
            expect(instance.getSize()).toBe('S');
            expect(instance.getCarrier()).toBe('LP');
        });
        test('When passed line format is wrong, date, size and carrier returned as undefined', () => {
            const instance = transaction('XX S LP', defaultPrices);
            expect(instance.getDate()).toBeUndefined();
            expect(instance.getSize()).toBeUndefined();
            expect(instance.getCarrier()).toBeUndefined();
        });
        test('When transaction has price only, toString shows only price with dash for discount', () => {
            const instance = transaction('2016-02-23 S LP', defaultPrices);
            instance.setPrice(4.3);
            expect(instance.toString()).toBe('2016-02-23 S LP 4.30 -');
        });
        test('When transaction is ignored, toString shows Ignored at the end', () => {
            const instance = transaction('2016-02-23 S', defaultPrices);
            expect(instance.toString()).toBe('2016-02-23 S Ignored');
        });
        test('When discount set, getter returns same', () => {
            const instance = transaction('2016-02-23 S LP', defaultPrices);
            instance.setDiscount(4.3);
            expect(instance.getDiscount()).toBe(4.3);
        });
        test('When transaction has no price, toString shows raw line', () => {
            const instance = transaction('2016-02-23 S LP', defaultPrices);
            expect(instance.toString()).toBe('2016-02-23 S LP');
        });
        test('When transaction has price without discount, toString shows raw line, price and dash for discount', () => {
            const instance = transaction('2016-02-23 S LP', defaultPrices);
            instance.setPrice(4.3);
            expect(instance.toString()).toBe('2016-02-23 S LP 4.30 -');
        });
        test('When transaction has price and discount set, toString shows both', () => {
            const instance = transaction('2016-02-23 S LP', defaultPrices);
            instance.setPrice(4.3);
            instance.setDiscount(2.2);
            expect(instance.toString()).toBe('2016-02-23 S LP 4.30 2.20');
        });
    });

});