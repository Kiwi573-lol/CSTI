const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data', 'registros.json');

// Leer registros
function leerRegistros(){
    if(!fs.existsSync(DATA_FILE)) return [];
    let data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

// Guardar registros
function guardarRegistros(registros){
    fs.writeFileSync(DATA_FILE, JSON.stringify(registros,null,2));
}

// Rutas
app.get('/api/registros', (req,res)=>{
    res.json(leerRegistros());
});

app.post('/api/registros', (req,res)=>{
    let registros = leerRegistros();
    let nuevo = req.body;

    registros.unshift(nuevo);

    // Mantener máximo 10 finalizados
    let finalizados = registros.filter(r=>r.finalizado);
    if(finalizados.length>10){
        registros = registros.filter(r=>!r.finalizado).concat(finalizados.slice(0,10));
    }

    guardarRegistros(registros);
    res.json({ok:true, registros});
});

app.post('/api/finalizar', (req,res)=>{
    let { id } = req.body;
    let registros = leerRegistros();
    let r = registros.find(r => r.id == id);
    if(r) r.finalizado = true;
    guardarRegistros(registros);
    res.json({ok:true, registros});
});

app.listen(PORT, ()=>{
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});