import React from "react";
import { render } from "@testing-library/react";
import Footer from "./Footer";

test("renders footer content", () => {
  const { getByText } = render(<Footer />);
  const element = getByText(/Holly/i);
  expect(element).toBeInTheDocument();
});
