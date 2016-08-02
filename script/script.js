var colNum = 0;
var spawnTime = 400,
	timeSinceLastSpawn = 0,
	lastTimestamp = 0,
	explosionTime = 900, spawnTimeError = 0.9;
var velMultx = 100;
var velMulty = 1;
var airResMult = 0.0001;
var gravity = 9.8;
var canSpawn = false;
var mousePosx = 0;
var mousePosy = 0;
var explosionVol = 0.2;
var wallsOn = false;

var timeRunning = false;
var tries = 0;
var	totalTime = 0;
var score = 0;

var won = false;
var waiting = true;
var starting = false;
var playing = false;
var startTime = 4000;
var timeStarting = 0;
function RigidBody(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.velx = Math.random() * velMultx;
	this.vely = 0.0;
	this.accelx = 0.0;
	this.accely = 9.8;
}
var bolts = document.getElementsByClassName("bolt");
var world = document.getElementById("world");
var player = document.getElementById("player");
var bombs = [];
var rigidBodies = [];
var wall1 = document.getElementById("wall1");
var wall2 = document.getElementById("wall2");
var winEl = document.getElementById("win");
var scoreboardEl = document.getElementById("scoreboard");
var scoreEl = document.getElementById("score-val");
var timeEl = document.getElementById("time-val");
var triesEl = document.getElementById("tries-val");
var wall1RB = new RigidBody(world.offsetWidth * 0.3 - wall1.offsetWidth/2, -wall1.offsetHeight, wall1.offsetWidth, wall1.offsetHeight);
var wall2RB = new RigidBody(world.offsetWidth * 0.7 - wall2.offsetWidth/2, world.offsetHeight, wall2.offsetWidth, wall2.offsetHeight);
var playerRB = new RigidBody(0, 0, player.offsetWidth, player.offsetHeight);

var extraPlatSpace = 10;
var startEl = document.getElementById("startPlatform");
var endEl = document.getElementById("endPlatform");
var startRB;
var endRB;
//var lowerExplosionVol = 0.2;

function translateElementTo(el, rb) {
	el.style.transform = 'translate('+rb.x+'px,'+rb.y+'px)';
}

function toggleWalls() {
	if (wallsOn) {
		for (var i = 0; i < bolts.length; i++) {
			bolts[i].style.opacity = 0;
		}
		wallsOn = false;
	} else {
		playing = true;
		for (var i = 0; i < bolts.length; i++) {
			bolts[i].style.opacity = 1;
		}
		wallsOn = true;
	}
}

function fadeOut(explosion) {
	world.removeChild(explosion);
}

function boom(el, rb, pos) {
	colNum++;
	var explosion = document.createElement("IMG");
	explosion.className = "explosion";
	explosion.src = "img/boom.gif?" + Math.random();
	explosion.style.opacity = 0;
	world.appendChild(explosion);
	explosion.style.left = (rb.x + rb.w / 2 - explosion.offsetWidth / 2) + "px";
	explosion.style.top = (rb.y + rb.h / 2 - explosion.offsetHeight / 2) + "px";
	explosion.style.opacity = 1;
	world.removeChild(el);
	bombs.splice(pos, 1);
	rigidBodies.splice(pos, 1);
	var boomSfx = new Audio('audio/boom.mp3?'+Math.random());
	boomSfx.volume = explosionVol;
	boomSfx.play();
	setTimeout(function() {
		fadeOut(explosion);
	}, explosionTime);
}

function boomAll() {
	for (var i = 0; i < bombs.length; i++) {
		boom(bombs[i], rigidBodies[i], i);
		i--;
	}
}

function fixWallsTransitions() {
	wall1.style.transition = "top 0.2s ease-in-out";
	wall2.style.transition = "top 0.2s ease-in-out";
}

function moveElementTo(el, rb) {
	el.style.position = 'absolute';
	el.style.left = rb.x+'px';
	el.style.top = rb.y+'px';
}

moveElementTo(wall1, wall1RB);
moveElementTo(wall2, wall2RB);

function startAction() {
	canSpawn = true;
	tries++;
	timeRunning = true;
	wall1RB.y = 0;
	wall2RB.y = world.offsetHeight - wall2RB.h;
	moveElementTo(wall1, wall1RB);
	moveElementTo(wall2, wall2RB);
}

function startLevel() {
	scoreboardEl.className = scoreboardEl.className.replace(/\bbig\b/,'');
	winEl.className = winEl.className.replace(/\bbigWin\b/,'');
	if (won) {
		totalTime = 0;
		score = 0;
		tries = 0;
		won = false;
	}
	waiting = false;
	endRB = new RigidBody(world.offsetWidth - (playerRB.w + extraPlatSpace * 2), (Math.random() * (world.offsetHeight - (playerRB.h + extraPlatSpace*2))+extraPlatSpace/2), playerRB.w + extraPlatSpace, playerRB.h + extraPlatSpace);
	moveElementTo(endEl, endRB);
	endEl.style.width = endRB.w + 'px';
	endEl.style.height = endRB.h + 'px';
	endEl.style.opacity = 1;
	audioNyan.currentTime = 0;
	audioNyan.play();
}

//setTimeout(function() {explosionVol = lowerExplosionVol;}, 3000);
var audioNyan = document.getElementById('audioNyan');


function endLevel() {
	startRB = new RigidBody(extraPlatSpace, (Math.random() * (world.offsetHeight - (playerRB.h + extraPlatSpace*2))+extraPlatSpace/2), playerRB.w + extraPlatSpace, playerRB.h + extraPlatSpace);
	moveElementTo(startEl, startRB);
	startEl.style.width = startRB.w + 'px';
	startEl.style.height = startRB.h + 'px';
	canSpawn = false;
	timeRunning = false;
	wall1RB.y = -wall2RB.h;
	wall2RB.y = world.offsetHeight;
	moveElementTo(wall1, wall1RB);
	moveElementTo(wall2, wall2RB);
	//turnOffWalls();
	boomAll();
	audioNyan.pause();
	waiting = true;
	playing = false;
	if (won) {
		showScore();
	}
}

function getMousePos(event) {
	mousePosx = event.clientX;
	mousePosy = event.clientY;
}

function toggleSpawn(event) {
	event.preventDefault();
	if (canSpawn)
		boomAll();
	canSpawn = !canSpawn;
}

function playerMove() {
	playerRB.x = mousePosx - playerRB.w / 2;
	playerRB.y = mousePosy - playerRB.h / 2;
	//console.log(x + ", " + y);
	translateElementTo(player, playerRB);
}

function spawnBomb() {
	if (!canSpawn) return;
	var bomb = document.createElement("IMG");
	bomb.className = "bomb";
	bomb.src = "img/bomb.png";
	var x = Math.random() * world.offsetWidth;
	var y = Math.random() * world.offsetHeight / 10;
	world.appendChild(bomb);
	bombs.push(bomb);
	var rb = new RigidBody(x, y, bomb.offsetWidth, bomb.offsetHeight);
	rigidBodies.push(rb);
	//console.log("spawned");
	//console.log(bomb);
	//console.log(bombs);
}

function isBetween(min, val, max) {
	return val >= min && val <= max;
}

function checkIfCollided(rb1, rb2) {
	if (isBetween(rb1.x, rb2.x, rb1.x + rb1.w)) {
		if (isBetween(rb1.y, rb2.y, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb1.y, rb2.y + rb2.h, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y, rb2.y + rb2.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y + rb1.h, rb2.y + rb2.h)) {
			return true;
		}
	}
	if (isBetween(rb1.x, rb2.x + rb2.w, rb1.x + rb1.w)) {
		if (isBetween(rb1.y, rb2.y, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb1.y, rb2.y + rb2.h, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y, rb2.y + rb2.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y + rb1.h, rb2.y + rb2.h)) {
			return true;
		}
	}
	if (isBetween(rb2.x, rb1.x, rb2.x + rb2.w)) {
		if (isBetween(rb1.y, rb2.y, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb1.y, rb2.y + rb2.h, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y, rb2.y + rb2.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y + rb1.h, rb2.y + rb2.h)) {
			return true;
		}
	}
	if (isBetween(rb2.x, rb1.x + rb1.w, rb2.x + rb2.w)) {
		if (isBetween(rb1.y, rb2.y, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb1.y, rb2.y + rb2.h, rb1.y + rb1.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y, rb2.y + rb2.h)) {
			return true;
		}
		if (isBetween(rb2.y, rb1.y + rb1.h, rb2.y + rb2.h)) {
			return true;
		}
	}
	return false;
}

function applyPhysics(el, rb, deltaTime) {
	//console.log(deltaTime);
	rb.velx += rb.accelx * deltaTime;
	rb.vely += rb.accely * deltaTime;
	
	rb.velx -= rb.velx * airResMult * deltaTime;
	rb.vely -= rb.vely * airResMult * deltaTime;
	
	//console.log(rb);
	rb.x += rb.velx * deltaTime;
	rb.y += rb.vely * deltaTime;
	
	translateElementTo(el, rb);
}

var reqId;

function showScore() {
	scoreboardEl.className += ' big';
	winEl.className += ' bigWin';
}

function step(timestamp) {
	var deltaTime = timestamp - lastTimestamp;
	timeSinceLastSpawn += deltaTime;
	if (timeRunning) {
		totalTime += deltaTime;
		score = (5*totalTime/1000)*(tries);
	}
	scoreEl.innerHTML = Math.floor(score)%10000;
	timeEl.innerHTML = Math.floor(totalTime/1000)%10000;
	triesEl.innerHTML = Math.floor(tries)%10000;
	//console.log(timeSinceLastSpawn + " > " + spawnTime);
	if (!won && wallsOn && !waiting && !starting && playing) {
		if (timeSinceLastSpawn > spawnTime + ((Math.random() - 0.5) * spawnTimeError * spawnTime)) {
			timeSinceLastSpawn = 0;
			spawnBomb();
		}
		if (checkIfCollided(playerRB, wall1RB) || checkIfCollided(playerRB, wall2RB)) {
			won = false;
			endLevel();
		}
		for (var i = 0; i < bombs.length; i++) {
			//console.log("style: " + bomb.style);
			applyPhysics(bombs[i], rigidBodies[i], deltaTime / 100);
			if (checkIfCollided(playerRB, rigidBodies[i])) {
				boom(bombs[i], rigidBodies[i], i);
				won = false;
				endLevel();
				i--;
			} else if (checkIfCollided(wall1RB, rigidBodies[i])) {
				boom(bombs[i], rigidBodies[i], i);
				i--;
			} else if (checkIfCollided(wall2RB, rigidBodies[i])) {
				boom(bombs[i], rigidBodies[i], i);
				i--;
			} else if (rigidBodies[i].y + rigidBodies[i].h > world.offsetHeight) {
				boom(bombs[i], rigidBodies[i], i);
				i--;
			}
		}
		if (checkIfCollided(playerRB, endRB)) {
			won = true;
			endLevel();
		}
	} else if (waiting) {
		if (checkIfCollided(playerRB, startRB)) {
			waiting = false;
			starting = true;
			startLevel();
		}
	} else if (starting) {
		if (!checkIfCollided(playerRB, startRB)) {
			waiting = true;
			starting = false;
			timeStarting = 0;
			audioNyan.pause();
			endEl.style.opacity = 0;
		} else {
			timeStarting += deltaTime;
			if (timeStarting > startTime) {
				waiting = false;
				starting = false;
				timeStarting = 0;
				startAction();
			}
		}
	}
	playerMove();
	lastTimestamp = timestamp;
	reqId = window.requestAnimationFrame(step);
}
startRB = new RigidBody(extraPlatSpace, (Math.random() * (world.offsetHeight - (playerRB.h + extraPlatSpace))) + extraPlatSpace/2, playerRB.w + extraPlatSpace, playerRB.h + extraPlatSpace);
moveElementTo(startEl, startRB);
startEl.style.width = startRB.w + 'px';
startEl.style.height = startRB.h + 'px';
fixWallsTransitions();
step(0);