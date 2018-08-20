import { Minesweeper } from './ms';
import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/common.css';

const UP_ARROW: string = '↑';
const DOWN_ARROW: string = '↓';

function Square() {
	return (
	  <button className="square">
		this is my react square.
	  </button>
	);
  }

ReactDOM.render(
	<Square />,
	document.getElementById('menu-area');
	// Load minesweeper if we're on the correct page
	// if (document.querySelector('body').className == 'minesweeper') {
	// 	Minesweeper.minesweeperSetup();
	// }
);

{/* <div id="toggle-menu"><p>≡</p></div> <!-- ↑↓ -->
<div class="header"><p><a href="/">Luke Schaack</a></p></div>
<!-- inline onclicks are terrible style, but they make the menu work nicely on iOS -->
<div class="menu open" id="menu"> <!-- this should probably be an unordered list -->
    <div class="menu-container"><div class="item" onclick="void(0)"><p>ⓘ</p></div><div id="first" class="option-container" onclick="void(0)">
        <div id="first-option" class="sub-option"><a href="/">About</a></div>
    </div></div>
    <div class="menu-container"><div class="item" onclick="void(0)"><p>♠</p></div><div id="second" class="option-container" onclick="void(0)">
        <div id="second-option" class="sub-option"><h3>Projects</h3></div>
        <div class="sub-option"><a href='/minesweeper'>Minesweeper</a></div>
        <div class="sub-option"><a href='/simpleflight'>Simple Flight</a></div>
        <div class="sub-option"><a href='/mockingbird'>Mockingbird</a></div>
    </div></div>
    <div class="menu-container"><div class="item" onclick="void(0)"><p>¶</p></div><div id="third" class="option-container" onclick="void(0)">
        <div id="third-option" class="sub-option"><h3>Writing</h3></div>
        <div class="sub-option"><a href='/technical'>Technical</a></div>
        <div class="sub-option"><a href='/rhetorical'>Rhetorical</a></div>
        <div class="sub-option"><a href='/descriptive'>Descriptive</a></div>
    </div></div>
    <div class="menu-container"><div class="item" onclick="void(0)"><p>✉</p></div><div id="fourth" class="option-container" onclick="void(0)">
        <div id="fourth-option" class="sub-option"><h3>Contact</h3></div>
        <div class="sub-option"><a href='mailto: contact@lukeschaack.com'>Email</a></div>
        <div class="sub-option"><a href='https://github.com/lschaack'>Github</a></div>
        <div class="sub-option"><a href='https://www.linkedin.com/in/lschaack/'>LinkedIn</a></div>
    </div></div>
    <div class="menu-container"><div class="item" onclick="void(0)"><p>?</p></div><div id="fifth" class="option-container" onclick="void(0)">
        <div id="fifth-option" class="sub-option"><a href='/resume'>Resume</a></div>
    </div></div>
</div> */}