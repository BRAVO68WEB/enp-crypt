import GPGScript from "../lib/script.js";

const script = new GPGScript("keys");

console.log(script.generateKey("test"));

const encData = script.encryptMessage("Hello World!", "test") as string;

console.log(script.decryptMessage(encData, "test"));

script.signMessage("Eno", "test") as string;

console.log(script.verifySignature("Eno", "test"));

// Path: test/hey.ts
