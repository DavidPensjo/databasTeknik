import prompt from "prompt-sync";
const promptSync = prompt();

import mongoose from "mongoose";

mongoose
  .connect("mongodb://localhost:27017/uppgift1")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Couldn't connect to MongoDB...", err));

const movieSchema = mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  releaseYear: { type: Number, required: true },
  genres: [{ type: String }],
  ratings: [{ type: Number }],
  cast: [{ type: String }],
});

const movieModel = mongoose.model("Movies", movieSchema);

const viewAllMovies = async () => {
  try {
    const movies = await movieModel.find({});
    console.log("All Movies:");
    console.log(
      "Title".padEnd(30) + "Director".padEnd(20) + "Year".padEnd(6) + "Genres"
    );
    console.log("-".repeat(80));

    movies.forEach((movie) => {
      const title =
        movie.title.length > 27
          ? movie.title.substring(0, 24) + "..."
          : movie.title;
      const director =
        movie.director.length > 17
          ? movie.director.substring(0, 14) + "..."
          : movie.director;
      const genres = movie.genres.join(", ");

      console.log(
        `${title.padEnd(30)}${director.padEnd(20)}${movie.releaseYear
          .toString()
          .padEnd(6)}${genres}`
      );
      console.log("-".repeat(80));
    });
    console.log("\nPress Enter to return to the menu.");
    promptSync();
  } catch (error) {
    console.error("Error viewing all movies:", error);
  }
};

const addNewMovie = async () => {
  const newMovieDetails = {
    title: promptSync("Title: "),
    director: promptSync("Director: "),
    releaseYear: parseInt(promptSync("Release Year: "), 10),
    genres: promptSync("Genres (comma-separated): ")
      .split(",")
      .map((g) => g.trim()),
    ratings: promptSync("Ratings (comma-separated): ")
      .split(",")
      .map((r) => parseFloat(r.trim())),
    cast: promptSync("Cast (comma-separated): ")
      .split(",")
      .map((c) => c.trim()),
  };

  try {
    const newMovie = await movieModel.create(newMovieDetails);
    console.log("New movie added:");
    console.log(`Title: ${newMovie.title}`);
    console.log(`Director: ${newMovie.director}`);
    console.log(`Release Year: ${newMovie.releaseYear}`);
    console.log(`Genres: ${newMovie.genres.join(", ")}`);
    console.log(`Ratings: ${newMovie.ratings.join(", ")}`);
    console.log(`Cast: ${newMovie.cast.join(", ")}`);
    console.log("\nPress Enter to return to the menu.");
    promptSync();
  } catch (error) {
    console.error("Error adding a new movie:", error);
  }
};

const updateMovie = async () => {
  const movieTitleToUpdate = promptSync(
    "Enter the title of the movie to update: "
  );

  const newGenres = promptSync(
    "Enter new genres (comma-separated if more than one, leave blank to keep current): "
  );
  const newRatings = promptSync(
    "Enter new ratings (comma-separated if more than one, leave blank to keep current): "
  );
  const newCast = promptSync(
    "Enter new cast (comma-separated if more than one, leave blank to keep current): "
  );

  const update = {};
  if (newGenres)
    update.genres = newGenres.split(",").map((genre) => genre.trim());
  if (newRatings)
    update.ratings = newRatings
      .split(",")
      .map((rating) => parseFloat(rating.trim()));
  if (newCast) update.cast = newCast.split(",").map((actor) => actor.trim());

  try {
    const updatedMovie = await movieModel.findOneAndUpdate(
      { title: movieTitleToUpdate },
      update,
      { new: true }
    );
    if (updatedMovie) {
      console.log("Movie updated successfully:");
      console.log(`Genres: ${updatedMovie.genres.join(", ")}`);
      console.log(`Ratings: ${updatedMovie.ratings.join(", ")}`);
      console.log(`Cast: ${updatedMovie.cast.join(", ")}`);
      console.log("\nPress Enter to return to the menu.");
      promptSync();
    } else {
      console.log("Movie not found.");
      console.log("\nPress Enter to return to the menu.");
      promptSync();
    }
  } catch (error) {
    console.error("Error updating the movie:", error);
  }
};

const deleteMovie = async (title) => {
  try {
    const result = await movieModel.deleteOne({ title });
    if (result.deletedCount === 0) {
      console.log("No movies found with that title.");
    } else {
      console.log("Movie deleted successfully.");
      console.log("\nPress Enter to return to the menu.");
      promptSync();
    }
  } catch (error) {
    console.error("Error deleting movie:", error);
    console.log("\nPress Enter to return to the menu.");
    promptSync();
  }
};

const exitApp = () => {
  mongoose.disconnect();
  console.log("Exiting the application.");
  process.exit(0);
};

const mainMenu = async () => {
  console.log(`
====================================
||                                ||
||      1. View all movies        ||
||      2. Add a new movie        ||
||      3. Update a movie         ||
||      4. Delete a movie         ||
||      5. Exit                   ||
||                                ||
====================================`);

  const choice = promptSync("Select an action: ");

  switch (choice) {
    case "1":
      await viewAllMovies();
      break;
    case "2":
      await addNewMovie();
      break;
    case "3":
      await updateMovie();
      break;
    case "4":
      await deleteMovie();
      break;
    case "5":
      exitApp();
      return;
    default:
      console.log("Invalid choice. Please select a valid option.");
      break;
  }
  mainMenu();
};

mainMenu().catch(console.error);
