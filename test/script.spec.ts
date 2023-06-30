import GPGScript from "../lib/script.js";

const script = new GPGScript("keys");

console.log(script.generateKey("mocha"));

describe("enc/dec", () => {
    it("Decrypted Msg matchs Orginal", done => {
        const unEnpText1 = "mocha is a test framework for nodejs";

        const encData1 = script.encryptMessage(unEnpText1, "mocha") as string;

        try {
            let depData1 = script.decryptMessage(encData1, "mocha");

            depData1 = depData1?.split("\n")[0];

            if (unEnpText1 === depData1) {
                done();
            } else {
                done(new Error("Does not match"));
            }
        } catch (error) {
            done(error);
        }
    });

    it("Check is Original message is tampered", done => {
        script.signMessage("Eno", "mocha");
        try {
            let result = script.verifySignature("Eno", "mocha") as string;

            result = result.split("\n")[0];

            if (result === "Verified OK") {
                done();
            } else {
                done(new Error("Message tampered"));
            }
        } catch (error) {
            done(error);
        }
    });
});
