import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { api } from "@/lib/api";
import { colors, radius, space } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import {
  registerRemotePush,
  sendLocalTestNotification,
  sendRemoteTestNotification,
} from "@/lib/notifications";

export default function NotificationsScreen() {
  const managers = useRemote(() => api.managers());
  const [entryId, setEntryId] = useState(0);
  const [message, setMessage] = useState(
    "Velg deg selv først. Da vet Lofthus hvem som skal få personlige livevarsler.",
  );
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState<"local" | "register" | "remote" | null>(null);

  async function runLocalTest() {
    setBusy("local");
    try {
      const result = await sendLocalTestNotification();
      setMessage(result.message);
    } finally {
      setBusy(null);
    }
  }

  async function enableRemotePush() {
    if (!entryId) {
      setMessage("Velg manageren din før du slår på personlige pushvarsler.");
      return;
    }
    setBusy("register");
    try {
      const result = await registerRemotePush(entryId);
      if (result.token) setToken(result.token);
      setMessage(result.message);
    } finally {
      setBusy(null);
    }
  }

  async function runRemoteTest() {
    if (!token) return;
    setBusy("remote");
    try {
      const result = await sendRemoteTestNotification(token);
      setMessage(result.message);
    } finally {
      setBusy(null);
    }
  }

  const selected = managers.data?.managers.find((m) => m.entry === entryId);

  return (
    <Screen kicker="Lofthus på mobilen" title="Varsler">
      <View style={styles.card}>
        <Ionicons name="notifications-outline" size={28} color={colors.ink} />
        <Text style={styles.cardTitle}>Live på laget ditt</Text>
        <Text style={styles.body}>
          Lofthus kan varsle når en spiller som faktisk teller på laget ditt scorer, assisterer, bommer på straffe eller får rødt. I tillegg kan vi bruke samme system til deadline og tabellendringer.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>HVEM ER DU?</Text>
      {managers.loading && !managers.data ? <Loading /> : null}
      {managers.error && !managers.data ? <ErrorState message={managers.error} /> : null}
      {managers.data ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.managerRow}>
          {managers.data.managers.map((manager) => (
            <Pressable
              key={manager.entry}
              onPress={() => {
                setEntryId(manager.entry);
                setToken(null);
                setMessage(`${manager.manager} valgt. Slå på pushvarsler når du er klar.`);
              }}
              style={({ pressed }) => [styles.managerChip, entryId === manager.entry && styles.managerChipActive, pressed && styles.pressed]}
            >
              <Text style={[styles.managerName, entryId === manager.entry && styles.managerNameActive]}>{manager.manager}</Text>
              <Text style={[styles.managerRank, entryId === manager.entry && styles.managerRankActive]}>#{manager.rank || "–"}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {selected ? (
        <View style={styles.selectedBox}>
          <Text style={styles.statusLabel}>VALGT MANAGER</Text>
          <Text style={styles.selectedName}>{selected.manager}</Text>
          <Text style={styles.body}>{selected.team}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy !== null}
        onPress={runLocalTest}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, busy !== null && styles.disabled]}
      >
        <Ionicons name="flash-outline" size={18} color={colors.white} />
        <Text style={styles.buttonText}>{busy === "local" ? "Sender ..." : "Test varsel på mobilen"}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={busy !== null || !entryId}
        onPress={enableRemotePush}
        style={({ pressed }) => [
          styles.button,
          styles.secondaryButton,
          pressed && styles.pressed,
          (busy !== null || !entryId) && styles.disabled,
        ]}
      >
        <Ionicons name="notifications" size={18} color={colors.ink} />
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          {busy === "register" ? "Kobler til ..." : "Slå på personlige pushvarsler"}
        </Text>
      </Pressable>

      {token ? (
        <Pressable
          accessibilityRole="button"
          disabled={busy !== null}
          onPress={runRemoteTest}
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.pressed,
            busy !== null && styles.disabled,
          ]}
        >
          <Ionicons name="paper-plane-outline" size={18} color={colors.ink} />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {busy === "remote" ? "Sender ..." : "Send test-push fra server"}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.status}>
        <Text style={styles.statusLabel}>STATUS</Text>
        <Text style={styles.statusText}>{message}</Text>
      </View>

      <Text style={styles.note}>
        Ekte server-push krever en development build med Apple/Expo push-credentials. Lokale testvarsler kan testes tidligere.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: 18,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 22,
    marginTop: 10,
    marginBottom: 7,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    color: colors.live,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  managerRow: { gap: 8, paddingRight: 24, paddingBottom: 14 },
  managerChip: {
    minWidth: 130,
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  managerChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  managerName: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  managerNameActive: { color: colors.white },
  managerRank: { color: colors.muted, fontSize: 10, marginTop: 3 },
  managerRankActive: { color: "#CFC9C0" },
  selectedBox: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.peach,
    marginBottom: 14,
  },
  selectedName: { color: colors.ink, fontFamily: "Georgia", fontSize: 19, fontWeight: "700", marginTop: 4 },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: colors.ink,
  },
  status: {
    marginTop: 8,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.peach,
  },
  statusLabel: {
    color: colors.live,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  statusText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  note: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
  },
  pressed: { opacity: 0.62 },
  disabled: { opacity: 0.5 },
});