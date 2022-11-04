import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'viewerjs/dist/viewer.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <App/>
);
