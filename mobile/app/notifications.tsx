import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { colors, radius, space } from "@/lib/theme";
import {
  registerRemotePush,
  sendLocalTestNotification,
  sendRemoteTestNotification,
} from "@/lib/notifications";

export default function NotificationsScreen() {
  const [message, setMessage] = useState(
    "Test først på mobilen. Deretter kan appen registreres for ekte push fra Lofthus-serveren.",
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
    setBusy("register");
    try {
      const result = await registerRemotePush();
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

  return (
    <Screen kicker="Lofthus på mobilen" title="Varsler">
      <View style={styles.card}>
        <Ionicons name="notifications-outline" size={28} color={colors.ink} />
        <Text style={styles.cardTitle}>Ikke gå glipp av kaoset</Text>
        <Text style={styles.body}>
          Varsler kan brukes til deadline, tabellendringer og personlige hendelser. Du bestemmer fortsatt om
          menneskeheten virkelig trenger enda en grunn til å se på telefonen.
        </Text>
      </View>

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
        disabled={busy !== null}
        onPress={enableRemotePush}
        style={({ pressed }) => [
          styles.button,
          styles.secondaryButton,
          pressed && styles.pressed,
          busy !== null && styles.disabled,
        ]}
      >
        <Ionicons name="notifications" size={18} color={colors.ink} />
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          {busy === "register" ? "Kobler til ..." : "Slå på pushvarsler"}
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
        Lokale testvarsler kan fungere i Expo Go. Ekte push fra server krever en development build med
        push-credentials.
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
    marginBottom: 16,
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
