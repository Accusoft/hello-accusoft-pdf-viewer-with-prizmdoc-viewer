import React from 'react';
import DocumentItem from './DocumentItem';
import ErrorBanner from './ErrorBanner';

/**
 * React component for the list of sample documents.
 */
class DocumentList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: true,
      documents: null,
      error: null
    };
  }

  componentDidMount() {
    this.fetchDocuments();
  }

  async fetchDocuments() {
    try {
      // Request sample documents list from the application server.
      const response = await fetch(`/documents`);
      // Make sure we received an HTTP 200 response.
      if (!response.ok) {
        throw new Error(`The request to the application server to get documents list responded with: "${response.status} ${response.statusText}"`);
      }

      const documents = (await response.json()).documents;
      this.setState({ documents, fetching: false });
    } catch (error) {
      this.setState({ error });
    }
  }

  // Render the documents list.
  render() {
    let content;
    if (this.state.error) {
      content = <ErrorBanner message={this.state.error.toString()} />;
    } else if (this.state.fetching) {
      content = <div>Loading...</div>;
    } else {
      const documentItems = this.state.documents.map(document => 
        <DocumentItem key={document} document={document}></DocumentItem>
      );
      content = <ul>{documentItems}</ul>;
    }
    return (
      <div className="documents-list">
        <h2>Documents</h2>
        {content}
      </div>
    )
  }
}

export default DocumentList;
