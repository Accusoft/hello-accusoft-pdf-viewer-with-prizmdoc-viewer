import React from 'react';
import { withRouter } from "react-router";
import PdfViewer from './PdfViewer';

/**
 * React component for the page displaying the document
 * with PDF Viewer.
 */
class ViewDocument extends React.Component {
  render() {
    let { document } = this.props.match.params;
    return (
      <div className="app-container">
        <PdfViewer sourceDocument={`/viewingPackages/${document}/content/pdf`} />
      </div>
    );
  }
}

export default withRouter(ViewDocument);
