import { AnalysisShell } from "@/components/AnalysisShell";
import { TransferStrategyBoard } from "@/components/TransferStrategyBoard";

export default function TransferstrategiPage() {
  return (
    <AnalysisShell
      kicker="Bytter"
      title="Transferstrategi"
      intro="Beste bytte avhenger av hva du prøver å oppnå. Dette er ikke en generell topp-liste."
    >
      <TransferStrategyBoard />
    </AnalysisShell>
  );
}
