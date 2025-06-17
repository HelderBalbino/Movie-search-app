let moviesData = []; // array to Store fetched movies for sorting
let autocompleteData = []; // Store autocomplete suggestions
let autocompleteTimeout; // Debounce timeout for autocomplete

document.getElementById('searchBtn').addEventListener('click', searchMovies);
document
	.getElementById('sort')
	.addEventListener('change', sortAndDisplayMovies);

// Add Enter key functionality to search input
document
	.getElementById('search')
	.addEventListener('keypress', function (event) {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent form submission if inside a form
			hideAutocomplete();
			searchMovies();
		}
	});

// Add autocomplete functionality
document.getElementById('search').addEventListener('input', function (event) {
	const query = event.target.value.trim();

	// Clear previous timeout
	clearTimeout(autocompleteTimeout);

	if (query.length >= 2) {
		// Debounce the autocomplete requests
		autocompleteTimeout = setTimeout(() => {
			fetchAutocomplete(query);
		}, 300);
	} else {
		hideAutocomplete();
	}
});

// Hide autocomplete when clicking outside
document.addEventListener('click', function (event) {
	const searchInput = document.getElementById('search');
	const autocompleteList = document.getElementById('autocomplete-list');

	if (
		!searchInput.contains(event.target) &&
		!autocompleteList?.contains(event.target)
	) {
		hideAutocomplete();
	}
});

function searchMovies() {
	let query = document.getElementById('search').value;
	let loadingText = document.getElementById('loading');
	let resultsDiv = document.getElementById('results');

	if (!query) return;

	resultsDiv.innerHTML = '';
	loadingText.classList.remove('hidden');

	let apiUrl = `https://www.omdbapi.com/?s=${query}&apikey=cfe0c5c4`;

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
			fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=cfe0c5c4`)
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

function fetchAutocomplete(query) {
	const apiUrl = `https://www.omdbapi.com/?s=${query}&apikey=cfe0c5c4`;

	fetch(apiUrl)
		.then((response) => response.json())
		.then((data) => {
			if (data.Search) {
				autocompleteData = data.Search.slice(0, 8); // Limit to 8 suggestions
				showAutocomplete();
			} else {
				hideAutocomplete();
			}
		})
		.catch((error) => {
			console.error('Autocomplete error:', error);
			hideAutocomplete();
		});
}

function showAutocomplete() {
	hideAutocomplete(); // Remove existing dropdown

	const searchWrapper = document.querySelector('.search-wrapper');
	const autocompleteList = document.createElement('div');
	autocompleteList.id = 'autocomplete-list';
	autocompleteList.className = 'autocomplete-dropdown';

	autocompleteData.forEach((movie) => {
		const item = document.createElement('div');
		item.className = 'autocomplete-item';
		item.innerHTML = `
			<img src="${
				movie.Poster !== 'N/A'
					? movie.Poster
					: 'https://via.placeholder.com/50x75?text=No+Image'
			}" alt="${movie.Title}">
			<div class="autocomplete-info">
				<div class="autocomplete-title">${movie.Title}</div>
				<div class="autocomplete-year">${movie.Year}</div>
			</div>
		`;

		item.addEventListener('click', () => {
			document.getElementById('search').value = movie.Title;
			hideAutocomplete();
			searchMovies();
		});

		autocompleteList.appendChild(item);
	});

	searchWrapper.appendChild(autocompleteList);
}

function hideAutocomplete() {
	const existingDropdown = document.getElementById('autocomplete-list');
	if (existingDropdown) {
		existingDropdown.remove();
	}
}
