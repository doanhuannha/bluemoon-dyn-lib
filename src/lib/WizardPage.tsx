import React, { RefObject } from 'react';
import { View } from './View';

export abstract class WizardPage<TProps> extends React.Component<TProps, PageState>{
    protected view: RefObject<View>;
    protected data: any;
    protected views: string[];
    constructor(props: TProps){
        super(props);
        this.view = React.createRef();
        this.state = {
            step: 0
        };
        this.data = {};
        this.views = this.getViews();
    }

    private movingHandler(move: number){
        this.data[this.state.step] = this.view.current.getValues();
        
        if(this.view.current.isValidData()){
            this.setState({step: this.state.step+move});
        }
        
    }
    private submitFinal(){
        if(this.view.current.isValidData()){
            this.onFinalSubmit(this.getFinalValues());
        }
    }
    protected getFinalValues(): any{
        this.data[this.state.step] = this.view.current.getValues();
        
        let final ={};
        for (var prop in this.data) {
            window.utilities.merge(final, this.data[prop]);
        }
        return final;
    }
    protected abstract onFinalSubmit(data: any): void;
    protected abstract getViews(): string[];
    protected renderView(){
        return <View id="v0" ref={this.view} name={this.views[this.state.step]} dataSource={this.data[this.state.step]} key={new Date().getTime()}/>;
    }
    protected renderNextButton(nextButtonText?: string, submitButtonText?: string, nextButtonclassName?:string, submitButtonclassName?:string){
        if(!nextButtonText) nextButtonText = 'Next';
        if(!submitButtonText) submitButtonText = 'Submit';
        return (this.state.step===this.views.length-1
            ? 
            <button onClick={(event)=>this.submitFinal()} className={submitButtonclassName}>{submitButtonText}</button>
            :
            <button onClick={(event)=>this.movingHandler(1)} className={nextButtonclassName}>{nextButtonText}</button>);
    }
    protected renderPreviousButton(prevButtonText?: string, className?:string){
        if(!prevButtonText) prevButtonText = 'Back';
        return(this.state.step!==0? <button onClick={(event)=>this.movingHandler(-1)} className={className}>{prevButtonText}</button>: null);
    }
    render() {
        return <>
            {this.renderView()}
            {this.renderPreviousButton()}
            {this.renderNextButton()}
        </>
    }
}

type PageState = {
    step: number
}