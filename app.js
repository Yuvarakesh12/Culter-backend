const express = require("express");
const path = require("path");
const cors = require("cors");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "Culter.db");
app.use(express.json()); 
app.use(cors());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.use(express.json()); // Middleware to parse JSON requests

// GET all products
app.get("/products", async (request, response) => {
  const allProductQuery = `SELECT * FROM products;`;
  const allProducts = await db.all(allProductQuery);
  response.send(allProducts);
});

// POST a new product
app.post("/products", async (request, response) => {
    const productDetails = request.body;
    const { name, price, quality } = productDetails;
  
    // Validate input
    if (!name || typeof price !== 'number' || typeof quality !== 'number') {
      return response.status(400).send({ error: 'Invalid input. Name, price, and quality are required.' });
    }
  
    const addProductQuery = `
      INSERT INTO products (name, price, quality)
      VALUES (?, ?, ?);
    `;
  
    try {
      const dbResponse = await db.run(addProductQuery, name, price, quality);
      const productId = dbResponse.lastID; // Get the ID of the newly inserted product
      response.status(201).send({ productId }); // Send back the new product ID
    } catch (error) {
      response.status(500).send({ error: error.message });
    }
  });
  

// PUT (update) an existing product
app.put("/products/:id", async (request, response) => {
  const { id } = request.params;
  const productDetails = request.body;
  const { name, price, quality } = productDetails;

  const updateProductQuery = `
    UPDATE products
    SET name = ?, price = ?, quality = ?
    WHERE id = ?;
  `;

  await db.run(updateProductQuery, name, price, quality, id);
  response.send({ message: "Product updated successfully" });
});

// DELETE a product
app.delete("/products/:id", async (request, response) => {
  const { id } = request.params;

  const deleteProductQuery = `
    DELETE FROM products
    WHERE id = ?;
  `;

  await db.run(deleteProductQuery, id);
  response.send({ message: "Product deleted successfully" });
});
