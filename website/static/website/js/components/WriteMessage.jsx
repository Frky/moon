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
      <div className="write-msg">
        <div className="msg-left">
        </div>
        <div className="msg-separator">
        </div>
        <div className="msg-right" rows="1">
          <textarea ref="textarea" className="msg-input" onKeyDown={this.onKeyDown.bind(this)}></textarea>
        </div>
      </div>
    )
  }
}
