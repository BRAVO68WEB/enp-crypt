#!/bin/env node

import shell from "shelljs";

class EnpCript {
    DEBUG_MODE = false;

    constructor(private keystoreLocation: string) {
        this.DEBUG_MODE = process.env.DEBUG_MODE === "true" ? false : true;

        const isGPGInstalled = shell.which("ssh-keygen");
        if (!isGPGInstalled) {
            console.log("ssh-keygen is not installed. Please install ssh-keygen and try again.");
        }
        if (!shell.test("-e", keystoreLocation)) {
            shell.mkdir("-p", keystoreLocation);
        }
    }

    public generateKey(keyname: string) {
        // Check if keyname exists
        if (shell.test("-e", `${this.keystoreLocation}/${keyname}.key`)) {
            return "Key already exists.";
        }

        // Generate key
        console.log(`${this.keystoreLocation}/${keyname}`);
        shell.exec(
            `
            ssh-keygen -t rsa -P "" -b 4096 -m PEM -f ${this.keystoreLocation}/${keyname}.key
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );
        shell.exec(
            `
            ssh-keygen -e -m PEM -f ${this.keystoreLocation}/${keyname}.key > ${this.keystoreLocation}/${keyname}.key.pub
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        return "Key generated successfully.";
    }

    public encryptMessage(message: string, keyname: string) {
        // Check if keyname exists
        if (!shell.test("-e", `${this.keystoreLocation}/${keyname}.key`)) {
            return;
        }

        // Encrypt message
        const encData = shell.exec(
            `
            echo "${message}" | openssl pkeyutl -encrypt -pubin -inkey ${this.keystoreLocation}/${keyname}.key.pub | base64
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        return encData.stdout;
    }

    public decryptMessage(message: string, keyname: string) {
        // Check if keyname exists
        if (!shell.test("-e", `${this.keystoreLocation}/${keyname}.key`)) {
            return;
        }

        // Decrypt message
        const decData = shell.exec(
            `
            echo "${message}" | base64 --decode | openssl pkeyutl -decrypt -inkey ${this.keystoreLocation}/${keyname}.key
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        if (decData.stderr) {
            throw new Error(decData.stderr);
        }
        return decData.stdout;
    }

    public signMessage(message: string, keyname: string) {
        // Check if keyname exists
        if (!shell.test("-e", `${this.keystoreLocation}/${keyname}.key`)) {
            return;
        }

        // Sign message
        shell.exec(
            `
            echo "${message}" | openssl dgst -sha256 -sign ${this.keystoreLocation}/${keyname}.key -out ${this.keystoreLocation}/${keyname}.key.sig
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        // Generate signature
        const signData = shell.exec(
            `
            base64 ${this.keystoreLocation}/${keyname}.key.sig
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        return signData.stdout;
    }

    public verifySignature(message: string, keyname: string) {
        // Check if keyname exists
        if (!shell.test("-e", `${this.keystoreLocation}/${keyname}.key`)) {
            return;
        }

        // Verify signature
        const verifyData = shell.exec(
            `
            echo "${message}" | openssl dgst -sha256 -verify ${this.keystoreLocation}/${keyname}.key.pub -signature ${this.keystoreLocation}/${keyname}.key.sig
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        if (verifyData.stderr) {
            throw new Error(verifyData.stderr);
        }

        return verifyData.stdout;
    }

    public verifyKeySignature(keyname: string) {
        // Check if keyname exists
        if (!shell.test("-e", `${this.keystoreLocation}/${keyname}.key`)) {
            return;
        }

        // Encrypt a test file to create a signature
        shell.exec(
            `
            openssl dgst -sha256 -sign ${this.keystoreLocation}/${keyname}.key -out ${this.keystoreLocation}/${keyname}.key.sig package.json 
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        const verifyData = shell.exec(
            `
            openssl dgst -sha256 -verify ${this.keystoreLocation}/${keyname}.key.pub -signature ${this.keystoreLocation}/${keyname}.key.sig package.json
        `,
            {
                silent: this.DEBUG_MODE,
            },
        );

        return verifyData.stdout;
    }
}

export default EnpCript;
