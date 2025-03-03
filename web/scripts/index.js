document.addEventListener('DOMContentLoaded', () => {
	const notes = document.querySelectorAll('.note');
	const center = document.querySelector('.center');
	const play = document.querySelector('.play');
	const pause = document.querySelector('.pause');
	const notesArray = Array.from(notes);
	let currentNote = 0;

	center.addEventListener('click', () => {
		currentNote = 0;
		play.style.display = 'none';
		pause.style.display = 'block';

		let intervalId = setInterval(() => {
			notesArray[currentNote].classList.add('active');
			currentNote++;

			if (currentNote === notesArray.length) {
				clearInterval(intervalId);

				play.style.display = 'block';
				pause.style.display = 'none';
			}
		}, 1000);
	});
});