import React, { ReactNode } from 'react';
import { BaseComponent } from '../BaseComponent';
export default class Label extends BaseComponent {
    protected renderComponent(): ReactNode {
        let alwaysShow = true;
        if (this.props.options?.alwaysShow != null) alwaysShow = this.props.options.alwaysShow;
        let val = this.getValue();
        if (alwaysShow || val) {
            return <span id={this.props.id}>
                {this.props.label ? (<label>{this.props.label}</label>) : null}
                <span>{val}</span>
            </span>

        }
        else return null;
    }

}