export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

export function getSettingValue(settings: { code: string; value: string | null }[], code: string) {
  return settings.find((setting) => setting.code === code)?.value || "-";
}

export function getProgressPercent(current: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.min(100, Math.round((current / total) * 100));
}
