import React from "react";

export default class Message extends React.Component {
  render() {
    return (
      <tr>
        <td className="td-user">
            <b>{this.props.handle}</b>
        </td>
        <td className="td-separator">
            <div>•</div>
        </td>
        <td className="td-msg">
            {this.props.message}
        </td>
      </tr>
    )
  }
}
