/**
 * Circle of Fifths
 */

(() => {
	const notes = document.querySelectorAll('.note');
	const center = document.querySelector('.center');
	const speed = document.getElementById('speed') || { value: 1000 };
	const loop = document.getElementById('loop');
	const play = document.querySelector('.play');
	const pause = document.querySelector('.pause');
	const notesArray = Array.from(notes);
	let currentNote = 0;
	let intervalId;

	center.addEventListener('click', () => {
		// Pause
		if (pause.classList.contains('active')) {
			clearInterval(intervalId);
			pause.classList.remove('active');
			play.classList.add('active');
			return;
		}

		// Play
		pause.classList.add('active');
		play.classList.remove('active');

		intervalId = setInterval(() => {
			notesArray[currentNote].classList.add('active');
			if (currentNote >= notesArray.length - 1) {
				setTimeout(() => {
					if (loop.value === 'false') {
						clearInterval(intervalId);
						pause.classList.remove('active');
						play.classList.add('active');
					}
					notes.forEach(note => note.classList.remove('active'));
					currentNote = 0;
				}, speed.value);
			} else {
				currentNote++;
			}
		}, speed.value);
	});

	// WebSocket
	const socket = (() => {
		const ws = new WebSocket("ws://localhost:8081/ws");
		ws.onmessage = (event) => {
			document.querySelector('.note-name').textContent = event.data;
		}
	})();
})();