import React from "react";

const exports = {};

exports.GetFinger = class extends React.Component {
  render() {
    const { parent, playable, finger } = this.props;
    return (
      <div>
        {finger ? "It was a draw! Pick again." : ""}
        <br />
        {!playable ? "Please wait..." : ""}
        <br />
        {"How many fingers are you showing?"}
        <br />
        <br />
        <button disabled={!playable} onClick={() => parent.playFinger(0)}>
          0
        </button>
        <button disabled={!playable} onClick={() => parent.playFinger(1)}>
          1
        </button>
        <button disabled={!playable} onClick={() => parent.playFinger(2)}>
          2
        </button>
        <button disabled={!playable} onClick={() => parent.playFinger(3)}>
          3
        </button>
        <button disabled={!playable} onClick={() => parent.playFinger(4)}>
          4
        </button>
        <button disabled={!playable} onClick={() => parent.playFinger(5)}>
          5
        </button>
      </div>
    );
  }
};

exports.GetGuess = class extends React.Component {
  render() {
    const { parent, playable, guess } = this.props;
    return (
      <div>
        {guess ? "It was a draw, result again!" : ""}
        <br />
        {!playable ? "Please Wait..." : ""}
        <br />
        {"Please result the total"}
        <br />
        <br />
        <button disabled={!playable} onClick={() => parent.playGuess(0)}>
          0
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(1)}>
          1
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(2)}>
          2
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(3)}>
          3
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(4)}>
          4
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(5)}>
          5
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(6)}>
          6
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(7)}>
          7
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(8)}>
          8
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(9)}>
          9
        </button>
        <button disable={!playable} onClick={() => parent.playGuess(10)}>
          10
        </button>
      </div>
    );
  }
};

exports.WaitingForGuess = class extends React.Component {
  render() {
    return <div>Waiting for guess...</div>;
  }
};

exports.Done = class extends React.Component {
  render() {
    const { outcome } = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this game was:
        <br />
        {outcome || "Unknown"}
      </div>
    );
  }
};

exports.Timeout = class extends React.Component {
  render() {
    return <div>There's been a timeout. (Someone took too long.)</div>;
  }
};

export default exports;
