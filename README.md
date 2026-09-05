# himanshu-portfolio

Personal site of Himanshu Prajapati — AI infrastructure engineer working on the LLM inference stack. Built with Next.js 15, Tailwind CSS 4, and MDX.

## Where content lives

Everything visible on the site is data in `src/config/`; components read from there.

| What                          | File                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| Name, bio, hero skills, links | `src/config/Hero.tsx`, `src/config/About.tsx`                 |
| Work experience               | `src/config/Experience.tsx`                                   |
| Projects (cards + case pages) | `src/config/Projects.tsx`                                     |
| Skills chips                  | `src/config/Skills.tsx`                                       |
| Open-source PR list           | `src/config/OpenSource.ts` (fetched live from GitHub)         |
| Blog                          | `src/config/Medium.ts` (synced from the Medium RSS feed)      |
| Books                         | `src/config/Books.tsx` (covers from Open Library by ISBN)     |
| Research papers               | `src/config/Papers.tsx`                                       |
| Codeforces heatmap            | `src/config/Codeforces.ts` (fetched live from Codeforces API) |
| GitHub heatmap                | `src/config/Github.ts`                                        |
| SEO / page metadata           | `src/config/Meta.tsx`                                         |
| Resume PDF                    | `public/resume/`, `src/config/Resume.ts`                      |

Local MDX blog posts can also be dropped into `src/data/blog/`; they get an on-site page at `/blog/<slug>`.

## Environment variables

| Variable                                                              | Used by                         |
| --------------------------------------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_URL`                                                     | canonical URLs and Open Graph   |
| `WAKATIME_API_KEY`                                                    | "coding now" status in the hero |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | now-playing widget              |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`                              | contact form delivery           |
| `GEMINI_API_KEY`                                                      | portfolio chat assistant        |
| `NEXT_PUBLIC_UMAMI_ID`, `NEXT_PUBLIC_UMAMI_SRC`                       | analytics (optional)            |

Check `src/app/api/*/route.ts` for the exact names each route reads.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # must pass before pushing
```

The pre-commit hook runs `lint-staged` through `bunx`; if Bun is not installed, run `npx lint-staged` before committing.
