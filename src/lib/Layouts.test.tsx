import React, { RefObject } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { FlowLayout, GridLayout } from './Layouts';


describe('test layouts', () => {
    const items = [
        <span key="i1">item 1</span>,
        <span key="i2">item 2</span>,
        <span key="i3">item 3</span>,
        <span key="i4">item 4</span>,
        <span key="i5">item 5</span>,
        <span key="i6">item 6</span>,
        <span key="i7">item 7</span>,
        <span key="i8">item 8</span>
    ];
    
   test('render flowlayout',()=>{
       let r = render(<FlowLayout className="c1">
           {items}
       </FlowLayout>);
       let divs = r.container.getElementsByTagName('div');
       
       expect(divs.length).toEqual(8);
       expect(divs[0].className).toEqual('flow c1');
       expect(divs[0].innerHTML).toEqual('<span>item 1</span>');
       expect(divs[6].innerHTML).toEqual('<span>item 7</span>');
   });
   test('render gridlayout',()=>{
    let r = render(<GridLayout columns={3} rowClassName="r1" colClassName="c2">
        {items}
    </GridLayout>);
    let rows = r.container.getElementsByClassName('r1');
    let cols = r.container.getElementsByClassName('c2');
    expect(rows.length).toEqual(3);
    expect(cols.length).toEqual(8);
    expect(cols[0].innerHTML).toEqual('<span>item 1</span>');
    expect(cols[6].innerHTML).toEqual('<span>item 7</span>');

    cleanup();
    r = render(<GridLayout columns={4} rowClassName="r1" colClassName="c2">
        {items}
    </GridLayout>);
    rows = r.container.getElementsByClassName('r1');
    cols = r.container.getElementsByClassName('c2');
    expect(rows.length).toEqual(2);
    expect(cols.length).toEqual(8);

    
});
});
