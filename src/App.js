import { useEffect, useState } from "react";

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (values) => {
  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
};
const key = 'd02f442';

export default function App() {
  // States
  const [query, setQuery] = useState("Interstellar");
  const [movies, setMovies] = useState([]);  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [watched, setWatched] = useState(tempWatchedData);

  // Derived States
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  useEffect(() => {
    async function fetchMovies() {
      try {
        setIsLoading(true);
        const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${query}`);
        const data = await res.json();

        if (data.Response === "False") throw new Error(data.Error);

        setMovies(data.Search);
        setError("");
      } catch (err) {
        setMovies([]);
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    fetchMovies();
  }, [query]);

  async function handleAddMovie(id) {
    if (watched.some((movie) => movie.imdbID === id)) return;

    const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${id}`);
    const data = await res.json();

    const newWatchedMovie = {
      imdbID: data.imdbID,
      Title: data.Title,
      Year: data.Year,
      Poster: data.Poster,
      runtime: Number(data.Runtime.split(" ").at(0)),
      imdbRating: Number(data.imdbRating),
      userRating: Number(data.imdbRating),
    };

    setWatched((watched) => [...watched, newWatchedMovie]);
  }

  return (
    <>
      <Navbar movies={movies}>
        <Search query={query} setQuery={setQuery} />
      </Navbar>
    
      <main className="main">
        <Box>
          {isLoading && <p className="loader">Carregando...</p>}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleAddMovie} />
          }
          {error && <p className="error"><span>⛔️</span> {error}</p>}
        </Box>

        <Box>
          <>
            <div className="summary">
                <h2>Filmes Assistidos</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length}</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                  </p>
                </div>
              </div>

              <ul className="list">
                {watched.map((movie) => (
                  <li key={movie.imdbID}>
                    <img src={movie.Poster} alt={`${movie.Title} poster`} />
                    <h3>{movie.Title}</h3>
                    <div>
                      <p>
                        <span>⭐️</span>
                        <span>{movie.imdbRating}</span>
                      </p>
                      <p>
                        <span>🌟</span>
                        <span>{movie.userRating}</span>
                      </p>
                      <p>
                        <span>⏳</span>
                        <span>{movie.runtime} min</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
        </Box>
      </main>
    </>
  );
}

function Navbar({movies, children}){

  return(
    <nav className="nav-bar">
        <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
        </div>
        {children}
        <p className="num-results">
          Found <strong>{movies?.length ?? 0}</strong> results
        </p>
      </nav>
  )
}

function Search({ query, setQuery }) {

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
