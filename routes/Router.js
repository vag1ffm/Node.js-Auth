const userController = require( "../Controllers/UserController");
const express = require('express')
const {verify, decode} = require("jsonwebtoken");

const router = express()

router.use((req, res, next)=> {
    verify(req.headers?.token, 'amirSoska', (err, decode)=> {
        if (err) {
            next();
        } else {
            req.user_id = decode.userId;
            next();
        }
    })
})

router.post('/user/auth', userController.create)
router.post('/user/login', userController.login)
router.put('/user', userController.update)
// router.delete('/user/:id')

module.exports = router