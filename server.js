const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./database.js'); // Your database setup file

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(express.static('public')); // To serve static files like HTML, CSS

// Session configuration
app.use(session({
    secret: 'a-very-strong-secret-key', // Change this to a random string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if you are using HTTPS
}));

// Custom middleware to protect routes
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden. Admin access required." });
    }
    next();
};

// --- API Routes ---

// USER AUTHENTICATION
app.post('/api/signup', (req, res) => {
    const { fullname, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: "Error hashing password." });
        
        db.run(`INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)`, [fullname, email, hash], function(err) {
            if (err) {
                return res.status(400).json({ message: "Email already exists." });
            }
            res.status(201).json({ message: "User created successfully!", userId: this.lastID });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ message: "Invalid credentials." });
            }
            // Set session variables
            req.session.userId = user.id;
            req.session.role = user.role;
            req.session.fullname = user.fullname;
            res.json({ message: "Login successful.", role: user.role });
        });
    });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out.");
        }
        res.redirect('/Dashboard.html');
    });
});

// Endpoint to get current user's data
app.get('/api/user/data', requireLogin, (req, res) => {
    res.json({
        fullname: req.session.fullname,
        role: req.session.role
    });
});


// ADMIN ROUTES
app.get('/api/admin/flights', requireLogin, requireAdmin, (req, res) => {
    db.all("SELECT * FROM flights ORDER BY departure_time DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/admin/flights', requireLogin, requireAdmin, (req, res) => {
    const { flight_number, origin, destination, departure_time, arrival_time, price } = req.body;
    db.run(`INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price) VALUES (?,?,?,?,?,?)`, 
    [flight_number, origin, destination, departure_time, arrival_time, price], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

app.delete('/api/admin/flights/:id', requireLogin, requireAdmin, (req, res) => {
    db.run(`DELETE FROM flights WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Flight not found." });
        res.json({ message: "Deleted successfully", changes: this.changes });
    });
});

app.get('/api/admin/customers', requireLogin, requireAdmin, (req, res) => {
    db.all("SELECT id, fullname, email FROM users WHERE role = 'customer'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// CUSTOMER ROUTES
app.get('/api/flights/search', requireLogin, (req, res) => {
    const { origin, destination, date } = req.query;
    // Simple search: matches origin, destination, and the date part of departure_time
    const query = `SELECT * FROM flights WHERE origin LIKE ? AND destination LIKE ? AND date(departure_time) = ?`;
    db.all(query, [`%${origin}%`, `%${destination}%`, date], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/bookings', requireLogin, (req, res) => {
    const { flightId } = req.body;
    const userId = req.session.userId;
    db.run('INSERT INTO bookings (user_id, flight_id) VALUES (?, ?)', [userId, flightId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Booking successful!", bookingId: this.lastID });
    });
});


// --- Page Serving & Redirection ---
app.get('/', (req, res) => {
    res.redirect('/Dashboard.html');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});