const express = require('express');
const router = express.Router();
const sql = require('../database_config.js');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename the file to avoid conflicts
    }
});
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Returns a list of all products
 *     responses:
 *       200:
 *         description: A list of products
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/products'
 *   post:
 *     summary: Add a product
 *     description: Add a product
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: The product name
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: The product description
 *       - in: formData
 *         name: price
 *         type: integer
 *         required: true
 *         description: The product price
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: The product image
 *       - in: formData
 *         name: categoryid
 *         type: integer
 *         required: true
 *         description: The product category ID
 *     responses:
 *       201:
 *         description: Product created successfully
 *
 * /api/products/{product_id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes a product by ID
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a product
 *     description: Update a product by ID
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: integer
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: The product name
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: The product description
 *       - in: formData
 *         name: price
 *         type: integer
 *         required: true
 *         description: The product price
 *       - in: formData
 *         name: image
 *         type: file
 *         description: The product image
 *       - in: formData
 *         name: categoryid
 *         type: integer
 *         required: true
 *         description: The product category ID
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *
 * definitions:
 *   products:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 1
 *       name:
 *         type: string
 *         example: "Product Name"
 *       description:
 *         type: string
 *         example: "Product Description"
 *       price:
 *         type: integer
 *         example: "Price"
 *       image_url:
 *         type: string
 *         example: "image"
 *       categoryid:
 *         type: integer
 *         example: "categoryid"
 */

// Endpoint to get all products
router.get('/', async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM Product");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to add a new product
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, categoryid } = req.body;
        const image_url = req.file ? req.file.filename : null;
        const request = new sql.Request();
        request.input('pname', sql.NVarChar, name);
        request.input('pdescription', sql.NVarChar, description);
        request.input('price', sql.Int, price);
        request.input('image_url', sql.NVarChar, image_url);
        request.input('categoryid', sql.Int, categoryid);

        const result = await request.query(`exec AddProduct_sp @pname='${name}', @pdescription='${description}', @price='${price}', @image_url='${image_url}', @categoryid='${categoryid}'`);
        res.status(201).json({ product: result.recordset, message: 'Product has been added successfully!' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to delete a product
router.delete('/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        const request = new sql.Request();
        request.input('product_id', sql.Int, product_id);

        const result = await request.query(`exec DeleteProduct_sp @product_id=${product_id}`);
        res.status(200).json({ message: 'Product has been deleted successfully!' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to update a product
router.put('/:product_id', upload.single('image'), async (req, res) => {
    try {
        const { product_id } = req.params;
        const { name, description, price, categoryid } = req.body;
        const image_url = req.file ? req.file.filename : req.body.image_url;
        const request = new sql.Request();
        request.input('product_id', sql.Int, product_id);
        request.input('pname', sql.NVarChar, name);
        request.input('pdescription', sql.NVarChar, description);
        request.input('price', sql.Int, price);
        request.input('image_url', sql.NVarChar, image_url);
        request.input('categoryid', sql.Int, categoryid);

        await request.query(`exec UpdateProduct_sp @pproduct_id=${product_id}, @pname='${name}', @pdescription='${description}', @pprice=${price}, @pimage_url='${image_url}', @pcategoryid=${categoryid}`);
        res.status(200).json({ message: 'Product has been updated successfully!' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
