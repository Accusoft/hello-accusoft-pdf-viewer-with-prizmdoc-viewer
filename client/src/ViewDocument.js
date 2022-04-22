import React from 'react';
import { withRouter } from "react-router";
import PdfViewer from './PdfViewer';
import ErrorBanner from './ErrorBanner';

/**
 * React component for the page displaying the document
 * with PDF Viewer.
 */
class ViewDocument extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewingSessionId: null
    };
  }
  
  componentDidMount() {
    this.openDocument();
  }

  async openDocument() {
    try{
      const { document } = this.props.match.params;
      const response = await fetch(`/viewingSessions/${document}`, { method: 'POST' });

      // Make sure we received an HTTP 200 response.
      if (!response.ok) {
        throw new Error(`The request to the application server to create a viewing session responded with: "${response.status} ${response.statusText}"`);
      }

      const body = await response.json();
      this.setState({
        viewingSessionId: body.viewingSessionId
      });
    } catch (error) {
      console.error(error);
      this.setState({ error });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorBanner message={this.state.error.toString()} />
      );
    } else if (this.state.viewingSessionId) {
      return (
        <div className="app-container">
          <PdfViewer viewingSessionId={this.state.viewingSessionId} imageHandlerUrl="/prizmdoc" />
        </div>
      );
    } else {
      return (
        <div>
          {/* You can add some viewing session creating indicator here. */}
        </div>
      );
    }
  }
}

export default withRouter(ViewDocument);
