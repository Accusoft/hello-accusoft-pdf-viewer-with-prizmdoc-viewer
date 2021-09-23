import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Home from './Home';
import ViewDocument from './ViewDocument';

/**
 * React component for sample application.
 */
class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/view/:document">
            <ViewDocument />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
