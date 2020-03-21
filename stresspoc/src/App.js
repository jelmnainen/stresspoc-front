import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'

import Frontpage from './Pages/Frontpage'
import Answer from './Pages/Answer'
import './App.css';

function App() {
  return (
    <Container fluid className="App">
      <Router>
        <Row className="header">
          <Col>
            <Row>
              <Col>
                <h1>StressPoC</h1>
              </Col>
            </Row>
            <Row className="nav">
              <Col>
                <Link to="/" className="navlink">
                  Etusivu
                </Link>
                <Link to="/answer" className="navlink">
                  Vastaa
                </Link>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="content">
          <Col>
              <Switch>
                <Route path="/" exact>
                  <Frontpage />
                </Route>
                <Route path="/answer">
                  <Answer />
                </Route>
              </Switch>
          </Col>
        </Row>
      </Router>
    </Container>
  );
}

export default App;
