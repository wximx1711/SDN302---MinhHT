import http from "node:http";

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/",
  method: "GET",
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(`[HTTP Client] Status Code: ${res.statusCode}`);
    console.log(`[HTTP Client] Data nhận được: ${data}`);
  });
});

req.on("error", (error) => {
  console.error("[HTTP Client] Gặp lỗi:", error.message);
});

req.end();
