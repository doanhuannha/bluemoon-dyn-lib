import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { DynConfig } from './DynConfig';
import './Utilities.tsx';
import { DataPool } from './DataPool';
import { ConfigLoader } from './ConfigLoader';
import { IFieldItem } from './Defs';


jest.mock('./View', ()=>{
    return {
        View:(p:any)=>{
            return <h1>{p.name}</h1>
        },
    }
});
test('test ConfigLoader', () => {

    DynConfig.exportPages({
        'configLoaderPage': (p:any)=>{return (<h1>configLoaderPage</h1>);}
    });
    window.utilities.loadJs = function(url, callback) {
        DataPool.allFields = {};
        DataPool.allViews = {};
        callback();
        
    }
    
    const callbackAfterLoad = jest.fn();
    render(<div><div role="react-loader" data-view="vwConfigLoaderView"></div><ConfigLoader fieldUrls={['field1.js','field2.js']} viewUrls={['view1.js','view2.js']} callback={callbackAfterLoad}><span>Hello world</span></ConfigLoader></div>);
    let el = screen.getByText('Hello world');
    expect(el).toBeInstanceOf(HTMLSpanElement);
    expect(callbackAfterLoad).toBeCalled();
    el = screen.getByText('vwConfigLoaderView');
    expect(el).toBeInstanceOf(HTMLHeadingElement);
    cleanup();

    render(<div><div role="react-loader" data-test="title-1" data-page="configLoaderPage"></div><ConfigLoader fieldUrls={['field1.js','field2.js']} viewUrls={['view1.js','view2.js']}></ConfigLoader></div>);
    screen.debug();
    el = screen.getByText('configLoaderPage');
    expect(el).toBeInstanceOf(HTMLHeadingElement);
    window.bluemoon = {reactjs: {staticFieldDefs: {}, staticViewDefs: {}}};
    render(<div><div role="react-loader" data-page="notFoundPage"></div><ConfigLoader/></div>);
    el = screen.getByText('Cannot find the page name: notFoundPage');
    expect(el).toBeInstanceOf(HTMLDivElement);



});