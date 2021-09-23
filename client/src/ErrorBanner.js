import React from 'react';
import './ErrorBanner.css';

class ErrorBanner extends React.Component {
  render() {
    return (
      <div className="error">
        <h2>Uh oh!</h2>
        <p>
          There was an unexpected problem:
        </p>
        <pre>
          {this.props.message}
        </pre>
      </div>
    );
  }
}

export default ErrorBanner;
