var alienLoc = "../img/alien.png";

/** Creates a new alien in a random location on the screen */
function createAlien() {
	// Subtract 100, which is approx. alien size
	var x = randInt(1, $(window).width()-100);
	var y = randInt(1, $(window).height()-100);

	var alien = document.createElement('img');
	alien.src = alienLoc;

	// CSS stuff for positioning the new alien
	alien.style.position = 'absolute';
	alien.style.top = y;
	alien.style.left = x;
	alien.className = 'alien';

	var src = document.getElementById('alienHome');
	src.appendChild(alien);
}

/** Returns a random integer between start and end */
function randInt(start, end) {
	return Math.floor(Math.random() * (1 + end - start)) + start;
}
