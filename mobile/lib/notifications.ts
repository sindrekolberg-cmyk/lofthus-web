import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const PUSH_BASE = (
  process.env.EXPO_PUBLIC_PUSH_BASE_URL || "https://lofthus-road-open-push.onrender.com"
).replace(/\/$/, "");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushResult = {
  ok: boolean;
  message: string;
  token?: string;
};

async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

function projectId(): string | undefined {
  const fromEas = Constants.easConfig?.projectId;
  if (fromEas) return fromEas;

  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string }; projectId?: string }
    | undefined;
  return extra?.eas?.projectId || extra?.projectId || process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${PUSH_BASE}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as T & { detail?: string };
  if (!response.ok) {
    throw new Error(payload.detail || `Push-serveren svarte ${response.status}`);
  }
  return payload;
}

export async function sendLocalTestNotification(): Promise<PushResult> {
  const granted = await ensureNotificationPermission();
  if (!granted) {
    return { ok: false, message: "Varsler er ikke tillatt på denne mobilen." };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Lofthus Road Open",
      body: "Varslene virker. Freden er dermed offisielt over.",
      sound: "default",
      data: { path: "/" },
    },
    trigger: null,
  });

  return { ok: true, message: "Testvarsel sendt til denne mobilen." };
}

export async function registerRemotePush(entryId?: number | null): Promise<PushResult> {
  const granted = await ensureNotificationPermission();
  if (!granted) {
    return { ok: false, message: "Varsler er ikke tillatt på denne mobilen." };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Lofthus",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  }

  const easProjectId = projectId();
  if (!easProjectId) {
    return {
      ok: false,
      message:
        "Pushkoden er klar, men denne installasjonen mangler EAS projectId. Remote push må testes i en development build.",
    };
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: easProjectId })).data;
    await postJson("/api/push/subscribe", {
      expo_push_token: token,
      platform: Platform.OS,
      entry_id: entryId ?? null,
      prefs: {
        league: true,
        deadline: true,
        personal: true,
        live_events: true,
      },
    });

    return {
      ok: true,
      token,
      message: "Pushvarsler er slått på for denne mobilen.",
    };
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    const expoGo = /expo go|development build|remote notification/i.test(text);
    return {
      ok: false,
      message: expoGo
        ? "Lokale varsler virker i Expo Go, men ekte push fra server krever en development build."
        : `Kunne ikke slå på push: ${text}`,
    };
  }
}

export async function sendRemoteTestNotification(token: string): Promise<PushResult> {
  try {
    await postJson("/api/push/test", { expo_push_token: token });
    return { ok: true, token, message: "Test-push sendt fra Lofthus-serveren." };
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    return { ok: false, token, message: `Test-push feilet: ${text}` };
  }
}
