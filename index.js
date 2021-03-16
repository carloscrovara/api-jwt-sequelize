const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const sequelize = require("sequelize");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

//PASSPORT
const passport = require("passport");
const passportJWT = require("passport-jwt");

//MODELOS
let accounts = require("./models").cuentas;

//LOGGER
app.use(logger("dev"));

//Variables de Entorno
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//JWT -> CONFIGURACIONES
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

//JWT -> OPCIONES
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'superclavesecreta';

//JWT -> CREAR LA ESTRATEGIA
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next){

let user = getUser({id: jwt_payload.id})

if(user) {
    next(null, user)
}else{
    next(null, false)
}
});

//Poner en funcionamiento la estrategia creada
passport.use(strategy);

app.use(passport.initialize());

//TRAE TODOS LOS USUARIOS
const getAllUsers = async () =>{
    return await accounts.findAll();
}

//GUARDA EL USUARIO
const createUser = async ({username, password}) => {
    return await accounts.create({ username, password });
}

//TRAER UN USUARIO
const getUser = async obj =>{
    return await accounts.findOne({
        where: obj
    })
} 

//Rutas y funciones
app.get("/", function (req, res) {
   getAllUsers().then(users => res.json(users));
});

app.post("/alta", function(req, res){
    const { username, password } = req.body;
 
    createUser({ username, password }).then(user => res.json(user));

});

app.post("/login", async function(req, res){
    const { username, password } = req.body;
 
    if(username && password){
        let user = await getUser({username: username})
            if(!user){
                res.json("problema con el usuario");
            }
            if(user.password === password){
                let payload = {id: user.id};
                let token = jwt.sign(payload, jwtOptions.secretOrKey );
                res.json({
                    msg: "ok",
                    token: token
                })
            }else{
                res.json("password incorrecto")
            }

    }else{
        res.json("error logueo")
    }
})

app.post("/caja", passport.authenticate('jwt', {session: false}), function(req,res) {    
    res.json("Estado de caja: $50000");
})

//Verificación Ambiente
let port;
if (process.env.NODE_ENV === "production") {
  port = process.env.PORT_PROD;
} else {
  port = process.env.PORT_DEV;
}

//Express
app.listen(port, function () {
  console.log("Servidor Activo", port, process.env.NODE_ENV);
});