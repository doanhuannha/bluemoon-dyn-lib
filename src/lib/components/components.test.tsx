import React, { RefObject } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '../Utilities.tsx';
import { BaseComponent } from '../BaseComponent';
import { DynConfig } from '../DynConfig';
import Button from './Button';
import DropdownList from './DropdownList';
import Hidden from './Hidden';
import Label from './Label';
import TextBox from './TextBox';
import ViewLoader from './ViewLoader';
import Table, { TableConfig } from './Table';
import CheckBox from './CheckBox';
import CheckBoxList from './CheckBoxList';
import RadioList from './RadioList';
import TextArea from './TextArea';
import { Pager } from './Pager';


describe('test components', () => {
    class MyCompViewLoader extends BaseComponent {
        protected renderComponent(): React.ReactNode {
            return (<span>{this.props.label}</span>);
        }


    }
    const MyCompTable = function(p: any){
        return <button id={'btn'+p.data.fd1}>{p.data.fd2}</button>;
    }
    const MyCompTable_NoItem = function(){
        return <>Item list is empty</>;
    }
    DynConfig.exportControls({
        'mycompviewloader': MyCompViewLoader,
        'mycomptable': MyCompTable,
        'mycomptable_noitem': MyCompTable_NoItem
    });
    window.utilities.importFieldDefs({
        fieldAA: {
            type: 'mycompviewloader',
            label: 'Field 1',
            dataField: 'f1'
        },
        fieldBB: {
            type: 'mycompviewloader',
            label: 'Field 2',
            dataField: 'f2'
        }
    });

    window.utilities.importViewDefs({
        viewAA: {
            fields: [{
                name: 'fieldAA'
            }]
        },
        viewBB: {
            fields: [{
                name: 'fieldBB'
            }]
        }
    });
    test('test pager', () => {
        const pagingHandler = jest.fn((sender, pageIndex, pageSize) =>  {

        });
        const parent = {} as any;
        let r = render(<Pager pageIndex={1} pageSize={7} totalRow={36} pagingHandler={pagingHandler} parent={parent} /> );
        let el = document.querySelector('a[href="#gotoPage:1"]');
        expect(el.className).toEqual('current');
        fireEvent.click(el);
        fireEvent.click(document.querySelector('a[href="#gotoPage:2"]'));
        expect(pagingHandler).toBeCalledTimes(1);

        fireEvent.click(document.querySelector('a[href="#gotoPage:3"]'));
        expect(pagingHandler).toBeCalledTimes(2);

        /*
        cleanup();
        r = render(<Pager pageIndex={1} pageSize={7} totalRow={35} pagingHandler={pagingHandler} parent={parent} pageListCount={3}/> );
        screen.debug();

        cleanup();
        r = render(<Pager pageIndex={3} pageSize={7} totalRow={35} pagingHandler={pagingHandler} parent={parent} pageListCount={3}/> );
        screen.debug();

        cleanup();
        r = render(<Pager pageIndex={6} pageSize={7} totalRow={35} pagingHandler={pagingHandler} parent={parent} pageListCount={3}/> );
        screen.debug();
        */
    });
    return;
    test('test button', () => {
        let objRef = null as Button;
        const onDidMount = function (s: any) {
            objRef = s;
        }
        let r = render(<Button id="cidButton" didMountFunction={onDidMount} />);
        
        let el = document.getElementById('cidButton');
        expect(el.tagName).toEqual('BUTTON');
        expect(objRef.shouldBindData()).toEqual(false);
        fireEvent.click(el);
        expect(objRef.state.value).toEqual(true);

        objRef.setReadonly(true);
        expect(document.getElementById('cidButton')).toEqual(null);

        cleanup();
        r = render(<Button id="cidButton" options={{htmlProps: {className:'mybutton'}}} />);
        el = document.getElementById('cidButton');
        expect(el.tagName).toEqual('BUTTON');
        expect(el.className).toEqual('mybutton');

    });
    test('test dropdownlist', () => {
        let objRef = React.createRef<DropdownList>();

        let ds = [
            { valueId: 'a1', text: 'Item 1' },
            { valueId: 'a2', text: 'Item 2' },
            { valueId: 'a3', text: 'Item 3' }
        ];
        let r = render(<DropdownList id="cidDropdown" label="drop_label" />);
        let el = document.getElementById('cidDropdown') as HTMLSelectElement;
        expect(el.childElementCount).toEqual(0);
        expect(screen.getAllByText('drop_label')[0]).toBeInstanceOf(HTMLLabelElement);
        
        cleanup();
        r = render(<DropdownList ref={objRef} id="cidDropdown" dataSource={ds} />);
        el = document.getElementById('cidDropdown') as HTMLSelectElement;
        expect(el.tagName).toEqual('SELECT');
        (el as HTMLSelectElement).selectedIndex = 2;
        fireEvent.change(el);
        expect(objRef.current.getValue()).toEqual('a3');
        expect(r.container.getElementsByTagName('label').length).toEqual(0);

        
        
        
        objRef.current.setReadonly(true);
        el = document.getElementById('cidDropdown') as HTMLSelectElement;
        expect(el.getElementsByTagName('span')[0].innerHTML).toEqual('Item 3');

        cleanup();
        const ds2 = [{txt: 'txt1', val: 'v1'},{txt: 'txt2', val: 'v2'}, {txt: 'txt3'}, {}];
        r = render(<DropdownList ref={objRef} id="cidDropdown" dataSource={ds2} options={{htmlProps: {className:'drop-class'}, textField: 'txt', valueField: 'val'}} />);
        objRef.current.setValue('v2');
        el = document.getElementById('cidDropdown') as HTMLSelectElement;
        expect(el.parentElement.className).toEqual('drop-class');
        expect(el.value).toEqual('v2');
    });
    test('test hidden', () => {
        let r = render(<Hidden id="cidHidden" />);
        let el = document.getElementById('cidHidden');
        expect(el.tagName).toEqual('INPUT');
    });
    test('test label', () => {
        let objRef = React.createRef<Label>();
        const onDidMount = function (s: any) {
            //objRef = s;
        } 
        let r = render(<Label ref={objRef} id="cidLabel" didMountFunction={onDidMount}/>);
        let el = document.getElementById('cidLabel');
        expect(el.tagName).toEqual('SPAN');
        objRef.current.setValue('labelVal');
        expect(el.getElementsByTagName('label').length).toEqual(0);

        cleanup();
        r = render(<Label ref={objRef} id="cidLabel" label="Label 1" didMountFunction={onDidMount}/>);
        el = document.getElementById('cidLabel');
        expect(el.tagName).toEqual('SPAN');
        expect(el.getElementsByTagName('label')[0].innerHTML).toEqual('Label 1');

        objRef.current.setValue('labelVal');
        expect(el.getElementsByTagName('span')[0].innerHTML).toEqual('labelVal');

        cleanup();
        r = render(<Label id="cidLabel" label="Label 1" options={{alwaysShow :false}} />);
        el = document.getElementById('cidLabel');
        expect(el).toEqual(null);

    });
    test('test textbox', () => {
        let objRef = null as TextBox;
        const onDidMount = function (s: any) {
            objRef = s;
        } 
        let r = render(<TextBox id="cidTextbox" didMountFunction={onDidMount} label="textbox_label"/>);
        let el = document.getElementById('cidTextbox') as HTMLInputElement;
        expect(el.tagName).toEqual('INPUT');
        //objRef.setValue('labelVal');
        fireEvent.change(el,{target:{value:'labelVal'}});
        expect(el.value).toEqual('labelVal');
        expect(screen.getAllByText('textbox_label')[0]).toBeInstanceOf(HTMLLabelElement);
        cleanup();
        r = render(<TextBox id="cidTextbox" didMountFunction={onDidMount}/>);
        expect(r.container.getElementsByTagName('label').length).toEqual(0);

        objRef.setReadonly(true);
        expect(document.getElementById('cidTextbox')).toEqual(null);

        cleanup();
        r = render(<TextBox id="cidTextbox" didMountFunction={onDidMount} options={{textType:'date'}}/>);
        const ctrl = document.getElementById('cidTextbox') as HTMLInputElement;
        objRef.setValue('2020-07-24T23:45:16');
        expect(ctrl.value).toEqual('2020-07-24');
        objRef.setValue(new Date(2021,11,12));
        expect(ctrl.value).toEqual('2021-12-12');
    });
    
    test('test ViewLoader', () => {
        
        let objRef = null as ViewLoader;
        const onDidMount = function (s: any) {
            objRef = s;
        } 
        let r = render(<ViewLoader id="cidViewContainer" didMountFunction={onDidMount}/>);
        let el = null;
        expect(r.container.innerHTML).toEqual('');
        
        objRef.setValue('viewAA');
        
        el = screen.getByText('Field 1');
        expect(el).toBeInstanceOf(HTMLSpanElement);

        objRef.setValue({name: 'viewBB', dataApiParams: null});
        el = screen.getByText('Field 2');
        expect(el).toBeInstanceOf(HTMLSpanElement);

        objRef.setValue({name1: 'viewBB', dataApiParams: null});
        expect(r.container.innerHTML).toEqual('');
    });
    
    test('test table', () => {
        
        let tbConfig = null as TableConfig;
        tbConfig = {
            
            columns:[
                {headerLabel: 'Col 1', dataField: 'fd1'},
                {headerLabel: 'Col 2', dataField: 'fd2'}
            ]
        };

        let objRef = null as Table;
        const onDidMount = function (s: any) {
            objRef = s;
        } 
        let r = render(<Table id="cidTable" didMountFunction={onDidMount}/> );
        expect(r.container.innerHTML).toEqual('');
        cleanup();
        r = render(<Table id="cidTable" didMountFunction={onDidMount} options={tbConfig}/> );
        let el = document.getElementsByTagName('td')[0] as HTMLElement;
        expect(el.getAttribute('colspan')).toEqual('2');
        expect(el.innerHTML).toEqual('No data to be displayed');

        //expect(r.container.innerHTML).toEqual('');

        objRef.setValue([{fd1:'val 1.1', fd2:'val 1.2'},{fd1:'val 2.1', fd2:'val 2.2'}]);
        el = document.getElementById('cidTable');
        expect(el).toBeInstanceOf(HTMLTableElement);

        expect(el.getElementsByTagName('tr').length).toEqual(3);
        let td = el.getElementsByTagName('td');
        expect(td.length).toEqual(4);
        expect(td[0].innerHTML).toEqual('val 1.1');

        cleanup();
        tbConfig = {
            columns:[
                {headerLabel: 'Col 1', dataField: 'fd1'},
                {headerLabel: 'Col 2', dataField: 'fd2'},
                {
                    headerLabel: 'Col 3', dataField: null,
                    buildItem: function(data:any){
                        return '<a id="lnk' + data.fd1 + '">Edit</a>';
                    }
                }
            ],
            htmlProps:{
                className: 'darktable'
            },
            noItem: 'No item'
        };
        
        r = render(<Table id="cidTable" didMountFunction={onDidMount} options={tbConfig}/> );
        
        el = document.getElementsByTagName('td')[0] as HTMLElement;
        expect(el.getAttribute('colspan')).toEqual('3');
        expect(el.innerHTML).toEqual('No item');

        objRef.setValue([{fd1:'val001', fd2:'val 1.2'},{fd1:'val002', fd2:'val 2.2'}]);
        el = document.getElementById('cidTable');
        expect(el).toBeInstanceOf(HTMLTableElement);
        expect(el.className).toEqual('darktable');
        expect(document.getElementById('lnkval001')).toBeInstanceOf(HTMLAnchorElement);


        cleanup();
        tbConfig = {
            columns:[
                {headerLabel: 'Col 1', dataField: 'fd1'},
                {headerLabel: 'Col 2', dataField: 'fd2'},
                {
                    headerLabel: 'Col 3', dataField: null,
                    htmlItem: '<a id="lnk{fd1}">Edit</a>'
                }
            ],
            htmlProps:{
                className: 'darktable'
            },
            noItem: 'No item'
        };
        r = render(<Table id="cidTable" didMountFunction={onDidMount} options={tbConfig}/> );
        objRef.setValue([{fd1:'val001', fd2:'val 1.2'},{fd1:'val002', fd2:'val 2.2'}]);
        //screen.debug();
        expect(document.getElementById('lnkval001')).toBeInstanceOf(HTMLAnchorElement);

        cleanup();
        tbConfig = {
            columns:[
                {headerLabel: 'Col 1', dataField: 'fd1'},
                {headerLabel: 'Col 2', dataField: 'fd2'},
                {
                    headerLabel: 'Col 3', dataField: null,
                    buildItem: function(data:any){
                        return <a id={"lnk"+data.fd1}>Edit</a>;
                    }
                }
            ],
            noItem: 'mycomptable_noitem'
        };
        
        r = render(<Table id="cidTable" didMountFunction={onDidMount} options={tbConfig}/> );
        el = document.getElementsByTagName('td')[0] as HTMLElement;
        expect(el.getAttribute('colspan')).toEqual('3');
        expect(el.innerHTML).toEqual('Item list is empty');

        objRef.setValue([{fd1:'val001', fd2:'val 1.2'},{fd1:'val002', fd2:'val 2.2'}]);
        el = document.getElementById('cidTable');
        expect(el).toBeInstanceOf(HTMLTableElement);
        expect(document.getElementById('lnkval001')).toBeInstanceOf(HTMLAnchorElement);

        cleanup();
        tbConfig = {
            columns:[
                {headerLabel: 'Col 1', dataField: 'fd1'},
                {headerLabel: 'Col 2', dataField: 'fd2'},
                {
                    headerLabel: 'Col 3', dataField: null,
                    component: 'mycomptable'
                }
            ]
        };
        
        r = render(<Table id="cidTable" didMountFunction={onDidMount} options={tbConfig}/> );

        objRef.setValue([{fd1:'val001', fd2:'val 1.2'},{fd1:'val002', fd2:'val 2.2'}]);
        el = document.getElementById('cidTable');
        expect(el).toBeInstanceOf(HTMLTableElement);
        expect(document.getElementById('btnval001')).toBeInstanceOf(HTMLButtonElement);

        objRef.setValue({
            data:[{fd1:'val 1.1', fd2:'val 1.2'},{fd1:'val 2.1', fd2:'val 2.2'}],
            pageSize: 11, pageIndex: 3, totalRow: 123
        });
        el = document.getElementById('cidTable');
        expect(el).toBeInstanceOf(HTMLTableElement);
        el = document.getElementsByClassName('current')[0] as HTMLElement;
        expect(el).toBeInstanceOf(HTMLAnchorElement);
        expect(el.getAttribute('href')).toEqual('#gotoPage:3');

        objRef.setValue({});
        //screen.debug();

    });
    
    test('test checkbox',()=>{
        let refObj = React.createRef() as RefObject<CheckBox>;
        let r = render(<CheckBox ref={refObj} label="Active" id="cidCheckbox" />);
        let el = document.getElementById('cidCheckbox');
        expect(el).toBeInstanceOf(HTMLInputElement);
        el.click();
        expect(refObj.current.getValue()).toEqual(true);
    });
    test('test checkboxlist',()=>{
        let refObj = React.createRef() as RefObject<CheckBoxList>;
        let r = render(<CheckBoxList ref={refObj} id="cidCheckboxList" dataSource={[{text:'t001', valueId:'v001'}, {text:'t002', valueId:'v002'}]} />);
        
        let el = document.getElementById('cidCheckboxList');
        expect(el).toBeInstanceOf(HTMLSpanElement);
        el = document.getElementById('cidCheckboxList_item1');
        el.click();
        expect((el as HTMLInputElement).checked).toEqual(true);
        expect(refObj.current.getValue()).toEqual(['v002']);
        el = document.getElementById('cidCheckboxList_item0');
        el.click();
        expect((el as HTMLInputElement).checked).toEqual(true);
        expect(refObj.current.getValue()).toEqual(['v002', 'v001']);
        el.click();
        expect(refObj.current.getValue()).toEqual(['v002']);

        refObj.current.setReadonly(true);
        el = document.getElementById('cidCheckboxList');
        expect(el.getElementsByTagName('span')[0].innerHTML).toEqual('t002');
        
        //test with label, props and textfield, valuefield
        const ds = [{txt: 'txt1', val: 'v1'},{txt: 'txt2', val: 'v2'}, {txt: 'txt3'}, {}];
        r = render(<CheckBoxList ref={refObj} id="cidCheckboxList2" label="Checkbox list" options={{htmlProps: {className:'check-class'}, textField: 'txt', valueField: 'val'}} />);
        el = document.getElementById('cidCheckboxList2');
        expect(el).toBeInstanceOf(HTMLSpanElement);
        expect(el.className).toEqual('check-class');
        expect(el.firstElementChild.innerHTML).toEqual('Checkbox list');
        refObj.current.setDataSource(ds);
        expect((document.getElementById('cidCheckboxList2_item0') as HTMLInputElement).value).toEqual('v1');
        expect((document.getElementById('cidCheckboxList2_item2') as HTMLInputElement).value).toEqual('');
        expect(document.querySelector('label[for=cidCheckboxList2_item2]').innerHTML).toEqual('txt3');

        //
        //el.click();
        //expect(refObj.current.getValue()).toEqual(true);
    });
    test('test radio list',()=>{
        let refObj = React.createRef() as RefObject<RadioList>;
        let r = render(<RadioList ref={refObj} id="cidRadioList" dataSource={[{text:'t001', valueId:'v001'}, {text:'t002', valueId:'v002'}, {text:'t003', valueId:'v003'}]} />);
        let el = document.getElementById('cidRadioList');
        expect(el).toBeInstanceOf(HTMLSpanElement);
        el = document.getElementById('cidRadioList_item1');
        el.click();
        expect((el as HTMLInputElement).checked).toEqual(true);
        expect(refObj.current.getValue()).toEqual('v002');
        el = document.getElementById('cidRadioList_item2');
        el.click();
        expect((el as HTMLInputElement).checked).toEqual(true);
        expect(refObj.current.getValue()).toEqual('v003');
        
                
        refObj.current.setReadonly(true);
        el = document.getElementById('cidRadioList');
        expect(el.getElementsByTagName('span')[0].innerHTML).toEqual('t003');

        cleanup();
        const ds2 = [{txt: 'txt1', val: 'v1'},{txt: 'txt2', val: 'v2'}, {txt: 'txt3'}, {}];
        r = render(<RadioList ref={refObj} id="cidRadioList2" label="Radio list" options={{htmlProps: {className:'radio-class'}, textField: 'txt', valueField: 'val'}} />);
        el = document.getElementById('cidRadioList2');
        expect(el).toBeInstanceOf(HTMLSpanElement);
        expect(el.firstElementChild.innerHTML).toEqual('Radio list');
        expect(el.className).toEqual('radio-class');
        refObj.current.setDataSource(ds2);
        refObj.current.setValue('v2');
        expect((document.getElementById('cidRadioList2_item0') as HTMLInputElement).checked).toEqual(false);
        expect((document.getElementById('cidRadioList2_item1') as HTMLInputElement).checked).toEqual(true);
    });

    test('test textarea', () => {
        let objRef = null as TextArea;
        const onDidMount = function (s: any) {
            objRef = s;
        } 
        let r = render(<TextArea id="cidTextArea" didMountFunction={onDidMount} label="textarea_label"/>);
        let el = document.getElementById('cidTextArea') as HTMLTextAreaElement;
        expect(el.tagName).toEqual('TEXTAREA');
        //objRef.setValue('labelVal');
        fireEvent.change(el,{target:{value:'labelVal'}});
        expect(el.value).toEqual('labelVal');
        expect(screen.getAllByText('textarea_label')[0]).toBeInstanceOf(HTMLLabelElement);
        cleanup();
        r = render(<TextArea id="cidTextArea" didMountFunction={onDidMount}/>);
        expect(r.container.getElementsByTagName('label').length).toEqual(0);

        objRef.setReadonly(true);
        el = document.getElementById('cidTextArea') as HTMLTextAreaElement;
        expect(el).toEqual(null);
        objRef.setReadonly(false);
        objRef.setValue({msg: 'Hello'});
        el = document.getElementById('cidTextArea') as HTMLTextAreaElement;
        expect(JSON.parse(el.value)).toEqual({msg: 'Hello'});


    });
});

