import React from 'react';
import PropTypes from 'prop-types'
import connectWrapper from './store/utils/connectWrapper'
import { rootActions } from './store/rootReducer'
import Cell from './components/Cell/Cell'

export class App extends React.Component {
  static propTypes = {
    state: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  };

  componentDidMount() {
    const ship = {
      shipId: 1,
      cellsIndex: [0,0],
      cells: [
        {
          x: 0,
          y: 0,
          index: 0,
          status: 'clean',
          shipId: 1
      },
      {
          x: 1,
          y: 0,
          index: 1,
          status: 'clean',
          shipId: 1
      }
      ]
    };
    this.props.actions.generateShip(ship);
  }

  render() {
    const {game} = this.props.state.toJS();
    return (
      <div className="App">
        {game.fields.map(item => (
          <Cell
            key={`cell-${item.index}`}
            cell={item}
            onShot={this.props.actions.shot}
          />
        ))}
      </div>
    );
  }
}

export default connectWrapper(rootActions, App);
