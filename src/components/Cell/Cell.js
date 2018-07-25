import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

export default class Cell extends React.Component {
  static propTypes = {
    cell: PropTypes.object.isRequired,
    onShot: PropTypes.func.isRequired
  };

  shot = () => {
    switch (this.props.status) {
      case 'miss':
      case 'shot':
        return null;

      case 'empty':
      default:
        return this.props.onShot(this.props.cell.index);
    }

    // const { status, x, y } = this.props.cell;
  };

  render () {
    const { status } = this.props.cell;
    const cellClassnames = classnames('field', {
      [status]: status
    });
    return (
      <div className={cellClassnames} onClick={this.shot} />
    )
  }
}