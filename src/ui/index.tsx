import React from 'react';
import { ProfileBadge, render, toggleSetting } from '@boardzilla/core';
import { default as setup, Space, Card } from '../game/index.js';

import './style.scss';
import '@boardzilla/core/index.css';

function handPosition(i: number, total: number, distance: number, width: number, height: number): {left: number, top: number, height: number, width: number} {
  const area = {
    top: Math.sin(Math.PI * i * 2 / total) * distance * 50 + 50 - (height / 2),
    left: Math.cos(Math.PI * i * 2 / total) * distance * 50 + 50 - (width / 2),
    height,
    width
  }
  console.log("i", i, "total", total, "area", area)
  return area
}

render(setup, {
  boardSizes: (_screenX, _screenY) => ({
    name: 'desktop',
    aspectRatio: 1,
  }),
  settings: {
    omnibus: toggleSetting("10♦️ worth negative 10 points?"),
    noPass: toggleSetting("have a no-pass round?")
    // tokens: numberSetting('Number of tokens', 4, 24),
  },
  layout: (board, player) => {
    board.disableDefaultAppearance();

    const otherPlayers = player.others().sort((a, b) => a.position - b.position)

    board.layout(player.my('hand')!, {
      area: handPosition(1, otherPlayers.length + 1, 0.8, 90, 20),
    });

    board.all('hand').appearance({
      render: hand => <div><ProfileBadge player={hand.player!}/> {player.score}</div>
    });

    player.my('hand')!.layout(Card, {
      direction: "ltr",
      offsetColumn: 72,
    })

    board.layout(player.my('waiting')!, {
      area: handPosition(1, otherPlayers.length + 1, 0.5, 10, 10),
    });

    otherPlayers.forEach((other, i) => {
      const dir = i % 2 == 0
      board.layout(other.my('hand')!, {
        area: handPosition(i+2, otherPlayers.length + 1, 0.8, dir ? 10 : 30, dir ? 30 : 10),
      });
      other.my('hand')!.layout(Card, {
        direction: dir ? 'ttb' : 'ltr',
      })

      board.layout(other.my('waiting')!, {
        area: handPosition(i+2, otherPlayers.length + 1, 0.5, 10, 10),
      });
    })

    board.layout('middle', {
      area: {top: 40, left: 35, width: 30, height: 20},
    });
    $.middle.layout(Card, {
      rows: 1,
    })

    board.layout('deck', {
      area: {top: 40, left: 40, width: 20, height: 20},
    });
    $.deck.layout(Card, {
      rows: {max: 1},
      offsetColumn: {x: 0.1, y: 0.1},
      maxOverlap: 0,
      direction: 'ltr',
    })

    board.all(Card).appearance({
      aspectRatio: 0.69,
      render: ({name}) => (
        <div className="flipper">
          <div className="front"></div>
          <div className="back"></div>
        </div>
      )
    });

    board.all('waiting').layout(Card, {
      rows: {max: 1},
      offsetColumn: {x: 2, y: 2},
      maxOverlap: 0,
      direction: 'ltr',
    })
  }
});
