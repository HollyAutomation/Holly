import React from "react";
import { ListGroup } from "reactstrap";
import SpecsListItem, { Spec } from "./SpecListItem";

interface Props {
  specs: any;
}

const SpecList: React.FC<Props> = ({ specs }) => {
  return (
    <>
      <ListGroup>
        {specs.map((spec: Spec, index: number) => (
          <SpecsListItem key={`spec-${index}`} spec={spec} />
        ))}
      </ListGroup>
    </>
  );
};

export default SpecList;
