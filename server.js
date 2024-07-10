const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const sql = require('./database_config.js'); 
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const cors = require('cors');
const app = express();
const port = 3007;

app.use(cors());
app.use(bodyParser.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Express Server API",
            version: "0.0.1",
            description: "A simple express API with Swagger"
        },
        host: `oufapi-5cc267ed7086.herokuapp.com`,
        basePath: '/',
        schemes: ['https']
    },
    apis: ['./routes/userAPI.js', './routes/productAPI.js'] // Paths to your Swagger annotations files
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import routes
const userRoutes = require('./routes/userAPI');
const productRoutes = require('./routes/productAPI');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Endpoint for image upload
app.post('/upload', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  const imagePath = `/uploads/${file.filename}`;
  // Here you can insert the image details into your database
  res.send({ imagePath: imagePath });
});

app.listen(port, () => {
    console.log(`Server is running on https://noufapi-5cc267ed7086.herokuapp.com/`);
    console.log(`Swagger UI is available on https://noufapi-5cc267ed7086.herokuapp.com/api-ui`);
});
