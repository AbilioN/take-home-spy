export type LatLngPoint = { lat: number; lng: number }

const POINTS_PER_REQUEST = 100

type SnapResponse = {
  snappedPoints?: { location: { latitude: number; longitude: number } }[]
}

/**
 * Aligns a GPS path to the road network via Google Roads API (Snap to Roads).
 * Requires the same API key project to have "Roads API" enabled.
 * @see https://developers.google.com/maps/documentation/roads/snap
 */
export async function snapToRoadsPath(points: LatLngPoint[], apiKey: string): Promise<LatLngPoint[]> {
  if (points.length === 0) return []
  if (points.length === 1) return points

  const batches: LatLngPoint[][] = []
  for (let i = 0; i < points.length; i += POINTS_PER_REQUEST - 1) {
    batches.push(points.slice(i, i + POINTS_PER_REQUEST))
  }

  const merged: LatLngPoint[] = []

  for (const batch of batches) {
    const pathQuery = batch.map((p) => `${p.lat},${p.lng}`).join('|')
    const url =
      `https://roads.googleapis.com/v1/snapToRoads?interpolate=true&path=${encodeURIComponent(pathQuery)}` +
      `&key=${encodeURIComponent(apiKey)}`

    const res = await fetch(url)
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Snap to Roads HTTP ${res.status}: ${body.slice(0, 200)}`)
    }

    const data = (await res.json()) as SnapResponse
    const snapped =
      data.snappedPoints?.map((s) => ({
        lat: s.location.latitude,
        lng: s.location.longitude,
      })) ?? []

    if (snapped.length === 0) continue

    if (merged.length > 0) {
      const a = merged[merged.length - 1]
      const b = snapped[0]
      const same =
        Math.abs(a.lat - b.lat) < 1e-8 && Math.abs(a.lng - b.lng) < 1e-8
      if (same) merged.pop()
    }
    merged.push(...snapped)
  }

  return merged.length >= 2 ? merged : points
}
