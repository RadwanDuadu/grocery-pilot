import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GroceryPilot } from "./grocery-pilot";

describe("GroceryPilot catalogue", () => {
  it("filters products from the search bar", () => {
    render(<GroceryPilot />);

    fireEvent.input(screen.getByRole("textbox", { name: "Search grocery catalogue" }), {
      target: { value: "coffee" },
    });

    expect(screen.getByText("Ground coffee", { selector: "h3" })).toBeInTheDocument();
    expect(screen.queryByText("Whole milk", { selector: "h3" })).not.toBeInTheDocument();
    expect(screen.getByText("1 results")).toBeInTheDocument();
  });

  it("adds a catalogue item to the regular list", () => {
    render(<GroceryPilot />);

    const wholeMilkCard = screen.getByText("Whole milk", { selector: "h3" }).closest("article");
    const addButton = wholeMilkCard?.querySelector("button");
    expect(addButton).toBeTruthy();
    fireEvent.click(addButton!);

    expect(screen.getByText("6 items")).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });
});
