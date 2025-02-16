const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));  // Serves static files like HTML, CSS, JS

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#H@hs12499',
    database: 'SingaporeResale'
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database!');
});

// Route to serve the default page (index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Serve index.html when accessing the root
});

// Route to get distinct values for dropdowns
app.get('/getDropdownOptions', (req, res) => {
    // Query for town options
    db.query('SELECT DISTINCT town FROM Location', (err, towns) => {
        if (err) throw err;

        // Query for street name options
        db.query('SELECT DISTINCT street_name FROM Location', (err, streetNames) => {
            if (err) throw err;

            // Query for block options
            db.query('SELECT DISTINCT block FROM Flats', (err, blocks) => {
                if (err) throw err;

                // Query for flat type options
                db.query('SELECT DISTINCT flat_type FROM Flats', (err, flatTypes) => {
                    if (err) throw err;

                    // Send the results back as JSON
                    res.json({
                        towns: towns,           // Results for town dropdown
                        streetNames: streetNames, // Results for street_name dropdown
                        blocks: blocks,           // Results for block dropdown
                        flatTypes: flatTypes.map(row => row.flat_type)  // Results for flat_type dropdown
                    });
                });
            });
        });
    });
});


app.get('/getStreetNamesForTown', (req, res) => {
    const town = req.query.town;

    if (!town) {
        return res.json({ streetNames: [] });
    }

    // Query for street names based on the selected town
    db.query('SELECT DISTINCT street_name FROM Location WHERE town = ?', [town], (err, streetNames) => {
        if (err) throw err;

        res.json({ streetNames });
    });
});

app.get('/getBlocksForTownAndStreet', (req, res) => {
    const { town, street_name } = req.query;

    // Log the incoming request parameters to check if they are correctly passed
    console.log("Request received with town:", town, "and street_name:", street_name);

    // Query to get blocks based on town and street_name
    db.query(`
        SELECT DISTINCT block
        FROM Flats f
        JOIN Location lo ON f.location_id = lo.location_id
        WHERE lo.town = ? AND lo.street_name = ?`, 
        [town, street_name], (err, results) => {
            if (err) {
                res.status(500).send('Error retrieving blocks');
            } else {
                console.log("Blocks fetched from DB:", results); // Log the fetched blocks
                res.json({ blocks: results });
            }
        });
});

app.get('/getFlatTypesForTownAndStreet', (req, res) => {
    const { town, street_name } = req.query;

    // Log the incoming request parameters to check if they are correctly passed
    console.log("Request received with town:", town, "and street_name:", street_name);

    // Query to get flat types based on town and street_name
    db.query(`
        SELECT DISTINCT flat_type
        FROM Flats f
        JOIN Location lo ON f.location_id = lo.location_id
        WHERE lo.town = ? AND lo.street_name = ?`, 
        [town, street_name], (err, results) => {
            if (err) {
                console.error("Error fetching flat types:", err);
                return res.status(500).send('Error retrieving flat types');
            }

            console.log("Flat types fetched from DB:", results); // Log the fetched flat types
            const flatTypes = results.map(row => row.flat_type); // Extract flat types from results
            res.json({ flatTypes });
        });
});





app.post('/searchHousing', (req, res) => {
    const { town, street_name, block, flat_type, start_date, end_date } = req.body;

    // Start building the SQL query
    let query = `
        SELECT f.flat_type, f.block, f.storey_range, f.flat_model, lo.location_id,
               r.resale_price, l.remaining_lease, f.flat_id,
               lo.town, lo.street_name, r.month
        FROM Flats f
        JOIN Lease l ON f.flat_id = l.flat_id
        JOIN Resale r ON f.flat_id = r.flat_id
        JOIN Location lo ON f.location_id = lo.location_id
        WHERE 1=1
    `;

    // Array to hold query parameters
    const params = [];

    // Add conditions for each filter
    if (town && town !== "Any" && town !== "*") {
        query += " AND lo.town LIKE ?";
        params.push(`%${town}%`);
    }

    if (street_name && street_name !== "Any" && street_name !== "*") {
        query += " AND lo.street_name LIKE ?";
        params.push(`%${street_name}%`);
    }

    if (block && block !== "Any" && block !== "*") {
        query += " AND f.block LIKE ?";
        params.push(`%${block}%`);
    }

    if (flat_type && flat_type !== "Any" && flat_type !== "*") {
        query += " AND f.flat_type LIKE ?";
        params.push(`%${flat_type}%`);
    }

    if (start_date && end_date) {
        query += " AND r.month BETWEEN ? AND ?";
        params.push(start_date, end_date);
    }

    // Run the query with the constructed parameters
    db.query(query, params, (err, results) => {
        if (err) throw err;
        res.json(results);  // Return the results to the frontend
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

