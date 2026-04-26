"use client";

import dynamic from "next/dynamic";

const KanbanBoard = dynamic(
  () => import("@/components/KanbanBoard").then((m) => m.KanbanBoard),
  { ssr: false }
);

export function HomeBoard() {
  return <KanbanBoard />;
}
