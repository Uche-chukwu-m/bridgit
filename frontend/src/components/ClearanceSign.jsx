import { splitHeight } from '../lib/units';

// Drawn like the yellow low-clearance signs drivers already know.
const SIZES = {
  sm: 'min-w-[4.5rem] px-2 py-1 text-base',
  md: 'min-w-[6rem] px-3 py-2 text-2xl',
  lg: 'min-w-[9rem] px-4 py-3 text-5xl',
};

export default function ClearanceSign({ inches, size = 'md' }) {
  const { feet, inches: rest } = splitHeight(inches);
  return (
    <div
      className={`inline-flex flex-col items-center rounded-md border-[3px] border-ink bg-sign font-black leading-none text-ink shadow-[inset_0_0_0_2px_#ffcc00,inset_0_0_0_4px_#15171a] ${SIZES[size]}`}
      aria-label={`Clearance ${feet} feet ${rest} inches`}
    >
      <span aria-hidden className="text-[0.55em]">▲</span>
      <span className="whitespace-nowrap py-0.5">
        {feet}′-{rest}″
      </span>
      <span aria-hidden className="text-[0.55em]">▼</span>
    </div>
  );
}
