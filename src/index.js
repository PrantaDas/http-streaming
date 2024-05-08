import { createServer } from 'http';
import path from 'path';
import { statSync, createReadStream } from 'fs';
import { getIp } from './utils';

const PORT = 4000;

// change the file path as needed
const filePath = path.join(process.cwd(), 'vid.mp4');
// adjust the content type depending on the file extension
const contentType = 'video/mp4';

createServer((req, res) => {
    const { size } = statSync(filePath);
    if (req?.headers?.range) {
        const range = req.headers.range;
        let [start, end] = range.replace(/bytes=/gi, '').split('-');
        start = parseInt(start, 10);
        end = end ? parseInt(end, 10) : size - 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': (start - end) + 1,
            'Content-Type': contentType,
        });

        createReadStream(filePath, { start, end }).pipe(res);
    }
    else {
        res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': contentType,
        });
        createReadStream(filePath).pipe(res);
    }
}).listen(PORT,
    async () => {
        console.log("\x1b[32m 💻 A simple toy streaming server By \x1b[0m \n");
        console.log("\x1b[32m 👦 Pranta Das \x1b[0m \n\n\n");
        console.log(`\x1b[32m 🌏 Server is listening on: http://${getIp()}:${PORT} \x1b[0m`);
    }
);