import IndexeddbLogger from './protocols/indexeddb';
import WebsqlLogger from './protocols/websql';
import LocalstorageLogger from './protocols/localstorage';
import * as util from './lib/util';


class Logline {
    constructor(namespace) {
        Logline._checkProtocol();
        return new Logline._protocol(namespace);
    }

    // 选择并初始化协议
    static _initProtocol(protocol) {
        Logline._protocol = protocol;
        Logline._protocol.init(Logline._database || 'logline');
    }

    // 检查协议
    static _checkProtocol() {
        if (!Logline._protocol) {
            let protocols = Object.keys(Logline.PROTOCOL), protocol;
            while ((protocol = Logline.PROTOCOL[protocols.shift()])) {
                if (protocol.support) {
                    Logline._initProtocol(protocol);
                    return;
                }
            }

            throw new Error(protocols.join(', ').toLowerCase() + ' protocols are not supported on this platform');
        }
    }

    // 获取所有日志
    static getAll(readyFn) {
        Logline._checkProtocol();
        Logline._protocol.all(logs => readyFn(logs));
    }

    // 清理日志
    static keep(daysToMaintain) {
        Logline._checkProtocol();
        Logline._protocol.keep(daysToMaintain);
        return this;
    }

    // 清空日志并删除数据库
    static clean() {
        Logline._checkProtocol();
        Logline._protocol.clean();
        return this;
    }

    // 选择一个日志协议
    static using(protocol, database) {
        // protocol unavailable is not allowed
        if (-1 === [IndexeddbLogger, WebsqlLogger, LocalstorageLogger].indexOf(protocol)) {
            util.throwError('specialfied protocol ' + (protocol ? (protocol + ' ') : '') + 'is not available');
        }

        // once protocol is selected, it shall not be changed during runtime
        if (Logline._protocol) {
            return this;
        }

        Logline.database(database || Logline._database);
        Logline._initProtocol(protocol);
        return this;
    }

    static database(name) {
        Logline._database = name;
    }
}

Logline.PROTOCOL = {
    INDEXEDDB: IndexeddbLogger,
    WEBSQL: WebsqlLogger,
    LOCALSTORAGE: LocalstorageLogger
};

module.exports = Logline;
