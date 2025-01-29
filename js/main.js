document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

let totalCompra = 0;
let carrito = []; // Cargar carrito desde localStorage

// Elementos del DOM
const carritoLateral = document.getElementById('carrito-lateral');
const btnOpenCart = document.getElementById('open-cart');
const listaCarrito = document.getElementById('lista-carrito');
const totalElemento = document.getElementById('total');
const btnComprar = document.getElementById('btn-comprar');
const productosContainer = document.querySelector('.productos-grid');
const btnCerrarCarrito = document.getElementById('cerrar-carrito');

// seccion de abrir el carrito
btnOpenCart.addEventListener('click', () => {
    carritoLateral.style.right = '0'; 
});

// Cerrar el carrito al hacer clic en la "x"
btnCerrarCarrito.addEventListener('click', () => {
    carritoLateral.style.right = '-800px'; 
});

// Cargar productos dinámicamente desde JSON
fetch('../data/productos.json')
    .then(response => response.json())
    .then(productos => {
        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            productoDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio}</p>
                <button class="btn-agregar" data-id="${producto.id}" data-precio="${producto.precio}" data-imagen="${producto.imagen}">Agregar al carrito</button>
            `;
            productosContainer.appendChild(productoDiv);
        });

        document.querySelectorAll('.btn-agregar').forEach(boton => {
            boton.addEventListener('click', agregarAlCarrito);
        });
    })
    .catch(error => console.error('Error al cargar los productos:', error));

// Función para agregar productos al carrito
function agregarAlCarrito(event) {
    const boton = event.target;
    const productoDiv = boton.parentElement;
    const nombreProducto = productoDiv.querySelector('h3').textContent;
    const precioProducto = parseFloat(boton.getAttribute('data-precio'));
    const imagenProducto = boton.getAttribute('data-imagen');

    const producto = { nombre: nombreProducto, precio: precioProducto, imagen: imagenProducto };
    carrito.push(producto);
    guardarCarrito();
    actualizarCarrito();

    Swal.fire({
        icon: 'success',
        title: '¡Sneaker Agregado!'
    });
}

// Funcion para eliminar productos del carrito
function eliminarDelCarrito(index) {
    Swal.fire({
        title: "¿Estás Seguro?",
        text: "No podrás revertir esta acción.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, Eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            carrito.splice(index, 1);
            guardarCarrito();
            actualizarCarrito();

            Swal.fire("¡Eliminado!", "Sneaker Eliminado.", "success");
        }
    });
}

// Función para actualizar el carrito en el DOM
function actualizarCarrito() {
    listaCarrito.innerHTML = '';
    totalCompra = 0;

    carrito.forEach((producto, index) => {
        const itemCarrito = document.createElement('li');
        itemCarrito.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" width="50">
            <span>${producto.nombre} - $${producto.precio}</span>
            <button class="btn-eliminar">🗑️</button>
        `;
        itemCarrito.querySelector('.btn-eliminar').addEventListener('click', () => eliminarDelCarrito(index));
        listaCarrito.appendChild(itemCarrito);
        totalCompra += producto.precio;
    });
    totalElemento.textContent = `Total: $${totalCompra}`;
}

// Comprar productos con SweetAlert2
btnComprar.addEventListener('click', () => {
    Swal.fire({
        title: "Ingrese el saldo disponible",
        input: "number",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
            if (!value || isNaN(value) || value <= 0) {
                return "Ingrese una cantidad válida";
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            let saldoDisponible = parseFloat(result.value);
            if (saldoDisponible < totalCompra) {
                Swal.fire("Error", "Saldo insuficiente", "error");
            } else {
                Swal.fire("¡Compra realizada!", "Gracias por tu compra.", "success");
                carrito = [];
                guardarCarrito();
                actualizarCarrito();
                carritoLateral.style.right = '-800px'; 
            }
        }
    });
});

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Cargar carrito desde localStorage
function cargarCarrito() {
    let carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

document.addEventListener("DOMContentLoaded", cargarCarrito);

document.getElementById("icono-carrito").addEventListener("click", function() {
    carritoLateral.style.right = "0";
});
