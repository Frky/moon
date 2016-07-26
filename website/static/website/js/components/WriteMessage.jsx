import React from "react";

export default class WriteMessage extends React.Component {
  sendMessage() {
    this.props.sendMessage(this.refs.textarea.value);

    this.refs.textarea.value = '';
  }

  render() {
    return (
      <div>
        <textarea ref="textarea"></textarea>
        <input type="button" value="submit" onClick={this.sendMessage.bind(this)} />
      </div>
    )
  }
}