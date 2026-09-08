import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { api, type LeagueConnectPayload } from "@/lib/api";
import { useProfile } from "@/lib/profile";
import { colors, radius, space } from "@/lib/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const [leagueId, setLeagueId] = useState(String(profile.leagueId || 25220));
  const [connected, setConnected] = useState<LeagueConnectPayload | null>(null);
  const [entryId, setEntryId] = useState(profile.entryId || 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => connected?.managers.find((manager) => manager.entry === entryId) || null,
    [connected, entryId],
  );

  async function connect() {
    const id = Number(leagueId.replace(/\D/g, ""));
    if (!id) {
      setError("Skriv inn liga-ID-en fra FPL.");
      return;
    }
    setBusy(true);
    setError("");
    setConnected(null);
    try {
      const payload = await api.connectLeague(id);
      setConnected(payload);
      const currentStillExists = payload.managers.some((manager) => manager.entry === profile.entryId);
      setEntryId(currentStillExists ? profile.entryId : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente ligaen.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!connected || !selected) return;
    saveProfile({
      leagueId: connected.league.id,
      leagueName: connected.league.name,
      leagueSize: connected.league.size,
      season: connected.league.season,
      entryId: selected.entry,
      managerName: selected.manager,
      team: selected.team,
    });
    router.replace("/(tabs)");
  }

  return (
    <Screen kicker="Profil" title="Min liga">
      <Text style={styles.intro}>
        Koble appen til en FPL-miniliga og velg hvem du er. Valget lagres på mobilen og brukes automatisk i Din liga, analyse og varsler.
      </Text>

      {profile.entryId ? (
        <View style={styles.current}>
          <Text style={styles.label}>AKTIV PROFIL</Text>
          <Text style={styles.currentLeague}>{profile.leagueName}</Text>
          <Text style={styles.currentManager}>{profile.managerName} · {profile.team}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>FPL LIGA-ID</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={leagueId}
          onChangeText={setLeagueId}
          keyboardType="number-pad"
          autoCorrect={false}
          placeholder="25220"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable disabled={busy} onPress={connect} style={({ pressed }) => [styles.connectButton, busy && styles.disabled, pressed && styles.pressed]}>
          <Text style={styles.connectText}>Hent liga</Text>
        </Pressable>
      </View>
      <Text style={styles.help}>Liga-ID-en står i adressen til miniligaen på Fantasy Premier League.</Text>

      {busy ? <Loading label="Henter liga og managere …" /> : null}
      {error ? <ErrorState message={error} /> : null}

      {connected ? (
        <>
          <View style={styles.leagueCard}>
            <Text style={styles.label}>FUNNET</Text>
            <Text style={styles.leagueName}>{connected.league.name}</Text>
            <Text style={styles.leagueMeta}>{connected.league.size} managere · {connected.league.season}</Text>
          </View>

          <Text style={styles.label}>HVEM ER DU?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.managerRow}>
            {connected.managers.map((manager) => (
              <Pressable
                key={manager.entry}
                onPress={() => setEntryId(manager.entry)}
                style={({ pressed }) => [styles.managerChip, entryId === manager.entry && styles.managerChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.managerName, entryId === manager.entry && styles.managerNameActive]}>{manager.manager}</Text>
                <Text style={[styles.managerMeta, entryId === manager.entry && styles.managerMetaActive]}>{manager.team} · #{manager.rank || "–"}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable disabled={!selected} onPress={save} style={({ pressed }) => [styles.saveButton, !selected && styles.disabled, pressed && styles.pressed]}>
            <Text style={styles.saveText}>{selected ? `Bruk ${selected.manager}` : "Velg manager"}</Text>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: -6, marginBottom: 20 },
  current: { backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: space.lg, marginBottom: 20 },
  label: { color: colors.live, fontSize: 9, fontWeight: "900", letterSpacing: 1.2, marginBottom: 7 },
  currentLeague: { color: colors.ink, fontFamily: "Georgia", fontSize: 20, fontWeight: "700" },
  currentManager: { color: colors.muted, fontSize: 12, marginTop: 4 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, minHeight: 48, backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, color: colors.ink, fontSize: 17, fontWeight: "800" },
  connectButton: { minHeight: 48, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  connectText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  help: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7, marginBottom: 18 },
  leagueCard: { borderTopWidth: 1, borderTopColor: colors.ink, paddingTop: 14, paddingBottom: 18, marginTop: 4 },
  leagueName: { color: colors.ink, fontFamily: "Georgia", fontSize: 23, fontWeight: "700" },
  leagueMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  managerRow: { gap: 8, paddingRight: 20, paddingBottom: 18 },
  managerChip: { width: 174, minHeight: 70, backgroundColor: colors.panel, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: 11, justifyContent: "center" },
  managerChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  managerName: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  managerNameActive: { color: colors.white },
  managerMeta: { color: colors.muted, fontSize: 9, lineHeight: 13, marginTop: 4 },
  managerMetaActive: { color: "#CFC9C0" },
  saveButton: { minHeight: 52, borderRadius: radius.md, backgroundColor: colors.dark, alignItems: "center", justifyContent: "center" },
  saveText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.62 },
});
