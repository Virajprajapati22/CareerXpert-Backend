import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connection = () => {
  mongoose
    .connect(process.env.DATABASE, {
      dbName: process.env.DBNAME,
    })
    .then(() => {
      console.log("DB connection Successfull");
    })
    .catch((err) => {
      console.log(process.env.DATABASE);
      console.log(err);
    });
};
