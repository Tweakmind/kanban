"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  INITIAL_COLUMNS,
  addCard,
  applyDragEnd,
  deleteCard,
  renameColumn,
  type Card,
  type Column,
} from "@/lib/board";
import styles from "./KanbanBoard.module.css";

function SortableCard({
  card,
  onDelete,
}: {
  card: Card;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ""}`}
      data-testid={`card-${card.id}`}
    >
      <div className={styles.cardTop}>
        <span
          className={styles.cardTitle}
          {...attributes}
          {...listeners}
          data-testid={`card-title-${card.id}`}
        >
          {card.title}
        </span>
        <button
          type="button"
          className={styles.deleteCard}
          aria-label={`Delete card ${card.title}`}
          data-testid={`delete-card-${card.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
        >
          x
        </button>
      </div>
      <p className={styles.cardDetails}>{card.details}</p>
    </div>
  );
}

function BoardColumn({
  column,
  editingTitle,
  onStartRename,
  onCommitRename,
  onCancelRename,
  openAddCard,
  onOpenAddCard,
  onCloseAddCard,
  onAddCard,
  onDeleteCard,
}: {
  column: Column;
  editingTitle: boolean;
  onStartRename: () => void;
  onCommitRename: (title: string) => void;
  onCancelRename: () => void;
  openAddCard: boolean;
  onOpenAddCard: () => void;
  onCloseAddCard: () => void;
  onAddCard: (title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const ids = column.cards.map((c) => c.id);
  const [draftTitle, setDraftTitle] = useState(column.title);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");

  return (
    <section
      className={styles.column}
      data-testid={`column-${column.id}`}
      ref={setNodeRef}
      style={{
        outline: isOver ? `2px solid var(--color-accent)` : undefined,
        outlineOffset: 2,
      }}
    >
      <div className={styles.columnInner}>
        <div className={styles.columnHeader}>
          {editingTitle ? (
            <input
              className={styles.columnTitleInput}
              data-testid={`column-title-input-${column.id}`}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={() => onCommitRename(draftTitle.trim() || column.title)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  setDraftTitle(column.title);
                  onCancelRename();
                }
              }}
              autoFocus
            />
          ) : (
            <button
              type="button"
              className={styles.columnTitleButton}
              data-testid={`column-title-${column.id}`}
              onClick={() => {
                setDraftTitle(column.title);
                onStartRename();
              }}
            >
              {column.title}
            </button>
          )}
        </div>

        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className={styles.cardList}>
            {column.cards.length === 0 ? (
              <div className={styles.emptyHint}>Drop cards here</div>
            ) : (
              column.cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  onDelete={onDeleteCard}
                />
              ))
            )}
          </div>
        </SortableContext>

        <div className={styles.addCardWrap}>
          {openAddCard ? (
            <form
              className={styles.addCardForm}
              data-testid={`add-card-form-${column.id}`}
              onSubmit={(e) => {
                e.preventDefault();
                const t = newTitle.trim();
                const d = newDetails.trim();
                if (!t) return;
                onAddCard(t, d);
                setNewTitle("");
                setNewDetails("");
                onCloseAddCard();
              }}
            >
              <input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                data-testid={`add-card-title-${column.id}`}
              />
              <textarea
                placeholder="Details"
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                data-testid={`add-card-details-${column.id}`}
              />
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancel}
                  onClick={() => {
                    setNewTitle("");
                    setNewDetails("");
                    onCloseAddCard();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submit}>
                  Add card
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className={styles.addCardToggle}
              data-testid={`add-card-open-${column.id}`}
              onClick={onOpenAddCard}
            >
              + Add card
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [addCardColumnId, setAddCardColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    setColumns((prev) =>
      applyDragEnd(prev, String(active.id), String(over.id))
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board} data-testid="kanban-board">
        <header className={styles.header}>
          <h1 className={styles.title}>Project board</h1>
          <p className={styles.subtitle}>
            One board, five columns, drag cards to match your flow.
          </p>
        </header>

        <div className={styles.columns}>
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              editingTitle={editingColumnId === column.id}
              onStartRename={() => setEditingColumnId(column.id)}
              onCommitRename={(title) => {
                setColumns((prev) => renameColumn(prev, column.id, title));
                setEditingColumnId(null);
              }}
              onCancelRename={() => setEditingColumnId(null)}
              openAddCard={addCardColumnId === column.id}
              onOpenAddCard={() => setAddCardColumnId(column.id)}
              onCloseAddCard={() => setAddCardColumnId(null)}
              onAddCard={(title, details) => {
                const id =
                  typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `card-${Date.now()}`;
                setColumns((prev) =>
                  addCard(prev, column.id, title, details, id)
                );
              }}
              onDeleteCard={(cardId) =>
                setColumns((prev) => deleteCard(prev, cardId))
              }
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
