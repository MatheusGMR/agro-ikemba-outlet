/**
 * Domain monitoring utility to track and handle domain-related issues
 * Helps identify when users access the site without www and redirects fail
 */

export interface DomainAccessLog {
  timestamp: string;
  domain: string;
  url: string;
  userAgent: string;
  referrer: string;
}

export class DomainMonitor {
  private static instance: DomainMonitor;
  private logs: DomainAccessLog[] = [];

  static getInstance(): DomainMonitor {
    if (!DomainMonitor.instance) {
      DomainMonitor.instance = new DomainMonitor();
    }
    return DomainMonitor.instance;
  }

  /**
   * Log domain access for monitoring purposes
   */
  logAccess(): void {
    const log: DomainAccessLog = {
      timestamp: new Date().toISOString(),
      domain: window.location.hostname,
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    this.logs.push(log);
    
    // Keep only last 50 logs to prevent memory issues
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }

    // Send to analytics if available
    this.sendToAnalytics(log);
  }

  /**
   * Check if current domain needs redirect to www
   */
  checkDomainRedirect(): boolean {
    const currentHost = window.location.hostname;
    const currentUrl = window.location.href;

    if (currentHost === 'agroikemba.com.br' && !currentUrl.includes('www.')) {
      console.warn('[Domain Monitor] Non-www access detected, should redirect to www version');
      return true;
    }

    return false;
  }

  /**
   * Force redirect to www version
   */
  forceWwwRedirect(): void {
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace('://agroikemba.com.br', '://www.agroikemba.com.br');
    
    console.log('[Domain Monitor] Forcing redirect to:', newUrl);
    window.location.replace(newUrl);
  }

  /**
   * Get recent domain access logs
   */
  getLogs(): DomainAccessLog[] {
    return [...this.logs];
  }

  /**
   * Send domain access data to analytics
   */
  private sendToAnalytics(log: DomainAccessLog): void {
    try {
      // Send to Google Analytics if available
      const gtag = (window as any).gtag;
      if (typeof gtag !== 'undefined') {
        gtag('event', 'domain_access', {
          'custom_map': {'custom_parameter_1': 'domain_monitor'},
          'domain': log.domain,
          'page_location': log.url,
          'is_www': log.domain.includes('www'),
          'needs_redirect': log.domain === 'agroikemba.com.br'
        });
      }

      // Log to console for debugging
      console.log('[Domain Monitor]', {
        domain: log.domain,
        needsRedirect: log.domain === 'agroikemba.com.br',
        timestamp: log.timestamp
      });
    } catch (error) {
      console.error('[Domain Monitor] Analytics error:', error);
    }
  }

  /**
   * Initialize domain monitoring
   */
  init(): void {
    // Log initial access
    this.logAccess();

    // Check for redirect needs
    if (this.checkDomainRedirect()) {
      // Add a small delay to ensure page has loaded
      setTimeout(() => {
        this.forceWwwRedirect();
      }, 100);
    }

    // Listen for navigation changes (for SPA)
    window.addEventListener('popstate', () => {
      this.logAccess();
    });
  }
}

// Auto-initialize when imported
export const domainMonitor = DomainMonitor.getInstance();
