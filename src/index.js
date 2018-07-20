import { render } from 'react-dom'
// import './styles/app.css'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from './store/configureStore'
import { rootReducers } from './store/rootReducer'
import React from 'react'
import 'babel-polyfill'
import App from "./App";

const state = fromJS(window.__INITIAL_STATE__);
const hasReduxExtension = typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function';
const store = configureStore(state, rootReducers, hasReduxExtension);

render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);