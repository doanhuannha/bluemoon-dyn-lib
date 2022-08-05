import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { BaseComponent } from './BaseComponent';
import { DynConfig } from './DynConfig';
import './Utilities.tsx';
import { View } from './View';
import { FlowLayout } from './Layouts';
import { IViewProps, IViewState, IComponentProps, IComponentState } from './Defs';
describe('test view', () => {
    window.alert = jest.fn();
    window.utilities.loadJs = function (url: string, callback: (arg: any) => void, cArg: any) {
        new Promise((resolve) => {
            window.utilities.importViewDefs({
                viewAB: {
                    fields: [{
                        name: 'fieldA',
                        label: 'fieldAB'
                    }]
                }
            });
            resolve(cArg);
        }).then((p) => {
            callback(p);
        });


    };
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
    
    
    
    
    
    
    
    const ut = require('./Utilities.execApi');
    
    ut.execApiAsync = function (url: string, postData: any, recalled?: boolean): Promise<Response> {
        let result = '';
        if (url.startsWith('/fakeTpl_error')) {
            postData = {
                shouldRaiseEror: true
            }
        }
        else if (url.startsWith('/fakeData_null')) {
            result = 'null';
        }

        else if (url.startsWith('/fakeTpl')) {
            result = '<div class="url-template"><div field-name="fieldA"></div><div field-name="fieldBA">fieldBA</div></div>';
        }
        else if (url.startsWith('/fakeData1')) {
            result = '{"df":{"f1":"vvv01","f2":"vvv02"}}';
        }
        else if (url.startsWith('/fakeData')) {
            result = '{"f1":"vvv01","f2":"vvv02"}';
        }
        else if (url.startsWith('/submitData')) {
            if (onSubmitHandler) onSubmitHandler();
            result = 'true';
        }
        return new Promise<Response>((resolve, reject) => {
            if (postData?.shouldRaiseEror) reject('Invalid request');
            else {
                const response = new Response(result);
                resolve(response);
            }


        });
    };
    const ut1 = require('./Utilities.debug');
    let msg = null as any;
    ut1._debug = jest.fn((s: any) => {
        msg = s;
    });
    class MyComp extends BaseComponent {
        protected renderComponent(): React.ReactNode {
            return (<>
                <label>{this.props.label}</label>
                <span>{this.state.value}</span>
                <span>{this.state.readonly?'READONLY':'NORMAL'}</span>
            </>);
        }


    }
    DynConfig.exportControls({
        'mycomp': MyComp
    });
    DynConfig.exportLayouts({
        'flowlayout': FlowLayout
    });
    window.utilities.importFieldDefs({
        fieldA: {
            type: 'mycomp',
            label: 'Field 1',
            dataField: 'f1',
            validationFunc: (s, n) => {
                if (n !== 'vvv01') return 'Invalid value';
                else return null;
            }
        },
        fieldB: {
            type: 'mycomp',
            label: 'Field 2',
            dataField: 'f2',

        }
    });
    window.utilities.importViewDefs({
        viewA: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }]
        },
        viewX: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            },
            {
                name: 'fieldC'
            }]
        },
        viewB: {
            fields: null
        },
        viewT: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }],
            layout:{
                name: 'htmllayout',
                options: {
                    templateUrl: '/fakeTpl'
                }
            },
            
            dataApi: '/fakeData',
            submitApi: '/submitData'
        },
        viewZ: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }],
            dataApi: '/fakeData',
            dataApiParamsFunc: () => {
                return {}
            }

        },
        viewZZ: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }],
            dataApi: '/fakeData_null'
        },
        viewTT: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }],
            layout:{
                name: 'htmllayout',
                options: {
                    templateUrl: '/fakeTpl_error'
                }
            }
            
        },
        viewL: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }],
            layout: {
                name: 'flowlayout',
                options: {
                    className: 'cc1'
                }
            }
        },
        viewZA: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }],
            dataApi: '/fakeData1',
            dataField: 'df'

        },
        viewZB: {
            fields: [{
                name: 'fieldA'
            },
            {
                name: 'fieldB'
            }],
            dataField: 'df'

        },
    });
    let onSubmitHandler = null as () => void;
    
    test('load invalid view', done => {
        let el = null as HTMLElement;
        //render invalid view, then request the view succesfully
        let r = render(<View id="cidViewContainer" name="viewAB" />);
        let timer = {
            check: new Date().getTime(),
            lastCheck: null as any,
            pp: r
        };
        window.utilities.waitFor((p) => {
            p.lastCheck = new Date().getTime();
            return (p.lastCheck - p.check) > 10;
        }, (p) => {
            try {
                el = p.pp.container.getElementsByTagName('label')[0];
                expect(el).toBeInstanceOf(HTMLLabelElement);
                done();
            } catch (error) {
                done(error);
            }

        }, timer);
    });
    test('load invalid view 2', done => {
        let el = null as HTMLElement;
        //render invalid view, and done
        let r = render(<View id="cidViewContainer" name="viewABC" />);

        window.timer.wait((p) => {
            try {
                el = p.container.getElementsByTagName('div')[0];
                expect(el.innerHTML).toEqual('Can not find view "viewABC"');
                done();
            } catch (error) {
                done(error);
            }
        }, 10, r);
    });
    test('load view', () => {
        let el = null as HTMLElement;

        //render with fields is null
        let r = render(<View id="cidViewContainer" name="viewB" />);
        expect(r.container.innerHTML).toEqual('');
        cleanup();
        //render not found field
        r = render(<View id="cidViewContainer" name="viewX" />);
        el = screen.getByText('Field "fieldC" should be here');
        expect(el).toBeInstanceOf(HTMLDivElement);

        cleanup();
        //render invisible view

        r = render(<View id="cidViewContainer" name="viewA" visible={false} />);
        expect(r.container.innerHTML).toEqual('');

        cleanup();
        //render readonly view
        const view = React.createRef<View>();
        r = render(<View ref={view} id="cidViewContainer" name="viewA" readonly={true} />);
        expect(screen.getAllByText('READONLY').length).toEqual(2);
        view.current.setReadonly(false);
        expect(screen.getAllByText('NORMAL').length).toEqual(2);

    });
    test('load view with inline template', () => {
        let el = null as HTMLElement;

        let r = render(<View id="cidViewContainer" name="viewX">
            Hello World
            <table>
                <tbody>
                    <tr><td field-name="fieldA"></td></tr>
                    <tr><td field-name="fieldB"></td></tr>
                </tbody>
            </table>
            <h1>This is inline template</h1>
        </View>);
        expect(r.container.firstElementChild).toBeInstanceOf(HTMLTableElement);
        cleanup();
        r = render(<View id="cidViewContainer" name="viewA" dataSource={{ f1: 'val01', f2: 'val02' }}>
            Hello World
            <table>
                <tbody>
                    <tr><td field-name="fieldA"></td></tr>
                    <tr><td field-name="fieldB"></td></tr>
                </tbody>
            </table>
            <h1>This is inline template</h1>
        </View>);
        expect(screen.getByText('val01')).toBeInstanceOf(HTMLSpanElement);
    });
    test('load view with inline template, data api', done => {
        const dataBound = (sender: React.Component<IViewProps, IViewState>, fields: React.Component<IComponentProps, IComponentState>[]) => {
            try {
                const s  = sender as View;
                expect(screen.getByText('vvv01')).toBeInstanceOf(HTMLSpanElement);
                expect(s.getValues()).toEqual({ f1: 'vvv01', f2: 'vvv02' });
                expect(s.isValidData()).toEqual(true);
                done();
            } catch (error) {
                done(error);
            }
        };

        let r = render(<View id="cidViewContainer" name="viewZ" onDataBound={dataBound}>
            Hello World
            <table>
                <tbody>
                    <tr><td field-name="fieldA"></td></tr>
                    <tr><td field-name="fieldB"></td></tr>
                </tbody>
            </table>
            <h1>This is inline template</h1>
        </View>);


    });

    test('load view with template url', done => {
        let el = null as HTMLElement;

        let r = render(<View id="cidViewContainer" name="viewT" />);
        window.utilities.waitFor((p) => p.container.innerHTML != '', (p) => {
            try {
                el = p.container.firstElementChild;
                expect(el.id).toEqual('cidViewContainer');
                expect(el.firstElementChild.className).toEqual('url-template');
                done();
            } catch (error) {
                done(error);
            }
        }, r);

        r = render(<View id="cidViewContainer" name="viewT" dataSource={{ f1: 'val01', f2: 'val02' }} />);
        window.utilities.waitFor((p) => p.container.innerHTML != '', (p) => {
            try {
                el = p.container.firstElementChild;
                expect(el.id).toEqual('cidViewContainer');
                expect(el.firstElementChild.className).toEqual('url-template');
                expect(screen.getByText('val01')).toBeInstanceOf(HTMLSpanElement);
                done();
            } catch (error) {
                done(error);
            }
        }, r);

    });
    test('load view with template url, api data', done => {

        let rebindData = false;
        const dataBound = (sender: React.Component<IViewProps, IViewState>, fields: React.Component<IComponentProps, IComponentState>[]) => {
            try {
                const s = sender as View;
                if (rebindData) {
                    expect(screen.getByText('vvv01-newval')).toBeInstanceOf(HTMLSpanElement);
                    done();
                    return;
                } else {
                    onSubmitHandler = jest.fn();
                    expect(screen.getByText('vvv01')).toBeInstanceOf(HTMLSpanElement);
                    expect(screen.getByText('fieldBA')).toBeInstanceOf(HTMLDivElement);
                    const fA = s.find('fieldA') as BaseComponent;
                    expect(fA).toBeInstanceOf(BaseComponent);
                    expect(s.find('fieldB')).toEqual(null);
                    fA.setValue('vvv0A');
                    expect(s.getValues()).toEqual({ f1: 'vvv0A' });
                    expect(s.isValidData()).toEqual(false);
                    s.submitData();
                    expect(onSubmitHandler).not.toBeCalled();
                    fA.setValue('vvv01');
                    expect(s.isValidData()).toEqual(true);
                    s.submitData();
                    expect(onSubmitHandler).toBeCalled();
                    s.submitData();
                    expect(onSubmitHandler).toBeCalledTimes(2);
                    expect(s.getData()).toEqual({ "f1": "vvv01", "f2": "vvv02" });
                    rebindData = true;
                    s.bindData({ "f1": "vvv01-newval", "f2": "vvv02" });

                }

            } catch (error) {
                done(error);
            }
        };

        let r = render(<View id="cidViewContainer" name="viewT" onDataBound={dataBound} dataApiParams={{}} onDidUpdate={()=>{}} />);

    });
    
    
    test('load view with layout', () => {
        let r = render(<View id="cidViewContainer" name="viewL" />);
        expect(r.container.getElementsByClassName('cc1').length).toEqual(2);
    });
    test('test toggleFields', () => {
        let view = React.createRef<View>();
        let r = render(<View ref={view} id="cidViewContainer" name="viewL" />);
        const actionP = jest.fn();
        view.current.toggleFields('v', [
            {
                match: v => false, fields: [
                    { names: ['fieldA', 'no_found_field'], action: actionP }
                ]
            }
        ]);
        expect(actionP).not.toBeCalled();
        view.current.toggleFields('v', [
            {
                match: v => true, fields: [
                    { names: ['fieldA', 'no_found_field'], action: actionP }
                ]
            }
        ]);

        expect(actionP).toBeCalledTimes(1);
    });

    test('load view with datafield, data api', done => {
        const dataBound = (sender: React.Component<IViewProps, IViewState>, fields: React.Component<IComponentProps, IComponentState>[]) => {
            try {
                const s = sender as View;
                expect(screen.getByText('vvv01')).toBeInstanceOf(HTMLSpanElement);
                expect(s.getValues()).toEqual({ df: { f1: 'vvv01', f2: 'vvv02' } });
                expect(s.isValidData()).toEqual(true);
                done();
            } catch (error) {
                done(error);
            }
        };
         render(<View id="cidViewContainer" name="viewZA" onDataBound={dataBound} />);


    });
    
    test('load view with datafield, data source', () => {
        
        const ds = {
            df2:{
                f1: 'abcd01',
                f2: 'poiuy02'
            }
        }
        let s = React.createRef<View>();
        let r = render(<View ref={s} id="cidViewContainer" name="viewZA" dataSource={ds} dataField="df2" />);
        expect(screen.getByText('abcd01')).toBeInstanceOf(HTMLSpanElement);
        expect(s.current.getValues()).toEqual({ df2: { f1: 'abcd01', f2: 'poiuy02' } });

    });
    
    test('load view with inline template, data api error', done => {
        const cnt = ut1._debug.mock.calls.length;
        let r = render(<View id="cidViewContainer" name="viewZ" dataApiParams={{ shouldRaiseEror: true }} >
            <div field-name="fieldA"></div>
        </View>);
        
        window.utilities.waitFor(() => ut1._debug.mock.calls.length > cnt, () => {
            try {
                expect(msg).toEqual('Invalid request');
                done();

            } catch (error) {
                done(error);
            }
        });

    });
    
    test('load view with template url with error', done => {
        const cnt = ut1._debug.mock.calls.length;

        render(<View id="cidViewContainer" name="viewTT" />);
        window.utilities.waitFor(() => ut1._debug.mock.calls.length > cnt, () => {
            try {
                expect(msg).toEqual('Invalid request');
                done();

            } catch (error) {
                done(error);
            }
        });



    });
    
    test('load view with data api return null', done => {
        const cnt = ut1._debug.mock.calls.length;
        let r = render(<View id="cidViewContainer" name="viewZZ" />);
        window.utilities.waitFor(() => ut1._debug.mock.calls.length > cnt, () => {
            try {
                expect(msg).toEqual('dataApi return null: /fakeData_null');
                done();

            } catch (error) {
                done(error);
            }
        });
        
    });
});