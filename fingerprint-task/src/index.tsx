import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { StylesProvider } from '@material-ui/core';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import reportWebVitals from './reportWebVitals';
import { store } from './store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StylesProvider injectFirst>
    <Provider store={store}>
      {/* Add FpjsProvider for getting visitorId */}
      <FpjsProvider
        loadOptions={{
          apiKey: 'nEv6qcf6Wcax8tOLMYrO', region: 'eu'
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FpjsProvider>
    </Provider>
  </StylesProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
