export type PlotStatus = 'active' | 'resting'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface LandPlot {
  id: string
  name: string
  area: number
  description?: string
  status: PlotStatus
  boundaries?: GeoPoint[]
}
