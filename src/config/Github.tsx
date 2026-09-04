/*
 * GitHub Contribution Configuration
 *
 * This file contains the configuration for the GitHub contribution graph.
 * Update the username to match your GitHub profile.
 */

export const githubConfig = {
  username: 'himanshu1573',
  // Deno Deploy Classic sunset Jul 2026 — use jogruber's maintained API
  apiUrl: 'https://github-contributions-api.jogruber.de/v4',


  // Display settings
  title: 'GitHub Activity',
  subtitle: 'coding journey over the past year',

  // Chart settings
  blockSize: 11,
  blockMargin: 3,
  fontSize: 12,
  maxLevel: 4,

  // Month labels
  months: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],

  // Weekday labels (empty for weekends, M for Monday, etc.)
  weekdays: ['', 'M', '', 'W', '', 'F', ''],

  // Total count label template
  totalCountLabel: '{{count}} contributions in the last year',

  // Theme configuration for dark and light modes
  theme: {
    dark: [
      '#161b22',  // Level 0 — GitHub dark bg
      '#0e4429',  // Level 1 — dark green
      '#006d32',  // Level 2 — medium green
      '#26a641',  // Level 3 — bright green
      '#39d353',  // Level 4 — vivid green
    ],
    light: [
      '#ebedf0',  // Level 0 — GitHub light empty
      '#9be9a8',  // Level 1 — light green
      '#40c463',  // Level 2 — medium green
      '#30a14e',  // Level 3 — strong green
      '#216e39',  // Level 4 — dark green
    ],
  },


  // Error state configuration
  errorState: {
    title: 'Unable to load GitHub contributions',
    description: 'Check out my profile directly for the latest activity',
    buttonText: 'View on GitHub',
  },

  // Loading state configuration
  loadingState: {
    title: 'Loading contributions...',
    description: 'Fetching your GitHub activity data',
  },
};
