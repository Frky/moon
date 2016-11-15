import React from "react";

export default class WriteMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
    }
  }

  sendMessage() {
    this.props.sendMessage(this.refs.textarea.refs.textarea.value);
    this.setState({
      value: "",
    });
  }

  onKeyDown(event) {
    if (event.keyCode == '13' && !event.shiftKey) {
      this.sendMessage();
      event.preventDefault();
    } else if (event.keyCode == '9') {
      this.props.handleTab();
      event.preventDefault();
    }
  }
  
  onChange(event) {
    event.preventDefault();
    this.setState({
      value: event.target.value,
    });
  }

  componentDidUpdate() {
    if (this.props.focus) {
      this.refs.textarea.refs.textarea.focus();
    }
  }

  render() {
    //             onBlur={this.props.changeFocus.bind(null)}

    var TextareaAutosize = require('react-autosize-textarea');

    return (
      <div className="write-msg">
        <div className="msg-left">
        </div>
        <div className="msg-separator">
        </div>
        <div className="msg-right" rows="1">
          <TextareaAutosize 
            value={this.state.value}
            ref="textarea"
            className="msg-input"
            placeholder="Say something..."
            onKeyDown={this.onKeyDown.bind(this)}
            onChange={this.onChange.bind(this)}
            onResize={() => {}}
          ></TextareaAutosize>
        </div>
      </div>
    )
  }
}
