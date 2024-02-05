import React from 'react';
import { render, toggleSetting } from '@boardzilla/core';
import { default as setup, Space, Card } from '../game/index.js';

import './style.scss';
import '@boardzilla/core/index.css';

render(setup, {
  settings: {
    omnibus: toggleSetting("10 of diamonds worth -10 points?"),
    noPass: toggleSetting("have a no-pass round?")
    // tokens: numberSetting('Number of tokens', 4, 24),
  },
  layout: board => {
    // board.appearance({
    //   render: () => null
    // });

    board.all(Card).appearance({
      aspectRatio: 1/1.5,
      render: ({name}) => (
        <div className="flipper">
          <div className="front">{name}</div>
          <div className="back">BACK</div>
        </div>
      )
    });

    board.all('hand').layout(Card, {
      rows: {max: 1},
      offsetColumn: 44,
      direction: 'ltr',
    })

    board.all('waiting').layout(Card, {
      rows: {max: 1},
      offsetColumn: {x: 2, y: 2},
      maxOverlap: 0,
      direction: 'ltr',
    })

    // board.layout(Space, {
    //   gap: 1,
    //   margin: 1
    // });

    // board.all(Space).layout(Card, {
    //   gap: 1,
    //   margin: 1
    // });
  }
});
