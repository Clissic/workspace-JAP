const url = "https://japceibal.github.io/emercado-api/user_cart/25801.json";
var total = 0;
var ArraytotalActualizado = [];
const tbodyContenedor = document.getElementById("contenedor");
const dolar = 40;

async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Hubo un problema con la solicitud.`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // FUNCION QUE CONVIERTE EL PRODUCTO QUE VIENE POR FETCH EN UN OBJETO CON LA ESTRUCTURA DE NUESTRO CARRITO (addToCart(id) en products.js:76)
  async function colocarItemEnLS() {
    const cartSim = JSON.parse(localStorage.getItem("cartSim")) || [];
    const data = await fetchData(url);
    const carToFetchId = data.articles[0].id;
    const carToPush = await fetchData(
      `https://japceibal.github.io/emercado-api/products/${carToFetchId}.json`
    );
    const existingItem = cartSim.find((item) => item.id === carToPush.id);
    if (!existingItem) {
      const localStorageApiItem = {
        id: carToPush.id,
        cantidad: 1,
        producto: carToPush,
      };
      cartSim.push(localStorageApiItem);
      localStorage.setItem("cartSim", JSON.stringify(cartSim));
    }
  }

  // FUNCION QUE CALCULA EL SUBTOTAL Y LO IMPRIME EN HTML
  async function calcularSubtotal() {
    const cartSim = JSON.parse(localStorage.getItem("cartSim")) || [];
    for (let dato of cartSim) {
      const countConteiner = document.getElementById(
        `count-${dato.producto.id}`
      );

      const subtotalConteiner = document.getElementById(
        `subTotal-${dato.producto.id}`
      );

      countConteiner.addEventListener("input", () => {
        const valorSubTotal = countConteiner.value * dato.producto.cost;
        dato.cantidad = countConteiner.value;
        subtotalConteiner.innerHTML =
          dato.producto.currency + " " + valorSubTotal;
        localStorage.setItem("cartSim", JSON.stringify(cartSim));
        actualizarTotal();
      });
    }
  }

  // FUNCION QUE IMPRIME LOS PRODUCTOS EN EL CARRITO
  const cartSim = JSON.parse(localStorage.getItem("cartSim")) || [];
  for (const productoEnCarrito of cartSim) {
    const producto = productoEnCarrito.producto;
    const productoImagen = producto.image || producto.images[0];
    const prodSubTotal = productoEnCarrito.cantidad * producto.cost;
    const id = `subTotal-${producto.id}`;
    ArraytotalActualizado.push(id);
    const contenedorBody = `
        <tr>
          <td class="tittles">
            <input class="redirect" id="${producto.id}" type="image" title="imagenProducto" alt="imagenProducto" style="height: 50px;" src="${productoImagen}" />
          </td>
          <td class="tittles">${producto.name}</td>
          <td class="tittles">${producto.currency} ${producto.cost}</td>
          <td class="tittles"><input id="count-${producto.id}" type="number" min="1" value="${productoEnCarrito.cantidad}" /></td>
          <td class="tittles" id="${id}">${producto.currency} ${prodSubTotal}</td>
          <td class="tittles">
          <button class="eliminar" data-id="${producto.id}"><i class="fas fa-trash"></i></button>
        </td>
        </tr>`;
    tbodyContenedor.innerHTML += contenedorBody;
  }

  // Función para eliminar un producto del carrito por su ID
  function eliminarProductoDelCarrito(id) {
    const cartSim = JSON.parse(localStorage.getItem("cartSim")) || [];
    const nuevoCarrito = cartSim.filter(
      (productoEnCarrito) => productoEnCarrito.id != id
    );
    localStorage.setItem("cartSim", JSON.stringify(nuevoCarrito));
  }

  // Función para manejar el clic en el botón "Eliminar"


  // Asociar manejador de eventos a los botones de "Eliminar"
  const botonesEliminar = document.querySelectorAll(".eliminar");
  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", (event) => {
      const id = event.currentTarget.getAttribute("data-id");
      console.log(id);
      eliminarProductoDelCarrito(id);
      const fila = event.currentTarget.closest("tr");
      if (fila) {
        fila.remove();
      }
      actualizarTotal();
      calcularSubtotal();
    });
  });

  // Convertir la imagen del producto en un boton para ir a la informacion del producto:
  const productInfoButtons = document.getElementsByClassName("redirect");
  for (const productButton of productInfoButtons) {
    productButton.addEventListener("click", (event) => {
      const productoId = event.currentTarget.id;
      localStorage.setItem("productId", productoId);
      location.href = "./product-info.html";
    });
  }
  calcularSubtotal();
  actualizarTotal();

  colocarItemEnLS();

  // Obtén referencias a los elementos que deseas mostrar u ocultar
  const creditFields = document.querySelector(".credit-fields");
  const debitFields = document.querySelector(".debit-fields");

  // Establece el estilo por defecto en "display: none" para ambos contenedores
  creditFields.style.display = "none";
  debitFields.style.display = "none";

  // Obtén referencias a los botones de radio
  const creditRadio = document.querySelector('input[value="credit"]');
  const debitRadio = document.querySelector('input[value="debit"]');

  // Agrega un evento change a los botones de radio
  creditRadio.addEventListener("change", function () {
    creditFields.style.display = "block";
    debitFields.style.display = "none";
  });

  debitRadio.addEventListener("change", function () {
    creditFields.style.display = "none";
    debitFields.style.display = "block";
  });
});

const standard = document.getElementById("standard"); // 5%
const express = document.getElementById("express"); // 7%
const premium = document.getElementById("premium"); // 15%

function actualizarTotal() {
  const cartSim = JSON.parse(localStorage.getItem("cartSim")) || [];
  const subTotal = document.getElementById("subTotal");
  const envio = document.getElementById("envio");
  const precioFinal = document.getElementById("precioFinal");

  let suma = 0;
  for (let producto of cartSim) {
    if (producto.producto.currency === "UYU") {
      suma += producto.cantidad * (producto.producto.cost / dolar);
    } else {
      suma += producto.cantidad * producto.producto.cost;
    }
  }
  console.log(suma);

  let costoEnvio = 0;
  if (standard.checked) {
    costoEnvio = suma * 0.05;
  } else if (express.checked) {
    costoEnvio = suma * 0.07;
  } else if (premium.checked) {
    costoEnvio = suma * 0.15;
  }
  console.log(costoEnvio);

  let sumaTotal = costoEnvio + suma;
  subTotal.innerText = suma;
  envio.innerText = costoEnvio;
  precioFinal.innerText = sumaTotal;
}
function escucharCostoEnvio() {
  actualizarTotal();
}

standard.addEventListener("change", escucharCostoEnvio);
express.addEventListener("change", escucharCostoEnvio);
premium.addEventListener("change", escucharCostoEnvio);
