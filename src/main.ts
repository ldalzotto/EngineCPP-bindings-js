import { EngineTest } from "./test.js"
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');



new Worker(path.join(__dirname, "test.js"), { workerData: { }});

// new EngineTest().start();

let l_number = 10;
/*
while(true)
{
    l_number += 1;
}
*/