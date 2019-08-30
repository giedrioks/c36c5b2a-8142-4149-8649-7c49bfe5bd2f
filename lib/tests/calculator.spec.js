const transaction = require('../transaction');
const calculator = require('../calculator');
const prices = require('../prices');
const { SmallPackageGetsLowestPriceRule } = require('../rules');

describe('Calculator module', () => {

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
    });

    function createInstance(transactions, prices, rules) {
        return calculator(transactions, prices, rules);
    }

    describe('Initialization', () => {

        const defaultPrices = prices({ LP: { S: 1 }});
        const defaultTransactions = [transaction('2015-02-05', defaultPrices)];
        const defaultRules = [new SmallPackageGetsLowestPriceRule()];

        test('When initialized, module has transaction reference', () => {
            const instance = createInstance(defaultTransactions, defaultPrices, defaultRules);
            expect(instance.input).toBe(defaultTransactions);
        });

        test('When initialized, module has prices reference', () => {
            const instance = createInstance(defaultTransactions, defaultPrices, defaultRules);
            expect(instance.prices).toBe(defaultPrices);
        });

        test('When initialized, module has rules reference', () => {
            const instance = createInstance(defaultTransactions, defaultPrices, defaultRules);
            expect(instance.rules).toBe(defaultRules);
        });

        test('When no transactions provided via initialization, module creates empty input array', () => {
            const instance = createInstance(null, defaultPrices, defaultRules);
            expect(instance.input).toMatchObject([]);
        });

        test('When no rules provided via initialization, module creates empty input array', () => {
            const instance = createInstance(defaultTransactions, defaultPrices, null);
            expect(instance.rules).toMatchObject([]);
        });

        test('When initialized, module creates empty output array', () => {
            const instance = createInstance(defaultTransactions, defaultPrices, defaultRules);
            expect(instance.output).toMatchObject([]);
        });

    });

    describe('Calculate', () => {

        const defaultPrices = prices({ MR: { S: 1.5 }});
        const defaultRules = [new SmallPackageGetsLowestPriceRule()];

        test('When calculation called, method should set price for all not ignored transactions', () => {
            const tx1 = transaction('2015-02-02 S', defaultPrices);
            const tx2 = transaction('2015-02-04 S MR', defaultPrices);
            const transactions = [tx1, tx2];

            const instance = createInstance(transactions, defaultPrices, defaultRules);
            const output = instance.calculate();
            expect(output[0].price).toBeUndefined();
            expect(output[1].price).toBe(1.5);
        });

        test('When calculation called, rule should be applied', () => {
            const tx1 = transaction('2015-02-02 S MR', defaultPrices);
            const transactions = [tx1];
            const rule = new SmallPackageGetsLowestPriceRule();
            const spyOnRuleApply = jest.spyOn(rule, 'apply').mockImplementation((input) => input);
            const rules = [rule];

            const instance = createInstance(transactions, defaultPrices, rules);
            const output = instance.calculate();

            expect(output).toBe(transactions);
            expect(spyOnRuleApply).toHaveBeenCalledTimes(1);
        });

    });

});