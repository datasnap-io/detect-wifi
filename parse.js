var parser = require('./parser'),
    fs = require('fs');

var buf = fs.readFileSync(__dirname+'/wifi_dump-1428628358225-01.csv', "utf8");
    parser(buf);