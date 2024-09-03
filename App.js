const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse JSON data
app.use(bodyParser.json());

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create MySQL connection with your credentials
const db = mysql.createConnection({
    host: '127.0.0.1',          // Host address (localhost)
    user: 'babughadei',         // Your MySQL username
    password: 'Babu@2024sql',   // Your MySQL password
    database: 'ExpenseDB'       // Your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL Database');
});

// Route to get all expenses
app.get('/expenses', (req, res) => {
    const sql = 'SELECT * FROM expenses';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Route to add an expense
app.post('/expenses', (req, res) => {
    const { name, price } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'Product name and price are required' });
    }

    const newExpense = { 
        product_name: name, 
        product_price: price 
    };
    
    const sql = 'INSERT INTO expenses SET ?';
    db.query(sql, newExpense, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: result.insertId, ...newExpense });
    });
});

// Route to delete an expense
app.delete('/expenses/:id', (req, res) => {
    const expenseId = req.params.id;

    if (!expenseId || isNaN(expenseId)) {
        return res.status(400).json({ error: 'Valid Expense ID is required' });
    }

    const sql = 'DELETE FROM expenses WHERE id = ?';
    db.query(sql, [expenseId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.send('Expense deleted');
    });
});

// Route to update an expense
app.put('/expenses/:id', (req, res) => {
    const expenseId = req.params.id;
    const { name, price } = req.body;

    if (!expenseId || isNaN(expenseId) || !name || !price) {
        return res.status(400).json({ error: 'Valid Expense ID, name, and price are required' });
    }

    const updatedExpense = { 
        product_name: name, 
        product_price: price 
    };
    
    const sql = 'UPDATE expenses SET ? WHERE id = ?';
    db.query(sql, [updatedExpense, expenseId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.send('Expense updated');
    });
});

// Route to get the total value of expenses
app.get('/total-expenses', (req, res) => {
    const sql = 'SELECT SUM(product_price) AS total FROM expenses';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        const total = results[0].total;
        res.json({ total: total !== null ? total : 0 });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
