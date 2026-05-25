import jwt from "next-auth/jwt";
const { getToken } = jwt;

// We need to see what `defaultCookies` is doing inside next-auth/jwt
import fs from "fs";
const file = fs.readFileSync("./node_modules/next-auth/jwt.js", "utf-8");
const match = file.match(/authjs\.session-token|next-auth\.session-token/g);
console.log(match);
