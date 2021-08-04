import React, { ReactNode, ChangeEvent } from 'react';
import { BaseComponent } from '../BaseComponent';

export default class DropdownList extends BaseComponent {
    private onChangedHandler(event: ChangeEvent<HTMLSelectElement>): void {
        this.setValue(event.target.value);
    }
    protected renderComponent(): ReactNode {
        const items = [];
        const data = this.state.dataSource as any[];
        const txtField = this.props.options?.textField || 'text';
        const valField = this.props.options?.valueField || 'valueId';
        if (data != null) {
            if (this.state.readonly) {
                for (let i = 0; i < data.length; i++) {
                    if (this.getValue() == data[i][valField]) {
                        items.push(<span key={this.props.id + i}>{data[i][txtField]}</span>);
                        break;
                    }
                }
            }
            else for (let i = 0; i < data.length; i++) {
                if (i === 0) this.defaultValue = data[i][valField];
                items.push(<option key={this.props.id + i} value={data[i][valField]}>{data[i][txtField]}</option>);
            }
        }

        return <span id={this.state.readonly? this.props.id: null} {...this.props.options?.htmlProps}>
            {this.props.label ? (<label>{this.props.label}</label>) : null}
            {this.state.readonly ? <>{items[0]}</> :
                <select id={this.props.id} value={this.getValue() || ''} disabled={!this.state.enable || this.state.readonly} onChange={(event) => this.onChangedHandler(event)}>
                    {items}
                </select>
            }

        </span>

    }

}