import { supabase } from '@/integrations/supabase/client';

interface NavigationLog {
  page_path: string;
  page_title?: string;
  referrer?: string;
  time_on_page?: number;
  browser_info?: any;
}

interface ProductInteraction {
  product_sku: string;
  interaction_type: 'view' | 'volume_change' | 'tier_select' | 'add_to_cart';
  interaction_data?: any;
}

interface CheckoutFunnelLog {
  checkout_step: 'volume_selection' | 'logistics' | 'payment' | 'confirmation';
  action_type: 'enter_step' | 'exit_step' | 'abandon' | 'complete';
  step_data?: any;
}

interface VolumeAnalysisLog {
  product_sku: string;
  initial_volume: number;
  final_volume: number;
  initial_price: number;
  final_price: number;
  savings_amount: number;
  savings_percentage: number;
  time_spent?: number;
  reached_banda_menor?: boolean;
}

class AnalyticsService {
  private sessionId: string;
  private pageStartTime: number = Date.now();

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
    
    // Track page unload to log time on page
    window.addEventListener('beforeunload', () => {
      this.logTimeOnCurrentPage();
    });
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private currentUser: any = null;

  private async getCurrentUser() {
    try {
      // Try to get cached user first
      if (this.currentUser) {
        return this.currentUser;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      this.currentUser = user;
      console.log('[Analytics] User captured:', user?.id ? 'Logged in' : 'Anonymous');
      return user;
    } catch (error) {
      console.error('[Analytics] Error getting user:', error);
      return null;
    }
  }

  // Method to update current user from auth context
  public updateCurrentUser(user: any) {
    this.currentUser = user;
    console.log('[Analytics] User updated:', user?.id ? `User ID: ${user.id}` : 'Anonymous');
  }

  private getBrowserInfo() {
    return {
      user_agent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  async logNavigation(navigationData: NavigationLog) {
    try {
      const user = await this.getCurrentUser();
      
      const logData = {
        user_id: user?.id || null,
        session_id: this.sessionId,
        ...navigationData,
        browser_info: this.getBrowserInfo()
      };

      console.log('[Analytics] Logging navigation:', {
        page: navigationData.page_path,
        user_id: user?.id || 'anonymous',
        session_id: this.sessionId
      });
      
      await supabase.from('user_navigation_logs').insert(logData);

      // Reset page start time for next page
      this.pageStartTime = Date.now();
    } catch (error) {
      console.error('[Analytics] Error logging navigation:', error);
    }
  }

  async logProductInteraction(interactionData: ProductInteraction) {
    try {
      const user = await this.getCurrentUser();
      
      await supabase.from('product_interactions').insert({
        user_id: user?.id || null,
        session_id: this.sessionId,
        ...interactionData
      });
    } catch (error) {
      console.error('Error logging product interaction:', error);
    }
  }

  async logCheckoutFunnel(funnelData: CheckoutFunnelLog) {
    try {
      const user = await this.getCurrentUser();
      
      await supabase.from('checkout_funnel_logs').insert({
        user_id: user?.id || null,
        session_id: this.sessionId,
        ...funnelData
      });
    } catch (error) {
      console.error('Error logging checkout funnel:', error);
    }
  }

  async logVolumeAnalysis(analysisData: VolumeAnalysisLog) {
    try {
      const user = await this.getCurrentUser();
      
      await supabase.from('volume_analysis_logs').insert({
        user_id: user?.id || null,
        session_id: this.sessionId,
        ...analysisData
      });
    } catch (error) {
      console.error('Error logging volume analysis:', error);
    }
  }

  // Helper method to log time spent on current page
  private async logTimeOnCurrentPage() {
    const timeOnPage = Math.floor((Date.now() - this.pageStartTime) / 1000);
    
    // Update the latest navigation log with time_on_page
    try {
      const user = await this.getCurrentUser();
      const { data: latestLog } = await supabase
        .from('user_navigation_logs')
        .select('id')
        .eq('session_id', this.sessionId)
        .eq('user_id', user?.id || null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestLog) {
        await supabase
          .from('user_navigation_logs')
          .update({ time_on_page: timeOnPage })
          .eq('id', latestLog.id);
      }
    } catch (error) {
      console.error('Error updating time on page:', error);
    }
  }

  // Page tracking helpers
  trackPageView(path: string, title?: string, referrer?: string) {
    // Only track page views for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping page view tracking - user not authenticated');
      return;
    }
    
    this.logNavigation({
      page_path: path,
      page_title: title || document.title,
      referrer: referrer || document.referrer
    });
  }

  // Product interaction helpers
  trackProductView(productSku: string) {
    // Only track product views for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping product view tracking - user not authenticated');
      return;
    }
    
    this.logProductInteraction({
      product_sku: productSku,
      interaction_type: 'view'
    });
  }

  trackVolumeChange(productSku: string, volume: number, price: number) {
    // Only track volume changes for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping volume change tracking - user not authenticated');
      return;
    }
    
    this.logProductInteraction({
      product_sku: productSku,
      interaction_type: 'volume_change',
      interaction_data: { volume, price, timestamp: Date.now() }
    });
  }

  trackTierSelect(productSku: string, tier: string, price: number) {
    // Only track tier selection for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping tier selection tracking - user not authenticated');
      return;
    }
    
    this.logProductInteraction({
      product_sku: productSku,
      interaction_type: 'tier_select',
      interaction_data: { tier, price, timestamp: Date.now() }
    });
  }

  trackAddToCart(productSku: string, volume: number, price: number, total: number) {
    // Only track add to cart for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping add to cart tracking - user not authenticated');
      return;
    }
    
    this.logProductInteraction({
      product_sku: productSku,
      interaction_type: 'add_to_cart',
      interaction_data: { volume, price, total, timestamp: Date.now() }
    });
  }

  // Checkout funnel helpers
  trackCheckoutStep(step: CheckoutFunnelLog['checkout_step'], action: CheckoutFunnelLog['action_type'], data?: any) {
    // Only track checkout steps for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping checkout step tracking - user not authenticated');
      return;
    }
    
    this.logCheckoutFunnel({
      checkout_step: step,
      action_type: action,
      step_data: data
    });
  }

  // Volume analysis tracking
  trackVolumeOptimization(data: VolumeAnalysisLog) {
    // Only track volume optimization for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping volume optimization tracking - user not authenticated');
      return;
    }
    
    this.logVolumeAnalysis(data);
  }

  // Utility method to track user journey completion
  async trackConversion(conversionType: 'purchase' | 'quote_request' | 'lead', value?: number) {
    // Only track conversions for authenticated users
    if (!this.currentUser?.id) {
      console.log('[Analytics] Skipping conversion tracking - user not authenticated');
      return;
    }
    
    try {
      const user = await this.getCurrentUser();
      
      // This could be a separate table for conversions
      console.log('Conversion tracked:', { 
        type: conversionType, 
        value, 
        user_id: user?.id,
        session_id: this.sessionId 
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();