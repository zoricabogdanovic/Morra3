import React from "react";
import AppViews from "./views/AppViews.js";
import DeployerViews from "./views/DeployerViews.js";
import AttacherViews from "./views/AttacherViews.js";
import { renderDOM, renderView } from "./views/render.js";
import "./index.css";
import * as backend from "./build/index.main.mjs";
import { loadStdlib } from "@reach-sh/stdlib";
import { ALGO_MyAlgoConnect as MyAlgoConnect } from "@reach-sh/stdlib";
const reach = loadStdlib(process.env);

reach.setWalletFallback(
  reach.walletFallback({
    providerEnv: "TestNet",
    MyAlgoConnect,
  })
);

const intToOutcome = ["Alice Wins!", "Draw", "Bob wins!"];
const { standardUnit } = reach;
const defaults = { defaultFundAmt: "10", defaultWager: "1", standardUnit };

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: "ConnectAccount", ...defaults };
  }
  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    const balanceAtomic = await reach.balanceOf(acc);
    const balance = reach.formatCurrency(balanceAtomic, 4);
    this.setState({ acc, balance });
    if (await reach.canFundFromFaucet()) {
      this.setState({ view: "FundAccount" });
    } else {
      this.setState({ view: "DeployerOrAttacher" });
    }
  }
  async fundAccount(fundAmount) {
    await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({ view: "DeployerOrAttacher" });
  }
  async skipFundAccount() {
    this.setState({ view: "DeployerOrAttacher" });
  }
  selectAttacher() {
    this.setState({ view: "Wrapper", ContentView: Attacher });
  }
  selectDeployer() {
    this.setState({ view: "Wrapper", ContentView: Deployer });
  }
  render() {
    return renderView(this, AppViews);
  }
}

class Player extends React.Component {
  random() {
    return reach.hasRandom.random();
  }
  async getFinger() {
    const finger = await new Promise((resolveFingerP) => {
      this.setState({ view: "GetFinger", playable: true, resolveFingerP });
    });
    this.setState({ view: "WaitingForGuess", finger });
    return finger;
  }
  async getGuess() {
    const guess = await new Promise((resolveGuessP) => {
      this.setState({ view: "GetGuess", playable: true, resolveGuessP });
    });
    this.setState({ view: "WaitingForGuess", guess });
    return guess;
  }
  seeOutcome(i) {
    this.setState({ view: "Done", outcome: intToOutcome[i] });
  }
  informTimeout() {
    this.setState({ view: "Timeout" });
  }
  playFinger(finger) {
    this.state.resolveFingerP(finger);
  }
  playGuess(guess) {
    this.state.resolveGuessP(guess);
  }
}

class Deployer extends Player {
  constructor(props) {
    super(props);
    this.state = { view: "SetWager" };
  }
  setWager(wager) {
    this.setState({ view: "Deploy", wager });
  }
  async deploy() {
    const ctc = this.props.acc.contract(backend);
    this.setState({ view: "Deploying", ctc });
    this.wager = reach.parseCurrency(this.state.wager);
    this.deadline = { ETH: 10, ALGO: 100, CFX: 1000 }[reach.connector];
    backend.Alice(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({ view: "WaitingForAttacher", ctcInfoStr });
  }
  render() {
    return renderView(this, DeployerViews);
  }
}

class Attacher extends Player {
  constructor(props) {
    super(props);
    this.state = { view: "Attach" };
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr));
    this.setState({ view: "Attaching" });
    backend.Bob(ctc, this);
  }
  async acceptWager(wagerAtomic) {
    const wager = reach.formatCurrency(wagerAtomic, 4);
    return await new Promise((resolveAcceptedP) => {
      this.setState({ view: "AcceptTerms", wager, resolveAcceptedP });
    });
  }
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({ view: "WaitingForTurn" });
  }
  render() {
    return renderView(this, AttacherViews);
  }
}
renderDOM(<App />);
