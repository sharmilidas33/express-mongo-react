const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { query } = require('express-validator');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = "sharmili24";

//Create a User using: POST "/api/auth/createuser" in Thunder Client.
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', "Enter a valid Email").isEmail(),
    body('password', 'Password must have a minimum of 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const salt = await bcrypt.genSalt(10);
    secPwd=await bcrypt.hash( req.body.password, salt);

    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPwd
        });
        const data={
            user:{
               id:user.id 
            }
        }
        const authToken= jwt.sign(data, JWT_SECRET);
        res.json(authToken);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
