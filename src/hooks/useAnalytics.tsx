import { useEffect, useRef } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { useAuth } from '@/hooks/useAuth';

interface UsePageAnalyticsProps {
  pagePath: string;
  pageTitle?: string;
  enableTimeTracking?: boolean;
}

/**
 * Hook to track page analytics including page views and time on page
 */
export function usePageAnalytics({ 
  pagePath, 
  pageTitle, 
  enableTimeTracking = true 
}: UsePageAnalyticsProps) {
  const startTimeRef = useRef<number>(Date.now());
  const { user } = useAuth();

  useEffect(() => {
    // Update current user in analytics service
    analyticsService.updateCurrentUser(user);
    
    // Track page view
    analyticsService.trackPageView(pagePath, pageTitle);
    startTimeRef.current = Date.now();

    // Track time on page when component unmounts
    return () => {
      if (enableTimeTracking) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 2) { // Only track if user spent more than 2 seconds
          analyticsService.logNavigation({
            page_path: pagePath,
            page_title: pageTitle,
            time_on_page: timeSpent
          });
        }
      }
    };
  }, [pagePath, pageTitle, enableTimeTracking, user]);
}

/**
 * Hook to track product interactions
 */
export function useProductAnalytics(productSku?: string) {
  const { user } = useAuth();

  useEffect(() => {
    // Update analytics service with current user whenever it changes
    analyticsService.updateCurrentUser(user);
  }, [user]);

  const trackVolumeChange = (volume: number, price: number) => {
    if (productSku) {
      analyticsService.trackVolumeChange(productSku, volume, price);
    }
  };

  const trackTierSelection = (tier: string, price: number) => {
    if (productSku) {
      analyticsService.trackTierSelect(productSku, tier, price);
    }
  };

  const trackAddToCart = (volume: number, price: number, total: number) => {
    if (productSku) {
      analyticsService.trackAddToCart(productSku, volume, price, total);
    }
  };

  const trackProductView = () => {
    if (productSku) {
      analyticsService.trackProductView(productSku);
    }
  };

  return {
    trackVolumeChange,
    trackTierSelection,
    trackAddToCart,
    trackProductView
  };
}

/**
 * Hook to track checkout funnel analytics
 */
export function useCheckoutAnalytics() {
  const { user } = useAuth();

  useEffect(() => {
    // Update analytics service with current user
    analyticsService.updateCurrentUser(user);
  }, [user]);

  const trackCheckoutStep = (
    step: 'volume_selection' | 'logistics' | 'payment' | 'confirmation',
    action: 'enter_step' | 'exit_step' | 'abandon' | 'complete',
    data?: any
  ) => {
    analyticsService.trackCheckoutStep(step, action, data);
  };

  const trackCheckoutAbandonment = (step: string, reason?: string) => {
    analyticsService.trackCheckoutStep(
      step as any, 
      'abandon', 
      { reason, timestamp: Date.now() }
    );
  };

  const trackConversion = (type: 'purchase' | 'quote_request' | 'lead', value?: number) => {
    analyticsService.trackConversion(type, value);
  };

  return {
    trackCheckoutStep,
    trackCheckoutAbandonment,
    trackConversion
  };
}

/**
 * Hook to track volume optimization analytics with session management and cooldowns
 */
export function useVolumeAnalytics(productSku?: string) {
  const startVolumeRef = useRef<number | null>(null);
  const startPriceRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastTrackingRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);

  const startVolumeSession = (initialVolume: number, initialPrice: number) => {
    startVolumeRef.current = initialVolume;
    startPriceRef.current = initialPrice;
    startTimeRef.current = Date.now();
    sessionIdRef.current = `${productSku}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const trackVolumeOptimization = (
    finalVolume: number, 
    finalPrice: number, 
    reachedBandaMenor: boolean = false
  ) => {
    if (!productSku || !startVolumeRef.current || !startPriceRef.current) return;

    const now = Date.now();
    const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
    
    // Cooldown check: minimum 30 seconds between trackings for the same product
    if (now - lastTrackingRef.current < 30000) {
      return;
    }

    // Quality validations
    const volumeChange = Math.abs(finalVolume - startVolumeRef.current);
    const priceChange = Math.abs(finalPrice - startPriceRef.current);
    
    // Only track meaningful interactions
    if (timeSpent < 3 || volumeChange < 50) {
      return;
    }

    const savingsAmount = (startPriceRef.current - finalPrice) * finalVolume;
    const savingsPercentage = startPriceRef.current > 0 
      ? ((startPriceRef.current - finalPrice) / startPriceRef.current) * 100 
      : 0;

    analyticsService.trackVolumeOptimization({
      product_sku: productSku,
      initial_volume: startVolumeRef.current,
      final_volume: finalVolume,
      initial_price: startPriceRef.current,
      final_price: finalPrice,
      savings_amount: savingsAmount,
      savings_percentage: savingsPercentage,
      time_spent: timeSpent,
      reached_banda_menor: reachedBandaMenor
    });

    // Update tracking timestamp and reset session for next interaction
    lastTrackingRef.current = now;
    startVolumeRef.current = finalVolume;
    startPriceRef.current = finalPrice;
    startTimeRef.current = now;
  };

  return {
    startVolumeSession,
    trackVolumeOptimization
  };
}