import { execApiAsync } from './Utilities.execApi';
import './Utilities'; 
describe('test execApi', () => {
    class Response {
        private body: string;
        constructor(s: string) {
            this.body = s;
        }
        text() {
            return new Promise<any>((r) => {
                (r(this.body))
            });
        }
        json() {
            return new Promise<any>((r) => {
                (r(JSON.parse(this.body)))
            });
        }
    };
    global.fetch = (input: RequestInfo, init?: RequestInit): Promise<any> => {
        const url = input as string;
        const pp = init.headers as Headers;
        const hh = {};
        pp.forEach((v,k)=>{
            hh[k] = v;
        });
        return new Promise<Response>((resolve, reject) => {
            const response = new Response(JSON.stringify({...init,...{headers:hh}}));
            resolve(response);
        });
    };
    
    
    test('test execApi GET', done => {
        let r = execApiAsync('/fakeUrl', { shouldCancel: true });
        expect(r).toEqual(null);
        r = execApiAsync('/fakeUrl', null);
        r.then(rr => rr.json()).then(d => {
            expect(d.method).toEqual('GET');
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
            expect(d.headers['content-type']).toEqual('app/data');
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

    //r.then()
    //expect(r)
});
