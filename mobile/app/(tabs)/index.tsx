import { useCallback } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type { Fixture, ManagerRow, Story } from "@/lib/types";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";

const storyIcons = ["↗", "♟", "★", "●", "◆"];

export default function HomeScreen() {
  const router = useRouter();
  const loader = useCallback(() => api.home(), []);
  const remote = useRemote(loader);
  const data = remote.data;

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
            <SectionHeader title="Neste kamper" action="SE FULL RUNDE →" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fixtureRail}>
              {(data.pulse.fixtures || []).slice(0, 5).map((fixture, index) => (
                <Pressable key={fixture.id} style={({ pressed }) => [styles.fixtureCard, index === 0 && styles.fixtureCardFirst, pressed && styles.pressed]}>
                  <View style={styles.fixtureInner}>
                    <View style={styles.fixtureTopline}>
                      {fixture.status?.toLowerCase().includes("live") || fixture.status_label?.toLowerCase().includes("live") ? (
                        <View style={styles.liveDot} />
                      ) : null}
                      <Text style={styles.fixtureWhen}>{fixtureWhen(fixture)}</Text>
                    </View>
                    <View style={styles.fixtureTeamsRow}>
                      <TeamBadge name={fixture.home} />
                      <Text style={styles.fixtureDash}>{fixture.home_score ?? "–"}</Text>
                      <Text style={styles.fixtureDash}>·</Text>
                      <Text style={styles.fixtureDash}>{fixture.away_score ?? "–"}</Text>
                      <TeamBadge name={fixture.away} />
                    </View>
                    <Text style={styles.fixtureName} numberOfLines={1}>{fixture.home} – {fixture.away}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.newsSection}>
            <SectionHeader title="Snakkiser" action="ALLTID NOE Å SNAKKE OM →" />
            <View style={styles.newsGrid}>
              <View style={styles.storyList}>
                {data.news.length ? data.news.slice(0, 4).map((story, index) => (
                  <StoryRow key={story.key} story={story} icon={storyIcons[index] || "•"} />
                )) : <Text style={styles.empty}>Ingen sterke historier akkurat nå.</Text>}
              </View>
              <View style={styles.quoteCard}>
                <Text style={styles.quote}>“Samme galskap hver runde. Det er derfor vi elsker dette.”</Text>
                <View style={styles.quoteRule} />
                <Text style={styles.quoteBrand}>LOFTHUS</Text>
                <Text style={styles.quoteBrandSub}>ROAD OPEN</Text>
              </View>
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
                rank={(row) => row.month_rank || 0}
                onPressHeader={() => router.push("/liga")}
                onPressRow={(row) => router.push(`/manager/${row.entry}`)}
              />
            </View>
          </View>

          <View style={styles.playersSection}>
            <SectionHeader title="Spillerne alle snakker om" action="SE FLERE SPILLERE →" icon="🔥" compact />
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
                      <Text style={styles.playerName} numberOfLines={1}>{player.player}</Text>
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
            <SectionHeader title="Største utslag" action="SE ALLE UTSLAG →" icon="▥" compact />
            <View style={styles.movesGrid}>
              <View style={[styles.movePanel, styles.movePanelUp]}>
                <Text style={[styles.movePanelTitle, styles.up]}>↗ STØRSTE KLATRERE</Text>
                {(data.movers?.climbers || []).slice(0, 3).map((row, index) => (
                  <View key={row.entry} style={styles.moveRow}>
                    <Text style={styles.moveRank}>{index + 1}</Text>
                    <Text style={styles.moveName} numberOfLines={1}>{row.manager}</Text>
                    <Text style={[styles.moveValue, styles.up]}>+{Math.abs(row.rank_change)}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.movePanel, styles.movePanelDown]}>
                <Text style={[styles.movePanelTitle, styles.down]}>↓ STØRSTE FALL</Text>
                {(data.movers?.fallers || []).slice(0, 3).map((row, index) => (
                  <View key={row.entry} style={styles.moveRow}>
                    <Text style={styles.moveRank}>{index + 1}</Text>
                    <Text style={styles.moveName} numberOfLines={1}>{row.manager}</Text>
                    <Text style={[styles.moveValue, styles.down]}>-{Math.abs(row.rank_change)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function SectionHeader({ title, action, icon, compact = false }: { title: string; action: string; icon?: string; compact?: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleWrap}>
        {icon ? <Text style={styles.sectionIcon}>{icon}</Text> : null}
        <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>{title}</Text>
      </View>
      <Text style={styles.sectionAction}>{action}</Text>
    </View>
  );
}

function TeamBadge({ name }: { name: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word.slice(0, 1).toUpperCase()).join("");
  return <View style={styles.teamBadge}><Text style={styles.teamBadgeText}>{initials || "?"}</Text></View>;
}

function StoryRow({ story, icon }: { story: Story; icon: string }) {
  return (
    <View style={styles.storyRow}>
      <Text style={styles.storyIcon}>{icon}</Text>
      <Text style={styles.storyHeadline} numberOfLines={2}>{story.headline}</Text>
      {story.meta ? <Text style={styles.storyMeta} numberOfLines={1}>{story.meta}</Text> : null}
    </View>
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
          <Text style={styles.tableTitle} numberOfLines={1}>{title}</Text>
        </View>
        <Text style={styles.tableAction}>{action}</Text>
      </Pressable>
      <View style={styles.tableColumns}>
        <Text style={styles.tableColRank}>#</Text>
        <Text style={styles.tableColName}>MANAGER</Text>
        <Text style={styles.tableColValue}>POENG</Text>
        {move ? <Text style={styles.tableColMove}>+/-</Text> : null}
      </View>
      {rows.map((row) => (
        <Pressable key={row.entry} onPress={() => onPressRow(row)} style={({ pressed }) => [styles.tableRow, pressed && styles.pressed]}>
          <Text style={styles.tableRank}>{rank(row)}</Text>
          <Text style={styles.tableName} numberOfLines={1}>{row.manager}</Text>
          <Text style={styles.tableValue}>{value(row)}</Text>
          {move ? (
            <Text style={[styles.tableMove, row.rank_change > 0 ? styles.up : row.rank_change < 0 ? styles.down : null]}>
              {row.rank_change > 0 ? `+${row.rank_change}` : row.rank_change || "–"}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

function fixtureWhen(fixture: Fixture) {
  const label = fixture.status_label || fixture.status;
  if (label && /live|pågår/i.test(label)) return label.toUpperCase();
  if (fixture.kickoff) {
    const date = new Date(fixture.kickoff);
    if (!Number.isNaN(date.getTime())) {
      const weekday = new Intl.DateTimeFormat("nb-NO", { weekday: "short" }).format(date).replace(".", "").toUpperCase();
      const time = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
      return `${weekday} ${time}`;
    }
  }
  return (label || "NESTE KAMP").toUpperCase();
}

const styles = StyleSheet.create({
  brandHeader: { minHeight: 108, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 15, backgroundColor: colors.panel, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  logo: { color: colors.ink, fontSize: 31, fontWeight: "900", letterSpacing: 6.2, lineHeight: 34 },
  logoSub: { color: colors.muted, fontSize: 11, fontWeight: "500", letterSpacing: 4.8, marginTop: 2 },
  taglineWrap: { alignItems: "flex-start", paddingBottom: 1 },
  tagline: { color: colors.muted, fontSize: 8, lineHeight: 11, fontWeight: "800", letterSpacing: 2.2 },
  taglineLine: { width: 32, height: 2, backgroundColor: colors.live, marginTop: 7 },

  fixtureSection: { backgroundColor: colors.peach, paddingTop: 10, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  sectionHeader: { paddingHorizontal: 18, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  sectionTitleWrap: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  sectionTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 28, lineHeight: 33, fontWeight: "700", letterSpacing: -0.6 },
  sectionTitleCompact: { fontSize: 24, lineHeight: 29 },
  sectionIcon: { color: colors.live, fontSize: 19 },
  sectionAction: { color: colors.live, fontSize: 8, fontWeight: "900", letterSpacing: 1.2, flexShrink: 0 },
  fixtureRail: { paddingHorizontal: 18, paddingTop: 10, gap: 5 },
  fixtureCard: { width: 180, backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, transform: [{ skewX: "-7deg" }], marginHorizontal: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  fixtureCardFirst: { borderLeftWidth: 4, borderLeftColor: colors.live },
  fixtureInner: { minHeight: 105, paddingHorizontal: 13, paddingVertical: 10, transform: [{ skewX: "7deg" }] },
  fixtureTopline: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 7, backgroundColor: colors.live },
  fixtureWhen: { color: colors.ink, fontSize: 8, fontWeight: "900", letterSpacing: 1.15 },
  fixtureTeamsRow: { marginTop: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  teamBadge: { width: 29, height: 29, borderRadius: 15, backgroundColor: colors.player, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  teamBadgeText: { color: colors.ink, fontSize: 9, fontWeight: "900" },
  fixtureDash: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  fixtureName: { marginTop: 8, textAlign: "center", color: colors.ink, fontSize: 12, fontWeight: "700" },

  newsSection: { backgroundColor: colors.panel, paddingTop: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  newsGrid: { flexDirection: "row", gap: 10, paddingHorizontal: 18, paddingTop: 8 },
  storyList: { flex: 1.55, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  storyRow: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  storyIcon: { width: 19, color: colors.live, fontSize: 15, fontWeight: "900", textAlign: "center" },
  storyHeadline: { flex: 1, color: colors.ink, fontFamily: "Georgia", fontSize: 12.5, lineHeight: 16, fontWeight: "700" },
  storyMeta: { maxWidth: 44, color: colors.muted, fontSize: 8.5, textAlign: "right" },
  quoteCard: { flex: 0.72, backgroundColor: colors.peach, paddingHorizontal: 11, paddingVertical: 12, justifyContent: "center" },
  quote: { color: colors.ink, fontFamily: "Georgia", fontStyle: "italic", fontSize: 12, lineHeight: 17 },
  quoteRule: { width: 30, height: 2, backgroundColor: colors.live, marginTop: 12, marginBottom: 8 },
  quoteBrand: { color: colors.ink, fontSize: 8, fontWeight: "900", letterSpacing: 2.1 },
  quoteBrandSub: { color: colors.muted, fontSize: 6, fontWeight: "700", letterSpacing: 1.5, marginTop: 1 },

  tablesSection: { backgroundColor: colors.peach, paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tablesGrid: { flexDirection: "row", gap: 7 },
  tableCard: { flex: 1, minWidth: 0, backgroundColor: colors.panel, paddingHorizontal: 8, paddingTop: 9, paddingBottom: 6, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  tableHeader: { minHeight: 31, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  tableTitleWrap: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  tableIcon: { color: colors.live, fontSize: 13, fontWeight: "900" },
  tableTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 17, lineHeight: 20, fontWeight: "700", flexShrink: 1 },
  tableAction: { color: colors.live, fontSize: 5.7, fontWeight: "900", letterSpacing: 0.65 },
  tableColumns: { minHeight: 22, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tableColRank: { width: 14, color: colors.muted, fontSize: 6.5, fontWeight: "900" },
  tableColName: { flex: 1, color: colors.muted, fontSize: 6.5, fontWeight: "900", letterSpacing: 0.7 },
  tableColValue: { width: 31, textAlign: "right", color: colors.muted, fontSize: 6.5, fontWeight: "900", letterSpacing: 0.4 },
  tableColMove: { width: 22, textAlign: "right", color: colors.muted, fontSize: 6.5, fontWeight: "900" },
  tableRow: { minHeight: 31, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tableRank: { width: 14, color: colors.ink, fontSize: 10, fontVariant: ["tabular-nums"] },
  tableName: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 9.5, fontWeight: "600" },
  tableValue: { width: 31, textAlign: "right", color: colors.ink, fontSize: 10, fontWeight: "800", fontVariant: ["tabular-nums"] },
  tableMove: { width: 22, textAlign: "right", color: colors.muted, fontSize: 9, fontWeight: "800", fontVariant: ["tabular-nums"] },

  playersSection: { backgroundColor: colors.panel, paddingTop: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  playerRail: { paddingHorizontal: 18, paddingTop: 9, gap: 7 },
  playerCard: { width: 124, minHeight: 116, backgroundColor: colors.white, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, overflow: "hidden", flexDirection: "row" },
  playerImage: { width: 52, alignSelf: "stretch", backgroundColor: colors.player },
  playerImageFallback: { width: 52, alignSelf: "stretch", backgroundColor: colors.player, alignItems: "center", justifyContent: "center" },
  playerInitial: { color: colors.ink, fontFamily: "Georgia", fontSize: 25, fontWeight: "700" },
  playerCopy: { flex: 1, paddingHorizontal: 7, paddingVertical: 8 },
  playerName: { color: colors.ink, fontSize: 12.5, fontWeight: "800" },
  playerOwnership: { color: colors.muted, fontSize: 8.5, lineHeight: 11, marginTop: 3 },
  playerPoints: { color: colors.green, fontSize: 16, lineHeight: 19, fontWeight: "900", marginTop: 6, fontVariant: ["tabular-nums"] },
  playerRound: { color: colors.muted, fontSize: 7.5 },

  movesSection: { backgroundColor: colors.panel, paddingTop: 12, paddingBottom: 24 },
  movesGrid: { flexDirection: "row", gap: 7, paddingHorizontal: 18, paddingTop: 9 },
  movePanel: { flex: 1, minWidth: 0, borderRadius: 8, paddingHorizontal: 9, paddingTop: 9, paddingBottom: 7 },
  movePanelUp: { backgroundColor: "#EAF2E8" },
  movePanelDown: { backgroundColor: "#F8E8E4" },
  movePanelTitle: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8, marginBottom: 5 },
  moveRow: { minHeight: 31, flexDirection: "row", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,23,21,0.11)" },
  moveRank: { width: 15, color: colors.muted, fontSize: 9 },
  moveName: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 9.5 },
  moveValue: { color: colors.ink, fontSize: 10.5, fontWeight: "900", fontVariant: ["tabular-nums"] },

  pressed: { opacity: 0.58 },
  up: { color: colors.green },
  down: { color: colors.live },
  empty: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 8 },
});
