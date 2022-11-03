import "./App.css";
import React from "react";
import lottery from "./lottery";
import web3 from "./web3";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      manager: "",
      players: [],
      balance: "",
      message: "",
    };
  }

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting for transaction Success..." });
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value),
    });
    this.setState({ message: "You are now Entered!" });
  };

  onClick = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting for transaction Success..." });
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });
    const winner = await lottery.methods.winner().call();
    this.setState({ message: String(winner) + " has Won!!" });
  };

  render() { 
    return (
      <div>
        <h2>
          <u>Lottery Contract</u>
        </h2>
        <h4>This Contract is managed by: {this.state.manager}</h4>
        <p>
          There are total {this.state.players.length} players entered and total
          prize pool of {web3.utils.fromWei(this.state.balance, "ether")} ether
        </p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Enter the amount to enter! </label>
            <input
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>
        <hr />
        <h4>Ready to Pick a Winner?</h4>
        <button onClick={this.onClick}>Pick a Winner!</button>
        <hr />
        <h2>{this.state.message}</h2>
      </div>
    );
  }
}
export default App;
