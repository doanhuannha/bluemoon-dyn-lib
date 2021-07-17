import React from 'react';
import './Utilities';
import { View } from './View';

/*
jest.mock('./View', ()=>{
    return {
        View: function(p:any) {
            return {
                render:()=>{
                    return <h1>{p.name}</h1>; 
                },
                getValues: () => {},
                isValidData: ()=>true
            };
        }
    } 
});
*/
describe('test loadView', () => {
        
    class MockView extends React.Component<Readonly<any>>{
        constructor(props: any) {
            super(props);
            console.log('construct object');//never call???
        }
        render(){
            return <h1>{this.props.name}</h1>
        }
        getValues(){
            return {};
        }
        isValidData(){
            return true;
        }
        init(){}//must have, override private init method
    }

    Object.assign(View.prototype, MockView.prototype);
    test('load into element id', () => {
        let el = document.createElement('div');
        el.id = 'cidViewContainer';
        document.body.appendChild(el);
        window.utilities.loadView('cidViewContainer', { name: 'viewA'});
        expect(el.innerHTML).toEqual('<h1>viewA</h1>');
    });

    test('load into element', () => {
        let el = document.createElement('div');
        window.utilities.loadView(el, { name: 'viewB'})
        expect(el.innerHTML).toEqual('<h1>viewB</h1>');
    });

    test('load into null', () => {
        let p = window.utilities.loadView(null, { name: 'viewB'})
        expect(p).toEqual(false);
    });
});