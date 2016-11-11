import React from "react";

export default class Message extends React.Component {
  render() {
    return (
      <tr>
        <td className="td-user">
            { this.props.separator ? <b>{this.props.user}</b> : "" }
        </td>
        <td className="td-separator">
            { this.props.separator ? <div>•</div> : "" }
        </td>
        <td className="td-msg">
            {this.props.message}
        </td>
      </tr>
    )
  }
}
