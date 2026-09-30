import { VERDICT_LABEL } from '../lib/verdict';

const STYLE = {
  clear: 'bg-ok text-white',
  caution: 'bg-tight text-white',
  unsafe: 'bg-blocked text-white',
  unchecked: 'bg-black/10 text-ink',
};

export default function Verdict({ verdict }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-black uppercase tracking-wide ${STYLE[verdict]}`}>
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
