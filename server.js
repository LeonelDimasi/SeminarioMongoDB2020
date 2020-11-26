
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { Schema } = mongoose;
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "Customer API",
      description: "Customer API Information",
      contact: {
        name: "Amazing Developer"
      },
      servers: ["http://localhost:3000"]
    }
  },
  // ['.routes/*.js']
  apis: ["server.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));






mongoose.connect('mongodb+srv://leoneldimasi:36617257Mongo@cluster0.jsed0.mongodb.net/negocio?retryWrites=true&w=majority', {useNewUrlParser: true});



const ventaSchema = new Schema({
    cliente:  String,
    productos: [String],
    cantidad:  Number,
    total: Number
  }, {
    versionKey: false
});

const Productos = mongoose.model('productos', new Schema({
  nombre: String, categoria: String, precio: Number, stock: Number }, {
 versionKey: false
}));

const Ventas = mongoose.model('ventas', ventaSchema);

/**
 * @swagger
 * /producto:
 *  get:
 *    description: trae todos los productos
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/producto', async (req, res) => {
    let response = await Productos.find({});
    try {
      res.send(response);
    } catch (err) {
      res.status(500).send(err);
    }
  });
/**
 * @swagger
 * /producto:
 *  post:
 *    description: inserta un producto
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.post('/producto', async (req, res) => {
   console.log(req.body)
   try {
    const producto = new Productos(req.body);
   
      await producto.save()
      res.send(req.body);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  });
  
/**
 * @swagger
 * /producto:
 *  delete:
 *    description: borra un producto dado un id 
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.delete('/producto/:id', async (req, res) => {
    try {
      let producto = await Productos.findByIdAndDelete(req.params.id)
      if (!producto)
      res.status(404).send("No se pudo borrar ")
      res.status(200).send()
    } catch (err) {
      res.status(500).send(err)
    }
  })
/**
 * @swagger
 * /producto:
 *  put:
 *    description: edita un producto dado id y body 
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.put('/productos/:id', async (req, res) => {
    const producto = new Productos(req.body);
    try {
      await Productos.findByIdAndUpdate(req.params.id, producto)
      res.send(producto)
    } catch (err) {
      res.status(500).send(err)
    }
  })



/**
 * @swagger
 * /venta:
 *  get:
 *    description: edita un producto dado id y body 
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/venta', async (req, res) => {
  const venta = await Ventas.find({});
  try {
    res.send(venta);
  } catch (err) {
    res.status(500).send(err);
  }
});
/**
 * @swagger
 * /venta:
 *  post:
 *    description: muestra las ventas
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.post('/venta',  async (req, res) => {
  let body = req.body;
  let productos = body.productos;
  console.log(body);
  try {
  let total = await sumarPrecios(productos);
  await restarStock(productos);
  
  const venta = new Ventas();
  venta.total = total; 
  venta.productos = productos;
  venta.cliente = body.cliente;
  venta.cantidad = productos.length;
  console.log(venta.cantidad)
    await venta.save();
    res.send(venta);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * @swagger
 * /venta:
 *  delete:
 *    description: borra ventas dado un id de venta
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.delete('/venta/:id', async (req, res) => {
  try {
    let idVenta = req.params.id; 
    const venta = await Ventas.findByIdAndDelete(idVenta)
    if (!venta) res.status(404).send("No se encontro la venta con el id "+ idVenta+".")
    res.status(200).send()
  } catch (err) {
    res.status(500).send(err)
  }
})
app.listen(3000,()=>{
    console.log("listening on port 3000")
//https://medium.com/@javifont/c%C3%B3mo-y-por-qu%C3%A9-deber%C3%ADas-usar-typescript-con-node-y-express-14fc9c1d82eb
})

async function restarStock (productos) {
    for (const idProd of productos) {
    const producto = await Productos.findById(idProd);
    producto.stock--;
    await Productos.findByIdAndUpdate(idProd, new Productos(producto))
  }
}

async function sumarPrecios (listaProductos) {
    let suma = 0;
   for (const idProd of listaProductos) {
      console.log(idProd)
      const producto = await Productos.findById(idProd);
     suma += producto.precio;
    }
    console.log(suma)
    return suma;
  }