import kaboom from 'kaboom';
import { Game } from '../public/js/new/Game.js';

const k = kaboom({ width: 800, height: 600, background: [15, 15, 25] });
Object.assign(globalThis, k);
new Game(k).start();
