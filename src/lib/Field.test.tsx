import React, { RefObject } from 'react';
import { cleanup, render, RenderResult, screen } from '@testing-library/react';
import { BaseComponent } from './BaseComponent';
import { DynConfig } from './DynConfig';
import { Field } from './Field';
import './Utilities'; 
import { IBaseComponentProps, IComponentState } from './Defs';


describe('test field', () => {
    
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
    let realDatasourceParams = null as any;
    const ut = require('./Utilities.execApi');
    ut.execApiAsync = function (url: string, requestData: any, recalled?: boolean): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (requestData == null) {
                reject('No post data');
                return;
            }
            realDatasourceParams = requestData;
            const response = new Response('[{"value":"val1"}, {"value":"val2"}]');
            resolve(response);

        });
    };
    const datasourceParams = {
        r1: 'vr1',
        r2: 'vr2'
    };
    
    let callBackDidUpdated = null as any;
    class MyComp extends BaseComponent {
        public componentDidUpdate(prevProps: Readonly<IBaseComponentProps>, prevState: Readonly<IComponentState>, snapshot?: any) {
            super.componentDidUpdate(prevProps, prevState,snapshot);
            if (this.props.didUpdated) this.props.didUpdated();

        }
        protected renderComponent(): React.ReactNode {
            const data = this.state.dataSource;
            const items = [];
            if (data != null) {
                for (let i = 0; i < data.length; i++) {
                    items.push(<li key={'ii' + i}>{data[i].value}</li>);
                }
            }
            else {
                items.push(<li key={'ii'}>no-item</li>);
            }
            return (<>
                <div>{this.state.value}</div>
                <ul>{items}</ul>

            </>);
        }


    }
    DynConfig.exportControls({
        'myControl': MyComp
    });
    const dataApiParamsFunc = jest.fn(() => {
        return datasourceParams;
    });
    //*
    test('load field', () => {
        let field = React.createRef() as RefObject<Field>;
        let el = null;

        //tests: control not found, bind value without control
        let r = render(<Field id="cidViewContainer" ref={field} type="myControl" visible={false} />);
        expect(r.container.innerHTML).toEqual('');
        //tests: control not found, bind value without control
        cleanup();
        r = render(<Field id="cidViewContainer" ref={field} type="myControl1" />);
        field.current.bindValue({
            f1: 'fval'
        }, false);
        el = screen.getByText('Can not find control (component) "myControl1"');
        expect(el).toBeInstanceOf(HTMLDivElement);
        // tests: render control, bind value with no data field
        cleanup();
        r = render(<Field id="cidViewContainer" ref={field} type="myControl" />);
        field.current.bindValue({
            f1: 'fval'
        }, false);
        //el = screen.getByText('fval0');
        expect(field.current.control.current.state.value).toEqual(null);

        // tests: render control, bind value with data field and datasource
        cleanup();
        r = render(<Field id="cidViewContainer" ref={field} type="myControl" dataField="f1" sourceField="list" />);
        expect(r.container.getElementsByTagName('li')[0].innerHTML).toEqual('no-item');
        field.current.bindValue({
            f1: 'fval1',
            f2: 'fval2',
            list: [{
                value: 'item001'
            }, {
                value: 'item002'
            }]
        }, false);
        el = screen.getByText('fval1');
        expect(el).toBeInstanceOf(HTMLDivElement);
        let lis = r.container.getElementsByTagName('li');
        expect(lis.length).toEqual(2);
        expect(lis[0].innerHTML).toEqual('item001');
        expect(lis[1].innerHTML).toEqual('item002');


        //tests: render control, no data source with api (no parameter), no bind value
        cleanup();
        r = render(<Field id="cidViewContainer" ref={field} type="myControl" dataField="f1" dataSourceApi='/fakeApiDs' />);
        el = screen.getAllByText('no-item');
        expect(el[0]).toBeInstanceOf(HTMLLIElement);

        field.current.rebind('/fakeApiDs', null);

    });
    test('load field with api', done => {
        let field = React.createRef() as RefObject<Field>;
        let el = null;



        let cntUpdate = 0;
        callBackDidUpdated = function () {

            
            try {
                cntUpdate++;
                if (cntUpdate==2) {
                    let lis = r.container.getElementsByTagName('li');
                    
                    console.log('lis.length', lis.length);
                    expect(lis.length).toEqual(2);
                    expect(lis[0].innerHTML).toEqual('val1');
                    expect(lis[1].innerHTML).toEqual('val2');
                    
                }
                else if (cntUpdate==3) {
                    el = screen.getByText('fval1');
                    expect(el).toBeInstanceOf(HTMLDivElement);
                    done();
                }
            } catch (e) {
                done(e);
            }


        } as any;

        let r = render(<Field id="cidViewContainer2" type="myControl" ref={field} dataField="f1" dataSourceApi='/fakeApiDs' dataApiParamsFunc={dataApiParamsFunc} didUpdated={callBackDidUpdated} />);
        field.current.bindValue({
            f1: 'fval1',
            f2: 'fval2'
        }, false);
        expect(dataApiParamsFunc).toBeCalled();
        expect(realDatasourceParams).toEqual(datasourceParams);
    });
    test('load field with api 2', done => {
        let field = React.createRef() as RefObject<Field>;
        let el = null;
        let r = null as RenderResult;


        let doOne = false;
        callBackDidUpdated = function () {
            
            
            try {
                

                if (!doOne) {
                    
                    doOne = true;
                    let lis = r.container.getElementsByTagName('li');
                    expect(lis.length).toEqual(2);
                    expect(lis[0].innerHTML).toEqual('val1');
                    expect(lis[1].innerHTML).toEqual('val2');
                    field.current.bindValue({
                        f1: 'fval7',
                        f2: 'fval2'
                    }, false);

                }
                else {
                    el = screen.getByText('fval7');
                    expect(el).toBeInstanceOf(HTMLDivElement);
                    done();
                }
            } catch (e) {
                done(e);
            }


        } as any;

        r = render(<Field id="cidViewContainer2" type="myControl" ref={field} dataField="f1" dataSourceApi='/fakeApiDs' dataApiParamsFunc={dataApiParamsFunc} didUpdated={callBackDidUpdated} />);
        expect(dataApiParamsFunc).toBeCalled();
        expect(realDatasourceParams).toEqual(datasourceParams);
        
    });
    //*/
    /*
    test('load field with api 3', () => {
        var f = new Field({
            type: 'myControl', dataField: 'f1', dataSourceApi: '/fakeApiDs', dataApiParamsFunc: function (s, u, c) {
                return {};
            }
        });
        console.log('1');
        f.rebind(null, {});
        console.log('2');
        f.control = {
            current: {
                getDataSource: () => { return {a:true}; },
                setValue: () => { }
            } as any
        };
        console.log('3');
        f.componentDidMount();
        console.log('4');
        f.rebind(null, {});
        console.log('5');
        f.bindValue({
            f1: 'fval1',
            f2: 'fval2',
            list: [{
                value: 'item001'
            }, {
                value: 'item002'
            }]
        }, false);
        console.log('6');

    });
    //*/
});