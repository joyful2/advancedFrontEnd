export default class Service {
    // handle只允许添加 preProcess 和 process.
    // handle添加的process||preProcess 分为两种：一种全局的，指定对象名为GLOBAL，另外一种是对象名。
    // 下属属性可分别指定对应的process或preProcess.
    // 全局有最高的优先级（todo: 调整优先级），
    // 优先级： 全局 > 通过handle指定的单个对象的属性 > 单个api中指定的属性（process||preProcess）

    // preProcess中关于只能使用最终的格式，即post接口中body相关字段。不能再在外部声明，默认不做二次调整。（todo）
    //ui层
    //service 中间层
    //后台服务器


    constructor(config, baseUrl = '', handle = {}) {
        const keys = Object.keys(config);
        const { globalPreProcesses, globalProcesses, newHandle } = this.setHandle(handle, true);
        this.globalPreProcesses = globalPreProcesses;
        this.globalProcesses = globalProcesses;
        this.handle = newHandle || {};

        keys.forEach((key) => {
            this[key] = (options = {}) => {
                options = this._getOptions(options, config[key]);
                const { method, path, query, body, fetch, dataType, mock, process, preProcess } = options;
                let urlPath = path;

                const preProcesses = [].concat(this.globalPreProcesses, this.handle[key] && this.handle[key].preProcess, preProcess).filter((item) => item);
                const processes = [].concat(this.globalProcesses, this.handle[key] && this.handle[key].process, process).filter((item) => item);

                preProcesses.length && preProcesses.forEach((func) => options = func(options));

                // 第二次做url中的变量替换
                urlPath = this._replacePath(path, options, false);

                if (mock)
                    return Promise.resolve(mock).then((result) => {
                        processes.forEach((func) => result = func(result));
                        return result;
                    });

                if ((method === 'post' || method === 'delete' || method === 'put') && query)
                    urlPath += '?' + this._serialize(query);

                if (options.download)
                    return window.open(baseUrl + urlPath + '?' + this._serialize(query));

                return request[method](baseUrl + urlPath, body || query, dataType || 'json', Object.assign({
                    headers: Object.assign({}, getHeaders(), options.headers), // 支持在 preProcesses 阶段统一操作 headers
                    noAlert: options.noAlert || false,
                }, fetch)).then((result) => {
                    processes.forEach((func) => result = func(result));
                    return result;
                });
            };
        });
    }

    setHandle(handle = {}, isInit = false) {
        const globalPreProcesses = [];
        const globalProcesses = [];
        const newHandle = {};

        // 指定的 preProcess || process 统一成数组，方便后续处理
        const toArray = (param) => Array.isArray(param) ? param : [param];

        Object.keys(handle).forEach((item) => {
            const value = handle[item];
            const [preProcess, process] = at(value || {}, ['preProcess', 'process']);
            if (!value)
                return;

            if (item === 'GLOBAL') {
                preProcess && globalPreProcesses.push(...toArray(preProcess));
                process && globalProcesses.push(...toArray(process));
            } else {
                newHandle[item] = {
                    preProcess: [],
                    process: [],
                };
                preProcess && newHandle[item].preProcess.push(...toArray(preProcess));
                process && newHandle[item].process.push(...toArray(process));
            }
        });

        if (!isInit) {
            // console.log('you have a ');
            this.globalPreProcesses.push(...globalPreProcesses);
            this.globalProcesses.push(...globalProcesses);
            Object.keys(newHandle).forEach((item) => {
                const value = newHandle[item];
                this.handle[item] = {
                    preProcess: [],
                    process: [],
                };

                value.preProcess.length && this.handle[item].preProcess.push(...value.preProcess);
                value.process.length && this.handle[item].process.push(...value.process);
            });
        } else {
            return { globalPreProcesses, globalProcesses, newHandle };
        }
    }

    /**
     *
     *
     * @param {*} path 路径（需要替换对应的字段）
     * @param {*} options 参数
     * @param {boolean} [isFirst=true] 是否是第一次替换(第二次替换是在preProcess之后替换)
     * @returns
     * @memberof Service
     */
    _replacePath(path, options, isFirst = true) {
        return path ? path.replace(/\{(.*?)\}/g, (match, key) => {
            const value = (options.params && options.params[key]) || options[key];

            if (isFirst) {
                value !== undefined && delete options[key];
                // 如果没有定义对应的变量，则不做处理，第二次变量替换时处理
                return value === undefined ? match : value;
            } else {
                // 此时path如果存在为undefined的变量,报错
                if (value === undefined)
                    throw new Error(`请指定path：${path}中${key}对应的字段值`);
                delete options[key];
                return value;
            }
        }) : '';
    }

    /**
     *
     *
     * @param {*} [options={}]
     * @param {*} [apiOptions={}]
     * @returns
     * @memberof Service
     * @description path的替换也直接做了
     */
    _getOptions(options = {}, apiOptions = {}) {
        // params表示path当中需要替换的字段汇聚成的对象，如果有部分参数没有被替换，直接被废除，不做他用
        const KEYWORDS = ['path', 'params', 'headers', 'query', 'body', 'fetch', 'method', 'dataType', 'noAlert', 'mock', 'preProcess', 'process', 'download'];
        const newOptions = Object.assign({ method: 'get' }, apiOptions, options);
        // 为body的情况可能有两种,put || post
        const subKey = newOptions.method === 'get' ? 'query' : 'body';
        !newOptions[subKey] && (newOptions[subKey] = {});
        if (options.query && apiOptions.query) {
            Object.assign(newOptions.query, apiOptions.query, options.query);
        }
        if (newOptions.action && newOptions.version) {
            newOptions.query = newOptions.query || {};
            newOptions.query.Action = newOptions.action;
            newOptions.query.Version = newOptions.version;
            delete newOptions.action;
            delete newOptions.version;
        }

        // 第一次做url中的变量替换
        newOptions.path = this._replacePath(newOptions.path, newOptions);

        for (const key in newOptions) {
            if (!KEYWORDS.includes(key)) {
                newOptions[subKey][key] = newOptions[key];
                delete newOptions[key];
            }
        }

        // 没有query || body设置[为普通对象时，无属性]，直接删掉
        if (!Object.keys(newOptions[subKey]).length && !(newOptions[subKey] instanceof FormData))
            delete newOptions[subKey];

        return newOptions;
    }

    _serialize(obj) {
        if (!(obj instanceof Object))
            return obj;

        const pairs = [];
        for (const key in obj)
            this._pushEncodedKeyValuePair(pairs, key, obj[key]);

        return pairs.join('&');
    }

    _pushEncodedKeyValuePair(pairs, key, val) {
        if (val !== null && val !== undefined) {
            if (Array.isArray(val)) {
                val.forEach((v) => {
                    this._pushEncodedKeyValuePair(pairs, key, v);
                });
            } else if (val instanceof Object) {
                for (const subkey in val)
                    this._pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
            } else
                pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
        } else if (val === null)
            pairs.push(encodeURIComponent(key));
    }
}

//使用
// import Service from '@/services';

// const ingressService = {
//     getDetail: {
//         method: 'get',
//         path: '/getDetail',
//     },
//     getList: {
//         method: 'get',
//         path: '/getList',
//     },
//     createIngress: {
//         method: 'post',
//         path: '/createIngress',
//     },
//     updateIngress: {
//         method: 'put',
//         path: '/updateIngress',
//     },
//     deleteIngress: {
//         method: 'delete',
//         path: '/deleteIngress',
//     },
// };
// 因为我们的接口相对来说比较一致，所以我们写了个 Service 类，只需要传入上面ingressService这种配置，再加一个前缀即可。
// const service = new Service(ingressService, '/api/ingress');

// export default service;