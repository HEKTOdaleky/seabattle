import {combineReducers} from 'redux-immutable';
import game, {actions as gameActions} from './game/game'

export const rootReducers = combineReducers({
  game
});

export const rootActions = Object.assign(
  gameActions
);
