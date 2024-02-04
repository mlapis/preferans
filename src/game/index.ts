import {
  createGame,
  createBoardClasses,
  Player,
  Board,
  Do,
} from '@boardzilla/core';

export class HeartsPlayer extends Player<HeartsPlayer, HeartsBoard> {
  /**
   * Any properties of your players that are specific to your game go here
   */
  score: number = 0;
};

class HeartsBoard extends Board<HeartsPlayer, HeartsBoard> {
  /**
   * Any overall properties of your game go here
   */
  round = 0
  startingPlayer?: HeartsPlayer
  heartsBroken: boolean = false
}

const { Space, Piece } = createBoardClasses<HeartsPlayer, HeartsBoard>();

export { Space };

type Suit = 'club' | 'heart' | 'spade' | 'diamond'
/**
 * Define your game's custom pieces and spaces.
 */
export class Card extends Piece {
  suit: Suit
  value: number
  order: number
}

export default createGame(HeartsPlayer, HeartsBoard, game => {
  const { board, action } = game;
  const { playerActions, whileLoop, loop, eachPlayer, everyPlayer } = game.flowCommands;

  /**
   * Register all custom pieces and spaces
   */
  board.registerClasses(Card);

  /**
   * Create your game board's layout and all included pieces.
   */
  for (const player of game.players) {
    const hand = board.create(Space, 'hand', { player });
    const waiting = board.create(Space, 'waiting', { player });
    hand.onEnter(Card, t => t.showOnlyTo(player));
    waiting.onEnter(Card, (e) => e.hideFromAll());
  }

  board.create(Space, 'middle');
  $.middle.onEnter(Card, e => e.showToAll());

  board.create(Space, 'deck');
  $.deck.onEnter(Card, (e) => e.hideFromAll());
  $.deck.setOrder('stacking');
  let order = 0;
  ['club', 'spade', 'diamond', 'heart'].forEach((suit: Suit) => {
    for (let i= 1 ; i <= 13; i++) {
      $.deck.create(Card, `${suit}-${i}`, { suit, value: i, order });
      order++
    }1
  })

  /**
   * Define all possible game actions.
   */
  game.defineActions({
    pickThree: player => {
      const direction = ["left", 'center', "right", null][board.round % 4]
      if (direction === null) {
        return action()
      }
      return action({prompt: 'Pick three and pass them to the '+direction}).
        chooseOnBoard('cards', () => player.my('hand')!.all(Card), {number: 3} ).
        do(({cards}) => cards.forEach(c => c.putInto(game.players.seatedNext(player, (board.round % 4) + 1).my('waiting')!)))
    },
    playCard: player => action().chooseOnBoard('card', () => {
        const firstCard = $.middle.first(Card)
        if (!firstCard) {
          return player.my('hand')!.all(Card, (c) => board.heartsBroken || c.suit !== 'heart')
        }
        const followingCards = player.my('hand')!.all(Card, {suit: firstCard.suit})
        return followingCards.length === 0 ? player.my('hand')!.all(Card) : followingCards
        // TODO: why doesn't this work?
        // }, {skipIf: () => player.my('hand')!.all(Card).length === 1}).
      }, {skipIf: "never"}).
    do(({card}) => {
        if (card.suit === "heart") {
          board.heartsBroken = true
        }
        card.putInto($.middle)
      })
  });

  /**
   * Define the game flow, starting with board setup and progressing through all
   * phases and turns.
   */
  game.defineFlow(
    whileLoop({
      while: () => !game.players.find(p => p.score >= 100),
      do: loop(
        () => {
          // TODO: i don't understand how to refactor this
          $.deck.shuffle();
          $.deck.all(Card).forEach((card, index) => {
            card.putInto(game.players[index % game.players.length].my(Space, {name: 'hand'})!)
          })
        },
        everyPlayer({do: playerActions({actions: ['pickThree']})}),
        () => {
          game.players.forEach(p => p.my('waiting')?.all(Card).putInto(p.my('hand')!))
          const firstPlayer = game.players.find(p => p.has(Card, 'club-2'))
          board.startingPlayer = firstPlayer
        },
        loop(
          eachPlayer({name: "play", startingPlayer: () => board.startingPlayer!, do: playerActions({name: "playCard", actions: ['playCard']})}),
          () => {
            const playedCards = $.middle.all(Card)
            let highest = 0
            playedCards.forEach(c => {
              if (c.suit !== playedCards[0].suit) return
              if (c.value < highest) return
              highest = c.value
            })
            const trickWinnerIndex = playedCards.findIndex(c => c.suit === playedCards[0].suit && c.value === highest)
            const trickWinner = game.players.seatedNext(board.startingPlayer!, trickWinnerIndex)
            $.middle.all(Card).putInto(trickWinner.my('waiting')!)
            board.startingPlayer = trickWinner
            if (!game.players[0].my('hand')!.has(Card)) {
              Do.break()
            }
          }
        ),
        () => {
          const scores = game.players.map(p => p.my('waiting')!.all(Card).reduce((total, c) => {
            if (c.name === 'spade-12') {
              return total + 13
            } else if (c.suit === 'heart') {
              return total + 1
            } else {
              return total
            }
          }, 0))
          const controlled = scores.find((s) => s === 26)
          game.players.forEach((p, i) => {
            p.score += controlled ? 26 - scores[i] : scores[i]
          })
          board.round++
          board.startingPlayer = undefined
          board.heartsBroken = false
          board.all(Card).putInto($.deck)
          $.deck.shuffle();
          $.deck.all(Card).forEach((card, index) => {
            card.putInto(game.players[index % game.players.length].my(Space, {name: 'hand'})!)
          })
          game.players.forEach(p => p.my('hand')!.all(Card).sortBy("order"))
        }
      )
    })
  )
});
