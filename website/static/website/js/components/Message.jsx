import React from "react";
import { msgify } from '../utils';


export default class Message extends React.Component {
  render() {
    return (
      <tr>
        <td className="td-user">
            { this.props.separator ? <b>{this.props.user}</b> : "" }
        </td>
        <td className="td-separator">
            { this.props.separator ? <div>●</div> : "" }
        </td>
        <td className="td-msg">
          <span dangerouslySetInnerHTML={{__html: msgify(this.props.message)}}></span>
        </td>
      </tr>
    )
  }
}
