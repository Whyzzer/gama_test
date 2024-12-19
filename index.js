const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3030;

//cors

app.use(cors());
// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Test API",
      description: "Test API Information",
      version: "1.0.0",
    },
  },
  apis: ["index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve the API information
 *     description: Retrieve the API information including title, description, and version.
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: Test API
 *                 description:
 *                   type: string
 *                   example: Test API Information
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
const db = new sqlite3.Database(":memory:");

// Create movies table and insert sample data
db.serialize(() => {
    db.run(
        "CREATE TABLE movies (Title TEXT, video_url TEXT, cover_img_url TEXT, rating REAL, isrecent BOOLEAN, isboxoffice BOOLEAN)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('Inception', 'http://example.com/inception', 'http://example.com/inception.jpg', 8.8, 1, 1)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('Interstellar', 'http://example.com/interstellar', 'http://example.com/interstellar.jpg', 8.6, 0, 1)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('The Greenlight', 'https://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', '/public/greenlight_two.jpg', 8.5, 1, 0)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('The Gentlemen', 'http://media.w3.org/2010/05/sintel/trailer.mp4', '/public/gentlmen.jpg', 9.4, 1, 1)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('From Dusk till Dawn', 'https://www.nlm.nih.gov/web/documentation/TemplateDocumentation/video_files/IN_Intro-800.mp4', '/public/dusktilldawn.jpg', NULL, 0, 0)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('Spy City', 'https://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', '/public/spycity.jpg', 4.5, 0, 1)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('Project Runway', 'http://media.w3.org/2010/05/sintel/trailer.mp4', '/public/runway.jpg', 5.4, 0, 1)"
    );
    db.run(
        "INSERT INTO movies (Title, video_url, cover_img_url, rating, isrecent, isboxoffice) VALUES ('Project Greenlight 2', 'https://www.nlm.nih.gov/web/documentation/TemplateDocumentation/video_files/IN_Intro-800.mp4', '/public/greenlight_two.jpg', 5.6, 0, 1)"
    );
});

/**
 * @swagger
 * /filter-movie:
 *   get:
 *     summary: Filter movie by name
 *     description: Retrieve movie details by filtering with the movie name.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the movie to filter by
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Title:
 *                   type: string
 *                   example: Inception
 *                 video_url:
 *                   type: string
 *                   example: http://example.com/inception
 *                 cover_img_url:
 *                   type: string
 *                   example: http://example.com/inception.jpg
 *                 rating:
 *                   type: number
 *                   example: 8.8
 *                 isrecent:
 *                   type: boolean
 *                   example: true
 *                 isboxoffice:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Movie not found
 */
app.get("/filter-movie", (req, res) => {
    const name = req.query.name;
    db.all(
        "SELECT Title, video_url, cover_img_url, rating FROM movies WHERE Title LIKE ?",
        [`%${name}%`],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (rows.length > 0) {
                const baseDomain = `${req.protocol}://${req.get('host')}`;
                const modifiedRows = rows.map(row => ({
                    ...row,
                    cover_img_url: `${baseDomain}${row.cover_img_url}`
                }));
                res.json(modifiedRows);
            } else {
                res.status(404).json({ message: "Movie not found" });
            }
        }
    );
});
app.use('/public', express.static(path.join(__dirname, 'public')));
//box office movies
/**
 * @swagger
 * /box-office-movies:
 *   get:
 *     summary: Retrieve box office movies
 *     description: Retrieve a list of movies that are marked as box office hits.
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Title:
 *                     type: string
 *                     example: Inception
 *                   video_url:
 *                     type: string
 *                     example: http://example.com/inception
 *                   cover_img_url:
 *                     type: string
 *                     example: http://example.com/inception.jpg
 *                   rating:
 *                     type: number
 *                     example: 8.8
 */
app.get("/box-office-movies", (req, res) => {
    const baseDomain = `${req.protocol}://${req.get('host')}`;
    db.all("SELECT Title, video_url, cover_img_url, rating FROM movies WHERE isboxoffice = 1", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const modifiedRows = rows.map(row => ({
            ...row,
            cover_img_url: `${baseDomain}${row.cover_img_url}`
        }));
        res.json(modifiedRows);
    });
});
// https://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4
// http://media.w3.org/2010/05/sintel/trailer.mp4
// https://www.nlm.nih.gov/web/documentation/TemplateDocumentation/video_files/IN_Intro-800.mp4
// recent movies

/**
 * @swagger
 * /recent-movies:
 *   get:
 *     summary: Retrieve recent movies
 *     description: Retrieve a list of movies that are marked as recent.
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Title:
 *                     type: string
 *                     example: Inception
 *                   video_url:
 *                     type: string
 *                     example: http://example.com/inception
 *                   cover_img_url:
 *                     type: string
 *                     example: http://example.com/inception.jpg
 *                   rating:
 *                     type: number
 *                     example: 8.8
 *                   isrecent:
 *                     type: boolean
 *                     example: true
 *                   isboxoffice:
 *                     type: boolean
 *                     example: true
 */
app.get("/recent-movies", (req, res) => {
    const baseDomain = `${req.protocol}://${req.get('host')}`;
    db.all("SELECT Title, video_url, cover_img_url, rating FROM movies WHERE isrecent = 1", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const modifiedRows = rows.map(row => ({
            ...row,
            cover_img_url: `${baseDomain}${row.cover_img_url}`
        }));
        res.json(modifiedRows);
    });
});


app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});