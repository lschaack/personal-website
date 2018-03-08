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
		// let topLightness = parseInt(topColor.substring(topColor.lastIndexOf(',') + 1));
		// let i = 0; // use to calculate next lightness value
		console.log(topColor);

		for (let childIndex in children) { // use index for computed lightness
			console.log(children);
			console.log(childIndex);
			console.log(children[childIndex]);
			if (parseInt(childIndex)) {
				let currElement = <HTMLElement> children[childIndex];
				currElement.style.backgroundColor = decrementLightness(topColor, parseInt(childIndex) * 0.1);
			}
		}
	}
}

/* Given a string representing an RGB value (like "rgb(255, 255, 255)"), returns
 * a string representing that color decreased by the percent value, where e.g. a
 * percent value of 0.1 will decrement by 10% */
function decrementLightness(colorString: string, percent: number) {
	// first, get individual values
	let r: number = parseInt(colorString.substring(4, colorString.indexOf(',')));
	let g: number = parseInt(colorString.substring(
						colorString.indexOf(',') + 1, colorString.lastIndexOf(',')));
	let b: number = parseInt(colorString.substring( colorString.lastIndexOf(',') + 1));

	r = r * (1 + percent);
	g = g * (1 + percent);
	b = b * (1 + percent);

	return "rgb(" + r + "," + g + "," + b + ")";
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