import React, { ReactNode, ChangeEvent } from 'react'
import { BaseComponent } from '../BaseComponent';
export default class TextArea extends BaseComponent {
    private onChangedHandler(event: ChangeEvent<HTMLTextAreaElement>) {
        this.setValue(event.target.value);
    }

    protected renderComponent(): ReactNode {
        let val = window.utilities.getDefault(this.getValue(), '');
        if (typeof val !== 'string') {
            val = JSON.stringify(val);
        }
        return <span>
            {this.props.label ? (<label htmlFor={this.props.id}>{this.props.label}</label>) : null}
            {this.state.readonly ? <span>{val}</span>
                : <textarea id={this.props.id} value={val} disabled={!this.state.enable} onChange={(event) => this.onChangedHandler(event)} />
            }
        </span>
    }

}