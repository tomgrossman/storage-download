'use strict';

const path = require('path');
const express = require('express');

const projectId = 'my-project';//change this!!!

const googleStorage = require('@google-cloud/storage')({
    promise: Promise,
    projectId: projectId,
    keyFilename: path.join('storage-key.json')
});
//change the projectId, bucket and file names to your accesible storage in order to reproduce.
// the file I used is 2.3 GB sized and limited to 5 megabytes per second download speed
const bucket = googleStorage.bucket('my-bucket-project');
const fileName = 'agent_ova/agent.ova';

const appServer = express();

appServer.get(
    '/',
    function (req, res) {
        console.log(new Date() + ' start');

        res.on('finish', function () {
            console.log(new Date() + ' finish');
        });

        let bucketFile = bucket.file(fileName);
        bucketFile.createReadStream({validation: false})
            .on('error', (err) => {
                console.log(new Date() + ' error: ' + err.stack);
            })
            .on('response', (streamResponse) => {
                console.log(new Date() + ' streamResponse');
                res.setHeader('Content-Length', streamResponse.headers['content-length']);
                res.setHeader('Content-Type', streamResponse.headers['content-type']);
                res.setHeader('Content-disposition', 'attachment; filename="agent_download.ova"');
            })
            .on('end', () => {
                console.log(new Date() + ' end');
                res.end();

                return true;
            }) // with .on('data'... ) instead of piping, it works.
            // .on('data', (data) => {
            //     Response.write(data);
            // })
            .pipe(res);
        //with pipe enabled && limited download speed, the route is not accessible until restarting app.js and it never gets into 'end' or 'finish' events
    }
);

appServer.listen(
    3000,
    '0.0.0.0',
    function () {
        console.log(new Date() + ' Listening on port 3000');
    }
);

