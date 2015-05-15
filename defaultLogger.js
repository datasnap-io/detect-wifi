var winston = require('winston');

module.exports = function(levels){

    var logger =  new (winston.Logger)({
            transports:[
                //See output on the screen
                // new (winston.transports.Console)({
                //     timestamp:true,
                //     prettyPrint:true
                // }),
                //Put client output into file
                new (winston.transports.File)({
                    level:'client',
                    name: 'client_log',
                    filename: './logs/client_sightings.log',

                }),
                //Put ap output into file
                new (winston.transports.File)({
                    level:'all',
                    name: 'all_log',
                    filename: './logs/all_sightings.log',
                })
            ]
        })

    return logger;
}