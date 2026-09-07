import { useCallback } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { clubBadge, formatKickoff, formatMovement } from "@/lib/format";
import { colors, radius, space } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type { Fixture, ManagerRow, Story } from "@/lib/types";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";

const storyIcons = ["♟", "★", "●", "◆"];

export default function HomeScreen() {
  const router = useRouter();
  const loader = useCallback(() => api.home(), []);
  const remote = useRemote(loader);
  const data = remote.data;
  const stories = (data?.news || []).filter((story) => story.category !== "movement" && story.category !== "movement_live");

  return (
    <Screen refreshing={remote.refreshing} onRefresh={remote.refresh} flush>
      {remote.loading && !data ? <Loading /> : null}
      {remote.error && !data ? <ErrorState message={remote.error} /> : null}
      {data ? (
        <>
          <View style={styles.brandHeader}>
            <View>
              <Text style={styles.logo}>LOFTHUS</Text>
              <Text style={styles.logoSub}>ROAD OPEN</Text>
            </View>
            <View style={styles.taglineWrap}>
              <Text style={styles.tagline}>MER ENN</Text>
              <Text style={styles.tagline}>ET FANTASYSPILL</Text>
              <View style={styles.taglineLine} />
            </View>
          </View>

          <View style={styles.fixtureSection}>
            <SectionHeader title="Neste kamper" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fixtureRail}>
              {(data.pulse.fixtures || []).slice(0, 5).map((fixture, index) => (
                <Pressable
                  key={fixture.id}
                  onPress={() => router.push(`/match/${fixture.id}`)}
                  style={({ pressed }) => [styles.fixtureCard, index === 0 && styles.fixtureCardFirst, pressed && styles.pressed]}
                >
                  <View style={styles.fixtureInner}>
                    <View style={styles.fixtureTopline}>
                      {fixture.status === "live" ? <View style={styles.liveDot} /> : null}
                      <Text style={styles.fixtureWhen}>{fixtureWhen(fixture)}</Text>
                    </View>
                    <View style={styles.fixtureTeamsRow}>
                      <TeamBadge code={fixture.home} name={fixture.home_name} />
                      <Text style={styles.fixtureDash}>{scoreOrDash(fixture.home_score)}</Text>
                      <Text style={styles.fixtureDash}>·</Text>
                      <Text style={styles.fixtureDash}>{scoreOrDash(fixture.away_score)}</Text>
                      <TeamBadge code={fixture.away} name={fixture.away_name} />
                    </View>
                    <Text style={styles.fixtureName} numberOfLines={2}>{fixture.home_name || fixture.home} – {fixture.away_name || fixture.away}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.newsSection}>
            <SectionHeader title="Snakkiser" />
            <View style={styles.storyList}>
              {stories.length ? stories.slice(0, 4).map((story, index) => (
                <StoryRow key={story.key} story={story} icon={storyIcons[index] || "•"} />
              )) : <Text style={styles.empty}>Ingen sterke historier akkurat nå.</Text>}
            </View>
          </View>

          <View style={styles.tablesSection}>
            <View style={styles.tablesGrid}>
              <MiniTableCard
                icon="♛"
                title="Topp 5"
                action="SE LIGAEN →"
                rows={data.top5.slice(0, 5)}
                value={(row) => row.total}
                rank={(row) => row.rank}
                move
                onPressHeader={() => router.push("/liga")}
                onPressRow={(row) => router.push(`/manager/${row.entry}`)}
              />
              <MiniTableCard
                icon="▦"
                title={data.month.name || "Måned"}
                action="SE MÅNEDEN →"
                rows={data.month.table.slice(0, 5)}
                value={(row) => row.month_points}
                rank={(row) => row.month_rank || row.rank}
                onPressHeader={() => router.push("/liga")}
                onPressRow={(row) => router.push(`/manager/${row.entry}`)}
              />
            </View>
          </View>

          <View style={styles.playersSection}>
            <SectionHeader title="Spillerne alle snakker om" icon="🔥" compact />
            {data.popular.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playerRail}>
                {data.popular.slice(0, 8).map((player) => (
                  <View key={player.element} style={styles.playerCard}>
                    {player.image_url ? (
                      <Image source={{ uri: player.image_url }} style={styles.playerImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.playerImageFallback}><Text style={styles.playerInitial}>{player.player.slice(0, 1)}</Text></View>
                    )}
                    <View style={styles.playerCopy}>
                      <Text style={styles.playerName} numberOfLines={2}>{player.player}</Text>
                      <Text style={styles.playerOwnership}>{Math.round(player.ownership_pct)}% eierandel</Text>
                      <Text style={[styles.playerPoints, player.event_points < 0 && styles.down]}>{player.event_points > 0 ? "+" : ""}{player.event_points}</Text>
                      <Text style={styles.playerRound}>siste runde</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : <Text style={styles.empty}>Ingen spillere skiller seg ut akkurat nå.</Text>}
          </View>

          <View style={styles.movesSection}>
            <SectionHeader title="Største utslag" compact />
            <View style={styles.movesGrid}>
              <View style={[styles.movePanel, styles.movePanelUp]}>
                <Text style={[styles.movePanelTitle, styles.up]}>↗ STØRSTE KLATRERE</Text>
                {(data.movers?.climbers || []).slice(0, 3).map((row, index) => (
                  <Pressable key={row.entry} onPress={() => router.push(`/manager/${row.entry}`)} style={({ pressed }) => [styles.moveRow, pressed && styles.pressed]}>
                    <Text style={styles.moveRank}>{index + 1}</Text>
                    <Text style={styles.moveName} numberOfLines={1}>{row.manager}</Text>
                    <Text style={[styles.moveValue, styles.up]}>+{Math.abs(row.rank_change)}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.movePanel, styles.movePanelDown]}>
                <Text style={[styles.movePanelTitle, styles.down]}>↓ STØRSTE FALL</Text>
                {(data.movers?.fallers || []).slice(0, 3).map((row, index) => (
                  <Pressable key={row.entry} onPress={() => router.push(`/manager/${row.entry}`)} style={({ pressed }) => [styles.moveRow, pressed && styles.pressed]}>
                    <Text style={styles.moveRank}>{index + 1}</Text>
                    <Text style={styles.moveName} numberOfLines={1}>{row.manager}</Text>
                    <Text style={[styles.moveValue, styles.down]}>-{Math.abs(row.rank_change)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function SectionHeader({ title, icon, compact = false }: { title: string; icon?: string; compact?: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleWrap}>
        {icon ? <Text style={styles.sectionIcon}>{icon}</Text> : null}
        <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>{title}</Text>
      </View>
    </View>
  );
}

function TeamBadge({ code, name }: { code: string; name?: string }) {
  return (
    <View style={styles.teamBadge}>
      <Text style={styles.teamBadgeText}>{clubBadge(code, name)}</Text>
    </View>
  );
}

function StoryRow({ story, icon }: { story: Story; icon: string }) {
  const router = useRouter();
  const body = (
    <>
      <Text style={styles.storyIcon}>{icon}</Text>
      <View style={styles.storyCopy}>
        <Text style={styles.storyHeadline}>{story.headline}</Text>
        {story.meta ? <Text style={styles.storyMeta}>{story.meta}</Text> : null}
      </View>
    </>
  );
  if (!story.manager_entry) return <View style={styles.storyRow}>{body}</View>;
  return (
    <Pressable onPress={() => router.push(`/manager/${story.manager_entry}`)} style={({ pressed }) => [styles.storyRow, pressed && styles.pressed]}>
      {body}
    </Pressable>
  );
}

function MiniTableCard({
  icon,
  title,
  action,
  rows,
  value,
  rank,
  move = false,
  onPressHeader,
  onPressRow,
}: {
  icon: string;
  title: string;
  action: string;
  rows: ManagerRow[];
  value: (row: ManagerRow) => number;
  rank: (row: ManagerRow) => number;
  move?: boolean;
  onPressHeader: () => void;
  onPressRow: (row: ManagerRow) => void;
}) {
  return (
    <View style={styles.tableCard}>
      <Pressable onPress={onPressHeader} style={({ pressed }) => [styles.tableHeader, pressed && styles.pressed]}>
        <View style={styles.tableTitleWrap}>
          <Text style={styles.tableIcon}>{icon}</Text>
          <Text style={styles.tableTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72}>{title}</Text>
        </View>
        <Text style={styles.tableAction} numberOfLines={1}>{action}</Text>
      </Pressable>
      <View style={styles.tableColumns}>
        <Text style={styles.tableColRank}>#</Text>
        <Text style={styles.tableColName}>MANAGER</Text>
        <Text style={styles.tableColValue}>POENG</Text>
        {move ? <Text style={styles.tableColMove}>+/-</Text> : null}
      </View>
      {rows.map((row) => {
        const movement = formatMovement(row.rank_change);
        return (
          <Pressable key={row.entry} onPress={() => onPressRow(row)} style={({ pressed }) => [styles.tableRow, pressed && styles.pressed]}>
            <Text style={styles.tableRank}>{rank(row)}</Text>
            <Text style={styles.tableName} numberOfLines={1}>{row.manager}</Text>
            <Text style={styles.tableValue}>{value(row)}</Text>
            {move ? <Text style={[styles.tableMove, { color: movement.color }]}>{movement.text.replace(" ▲", "").replace(" ▼", "")}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function fixtureWhen(fixture: Fixture) {
  if (fixture.status === "live") return (fixture.status_label || "Pågår").toUpperCase();
  if (fixture.status === "finished") return (fixture.status_label || "Ferdig").toUpperCase();
  return formatKickoff(fixture.kickoff) || (fixture.status_label || "Neste kamp").toUpperCase();
}

function scoreOrDash(value?: number | null) {
  return value == null ? "–" : String(value);
}

const styles = StyleSheet.create({
  brandHeader: { minHeight: 100, paddingHorizontal: space.lg, paddingTop: 12, paddingBottom: 14, backgroundColor: colors.panel, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  logo: { color: colors.ink, fontSize: 31, fontWeight: "900", letterSpacing: 6.2, lineHeight: 34 },
  logoSub: { color: colors.muted, fontSize: 11, fontWeight: "500", letterSpacing: 4.8, marginTop: 2 },
  taglineWrap: { alignItems: "flex-start", paddingBottom: 1 },
  tagline: { color: colors.muted, fontSize: 8, lineHeight: 11, fontWeight: "800", letterSpacing: 2.2 },
  taglineLine: { width: 32, height: 2, backgroundColor: colors.live, marginTop: 7 },

  fixtureSection: { backgroundColor: colors.peach, paddingTop: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  sectionHeader: { paddingHorizontal: space.lg, flexDirection: "row", alignItems: "baseline" },
  sectionTitleWrap: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  sectionTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 26, lineHeight: 31, fontWeight: "700", letterSpacing: -0.6 },
  sectionTitleCompact: { fontSize: 23, lineHeight: 28 },
  sectionIcon: { color: colors.live, fontSize: 18 },
  fixtureRail: { paddingHorizontal: space.lg, paddingTop: 10, gap: 6 },
  fixtureCard: { width: 186, backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, marginRight: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  fixtureCardFirst: { borderLeftWidth: 3, borderLeftColor: colors.live },
  fixtureInner: { minHeight: 108, paddingHorizontal: 12, paddingVertical: 10 },
  fixtureTopline: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 7, backgroundColor: colors.live },
  fixtureWhen: { color: colors.ink, fontSize: 8, fontWeight: "900", letterSpacing: 1.05 },
  fixtureTeamsRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  teamBadge: { minWidth: 34, height: 28, paddingHorizontal: 6, borderRadius: 8, backgroundColor: colors.player, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  teamBadgeText: { color: colors.ink, fontSize: 10, fontWeight: "900", letterSpacing: 0.4 },
  fixtureDash: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  fixtureName: { marginTop: 8, textAlign: "center", color: colors.ink, fontSize: 12, fontWeight: "700" },

  newsSection: { backgroundColor: colors.panel, paddingTop: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  storyList: { marginTop: 8, marginHorizontal: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  storyRow: { minHeight: 58, flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  storyIcon: { width: 18, color: colors.live, fontSize: 15, fontWeight: "900", textAlign: "center", marginTop: 2 },
  storyCopy: { flex: 1, minWidth: 0 },
  storyHeadline: { color: colors.ink, fontFamily: "Georgia", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  storyMeta: { color: colors.muted, fontSize: 12, lineHeight: 16, marginTop: 3 },

  tablesSection: { backgroundColor: colors.peach, paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tablesGrid: { flexDirection: "row", gap: 7 },
  tableCard: { flex: 1, minWidth: 0, backgroundColor: colors.panel, paddingHorizontal: 8, paddingTop: 9, paddingBottom: 6, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  tableHeader: { minHeight: 36, gap: 4 },
  tableTitleWrap: { minWidth: 0, flexDirection: "row", alignItems: "flex-start", gap: 5 },
  tableIcon: { color: colors.live, fontSize: 13, fontWeight: "900", marginTop: 3 },
  tableTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 16, lineHeight: 19, fontWeight: "700", flex: 1 },
  tableAction: { color: colors.live, fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  tableColumns: { minHeight: 22, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tableColRank: { width: 16, color: colors.muted, fontSize: 7, fontWeight: "900" },
  tableColName: { flex: 1, color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.6 },
  tableColValue: { width: 36, textAlign: "right", color: colors.muted, fontSize: 7, fontWeight: "900" },
  tableColMove: { width: 28, textAlign: "right", color: colors.muted, fontSize: 7, fontWeight: "900" },
  tableRow: { minHeight: 34, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tableRank: { width: 16, color: colors.ink, fontSize: 11, fontVariant: ["tabular-nums"] },
  tableName: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 11, fontWeight: "600" },
  tableValue: { width: 36, textAlign: "right", color: colors.ink, fontSize: 11, fontWeight: "800", fontVariant: ["tabular-nums"] },
  tableMove: { width: 28, textAlign: "right", fontSize: 10, fontWeight: "800", fontVariant: ["tabular-nums"] },

  playersSection: { backgroundColor: colors.panel, paddingTop: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  playerRail: { paddingHorizontal: space.lg, paddingTop: 8, gap: 7 },
  playerCard: { width: 148, minHeight: 92, backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, overflow: "hidden", flexDirection: "row" },
  playerImage: { width: 48, alignSelf: "stretch", backgroundColor: colors.player },
  playerImageFallback: { width: 48, alignSelf: "stretch", backgroundColor: colors.player, alignItems: "center", justifyContent: "center" },
  playerInitial: { color: colors.ink, fontFamily: "Georgia", fontSize: 22, fontWeight: "700" },
  playerCopy: { flex: 1, paddingHorizontal: 8, paddingVertical: 8 },
  playerName: { color: colors.ink, fontSize: 13, lineHeight: 16, fontWeight: "800" },
  playerOwnership: { color: colors.muted, fontSize: 11, lineHeight: 14, marginTop: 4 },
  playerPoints: { color: colors.green, fontSize: 16, lineHeight: 18, fontWeight: "900", marginTop: 6, fontVariant: ["tabular-nums"] },
  playerRound: { color: colors.muted, fontSize: 9, marginTop: 1 },

  movesSection: { backgroundColor: colors.panel, paddingTop: 12, paddingBottom: 8 },
  movesGrid: { flexDirection: "row", gap: 7, paddingHorizontal: space.lg, paddingTop: 8 },
  movePanel: { flex: 1, minWidth: 0, borderRadius: radius.sm, paddingHorizontal: 9, paddingTop: 9, paddingBottom: 7 },
  movePanelUp: { backgroundColor: colors.upSoft },
  movePanelDown: { backgroundColor: colors.downSoft },
  movePanelTitle: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8, marginBottom: 5 },
  moveRow: { minHeight: 32, flexDirection: "row", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,23,21,0.11)" },
  moveRank: { width: 15, color: colors.muted, fontSize: 9 },
  moveName: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 11 },
  moveValue: { fontSize: 11, fontWeight: "900", fontVariant: ["tabular-nums"] },

  pressed: { opacity: 0.58 },
  up: { color: colors.green },
  down: { color: colors.live },
  empty: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 8, paddingHorizontal: space.lg },
});
