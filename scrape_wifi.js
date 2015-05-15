#!/usr/bin/env node

var fs = require('fs'),
	csv = require('csv'),
	childProc = require('child_process'),
	parseData = require('./parser'),
	Q = require('q'),
	_ = require('lodash'),
	timeoutId,
	uidNum = require('uid-number'),
	userUID,
	winston = require('winston'),
	yargs = require('yargs')
				.help('h')
				.option('i',{
					alias:'interval',
					demand:true,
					default:20000,
					describe:'The size of the time window to collect wifi activity.'
				})
				.option('m',{
					alias:'maxCycles',
					demand:true,
					default:0,
					describe:'The maximum number of scanning cycles.'
				})
				.option('l',{
					alias:'loggerDelegate',
					default:'./winstonDefault.js',
					demand:true,
					describe:'Logger configuration to handle output stream.'
				}).argv


	var logger = new ( winston.Logger)({
		transports :[
			new (winston.transports.Console)({
					timestamp:true,
					prettyPrint:true
				})
			]
		});


var levels = {
	all:0,
	client:1
};

var dataLogger = require('./defaultLogger')(levels)
dataLogger.setLevels(levels)
var timeWindow = yargs.interval,
	maxCycles = yargs.maxCycles,
	cycleCount = 0;

runCollectionCycle()

//Launches the script that collects the data over some window
function collectWifiData( interval ){
	//Start the command up
	var defer = Q.defer(),
		filename = __dirname+"/tmp/wifi_dump-"+Date.now();

	logger.info('Wifi scanning for :'+ interval/1000+' seconds');
	var	child = childProc.spawnSync( "airodump-ng",[ "--ivs", "--output-format", "csv", "-w", filename, "mon0" ],
		{ 	stdio: [null, null, null, null, null],
			timeout:interval
		 })

	logger.info('Wifi scan end');
	var baseName = filename+'-01';

	logger.info('Loading generated files.');
	return Q.nfcall( fs.readFile, baseName+'.csv', 'utf8' )
			.then(function(data){
				logger.info('Files loaded');
				logger.info('Removing generated files.');

				//Delete the creepy data
				fs.unlink(baseName+'.csv')
				fs.unlink(baseName+'.ivs')
				return data
			});

}

//Take parsed data and
function processLoggers(payload){
	logger.info('Launching loggers');
	var clientList = payload[0],
		apList = payload[1];

		clientList.map( function(data){
			dataLogger.client('sighting',data)
		} );
		apList.map( function(data){
			dataLogger.all('sighting',data)
		});
		logger.info('Loggers complete');
		return
}

//Decide to do a cycle or not and launch it if so
function maybeCollectAgain(result){
	cycleCount++;
	if(maxCycles > 0){
		if(cycleCount < maxCycles){
			runCollectionCycle()
		}
	}
	return result
}


//The service
function runCollectionCycle(){
	logger.log('info','Collection cycle #'+cycleCount);
	var timeStarted = Date.now();
	collectWifiData( timeWindow )
		.then( maybeCollectAgain )
		.then( function logparsing(data){
			logger.info('Parsing data');
			logger.info('Data length ', data.length );
			return data;
		})
		.then( parseData )
		.then(function augmentoutput(payload){

			var clientLog = payload[0].map(function(record){
				record.type = 'client';
				record.windowStart = timeStarted;
				return record;
			})

			var apLog = payload[1].map(function(record){
				record.type = 'ap';
				record.windowStart = timeStarted;
				return record;
			})

			return [clientLog,apLog];
		})
		.then( processLoggers )
		.catch(function(e){
			//Decide what to do about the errors
			console.log(e.stack)
		})
}






