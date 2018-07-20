import { handleActions, createAction } from 'redux-actions'
import {fromJS, List} from 'immutable'

/*
* Constants
* */


/*
 * Actions
 * */


export const actions = {

};

export const initialState = fromJS({
    pending: false,
    shoot:true,
});

export default handleActions({


}, initialState);