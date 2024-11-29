const API_URL = '/movies';
const moviesContainer = document.getElementById('movies-container');
const sortOptions = document.getElementById('sort-options'); 

const movieForm = document.getElementById('movie-form');
let editingMovieId = null; 
const genreFilter = document.getElementById('genre-filter');

let allMovies = []; 

async function fetchMovies() {
    try {
        const response = await fetch(API_URL);
        const movies = await response.json();

        allMovies = movies; 
        const sortedMovies = sortMovies(allMovies, sortOptions.value);

        const genres = getGenresFromMovies(allMovies); 
        populateGenreFilter(genres);

        displayMovies(sortedMovies);
    } catch (error) {
        console.error('Ошибка загрузки фильмов:', error);
    }
}

function filterMoviesByGenre(movies, selectedGenre) {
    if (selectedGenre === 'all') return movies;

    return movies.filter(movie =>
        movie.genres.some(genre => genre.toLowerCase() === selectedGenre.toLowerCase())
    );
}


function getGenresFromMovies(movies) {
    const allGenres = movies.flatMap(movie => movie.genres);
    return [...new Set(allGenres)];
}


function populateGenreFilter(genres) {
    genreFilter.innerHTML = '<option value="all">Все</option>'; // Сбрасываем текущие опции
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}


function displayMovies(movies) {
    moviesContainer.innerHTML = ''; 

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';

        movieCard.innerHTML = `
            <img src="${movie.posterUrl}" alt="${movie.title}" class="movie-poster">
            <h3 class="movie-title">${movie.title}</h3>
            <p><strong>Режиссер:</strong> ${movie.director}</p>
            <p><strong>Год:</strong> ${movie.year}</p>
            <button class="menu-button">⋮</button>
            <div class="menu-options">
                <button class="view-movie" onclick="showMovieDetails(${JSON.stringify(movie).replace(/"/g, '&quot;')})">Просмотреть</button>
                <button class="edit-movie" onclick="editMovie(${JSON.stringify(movie).replace(/"/g, '&quot;')})">Редактировать</button>
                <button class="delete-movie" onclick="deleteMovie('${movie._id}')">Удалить</button>
            </div>
        `;

        const menuButton = movieCard.querySelector('.menu-button');
        const menuOptions = movieCard.querySelector('.menu-options');

        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.menu-options').forEach(menu => {
                if (menu !== menuOptions) menu.classList.remove('visible');
            });
            menuOptions.classList.toggle('visible');
        });

        movieCard.querySelector('.view-movie').addEventListener('click', () => {
            showMovieDetails(movie);
        });

        movieCard.querySelector('.edit-movie').addEventListener('click', () => {
            editMovie(movie);
        });

        movieCard.querySelector('.delete-movie').addEventListener('click', () => {
            deleteMovie(movie._id);
        });

        moviesContainer.appendChild(movieCard);
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.menu-options').forEach(menu => menu.classList.remove('visible'));
    });
    
}


function showMovieDetails(movie) {
    const modal = document.getElementById('movie-modal');

    document.getElementById('modal-title').textContent = movie.title;
    document.getElementById('modal-poster').src = movie.posterUrl;
    document.getElementById('modal-poster').alt = movie.title;
    document.getElementById('modal-director').textContent = movie.director;
    document.getElementById('modal-year').textContent = movie.year;
    document.getElementById('modal-genres').textContent = movie.genres.join(', ');
    document.getElementById('modal-rating').textContent = movie.rating;
    document.getElementById('modal-description').textContent = movie.description;

    document.getElementById('modal-created-at').textContent = new Date(movie.createdAt).toLocaleString();
    document.getElementById('modal-updated-at').textContent = new Date(movie.updatedAt).toLocaleString();

    modal.style.display = 'block';

    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function deleteMovie(movieId) {
    try {
        const response = await fetch(`${API_URL}/${movieId}`, { method: 'DELETE' });
        if (response.ok) {
            fetchMovies();
        } else {
            //alert('Ошибка при удалении фильма');
        }
    } catch (error) {
        console.error('Ошибка при удалении фильма:', error);
    }
}

function editMovie(movie) {
    document.getElementById('title').value = movie.title;
    document.getElementById('director').value = movie.director || ''; // Поле может быть пустым
    document.getElementById('year').value = movie.year || '';
    document.getElementById('genres').value = movie.genres.join(', ') || '';
    document.getElementById('rating').value = movie.rating || '';
    document.getElementById('description').value = movie.description || '';
    document.getElementById('posterUrl').value = movie.posterUrl || '';
    editingMovieId = movie._id;

    const updatedAtField = document.getElementById('updatedAt');
    if (updatedAtField) {
        updatedAtField.textContent = `Последнее обновление: ${new Date(movie.updatedAt).toLocaleString()}`;
    }
}

function showAlert(message, isError = false) {
    const alertBox = document.createElement('div');
    alertBox.classList.add('alert', isError ? 'error' : 'success');
    alertBox.textContent = message;

    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
}

genreFilter.addEventListener('change', () => {
    const selectedGenre = genreFilter.value;
    const filteredMovies = filterMoviesByGenre(allMovies, selectedGenre); // Используем глобальные фильмы
    displayMovies(filteredMovies);
});

movieForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const year = Number(document.getElementById('year').value.trim());
    const genres = document.getElementById('genres').value.split(',').map(g => g.trim());
    const rating = Number(document.getElementById('rating').value.trim());

    if (!title || !year || genres.length === 0 || isNaN(rating)) {
        showAlert('Пожалуйста, заполните все обязательные поля!', true);
        return;
    }
    const movieData = {
        title: document.getElementById('title').value,
        director: document.getElementById('director').value,
        year: Number(document.getElementById('year').value),
        genres: document.getElementById('genres').value.split(',').map(g => g.trim()),
        rating: Number(document.getElementById('rating').value),
        description: document.getElementById('description').value,
        posterUrl: document.getElementById('posterUrl').value,
    };

    const method = editingMovieId ? 'PUT' : 'POST';
    const url = editingMovieId ? `${API_URL}/${editingMovieId}` : API_URL;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData),
        });

        if (response.ok) {
            fetchMovies();
            movieForm.reset();
            editingMovieId = null;
        } else {
            alert('Ошибка при сохранении фильма');
        }
    } catch (error) {
        console.error('Ошибка отправки данных:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
});

async function fetchFileInfo() {
    try {
        const response = await fetch('/file-info');
        const fileData = await response.json();

        console.log('Содержимое файла:', fileData.content);
        alert(`Содержимое файла: ${fileData.content}`);
    } catch (error) {
        console.error('Ошибка при получении информации из файла:', error);
    }
}

document.getElementById('show-file-info-btn').addEventListener('click', fetchFileInfo);


moviesContainer.addEventListener('click', (event) => {
    const menuButton = event.target.closest('.menu-button');
    const menuOptions = event.target.closest('.menu-options');

    document.querySelectorAll('.menu-options').forEach(menu => menu.classList.remove('visible'));

    if (menuButton && !menuOptions) {
        const movieCard = menuButton.closest('.movie-card');
        const optionsMenu = movieCard.querySelector('.menu-options');
        optionsMenu.classList.add('visible');
    }
});

function sortMovies(movies, criteria) {
    return movies.sort((a, b) => {
        if (criteria === 'title') {
            return a.title.localeCompare(b.title);
        } else if (criteria === 'year') {
            return b.year - a.year;
        } else if (criteria === 'createdAt') {
            return new Date(b.createdAt) - new Date(a.createdAt); 
        }
        return 0;
    });
}

sortOptions.addEventListener('change', fetchMovies);

document.addEventListener('DOMContentLoaded', fetchMovies);