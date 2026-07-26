import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import queueRoutes from "./routes/queueRoutes.js";


dotenv.config();


const app = express();


app.use(cors());
app.use(express.json());


// Routes
app.use("/api/queue", queueRoutes);



mongoose.connect(process.env.MONGODB_URI)
.then(() => {

    console.log("MongoDB Connected");


    app.listen(process.env.PORT || 5000, () => {
        console.log(
          `Server running on port ${process.env.PORT || 5000}`
        );
    });


})
.catch((error)=>{

    console.log("MongoDB Error:", error);

});