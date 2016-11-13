import React from "react";
import WriteMessage from "./WriteMessage";
import Messages from "./Messages";

export default class Comptoir extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  join() {
    if (this.props.connected) {
      this.props.sendMessage({
        action: 'JOIN',
        comptoir: this.props.name
      });
    }
  }

  leave(evt) {
    evt.preventDefault();
    this.props.leaveComptoir(this.props.name)
  }

  componentDidMount() {
    this.join();
  }

  componentDidUpdate() {
    this.join();
    if (this.props.messages.length > 0) {
        this.refs.msgs.scrollTop = this.refs.msgs.scrollHeight;
    }
  }

  componentWillReceiveProps(nextProps) {}

  sendMessage(message) {
    this.props.sendMessage({
      action: 'MSG',
      message: message,
      comptoir: this.props.name
    });
  }

  render() {
    return (
      <div className="comptoir">
        <div className="header">
            {this.props.name} <a href="" onClick={this.leave.bind(this)}>leave</a>
            - {this.props.connected ? this.props.users.join(',') : '~'}
            {/*<div>{this.state.users.join(', ')} connected</div>*/}
        </div>
        <div className="messages" ref="msgs">
          <Messages
            messages={this.props.messages}
          />
        </div>
        <div className="footer">
          <WriteMessage
            sendMessage={this.sendMessage.bind(this)}
          />
        </div>
      </div>
    )
  }
}
