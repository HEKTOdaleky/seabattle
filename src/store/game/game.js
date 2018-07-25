import {handleActions, createAction} from 'redux-actions'
import {fromJS} from 'immutable'

/*
* Constants
* */
const SHOT = 'SHOT';
const MISS = 'MISS';
const BOAT_DOWN = 'BOAT_DOWN';
const GENERATE_SHIP = 'GENERATE_SHIP';
const STATUS_SHIP = 'STATUS_SHIP';

/*
 * Actions
 * */
export const shot = createAction(SHOT, cell => cell);
export const miss = createAction(MISS, cell => cell);
export const boatDown = createAction(BOAT_DOWN, ship => ship);


const setShip = createAction(GENERATE_SHIP, ship => ship);
const statusShip = createAction(STATUS_SHIP, ship => ship);
const destroyShip = (ship, index) => {
  return dispatch => {
    let shipSize;
    let currentIndex;
    ship.ships.map((ship, i) => {
      if (ship.shipId === index) {
        shipSize = ship.cellsIndex;
        shipSize.length = shipSize.length - 1;
        currentIndex = i;

        dispatch(boatDown({shipSize, currentIndex}));
        if (!shipSize.length > 0)
          dispatch(setMissnearShip(ship.cells))
      }
      return null;

    });

  }
};

const setMissnearShip = ship =>{
  /*Метод не реализован, внутри фигня*/
  console.log(ship)

  return dispatch=>(
  ship.map(cell=>{
    let missCells= Number.parseInt(cell.y+1 + ''+cell.x);
    dispatch(shoot(missCells));
    missCells= Number.parseInt(cell.y-1 + ''+cell.x);
    dispatch(shoot(missCells));
    return null;



  }))

};

export const shoot = index => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];

    if (currentCell.shipId) {
      dispatch(shot(index));
      dispatch(destroyShip(game, currentCell.shipId));
    }
    else
      dispatch(miss(index));

  }
};


const generateShip = shipList => {
  return dispatch => {
    shipList.map(ship => {
      dispatch(statusShip(ship));
      ship.cells.map(cell => {
        const index = Number.parseInt(cell.y + '' + cell.x);
        cell.index = index;
        dispatch(setShip(cell))
      })
    });

  }
};
export const actions = {
  shoot,
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
    return state.update('ships', entry => entry.push(payload))
  },

  [SHOT]: (state, {payload}) => {
    return state.updateIn(['fields', payload], entry => entry
      .set('status', 'shot'))
  },
  [MISS]: (state, {payload}) => {
    return state.updateIn(['fields', payload], entry => entry
      .set('status', 'miss'))
  },
  [BOAT_DOWN]: (state, {payload}) => {
    const {shipSize, currentIndex} = payload;
    return state.updateIn(['fields', `${currentIndex}`], entry =>
      entry.merge({
        currentIndex: shipSize
      }))
  },
}, initialState);
