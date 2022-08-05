import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {SearchkitClient, SearchkitProvider} from '@searchkit/client';

const skClient = new SearchkitClient();

const drupalElem = document.getElementById('kada-event-search');

ReactDOM.render(
  <React.StrictMode>
    <SearchkitProvider client={skClient}>
      <App />
    </SearchkitProvider>
  </React.StrictMode>,
  drupalElem,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
