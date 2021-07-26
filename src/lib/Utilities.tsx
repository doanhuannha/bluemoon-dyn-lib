import React from 'react';
import { View } from './View';
import { IFieldItem, IViewItem, IViewProps, KeyPair, RuleOption, ValidatorRule } from './Defs';
import { DynConfig } from './DynConfig';
import { DataPool } from './DataPool';
import { DataStorage } from './DataStorage';

type RemoteOptions = {
    url: string,
    method: string,
    headers: [
        {
            name: string,
            value: string
        }
    ]
}
window.utilities = {
    getDefault: function (val: any, defaultValue: any): any {
        if (val == null) return defaultValue;
        else return val;
    },
    parseJSON: function (json: string): any {
        try {
            return JSON.parse(json);
        } catch (error) {
            return new Function('return ' + json.replace(/\r/ig, ' ').replace(/\n/ig, ' ') + ';')();
        }
    },
    setValue: function (obj: any, field: string, val: any): void {
        const pos = field.indexOf('.');
        if (pos > 0) {
            let ff = field.substr(0, pos);
            if (obj[ff] == null || obj[ff] == undefined) obj[ff] = {};
            this.setValue(obj[ff], field.substr(pos + 1), val);
        }
        else obj[field] = val;
    },
    extractValue: function (val: any, field: string): any {
        if (val == null || val == undefined) return val;
        const pos = field.indexOf('.');

        if (pos > 0)
            return this.extractValue(val[field.substr(0, pos)], field.substr(pos + 1));
        else
            return val[field];
    },
    _getParams: function (v: string): KeyPair {
        return (v.match(new RegExp('([^?=&]+)(=([^&]*))?', 'g')))
            .reduce(function (result: KeyPair, each, n, every) {
                let [key, value] = each.split('=');
                result[key] = value ? unescape(value) : null;
                return result;
            }, {});
    },
    getHashParams: function (k: string): string {
        if (!this._hashParams) {
            let v = window.location.hash;
            v = v.replace('#', '');
            this._hashParams = this._getParams(v);
        }
        return this._hashParams[k];
    },
    getQueryParams: function (k: string): string {
        if (!this._queryParams) {
            let v = window.location.href;
            v = v.substr(v.indexOf('?') + 1);
            this._queryParams = this._getParams(v)
        }
        return this._queryParams[k];
    },
    loadJs: function (url: string, callback: (arg?: any) => void, callbackArg?: any): void {
        var e = document.createElement('script');
        e.src = url;
        e.type = 'text/javascript';
        e.setAttribute('callbackArg', callbackArg);
        e.addEventListener('load', () => {
            callback(callbackArg);
        });
        document.getElementsByTagName('head')[0].appendChild(e);
    },
    resolveUrl: function (url: string): string {
        return url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + new Date().getTime();
    },
    importFieldDefs: function (fields: IFieldItem): void {
        if (DataPool.allFields == null) DataPool.allFields = {};
        DataPool.allFields = {
            ...DataPool.allFields,
            ...fields
        }
    },
    importViewDefs: function (views: IViewItem): void {
        if (DataPool.allViews == null) DataPool.allViews = {};
        DataPool.allViews = {
            ...DataPool.allViews,
            ...views
        }
    },
    loadView: function (possibleContainer: string | Element, viewProps: IViewProps): boolean {
        let container = null;
        if (typeof possibleContainer == 'string') container = document.getElementById(possibleContainer);
        else container = possibleContainer;

        if (container == null) return false;
        DynConfig.appDOM.render(<View key={'vk' + viewProps.name} {...viewProps} />, container);
        return true;
    },
    loadComp: function (possibleContainer: string | Element | null, comp: any, parameters: any): boolean {
        let container = null;
        if (typeof possibleContainer == 'string') container = document.getElementById(possibleContainer);
        else container = possibleContainer;

        if (container == null) return false;
        let Comp = comp;
        DynConfig.appDOM.render(<Comp key={'ck' + new Date().getTime()} {...parameters} />, container);
        return true;
    },
    _isObject: function (item: any): boolean {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },
    merge: function (target: any, ...sources: any[]): any {
        if (!target) target = {};
        if (!sources.length) return target;
        const source = sources.shift();

        if (this._isObject(target) && this._isObject(source)) {
            for (const key in source) {
                if (this._isObject(source[key])) {
                    if (!target[key]) target[key] = {};
                    if (this._isObject(target[key])) this.merge(target[key], source[key]);
                    else target[key] = source[key];
                } else {
                    target[key] = source[key];
                }
            }
        }
        return this.merge(target, ...sources);
    },
    waitFor: function (check: (p?: any) => boolean, callback: (p?: any) => void, arg?: any): void {
        new Promise((next: (n: { callback: (p: any) => void, arg: any }) => void, reject: (r: { check: (p: any) => boolean, callback: (p: any) => void, arg: any }) => void) => {
            if (check(arg)) next({ callback, arg });
            else reject({ check, callback, arg });

        }).then((n) => {
            n.callback(n.arg);
        }).catch((r) => {
            this.waitFor(r.check, r.callback, r.arg);
        });
    }

};


window.validator = {
    validate: function (n: string, o: string, rules: ValidatorRule[], ctx: any): string {
        let msg = null;
        for (let r of rules) {
            let opt = r.options || {};
            opt.msg = r.msg;
            msg = this.registeredRules[r.rule](n, o, opt);
            if (msg != null) break;
        }
        return msg as string;
    },
    registerRule: function (r: string, f: (n: string, o: string, opt: { msg: string } | any) => string): void {
        this.registeredRules[r] = f;
    },
    isEmpty: function (v: string): boolean {
        if (Array.isArray(v) && v.length == 0) return true;
        return (!v || v === '');
    },
    registeredRules: {


        required: function (n: string, o: string, opt: RuleOption): string {
            if (window.validator.isEmpty(n)) return opt.msg;
            else return null;
        },
        minLength: function (n: string, o: string, opt: RuleOption & { minLength: number }): string {
            if (window.validator.isEmpty(n)) return null;
            if (n.length < opt.minLength) return opt.msg;
            else return null;
        },
        maxLength: function (n: string, o: string, opt: RuleOption & { maxLength: number }): string {
            if (window.validator.isEmpty(n)) return null;
            if (n.length > opt.maxLength) return opt.msg;
            else return null;
        },
        min: function (n: string, o: string, opt: RuleOption & { min: number }): string {
            if (window.validator.isEmpty(n)) return null;
            if (parseFloat(n) < opt.minValue) return opt.msg;
            else return null;
        },
        max: function (n: string, o: string, opt: RuleOption & { max: number }): string {
            if (window.validator.isEmpty(n)) return null;
            if (parseFloat(n) > opt.maxValue) return opt.msg;
            else return null;
        },
        regExp: function (n: string, o: string, opt: RuleOption & { pattern: string }): string {
            if (window.validator.isEmpty(n)) return null;
            if (!new RegExp('^' + opt.pattern + '$').test(n)) return opt.msg;
            else return null;
        },
        email: function (n: string, o: string, opt: RuleOption): string {
            opt.pattern = '[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*';
            return this.regExp(n, o, opt) as string;
        },
        url: function (n: string, o: string, opt: RuleOption): string {
            opt.pattern = '(?:(?:(?:https?|ftp):)?\/\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})).?)(?::\\d{2,5})?(?:[/?#]\\S*)?';
            return this.regExp(n, o, opt) as string;
        },
        digits: function (n: string, o: string, opt: RuleOption): string {
            opt.pattern = '\\d+';
            return this.regExp(n, o, opt) as string;
        },
        number: function (n: string, o: string, opt: RuleOption): string {
            opt.pattern = '(?:-?\\d+|-?\\d{1,3}(?:,\\d{3})+)?(?:\\.\\d+)?';
            return this.regExp(n, o, opt) as string;
        },
        date: function (n: string, o: string, opt: RuleOption): string {
            if (window.validator.isEmpty(n)) return null;
            if (/Invalid|NaN/.test(new Date(n).toString())) return opt.msg;
            else return null;
        },
        remote: function (n: string, o: string, opt: RuleOption & RemoteOptions): string {
            if (window.validator.isEmpty(n)) return null;
            opt.method = opt.method || 'POST';

            let ajax = new XMLHttpRequest();
            ajax.open(opt.method, opt.url, false);
            ajax.setRequestHeader('Accept', 'application/json');
            ajax.setRequestHeader('Content-Type', 'application/json');
            if (opt.headers)
                for (let h of opt.headers) {
                    ajax.setRequestHeader(h.name, h.value);
                }
            let valid = false;
            ajax.onreadystatechange = function (evt: Event) {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    valid = JSON.parse(this.responseXML.textContent);
                }
            }
            ajax.send(JSON.stringify({
                value: n,
                oldValue: o
            }));
            if (!valid) return opt.msg;
            else return null;
        },
        custom: function (n: string, o: string, opt: RuleOption): string {
            if (window.validator.isEmpty(n)) return null;
            if (!opt.validate(n,o)) return opt.msg;
            else return null;
        }
    }
};

type TimerInstance = {
    id: number,
    canceled: boolean,
    param: any,
    start: number
}
window.timer = {
    _instances: {} as TimerInstance,
    wait: function (action: (arg?: any) => void, ms: number = 10, arg?: any): number {
        let id = parseInt(new Date().getTime() + '' + Object.keys(this._instances).length);
        let sId = 'S' + id;
        this._instances[sId] = {
            id: id,
            canceled: false,
            param: arg,
            start: new Date().getTime()
        };
        new Promise((resolve) => {
            resolve(this._instances[sId]);
        }).then((arg: TimerInstance) => {
            let now = 0;
            do {
                now = new Date().getTime();
            } while (now - arg.start <= ms && !arg.canceled);
            if (!arg.canceled) {
                action(arg.param);

            } else if (this.oncancel) this.oncancel(arg.id);
        });
        return id;
    },
    cancel: function (id: number): void {
        let sId = 'S' + id;
        this._instances[sId].canceled = true;
    },
    oncancel: null as (id: number) => void
};
window.storage = {
    get: function (name: string) {
        return DataStorage.get(name);
    },
    set: function (name: string, value: any) {
        DataStorage.set(name, value);
    }
};


/*
type PostData = {
    headers: { [name: string]: string }
    body: any,
    method: string,
    shouldCancel: boolean
};
*/
export const execApiAsync = function (url: string, requestData: any, recalled?: boolean): Promise<Response> {
    if (requestData && requestData.shouldCancel === true){
        return new Promise<Response>((resolve, reject) => {
            console.log('return local data if any and cancel call api:' + url);
            const response = new Response(JSON.stringify(requestData.localData == undefined ? null : requestData.localData));
            resolve(response);
        });;
    }
    else {
        if (!recalled) toggleLoadingPanel(true);
        const cachedName = JSON.stringify({ url, requestData });
        const cachedData = execApiAsync.CachedPool.get(cachedName);
        if (cachedData) {
            if (cachedData.execApiAsyncState === 'processing') {
                return new Promise<Response>((resolve, reject) => {
                    setTimeout(() => {
                        reject(null);
                    }, 5);

                }).catch(d => {
                    return execApiAsync(url, requestData, true);

                });
            }
            else return new Promise<Response>((resolve, reject) => {
                console.log('load from cache:' + url);
                const response = new Response(cachedData);
                resolve(response);
                toggleLoadingPanel(false);
            });
        }
        const expired = new Date();
        expired.setTime(expired.getTime() + 1 * 60000);// wait for 1 minute, then request URL
        if (DynConfig.apiCache) execApiAsync.CachedPool.set(cachedName, { execApiAsyncState: 'processing' }, expired);
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        let method = 'GET';
        if (requestData) {
            if (requestData.body) {
                let customRequestConfig = null as { method?: string, headers?: { [name: string]: string }, body: any }
                customRequestConfig = {
                    method: requestData.method,
                    headers: requestData.headers,
                    body: requestData.body
                }
                if (customRequestConfig.headers) for (let h in customRequestConfig.headers) {
                    headers.append(h, customRequestConfig.headers[h]);
                }
                requestData = customRequestConfig.body;
                if (requestData) {
                    method = customRequestConfig.method || 'POST';
                    if (typeof requestData != 'string') if (!(requestData instanceof FormData)) {
                        headers.append('Content-Type', 'application/json');
                        requestData = JSON.stringify(requestData);
                    }
                }


            }
            else {
                method = 'POST';
                if (!(requestData instanceof FormData)) {
                    headers.append('Content-Type', 'application/json');
                    requestData = JSON.stringify(requestData);
                }

            }
        }
        return fetch(window.utilities.resolveUrl(url), {
            method,
            body: requestData,
            headers: headers
        }).then(res => {
            return res.text().then(s => {
                const expired = new Date();
                expired.setTime(expired.getTime() + 5000);//cache 5 seconds
                if (DynConfig.apiCache) execApiAsync.CachedPool.set(cachedName, s, expired);
                return new Promise<Response>((resolve, reject) => {
                    resolve(new Response(s));
                    toggleLoadingPanel(false);
                });
            }).catch(r => {
                return new Promise<Response>((resolve, reject) => {
                    reject(r);
                    toggleLoadingPanel(false);
                });
            });

        });
    }
    
};
execApiAsync.CachedPool = {
    caches: {} as { [name: string]: { data: any, expired: Date } },
    set: function (name: string, data: any, expired: Date) {
        this.cleanup();
        this.caches[name] = { data, expired };
    },
    get: function (name: string) {
        this.cleanup();
        return this.caches[name]?.data;
    },
    cleanup: function () {
        for (const name in this.caches) if (this.caches[name].expired < new Date()) delete this.caches[name];
    }
};

//toggleLoadingPanel.toggleCnt = 0;
const toggleLoadingPanel = window.toggleLoadingPanel || function (visible: boolean) {

    let panel = toggleLoadingPanel.panel;
    if (!panel) {
        //search for existing html element
        panel = document.getElementsByClassName('loading-panel')[0];
        if (panel) {
            panel.spin = document.getElementsByClassName('loading-spin')[0];
            panel.shownCnt = 1;
            //console.log('init..' + visible + ', show count:' + panel.shownCnt);
        }
        else {
            panel = document.createElement('div');

            panel.spin = document.createElement('div');
            //<style>@keyframes spin360 { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }</style>
            const dynamicStyles = document.createElement('style');
            document.head.appendChild(dynamicStyles);
            dynamicStyles.sheet.insertRule('@keyframes spin360 { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }', 0);
            panel.shownCnt = 0;

        }
        toggleLoadingPanel.panel = panel;

        panel.className = 'loading-panel';


        const style = panel.style;
        style.zIndex = '9999';
        style.opacity = 0.5;
        style.position = 'fixed';
        style.width = '100%';
        style.height = '100%';
        style.backgroundColor = '#CCC';

        const spin = panel.spin;
        spin.innerHTML = '֎';
        spin.className = 'loading-spin';
        spin.style.animation = 'spin360 4s linear infinite';
        spin.style.fontSize = '3em';
        spin.style.position = 'fixed';
        spin.style.left = '50%';
        spin.style.top = '30%';
        spin.style.zIndex = '99999';

        document.body.insertBefore(panel, document.body.firstChild);
        document.body.insertBefore(spin, document.body.firstChild);

    }
    if (panel.shownCnt > 0) panel.shownCnt += visible ? 0 : -1;
    //console.log('from lib loading..' + visible + ', show count:' + panel.shownCnt +' at ' + new Date().getTime());
    if (panel.shownCnt === 0) {
        panel.spin.style.display = panel.style.display = visible ? 'inline-block' : 'none';
        if (visible) {
            panel.orgOverflow = document.body.style.overflow || 'initial';
            document.body.style.overflow = 'hidden';
        }
        else {
            if (panel.orgOverflow) {
                document.body.style.overflow = panel.orgOverflow;
                panel.orgOverflow = null;
            }
        }
    }
    panel.shownCnt += visible ? 1 : 0;
} as any;
