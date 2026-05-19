import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define("product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  isHero: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  category: {
    type: DataTypes.ENUM(
      "electronics",
      "fashion",
      "home",
      "beauty",
      "automotive",
      "sports",
      "books",
      "tshirt",
      "shirt",
      "jeans",
      "jacket",
      "shoes",
      "accessories"
    ),
    allowNull: false,
    },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.ENUM("XS", "S", "M", "L", "XL", "XXL"),
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Product;
