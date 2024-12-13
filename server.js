const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { connectToDb, ObjectId } = require('./db');
const { clearFile, logToFile, getServerInfo, logOSInfo, filePath } = require('./utils');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

clearFile();
logToFile(getServerInfo());

app.get('/os-info', (req, res) => {
    const osInfo = {
        platform: os.platform(),
        release: os.release(),
        architecture: os.arch(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuCores: os.cpus().length,
        uptime: os.uptime(),
    };

    res.json(osInfo);
});

app.get('/file-info', (req, res) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении файла:', err);
            return res.status(500).json({ message: 'Ошибка при чтении файла' });
        }

        res.json({ content: data });
    });
});

app.get('/movies', async (req, res) => {
    try {
        const { client, database } = await connectToDb();
        const movies = database.collection('movies');
        const allMovies = await movies.find().toArray();
        res.json(allMovies);
        await client.close();
    } catch (error) {
        console.error('Ошибка получения фильмов:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/movies', async (req, res) => {
    try {
        const newMovie = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const { client, database } = await connectToDb();
        const movies = database.collection('movies');
        const result = await movies.insertOne(newMovie);
        res.status(201).json({ ...newMovie, _id: result.insertedId });
        await client.close();
    } catch (error) {
        console.error('Ошибка при добавлении фильма:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.delete('/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id;

        const { client, database } = await connectToDb();
        const movies = database.collection('movies');
        const result = await movies.deleteOne({ _id: new ObjectId(movieId) });

        if (result.deletedCount === 1) {
            res.status(200).send('Фильм успешно удалён');
        } else {
            res.status(404).send('Фильм не найден');
        }
        await client.close();
    } catch (error) {
        console.error('Ошибка при удалении фильма:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.put('/movies/:id', async (req, res) => {
    try {
        const movieId = new ObjectId(req.params.id);
        const updatedData = {
            ...req.body,
            updatedAt: new Date(),
        };

        const { client, database } = await connectToDb();
        const movies = database.collection('movies');
        const result = await movies.updateOne({ _id: movieId }, { $set: updatedData });

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Фильм не найден' });
        }

        res.status(200).send({ message: 'Фильм успешно обновлен' });
        await client.close();
    } catch (error) {
        console.error('Ошибка при обновлении фильма:', error);
        res.status(500).send({ message: 'Ошибка при обновлении фильма' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    logOSInfo();
});
