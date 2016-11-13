import React from "react";
import Comptoir from "./Comptoir";
import AddComptoir from "./AddComptoir";

export default class Bar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: "",
      newCmptrName: "",
      idFocused: 0
    };
  }

  changeFocus(name) {
    this.setState({idFocused: Object.keys(this.props.comptoirs).indexOf(name)});
  }

  handleChange(evt) {
    this.setState({
      newCmptrName: evt.target.value,
    });
  }

  handleKeyDown(evt) {
    if (evt.keyCode == 13) 
        this.joinComptoir(evt);
  }

  handleBroadcast(message) {
    this.props.sendMessage({
      action: 'BROADCAST',
      message: message,
      comptoirs: Object.keys(this.props.comptoirs)
    });
  }
  
  handleTab() {
    this.setState({idFocused: (this.state.idFocused + 1) % Object.keys(this.props.comptoirs).length});
  }

  joinComptoir(evt) {
    this.props.joinComptoir(this.refs.newcmptr.value); 
  }

  render() {
    const comptoirsHTML = Object.keys(this.props.comptoirs).map((c, i) => {
      return (<Comptoir
        name={c}
        connected={this.props.connected}
        sendMessage={this.props.sendMessage}
        leaveComptoir={this.props.leaveComptoir}
        isFocused={i == this.state.idFocused}
        handleBroadcast={this.handleBroadcast.bind(this)}
        handleTab={this.handleTab.bind(this)}
        changeFocus={this.changeFocus.bind(this)}
        {...this.props.comptoirs[c]}
        key={`comptoir-${c}`}
      />)
  });

    return (
      <div className="bar">
        <div className="header">
        </div>
        <div className="comptoir-container">
          {comptoirsHTML}
          <AddComptoir
            joinComptoir={this.props.joinComptoir.bind(this)} 
          />
        </div>
      </div>
    )
  }
}
