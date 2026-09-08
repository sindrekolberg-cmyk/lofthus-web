import { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { api } from "@/lib/api";
import { colors, radius, space } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type { AnalysisPlayer, ManagerOption, RivalPayload, TransferPick, TransferStrategyPayload } from "@/lib/types";

type ToolId = "rivalradar" | "transferstrategi" | "kaptein" | "ownership";
type OwnershipMode = "lofthus" | "global" | "differentials";

const META: Record<ToolId, { kicker: string; title: string; intro: string }> = {
  transferstrategi: {
    kicker: "Beslutningsstøtte",
    title: "Transferstrategi",
    intro: "Transferforslag basert på mål, risiko, fem kommende kamper, spillerdata, eierskap og posisjonen din i ligaen.",
  },
  rivalradar: {
    kicker: "Sammenligning",
    title: "Rivalradar",
    intro: "Velg to managere og se hvilke forskjeller som påvirker avstanden mellom lagene.",
  },
  ownership: {
    kicker: "Eierskap",
    title: "Eierskap",
    intro: "Sammenlign eierskap i Lofthus med globalt FPL-eierskap, og finn spillere som gir reell differensialverdi i ligaen.",
  },
  kaptein: {
    kicker: "Kaptein",
    title: "Kaptein",
    intro: "Kapteinsvalg, effektivt eierskap og mulig utslag i ligaen.",
  },
};

const loadManagers = () => api.managers();

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ManagerChooser({ title, managers, value, onChange, exclude = 0 }: { title: string; managers: ManagerOption[]; value: number; onChange: (entry: number) => void; exclude?: number }) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {managers.filter((m) => m.entry !== exclude).map((m) => (
          <Chip key={m.entry} label={`${m.manager} · ${m.rank || "–"}`} active={value === m.entry} onPress={() => onChange(m.entry)} />
        ))}
      </ScrollView>
    </View>
  );
}

function CaptainRows({ players }: { players: AnalysisPlayer[] }) {
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
            <Text style={styles.value}>{p.captain_count} C</Text>
            <Text style={styles.smallValue}>{Number(p.effective_ownership_pct || 0).toFixed(0)} % EO</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function CaptainTool() {
  const loader = useCallback(() => api.analysisCaptain(), []);
  const remote = useRemote(loader);
  return (
    <>
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data ? <CaptainRows players={remote.data.players || []} /> : null}
    </>
  );
}

function OwnershipTool() {
  const loader = useCallback(() => api.analysisOwnership(), []);
  const remote = useRemote(loader);
  const [mode, setMode] = useState<OwnershipMode>("lofthus");

  const rows = useMemo(() => {
    const all = [...(remote.data?.players || [])];
    if (mode === "global") {
      return all.sort((a, b) => Number(b.global_ownership_pct || 0) - Number(a.global_ownership_pct || 0) || a.player.localeCompare(b.player));
    }
    if (mode === "differentials") {
      return all
        .filter((p) => p.status === "a" || !p.status)
        .sort((a, b) => Number(b.differential_score || 0) - Number(a.differential_score || 0) || Number(a.ownership_pct || 0) - Number(b.ownership_pct || 0));
    }
    return all.sort((a, b) => Number(b.ownership_pct || 0) - Number(a.ownership_pct || 0) || a.player.localeCompare(b.player));
  }, [remote.data, mode]);

  return (
    <>
      <View style={styles.modeRow}>
        <Chip label="Lofthus" active={mode === "lofthus"} onPress={() => setMode("lofthus")} />
        <Chip label="Globalt" active={mode === "global"} onPress={() => setMode("global")} />
        <Chip label="Differensialer" active={mode === "differentials"} onPress={() => setMode("differentials")} />
      </View>
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data && remote.data.complete === false ? (
        <Text style={styles.dataNote}>Eierskapslisten er foreløpig fordi ikke alle managerlag er lastet.</Text>
      ) : null}
      {remote.data ? (
        <View style={styles.table}>
          {rows.slice(0, 40).map((p, index) => {
            const lofthus = Number(p.ownership_pct || 0);
            const global = Number(p.global_ownership_pct || 0);
            const gap = Number(p.ownership_gap_pct || lofthus - global);
            return (
              <View key={p.element} style={styles.ownershipRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <View style={styles.flex}>
                  <Text style={styles.rowTitle}>{p.player}</Text>
                  <Text style={styles.rowMeta}>
                    {p.club || ""}
                    {p.form !== undefined ? ` · form ${Number(p.form).toFixed(1)}` : ""}
                    {p.xgi_per90 !== undefined && Number(p.xgi_per90) > 0 ? ` · ${Number(p.xgi_per90).toFixed(2)} xGI/90` : ""}
                  </Text>
                  {mode === "differentials" ? (
                    <Text style={styles.detailLine}>
                      Lofthus {lofthus.toFixed(0)} % · globalt {global.toFixed(0)} % · avvik {gap > 0 ? "+" : ""}{gap.toFixed(0)} pp
                    </Text>
                  ) : null}
                </View>
                <View style={styles.rightWide}>
                  {mode === "lofthus" ? (
                    <>
                      <Text style={styles.value}>{lofthus.toFixed(0)} %</Text>
                      <Text style={styles.smallValue}>globalt {global.toFixed(0)} %</Text>
                    </>
                  ) : null}
                  {mode === "global" ? (
                    <>
                      <Text style={styles.value}>{global.toFixed(0)} %</Text>
                      <Text style={styles.smallValue}>Lofthus {lofthus.toFixed(0)} %</Text>
                    </>
                  ) : null}
                  {mode === "differentials" ? (
                    <>
                      <Text style={styles.value}>{Number(p.differential_score || 0).toFixed(0)}</Text>
                      <Text style={styles.smallValue}>diff-score</Text>
                    </>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </>
  );
}

function RivalResult({ data }: { data: RivalPayload }) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.label}>LIVE-SAMMENLIGNING</Text>
      <Text style={styles.resultTitle}>{data.me.manager} vs. {data.rival.manager}</Text>
      <View style={styles.statGrid}>
        <View style={styles.stat}><Text style={styles.statNumber}>{data.live_gap > 0 ? "+" : ""}{data.live_gap}</Text><Text style={styles.statLabel}>live gap</Text></View>
        <View style={styles.stat}><Text style={styles.statNumber}>{data.gw_gap > 0 ? "+" : ""}{data.gw_gap}</Text><Text style={styles.statLabel}>GW-gap</Text></View>
        <View style={styles.stat}><Text style={styles.statNumber}>{data.common_players}</Text><Text style={styles.statLabel}>felles</Text></View>
      </View>
      <Text style={styles.sectionTitle}>POSITIVT UTSLAG FOR DEG</Text>
      {(data.cheer_for || []).slice(0, 6).map((r) => <Text key={`c-${r.element}`} style={styles.line}>• {r.player}: {r.headline}</Text>)}
      <Text style={styles.sectionTitle}>POSITIVT UTSLAG FOR RIVALEN</Text>
      {(data.hope_blank || []).slice(0, 6).map((r) => <Text key={`h-${r.element}`} style={styles.line}>• {r.player}: {r.headline}</Text>)}
    </View>
  );
}

function RivalTool() {
  const managers = useRemote(loadManagers);
  const [me, setMe] = useState(0);
  const [rival, setRival] = useState(0);
  const [data, setData] = useState<RivalPayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!me || !rival || me === rival) return;
    setBusy(true);
    setError("");
    try {
      setData(await api.rival(me, rival));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke bygge sammenligningen.");
    } finally {
      setBusy(false);
    }
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
            <Text style={styles.actionText}>{busy ? "Analyserer ..." : "Kjør rivalradar"}</Text>
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

function TransferEvidence({ pick }: { pick: TransferPick }) {
  const stats = pick.deep_stats || {};
  const recent = stats.recent_5 || {};
  const fields: string[] = [];
  if (stats.xgi_per90 !== undefined) fields.push(`Sesong xGI/90 ${Number(stats.xgi_per90).toFixed(2)}`);
  if (recent.xgi_per90 !== undefined) fields.push(`Siste ${recent.matches || 5}: ${Number(recent.xgi_per90).toFixed(2)} xGI/90`);
  if (stats.global_ownership_pct !== undefined) fields.push(`Globalt eierskap ${Number(stats.global_ownership_pct).toFixed(0)} %`);
  if (stats.weaker_defence_fixtures !== undefined && stats.next_fixture_count) fields.push(`${stats.weaker_defence_fixtures}/${stats.next_fixture_count} mot svakere forsvar`);
  if (stats.penalties_order === 1) fields.push("Førstevalg på straffer");

  return (
    <>
      {pick.confidence ? <Text style={styles.confidence}>Datagrunnlag: {pick.confidence}</Text> : null}
      {fields.length ? <Text style={styles.metrics}>{fields.join(" · ")}</Text> : null}
      {(pick.why || []).slice(0, 5).map((line) => <Text key={line} style={styles.line}>{line}</Text>)}
    </>
  );
}

function TransferTool() {
  const managers = useRemote(loadManagers);
  const [entry, setEntry] = useState(0);
  const [strategy, setStrategy] = useState("rapid_lofthus");
  const [risk, setRisk] = useState(55);
  const [data, setData] = useState<TransferStrategyPayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!entry) return;
    setBusy(true);
    setError("");
    try {
      setData(await api.analysisTransfers({ entry_id: entry, strategy, risk, horizon: 5 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke bygge transferstrategien.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {managers.loading && !managers.data ? <Loading /> : null}
      {managers.error && !managers.data ? <ErrorState message={managers.error} /> : null}
      {managers.data ? <ManagerChooser title="MANAGER" managers={managers.data.managers} value={entry} onChange={(n) => { setEntry(n); setData(null); }} /> : null}
      <View style={styles.block}>
        <Text style={styles.label}>MÅL</Text>
        <View style={styles.wrapChips}>{strategies.map(([id, label]) => <Chip key={id} label={label} active={strategy === id} onPress={() => { setStrategy(id); setData(null); }} />)}</View>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>RISIKO</Text>
        <View style={styles.wrapChips}>
          <Chip label="Lav" active={risk === 25} onPress={() => { setRisk(25); setData(null); }} />
          <Chip label="Middels" active={risk === 55} onPress={() => { setRisk(55); setData(null); }} />
          <Chip label="Høy" active={risk === 85} onPress={() => { setRisk(85); setData(null); }} />
        </View>
      </View>
      <Text style={styles.horizon}>Vurderer de neste fem kampene. Gratisgrunnlaget inkluderer FPL-spillerdata, xG/xA/xGI, siste kamper, spilletid, dødballroller, kampprogram, globalt eierskap og Lofthus-eierskap.</Text>
      <Pressable disabled={!entry || busy} onPress={run} style={({ pressed }) => [styles.action, (!entry || busy) && styles.disabled, pressed && styles.pressed]}>
        <Text style={styles.actionText}>{busy ? "Analyserer ..." : "Kjør analyse"}</Text>
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
                <View style={styles.pickHead}>
                  <View style={styles.flex}>
                    <Text style={styles.rowTitle}>{p.player}</Text>
                    <Text style={styles.rowMeta}>{p.club} · {p.position} · £{Number(p.price).toFixed(1)}</Text>
                  </View>
                  <Text style={styles.value}>{Number(p.strategy_score).toFixed(1)}</Text>
                </View>
                <TransferEvidence pick={p} />
              </View>
            </View>
          ))}
          {!(data.recommendations || []).length ? <Text style={styles.empty}>Ingen lovlige ett-bytte-anbefalinger i dette datagrunnlaget.</Text> : null}
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
      {id === "transferstrategi" ? <TransferTool /> : null}
      {id === "rivalradar" ? <RivalTool /> : null}
      {id === "ownership" ? <OwnershipTool /> : null}
      {id === "kaptein" ? <CaptainTool /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: -6, marginBottom: 18 },
  block: { marginBottom: 18 },
  label: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8 },
  chipRow: { gap: 8, paddingRight: 20 },
  wrapChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { minHeight: 40, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 13, alignItems: "center", justifyContent: "center" },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: colors.white },
  horizon: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: -6, marginBottom: 12 },
  action: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.dark, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginBottom: 20 },
  actionText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.62 },
  table: { borderTopWidth: 1, borderTopColor: colors.ink },
  tableRow: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 11 },
  ownershipRow: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 11 },
  rank: { width: 22, color: colors.live, fontSize: 10, fontWeight: "900" },
  flex: { flex: 1 },
  right: { alignItems: "flex-end" },
  rightWide: { width: 86, alignItems: "flex-end" },
  rowTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 17, fontWeight: "700" },
  rowMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  detailLine: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  value: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  smallValue: { color: colors.muted, fontSize: 10, marginTop: 2 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19, paddingVertical: 14 },
  dataNote: { color: colors.muted, fontSize: 11, lineHeight: 17, marginBottom: 10 },
  resultCard: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, padding: space.lg, marginTop: 4 },
  resultTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 22, lineHeight: 27, fontWeight: "700", marginBottom: 14 },
  statGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: colors.paper, borderRadius: radius.md, padding: 10 },
  statNumber: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 9, marginTop: 2, textTransform: "uppercase" },
  sectionTitle: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 12, marginBottom: 6 },
  line: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  pick: { flexDirection: "row", gap: 10, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  pickRank: { color: colors.live, fontSize: 11, fontWeight: "900", paddingTop: 3 },
  pickHead: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  confidence: { color: colors.ink, fontSize: 10, fontWeight: "800", marginTop: 7, textTransform: "uppercase" },
  metrics: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
});