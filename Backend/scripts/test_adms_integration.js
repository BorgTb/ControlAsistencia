/**
 * test_adms_integration.js
 * 
 * Script para verificar los endpoints ADMS recién integrados.
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080/iclock'; // Ajustar puerto si es necesario
const SN = 'TEST_SN_9999';

async function testHandshake() {
    console.log('--- Probando Handshake (GET /cdata) ---');
    try {
        const res = await fetch(`${BASE_URL}/cdata?SN=${SN}`, { method: 'GET' });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function testAttendanceLog() {
    console.log('\n--- Probando Envío de Marcación (POST /cdata) ---');
    const logBatch = `1\t2025-12-26 13:00:00\t0\t1\t0\n`;
    try {
        const res = await fetch(`${BASE_URL}/cdata?SN=${SN}&table=ATTLOG`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: logBatch
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function testGetRequest() {
    console.log('\n--- Probando Polling de Comandos (GET /getrequest) ---');
    try {
        const res = await fetch(`${BASE_URL}/getrequest?SN=${SN}`, { method: 'GET' });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function runTests() {
    await testHandshake();
    await testAttendanceLog();
    await testGetRequest();
}

runTests();
