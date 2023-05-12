import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import {SearchkitClient, SearchkitProvider, withSearchkit } from '@searchkit/client';

const SearchkitApp = withSearchkit(App);

const skClient = new SearchkitClient();

const drupalElem = document.getElementById('kada-event-search');
const eventType = drupalElem?.dataset?.eventType;
// const eventType = 'hobby';

let viewportWidth = window.innerWidth;
let filterOpen = true;
if (viewportWidth < 800) {
  filterOpen = true;
} else {
  filterOpen = false;
}

ReactDOM.render(
  <React.StrictMode>
    {/* <SearchkitProvider client={skClient}> */}
    <Router>
      <Routes>
      <Route path="*" element={<SearchkitApp eventType={eventType} filterOpen={filterOpen} />} />
      </Routes>
    </Router>
    {/* </SearchkitProvider> */}
  </React.StrictMode>,
  drupalElem,
  // document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
