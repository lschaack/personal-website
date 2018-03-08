const UP_ARROW: string = '↑';
const DOWN_ARROW: string = '↓';

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

	minesweeperSetup();
}