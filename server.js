const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 3001;

require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to Database');
  })
  .catch((error) => {
    console.error('Error connecting to Database:', error);
  });


const movieSchema = new mongoose.Schema({
  title:{type: String, required: true},
  description: {type: String, required: true},
  rating: {type: Number, required: true, min:0, max:10},
});

const Movie = mongoose.model('Movie', movieSchema, 'movies');



app.get(`/api/movies`, (req, res) => {

  Movie.find()
    .then((movies) => {
      res.json(movies);
    })
    .catch((error) => {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'Failed to fetch movies' });
    });
});

app.post('/api/movies', (req, res) => {

  const { title, description, rating } = req.body;
  const newMovie = new Movie({ title, description, rating });

  newMovie.save()
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((error) => {
      console.error('Error creating movie:', error);
      res.status(500).json({ error: 'Failed to create movie' });
    });
});

app.put('/api/movies/:id', (req, res) => {

  const { id } = req.params;
  const { title, description, rating } = req.body;

  Movie.findByIdAndUpdate(id, { title, description, rating }, { new: true })
    .then((updatedMovie) => {
      res.json(updatedMovie);
    })
    .catch((error) => {
      console.error('Error updating movie:', error);
      res.status(500).json({ error: 'Failed to update movie' });
    });
});

app.delete('/api/movies/:id', (req, res) => {

  const { id } = req.params;

  Movie.findByIdAndDelete(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((error) => {
      console.error('Error deleting movie:', error);
      res.status(500).json({ error: 'Failed to delete movie' });
    });
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});