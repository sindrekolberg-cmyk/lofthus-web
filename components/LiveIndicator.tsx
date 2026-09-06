export function LiveIndicator({
  gw,
  live,
  tone = "ink",
}: {
  gw: number;
  live: boolean;
  tone?: "ink" | "paper";
}) {
  if (!live || !gw) return null;
  const color = tone === "paper" ? "text-paper" : "text-live";
  const dot = tone === "paper" ? "bg-paper" : "bg-live";
  return (
    <p className={`inline-flex items-center gap-2 font-condensed text-[12px] tracking-[0.16em] uppercase ${color}`}>
      <span className={`live-dot h-2 w-2 rounded-full ${dot}`} aria-hidden />
      <span>Live · Runde {gw} pågår</span>
    </p>
  );
}
