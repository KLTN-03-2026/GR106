import React from 'react'
import { PlotStatus } from '../../../types/landPlot'

interface PlotStatusBadgeProps {
  status: PlotStatus
}

export function PlotStatusBadge({ status }: PlotStatusBadgeProps) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        Đang canh tác
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
      Đang nghỉ
    </span>
  )
}
