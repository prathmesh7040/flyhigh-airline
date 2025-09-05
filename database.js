const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Connect to the SQLite database. A new file `flyhigh.db` will be created.
const db = new sqlite3.Database('./flyhigh.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the FlyHigh database.');
});

// Serialize ensures that the database commands are executed in order
db.serialize(() => {
    console.log('Initializing database schema...');

    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer'
    )`, (err) => {
        if (err) console.error("Error creating users table:", err.message);
        else {
            // Add a default admin and customer user if they don't exist
            const adminEmail = 'admin@flyhigh.com';
            const customerEmail = 'priya.sharma@example.com';
            
            db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], (err, row) => {
                if (!row) {
                    bcrypt.hash('admin123', 10, (err, hash) => {
                        db.run(`INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)`,
                            ['Admin User', adminEmail, hash, 'admin']);
                        console.log('Admin user created.');
                    });
                }
            });

            db.get(`SELECT * FROM users WHERE email = ?`, [customerEmail], (err, row) => {
                if (!row) {
                    bcrypt.hash('priya123', 10, (err, hash) => {
                        db.run(`INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)`,
                            ['Priya Sharma', customerEmail, hash, 'customer']);
                        console.log('Customer user created.');
                    });
                }
            });
        }
    });

    // Create Flights table
    db.run(`CREATE TABLE IF NOT EXISTS flights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flight_number TEXT NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        price REAL NOT NULL
    )`, (err) => {
        if (err) console.error("Error creating flights table:", err.message);
        else {
            // Seed initial flight data
            db.get(`SELECT count(*) as count FROM flights`, (err, row) => {
                if (row.count === 0) {
                     console.log('Seeding flights...');
                    const stmt = db.prepare(`INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price) VALUES (?, ?, ?, ?, ?, ?)`);
                    const flights = [
                        ['FH101', 'New York (JFK)', 'London (LHR)', '2025-09-15T20:00', '2025-09-16T08:00', 799.00],
                        ['FH202', 'Tokyo (HND)', 'Sydney (SYD)', '2025-09-18T22:00', '2025-09-19T09:30', 950.00],
                        ['FH451', 'Pune (PNQ)', 'Delhi (DEL)', '2025-10-15T08:30', '2025-10-15T10:45', 55.00],
                        ['FH455', 'Pune (PNQ)', 'Delhi (DEL)', '2025-10-15T14:00', '2025-10-15T16:15', 65.00]
                    ];
                    flights.forEach(flight => stmt.run(flight));
                    stmt.finalize();
                }
            });
        }
    });

     // Create Bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        flight_id INTEGER,
        booking_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(flight_id) REFERENCES flights(id)
    )`, (err) => {
        if (err) console.error("Error creating bookings table:", err.message);
    });

});


module.exports = db;