import React, { ReactNode, ChangeEvent } from 'react'
import { BaseComponent } from '../BaseComponent';
export default class TextBox extends BaseComponent {
    private onChangedHandler(event: ChangeEvent<HTMLInputElement>) {
        this.setValue(event.target.value);
    }

    protected renderComponent(): ReactNode {
        const textType = this.props.options?.textType;
        let val = window.utilities.getDefault(this.getValue(), '');
        if (textType === 'date') {
            if (val instanceof Date) {
                const date = val as Date;
                val = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
            }
            else if ((val as string).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ig)) {//time format
                let v = val as string;
                val = v.substr(0, v.indexOf('T'));
            }
        }
        return <span>
            {this.props.label ? (<label htmlFor={this.props.id}>{this.props.label}</label>) : null}
            {this.state.readonly ? <span>{val}</span>
                : <input type={textType || 'text'} id={this.props.id} value={val} disabled={!this.state.enable} onChange={(event) => this.onChangedHandler(event)} />
            }
        </span>
    }

}