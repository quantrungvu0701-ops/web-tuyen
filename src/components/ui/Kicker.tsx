export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-accent uppercase">
      <span aria-hidden="true" className="h-px w-6 bg-accent" />
      {children}
    </span>
  );
}
