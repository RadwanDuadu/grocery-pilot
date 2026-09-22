import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GroceryPilot } from "./grocery-pilot";

afterEach(cleanup);

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

    expect(screen.getByText("5 items")).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });

  it("does not expose meat products or a meat category", () => {
    render(<GroceryPilot />);

    expect(screen.queryByRole("button", { name: "Meat" })).not.toBeInTheDocument();
    expect(screen.queryByText(/beef|chicken|sausages/i)).not.toBeInTheDocument();
  });

  it("opens a clearly labelled mock checkout review", () => {
    render(<GroceryPilot />);

    fireEvent.click(screen.getByRole("button", { name: "Review Tesco basket" }));

    expect(screen.getByRole("dialog", { name: "Review Tesco" })).toBeInTheDocument();
    expect(screen.getByText("Mock connection")).toBeInTheDocument();
    expect(screen.getByText(/This quote is not from Tesco/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in to continue" })).toBeDisabled();
  });
});
