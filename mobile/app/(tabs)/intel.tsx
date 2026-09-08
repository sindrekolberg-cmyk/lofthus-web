import { useCallback, useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { api } from "@/lib/api";
import { useProfile } from "@/lib/profile";
import { colors, radius, space } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type { LeagueIntelligencePayload, LeagueIntelPlayer } from "@/lib/leagueIntelligenceTypes";

const goals = [
  ["auto", "Automatisk"],
  ["win", "Vinn ligaen"],
  ["top3", "Topp 3"],
  ["top10", "Topp 10"],
  ["month", "Vinn måneden"],
  ["beat_next", "Nærmeste rival"],
] as const;

const strategyLabels: Record<string, string> = {
  defend: "Forsvar posisjonen",
  win_month: "Vinn måneden",
  win_lofthus: "Jakt ligaseieren",
  rapid_lofthus: "Klatre raskt",
  balanced: "Balansert",
};

function Choice({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
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
          {player.club} · projeksjon {Number(player.projection_index || 0).toFixed(1)} · målgruppe {Number(player.target_ownership_pct || 0).toFixed(0)} %
        </Text>
        {!live && player.evidence?.[0] ? <Text style={styles.evidence}>{player.evidence[0]}</Text> : null}
      </View>
      {live ? (
        <Text style={[styles.swing, swing > 0 ? styles.swingUp : swing < 0 ? styles.swingDown : null]}>
          {swing > 0 ? "+" : ""}{swing.toFixed(1)}
        </Text>
      ) : (
        <Text style={styles.projection}>
          {Number(player.xgi_per90 || 0) > 0 ? `${Number(player.xgi_per90).toFixed(2)} xGI/90` : `${Number(player.form || 0).toFixed(1)} form`}
        </Text>
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
  const phaseLabel = data.phase === "live" ? "LIVE" : data.phase === "verdict" ? "ETTER RUNDEN" : "FØR DEADLINE";
  const required = Number(mission.required_gain_per_round || 0);
  const strategy = mission.recommended_strategy ? strategyLabels[mission.recommended_strategy] || mission.recommended_strategy : "";
  const coverage = data.coverage;

  return (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>{phaseLabel} · {data.goal.label.toUpperCase()}</Text>
        <Text style={styles.heroTitle}>{mission.headline}</Text>
        <Text style={styles.heroCopy}>{mission.detail}</Text>
        {required > 0 && !mission.defending ? (
          <Text style={styles.heroDetail}>Nødvendig innhenting: ca. {required.toFixed(1)} poeng per runde.</Text>
        ) : null}
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>Nr. {data.manager.rank} · {data.manager.total} poeng</Text>
          <Text style={styles.risk}>RISIKO: {mission.recommended_risk.toUpperCase()}</Text>
        </View>
        {strategy ? <Text style={styles.strategy}>Anbefalt retning: {strategy}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>PROGNOSE</Text>
      <View style={styles.statGrid}>
        <Stat value={`${Number(forecast.win_pct || 0).toFixed(0)} %`} label="vinne" />
        <Stat value={`${Number(forecast.top3_pct || 0).toFixed(0)} %`} label="topp 3" />
        <Stat value={`${Number(forecast.top10_pct || 0).toFixed(0)} %`} label="topp 10" />
        <Stat value={Number(forecast.expected_rank || data.manager.rank).toFixed(1)} label="forv. plass" />
      </View>
      <View style={styles.modelGrid}>
        {forecast.manager_expected_gw !== undefined ? <Stat value={Number(forecast.manager_expected_gw).toFixed(1)} label="forv. GW" /> : null}
        {forecast.manager_volatility !== undefined ? <Stat value={Number(forecast.manager_volatility).toFixed(1)} label="variasjon" /> : null}
        {forecast.manager_uniqueness_pct !== undefined ? <Stat value={`${Number(forecast.manager_uniqueness_pct).toFixed(0)} %`} label="unikhet" /> : null}
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
            {data.verdict.gw_points} poeng · målgruppen {Number(data.verdict.target_average_gw || 0).toFixed(1)} · relativt {data.verdict.relative_to_target > 0 ? "+" : ""}{Number(data.verdict.relative_to_target || 0).toFixed(1)}
          </Text>
        </View>
      ) : null}

      {coverage ? (
        <View style={styles.coverageCard}>
          <Text style={styles.cardKicker}>DATAGRUNNLAG</Text>
          <Text style={styles.coverageText}>
            {coverage.loaded_managers || coverage.league_size || 0}/{coverage.league_size || 0} managere · {coverage.history_managers || 0} med sesonghistorikk · {coverage.projected_players || 0} spillere modellert · neste fem runder vurdert
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
  const { profile, hasIdentity } = useProfile();
  const [goal, setGoal] = useState("auto");
  const loader = useCallback(
    () => api.leagueIntelligence(profile.entryId, goal),
    [profile.entryId, profile.leagueId, goal],
  );
  const remote = useRemote(loader, hasIdentity);

  return (
    <Screen kicker="League Intelligence" title="Din liga" refreshing={remote.refreshing} onRefresh={remote.refresh}>
      {!hasIdentity ? (
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Koble til manageren din</Text>
          <Text style={styles.intro}>Velg FPL-liga og manager én gang. Deretter brukes profilen automatisk i analyse, rivaler og varsler.</Text>
          <Link href="/profile" asChild>
            <Pressable style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
              <Text style={styles.primaryActionText}>Sett opp profil</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <View style={styles.identityRow}>
            <View style={styles.identityCopy}>
              <Text style={styles.identityLeague}>{profile.leagueName}</Text>
              <Text style={styles.identityManager}>{profile.managerName} · {profile.team}</Text>
            </View>
            <Link href="/profile" asChild>
              <Pressable style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}>
                <Text style={styles.changeText}>Endre</Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.label}>MÅL</Text>
          <View style={styles.goalRow}>
            {goals.map(([id, label]) => <Choice key={id} label={label} active={goal === id} onPress={() => setGoal(id)} />)}
          </View>

          {remote.loading && !remote.data ? <Loading label="Bygger personlig ligaanalyse …" /> : null}
          {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
          {remote.data ? <Result data={remote.data} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 5, marginBottom: 18 },
  label: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.25, marginBottom: 8, marginTop: 2 },
  goalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  choice: { minHeight: 39, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  choiceActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  choiceText: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  choiceTextActive: { color: colors.white },
  setupCard: { backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: space.lg },
  setupTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 23, fontWeight: "700" },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: colors.ink, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 13, marginBottom: 18 },
  identityCopy: { flex: 1 },
  identityLeague: { color: colors.ink, fontFamily: "Georgia", fontSize: 18, fontWeight: "700" },
  identityManager: { color: colors.muted, fontSize: 10, marginTop: 3 },
  changeButton: { minHeight: 34, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  changeText: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  pressed: { opacity: 0.62 },
  hero: { backgroundColor: colors.ink, borderRadius: radius.lg, padding: space.lg, marginBottom: 22 },
  heroKicker: { color: "#D9A08F", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  heroTitle: { color: colors.white, fontFamily: "Georgia", fontSize: 27, lineHeight: 32, fontWeight: "700", marginTop: 8 },
  heroCopy: { color: "#D4CEC4", fontSize: 13, lineHeight: 20, marginTop: 7 },
  heroDetail: { color: colors.white, fontSize: 11, lineHeight: 16, marginTop: 8, fontWeight: "700" },
  heroMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, gap: 8 },
  heroMetaText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  risk: { color: "#D9A08F", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  strategy: { color: "#D4CEC4", fontSize: 10, marginTop: 8 },
  sectionTitle: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.15, marginTop: 8, marginBottom: 8 },
  statGrid: { flexDirection: "row", gap: 6, marginBottom: 6 },
  modelGrid: { flexDirection: "row", gap: 6, marginBottom: 8 },
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
  coverageCard: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, paddingTop: 13, marginTop: 10 },
  coverageText: { color: colors.muted, fontSize: 10, lineHeight: 16 },
  actions: { gap: 8, marginTop: 18 },
  primaryAction: { minHeight: 48, backgroundColor: colors.ink, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  primaryActionText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  secondaryAction: { minHeight: 48, backgroundColor: colors.panel, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  secondaryActionText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
});
