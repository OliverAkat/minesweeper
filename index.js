import { Game } from './Game.js';

let g = new Game(16, 16, 40);

console.log(g.board);

const eventListeners = {
	submit: g.onFormSubmit,
	click: g.onClick,
	contextmenu: g.toggleFlag,
};

for (const [event, listener] of Object.entries(eventListeners)) {
	console.log(event, listener);
	document.addEventListener(event, listener.bind(g));
}
