import React from 'react';

import './styles.css';

export default () => {
  return (
    <div className="footer">
      <div className="container">
        <div className="row">
          <div className="col-auto mr-auto text-muted">Created by Anthony Mansur</div>
          <div className="col-auto"><a href="/api/logout">Logout</a></div>
        </div>
      </div>
    </div>
  );
}