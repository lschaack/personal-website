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
		console.log(topColor);

		for (let childIndex in children) { // use index for computed lightness
			console.log(children);
			console.log(childIndex);
			console.log(children[childIndex]);
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

window.onload = function() {
	document.getElementById('toggle-menu').onclick = function() {
		let menu = document.getElementById('menu');
		console.log("inside the method at least...")
		if (menu.classList.contains('open')) {
			// hide menu
			menu.classList.remove('open');
			menu.classList.add('closed');
			(this.firstChild as HTMLElement).innerHTML = DOWN_ARROW;
		} else {
			// show menu
			menu.classList.remove('closed');
			menu.classList.add('open');
			(this.firstChild as HTMLElement).innerHTML = UP_ARROW;
		}
	};

	doPrettyColors();

	minesweeperSetup();
}