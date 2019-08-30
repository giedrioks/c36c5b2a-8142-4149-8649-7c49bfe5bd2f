// Grab input file parameter or use sensitive default
let inputFile = 'input.txt';
process.argv.forEach((val, index) => {
    if (index === 2) inputFile = val
});

// Check if input file exists, otherwise exit with message
const fs = require('fs');
if (!fs.existsSync(inputFile)) {
    console.error(`File [${inputFile}] doesn't exist.`);
    process.exit(0)
}

// Read a file and execute calculation
const stream = fs.createReadStream(inputFile, {encoding: 'utf8'});
stream.on('data', data => {

    const priceData = require('./data/priceData');
    const prices = require('./prices')(priceData);

    const { SmallPackageGetsLowestPriceRule,
        ThirdShipmentFreeRule,
        DiscountLimitRule } = require('./rules');
    const rules = [
        new SmallPackageGetsLowestPriceRule(),
        new ThirdShipmentFreeRule(),
        new DiscountLimitRule()
    ];

    const transaction = require('./transaction');

    // Input data for discount calculation
    const input = data.split(/\n/);
    const transactions = [];
    input.forEach(line => transactions.push(transaction(line, prices)));

    // Initialize calculator
    try {
        const calculator = require('./calculator')(transactions, prices, rules);

        // Calculate discounts and get output back
        const output = calculator.calculate();

        // Print all output
        output.forEach(line => console.log(line.toString()));
    } catch (err) {
        console.error(`Calculation failed.`, err);
        process.exit(0)
    }
});
stream.on('error', () => {
    console.log(`Unable to read a file [${inputFile}]`);
});