import React from "react";
import { ListGroupItem } from "reactstrap";

interface Props {
  spec: string;
  chooseSpec: (spec: string) => void;
  nestingLevel?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
}

const SpecsListItem: React.FC<Props> = ({
  spec,
  nestingLevel = 0,
  chooseSpec
}) => {
  return (
    <ListGroupItem key={spec} className={`level-${nestingLevel}`}>
      <a onClick={() => chooseSpec(spec)}>{spec}</a>
    </ListGroupItem>
  );
};

export default SpecsListItem;
