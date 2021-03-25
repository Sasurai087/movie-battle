const autoCompleteConfig = {
  //How to show individual item?
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
  <img src="${imgSrc}" />
  ${movie.Title} (${movie.Year})
  `;
  },

  // //What to do when someone clicks on an item?
  // onOptionSelect(movie) {
  //   document.querySelector(".tutorial").classList.add("is-hidden");
  //   onMovieSelect(movie);
  // },

  //What to backfill to input once item is clicked?
  inputValue(movie) {
    return movie.Title;
  },

  //How to fetch the data?
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "ff938297",
        s: searchTerm,
      },
    });
    if (response.data.Error) {
      return [];
    }
    return response.data.Search;
  },
};

// Calling AutoComplete, a reusable code snippet, and entering movie data as arguments
//AUTOCOMPLETE LEFT
createAutoComplete({
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
  //Where to render AutoComplete?
  root: document.querySelector("#left-autocomplete"),
});

//AUTOCOMPLETE RIGHT
createAutoComplete({
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
  //Where to render AutoComplete?
  root: document.querySelector("#right-autocomplete"),
});

//Comparison variables
let leftMovie = "";
let rightMovie = "";

// MovieFight specific Look Up code
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: "ff938297",
      i: movie.imdbID,
    },
  });

  summaryElement.innerHTML = movieTemplate(response.data);
  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

//Movie Comparison Code
const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];
    const leftSideValue = parseFloat(leftStat.dataset.value);
    const rightSideValue = parseFloat(rightStat.dataset.value);

    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-warning");
    } else {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-warning");
    }
  });
};

//Movie Template
const movieTemplate = (movieDetail) => {
  const dollars = parseInt(movieDetail.BoxOffice.replace(/\D/g, ""));
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/\D/g, ""));
  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  return `
    <article class='media'>
      <figure class='media-left'>
        <p class='image'>
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>

      <div class='media-content'>
        <div class='content'>
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>

    <article data-value=${awards} class='notification is-primary'>
      <p class='title'>${movieDetail.Awards}</p>
      <p class='subtitle'>Awards</p>
    </article>
    <article data-value=${dollars} class='notification is-primary'>
      <p class='title'>${movieDetail.BoxOffice}</p>
      <p class='subtitle'>BoxOffice</p>
    </article>
    <article data-value=${metascore} class='notification is-primary'>
      <p class='title'>${movieDetail.Metascore}</p>
      <p class='subtitle'>Metascore</p>
    </article>
    <article data-value=${imdbRating} class='notification is-primary'>
      <p class='title'>${movieDetail.imdbRating}</p>
      <p class='subtitle'>IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class='notification is-primary'>
      <p class='title'>${movieDetail.imdbVotes}</p>
      <p class='subtitle'>IMDB Votes</p>
    </article>

  `;
};
