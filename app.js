document.getElementById('searchBtn').addEventListener('click', searchMovies);

function searchMovies() {
	let query = document.getElementById('search').value;
	if (!query) return;

	let apiUrl = `https://www.omdbapi.com/?s=${query}&apikey=YOUR_API_KEY`;

	fetch(apiUrl)
		.then((response) => response.json())
		.then((data) => {
			let resultsDiv = document.getElementById('results');
			resultsDiv.innerHTML = ''; // Clear previous results

			if (data.Search) {
				data.Search.forEach((movie) => {
					let movieDiv = document.createElement('div');
					movieDiv.classList.add('movie-card');

					movieDiv.innerHTML = `
                        <img src="${movie.Poster}" width="100">
                        <p><strong>${movie.Title}</strong> (${movie.Year})</p>
                    `;
					resultsDiv.appendChild(movieDiv);
				});
			} else {
				resultsDiv.innerHTML = '<p>No results found</p>';
			}
		})
		.catch((error) => console.error('Error fetching data:', error));
}
