import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

export default class Cell extends React.Component {
  static propTypes = {
    cell: PropTypes.object.isRequired,
    onShot: PropTypes.func.isRequired,
    isShip: PropTypes.number
  };

  shot = () => {
    switch (this.props.cell.status) {
      case 'miss':
        return null;
      case 'shot':
        return null;

      default:
        return this.props.onShot(this.props.cell.index);
    }

    // const { status, x, y } = this.props.cell;
  };

  render() {
    const status = this.props.cell.status;
    const cellClassnames = classnames('field', {
      [status]: status
    });
    return (
      <div name ={this.props.cell.index}  className={cellClassnames} onClick={this.shot}>
      </div>
    )
  }
}
