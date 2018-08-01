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
const STATUS_SHIP_COMP = 'STATUS_SHIP_COMP';
const INCREMENT_SHIP = 'INCREMENT_SHIP';
const DECREMENT_SHIP = 'DECREMENT_SHIP';
const SHIP_ACTION = 'SHIP_ACTION';
const SHIP_SHOOT = 'SHIP_SHOOT';



const MY_FIELDS = 'fields';
const COMP_FIELDS = 'fieldsComp';
const ALL_SHIPS_COMP = "allShipsComp";
const ALL_SHIPS = "allShips";
/*
 * Actions
 * */
const shipShoot= createAction(SHIP_SHOOT, cell => cell);

const boatDown = createAction(BOAT_DOWN, ship => ship);
const setShip = createAction(GENERATE_SHIP, ship => ship);
const statusShip = createAction(STATUS_SHIP, ship => ship);
const statusShipComp = createAction(STATUS_SHIP_COMP, ship => ship);

const incementShip = createAction(INCREMENT_SHIP,field=>field);
const decementShip = createAction(DECREMENT_SHIP,field=>field);
/*
 * Methods
 * */
/*Checks if the ship is alive*/
const destroyShip = (ship, index,type,field) => {
  return (dispatch, getState) => {
    let shipSize;
    let currentIndex;
    const allShips = getState().toJS().game[type];
    ship.ships.map((ship, i) => {
      if (ship.shipId === index) {
        shipSize = ship.cellsIndex;
        shipSize.length = shipSize.length - 1;
        currentIndex = i;
        dispatch(boatDown({shipSize, currentIndex,field}));
        if (!shipSize.length > 0) {
          if (allShips === 1) {
            alert("Game OVER")
          }
          dispatch(setMissNearShip(ship.cells, clearAroundShip,field));
          dispatch(decementShip(type));
        }
      }
      return null;
    });
  }
};
/*If ship down, set miss around ship*/
const setMissNearShip = (ship, callback,field) => {
  return dispatch => (
    ship.map(cell => {
      for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
          let xPosition = cell.x - x;
          let yPosition = cell.y - y;
          if (xPosition < 0 || yPosition < 0 || xPosition > 9 || yPosition > 9)
            continue;
          else
            dispatch(callback(Number.parseInt(yPosition + '' + xPosition, 10),field));
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
      dispatch(shipShoot({index, status: SHOT,field:MY_FIELDS}));
      dispatch(destroyShip(game, currentCell.shipId,ALL_SHIPS,MY_FIELDS));
    }
    else
      dispatch(shipShoot({index, status: MISS,field:MY_FIELDS}));
  }
};

export const shootComp = index => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fieldsComp[index];
    if (currentCell.shipId) {
      dispatch(shipShoot({index, status: SHOT,field:COMP_FIELDS}));
      dispatch(destroyShip(game, currentCell.shipId,ALL_SHIPS_COMP,COMP_FIELDS));
    }
    else
      dispatch(shipShoot({index, status: MISS,field:COMP_FIELDS}));
  }
};
/*set placed cells around ship*/
export const clearAroundShip = (index,field) => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];

    if (currentCell.status === 'empty' || currentCell.status === 'placed') {
      dispatch(shipShoot({index, status: MISS,field}));
    }
  }
};

/*set placed cells around ship*/
export const placedAroundShip = (index,field) => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const currentCell = game.fields[index];
    if (currentCell.status === 'empty') {
      dispatch(shipShoot({index, status: PLACED,field}));
    }
  }
};
/*parse index to x,y cords*/
const cordParser = number => {
  let index = number + '';
  if (index.length === 1)
    return {x: index, y: 0};
  else
    return {x: index[1], y: index[0]}
};

const random = maxNum => {
  return Math.floor(Math.random() * maxNum);
};
/*1. Start ship builder for all Ships array.*/
export const runShipGenerator = () => {
  return dispatch => {
    allShips.map((ship, index) => {
      if (index < 10)
        dispatch(autoGenerateShips(ship, MY_FIELDS));
      else
        dispatch(autoGenerateShips(ship, COMP_FIELDS));

      return true;
    });
  }
};
/*2. Generate ships on empty fields. Accepts one ship from array (1). If all correct, call Generator */
let autoGenerateShips = (ship, fieldsName) => {
  let tmp;
  return (dispatch, getState) => {
    let randomCell;
    let randomPosition;
    let fields = getState().toJS().game[fieldsName];
    while (true) {
      tmp = ship;
      let counter = ship.cellsIndex.length;
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

    dispatch(generateShip(tmp, fieldsName));
    let fieldForIncrement=ALL_SHIPS;
    if (fieldsName === 'fieldsComp')
      fieldForIncrement=ALL_SHIPS_COMP;
    dispatch(incementShip(fieldForIncrement));
  }
};

/*3. Takes one ship and create shipObject for ships in reducer */
const generateShip = (ship, name) => {
  return dispatch => {
    name === 'fieldsComp' ? dispatch(statusShipComp(ship)) : dispatch(statusShip(ship));
    dispatch(setMissNearShip(ship.cells, placedAroundShip,name));

    ship.cells.map(cell => {
      const index = Number.parseInt(cell.y + '' + cell.x, 10);
      cell.index = index;
      cell.field=name;
      dispatch(setShip(cell));
      return null;
    });
    return null;

  }
};
/*Generate cells object for battle ground*/
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

export const actions = {
  shoot,
  shootComp,
  runShipGenerator
};

export const initialState = fromJS({
  fields: generateField(),
  fieldsComp: generateField(),
  ships: [],
  shipsComp: [],
  allShipsComp: 0,
  allShips: 0

});

export default handleActions({
  [GENERATE_SHIP]: (state, {payload}) => {
    const {x, y, index, shipId,field} = payload;
    return state.updateIn([field, `${index}`], entry =>
      entry.merge({
        x, y, status: 'placed', shipId
      }))
  },
  [STATUS_SHIP]: (state, {payload}) => {
    return state.update('ships', entry => entry.push(payload))
  },
  [STATUS_SHIP_COMP]: (state, {payload}) => {
    return state.update('shipsComp', entry => entry.push(payload))
  },
  [SHIP_SHOOT]: (state, payload) => {
    const {index, status,field} = payload.payload;
    console.log(payload);
    return state.updateIn([`${field}`, index], entry => entry
      .set('status', status))
  },
  [BOAT_DOWN]: (state, {payload}) => {
    const {shipSize, currentIndex,field} = payload;
    return state.updateIn([field, `${currentIndex}`], entry =>
      entry.merge({
        currentIndex: shipSize
      }))
  },
  [INCREMENT_SHIP]: (state,{payload}) => {
    console.log(payload);
    const allShips = state.toJS()[payload];
    return state.set(payload, allShips + 1);
  },
  [DECREMENT_SHIP]: (state,{payload}) => {
    const {allShips} = state.toJS();
    return state.set(payload, allShips - 1);
  }
}, initialState);
