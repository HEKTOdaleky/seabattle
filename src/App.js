import React from 'react';
import PropTypes from 'prop-types'
import connectWrapper from './store/utils/connectWrapper'
import {rootActions} from './store/rootReducer'
import Cell from './components/Cell/Cell'

export class App extends React.Component {
  static propTypes = {
    state: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.props.actions.runShipGenerator();
  }


  render() {
    const {game} = this.props.state.toJS();
    return (
      <div className="back">
        <div className="App">
          {game.fields.map(item => (
            <Cell
              key={`cell-${item.index}`}
              cell={item}
              onShot={()=>this.props.actions.shoot(item.index,game.queue)}
              isShip={item.shipId}
            />
          ))}
        </div>
        <div className="App">
          {game.fieldsComp.map(item => (
            <Cell
              key={`cell-${item.index}`}
              cell={item}
              onShot={()=>this.props.actions.shootComp(item.index,game.queue)}
              isShip={item.shipId}
            />
          ))}
        </div>

      </div>
    );
  }
}

export default connectWrapper(rootActions, App);
