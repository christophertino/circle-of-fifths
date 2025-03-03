document.addEventListener('DOMContentLoaded', function () {
	const notes = document.querySelectorAll('.note');
	const center = document.querySelector('.center');
	const play = document.querySelector('.play');
	const pause = document.querySelector('.pause');
	const notesArray = Array.from(notes);
	let currentNote = 0;

	center.addEventListener('click', function () {
		currentNote = 0;
		play.style.display = 'none';
		pause.style.display = 'block';
		notesArray[currentNote].style.background = '#333';
		notesArray[currentNote].style.textColor = '#fff';

		setTimeout(() => {
			currentNote++;
			notesArray[currentNote - 1].style.background = '#f7ca18';
			notesArray[currentNote - 1].style.textColor = '#333';
		}, 500);
	});
});