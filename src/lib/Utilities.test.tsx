import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import './Utilities';
import { DataPool } from './DataPool';
import { DataStorage } from './DataStorage';

describe('test window.storage', () => {
    test('set data storage', ()=>{
        DataStorage.set = jest.fn();
        window.storage.set('abc', {});
        expect(DataStorage.set).toBeCalled();
    });
    test('get data storage', ()=>{
        DataStorage.get = jest.fn();
        window.storage.get('abc');
        expect(DataStorage.get).toBeCalled();
    });
});
describe('test window.timer', () => {
    test('test wait 1', done => {
        let vv = 0;
        window.timer.wait(() => {
            vv = 100;
            try {
                expect(vv).toEqual(100);
                done();
            } catch (error) {
                done(error);
            }

        });
        expect(vv).toEqual(0);

    });
    test('test wait 2', done => {
        let pp = {
            check: 0
        };
        window.timer.wait((p) => {
            p.check = 100;
            try {
                expect(p.check).toEqual(100);
                done();
            } catch (error) {
                done(error);
            }

        }, 20, pp);
        expect(pp.check).toEqual(0);

    });
    test('test cancel', () => {
        let vv = 0;
        let t = window.timer.wait(() => {
            vv = 100;
        }, 100);
        expect(vv).toEqual(0);
        window.timer.cancel(t);
        expect(vv).toEqual(0);


    });
    test('test cancel not monitor', done => {
        let vv = 0;

        let t = window.timer.wait(() => {
            vv = 100;
        }, 100);
        window.timer.oncancel = (id: number) => {
            try {
                expect(id).toEqual(t);
                done();

            } catch (error) {
                done(error);
            }

        };
        expect(vv).toEqual(0);
        window.timer.cancel(t);


    });
});
describe('test window.utilities', () => {
    describe('test parseJSON',()=>{
        let v = window.utilities.parseJSON('{"abc":1000, "xyz": "abc"}');
        expect(v).toEqual({abc:1000, xyz: 'abc'});
        v = window.utilities.parseJSON('{"abc":1000, "xyz": "abc\\\""}');
        expect(v).toEqual({abc:1000, xyz: 'abc"'});

        v = window.utilities.parseJSON('{abc:1000, xyz: "abc"}');
        expect(v).toEqual({abc:1000, xyz: 'abc'});

        v = window.utilities.parseJSON('{abc:1000, xyz: \'abc"\'}');
        expect(v).toEqual({abc:1000, xyz: 'abc"'});

        v = window.utilities.parseJSON('{abc:1000, xyz: \'abc\\\'\'}');
        expect(v).toEqual({abc:1000, xyz: 'abc\''});

        

    });
    describe('test setValue',()=>{
        test('set basic',()=>{
            const obj = {a: 'abc'} as any;
            window.utilities.setValue(obj,'f1', 1);
            expect(obj.f1).toEqual(1);
            expect(obj.a).toEqual('abc');

            window.utilities.setValue(obj,'a', 100);
            expect(obj.a).toEqual(100);
        });

        test('set nested',()=>{
            const obj = {b:{a:'abc'}} as any;
            window.utilities.setValue(obj,'f1.f2.f3', {abc:1});
            expect(obj.f1.f2.f3.abc).toEqual(1);
            expect(obj.b.a).toEqual('abc');

            window.utilities.setValue(obj,'f1.f2.f3.f4', 2);
            expect(obj.f1.f2.f3.f4).toEqual(2);
            expect(obj.b.a).toEqual('abc');

            window.utilities.setValue(obj,'b.a', 100);
            expect(obj.b.a).toEqual(100);
        });
    });
    describe('test extractValue',()=>{
        const ds = {
            level0: {
                level1: {
                    level2:{
                        level3:{    
                            data: 'lv3'
                        },
                        data: 'lv2'
                    },
                    data: 'lv1'
                },
                data: 'lv0'
            }
        };
        test('get basic',()=>{
            let r = window.utilities.extractValue(ds, 'level0');
            expect(r.data).toEqual('lv0');

            r = window.utilities.extractValue(null, 'level0');
            expect(r).toEqual(undefined);
        });
        test('get nested',()=>{
            let r = window.utilities.extractValue(ds, 'level0.level1');
            expect(r.data).toEqual('lv1');
            r = window.utilities.extractValue(ds, 'level0.level1.level2');
            expect(r.data).toEqual('lv2');
            r = window.utilities.extractValue(ds, 'level0.level1.level2.level3');
            expect(r.data).toEqual('lv3');
        });
    });
    describe('test _getParams', () => {
        let p = window.utilities._getParams('a=1');
        test('valid single parameter', () => {
            expect(p.a).toEqual('1');
        });
        p = window.utilities._getParams('a=1&b=1%202');
        test('valid parameters: normal character', () => {
            expect(p.a).toEqual('1');
        });
        test('valid parameters: special character', () => {
            expect(p.b).toEqual('1 2');
        });
        test('invalid parameters', () => {
            p = window.utilities._getParams('?abcde');
            expect(p.abcde).toEqual(null);
        });
    });
    test('test getHashParams', () => {
        window.location.hash = '#a=1&b=2';
        let r = window.utilities.getHashParams('a');
        expect(r).toEqual('1');
        r = window.utilities.getHashParams('b');
        expect(r).toEqual('2');

    });

    describe('test getQueryParams', () => {
        interface URLExt extends URL {
            replace: any,
            assign: any,
            ancestorOrigins: any,
            reload: any,
            navigation: any
        }
        let location: any;
        let mockLocation = new URL('https://example.com?a=1&b=1%202') as URLExt;
        beforeEach(() => {
            location = window.location;
            mockLocation.replace = jest.fn();
            mockLocation.assign = jest.fn();
            mockLocation.reload = jest.fn();
            mockLocation.ancestorOrigins = jest.fn();
            mockLocation.navigation = jest.fn();
            delete window.location;
            window.location = mockLocation;
        });

        afterEach(() => {
            window.location = location;
        });
        test('second parameter', () => {
            let r = window.utilities.getQueryParams('a');
            expect(r).toEqual('1');
            r = window.utilities.getQueryParams('b');
            expect(r).toEqual('1 2');
        });
    });

    test('test loadJs callback', () => {
        let a = { a: 7 };
        render(<h1>Hello Hell</h1>);
        window.utilities.loadJs('???', (b) => {
            b.a = 5;
        }, a);
        let s = document.getElementsByTagName('head')[0].firstElementChild as HTMLScriptElement;
        fireEvent.load(s, {});
        expect(a.a).toEqual(5);
    });
    describe('test resolveUrl', () => {
        test('with query string', () => {
            let raw = 'https://example.com/a.ashx?a=1';
            let r = window.utilities.resolveUrl(raw) as string;
            expect(r.indexOf('&t=') > 0).toEqual(true);
        });

        test('without query string', () => {
            let raw = 'https://example.com/a.ashx';
            let r = window.utilities.resolveUrl(raw) as string;
            expect(r.indexOf('?t=') > 0).toEqual(true);

        });
    });
    describe('test importFieldDefs', () => {
        test('import first field', () => {
            window.utilities.importFieldDefs({ field1: { type: 'f1', } });
            expect(DataPool.allFields.field1.type).toEqual('f1');
        });
        test('import second field', () => {
            window.utilities.importFieldDefs({ field2: { type: 'f2', } });
            expect(DataPool.allFields.field1.type).toEqual('f1');
            expect(DataPool.allFields.field2.type).toEqual('f2');
        });

    });

    describe('test importViewDefs', () => {
        test('import first view', () => {
            window.utilities.importViewDefs({ view1: { fields: [], dataApi: 'api1', submitApi: '' } });
            expect(DataPool.allViews.view1.dataApi).toEqual('api1');
        });
        test('import second field', () => {
            window.utilities.importViewDefs({ view2: { fields: [], dataApi: 'api2', submitApi: '' } });
            expect(DataPool.allViews.view1.dataApi).toEqual('api1');
            expect(DataPool.allViews.view2.dataApi).toEqual('api2');
        });

    });
    describe('test _isObject', () => {
        test('object is an object', () => {
            expect(window.utilities._isObject({})).toEqual(true);
        });
        test('object is not an object: number', () => {
            expect(window.utilities._isObject(1)).toEqual(false);
        });
        test('object is not an object: array', () => {
            expect(window.utilities._isObject([])).toEqual(false);
        });
        test('object is not an object: string', () => {
            expect(window.utilities._isObject('a')).toEqual(false);
        });
        test('object is not an object: bool', () => {
            expect(window.utilities._isObject(true)).toEqual(false);
        });
    });
    describe('test merge', () => {
        test('simple object', () => {
            let r = window.utilities.merge({ a: 1 }, { b: 1 }, { c: 1 });
            expect(r).toEqual({ a: 1, b: 1, c: 1 });
        });
        test('complex object 1', () => {
            let r = window.utilities.merge({ a: 1 }, { b: { c: 1 } },);
            expect(r).toEqual({ a: 1, b: { c: 1 } });
        });
        test('complex object 2', () => {
            let r = window.utilities.merge({ b: { c: 1 } }, { a: 1 });
            expect(r).toEqual({ a: 1, b: { c: 1 } });
        });
        test('param 1 is not an object', () => {
            let r = window.utilities.merge(1, { a: 1 });
            expect(r).toEqual(1);
        });
        test('param 2 is not an object', () => {
            let r = window.utilities.merge({ a: 1 }, 1);
            expect(r).toEqual({ a: 1 });
        });
        test('two objects with same keys', () => {
            let r = window.utilities.merge({ a: 1, b: true }, { a: '2' });
            expect(r).toEqual({ a: '2', b: true });
        });
        test('two objects with same keys, param 1 is an object, param 2 isnt', () => {
            let r = window.utilities.merge({ a: { c: 1 }, b: true }, { a: 1 });
            expect(r).toEqual({ a: 1, b: true });
        });

        test('two objects with same keys, param 2 is an object, param 1 isnt', () => {
            let r = window.utilities.merge({ a: 1, b: true }, { a: { c: 1 } });
            expect(r).toEqual({ a: { c: 1 }, b: true });
        });
        test('two objects with same keys, param 1, 2 is an object', () => {
            let r = window.utilities.merge({ a: { d: 1 }, b: true }, { a: { c: 1, d: { e: 1 } } });
            expect(r).toEqual({ a: { d: { e: 1 }, c: 1 }, b: true });
            r = {};
            r = window.utilities.merge(r, { a: 1, b: { c: 2 } });
            r = window.utilities.merge(r, { d: 1, b: { e: 3 } });
            expect(r).toEqual({ a: 1, b: { c: 2, e: 3 }, d: 1 });
        });
        test('join objects key, keep sibling attributes', () => {
            let r = {};
            r = window.utilities.merge(r, { a: 1, b: { c: 2, f: 'f' } });
            r = window.utilities.merge(r, { d: 1, b: { e: 3 } });
            expect(r).toEqual({ a: 1, b: { c: 2, e: 3, f: 'f'}, d: 1 });
        });
        test('join arrays', () => {
            const v1 = { b: '1', c: { c1: '1', c2: '2', c3: ['aa', 'cc'] } };
            const v2 = { a: 'b', b: 'c', c: { c1: { c11: '2' }, c3: [{c31:'31'}, 'bb'] } };
            const v3 = { c: {  c3: 'dd' } };
            let r = window.utilities.merge({}, v1, v2, v3);
            expect(r).toEqual({ a: 'b', b: 'c', c: { c1: { c11: '2' }, c2: '2', c3: ['aa','cc', {c31:'31'}, 'bb', 'dd'] } });
        });

    });
    describe('test loadComp', () => {
        let compText = 'Hello World';
        const MyTestC = () => {
            return <span>{compText}</span>
        };
        test('load into element id', () => {
            let el = document.createElement('div');
            el.id = 'cidContainer';
            document.body.appendChild(el);
            window.utilities.loadComp(el.id, MyTestC, null);
            let div = el.getElementsByTagName('span')[0];
            expect(div.innerHTML).toEqual(compText);
        });
        test('load into element', () => {
            let el = document.createElement('div');
            window.utilities.loadComp(el, MyTestC, null);
            let div = el.getElementsByTagName('span')[0];
            expect(div.innerHTML).toEqual(compText);
        });

        test('load into null', () => {
            let r = window.utilities.loadComp(null, MyTestC, null)
            expect(r).toEqual(false);
        });
    });
    describe('test loadComp', () => {
        test('test waitFor', done => {
            let r = {
                check: new Date().getTime(),
                count: 0,
                lastCheck: null as any
            };
            window.utilities.waitFor((p) => {
                p.lastCheck = new Date().getTime();
                return (p.lastCheck - p.check) > 10;
            }, (p) => {
                p.count++;
                try {
                    expect(p.count).toEqual(1);
                    done();
                } catch (error) {
                    done(error);
                }


            }, r);
            expect(r.count).toEqual(0);


        });
    });
});

