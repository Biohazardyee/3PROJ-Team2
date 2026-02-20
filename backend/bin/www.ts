#!/usr/bin/env node

import app from '../app.js';
import {connectDB} from '../config/database.js';
import debugLib from 'debug';
import http from 'http';
import {AddressInfo} from "node:net";

const debug = debugLib('lab4:server');

/**
 * Get port from environment and store in Express.
 */
const port: any = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Connect to database then start server
 */
connectDB().then((): void => {
    server.listen(port);
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
    server.on('error', onError);
    server.on('listening', onListening);
}).catch((error: any) => {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any): any {
    const port: number = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind: string = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void  {
    const addr: string | AddressInfo | null = server.address();
    const bind: string = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr?.port;
    debug('Listening on ' + bind);
}