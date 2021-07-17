import React, { RefObject } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '../Utilities.tsx';
import { BaseComponent } from '../BaseComponent';
import { DynConfig } from '../DynConfig';

import DataList, { DataListConfig } from './DataList';

describe('test datalist', () => {
    test('load with primitive data and pagination', () => {
        let dataListComp = React.createRef<DataList>();
        const pagingHanlder = jest.fn((s: DataList, index: number, pageSize: number) => {
            s.setValue({ data: ['item 3', 'item 4'], pageIndex: index, pageSize: pageSize, totalRow: 120 });
        });
        let r = render(<DataList ref={dataListComp} id="cidDataList" options={{ pagingHandler: pagingHanlder }} />);
        expect(r.container.innerHTML).toEqual('');
        dataListComp.current.setValue({ data: ['item 1', 'item 2'], pageIndex: 5, pageSize: 8, totalRow: 641 });
        let el = document.getElementById('cidDataList');
        expect(el).toBeInstanceOf(HTMLDivElement);
        let els = el.getElementsByTagName('div');
        expect(els.length).toEqual(2);
        expect(els[0].innerHTML).toEqual('item 1');
        expect(els[1].innerHTML).toEqual('item 2');
        screen.debug();
        expect(r.container.getElementsByClassName('pager').length).toEqual(1);
        let page1 = r.container.querySelector('a[href="#gotoPage:1"]') as HTMLAnchorElement;
        page1.click();
        expect(pagingHanlder).toBeCalledTimes(1);
        expect(r.container.getElementsByClassName('current')[0].innerHTML).toEqual("1");

        page1 = r.container.querySelector('a[href="#gotoPage:2"]') as HTMLAnchorElement;
        page1.click();
        expect(pagingHanlder).toBeCalledTimes(2);
        expect(r.container.getElementsByClassName('current')[0].innerHTML).toEqual("2");

        page1 = r.container.querySelector('a[href="#gotoPage:7"]') as HTMLAnchorElement;
        page1.click();
        expect(pagingHanlder).toBeCalledTimes(3);
        expect(r.container.getElementsByClassName('current')[0].innerHTML).toEqual("7");

        page1 = r.container.querySelector('a[href="#gotoPage:11"]') as HTMLAnchorElement;
        page1.click();
        expect(pagingHanlder).toBeCalledTimes(4);
        expect(r.container.getElementsByClassName('current')[0].innerHTML).toEqual("11");

        screen.debug();

    });
    test('load with primitive data', () => {
        let dataListComp = React.createRef<DataList>();
        let r = render(<DataList ref={dataListComp} id="cidDataList" />);
        expect(r.container.innerHTML).toEqual('');
        dataListComp.current.setValue(['item 1', 'item 2']);
        let el = document.getElementById('cidDataList');
        expect(el).toBeInstanceOf(HTMLDivElement);
        let els = el.getElementsByTagName('div');
        expect(els.length).toEqual(2);
        expect(els[0].innerHTML).toEqual('item 1');
        expect(els[1].innerHTML).toEqual('item 2');
    });
    test('load with build item as jsx', () => {
        const options = {
            buildItem: (data: any) => { return (<h1>{data.fa}</h1>) }
        } as DataListConfig
        let dataListComp = React.createRef<DataList>();
        let r = render(<DataList ref={dataListComp} id="cidDataList" options={options} />);
        expect(r.container.innerHTML).toEqual('');
        dataListComp.current.setValue([{ fa: 1, fb: 1 }, { fa: 2, fb: 2 }]);
        let el = document.getElementById('cidDataList');
        expect(el).toBeInstanceOf(HTMLDivElement);
        let els = el.getElementsByTagName('h1');
        expect(els.length).toEqual(2);
        expect(els[0].innerHTML).toEqual('1');
        expect(els[1].innerHTML).toEqual('2');

    });
    test('load with build item as string', () => {
        const options = {
            buildItem: (data: any) => { return ('<h2>' + data.fa + '</h2>') }
        } as DataListConfig
        let dataListComp = React.createRef<DataList>();
        let r = render(<DataList ref={dataListComp} id="cidDataList" options={options} />);
        expect(r.container.innerHTML).toEqual('');
        dataListComp.current.setValue([{ fa: 1, fb: 1 }, { fa: 2, fb: 2 }, { fa: 3, fb: 3 }]);
        let el = document.getElementById('cidDataList');
        expect(el).toBeInstanceOf(HTMLDivElement);
        let els = el.getElementsByTagName('h2');
        expect(els.length).toEqual(3);
        expect(els[0].innerHTML).toEqual('1');
        expect(els[1].innerHTML).toEqual('2');
        expect(els[2].innerHTML).toEqual('3');

    });
    test('load with build item as component', () => {
        const DataListComp = (p: any) => {
            return <h3>{p.data.fa}</h3>
        }
        const DataListComp2 = (p: any) => {
            return <h5>{p.data.fa}</h5>
        }
        DynConfig.exportControls({
            'mydatalistcomp': DataListComp,
            'mydatalistcomp2': DataListComp2
        });
        const options = {
            component: 'mydatalistcomp',
            htmlProps: {
                className: 'dataliststyle'
            }
        } as DataListConfig
        let dataListComp = React.createRef<DataList>();
        let r = render(<DataList ref={dataListComp} id="cidDataList" options={options} />);
        expect(r.container.innerHTML).toEqual('');
        dataListComp.current.setValue([{ fa: 100, fb: 1 }]);
        let el = document.getElementById('cidDataList');
        expect(el).toBeInstanceOf(HTMLDivElement);

        expect(el.className).toEqual('dataliststyle');
        let els = el.getElementsByTagName('h3');
        expect(els.length).toEqual(1);
        expect(els[0].innerHTML).toEqual('100');


        cleanup();
        r = render(<DataList ref={dataListComp} id="cidDataList" options={options} parent={{ props: { options: { component: 'mydatalistcomp2' } } }} />);
        expect(r.container.innerHTML).toEqual('');
        dataListComp.current.setValue([{ fa: 100, fb: 1 }]);
        el = document.getElementById('cidDataList');
        expect(el).toBeInstanceOf(HTMLDivElement);
        expect(el.className).toEqual('dataliststyle');
        els = el.getElementsByTagName('h3');
        expect(els.length).toEqual(1);
        expect(els[0].innerHTML).toEqual('100');

    });
});