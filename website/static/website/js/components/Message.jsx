import React from "react";
import { msgify } from '../utils';


export default class Message extends React.Component {
  render() {
    return (
      <div className={ this.props.separator ? "msg space" : "msg" }>
        <div className="msg-left">
            { this.props.separator ? this.props.user : "" }
        </div>
        <div className="msg-separator">
            { this.props.separator ? <span>●</span> : "" }
        </div>
        <div className="msg-right">
          <span dangerouslySetInnerHTML={{__html: msgify(this.props.message)}}></span>
        </div>
      </div>
    )
  }
}
