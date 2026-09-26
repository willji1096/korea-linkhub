import { seoulNow } from './today';

// The daily 09:00 KST official-link check runs on GitHub Actions in this public repo.
// We read its latest run so "Checked today" is shown only when the check really ran and passed.
const RUNS = 'https://api.github.com/repos/willji1096/korea-linkhub/actions/workflows/check-links.yml/runs?per_page=5&status=completed';

export type LastCheck = { today: boolean; time: string; date: string } | null;

export async function lastLinkCheck(): Promise<LastCheck> {
  try {
    const r = await fetch(RUNS, { next: { revalidate: 1800 }, headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return null;
    const d = (await r.json()) as { workflow_runs: { conclusion: string; updated_at: string }[] };
    const run = d.workflow_runs.find((w) => w.conclusion === 'success');
    if (!run) return null;
    const at = seoulNow(new Date(run.updated_at));
    const hh = String(Math.floor(at.minutes / 60)).padStart(2, '0');
    const mm = String(at.minutes % 60).padStart(2, '0');
    return { today: at.day.iso === seoulNow().day.iso, time: `${hh}:${mm}`, date: at.day.iso };
  } catch {
    return null;
  }
}
