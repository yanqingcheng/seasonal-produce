// Which pack a ?country= value may open. Unknown ids fall back to the UK
// pack when it is shipped, otherwise the first shipped or ready row.

export function resolvePackId(requested, registry) {
  const rows = Array.isArray(registry) ? registry : [];
  const usable = rows.filter((row) => row && (row.status === "shipped" || row.status === "ready") && row.id);
  const ids = new Set(usable.map((row) => row.id));
  if (requested && ids.has(requested)) return requested;
  if (ids.has("uk")) return "uk";
  return usable[0]?.id ?? "uk";
}
