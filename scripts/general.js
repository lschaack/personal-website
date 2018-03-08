"use strict";
var UP_ARROW = '↑';
var DOWN_ARROW = '↓';
window.onload = function () {
    document.getElementById('toggle-menu').onclick = function () {
        var menu = document.getElementById('menu');
        console.log("inside the method at least...");
        if (menu.classList.contains('open')) {
            menu.classList.remove('open');
            menu.classList.add('closed');
            this.firstChild.innerHTML = DOWN_ARROW;
        }
        else {
            menu.classList.remove('closed');
            menu.classList.add('open');
            this.firstChild.innerHTML = UP_ARROW;
        }
    };
    minesweeperSetup();
};
