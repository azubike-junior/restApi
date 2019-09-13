const express = require('express');
const router = express.Router();
const Owner = require('../models/Jwt');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('../verifyToken');

router.get('/register', verify, (req, res) => {
	// res.json({
	// 	posts: {
	// 		title: 'a new post',
	// 		description: 'lovely data and information'
	// 	}
    // });
    res.send(req.user);
});

router.get('/login', (req, res) => {
	res.send('logger');
});
router.post(
	'/register',
	[
		check('name').isLength({ min: 5 }).withMessage('more than 5'),
		check('email').isEmail(),
		check('password').isLength({ min: 5 }).withMessage('password should be more than 6 5 chars')
	],
	async (req, res) => {
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.errors[0].msg });
		}
		//checking if user email exist
		const emailExist = await Owner.findOne({ email: req.body.email });
		if (emailExist) return res.status(400).send('Email already exists');

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		const owner = new Owner({
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword
		});
		console.log(owner);
		try {
			const savedOwner = await owner.save();
			res.send(savedOwner);
		} catch (err) {
			res.status(400).send(err);
		}
	}
);

router.post('/login', [ check('email').isEmail(), check('password').isLength({ min: 5 }).withMessage('please enter correct password') ], async (req, res) => {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.errors[0].msg });
	}
	//checking if user email exist
	const user = await Owner.findOne({ email: req.body.email });
	if (!user) return res.status(400).send('Email doesnot exist');
	//check password
	const validPass = await bcrypt.compare(req.body.password, user.password);
	if (!validPass) return res.status(400).send('invalid password');

	//create and assign token
	const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
	res.header('myToken', token).send(token);

	res.send('Logged in successful!');
});

module.exports = router;
