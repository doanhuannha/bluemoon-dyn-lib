import React from "react";
type Storage = {
    value: any,
    comps: (React.Component | React.Dispatch<any>)[]
};
type Stores = {
    [key: string]: Storage
};
export const DataStorage = {
    _storages: {} as Stores,
    set: function (storeName: string, value: any): boolean {
        
        let storage = this._storages[storeName] as Storage;
        if (storage) {
            storage.value = value;
            storage.comps.map((e) => {
                if (typeof (e) === 'function') {
                    e({}); 
                }
                else e.forceUpdate();
            });
            return true;
        }
        else return false;
    },
    update: function (storeName: string, value: any): boolean {
        
        let curVal = this.get(storeName) || {};
        window.utilities.merge(curVal, value);
        return this.set(storeName, curVal);
    },
    get: function (storeName: string): any {
        if (this._storages[storeName]) return this._storages[storeName].value;
        else return null;
    },
    delete: function(storeName: string):boolean{
        if (this._storages[storeName]) {
            delete this._storages[storeName];
            return true;
        }
        else return false;
    },
    register: function (storeName: string, comp?: React.Component | React.Dispatch<any>): boolean {
        if (!this._storages[storeName]) this._storages[storeName] = { value: null, comps: [] };
        if (comp != null) {
            let comps = this._storages[storeName].comps;
            let notExist = true;
            for (let i = 0; i < comps.length; i++) {
                if (comps[i] === comp) {
                    notExist = false;
                    break;
                }
            }
            if(notExist) comps.push(comp);
            return true;
        }
        return false;
    },
    unregister: function (storeName: string, comp?: React.Component | React.Dispatch<any>): boolean{
        if (!this._storages[storeName]) return false;
        if (comp != null) {
            let comps = this._storages[storeName].comps;
            let i = 0
            for (i = 0; i < comps.length; i++) {
                if (comps[i] === comp) {
                    break;
                }
            }
            if(i<comps.length) {
                comps.splice(i,1);
                return true;
            }
            else return false;
        }
        return false;
    },
    
} as {
    set: (storeName: string, value: any) => boolean,
    update: (storeName: string, value: any) => boolean,
    get: (storeName: string) => any,
    delete: (storeName: string) => boolean,
    register: (storeName: string, comp?: React.Component | React.Dispatch<any>) => boolean,
    unregister: (storeName: string, comp?: React.Component | React.Dispatch<any>) => boolean,
    [k: string]: any
}