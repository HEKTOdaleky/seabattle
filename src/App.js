import React, {Component} from 'react';
import Item from "./components/Item/Item";
import {connect} from "react-redux";
import {addShip, shipShot} from "./store/game/game";

class App extends Component {
  componentDidMount() {
    this.props.addShip({
      tree1: [2, 3, 4],
      tree2: [23, 24, 25],
      four: [45, 55, 65, 75]
    })
  }

  shotHandler = field => {
    this.props.setShotClass(field)

  };

  render() {

    const {game} = this.props.state.toJS();
    return (
      <div className="App">

        {
          game.fields.map(item =>
            <Item
              key={item.id}
              ship={item.ship}
              state={item.state}
              click={() => this.shotHandler(item.id)}
            />)
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  state: state
});

const mapDispatchToProps = dispatch => ({
  setShotClass: (index) => dispatch( shipShot(index)),
  addShip: array => dispatch(addShip(array))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
