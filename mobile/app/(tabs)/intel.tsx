import { useCallback, useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { api } from "@/lib/api";
import { colors, radius, space } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type { ManagerOption } from "@/lib/types";
import type { LeagueIntelligencePayload, LeagueIntelPlayer } from "@/lib/leagueIntelligenceTypes";

const loadManagers = () => api.managers();

const goals = [
  ["auto", "Automatisk"],
  ["win", "Vinn ligaen"],
  ["top3", "Topp 3"],
  ["top10", "Topp 10"],
  ["month", "Vinn måneden"],
  ["beat_next", "Nærmeste rival"],
] as const;

function Choice({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ManagerPicker({ managers, value, onChange }: { managers: ManagerOption[]; value: number; onChange: (entry: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.managerRow}>
      {managers.map((manager) => (
        <Choice
          key={manager.entry}
          label={`${manager.manager} · ${manager.rank || "–"}`}
          active={value === manager.entry}
          onPress={() => onChange(manager.entry)}
        />
      ))}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PlayerLine({ player, live = false }: { player: LeagueIntelPlayer; live?: boolean }) {
  const swing = Number(player.live_swing || 0);
  return (
    <View style={styles.playerLine}>
      <View style={styles.playerMain}>
        <Text style={styles.playerName}>{player.player}</Text>
        <Text style={styles.playerMeta}>
          {player.club} · {player.projection_index.toFixed(1)} proj. · målgruppe {player.target_ownership_pct.toFixed(0)} %
        </Text>
        {!live && player.evidence?.[0] ? <Text style={styles.evidence}>{player.evidence[0]}</Text> : null}
      </View>
      {live ? (
        <Text style={[styles.swing, swing > 0 ? styles.swingUp : swing < 0 ? styles.swingDown : null]}>
          {swing > 0 ? "+" : ""}{swing.toFixed(1)}
        </Text>
      ) : (
        <Text style={styles.projection}>{player.xgi_per90 > 0 ? `${player.xgi_per90.toFixed(2)} xGI/90` : `${player.form.toFixed(1)} form`}</Text>
      )}
    </View>
  );
}

function PlayerSection({ title, rows, live = false }: { title: string; rows: LeagueIntelPlayer[]; live?: boolean }) {
  if (!rows.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        {rows.map((row) => <PlayerLine key={`${title}-${row.element}`} player={row} live={live} />)}
      </View>
    </View>
  );
}

function Result({ data }: { data: LeagueIntelligencePayload }) {
  const mission = data.mission;
  const forecast = data.forecast;
  const phaseLabel = data.phase === "live" ? "LIVE BATTLE" : data.phase === "verdict" ? "VERDICT" : "PLAN";

  return (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>{phaseLabel} · {data.goal.label.toUpperCase()}</Text>
        <Text style={styles.heroTitle}>{mission.headline}</Text>
        <Text style={styles.heroCopy}>{mission.detail}</Text>
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>Nr. {data.manager.rank} · {data.manager.total} poeng</Text>
          <Text style={styles.risk}>RISIKO: {mission.recommended_risk.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>PROGNOSE</Text>
      <View style={styles.statGrid}>
        <Stat value={`${forecast.win_pct.toFixed(0)} %`} label="vinne" />
        <Stat value={`${forecast.top3_pct.toFixed(0)} %`} label="topp 3" />
        <Stat value={`${forecast.top10_pct.toFixed(0)} %`} label="topp 10" />
        <Stat value={forecast.expected_rank.toFixed(1)} label="forv. plass" />
      </View>
      <Text style={styles.modelNote}>{forecast.model_note}</Text>

      {data.next_rival ? (
        <View style={styles.rivalCard}>
          <Text style={styles.cardKicker}>NÆRMESTE RIVAL</Text>
          <Text style={styles.rivalName}>{data.next_rival.manager}</Text>
          <Text style={styles.rivalCopy}>Nr. {data.next_rival.rank} · {data.next_rival.gap} poeng mellom dere</Text>
        </View>
      ) : null}

      {data.phase === "live" ? <PlayerSection title="STØRSTE LIVE-UTSLAG" rows={data.battle.live_swings || []} live /> : null}
      <PlayerSection title="DINE VÅPEN" rows={data.battle.weapons || []} />
      <PlayerSection title="STØRSTE TRUSLER" rows={data.battle.threats || []} />
      <PlayerSection title="MARKED Å FØLGE" rows={data.battle.opportunities || []} />

      {data.phase === "verdict" ? (
        <View style={styles.verdictCard}>
          <Text style={styles.cardKicker}>RUNDEN</Text>
          <Text style={styles.verdictTitle}>{data.verdict.headline}</Text>
          <Text style={styles.verdictCopy}>
            {data.verdict.gw_points} poeng · målgruppen {data.verdict.target_average_gw.toFixed(1)} · relativt {data.verdict.relative_to_target > 0 ? "+" : ""}{data.verdict.relative_to_target.toFixed(1)}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Link href="/analyse/transferstrategi" asChild>
          <Pressable style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
            <Text style={styles.primaryActionText}>Åpne Transferstrategi</Text>
          </Pressable>
        </Link>
        <Link href="/analyse/rivalradar" asChild>
          <Pressable style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
            <Text style={styles.secondaryActionText}>Åpne Rivalradar</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

export default function LeagueIntelligenceScreen() {
  const managers = useRemote(useCallback(loadManagers, []));
  const [entry, setEntry] = useState(0);
  const [goal, setGoal] = useState("auto");
  const [data, setData] = useState<LeagueIntelligencePayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!entry) return;
    setBusy(true);
    setError("");
    try {
      setData(await api.leagueIntelligence(entry, goal));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke bygge liga-analysen.");
    } finally {
      setBusy(false);
    }
  }

  function chooseEntry(next: number) {
    setEntry(next);
    setData(null);
  }

  function chooseGoal(next: string) {
    setGoal(next);
    setData(null);
  }

  return (
    <Screen kicker="League Intelligence" title="Din liga" refreshing={managers.refreshing} onRefresh={managers.refresh}>
      <Text style={styles.intro}>Personlig plan, rivalbilde, live-utslag og rundeanalyse basert på situasjonen din i ligaen.</Text>

      <Text style={styles.label}>HVEM ER DU?</Text>
      {managers.loading && !managers.data ? <Loading /> : null}
      {managers.error && !managers.data ? <ErrorState message={managers.error} /> : null}
      {managers.data ? <ManagerPicker managers={managers.data.managers || []} value={entry} onChange={chooseEntry} /> : null}

      <Text style={styles.label}>MÅL</Text>
      <View style={styles.goalRow}>
        {goals.map(([id, label]) => <Choice key={id} label={label} active={goal === id} onPress={() => chooseGoal(id)} />)}
      </View>

      <Pressable disabled={!entry || busy} onPress={run} style={({ pressed }) => [styles.buildButton, (!entry || busy) && styles.disabled, pressed && styles.pressed]}>
        <Text style={styles.buildButtonText}>{busy ? "Analyserer ligaen …" : "Bygg min plan"}</Text>
      </Pressable>

      {error ? <ErrorState message={error} /> : null}
      {data ? <Result data={data} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: -6, marginBottom: 20 },
  label: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.25, marginBottom: 8, marginTop: 2 },
  managerRow: { gap: 8, paddingRight: 20, paddingBottom: 18 },
  goalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  choice: { minHeight: 39, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  choiceActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  choiceText: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  choiceTextActive: { color: colors.white },
  buildButton: { minHeight: 52, backgroundColor: colors.dark, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  buildButtonText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.62 },
  hero: { backgroundColor: colors.ink, borderRadius: radius.lg, padding: space.lg, marginBottom: 22 },
  heroKicker: { color: "#D9A08F", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  heroTitle: { color: colors.white, fontFamily: "Georgia", fontSize: 27, lineHeight: 32, fontWeight: "700", marginTop: 8 },
  heroCopy: { color: "#D4CEC4", fontSize: 13, lineHeight: 20, marginTop: 7 },
  heroMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, gap: 8 },
  heroMetaText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  risk: { color: "#D9A08F", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  sectionTitle: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.15, marginTop: 8, marginBottom: 8 },
  statGrid: { flexDirection: "row", gap: 6, marginBottom: 8 },
  stat: { flex: 1, backgroundColor: colors.panel, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, paddingHorizontal: 7, paddingVertical: 11 },
  statValue: { color: colors.ink, fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"] },
  statLabel: { color: colors.muted, fontSize: 8, textTransform: "uppercase", marginTop: 3 },
  modelNote: { color: colors.muted, fontSize: 10, lineHeight: 15, marginBottom: 18 },
  rivalCard: { borderTopWidth: 1, borderTopColor: colors.ink, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 14, marginBottom: 10 },
  cardKicker: { color: colors.live, fontSize: 9, fontWeight: "900", letterSpacing: 1.0 },
  rivalName: { color: colors.ink, fontFamily: "Georgia", fontSize: 20, fontWeight: "700", marginTop: 4 },
  rivalCopy: { color: colors.muted, fontSize: 11, marginTop: 3 },
  section: { marginTop: 8, marginBottom: 12 },
  table: { borderTopWidth: 1, borderTopColor: colors.ink },
  playerLine: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 10 },
  playerMain: { flex: 1 },
  playerName: { color: colors.ink, fontFamily: "Georgia", fontSize: 17, fontWeight: "700" },
  playerMeta: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  evidence: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  projection: { width: 70, color: colors.ink, fontSize: 10, fontWeight: "800", textAlign: "right" },
  swing: { width: 52, fontSize: 15, fontWeight: "900", textAlign: "right", fontVariant: ["tabular-nums"] },
  swingUp: { color: colors.green },
  swingDown: { color: colors.live },
  verdictCard: { backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: space.lg, marginTop: 10, marginBottom: 16 },
  verdictTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 22, fontWeight: "700", marginTop: 5 },
  verdictCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  actions: { gap: 8, marginTop: 12 },
  primaryAction: { minHeight: 48, backgroundColor: colors.ink, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  primaryActionText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  secondaryAction: { minHeight: 48, backgroundColor: colors.panel, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  secondaryActionText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
});
