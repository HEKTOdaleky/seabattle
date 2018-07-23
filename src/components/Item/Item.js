import React from 'react'

const Item = props => (<div className={props.state} onClick={props.click}>
  {
    props.state==='shot'&&props.ship?(<div>K</div>):<div></div>
  }

</div>);
export default Item
