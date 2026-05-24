import "dotenv/config";
import app from "./index";

const PORT = process.env.PORT;

app.listen(5001, () => {
  console.log("Auth Service running on 5001");
});
