/**
 * Google Tag Manager (GTM) integration for tracking user analytics
 * This provides geolocation tracking (via GA4 in GTM) and device information
 * GTM allows managing multiple tracking tags without code changes
 */

interface EventParams {
  [key: string]: string | number | boolean;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

class Analytics {
  private containerId: string | null = null;
  private initialized = false;

  /**
   * Initialize Google Tag Manager
   * @param containerId - Your GTM Container ID (e.g., GTM-XXXXXXX)
   */
  initialize(containerId: string): void {
    if (this.initialized) {
      console.warn('Analytics already initialized');
      return;
    }

    if (!containerId || !containerId.startsWith('GTM-')) {
      console.warn('Invalid GTM Container ID. Analytics will not be initialized.');
      return;
    }

    this.containerId = containerId;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Load the GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
    document.head.appendChild(script);

    this.initialized = true;
    console.log('Google Tag Manager initialized');

    // Track initial device information
    this.trackDeviceInfo();
  }

  /**
   * Track custom events via GTM dataLayer
   * @param eventName - Name of the event
   * @param params - Event parameters
   */
  trackEvent(eventName: string, params?: EventParams): void {
    if (!this.initialized || !window.dataLayer) {
      return;
    }

    window.dataLayer.push({
      event: eventName,
      ...params
    });
  }

  /**
   * Track page views (useful for single-page applications)
   * @param path - Page path
   * @param title - Page title
   */
  trackPageView(path: string, title?: string): void {
    if (!this.initialized || !window.dataLayer) {
      return;
    }

    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: title || document.title,
    });
  }

  /**
   * Track device information as a custom event
   * This includes browser, OS, screen size, etc.
   */
  private trackDeviceInfo(): void {
    const deviceInfo = {
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      device_memory: (navigator as any).deviceMemory || 'unknown',
      connection_type: (navigator as any).connection?.effectiveType || 'unknown',
    };

    this.trackEvent('device_info', deviceInfo);
  }

  /**
   * Track quiz start event
   */
  trackQuizStart(quizType: string, numQuestions: number): void {
    this.trackEvent('quiz_start', {
      quiz_type: quizType,
      num_questions: numQuestions,
    });
  }

  /**
   * Track quiz completion event
   */
  trackQuizComplete(quizType: string, score: number, total: number, timeSeconds: number): void {
    this.trackEvent('quiz_complete', {
      quiz_type: quizType,
      score: score,
      total: total,
      time_seconds: timeSeconds,
      accuracy: Math.round((score / total) * 100),
    });
  }

  /**
   * Track writing challenge event
   */
  trackWritingChallenge(schoolYear: number): void {
    this.trackEvent('writing_challenge_start', {
      school_year: schoolYear,
    });
  }

  /**
   * Track writing challenge completion
   */
  trackWritingChallengeComplete(schoolYear: number, score: number): void {
    this.trackEvent('writing_challenge_complete', {
      school_year: schoolYear,
      score: score,
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();
