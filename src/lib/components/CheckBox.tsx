import React, { ReactNode, ChangeEvent } from 'react'
import { BaseComponent } from '../BaseComponent';
export default class CheckBox extends BaseComponent {
    private onChangedHandler(event: ChangeEvent<HTMLInputElement>) {
        this.setValue(event.target.checked);
    }
    protected renderComponent(): ReactNode {
        return <span>
            <input type="checkbox" id={this.props.id} checked={this.getValue() || false} disabled={!this.state.enable || this.state.readonly} onChange={(event) => this.onChangedHandler(event)} />
            <label htmlFor={this.props.id}>{this.props.label}</label>
        </span>
    }

}