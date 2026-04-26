import { arrayMove } from "@dnd-kit/sortable";

export type Card = { id: string; title: string; details: string };

export type Column = { id: string; title: string; cards: Card[] };

export function findCardLocation(
  columns: Column[],
  cardId: string
): { columnIndex: number; cardIndex: number; columnId: string } | null {
  for (let ci = 0; ci < columns.length; ci++) {
    const ri = columns[ci].cards.findIndex((c) => c.id === cardId);
    if (ri !== -1) {
      return { columnIndex: ci, cardIndex: ri, columnId: columns[ci].id };
    }
  }
  return null;
}

export function applyDragEnd(
  columns: Column[],
  activeId: string,
  overId: string | undefined
): Column[] {
  if (!overId || activeId === overId) return columns;

  const from = findCardLocation(columns, activeId);
  if (!from) return columns;

  const overColumnIndex = columns.findIndex((c) => c.id === overId);
  const overCardLoc = findCardLocation(columns, overId);

  let toColIdx: number;
  let insertIndex: number;

  if (overColumnIndex !== -1) {
    toColIdx = overColumnIndex;
    insertIndex = columns[toColIdx].cards.length;
  } else if (overCardLoc) {
    toColIdx = overCardLoc.columnIndex;
    insertIndex = overCardLoc.cardIndex;
  } else {
    return columns;
  }

  if (from.columnIndex === toColIdx) {
    const cards = [...columns[toColIdx].cards];
    const oldIndex = from.cardIndex;
    let newIndex: number;
    if (overColumnIndex !== -1) {
      newIndex = Math.max(0, cards.length - 1);
    } else if (overCardLoc && overCardLoc.columnIndex === from.columnIndex) {
      newIndex = overCardLoc.cardIndex;
    } else {
      return columns;
    }
    if (oldIndex === newIndex) return columns;
    return columns.map((c, i) =>
      i === toColIdx ? { ...c, cards: arrayMove(cards, oldIndex, newIndex) } : c
    );
  }

  const card = columns[from.columnIndex].cards[from.cardIndex];
  const without = columns.map((c, i) =>
    i === from.columnIndex
      ? { ...c, cards: c.cards.filter((x) => x.id !== activeId) }
      : c
  );

  const targetCards = [...without[toColIdx].cards];
  targetCards.splice(insertIndex, 0, card);
  return without.map((c, i) => (i === toColIdx ? { ...c, cards: targetCards } : c));
}

export function addCard(
  columns: Column[],
  columnId: string,
  title: string,
  details: string,
  id: string
): Column[] {
  return columns.map((c) =>
    c.id === columnId
      ? { ...c, cards: [...c.cards, { id, title, details }] }
      : c
  );
}

export function deleteCard(columns: Column[], cardId: string): Column[] {
  return columns.map((c) => ({
    ...c,
    cards: c.cards.filter((x) => x.id !== cardId),
  }));
}

export function renameColumn(
  columns: Column[],
  columnId: string,
  title: string
): Column[] {
  return columns.map((c) => (c.id === columnId ? { ...c, title } : c));
}

export const INITIAL_COLUMNS: Column[] = [
  {
    id: "col-backlog",
    title: "Backlog",
    cards: [
      {
        id: "card-1",
        title: "Design board chrome",
        details:
          "Column headers, card shadows, and accent strip aligned to the brand palette.",
      },
      {
        id: "card-2",
        title: "Write acceptance checklist",
        details: "Cover rename, add, delete, and drag across all five columns.",
      },
    ],
  },
  {
    id: "col-ready",
    title: "Ready",
    cards: [
      {
        id: "card-3",
        title: "Pick drag-and-drop library",
        details: "dnd-kit for accessibility and App Router compatibility.",
      },
    ],
  },
  {
    id: "col-progress",
    title: "In progress",
    cards: [
      {
        id: "card-4",
        title: "Implement Kanban state",
        details: "In-memory columns and cards; no persistence for MVP.",
      },
      {
        id: "card-5",
        title: "Hook up sensors",
        details: "Pointer activation distance to avoid accidental drags.",
      },
    ],
  },
  {
    id: "col-review",
    title: "Review",
    cards: [
      {
        id: "card-6",
        title: "UX polish pass",
        details: "Spacing, focus rings, and button hierarchy using purple for primary actions.",
      },
    ],
  },
  {
    id: "col-done",
    title: "Done",
    cards: [
      {
        id: "card-7",
        title: "Seed dummy data",
        details: "Ship with realistic titles and details so the board feels alive on load.",
      },
    ],
  },
];
