import "dotenv/config";
import app from "./index";

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`🚀 Gateway running on http://localhost:${port}`);
});
