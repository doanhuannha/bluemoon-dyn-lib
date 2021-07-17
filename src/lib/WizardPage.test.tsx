import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import './Utilities.tsx';

import { WizardPage } from './WizardPage';
import { View } from './View';


/*
jest.mock('./View', ()=>{
    return {
        View: function(p:any) {
            return {
                render:()=>{
                    return <h1>{p.name}</h1>; 
                },
                getValues: () => { 
                    if(p.name==='wzView1') return {a:1, b:{c:2}};
                    else return {d:1, b:{e:3}};
                },
                isValidData: ()=>true
            };
        }
    } 
});
*/
class WizardPageExt extends WizardPage<any>{
    protected onFinalSubmit(data: any): void {
        this.props.doSubmit(data);
    }
    protected getViews(): string[] {
        return ["wzView1", "wzView2"];
    }
}
class WizardPageExt2 extends WizardPage<any>{
    protected onFinalSubmit(data: any): void {
        //this.props.doSubmit();
    }
    protected getViews(): string[] {
        return ["wzView1", "wzView2"];
    }
    render() {
        return <>
            {this.renderView()}
            {this.renderPreviousButton(this.props.prevBtText)}
            {this.renderNextButton(this.props.nextBtText, this.props.submitBtText)}
        </>
    }
}
test('test WizardPage', () => {
    let isValidDataResult = true;
    class MockView extends React.Component<Readonly<any>>{
        constructor(props: any) {
            super(props);
            console.log('construct object');//never call???
        }
        render(){
            return <>
                <h1>{this.props.name}</h1>
                </>
        }
        getValues(){
            if(this.props.name==='wzView1') return {a:1, b:{c:2}};
            else return {d:1, b:{e:3}};
        }
        isValidData(){
            return isValidDataResult;
        }
        init(){}//must have, override private init method
    }
    
    Object.assign(View.prototype, MockView.prototype);
    //Object.assign(View, MockView);
    let submitData ={};
    const doSubmit = jest.fn(function (a:any) {
        submitData = a;
    });

    render(<WizardPageExt doSubmit={doSubmit}/>);
    let el = screen.getByText('wzView1');
    expect(el).toBeInstanceOf(HTMLHeadingElement);
    el = screen.getByText('Next') as HTMLButtonElement;
    el.click();
    el = screen.getByText('wzView2');
    expect(el).toBeInstanceOf(HTMLHeadingElement);
    el = screen.getByText('Submit') as HTMLButtonElement;
    expect(el!=null).toEqual(true);
    el = screen.getByText('Back') as HTMLButtonElement;
    el.click();
    el = screen.getByText('wzView1');
    expect(el).toBeInstanceOf(HTMLHeadingElement);
    
    el = screen.getByText('Next') as HTMLButtonElement;
    isValidDataResult = false;
    el.click();
    el = screen.getByText('wzView1');
    expect(el).toBeInstanceOf(HTMLHeadingElement);

    el = screen.getByText('Next') as HTMLButtonElement;
    isValidDataResult = true;
    el.click();

    el = screen.getByText('Submit') as HTMLButtonElement;
    isValidDataResult = false;
    el.click();
    expect(doSubmit).not.toBeCalled();
    isValidDataResult = true;
    el.click();
    expect(doSubmit).toBeCalled();
    expect(submitData).toEqual({a:1, b:{c:2, e:3}, d:1});
    cleanup();
    render(<WizardPageExt2 prevBtText="Lui lai" nextBtText="Tiep tuc" submitBtText="Hoan thanh" />);
    el = screen.getByText('Tiep tuc');
    expect(el).toBeInstanceOf(HTMLButtonElement);
});