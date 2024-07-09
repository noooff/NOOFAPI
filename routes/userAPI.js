// routes/userAPI.js

const express = require('express');
const router = express.Router();
const sql = require('../database_config.js'); 

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/users'
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to create
 *         schema:
 *           $ref: '#/definitions/users'
 *     responses:
 *       201:
 *         description: User created successfully
 *
 * /api/users/{email}/{password}:
 *   get:
 *     summary: Get a user by email and password
 *     description: Returns a single user by email and password
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         type: string
 *         description: The email of the user
 *       - name: password
 *         in: path
 *         required: true
 *         type: string
 *         description: The password of the user
 *     responses:
 *       200:
 *         description: A single user
 *         schema:
 *           $ref: '#/definitions/users'
 * 
 * definitions:
 *   users:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 1
 *       name:
 *         type: string
 *         example: John Doe
 *       username:
 *         type: string
 *         example: johnnn
 *       email:
 *         type: string
 *         example: john.doe@example.com
 *       password:
 *         type: string
 *         example: password123
 *       picture:
 *         type: string
 *         example: 'profile.jpg'
 */

// Endpoint to get all users
router.get('/', async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM users");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to get a user by email and password
router.get('/:email/:password', async (req, res) => {
    try {
        const { email, password } = req.params;
        const request = new sql.Request();
        request.input('Email', sql.NVarChar, email);
        request.input('Password', sql.NVarChar, password);
        const result = await request.query(`exec login_sp @email='${email}',@password='${password}'`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to create a new user
router.post('/', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name} = req.body;
        const request = new sql.Request();
        
        request.input('Username', sql.NVarChar, username);
        request.input('Email', sql.NVarChar, email);
        request.input('Password', sql.NVarChar, password);
        request.input('first_name', sql.NVarChar, first_name);

        request.input('last_name', sql.NVarChar, last_name);
        const result = await request.execute('register_sp');
        res.status(201).json({ user: result.recordset, message: 'User has been created successfully!' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
