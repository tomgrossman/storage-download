const path = require('path');
const express = require('express');

const projectId = 'my-project';//change this!!!

const googleStorage = require('@google-cloud/storage')({
    projectId: projectId,
    keyFilename: path.join('storage-key.json')
});
//change the projectId, bucket and file names to your accessible storage in order to reproduce.
// the file I used is 3.59 GB sized and limited to 5 megabytes per second download speed
const bucket = googleStorage.bucket('my-bucket-project');
const fileName = 'agent_ova/appliance.ova';

const appServer = express();

appServer.get(
    '/',
    function (req, res) {
        console.log(new Date() + ' start');

        res.on('finish', function () {
            console.log(new Date() + ' finish');
        });

        let bucketFile = bucket.file(fileName);
        bucketFile.createReadStream()
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
            })
            .pipe(res);
        //the route is not accessible until restarting app.js and it never gets into 'end' or 'finish' events
    }
);

appServer.listen(
    3000,
    '0.0.0.0',
    function () {
        console.log(new Date() + ' Listening on port 3000');
    }
);