## EnpCrypt

npm library for encrypting and decrypting messages using RSA algorithm.

## Installation

```bash
npm install enp-crypt
```

## Usage

```javascript
import GPGScript from "../lib/script.js";

const script = new GPGScript("<keys-store-location>");

script.generateKey("<keyname>");

const encData = script.encryptMessage("Hello World!", "<keyname>") as string;

console.log(script.decryptMessage(encData, "<keyname>"));
```

## Testing

```bash
npm run test
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

