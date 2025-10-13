/**
 * Google Analytics 4 (GA4) integration for tracking user analytics
 * This provides geolocation tracking (via GA4's built-in features) and device information
 */

interface GtagConfig {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  send_page_view?: boolean;
}

interface EventParams {
  [key: string]: string | number | boolean;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: GtagConfig | EventParams
    ) => void;
    dataLayer?: unknown[];
  }
}

class Analytics {
  private measurementId: string | null = null;
  private initialized = false;

  /**
   * Initialize Google Analytics 4
   * @param measurementId - Your GA4 Measurement ID (e.g., G-XXXXXXXXXX)
   */
  initialize(measurementId: string): void {
    if (this.initialized) {
      console.warn('Analytics already initialized');
      return;
    }

    if (!measurementId || !measurementId.startsWith('G-')) {
      console.warn('Invalid GA4 Measurement ID. Analytics will not be initialized.');
      return;
    }

    this.measurementId = measurementId;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };

    // Load the GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize GA4
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true, // Automatically track page views
    });

    this.initialized = true;
    console.log('Google Analytics 4 initialized');

    // Track initial device information
    this.trackDeviceInfo();
  }

  /**
   * Track custom events
   * @param eventName - Name of the event
   * @param params - Event parameters
   */
  trackEvent(eventName: string, params?: EventParams): void {
    if (!this.initialized || !window.gtag) {
      return;
    }

    window.gtag('event', eventName, params);
  }

  /**
   * Track page views (useful for single-page applications)
   * @param path - Page path
   * @param title - Page title
   */
  trackPageView(path: string, title?: string): void {
    if (!this.initialized || !window.gtag || !this.measurementId) {
      return;
    }

    window.gtag('config', this.measurementId, {
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
