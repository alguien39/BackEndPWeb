const {PORT} = require("./config.js");
const express = require("express");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
const mysql2 = require("mysql2");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const db = require('./Connection.js');
const { Console } = require('console');
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

// Obtener todas las peliculas
app.get('/Peliculas', (req, res) => {
    const query = 'SELECT * FROM mostrarpeliculas';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            res.status(500).send('Error al obtener datos');
        } else {
            res.json(results);
        }
    });
});

// Eliminar crítica por ID
app.delete('/criticas/:criticaID', (req, res) => {
    const { criticaID } = req.params;  // Obtener el ID de la crítica desde los parámetros de la URL
    console.log('ID de crítica a eliminar:', criticaID);  // Verificar qué ID está recibiendo el servidor

    // Aquí cambiamos 'ID' por 'CriticaID' según el nombre del campo en tu tabla
    const query = `DELETE FROM criticas WHERE CriticaID = ?`;

    db.query(query, [criticaID], (err, results) => {
        if (err) {
            console.error('Error al eliminar crítica:', err);
            return res.status(500).send('Error al eliminar crítica');
        }

        // Si no se afectaron filas, significa que no se encontró la crítica con ese ID
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Crítica no encontrada' });
        }

        console.log('Crítica eliminada con éxito');
        res.json({ message: 'Crítica eliminada exitosamente' });
    });
});


//Mostrar criticas por IdDePelicula
app.get('/Criticas/:peliculaID', (req, res) => {
    const { peliculaID } = req.params;
    const query = `SELECT * FROM criticas WHERE PeliculaID = ?`;

    db.query(query, [peliculaID], (err, results) => {
        if (err) {
            console.error('Error al obtener críticas:', err);
            return res.status(500).send('Error al obtener críticas');
        }
        
        // Si no se encuentran críticas, devolvemos un arreglo vacío
        if (results.length === 0) {
            return res.json([]);
        }

        // Devolver las críticas como respuesta en formato JSON
        res.json(results);
    });
});



//Agregar Critica a IdDePelicula
app.post('/Criticas', [
    check('PeliculaID').isInt(),
    check('Autor').isString(),
    check('Puntuacion').isFloat({ min: 0, max: 10 }),
    check('Comentario').isString(),
    check('Fecha').isDate(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { PeliculaID, Autor, Puntuacion, Comentario, Fecha } = req.body;
    const query = `CALL AgregarCritica(?, ?, ?, ?, ?)`;
    db.query(query, [PeliculaID, Autor, Puntuacion, Comentario, Fecha], (err, results) => {
        if (err) {
            console.error('Error al agregar crítica:', err);
            res.status(500).send('Error al agregar crítica');
        } else {
            res.json({ message: 'Crítica agregada exitosamente' });
        }
    });
});

//Consultar Datos de Pelicula Por Id
app.get('/Peliculas/:peliculaID', (req, res) => {
    const { peliculaID } = req.params;
    const query = `SELECT * FROM mostrarpeliculas WHERE PeliculaID = ?`;
    db.query(query, [peliculaID], (err, results) => {
        if (err) {
            console.error('Error al obtener película:', err);
            res.status(500).send('Error al obtener película');
        } else {
            res.json(results[0]);
        }
    });
});


//Consultar Actores por IdPelicula
app.get('/Peliculas/:peliculaID/Actores', (req, res) => {
    const { peliculaID } = req.params;
    const query = `SELECT * FROM mostraractoresporpelicula WHERE PeliculaID = ?`;
    db.query(query, [peliculaID], (err, results) => {
        if (err) {
            console.error('Error al obtener actores:', err);
            res.status(500).send('Error al obtener actores');
        } else {
            res.json(results);
        }
    });
});

// Obtener las primeras 5 películas para el carrusel
app.get('/api/carrusel', (req, res) => {
    const query = 'SELECT * FROM mostrarpeliculas LIMIT 5'; // Obtener las primeras 5 películas
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener películas para el carrusel:', err);
            return res.status(500).send('Error al obtener películas');
        }
        res.json(results);  // Enviar los resultados al cliente
    });
});

// Endpoint para agregar una nueva película
app.post('/Peliculas', (req, res) => {
    const { titulo, fechaEstreno, presupuesto, recaudacion, director, categoria, duracion, sinopsis, poster } = req.body;

    const query = `CALL AgregarPelicula(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [titulo, fechaEstreno, presupuesto, recaudacion, director, categoria, duracion, sinopsis, poster], (err, results) => {
        if (err) {
            console.error('Error al agregar película:', err);
            return res.status(500).send('Error al agregar película: ' + JSON.stringify(err));
        }
        res.json({ message: 'Película agregada exitosamente', data: results });
    });
});

// Endpoint para actualizar una película
app.put('/Peliculas/:id', (req, res) => {
    const PeliculaIDParam = parseInt(req.params.id, 10);

    if (isNaN(PeliculaIDParam)) {
        return res.status(400).json({ message: 'ID de película inválido' });
    }

    const {
        titulo,
        fechaEstreno,
        presupuesto,
        recaudacion,
        director,
        categoria,
        duracion,
        sinopsis,
        poster
    } = req.body;

    if (!titulo || !fechaEstreno || isNaN(presupuesto) || isNaN(recaudacion) ||
        isNaN(director) || isNaN(categoria) || isNaN(duracion) ||
        !sinopsis || !poster) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y deben ser válidos.' });
    }

    const query = `CALL ActualizarPelicula(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
        PeliculaIDParam,
        titulo,
        fechaEstreno,
        presupuesto,
        recaudacion,
        director,
        categoria,
        duracion,
        sinopsis,
        poster
    ], (err, results) => {
        if (err) {
            console.error('Error al actualizar la película:', err);
            return res.status(500).json({ message: 'Error al actualizar la película', error: err });
        }

        res.json({ message: 'Película actualizada exitosamente', data: results });
    });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
