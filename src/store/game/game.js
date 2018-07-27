import {handleActions, createAction} from 'redux-actions'
import {fromJS} from 'immutable'

/*
* Constants
* */
const SHOT = 'SHOT';
const MISS = 'MISS';
const PLACED = 'PLACED';
const BOAT_DOWN = 'BOAT_DOWN';
const GENERATE_SHIP = 'GENERATE_SHIP';
const STATUS_SHIP = 'STATUS_SHIP';

/*
 * Actions
 * */
export const shot = createAction(SHOT, cell => cell);
export const miss = createAction(MISS, cell => cell);
export const placed = createAction(PLACED, cell => cell);

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
          dispatch(setMissNearShip(ship.cells, clearAroundShip))
      }
      return null;

    });

  }
};
const setMissNearShip = (ship, callback) => {

  return dispatch => (
    ship.map(cell => {
      for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
          let xPosition = cell.x - x;
          let yPosition = cell.y - y;
          if (xPosition < 0 || yPosition < 0 || xPosition > 9 || yPosition > 9)
            continue;
          else
            dispatch(callback(Number.parseInt(yPosition + '' + xPosition)));

        }
      }


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
export const clearAroundShip = index => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];

    if (currentCell.status === 'empty' || currentCell.status === 'placed') {
      dispatch(miss(index));
    }


  }
};

export const placedAroundShip = index => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];

    if (currentCell.status === 'empty') {
      dispatch(placed(index));
    }


  }
};

const generateShip = shipList => {
  return dispatch => {
    shipList.map(ship => {
      dispatch(statusShip(ship));
      dispatch(setMissNearShip(ship.cells, placedAroundShip));

      ship.cells.map(cell => {
        const index = Number.parseInt(cell.y + '' + cell.x);
        cell.index = index;
        dispatch(setShip(cell));

      });
    });

  }
};

const allShips = [
  {
    shipId: 1,
    cellsIndex: [0, 0],
    cells: [
      {
        status: 'clean',
        shipId: 1
      },
      {
        status: 'clean',
        shipId: 1
      }
    ]
  },
];

export const autoGenerateShips = () => {
  return (dispatch, getState) => {
    let randomCell;
    let fields = getState().toJS().game.fields;
    let iterator = 0;
    while (true) {
      let counter = 3;
      iterator++;
      randomCell = Math.floor(Math.random() * 99 + 0);
      while (fields[randomCell].status === 'empty' && counter > 0) {
        console.log("RANDOM CELL: ", randomCell, "COUNTER: ", counter);
        randomCell++;
        counter--;
      }
      if (counter > 0)
        continue;
      break;
    }
    console.log(iterator, "COUNT_ITERATOR");


  }

};


export const actions = {
  shoot,
  generateShip,
  autoGenerateShips
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
  [PLACED]: (state, {payload}) => {
    return state.updateIn(['fields', payload], entry => entry
      .set('status', 'placed'))
  },
  [BOAT_DOWN]: (state, {payload}) => {
    const {shipSize, currentIndex} = payload;
    return state.updateIn(['fields', `${currentIndex}`], entry =>
      entry.merge({
        currentIndex: shipSize
      }))
  },
}, initialState);
