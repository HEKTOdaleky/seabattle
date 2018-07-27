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
    const ship = [{
      shipId: 1,
      cellsIndex: [0,0],
      cells: [
        {
          x: 0,
          y: 0,
          status: 'clean',
          shipId: 1
      },
      {
          x: 1,
          y: 0,
          status: 'clean',
          shipId: 1
      }
      ]
    },
      {
        shipId: 4,
        cellsIndex: [0,0,0],
        cells: [
          {
            x: 9,
            y: 7,
            status: 'clean',
            shipId: 4
          },
          {
            x: 9,
            y: 8,
            status: 'clean',
            shipId: 4
          },
          {
            x: 9,
            y: 9,
            status: 'clean',
            shipId: 4
          }
        ]
      },
      {
        shipId: 3,
        cellsIndex: [0,0],
        cells: [
          {
            x: 0,
            y: 2,
            status: 'clean',
            shipId: 3
          },
          {
            x: 1,
            y: 2,
            status: 'clean',
            shipId: 3
          }
        ]
      },
      {
        shipId: 2,
        cellsIndex: [0,0,0],
        cells: [
          {
            x: 3,
            y: 5,
            status: 'clean',
            shipId: 2
          },
          {
            x: 4,
            y: 5,
            status: 'clean',
            shipId: 2
          },
          {
            x: 5,
            y: 5,
            status: 'clean',
            shipId: 2
          }
        ]
      }];
    this.props.actions.generateShip(ship);
    this.props.actions.autoGenerateShips();
  }

  render() {
    const {game} = this.props.state.toJS();
    return (
      <div className="App">
        {game.fields.map(item => (
          <Cell
            key={`cell-${item.index}`}
            cell={item}
            onShot={this.props.actions.shoot}
            isShip={item.shipId}
          />
        ))}
      </div>
    );
  }
}

export default connectWrapper(rootActions, App);
