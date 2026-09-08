import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { api } from "@/lib/api";
import { colors, radius, space } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type {
  AnalysisPlayer,
  ManagerOption,
  RivalPayload,
  TransferStrategyPayload,
} from "@/lib/types";

type ToolId = "rivalradar" | "transferstrategi" | "kaptein" | "ownership" | "differensialer" | "chips";

const META: Record<ToolId, { kicker: string; title: string; intro: string }> = {
  rivalradar: { kicker: "Hvem jakter deg", title: "Rivalradar", intro: "Velg to managere og se hvem som faktisk tjener på forskjellene." },
  transferstrategi: { kicker: "Neste trekk", title: "Transferstrategi", intro: "Råd som endrer seg etter hvor hardt du vil angripe ligaen." },
  kaptein: { kicker: "Armbindet", title: "Kaptein", intro: "Hvem bar C-en, hvor mange fulgte etter og hva valget ga." },
  ownership: { kicker: "Feltet", title: "Eierskap", intro: "Hvem alle har, hvem få har og hvor stort eierskapet faktisk er i Lofthus." },
  differensialer: { kicker: "Skjevt", title: "Differensialer", intro: "Lavt eierskap, faktisk avkastning og potensial til å flytte deg." },
  chips: { kicker: "Timing", title: "Sjetonger", intro: "Wildcard, Free Hit, Bench Boost og Triple Captain i ligaen." },
};

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ManagerChooser({ title, managers, value, onChange, exclude = 0 }: { title: string; managers: ManagerOption[]; value: number; onChange: (entry: number) => void; exclude?: number }) {
  const rows = managers.filter((m) => m.entry !== exclude);
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {rows.map((m) => <Chip key={m.entry} label={`${m.manager} · ${m.rank || "–"}`} active={value === m.entry} onPress={() => onChange(m.entry)} />)}
      </ScrollView>
    </View>
  );
}

function PlayerRows({ players, mode }: { players: AnalysisPlayer[]; mode: "captain" | "ownership" | "differentials" }) {
  if (!players.length) return <Text style={styles.empty}>Ingen data akkurat nå.</Text>;
  return (
    <View style={styles.table}>
      {players.slice(0, 30).map((p, index) => (
        <View key={p.element} style={styles.tableRow}>
          <Text style={styles.rank}>{index + 1}</Text>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{p.player}</Text>
            <Text style={styles.rowMeta}>{p.club || ""} {p.fixture_status_label ? `· ${p.fixture_status_label}` : ""}</Text>
          </View>
          <View style={styles.right}>
            {mode === "captain" ? <Text style={styles.value}>{p.captain_count} C</Text> : null}
            {mode === "ownership" ? <Text style={styles.value}>{Number(p.ownership_pct || 0).toFixed(0)} %</Text> : null}
            {mode === "differentials" ? <Text style={styles.value}>{p.event_points} p</Text> : null}
            <Text style={styles.smallValue}>{p.ownership_count} eiere</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SimplePlayerTool({ mode }: { mode: "captain" | "ownership" | "differentials" }) {
  const loader = useMemo(() => {
    if (mode === "captain") return () => api.analysisCaptain();
    if (mode === "ownership") return () => api.analysisOwnership();
    return () => api.analysisDifferentials();
  }, [mode]);
  const remote = useRemote(loader);
  return (
    <>
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data ? <PlayerRows players={remote.data.players || []} mode={mode} /> : null}
    </>
  );
}

function ChipsTool() {
  const remote = useRemote(() => api.analysisChips());
  return (
    <>
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      <View style={styles.table}>
        {(remote.data?.chips || []).map((row) => (
          <View key={`${row.entry}-${row.chip}-${row.gw}`} style={styles.tableRow}>
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{row.manager}</Text>
              <Text style={styles.rowMeta}>GW {row.gw}</Text>
            </View>
            <Text style={styles.value}>{row.chip || "–"}</Text>
          </View>
        ))}
        {remote.data && !(remote.data.chips || []).length ? <Text style={styles.empty}>Ingen aktive sjetonger akkurat nå.</Text> : null}
      </View>
    </>
  );
}

function RivalResult({ data }: { data: RivalPayload }) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.label}>LIVE-DUELL</Text>
      <Text style={styles.resultTitle}>{data.me.manager} vs. {data.rival.manager}</Text>
      <View style={styles.statGrid}>
        <View style={styles.stat}><Text style={styles.statNumber}>{data.live_gap > 0 ? "+" : ""}{data.live_gap}</Text><Text style={styles.statLabel}>live gap</Text></View>
        <View style={styles.stat}><Text style={styles.statNumber}>{data.gw_gap > 0 ? "+" : ""}{data.gw_gap}</Text><Text style={styles.statLabel}>GW-gap</Text></View>
        <View style={styles.stat}><Text style={styles.statNumber}>{data.common_players}</Text><Text style={styles.statLabel}>felles</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Du heier på</Text>
      {(data.cheer_for || []).slice(0, 6).map((r) => <Text key={`c-${r.element}`} style={styles.line}>• {r.player}: {r.headline}</Text>)}
      <Text style={styles.sectionTitle}>Du håper blanker</Text>
      {(data.hope_blank || []).slice(0, 6).map((r) => <Text key={`h-${r.element}`} style={styles.line}>• {r.player}: {r.headline}</Text>)}
    </View>
  );
}

function RivalTool() {
  const managers = useRemote(() => api.managers());
  const [me, setMe] = useState(0);
  const [rival, setRival] = useState(0);
  const [data, setData] = useState<RivalPayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!me || !rival || me === rival) return;
    setBusy(true); setError("");
    try { setData(await api.rival(me, rival)); } catch (e) { setError(e instanceof Error ? e.message : "Kunne ikke bygge duellen."); }
    finally { setBusy(false); }
  }

  return (
    <>
      {managers.loading && !managers.data ? <Loading /> : null}
      {managers.error && !managers.data ? <ErrorState message={managers.error} /> : null}
      {managers.data ? (
        <>
          <ManagerChooser title="MEG" managers={managers.data.managers} value={me} onChange={(n) => { setMe(n); setData(null); }} exclude={rival} />
          <ManagerChooser title="RIVAL" managers={managers.data.managers} value={rival} onChange={(n) => { setRival(n); setData(null); }} exclude={me} />
          <Pressable disabled={!me || !rival || busy} onPress={run} style={({ pressed }) => [styles.action, (!me || !rival || busy) && styles.disabled, pressed && styles.pressed]}>
            <Text style={styles.actionText}>{busy ? "Bygger duell ..." : "Kjør rivalradar"}</Text>
          </Pressable>
        </>
      ) : null}
      {error ? <ErrorState message={error} /> : null}
      {data ? <RivalResult data={data} /> : null}
    </>
  );
}

const strategies = [
  ["rapid_lofthus", "Klatre raskt"],
  ["win_lofthus", "Vinne Lofthus"],
  ["defend", "Forsvare plass"],
  ["win_month", "Vinne måneden"],
  ["climb_or", "Klatre jevnt OR"],
  ["balanced", "Balansert"],
] as const;

function TransferTool() {
  const managers = useRemote(() => api.managers());
  const [entry, setEntry] = useState(0);
  const [strategy, setStrategy] = useState("rapid_lofthus");
  const [risk, setRisk] = useState(55);
  const [data, setData] = useState<TransferStrategyPayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!entry) return;
    setBusy(true); setError("");
    try { setData(await api.analysisTransfers({ entry_id: entry, strategy, risk, horizon: 3 })); }
    catch (e) { setError(e instanceof Error ? e.message : "Kunne ikke bygge transferstrategien."); }
    finally { setBusy(false); }
  }

  return (
    <>
      {managers.loading && !managers.data ? <Loading /> : null}
      {managers.data ? <ManagerChooser title="HVEM ER DU?" managers={managers.data.managers} value={entry} onChange={(n) => { setEntry(n); setData(null); }} /> : null}
      <View style={styles.block}>
        <Text style={styles.label}>MÅL</Text>
        <View style={styles.wrapChips}>{strategies.map(([id, label]) => <Chip key={id} label={label} active={strategy === id} onPress={() => { setStrategy(id); setData(null); }} />)}</View>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>RISIKO</Text>
        <View style={styles.wrapChips}>
          <Chip label="Trygg" active={risk === 25} onPress={() => { setRisk(25); setData(null); }} />
          <Chip label="Balansert" active={risk === 55} onPress={() => { setRisk(55); setData(null); }} />
          <Chip label="Full send" active={risk === 85} onPress={() => { setRisk(85); setData(null); }} />
        </View>
      </View>
      <Pressable disabled={!entry || busy} onPress={run} style={({ pressed }) => [styles.action, (!entry || busy) && styles.disabled, pressed && styles.pressed]}>
        <Text style={styles.actionText}>{busy ? "Regner ..." : "Gi meg råd"}</Text>
      </Pressable>
      {error ? <ErrorState message={error} /> : null}
      {data ? (
        <View style={styles.resultCard}>
          <Text style={styles.label}>{data.strategy.label.toUpperCase()}</Text>
          <Text style={styles.resultTitle}>{data.context.summary}</Text>
          {(data.recommendations || []).slice(0, 6).map((p, index) => (
            <View key={p.element} style={styles.pick}>
              <Text style={styles.pickRank}>{index + 1}</Text>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{p.player}</Text>
                <Text style={styles.rowMeta}>{p.club} · {p.position} · £{Number(p.price).toFixed(1)}</Text>
                {(p.why || []).slice(0, 2).map((line) => <Text key={line} style={styles.line}>{line}</Text>)}
              </View>
              <Text style={styles.value}>{Number(p.strategy_score).toFixed(1)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

export default function AnalysisToolScreen() {
  const { tool } = useLocalSearchParams<{ tool?: string }>();
  const id = (tool || "") as ToolId;
  const meta = META[id];
  if (!meta) return <Screen title="Fant ikke verktøyet"><Text style={styles.empty}>Denne analysen finnes ikke.</Text></Screen>;

  return (
    <Screen kicker={meta.kicker} title={meta.title}>
      <Text style={styles.intro}>{meta.intro}</Text>
      {id === "rivalradar" ? <RivalTool /> : null}
      {id === "transferstrategi" ? <TransferTool /> : null}
      {id === "kaptein" ? <SimplePlayerTool mode="captain" /> : null}
      {id === "ownership" ? <SimplePlayerTool mode="ownership" /> : null}
      {id === "differensialer" ? <SimplePlayerTool mode="differentials" /> : null}
      {id === "chips" ? <ChipsTool /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: -6, marginBottom: 18 },
  block: { marginBottom: 18 },
  label: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8 },
  chipRow: { gap: 8, paddingRight: 20 },
  wrapChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 40, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 13, alignItems: "center", justifyContent: "center" },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: colors.white },
  action: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.dark, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginBottom: 20 },
  actionText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.62 },
  table: { borderTopWidth: 1, borderTopColor: colors.ink },
  tableRow: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 11 },
  rank: { width: 22, color: colors.live, fontSize: 10, fontWeight: "900" },
  flex: { flex: 1 },
  right: { alignItems: "flex-end" },
  rowTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 17, fontWeight: "700" },
  rowMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  value: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  smallValue: { color: colors.muted, fontSize: 10, marginTop: 2 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19, paddingVertical: 14 },
  resultCard: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, padding: space.lg, marginTop: 4 },
  resultTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 22, lineHeight: 27, fontWeight: "700", marginBottom: 14 },
  statGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: colors.paper, borderRadius: radius.md, padding: 10 },
  statNumber: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 9, marginTop: 2, textTransform: "uppercase" },
  sectionTitle: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 12, marginBottom: 6 },
  line: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  pick: { flexDirection: "row", gap: 10, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  pickRank: { color: colors.live, fontSize: 11, fontWeight: "900", paddingTop: 3 },
});