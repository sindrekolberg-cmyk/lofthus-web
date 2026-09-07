import { useCallback } from "react";
import { api } from "@/lib/api";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { HomeHeader } from "@/components/home/HomeHeader";
import { FixtureRail } from "@/components/home/FixtureRail";
import { Snakkiser } from "@/components/home/Snakkiser";
import { MiniTables } from "@/components/home/MiniTables";
import { TalkersRail } from "@/components/home/TalkersRail";
import { Movers } from "@/components/home/Movers";

export default function HomeScreen() {
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
          <HomeHeader />
          <FixtureRail fixtures={data.pulse.fixtures || []} />
          <Snakkiser stories={stories} />
          <MiniTables top5={data.top5} monthName={data.month.name} monthRows={data.month.table} />
          <TalkersRail players={data.popular || []} />
          <Movers climbers={data.movers?.climbers || []} fallers={data.movers?.fallers || []} />
        </>
      ) : null}
    </Screen>
  );
}
