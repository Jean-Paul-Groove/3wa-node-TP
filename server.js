const http = require("http");
const fs = require("fs");
const pug = require("pug");
require("dotenv").config();
const date = require("./utils/date");

const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/x-icon" });
    res.end();
    return;
  }

  if (url === "/style.css" && req.method === "GET") {
    res.writeHead(200, { "content-type": "text/css" });
    res.write(fs.readFileSync("./assets/css/style.css", "utf-8"));
    res.end();
    return;
  }

  if (url === "/users" && req.method === "GET") {
    try {
      const students = JSON.parse(
        fs.readFileSync("./Data/data.json").toString()
      );

      pug.renderFile(
        "./views/users.pug",
        { students, formatDate: date.formatDate, isBirthday: date.isBirthday },
        (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(err.message);
          }
          res.writeHead(200, { "content-type": "text/html" });
          res.write(data, "utf-8");
          res.end();
        }
      );
      return;
    } catch (error) {
      console.log(error);
    }
  }
  if (url === "/addUser") {
    if (req.method === "GET") {
      try {
        res.writeHead(200, {
          "Content-Type": "text/plain",
        });
        pug.renderFile("./views/addUser.pug", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(err.message);
          }
          res.writeHead(200, { "content-type": "text/html" });
          res.write(data, "utf-8");
          res.end();
        });
        return;
      } catch (error) {
        console.log(error);
      }
    } else if (req.method === "POST") {
      try {
        let body = "";
        req.on("data", (chunk) => {
          return (body += chunk);
        });
        req.setEncoding("utf-8");
        req.on("end", () => {
          const form = body.split("&");
          const formBody = {};
          for (const property of form) {
            const [key, value] = property.split("=");
            formBody[key] = value;
          }
          if (formBody.name && formBody.birth) {
            const newUser = { name: formBody.name, birth: formBody.birth };
            const students = JSON.parse(
              fs.readFileSync("./Data/data.json").toString()
            );
            students.push(newUser);
            fs.writeFileSync("./Data/data.json", JSON.stringify(students));
          }
          res.writeHead(303, {
            Location: "/users",
          });
          res.end();
        });
      } catch (error) {
        res.writeHead(500, { "content-type": "text/plain" });
        res.end(error);
      } finally {
        return;
      }
    }
  }
  if (url.split("/")[1] === "delete-user") {
    try {
      const userName = url.split("/")[2];
      if (userName != null) {
        const students = JSON.parse(
          fs.readFileSync("./Data/data.json").toString()
        );
        const userToDelete = students.find(
          (student) => student.name === userName
        );
        const newStudents = students.filter(
          (student) => student !== userToDelete
        );
        fs.writeFileSync("./Data/data.json", JSON.stringify(newStudents));
      }
      res.writeHead(303, {
        Location: "/users",
      });
      res.end();
      return;
    } catch (error) {
      console.log(error);
    }
  }
  res.writeHead(303, {
    Location: "/addUser",
  });
  res.end();
});

server.listen(
  process.env.APP_PORT || 8000,
  process.env.APP_HOSTNAME || "localhost",
  () => {
    console.log(
      `Server is running at http://${process.env.APP_HOSTNAME}:${process.env.APP_PORT}`
    );
  }
);
