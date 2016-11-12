import React from "react";
import Comptoir from "./Comptoir";

export default class Bar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: "",
      newCmptrName: "",
    };
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

  joinComptoir(evt) {
    this.props.joinComptoir(this.refs.newcmptr.value); 
  }

  render() {
    const comptoirsHTML = Object.keys(this.props.comptoirs).map(c => (
      <Comptoir
        name={c}
        connected={this.props.connected}
        sendMessage={this.props.sendMessage}
        {...this.props.comptoirs[c]}
        key={`comptoir-${c}`}
      />
    ));

    return (
      <div className="bar">
        <input type="text" ref="newcmptr" name="new-cmptr" value={this.state.newCmptrName} onChange={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)}/>
        <input type="submit" name="add-cmptr" value="ADD COMPTOIR" onClick={this.joinComptoir.bind(this)}/>
        <div className="comptoir-container">
          {comptoirsHTML}
        </div>
      </div>
    )
  }
}
