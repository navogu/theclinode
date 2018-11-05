#!/usr/bin/env node
const log = require('npmlog');
const lounger = require('../lib/lounger.js');
const pkg = require('../package.json');

const help = require('../lib/help.js');

const osenv = require('osenv');
const fs = require('fs');

const nopt = require('nopt');
const parsed = nopt({'json': [Boolean],
                     'delimiter': [String],
                     'comment': [String],
                     'chunksize': [Number]
                    },
                    {'j': '--json'}, process.argv, 2);

const cmd = parsed.argv.remain.shift();

const home = osenv.home();
parsed.loungerconf = home + '/' + '.loungerrc';

if (!fs.existsSync(parsed.loungerconf)) {
    fs.writeFileSync(parsed.loungerconf, '');
}

lounger.load(parsed).then(() => {

  if (!lounger.cli[cmd]) {
      return help.cli();
  }

  lounger.cli[cmd]
    .apply(null, parsed.argv.remain)
    .catch(errorHandler);

}).catch(errorHandler);

function errorHandler (err) {
    if (!err) {
        process.exit(1);
    }

    if (err.type == 'EUSAGE') {
        err.message && log.error(err.message);
        process.exit(1);
    }

    err.message && log.error(err.message);

    if(err.stack) {
        log.error('', err.stack);
        log.error('', '');
        log.error('', '');
        log.error('', 'lounger:', pkg.version, 'node:', process.version);
        log.error('', 'please open an issue including this log on '
            + pkg.bugs.url);
    }

    // log.error(err);
    process.exit(1);
}
