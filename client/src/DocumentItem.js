import './DocumentItem.css'
import React from 'react';
import { Link } from "react-router-dom";

/**
 * React component for a specific sample document in the list.
 */
class DocumentItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      state: null,
      fetching: true
    };
  }

  componentDidMount() {
    this.fetchViewingPackageState();
  }

  fetchViewingPackageState() {
    (async () => {
      try {
        const response = await fetch(`/viewingPackages/${this.props.document}`);
        const { state } = await response.json();
        this.setState({ state, fetching: false });

        if (state === 'processing') {
          // Check the viewing package state again one second from now.
          setTimeout(() => {
            this.fetchViewingPackageState();
          }, 1000);
        }
      } catch (error) {
        console.error(error);
        this.setState({ error, fetching: false });
      }
    })();
  }

  startViewingPackageCreator() {
    (async () => {
      try {
        // Immediately update UI to indicate that viewing package creation has been started.
        this.setState({ state: 'processing' });

        // Tell application to start Viewing Package creation process
        const response = await fetch(`/viewingPackages/${this.props.document}`, { method: 'POST' });

        // Make sure we received an HTTP 200 response.
        if (!response.ok) {
          throw new Error(`The request to the application server to create a viewing package responded with: "${response.status} ${response.statusText}"`);
        }

        // Request viewing package state to keep UI up to date
        this.fetchViewingPackageState();
      } catch (error) {
        console.error(error);
        this.setState({ error });
      }
    })();
  }

  render() {
    if (this.state.fetching) {
      // Viewing package state is not received yet.
      return (
        <li>
          <span className="document-name">{this.props.document}</span>
        </li>
      )
    } else if (this.state.state === 'not-found') {
      // Viewing package does not exist. User needs to create the viewing package
      // before viewing the document.
      return (
        <li>
          <span className="document-name">{this.props.document}</span>
          <button onClick={() => this.startViewingPackageCreator()}>Create Viewing Package</button>
        </li>
      )
    } else if (this.state.state === 'processing') {
      // Viewing package is creating.
      return (
        <li>
          <span className="document-name">{this.props.document}</span>
          <div className="badge processing">processing</div>
        </li>
      )
    } else if (this.state.state === 'complete') {
      // Viewing package is created and document can be viewed.
      return (
        <li>
          <Link to={`/view/${this.props.document}`} className="document-name">
            {this.props.document}
          </Link>
          <div className="badge ready">ready</div>
        </li>
      )
    } else {
      return (
        <li>
          <span className="document-name">{this.props.document}</span>
          <div className="badge error">error</div>
        </li>
      )
    }
  }
}

export default DocumentItem;
