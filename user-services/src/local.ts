import "dotenv/config";
import app from "./index";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`User Service running on ${PORT}`);
});
