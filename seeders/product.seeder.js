import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Product from '../models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

function uploadImage(filename) {
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing product image: uploads/${filename}`);
  }

  return `/uploads/${encodeURIComponent(filename)}`;
}

const products = [
  {
    name: 'Classic Bookshelf',
    sku: 'PROD-BOOKSHELF-001',
    image: uploadImage('bookself.png'),
    description: 'Compact storage shelf for books, decor, and everyday essentials.',
    price: 129.99,
    stock: 18,
    category: 'accessories',
    color: 'Walnut',
    size: null,
  },
  {
    name: 'Modern Lounge Chair',
    sku: 'PROD-CHAIR-002',
    image: uploadImage('chair.png'),
    description: 'Comfortable accent chair with a clean modern profile.',
    price: 249.99,
    stock: 12,
    category: 'accessories',
    color: 'Grey',
    size: null,
  },
  {
    name: 'Cat Graphic T-Shirt',
    sku: 'PROD-TSHIRT-003',
    image: uploadImage('cat.png'),
    description: 'Soft cotton t-shirt with a playful cat graphic.',
    price: 24.99,
    stock: 45,
    category: 'tshirt',
    color: 'White',
    size: 'M',
  },
  {
    name: 'Wireless Game Joystick',
    sku: 'PROD-JOYSTICK-004',
    image: uploadImage('joystick.png'),
    description: 'Responsive wireless controller for casual and competitive gaming.',
    price: 59.99,
    stock: 30,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
  {
    name: 'Trail Leather Boots',
    sku: 'PROD-BOOT-005',
    image: uploadImage('boot.png'),
    description: 'Durable lace-up boots for everyday wear.',
    price: 119.99,
    stock: 20,
    category: 'shoes',
    color: 'Brown',
    size: null,
  },
  {
    name: 'Quilted Winter Jacket',
    sku: 'PROD-JACKET-006',
    image: uploadImage('jacket.png'),
    description: 'Warm quilted jacket built for cold weather comfort.',
    price: 149.99,
    stock: 16,
    category: 'jacket',
    color: 'Navy',
    size: 'L',
  },
  {
    name: 'Women Casual Shirt',
    sku: 'PROD-SHIRT-007',
    image: uploadImage('women.png'),
    description: 'Lightweight casual shirt with an easy everyday fit.',
    price: 39.99,
    stock: 35,
    category: 'shirt',
    color: 'Pink',
    size: 'M',
  },
  {
    name: 'PlayStation 5 Console',
    sku: 'PROD-PS5-008',
    image: uploadImage('ps5-playstation.png'),
    description: 'Next-generation gaming console with high-speed performance.',
    price: 499.99,
    stock: 10,
    category: 'accessories',
    color: 'White',
    size: null,
  },
  {
    name: 'Home Theater Woofer',
    sku: 'PROD-WOOFER-009',
    image: uploadImage('woofer.png'),
    description: 'Deep bass woofer for music, movies, and gaming setups.',
    price: 199.99,
    stock: 14,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
  {
    name: 'JBL Boombox Speaker',
    sku: 'PROD-JBL-010',
    image: uploadImage('JBL_BOOMBOX.png'),
    description: 'Portable speaker with powerful sound and long battery life.',
    price: 349.99,
    stock: 11,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
  {
    name: 'Mercedes-Benz GTR Model',
    sku: 'PROD-GTR-011',
    image: uploadImage('New-Mercedes-Benz-Gtr.png'),
    description: 'Detailed collector model inspired by the Mercedes-Benz GTR.',
    price: 89.99,
    stock: 22,
    category: 'accessories',
    color: 'Green',
    size: null,
  },
  {
    name: 'Lenovo Ideapad Gaming Laptop',
    sku: 'PROD-IDEAPAD-012',
    image: uploadImage('ideapad-gaming.png'),
    description: 'Gaming laptop built for fast multitasking and smooth gameplay.',
    price: 899.99,
    stock: 8,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
  {
    name: 'Gucci Savoy Duffel Bag',
    sku: 'PROD-DUFFLE-013',
    image: uploadImage('Light-Gucci-Savoy-medium-duffle-bag.png'),
    description: 'Medium duffel bag with a refined travel-ready design.',
    price: 1899.99,
    stock: 5,
    category: 'accessories',
    color: 'Beige',
    size: null,
  },
  {
    name: 'Bluetooth Speaker Three',
    sku: 'PROD-SPEAKER-014',
    image: uploadImage('speaker-three.png'),
    description: 'Compact Bluetooth speaker for home and outdoor listening.',
    price: 79.99,
    stock: 25,
    category: 'accessories',
    color: 'Blue',
    size: null,
  },
  {
    name: 'Minimal Wall Frame',
    sku: 'PROD-FRAME-015',
    image: uploadImage('Frame 760.png'),
    description: 'Simple wall frame for prints, photos, and display shelves.',
    price: 29.99,
    stock: 40,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
  {
    name: 'UltraWide Monitor',
    sku: 'PROD-MONITOR-016',
    image: uploadImage('monitor.png'),
    description: 'Wide display monitor for work, media, and gaming.',
    price: 299.99,
    stock: 13,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
  {
    name: 'iPhone Smartphone',
    sku: 'PROD-IPHONE-017',
    image: uploadImage('iphone.png'),
    description: 'Premium smartphone with a bright display and fast performance.',
    price: 999.99,
    stock: 9,
    category: 'accessories',
    color: 'Silver',
    size: null,
  },
  {
    name: 'Mechanical Keyboard',
    sku: 'PROD-KEYBOARD-018',
    image: uploadImage('keyboard.png'),
    description: 'Mechanical keyboard with tactile keys for work and gaming.',
    price: 89.99,
    stock: 32,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
  {
    name: 'Signature Perfume',
    sku: 'PROD-PERFUME-019',
    image: uploadImage('perfume.png'),
    description: 'Fresh everyday fragrance with a clean, lasting finish.',
    price: 69.99,
    stock: 27,
    category: 'accessories',
    color: 'Clear',
    size: null,
  },
  {
    name: 'Mirrorless Camera',
    sku: 'PROD-CAMERA-020',
    image: uploadImage('camera.png'),
    description: 'Compact mirrorless camera for travel, portraits, and video.',
    price: 749.99,
    stock: 7,
    category: 'accessories',
    color: 'Black',
    size: null,
  },
];

async function seedProducts() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    await Product.bulkCreate(
      products.map((product) => ({
        ...product,
        isActive: true,
      })),
      {
        updateOnDuplicate: [
          'name',
          'image',
          'description',
          'price',
          'stock',
          'isActive',
          'category',
          'color',
          'size',
          'updatedAt',
        ],
      }
    );

    console.log(`Seeded ${products.length} products successfully.`);
  } catch (error) {
    console.error('Failed to seed products:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedProducts();
