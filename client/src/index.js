import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import App from "./App";

// Development only axios helpers!
import axios from 'axios';
window.axios = axios;

ReactDOM.render(
    <App />,
    document.querySelector("#root")
);

console.log('Environment is', process.env.NODE_ENV);
