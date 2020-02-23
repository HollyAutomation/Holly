import React from "react";
import { ListGroup } from "reactstrap";
import SpecsListItem from "./SpecListItem";

interface Props {
  specs: ReadonlyArray<string>;
  chooseSpec: (spec: string) => void;
}

const SpecList: React.FC<Props> = ({ specs, chooseSpec }) => {
  return (
    <>
      <ListGroup className="tst-spec-list">
        {specs.map((spec: string, index: number) => (
          <SpecsListItem
            key={`spec-${index}`}
            spec={spec}
            chooseSpec={chooseSpec}
          />
        ))}
      </ListGroup>
    </>
  );
};

export default SpecList;
