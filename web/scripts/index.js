/**
 * Circle of Fifths
 */

(() => {
	const notes = document.querySelectorAll('.note');
	const center = document.querySelector('.center');
	const speed = document.getElementById('speed') || { value: 1000 };
	const play = document.querySelector('.play');
	const pause = document.querySelector('.pause');
	const notesArray = Array.from(notes);
	let currentNote = 0;
	let intervalId;

	center.addEventListener('click', () => {
		// Pause
		if (pause.classList.contains('active')) {
			clearInterval(intervalId);
			pause.classList.toggle('active');
			play.classList.toggle('active');
			return;
		}

		// Play
		pause.classList.toggle('active');
		play.classList.toggle('active');

		intervalId = setInterval(() => {
			notesArray[currentNote].classList.add('active');
			if (++currentNote > notesArray.length - 1) {
				clearInterval(intervalId);
				setTimeout(() => {
					notes.forEach(note => note.classList.remove('active'));
					pause.classList.toggle('active');
					play.classList.toggle('active');
					currentNote = 0;
				}, speed.value);
			}
		}, speed.value);
	});

	// WebSocket
	const ws = new WebSocket("ws://localhost:8081/ws");
	ws.onopen = () => ws.send("Hello from browser!");
	ws.onmessage = (event) => console.log("Client Received:", event.data);

})();