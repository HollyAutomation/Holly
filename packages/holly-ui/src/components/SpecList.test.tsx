import React from "react";
import { render } from "@testing-library/react";
import SpecList from "./SpecList";

const specs = [
  "src/tests/example-0.spec.js",
  "src/tests/example-1.spec.js",
  "src/tests/example-2.spec.js",
  "src/tests/example-3.spec.js",
  "src/tests/example-4.spec.js"
];

test("renders specs list", () => {
  const { getByText } = render(
    <SpecList specs={specs} chooseSpec={() => {}} />
  );
  const element = getByText(/example-1/i);
  expect(element).toBeInTheDocument();
});
