// js/app.js (versión completa con login, registro, finalizar por id y vista en una línea)

let usuarioActual = "";
let registros = [];

// 1) Verificar usuario (login)
async function verificar(){
    let clave = document.getElementById("clave").value.trim();
    if (typeof usuarios !== "undefined" && usuarios[clave]){ // usuarios viene de js/usuarios.js
        usuarioActual = usuarios[clave].nombre;
        document.getElementById("login").style.display = "none";
        document.getElementById("sistema").style.display = "block";
        document.getElementById("usuario").innerText = usuarioActual;
        await cargarRegistros();
    } else {
        document.getElementById("error").innerText = "Clave incorrecta";
    }
}

// 2) Cargar registros desde el backend
async function cargarRegistros(){
    let res = await fetch('/api/registros');
    registros = await res.json();
    mostrar();
}

// 3) Registrar nuevo equipo (con id único)
async function registrar(){
    // longitudes opcionales (solo si quieres acotar texto)
    const MAX_PC = 60;
    const MAX_COLOR = 40;
    const MAX_MARCA = 40;
    const MAX_MODELO = 40;
    const MAX_SERIAL = 40;

    let nuevo = {
        id: Date.now(), // id único
        pc: (document.getElementById("pc").value || '').substring(0, MAX_PC),
        color: (document.getElementById("color").value || '').substring(0, MAX_COLOR),
        marca: (document.getElementById("marca").value || '').substring(0, MAX_MARCA),
        modelo: (document.getElementById("modelo").value || '').substring(0, MAX_MODELO),
        serial: (document.getElementById("serial").value || '').substring(0, MAX_SERIAL),
        usuario: usuarioActual,
        fecha: new Date().toLocaleString(),
        finalizado: false
    };

    await fetch('/api/registros',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(nuevo)
    });

    limpiar();
    await cargarRegistros();
}

// 4) Finalizar registro por id
async function finalizar(id){
    await fetch('/api/finalizar',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id })
    });
    await cargarRegistros();
}

// 5) Detalles
function detalles(id){
    let r = registros.find(r => r.id == id);
    if(!r){
        alert("Registro no encontrado");
        return;
    }
    alert(
        `PC: ${r.pc}\nColor: ${r.color}\nMarca: ${r.marca}\nModelo: ${r.modelo}\nSerial: ${r.serial}\nRegistrado por: ${r.usuario}\nFecha: ${r.fecha}`
    );
}

// 6) Limpiar formulario
function limpiar(){
    document.getElementById("pc").value = "";
    document.getElementById("color").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("serial").value = "";
}

// 7) Logout
function logout(){
    usuarioActual = "";
    document.getElementById("sistema").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("clave").value = "";
}

// 8) Mostrar (panel de archivos)
function truncate(text, max){
    if (typeof text !== 'string') return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

function mostrar(){
    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    let activos = registros.filter(r => !r.finalizado);
    let finalizados = registros.filter(r => r.finalizado);
    if(finalizados.length > 10) finalizados = finalizados.slice(0, 10);

    // Orden: activos primero, luego finalizados
    let orden = [...activos, ...finalizados];

    orden.forEach(r => {
        let div = document.createElement("div");
        div.className = "registro";

        // Texto truncado para que no desplace los botones
        let pcTxt = truncate(r.pc, 18);
        let colorTxt = truncate(r.color, 14);

        div.innerHTML = `
            <span class="texto-registro" title="PC: ${r.pc} | Color: ${r.color} | Usuario: ${r.usuario}">
                <strong>${pcTxt}</strong> - ${colorTxt} - ${r.usuario}
            </span>
            <span>
                <button onclick="detalles('${r.id}')">Detalles</button>
                ${!r.finalizado ? `<button onclick="finalizar('${r.id}')">Finalizar</button>` : `<span class="finalizado">FINALIZADO</span>`}
            </span>
        `;
        lista.appendChild(div);
    });
}