var winston = require('winston');
const rTracer = require('cls-rtracer');

// that how you can configure winston logger

//const { createLogger, format, transports } = require('winston')
const format = winston.format;
const { combine, timestamp, printf } = format

const rTracerFormat = printf((info) => {
    const rid = rTracer.id();
    return rid
      ? `${info.timestamp} ${info.level} ${process.pid} --- [traceId:${rid}]: ${info.message}`
      : `${info.timestamp}  ${info.level} ${process.pid}: ${info.message}`
  })

var logger = new winston.createLogger({
    format: combine(
        timestamp(),
        rTracerFormat
    ),
    transports: [
        new winston.transports.File({
            filename: '../logs/vtsm.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false,
            showLevel:false
        }),
        new (require('winston-daily-rotate-file'))({
            filename: '../logs/vtsm-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            handleExceptions: true,
            zippedArchive: true,
            json: true,
            maxsize: '20m', //5MB
            maxFiles: '14d',
            colorize: false,
            showLevel:false
        }),
        new winston.transports.Console({
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        //logger.info(message);
    }
};
