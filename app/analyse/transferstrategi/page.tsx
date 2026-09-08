import { AnalysisShell } from "@/components/AnalysisShell";
import { TransferStrategyBoard } from "@/components/TransferStrategyBoard";

export default function TransferstrategiPage() {
  return (
    <AnalysisShell
      kicker="Bytter"
      title="Transferstrategi"
      intro="Enkeltbytte eller wildcard. Beste trekk avhenger av hva du prøver å oppnå — dette er ikke en generell topp-liste."
    >
      <TransferStrategyBoard />
    </AnalysisShell>
  );
}
