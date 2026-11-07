export function getDaytimeGreeting(): { greeting: string; subtitle: string } {
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Good afternoon';
  }

  return {
    greeting,
    subtitle: 'Take a moment for yourself.',
  };
}

export function formatTimeMMSS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const m = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const s = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${m}:${s}`;
}

export function formatMinutesLabel(minutes: number): string {
  return `${minutes} min`;
}

