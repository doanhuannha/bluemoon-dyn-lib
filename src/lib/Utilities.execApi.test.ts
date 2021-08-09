import { execApiAsync, toggleLoadingPanel } from './Utilities.execApi';
import './Utilities'; 
import { cleanup } from '@testing-library/react';
import { exec } from 'child_process';
describe('test execApi', () => {
    class Response {
        private body: any;
        public ok: boolean;
        public status: number;

        constructor(body?: BodyInit, init?: ResponseInit) {
            this.body = body;
            this.ok = true;
            this.status = 200;
        }

        json() {
            return new Promise<any>(r => {
                r(JSON.parse(this.body));
            });
        }
        text() {
            return new Promise<string>(r => {
                r(this.body);
            });
        }
    };
    global.Response = Response as any;
    global.fetch = (url: RequestInfo, init?: RequestInit): Promise<any> => {
        if(url=='/fakeUrlFailed'){
            return new Promise<Response>((resolve, reject) => {
                const data  = {};
                const response = new Response(JSON.stringify(data));
                response.ok = false;
                response.status = 403;
                resolve(response);
            });
        }
        else{
            const pp = init.headers as Headers;
            const hh = {};
            pp.forEach((v,k)=>{
                hh[k] = v;
            });
            return new Promise<Response>((resolve, reject) => {
                const data  = {...init,...{headers:hh}, data: input};
                const response = new Response(JSON.stringify(data));
                resolve(response);
            });
        }
        
    };
    //*
    test('test CachedPool ', () => {
        const cacheData = {d1:'abc', d2: 321};
        const expired = new Date();
        expired.setTime(expired.getTime() + 1 * 1000);//1 second
        execApiAsync.CachedPool.set('my-data', cacheData, expired);
        let d = execApiAsync.CachedPool.get('my-data');
        expect(d).toEqual(cacheData);
        execApiAsync.CachedPool.del('my-data');

        d = execApiAsync.CachedPool.get('my-data');
        expect(d).toEqual(undefined);

        expired.setTime(new Date().getTime() - 1 * 1000);//set a time in the pass
        execApiAsync.CachedPool.set('my-data-expired', cacheData, expired);

        d = execApiAsync.CachedPool.get('my-data-expired');
        expect(d).toEqual(undefined);

    });
    
    test('test toggleLoadingPanel', () => {
        toggleLoadingPanel(true);
        let pn = document.getElementsByClassName('loading-panel')[0] as HTMLElement;
        expect(pn.style.display).toEqual('inline-block');
        toggleLoadingPanel(true);
        expect(pn.style.display).toEqual('inline-block');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('inline-block');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('none');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('none');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('none');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('none');
        toggleLoadingPanel(true);
        expect(pn.style.display).toEqual('inline-block');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('none');

        document.body.innerHTML = '';
        toggleLoadingPanel.panel = null;
        pn = document.createElement('div');
        pn.className = 'loading-spin';
        document.body.append(pn);

        pn = document.createElement('div');
        pn.className = 'loading-panel';
        pn.style.display = 'inline-block';
        document.body.append(pn);
        
        toggleLoadingPanel(true);
        expect(pn.style.display).toEqual('inline-block');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('inline-block');
        toggleLoadingPanel(false);
        expect(pn.style.display).toEqual('none');
    });
    
    test('test execApi GET', done => {
        let r = execApiAsync('/fakeUrl', { shouldCancel: true });
        expect(r).toEqual(null);

        r = execApiAsync('/fakeUrl', null);
        r.then(rr => rr.json()).then(d => {
            expect(d.method).toEqual('GET');
            done();
        });
    });
    test('test execApi GET, localData', done => {
        let r = execApiAsync('/fakeUrl', { shouldCancel: true });

        r = execApiAsync('/fakeUrl', {shouldCancel: true, localData: { d1: '00A'}});
        r.then(rr => rr.json()).then(d => {
            expect(d.d1).toEqual('00A');
            done();
        });
    });
    test('test execApi standard', done => {
        const data = { a: 1, b: 2 };
        let r = execApiAsync('/fakeUrl', data);
        r.then(rr => rr.json()).then(d => {
            expect(d.method).toEqual('POST');
            expect(d.body).toEqual(JSON.stringify(data));
            expect(d.headers['content-type']).toEqual('application/json');
            done();
        });
    });
    test('test execApi extended', done => {
        const data = { a: 1, b: 2 };
        let r = execApiAsync('/fakeUrl', {method: 'PUT', headers:{'Content-Type': 'app/data', 'my-header':'h1'}, body:data});
        r.then(rr => rr.json()).then(d => {
            expect(d.method).toEqual('PUT');
            expect(d.body).toEqual(JSON.stringify(data));
            expect(d.headers['content-type']).toEqual('app/data, application/json');
            expect(d.headers['my-header']).toEqual('h1');
            done();
        });
    });
    
    test('test execApi post string', done => {
        const data = 'my raw data';
        let r = execApiAsync('/fakeUrl', {body:data});
        r.then(rr => rr.json()).then(d => {
            expect(d.method).toEqual('POST');
            expect(d.body).toEqual(data);
            done();
        });
    });
    test('test execApi GET, cache', done => {
        let r = execApiAsync('/fakeUrl', null);
        
        r = execApiAsync('/fakeUrl', null);
        r.then(rr => rr.json()).then(d => {
            expect(d.method).toEqual('GET');
            done();
        });
    });
    test('test execApi GET, faied', done => {
        let r = execApiAsync('/fakeUrlFailed', null).catch(e=>{
            console.log(e);
            done();
        })
        
    });
    //*/
});
