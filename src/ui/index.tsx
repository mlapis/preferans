import React from 'react';
import { render, numberSetting } from '@boardzilla/core';
import { default as setup, Space, Card } from '../game/index.js';

import './style.scss';
import '@boardzilla/core/index.css';

render(setup, {
  settings: {
    tokens: numberSetting('Number of tokens', 4, 24),
  },
  layout: board => {
    // board.appearance({
    //   render: () => null
    // });

    board.all(Card).appearance({
      aspectRatio: 1,
      // render: ({name}) => (
      //   <div className="flipper">
      //     <div className="front">{name}</div>
      //     <div className="back">BACK</div>
      //   </div>
      // )
    });

    board.all('hand').layout(Card, {
      rows: {max: 1},
      offsetColumn: 44,
      direction: 'ltr',
    })

    board.all('waiting').layout(Card, {
      rows: {max: 1},
      offsetColumn: {x: 5, y: 5},
      maxOverlap: 0,
      haphazardly: 0.1,
      direction: 'ltr',
    })

    board.all(Card).appearance({
      aspectRatio: 1/2
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
