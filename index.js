const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const sequelize = require("sequelize");
const mysql = require("mysql2");

let accounts = require("./models").cuentas;

app.use(logger("dev"));
//variables de entorno
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//HELPERS

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

//COMPROBAR TOKEN
const accesToken = (token) =>{
    if(token === "123456"){
        return "Estado de caja: $50000"
    }else{
        return "no está autorizado para ver estado de caja"
    }
}

//rutas y funciones.
app.get("/", function (req, res) {
   getAllUsers().then(users => res.json(users));
});

app.post("/", function(req, res){
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
                let token = "123456";
                res.json(token);
            }else{
                res.json("password incorrecto")
            }

    }else{
        res.json("error logueo")
    }

})

app.post("/caja", function(req,res) {
    let token = req.body.token;

    if(token){
        let result = accesToken(token);
        res.json(result)
    }else{
        res.json("no existe token")
    }
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