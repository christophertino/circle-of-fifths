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
	const resultsTable = document.getElementById('results-table');
	const notesArray = Array.from(notes);
	const fourths = ["B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"];
	const fifths  = ["C", "G", "D", "A", "E", "B", "F#", "C#/Db", "G#/Ab", "D#/Eb", "A#/Bb", "F"];
	const ws = new WebSocket("ws://localhost:8081/ws");
	let noteMap = new Map();
	let currentNote = 0;
	let intervalId;
	let round = 1;
	let correct = 0;
	let incorrect = 0;

	// Play / Pause
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

		// Add row to results table when starting a new round
		if (round > 1 && currentNote === 0 && correct + incorrect === 0) {
			addRows();
		}

		intervalId = setInterval(() => {
			notesArray[currentNote].classList.add('active');
			if (currentNote >= notesArray.length - 1) {
				if (loop.value === 'false') {
					clearInterval(intervalId);
					pause.classList.remove('active');
					play.classList.add('active');
				}
				currentNote = 0;
				noteMap.clear();
				round++;
				// Allow time for user to see the last note
				setTimeout(() => {
					notesArray.forEach(note => note.classList.remove('active'));
					if (loop.value === 'true') {
						notesArray[0].classList.add('active');
						if (mode.value === 'random') {
							randomizeNotes();
						}
						if (round > 1 && correct + incorrect === 0) {
							addRows();
						}
					}
				}, speed.value);
			} else {
				currentNote++;
			}
		}, speed.value);
	});

	// Change note order
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
			randomizeNotes();
			h1.textContent = 'Random Note Trainer';
			ws.send(JSON.stringify({ name: 'mode', data: 'random' }));
		}
	});

	// WebSocket receive message
	ws.onmessage = (event) => {
		if (!noteMap.has(currentNote)) {
			noteMap.set(currentNote, event.data);
			noteValue.textContent = event.data;
			keepScore(event.data);
		}
	}

	// Listen for audio data
	navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
		const audioContext = new AudioContext();
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

	// Randomize the notes array
	const randomizeNotes = () => {
		for (let i = 0; i < notesArray.length; i++) {
			let j = Math.floor(Math.random() * (i + 1));
			let temp = notesArray[i].textContent;
			notesArray[i].textContent = notesArray[j].textContent;
			notesArray[j].textContent = temp;
		}
	}

	// Check if note is correct
	const keepScore = (note) => {
		if (notesArray[currentNote].textContent === note) {
			correct++;
		} else {
			incorrect++;
		}
		let row = resultsTable.getChildNodes()[round];
		row.querySelector('.correct').textContent = correct;
		row.querySelector('.incorrect').textContent = incorrect;
		row.querySelector('.accuracy').textContent = Math.round((correct / (correct + incorrect)) * 100) + '%';
	}

	// Add rows to results table
	const addRows = () => {
		let newRow = resultsTable.insertRow();
		let roundCell = newRow.insertCell(0);
		let correctCell = newRow.insertCell(1);
		let incorrectCell = newRow.insertCell(2);
		let accuracyCell = newRow.insertCell(3);
		roundCell.classList.add('round');
		correctCell.classList.add('correct');
		incorrectCell.classList.add('incorrect');
		accuracyCell.classList.add('accuracy');
		roundCell.textContent = round;
		correctCell.textContent = '0';
		incorrectCell.textContent = '0';
		accuracyCell.textContent = '0%';
	}
})();
