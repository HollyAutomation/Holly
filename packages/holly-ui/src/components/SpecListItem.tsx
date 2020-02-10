import React from "react";
import { ListGroupItem } from "reactstrap";

export interface Spec {
  displayName: string;
  path: string;
}

interface Props {
  spec: Spec;
  nestingLevel?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
}

const chooseSpec = () => {
  // TODO
  console.log("choose");
};

const SpecsListItem: React.FC<Props> = ({ spec, nestingLevel = 0 }) => {
  return (
    <ListGroupItem key={spec.path} className={`level-${nestingLevel}`}>
      <a onClick={chooseSpec}>{spec.displayName}</a>
    </ListGroupItem>
  );
};

export default SpecsListItem;
