import {handleActions, createAction} from 'redux-actions'
import {fromJS} from 'immutable'

/*
* Constants
* */
const SHOT = 'SHOT';
const GENERATE_SHIP = 'GENERATE_SHIP';
const STATUS_SHIP = 'STATUS_SHIP';

/*
 * Actions
 * */
export const shot = createAction(SHOT, cell => cell);
export const setShip = createAction(GENERATE_SHIP, ship => ship);
export const statusShip = createAction(STATUS_SHIP, ship => ship);


const generateShip = shipList => {
  return dispatch => {
    shipList.map(ship => {
      dispatch(statusShip(ship));
      ship.cells.map(cell => {
        const index=Number.parseInt(cell.y+''+cell.x);
        cell.index=index;
        dispatch(setShip(cell))
      })
    });

  }
};
export const actions = {
  shot,
  generateShip
};


const generateField = () => {
  const cells = [];
  let y = 0;
  let x = 0;

  for (let i = 0; i < 100; i++) {
    x += 1;
    if (i % 10 === 0) {
      y += 1;
      x = 0;
    }
    // status can be: empty, miss, placed, shot
    cells.push({x, y, index: i, status: 'empty'});
  }

  return cells;
};

export const initialState = fromJS({
  fields: generateField(),
  ships: []
});

export default handleActions({
  [GENERATE_SHIP]: (state, {payload}) => {
    const {x, y, index, shipId} = payload;
    return state.updateIn(['fields', `${index}`], entry =>
      entry.merge({
        x, y, status: 'placed', shipId
      }))
  },

  [STATUS_SHIP]: (state, {payload}) => {
    const {x, y, index} = payload;
    return state.update('ships', entry => entry.push(payload))
  },

  [SHOT]: (state, {payload}) => {
    return state.updateIn(['fields', payload], entry => entry
      .set('status', 'shot'))
  },
}, initialState);
