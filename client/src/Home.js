import './Home.css';
import React from 'react';
import DocumentList from './DocumentList';

/**
 * React component for the sample home page
 * with the list of documents.
 */
class Home extends React.Component {
  render() {
    return (
      <div className="home-container">
        <h1>Hello Accusoft PDF Viewer with PrizmDoc Viewer</h1>
  
        <p>
          This is a small React application which integrates
          Accusoft PDF Viewer with PrizmDoc Viewer.
          Node.js is used for an example application server.
        </p>
  
        <p>
          To open any document you need to create Viewing Package
          for this document first.
        </p>
  
        <DocumentList></DocumentList>
      </div>
    )
  }
}

export default Home;
