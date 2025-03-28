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
    ...window.utilities,
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
            if (obj[ff] == null) obj[ff] = {};
            this.setValue(obj[ff], field.substr(pos + 1), val);
        }
        else obj[field] = val;
    },
    extractValue: function (val: any, field: string): any {
        if (val == null) return undefined;
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
        e.src = this.resolveUrl(url);
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
    _mergeVal: function (val1: any, val2: any): any {
        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (val2[0]['_replace'] === true) {
                val2.splice(0, 1);
                return val2;
            }
            else return [...val1, ...val2];
        }
        else if (Array.isArray(val1)) return [...val1, val2];
        else return val2;
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
                    else target[key] = this._mergeVal(target[key], source[key]);
                }
                else target[key] = this._mergeVal(target[key], source[key]);
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
            if (!opt.validate(n, o)) return opt.msg;
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



