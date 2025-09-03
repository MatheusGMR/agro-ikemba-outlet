// Google Ads conversion tracking utility

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Reports a conversion event to Google Ads
 * @param conversionLabel - The conversion label (e.g., 'lersCN3M6JMbELfc3aZB')
 * @param value - Optional conversion value in BRL
 * @param url - Optional URL to redirect to after conversion is tracked
 */
export function gtagReportConversion(conversionLabel: string, value?: number, url?: string) {
  const callback = function () {
    if (typeof(url) != 'undefined') {
      window.location.href = url;
    }
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `AW-17529531959/${conversionLabel}`,
      'value': value || 200.0,
      'currency': 'BRL',
      'event_callback': callback
    });
  }

  return false;
}

/**
 * Reports the Sign-up conversion event
 * @param value - Optional conversion value in BRL
 * @param url - Optional URL to redirect to after conversion is tracked
 */
export function reportSignupConversion(value?: number, url?: string) {
  return gtagReportConversion('lersCN3M6JMbELfc3aZB', value, url);
}