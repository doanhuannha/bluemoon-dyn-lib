import React, { ReactNode, ChangeEvent } from 'react'
import { BaseComponent } from '../BaseComponent';
export default class CheckBoxList extends BaseComponent {
    private onChangedHandler(event: ChangeEvent<HTMLInputElement>): void {
        let vals = (this.getValue() || []) as any[];
        if (event.target.checked) vals.push(event.target.value);
        else {
            vals.forEach((v, i) => {
                if (v == event.target.value) vals.splice(i, 1);
            });
        }
        this.setValue([...vals]);
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
                let itemId = this.props.id + '_item' + i;
                if(data[i][valField] || data[i][txtField]) items.push(<span key={this.props.id + i}><input type="checkbox" id={itemId} value={data[i][valField]} onChange={(event) => this.onChangedHandler(event)} checked={this.getValue()?.indexOf(data[i][valField]) >= 0} />
                    <label htmlFor={itemId}>{data[i][txtField]}</label></span>);
            }
        }
        return <span id={this.props.id} {...this.props.options?.htmlProps}>
            {this.props.label ? (<label>{this.props.label}</label>) : null}
            {items}
        </span>
    }

}