/**
 * Circle of Fifths
 */

(() => {
	const h1 = document.querySelector('h1');
	const notes = document.querySelectorAll('.note');
	const center = document.querySelector('.center');
	const speed = document.getElementById('speed') || { value: 1000 };
	const loop = document.getElementById('loop');
	const mode = document.getElementById('mode');
	const play = document.querySelector('.play');
	const pause = document.querySelector('.pause');
	const notesArray = Array.from(notes);
	const fourths = ["B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"];
	const fifths  = ["C", "G", "D", "A", "E", "B", "F#", "C#/Db", "G#/Ab", "D#/Eb", "A#/Bb", "F"];
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

	mode.addEventListener('change', () => {
		if (mode.value === 'fourths') {
			notesArray.forEach((note, index) => {
				note.textContent = fourths[index];
			});
			h1.textContent = 'Circle of Fourths Trainer';
		} else {
			notesArray.forEach((note, index) => {
				note.textContent = fifths[index];
			});
			h1.textContent = 'Circle of Fifths Trainer';
		}
	});

	// WebSocket
	const socket = (() => {
		const ws = new WebSocket("ws://localhost:8081/ws");
		ws.onmessage = (event) => {
			document.querySelector('.note-name').textContent = event.data;
		}
	})();
})();