"reach 0.1";

const [isFinger, f0, f1, f2, f3, f4, f5] = makeEnum(6);
const [
  isGuess, g0, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10] = makeEnum(11);
const [isOutcome, A_WINS, DRAW, B_WINS] = makeEnum(3);

const winner = (fingerAlice, fingerBob, guessAlice, guessBob) => {
  if (guessAlice == guessBob) {
    return DRAW;
  }
    else if (fingerAlice + fingerBob == guessAlice) {
    return A_WINS;
  } else if (fingerAlice + fingerBob == guessBob) {
    return B_WINS;
  } else {
    return DRAW;
  }
};

assert(winner(f0, f0, g0, g0) == DRAW);
assert(winner(f0, f0, g2, g0) == B_WINS);
assert(winner(f0, f0, g0, g2) == A_WINS);

forall(UInt, (fingerAlice) =>
  forall(UInt, (fingerBob) =>
    forall(UInt, (guessAlice) =>
      forall(UInt, (guessBob) =>
        assert(isOutcome(winner(fingerAlice, fingerBob, guessAlice, guessBob)))
      )
    )
  )
);

forall(UInt, (fingerAlice) =>
  forall(UInt, (fingerBob) =>
    forall(UInt, (guess) =>
      assert(winner(fingerAlice, fingerBob, guess, guess) == DRAW)
    )
  )
);

const Player = {
  ...hasRandom,
  getFinger: Fun([], UInt),
  getGuess: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
  informTimeout: Fun([], Null),
};

export const main = Reach.App(() => {
  const Alice = Participant("Alice", {
    ...Player,
    wager: UInt,
    deadline: UInt,
  });
  const Bob = Participant("Bob", {
    ...Player,
    acceptWager: Fun([UInt], Null),
  });

  init();

  const informTimeout = () => {
    each([Alice, Bob], () => {
      interact.informTimeout();
    });
  };

  Alice.only(() => {
    //amount
    const amount = declassify(interact.wager);
    const deadline = declassify(interact.deadline);
  });

  Alice.publish(amount, deadline).pay(amount);
  commit();

  Bob.only(() => {
    interact.acceptWager(amount);
  });
  Bob.pay(amount).timeout(relativeTime(deadline), () =>
    closeTo(Alice, informTimeout)
  );

  var outcome = DRAW;
  invariant(balance() == 2 * amount && isOutcome(outcome));
  while (outcome == DRAW) {
    commit();

    Alice.only(() => {
      const _fingerAlice = interact.getFinger();
      const [_commitFingerAlice, _saltFingerAlice] = makeCommitment(
        interact,
        _fingerAlice
      );
      const commitFingerAlice = declassify(_commitFingerAlice);
          const _guessAlice = interact.getGuess();
      const [_commitGuessAlice, _saltGuessAlice] = makeCommitment(
        interact,
        _guessAlice
      );
      const commitGuessAlice = declassify(_commitGuessAlice);
    });

    Alice.publish(commitFingerAlice, commitGuessAlice).timeout(
      relativeTime(deadline),
      () => {
        closeTo(Bob, informTimeout);
      }
    );
    commit();

    unknowable(
      Bob,
      Alice(_fingerAlice, _saltFingerAlice, _guessAlice, _saltGuessAlice)
    );

    Bob.only(() => {
      const fingerBob = declassify(interact.getFinger());
      const guessBob = declassify(interact.getGuess());
    });
    Bob.publish(fingerBob, guessBob).timeout(relativeTime(deadline), () =>
      closeTo(Alice, informTimeout)
    );
    commit();

    Alice.only(() => {
      const saltFingerAlice = declassify(_saltFingerAlice);
      const fingerAlice = declassify(_fingerAlice);

      const saltGuessAlice = declassify(_saltGuessAlice);
      const guessAlice = declassify(_guessAlice);
    });
    Alice.publish(
      fingerAlice,
      saltFingerAlice,
      guessAlice,
      saltGuessAlice
    ).timeout(relativeTime(deadline), () => {
      closeTo(Bob, informTimeout);
    });

    checkCommitment(commitFingerAlice, saltFingerAlice, fingerAlice);
    checkCommitment(commitGuessAlice, saltGuessAlice, guessAlice);
    outcome = winner(fingerAlice, fingerBob, guessAlice, guessBob);
    continue;
  } //end of while

  assert(outcome == A_WINS || outcome == B_WINS);

  transfer(2 * amount).to(outcome == A_WINS ? Alice : Bob);
  commit();

  each([Alice, Bob], () => {
    interact.seeOutcome(outcome);
  });
});
