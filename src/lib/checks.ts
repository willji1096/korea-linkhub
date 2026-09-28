import { seoulNow } from './site';

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
    return { today: at.date === seoulNow().date, time: at.time, date: at.date };
  } catch {
    return null;
  }
}
