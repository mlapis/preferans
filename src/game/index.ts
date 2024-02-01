import {
  createGame,
  createBoardClasses,
  Player,
  Board,
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
  phase: number = 1;
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
    hand.onEnter(Card, t => t.showOnlyTo(player));
  }

  board.create(Space, 'middle');
  $.middle.onEnter(Card, e => e.showToAll());

  board.create(Space, 'deck');
  $.deck.onEnter(Card, (e) => e.hideFromAll());
  $.deck.setOrder('stacking');

  ['club', 'heart', 'spade', 'diamond'].forEach((suit: Suit) => {
    for (let i= 1 ; i <= 13; i++) {
      $.deck.create(Card, `${suit}-${i}`, { suit, value: i });
    }1
  })

  /**
   * Define all possible game actions.
   */
  game.defineActions({
    pickThree: player => action({prompt: 'Pick three and pass them to the left'}).
    chooseOnBoard('cards', () => board.all(Card, {owner: player}), {number: 3} ).
    // TODO: this should be an element collection
    do(({cards}) => cards.forEach(c => c.putInto(game.players[player.position === game.players.length - 1 ? 0 : player.position + 1].my(Space)!)))
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
          $.deck.shuffle();
          board.all(Card).forEach((card, index) => {
            console.log("dealing ", card, index,game.players[index % game.players.length].my(Space, {name: 'hand'}))
            card.putInto(game.players[index % game.players.length].my(Space, {name: 'hand'})!)
          })
        },
        everyPlayer({do: playerActions({actions: ['pickThree']})})
      )
    })
    // loop(
    //   eachPlayer({
    //     name: 'player',
    //     do: playerActions({
    //       actions: ['take']
    //     }),
    //   })
    // )
  );
});
