# Analytics & Tracking Guide

This guide explains how to set up and use Google Analytics 4 (GA4) for tracking user analytics, geolocations, and device information in the Kids Learning Challenger app.

## Overview

The app uses **Google Analytics 4 (GA4)**, Google's latest analytics platform, which is perfect for client-side applications deployed on static hosting like GitHub Pages. GA4 doesn't require a backend server and handles all data collection through client-side JavaScript.

## What Data is Tracked?

### 1. **Geolocation Data** 🌍
GA4 automatically collects approximate geographic information based on users' IP addresses:
- Country
- Region/State
- City
- Coordinates (approximate)

**Note**: This is built into GA4 and requires no additional code. The location data is city-level approximate and respects user privacy.

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
GA4 automatically tracks:
- Session duration
- Page engagement time
- Bounce rate
- User retention

## Setup Instructions

### Step 1: Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" (gear icon in the bottom left)
3. Click "Create Property"
4. Fill in your property details:
   - Property name: "Kids Learning Challenger" (or your preferred name)
   - Time zone and currency
5. Click "Next" and complete the setup wizard
6. Select "Web" as your platform
7. Add your website URL (for GitHub Pages: `https://yourusername.github.io/kids-math-challenger/`)
8. Click "Create stream"
9. **Copy your Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 2: Configure Your App

#### For Local Development:

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add your Measurement ID:
   ```
   GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

#### For GitHub Pages Deployment:

Since GitHub Pages serves static files and can't access environment variables at runtime, you need to inject the Measurement ID during the build process:

**Option A: Using GitHub Secrets (Recommended)**

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GA4_MEASUREMENT_ID`
5. Value: Your Measurement ID (e.g., `G-XXXXXXXXXX`)
6. Update your GitHub Actions workflow to inject the variable during build:

```yaml
# .github/workflows/deploy.yml
- name: Build
  env:
    GA4_MEASUREMENT_ID: ${{ secrets.GA4_MEASUREMENT_ID }}
  run: npm run build
```

**Option B: Hardcode in vite.config.ts**

If you don't mind exposing your Measurement ID (it's public anyway when deployed), you can hardcode it:

```typescript
// vite.config.ts
define: {
  'process.env.GA4_MEASUREMENT_ID': JSON.stringify('G-XXXXXXXXXX')
}
```

### Step 3: Verify Installation

1. Build and deploy your app
2. Visit your deployed site
3. Open Chrome DevTools → Network tab
4. Look for requests to `google-analytics.com` or `googletagmanager.com`
5. Go to GA4 → Reports → Realtime to see live users

Alternatively, use the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension to see events in real-time.

## Viewing Your Analytics Data

### In Google Analytics 4:

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
