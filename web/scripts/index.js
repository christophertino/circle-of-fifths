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
	const noteValue = document.getElementById('note-value');
	const notesArray = Array.from(notes);
	const fourths = ["B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"];
	const fifths  = ["C", "G", "D", "A", "E", "B", "F#", "C#/Db", "G#/Ab", "D#/Eb", "A#/Bb", "F"];
	const ws = new WebSocket("ws://localhost:8081/ws");
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
			ws.send(JSON.stringify({ name: 'mode', data: 'fourths' }));
		} else if (mode.value === 'fifths') {
			notesArray.forEach((note, index) => {
				note.textContent = fifths[index];
			});
			h1.textContent = 'Circle of Fifths Trainer';
			ws.send(JSON.stringify({ name: 'mode', data: 'fifths' }));
		} else if (mode.value === 'random') {
			for (let i = 0; i < notesArray.length; i++) {
				let j = Math.floor(Math.random() * (i + 1));
				let temp = notesArray[i].textContent;
				notesArray[i].textContent = notesArray[j].textContent;
				notesArray[j].textContent = temp;
			}
			h1.textContent = 'Random Note Trainer';
			ws.send(JSON.stringify({ name: 'mode', data: 'random' }));
		}
	});

	// WebSocket receive message
	ws.onmessage = (event) => {
		noteValue.textContent = event.data;
	}

	// Listen for audio data
	navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
		const audioContext = new AudioContext();
		const sampleRate = audioContext.sampleRate; // 44100 Hz (default)
		const source = audioContext.createMediaStreamSource(stream);
		const processor = audioContext.createScriptProcessor(4096, 1, 1);

		source.connect(processor);
		processor.connect(audioContext.destination);

		processor.onaudioprocess = event => {
			let audioData = event.inputBuffer.getChannelData(0); // Get PCM data (Float32Array)

			// Convert Float32Array to ArrayBuffer (raw PCM)
			let buffer = new ArrayBuffer(audioData.length * 4);
			let view = new DataView(buffer);
			for (let i = 0; i < audioData.length; i++) {
				view.setFloat32(i * 4, audioData[i], true);
			}

			if (ws.readyState === WebSocket.OPEN) {
				ws.binaryType = "arraybuffer";
				ws.send(buffer);
			}
		};
	}).catch(err => {
		console.error(err);
	});
})();