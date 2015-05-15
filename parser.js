var csv = require('csv'),
    _ = require('lodash'),
    Q = require('q'),
    parserDefaults = {
        delimeter:',',
        trim:true,
        auto_parse:true,
        columns:function(columns){
            return _(columns)
                .map(_.camelCase)
                .value()
        }
    };

module.exports = function(dataString){
    //Separate client from AP
    if(dataString ==='') return [[],[]];

    var clientAPDelimeterRe = /\r\n\r\n/;

    var clientAp = dataString.split( clientAPDelimeterRe ),
        clientString = clientAp[1],
        apString = clientAp[0].replace(/^\r\n/,'');

    return Q.all([
                Q.nfcall( csv.parse, clientString, _.cloneDeep(parserDefaults) ),
                Q.nfcall( csv.parse, apString, parserDefaults)

            ])
}