// Mock for @kingstinct/react-native-healthkit
module.exports = {
  default: {
    isHealthDataAvailable: async () => false,
    requestAuthorization: async () => true,
    querySleepSamples: async () => [],
    queryQuantitySamples: async () => [],
    saveQuantitySample: async () => true,
    saveCategorySample: async () => true,
  },
  CategoryTypeIdentifier: { SleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis' },
  CategoryValueSleepAnalysis: { Asleep: 0, InBed: 1, Awake: 2, AsleepCore: 3, AsleepDeep: 4, AsleepREM: 5 },
  QuantityTypeIdentifier: { HeartRate: 'HKQuantityTypeIdentifierHeartRate', StepCount: 'HKQuantityTypeIdentifierStepCount' },
  HKQuantityTypeIdentifier: { HeartRate: 'HKQuantityTypeIdentifierHeartRate' },
  HKCategoryTypeIdentifier: { SleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis' },
  useHealthkitAuthorization: () => [null, async () => {}],
};
