import express from "express"
import path from "path"
import sha256 from "js-sha256"


const app = express();
const indexPath = path.resolve(`${__dirname}/../dist/public/index.html`);

app.use(express.static("./dist/public"));
app.get('/', (req, res) => res.sendFile(indexPath) );

app.listen(3000, () => {
  console.log( "Development server is up and running on port 3000" );
})
