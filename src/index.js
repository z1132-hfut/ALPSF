import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// 如果你不需要性能监测，可以删除下面这行
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();