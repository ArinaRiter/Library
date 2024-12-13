const fs = require('fs');
const os = require('os');
const path = require('path');

const filePath = path.join(__dirname, 'data.txt');

function clearFile() {
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            console.error('Ошибка при очистке файла:', err);
        }
    });
}

function logToFile(data) {
    fs.appendFile(filePath, data + '\n', (err) => {
        if (err) {
            console.error('Ошибка при записи в файл:', err);
        }
    });
}

function getServerInfo() {
    return `
        Время запуска сервера: ${new Date().toLocaleString()}
        Платформа: ${os.platform()}
        Версия ОС: ${os.release()}
        Архитектура: ${os.arch()}
        Количество процессоров: ${os.cpus().length}
        Свободная память: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB
        Общая память: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB
        Время работы сервера: ${(os.uptime() / 3600).toFixed(2)} часов
    `;
}

function logOSInfo() {
    console.log('Информация об операционной системе:');
    console.log(`Платформа: ${os.platform()}`);
    console.log(`Версия: ${os.release()}`);
    console.log(`Архитектура: ${os.arch()}`);
    console.log(`Общий объём памяти: ${(os.totalmem() / (1024 ** 3)).toFixed(2)} ГБ`);
    console.log(`Свободная память: ${(os.freemem() / (1024 ** 3)).toFixed(2)} ГБ`);
    console.log(`Количество процессоров: ${os.cpus().length}`);
    console.log(`Время работы сервера: ${(os.uptime() / 3600).toFixed(2)} часов`);
}

module.exports = {
    clearFile,
    logToFile,
    getServerInfo,
    logOSInfo,
    filePath,
};
