const bcrypt = require("bcrypt");

const password = "Korega";
const password2 = "parega";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log(`senha encriptada: ${hash}`);
  bcrypt.compare(password2, hash, (err, result) => {
    if (err) throw err;
    if (result) {
      console.log("igual");
    } else {
      console.log("a");
    }
  });
});
