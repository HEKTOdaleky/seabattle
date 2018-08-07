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
const SHIP_SHOOT = 'SHIP_SHOOT';
const CHANGE_QUEUE = 'CHANGE_QUEUE';
const GENERATE_CELLS = 'GENERATE_CELLS';


const MY_FIELDS = 'fields';
const COMP_FIELDS = 'fieldsComp';
const ALL_SHIPS_COMP = "allShipsComp";
const ALL_SHIPS = "allShips";
const SHIP_USER = 'ships';
const SHIP_COMP = 'shipsComp';
/*
 * Actions
 * */
const shipShoot = createAction(SHIP_SHOOT, cell => cell);
const generateCells = createAction(GENERATE_CELLS, cell => cell);
const boatDown = createAction(BOAT_DOWN, ship => ship);
const setShip = createAction(GENERATE_SHIP, ship => ship);
const statusShip = createAction(STATUS_SHIP, ship => ship);
const statusShipComp = createAction(STATUS_SHIP_COMP, ship => ship);

const incementShip = createAction(INCREMENT_SHIP, field => field);
const decementShip = createAction(DECREMENT_SHIP, field => field);
const changeQueue = createAction(CHANGE_QUEUE);

/*
 * Methods
 * */
/*Checks if the ship is alive*/
const destroyShip = (ship, index, type, field, array) => {
  return (dispatch, getState) => {
    let shipSize;
    let currentIndex;
    const allShips = getState().toJS().game[type];
    const size = getState().toJS().game.userSize;
    const currentShipArray = ship[array];
    currentShipArray.map((ship, i) => {
      if (ship.shipId === index) {
        shipSize = ship.cellsIndex;
        shipSize.length = shipSize.length - 1;
        currentIndex = i;

        dispatch(boatDown({shipSize, currentIndex, field}));
        if (!shipSize.length > 0) {
          if (allShips === 1) {
            if (type === "allShips") {
              alert("Поздравляю!!! Вы победили")
            }
            else {
              alert("К сожалению вы проиграли... Следующий раз обязательно повезет!")

            }
          }
          dispatch(setMissNearShip(ship.cells, clearAroundShip, field, size));
          dispatch(decementShip(type));
        }
      }
      return null;
    });
  }
};
/*If ship down, set miss around ship*/
const setMissNearShip = (ship, callback, field, size) => {
  return dispatch => {
    ship.map(cell => {
      let index = cell.y * 10 + cell.x;
      for (let i = -1; i < 2; i++) {
        for (let k = -1; k < 2; k++) {
          let num = size * i + k;
          let newIndex = num + index;
          if (newIndex < 0 || newIndex > Math.pow(size, 2) - 1)
            continue;
          else {
            dispatch(callback(newIndex, field));
          }
        }
      }
      return null;
    })
  }
};

export const shoot = (index, quote) => {
  return (dispatch, getState) => {
    if (!quote)
      return null;
    const {game} = getState().toJS();
    if (game.allShipsComp === 0)
      return;
    const currentCell = game.fields[index];
    if (!currentCell.shipId)
      dispatch(changeQueue());
    if (currentCell.shipId) {
      dispatch(shipShoot({index, status: SHOT, field: MY_FIELDS}));
      dispatch(destroyShip(game, currentCell.shipId, ALL_SHIPS, MY_FIELDS, SHIP_USER));
    }
    else
      dispatch(shipShoot({index, status: MISS, field: MY_FIELDS}));

    setTimeout(dispatch(shootComp(), 1000))
  }
};

export const shootComp = () => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();

    let index = random(Math.pow(game.userSize, 2) - 1);
    if (game.queue)
      return;
    const currentCell = game.fieldsComp[index];
    if (currentCell.status === 'miss' || currentCell.status === 'shot') {
      dispatch(shootComp());
      return;
    }

    if (!currentCell.shipId)
      dispatch(changeQueue());

    if (currentCell.shipId) {
      dispatch(shipShoot({index, status: SHOT, field: COMP_FIELDS}));
      dispatch(destroyShip(game, currentCell.shipId, ALL_SHIPS_COMP, COMP_FIELDS, SHIP_COMP));
    }
    else
      dispatch(shipShoot({index, status: MISS, field: COMP_FIELDS}));
    dispatch(shootComp())
  }
};
/*set placed cells around ship*/
export const clearAroundShip = (index, field) => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const allFields = game[field];
    const currentCell = allFields[index];
    if (currentCell.status === 'empty' || currentCell.status === 'placed') {
      dispatch(shipShoot({index, status: MISS, field}));
    }
  }
};

/*set placed cells around ship*/
export const placedAroundShip = (index, field) => {
  return (dispatch, getState) => {
    const {game} = getState().toJS();
    const allFields = game[field];
    const currentCell = allFields[index];
    if (currentCell.status === 'empty') {
      dispatch(shipShoot({index, status: PLACED, field}));
    }
  }
};
/*parse index to x,y cords*/
const cordParser = (number, size = 10) => {
  const tmpNum = number / size;
  let y = Math.trunc(tmpNum);
  let x = number - y * size;
  return {x, y};
};

const random = maxNum => {
  return Math.floor(Math.random() * maxNum);
};
/*1. Start ship builder for all Ships array.*/
export const startCells = () => {
  return async dispatch => {
    await dispatch(generateCells({cell: generateField(15), field: MY_FIELDS}));
    await dispatch(generateCells({cell: generateField(15), field: COMP_FIELDS}));
  }
};
export const runShipGenerator = () => {
  return dispatch => {
    dispatch(startCells()).then(() => {
      allShips.map((ship, index) => {
        if (index < 10)
          dispatch(autoGenerateShips(ship, MY_FIELDS));
        else
          dispatch(autoGenerateShips(ship, COMP_FIELDS));
        return true;
      });
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
    let size = getState().toJS().game.userSize;
    while (true) {
      tmp = ship;
      let counter = ship.cellsIndex.length;
      randomCell = random(Math.pow(size, 2) - 1);
      randomPosition = random(2);
      while (randomCell < Math.pow(size, 2) && fields[randomCell].status === 'empty' && counter > 0) {
        let cords = cordParser(randomCell);
        randomPosition = random(2);
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
            randomCell += size;
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

    dispatch(generateShip(tmp, fieldsName, size));
    let fieldForIncrement = ALL_SHIPS;
    if (fieldsName === 'fieldsComp')
      fieldForIncrement = ALL_SHIPS_COMP;
    dispatch(incementShip(fieldForIncrement));
  }
};

/*3. Takes one ship and create shipObject for ships in reducer */
const generateShip = (ship, name, size) => {
  return dispatch => {
    name === 'fieldsComp' ? dispatch(statusShipComp(ship)) : dispatch(statusShip(ship));
    dispatch(setMissNearShip(ship.cells, placedAroundShip, name, size));

    ship.cells.map(cell => {
      const index = cell.y * 10 + cell.x;
      cell.index = index;
      cell.field = name;
      dispatch(setShip(cell));
      return null;
    });
    return null;

  }
};
/*Generate cells object for battle ground*/
const generateField = (size) => {
  const cells = [];
  let y = 0;
  let x = 0;
  for (let i = 0; i < Math.pow(size, 2); i++) {
    x += 1;
    if (i % size === 0) {
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
  /*Рамеры поля (все 3 числа должны быть одинаковые 0_о )*/
  userSize: 15,
  fields: generateField(15),
  fieldsComp: generateField(15),
  ships: [],
  shipsComp: [],
  allShipsComp: 0,
  allShips: 0,
  queue: true

});

export default handleActions({
  [GENERATE_SHIP]: (state, {payload}) => {
    const {x, y, index, shipId, field} = payload;
    return state.updateIn([field, `${index}`], entry =>
      entry.merge({
        x, y, status: 'placed placed_s', shipId
      }))
  },
  [STATUS_SHIP]: (state, {payload}) => {
    return state.update('ships', entry => entry.push(payload))
  },
  [STATUS_SHIP_COMP]: (state, {payload}) => {
    return state.update('shipsComp', entry => entry.push(payload))
  },
  [SHIP_SHOOT]: (state, {payload}) => {
    const {index, status, field} = payload;
    console.log(payload,"ERRRRRORRRR")
    return state.updateIn([field, index], entry => entry
      .set('status', status))
  },
  [BOAT_DOWN]: (state, {payload}) => {
    const {shipSize, currentIndex, field} = payload;
    return state.updateIn([field, `${currentIndex}`], entry =>
      entry.merge({
        currentIndex: shipSize
      }))
  },
  [INCREMENT_SHIP]: (state, {payload}) => {
    const allShips = state.toJS()[payload];
    return state.set(payload, allShips + 1);
  },
  [DECREMENT_SHIP]: (state, {payload}) => {
    const allShips = state.toJS()[payload];
    return state.set(payload, allShips - 1);
  },
  [CHANGE_QUEUE]: (state) => {
    const current = state.toJS();
    return state.set('queue', !current.queue);
  },
  [GENERATE_CELLS]: (state, {payload}) => {
    const {cell, field} = payload;
    console.log(payload);
    return state.set(field, cell);

  }
}, initialState);
