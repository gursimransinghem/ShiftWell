// Mock for react-native-purchases (RevenueCat) — dev/Expo Go environment
const noop = () => {};
const noopAsync = () => Promise.resolve({});

module.exports = {
  configure: noopAsync,
  getCustomerInfo: () => Promise.resolve({ entitlements: { active: {} } }),
  getOfferings: () => Promise.resolve({ current: null }),
  purchasePackage: noopAsync,
  restorePurchases: noopAsync,
  addCustomerInfoUpdateListener: () => noop,
  removeCustomerInfoUpdateListener: noop,
  LOG_LEVEL: { VERBOSE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4 },
  setLogLevel: noop,
  PACKAGE_TYPE: {},
  INTRO_ELIGIBILITY_STATUS: {},
  PRORATION_MODE: {},
  BILLING_FEATURE: {},
  PURCHASE_TYPE: {},
  default: {
    configure: noopAsync,
    getCustomerInfo: () => Promise.resolve({ entitlements: { active: {} } }),
    getOfferings: () => Promise.resolve({ current: null }),
    purchasePackage: noopAsync,
    restorePurchases: noopAsync,
    addCustomerInfoUpdateListener: () => noop,
    removeCustomerInfoUpdateListener: noop,
    setLogLevel: noop,
  },
};
