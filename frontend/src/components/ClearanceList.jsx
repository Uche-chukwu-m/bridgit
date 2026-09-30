import { ExternalLink } from 'lucide-react';
import ClearanceSign from './ClearanceSign';
import { formatDistance, formatSpare } from '../lib/units';

const STATUS = {
  ok: { text: 'to spare', className: 'text-ok' },
  tight: { text: 'to spare, under your margin', className: 'text-tight' },
  blocked: { text: 'too tall', className: 'text-blocked' },
};

export default function ClearanceList({ clearances }) {
  if (!clearances.length) {
    return <p className="text-black/60">No height restrictions are mapped along this route.</p>;
  }
  return (
    <ol className="divide-y divide-black/10">
      {clearances.map((c) => {
        const status = STATUS[c.status];
        return (
          <li key={`${c.lat},${c.lon}`} className="flex items-center gap-4 py-3">
            <ClearanceSign inches={c.clearance_in} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{c.name || 'Unnamed road'}</p>
              <p className="text-sm text-black/60">
                {formatDistance(c.along_m)} in ·{' '}
                <span className={`font-bold ${status.className}`}>
                  {c.status === 'blocked' ? formatSpare(-c.spare_in) : formatSpare(c.spare_in)} {status.text}
                </span>
              </p>
            </div>
            <a href={c.osm_url} target="_blank" rel="noreferrer" className="text-black/40 hover:text-ink" title="See it on OpenStreetMap">
              <ExternalLink className="h-4 w-4" />
            </a>
          </li>
        );
      })}
    </ol>
  );
}
