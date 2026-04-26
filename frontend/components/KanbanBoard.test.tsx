import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { KanbanBoard } from "./KanbanBoard";

afterEach(() => {
  cleanup();
});

describe("KanbanBoard", () => {
  it("renders seeded columns and cards", () => {
    render(<KanbanBoard />);
    const board = screen.getByTestId("kanban-board");
    expect(board).toBeInTheDocument();
    expect(
      within(board).getByTestId("column-col-backlog")
    ).toBeInTheDocument();
    expect(within(board).getByTestId("card-card-1")).toBeInTheDocument();
    expect(
      within(board).getByText("Design board chrome")
    ).toBeInTheDocument();
  });

  it("renames a column from the header control", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);
    const board = screen.getByTestId("kanban-board");
    const readyCol = within(board).getByTestId("column-col-ready");
    await user.click(
      within(readyCol).getByTestId("column-title-col-ready")
    );
    const input = within(readyCol).getByTestId(
      "column-title-input-col-ready"
    );
    await user.clear(input);
    await user.type(input, "Ready for pickup");
    await user.keyboard("{Enter}");
    expect(
      within(readyCol).getByTestId("column-title-col-ready")
    ).toHaveTextContent("Ready for pickup");
  });

  it("adds a card to a column", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);
    const board = screen.getByTestId("kanban-board");
    const doneCol = within(board).getByTestId("column-col-done");
    await user.click(within(doneCol).getByTestId("add-card-open-col-done"));
    await user.type(
      within(doneCol).getByTestId("add-card-title-col-done"),
      "Celebrate"
    );
    await user.type(
      within(doneCol).getByTestId("add-card-details-col-done"),
      "MVP shipped."
    );
    await user.click(
      within(doneCol).getByRole("button", { name: "Add card" })
    );
    expect(within(doneCol).getByText("Celebrate")).toBeInTheDocument();
    expect(within(doneCol).getByText("MVP shipped.")).toBeInTheDocument();
  });

  it("deletes a card", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);
    const board = screen.getByTestId("kanban-board");
    const doneCol = within(board).getByTestId("column-col-done");
    expect(within(doneCol).getByTestId("card-card-7")).toBeInTheDocument();
    await user.click(within(doneCol).getByTestId("delete-card-card-7"));
    expect(
      within(doneCol).queryByTestId("card-card-7")
    ).not.toBeInTheDocument();
  });
});
