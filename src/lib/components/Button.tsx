import React, { ReactNode, MouseEvent } from 'react';
import {BaseComponent} from '../BaseComponent';

export default class Button extends BaseComponent{
    private handleClick(event:MouseEvent<HTMLButtonElement>){
        this.setValue(!this.getValue());
        event.preventDefault();
    }
    protected renderComponent(): ReactNode {
        if(this.state.readonly) return null;
        else return <button type="button" id={this.props.id} onClick={(event)=>this.handleClick(event)} disabled={!this.state.enable} {...this.props.options?.htmlProps}>{this.props.label}</button>
    }
    public shouldBindData(): boolean{
        return false;
    }
}
