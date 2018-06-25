import React from 'react';
import ReactDOM from 'react-dom';
import './styles/style.css';

import App from "./components/App";

// Development only axios helpers!
import axios from 'axios';
window.axios = axios;

ReactDOM.render(
    <App />,
    document.querySelector("#root")
);

console.log('Environment is', process.env.NODE_ENV);
