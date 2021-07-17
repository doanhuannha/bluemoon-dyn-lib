import React, { RefObject } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { BaseComponent } from './BaseComponent';
import { DynConfig } from './DynConfig';
import './Utilities.tsx';
import { Field } from './Field';


describe('test field', () => {
    class Response{
        private body: string;
        constructor(s:string){
            this.body = s;
        }
        json(){
            return new Promise<any>((r)=>{
                (r(JSON.parse(this.body)))
            });
        }
    };
    
    global.fetch = (input: RequestInfo, init?: RequestInit): Promise<any>=>{
        const url = input as string;
        if(url.startsWith('/fakeApiDs')){
            realDatasourceParams = JSON.parse(init.body as string)
        }
        return new Promise<Response>((resolve,reject)=>{
            if(realDatasourceParams==null){ 
                reject('No post data');
                return;
            }

            const response = new Response('[{"value":"val1"}, {"value":"val2"}]');
            resolve(response);
    
        });
    };

    const datasourceParams = {
        r1: 'vr1',
        r2: 'vr2'
    };
    let realDatasourceParams = null as any;
    let callBackDidUpdated = null as any;
    class MyComp extends BaseComponent {
        public componentDidUpdate(){
            if(callBackDidUpdated) callBackDidUpdated();
        }
        protected renderComponent(): React.ReactNode {
            const data = this.state.dataSource;
            const items = [];
            if(data!=null){
                for(let i=0;i<data.length;i++){
                    items.push(<li key={'ii'+i}>{data[i].value}</li>);
                }
            }
            else{
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
    const dataApiParamsFunc = jest.fn(()=>{
        return datasourceParams;
    });
    
    test('load field', () => {
        let field = React.createRef() as RefObject<Field>;
        let el = null;
        //*
        //tests: control not found, bind value without control
        let r = render(<Field id="cidViewContainer" ref={field} type="myControl" visible={false} />);
        expect(r.container.innerHTML).toEqual('');
        //tests: control not found, bind value without control
        cleanup();
        r = render(<Field id="cidViewContainer" ref={field} type="myControl1" />);
        field.current.bindValue({
            f1: 'fval'
        },false);
        el = screen.getByText('Can not find control (component) "myControl1"');
        expect(el).toBeInstanceOf(HTMLDivElement);
        // tests: render control, bind value with no data field
        cleanup();
        r = render(<Field id="cidViewContainer" ref={field} type="myControl" />);
        field.current.bindValue({
            f1: 'fval'
        },false);
        //el = screen.getByText('fval0');
        expect(field.current.control.current.state.value).toEqual(null);

        // tests: render control, bind value with data field and datasource
        cleanup();
        r = render(<Field id="cidViewContainer" ref={field} type="myControl" dataField="f1" sourceField="list" />);
        expect(r.container.getElementsByTagName('li')[0].innerHTML).toEqual('no-item');
        field.current.bindValue({
            f1: 'fval1',
            f2: 'fval2',
            list:[{
                value: 'item001'
            },{
                value: 'item002'
            }]
        },false);
        el = screen.getByText('fval1');
        expect(el).toBeInstanceOf(HTMLDivElement);
        let lis = r.container.getElementsByTagName('li');
        expect(lis.length).toEqual(2);
        expect(lis[0].innerHTML).toEqual('item001');
        expect(lis[1].innerHTML).toEqual('item002'); 

        //tests: render control, no data source with api (no parameter), no bind value
        cleanup();
        r = render(<Field id="cidViewContainer" type="myControl" dataField="f1" dataSourceApi='/fakeApiDs'/>);
        el = screen.getAllByText('no-item');
        expect(el[0]).toBeInstanceOf(HTMLLIElement);
        //*/

        //tests: render control, data source with api with api params, bind value
        cleanup();
        r = render(<Field id="cidViewContainer" type="myControl" ref={field} dataField="f1" dataSourceApi='/fakeApiDs' dataApiParamsFunc={dataApiParamsFunc}  />);
        
        expect(dataApiParamsFunc).toBeCalled();
        expect(realDatasourceParams).toEqual(datasourceParams);
        let doOne = false;
        callBackDidUpdated = function () {
            let lis = r.container.getElementsByTagName('li');
            expect(lis.length).toEqual(2);
            expect(lis[0].innerHTML).toEqual('val1');
            expect(lis[1].innerHTML).toEqual('val2');
            
            if(!doOne){     
                doOne = true;
                field.current.bindValue({
                    f1: 'fval7',
                    f2: 'fval2'
                },false);
                
                
            }
            else{
                el = screen.getByText('fval7');
                expect(el).toBeInstanceOf(HTMLDivElement);
            }
        }
        
   
    });
});