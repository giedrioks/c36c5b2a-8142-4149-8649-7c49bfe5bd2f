const prices = (priceData = {}) => {
    return {
        SIZES: { SMALL: 'S', MEDIUM: 'M', LARGE: 'L' },
        getPrice: (carrier, size) => {
            if (priceData[carrier] && priceData[carrier][size]) {
                return priceData[carrier][size];
            }
            return;
        },
        getCarriers: () => {
            return Object.keys(priceData);
        }
    }
};

module.exports = (priceData) => prices(priceData);