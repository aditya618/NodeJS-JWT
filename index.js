const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

const refreshTokenList = [];

app.use(express.json());



app.post("/protected", auth, (req,res) => {
    res.send('Inside proctected route');
});

app.post('/login', (req,res) => {
    const {user} = req.body;
    // console.log(req.body);

    if(!user){
        return res.status(404).json({message: "Empty body"});
    }

    let accessToken = jwt.sign(user, "access", {expiresIn: '20s'});
    let refreshToken = jwt.sign(user, "refresh", {expiresIn: '7d'});
    refreshTokenList.push(refreshToken);

    return res.status(201).json({
        accessToken, refreshToken
    });
});

app.post('/renewAccessToken', (req,res) => {
    const refreshToken = req.body.token;
    console.log(refreshToken);
    if(!refreshToken || !refreshTokenList.includes(refreshToken)) {
        return res.status(403).json({message: 'User not authenticated'});
    }
    jwt.verify(refreshToken, "refresh", (err,user) => {
        if(!err) {
            const accessToken = jwt.sign({username: user.name}, "access", {expiresIn: '20s'});
            return res.status(201).json({accessToken});
        } else {
            return res.status(403).json({message: "User not authenticated"});
        }
    });
});


function auth(req,res,next) {
    let token = req.headers['authorization'];
    // console.log(token);
    token = token.split(' ')[1];
    if(!token) {
        res.status(403).json({message: 'error'});
    }
    jwt.verify(token, 'access', (err,user) => {
        if(!err) {
            req.user = user;
            next();
        } else {
            return res.status(403).json({message: "User not authenticated"});
        }
    });
}



app.listen(3000);