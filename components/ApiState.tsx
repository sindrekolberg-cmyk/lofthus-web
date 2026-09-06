type Props = {
  title?: string;
  message?: string;
};

export function ApiState({
  title = "Lofthus venter på data",
  message = "Kunne ikke hente live-data akkurat nå. Prøv igjen om litt.",
}: Props) {
  return (
    <div className="border border-rule bg-[#e7e1d4] px-5 py-6">
      <p className="font-condensed text-[11px] tracking-[0.2em] text-live uppercase">
        Midlertidig
      </p>
      <h2 className="mt-2 font-serif text-xl leading-tight">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}

export function LoadingBlock({ label = "Laster…" }: { label?: string }) {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-[1400px] animate-pulse space-y-3">
        <div className="h-3 w-28 bg-rule" />
        <div className="h-6 w-3/4 max-w-md bg-rule" />
        <div className="h-16 w-full bg-rule/70" />
        <p className="font-condensed text-[11px] tracking-[0.18em] text-muted uppercase">{label}</p>
      </div>
    </div>
  );
}
