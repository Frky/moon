import React from "react";
import { msgify } from '../utils';


export default class Message extends React.Component {
  handleSelect(event) {
    event.stopPropagation();
  }

  render() {
    return (
      <div className={ this.props.separator ? "msg space" : "msg" }>
        <div className="msg-left" onClick={this.handleSelect.bind(this)}>
            { this.props.separator ? this.props.user : "" }
        </div>
        <div className="msg-separator">
            { this.props.separator ? <span>●</span> : "" }
        </div>
        <div className="msg-right">
          <span onClick={this.handleSelect.bind(this)} dangerouslySetInnerHTML={{__html: msgify(this.props.message)}}></span>
        </div>
      </div>
    )
  }
}
