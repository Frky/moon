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
      <div>
        <textarea ref="textarea" onKeyDown={this.onKeyDown.bind(this)}></textarea>
        <input type="button" value="submit" onClick={this.sendMessage.bind(this)} />
      </div>
    )
  }
}