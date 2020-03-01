import React, { useCallback } from "react";
import { Container, Row, Col } from "reactstrap";
import Navigation from "./components/Navigation";
import SpecList from "./components/SpecList";
import Footer from "./components/Footer";
import TestList from "./components/TestList";
import { rootReducer, actions } from "holly-shared";
import { useDispatch, useSelector } from "react-redux";

// todo - abstract
type RootStateType = ReturnType<typeof rootReducer>;

const App: React.FC = () => {
  const dispatch = useDispatch();

  const chooseSpec = useCallback(
    (spec: string) => {
      dispatch(actions.currentSpec.setFile(spec));
    },
    [dispatch]
  );

  const run = useCallback(() => {
    dispatch(actions.currentSpec.run());
  }, [dispatch]);

  const specs = useSelector<RootStateType, ReadonlyArray<string>>(
    state => state.specFiles
  );
  const currentSpec = useSelector<RootStateType, RootStateType["currentSpec"]>(
    state => state.currentSpec
  );

  return (
    <div className="App">
      <Navigation isShowingSpec={Boolean(currentSpec.file)} run={run} />
      <Container fluid>
        <Row>
          <Col>
            {!currentSpec.file ? (
              <SpecList specs={specs} chooseSpec={chooseSpec} />
            ) : (
              currentSpec.tests && <TestList tests={currentSpec.tests} />
            )}
          </Col>
        </Row>
        <Footer />
      </Container>
    </div>
  );
};

export default App;
