import React from "react";

export default class WriteMessage extends React.Component {
  sendMessage() {
    this.props.sendMessage(this.refs.textarea.value);
    this.refs.textarea.value = '';
  }

  onKeyDown(event) {
    if (event.keyCode == '13' && !event.shiftKey) {
      this.sendMessage();
      event.preventDefault();
    };
  }

  render() {
    return (
      <tfoot>
      <tr>
        <td className="td-user">
        </td>
        <td className="td-separator">
        </td>
        <td className="td-msg">
          <textarea ref="textarea" className="msg-input" onKeyDown={this.onKeyDown.bind(this)}></textarea>
        </td>
      </tr>
      </tfoot>
    )
  }
}
