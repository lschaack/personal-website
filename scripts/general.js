"use strict";
var UP_ARROW = '↑';
var DOWN_ARROW = '↓';
function doPrettyColors() {
    var ids = ["first", "second", "third", "fourth", "fifth"];
    for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
        var id = ids_1[_i];
        var container = document.getElementById(id);
        var children = container.children;
        var topColor = window.getComputedStyle(children[0]).backgroundColor;
        console.log(topColor);
        for (var childIndex in children) {
            console.log(children);
            console.log(childIndex);
            console.log(children[childIndex]);
            if (parseInt(childIndex)) {
                var currElement = children[childIndex];
                currElement.style.backgroundColor = decrementLightness(topColor, parseInt(childIndex) * 0.1);
            }
        }
    }
}
function decrementLightness(colorString, percent) {
    var r = parseInt(colorString.substring(4, colorString.indexOf(',')));
    var g = parseInt(colorString.substring(colorString.indexOf(',') + 1, colorString.lastIndexOf(',')));
    var b = parseInt(colorString.substring(colorString.lastIndexOf(',') + 1));
    r = r * (1 + percent);
    g = g * (1 + percent);
    b = b * (1 + percent);
    return "rgb(" + r + "," + g + "," + b + ")";
}
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
    doPrettyColors();
    minesweeperSetup();
};
