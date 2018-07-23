import {combineReducers} from 'redux-immutable';
import game, {actions as videoActions} from './game/game'

export const rootReducers = combineReducers({
  game
});

export const rootActions = Object.assign(
  {}
);
