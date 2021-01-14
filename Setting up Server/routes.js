const fs = require("fs");
const { builtinModules } = require("module");

const routesHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write(
      '<body><form action = "/message" method = "POST"><input type = "text" name = "mssg"><button type = "submit">Send</button></input></form></body>'
    );
    res.write("</html>");
    return res.end();
  }
  if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
      console.log(chunk);
    });
    return req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const mssg = parsedBody.split("=")[1];
      fs.writeFile("save.txt", mssg, (err) => {
        console.log(mssg);
        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();
      });
    });
  }
  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<body><h1> Hello there! </h1></body>");
  res.write("</html>");
  res.end();
};

module.exports = routesHandler;
