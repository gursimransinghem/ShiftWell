/**
 * ShiftWell Premium Service — RevenueCat Integration
 *
 * Manages subscription state, purchases, and entitlement checks
 * via RevenueCat's react-native-purchases SDK.
 */

import Purchases, {
  type PurchasesOfferings,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'premium';

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: Date | null;
  plan: 'free' | 'premium';
}

/**
 * Initialize RevenueCat with the API key from environment variables.
 * Call this once at app startup (e.g., in the root layout).
 */
export async function initialize(): Promise<void> {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

  if (!apiKey) {
    throw new Error(
      'EXPO_PUBLIC_REVENUECAT_API_KEY is not set. Add it to your .env file.',
    );
  }

  Purchases.configure({ apiKey });
}

/**
 * Fetch available subscription offerings from RevenueCat.
 *
 * @returns The current offerings, or null if none are configured
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  const offerings = await Purchases.getOfferings();

  if (!offerings.current) {
    return null;
  }

  return offerings;
}

/**
 * Purchase a subscription package.
 *
 * @param pkg - The RevenueCat package to purchase
 * @returns Updated premium status after purchase
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<PremiumStatus> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return extractPremiumStatus(customerInfo);
}

/**
 * Restore previous purchases (e.g., after reinstall or device switch).
 *
 * @returns Updated premium status after restore
 */
export async function restorePurchases(): Promise<PremiumStatus> {
  const customerInfo = await Purchases.restorePurchases();
  return extractPremiumStatus(customerInfo);
}

/**
 * Check the current premium subscription status.
 *
 * @returns Current premium status
 */
export async function checkPremiumStatus(): Promise<PremiumStatus> {
  const customerInfo = await Purchases.getCustomerInfo();
  return extractPremiumStatus(customerInfo);
}

/**
 * Listen for changes in premium entitlement status.
 * Useful for updating UI in real time when a subscription expires or renews.
 *
 * @param callback - Called whenever entitlement status changes
 * @returns Unsubscribe function to stop listening
 */
export function onPremiumStatusChange(
  callback: (status: PremiumStatus) => void,
): () => void {
  const listener = (customerInfo: CustomerInfo) => {
    callback(extractPremiumStatus(customerInfo));
  };

  Purchases.addCustomerInfoUpdateListener(listener);

  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

/**
 * Extract premium status from RevenueCat CustomerInfo.
 */
function extractPremiumStatus(customerInfo: CustomerInfo): PremiumStatus {
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

  if (!entitlement) {
    return { isPremium: false, expiresAt: null, plan: 'free' };
  }

  const expiresAt = entitlement.expirationDate
    ? new Date(entitlement.expirationDate)
    : null;

  return {
    isPremium: true,
    expiresAt,
    plan: 'premium',
  };
}
