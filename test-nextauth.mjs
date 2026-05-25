import { getToken } from "next-auth/jwt";

async function run() {
  const req = new Request("http://localhost:3000/");
  req.headers.set("cookie", "authjs.session-token=mock-token");
  const token = await getToken({
    req,
    secret: "JuyjNwDC6DpiQz0CDpKYr9dN3icTYsynEAnZ7vqZOx8=",
  });
  console.log("Token:", token);
}
run();
