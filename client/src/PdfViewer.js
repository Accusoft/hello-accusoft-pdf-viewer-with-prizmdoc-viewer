import React from 'react';
import PropTypes from 'prop-types';
import { PdfViewerControl } from '@accusoft/pdf-viewer';

/**
 * React wrapper component for the @accusoft/pdf-viewer PdfViewerControl.
 */
class PdfViewer extends React.Component {
  /**
   * @param {object} props
   * @param {string|Uint8Array} props.sourceDocument - PDF to show. Value may be a string which is a URL to a PDF (either a standard URL or a data URL) or a Uint8Array which contains the binary contents of a PDF.
   */
  constructor(props) {
    super(props);

    this.viewerContainerRef = React.createRef();
  }

  async componentDidMount() {
    const { viewingSessionId, imageHandlerUrl } = this.props;

    // Create the PDF Viewer
    await PdfViewerControl.create({
      sourceDocument: {
        documentId: viewingSessionId,
        imageHandlerUrl
      },
      container: this.viewerContainerRef.current
    });
  }

  render() {
    return (
      // Define a container where the PDF Viewer will go. Note that the size of this
      // container must be specified. In this example, it is defined in
      // src/styles/index.css.
      <div id="viewer-container" ref={this.viewerContainerRef}></div>
    );
  }
}

PdfViewer.propTypes = {
  sourceDocument: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Uint8Array)
  ])
};

export default PdfViewer;
