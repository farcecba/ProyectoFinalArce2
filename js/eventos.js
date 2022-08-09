const fondo = () =>{
    let body = document.getElementById("body")
    body.className = "bg-light"
}
const tipocambio = () =>{
    let dolar = document.getElementById('dolar')
        fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales').then((response) => {if(response.ok){
            return response.json().then((result) => {
            dolarventa = result[0].casa.venta
            dolar.innerHTML = `<span style="color:green;" ><b>${dolarventa}</b></span>`
        })}})
        .catch(() => {
        dolar.innerHTML = `<span><em>No se puede obtener el tipo de cambio. Igual puede utilizar el sistema, ya que todas las registraciones se consideran en pesos argentinos.</em></span>`
    })
}

let listadocuentas; 
let storage = JSON.parse(localStorage.getItem('listadocuentasobj'))
if(storage == null){
fetch('data/data.json').then((response) => response.json())
    .then((result) => {
       listadocuentas = result.listabase
    })
}
else{
    listadocuentas = storage
}
const actualizacioncuentas = (clave,valor) => {
    localStorage.setItem(clave, JSON.stringify(valor))
}
class registracion {
    constructor(cuenta,servicio,importe){
        this.cuenta = cuenta
        this.servicio = servicio
        this.importe = importe
    }
}
const listadoasientos = []
const submitcuenta = (id) =>{
    let formcuenta = document.getElementById(id);
    formcuenta.addEventListener('submit',(event)=>{
        event.preventDefault();
        let cuenta = formcuenta.children[0].value
        if (validate({account:(cuenta)},{account: {inclusion: listadocuentas}}) != undefined && cuenta.length == 7 && cuenta > -1){
            listadocuentas.push(cuenta)
            actualizacioncuentas('listadocuentasobj',listadocuentas)
            mostrarcuentas()
        }
        else{Swal.fire({
            title: 'Error',
            text: 'Esa cuenta ya se encuentra incluida, no tiene 7 caracteres o ingresó valores negativos.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })}
        formcuenta.children[0].value = ''
        })
}
const eliminarcuenta = (cuenta) =>{
    const cuentasutilizadas = listadoasientos.map((elemento)=> elemento.cuenta)
    if(validate({account:(cuenta)},{account: {inclusion: cuentasutilizadas}}) != undefined){
    let index = listadocuentas.indexOf(cuenta)
    listadocuentas.splice(index,1)
    actualizacioncuentas('listadocuentasobj',listadocuentas)
    mostrarcuentas()
}
else{
    Swal.fire({
        title: 'Error',
        text: 'Esa cuenta ya tiene asientos registrados, deberá eliminarlos primero.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
    })}
}
const mostrarcuentas = () =>{
    try{
        let cuentasdiv = document.getElementById('cuentasdiv')
        cuentasdiv.innerHTML = "<div><h4>Cuentas</h4></div>"
        cuentasdiv.className = "p-3 mb-2 bg-warning text-dark col-md-1"
        for (let index = 0; index < listadocuentas.length; index++) {
            const cuenta = listadocuentas[index];
            const elemento = document.createElement('div')
            if(index <5){
                elemento.innerHTML = `
                <div>${cuenta}</div>
                `
           cuentasdiv.append(elemento)}
           else{
                const button = document.createElement('button')
                button.textContent = "X"
                button.className = "btn btn-danger"
                button.onclick = ()=> {
                eliminarcuenta(cuenta)
                }
                elemento.textContent = cuenta+"    "
                elemento.append(button)
                elemento.className = "flex-row"
                cuentasdiv.append(elemento)}
           }
    }
    catch{console.log("I have failed you Anakin")}
}
const submitasiento = (id) =>{
    let formasiento = document.getElementById(id);
    formasiento.addEventListener('submit',(event)=>{
        event.preventDefault();
        let cuenta = formasiento.children[0].value
        let servicio = formasiento.children[1].value
        let importe = formasiento.children[2].value
        if(validate({account:(cuenta)},{account: {inclusion: listadocuentas}}) != undefined || validate({service:servicio},{service:{presence:{allowEmpty:false}}}) != undefined || validate.isNumber(parseInt(importe)) == false){
            Swal.fire({
                title: 'Error',
                text: 'La cuenta ingresada no está en el listado o el servicio se encuentra vacío.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
                })
            }
        else{
            let asiento = new registracion (cuenta,servicio,parseInt(importe))
            listadoasientos.push(asiento)
            mostrarasientos()
            renderexcel()
            }
            formasiento.children[0].value = ''
            formasiento.children[1].value = ''
            formasiento.children[2].value = ''
        })
    }
const eliminarasiento = (id) => {
    let asientoeliminado = document.getElementById(id);
    asientoeliminado.addEventListener('submit',(event)=>{
        event.preventDefault();
        let asientonroelim = parseInt(asientoeliminado.children[0].value)-1
        if(asientonroelim <= listadoasientos.length-1 && asientonroelim >= 0){
            listadoasientos.splice(asientonroelim,1)
            mostrarasientos()
            renderexcel()
            }
        else{
            Swal.fire({
                title: 'Error',
                text: 'El asiento a eliminar no existe.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
                })
            }
        asientoeliminado.children[0].value = ''
        })}
const renderexcel = () =>{
    let exportar = document.getElementById('exportar')
    if(listadoasientos.length === 0){
        exportar.style.display =  "none"
        }
    else{
        exportar.style.display = "block"
        exportar.onclick = ()=> {
        exportToExcel()}
        }
    }
exportToExcel = function() {
    var myJsonString = JSON.stringify(listadoasientos);
    var blob = new Blob([myJsonString], {
        type: "application/vnd.ms-excel;charset=utf-8"
    });
    saveAs(blob, "Report.xls");
    }
const totalporcuenta = () => {
    let totalizador = document.getElementById('totalizador')
    totalizador.className = "p-3 mb-2 bg-danger text-white col-md-2"
    totalizador.innerHTML = '<div><h4>Total por Cuenta</h4></div>'
    if(listadoasientos.length == 0){
        }
    else{
        for (let index = 0; index < listadocuentas.length; index++) {
            let element = listadocuentas[index];
            let totalcuenta = 0
            for (let index = 0; index < listadoasientos.length; index++) {
                let element2 = listadoasientos[index]
                if(element2.cuenta === element){
                    totalcuenta = totalcuenta + element2.importe
                    }
                else{}
                    }
            if(totalcuenta !== 0){
                const elemento3 = document.createElement('div')
                elemento3.innerHTML = `<div>El total de la cuenta <b>${element}</b> es <b>${totalcuenta}</b></div>`
                totalizador.append(elemento3)
                }
            else{}     
                }
            }}
const mostrarasientos = () =>{
    let asientosdiv = document.getElementById('asientosdiv')
    asientosdiv.innerHTML = '<div><h4>Asientos</h4></div>';
    let total = 0
    for (let index = 0; index < listadoasientos.length; index++) {
        const asientonro = listadoasientos[index];
        const elemento = document.createElement('div')
        total = total + asientonro.importe
        elemento.innerHTML = `
        <div>Asiento N: ${index+1}, cuenta: ${asientonro.cuenta}, servicio: ${asientonro.servicio}, importe: ${asientonro.importe}.</div>
        `
        asientosdiv.append(elemento)
        }
    const sumatotal = document.createElement('div')
    if(listadoasientos.length > 0){
        sumatotal.textContent = "Total = $ "+total
        asientosdiv.append(sumatotal)
    }
    else{}
    totalporcuenta()
    }

fondo()
tipocambio()
setTimeout(() => {mostrarcuentas()}, 2000);
submitcuenta('formcuenta')
submitasiento('formasiento')
mostrarasientos()
eliminarasiento('elimasiento')
renderexcel()