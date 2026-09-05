/*
 * Codeforces Configuration
 *
 * The hero shows a submissions heatmap and rating stats pulled live from
 * the public Codeforces API, so it updates without a redeploy.
 */
export const codeforcesConfig = {
  handle: 'hmnshu_',
  profileUrl: 'https://codeforces.com/profile/hmnshu_',
  apiUrl: 'https://codeforces.com/api',

  title: 'Codeforces Activity',
  subtitle: 'accepted submissions over the past year',

  /** Heatmap colours (Codeforces-style blue) */
  theme: {
    dark: ['#161b22', '#0c2d6b', '#1d4ed8', '#3b82f6', '#93c5fd'],
    light: ['#ebedf0', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a'],
  },

  errorState: {
    title: 'Unable to load Codeforces activity',
    description: 'Check out my profile directly for the latest submissions',
    buttonText: 'View on Codeforces',
  },
};
