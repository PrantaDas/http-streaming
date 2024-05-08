import os from 'os';
import figlet from 'figlet';

export const getIp = () => {
    const netInterface = os.networkInterfaces();
    let ip;
    Object.keys(netInterface).forEach((nFace) => {
        const iFaceData = netInterface[nFace];

        iFaceData.forEach((add) => {
            if (
                add.family === 'IPv4'
                && !add.internal
            ) {
                ip = add.address;
            }
        });
    });
    return ip;
}
