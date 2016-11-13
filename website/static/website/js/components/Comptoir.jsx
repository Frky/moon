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
        <h2>{this.props.name} <a href="" onClick={this.leave.bind(this)}>leave</a></h2>
        <div>{this.props.connected ? this.props.users.join(',') : '~'}</div>
        {/*<div>{this.state.users.join(', ')} connected</div>*/}
        <table>
          <Messages
            messages={this.props.messages}
          />
          <WriteMessage
            sendMessage={this.sendMessage.bind(this)}
          />
        </table>
      </div>
    )
  }
}
