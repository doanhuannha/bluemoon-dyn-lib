import React, { useState } from 'react';
import { DynConfig } from './DynConfig';
import './Utilities.tsx';
import { DataPool } from './DataPool';
import { DataStorage } from './DataStorage';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('test data storage',()=>{
    test('test React.Component', () => {
        const storeName = 'MyComp1Storage';
        let comp1Instance = null;
        class MyComp1 extends React.Component{
            
            render(){
                comp1Instance = this;
                DataStorage.register(storeName, this);
                return <span id="c1" key={'c1'+new Date().getTime()}>{DataStorage.get(storeName)}</span>;
            }
        }
        let MyComp2_forceUpdate = null;
        const MyComp2 = ()=>{
            [,MyComp2_forceUpdate] = useState({});
            DataStorage.register(storeName, MyComp2_forceUpdate);
            return <span id="c2" key={'c2'+new Date().getTime()}>{DataStorage.get(storeName)}</span>;
        }
        let data = DataStorage.get(storeName);
        expect(data).toEqual(null);
        let r = render(<><MyComp1/><MyComp2/></>);
        let spans = r.container.getElementsByTagName('span');
        //let span = r.container.getElementsByTagName('span')[1];
        expect(spans.length).toEqual(2);
        data = 'Hello World';
        act(()=>{
            DataStorage.set(storeName, data);
        });
        
        //span = r.container.getElementsByTagName('span')[1];
        expect(spans[0].innerHTML).toEqual(data);
        expect(spans[1].innerHTML).toEqual(data);
        
        //try to set data store with no storage name
        let ss = DataStorage.set(new Date().getTime()+'', data);
        expect(ss).toEqual(false);

        //try to register with null
        expect(DataStorage.register(storeName)).toEqual(false);

        //try to unregister
        expect(DataStorage.unregister(storeName, MyComp2_forceUpdate)).toEqual(true);
        expect(DataStorage.unregister(storeName, comp1Instance)).toEqual(true);
        expect(DataStorage.unregister(storeName, {})).toEqual(false);
        expect(DataStorage.unregister(storeName, null)).toEqual(false);

        expect(DataStorage.unregister(storeName+storeName, null)).toEqual(false);

        expect(DataStorage.delete(storeName)).toEqual(true);
        expect(DataStorage.delete(storeName+storeName)).toEqual(false);
        
    });
});

