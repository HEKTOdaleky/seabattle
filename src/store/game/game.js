import {handleActions, createAction} from 'redux-actions'
import {fromJS} from 'immutable'

/*
* Constants
* */
const SHOT_CLASS = 'SHOT_CLASS';
const SHIP_CLASS = 'SHIP_CLASS';
const SHIP_CORDS = 'SHIP_CORDS';
const SHIP_REMOVE = 'SHIP_REMOVE';

const SHOT_FIELDS = 'shot';


/*
 * Actions
 * */
export const setShotClass = createAction(SHOT_CLASS, (index) => {
  return {index}
});

export const setShipClass = createAction(SHIP_CLASS, (index, shipName) => {
  return {index, shipName}
});

export const currentShips = createAction(SHIP_CORDS, items => {
  return {items}
});

export const removeShips = createAction(SHIP_REMOVE, (ship,boats) => {
  return {ship,boats}
});


export const actions = {};

export const addShip = shipArray => {

  return dispatch => {
    dispatch(currentShips(shipArray));
    Object.keys(shipArray).map(item => {
      shipArray[item].map(position => {
        dispatch(setShipClass(position, item));
      })
    })
  }
};

export const shipShot = index => {
  return (dispatch, getState) => {
    dispatch(setShotClass(index));
    const {game} = getState().toJS();
    let shipName = game.fields[index].name;
    if (!shipName)
      return
    let newShip = game.ships[shipName].filter(ship => ship !== index);
    if (newShip.length === 0)
      alert(`${shipName} Убит!`)
    dispatch(removeShips(shipName,newShip))

  }
};

const generateField = () => {
  const fields = [];
  for (let i = 0; i < 100; i++) {

    fields.push({id: i, state: 'clean', ship: false});
  }

  return fields;
};

export const initialState = fromJS({
  pending: false,
  shoot: true,
  fields: generateField(),
  ships: {}
});

export default handleActions({
  [`${SHOT_CLASS}`]: (state, {payload}) => {
    return state.updateIn(['fields', payload.index], entry => entry
      .set('state', SHOT_FIELDS))
  },
  [`${SHIP_CLASS}`]: (state, {payload}) => {
    return state.updateIn(['fields', payload.index], entry => entry
      .set('ship', true).set('name', payload.shipName))
  },
  [`${SHIP_CORDS}`]: (state, {payload}) => {
    return state.set('ships', payload.items)
  },
  [`${SHIP_REMOVE}`]: (state, {payload}) => {
    console.log(payload.ship,payload.boats)
    return state.setIn(['ships', payload.ship], entry => console.log(entry))
  }
}, initialState);
