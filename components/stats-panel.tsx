"use client"

import type { UserState } from "@/lib/store"
import { Flame, TreePine, Star, Target } from "lucide-react"

interface StatsPanelProps {
  state: UserState
  todayCount: number
}

export default function StatsPanel({ state, todayCount }: StatsPanelProps) {
  const stats = [
    {
      icon: <Flame className="h-4 w-4" />,
      label: "Streak",
      value: `${state.streak} day${state.streak !== 1 ? "s" : ""}`,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: <TreePine className="h-4 w-4" />,
      label: "Trees",
      value: state.trees.length.toString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: <Star className="h-4 w-4" />,
      label: "Level",
      value: state.level.toString(),
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: <Target className="h-4 w-4" />,
      label: "Today",
      value: todayCount.toString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 p-3 text-center"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor} ${stat.color}`}
          >
            {stat.icon}
          </div>
          <span className="text-lg font-semibold text-card-foreground">{stat.value}</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
