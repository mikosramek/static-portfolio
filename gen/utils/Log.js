const chalk = require("chalk");

class Log {
  header(text) {
    console.log(chalk.bgBlack.whiteBright.bold(`\n  ${text}  `));
  }
  subtitle(text) {
    console.log(chalk.bgGray.whiteBright.bold(`\n  ${text}  `));
  }
  pos(text) {
    console.log(chalk.green(text));
  }
  neg(text) {
    console.log(chalk.red(text));
  }
  pass(text) {
    this.pos(`✓ ${text}`);
  }
  fail(text) {
    this.neg(`✗ ${text}`);
  }
}

module.exports = new Log();
