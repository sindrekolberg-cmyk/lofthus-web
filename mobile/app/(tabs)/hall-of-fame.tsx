import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { useRemote } from "@/lib/useRemote";
import type { HallRow } from "@/lib/types";
import { emptyHonours, type HallTab } from "@/lib/hall";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { HallTabs } from "@/components/hall/HallTabs";
import { HallOverview } from "@/components/hall/HallOverview";
import { HallManagerSearch } from "@/components/hall/HallManagerSearch";
import { HallManagerProfile } from "@/components/hall/HallManagerProfile";
import { HallSeasonHistory } from "@/components/hall/HallSeasonHistory";
import { HallMonthlyHistory } from "@/components/hall/HallMonthlyHistory";
import { HallCupHistory } from "@/components/hall/HallCupHistory";
import { HallRandomPlacement } from "@/components/hall/HallRandomPlacement";
import { hallStyles } from "@/components/hall/hallStyles";

export default function HallScreen() {
  const loader = useCallback(() => api.hallOfFame(), []);
  const remote = useRemote(loader);
  const [tab, setTab] = useState<HallTab>("overview");
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const data = remote.data;

  const rows = data?.rows || [];
  const selected = rows.find((row) => row.manager === selectedName) || null;
  const matches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("nb");
    if (!q || selected) return [];
    return rows.filter((row) => row.manager.toLocaleLowerCase("nb").includes(q)).slice(0, 5);
  }, [query, rows, selected]);

  function chooseManager(row: HallRow) {
    setSelectedName(row.manager);
    setQuery(row.manager);
    setTab("managers");
  }

  function clearManager() {
    setSelectedName("");
    setQuery("");
  }

  function randomManager() {
    if (!rows.length) return;
    const pick = rows[Math.floor(Math.random() * rows.length)];
    chooseManager(withHonours(pick));
  }

  return (
    <Screen kicker="Historie" title="Hall of Fame" compactHeader refreshing={remote.refreshing} onRefresh={remote.refresh}>
      <Text style={hallStyles.lead}>Hele Lofthus-historien. Søk opp en manager, eller les listen over ligaens største.</Text>
      {remote.loading && !data ? <Loading /> : null}
      {remote.error && !data ? <ErrorState message={remote.error} /> : null}
      {data ? (
        <>
          <HallManagerSearch
            query={query}
            onQuery={(value) => {
              setQuery(value);
              if (selectedName && value !== selectedName) setSelectedName("");
            }}
            matches={matches}
            selected={selected}
            onSelect={chooseManager}
            onClear={clearManager}
            onRandom={randomManager}
          />
          <View style={styles.tabs}>
            <HallTabs value={tab} onChange={setTab} />
          </View>
          {tab === "overview" ? (
            <HallOverview data={data} onOpen={setTab} onSelectManager={chooseManager} />
          ) : null}
          {tab === "seasons" ? <HallSeasonHistory data={data} /> : null}
          {tab === "month" ? <HallMonthlyHistory data={data} /> : null}
          {tab === "cup" ? <HallCupHistory data={data} /> : null}
          {tab === "random" ? <HallRandomPlacement random={data.random} /> : null}
          {tab === "managers" ? (
            selected ? (
              <HallManagerProfile data={data} row={withHonours(selected)} />
            ) : (
              <Text style={hallStyles.empty}>Søk etter en manager for å åpne profilen.</Text>
            )
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function withHonours(row: HallRow): HallRow {
  return {
    ...emptyHonours(),
    ...row,
    league_silver: row.league_silver || 0,
    league_bronze: row.league_bronze || 0,
    cup_silver: row.cup_silver || 0,
    league_seasons: row.league_seasons || [],
    cup_seasons: row.cup_seasons || [],
  };
}

const styles = StyleSheet.create({
  tabs: { marginTop: 16, marginBottom: 8 },
});
