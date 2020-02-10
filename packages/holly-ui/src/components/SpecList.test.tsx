import React from "react";
import { render } from "@testing-library/react";
import SpecList from "./SpecList";

const specs = [
  { path: "./src/tests/example-0.spec.js", displayName: "example-0.spec.js" },
  { path: "./src/tests/example-1.spec.js", displayName: "example-1.spec.js" },
  { path: "./src/tests/example-2.spec.js", displayName: "example-2.spec.js" },
  { path: "./src/tests/example-3.spec.js", displayName: "example-3.spec.js" },
  { path: "./src/tests/example-4.spec.js", displayName: "example-4.spec.js" }
];

test("renders specs list", () => {
  const { getByText } = render(<SpecList specs={specs} />);
  const element = getByText(/example-1/i);
  expect(element).toBeInTheDocument();
});
