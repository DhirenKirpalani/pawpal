/* ── Lightweight analytics ──
 * Logs events to console in dev, sends to endpoint in production.
 * Non-blocking, fire-and-forget.
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

const isDev = process.env.NODE_ENV === 'development';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';
  const key = 'pawpal_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function track(event: string, properties?: Record<string, unknown>) {
  const payload: AnalyticsEvent = {
    event,
    properties: { ...properties, url: typeof window !== 'undefined' ? window.location.pathname : '' },
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  if (isDev) {
    // eslint-disable-next-line no-console
    console.log('[Analytics]', payload);
    return;
  }

  // Send to analytics endpoint (fire-and-forget)
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function identify(petName: string | null, lang: 'en' | 'id') {
  track('user_identified', { petName, lang });
}

export function trackMessage(role: 'user' | 'assistant', hasImage?: boolean) {
  track(`message_${role}`, { hasImage });
}

export function trackEmotion(emotion: string) {
  track('emotion_selected', { emotion });
}

export function trackFeatureCommand(command: string) {
  track('feature_command_used', { command });
}

export function trackNotificationPermission(status: 'granted' | 'denied' | 'default') {
  track('notification_permission', { status });
}
