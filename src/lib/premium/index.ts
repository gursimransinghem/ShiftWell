export {
  initialize,
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkPremiumStatus,
  onPremiumStatusChange,
} from './premium-service';

export type { PremiumStatus } from './premium-service';

export {
  isFeatureAvailable,
  getLockedFeatures,
  getFeatureDescription,
} from './entitlements';

export type { Feature } from './entitlements';
