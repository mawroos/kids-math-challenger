# Analytics & Tracking Guide

This guide explains how to set up and use Google Tag Manager (GTM) for tracking user analytics, geolocations, and device information in the Kids Learning Challenger app.

## Overview

The app uses **Google Tag Manager (GTM)**, Google's tag management system, which is perfect for client-side applications deployed on static hosting like GitHub Pages. GTM provides a flexible container for managing multiple tracking tags (like Google Analytics 4, Facebook Pixel, etc.) without requiring code changes. GTM doesn't require a backend server and handles all data collection through client-side JavaScript.

## What Data is Tracked?

### 1. **Geolocation Data** 🌍
When you configure Google Analytics 4 within GTM, it automatically collects approximate geographic information based on users' IP addresses:
- Country
- Region/State
- City
- Coordinates (approximate)

**Note**: This is built into Google Analytics and requires no additional code. The location data is city-level approximate and respects user privacy.

### 2. **Device Information** 💻
The app tracks detailed device information:
- Browser type and version
- Operating system
- Screen resolution
- Viewport size
- Device memory (if available)
- Network connection type
- Language preference
- Platform information

### 3. **User Interactions** 📊
Custom events track app usage:
- **Quiz Events**:
  - Quiz starts (type, number of questions)
  - Quiz completions (score, total, time, accuracy)
- **Writing Challenge Events**:
  - Challenge starts (school year)
  - Challenge completions (score)
- **Page Views**: Automatic tracking of navigation

### 4. **Session Data** ⏱️
Google Analytics (when configured in GTM) automatically tracks:
- Session duration
- Page engagement time
- Bounce rate
- User retention

## Setup Instructions

### Step 1: Create a Google Tag Manager Container

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Click "Create Account" (or use an existing account)
3. Fill in your account details:
   - Account name: "Kids Learning Challenger" (or your preferred name)
   - Country selection
4. Set up your container:
   - Container name: "Kids Learning Challenger Web"
   - Target platform: Select "Web"
5. Click "Create"
6. **Copy your Container ID** (format: `GTM-XXXXXXX`) - you'll see this in the GTM code snippet
7. (Optional but recommended) Set up Google Analytics 4 tag within GTM:
   - Click "Add a new tag"
   - Choose "Google Analytics: GA4 Configuration"
   - Enter your GA4 Measurement ID if you have one
   - Set trigger to "All Pages"

### Step 2: Configure Your App

#### For Local Development:

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add your GTM Container ID:
   ```
   GTM_CONTAINER_ID=GTM-XXXXXXX
   ```

#### For GitHub Pages Deployment:

Since GitHub Pages serves static files and can't access environment variables at runtime, you need to inject the Container ID during the build process:

**Option A: Using GitHub Secrets (Recommended)**

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GTM_CONTAINER_ID`
5. Value: Your Container ID (e.g., `GTM-XXXXXXX`)
6. Update your GitHub Actions workflow to inject the variable during build:

```yaml
# .github/workflows/deploy.yml
- name: Build
  env:
    GTM_CONTAINER_ID: ${{ secrets.GTM_CONTAINER_ID }}
  run: npm run build
```

**Option B: Hardcode in vite.config.ts**

If you don't mind exposing your Container ID (it's public anyway when deployed), you can hardcode it:

```typescript
// vite.config.ts
define: {
  'process.env.GTM_CONTAINER_ID': JSON.stringify('GTM-XXXXXXX')
}
```

### Step 3: Verify Installation

1. Build and deploy your app
2. Visit your deployed site
3. Open Chrome DevTools → Network tab
4. Look for requests to `googletagmanager.com/gtm.js`
5. Go to GTM → Preview mode to see events firing in real-time
6. If you configured GA4 in GTM, go to GA4 → Reports → Realtime to see live users

Alternatively, use the GTM Preview mode or [Google Tag Assistant](https://tagassistant.google.com/) Chrome extension to see events in real-time.

## Viewing Your Analytics Data

### In Google Tag Manager:

1. **Preview Mode**: Test tags before publishing
   - Click "Preview" in GTM
   - Enter your website URL
   - See which tags fire on which pages

2. **Debug Console**: See data layer events
   - In Preview mode, see all dataLayer pushes
   - Verify custom events are being sent correctly

### In Google Analytics 4 (if configured in GTM):

1. **Real-time Reports**: See active users right now
   - Navigate to Reports → Realtime
   - View current users by location, device, and page

2. **Geographic Data**:
   - Reports → User attributes → Demographics → Geographic
   - See users by country, region, and city
   - View interactive maps

3. **Device Data**:
   - Reports → Tech → Tech details
   - Browser, OS, screen resolution breakdown

4. **Custom Events**:
   - Reports → Engagement → Events
   - View all tracked events (quiz_start, quiz_complete, etc.)
   - Click on an event to see detailed metrics

5. **User Behavior**:
   - Reports → Engagement → Pages and screens
   - See which parts of your app users engage with most

## Custom Events Reference

### Quiz Events

**quiz_start**
- `quiz_type`: Type of quiz (e.g., "math")
- `num_questions`: Number of questions in the quiz

**quiz_complete**
- `quiz_type`: Type of quiz (e.g., "math")
- `score`: Number of correct answers
- `total`: Total number of questions
- `time_seconds`: Time taken in seconds
- `accuracy`: Percentage score (0-100)

### Writing Challenge Events

**writing_challenge_start**
- `school_year`: Student's school year (1-12)

**writing_challenge_complete**
- `school_year`: Student's school year (1-12)
- `score`: AI-generated score (1-10)

### Device Information Event

**device_info** (sent once per session)
- `screen_width`: Screen width in pixels
- `screen_height`: Screen height in pixels
- `viewport_width`: Browser viewport width
- `viewport_height`: Browser viewport height
- `user_agent`: Browser user agent string
- `language`: Browser language preference
- `platform`: Operating system platform
- `device_memory`: Available device memory (if available)
- `connection_type`: Network connection type (if available)

## Privacy Considerations

### Data Collection
- All data is anonymous and aggregated by Google Analytics
- No personally identifiable information (PII) is collected
- IP addresses are anonymized by default in GA4
- Geolocation is approximate (city-level)

### User Privacy
- Users can opt out of tracking using:
  - Browser "Do Not Track" settings
  - Privacy extensions (e.g., uBlock Origin, Privacy Badger)
  - Browser settings to block third-party cookies

### GDPR Compliance
If your users are in the EU, consider:
1. Adding a cookie consent banner
2. Implementing opt-in tracking
3. Adding a privacy policy
4. Enabling IP anonymization (already default in GA4)

## Troubleshooting

### Analytics Not Working?

1. **Check the Measurement ID format**: Must start with `G-`
2. **Check browser console**: Look for initialization message "Google Analytics 4 initialized"
3. **Verify environment variable**: Make sure `GA4_MEASUREMENT_ID` is set correctly
4. **Check ad blockers**: Disable them temporarily to test
5. **Use GA Debugger**: Install the Chrome extension for detailed debugging

### No Geographic Data?

- Geographic data takes 24-48 hours to appear in GA4
- Check Reports → Realtime for immediate location data
- Ensure you have enough traffic (GA4 might not show data for very low traffic)

### Custom Events Not Appearing?

1. Check that events are being fired (use browser DevTools → Network)
2. Wait 24-48 hours for events to appear in standard reports
3. Check Reports → Realtime → Event count for immediate feedback
4. Create custom reports to view specific events

## Advanced: Creating Custom Reports

To track specific metrics:

1. Go to Explore → Create new exploration
2. Choose "Blank" template
3. Add dimensions (e.g., City, Device category)
4. Add metrics (e.g., Event count, Active users)
5. Configure visualizations (tables, charts, maps)
6. Save your exploration

### Example: Quiz Performance by Location

1. Dimensions: City, Country
2. Metrics: quiz_complete (event count), Average accuracy
3. Visualization: Table or Map

## Cost

Google Analytics 4 is **free** for standard usage with these limits:
- 10 million events per month per property
- 25 user properties per property
- 50 custom parameters per event

For most educational apps, you'll never hit these limits.

## Additional Resources

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [GA4 Academy](https://analytics.google.com/analytics/academy/)
- [Privacy Best Practices](https://support.google.com/analytics/answer/9019185)

## Support

If you have questions or issues with analytics setup, please open an issue on GitHub or refer to the [Google Analytics Help Center](https://support.google.com/analytics).
