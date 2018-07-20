import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise-middleware';

export default function configureStore (initialState, rootReducer) {
    const hasReduxExtension = typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function';
    const isDevelopment = process.env.NODE_ENV === 'development';

    const composeEnhancers = (isDevelopment && hasReduxExtension) ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
    const middleware = applyMiddleware(thunk, promiseMiddleware());
    const createStoreWithMiddleware = composeEnhancers(middleware);

    return createStoreWithMiddleware(createStore)(rootReducer, initialState);
}