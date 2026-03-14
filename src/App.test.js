import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("ethers", () => ({
  BrowserProvider: jest.fn(),
  Contract: jest.fn(),
}));

test("renders app header", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const brand = screen.getAllByText(/VoteChain/i);
  expect(brand.length).toBeGreaterThan(0);
});
