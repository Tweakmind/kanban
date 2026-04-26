import { describe, expect, it } from "vitest";
import {
  INITIAL_COLUMNS,
  addCard,
  applyDragEnd,
  deleteCard,
  findCardLocation,
  renameColumn,
  type Column,
} from "./board";

describe("findCardLocation", () => {
  it("returns indices for an existing card", () => {
    const loc = findCardLocation(INITIAL_COLUMNS, "card-1");
    expect(loc).toEqual({
      columnIndex: 0,
      cardIndex: 0,
      columnId: "col-backlog",
    });
  });

  it("returns null for unknown card", () => {
    expect(findCardLocation(INITIAL_COLUMNS, "missing")).toBeNull();
  });
});

describe("renameColumn", () => {
  it("updates only the matching column title", () => {
    const next = renameColumn(INITIAL_COLUMNS, "col-ready", "Ready when you are");
    expect(next.find((c) => c.id === "col-ready")?.title).toBe("Ready when you are");
    expect(next.find((c) => c.id === "col-backlog")?.title).toBe("Backlog");
  });
});

describe("addCard", () => {
  it("appends a card to the given column", () => {
    const next = addCard(INITIAL_COLUMNS, "col-done", "Ship it", "All checks green", "new-id");
    const done = next.find((c) => c.id === "col-done");
    expect(done?.cards.some((c) => c.id === "new-id")).toBe(true);
    expect(done?.cards.find((c) => c.id === "new-id")?.title).toBe("Ship it");
  });
});

describe("deleteCard", () => {
  it("removes the card from its column", () => {
    const next = deleteCard(INITIAL_COLUMNS, "card-4");
    const col = next.find((c) => c.id === "col-progress");
    expect(col?.cards.some((c) => c.id === "card-4")).toBe(false);
  });
});

describe("applyDragEnd", () => {
  it("returns the same reference when over is missing", () => {
    const next = applyDragEnd(INITIAL_COLUMNS, "card-1", undefined);
    expect(next).toBe(INITIAL_COLUMNS);
  });

  it("moves a card to another column when dropped on the column", () => {
    const next = applyDragEnd(INITIAL_COLUMNS, "card-1", "col-ready");
    expect(findCardLocation(next, "card-1")?.columnId).toBe("col-ready");
    expect(findCardLocation(INITIAL_COLUMNS, "card-1")?.columnId).toBe("col-backlog");
  });

  it("inserts before a target card in another column", () => {
    const next = applyDragEnd(INITIAL_COLUMNS, "card-1", "card-3");
    const ready = next.find((c) => c.id === "col-ready")!;
    expect(ready.cards[0].id).toBe("card-1");
    expect(ready.cards[1].id).toBe("card-3");
  });

  it("reorders within the same column when dropped on a sibling card", () => {
    const next = applyDragEnd(INITIAL_COLUMNS, "card-1", "card-2");
    const backlog = next.find((c) => c.id === "col-backlog")!;
    expect(backlog.cards[0].id).toBe("card-2");
    expect(backlog.cards[1].id).toBe("card-1");
  });

  it("moves to end of the same column when dropped on the column droppable", () => {
    const cols: Column[] = [
      {
        id: "c-a",
        title: "A",
        cards: [
          { id: "x", title: "first", details: "" },
          { id: "y", title: "second", details: "" },
        ],
      },
    ];
    const next = applyDragEnd(cols, "x", "c-a");
    const a = next[0];
    expect(a.cards[0].id).toBe("y");
    expect(a.cards[1].id).toBe("x");
  });
});
