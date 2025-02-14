let moviesData = []; // array to Store fetched movies for sorting

document.getElementById('searchBtn').addEventListener('click', searchMovies);
document
	.getElementById('sort')
	.addEventListener('change', sortAndDisplayMovies);

function searchMovies() {
	let query = document.getElementById('search').value;
	let loadingText = document.getElementById('loading');
	let resultsDiv = document.getElementById('results');

	if (!query) return;

	resultsDiv.innerHTML = '';
	loadingText.classList.remove('hidden');

	let apiUrl = `https://www.omdbapi.com/?s=${query}&apikey=YOUR_API_KEY`;

	fetch(apiUrl)
		.then((response) => response.json())
		.then((data) => {
			loadingText.classList.add('hidden');

			if (data.Search) {
				moviesData = data.Search; // Store movies
				fetchMovieDetails(); // Fetch ratings before sorting
			} else {
				resultsDiv.innerHTML = '<p>No results found</p>';
			}
		})
		.catch((error) => {
			loadingText.classList.add('hidden');
			resultsDiv.innerHTML =
				'<p>Error fetching data. Please try again.</p>';
			console.error('Error fetching data:', error);
		});
}

function fetchMovieDetails() {
	let promises = moviesData.map(
		(movie) =>
			fetch(
				`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=YOUR_API_KEY`,
			)
				.then((response) => response.json())
				.then(
					(details) =>
						(movie.imdbRating = details.imdbRating || 'N/A'),
				), // Add rating to movie object
	);

	Promise.all(promises).then(() => sortAndDisplayMovies());
}

function sortAndDisplayMovies() {
	let sortOption = document.getElementById('sort').value;

	moviesData.sort((a, b) => {
		if (sortOption === 'title') {
			return a.Title.localeCompare(b.Title);
		} else if (sortOption === 'year') {
			return parseInt(b.Year) - parseInt(a.Year);
		} else if (sortOption === 'rating') {
			return (
				(parseFloat(b.imdbRating) || 0) -
				(parseFloat(a.imdbRating) || 0)
			);
		}
	});

	displayMovies();
}

function displayMovies() {
	let resultsDiv = document.getElementById('results');
	resultsDiv.innerHTML = '';

	moviesData.forEach((movie) => {
		let movieDiv = document.createElement('div');
		movieDiv.classList.add('movie-card');

		movieDiv.innerHTML = `
            <img src="${movie.Poster}" width="100">
            <p><strong>${movie.Title}</strong> (${movie.Year}) - ⭐ ${movie.imdbRating}</p>
        `;
		resultsDiv.appendChild(movieDiv);
	});
}
