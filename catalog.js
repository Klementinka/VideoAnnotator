import axios from 'https://cdn.skypack.dev/axios';

const serverAddress = 'http://localhost:3000/movies'; // TODO change to your server address

async function getMovies() {
    try {
        const response = await axios.get(serverAddress);
        return response.data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
}

async function getMovieById(movieId) {
    try {
        const response = await axios.get(`${serverAddress}/${movieId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching movie with ID ${movieId}:`, error);
        throw error;
    }
}

module.exports = {
    getMovies,
    getMovieById
};