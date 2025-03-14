const express = require("express");
const { connectDB } = require("./config/database")
const app = express();
const cookieParser  = require("cookie-parser");
const cors = require("cors");

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
    .then(() => {
        console.log("Database Connected!!");
        app.listen(5657, () => {
            console.log("server is up");
        });
    })
    .catch((err) => {
        console.error("Database connection error:", err.message);
        console.error("Full error:", err);
});



