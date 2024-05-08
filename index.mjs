import { createServer } from 'http';
import { statSync, createReadStream } from 'fs';
import { networkInterfaces } from 'os';
import { readdirSync } from 'fs';
import { extname, join } from 'path';

const PORT = 4000;
const DIRECTORY = process.cwd();
const VIDEO_HELPER = {
    ".avi": "video/x-msvideo",
    ".mp4": "video/mp4",
    ".mpeg": "video/mpeg",
    ".ogv": "video/ogg",
    ".ts": "video/mp2t",
    ".webm": "video/webm",
    ".3gp": "video/3gpp",
    ".3g2": "video/3gpp2",
    ".flv": "video/x-flv",
    ".m3u8": "application/x-mpegUR",
    ".mov": "video/quicktime",
    ".wmv": "video/x-ms-wmv"
};

const getIp = () => {
    const [ip] = Object.values(networkInterfaces())
        .map(val => val.find(v => !v.internal && v.family.toLowerCase() === 'ipv4'))
        .filter(val => val).map(v => v.address);
    return ip;
};

const getVideos = (folder) =>
    readdirSync(folder)
        .filter((f) => Object.keys(VIDEO_HELPER).includes(extname(f)));

const getContentType = (filePath) => VIDEO_HELPER[extname(filePath)];


const generateTemplate = (files) => {
    return `
    <html>
    <head><title>FTP PRO SERVER</title></head>
    <body>
        <h1 style="text-transform:uppercase;color:red;font-size:50px;text-align:center">Dhuma Dhuma Video Streaming</h1>
        <p style="color:blue;font-size:20px;font-style: italic;text-align:center;">Developed By - <a href="https://github.com/Prantadas" target="_blank">Pranta Das</a></p>
        <div style="text-align:center;border:1px dashed #9926ad;padding:5px;margin:auto;border-radius:5px;">
            <h1 style="color:#25c468">Available Videos:</h1>
            <ul>
                ${files.map(file => `<li style="list-style:none"><a href="/${file}">${file}</a></li>`).join('')}
            </ul>
        <div>
    </body>
    </html>
        `;
};


createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    if (reqUrl.pathname === '/') {
        const videoFiles = getVideos(DIRECTORY);
        const template = generateTemplate(videoFiles);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(template);
        return;
    }
    const filePath = join(DIRECTORY, reqUrl.pathname.slice(1));
    const contentType = getContentType(filePath);
    if (!contentType) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('No such File Found: ' + reqUrl.pathname.slice(1));
        return;
    }
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
}).listen(PORT, () => {
    console.log("\x1b[32m 💻 A simple toy streaming server By \x1b[0m \n");
    console.log("\x1b[32m 👦 Pranta Das \x1b[0m \n\n\n");
    console.log(`\x1b[32m 🌏 Server is listening on: http://${getIp()}:${PORT} \x1b[0m`);
});