/**
 * Type declarations for @kingstinct/react-native-healthkit.
 *
 * This package requires native iOS build tools to install fully.
 * These declarations provide compile-time type safety for our
 * HealthKit service module.
 */
declare module '@kingstinct/react-native-healthkit' {
  export enum CategoryTypeIdentifier {
    sleepAnalysis = 'HKCategoryTypeIdentifierSleepAnalysis',
  }

  export enum CategoryValueSleepAnalysis {
    inBed = 0,
    asleepUnspecified = 1,
    awake = 2,
    asleepCore = 3,
    asleepDeep = 4,
    asleepREM = 5,
  }

  export enum QuantityTypeIdentifier {
    heartRate = 'HKQuantityTypeIdentifierHeartRate',
  }

  export enum StatisticsOptions {
    discreteAverage = 'discreteAverage',
  }

  interface QueryOptions {
    from?: Date;
    to?: Date;
  }

  interface CategorySample {
    startDate: string | Date;
    endDate: string | Date;
    value: number;
    sourceRevision?: { source?: { name?: string } };
  }

  interface StatisticsResult {
    averageQuantity?: { quantity: number };
  }

  const HealthKit: {
    requestAuthorization(
      read: string[],
      write?: string[],
    ): Promise<boolean>;
    isHealthDataAvailable(): Promise<boolean>;
    queryCategorySamples(
      identifier: string,
      options: QueryOptions,
    ): Promise<CategorySample[]>;
    saveCategorySample(
      identifier: string,
      value: number,
      start: Date,
      end: Date,
    ): Promise<void>;
    queryStatisticsForQuantity(
      identifier: string,
      options: string[],
      start: Date,
      end: Date,
    ): Promise<StatisticsResult | null>;
  };

  export default HealthKit;
}
