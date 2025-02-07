import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
dotenv.config();

const { DATABASE_URL } = process.env;

export const db = new Sequelize(DATABASE_URL, {
  models: [__dirname + "/../models/**/*"],
  logging: false,
  native: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
