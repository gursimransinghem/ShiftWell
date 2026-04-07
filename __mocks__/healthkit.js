// Mock for @kingstinct/react-native-healthkit
// __esModule: true tells ts-jest's __importDefault not to double-wrap this module,
// so that `import HealthKit from '...'` resolves to module.exports.default correctly.
module.exports = {
  __esModule: true,
  default: {
    isHealthDataAvailable: async () => false,
    requestAuthorization: async () => true,
    querySleepSamples: async () => [],
    queryCategorySamples: async () => [],
    queryQuantitySamples: async () => [],
    queryStatisticsForQuantity: async () => null,
    saveQuantitySample: async () => true,
    saveCategorySample: async () => true,
  },
  CategoryTypeIdentifier: {
    sleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis',
    SleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis',
  },
  CategoryValueSleepAnalysis: {
    inBed: 0,
    asleepUnspecified: 1,
    awake: 2,
    asleepCore: 3,
    asleepDeep: 4,
    asleepREM: 5,
    Asleep: 0,
    InBed: 1,
    Awake: 2,
    AsleepCore: 3,
    AsleepDeep: 4,
    AsleepREM: 5,
  },
  QuantityTypeIdentifier: {
    heartRate: 'HKQuantityTypeIdentifierHeartRate',
    heartRateVariabilitySDNN: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    restingHeartRate: 'HKQuantityTypeIdentifierRestingHeartRate',
    stepCount: 'HKQuantityTypeIdentifierStepCount',
    appleSleepingWristTemperature: 'HKQuantityTypeIdentifierAppleSleepingWristTemperature',
    HeartRate: 'HKQuantityTypeIdentifierHeartRate',
    StepCount: 'HKQuantityTypeIdentifierStepCount',
  },
  StatisticsOptions: {
    discreteAverage: 'discreteAverage',
  },
  HKQuantityTypeIdentifier: { HeartRate: 'HKQuantityTypeIdentifierHeartRate' },
  HKCategoryTypeIdentifier: { SleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis' },
  useHealthkitAuthorization: () => [null, async () => {}],
};
