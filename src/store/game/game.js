import {handleActions, createAction} from 'redux-actions'
import {fromJS} from 'immutable'
import {allShips} from '../utils/shipArray'

/*
* Constants
* */
const SHOT = 'shot';
const MISS = 'miss';
const PLACED = 'placed';
const BOAT_DOWN = 'BOAT_DOWN';
const GENERATE_SHIP = 'GENERATE_SHIP';
const STATUS_SHIP = 'STATUS_SHIP';
const INCREMENT_SHIP = 'INCREMENT_SHIP';
const DECREMENT_SHIP = 'DECREMENT_SHIP';

const SHIP_ACTION = 'SHIP_ACTION';


/*
 * Actions
 * */
const shipAction = createAction(SHIP_ACTION, cell => cell);
const boatDown = createAction(BOAT_DOWN, ship => ship);
const setShip = createAction(GENERATE_SHIP, ship => ship);
const statusShip = createAction(STATUS_SHIP, ship => ship);
const incementShip = createAction(INCREMENT_SHIP);
const decementShip = createAction(DECREMENT_SHIP);


const destroyShip = (ship, index) => {
  return (dispatch, getState) => {
    let shipSize;
    let currentIndex;
    const {allShips} = getState().toJS().game;
    ship.ships.map((ship, i) => {
      if (ship.shipId === index) {
        shipSize = ship.cellsIndex;
        shipSize.length = shipSize.length - 1;
        currentIndex = i;

        dispatch(boatDown({shipSize, currentIndex}));
        if (!shipSize.length > 0) {
          if (allShips === 1) {
            alert("Game OVER")
          }
          dispatch(setMissNearShip(ship.cells, clearAroundShip));
          dispatch(decementShip());
        }

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
            dispatch(callback(Number.parseInt(yPosition + '' + xPosition, 10)));

        }
      }
      return null;


    }))

};
export const shoot = index => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];

    if (currentCell.shipId) {
      dispatch(shipAction({index, status: SHOT}));
      dispatch(destroyShip(game, currentCell.shipId));
    }
    else
      dispatch(shipAction({index, status: MISS}));


  }
};
export const clearAroundShip = index => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];

    if (currentCell.status === 'empty' || currentCell.status === 'placed') {
      dispatch(shipAction({index, status: MISS}));
    }


  }
};

export const placedAroundShip = index => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];

    if (currentCell.status === 'empty') {
      dispatch(shipAction({index, status: PLACED}));

    }


  }
};

const generateShip = shipList => {
  return dispatch => {
    shipList.map(ship => {
      dispatch(statusShip(ship));
      dispatch(setMissNearShip(ship.cells, placedAroundShip));

      ship.cells.map(cell => {
        const index = Number.parseInt(cell.y + '' + cell.x, 10);
        cell.index = index;
        dispatch(setShip(cell));
        return null;
      });
      return null;
    });

  }
};


const cordParser = number => {
  let index = number + '';
  if (index.length === 1)
    return {x: index, y: 0};
  else
    return {x: index[1], y: index[0]}
};

const random = maxNum => {
  return Math.floor(Math.random() * maxNum + 0);
};

export const runShipGenerator = () => {
  return dispatch => (
    allShips.map(ship => {
      dispatch(autoGenerateShips(ship));
      return true;
    }))
};

const autoGenerateShips = ship => {
  const tmp = ship;
  return (dispatch, getState) => {
    let randomCell;
    let randomPosition;
    let fields = getState().toJS().game.fields;
    while (true) {
      let counter = tmp.cellsIndex.length;
      randomCell = random(99);
      randomPosition = random(2);

      while (randomCell < 100 && fields[randomCell].status === 'empty' && counter > 0) {
        let cords = cordParser(randomCell);
        tmp.cells[counter - 1] = {};
        tmp.cells[counter - 1].x = cords.x;
        tmp.cells[counter - 1].y = cords.y;
        tmp.cells[counter - 1].status = "clean";
        tmp.cells[counter - 1].shipId = tmp.shipId;
        switch (randomPosition) {
          case 1:
            randomCell++;
            break;
          case 0:
            randomCell += 10;
            break;
          default:
            randomCell++;

        }
        counter--;
      }
      if (counter > 0)
        continue;
      break;
    }
    dispatch(generateShip([tmp]));
    dispatch(incementShip());


  }

};


export const actions = {
  shoot,
  runShipGenerator
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
  ships: [],
  allShips: 0

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

  [SHIP_ACTION]: (state, payload) => {
    const {index, status} = payload.payload;
    return state.updateIn(['fields', index], entry => entry
      .set('status', status))
  },
  [BOAT_DOWN]: (state, {payload}) => {
    const {shipSize, currentIndex} = payload;
    return state.updateIn(['fields', `${currentIndex}`], entry =>
      entry.merge({
        currentIndex: shipSize
      }))
  },
  [INCREMENT_SHIP]: (state) => {
    const {allShips} = state.toJS();
    return state.set('allShips', allShips + 1);
  },
  [DECREMENT_SHIP]: (state) => {
    const {allShips} = state.toJS();
    return state.set('allShips', allShips - 1);
  }
}, initialState);
