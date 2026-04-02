export const BackgroundTaskResult = {
  Success: 'SUCCESS',
  Failed: 'FAILED',
  NoData: 'NO_DATA',
} as const;

export const registerTaskAsync = jest.fn().mockResolvedValue(undefined);
export const unregisterTaskAsync = jest.fn().mockResolvedValue(undefined);
export const getStatusAsync = jest.fn().mockResolvedValue({ status: 'available' });
