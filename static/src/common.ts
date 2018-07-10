import { Minesweeper } from './ms';

const UP_ARROW: string = '↑';
const DOWN_ARROW: string = '↓';

/* Assuming the base color of each .sub-element is already set in hsl, desaturate
 * that color progressively for each child of that element */
function doPrettyColors() {
	let ids = ["first", "second", "third", "fourth", "fifth"];

	for (let id of ids) {
		let container = document.getElementById(id);
		let children = container.children;
		let topColor = window.getComputedStyle((children[0] as HTMLElement)).backgroundColor;

		for (let childIndex in children) { // use index for computed lightness
			if (parseInt(childIndex)) {
				let currElement = <HTMLElement> children[childIndex];
				currElement.style.backgroundColor = incrementLightness(topColor, parseInt(childIndex));
			}
		}
	}
}

/* Given a string representing an RGB value (like "rgb(255, 255, 255)"), returns
 * a string in which every color is lightened as a function of the difference
 * between its current value and 255, as well as a multiplier (which in
 * doPrettyColors is decided by how "deep" into the sub-menu the option is) */
function incrementLightness(colorString: string, multiplier: number) {
	// first, get individual values
	let r: number = parseInt(colorString.substring(4, colorString.indexOf(',')));
	let g: number = parseInt(colorString.substring(
						colorString.indexOf(',') + 1, colorString.lastIndexOf(',')));
	let b: number = parseInt(colorString.substring( colorString.lastIndexOf(',') + 1));

	let rgb: Array<number> = [r, g, b];

	for (let i in rgb) {
		let index = parseInt(i);
		rgb[index] += ((255 - rgb[index]) * 0.2 * multiplier);
	}

	return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

function toggleMenu() {
	let menu = document.getElementById('menu');
	let main = document.querySelector('.main');

	if (menu.classList.contains('open')) {
		// hide menu
		menu.classList.remove('open');
		menu.classList.add('closed');
		// tell main to slide over
		main.classList.remove('open');
		main.classList.add('closed');
		(this.firstChild as HTMLElement).innerHTML = DOWN_ARROW;
	} else {
		// show menu
		menu.classList.remove('closed');
		menu.classList.add('open');
		// tell main to slide over
		main.classList.remove('closed');
		main.classList.add('open');
		(this.firstChild as HTMLElement).innerHTML = UP_ARROW;
	}
}

// Fetches data at the provided URL and runs the provided function when loaded
// type arg should be one of "GET" or "POST"
// TODO: add a check for the above comment
function fetch(url: string, onloadFunction: () => HTMLElement, type: string) {
	var ajax = new XMLHttpRequest();
	ajax.onload = onloadFunction;
	ajax.open(type, url, true);
	ajax.send();
}

window.onload = function() {
	document.getElementById('toggle-menu').onclick = toggleMenu;

	doPrettyColors();

	// Load minesweeper if we're on the correct page
	if (document.querySelector('body').className == 'minesweeper') {
		Minesweeper.minesweeperSetup();
	} else if (document.querySelector('body').className == 'writing') {
		console.log('inside conditional');
	}
}