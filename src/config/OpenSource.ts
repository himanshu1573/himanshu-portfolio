/*
 * Open Source Contributions Configuration
 *
 * The landing "Open Source" section fetches pull requests live from the
 * GitHub search API, so new PRs show up without a redeploy.
 */
export const openSourceConfig = {
  /** GitHub handle whose PRs are listed */
  username: 'himanshu1573',
  /** How many PRs to render on the landing page */
  visibleCount: 10,
  /**
   * Repo owners to hide from the list — employer repos and classmates'
   * projects are not open-source contributions.
   */
  excludedOwners: [
    'Xponentium-India',
    'AyushSrivastava0609',
    'gauravpandey0-0-0',
  ],
  /** Exact PR titles (case-insensitive) to hide */
  skipTitles: [] as string[],
};
